#!/usr/bin/env python3
"""Preserve explicitly selected episode source projects as immutable dependencies."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil


def digest(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root', type=Path, required=True)
    args = parser.parse_args()
    root = args.project_root.absolute()
    skill = root / 'skills/fred-remotion-output'
    source_catalog = root / 'skills/fred-remake/assets/preferred-motion/catalog.json'
    catalog = json.loads(source_catalog.read_text())
    live = json.loads(Path(catalog['selectionFile']).read_text())
    if live['revision'] != catalog['selectionRevision']:
        raise ValueError('Selection changed; curate current selections before preserving sources')
    groups = json.loads((source_catalog.parent / 'episode-dependencies.json').read_text())['projects']
    destination = skill / 'assets/episode-code'
    destination.mkdir(parents=True, exist_ok=False)
    pool = destination / 'blobs'
    pool.mkdir()
    inventory, bundles, source_map = [], [], {}
    checked = set()
    for group in groups:
        origin = Path(os.path.normpath(group['sourceRoot']))
        episode = next(part.split('_')[0] for part in origin.parts if part[:2].isdigit() and part not in ['00_每期项目', '03_制作过程'])
        bundle_id = 'ep' + episode + '-' + origin.name
        bundle = destination / bundle_id
        for entry in group['sourceFiles'] + group['publicAssets']:
            src = Path(os.path.normpath(entry['path']))
            rel = src.relative_to(origin)
            target = bundle / rel
            expected = entry['sha256']
            blob = pool / expected
            # Verify each original file against the earlier selection inventory;
            # identical source hashes share one local inode only after verification.
            if str(src) not in checked:
                if digest(src) != expected:
                    raise ValueError('Source changed: ' + str(src))
                checked.add(str(src))
            if not blob.exists():
                shutil.copy2(src, blob)
                if digest(blob) != expected or digest(src) != expected:
                    raise ValueError('Source changed during preservation: ' + str(src))
            target.parent.mkdir(parents=True, exist_ok=True)
            os.link(blob, target)
            relative_target = str(target.relative_to(root))
            inventory.append({'path': relative_target, 'sha256': expected, 'source': str(src), 'bytes': target.stat().st_size})
            source_map[str(src)] = relative_target
        bundles.append({'id': bundle_id, 'originalRoot': str(origin), 'root': str(bundle.relative_to(root)),
                        'entryPoint': str((bundle / 'src/index.tsx').relative_to(root)),
                        'publicDir': str((bundle / 'public').relative_to(root)),
                        'runtime': 'skills/_runtime/remotion/approved-motion-library',
                        'status': 'frozen-source-project; only chosen video ranges are preferred',
                        'scope': 'Complete relative-import and public dependency set; includes old example content and unselected scene branches.'})
        print('Preserved ' + bundle_id, flush=True)
    bindings = []
    for clip in catalog['clips']:
        bound = []
        for entry in clip['sourceCode']:
            original = os.path.normpath(entry['path'])
            if original not in source_map:
                raise ValueError('Selected symbol missing from preserved dependency closure: ' + original)
            bound.append({**entry, 'originalPath': entry['path'], 'path': source_map[original]})
        bindings.append({'referenceId': clip['id'], 'sourceCode': bound, 'sourceMappingStatus': clip['sourceMappingStatus'],
                         'hybridBoundary': clip.get('hybridBoundary'), 'referenceScope': clip['referenceScope']})
    (skill / 'assets/episode-code-inventory.json').write_text(json.dumps({'files': inventory}, ensure_ascii=False, indent=2) + '\n')
    registry = {'schemaVersion': 1, 'selectionRevision': catalog['selectionRevision'],
                'selectionCatalog': str(source_catalog.relative_to(root)), 'selectionCatalogSha256': digest(source_catalog),
                'counts': catalog['counts'], 'episodeBundles': bundles, 'clipBindings': bindings,
                'originalComponents': 'skills/fredtalk-deck-motion-pipeline/assets/style-library',
                'selectedV2': 'skills/fred-remake/assets/preferred-motion/sources/previews-v2',
                'selectedV2Runtime': 'skills/_runtime/remotion/preferred-motion-v2',
                'primitives': 'skills/fred-remake/assets/content-motion',
                'cloudSkill': 'skills/cloud-render',
                'inventory': 'assets/episode-code-inventory.json',
                'immutable': True, 'uniqueStoredBlobs': len(list(pool.iterdir())),
                'selectionMeaning': 'All approved choices are optional tools for matching narration; selection does not prescribe one template.'}
    (skill / 'assets/dependency-registry.json').write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'files': len(inventory), 'bundles': len(bundles), 'uniqueBlobs': registry['uniqueStoredBlobs']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
