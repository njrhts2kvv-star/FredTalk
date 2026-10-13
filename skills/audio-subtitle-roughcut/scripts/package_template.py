#!/usr/bin/env python3
"""Package reusable review code and optionally an explicitly authorized example."""
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path


def package(output, example=None):
    skills = Path(__file__).resolve().parents[2]
    audio = skills / 'audio-subtitle-roughcut'
    media = skills / 'fred-remotion-output'
    files = []
    for folder in [audio / 'assets/review-app', media / 'templates/review-app']:
        files.extend(p for p in folder.rglob('*') if p.is_file() and p.suffix in {'.py', '.mjs', '.js', '.html', '.css'} and '__pycache__' not in p.parts)
    for folder, names in [(audio, ['init_review.py', 'deliver.py', 'verify_delivery.py', 'audio_qc.py', 'loudness_profile.py', 'package_template.py']),
                          (media, ['init_review_app.py', 'prepare_review_segments.py', 'serve_review_app.py', 'build_segment_review.py'])]:
        files.extend(folder / 'scripts' / name for name in names)
    entries = {}
    for file in files:
        payload = file.read_bytes()
        patterns = [rb'/(?:Users|home)/[A-Za-z0-9._-]+/', rb'\.codex/(?:archived_)?sessions/', rb'\b(?:ep|EP)[0-9]{2,}-keyframes', r'第[0-9]+期'.encode()]
        if any(re.search(pattern, payload) for pattern in patterns):
            raise ValueError('Private or episode-specific content found: ' + file.name)
        entries[str(file.relative_to(skills))] = payload
    guide = re.sub(r'第[0-9]+期', '现有生产前端', (media / 'references/segment-review.md').read_text())
    entries['fred-remotion-output/references/segment-review.md'] = guide.encode()
    example_info = None
    if example:
        example = Path(example).resolve()
        provenance = json.loads((example / 'source-provenance.json').read_text())
        if provenance.get('example', {}).get('purpose') != 'review-template-example' or not provenance['example'].get('authorization'):
            raise ValueError('Example requires explicit provenance and authorization')
        if not (example / 'START.py').is_file():
            raise ValueError('Example must contain its portable launcher')
        for file in example.rglob('*'):
            if not file.is_file() or any(p in {'__pycache__', 'images'} for p in file.relative_to(example).parts):
                continue
            if file.name in {'feedback.json', '.DS_Store', 'review-package.zip'} or file.suffix in {'.log', '.tmp', '.pyc'}:
                continue
            if file.suffix not in {'.json', '.md', '.py', '.mjs', '.js', '.html', '.css', '.mp4', '.wav', '.srt', '.jpg', '.png'}:
                raise ValueError('Unexpected example file: ' + file.name)
            payload = file.read_bytes()
            if file.suffix not in {'.mp4', '.wav', '.jpg', '.png'} and any(re.search(p, payload) for p in [rb'/(?:Users|home)/[A-Za-z0-9._-]+/', rb'\.codex/(?:archived_)?sessions/']):
                raise ValueError('Private path in example: ' + file.name)
            entries['example/' + str(file.relative_to(example))] = payload
        example_info = {k: provenance[k] for k in ['example', 'durationSeconds', 'frames', 'subtitleCues']}
    output = Path(output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        raise ValueError('Package exists; choose a new output filename')
    manifest = dict(schemaVersion=1, packageType='review-template-update',
                    requiresExistingSkills=['fred-remotion-output', 'audio-subtitle-roughcut'],
                    runtimes=['Python 3.9+', 'Node.js 18+', 'FFmpeg/FFprobe for media preparation'],
                    episodeDataIncluded=bool(example), example=example_info, credentialsIncluded=False,
                    files={k: hashlib.sha256(v).hexdigest() for k, v in sorted(entries.items())})
    temp = output.with_suffix('.zip.tmp')
    with zipfile.ZipFile(temp, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, payload in sorted(entries.items()):
            archive.writestr(name, payload)
        archive.writestr('template-package.json', json.dumps(manifest, ensure_ascii=False, indent=2))
        archive.writestr('USAGE.md', '# Review template update\n\nExtract these files into an existing skills directory containing both required skills. This is a template update, not a standalone media-production Skill. It relies on the existing workflow/library gate modules and catalog. The reusable code contains no episode state, private configuration or chat history. When explicitly selected, authorized media is kept separately under example/.\n\nInitialize audio with audio-subtitle-roughcut/scripts/init_review.py. Initialize media views with fred-remotion-output/scripts/init_review_app.py. Start linked modules with serve_review_app.py --review <episode>/03_制作过程/review-app --audio-review <episode>/03_制作过程/audio-review. Read the installed reference segment-review.md for the data contract and final delivery registration.\n')
        if example:
            archive.writestr('EXAMPLE-USAGE.md', '# 真实前端示例\n\n本包另含用户授权的真实片段及对应口播、字幕、关键帧和视频。解压后执行 `python3 example/START.py`，浏览器打开 http://127.0.0.1:8168/ 和 http://127.0.0.1:8169/ 。已有示例只需Python和Node，不需API或npm安装。停止时Ctrl-C。默认端口可用 --port 和 --audio-port 更改。示例是源成片的派生片段，来源/规格见example/source-provenance.json；不包含旧用户意见、凭证或聊天。\n\n新一期沿用公共模板，只更换Manifest和本期素材。生成新数据仍需安装上面两个Skill，不把示例的画面顺序当成固定创作模板。\n')
    with zipfile.ZipFile(temp) as archive:
        if archive.testzip():
            raise ValueError('ZIP integrity check failed')
        for name, expected in manifest['files'].items():
            if hashlib.sha256(archive.read(name)).hexdigest() != expected:
                raise ValueError('ZIP content hash mismatch')
    temp.replace(output)
    return dict(output=str(output), files=len(entries), sha256=hashlib.sha256(output.read_bytes()).hexdigest(), **{k: v for k, v in manifest.items() if k != 'files'})


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output', required=True)
    p.add_argument('--example', help='Explicitly authorized portable example directory')
    args = p.parse_args()
    print(json.dumps(package(args.output, args.example), ensure_ascii=False, indent=2))
