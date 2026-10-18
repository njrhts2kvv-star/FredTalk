"""Member downloads, source installation and unavailable candidates stay honest."""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'skills/fred-remotion-output/scripts'))
from component_selection import shortlist, validate_component_plan


def assets_module():
    spec = importlib.util.spec_from_file_location('member_assets_test', ROOT / 'scripts/assets.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class MemberAssetsTests(unittest.TestCase):
    def package(self, root, entries=None):
        entries = entries or {'batch/src/index.tsx': b'export function Scene() { return null; }'}
        archive = root / 'source.zip'
        with zipfile.ZipFile(archive, 'w') as handle:
            for name, body in entries.items():
                handle.writestr(name, body)
        package = {'collectionId': 'batch', 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
                   'size': archive.stat().st_size, 'installRoot': '.artifacts/member-components/batch',
                   'files': {name: {'sha256': hashlib.sha256(body).hexdigest(), 'size': len(body)}
                             for name, body in entries.items()}}
        return archive, package

    def test_member_scope_does_not_change_public_downloads(self):
        module = assets_module()
        public = {'status': 'reviewed', 'sha256': '1' * 64, 'size': 1}
        member = {'status': 'reviewed', 'sha256': '2' * 64, 'size': 1, 'access': 'members',
                  'earlyAccess': {'publicAt': '2099-01-01T00:00:00Z'}}
        self.assertEqual(module.select_records({'a': public, 'b': member}, members=False), {'a': public})
        self.assertEqual(module.select_records({'a': public, 'b': member}, members=True), {'b': member})

    def test_trusted_host_and_asset_shape_are_required(self):
        module = assets_module()
        for url in ['https://evil.example/api/visual-library/assets/' + 'a' * 64 + '.zip',
                    'https://www.fred-fu.com@evil.example/api/visual-library/assets/' + 'a' * 64 + '.zip',
                    'http://www.fred-fu.com/api/visual-library/assets/' + 'a' * 64 + '.zip',
                    'https://www.fred-fu.com/api/visual-library/assets/../token',
                    'https://www.fred-fu.com/api/visual-library/assets/' + 'a' * 64 + '.zip?token=secret']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                module.trusted_asset_url(url)
        trusted = 'https://www.fred-fu.com/api/visual-library/assets/' + 'a' * 64 + '.zip'
        self.assertEqual(module.trusted_asset_url(trusted), trusted)

    def test_cross_host_redirect_never_receives_bearer(self):
        module = assets_module()
        from urllib.request import Request
        handler = module.TrustedAssetRedirect()
        request = Request('https://www.fred-fu.com/api/visual-library/assets/' + 'a' * 64 + '.zip',
                          headers={'Authorization': 'Bearer ftvl_test_secret'})
        with self.assertRaises(ValueError):
            handler.redirect_request(request, None, 302, 'Moved', {}, 'https://evil.example/file')

    def test_environment_token_is_never_in_failure_message(self):
        module = assets_module()
        from urllib.error import HTTPError
        body = b'file'; expected = hashlib.sha256(body).hexdigest()
        record = {'sha256': expected, 'size': len(body), 'kind': 'zip', 'access': 'members',
                  'url': 'https://www.fred-fu.com/api/visual-library/assets/' + expected + '.zip'}
        token = 'ftvl_test_secret'
        with tempfile.TemporaryDirectory() as folder, patch.object(module, 'ROOT', Path(folder)):
            with patch.object(module, 'member_open', side_effect=HTTPError(record['url'], 401, token, {}, None)):
                with self.assertRaises(ValueError) as error:
                    module.download_member_object(record, token)
        self.assertIn('needs-auth', str(error.exception))
        self.assertNotIn(token, str(error.exception))

    def test_private_token_file_permissions_and_repository_boundary(self):
        module = assets_module()
        with tempfile.TemporaryDirectory() as folder:
            base = Path(folder); repo = base / 'repo'; repo.mkdir(); token_file = base / 'member-token'
            token_file.write_text('ftvl_test_secret'); token_file.chmod(0o644)
            with patch.dict('os.environ', {}, clear=True), patch.object(module, 'ROOT', repo):
                with self.assertRaises(ValueError): module.read_member_token(token_file)
                token_file.chmod(0o600)
                self.assertEqual(module.read_member_token(token_file), 'ftvl_test_secret')
                in_repo = repo / 'token'; in_repo.write_text('ftvl_test_secret'); in_repo.chmod(0o600)
                with self.assertRaises(ValueError): module.read_member_token(in_repo)

    def test_zip_installs_real_verified_source_in_ignored_isolation(self):
        module = assets_module()
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); archive, package = self.package(root)
            with patch.object(module, 'ROOT', root):
                result = module.install_member_package(archive, package)
            self.assertEqual(result, root / '.artifacts/member-components/batch')
            self.assertTrue((result / 'batch/src/index.tsx').is_file())
            self.assertFalse((root / 'components/projects/batch').exists())

    def test_zip_rejects_traversal_symlinks_and_unlisted_content(self):
        module = assets_module()
        for kind in ['traversal', 'symlink', 'unlisted', 'secret']:
            with self.subTest(kind=kind), tempfile.TemporaryDirectory() as folder:
                root = Path(folder); archive, package = self.package(root)
                with zipfile.ZipFile(archive, 'a') as handle:
                    name = '../escape' if kind == 'traversal' else ('batch/.env' if kind == 'secret' else 'batch/extra')
                    if kind == 'symlink':
                        info = zipfile.ZipInfo(name); info.create_system = 3; info.external_attr = (0o120777 << 16)
                        handle.writestr(info, b'../../escape')
                    else: handle.writestr(name, b'extra')
                package['sha256'] = hashlib.sha256(archive.read_bytes()).hexdigest(); package['size'] = archive.stat().st_size
                with patch.object(module, 'ROOT', root), self.assertRaises(ValueError):
                    module.install_member_package(archive, package)
                self.assertFalse((root / '.artifacts/member-components/batch').exists())

    def test_zip_rejects_source_hash_mismatch_without_partial_install(self):
        module = assets_module()
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); archive, package = self.package(root)
            package['files']['batch/src/index.tsx']['sha256'] = '0' * 64
            with patch.object(module, 'ROOT', root), self.assertRaises(ValueError):
                module.install_member_package(archive, package)
            self.assertFalse((root / '.artifacts/member-components/batch').exists())

    def test_member_package_resolution_requires_actual_verified_installation(self):
        from portable_catalog import load_portable
        import member_access
        module = assets_module()
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); archive, package = self.package(root)
            library = root / 'library'; library.mkdir()
            source_path = package['installRoot'] + '/batch/src/index.tsx'
            source_hash = package['files']['batch/src/index.tsx']['sha256']
            item = {'id': 'component:member', 'referenceId': 'member', 'label': 'M01',
                    'title': '数据', 'collectionId': 'batch', 'kind': 'components',
                    'earlyAccess': {'enabled': True, 'publicAt': '2099-01-01T00:00:00Z'},
                    'sources': [{'url': '/api/visual-library/assets/' + source_hash + '.txt',
                                 'installPath': source_path, 'sha256': source_hash}], 'previews': []}
            for name, data in [('catalog.json', {'items': [item]}), ('routes.json', {}),
                               ('media-manifest.json', {'files': {}}),
                               ('member-packages.json', {'collections': [package]})]:
                (library / name).write_text(json.dumps(data))
            with patch.dict('os.environ', {}, clear=True), patch.object(member_access, 'DEFAULT_TOKEN_FILE', root / 'no-token'):
                _, catalog = load_portable(root)
                self.assertEqual(catalog['components'][0]['sourceAvailability']['status'], 'needs-auth')
                with patch.dict('os.environ', {'FREDTALK_MEMBER_TOKEN': 'ftvl_test_secret'}):
                    _, catalog = load_portable(root)
                    self.assertEqual(catalog['components'][0]['sourceAvailability']['status'], 'missing')
                with patch.object(module, 'ROOT', root): module.install_member_package(archive, package)
                _, catalog = load_portable(root)
                self.assertEqual(catalog['components'][0]['sourceAvailability']['status'], 'ready')
                (root / source_path).write_bytes(b'changed implementation')
                _, catalog = load_portable(root)
                self.assertEqual(catalog['components'][0]['sourceAvailability']['status'], 'invalid')

    def test_public_previews_remain_visible_without_member_token(self):
        spec = importlib.util.spec_from_file_location('member_preview_server', ROOT / 'scripts/library_server.py')
        server = importlib.util.module_from_spec(spec); spec.loader.exec_module(server)
        with patch.dict('os.environ', {}, clear=True), patch.object(server, 'media_file', return_value=None): projected = server.projection()
        members = [item for item in projected['items'] if item.get('earlyAccess', {}).get('enabled')]
        self.assertEqual(len(members), 189)
        for item in members:
            preview = item['previews'][0]
            self.assertTrue(preview['available'])
            self.assertTrue(server.public_preview_url(preview['videoUrl']) or preview['videoUrl'].startswith('/api/design-assets/'))
            self.assertTrue(server.public_preview_url(preview['posterUrl']) or preview['posterUrl'].startswith('/api/design-assets/'))
            self.assertTrue(all(server.public_preview_url(frame['url']) or frame['url'].startswith('/api/design-assets/') for frame in preview['keyframes']))
        self.assertFalse(server.public_preview_url('https://elsewhere.example/preview.mp4'))
        self.assertFalse(server.public_preview_url('https://www.fred-fu.com/api/visual-library/assets/' + 'a' * 64 + '.mp4'))

    def test_public_derivative_keeps_original_video_and_source_members_only(self):
        catalog = json.loads((ROOT / 'library/catalog.json').read_text())
        routes = json.loads((ROOT / 'library/routes.json').read_text())
        files = json.loads((ROOT / 'library/media-manifest.json').read_text())['files']
        for item in catalog['items']:
            if not item.get('earlyAccess', {}).get('enabled'): continue
            preview = item['previews'][0]; original = item['originalDownload']
            self.assertEqual(preview['previewIdentity']['derivedFromSha256'], original['sha256'])
            self.assertEqual(preview['previewIdentity']['kind'], 'public-720p-preview')
            self.assertNotEqual(preview['sha256'], original['sha256'])
            self.assertEqual((preview['width'], preview['height']), (1280, 720))
            self.assertEqual(files[routes[original['url']]]['access'], 'members')
            self.assertIn(files[routes[preview['videoUrl']]]['status'], ['remote-preview','reviewed'])
            self.assertNotEqual(files[routes[preview['videoUrl']]].get('access'), 'members')
            self.assertTrue(all(source['url'].startswith('/api/visual-library/assets/') for source in item['sources']))

    def test_cached_member_object_symlink_is_rejected_before_reuse(self):
        module = assets_module()
        with tempfile.TemporaryDirectory() as folder:
            base = Path(folder); root = base / 'repo'; root.mkdir()
            body = b'verified bytes outside the repository'; expected = hashlib.sha256(body).hexdigest()
            outside = base / 'outside'; outside.write_bytes(body)
            objects = root / '.artifacts/objects'; objects.mkdir(parents=True)
            (objects / expected).symlink_to(outside)
            record = {'sha256': expected, 'size': len(body), 'kind': 'zip', 'access': 'members',
                      'url': 'https://www.fred-fu.com/api/visual-library/assets/' + expected + '.zip'}
            with patch.object(module, 'ROOT', root), self.assertRaises(ValueError):
                module.download_member_object(record, 'ftvl_test_secret')

    def test_installer_rejects_symlink_object_directory(self):
        module = assets_module()
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); repo = root / 'repo'; repo.mkdir(); outside = root / 'outside'; outside.mkdir()
            (repo / '.artifacts').symlink_to(outside)
            with patch.object(module, 'ROOT', repo), self.assertRaises(ValueError): module.object_directory()
            self.assertFalse((outside / 'objects').exists())

    def test_shortlist_exposes_missing_member_source_and_gate_rejects_selected(self):
        row = {'id': 'member', 'title': '数据价格变化', 'displayLabel': 'member', 'status': 'keep',
               'collectionId': 'batch', 'sourceAvailability': {'status': 'needs-auth', 'available': False}}
        catalog = {'components': [row], 'clips': []}
        page = {'stableId': 's', 'implementationMode': 'adapted',
                'referenceChoices': [{'id': 'member'}],
                'componentPlan': {'query': '数据', 'candidates': [{'id': 'member', 'decision': 'selected', 'reason': 'Fits the numeric scene'}]}}
        with tempfile.TemporaryDirectory() as folder:
            candidates = shortlist(Path(folder), catalog, page, 3)['candidates']
        self.assertEqual(candidates[0]['sourceAvailability']['status'], 'needs-auth')
        self.assertTrue(any('source unavailable' in error for error in validate_component_plan([page], catalog)))


if __name__ == '__main__':
    unittest.main()
