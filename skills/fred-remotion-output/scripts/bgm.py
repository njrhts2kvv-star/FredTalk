#!/usr/bin/env python3
"""Compose a music bed, mute source-playback intervals, then mux once locally."""
import argparse
import json
import math
import os
import re
import subprocess
import tempfile
from pathlib import Path
from bgm_policy import digest, resolve_music

RATE = 48000


def run(args):
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode:
        raise ValueError(result.stderr[-4000:])
    return result.stdout, result.stderr


def probe(path):
    return json.loads(run(['ffprobe', '-v', 'error', '-show_streams',
                          '-show_format', '-of', 'json', str(path)])[0])


def measure(path):
    _, log = run(['ffmpeg', '-hide_banner', '-nostats', '-nostdin', '-i', str(path),
                  '-vn', '-af', 'ebur128=peak=true:framelog=verbose', '-f', 'null', '-'])
    summary = log[log.rfind('Summary:'):]
    peak = re.search(r'Peak:\s*([-\d.]+)', summary)
    loudness = re.search(r'I:\s*([-\d.]+) LUFS', summary)
    if not peak or not loudness:
        raise ValueError('Cannot measure final audio peak/loudness')
    return {'truePeakDbtp': float(peak[1]), 'integratedLufs': float(loudness[1])}


def music_segments(duration, source_duration, plan):
    if not math.isfinite(duration) or duration <= 0 or source_duration <= 0:
        raise ValueError('Invalid music/video duration')
    crossfade = float(plan.get('joinCrossfadeSeconds', 0.08))
    if not math.isfinite(crossfade) or not 0 <= crossfade <= 1:
        raise ValueError('Music join crossfade must be between 0 and 1 second')
    segments = plan.get('segments')
    if segments:
        segments = [list(x) for x in segments]
    elif duration <= source_duration:
        segments = [[0, duration]]
    else:
        first_end = min(180.0, source_duration)
        loop = plan.get('loopSourceRangeSeconds',
                        [source_duration * 0.45, source_duration * 0.9])
        if len(loop) != 2 or not 0 <= loop[0] < loop[1] <= source_duration:
            raise ValueError('Invalid interior repeat range')
        if loop[1] - loop[0] <= crossfade:
            raise ValueError('Repeat range must exceed crossfade')
        segments = [[0, first_end]]
        length = first_end
        while length < duration:
            segments.append(list(loop))
            length += loop[1] - loop[0] - crossfade
    total = 0
    for i, (start, end) in enumerate(segments):
        if not all(math.isfinite(x) for x in [start, end]) or not 0 <= start < end <= source_duration:
            raise ValueError('Music segment outside source')
        if len(segments) > 1 and end - start <= crossfade:
            raise ValueError('Music segment shorter than crossfade')
        total += end - start - (crossfade if i else 0)
    if total + 1 / RATE < duration:
        raise ValueError('Music segments do not cover the video')
    return segments, crossfade


def mute_expression(duration, ranges, fade):
    if not math.isfinite(fade) or not 0 <= fade <= 1:
        raise ValueError('Mute fade must be between 0 and 1 second')
    ordered = sorted(ranges, key=lambda x: x['startSeconds'])
    previous_end = -1
    factors = []
    for item in ordered:
        start, end = item['startSeconds'], item['endSeconds']
        if not all(math.isfinite(x) for x in [start, end]) or not 0 <= start < end <= duration:
            raise ValueError('Mute interval outside video')
        if start < previous_end or not item.get('reason'):
            raise ValueError('Mute intervals need nonoverlapping ranges and reasons')
        previous_end = end
        if fade:
            factors.append(f'min(1,max(0,({start:.9f}-t)/{fade})+max(0,(t-{end:.9f})/{fade}))')
        else:
            factors.append(f'if(gte(t,{start:.9f})*lt(t,{end:.9f}),0,1)')
    return '*'.join(factors) or '1'


def compose(music, output, duration, source_duration, plan):
    segments, crossfade = music_segments(duration, source_duration, plan)
    count = round(duration * RATE)
    filters = ['[0:a]aresample=48000,aformat=sample_fmts=flt:channel_layouts=stereo,asplit=' +
               str(len(segments)) + ''.join(f'[s{i}]' for i in range(len(segments)))]
    for i, (start, end) in enumerate(segments):
        filters.append(f'[s{i}]atrim=start={start}:end={end},asetpts=PTS-STARTPTS[p{i}]')
    current = 'p0'
    for i in range(1, len(segments)):
        label = f'j{i}'
        join = f'acrossfade=d={crossfade}:c1=tri:c2=tri' if crossfade else 'concat=n=2:v=0:a=1'
        filters.append(f'[{current}][p{i}]{join}[{label}]')
        current = label
    envelope = mute_expression(duration, plan.get('muteRanges', []),
                               float(plan.get('muteFadeSeconds', 0.12)))
    filters.append(f"[{current}]atrim=end_sample={count},aeval=exprs='val(0)*({envelope})|val(1)*({envelope})'[bed]")
    run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', str(music), '-filter_complex',
         ';'.join(filters), '-map', '[bed]', '-c:a', 'pcm_f32le', str(output)])
    return {'segments': segments, 'joinCrossfadeSeconds': crossfade,
            'sampleFrames': count, 'sourceClockDuringMute': 'continues', 'linearVolume': 1}


def mix(video, output, plan, bgm=None):
    video, output = Path(video).resolve(), Path(output).resolve()
    if plan.get('enabled') is not True:
        raise ValueError('BGM disabled or not configured; preserve the original full mix')
    if output.exists() or output.with_suffix('.bgm.json').exists():
        raise ValueError('Output already exists; choose a new version')
    if plan.get('inputBgmAlreadyPresent') is not False or video.with_suffix('.bgm.json').exists():
        raise ValueError('Confirm an input without BGM; never add the bed twice')
    music, music_hash, scope = resolve_music(bgm)
    input_hash = digest(video)
    info = probe(video)
    video_stream = next(x for x in info['streams'] if x['codec_type'] == 'video')
    if not any(x['codec_type'] == 'audio' for x in info['streams']):
        raise ValueError('Input must contain its original full audio mix')
    numerator, denominator = map(int, video_stream['avg_frame_rate'].split('/'))
    frames = int(video_stream['nb_frames'])
    duration = frames * denominator / numerator
    source_duration = float(probe(music)['format']['duration'])
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='bgm-local-only-', dir=output.parent) as temp:
        folder = Path(temp)
        bed, raw, protected, candidate = [folder / x for x in
                                         ['bed.wav', 'sum.wav', 'protected.wav', 'candidate.mp4']]
        composition = compose(music, bed, duration, source_duration, plan)
        samples = composition['sampleFrames']
        run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', str(video), '-i', str(bed),
             '-filter_complex', f'[0:a:0]aresample=48000,apad=whole_len={samples},atrim=end_sample={samples},asetpts=PTS-STARTPTS[a];'
             f'[a][1:a]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[m]',
             '-map', '[m]', '-c:a', 'pcm_f32le', str(raw)])
        initial = measure(raw)
        attempts = []
        for ceiling in [None, -1.5, -3.0, -4.5]:
            if ceiling is None and initial['truePeakDbtp'] > -1:
                continue
            audio = raw
            if ceiling is not None:
                run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', str(raw), '-af',
                     f'aresample=192000,alimiter=limit={10**(ceiling/20):.12f}:level=false:latency=true,'
                     f'aresample=48000,apad=whole_len={samples},atrim=end_sample={samples}',
                     '-c:a', 'pcm_f32le', str(protected)])
                audio = protected
            run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', str(video), '-i', str(audio),
                 '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k',
                 '-t', f'{duration:.12f}', '-movflags', '+faststart', str(candidate)])
            measured = measure(candidate)
            attempts.append({'limiterCeilingDb': ceiling, **measured,
                             'passed': measured['truePeakDbtp'] <= -1})
            if attempts[-1]['passed']:
                break
        if not attempts[-1]['passed']:
            raise ValueError('Final encoded mix still exceeds -1 dBTP after peak-protection retries')
        result = probe(candidate)
        stream = next(x for x in result['streams'] if x['codec_type'] == 'video')
        if int(stream['nb_frames']) != frames:
            raise ValueError('Video frame count changed during audio mux')
        run(['ffmpeg', '-v', 'error', '-nostdin', '-i', str(candidate), '-f', 'null', '-'])
        def video_hash(path):
            return run(['ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:v:0',
                        '-c:v', 'copy', '-f', 'hash', '-hash', 'sha256', '-'])[0].strip()
        if video_hash(video) != video_hash(candidate):
            raise ValueError('Video stream changed during audio mux')
        if digest(video) != input_hash or digest(music) != music_hash:
            raise ValueError('Input video/music changed during mixing; rebuild from a frozen version')
        report = {'schemaVersion': 1, 'input': str(video), 'inputSha256': input_hash,
                  'output': str(output), 'videoFrames': frames, 'durationSeconds': duration,
                  'musicScope': scope, 'musicSha256': music_hash, 'composition': composition,
                  'muteRanges': plan.get('muteRanges', []), 'sumBeforeProtection': initial,
                  'encodedMixAttempts': attempts, 'videoPayloadUnchanged': True,
                  'fullDecodePassed': True, 'bgmMixedOnce': True, 'normalization': False,
                  'subjectiveListeningReviewed': False}
        os.replace(candidate, output)
        report['outputSha256'] = digest(output)
        output.with_suffix('.bgm.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--video', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--plan', required=True)
    parser.add_argument('--bgm', help='Own music; absent only on the authorized owner machine')
    args = parser.parse_args()
    report = mix(args.video, args.output, json.loads(Path(args.plan).read_text()), args.bgm)
    print(json.dumps({'output': report['output'], 'durationSeconds': report['durationSeconds'],
                      'finalPeakDbtp': report['encodedMixAttempts'][-1]['truePeakDbtp'],
                      'musicScope': report['musicScope'], 'passed': True}, ensure_ascii=False))


if __name__ == '__main__':
    main()
