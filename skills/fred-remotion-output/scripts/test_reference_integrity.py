"""Curated references must remain registered, traceable and entirely preserved."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from verify_dependencies import reference_integrity, runtime_integrity, bundle_integrity, digest, registered_external_project_archive


class IntegrityTests(unittest.TestCase):
    def test_external_zip_requires_exact_registration_and_volume_marker(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            volume = root / 'archive'; volume.mkdir()
            marker = volume / '.fredtalk-archive-volume-id'; marker.write_text('fixture-volume')
            target = volume / 'source.zip'; target.write_bytes(b'exact source package')
            logical = root / 'skills/archives'; logical.parent.mkdir()
            logical.symlink_to(volume, target_is_directory=True)
            asset = {'path': str(logical / 'source.zip'), 'sha256': digest(target)}
            registry = {'externalProjectArchives': {'volumeRoot': str(volume),
                'volumeId': 'fixture-volume', 'entries': [{'logicalPath': asset['path'],
                    'archivePath': str(target), 'sha256': asset['sha256']}]}}
            self.assertTrue(registered_external_project_archive(registry, asset))
            self.assertFalse(registered_external_project_archive({}, asset))
            self.assertFalse(registered_external_project_archive(registry, {**asset, 'sha256': 'changed'}))
            marker.write_text('wrong-volume')
            self.assertFalse(registered_external_project_archive(registry, asset))

    def test_archive_registration_cannot_allow_external_video_or_redirected_zip(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            volume = root / 'archive'; volume.mkdir()
            (volume / '.fredtalk-archive-volume-id').write_text('fixture-volume')
            for filename in ['video.mp4', 'source.zip']:
                target = volume / filename; target.write_bytes(b'original')
                logical = root / filename; logical.symlink_to(target)
                asset = {'path': str(logical), 'sha256': digest(target)}
                registry = {'externalProjectArchives': {'volumeRoot': str(volume),
                    'volumeId': 'fixture-volume', 'entries': [{'logicalPath': str(logical),
                        'archivePath': str(target), 'sha256': asset['sha256']}]}}
                if filename.endswith('.mp4'):
                    self.assertFalse(registered_external_project_archive(registry, asset))
                else:
                    outside = root / 'outside.zip'; outside.write_bytes(b'original')
                    logical.unlink(); logical.symlink_to(outside)
                    self.assertFalse(registered_external_project_archive(registry, asset))

    def test_excluded_representative_keeps_its_excluded_historical_alias(self):
        data = {'components': [
            {'id': 'alias', 'status': 'drop', 'canonicalId': 'original',
             'selectionDisposition': 'merged', 'sceneTypes': ['summary']},
            {'id': 'original', 'status': 'drop', 'selectionDisposition': 'user-removed-20260930',
             'sceneTypes': ['summary']},
        ], 'clips': []}
        self.assertEqual(reference_integrity(Path('.'), {}, data, [], {'summary'}), [])
        data['components'][0]['status'] = 'keep'
        self.assertIn('Merged reference must be excluded from defaults: alias',
                      reference_integrity(Path('.'), {}, data, [], {'summary'}))

    def test_retired_skill_entry_is_not_a_production_dependency(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            skill = root / 'skills/fred-remotion-output'
            (skill / 'assets').mkdir(parents=True)
            (skill / 'references').mkdir()
            catalog = root / 'catalog.json'
            catalog.write_text(json.dumps({
                'selectionRevision': 1, 'selectionFile': str(root / 'unused-selection.json'),
                'components': [], 'clips': [], 'counts': {},
            }))
            (skill / 'assets/inventory.json').write_text(json.dumps({'files': []}))
            (skill / 'references/scene-routing.json').write_text(json.dumps({'types': []}))
            runtime = root / 'skills/_runtime/remotion/fixture/node_modules/remotion'
            runtime.mkdir(parents=True)
            (runtime / 'package.json').write_text(json.dumps({'version': '4.0.519'}))
            registry = {
                'selectionRevision': 1, 'selectionCatalog': 'catalog.json',
                'selectionCatalogSha256': digest(catalog), 'inventory': 'assets/inventory.json',
                'episodeBundles': [], 'clipBindings': [],
                'runtimes': [{'id': 'fixture', 'path': 'skills/_runtime/remotion/fixture',
                              'packageVersions': {'remotion': '4.0.519'}}],
            }
            (skill / 'assets/dependency-registry.json').write_text(json.dumps(registry))
            current_tools = [
                'skills/fred-remake/SKILL.md', 'skills/fred-broll-generation/SKILL.md',
                'skills/remotion-best-practices/SKILL.md',
                'skills/cloud-render/SKILL.md', 'skills/cloud-render/scripts/snapshot.py',
                'skills/cloud-render/scripts/render.mjs', 'skills/cloud-render/scripts/guard.py',
                'skills/cloud-render/scripts/verify.py',
                'skills/fredtalk-deck-motion-pipeline/scripts/run-stage-gate.mjs',
                'skills/fredtalk-deck-motion-pipeline/scripts/validate-stage-gate.mjs',
                'skills/fred-remake/scripts/query-preferred-motion.py',
            ]
            for relative in current_tools:
                path = root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('fixture')
            command = [sys.executable, str(Path(__file__).with_name('verify_dependencies.py')),
                       '--project-root', str(root)]
            passed = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(passed.returncode, 0, passed.stdout + passed.stderr)
            self.assertEqual(json.loads(passed.stdout)['status'], 'PASS')

            # Retiring an entry must not relax checks on current execution tools.
            (root / 'skills/cloud-render/scripts/render.mjs').unlink()
            failed = subprocess.run(command, capture_output=True, text=True)
            self.assertNotEqual(failed.returncode, 0)
            self.assertIn('Missing tool dependency: skills/cloud-render/scripts/render.mjs',
                          json.loads(failed.stdout)['errors'])

    def test_display_labels_must_identify_one_reference(self):
        data = {'components': [
            {'id': 'one', 'displayLabel': 'R014', 'sceneTypes': ['summary']},
            {'id': 'two', 'displayLabel': 'r014', 'sceneTypes': ['summary']},
        ], 'clips': []}
        self.assertIn('Duplicate reference display labels',
                      reference_integrity(Path('.'), {}, data, [], {'summary'}))

    def test_optional_collection_registration_does_not_change_approval(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pack = root / 'pack'; pack.mkdir()
            (pack / 'manifest.json').write_text(json.dumps({'pages': [{'number': 14}]}))
            entry = {'id': 'r014', 'number': 14, 'collectionId': 'candidate',
                     'status': 'optional', 'sceneTypes': ['summary']}
            data = {'components': [entry], 'clips': []}
            registry = {'referenceCollections': [{'id': 'candidate', 'root': 'pack',
                                                  'registrationStatuses': ['optional']}]}
            inventory = [{'path': 'pack/manifest.json'}]
            self.assertEqual(reference_integrity(root, registry, data, inventory, {'summary'}), [])
            self.assertEqual(entry['status'], 'optional')
            del registry['referenceCollections'][0]['registrationStatuses']
            self.assertTrue(any('registration' in x for x in reference_integrity(root, registry, data, inventory, {'summary'})))

    def test_bundle_needs_registered_runtime_and_local_entry(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pack = root / 'skills/example'; pack.mkdir(parents=True)
            (pack / 'index.tsx').write_text('source')
            (pack / 'package.json').write_text(json.dumps({'dependencies': {'remotion': '4.0.500'}}))
            bundle = {'id': 'one', 'root': 'skills/example', 'entryPoint': 'skills/example/index.tsx',
                      'publicDir': None}
            registry = {'episodeBundles': [bundle], 'runtimes': [{'id': 'rt', 'path': 'skills/runtime',
                        'packageVersions': {'remotion': '4.0.500'}}]}
            self.assertTrue(any('runtime' in e.lower() for e in bundle_integrity(root, registry)))
            bundle['runtime'] = 'skills/runtime'
            self.assertEqual(bundle_integrity(root, registry), [])
            bundle['entryPoint'] = '../outside.tsx'
            self.assertTrue(any('entry' in e.lower() for e in bundle_integrity(root, registry)))
            bundle['entryPoint'] = 'skills/example/index.tsx'
            registry['runtimes'][0]['packageVersions']['remotion'] = '4.0.501'
            self.assertTrue(any('version' in e.lower() for e in bundle_integrity(root, registry)))

    def test_runtime_versions_are_registry_driven_and_local(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            rt = root / 'skills/_runtime/remotion/new-library'
            module = rt / 'node_modules/remotion'; module.mkdir(parents=True)
            (module / 'package.json').write_text(json.dumps({'version': '4.0.500'}))
            registry = {'runtimes': [{'id': 'new-library', 'path': 'skills/_runtime/remotion/new-library',
                                     'packageVersions': {'remotion': '4.0.500'}}]}
            self.assertEqual(runtime_integrity(root, registry), [])
            registry['runtimes'][0]['packageVersions']['remotion'] = '4.0.501'
            self.assertTrue(any('version' in x for x in runtime_integrity(root, registry)))
            registry['runtimes'][0]['path'] = 'outside'
            self.assertTrue(any('project skills' in x for x in runtime_integrity(root, registry)))

    def test_runtime_package_symlink_cannot_escape_project_modules(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            modules = root / 'skills/_runtime/remotion/new-library/node_modules'; modules.mkdir(parents=True)
            external = root / 'external'; external.mkdir()
            (external / 'package.json').write_text(json.dumps({'version': '4.0.500'}))
            (modules / 'remotion').symlink_to(external, target_is_directory=True)
            registry = {'runtimes': [{'id': 'new-library', 'path': 'skills/_runtime/remotion/new-library',
                                     'packageVersions': {'remotion': '4.0.500'}}]}
            self.assertTrue(any('outside' in x for x in runtime_integrity(root, registry)))

    def test_registration_aliases_types_and_inventory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pack = root / 'pack'
            pack.mkdir()
            manifest = pack / 'manifest.json'
            manifest.write_text(json.dumps({'pages': [{'number': 1}]}))
            data = {'components': [
                {'id': 'one', 'number': 1, 'collectionId': 'demo', 'status': 'keep', 'sceneTypes': ['summary']},
                {'id': 'two', 'number': 2, 'collectionId': 'demo', 'status': 'drop', 'sceneTypes': ['summary'], 'canonicalId': 'one'},
            ], 'clips': []}
            registry = {'referenceCollections': [{'id': 'demo', 'root': 'pack'}]}
            inventory = [{'path': 'pack/manifest.json'}]
            check = lambda: reference_integrity(root, registry, data, inventory, {'summary'})
            self.assertEqual(check(), [])
            manifest.write_text(json.dumps({'pages': [{'number': 1}, {'number': 2}]}))
            self.assertTrue(any('registration' in x for x in check()))
            manifest.write_text(json.dumps({'pages': [{'number': 1}]}))
            data['components'][1]['canonicalId'] = 'missing'
            self.assertTrue(any('canonical' in x for x in check()))
            data['components'][1]['canonicalId'] = 'one'
            data['components'][0]['sceneTypes'] = ['unknown']
            self.assertTrue(any('sceneTypes' in x for x in check()))
            data['components'][0]['sceneTypes'] = ['summary']
            (pack / 'photo.jpg').write_bytes(b'asset')
            self.assertTrue(any('inventory' in x for x in check()))


if __name__ == '__main__':
    unittest.main()
