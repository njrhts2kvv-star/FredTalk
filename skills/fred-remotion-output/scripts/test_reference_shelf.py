"""Candidate shelves preserve exact labels, local files and pending review status."""
import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import build_reference_shelf as shelf
from common import digest, project_root

ROOT = project_root()


class ShelfTests(unittest.TestCase):
    def run_shelf(self, root, registry, catalog, status=None):
        args = ['build_reference_shelf.py', '--collection', 'library-candidates']
        if status:
            args += ['--status', status]
        with patch.object(shelf, 'project_root', return_value=root), \
             patch.object(shelf, 'load_references', return_value=(registry, catalog)), \
             patch('sys.argv', args), contextlib.redirect_stdout(io.StringIO()):
            shelf.main()

    def test_optional_shelf_needs_no_old_bindings_or_cues(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); pack = root / 'pack'
            for name in ['previews', 'posters', 'src']:
                (pack / name).mkdir(parents=True)
            (pack / 'previews/r014.mp4').write_bytes(b'fixture video')
            (pack / 'posters/014.jpg').write_bytes(b'fixture poster')
            (pack / 'src/scene.tsx').write_text('export const Scene = () => null;')
            (pack / 'manifest.json').write_text(json.dumps({'pages': [{'number': 14}]}))
            templates = root / 'skills/fred-remotion-output/templates'; templates.mkdir(parents=True)
            (templates / 'reference-shelf.html').write_text(
                (ROOT / 'skills/fred-remotion-output/templates/reference-shelf.html').read_text())
            entry = {'id': 'library-r014', 'displayLabel': 'R014', 'number': 14,
                     'status': 'optional', 'collectionId': 'library-candidates',
                     'sceneTypes': ['summary'], 'title': 'Three keywords', 'useWhen': 'Summarize a claim',
                     'motionDescription': 'Establish words then focus the conclusion',
                     'approvalScope': 'Pending user review', 'reviewStatus': 'pending',
                     'knownLimitations': ['Example words must be replaced'],
                     'adaptationNeeds': ['Extract text fields before replacement'],
                     'media': {'path': str(pack / 'previews/r014.mp4')},
                     'referenceSha256': digest(pack / 'previews/r014.mp4'),
                     'sourceCode': [{'path': str(pack / 'src/scene.tsx'), 'symbol': 'Scene'}]}
            registry = {'referenceCollections': [{'id': 'library-candidates', 'root': 'pack'}],
                        'selectionCatalogSha256': 'test'}
            catalog = {'components': [entry], 'clips': []}
            self.run_shelf(root, registry, catalog, 'optional')
            result = json.loads((pack / 'shelf-data.json').read_text())
            card = result['items'][0]
            self.assertEqual(card['status'], 'optional')
            self.assertEqual(card['displayLabel'], 'R014')
            self.assertEqual(card['reviewStatus'], 'pending')
            self.assertEqual(card['approvalScope'], 'Pending user review')
            self.assertEqual(card['retentionNote'], entry['motionDescription'])
            self.assertEqual(card['adaptationNeeds'], entry['adaptationNeeds'])
            self.assertNotIn('已认可', result['description'])
            self.run_shelf(root, registry, catalog)
            self.assertEqual(json.loads((pack / 'shelf-data.json').read_text())['items'], [])


if __name__ == '__main__':
    unittest.main()
