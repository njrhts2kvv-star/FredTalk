import argparse
import hashlib
import importlib.util
import json
import math
import re
import shutil
import subprocess
import wave
from pathlib import Path
from audio_qc import measure, render_processed

def load_server(root):
    spec = importlib.util.spec_from_file_location('review_server', root / 'server.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def hash_file(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--review', required=True)
    p.add_argument('--version', required=True)
    p.add_argument('--speed', type=float, help='Default 1.1; 1 with --passthrough')
    p.add_argument('--trim-start', type=float, help='Seconds in accelerated rough cut; otherwise detect initial silence')
    p.add_argument('--gain-db', type=float, help='Default 8; 0 with --passthrough')
    p.add_argument('--passthrough', action='store_true', help='Only concatenate selected PCM spans; no speed, gain, limiter or automatic head trim')
    args = p.parse_args()
    if args.passthrough:
        if args.speed not in (None, 1) or args.gain_db not in (None, 0) or args.trim_start not in (None, 0):
            p.error('--passthrough requires speed 1, gain 0, trim 0; put head cuts in cuts.json')
        args.speed, args.gain_db, args.trim_start = 1, 0, 0
    else:
        args.speed = 1.1 if args.speed is None else args.speed
        args.gain_db = 8 if args.gain_db is None else args.gain_db
    if not re.fullmatch(r'[A-Za-z0-9_-]+', args.version) or not .5 <= args.speed <= 2 or not math.isfinite(args.gain_db):
        p.error('Invalid processing parameters')
    root = Path(args.review).resolve()
    server = load_server(root)
    cuts = server.validate(json.loads(server.STATE.read_text()))
    result = server.export(cuts)
    base = Path(result['path'])
    output = server.EPISODE / '02_最终输出'
    output.mkdir(exist_ok=True)
    stem = server.CONFIG['filenameStem']
    audio = output / f'{stem}-final-audio-{args.version}.wav'
    subtitle = output / f'{stem}-final-subtitles-{args.version}.srt'
    if audio.exists() or subtitle.exists():
        p.error('Version exists; choose a new version')
    # Conservative waveform threshold proposes only the initial silent span.
    with wave.open(str(base / 'review-cut.wav')) as w:
        samples = server.array.array('h', w.readframes(w.getnframes()))
        channels, rate = w.getnchannels(), w.getframerate()
    onset = next((i // channels / rate for i in range(0, len(samples), channels) if max(abs(v) for v in samples[i:i+channels]) > 32768 * .01), 0)
    trim = args.trim_start if args.trim_start is not None else max(0, onset - .05) / args.speed
    if trim < 0 or trim >= result['duration'] / args.speed:
        p.error('Trim outside rough cut')
    loudness_before = measure(base / 'review-cut.wav')
    true_peak_check = None
    if args.passthrough:
        shutil.copyfile(base / 'review-cut.wav', audio)
    else:
        true_peak_check, _ = render_processed(base / 'review-cut.wav', audio, args.speed, trim, args.gain_db)
    loudness_after = measure(audio)
    with wave.open(str(audio)) as w:
        duration = w.getnframes() / w.getframerate()
        frames = w.getnframes()
    lines, mapped = [], []
    for block in re.split(r'\n\s*\n', (base / 'review-cut.srt').read_text().strip()):
        values = block.splitlines()
        a, b = values[1].split(' --> ')
        a, b = max(0, server.seconds(a) / args.speed - trim), min(duration, server.seconds(b) / args.speed - trim)
        if b - a < .015:
            continue
        text = '\n'.join(values[2:])
        mapped.append(dict(start=a, end=b, text=text))
        lines.append(f'{len(lines)+1}\n{server.timestamp(a)} --> {server.timestamp(b)}\n{text}\n')
    subtitle.write_text('\n'.join(lines))
    measurements = subprocess.run(['ffmpeg', '-nostdin', '-i', str(audio), '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True, check=True).stderr
    before = subprocess.run(['ffmpeg', '-nostdin', '-i', str(base / 'review-cut.wav'), '-af', f'atempo={args.speed},atrim=start={trim},volumedetect', '-f', 'null', '-'], capture_output=True, text=True, check=True).stderr
    manifest = dict(version=args.version, filenameStem=stem, speed=args.speed, trimStart=trim, trimMode='manual' if args.trim_start is not None else 'threshold-proposal-needs-audition', gainDb=args.gain_db, passthrough=args.passthrough, peakLimitDb=None if args.passthrough else true_peak_check['limiterCeilingDb'], duration=duration, frames=frames, audioPath=str(audio), subtitlePath=str(subtitle), audioHash=hash_file(audio), subtitleHash=hash_file(subtitle), baseExport=str(base), expectedCues=mapped, subtitleWarnings=result['subtitleWarnings'], measurementLines=[line.strip() for line in measurements.splitlines() if 'mean_volume:' in line or 'max_volume:' in line], listeningReviewed=False)
    means = [re.search(r'mean_volume: ([-\d.]+) dB', value) for value in (before, measurements)]
    manifest['loudnessBefore'] = loudness_before
    manifest['loudnessAfter'] = loudness_after
    manifest['truePeakCheck'] = true_peak_check
    manifest['preprocessingSpeed'] = server.CONFIG.get('preprocessing', {}).get('speedApplied')
    manifest['actualLoudnessChangeLu'] = round(loudness_after['integratedLufs'] - loudness_before['integratedLufs'], 2) if all(v['integratedLufs'] is not None for v in (loudness_before, loudness_after)) else None
    manifest['actualMeanGainDb'] = round(float(means[1][1]) - float(means[0][1]), 2) if all(means) else None
    (base / 'delivery.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    temp = root / 'final-delivery.tmp'
    temp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    temp.replace(root / 'final-delivery.json')
    print(json.dumps(manifest, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
