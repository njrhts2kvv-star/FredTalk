"""Exact entries without a declared project root cannot claim arbitrary clip sources."""
import unittest
from pathlib import Path
from references import attach_execution


class ReferenceExecutionTests(unittest.TestCase):
    def test_entry_only_bundle_does_not_break_clip_search_or_guess_a_root(self):
        registry = {'episodeBundles': [
            {'id': 'entry-only', 'entryPoint': 'entry.tsx', 'runtime': 'runtime'},
            {'id': 'full', 'root': 'source', 'entryPoint': 'source/index.tsx'}],
            'clipBindings': [{'referenceId': 'clip', 'sourceCode': [{'path': 'source/scene.tsx'}]}]}
        result = attach_execution(Path('/project'), registry, {'id': 'clip'}, 'clip')
        self.assertEqual([x['sourceBundle'] for x in result['sourceExecutions']], ['full'])


if __name__ == '__main__':
    unittest.main()
