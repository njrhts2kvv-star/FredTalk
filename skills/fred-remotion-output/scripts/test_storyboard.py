"""Narration fidelity and selection boundaries are observable planning contracts."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from common import load_references, project_root
from scene import packet
from validate_storyboard import validate


class StoryboardTests(unittest.TestCase):
    def setUp(self):
        self.text = '先看完整任务。再突出当前这一步。'
        middle = self.text.index('再')
        self.choices = {'components': [{'id':'selected', 'status':'keep'}, {'id':'rejected', 'status':'drop'}], 'clips':[]}
        self.plan = {'script':{'sha256':hashlib.sha256(self.text.encode()).hexdigest()},
                     'timingStatus':'estimated', 'timelineFps':60, 'durationInFrames':600,
                     'parts':[{'id':'PartA', 'startFrame':0, 'endFrameExclusive':600}], 'pages':[]}
        for i,(start,end) in enumerate([(0,middle),(middle,len(self.text))]):
            self.plan['pages'].append({'stableId':str(i), 'sourceBeatIds':[str(i)], 'startFrame':i*300, 'durationInFrames':300,
                'sourceSpans':[{'startChar':start,'endChar':end,'text':self.text[start:end]}],
                'oneQuestion':'当前内容如何变化', 'exactScreenWords':['当前任务'],
                'visualPlan':{k:'meaningful state' for k in ['enter','change','read','exit','handoff']},
                'motionEvents':[{'sourceBeatId':str(i),'cueFrame':i*300+60,'spokenCue':self.text[start:start+2]}],
                'referenceChoices':[{'id':'selected','reason':'semantic match','preserve':'motion','change':'new text','useScope':'selected motion'}]})

    def test_estimated_plan_is_useful_but_not_final_timing(self):
        errors,warnings=validate(self.plan,self.text,self.choices)
        self.assertFalse(errors)
        self.assertTrue(warnings)
        errors,_=validate(self.plan,self.text,self.choices,require_final=True)
        self.assertTrue(errors)

    def test_rewriting_or_omitting_narration_is_rejected(self):
        plan=copy.deepcopy(self.plan);plan['pages'][0]['sourceSpans'][0]['text']='偷偷重写'
        self.assertTrue(validate(plan,self.text,self.choices)[0])
        plan=copy.deepcopy(self.plan);plan['pages'][0]['sourceSpans'][0]['startChar']=1
        self.assertIn('Some narration characters have no scene responsibility',validate(plan,self.text,self.choices)[0])

    def test_fake_spoken_cue_and_local_frame_on_global_timeline_fail(self):
        plan=copy.deepcopy(self.plan);plan['pages'][1]['motionEvents'][0]['cueFrame']=60
        plan['pages'][1]['motionEvents'][0]['spokenCue']='不在稿子里的话'
        self.assertEqual(len(validate(plan,self.text,self.choices)[0]),2)

    def test_rejected_component_cannot_reenter_by_reuse(self):
        plan=copy.deepcopy(self.plan);plan['pages'][0]['referenceChoices'][0]['id']='rejected'
        self.assertTrue(any('excluded reference' in e for e in validate(plan,self.text,self.choices)[0]))

    def test_part_range_does_not_drop_last_frame(self):
        plan=copy.deepcopy(self.plan);plan['parts'][0]['endFrameExclusive']=599
        self.assertIn('Delivery parts do not cover the complete timeline',validate(plan,self.text,self.choices)[0])

    def test_unexplained_scene_gap_is_rejected(self):
        plan=copy.deepcopy(self.plan);plan['pages'][1]['startFrame']=301
        self.assertTrue(any('gap/overlap' in e for e in validate(plan,self.text,self.choices)[0]))

    def test_explicit_no_screen_words_is_valid_for_media(self):
        plan=copy.deepcopy(self.plan);plan['pages'][0]['exactScreenWords']=[]
        self.assertFalse(validate(plan,self.text,self.choices)[0])

    def test_missing_screen_words_is_still_rejected(self):
        plan=copy.deepcopy(self.plan);del plan['pages'][0]['exactScreenWords']
        self.assertIn('0: missing exactScreenWords',validate(plan,self.text,self.choices)[0])

    def cli_plan(self):
        root=project_root();_,catalog=load_references(root)
        plan=copy.deepcopy(self.plan);plan['script']['path']='script.txt'
        plan['referenceCatalogRevision']=catalog['catalogRevision']
        guide=packet(root,'prompt-reading')
        for page in plan['pages']:
            page['referenceChoices']=[]
            page['referenceDisposition']={'mode':'preserved-media','reason':'Use the supplied screen recording'}
            page['sceneGuide']={'type':'prompt-reading','modifiers':[],
                'signature':guide['guideSignature'],'applications':[
                    {'ruleId':rule['id'],'decision':'Preserve the recorded content and cue timing',
                     'check':'Compare the assigned narration and transition cue'} for rule in guide['rules']]}
        return plan

    def run_cli(self,plan,flags=None):
        if flags is None: flags=['--require-scene-guides','--require-reference-usage','--scene-id','1']
        with tempfile.TemporaryDirectory() as directory:
            base=Path(directory);(base/'script.txt').write_text(self.text)
            path=base/'manifest.json';path.write_text(json.dumps(plan))
            result=subprocess.run([sys.executable,str(Path(__file__).resolve().with_name('validate_storyboard.py')),
                '--manifest',str(path),*flags],cwd=project_root(),capture_output=True,text=True)
        return result.returncode,json.loads(result.stdout)

    def test_local_revision_preserves_untouched_old_signature(self):
        plan=self.cli_plan();plan['pages'][0]['sceneGuide']['signature']='previous-accepted-guide'
        code,result=self.run_cli(plan)
        self.assertEqual((code,result['errors']),(0,[]))

    def test_local_revision_does_not_require_untouched_scene_guide(self):
        plan=self.cli_plan();del plan['pages'][0]['sceneGuide']
        code,result=self.run_cli(plan)
        self.assertEqual((code,result['errors']),(0,[]))

    def test_local_revision_still_rejects_target_old_signature(self):
        plan=self.cli_plan();plan['pages'][1]['sceneGuide']['signature']='previous-accepted-guide'
        code,result=self.run_cli(plan)
        self.assertEqual(code,1)
        self.assertIn('1: scene guidance changed; re-read this scene packet',result['errors'])

    def test_local_revision_still_checks_global_narration_and_timing(self):
        plan=self.cli_plan();plan['pages'][0]['sourceSpans'][0]['text']='Changed narration'
        plan['pages'][0]['durationInFrames']=299
        code,result=self.run_cli(plan)
        self.assertEqual(code,1)
        self.assertIn('0: sourceSpan changed the narration',result['errors'])
        self.assertTrue(any('gap/overlap' in error for error in result['errors']))

    def test_unknown_scope_fails_without_reference_usage_flag(self):
        code,result=self.run_cli(self.cli_plan(),['--require-scene-guides','--scene-id','unknown'])
        self.assertEqual(code,1)
        self.assertIn('Unknown target scenes: unknown',result['errors'])

    def test_full_plan_still_checks_all_scene_guides(self):
        plan=self.cli_plan();plan['pages'][0]['sceneGuide']['signature']='previous-accepted-guide'
        code,result=self.run_cli(plan,['--require-scene-guides'])
        self.assertEqual(code,1)
        self.assertIn('0: scene guidance changed; re-read this scene packet',result['errors'])


if __name__ == '__main__':
    unittest.main()
