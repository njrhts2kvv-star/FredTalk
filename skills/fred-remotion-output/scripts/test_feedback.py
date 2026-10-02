"""Behavioral checks for scoped rule lookup and unchanged asset selection."""
import json
import subprocess
import sys
import unittest
from pathlib import Path
from common import project_root, load_references
from feedback import load_feedback, select_rules, guidance_for


class FeedbackTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = project_root()
        cls.data = load_feedback(cls.root)

    def test_full_prompt_finds_content_and_camera_checks(self):
        result = select_rules(self.data, '提示词')
        rule = next(r for r in result if r['id'] == 'F02')
        self.assertTrue(rule['checks'])
        self.assertTrue(rule['scope'])
        self.assertTrue(any(e['episode'] == '94' for e in rule['evidence']))

    def test_fixed_background_and_device_movement_are_separate(self):
        result = select_rules(self.data, '电脑上移')
        self.assertEqual([r['id'] for r in result], ['F07'])
        moving = select_rules(self.data, item_id='F06')[0]
        self.assertNotEqual(moving['when'], result[0]['when'])

    def test_episode_filter_has_only_supported_rules(self):
        result = select_rules(self.data, episode='87')
        self.assertIn('F10', [r['id'] for r in result])
        self.assertNotIn('F07', [r['id'] for r in result])
        self.assertTrue(all(any(e['episode'] == '87' for e in r['evidence']) for r in result))

    def test_unknown_query_does_not_return_generic_rules(self):
        self.assertEqual(guidance_for(self.data, [], 'no-such-motion-zz984'), [])

    def test_common_compound_phrases_find_scoped_constraints(self):
        self.assertIn('F11', [r['id'] for r in select_rules(self.data, '飞书真实截图')])
        self.assertIn('F07', [r['id'] for r in select_rules(self.data, '叠重点')])

    def test_exact_asset_can_receive_rules_without_filename_noise(self):
        entries = [{'title': '电脑屏幕推进', 'sourceCode': '/unrelated/人物/提示词.tsx'}]
        ids = [r['id'] for r in guidance_for(self.data, entries)]
        self.assertIn('F06', ids)
        self.assertNotIn('F13', ids)

    def test_default_asset_query_returns_guidance_and_preserves_selection(self):
        command = [sys.executable, str(Path(__file__).resolve().with_name('references.py')),
                   '--kind', 'clips', '--episode', '94', '--query', '提示词']
        result = subprocess.run(command, cwd=self.root, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        self.assertEqual(data['selectionRevision'], load_references(self.root)[0]['selectionRevision'])
        self.assertGreater(data['count'], 0)
        self.assertTrue(all(e['recordType'] == 'clip' for e in data['entries']))
        self.assertIn('F02', [r['id'] for r in data['guidance']])
        self.assertTrue(all(e.get('savedSourceCode') for e in data['entries']))

    def test_rule_id_is_distinct_from_preferred_asset_identity(self):
        command = [sys.executable, str(Path(__file__).resolve().with_name('references.py')),
                   '--kind', 'rules', '--id', 'F07']
        result = subprocess.run(command, cwd=self.root, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['entries'][0]['recordType'], 'feedback-rule')
        self.assertNotIn('status', data['entries'][0])


if __name__ == '__main__':
    unittest.main()
