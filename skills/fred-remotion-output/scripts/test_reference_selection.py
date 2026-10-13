"""Selection filters and source provenance must constrain reference lookup."""
import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import common
import references

ROOT = common.project_root()
spec = importlib.util.spec_from_file_location('choices_test', ROOT / 'skills/fred-remake/scripts/query-preferred-motion.py')
choices = importlib.util.module_from_spec(spec)
spec.loader.exec_module(choices)


def fixture():
    return {'components': [
        {'id': 'summary', 'status': 'keep', 'sceneTypes': ['summary']},
        {'id': 'relationship', 'status': 'keep', 'sceneTypes': ['relationship'],
         'tags': ['内容接力'], 'number': 26, 'collectionId': 'library',
         'motionDescription': 'handoff', 'editableParameters': ['words'],
         'knownLimitations': ['static media'], 'sourceReadiness': 'saved'},
        {'id': 'merged', 'status': 'drop', 'canonicalId': 'relationship',
         'selectionDisposition': 'merged', 'sceneTypes': ['relationship']},
        {'id': 'stale-merged', 'status': 'keep', 'canonicalId': 'relationship'},
        {'id': 'rejected', 'status': 'drop', 'selectionDisposition': 'user-rejected'},
        {'id': 'optional', 'status': 'optional'},
    ], 'clips': []}


class SelectionTests(unittest.TestCase):
    def test_default_excludes_drops_and_merged_aliases(self):
        self.assertEqual([x['id'] for x in choices.select_entries(fixture())], ['summary', 'relationship'])

    def test_explicit_id_and_audit_status_resolve_alias(self):
        self.assertEqual(choices.select_entries(fixture(), item_id='merged'), [])
        self.assertEqual(choices.select_entries(fixture(), item_id='merged', status='drop')[0]['canonicalId'], 'relationship')
        self.assertEqual(len(choices.select_entries(fixture(), status='all')), 6)
        self.assertEqual(len(choices.select_entries(fixture(), status='drop')), 2)

    def test_scene_type_and_keywords(self):
        self.assertEqual([x['id'] for x in choices.select_entries(fixture(), scene_type='relationship')], ['relationship'])
        self.assertEqual([x['id'] for x in choices.select_entries(fixture(), query='内容接力')], ['relationship'])
        self.assertEqual([x['id'] for x in choices.select_entries(fixture(), query='relationship')], ['relationship'])

    def test_numeric_feedback_is_exact_not_an_id_substring(self):
        data = fixture()
        data['components'][1]['tags'].append('004')
        data['components'].append({'id': 'unrelated-4004-example', 'status': 'keep'})
        for term in ['004', '4', '#004']:
            self.assertEqual([x['id'] for x in choices.select_entries(data, query=term)], ['relationship'])

    def test_collection_scopes_number_and_cross_library_alias(self):
        data = {'components': [
            {'id': 'old', 'number': 4, 'status': 'keep', 'collectionId': 'old',
             'aliases': [{'collectionId': 'library', 'number': 2}]},
            {'id': 'new', 'number': 4, 'status': 'keep', 'collectionId': 'library'},
        ], 'clips': []}
        self.assertEqual([x['id'] for x in choices.select_entries(data, query='004', collection='library')], ['new'])
        self.assertEqual([x['id'] for x in choices.select_entries(data, query='002', collection='library')], ['old'])

    def test_display_label_resolves_optional_reference_without_neighboring_ids(self):
        data = fixture()
        data['components'] += [
            {'id': 'library-new-r014', 'displayLabel': 'R014', 'number': 14,
             'status': 'optional', 'collectionId': 'new-library'},
            {'id': 'library-old-b014', 'displayLabel': 'B014', 'number': 14,
             'status': 'keep', 'collectionId': 'old-library', 'notes': 'Compare R014'},
            {'id': 'library-new-r014-long', 'displayLabel': 'R0140', 'number': 140,
             'status': 'optional', 'collectionId': 'new-library'},
        ]
        for kwargs in [{'item_id': 'R014'}, {'query': 'R014'}, {'query': '#r014'}]:
            self.assertEqual([e['id'] for e in choices.select_entries(data, **kwargs)], ['library-new-r014'])
        self.assertEqual(choices.select_entries(data, item_id='R014', collection='old-library'), [])
        self.assertEqual([e['id'] for e in choices.select_entries(data, status='optional', query='014',
                                                                 collection='new-library')], ['library-new-r014'])
        self.assertNotIn('library-new-r014', [e['id'] for e in choices.select_entries(data)])

    def test_latest_frontend_removal_is_excluded_from_default_cli(self):
        data = fixture(); data['components'][1]['libraryDisposition'] = 'removed'
        registry = {'clipBindings': [], 'selectionRevision': 1, 'selectionMeaning': 'test'}
        with patch.object(references, 'project_root', return_value=ROOT), \
             patch.object(references, 'load_references', return_value=(registry, data)), \
             patch.object(references, 'load_feedback', return_value={'revision': 1, 'rules': []}), \
             patch.object(references, 'guidance_for', return_value=[]), \
             patch('sys.argv', ['references.py', '--query', 'relationship']):
            out = io.StringIO()
            with contextlib.redirect_stdout(out): references.main()
        self.assertEqual(json.loads(out.getvalue())['count'], 0)

    def test_exact_merged_alias_resolves_to_current_kept_representative(self):
        data = fixture()
        data['components'][1].update(libraryDisposition='merged',
            libraryMergedInto=[{'label': 'summary', 'id': 'summary'}])
        registry = {'clipBindings': [], 'selectionRevision': 1, 'selectionMeaning': 'test'}
        with patch.object(references, 'project_root', return_value=ROOT), \
             patch.object(references, 'load_references', return_value=(registry, data)), \
             patch.object(references, 'load_feedback', return_value={'revision': 1, 'rules': []}), \
             patch.object(references, 'guidance_for', return_value=[]), \
             patch('sys.argv', ['references.py', '--id', 'relationship']):
            out = io.StringIO()
            with contextlib.redirect_stdout(out): references.main()
        entry = json.loads(out.getvalue())['entries'][0]
        self.assertEqual(entry['id'], 'summary')
        self.assertEqual(entry['matchedAlias'], 'relationship')

    def test_optional_metadata_is_visible_without_full_flag(self):
        data = fixture()
        item = {'id': 'library-new-r014', 'displayLabel': 'R014', 'status': 'optional',
                'approvalScope': 'Candidate, not a reviewed sample', 'reviewStatus': 'pending',
                'originallibraryReference': {'start': 4, 'end': 8},
                'sourceReadiness': 'preserved-local', 'sourceMappingStatus': 'exact',
                'adaptationNeeds': ['Extract text fields before replacement'],
                'relatedReferences': ['B014'], 'runtime': 'library-runtime',
                'audioRole': 'reference-only', 'nativeTiming': {'fps': 60, 'durationInFrames': 300}}
        data['components'].append(item)
        registry = {'clipBindings': [], 'selectionRevision': 1, 'selectionMeaning': 'test'}
        with patch.object(references, 'project_root', return_value=ROOT), \
             patch.object(references, 'load_references', return_value=(registry, data)), \
             patch.object(references, 'load_feedback', return_value={'revision': 1, 'rules': []}), \
             patch.object(references, 'guidance_for', return_value=[]), \
             patch('sys.argv', ['references.py', '--id', 'R014']):
            out = io.StringIO()
            with contextlib.redirect_stdout(out): references.main()
        result = json.loads(out.getvalue())['entries'][0]
        self.assertEqual({key: value for key, value in result.items() if key != 'matching'},
                         {'recordType': 'component', **item})
        self.assertEqual(result['matching']['label'], 'R014')

    def test_cli_filters_before_limit_and_preserves_metadata(self):
        registry = {'clipBindings': [], 'selectionRevision': 1, 'selectionMeaning': 'test'}
        with patch.object(references, 'project_root', return_value=ROOT), \
             patch.object(references, 'load_references', return_value=(registry, fixture())), \
             patch.object(references, 'load_feedback', return_value={'revision': 1, 'rules': []}), \
             patch.object(references, 'guidance_for', return_value=[]), \
             patch.object(references, 'applicable', return_value=({}, [], [], 'signature')), \
             patch('sys.argv', ['references.py', '--scene-type', 'relationship', '--limit', '1']):
            out = io.StringIO()
            with contextlib.redirect_stdout(out): references.main()
        result = json.loads(out.getvalue())
        self.assertEqual(result['matchedCount'], 1)
        entry = result['entries'][0]
        self.assertEqual({key: value for key, value in entry.items() if key != 'matching'},
                         {'recordType': 'component', **fixture()['components'][1]})
        self.assertEqual(entry['matching']['sceneTypes'], ['relationship'])


class ExecutionTests(unittest.TestCase):
    def test_clip_source_execution_is_exposed_in_serializable_output(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = {'path': 'episode/src/Scene.tsx', 'sha256': 'a' * 64}
            registry = {'clipBindings': [{'referenceId': 'clip', 'sourceCode': [source]}],
                        'episodeBundles': [{'id': 'episode', 'root': 'episode',
                            'entryPoint': 'episode/src/index.tsx', 'publicDir': 'episode/public',
                            'runtime': 'skills/_runtime/remotion/episode'}]}
            entry = references.attach_execution(root, registry, {'id': 'clip'}, 'clip')
            result = json.loads(json.dumps(entry))
            self.assertEqual(result['sourceExecutions'][0]['sourceBundle'], 'episode')
            self.assertEqual(result['sourceExecutions'][0]['sourceCode'], [source])
            self.assertEqual(result['sourceExecutions'][0]['entryPoint'],
                             str(root / 'episode/src/index.tsx'))


class ProvenanceTests(unittest.TestCase):
    def setup_root(self, root, sources=None):
        skill = root / 'skills/fred-remotion-output'
        (skill / 'assets').mkdir(parents=True)
        snapshot = root / 'selection.json'; snapshot.write_text('{"revision":1}')
        catalog = {'selectionRevision': 1, 'selectionFile': str(snapshot)}
        if sources is not None: catalog['selectionSources'] = sources
        path = root / 'catalog.json'; path.write_text(json.dumps(catalog))
        registry = {'selectionCatalog': 'catalog.json', 'selectionRevision': 1,
                    'selectionCatalogSha256': common.digest(path)}
        (skill / 'assets/dependency-registry.json').write_text(json.dumps(registry))
        return path

    def test_legacy_catalog_and_catalog_hash_gate(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); path = self.setup_root(root)
            common.load_references(root)
            path.write_text(path.read_text() + ' ')
            with self.assertRaises(ValueError): common.load_references(root)

    def test_snapshot_hash_is_verified(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); source = root / 'library.json'; source.write_text('{"keep":[26]}')
            self.setup_root(root, [{'id': 'library', 'path': 'library.json', 'sha256': common.digest(source)}])
            common.load_references(root)
            source.write_text('{"keep":[]}')
            with self.assertRaises(ValueError): common.load_references(root)

    def test_missing_snapshot_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.setup_root(root, [{'path': 'missing.json', 'sha256': '0' * 64}])
            with self.assertRaises((ValueError, OSError)): common.load_references(root)


if __name__ == '__main__': unittest.main()
