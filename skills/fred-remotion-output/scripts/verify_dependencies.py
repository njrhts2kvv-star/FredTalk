#!/usr/bin/env python3
"""Verify Skill routing and preserved sources; never upload or render."""
import argparse
import json
from pathlib import Path
from common import project_root, load_references, digest, is_relative_to


def reference_integrity(root, registry, choices, inventory, scene_types):
    errors = []
    entries = choices['components'] + choices['clips']
    by_id = {item['id']: item for item in entries}
    if len(by_id) != len(entries):
        errors.append('Duplicate reference IDs')
    display_labels = [item['displayLabel'].casefold() for item in entries if item.get('displayLabel')]
    if len(display_labels) != len(set(display_labels)):
        errors.append('Duplicate reference display labels')
    for item in entries:
        types = item.get('sceneTypes')
        if not isinstance(types, list) or not types or not set(types) <= scene_types:
            errors.append('Invalid or missing sceneTypes: ' + item['id'])
        if item.get('canonicalId'):
            target = by_id.get(item['canonicalId'], {})
            target_removed = (target.get('status') == 'drop' and
                              target.get('selectionDisposition', '').startswith('user-removed'))
            if (target.get('status') != 'keep' and not target_removed) or target.get('canonicalId') or target.get('id') == item['id']:
                errors.append('Invalid canonical reference: ' + item['id'])
            if item.get('status') != 'drop':
                errors.append('Merged reference must be excluded from defaults: ' + item['id'])
    inventoried = {str((root / item['path']).absolute()) for item in inventory}
    for collection in registry.get('referenceCollections', []):
        pack = root / collection['root']
        statuses = collection.get('registrationStatuses', ['keep'])
        if (not isinstance(statuses, list) or not statuses or
                any(status not in ['keep', 'optional'] for status in statuses)):
            errors.append('Invalid registrationStatuses: ' + collection['id'])
            continue
        # Page-numbered packs register by `number`; component packs (INT/CAM) register by `id`.
        selected = {item.get('number', item['id']) for item in choices['components']
                    if item.get('collectionId') == collection['id'] and item['status'] in statuses
                    and not item.get('canonicalId')}
        pack_manifest = json.loads((pack / 'manifest.json').read_text())
        if 'pages' in pack_manifest:
            registered = [page['number'] for page in pack_manifest['pages']]
        else:
            registered = [component['id'] for component in pack_manifest.get('components', [])]
        if len(registered) != len(set(registered)) or set(registered) != selected:
            errors.append('Reference registration differs from declared representatives: ' + collection['id'])
        for path in pack.rglob('*'):
            if path.is_file() and not set(path.parts) & {'node_modules', '__pycache__'}:
                if str(path.absolute()) not in inventoried:
                    errors.append('Missing inventory entry: ' + str(path))
    return errors


def runtime_integrity(root, registry):
    """Check registered dependency versions without installing or using external fallbacks."""
    errors = []
    runtimes = registry.get('runtimes', [
        {'id': 'approved-motion-library', 'path': 'skills/_runtime/remotion/approved-motion-library',
         'packageVersions': {'remotion': '4.0.519'}},
        {'id': 'preferred-motion-v2', 'path': 'skills/_runtime/remotion/preferred-motion-v2',
         'packageVersions': {'remotion': '4.0.473'}},
    ])
    if not isinstance(runtimes, list) or not runtimes:
        return ['Runtime registry must contain at least one runtime']
    skills_root = (root / 'skills').resolve()
    for runtime in runtimes:
        if not isinstance(runtime, dict) or not all(runtime.get(k) for k in ['id', 'path', 'packageVersions']):
            errors.append('Runtime id, path and packageVersions required')
            continue
        name = runtime['id']
        rt = root / runtime['path']
        if not is_relative_to(rt.resolve(), skills_root):
            errors.append('Runtime must remain inside project skills: ' + name)
            continue
        modules = rt / 'node_modules'
        if not modules.is_dir() or modules.is_symlink():
            errors.append('Runtime modules must be local: ' + name)
            continue
        packages = runtime['packageVersions']
        if not isinstance(packages, dict):
            errors.append('Runtime packageVersions must be an object: ' + name)
            continue
        for package_name, expected in packages.items():
            package_path = modules / package_name / 'package.json'
            if not is_relative_to(package_path.resolve(), modules.resolve()):
                errors.append('Runtime package resolves outside local modules: ' + name + '/' + package_name)
                continue
            try:
                package = json.loads(package_path.read_text())
                if package.get('version') != expected:
                    errors.append('Runtime version changed: ' + name + '/' + package_name)
            except (OSError, ValueError) as error:
                errors.append('Runtime package unavailable: ' + name + '/' + package_name + ': ' + str(error))
    return errors


def bundle_integrity(root, registry):
    """A preserved entry must also name its exact registered local runtime."""
    errors = []
    runtime_versions = {str((root / rt['path']).resolve()): rt['packageVersions'].get('remotion')
                        for rt in registry.get('runtimes', [])}
    local = (root / 'skills').resolve()
    for group in registry.get('episodeBundles', []):
        name = group['id']
        entry = root / group['entryPoint']
        if not entry.is_file() or not is_relative_to(entry.resolve(), local):
            errors.append('Bundle entry must be local and available: ' + name)
        runtime = group.get('runtime')
        if not runtime or str((root / runtime).resolve()) not in runtime_versions:
            errors.append('Bundle requires a registered runtime: ' + name)
            continue
        public = group.get('publicDir')
        if public and (not (root / public).is_dir() or not is_relative_to((root / public).resolve(), local)):
            errors.append('Bundle public assets must be local: ' + name)
        # Entry-only registrations (no `root`) bind an exact composition; no package to compare.
        package = root / group['root'] / 'package.json' if group.get('root') else None
        if package and package.is_file():
            declared = json.loads(package.read_text()).get('dependencies', {}).get('remotion')
            if declared and declared != runtime_versions[str((root / runtime).resolve())]:
                errors.append('Bundle runtime version differs from package: ' + name)
    return errors


def registered_external_project_archive(registry, asset):
    """Only explicitly relocated ZIP distribution packages may live on the archive volume."""
    storage = registry.get('externalProjectArchives', {})
    volume = Path(storage.get('volumeRoot', '/nonexistent'))
    marker = volume / '.fredtalk-archive-volume-id'
    try:
        if marker.read_text().strip() != storage.get('volumeId'):
            return False
        path = Path(asset['path']).absolute()
        if path.suffix.lower() != '.zip':
            return False
        for entry in storage.get('entries', []):
            target = Path(entry['archivePath'])
            if (Path(entry['logicalPath']).absolute() == path and
                    entry['sha256'] == asset.get('sha256') and
                    target.suffix.lower() == '.zip' and
                    is_relative_to(target.resolve(), volume.resolve()) and
                    path.resolve() == target.resolve() and target.is_file()):
                return True
    except (OSError, KeyError, ValueError):
        return False
    return False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        root = project_root(args.project_root)
        registry, choices = load_references(root)
        skill = root / 'skills/fred-remotion-output'
        inventory_path = skill / registry['inventory']
        if registry.get('inventorySha256') and digest(inventory_path) != registry['inventorySha256']:
            raise ValueError('Dependency inventory changed; refresh its registry binding.')
        inventory = json.loads(inventory_path.read_text())['files']
        errors, checked = [], {}
        scene_types = {item['id'] for item in json.loads((skill / 'references/scene-routing.json').read_text())['types']}
        errors.extend(reference_integrity(root, registry, choices, inventory, scene_types))

        def check(path, sha):
            p = Path(path)
            try:
                if p.is_symlink(): errors.append('Dependency file is a symlink: ' + str(p))
                stat = p.stat()
                identity = (stat.st_dev, stat.st_ino, stat.st_size, stat.st_mtime_ns)
                if identity not in checked: checked[identity] = digest(p)
                if checked[identity] != sha: errors.append('Hash mismatch: ' + str(p))
            except OSError as error:
                errors.append(str(error))

        for entry in inventory:
            check(root / entry['path'], entry['sha256'])
        for study in registry.get('motionStudies', []):
            check(skill / study['index'], study['sha256'])
        for item in choices['components']:
            if item['status'] == 'drop': continue
            # Newer component packs store the media hash inside `media` instead of `referenceSha256`.
            check(item['media']['path'], item.get('referenceSha256') or item['media'].get('sha256'))
            for source in item.get('sourceFiles', []): check(source['path'], source['sha256'])
        for binding in registry['clipBindings']:
            for source in binding['sourceCode']: check(root / source['path'], source['sha256'])
        required = [
            'skills/fred-remake/SKILL.md', 'skills/fred-broll-generation/SKILL.md',
            'skills/remotion-best-practices/SKILL.md', 'skills/cloud-render/SKILL.md',
            'skills/cloud-render/scripts/snapshot.py', 'skills/cloud-render/scripts/render.mjs',
            'skills/cloud-render/scripts/guard.py', 'skills/cloud-render/scripts/verify.py',
            'skills/fredtalk-deck-motion-pipeline/scripts/run-stage-gate.mjs',
            'skills/fredtalk-deck-motion-pipeline/scripts/validate-stage-gate.mjs',
            'skills/fred-remake/scripts/query-preferred-motion.py',
        ]
        for relative in required:
            if not (root / relative).is_file(): errors.append('Missing tool dependency: ' + relative)
        errors.extend(runtime_integrity(root, registry))
        errors.extend(bundle_integrity(root, registry))
        receipt = registry.get('registrationReceipt')
        if receipt:
            receipt_path = root / receipt['path']
            if digest(receipt_path) != receipt['sha256']:
                errors.append('Composition registration receipt changed')
            registrations = json.loads(receipt_path.read_text())
            by_bundle = {row['id']: row for row in registrations['results']}
            for bundle in registry['episodeBundles']:
                row = by_bundle.get(bundle['id'], {})
                if (row.get('status') != 'PASS' or row.get('entryPoint') != bundle['entryPoint'] or
                        row.get('runtime') != bundle['runtime']):
                    errors.append('Bundle registration not verified: ' + bundle['id'])
            for entry in choices['components']:
                if entry['status'] != 'keep': continue
                bundle = next((b for b in registry['episodeBundles']
                               if (root / b['entryPoint']).resolve() == (root / entry.get('entryPoint', '')).resolve()), {})
                registered = {item['id'] for item in by_bundle.get(bundle.get('id'), {}).get('compositions', [])}
                if entry.get('compositionId') not in registered:
                    errors.append('Kept reference composition is not registered: ' + entry['id'])
            for binding in registry.get('currentVisualBindings', []):
                # Newer bindings name their entryPoint instead of a sourceBundle id.
                bundle_id = binding.get('sourceBundle') or next(
                    (b['id'] for b in registry['episodeBundles'] if binding.get('entryPoint') and
                     (root / b['entryPoint']).resolve() == (root / binding['entryPoint']).resolve()), None)
                registered = {item['id'] for item in by_bundle.get(bundle_id, {}).get('compositions', [])}
                if binding.get('compositionId') not in registered:
                    errors.append('Current visual composition is not registered: ' + binding['itemId'])
        current = registry.get('currentVisualDelivery')
        if current:
            delivery_path = root / current['path']
            if digest(delivery_path) != current['sha256']:
                errors.append('Current visual delivery changed; refresh exact source bindings')
            delivery = json.loads(delivery_path.read_text())
            for key, asset in delivery['media'].items():
                if key in current.get('historicalExternalKeys', []): continue
                path = Path(asset['path'])
                if (not is_relative_to(path.resolve(), (root / 'skills').resolve()) and
                        not registered_external_project_archive(registry, asset)):
                    errors.append('Current visual asset must be project-local: ' + str(path))
                check(path, asset['sha256'])
            for binding in registry.get('currentVisualBindings', []):
                for source in binding['sourceCode']:
                    check(root / source['path'], source['sha256'])
        # Check all actual relative imports in the preserved code snapshots.
        import re
        for bundle in registry['episodeBundles']:
            if not bundle.get('root'): continue
            source_root = root / bundle['root']
            for file in (source_root / 'src').rglob('*'):
                if file.suffix not in ['.tsx', '.ts', '.js', '.jsx']: continue
                for spec in re.findall(r'(?:from\s+|import\s*)[\'\"](\.[^\'\"]+)[\'\"]', file.read_text()):
                    base = file.parent / spec
                    options = [base] + [Path(str(base) + s) for s in ['.tsx', '.ts', '.js', '.jsx', '.json']] + [base / 'index.ts', base / 'index.tsx']
                    if not any(p.is_file() for p in options): errors.append('Unresolved local import: ' + str(file) + ' -> ' + spec)
        result = {'status': 'FAIL' if errors else 'PASS', 'selectionRevision': registry['selectionRevision'],
                  'counts': choices['counts'], 'episodeSourceProjects': len(registry['episodeBundles']),
                  'episodeSourceAndAssetPaths': len(inventory), 'uniqueFileIdentitiesChecked': len(checked),
                  'scope': 'Source and dependency integrity; no rendered-video visual approval', 'errors': errors}
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(result, ensure_ascii=False, indent=2))
        raise SystemExit(bool(errors))
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()
