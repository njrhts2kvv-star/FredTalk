"""Resolve public source and verified member installations without pretending files exist."""
import json
from pathlib import Path
import sys
from common import digest


def load_portable(root):
    root = Path(root)
    sys.path.insert(0, str(root / 'scripts'))
    from member_access import read_token, requires_membership
    path = root / 'library/catalog.json'
    data = json.loads(path.read_text())
    routes = json.loads((root / 'library/routes.json').read_text())
    media = json.loads((root / 'library/media-manifest.json').read_text())['files']
    package_path = root / 'library/member-packages.json'
    packages = {package['collectionId']: package for package in json.loads(package_path.read_text())['collections']} if package_path.exists() else {}
    try:
        token_present = bool(read_token(root))
    except (ValueError, OSError):
        token_present = False
    revision = digest(path)
    entries = []

    def routed(record):
        relative = record.get('installPath') or routes.get(record.get('url'))
        if not relative:
            return None
        source = root / relative
        if Path(relative).is_absolute() or not source.resolve().is_relative_to(root.resolve()):
            raise ValueError('Reference route escapes the portable repository.')
        asset = media.get(relative, {})
        expected = record.get('sha256') or asset.get('sha256')
        actual = digest(source) if source.is_file() and not source.is_symlink() else None
        remote = asset.get('status') == 'remote-preview' and record['url'].startswith('https://www.fred-fu.com/visual-library-app/objects/')
        return {'path': relative, 'sha256': expected or actual, 'url': record['url'],
                'available': actual is not None and (not expected or actual == expected),
                'remoteAvailable': remote,
                'status': 'ready' if actual is not None and (not expected or actual == expected) else ('invalid' if actual else ('remote-preview' if remote else 'missing')),
                **({'symbol': record['symbol']} if record.get('symbol') else {})}

    package_ready = {}
    for collection, package in packages.items():
        install = root / package['installRoot']
        package_ready[collection] = all(
            (target := install / name).resolve().is_relative_to(install.resolve()) and
            target.is_file() and not target.is_symlink() and target.stat().st_size == expected['size'] and
            digest(target) == expected['sha256'] for name, expected in package['files'].items())

    for item in data['items']:
        row = dict(item, id=item.get('referenceId') or item['id'], displayLabel=item['label'],
                   recordType='clip' if item.get('kind') == 'clips' else 'component',
                   useWhen=item.get('description', ''), summaryTitle=item.get('title'),
                   status=item.get('selectionStatus', item.get('status', 'keep')))
        row['aliases'] = list(dict.fromkeys([item['id'], item['label'], *item.get('aliases', [])]))
        if item.get('archivedFromSkill') or item.get('defaultReuse') is False:
            row['libraryDisposition'] = 'archived'
        if item.get('mergedInto'):
            row['libraryDisposition'] = 'merged'
        row['sourceCode'] = [record for source in item.get('sources', []) if (record := routed(source))]
        row['sourceFiles'] = row['sourceCode']
        is_member = item.get('collectionId') in packages
        source_ready = bool(row['sourceCode']) and all(record['available'] for record in row['sourceCode'])
        if is_member:
            source_ready = source_ready and package_ready[item['collectionId']]
        if row['sourceCode'] or is_member:
            auth_required = is_member and requires_membership({'access': 'members', 'earlyAccess': item.get('earlyAccess', {})})
            invalid = any(record['status'] == 'invalid' for record in row['sourceCode'])
            status = 'ready' if source_ready else ('invalid' if invalid else ('needs-auth' if auth_required and not token_present else 'missing'))
            row['sourceAvailability'] = {'available': source_ready, 'status': status,
                'authRequired': auth_required, 'installationRequired': is_member and not package_ready[item['collectionId']],
                'reason': ('Verified source is installed.' if source_ready else
                           'Source is not installed; log in to the website, download the official source ZIP and import it locally. Automatic token downloads are optional.' if is_member else
                           'Public source is missing or changed; restore the repository source.'),
                'importCommand': 'python3 scripts/assets.py import --zip <official-source-ZIP-path>' if is_member else None,
                'downloadCommand': ('python3 scripts/assets.py download --members --collection ' + item['collectionId']) if is_member else None,
                'installCommand': ('python3 scripts/assets.py materialize --members --collection ' + item['collectionId']) if is_member else None}
        if is_member:
            package = packages[item['collectionId']]
            row['sourcePackage'] = {key: package[key] for key in ['collectionId', 'sha256', 'size', 'installRoot', 'entryPoint', 'publicDir'] if key in package}
            row['projectRoot'] = package['installRoot'] + '/' + item['collectionId']
            row['entryPoint'] = package.get('entryPoint') if package_ready[item['collectionId']] else None
            row['publicDir'] = package.get('publicDir') if package_ready[item['collectionId']] else None
        row['media'] = {}
        row['coreFrames'] = []
        for preview in item.get('previews', []):
            if preview.get('videoUrl') and (record := routed({'url': preview['videoUrl'], 'sha256': preview.get('sha256')})):
                row['media'] = record
            for url in [preview.get('posterUrl'), *[frame.get('url') for frame in preview.get('keyframes', [])]]:
                if url and (record := routed({'url': url})):
                    row['coreFrames'].append(record)
        implementation = item.get('implementation', {})
        row['nativeTiming'] = {key: implementation[key] for key in ['fps', 'durationInFrames', 'width', 'height'] if key in implementation}
        row['editableParameters'] = item.get('reusability', {}).get('parameters', [])
        row['knownLimitations'] = item.get('reusability', {}).get('limitations', [])
        entries.append(row)
    history = json.loads((root / 'library/history.json').read_text()) if (root / 'library/history.json').exists() else []
    labels = {entry['displayLabel']: entry for entry in entries}
    for old in history:
        canonical = labels.get(old.get('canonicalLabel'))
        if canonical:
            canonical['aliases'] = list(dict.fromkeys([*canonical['aliases'], *[value for value in [old.get('id'), old.get('label')] if value]]))
    catalog = {'catalogRevision': revision, 'selectionRevision': revision,
               'components': [entry for entry in entries if entry['recordType'] == 'component'],
               'clips': [entry for entry in entries if entry['recordType'] == 'clip']}
    registry = {'distribution': 'portable', 'selectionRevision': revision,
                'selectionMeaning': 'Public catalog plus verified isolated member source; no author-machine state.',
                'clipBindings': [], 'episodeBundles': [], 'currentVisualBindings': []}
    return registry, catalog
