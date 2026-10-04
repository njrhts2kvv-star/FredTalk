import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class SourceMetadataTests(unittest.TestCase):
    def test_private_reference_locators_do_not_claim_library_authorship(self):
        paths = list((ROOT / 'components/projects').glob('*/manifest.json'))
        paths += list((ROOT / 'components/projects').glob('*/groups/r/legacy/manifest.json'))
        checked = 0
        def visit(value):
            nonlocal checked
            if isinstance(value, dict):
                if value.get('sourcePath') == '[PRIVATE_REFERENCE]':
                    checked += 1
                    self.assertNotEqual(value.get('creator'), 'FredTalk')
                for child in value.values():
                    visit(child)
            elif isinstance(value, list):
                for child in value:
                    visit(child)
        for path in paths:
            visit(json.loads(path.read_text()))
        self.assertGreater(checked, 0)

    def test_private_reference_marker_is_not_a_served_media_path(self):
        routes = json.loads((ROOT / 'library/routes.json').read_text())
        self.assertNotIn('[PRIVATE_REFERENCE]', routes.values())
        for item in json.loads((ROOT / 'library/catalog.json').read_text())['items']:
            for preview in item['previews']:
                if preview.get('available'):
                    self.assertIn(preview['videoUrl'], routes)
            for source in item['sources']:
                self.assertTrue((ROOT / routes[source['url']]).is_file())

if __name__ == '__main__':
    unittest.main()
