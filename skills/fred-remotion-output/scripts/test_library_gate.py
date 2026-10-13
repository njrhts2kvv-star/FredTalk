import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from library_gate import validate_library_gate, acceptance_signature


class LibraryGateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        p = self.base / 'preview.png'
        p.write_bytes(b'preview fixture')
        self.file = {'path': str(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
        self.catalog = {'components': [{'id': 'approved', 'status': 'keep', 'media': self.file}], 'clips': []}
        self.page = {'stableId': 's1', 'implementationMode': 'adapted', 'sourceSpans': [{'text': 'inputs merge'}],
                     'referenceChoices': [{'id': 'approved', 'reason': 'inputs converge', 'preserve': 'convergence',
                                           'change': 'new labels', 'useScope': 'whole motion'}],
                     'componentPlan': {'query': 'inputs converge', 'candidates': [
                         {'id': 'approved', 'decision': 'selected', 'reason': 'same relation'}],
                         'inspectedReferences': [{'id': 'approved', **self.file, 'observations': 'three inputs converge'}]}}
        self.m = {'pages': [self.page]}

    def accept(self, stage='suggestion'):
        self.page['componentAcceptance'] = {'status': 'passed', 'stage': stage, 'reviewer': 'assistant',
            'checks': {k: 'Checked against actual selected reference' for k in
                       ['semanticFit', 'corePreserved', 'visualQuality']}, 'evidence': [self.file],
            'contextSha256': acceptance_signature(self.m, self.page, stage)}

    def errors(self, stage='suggestion'):
        return validate_library_gate(self.m, stage, self.base, self.catalog)

    def test_missing_acceptance_blocks(self):
        self.assertTrue(self.errors())

    def test_valid_selection_passes(self):
        self.accept()
        self.assertEqual(self.errors(), [])

    def use_clip_sources(self):
        self.catalog = {'components': [], 'clips': [
            {'id': 'approved', 'status': 'keep', 'sources': [self.file]}]}

    def test_registered_clip_sources_preview_passes(self):
        self.use_clip_sources()
        self.accept()
        self.assertEqual(self.errors(), [])

    def test_unregistered_clip_sources_hash_blocks(self):
        self.use_clip_sources()
        p = self.base / 'unregistered.png'
        p.write_bytes(b'unregistered preview')
        self.page['componentPlan']['inspectedReferences'][0].update(
            path=str(p), sha256=hashlib.sha256(p.read_bytes()).hexdigest())
        self.accept()
        self.assertIn('s1: inspected evidence does not belong to selected library media', self.errors())

    def test_registered_clip_sources_changed_file_blocks(self):
        self.use_clip_sources()
        Path(self.file['path']).write_bytes(b'changed actual file')
        self.accept()
        self.assertIn('s1/inspected: evidence hash missing or changed', self.errors())

    def test_original_requires_explicit_current_scope(self):
        self.page['implementationMode'] = 'original'
        self.page['referenceChoices'] = []
        self.accept()
        self.assertTrue(self.errors())
        self.m['workflow'] = {'authorization': {'mode': 'direct-output', 'source': 'generate now'}}
        self.accept()
        self.assertTrue(self.errors())

    def test_talk_only_cannot_hide_remotion(self):
        self.page.update(implementationMode='talk-only', referenceChoices=[])
        self.accept()
        self.assertTrue(self.errors())

    def test_real_recording_placeholder_allowed(self):
        self.page.clear()
        self.page.update(stableId='s1', implementationMode='talk-only', recordingPlaceholder={'requiredShot': 'record actual import screen'})
        self.assertEqual(self.errors(), [])

    def test_placeholder_cannot_wrap_remotion(self):
        self.page['recordingPlaceholder'] = {'requiredShot': 'record screen'}
        self.assertTrue(self.errors())

    def test_unknown_or_dropped_reference_blocks(self):
        self.catalog['components'][0]['status'] = 'drop'
        self.accept()
        self.assertTrue(self.errors())

    def test_changed_narration_invalidates_acceptance(self):
        self.accept()
        self.page['sourceSpans'][0]['text'] = 'new relation'
        self.assertTrue(self.errors())

    def test_missing_preview_and_hash_mismatch_block(self):
        self.accept()
        self.page['componentPlan']['inspectedReferences'][0]['sha256'] = '0' * 64
        self.assertTrue(self.errors())

    def test_keyframe_stage_requires_code_and_real_frames(self):
        self.accept('keyframes')
        self.assertTrue(self.errors('keyframes'))

    def test_empty_manifest_blocks(self):
        self.m['pages'] = []
        self.assertTrue(self.errors())

    def test_real_builder_blocks_before_overwriting_output(self):
        from build_segment_review import build
        manifest = self.base / 'manifest.json'
        output = self.base / 'index.html'
        manifest.write_text(json.dumps({'pages': [{'stableId': 's', 'implementationMode': 'original'}]}))
        output.write_text('existing review must survive')
        with self.assertRaisesRegex(ValueError, 'Library delivery gate FAIL'):
            build(manifest, output)
        self.assertEqual(output.read_text(), 'existing review must survive')




class DistributionSummaryTests(unittest.TestCase):
    def test_summary_flags_heavy_original_without_blocking(self):
        from library_gate import distribution_summary
        catalog = {'components': [{'id': 'a', 'collectionId': 'x'}], 'clips': []}
        manifest = {'pages': [{'implementationMode': 'original'}, {'implementationMode': 'original'},
                              {'implementationMode': 'adapted', 'referenceChoices': [{'id': 'a'}]}]}
        summary = distribution_summary(manifest, catalog)
        self.assertEqual(summary['distinctComponents'], 1)
        self.assertTrue(any('原创' in note for note in summary['advisoryNotes']))


if __name__ == '__main__':
    unittest.main()
