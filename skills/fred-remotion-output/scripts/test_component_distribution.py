"""Behavioral checks for whole-episode selection, including the EP109 failure."""
from copy import deepcopy
from pathlib import Path
import hashlib
import tempfile
import unittest

from component_distribution import analyze, validate_distribution


def scene(sid, rid='list', symbol='ConclusionList', source_hash='a' * 64):
    return {'stableId': sid, 'implementationMode': 'adapted', 'oneQuestion': sid,
            'referenceChoices': [{'id': rid, 'source': {'sha256': source_hash, 'symbol': symbol}}]}


class DistributionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)
        self.evidence = self.base / 'observed-strip.png'
        self.evidence.write_bytes(b'inspected comparison fixture')

    def tearDown(self):
        self.temp.cleanup()

    def reviewed(self, manifest, kind='continuous-object'):
        audit = analyze(manifest)
        manifest['componentDistributionReview'] = {
            'status': 'passed', 'reviewedBy': 'assistant', 'contextSha256': audit['contextSha256'],
            'decisions': [{'groupKey': group['groupKey'], 'sceneIds': group['sceneIds'],
                           'reuseKind': kind, 'reason': 'The same inspected carrier continues between these beats.',
                           'comparisons': [{'stableId': sid, 'task': 'Explain the next concrete source item.',
                                            'visibleState': 'Retain the shared report and focus a different ROI.',
                                            'reusePurpose': 'Continue the object rather than restart a new card.'}
                                           for sid in group['sceneIds']],
                           'evidence': [{'path': str(self.evidence),
                                         'sha256': hashlib.sha256(self.evidence.read_bytes()).hexdigest()}]}
                          for group in audit['groups']]}
        return manifest

    def test_ep109_six_unrelated_list_scenes_are_not_silently_accepted(self):
        manifest = {'pages': [scene(sid) for sid in ['S02', 'S14', 'S17', 'S20', 'S22', 'S26']]}
        audit = analyze(manifest)
        self.assertEqual(audit['groups'][0]['sceneIds'], ['S02', 'S14', 'S17', 'S20', 'S22', 'S26'])
        self.assertTrue(validate_distribution(manifest, self.base))

    def test_catalog_aliases_collapse_even_without_source_bindings(self):
        manifest = {'pages': [scene('A', 'old'), scene('B', 'new', 'Other', 'b' * 64)]}
        for page in manifest['pages']:
            page['referenceChoices'][0].pop('source')
        catalog = {'components': [{'id': 'old', 'canonicalId': 'new'}, {'id': 'new'}]}
        self.assertEqual(analyze(manifest, catalog)['groups'][0]['canonicalIds'], ['new'])

    def test_shared_dispatch_source_is_only_a_candidate_not_a_merge(self):
        manifest = {'pages': [scene('A', 'one'), scene('B', 'two')]}
        audit = analyze(manifest)
        self.assertFalse(audit['groups'])
        self.assertEqual(audit['sharedSourceCandidates'][0]['referenceIds'], ['one', 'two'])

    def test_actual_visual_family_can_be_bound_across_different_ids(self):
        manifest = {'pages': [scene('A', 'one'), scene('B', 'two')]}
        for page in manifest['pages']:
            page['referenceChoices'][0]['layoutFamily'] = 'conclusion-with-two-pills'
        self.assertEqual(analyze(manifest)['groups'][0]['referenceIds'], ['one', 'two'])

    def test_different_symbols_in_one_source_file_are_not_merged(self):
        manifest = {'pages': [scene('A', 'one', 'Report'), scene('B', 'two', 'Comparison')]}
        self.assertFalse(analyze(manifest)['groups'])

    def test_continuous_carrier_can_repeat_without_a_frequency_quota(self):
        manifest = {'pages': [scene('S09'), scene('S10')]}
        self.assertFalse(validate_distribution(self.reviewed(manifest), self.base))

    def test_changed_selection_invalidates_the_recorded_global_review(self):
        manifest = self.reviewed({'pages': [scene('A'), scene('B')]})
        manifest['pages'].append(scene('C'))
        self.assertTrue(validate_distribution(manifest, self.base))

    def test_reason_alone_does_not_replace_each_scene_comparison(self):
        manifest = self.reviewed({'pages': [scene('A'), scene('B')]})
        manifest['componentDistributionReview']['decisions'][0]['comparisons'].pop()
        self.assertTrue(validate_distribution(manifest, self.base))

    def test_visual_evidence_must_remain_the_observed_bytes(self):
        manifest = self.reviewed({'pages': [scene('A'), scene('B')]})
        self.evidence.write_bytes(b'changed after review')
        self.assertTrue(validate_distribution(manifest, self.base))

    def test_media_subtitles_and_fixed_inserts_do_not_create_false_repetition(self):
        manifest = {'pages': [scene('A'), scene('B')]}
        for page in manifest['pages']:
            page['implementationMode'] = 'preserved-media'
        self.assertFalse(analyze(manifest)['groups'])

    def test_single_use_has_no_extra_approval_requirement(self):
        self.assertFalse(validate_distribution({'pages': [scene('A')]}, self.base))


if __name__ == '__main__':
    unittest.main()
