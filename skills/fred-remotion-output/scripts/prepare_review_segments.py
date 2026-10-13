#!/usr/bin/env python3
"""Create cached, frame-exact small review clips from a finished CFR video."""
import argparse
import json
import os
import subprocess
from fractions import Fraction
from pathlib import Path
from build_segment_review import fingerprint
from init_review_app import sha
from workflow import scene_window


def probe(file):
    return json.loads(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-show_streams',
        '-of', 'json', str(file)], capture_output=True, text=True, check=True).stdout)['streams']


def prepare(manifest, video, output, label='当前视频', height=720, source_windows=None):
    manifest, video, output = Path(manifest).resolve(), Path(video).resolve(), Path(output).resolve()
    data = json.loads(manifest.read_text())
    fps = data['timelineFps']
    streams = probe(video)
    v = next(s for s in streams if s['codec_type'] == 'video')
    if Fraction(v['avg_frame_rate']) != Fraction(str(fps)) or Fraction(v['r_frame_rate']) != Fraction(str(fps)):
        raise ValueError('Source must be CFR at the manifest fps; normalize deliberately first')
    has_audio = any(s['codec_type'] == 'audio' for s in streams)
    source_hash = sha(video)
    output.mkdir(parents=True, exist_ok=True)
    old = json.loads((output / 'index.json').read_text()) if (output / 'index.json').exists() else {}
    segments, reused = [], 0
    for page in data['pages']:
        window = scene_window(data, page)
        if not window:
            raise ValueError('Global window unmapped: ' + page['stableId'])
        a, b = [round(t * fps) for t in window]
        if any(abs(frame / fps - t) > 1e-7 for frame, t in zip((a, b), window)):
            raise ValueError('Noninteger timeline frame window: ' + page['stableId'])
        source = source_windows.get(page['stableId']) if source_windows is not None else None
        if source_windows is not None and source is None:
            raise ValueError('Missing previous-source window: ' + page['stableId'])
        source_a, source_b = (source['startFrame'], source['endFrame']) if source else (a, b)
        if any(type(x) is not int for x in (source_a, source_b)) or not 0 <= source_a < source_b <= int(v['nb_read_frames']):
            raise ValueError('Invalid integer source frame window: ' + page['stableId'])
        key = fingerprint([source_hash, source_a, source_b, fps, height, 'h264-crf18-aac192-v1'])
        file = output / (key[:24] + '.mp4')
        prior = next((s for s in old.get('segments', []) if s.get('cacheKey') == key), None)
        if prior and file.is_file() and sha(file) == prior['sha256']:
            reused += 1
        else:
            temp = file.with_suffix('.part.mp4')
            cmd = ['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', f'{source_a / fps:.12f}', '-i', str(video),
                   '-t', f'{(source_b - source_a) / fps:.12f}', '-map', '0:v:0', '-map', '0:a:0?',
                   '-vf', f'scale=-2:min({height}\\,ih)', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
                   '-r', str(fps), '-frames:v', str(source_b - source_a), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(temp)]
            subprocess.run(cmd, check=True)
            result = probe(temp)
            clip = next(s for s in result if s['codec_type'] == 'video')
            if int(clip['nb_read_frames']) != source_b - source_a or Fraction(clip['avg_frame_rate']) != Fraction(str(fps)):
                raise ValueError('Clip frame count/fps mismatch: ' + page['stableId'])
            if has_audio and not any(s['codec_type'] == 'audio' for s in result):
                raise ValueError('Missing segment audio')
            subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(temp), '-f', 'null', '-'], check=True)
            temp.replace(file)
        segments.append(dict(stableId=page['stableId'], startFrame=a, endFrame=b, path=file.name,
                             sourceStartFrame=source_a, sourceEndFrame=source_b, sha256=sha(file), cacheKey=key))
    info = dict(schemaVersion=1, manifestSha256=sha(manifest), sourcePath=os.path.relpath(video, output),
                sourceSha256=source_hash, fps=fps, label=label, height=height, segments=segments,
                reviewOnly=True, originalVideoModified=False)
    temp = output / 'index.json.tmp'
    temp.write_text(json.dumps(info, ensure_ascii=False, indent=2)); temp.replace(output / 'index.json')
    return dict(index=str(output / 'index.json'), segments=len(segments), reused=reused)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    for key in ('manifest', 'video', 'output'):
        p.add_argument('--' + key, required=True)
    p.add_argument('--label', default='当前视频')
    p.add_argument('--height', type=int, default=720)
    p.add_argument('--source-windows', help='JSON map stableId -> {startFrame,endFrame}, for differently timed previous videos')
    a = p.parse_args()
    if a.height < 144 or a.height > 2160:
        p.error('height must be 144..2160')
    windows = json.loads(Path(a.source_windows).read_text()) if a.source_windows else None
    print(json.dumps(prepare(a.manifest, a.video, a.output, a.label, a.height, windows), ensure_ascii=False))
