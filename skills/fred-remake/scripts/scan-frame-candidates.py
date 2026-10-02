#!/usr/bin/env python3
"""Scan every decoded frame for review candidates, never declare visual acceptance.

Requires numpy. Optional contact sheets also require Pillow. Spatial reduction is
allowed; decoded frame indices and source PTS are preserved, including VFR input.
"""
import argparse
import hashlib
import json
import math
import subprocess
import tempfile
from fractions import Fraction
from pathlib import Path

import numpy as np


def rate(value):
    try:
        parsed = float(Fraction(value))
        return parsed if math.isfinite(parsed) and parsed > 0 else None
    except (ValueError, TypeError, ZeroDivisionError):
        return None


def frame_stats(pixels, previous, thresholds):
    """Classify broad whole-frame signals, not missing local content or aesthetics."""
    a = np.asarray(pixels, dtype=np.float32)
    row = {"mean": float(a.mean()), "std": float(a.std()),
           "darkFraction": float((a < thresholds['whiteLevel']).mean()),
           "difference": None if previous is None else float(np.abs(a - previous).mean()),
           "meanJump": None if previous is None else abs(float(a.mean()) - float(previous.mean()))}
    reasons = []
    if row['std'] < thresholds['uniformStd']:
        reasons.append('near-uniform-frame')
    if row['darkFraction'] < thresholds['minDarkFraction']:
        reasons.append('near-white-frame')
    if row['difference'] is not None and row['difference'] > thresholds['frameDifference']:
        reasons.append('adjacent-frame-change')
    if row['meanJump'] is not None and row['meanJump'] > thresholds['meanJump']:
        reasons.append('mean-brightness-jump')
    row['reasons'] = reasons
    return row


def candidate_groups(rows, gap, context):
    groups = []
    for row in rows:
        if not row['reasons']:
            continue
        frame = row['frame']
        if not groups or frame - groups[-1]['lastFrame'] > gap + 1:
            groups.append({'firstFrame': frame, 'lastFrame': frame, 'candidateFrames': [], 'reasons': []})
        group = groups[-1]
        group['lastFrame'] = frame
        group['candidateFrames'].append(frame)
        group['reasons'] = sorted(set(group['reasons'] + row['reasons']))
    for group in groups:
        first, last = group['firstFrame'], group['lastFrame']
        group['startPts'] = rows[first]['pts']
        group['endPts'] = rows[last]['pts']
        group['reviewFrames'] = [max(0, first - context), (first + last) // 2,
                                 min(len(rows) - 1, last + context)]
    return groups


def timestamp_summary(rows, reported_count):
    missing = [r['frame'] for r in rows if r['pts'] is None]
    non_increasing = [i for i in range(1, len(rows)) if rows[i]['pts'] is not None
                      and rows[i-1]['pts'] is not None and rows[i]['pts'] <= rows[i-1]['pts']]
    deltas = [rows[i]['pts'] - rows[i-1]['pts'] for i in range(1, len(rows))
              if rows[i]['pts'] is not None and rows[i-1]['pts'] is not None]
    return {'allFramesHavePts': not missing, 'missingPtsFrames': missing,
            'nonIncreasingPtsFrames': non_increasing, 'firstPts': rows[0]['pts'] if rows else None,
            'lastPts': rows[-1]['pts'] if rows else None,
            'minDelta': min(deltas) if deltas else None, 'maxDelta': max(deltas) if deltas else None,
            'medianDelta': float(np.median(deltas)) if deltas else None,
            'reportedFrameCount': reported_count,
            'reportedCountMatches': None if reported_count is None else reported_count == len(rows)}


def read_exact(pipe, count):
    chunks = bytearray()
    while len(chunks) < count:
        data = pipe.read(count - len(chunks))
        if not data:
            break
        chunks.extend(data)
    if chunks and len(chunks) != count:
        raise ValueError(f'Truncated raw frame: {len(chunks)} of {count} bytes')
    return bytes(chunks)


def scan(source, ffmpeg, ffprobe, scan_width, thresholds, gap, context):
    metadata = json.loads(subprocess.check_output([ffprobe, '-v', 'error', '-show_streams',
                         '-show_format', '-of', 'json', str(source)]))
    stream = next((s for s in metadata['streams'] if s.get('codec_type') == 'video'), None)
    if stream is None:
        raise ValueError('Input has no video stream')
    frame_info = json.loads(subprocess.check_output([ffprobe, '-v', 'error', '-select_streams', 'v:0',
                            '-show_entries', 'frame=best_effort_timestamp_time,pts_time', '-of', 'json', str(source)]))['frames']
    width = min(scan_width, int(stream['width']))
    height = max(1, round(width * int(stream['height']) / int(stream['width'])))
    rows, previous = [], None
    # Rotation is disabled for statistics so decoded pixel geometry is explicit.
    # No fps filter: passthrough emits each decoded frame exactly once.
    command = [ffmpeg, '-v', 'error', '-noautorotate', '-i', str(source), '-map', '0:v:0', '-an',
               '-vf', f'scale={width}:{height}:flags=area,format=gray', '-fps_mode', 'passthrough',
               '-f', 'rawvideo', '-']
    with tempfile.TemporaryFile() as stderr:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=stderr)
        try:
            while True:
                raw = read_exact(process.stdout, width * height)
                if not raw:
                    break
                frame = len(rows)
                if frame >= len(frame_info):
                    raise ValueError('Decoded frame count exceeds ffprobe frame records')
                value = frame_info[frame].get('best_effort_timestamp_time', frame_info[frame].get('pts_time'))
                pts = float(value) if value is not None else None
                if pts is not None and not math.isfinite(pts):
                    pts = None
                pixels = np.frombuffer(raw, dtype=np.uint8).astype(np.float32).reshape(height, width)
                row = frame_stats(pixels, previous, thresholds)
                row.update(frame=frame, pts=pts)
                rows.append(row)
                previous = pixels
            returncode = process.wait()
            stderr.seek(0)
            errors = stderr.read().decode(errors='replace')
            if returncode or errors.strip():
                raise RuntimeError(f'ffmpeg decode failed or reported errors ({returncode}): {errors}')
        finally:
            if process.poll() is None:
                process.kill()
                process.wait()
            process.stdout.close()
    if not rows or len(rows) != len(frame_info):
        raise ValueError(f'Decoded {len(rows)} frames; ffprobe returned {len(frame_info)}')
    declared = stream.get('nb_frames')
    declared = int(declared) if str(declared).isdigit() else None
    timing = timestamp_summary(rows, declared)
    with source.open('rb') as handle:
        checksum = hashlib.file_digest(handle, 'sha256').hexdigest()
    return {'schemaVersion': 1, 'status': 'candidates-require-review', 'input': str(source),
            'sourceSha256': checksum, 'metadata': metadata, 'decodedFrames': len(rows),
            'probeFrameRecords': len(frame_info), 'fps': {'average': stream.get('avg_frame_rate'),
            'nominal': stream.get('r_frame_rate'), 'averageValue': rate(stream.get('avg_frame_rate'))},
            'pts': timing, 'thresholds': thresholds,
            'scan': {'width': width, 'height': height, 'temporalSampling': 'none',
                     'rotation': 'disabled for statistics', 'scope': 'entire decoded frame'},
            'rows': rows, 'groups': candidate_groups(rows, gap, context),
            'limits': 'Intentional holds, cuts and masks can be candidates. No candidates is not visual acceptance. '
                      'Spatial reduction can miss small local defects; use a separate ROI audit for local visibility.'}


def contact_sheets(report, output, ffmpeg, rows_per_sheet=5):
    from PIL import Image, ImageDraw
    groups = report['groups']
    if not groups:
        return []
    needed = sorted({f for g in groups for f in g['reviewFrames']})
    width, height, label = 400, 225, 30
    # Select by native index, never seek by frame/fps; this also works for VFR.
    expression = '+'.join(f'eq(n,{f})' for f in needed)
    filters = (f"select='{expression}',scale=iw*sar:ih,setsar=1,"
               f'scale={width}:{height}:force_original_aspect_ratio=decrease,format=rgb24')
    paths = []
    with tempfile.TemporaryDirectory(prefix='fred-frame-candidates-') as directory:
        root = Path(directory)
        subprocess.run([ffmpeg, '-v', 'error', '-i', report['input'], '-map', '0:v:0', '-an',
                        '-vf', filters, '-fps_mode', 'passthrough', str(root/'frame-%06d.png')], check=True)
        extracted = sorted(root.glob('frame-*.png'))
        if len(extracted) != len(needed):
            raise ValueError('Contact-sheet extraction did not preserve selected frame count')
        images = dict(zip(needed, extracted))
        for start in range(0, len(groups), rows_per_sheet):
            subset = groups[start:start + rows_per_sheet]
            sheet = Image.new('RGB', (width * 3, (height + label) * len(subset)), '#dddddd')
            draw = ImageDraw.Draw(sheet)
            for y, group in enumerate(subset):
                for x, frame in enumerate(group['reviewFrames']):
                    with Image.open(images[frame]) as picture:
                        # Letterbox; never stretch images to fill the cell.
                        sheet.paste(picture, (x * width + (width-picture.width)//2,
                                             y * (height+label) + (height-picture.height)//2))
                    pts = report['rows'][frame]['pts']
                    draw.text((x * width + 6, y * (height+label) + height + 6),
                              f"group {start+y+1} | frame {frame} | PTS {pts}", fill='black')
            path = output.with_name(f'{output.stem}-candidates-{start//rows_per_sheet:03d}.jpg')
            sheet.save(path, quality=92)
            paths.append(str(path.resolve()))
    return paths


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True)
    parser.add_argument('--out', required=True, help='JSON report path')
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--ffprobe', default='ffprobe')
    parser.add_argument('--scan-width', type=int, default=320)
    parser.add_argument('--uniform-std', type=float, default=1)
    parser.add_argument('--white-level', type=float, default=230)
    parser.add_argument('--min-dark-fraction', type=float, default=.0004)
    parser.add_argument('--frame-difference', type=float, default=28)
    parser.add_argument('--mean-jump', type=float, default=28)
    parser.add_argument('--group-gap', type=int, default=1, help='Maximum clean frames inside a candidate group')
    parser.add_argument('--context-frames', type=int, default=2)
    parser.add_argument('--contact-sheets', action='store_true')
    args = parser.parse_args()
    thresholds = {'uniformStd': args.uniform_std, 'whiteLevel': args.white_level,
                  'minDarkFraction': args.min_dark_fraction, 'frameDifference': args.frame_difference,
                  'meanJump': args.mean_jump}
    if (args.scan_width <= 0 or args.group_gap < 0 or args.context_frames < 0
            or any(not math.isfinite(v) for v in thresholds.values())
            or not 0 <= args.white_level <= 255 or not 0 <= args.min_dark_fraction <= 1
            or min(args.uniform_std, args.frame_difference, args.mean_jump) < 0):
        parser.error('Invalid spatial, grouping or threshold value')
    source, output = Path(args.input).resolve(), Path(args.out).resolve()
    if source == output:
        parser.error('Output must not replace input media')
    output.parent.mkdir(parents=True, exist_ok=True)
    report = scan(source, args.ffmpeg, args.ffprobe, args.scan_width, thresholds,
                  args.group_gap, args.context_frames)
    report['contactSheets'] = contact_sheets(report, output, args.ffmpeg) if args.contact_sheets else []
    output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'output': str(output), 'decodedFrames': report['decodedFrames'],
                      'candidateGroups': len(report['groups']), 'status': report['status']}))
    if (report['pts']['missingPtsFrames'] or report['pts']['nonIncreasingPtsFrames']
            or report['pts']['reportedCountMatches'] is False):
        raise SystemExit('Frame/PTS inconsistencies recorded in report; review required')


if __name__ == '__main__':
    main()
