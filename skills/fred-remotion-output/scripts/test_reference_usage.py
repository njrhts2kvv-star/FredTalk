import copy
import hashlib
from pathlib import Path
import tempfile
import unittest
from reference_usage import validate_reference_usage

class ReferenceUsageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        (self.base/'source.tsx').write_text('export const Input = () => null;')
        (self.base/'scene.tsx').write_text('export const Scene = () => <Input/>;')
        def record(name, symbol):
            return {'path':name,'sha256':hashlib.sha256((self.base/name).read_bytes()).hexdigest(),'symbol':symbol}
        self.source = record('source.tsx','Input')
        self.catalog = {'catalogRevision':'r1','components':[{'id':'input','status':'keep','sourceFiles':[self.source]}],'clips':[]}
        self.manifest = {'referenceCatalogRevision':'r1','pages':[{'stableId':'scene', 'referenceChoices':[{'id':'input','useMode':'full', 'source':self.source,'implementation':record('scene.tsx','Scene'),'callSite':record('scene.tsx','Input'),'keyAction':'输入后发送，第二次输入体现重复劳动'}]}]}
    def check(self):
        return validate_reference_usage(self.manifest,self.catalog,self.base)
    def test_new_matching_contract_rejects_comment_only_call(self):
        self.manifest['workflow'] = {'componentMatching': 'v1'}
        (self.base/'scene.tsx').write_text('export const Scene = () => <div/>; // Scene is mentioned only\n')
        r=self.manifest['pages'][0]['referenceChoices'][0]
        r['implementation']={'path':'scene.tsx','sha256':hashlib.sha256((self.base/'scene.tsx').read_bytes()).hexdigest(),'symbol':'Scene'}
        r['callSite']={**r['implementation'], 'callee':'Scene'}
        self.assertTrue(any('call expression' in e for e in self.check()))
    def test_new_matching_contract_accepts_mounted_adapted_function(self):
        self.manifest['workflow'] = {'componentMatching': 'v1'}
        (self.base/'scene.tsx').write_text('export const Scene = () => <Input/>; export const Root=()=> <Scene/>;')
        r=self.manifest['pages'][0]['referenceChoices'][0]
        h=hashlib.sha256((self.base/'scene.tsx').read_bytes()).hexdigest()
        r['implementation']={'path':'scene.tsx','sha256':h,'symbol':'Scene'}
        r['callSite']={'path':'scene.tsx','sha256':h,'symbol':'Root','callee':'Scene'}
        self.assertEqual(self.check(),[])
    def test_new_matching_contract_rejects_unrelated_callee(self):
        self.manifest['workflow'] = {'componentMatching': 'v1'}
        self.manifest['pages'][0]['referenceChoices'][0]['callSite']['callee']='Input'
        self.assertTrue(any('implementation symbol' in e for e in self.check()))
    def test_source_bound_adaptation_passes(self):
        self.assertEqual(self.check(),[])
    def test_optional_source_can_be_used_without_claiming_approval(self):
        self.catalog['components'][0].update(status='optional', approvalScope='Candidate; not reviewed')
        self.assertEqual(self.check(), [])
        self.assertEqual(self.catalog['components'][0]['status'], 'optional')
    def test_registered_current_revision_is_allowed_only_for_its_reference(self):
        (self.base/'current.tsx').write_text('export const Input = () => 1;')
        source = {'path': 'current.tsx', 'symbol': 'Input',
                  'sha256': hashlib.sha256((self.base/'current.tsx').read_bytes()).hexdigest()}
        self.manifest['pages'][0]['referenceChoices'][0]['source'] = source
        self.catalog['components'][0]['currentSourceCode'] = [source]
        self.assertEqual(self.check(), [])
        self.catalog['components'][0].pop('currentSourceCode')
        self.catalog['components'].append({'id': 'other', 'status': 'keep', 'currentSourceCode': [source]})
        self.assertTrue(any('source does not belong' in e for e in self.check()))
    def test_latest_library_removal_blocks_new_attribution(self):
        self.catalog['components'][0]['libraryDisposition'] = 'removed'
        self.assertTrue(any('excluded' in e for e in self.check()))
    def test_wrong_reference_source_fails(self):
        self.catalog['components'][0]['sourceFiles']=[{'sha256':'wrong'}]
        self.assertTrue(any('source does not belong' in e for e in self.check()))
    def test_source_code_change_invalidates_claim(self):
        (self.base/'scene.tsx').write_text('export const Scene = () => null;')
        self.assertTrue(any('hash mismatch' in e for e in self.check()))
    def test_comment_only_attribution_without_files_fails(self):
        del self.manifest['pages'][0]['referenceChoices'][0]['implementation']
        self.assertTrue(any('implementation' in e for e in self.check()))
    def test_new_catalog_and_rejection_fail(self):
        self.catalog['catalogRevision']='r2';self.catalog['components'][0]['status']='drop'
        self.assertTrue(any('catalog revision' in e for e in self.check()))
        self.assertTrue(any('excluded' in e for e in self.check()))
    def test_original_scene_does_not_need_fake_reference(self):
        self.manifest['pages'][0].update(referenceChoices=[],referenceDisposition={'mode':'original','reason':'同一条录音被找到，需要为本段设计'})
        self.assertEqual(self.check(),[])
    def test_empty_references_need_explanation(self):
        self.manifest['pages'][0]['referenceChoices']=[]
        self.assertTrue(any('referenceDisposition' in e for e in self.check()))
    def test_missing_symbol_fails(self):
        self.manifest['pages'][0]['referenceChoices'][0]['callSite']['symbol']='Unrelated'
        self.assertTrue(any('symbol not found' in e for e in self.check()))
    def test_non_library_scene_does_not_need_catalog_revision(self):
        self.manifest['pages'][0].update(referenceChoices=[],referenceDisposition={'mode':'preserved-media','reason':'Use the actual recording'})
        del self.manifest['referenceCatalogRevision']
        self.assertEqual(self.check(),[])
    def test_scoped_non_library_revision_does_not_revalidate_untouched_code(self):
        self.manifest['pages'].append({'stableId':'media','referenceChoices':[],
            'referenceDisposition':{'mode':'preserved-media','reason':'Replace the recording only'}})
        self.manifest['referenceCatalogRevision']='older-catalog'
        self.assertEqual(validate_reference_usage(self.manifest,self.catalog,self.base,['media']),[])
    def test_scoped_code_reference_still_requires_current_catalog(self):
        self.manifest['referenceCatalogRevision']='older-catalog'
        errors=validate_reference_usage(self.manifest,self.catalog,self.base,['scene'])
        self.assertTrue(any('catalog revision' in error for error in errors))
    def test_unknown_scope_is_rejected_even_without_code_references(self):
        self.manifest['pages'][0].update(referenceChoices=[],referenceDisposition={'mode':'original','reason':'New visual'})
        errors=validate_reference_usage(self.manifest,self.catalog,self.base,['unknown'])
        self.assertIn('Unknown target scenes: unknown',errors)
