"""Exercise episode-local frontend evidence and reject stale or escaped sources."""
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from common import digest
from verify_feedback import verify


class FeedbackEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        base = Path(self.tmp.name)
        self.root = base / 'tools'
        self.root.mkdir()
        self.episodes = base / 'episodes'
        self.episodes.mkdir()
        (self.root / '00_每期项目').symlink_to(self.episodes, target_is_directory=True)
        folder = self.episodes / '99-example'
        folder.mkdir()
        self.source = folder / 'feedback.json'
        self.source.write_text(json.dumps({'feedback': {'s08': {
            'choice': 'keep', 'note': 'Improve the chat', 'reviewedVersion': 'old-hash'}}}))
        self.row = {'episode': '99', 'timestamp': None, 'recordedAt': '2026-09-21',
                    'originalPath': '00_每期项目/99-example/feedback.json',
                    'originalSha256': digest(self.source), 'originalPointer': '/feedback/s08',
                    'stableId': 's08', 'choice': 'keep', 'reviewedVersion': 'old-hash',
                    'text': 'Improve the chat'}
        self.evidence = folder / 'evidence.jsonl'

    def run_verify(self, episode=None):
        self.evidence.write_text(json.dumps(self.row) + '\n')
        item = {'episode': '99', 'kind': 'user-feedback',
                'path': '00_每期项目/99-example/evidence.jsonl', 'line': 1,
                'timestamp': None, 'quote': 'Improve the chat', 'sha256': digest(self.evidence)}
        rule = {k: ['example'] for k in ['prefer', 'avoid', 'checks', 'keywords']}
        rule.update(id='F15', title='Feedback', when='Revision', scope='Local',
                    episodes=['99'], evidence=[item])
        with patch('verify_feedback.load_feedback', return_value={'revision': 'test', 'rules': [rule]}), \
             patch('verify_feedback.load_references', return_value=({'selectionRevision': 1}, {'counts': {}})):
            return verify(self.root, episode)

    def test_keep_with_note_is_valid_evidence_without_inventing_message_time(self):
        self.assertEqual(self.run_verify()['errors'], [])

    def test_source_mutation_is_rejected(self):
        self.source.write_text('{}')
        self.assertTrue(self.run_verify()['errors'])

    def test_wrong_reviewed_version_is_rejected(self):
        self.row['reviewedVersion'] = 'new-hash'
        self.assertTrue(self.run_verify()['errors'])

    def array_source(self, pointer='/records/0'):
        self.source.write_text(json.dumps({'records': [{
            'choice': 'keep', 'note': 'Improve the chat', 'reviewedVersion': 'old-hash'}]}))
        self.row.update(originalPointer=pointer, originalSha256=digest(self.source))

    def test_export_record_array_pointer_is_supported(self):
        self.array_source()
        self.assertEqual(self.run_verify()['errors'], [])

    def test_array_pointer_rejects_negative_out_of_range_and_noncanonical_indexes(self):
        for pointer in ['/records/-1', '/records/1', '/records/00', '/records/+0', '/records/-']:
            with self.subTest(pointer=pointer):
                self.array_source(pointer)
                self.assertTrue(self.run_verify()['errors'])

    def test_array_pointer_does_not_weaken_source_or_version_checks(self):
        self.array_source()
        self.row['reviewedVersion'] = 'new-hash'
        self.assertTrue(self.run_verify()['errors'])

    def test_episode_scope_checks_only_matching_evidence_and_rejects_empty_scope(self):
        self.assertEqual(self.run_verify('99')['errors'], [])
        self.assertTrue(self.run_verify('107')['errors'])

    def test_unknown_timestamp_cannot_be_claimed_as_a_message_time(self):
        self.row['timestamp'] = '2026-09-21T00:00:00Z'
        self.assertTrue(self.run_verify()['errors'])

    def test_nested_symlink_cannot_escape_episode_root(self):
        outside = self.root.parent / 'outside.json'
        outside.write_bytes(self.source.read_bytes())
        self.source.unlink()
        self.source.symlink_to(outside)
        self.assertTrue(self.run_verify()['errors'])

    def test_registered_episode_archive_entry_is_allowed_without_trusting_other_links(self):
        home = self.root.parent / 'home'
        archive = home / 'Desktop/FredTalk视频/项目归档/00_每期项目-archive/99-example'
        archive.parent.mkdir(parents=True)
        folder = self.source.parent
        shutil.move(str(folder), str(archive))
        folder.symlink_to(archive, target_is_directory=True)
        with patch('verify_feedback.Path.home', return_value=home):
            self.assertEqual(self.run_verify()['errors'], [])
            outside = self.root.parent / 'outside.json'
            outside.write_bytes(self.source.read_bytes())
            self.source.unlink()
            self.source.symlink_to(outside)
            self.assertTrue(self.run_verify()['errors'])

    def test_unregistered_localized_archive_link_remains_rejected(self):
        home = self.root.parent / 'home'
        registered = home / 'Desktop/FredTalk视频/项目归档/00_每期项目-archive/99-example'
        local = home / 'LocalArchives/FredTalkArchive/00_每期项目-archive/99-example'
        registered.parent.mkdir(parents=True)
        local.parent.mkdir(parents=True)
        folder = self.source.parent
        shutil.move(str(folder), str(local))
        registered.symlink_to(local, target_is_directory=True)
        folder.symlink_to(registered, target_is_directory=True)
        with patch('verify_feedback.Path.home', return_value=home):
            self.assertTrue(self.run_verify()['errors'])


if __name__ == '__main__':
    unittest.main()
