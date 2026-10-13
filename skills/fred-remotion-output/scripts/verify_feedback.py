#!/usr/bin/env python3
"""Check historical rule provenance and current selection without rendering media."""
import argparse
import json
from pathlib import Path
from common import project_root, digest, load_references, is_relative_to
from feedback import load_feedback


def evidence_path(root, value):
    logical = root / value
    path = logical.resolve()
    # The documented episode entrance may point to the sibling physical root.
    allowed = [root.resolve()]
    episodes = root / '00_每期项目'
    if episodes.is_dir():
        allowed.append(episodes.resolve())
    # Archived episodes retain a registered top-level entrance. Trust only that
    # episode's target in the documented archive, not arbitrary nested symlinks.
    try:
        parts = logical.relative_to(root).parts
    except ValueError:
        parts = ()
    if len(parts) > 1 and parts[0] == '00_每期项目':
        entry = episodes / parts[1]
        archive = Path.home() / 'Desktop/FredTalk视频/项目归档/00_每期项目-archive'
        if entry.is_symlink() and is_relative_to(entry.resolve(), archive.resolve()):
            allowed.append(entry.resolve())
    if not any(is_relative_to(path, base) for base in allowed):
        raise ValueError('Evidence must be within the project or episode root: ' + str(path))
    return path


def frontend_text(root, row):
    if row.get('timestamp') is not None or not row.get('recordedAt'):
        raise ValueError('Frontend observation time must not be claimed as message time')
    path = evidence_path(root, row['originalPath'])
    if digest(path) != row['originalSha256']:
        raise ValueError('Frontend source changed: ' + str(path))
    pointer = row['originalPointer']
    if not pointer.startswith('/'):
        raise ValueError('Frontend evidence needs a JSON pointer')
    source = json.loads(path.read_text())
    for token in pointer[1:].split('/'):
        token = token.replace('~1', '/').replace('~0', '~')
        if isinstance(source, list):
            if not token.isascii() or not token.isdigit() or (len(token) > 1 and token.startswith('0')):
                raise ValueError('Invalid JSON pointer array index: ' + token)
            source = source[int(token)]
        elif isinstance(source, dict):
            source = source[token]
        else:
            raise ValueError('JSON pointer cannot traverse a scalar')
    if not isinstance(source, dict):
        raise ValueError('Frontend evidence must identify one feedback record')
    if any(source.get(k, '') != row[k] for k in ['choice', 'reviewedVersion']):
        raise ValueError('Frontend decision or reviewed version mismatch: ' + str(path))
    if source.get('note') != row['text']:
        raise ValueError('Frontend note mismatch: ' + str(path))
    return row['text']


def verify(root, episode=None):
    data = load_feedback(root)
    rules = [rule for rule in data['rules'] if episode is None or episode in rule['episodes']]
    checked = [e for rule in rules for e in rule['evidence'] if episode is None or e['episode'] == episode]
    errors, files, ids = [], {}, set()
    if not checked:
        errors.append('No evidence matches the requested scope')
    for rule in rules:
        if rule['id'] in ids:
            errors.append('Duplicate rule: ' + rule['id'])
        ids.add(rule['id'])
        for field in ['title', 'when', 'prefer', 'avoid', 'scope', 'checks', 'keywords', 'evidence']:
            if not rule.get(field):
                errors.append('Missing rule field: ' + rule['id'] + '/' + field)
        episodes = {e['episode'] for e in rule['evidence']}
        if episodes != set(rule['episodes']):
            errors.append('Episode filter is not supported by evidence: ' + rule['id'])
        for e in rule['evidence']:
            if episode is not None and e['episode'] != episode:
                continue
            try:
                p = evidence_path(root, e['path'])
                if e['path'] not in files:
                    files[e['path']] = (digest(p), p.read_text().splitlines())
                sha, lines = files[e['path']]
                if sha != e['sha256']:
                    raise ValueError('Evidence changed: ' + str(p))
                line = lines[e['line'] - 1]
                if e['kind'] in {'user-message', 'user-feedback'}:
                    row = json.loads(line)
                    if row['episode'] != e['episode'] or row['timestamp'] != e['timestamp']:
                        raise ValueError('Wrong episode or time: ' + str(p))
                    if e['kind'] == 'user-feedback':
                        text = frontend_text(root, row)
                    elif not row.get('originalPath') or not row.get('originalLine'):
                        raise ValueError('Original message locator missing: ' + str(p))
                    else:
                        text = row['text']
                elif e['kind'] == 'implementation-diagnosis':
                    text = line
                else:
                    raise ValueError('Unknown evidence kind: ' + e['kind'])
                if e['quote'] not in text:
                    raise ValueError('Quote not found on the specified evidence line: ' + str(p))
            except (OSError, ValueError, KeyError, IndexError, TypeError) as exc:
                errors.append(rule['id'] + ': ' + str(exc))
    registry, choices = load_references(root)
    return {'status': 'FAIL' if errors else 'PASS', 'feedbackRevision': data['revision'],
            'ruleCount': len(ids), 'citationsChecked': len(checked),
            'evidenceFilesChecked': len(files), 'currentSelectionRevision': registry['selectionRevision'],
            'currentSelectionCounts': choices['counts'],
            'scope': 'Historical rule attribution and unchanged selection integrity; no new visual approval',
            'episodeFilter': episode,
            'errors': errors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root')
    parser.add_argument('--episode', help='Check evidence for one episode; omit for the full history audit')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        result = verify(project_root(args.project_root), args.episode)
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(result, ensure_ascii=False, indent=2))
        raise SystemExit(bool(result['errors']))
    except (OSError, ValueError, KeyError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()
