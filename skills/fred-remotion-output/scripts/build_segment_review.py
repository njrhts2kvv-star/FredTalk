#!/usr/bin/env python3
"""Build direction, real-keyframe and video review views from one episode manifest."""
import argparse
import hashlib
import html
import json
import math
import re
from pathlib import Path
from urllib.parse import urlparse
from workflow import scene_review_signature, scene_window

VIEWS = ('suggestion', 'keyframes', 'video')
ROUTES = {'recording': '录屏', 'remotion': 'Remotion 动画', 'generated-video': '生成动画', 'mixed': '混合制作'}
TIMING_LABELS = {'aligned': '录音对齐时间', 'audio-aligned': '录音对齐时间',
                 'approved-manual': '人工确认时间'}


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def build(manifest_path, output, view='suggestion'):
    if view not in VIEWS:
        raise ValueError('Unknown review view')
    manifest_path, output = Path(manifest_path).resolve(), Path(output).resolve()
    data = json.loads(manifest_path.read_text())
    episode, fps = data['episodeKey'], data['timelineFps']
    if not isinstance(episode, str) or not episode.strip():
        raise ValueError('episodeKey must be a stable nonempty string')
    if not isinstance(fps, (int, float)) or isinstance(fps, bool) or fps <= 0:
        raise ValueError('timelineFps must be positive')
    esc = lambda value: html.escape(str(value), quote=True)
    digests = {}

    def asset(value, expected=None, required_hash=False):
        if not isinstance(value, str) or not value or urlparse(value).scheme:
            raise ValueError('Use local file paths relative to the manifest, not URLs')
        path = (manifest_path.parent / value).resolve()
        if not path.is_file():
            raise ValueError(f'Missing local asset: {path}')
        if path not in digests:
            digest = hashlib.sha256()
            with path.open('rb') as stream:
                for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(chunk)
            digests[path] = digest.hexdigest()
        actual = digests[path]
        expected = expected.removeprefix('sha256:') if isinstance(expected, str) else expected
        if required_hash and not expected:
            raise ValueError(f'Missing sha256 for reviewed image: {value}')
        if expected and expected != actual:
            raise ValueError(f'Asset sha256 mismatch: {value}')
        return {'path': str(path), 'sha256': actual, 'url': path.as_uri() + '?v=' + actual[:12]}

    def image_figure(item, label):
        return f'<figure><figcaption>{esc(label)}</figcaption><button class="asset-image" type="button" aria-label="放大图片：{esc(label)}"><img loading="lazy" src="{esc(item["url"])}" alt="{esc(label)}"></button></figure>'

    def video_figure(item, label, poster=None):
        poster_attr = f' poster="{esc(poster["url"])}"' if poster else ''
        return f'<figure><figcaption>{esc(label)}</figcaption><video controls playsinline preload="none"{poster_attr} src="{esc(item["url"])}"></video><a class="file" href="{esc(item["url"])}">打开视频 ↗</a></figure>'

    def timestamp(frame):
        seconds = frame / fps
        return f'{int(seconds // 60):02d}:{seconds % 60:06.3f}'

    rows, metadata, seen = [], [], set()

    def add_row(page, number, stage, media, artifact, advice='', extra='', item_id=None):
        sid = page['stableId']
        narration = ''.join(span['text'] for span in page['sourceSpans'])
        start, duration = page['startFrame'], page['durationInFrames']
        window = scene_window(data, page)
        time_label = (f'{timestamp(window[0] * fps)}—{timestamp(window[1] * fps)}' if window else
                      f'全片时间待映射（段内 {duration / fps:.3f} 秒）')
        context = {'narration': narration, 'startFrame': window[0] * fps if window else None,
                   'localStartFrame': start, 'startSeconds': window[0] if window else None,
                   'endSeconds': window[1] if window else None,
                   'timeMapping': 'global' if window else 'unmapped', 'durationInFrames': duration,
                   'timelineFps': fps, 'timingStatus': data.get('timingStatus'),
                   'contextSha256': scene_review_signature(data, page)}
        item_id = item_id or stage
        identity = fingerprint({'context': context, 'artifact': artifact})
        row_id = 'review-' + fingerprint([sid, stage, item_id])[:20]
        metadata.append({'rowId': row_id, 'episodeKey': episode, 'stableId': sid, 'view': stage,
                         'itemId': item_id, 'identity': identity, 'artifact': artifact, 'context': context,
                         'assistantSuggestion': page.get('productionRoute', {}).get('suggested'),
                         'assistantRecommendation': page.get('storyboardReview', {}).get('assistantRecommendation'),
                         'existingUserSelection': page.get('storyboardReview', {}).get('userSelection'),
                         'existingProductionRoute': page.get('productionRoute', {}).get('selected')})
        disabled = ' disabled' if stage != 'suggestion' and not artifact.get('available') else ''
        rows.append(f'''<tr id="{row_id}" data-stable-id="{esc(sid)}" data-view="{stage}" data-item="{esc(item_id)}" data-version="{identity}" data-status="{esc(page.get('review', {}).get('status', 'review'))}">
<td><div class="time">第{number:02d}段 · {time_label}</div><p class="narration">{esc(narration)}</p></td>
<td>{media}</td><td><span class="badge">待看</span><p class="advice">{esc(advice)}</p>{extra}
<label class="choice-label">本次意见<select class="decision" aria-label="第{number}段{esc(item_id)}判断"{disabled}><option value="">待看</option><option value="keep">保留主体</option><option value="change">需要修改</option><option value="skip">先跳过</option></select></label>
<textarea aria-label="第{number}段{esc(item_id)}修改意见"></textarea><div class="history"></div></td></tr>''')

    for number, page in enumerate(data['pages'], 1):
        sid = page['stableId']
        if not isinstance(sid, str) or not sid.strip() or sid in seen:
            raise ValueError('Each page needs a unique stableId')
        seen.add(sid)
        start, duration = page['startFrame'], page['durationInFrames']
        if start < 0 or duration <= 0:
            raise ValueError(f'Invalid timing: {sid}')
        if not ''.join(span['text'] for span in page['sourceSpans']).strip():
            raise ValueError(f'Missing full sourceSpans text: {sid}')
        route, board = page.get('productionRoute', {}), page.get('storyboardReview', {})
        recommendation = board.get('assistantRecommendation', {})
        suggested = route.get('suggested', '')
        if isinstance(suggested, dict):
            suggested_label = suggested.get('route', suggested.get('type', ''))
            reason = suggested.get('reason', '')
        else:
            suggested_label = suggested
            reason = route.get('suggestionReason', route.get('reason', ''))
        rec = recommendation if isinstance(recommendation, dict) else {'candidateId': recommendation}
        candidate_ids, candidates, figures = set(), [], []
        for candidate in board.get('candidates', []):
            cid = candidate['id']
            if not isinstance(cid, str) or not cid.strip() or cid in candidate_ids:
                raise ValueError(f'Candidates need unique ids: {sid}')
            candidate_ids.add(cid)
            image = asset(candidate['imagePath'], candidate.get('sha256'), required_hash=True)
            clip = asset(candidate['clipPath'], candidate.get('clipSha256')) if candidate.get('clipPath') else None
            candidates.append({'id': cid, 'image': image, 'clip': clip})
            label = candidate.get('label', cid)
            marker = ' · 助手建议' if cid == rec.get('candidateId') else ''
            figures.append('<div class="candidate">' + image_figure(image, label + marker) +
                           (video_figure(clip, '动态参考') if clip else '') +
                           f'<label><input type="radio" name="candidate-{number}" value="{esc(cid)}"> 我选择这个方向</label></div>')
        suggestion = f'<p class="suggestion"><strong>建议：{esc(ROUTES.get(suggested_label, suggested_label or "待补充"))}</strong></p><p>{esc(reason)}</p>'
        if rec.get('reason'):
            suggestion += f'<p>建议这组画面，因为：{esc(rec["reason"])}</p>'
        if rec.get('fixes'):
            suggestion += '<p>实现时调整：' + esc('；'.join(rec['fixes'])) + '</p>'
        suggestion += ''.join(figures) or '<div class="empty">方向参考图待补充</div>'
        options = ''.join(f'<option value="{value}">{label}</option>' for value, label in ROUTES.items())
        extra = f'<label class="choice-label">我的制作选择<select class="route-choice" aria-label="第{number}段制作方式"><option value="">尚未选择</option>{options}</select></label>'
        if candidates:
            suggestion += f'<label><input type="radio" name="candidate-{number}" value="__none__"> 这些方向都不选</label>'
        extra += '<p class="scope-note">助手建议与您的选择分开保存。需要改动时直接写在下面。</p>'
        if route.get('selected') or board.get('userSelection'):
            extra += '<p class="scope-note">已有选择记录保留在导出文件中；本次未选择不会覆盖它。</p>'
        add_row(page, number, 'suggestion', suggestion,
                {'available': True, 'kind': 'direction', 'candidates': candidates,
                 'suggested': suggested, 'suggestionReason': reason, 'recommendation': recommendation}, extra=extra)

        frames = page.get('keyframeReview', {}).get('frames', [])
        frame_ids = set()
        for frame in frames:
            fid, seconds = frame['id'], frame['timeSeconds']
            if not isinstance(fid, str) or not fid.strip() or fid in frame_ids:
                raise ValueError(f'Keyframes need unique ids: {sid}')
            frame_ids.add(fid)
            if not isinstance(seconds, (int, float)) or isinstance(seconds, bool) or not math.isfinite(seconds) or seconds < 0:
                raise ValueError(f'Invalid keyframe timeSeconds: {sid}/{fid}')
            window = scene_window(data, page)
            if window and not window[0] <= seconds < window[1]:
                raise ValueError(f'Keyframe timeSeconds outside the scene global window: {sid}/{fid}')
            image = asset(frame['path'], frame.get('sha256'), required_hash=True)
            source_files = [asset(entry['path'], entry['sha256']) for entry in page.get('keyframeReview', {}).get('sourceFiles', [])]
            frame_time = f'{seconds:.3f} 秒' if window else '全片时间待映射'
            add_row(page, number, 'keyframes', image_figure(image, f'{frame_time} · {frame.get("label", fid)}'),
                    {'available': True, 'kind': 'remotion-keyframe', 'id': fid, 'image': image,
                     'timeSeconds': seconds if window else None, 'declaredTimeSeconds': seconds,
                     'label': frame.get('label', fid), 'sourceFiles': source_files,
                     'contextSha256': page.get('keyframeReview', {}).get('contextSha256'),
                     'subtitleRevision': page.get('keyframeReview', {}).get('subtitleRevision')},
                    advice='这里确认的是当前静态画面；动画节奏和衔接随后看视频。', item_id=fid)
        if not frames:
            add_row(page, number, 'keyframes', '<div class="empty">真实关键帧待生成</div>',
                    {'available': False, 'kind': 'remotion-keyframe'}, advice='方向确定后，用实际动画代码生成画面，连同字幕和角标一起检查。')

        review, videos, figures = page.get('review', {}), [], []
        for version in review.get('versions', []):
            video = asset(version['path'], version.get('sha256'))
            poster = asset(version['poster']) if version.get('poster') else None
            videos.append({'label': version['label'], 'video': video, 'poster': poster})
            figures.append(video_figure(video, version['label'], poster))
        media = figures[0] if figures else '<div class="empty">视频待生成</div>'
        if len(figures) > 1:
            media += '<details><summary>历史视频对照</summary>' + ''.join(figures[1:]) + '</details>'
        add_row(page, number, 'video', media,
                {'available': bool(videos), 'kind': 'video', 'current': videos[0] if videos else None},
                advice=review.get('note', '正常速度观看，检查节奏、声音和前后衔接。'))
    if not rows:
        raise ValueError('Manifest has no pages')
    template = Path(__file__).resolve().parents[1] / 'templates/segment-review.html'
    script_json = lambda value: json.dumps(value, ensure_ascii=False).replace('<', '\\u003c')
    replacements = {'__TITLE__': esc(data.get('title', episode) + ' · 逐段审看'), '__ROWS__': ''.join(rows),
                    '__TIMING__': TIMING_LABELS.get(data.get('timingStatus'), '时间待核对 / 估时'),
                    '__STORAGE_KEY__': script_json('fred-segment-review:' + episode),
                    '__EPISODE__': script_json(episode), '__REVIEW_DATA__': script_json(metadata),
                    '__INITIAL_VIEW__': script_json(view)}
    result = re.sub('|'.join(map(re.escape, replacements)), lambda match: replacements[match[0]], template.read_text())
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(result)
    return {'output': str(output), 'segments': len(seen), 'reviewItems': len(rows), 'episodeKey': episode, 'view': view}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--view', choices=VIEWS, default='suggestion')
    args = parser.parse_args()
    print(json.dumps(build(args.manifest, args.output, args.view), ensure_ascii=False))
