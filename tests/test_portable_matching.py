"""Public queries and gates must use current semantic and top-three matching."""
import hashlib,json,subprocess,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'skills/fred-remotion-output/scripts'))
from common import load_references
from component_selection import shortlist
from library_matching import rank_references
import library_gate as gate
class PortableMatchingTests(unittest.TestCase):
 def test_spoken_queries_use_current_ranker(self):
  _,catalog=load_references(ROOT)
  active=[e for e in catalog['components']+catalog['clips'] if e.get('status','keep')=='keep' and not e.get('libraryDisposition')]
  for query in ['数据','价格','要点','代码 终端']:
   with self.subTest(query=query):
    expected=rank_references(ROOT,active,query)[:3];self.assertTrue(expected,query)
    output=json.loads(subprocess.check_output([sys.executable,str(ROOT/'scripts/catalog.py'),'--query',query,'--limit','3']))
    self.assertEqual([e['candidateId'] for e in output['entries']],[e['id'] for e in expected])
    self.assertTrue(all(e['matching']['score']>0 and e['matching']['reasons'] for e in output['entries']))
 def test_scene_and_references_resolve_same_candidates(self):
  _,catalog=load_references(ROOT)
  page={'componentPlan':{'query':'数据 价格'},'sceneGuide':{'type':'custom'}}
  rows=shortlist(ROOT,catalog,page,3)['candidates'];self.assertTrue(rows)
  for row in rows:
   a=subprocess.check_output([sys.executable,str(ROOT/'scripts/catalog.py'),'--id',row['id'],'--full'])
   b=subprocess.check_output([sys.executable,str(ROOT/'skills/fred-remotion-output/scripts/references.py'),'--id',row['id'],'--full'])
   self.assertEqual(json.loads(a),json.loads(b));self.assertEqual(json.loads(a)['entries'][0]['candidateId'],row['id'])
 def fixture(self,folder):
  base=Path(folder);asset=base/'preview.png';asset.write_bytes(b'actual reviewed preview')
  record={'path':str(asset),'sha256':hashlib.sha256(asset.read_bytes()).hexdigest()}
  rows=[{'id':cid,'title':'数据指标变化','displayLabel':cid,'status':'keep','collectionId':'batch-'+cid,'recordType':'component'} for cid in ['a','b','c','d']]
  catalog={'revision':'synthetic-current','items':{r['id']:{'mediaHashes':[record['sha256']],'sourceHashes':[]} for r in rows},'portableNormalized':{'catalogRevision':'synthetic-current','components':rows,'clips':[]}}
  page={'stableId':'one','implementationMode':'adapted','referenceChoices':[{'id':'a','reason':'The data change fits this line','preserve':'Metric change','change':'Current figures','useScope':'Current scene'}],'componentPlan':{'query':'数据','candidates':[{'id':cid,'decision':'selected' if cid=='a' else 'rejected','reason':'Best numeric change' if cid=='a' else 'This layout does not match the current task'} for cid in ['a','b','c']],'inspectedReferences':[dict(record,id='a',observations='A metric changes while its prior value stays readable')]}}
  manifest={'referenceCatalogRevision':'synthetic-current','pages':[page]};self.accept(manifest,page,record)
  return base,catalog,manifest,page,record
 def accept(self,manifest,page,record):
  page['componentAcceptance']={'status':'passed','stage':'suggestion','reviewer':'assistant','contextSha256':gate.acceptance_signature(manifest,page,'suggestion'),'checks':{'semanticFit':'Numeric change fits this task','corePreserved':'Metric change relation','visualQuality':'Actual preview inspected'},'evidence':[record]}
 def test_gate_recomputes_every_top_three_decision(self):
  with tempfile.TemporaryDirectory() as folder:
   base,catalog,manifest,page,record=self.fixture(folder)
   self.assertEqual(gate.validate_library_gate(manifest,'suggestion',base,catalog,root=base),[])
   page['componentPlan']['candidates']=page['componentPlan']['candidates'][:1];self.accept(manifest,page,record)
   errors=gate.validate_library_gate(manifest,'suggestion',base,catalog,root=base)
   self.assertTrue(any('top library candidates' in e and 'b' in e and 'c' in e for e in errors),errors)
 def test_original_does_not_skip_top_three(self):
  with tempfile.TemporaryDirectory() as folder:
   base,catalog,manifest,page,record=self.fixture(folder)
   page.update(implementationMode='original',referenceChoices=[],originalAuthorization={'by':'user','sceneId':'one','allowOriginal':True,'source':'current request','quote':'Create a new scene','requestedAt':'2026-10-13T12:00:00+08:00'})
   page['componentPlan']['candidates']=[];self.accept(manifest,page,record)
   errors=gate.validate_library_gate(manifest,'suggestion',base,catalog,root=base)
   self.assertTrue(any('top library candidates' in e for e in errors),errors)
 def test_original_cannot_claim_search_not_needed(self):
  with tempfile.TemporaryDirectory() as folder:
   base,catalog,manifest,page,record=self.fixture(folder)
   page.update(implementationMode='original',referenceChoices=[],originalAuthorization={'by':'user','sceneId':'one','allowOriginal':True,'source':'current request','quote':'Create a new scene','requestedAt':'2026-10-13T12:00:00+08:00'})
   page['componentPlan'].update(search='not-needed',candidates=[],decisionReason='Create a new scene')
   self.accept(manifest,page,record)
   errors=gate.validate_library_gate(manifest,'suggestion',base,catalog,root=base)
   self.assertTrue(any('not-needed' in e for e in errors),errors)
 def test_archived_manual_choice_is_rejected(self):
  with tempfile.TemporaryDirectory() as folder:
   base,catalog,manifest,page,record=self.fixture(folder)
   catalog['portableNormalized']['components'][0]['libraryDisposition']='archived'
   self.accept(manifest,page,record)
   errors=gate.validate_library_gate(manifest,'suggestion',base,catalog,root=base)
   self.assertTrue(any('excluded or merged: a' in e for e in errors),errors)
if __name__=='__main__':unittest.main()
