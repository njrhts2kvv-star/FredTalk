import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import tarfile
import io

ROOT=Path(__file__).resolve().parents[1]
def module(name):
 spec=importlib.util.spec_from_file_location(name,ROOT/'scripts'/f'{name}.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

class PortableTests(unittest.TestCase):
 def test_active_catalog_keeps_removals_and_valid_sources(self):
  d=json.loads((ROOT/'library/catalog.json').read_text());routes=json.loads((ROOT/'library/routes.json').read_text());items=d['items']
  self.assertEqual(len(items),177)
  self.assertTrue({'V085','V098','E04','E16','SP004','L81-B060','L81-W08'}.isdisjoint(i['label'] for i in items))
  for i in items:
   for source in i['sources']:
    self.assertIn(source['url'],routes)
    self.assertTrue((ROOT/routes[source['url']]).is_file(),i['label'])
   for p in i['previews']:
    self.assertLess(p['start'],p['end']);self.assertEqual(p['audioPolicy'],'no-audio-track')
 def test_declared_routes_stay_inside_repository(self):
  for name in json.loads((ROOT/'library/routes.json').read_text()).values():
   self.assertFalse(Path(name).is_absolute());self.assertTrue((ROOT/name).resolve().is_relative_to(ROOT))
 def test_catalog_query_and_skill_entry_match(self):
  args=['--id','SP024','--full'];a=subprocess.check_output([sys.executable,str(ROOT/'scripts/catalog.py'),*args]);b=subprocess.check_output([sys.executable,str(ROOT/'skills/fred-remotion-output/scripts/references.py'),*args]);self.assertEqual(json.loads(a),json.loads(b));self.assertEqual(json.loads(a)['count'],1)
 def test_quarantined_media_is_never_served(self):
  m=module('library_server');self.assertIsNone(m.media_file({'status':'quarantined','sha256':'0'*64,'size':1}))
 def test_installer_rejects_traversal_even_with_matching_manifest(self):
  m=module('assets')
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);pack=root/'bad.tar.gz'
   with tarfile.open(pack,'w:gz') as tar:
    info=tarfile.TarInfo('../escape');info.size=1;tar.addfile(info,io.BytesIO(b'x'))
   with patch.object(m,'ROOT',root):
    with self.assertRaises(ValueError):m.extract(pack,{'../escape':1})
   self.assertFalse((root.parent/'escape').exists())
 def test_installer_rejects_wrong_object_hash(self):
  m=module('assets')
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);pack=root/'bad.tar.gz';name='0'*64
   with tarfile.open(pack,'w:gz') as tar:
    info=tarfile.TarInfo(name);info.size=1;tar.addfile(info,io.BytesIO(b'x'))
   with patch.object(m,'ROOT',root):
    with self.assertRaises(ValueError):m.extract(pack,{name:1})
   self.assertFalse((root/'.artifacts/objects'/name).exists())
if __name__=='__main__':unittest.main()
