import hashlib
import json
from pathlib import Path
import shutil
import tempfile
import threading
import unittest
from urllib.request import urlopen, Request
from unittest.mock import patch
from test_portable import ROOT, module


class BundledFontTests(unittest.TestCase):
    def test_all_daily_faces_are_bundled_with_exact_identity(self):
        faces = json.loads((ROOT / 'skills/fred-remotion-output/references/typography-registry.json').read_text())['faces']
        self.assertEqual(len(faces), 8)
        for face in faces:
            self.assertTrue(face['path'].startswith('library/fonts/'))
            self.assertEqual(hashlib.sha256((ROOT / face['path']).read_bytes()).hexdigest(), face['sha256'])

    def test_installer_resolves_bundled_fonts_without_release_objects(self):
        assets = module('assets')
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copytree(ROOT / 'library/fonts', root / 'library/fonts')
            registry = Path('skills/fred-remotion-output/references/typography-registry.json')
            (root / registry).parent.mkdir(parents=True)
            shutil.copyfile(ROOT / registry, root / registry)
            with patch.object(assets, 'ROOT', root):
                for face in json.loads((root / registry).read_text())['faces']:
                    self.assertEqual(assets.available(face), root / face['path'])
            self.assertFalse((root / '.artifacts').exists())

    def test_font_routes_serve_bundled_files_with_range_and_font_mime(self):
        server = module('library_server')
        routes = json.loads((ROOT / 'library/routes.json').read_text())
        catalog = json.loads((ROOT / 'library/catalog.json').read_text())
        httpd = server.ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            for face in catalog['typography']['faces']:
                self.assertTrue(routes[face['url']].startswith('library/fonts/'))
                request = Request(f'http://127.0.0.1:{httpd.server_port}' + face['url'], headers={'Range': 'bytes=0-15'})
                with urlopen(request) as response:
                    self.assertEqual(response.status, 206)
                    self.assertIn('font/', response.headers['Content-Type'])
                    self.assertEqual(response.read(), (ROOT / routes[face['url']]).read_bytes()[:16])
        finally:
            httpd.shutdown()
            httpd.server_close()
            thread.join()
