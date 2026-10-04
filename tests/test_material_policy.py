import hashlib
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('assets', ROOT / 'scripts/assets.py')
assets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assets)

class MaterialPolicyTests(unittest.TestCase):
    def test_image_bindings_are_browser_decodable_images(self):
        policy = json.loads((ROOT / 'library/material-policy.json').read_text())
        for project, entries in policy['projects'].items():
            for old, new in entries.items():
                if Path(old).suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'}:
                    self.assertIn(Path(new).suffix.lower(), {'.png', '.jpg', '.jpeg', '.webp', '.svg'},
                                  f'{project}/{old} cannot be loaded as an image: {new}')

    def test_frame_sequences_preserve_material_identity(self):
        policy = json.loads((ROOT / 'library/material-policy.json').read_text())
        for project, entries in policy['projects'].items():
            groups = {}
            for old, new in entries.items():
                if Path(old).stem.isdigit():
                    groups.setdefault(str(Path(old).parent), set()).add(new)
            for group, materials in groups.items():
                self.assertEqual(len(materials), 1, f'{project}/{group} changes material between frames')

    def test_stale_release_is_rejected_before_download(self):
        with self.assertRaisesRegex(ValueError, 'manifest'):
            assets.validate_release_manifest({'manifestSha256': 'old'}, b'new')

    def test_matching_release_is_accepted(self):
        data = b'current manifest'
        assets.validate_release_manifest({'manifestSha256': hashlib.sha256(data).hexdigest()}, data)

    def test_all_replacements_have_reviewed_payloads(self):
        policy = json.loads((ROOT / 'library/material-policy.json').read_text())
        manifest = json.loads((ROOT / 'library/media-manifest.json').read_text())['files']
        self.assertEqual(len(policy['items']), 38)
        for project, entries in policy['projects'].items():
            for old, new in entries.items():
                self.assertNotEqual(old, new)
                record = manifest[f"{policy['publicRoots'][project][0]}/{new}"]
                self.assertEqual(record['status'], 'reviewed')
                self.assertEqual(record['sourceKind'], 'user-authorized-replacement')
        self.assertFalse(policy['previewsRequireRerender'])
        catalog = json.loads((ROOT / 'library/catalog.json').read_text())
        for item in catalog['items']:
            if item['label'] in policy['affectedLabels']:
                self.assertTrue(item['previewMatchesImplementation'])
                self.assertEqual(item['materialStatus'], 'rendered-and-reviewed')

    def test_all_withdrawn_dependencies_are_unavailable(self):
        policy = json.loads((ROOT / 'library/material-policy.json').read_text())
        manifest = json.loads((ROOT / 'library/media-manifest.json').read_text())['files']
        for name in policy['withdrawnPaths']:
            self.assertNotEqual(manifest[name]['status'], 'reviewed')

    def test_reference_pixels_are_replaced_despite_skill_folder_name(self):
        policy = json.loads((ROOT / 'library/material-policy.json').read_text())
        required = {
            '46d3ccc7f02f': ['sp001-subject.png', 'sp019-a-motion.mp4', 'sp020-first.mp4'],
            '15fbad51a7a5': ['reference/R033/grid-3.jpg', 'reference/R033/rail-3.jpg'],
            'f20b98eb0db2': ['reference/input.jpg', 'reference/look-1.jpg'],
            '30b3c05aa839': ['group-c/clean-film1.mp4', 'group-c/image1.jpg'],
        }
        for project, names in required.items():
            for name in names:
                self.assertTrue(policy['projects'][project][name].startswith('approved-materials/'))

    def test_no_source_audio_replay_switch(self):
        for project in ['46d3ccc7f02f', 'bf97a4a22921']:
            text = (ROOT / f'components/projects/{project}/src/library-entry.tsx').read_text()
            self.assertNotIn('includeSourceAudio', text)
            self.assertNotIn('audio/${id}', text)

if __name__ == '__main__':
    unittest.main()
