"""Official website ZIP handoffs import offline without credential or network work."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def module():
    spec = importlib.util.spec_from_file_location('offline_zip_assets', ROOT / 'scripts/assets.py')
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


class ZipImportTests(unittest.TestCase):
    def fixture(self, folder, name='official.zip'):
        base = Path(folder); repo = base / 'repo'; repo.mkdir(exist_ok=True)
        archive = base / name
        contents = {'batch/src/index.tsx': b'export function Scene() { return null; }',
                    'batch/package.json': b'{"scripts":{"postinstall":"DO_NOT_RUN"}}'}
        with zipfile.ZipFile(archive, 'w') as zipped:
            for path, body in contents.items(): zipped.writestr(path, body)
        package = {'collectionId': 'batch', 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
                   'size': archive.stat().st_size, 'installRoot': '.artifacts/member-components/batch',
                   'files': {path: {'sha256': hashlib.sha256(body).hexdigest(), 'size': len(body)}
                             for path, body in contents.items()}}
        (repo / 'library').mkdir(exist_ok=True)
        (repo / 'library/member-packages.json').write_text(json.dumps({'collections': [package]}))
        return repo, archive, package

    def test_renamed_official_zip_imports_offline_and_preserves_original_bytes(self):
        assets = module()
        with tempfile.TemporaryDirectory() as folder:
            repo, archive, package = self.fixture(folder, 'download (1).zip'); before = archive.read_bytes()
            with patch.object(assets, 'ROOT', repo), \
                    patch.object(assets, 'read_member_token', side_effect=AssertionError('Token read is forbidden')), \
                    patch.object(assets, 'member_open', side_effect=AssertionError('Network is forbidden')), \
                    patch.object(assets.subprocess, 'run', side_effect=AssertionError('Package execution is forbidden')):
                rows = assets.import_zip_files([archive])
            self.assertEqual(rows[0]['collectionId'], 'batch')
            self.assertTrue((repo / package['installRoot'] / 'batch/src/index.tsx').is_file())
            self.assertEqual(archive.read_bytes(), before)
            self.assertFalse((repo / 'components/projects/batch').exists())

    def test_matching_size_with_wrong_hash_is_rejected_before_install(self):
        assets = module()
        with tempfile.TemporaryDirectory() as folder:
            repo, archive, package = self.fixture(folder)
            changed = bytearray(archive.read_bytes()); changed[-1] ^= 1; archive.write_bytes(changed)
            with patch.object(assets, 'ROOT', repo), self.assertRaisesRegex(ValueError, 'official'):
                assets.import_zip_files([archive])
            self.assertFalse((repo / package['installRoot']).exists())

    def test_mixed_official_and_unknown_inputs_fail_before_new_install(self):
        assets = module()
        with tempfile.TemporaryDirectory() as folder:
            repo, archive, package = self.fixture(folder); unknown = Path(folder) / 'other.zip'; unknown.write_bytes(b'not official')
            with patch.object(assets, 'ROOT', repo), self.assertRaises(ValueError):
                assets.import_zip_files([archive, unknown])
            self.assertFalse((repo / package['installRoot']).exists())

    def test_directory_and_repeated_zip_are_deduplicated_without_recursive_scan(self):
        assets = module()
        with tempfile.TemporaryDirectory() as folder:
            repo, archive, package = self.fixture(folder)
            directory = Path(folder) / 'handoff'; directory.mkdir(); copied = directory / 'renamed.ZIP'; copied.write_bytes(archive.read_bytes())
            (directory / 'notes.txt').write_text('This file must stay untouched.')
            nested = directory / 'nested'; nested.mkdir(); (nested / 'unknown.zip').write_bytes(b'ignored nested file')
            with patch.object(assets, 'ROOT', repo): rows = assets.import_zip_files([directory, copied])
            self.assertEqual(len(rows), 1)
            self.assertEqual((directory / 'notes.txt').read_text(), 'This file must stay untouched.')
            self.assertTrue((nested / 'unknown.zip').exists())

    def test_changed_existing_install_is_preserved(self):
        assets = module()
        with tempfile.TemporaryDirectory() as folder:
            repo, archive, package = self.fixture(folder)
            with patch.object(assets, 'ROOT', repo):
                assets.import_zip_files([archive])
                source = repo / package['installRoot'] / 'batch/src/index.tsx'; source.write_bytes(b'local user adaptation')
                with self.assertRaises(ValueError): assets.import_zip_files([archive])
            self.assertEqual(source.read_bytes(), b'local user adaptation')

    def test_cli_import_dispatches_before_token_or_network_related_actions(self):
        assets = module()
        with tempfile.TemporaryDirectory() as folder:
            repo, archive, package = self.fixture(folder)
            with patch.object(assets, 'ROOT', repo), \
                    patch.object(assets, 'read_member_token', side_effect=AssertionError('Token read is forbidden')), \
                    patch.object(assets, 'download_public', side_effect=AssertionError('GitHub download is forbidden')), \
                    patch.object(sys, 'argv', ['assets.py', 'import', '--zip', str(archive)]):
                assets.main()
            self.assertTrue((repo / package['installRoot']).is_dir())


if __name__ == '__main__': unittest.main()
