import argparse
import json
import re
import subprocess
import wave
from pathlib import Path
from deliver import hash_file, load_server
from audio_qc import measure
from loudness_profile import build_profile, segments_for_delivery
import hashlib

def verify(root):
    server = load_server(root)
    data = json.loads((root / 'final-delivery.json').read_text())
    for path, digest in server.CONFIG['originalInputs'].items():
        assert hash_file(root / path) == digest, f'Input changed: {path}'
    audio, subs = root / data['audioPath'], root / data['subtitlePath']
    assert hash_file(audio) == data['audioHash']
    assert hash_file(subs) == data['subtitleHash']
    with wave.open(str(audio)) as w:
        assert w.getnframes() == data['frames']
        assert abs(w.getnframes() / w.getframerate() - data['duration']) < .0001
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(audio), '-f', 'null', '-'], check=True)
    blocks = re.split(r'\n\s*\n', subs.read_text().strip())
    assert len(blocks) == len(data['expectedCues'])
    previous = 0
    for i, (block, expected) in enumerate(zip(blocks, data['expectedCues']), 1):
        lines = block.splitlines()
        assert int(lines[0]) == i
        a, b = map(server.seconds, lines[1].split(' --> '))
        assert 0 <= a < b <= data['duration'] + .001 and a >= previous - .001
        assert abs(a - expected['start']) <= .001 and abs(b - expected['end']) <= .001
        assert '\n'.join(lines[2:]) == expected['text']
        previous = b
    if data.get('truePeakCheck') and not data.get('passthrough'):
        measured = measure(audio)
        check = data['truePeakCheck']
        assert measured['truePeakDbtp'] is None or measured['truePeakDbtp'] <= check['targetDbtp'] + check['toleranceDb'], 'True peak exceeds delivery target'
    roles = segments_for_delivery(data)
    analyzer_hashes = {name: hash_file(Path(__file__).with_name(name)) for name in ('loudness_profile.py', 'audio_qc.py')}
    config_hash = hashlib.sha256(json.dumps(dict(segments=roles, cues=data['expectedCues'], analyzers=analyzer_hashes), sort_keys=True).encode()).hexdigest()[:8]
    profile_path = root / f"loudness-profile-{data['audioHash'][:12]}-{config_hash}.json"
    if profile_path.exists():
        profile = json.loads(profile_path.read_text())
        assert profile['audio']['sha256'] == data['audioHash'], 'Loudness profile audio mismatch'
    else:
        profile = build_profile(audio, segments=roles, cues=data['expectedCues'])
        profile_path.write_text(json.dumps(profile, ensure_ascii=False, indent=2) + '\n')
    report = dict(technicalPass=True, cueCount=len(blocks), duration=data['duration'], subtitleWarnings=data['subtitleWarnings'], listeningReviewed=data['listeningReviewed'], loudnessProfile=profile_path.name, loudnessCandidateCount=len(profile['candidates']), loudnessCandidatesRequireContextReview=True)
    (root / 'delivery-verification.json').write_text(json.dumps(report, indent=2))
    return report

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--review', required=True)
    print(json.dumps(verify(Path(p.parse_args().review).resolve()), indent=2))
