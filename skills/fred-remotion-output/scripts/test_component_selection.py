import tempfile
import unittest
from pathlib import Path
from component_selection import shortlist, validate_component_plan

class ComponentSelectionTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        self.catalog={'components':[
            {'id':'media','status':'keep','sceneTypes':['device-demo'],'title':'手机横竖窗口接力让位'},
            {'id':'wrong-type','status':'keep','sceneTypes':['summary'],'title':'手机横竖窗口接力让位'},
            {'id':'drop','status':'drop','sceneTypes':['device-demo'],'title':'手机横竖窗口接力让位'},
            {'id':'removed','status':'keep','libraryDisposition':'removed','title':'手机横竖窗口接力让位'},
        ],'clips':[]}
    def test_typed_candidate_precedes_other_type_and_excludes_rejected(self):
        r=shortlist(self.root,self.catalog,{'sceneGuide':{'type':'device-demo'},'oneQuestion':'手机横竖窗口接力'},3)
        self.assertEqual(r['candidates'][0]['id'],'media')
        self.assertNotIn('drop',[x['id'] for x in r['candidates']])
        self.assertNotIn('removed',[x['id'] for x in r['candidates']])
    def test_no_typed_match_falls_back_with_explicit_scope(self):
        r=shortlist(self.root,self.catalog,{'sceneGuide':{'type':'prompt-reading'},'oneQuestion':'手机横竖窗口接力'},3)
        self.assertEqual(r['candidates'][0]['id'],'media')
        self.assertTrue(r['crossTypeFallback'])
    def test_raw_narration_is_not_silently_treated_as_visual_task(self):
        r=shortlist(self.root,self.catalog,{'sourceSpans':[{'text':'录音与逐字稿'}]},3)
        self.assertEqual(r['candidates'],[])
        self.assertIn('query',r['needsDecision'])
    def test_new_plan_cannot_claim_reference_not_selected(self):
        p={'stableId':'s','implementationMode':'adapted','referenceChoices':[{'id':'media'}],
           'componentPlan':{'query':'窗口接力','candidates':[{'id':'wrong-type','decision':'selected','reason':'接力动作'}]}}
        self.assertTrue(any('selected' in x for x in validate_component_plan([p],self.catalog)))
    def test_original_needs_actual_non_library_reason(self):
        p={'stableId':'s','implementationMode':'original','referenceChoices':[],
           'componentPlan':{'query':'窗口接力','candidates':[{'id':'media','decision':'rejected','reason':'容量不适合'}]}}
        self.assertTrue(validate_component_plan([p],self.catalog))
        p['componentPlan']['decisionReason']='本句需要四路筛选，现有双窗动作不成立'
        self.assertEqual(validate_component_plan([p],self.catalog),[])
    def test_preserved_media_can_skip_search_for_evidence_reason(self):
        p={'stableId':'s','implementationMode':'preserved-media','referenceChoices':[],
           'componentPlan':{'search':'not-needed','decisionReason':'真实操作录屏承担证据'}}
        self.assertEqual(validate_component_plan([p],self.catalog),[])
