"""Compound narration queries must use the same metadata as the visual library."""
import tempfile
import unittest
from pathlib import Path

from library_matching import match_metadata, rank_references


class MatchingTests(unittest.TestCase):
    def test_confirmed_merge_is_shared_without_legacy_web_rules(self):
        import json
        from library_matching import library_disposition, library_merge_labels
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path = root / 'skills/fred-remotion-output/references/visual-usage-registry.json'
            path.parent.mkdir(parents=True)
            path.write_text(json.dumps({'confirmedMerges': {'SP015': {'representative': 'SP016'}}}))
            entry = {'displayLabel': 'SP015'}
            self.assertEqual(library_disposition(root, entry), 'merged')
            self.assertEqual(library_merge_labels(root, entry), ['SP016'])
            self.assertIsNone(library_disposition(root, {'displayLabel': 'SP016'}))

    def test_compound_media_handoff_ranks_the_actual_relationship_first(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            entries = [
                {'id': 'plain', 'title': '图片与作品展示', 'tags': ['图片'], 'status': 'keep'},
                {'id': 'handoff', 'title': '手机横屏流程转为竖屏与窗口并列',
                 'motionDescription': '窗口让位后接管内容', 'status': 'keep'},
                {'id': 'text', 'title': '黑色胶囊逐行建立标题', 'status': 'keep'},
            ]
            matches = rank_references(root, entries, '横竖媒体接力')
            self.assertEqual(matches[0]['id'], 'handoff')
            self.assertIn('media', matches[0]['matching']['conceptIds'])
            self.assertIn('handoff', matches[0]['matching']['conceptIds'])
            self.assertNotIn('text', [entry['id'] for entry in matches])

    def test_frontend_category_and_tags_share_one_source(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            web = root / 'tools/fred-motion-picker/web'
            web.mkdir(parents=True)
            (web / 'library.js').write_text('const libraryGroups=[{"id":"devices",'
                                           '"title":"窗口与设备","labels":["R038"]}];')
            entry = {'id': 'scene', 'displayLabel': 'R038', 'title': '窗口接管内容',
                     'tags': ['原有标签'], 'sceneTypes': ['device-demo']}
            metadata = match_metadata(root, entry)
            self.assertEqual(metadata['categoryId'], 'devices')
            self.assertIn('原有标签', metadata['tags'])
            self.assertIn('窗口与设备', metadata['tags'])
            self.assertEqual(entry['tags'], ['原有标签'])

    def test_exact_words_remain_searchable_without_known_concepts(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            entries = [{'id': 'one', 'title': '荧光笔选中具体段落'},
                       {'id': 'two', 'title': '输入框'}]
            self.assertEqual([row['id'] for row in rank_references(root, entries, '荧光笔')], ['one'])

class ProductionUseTests(unittest.TestCase):
    def registry(self, root):
        folder = root / 'skills/fred-remotion-output/references'
        folder.mkdir(parents=True)
        import json
        (folder / 'visual-usage-registry.json').write_text(json.dumps({
            'categories': [{'id': 'explain', 'title': '讲解段落'}],
            'sources': [{'id': 'ep107', 'title': '第107期精选'}],
            'entries': {'107-05': {'primaryUse': 'explain', 'useIds': ['explain'],
                'sourceId': 'ep107', 'conceptIds': ['text', 'summary'],
                'inputObjects': ['文字'], 'action': '结论让位，两项原因刷入',
                'segmentRole': '一段解释', 'nativeDurationSeconds': 4,
                'adaptation': '按口播重排阅读窗口', 'tags': ['讲解段落', '文字']}}}))

    def test_example_copy_does_not_make_capsule_a_media_reference(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.registry(root)
            entry = {'displayLabel': '107-05', 'title': '结论让位',
                     'useWhen': '用来讲视频制作', 'sceneTypes': ['summary']}
            metadata = match_metadata(root, entry)
            self.assertEqual(metadata['categoryId'], 'explain')
            self.assertEqual(metadata['useIds'], ['explain'])
            self.assertEqual(metadata['sourceId'], 'ep107')
            self.assertNotIn('media', metadata['conceptIds'])
            self.assertEqual(metadata['nativeDurationSeconds'], 4)

    def test_narration_duration_query_reads_production_use(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.registry(root)
            entry = {'id': 'one', 'displayLabel': '107-05', 'title': '结论让位'}
            result = rank_references(root, [entry], '讲解一段20秒内容')
            self.assertEqual(result[0]['id'], 'one')
            self.assertIn('explain', result[0]['matching']['matchedUseIds'])


if __name__ == '__main__':
    unittest.main()

class ScenarioSearchTests(unittest.TestCase):
    def test_scenario_name_is_searchable_and_keeps_original_use(self):
        import json
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path = root / 'skills/fred-remotion-output/references'
            path.mkdir(parents=True)
            (path / 'visual-usage-registry.json').write_text(json.dumps({
                'entries': {'C001': {'primaryUse': 'explain', 'scenarioId': 'focus',
                                     'scenarioTitle': '局部放大与标注', 'conceptIds': []}}}))
            entry = {'displayLabel': 'C001', 'id': 'one'}
            rows = rank_references(root, [entry], '局部放大与标注')
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]['matching']['scenarioId'], 'focus')
            self.assertEqual(rows[0]['matching']['categoryId'], 'explain')
