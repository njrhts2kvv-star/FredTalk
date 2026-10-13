"""Expose repeated component families before whole-episode advice delivery.

This validates recorded agent comparisons, not aesthetic quality. It neither
chooses replacement components nor converts a repeated family into approval.
"""
import argparse
import hashlib
import json
from pathlib import Path

KINDS = {'continuous-object', 'intentional-reprise', 'shared-media-shell', 'distinct-adaptation'}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def analyze(manifest, catalog=None):
    lookup = {row['id']: row for key in ['components', 'clips'] for row in (catalog or {}).get(key, [])}

    def canonical(rid):
        seen = set()
        while rid not in seen and lookup.get(rid, {}).get('canonicalId'):
            seen.add(rid)
            rid = lookup[rid]['canonicalId']
        return rid

    uses, context = [], []
    for page in manifest.get('pages', []):
        if page.get('implementationMode') not in {'reference', 'adapted'}:
            continue
        sid = page.get('stableId')
        refs = page.get('referenceChoices', [])
        context.append({key: page.get(key) for key in [
            'stableId', 'oneQuestion', 'sourceSpans', 'implementationMode',
            'referenceChoices', 'visualPlan', 'motionEvents']})
        for ref in refs:
            rid = ref.get('id')
            if not isinstance(rid, str) or not rid:
                continue
            source = ref.get('source', {})
            source_key = (source.get('sha256'), source.get('symbol'))
            if not all(isinstance(item, str) and item for item in source_key):
                source_key = None
            uses.append({'stableId': sid, 'referenceId': rid, 'canonicalId': canonical(rid),
                         'layoutFamily': ref.get('layoutFamily'), 'sourceKey': source_key})

    # Canonical selections and visually declared families are definite repeats.
    # A BatchA/BatchC function may dispatch several distinct scenes; its shared
    # source hash/symbol is a review clue, not proof of one visual component.
    parents = list(range(len(uses)))

    def find(index):
        while parents[index] != index:
            parents[index] = parents[parents[index]]
            index = parents[index]
        return index

    identities = {}
    for index, use in enumerate(uses):
        keys = [('reference', use['canonicalId'])]
        if isinstance(use['layoutFamily'], str) and use['layoutFamily'].strip():
            keys.append(('layout', use['layoutFamily']))
        for key in keys:
            if key in identities:
                parents[find(index)] = find(identities[key])
            else:
                identities[key] = index
    buckets = {}
    for index, use in enumerate(uses):
        buckets.setdefault(find(index), []).append(use)
    groups = []
    for members in buckets.values():
        scene_ids = list(dict.fromkeys(row['stableId'] for row in members))
        if len(scene_ids) < 2:
            continue
        ids = sorted({row['referenceId'] for row in members})
        canonical_ids = sorted({row['canonicalId'] for row in members})
        sources = sorted({row['sourceKey'] for row in members if row['sourceKey']})
        identity = {'canonicalIds': canonical_ids, 'sourceFunctions': sources,
                    'layoutFamilies': sorted({row['layoutFamily'] for row in members if row['layoutFamily']})}
        groups.append({'groupKey': digest(identity)[:24], 'sceneIds': scene_ids,
                       'referenceIds': ids, **identity})
    groups.sort(key=lambda group: group['groupKey'])
    shared = {}
    for use in uses:
        if use['sourceKey']:
            shared.setdefault(use['sourceKey'], []).append(use)
    candidates = [{'sourceFunction': list(key), 'referenceIds': sorted({row['referenceId'] for row in rows}),
                   'sceneIds': list(dict.fromkeys(row['stableId'] for row in rows))}
                  for key, rows in shared.items() if len({row['canonicalId'] for row in rows}) > 1]
    return {'contextSha256': digest({'pages': context, 'groups': groups,
                                    'catalogRevision': manifest.get('referenceCatalogRevision')}),
            'groups': groups, 'sharedSourceCandidates': candidates,
            'scope': 'Repeated IDs, canonical aliases and actually declared visual families require comparisons. Shared source dispatch functions are clues only. Visually similar unrelated sources still need actual agent overview review.'}


def validate_distribution(manifest, base, catalog=None):
    audit = analyze(manifest, catalog)
    if not audit['groups']:
        return []
    review = manifest.get('componentDistributionReview', {})
    if not isinstance(review, dict):
        review = {}
    errors = []
    prefix = 'component distribution: '
    if (review.get('status') != 'passed' or review.get('reviewedBy') != 'assistant'
            or review.get('contextSha256') != audit['contextSha256']):
        return [prefix + 'whole-episode comparison is missing or stale; review ' +
                '; '.join(','.join(group['referenceIds']) + ' in ' + ','.join(group['sceneIds'])
                          for group in audit['groups'])]
    decisions = review.get('decisions', [])
    if not isinstance(decisions, list):
        decisions = []
    rows = {row.get('groupKey'): row for row in decisions if isinstance(row, dict)}
    if len(rows) != len(decisions) or set(rows) != {group['groupKey'] for group in audit['groups']}:
        errors.append(prefix + 'decisions must match all current repeated families exactly')
    for group in audit['groups']:
        row = rows.get(group['groupKey'], {})
        label = prefix + ','.join(group['sceneIds']) + ': '
        if row.get('sceneIds') != group['sceneIds']:
            errors.append(label + 'identify every occurrence in timeline order')
        if row.get('reuseKind') not in KINDS or not str(row.get('reason', '')).strip():
            errors.append(label + 'state the actual continuity, reprise, shell or distinct adaptation purpose')
        comparisons = row.get('comparisons', [])
        if not isinstance(comparisons, list):
            comparisons = []
        if ([item.get('stableId') for item in comparisons if isinstance(item, dict)] != group['sceneIds']
                or any(not isinstance(item, dict) or any(not isinstance(item.get(key), str)
                       or not item[key].strip() for key in ['task', 'visibleState', 'reusePurpose'])
                       for item in comparisons)):
            errors.append(label + 'compare each scene task, actual visible state and shared-core purpose')
        evidence = row.get('evidence', [])
        if not isinstance(evidence, list) or not evidence:
            errors.append(label + 'actual overview/comparison evidence is required')
            continue
        for item in evidence:
            if not isinstance(item, dict) or not isinstance(item.get('path'), str):
                errors.append(label + 'comparison evidence needs its path and hash')
                continue
            path = Path(item['path'])
            if not path.is_absolute():
                path = Path(base) / path
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != item.get('sha256'):
                errors.append(label + 'comparison evidence is missing or changed')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--project-root')
    parser.add_argument('--signature', action='store_true', help='Inspect groups and context only; no approval is generated.')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    from common import load_references, project_root
    _, catalog = load_references(project_root(args.project_root))
    manifest = json.loads(args.manifest.read_text())
    result = analyze(manifest, catalog)
    errors = [] if args.signature else validate_distribution(manifest, args.manifest.parent, catalog)
    result.update({'status': 'CONTEXT_ONLY' if args.signature else ('REVIEW_REQUIRED' if errors else 'PASS'),
                   'manifestSha256': hashlib.sha256(args.manifest.read_bytes()).hexdigest(), 'errors': errors,
                   'automaticVisualApproval': False})
    payload = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(payload)
    print(payload, end='')
    raise SystemExit(bool(errors))


if __name__ == '__main__':
    main()
