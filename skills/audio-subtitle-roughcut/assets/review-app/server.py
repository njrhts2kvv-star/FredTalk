import array
import hashlib
import json
import re
import wave
import zipfile
from threading import RLock
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
CONFIG = json.loads((ROOT / 'project.json').read_text())
EPISODE = Path(CONFIG['episode'])
SOURCE = Path(CONFIG['sourceAudio'])
SUBS = Path(CONFIG['sourceSubtitles'])
STATE = ROOT / 'cuts.json'
CORRECTIONS = ROOT / 'subtitle-corrections.json'
SUBTITLE_EDITS = ROOT / 'subtitle-edits.json'
SUBTITLE_BOUNDARIES = ROOT / 'subtitle-boundaries.json'
SUBTITLE_SENTENCES = ROOT / 'subtitle-sentences.json'
SENTENCE_EDITS = ROOT / 'subtitle-sentence-edits.json'
def final_metadata():
    path = ROOT / 'final-delivery.json'
    return json.loads(path.read_text()) if path.exists() else {}
SUBTITLE_LOCK = RLock()


def seconds(value):
    h, m, s = value.replace(',', '.').split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def load_project():
    cues = []
    for block in re.split(r'\n\s*\n', SUBS.read_text(encoding='utf-8-sig').strip()):
        lines = block.splitlines()
        start, end = lines[1].split(' --> ')
        cues.append(dict(id=int(lines[0]), start=seconds(start), end=seconds(end), text=' '.join(lines[2:])))
    with wave.open(str(SOURCE)) as w:
        duration = w.getnframes() / w.getframerate()
        samples = array.array('h', w.readframes(w.getnframes()))
        stride = w.getnchannels() * 960
        peaks = [round(max(abs(v) for v in samples[i:i + stride]) / 32768, 4) for i in range(0, len(samples), stride)]
    return dict(duration=duration, cues=cues, peaks=peaks, source=SOURCE.name,
                sourceHash=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
                title=CONFIG['title'], filenameStem=CONFIG['filenameStem'],
                hasFinal=bool(final_metadata()), script=Path(CONFIG['script']).read_text(),
                timingNote='字幕仅有句级时间；句内标灰按时长估算，并非逐字对齐。')


PROJECT = load_project()


def corrected_project(reflow=False, cuts=None):
    cuts = json.loads(STATE.read_text()) if cuts is None else cuts
    enabled = {c["id"]: c for c in cuts if c["enabled"]}
    corrections = json.loads(CORRECTIONS.read_text()) if CORRECTIONS.exists() else []
    cues = [dict(c, originalText=c['text'], originalStart=c['start'], originalEnd=c['end']) for c in PROJECT['cues']]
    by_id = {c['id']: c for c in cues}
    for change in corrections:
        cue = by_id[change['cue']]
        if cue['text'] != change['from']:
            raise ValueError(f"Correction source mismatch: cue {change['cue']}")
        cue['text'] = change['to']
    boundaries = json.loads(SUBTITLE_BOUNDARIES.read_text()) if SUBTITLE_BOUNDARIES.exists() else []
    for change in boundaries:
        cut_id = change.get('cutId')
        if cut_id and cut_id not in enabled:
            continue
        cue = by_id[change['cue']]
        for field in ('start', 'end'):
            if field in change:
                cue[field] = change[field]
        suffix = change.get('removeSuffix')
        if suffix:
            if not cue['text'].endswith(suffix):
                raise ValueError(f"Boundary suffix mismatch: cue {cue['id']}")
            cue['text'] = cue['text'][:-len(suffix)]
        prefix = change.get('removePrefix')
        if prefix:
            if not cue['text'].startswith(prefix):
                raise ValueError(f"Boundary prefix mismatch: cue {cue['id']}")
            cue['text'] = cue['text'][len(prefix):]
        cue['text'] = change.get('prefix', '') + cue['text']
        infix = change.get('removeInfix')
        if infix:
            if not cut_id or not isinstance(infix, dict):
                raise ValueError('Infix edit requires cutId and explicit text/occurrence')
            cut = enabled[cut_id]
            expected = change.get('cutRange', [])
            if len(expected) != 2 or any(abs(float(cut[k])-float(v)) > 1/48000 for k,v in zip(('start','end'),expected)):
                raise ValueError('Infix cut range changed; review text and word boundaries again')
            if not cue['start'] < cut['start'] < cut['end'] < cue['end']:
                raise ValueError('Infix cut range must be inside its cue')
            word, occurrence = infix.get('text'), infix.get('occurrence', 1)
            if not isinstance(word, str) or not word or type(occurrence) is not int or occurrence < 1:
                raise ValueError('Invalid infix text or occurrence')
            hits = list(re.finditer(re.escape(word), cue['text']))
            if len(hits) < occurrence:
                raise ValueError('Infix text does not match cue')
            match = hits[occurrence-1]
            cue['text'] = cue['text'][:match.start()] + cue['text'][match.end():]
            cue.setdefault('infixCutIds', []).append(cut_id)
        cue['boundaryNote'] = change['note']
    with SUBTITLE_LOCK:
        edits = json.loads(SUBTITLE_EDITS.read_text()) if SUBTITLE_EDITS.exists() else {}
    for cue in cues:
        cue['correctedText'] = cue['text']
        cue['text'] = edits.get(str(cue['id']), cue['text'])
    if reflow:
        cues = sentence_cues(cues, cuts)
    return dict(PROJECT, cues=cues, subtitleCorrections=corrections, subtitleEdits=edits, subtitleBoundaries=boundaries,
                sentenceEdits=json.loads(SENTENCE_EDITS.read_text()) if SENTENCE_EDITS.exists() else {})


def sentence_cues(cues, cuts=None):
    groups = json.loads(SUBTITLE_SENTENCES.read_text()) if SUBTITLE_SENTENCES.exists() else []
    cuts = (json.loads(STATE.read_text()) if STATE.exists() else []) if cuts is None else cuts
    by_id = {c['id']: c for c in cues}
    plans = {}
    used = set()
    order = [c['id'] for c in cues]
    for group in groups:
        if not group or any(i not in by_id or i in used for i in group):
            raise ValueError('Invalid or overlapping sentence group')
        index = order.index(group[0])
        if order[index:index + len(group)] != group:
            raise ValueError('Sentence group must follow adjacent source cues')
        used.update(group)
        members = [by_id[i] for i in group]
        start, end = members[0]['start'], members[-1]['end']
        # Never merge across a potential edit point, including disabled candidates.
        if any(start + .001 < point < end - .001 for cut in cuts for point in (cut['start'], cut['end'])):
            continue
        plans[group[0]] = group
    edits = json.loads(SENTENCE_EDITS.read_text()) if SENTENCE_EDITS.exists() else {}
    joins_path = ROOT / 'subtitle-joins.json'
    joins = json.loads(joins_path.read_text()) if joins_path.exists() else {}
    result, consumed = [], set()
    for cue in cues:
        if cue['id'] in consumed:
            continue
        ids = plans.get(cue['id'], [cue['id']])
        members = [by_id[i] for i in ids]
        combined = dict(cue, end=members[-1]['end'], originalEnd=members[-1]['originalEnd'], sourceCueIds=ids)
        for field in ('text', 'correctedText', 'originalText'):
            combined[field] = join_subtitle_words([c[field] for c in members], ids, joins if field != 'originalText' else {})
        combined['text'] = edits.get(','.join(map(str, ids)), combined['text'])
        result.append(combined)
        consumed.update(ids)
    return result


def join_subtitle_words(parts, ids=None, joins=None):
    value = ''
    for index, part in enumerate(parts):
        separator = ' ' if value and re.search(r'[A-Za-z]$', value) and re.match(r'[A-Za-z]', part) else ''
        if index and ids and joins:
            separator = joins.get(str(ids[index]), separator)
        value += separator + part
    return value


def save_subtitle(data):
    cue_id = data.get('cue')
    if type(cue_id) is not int or cue_id not in {c['id'] for c in PROJECT['cues']}:
        raise ValueError('Invalid cue ID')
    reset = data.get('reset') is True
    text = data.get('text')
    if not reset and (not isinstance(text, str) or not text.strip() or len(text) > 2000):
        raise ValueError('Subtitle must contain 1-2000 characters')
    if not reset:
        text = ' '.join(text.splitlines()).strip()
    with SUBTITLE_LOCK:
        cue = next((c for c in corrected_project(reflow=True)['cues'] if c['id'] == cue_id), None)
        if cue is None:
            raise ValueError('Sentence grouping changed; refresh before editing')
        ids = cue['sourceCueIds']
        if data.get('sourceCueIds', ids) != ids:
            raise ValueError('Sentence grouping changed; refresh before editing')
        target = SENTENCE_EDITS if len(ids) > 1 else SUBTITLE_EDITS
        key = ','.join(map(str, ids)) if len(ids) > 1 else str(cue_id)
        edits = json.loads(target.read_text()) if target.exists() else {}
        if reset:
            edits.pop(key, None)
        else:
            edits[key] = text
        temp = target.with_suffix('.tmp')
        temp.write_text(json.dumps(edits, ensure_ascii=False, indent=2), encoding='utf-8')
        temp.replace(target)
        write_corrected_subtitles()
        cue = next(c for c in corrected_project(reflow=True)['cues'] if c['id'] == cue_id)
    return dict(saved=True, cue=cue)


def write_corrected_subtitles():
    project = corrected_project(reflow=True)
    target = ROOT / 'subtitles-corrected.srt'
    target.write_text('\n'.join(f"{i}\n{timestamp(c['start'])} --> {timestamp(c['end'])}\n{c['text']}\n"
                                for i, c in enumerate(project['cues'], 1)), encoding='utf-8')
    return target

DEFAULTS = []
if not STATE.exists():
    STATE.write_text(json.dumps([dict(id=f'cut-{i+1}', start=a, end=b, title=t, reason=r,
                                     enabled=e, confidence='明确重说' if e else '待试听', reviewed=False)
                                 for i, (a, b, t, r, e) in enumerate(DEFAULTS)], ensure_ascii=False, indent=2))


def validate(cuts):
    if not isinstance(cuts, list) or len(cuts) > 500:
        raise ValueError('Invalid cuts')
    for c in cuts:
        if not 0 <= float(c['start']) < float(c['end']) <= PROJECT['duration']:
            raise ValueError('Cut outside source or reversed')
    return cuts


def merged(cuts):
    intervals = sorted((round(c['start'] * 48000) / 48000, round(c['end'] * 48000) / 48000) for c in cuts if c['enabled'])
    result = []
    for a, b in intervals:
        if result and a <= result[-1][1]:
            result[-1][1] = max(b, result[-1][1])
        else:
            result.append([a, b])
    return result


def retained(cuts):
    result, cursor = [], 0
    for a, b in merged(cuts):
        if a > cursor:
            result.append((cursor, a))
        cursor = b
    if cursor < PROJECT['duration']:
        result.append((cursor, PROJECT['duration']))
    return result


def timestamp(t):
    ms = round(t * 1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'


def export(cuts):
    validate(cuts)
    project = corrected_project(reflow=True, cuts=cuts)
    folder = ROOT / 'exports' / datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    folder.mkdir(parents=True)
    spans = retained(cuts)
    if not spans:
        raise ValueError('No retained audio')
    with wave.open(str(SOURCE)) as src, wave.open(str(folder / 'review-cut.wav'), 'wb') as dest:
        dest.setparams(src.getparams())
        for a, b in spans:
            src.setpos(round(a * src.getframerate()))
            dest.writeframes(src.readframes(round(b * src.getframerate()) - round(a * src.getframerate())))
    # A partial cue cannot safely infer words from sentence-level timestamps.
    # Keep its original text, and include it in the manual subtitle review report.
    lines, warnings, offset = [], [], 0
    fragments = []
    approved = set()
    for cue in project['cues']:
        partial = {c['id'] for c in cuts if c['enabled'] and c['start'] < cue['end'] and c['end'] > cue['start']}
        if partial and partial <= set(cue.get('infixCutIds', [])):
            approved.add(cue['id'])
    for a, b in spans:
        for cue in project['cues']:
            left, right = max(a, cue['start']), min(b, cue['end'])
            if right - left < .015:
                continue
            fragments.append(dict(id=cue['id'], start=offset+left-a, end=offset+right-a, text=cue['text']))
            if cue['id'] not in approved and (left > cue['start'] + .01 or right < cue['end'] - .01):
                warnings.append(dict(cue=cue['id'], originalText=cue['text'], sourceStart=left, sourceEnd=right,
                                     note='句内剪切：文字未猜删，请按实际音频修改此句字幕。'))
        offset += b-a
    combined = []
    for fragment in fragments:
        if combined and fragment['id'] in approved and combined[-1]['id'] == fragment['id']:
            combined[-1]['end'] = fragment['end']
        else:
            combined.append(fragment)
    for cue in combined:
        lines.append(f"{len(lines)+1}\n{timestamp(cue['start'])} --> {timestamp(cue['end'])}\n{cue['text']}\n")
    (folder / 'review-cut.srt').write_text('\n'.join(lines), encoding='utf-8')
    (folder / 'edit-decision.json').write_text(json.dumps(dict(source=str(SOURCE), sourceHash=PROJECT['sourceHash'],
        cuts=cuts, retainedSpans=spans, subtitleReview=warnings, duration=offset,
        subtitleCorrections=project['subtitleCorrections'], subtitleEdits=project['subtitleEdits'],
        subtitleBoundaries=project['subtitleBoundaries'], sentenceEdits=project['sentenceEdits']), ensure_ascii=False, indent=2))
    archive = folder / 'review-package.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_STORED) as z:
        for file in folder.iterdir():
            if file != archive:
                z.write(file, file.name)
    return dict(url='/' + str(archive.relative_to(ROOT)), path=str(folder), duration=offset, subtitleWarnings=len(warnings))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def reply(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        final = final_metadata()
        FINAL_AUDIO = Path(final.get('audioPath', ROOT / 'missing-final.wav'))
        FINAL_SUBS = Path(final.get('subtitlePath', ROOT / 'missing-final.srt'))
        if path == '/api/final':
            if not FINAL_AUDIO.exists() or not FINAL_SUBS.exists():
                return self.reply({'error': 'Final export not available'}, 404)
            cues = []
            for block in re.split(r'\n\s*\n', FINAL_SUBS.read_text().strip()):
                lines = block.splitlines()
                a, b = lines[1].split(' --> ')
                cues.append(dict(id=int(lines[0]), start=seconds(a), end=seconds(b), text=' '.join(lines[2:])))
            with wave.open(str(FINAL_AUDIO)) as w:
                duration = w.getnframes() / w.getframerate()
            return self.reply(dict(final, duration=duration, cues=cues,
                                   audio='/final/audio.wav?v=' + final['audioHash'], subtitles='/final/subtitles.srt'))
        if path == '/final/subtitles.srt':
            if not FINAL_SUBS.exists():
                return self.reply({'error': 'Final subtitles not available'}, 404)
            body = FINAL_SUBS.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'application/x-subrip; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == '/api/project':
            return self.reply(dict(**corrected_project(reflow=True), cuts=json.loads(STATE.read_text())))
        if path in ('/source.wav', '/final/audio.wav'):
            audio_path = SOURCE if path == '/source.wav' else FINAL_AUDIO
            if not audio_path.exists():
                return self.reply({'error': 'Audio not available'}, 404)
            size = audio_path.stat().st_size
            start, end = 0, size - 1
            header = self.headers.get('Range', '')
            match = re.fullmatch(r'bytes=(\d+)-(\d*)', header)
            if match:
                start = int(match[1])
                end = min(size-1, int(match[2]) if match[2] else size-1)
                if start > end:
                    self.send_error(416)
                    return
            self.send_response(206 if match else 200)
            self.send_header('Content-Type', 'audio/wav')
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Content-Length', str(end-start+1))
            if match:
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.end_headers()
            with audio_path.open('rb') as f:
                f.seek(start)
                remaining = end-start+1
                while remaining:
                    chunk = f.read(min(remaining, 65536))
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
            return
        super().do_GET()

    def do_POST(self):
        try:
            if self.headers.get('Origin') not in (None, 'http://' + self.headers['Host']):
                return self.reply({'error': 'Origin rejected'}, 403)
            data = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))))
            if self.path == '/api/subtitles':
                return self.reply(save_subtitle(data))
            cuts = validate(data['cuts'])
            corrected_project(cuts=cuts)
            if self.path == '/api/save':
                temp = STATE.with_suffix('.tmp')
                temp.write_text(json.dumps(cuts, ensure_ascii=False, indent=2))
                temp.replace(STATE)
                return self.reply({'saved': True})
            if self.path == '/api/export':
                return self.reply(export(cuts))
            self.send_error(404)
        except (ValueError, KeyError, TypeError) as e:
            self.reply({'error': str(e)}, 400)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8107)
    args = parser.parse_args()
    print(f'Audio review: http://127.0.0.1:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
