"""Measured loudness and bounded true-peak correction for processed exports."""
import array
import json
import math
from pathlib import Path
import re
import subprocess
import wave


def measure(path):
    result = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', str(path),
        '-af', 'loudnorm=I=-14:TP=-1:LRA=7:print_format=json', '-f', 'null', '-'],
        capture_output=True, text=True, check=True)
    matches = re.findall(r'\{[^{}]*\}', result.stderr)
    data = next((json.loads(s) for s in reversed(matches) if 'input_tp' in s), None)
    if data is None:
        raise ValueError('No loudness measurement returned')
    def value(key):
        v = float(data[key])
        if math.isnan(v) or v == math.inf:
            raise ValueError('Invalid loudness measurement')
        return None if v == -math.inf else v
    with wave.open(str(path)) as w:
        if w.getsampwidth() != 2:
            raise ValueError('QC expects PCM16 WAV')
        samples = array.array('h', w.readframes(w.getnframes()))
    peak = max(map(abs, samples), default=0) / 32768
    return dict(integratedLufs=value('input_i'), truePeakDbtp=value('input_tp'),
                loudnessRangeLu=value('input_lra'), samplePeakDbfs=20*math.log10(peak) if peak else None)


def render_processed(source, target, speed, trim, gain, ceiling=-1.0):
    """Retry only local limiting; keep gain/speed fixed and fail if TP remains unsafe."""
    with wave.open(str(source)) as w:
        rate, frames = w.getframerate(), w.getnframes()
    ceiling_work = ceiling - .5
    attempts = []
    for attempt in range(3):
        filters = []
        if speed != 1:
            filters.append(f'atempo={speed}')
        if trim:
            filters.append(f'atrim=start={trim}')
        filters += ['asetpts=PTS-STARTPTS', f'volume={gain}dB', 'aresample=192000',
                    f'alimiter=limit={10**(ceiling_work/20)}:level=false:latency=true', f'aresample={rate}']
        if speed == 1:
            # No-op atempo can change frame count. Preserve the exact unity-speed clock.
            expected = frames - round(trim*rate)
            filters += [f'apad=whole_len={expected}', f'atrim=end_sample={expected}']
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(source),
                        '-af', ','.join(filters), '-c:a', 'pcm_s16le', str(target)], check=True)
        qc = measure(target)
        passed = qc['truePeakDbtp'] is None or qc['truePeakDbtp'] <= ceiling + .05
        attempts.append(dict(limiterCeilingDb=ceiling_work, measurement=qc, passed=passed))
        if passed:
            return dict(passed=True, targetDbtp=ceiling, toleranceDb=.05,
                        limiterCeilingDb=ceiling_work, oversampleRate=192000,
                        latencyCompensated=True, filters=filters, attempts=attempts), qc
        ceiling_work -= max(.2, qc['truePeakDbtp']-ceiling+.2)
    raise ValueError('True peak remains above target after 3 local attempts; delivery not published')
