"""Install public GitHub packs or explicitly requested website member assets."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tarfile
from functools import lru_cache
from urllib.error import HTTPError, URLError
from urllib.request import Request, build_opener
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from member_access import (MEMBER_ORIGIN, TrustedAssetRedirect, read_token,
                           requires_membership, trusted_asset_url)


def digest(path):
    with path.open('rb') as handle:
        return hashlib.file_digest(handle, 'sha256').hexdigest()


def records():
    return json.loads((ROOT / 'library/media-manifest.json').read_text())['files']


@lru_cache(maxsize=4)
def bundled_fonts(root):
    registry = root / 'skills/fred-remotion-output/references/typography-registry.json'
    if not registry.is_file():
        return {}
    return {face['sha256']: root / face['path'] for face in json.loads(registry.read_text())['faces']
            if face['path'].startswith('library/fonts/')}


def available(record):
    for path in (bundled_fonts(ROOT).get(record['sha256']), ROOT / '.artifacts/objects' / record['sha256'],
                 ROOT / 'library/demo' / record['sha256']):
        if (path is not None and not path.is_symlink() and path.is_file() and
                path.resolve().is_relative_to(ROOT.resolve())):
            return path
    return None


def select_records(files, members=False, collection=None):
    return {name: record for name, record in files.items()
            if record.get('status') == 'reviewed' and
            (record.get('access') == 'members') == members and
            (not collection or record.get('collectionId') == collection or collection in name.split('/'))}


def read_member_token(token_file=None):
    return read_token(ROOT, token_file)


def object_directory():
    artifacts = ROOT / '.artifacts'
    objects = artifacts / 'objects'
    if artifacts.is_symlink() or objects.is_symlink():
        raise ValueError('Refusing symlink object directory.')
    objects.mkdir(parents=True, exist_ok=True)
    if not objects.resolve().is_relative_to(ROOT.resolve()):
        raise ValueError('Object directory escaped the repository.')
    return objects


def extract(pack, expected):
    objects = object_directory()
    seen = set()
    with tarfile.open(pack, 'r:gz') as archive:
        for member in archive:
            name = member.name
            if (not member.isfile() or name not in expected or '/' in name or name in seen or
                    not re.fullmatch(r'[0-9a-f]{64}', name)):
                raise ValueError('Unexpected archive member')
            seen.add(name)
            if member.size != expected[name]:
                raise ValueError('Unexpected object size')
            target = objects / name
            temporary = objects / (name + '.part')
            if target.is_symlink() or temporary.is_symlink():
                raise ValueError('Refusing symlink object target')
            with archive.extractfile(member) as source, temporary.open('wb') as output:
                shutil.copyfileobj(source, output)
            if digest(temporary) != name:
                temporary.unlink()
                raise ValueError('Object checksum mismatch')
            temporary.replace(target)


def assemble_pack(pack, folder):
    target = folder / pack['name']
    for part in pack['parts']:
        source = folder / part['name']
        if source.stat().st_size != part['size'] or digest(source) != part['sha256']:
            raise ValueError('Part checksum mismatch: ' + part['name'])
    temporary = folder / (pack['name'] + '.assembling')
    with temporary.open('wb') as output:
        for part in pack['parts']:
            with (folder / part['name']).open('rb') as source:
                shutil.copyfileobj(source, output)
    if digest(temporary) != pack['sha256']:
        temporary.unlink()
        raise ValueError('Assembled pack checksum mismatch')
    temporary.replace(target)
    for part in pack['parts']:
        (folder / part['name']).unlink()
    return target


def validate_release_manifest(release, manifest_bytes):
    if release.get('manifestSha256') != hashlib.sha256(manifest_bytes).hexdigest():
        raise ValueError('Release manifest does not match current dependencies; rebuild media packs before downloading.')


def member_open(request):
    return build_opener(TrustedAssetRedirect()).open(request, timeout=45)


def download_member_object(record, token):
    url = trusted_asset_url(record['url'])
    if url != MEMBER_ORIGIN + '/api/visual-library/assets/' + record['sha256'] + '.' + record['kind']:
        raise ValueError('Member asset URL does not match its declared hash and type.')
    if requires_membership(record) and not token:
        raise ValueError('needs-auth: create a read-only Agent token on the FredTalk website.')
    destination = object_directory() / record['sha256']
    temporary = destination.with_name(destination.name + '.part')
    if destination.is_symlink() or temporary.is_symlink():
        raise ValueError('Refusing symlink object target.')
    if destination.is_file() and destination.stat().st_size == record['size'] and digest(destination) == record['sha256']:
        return destination
    headers = {'Accept': 'application/octet-stream'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    try:
        with member_open(Request(url, headers=headers)) as response, temporary.open('wb') as output:
            received = 0
            while True:
                block = response.read(1024 * 1024)
                if not block:
                    break
                received += len(block)
                if received > record['size']:
                    raise ValueError('Member asset exceeds its declared size.')
                output.write(block)
        if temporary.stat().st_size != record['size'] or digest(temporary) != record['sha256']:
            raise ValueError('Member asset size or SHA-256 mismatch.')
        temporary.replace(destination)
    except HTTPError as error:
        temporary.unlink(missing_ok=True)
        if error.code in (401, 403):
            raise ValueError('needs-auth: website rejected the token or current membership.') from None
        raise ValueError('Member asset HTTP download failed (status ' + str(error.code) + ').') from None
    except (URLError, OSError):
        temporary.unlink(missing_ok=True)
        raise ValueError('Member asset download failed; retry without sharing credentials or logs.') from None
    except ValueError:
        temporary.unlink(missing_ok=True)
        raise
    return destination


def safe_zip_name(name):
    path = PurePosixPath(name)
    if (not name or '\\' in name or ':' in name or '\x00' in name or path.is_absolute() or
            any(part in ('', '.', '..', '.git', 'node_modules') or part == '.env' or part.startswith('.env.')
                for part in path.parts)):
        raise ValueError('Unsafe source ZIP path.')
    if str(path) != name.rstrip('/'):
        raise ValueError('Non-canonical source ZIP path.')
    return path


def verify_package_install(package):
    root = ROOT / package['installRoot']
    if not root.is_dir() or root.is_symlink():
        return False
    for name, expected in package['files'].items():
        path = root / safe_zip_name(name)
        if (not path.resolve().is_relative_to(root.resolve()) or path.is_symlink() or not path.is_file() or
                path.stat().st_size != expected['size'] or digest(path) != expected['sha256']):
            return False
    return True


def install_member_package(archive_path, package):
    if archive_path.stat().st_size != package['size'] or digest(archive_path) != package['sha256']:
        raise ValueError('Source package SHA-256 or size mismatch.')
    collection = package['collectionId']
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', collection):
        raise ValueError('Unsafe member collection ID.')
    relative_root = '.artifacts/member-components/' + collection
    if package['installRoot'] != relative_root:
        raise ValueError('Member source must install into its isolated ignored directory.')
    target = ROOT / relative_root
    artifacts = ROOT / '.artifacts'
    for path in [artifacts, artifacts / 'member-components', target]:
        if path.is_symlink():
            raise ValueError('Refusing symlink source installation path.')
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.parent.resolve().is_relative_to(ROOT.resolve()):
        raise ValueError('Source installation escaped the repository.')
    if target.exists():
        if verify_package_install(package):
            return target
        raise ValueError('Refusing to overwrite changed installed member source; adapt in a separate working copy.')
    expected = package['files']
    for name in expected:
        safe_zip_name(name)
    total = sum(record['size'] for record in expected.values())
    if len(expected) > 10000 or total > 512 * 1024 * 1024:
        raise ValueError('Source package expansion exceeds the supported limits.')
    temporary = target.with_name('.' + collection + '.install')
    if temporary.exists() or temporary.is_symlink():
        raise ValueError('Source installation staging directory already exists; inspect it before retrying.')
    with zipfile.ZipFile(archive_path) as archive:
        seen = set()
        for info in archive.infolist():
            safe_zip_name(info.filename)
            kind = stat.S_IFMT(info.external_attr >> 16)
            if info.flag_bits & 1 or kind not in (0, stat.S_IFREG, stat.S_IFDIR):
                raise ValueError('Encrypted files, links and device entries are not supported in source ZIPs.')
            if info.is_dir():
                if not any(name.startswith(info.filename) for name in expected):
                    raise ValueError('Unexpected source ZIP directory.')
                continue
            if info.filename in seen or info.filename not in expected:
                raise ValueError('Duplicate or unlisted source ZIP member.')
            seen.add(info.filename)
            record = expected[info.filename]
            if (info.file_size != record['size'] or info.file_size > 128 * 1024 * 1024 or
                    info.file_size > max(info.compress_size, 1) * 1000):
                raise ValueError('Source ZIP member size or compression ratio exceeds the declared limits.')
        if seen != set(expected):
            raise ValueError('Source ZIP is missing declared files.')
        temporary.mkdir()
        try:
            for name, record in expected.items():
                destination = temporary / safe_zip_name(name)
                destination.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(name) as source, destination.open('wb') as output:
                    remaining = record['size']
                    while remaining:
                        block = source.read(min(1024 * 1024, remaining))
                        if not block:
                            raise ValueError('Truncated source ZIP member.')
                        output.write(block)
                        remaining -= len(block)
                    if source.read(1):
                        raise ValueError('Source ZIP member exceeds the declared size.')
                if digest(destination) != record['sha256']:
                    raise ValueError('Source ZIP member SHA-256 mismatch.')
            temporary.replace(target)
        except Exception:
            shutil.rmtree(temporary)
            raise
    return target


def packages():
    path = ROOT / 'library/member-packages.json'
    return json.loads(path.read_text())['collections'] if path.exists() else []


def import_zip_files(inputs):
    """Identify complete official local ZIPs and reuse the verified isolated installer."""
    archives = []
    for value in inputs:
        path = Path(value)
        if path.is_symlink():
            raise ValueError('Choose an original regular ZIP file or directory, not a symlink.')
        if path.is_dir():
            archives.extend(sorted(child for child in path.iterdir() if child.is_file() and child.suffix.lower() == '.zip'))
        elif path.is_file():
            archives.append(path)
        else:
            raise ValueError('ZIP input does not exist or is not a regular file or directory.')
    if not archives:
        raise ValueError('No ZIP files found; choose the downloaded official source ZIP.')
    known = packages()
    selected = {}
    # Validate every input before installing any package; filenames are not identities.
    for archive in archives:
        if archive.is_symlink():
            raise ValueError('Choose the original regular source ZIP, not a symlink.')
        size = archive.stat().st_size
        matches = [package for package in known if package['size'] == size]
        fingerprint = digest(archive) if matches else None
        matches = [package for package in matches if package['sha256'] == fingerprint]
        if len(matches) != 1:
            raise ValueError('ZIP does not match one complete official source package by size and SHA-256; download the original ZIP from the website.')
        package = matches[0]
        previous = selected.get(package['collectionId'])
        if previous and previous[1]['sha256'] != package['sha256']:
            raise ValueError('Choose one official source ZIP version per collection.')
        selected.setdefault(package['collectionId'], (archive, package))
    # Preserve every existing installation before starting a multi-package handoff.
    for archive, package in selected.values():
        collection = package['collectionId']
        if (not re.fullmatch(r'[a-z0-9][a-z0-9-]*', collection) or
                package['installRoot'] != '.artifacts/member-components/' + collection):
            raise ValueError('Official package requires its isolated ignored installation directory.')
        target = ROOT / package['installRoot']
        if (target.exists() or target.is_symlink()) and not verify_package_install(package):
            raise ValueError('Refusing to overwrite changed installed member source; adapt in a separate working copy.')
    rows = []
    for archive, package in selected.values():
        already_installed = verify_package_install(package)
        target = install_member_package(archive, package)
        if not verify_package_install(package):
            raise ValueError('Imported source installation did not pass the declared file checks.')
        rows.append({'collectionId': package['collectionId'], 'zipSha256': package['sha256'],
                     'zipSize': package['size'], 'installRoot': str(target.relative_to(ROOT)),
                     'verifiedFiles': len(package['files']), 'alreadyInstalled': already_installed})
    return rows


def download_public(files):
    release = json.loads((ROOT / 'library/releases.json').read_text())
    validate_release_manifest(release, (ROOT / 'library/media-manifest.json').read_bytes())
    unique = {record['sha256']: record for record in files.values()}
    folder = ROOT / '.artifacts/downloads'
    folder.mkdir(parents=True, exist_ok=True)
    for pack in release['packs']:
        target = folder / pack['name']
        if not target.exists():
            for entry in pack.get('parts', [pack]):
                if not (folder / entry['name']).exists():
                    subprocess.run(['gh', 'release', 'download', pack.get('tag', release['tag']), '--repo',
                                    release['repository'], '--pattern', entry['name'], '--dir', str(folder)], check=True)
            if pack.get('parts'):
                assemble_pack(pack, folder)
        if digest(target) != pack['sha256']:
            raise ValueError('Pack checksum mismatch: ' + pack['name'])
        extract(target, {sha: record['size'] for sha, record in unique.items()})
        target.unlink()
    print('Downloaded and verified public GitHub assets.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['status', 'download', 'verify', 'materialize', 'import'])
    parser.add_argument('--zip', type=Path, action='append', default=[], help='Import one complete official local ZIP or a directory of ZIPs; repeat for multiple inputs')
    parser.add_argument('--project', help='Materialize one public repository-relative project directory')
    parser.add_argument('--members', action='store_true', help='Use only website member assets; default is public GitHub assets')
    parser.add_argument('--collection', help='Limit member actions to one collection')
    parser.add_argument('--token-file', type=Path, help='Read a mode-0600 token file outside the repository; never a token argument')
    args = parser.parse_args()
    if args.action == 'import':
        if not args.zip:
            parser.error('import requires --zip FILE or --zip DIRECTORY.')
        if args.members or args.project or args.collection or args.token_file:
            parser.error('Local ZIP import needs only --zip; membership and download options are not used.')
        rows = import_zip_files(args.zip)
        print(json.dumps({'action': 'import', 'offline': True, 'tokenRequired': False,
                          'packages': rows, 'next': 'Query the imported component with scripts/catalog.py --id <ID> --full.'}, indent=2))
        return
    if args.zip:
        parser.error('--zip is only used with the import action.')
    files = select_records(records(), args.members, args.collection)
    unique = {record['sha256']: record for record in files.values()}
    selected_packages = [package for package in packages() if not args.collection or package['collectionId'] == args.collection]
    if args.members and not files:
        parser.error('No member assets matched the requested collection.')
    if args.action == 'status':
        try:
            token_present = bool(read_member_token(args.token_file)) if args.members else False
        except ValueError:
            token_present = False
        print(json.dumps({'scope': 'members' if args.members else 'public', 'reviewedObjects': len(unique),
                          'downloadBytes': sum(record['size'] for record in unique.values() if record.get('delivery') != 'member-package'),
                          'installedObjects': sum(available(record) is not None for record in unique.values()),
                          'sourcePackagesInstalled': sum(verify_package_install(package) for package in selected_packages) if args.members else None,
                          'authorization': ('present-unverified' if token_present else 'needs-auth') if args.members and any(requires_membership(record) for record in unique.values()) else 'not-required'}, indent=2))
        return
    if args.action == 'download':
        if not args.members:
            # Every declared legacy pack may contain objects outside a --collection filter.
            download_public(select_records(records()))
        else:
            token = read_member_token(args.token_file) if any(requires_membership(record) for record in unique.values()) else None
            for record in unique.values():
                if record.get('delivery') == 'website':
                    download_member_object(record, token)
            print('Downloaded and verified website member assets. Run materialize --members to install source packages.')
        return
    if args.members and args.action == 'materialize':
        for package in selected_packages:
            path = available(package)
            if not path:
                raise ValueError('Member source ZIP missing; run download --members for this collection first.')
            install_member_package(path, package)
        print('Installed verified member source in .artifacts/member-components/. Git remains unchanged.')
        return
    missing = [sha for sha, record in unique.items() if record.get('delivery') != 'member-package' and
               (not available(record) or digest(available(record)) != sha)]
    if missing:
        raise ValueError(str(len(missing)) + ' objects missing or invalid; run download for the same scope first.')
    if args.action == 'verify':
        if args.members and not all(verify_package_install(package) for package in selected_packages):
            raise ValueError('Member source installation missing or changed; run materialize --members.')
        print('Verified ' + str(len(unique)) + ' objects and requested source installations.')
        return
    project = None
    if args.project:
        project = (ROOT / args.project).resolve()
        if not project.is_relative_to(ROOT / 'components/projects'):
            raise ValueError('Choose a public path under components/projects/.')
    count = 0
    for name, record in files.items():
        if not name.startswith('components/'):
            continue
        target = (ROOT / name).resolve()
        if not target.is_relative_to(ROOT / 'components'):
            raise ValueError('Unsafe public asset target.')
        if project and not target.is_relative_to(project):
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and digest(target) != record['sha256']:
            raise ValueError('Refusing to overwrite changed public asset: ' + name)
        if not target.exists():
            shutil.copyfile(available(record), target)
        count += 1
    print('Materialized ' + str(count) + ' public asset paths. Adapt in a separate working copy.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, zipfile.BadZipFile) as error:
        raise SystemExit(str(error)) from None
