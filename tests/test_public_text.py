import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('public_text', Path(__file__).resolve().parents[1] / 'scripts/check_public_text.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class PublicTextTests(unittest.TestCase):
    def test_ignores_encoded_data_and_dependency_checksums(self):
        text = 'data:image/png;base64,TGVnYWN5TmFtZQ== "integrity": "sha512-LegacyName"'
        self.assertNotIn('LegacyName', module.searchable(text))
    def test_keeps_real_source_and_license_text_searchable(self):
        text = '// Copyright LegacyName\nconst label = "LegacyName";'
        self.assertEqual(module.searchable(text), text)
