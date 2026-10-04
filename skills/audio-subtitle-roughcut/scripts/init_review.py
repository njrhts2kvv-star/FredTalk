import argparse
import hashlib
import json
import shutil
import subprocess
import wave
from pathlib import Path

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    p = argparse.ArgumentParser()
    for name in ('episode', 'audio', 'subtitles', 'script', 'title'):
        p.add_argument('--' + name, required=True)
    args = p.parse_args()
    episode = Path(args.episode).resolve()
    root = episode / '03_制作过程/audio-review'
    if root.exists():
        p.error('Review already exists; resume it rather than overwrite')
    inputs = {key: Path(getattr(args, key)).resolve() for key in ('audio', 'subtitles', 'script')}
    for path in inputs.values():
        if not path.is_file():
            p.error(f'Missing input: {path}')
    shutil.copytree(Path(__file__).resolve().parent.parent / 'assets/review-app', root)
    source = inputs['audio']
    try:
        with wave.open(str(source)) as w:
            normalized = (w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getcomptype()) == (48000, 2, 2, 'NONE')
    except (wave.Error, EOFError):
        normalized = False
    if not normalized:
        source = root / 'source-normalized.wav'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(inputs['audio']), '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', str(source)], check=True)
    config = dict(episode=str(episode), title=args.title, filenameStem=episode.name.split()[0], sourceAudio=str(source), sourceSubtitles=str(inputs['subtitles']), script=str(inputs['script']), originalInputs={str(path): digest(path) for path in inputs.values()})
    (root / 'project.json').write_text(json.dumps(config, ensure_ascii=False, indent=2))
    for name in ('cuts', 'subtitle-corrections', 'subtitle-boundaries', 'subtitle-sentences'):
        (root / (name + '.json')).write_text('[]')
    for name in ('subtitle-edits', 'subtitle-sentence-edits', 'subtitle-joins'):
        (root / (name + '.json')).write_text('{}')
    print(root)

if __name__ == '__main__':
    main()
