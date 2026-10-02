"""Transition annotations cannot override current reference choices or source identity."""
import copy
import unittest
import tempfile
import json
import hashlib
from pathlib import Path
from transitions import select_patterns, load_patterns


class TransitionTests(unittest.TestCase):
    def setUp(self):
        self.catalog = {'components': [{'id': 'clip', 'status': 'keep', 'collectionId': 'library',
            'referenceSha256': 'hash1', 'duration': 8, 'fps': 30, 'sourceCode': [],
            'media': {'path': '/source.mp4'}}]}
        self.library = {'items': [{'id': 'T01', 'title': '胶囊交替缩放', 'useWhen': '观点接力',
            'sceneTypes': ['summary'], 'tags': ['缩小'], 'examples': [{'referenceId': 'clip',
            'sourceSha256': 'hash1', 'startFrame': 15, 'endFrameExclusive': 90,
            'fps': 30, 'startSeconds': .5, 'endSeconds': 3}]}]}

    def test_scene_and_query_filters(self):
        self.assertEqual(len(select_patterns(self.library, self.catalog, query='缩小', scene_type='summary')), 1)
        self.assertEqual(select_patterns(self.library, self.catalog, scene_type='device-demo'), [])
        self.assertEqual(select_patterns(self.library, self.catalog, collection='other'), [])

    def test_rejected_or_merged_source_is_not_reintroduced(self):
        self.catalog['components'][0]['status'] = 'drop'
        self.assertEqual(select_patterns(self.library, self.catalog, item_id='T01'), [])
        self.catalog['components'][0].update(status='keep', canonicalId='other')
        self.assertEqual(select_patterns(self.library, self.catalog), [])

    def test_new_media_identity_requires_reinspection(self):
        self.catalog['components'][0]['referenceSha256'] = 'hash2'
        with self.assertRaises(ValueError): select_patterns(self.library, self.catalog)

    def test_frame_range_and_seconds_must_match(self):
        self.library['items'][0]['examples'][0]['endSeconds'] = 20
        with self.assertRaises(ValueError): select_patterns(self.library, self.catalog)

    def test_explicit_local_keep_does_not_restore_rejected_whole_scene(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            refs = root / 'skills/fred-remotion-output/references'
            refs.mkdir(parents=True)
            evidence = root / 'review.json'
            evidence.write_text(json.dumps({'decisions': {'transitions:T01': {
                'decision': 'keep', 'referenceId': 'T01', 'kind': 'transitions'}}}))
            sha = hashlib.sha256(evidence.read_bytes()).hexdigest()
            library = copy.deepcopy(self.library)
            library.update(schemaVersion=1, evidence={'path': 'review.json', 'sha256': sha})
            library['items'][0]['selection'] = {'path': 'review.json', 'sha256': sha,
                'decisionKey': 'transitions:T01', 'status': 'keep'}
            (refs / 'transition-patterns.json').write_text(json.dumps(library))
            self.catalog['components'][0]['status'] = 'drop'
            loaded = load_patterns(root)
            self.assertEqual(len(select_patterns(loaded, self.catalog)), 1)
            self.assertEqual(self.catalog['components'][0]['status'], 'drop')
            self.catalog['components'][0]['referenceSha256'] = 'new-media'
            with self.assertRaises(ValueError): select_patterns(loaded, self.catalog)
            evidence.write_text('{}')
            with self.assertRaises(ValueError): load_patterns(root)


if __name__ == '__main__': unittest.main()
