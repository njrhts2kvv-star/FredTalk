"""Install the 41 declared example dependencies from verified public Release packs."""
import argparse
import hashlib
import json
import shutil
import tarfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def digest(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()

def safe_target(relative):
    path = (ROOT / 'public' / relative).resolve()
    if not path.is_relative_to((ROOT / 'public').resolve()):
        raise ValueError('Unsafe dependency path')
    return path

def installed(entry):
    path = safe_target(entry['path'])
    return path.is_file() and path.stat().st_size == entry['size'] and digest(path) == entry['sha256']

def download(entry, manifest, folder):
    target = folder / entry['name']
    if target.is_file() and target.stat().st_size == entry['size'] and digest(target) == entry['sha256']:
        return target
    url = 'https://github.com/' + manifest['repository'] + '/releases/download/' + entry.get('tag', manifest['tag']) + '/' + entry['name']
    temporary = target.with_name(target.name + '.part')
    with urllib.request.urlopen(url, timeout=120) as response, temporary.open('wb') as output:
        shutil.copyfileobj(response, output)
    if temporary.stat().st_size != entry['size'] or digest(temporary) != entry['sha256']:
        raise ValueError('Downloaded pack checksum mismatch: ' + entry['name'])
    temporary.replace(target)
    return target

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['status', 'download', 'verify'], nargs='?', default='status')
    parser.add_argument('--from-dir', type=Path, help='Use already downloaded Release files instead of the network')
    args = parser.parse_args()
    files = json.loads((ROOT / 'public-files.json').read_text())['files']
    manifest = json.loads((ROOT / 'dependency-packs.json').read_text())
    valid = [entry for entry in files if installed(entry)]
    if args.action == 'status':
        print(json.dumps({'declaredFiles': len(files), 'installedFiles': len(valid), 'dependencyBytes': sum(entry['size'] for entry in files), 'downloadPackBytes': sum(pack['size'] for pack in manifest['packs'])}, indent=2))
        return
    if args.action == 'verify':
        if len(valid) != len(files):
            raise SystemExit(f'{len(files) - len(valid)} declared files are missing or changed; run download.')
        print(f'Verified all {len(files)} declared dependencies.')
        return
    if len(valid) == len(files):
        print(f'All {len(files)} declared dependencies are already installed.')
        return
    folder = args.from_dir.resolve() if args.from_dir else ROOT / '.assets-cache'
    folder.mkdir(parents=True, exist_ok=True)
    expected = {entry['sha256']: entry for entry in files}
    for pack in manifest['packs']:
        if pack.get('parts'):
            temporary = folder / (pack['name'] + '.assembling')
            with temporary.open('wb') as output:
                for part in pack['parts']:
                    path = folder / part['name'] if args.from_dir else download(part, manifest, folder)
                    if path.stat().st_size != part['size'] or digest(path) != part['sha256']:
                        raise ValueError('Part checksum mismatch: ' + part['name'])
                    with path.open('rb') as source:
                        shutil.copyfileobj(source, output)
            path = folder / pack['name']
            temporary.replace(path)
        else:
            path = folder / pack['name'] if args.from_dir else download(pack, manifest, folder)
        if path.stat().st_size != pack['size'] or digest(path) != pack['sha256']:
            raise ValueError('Pack checksum mismatch: ' + pack['name'])
        with tarfile.open(path, 'r:gz') as archive:
            for member in archive:
                if not member.isfile() or member.name not in expected or '/' in member.name or member.size != expected[member.name]['size']:
                    raise ValueError('Unexpected archive member')
                entry = expected[member.name]
                target = safe_target(entry['path'])
                if installed(entry):
                    continue
                if target.exists():
                    raise ValueError('Refusing to overwrite a changed dependency: ' + entry['path'])
                target.parent.mkdir(parents=True, exist_ok=True)
                temporary = target.with_name(target.name + '.part')
                with archive.extractfile(member) as source, temporary.open('wb') as output:
                    shutil.copyfileobj(source, output)
                if digest(temporary) != entry['sha256']:
                    raise ValueError('Extracted object checksum mismatch')
                temporary.replace(target)
    missing = [entry['path'] for entry in files if not installed(entry)]
    if missing:
        raise SystemExit('Dependencies still missing: ' + ', '.join(missing))
    print(f'Installed and verified all {len(files)} declared dependencies.')

if __name__ == '__main__':
    main()
