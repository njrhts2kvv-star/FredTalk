#!/usr/bin/env python3
"""Synthetic and short local MP4 regression for the all-frame candidate scanner."""
import argparse
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg', required=True)
    parser.add_argument('--ffprobe', required=True)
    parser.add_argument('--out', help='Optional persistent test report')
    args = parser.parse_args()
    script = Path(__file__).resolve().with_name('scan-frame-candidates.py')
    spec = importlib.util.spec_from_file_location('frame_candidates', script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    limits = {'uniformStd': 1, 'whiteLevel': 230, 'minDarkFraction': .0004,
              'frameDifference': 28, 'meanJump': 28}
    pattern = np.indices((80, 48)).sum(axis=0).astype(np.float32) % 2 * 120 + 40
    normal = module.frame_stats(pattern, pattern, limits)
    assert normal['reasons'] == [], normal
    white = module.frame_stats(np.full_like(pattern, 255), pattern, limits)
    assert set(white['reasons']) == {'near-uniform-frame', 'near-white-frame',
                                   'adjacent-frame-change', 'mean-brightness-jump'}, white
    black = module.frame_stats(np.zeros_like(pattern), pattern, limits)
    assert 'near-uniform-frame' in black['reasons']
    assert 'near-white-frame' not in black['reasons']
    # Configured thresholds are honored without defining an aesthetic pass.
    disabled = {**limits, 'uniformStd': 0, 'minDarkFraction': 0, 'frameDifference': 255, 'meanJump': 255}
    assert module.frame_stats(np.full_like(pattern, 255), pattern, disabled)['reasons'] == []
    rows = [{'frame': i, 'pts': i/24, 'reasons': ['signal'] if i in [0, 2, 5] else []} for i in range(6)]
    grouped = module.candidate_groups(rows, gap=1, context=2)
    assert [g['candidateFrames'] for g in grouped] == [[0, 2], [5]], grouped
    assert grouped[0]['reviewFrames'] == [0, 1, 4]
    assert grouped[1]['reviewFrames'] == [3, 5, 5]
    assert module.rate('30000/1001') > 29.97
    assert module.rate('0/0') is None
    inconsistent = [{'frame': 0, 'pts': .5}, {'frame': 1, 'pts': None},
                    {'frame': 2, 'pts': .7}, {'frame': 3, 'pts': .7}]
    timing = module.timestamp_summary(inconsistent, 9)
    assert timing['missingPtsFrames'] == [1] and timing['nonIncreasingPtsFrames'] == [3]
    assert timing['reportedCountMatches'] is False
    results = []
    with tempfile.TemporaryDirectory(prefix='fred-frame-scan-test-') as directory:
        root = Path(directory)
        # Broad shapes survive spatial reduction. One white frame must not be skipped.
        frame = np.full((80, 48), 200, dtype=np.uint8)
        frame[15:65, 10:38] = 40
        video_frames = np.repeat(frame[None, :, :], 12, axis=0)
        video_frames[5] = 255
        for name, input_rate, filters in [('fractional', '30000/1001', None),
                                         ('variable', '24', "setpts='(N+gte(N,6)*2)/(24*TB)'")]:
            video, out = root/f'{name}.mp4', root/f'{name}.json'
            command = [args.ffmpeg, '-v', 'error', '-f', 'rawvideo', '-pixel_format', 'gray',
                       '-video_size', '48x80', '-framerate', input_rate, '-i', '-', '-an']
            if filters:
                command += ['-vf', filters]
            command += ['-fps_mode', 'passthrough', '-c:v', 'libx264', '-crf', '0',
                        '-pix_fmt', 'yuv444p', str(video)]
            subprocess.run(command, input=video_frames.tobytes(), capture_output=True, check=True, timeout=60)
            run = subprocess.run([sys.executable, str(script), '--input', str(video), '--out', str(out),
                                  '--ffmpeg', args.ffmpeg, '--ffprobe', args.ffprobe, '--scan-width', '48',
                                  '--contact-sheets'], capture_output=True, text=True, check=True, timeout=60)
            report = json.loads(out.read_text())
            assert report['decodedFrames'] == report['probeFrameRecords'] == len(report['rows']) == 12
            assert report['scan']['temporalSampling'] == 'none'
            assert report['scan']['width'] == 48 and report['scan']['height'] == 80
            assert report['pts']['allFramesHavePts'] and not report['pts']['nonIncreasingPtsFrames']
            assert 'near-white-frame' in report['rows'][5]['reasons']
            assert report['rows'][4]['reasons'] == [], report['rows'][4]
            assert report['status'] == 'candidates-require-review'
            assert report['contactSheets']
            with Image.open(report['contactSheets'][0]) as sheet:
                assert sheet.width == 1200
                # Portrait images are letterboxed, not distorted into 400x225.
                assert np.max(np.abs(np.array(sheet)[20, 15].astype(int) - 221)) < 15
            if name == 'fractional':
                assert report['fps']['average'] == '30000/1001', report['fps']
                assert abs(report['rows'][11]['pts'] - 11*1001/30000) < .00001
            else:
                assert report['pts']['maxDelta'] > report['pts']['minDelta'] * 2.5, report['pts']
                assert abs(report['rows'][6]['pts'] - 8/24) < .00001, report['rows'][6]
            results.append({'fixture': name, 'frames': report['decodedFrames'], 'fps': report['fps'],
                            'pts': report['pts'], 'candidateGroups': len(report['groups']),
                            'oneFrameWhiteDetected': True, 'contactSheetLetterbox': True})
        # A missing input must fail, with no success-shaped output report.
        failed = subprocess.run([sys.executable, str(script), '--input', str(root/'missing.mp4'),
                                 '--out', str(root/'invalid.json'), '--ffmpeg', args.ffmpeg,
                                 '--ffprobe', args.ffprobe], capture_output=True, timeout=60)
        assert failed.returncode != 0 and not (root/'invalid.json').exists()
    result = {'status': 'tests-passed', 'syntheticChecks': 10, 'fixtures': results,
              'invalidInputRejected': True,
              'scope': 'Candidate detection, native-frame PTS/count and contact-sheet geometry; not production video acceptance'}
    if args.out:
        target = Path(args.out)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result))


if __name__ == '__main__':
    main()
