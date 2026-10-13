#!/usr/bin/env python3
"""Export BGM rendering capability only; never include owner music/configuration."""
import argparse
import json
import zipfile
from pathlib import Path
from bgm_policy import digest, export_exclusion

FILES = ['scripts/bgm.py', 'scripts/bgm_policy.py', 'scripts/test_bgm.py',
         'scripts/package_bgm.py', 'references/background-music.md',
         'references/bgm-policy.json', 'templates/bgm-plan.example.json']


def package(output):
    skill = Path(__file__).resolve().parents[1]
    output = Path(output).resolve()
    if output.exists():
        raise ValueError('Package already exists; choose a new version')
    entries = []
    for name in FILES:
        path = skill / name
        if path.is_symlink() or not path.is_file():
            raise ValueError('Package input must be a local regular file: ' + name)
        sha = digest(path)
        reason = export_exclusion(path, sha)
        if reason:
            raise ValueError('Local-only export refused: ' + name + ': ' + reason)
        entries.append((name, path, sha))
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, path, _ in entries:
            archive.write(path, 'fred-remotion-output/' + name)
        archive.writestr('README.md', 'FredTalk BGM capability supplement\n\n'
                         'Use your own BGM with --bgm. No Fred music or machine binding is included.\n'
                         'Requires Python 3 and FFmpeg/FFprobe; no paid API or upload.\n'
                         'See fred-remotion-output/references/background-music.md.\n')
        archive.writestr('manifest.json', json.dumps({'schemaVersion': 1,
                          'musicIncluded': False, 'ownerConfigIncluded': False,
                          'files': [{'path': name, 'sha256': sha} for name, _, sha in entries]}, indent=2))
    with zipfile.ZipFile(output) as archive:
        if archive.testzip():
            raise ValueError('ZIP integrity failed')
    return {'output': str(output), 'files': len(entries), 'musicIncluded': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True)
    print(json.dumps(package(parser.parse_args().output)))
