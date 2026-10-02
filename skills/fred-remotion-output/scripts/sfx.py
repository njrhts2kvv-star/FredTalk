#!/usr/bin/env python3
"""Query selected action sounds and verify project-local source integrity."""
import argparse
import json
from common import project_root, digest, is_relative_to


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root')
    parser.add_argument('--action')
    parser.add_argument('--id')
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    skill = project_root(args.project_root) / 'skills/fred-remotion-output'
    data = json.loads((skill / 'references/sound-effects.json').read_text())
    if digest(skill / data['selectionEvidence']) != data['selectionEvidenceSha256']:
        raise ValueError('Sound selection evidence changed')
    entries = data['entries']
    if args.action:
        entries = [e for e in entries if args.action in e['actions']]
    if args.id:
        entries = [e for e in entries if e['id'] == args.id]
    for entry in entries:
        path = (skill / entry['file']).resolve()
        if not is_relative_to(path, skill.resolve()) or digest(path) != entry['sha256']:
            raise ValueError('Sound source changed: ' + entry['id'])
        original = (skill / entry['originalFile']).resolve()
        if not is_relative_to(original, skill.resolve()) or digest(original) != entry['originalSha256']:
            raise ValueError('Original sound changed: ' + entry['id'])
        entry['resolvedOriginalFile'] = str(original)
        entry['resolvedFile'] = str(path)
    print(json.dumps({'count': len(entries), 'integrity': 'passed', 'entries': entries}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
