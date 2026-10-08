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
  self.assertEqual(len(items),210)
  self.assertEqual(d['counts']['available'],205)
  self.assertEqual(d['counts']['unavailable'],5)
  expected={"ep109-selected-20261006":6,"expansion-selected-20261007":14,"interaction-components-20261007":4,"screen-camera-selected-20261007":5}
  for collection,count in expected.items():
   selected=[i for i in items if i.get('collectionId')==collection]
   self.assertEqual(len(selected),count,collection)
   self.assertTrue(all(i.get('isNew') and i.get('addedAt') for i in selected))
  self.assertEqual(sum(bool(i.get('archivedFromSkill')) for i in items),44)
  self.assertEqual(len([i for i in items if not i.get('archivedFromSkill')]),166)
  self.assertTrue({'V085','V098','E04','E16','SP004','L81-B060','L81-W08'}.isdisjoint(i['label'] for i in items))
  for i in items:
   for source in i['sources']:
    self.assertIn(source['url'],routes)
    self.assertTrue((ROOT/routes[source['url']]).is_file(),i['label'])
   for p in i['previews']:
    self.assertLess(p['start'],p['end']);self.assertIn(p['audioPolicy'],['no-audio-track','source-audio','sfx-only','preserved-source-audio','operation-sfx-only','interface-sfx'])
 def test_new_collection_lookup_and_archive_filter(self):
  data=json.loads(subprocess.check_output([sys.executable,str(ROOT/'scripts/catalog.py'),'--collection','screen-camera-selected-20261007','--limit','10']))
  self.assertEqual(data['count'],5)
  archived=json.loads(subprocess.check_output([sys.executable,str(ROOT/'scripts/catalog.py'),'--status','archived','--limit','1']))
  self.assertEqual(archived['count'],44)
  alias=json.loads(subprocess.check_output([sys.executable,str(ROOT/'scripts/catalog.py'),'--id','SP021','--full']))
  self.assertEqual(alias['entries'][0]['label'],'109-05')
 def test_declared_routes_stay_inside_repository(self):
  for name in json.loads((ROOT/'library/routes.json').read_text()).values():
   self.assertFalse(Path(name).is_absolute());self.assertTrue((ROOT/name).resolve().is_relative_to(ROOT))
 def test_catalog_query_and_skill_entry_match(self):
  args=['--id','SP024','--full'];a=subprocess.check_output([sys.executable,str(ROOT/'scripts/catalog.py'),*args]);b=subprocess.check_output([sys.executable,str(ROOT/'skills/fred-remotion-output/scripts/references.py'),*args]);self.assertEqual(json.loads(a),json.loads(b));self.assertEqual(json.loads(a)['count'],1)
 def test_quarantined_media_is_never_served(self):
  m=module('library_server');self.assertIsNone(m.media_file({'status':'quarantined','sha256':'0'*64,'size':1}))
 def test_download_uses_pack_tag_and_preserves_legacy_release_tag(self):
  import hashlib
  m=module('assets')
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'library').mkdir()
   manifest=b'{"files":{}}';(root/'library/media-manifest.json').write_bytes(manifest)
   body=b'asset';sha=hashlib.sha256(body).hexdigest()
   release={'repository':'owner/repo','tag':'legacy','manifestSha256':hashlib.sha256(manifest).hexdigest(),'packs':[{'name':'old.tar.gz','sha256':sha},{'name':'new.tar.gz','sha256':sha,'tag':'new-collection'}]}
   (root/'library/releases.json').write_text(json.dumps(release))
   def download(command,check):
    folder=Path(command[command.index('--dir')+1]);name=command[command.index('--pattern')+1];(folder/name).write_bytes(body)
   with patch.object(m,'ROOT',root),patch.object(m,'records',return_value={}),patch.object(m,'extract'),patch.object(m.subprocess,'run',side_effect=download) as run,patch.object(sys,'argv',['assets.py','download']):
    m.main()
   self.assertEqual([call.args[0][3] for call in run.call_args_list],['legacy','new-collection'])
 def test_multipart_pack_checks_parts_and_combined_hash(self):
  import hashlib
  m=module('assets')
  with tempfile.TemporaryDirectory() as tmp:
   folder=Path(tmp);parts=[]
   for index,data in enumerate([b'first',b'second']):
    name=f'part{index}';(folder/name).write_bytes(data)
    parts.append({'name':name,'size':len(data),'sha256':hashlib.sha256(data).hexdigest()})
   pack={'name':'complete','sha256':hashlib.sha256(b'firstsecond').hexdigest(),'parts':parts}
   (folder/'part0').write_bytes(b'wrong')
   with self.assertRaises(ValueError):m.assemble_pack(pack,folder)
   self.assertFalse((folder/'complete').exists())
   (folder/'part0').write_bytes(b'first')
   self.assertEqual(m.assemble_pack(pack,folder).read_bytes(),b'firstsecond')
   self.assertFalse((folder/'part0').exists())
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
