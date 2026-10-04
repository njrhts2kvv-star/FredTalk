import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('portable_gate', ROOT/'skills/fred-remotion-output/scripts/library_gate.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)

class DeliveryGateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name)
        (self.base/'preview.png').write_bytes(b'preview')
        self.media = {'path':'preview.png', 'sha256':hashlib.sha256(b'preview').hexdigest()}
        self.catalog = {'revision':'test', 'items':{'C008':{'mediaHashes':[self.media['sha256']], 'sourceHashes':[]}}}
        self.page = {'stableId':'s1','implementationMode':'adapted',
            'referenceChoices':[{'id':'C008','reason':'Explain the next step','preserve':'Object handoff',
                'change':'Use current words','useScope':'Full scene'}],
            'componentPlan':{'inspectedReferences':[dict(self.media,id='C008',observations='The first object introduces the second')]}}
        self.manifest = {'referenceCatalogRevision':'test','pages':[self.page]}

    def tearDown(self):
        self.tmp.cleanup()

    def accept(self, stage='suggestion'):
        self.page['componentAcceptance'] = {'status':'passed','stage':stage,'reviewer':'assistant',
            'contextSha256':gate.acceptance_signature(self.manifest,self.page,stage),
            'checks':dict(semanticFit='Step-by-step explanation',corePreserved='Object handoff',visualQuality='Inspected actual preview'),
            'evidence':[self.media]}

    def test_real_preview_acceptance_passes(self):
        self.accept()
        self.assertEqual(gate.validate_library_gate(self.manifest,'suggestion',self.base,self.catalog),[])

    def test_missing_and_stale_acceptance_fail(self):
        self.assertTrue(gate.validate_library_gate(self.manifest,'suggestion',self.base,self.catalog))
        self.accept(); self.page['sourceSpans']=[{'text':'Changed narration'}]
        self.assertTrue(gate.validate_library_gate(self.manifest,'suggestion',self.base,self.catalog))

    def test_unknown_reference_and_foreign_evidence_fail(self):
        self.page['referenceChoices'][0]['id']='hidden'
        self.accept()
        self.assertTrue(gate.validate_library_gate(self.manifest,'suggestion',self.base,self.catalog))

    def test_original_needs_current_authorization(self):
        self.page['implementationMode']='original'
        self.accept()
        self.assertTrue(gate.validate_library_gate(self.manifest,'suggestion',self.base,self.catalog))

    def test_media_hash_is_checked(self):
        self.page.update(implementationMode='preserved-media',referenceChoices=[],mediaContract=[self.media])
        self.assertEqual(gate.validate_library_gate(self.manifest,'suggestion',self.base,self.catalog),[])
        (self.base/'preview.png').write_bytes(b'changed')
        self.assertTrue(gate.validate_library_gate(self.manifest,'suggestion',self.base,self.catalog))

    def test_placeholder_cannot_hide_animation(self):
        self.page.update(implementationMode='talk-only',recordingPlaceholder={'requiredShot':'Record settings'},productionRoute={'selected':'remotion'})
        self.assertTrue(gate.validate_library_gate(self.manifest,'suggestion',self.base,self.catalog))

    def keyframe_scene(self, invoke=True):
        source = self.base/'source.tsx'; source.write_text('export function Original() { return null; }')
        implementation = self.base/'adapted.tsx'; implementation.write_text('export function Adapted() { return null; }')
        call = self.base/'entry.tsx'; call.write_text('export function Scene() { '+('return <Adapted />;' if invoke else '// <Adapted />\nreturn null;')+' }')
        def record(path, symbol):
            return dict(path=str(path), sha256=hashlib.sha256(path.read_bytes()).hexdigest(), symbol=symbol)
        ref = self.page['referenceChoices'][0]
        ref.update(source=record(source,'Original'),implementation=record(implementation,'Adapted'),callSite=dict(record(call,'Scene'),callee='Adapted'))
        self.catalog['items']['C008']['sourceHashes']=[ref['source']['sha256']]
        self.page['keyframeReview']={'frames':[self.media], 'sourceFiles':[ref['implementation']]}
        self.accept('keyframes')

    def test_keyframe_actual_call_passes(self):
        self.keyframe_scene()
        self.assertEqual(gate.validate_library_gate(self.manifest,'keyframes',self.base,self.catalog),[])

    def test_source_symbol_must_exist(self):
        self.keyframe_scene()
        self.page['referenceChoices'][0]['source']['symbol']='MissingFunction'
        self.accept('keyframes')
        self.assertTrue(gate.validate_library_gate(self.manifest,'keyframes',self.base,self.catalog))

    def test_commented_call_is_not_execution_evidence(self):
        self.keyframe_scene(False)
        self.assertTrue(gate.validate_library_gate(self.manifest,'keyframes',self.base,self.catalog))

    def test_keyframe_delivery_needs_output_and_call_evidence(self):
        self.accept('keyframes')
        self.assertTrue(gate.validate_library_gate(self.manifest,'keyframes',self.base,self.catalog))

if __name__ == '__main__':
    unittest.main()
