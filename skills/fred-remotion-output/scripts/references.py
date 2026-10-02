#!/usr/bin/env python3
"""Search Fred's choices and attach preserved episode source dependencies."""
import argparse
import importlib.util
import json
from pathlib import Path
from common import project_root, load_references
from feedback import load_feedback, select_rules, guidance_for, summarize_rules
from scene import applicable
from library_matching import match_metadata, rank_references, USE_WORDS


def attach_execution(root, registry, entry, kind):
    """Expose exact current code separately from preserved reference identity."""
    current = next((b for b in registry.get('currentVisualBindings', [])
                    if b.get('itemId') == ('component' if kind == 'component' else kind) + ':' + entry['id']), None)
    if current:
        version = dict(current)
        for key in ['entryPoint', 'publicDir', 'runtime']:
            if version.get(key): version[key] = str(root / version[key])
        version['sourceCode'] = [{**s, 'path': str(root / s['path'])} for s in version['sourceCode']]
        archive = version.get('projectArchive')
        if archive: version['projectArchive'] = {**archive, 'path': str(root / archive['path'])}
        entry['currentVersion'] = version
    # Resolve original entries through the same exact registry; no guessed runtime.
    original_entry = entry.get('entryPoint')
    if original_entry:
        bundle = next((b for b in registry.get('episodeBundles', [])
                       if (root / b['entryPoint']).resolve() == (root / original_entry).resolve()), None)
        if bundle:
            entry['execution'] = {k: str(root / bundle[k]) for k in ['entryPoint', 'publicDir', 'runtime'] if bundle.get(k)}
            entry['execution'].update(sourceBundle=bundle['id'], compositionId=entry.get('compositionId'),
                                      nativeTiming=entry.get('nativeTiming') or {
                                          k: entry[k] for k in ['fps', 'durationInFrames', 'duration'] if k in entry})
    if kind == 'clip':
        binding = next((b for b in registry.get('clipBindings', []) if b['referenceId'] == entry['id']), {})
        calls = []
        for bundle in registry.get('episodeBundles', []):
            codes = [s for s in binding.get('sourceCode', [])
                     if (root / s['path']).resolve().is_relative_to((root / bundle['root']).resolve())]
            if codes:
                calls.append({**{k: str(root / bundle[k]) for k in ['entryPoint', 'publicDir', 'runtime'] if bundle.get(k)},
                              'sourceBundle': bundle['id'], 'sourceCode': codes,
                              'scope': 'Source-linked episode interval; preserve media/time mapping and hybrid boundary before adaptation'})
        if calls: entry['sourceExecutions'] = calls
    return entry


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root')
    parser.add_argument('--query', default='')
    parser.add_argument('--id')
    parser.add_argument('--kind', choices=['all', 'components', 'clips', 'rules', 'transitions', 'text-effects'], default='all')
    parser.add_argument('--status', choices=['keep', 'optional', 'drop', 'all'], default='keep')
    parser.add_argument('--episode')
    parser.add_argument('--full', action='store_true')
    parser.add_argument('--scene-type')
    parser.add_argument('--collection', help='Scope a reference collection and its canonical aliases')
    parser.add_argument('--use', choices=list(USE_WORDS), help='Production use from the shared visual-use registry')
    parser.add_argument('--source', help='Source collection in the shared visual-use registry, e.g. library24 or ep107')
    parser.add_argument('--with', dest='modifiers', action='append', default=[])
    parser.add_argument('--limit', type=int)
    args = parser.parse_args()
    try:
        root = project_root(args.project_root)
        registry, data = load_references(root)
        feedback = load_feedback(root)
        if args.limit is not None and args.limit < 1:
            raise ValueError('--limit must be positive')
        if args.modifiers and not args.scene_type:
            raise ValueError('--with requires --scene-type')
        if args.kind in ('transitions', 'text-effects'):
            from transitions import load_patterns, select_patterns
            if args.status != 'keep' or args.episode or args.modifiers:
                raise ValueError('Motion lookup uses kept source references; use query, id, scene-type or collection')
            if args.scene_type:
                applicable(root, args.scene_type)
            library = load_patterns(root, args.kind)
            entries = select_patterns(library, data, '', args.id, args.scene_type, args.collection)
            from library_matching import library_disposition, usage_registry, visual_label
            confirmed = usage_registry(root).get('confirmedMerges', {})
            entries = [e for e in entries if e['id'] not in confirmed and
                       (not library_disposition(root, e) or
                        (args.id and library_disposition(root, e) == 'merged'))]
            # A reviewed primitive can now be represented by a full, newer scene.
            # Return that exact scene, never reuse the old primitive's frame range.
            for pattern in library['items']:
                merge = confirmed.get(pattern['id'])
                if not merge or (args.id and args.id != pattern['id']):
                    continue
                if args.scene_type and args.scene_type not in pattern['sceneTypes']:
                    continue
                target = next((e for e in data['components'] if visual_label(e) == merge['representative']), None)
                if not target or target.get('status') == 'drop' or target.get('libraryDisposition'):
                    continue
                if args.collection and target.get('collectionId') != args.collection:
                    continue
                if any(e['id'] == target['id'] for e in entries):
                    continue
                entry = {**target, 'recordType': 'component', 'matchedAlias': pattern['id']}
                attach_execution(root, registry, entry, 'component')
                entries.append(entry)
            from library_matching import library_merge_labels
            for entry in entries:
                labels = library_merge_labels(root, entry)
                if labels: entry['libraryMergedInto'] = labels
            if args.query and not args.id:
                entries = rank_references(root, entries, args.query)
            for entry in entries:
                attach_execution(root, registry, entry, args.kind)
            for entry in entries:
                if 'matching' not in entry:
                    entry['matching'] = {key: value for key, value in match_metadata(root, entry).items()
                                         if key != 'searchText'}
            if args.use:
                entries = [entry for entry in entries if args.use in entry['matching'].get('useIds', [])]
            if args.source:
                entries = [entry for entry in entries if entry['matching'].get('sourceId') == args.source]
            matched_count = len(entries)
            if args.limit:
                entries = entries[:args.limit]
            if not args.full:
                fields = ['recordType', 'id', 'title', 'useWhen', 'sceneTypes', 'phases',
                          'transferRules', 'limitations', 'examples', 'readiness', 'matching', 'currentVersion', 'execution', 'libraryMergedInto', 'matchedAlias']
                entries = [{k: e[k] for k in fields if k in e} for e in entries]
            print(json.dumps({'revision': library['revision'], 'count': len(entries),
                              'matchedCount': matched_count, 'entries': entries,
                              'scope': 'Observed ' + ('text presentation' if args.kind == 'text-effects' else 'object motion') +
                                       ' from current kept references; not a universal component API'},
                             ensure_ascii=False, indent=2))
            if args.id and len(entries) != 1:
                parser.exit(1, 'Motion pattern not available from the current kept references.\n')
            return
        if args.kind == 'rules':
            if args.scene_type:
                raise ValueError('Use scene.py for scene-scoped rules, or query a rule by ID')
            rules = select_rules(feedback, args.query, args.episode, args.id)
            print(json.dumps({'feedbackRevision': feedback['revision'], 'count': len(rules),
                              'scope': 'Scoped historical guidance; not new asset approval or a picker selection',
                              'entries': summarize_rules(rules, args.full)}, ensure_ascii=False, indent=2))
            if args.id and len(rules) != 1:
                parser.exit(1, 'Exact feedback rule not found in the requested scope.\n')
            return
        spec = importlib.util.spec_from_file_location('fred_choices', root / 'skills/fred-remake/scripts/query-preferred-motion.py')
        query = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(query)
        number_query = args.query.strip().lstrip('#')
        exact_label = any(entry.get('displayLabel', '').casefold() == number_query.casefold()
                          for entry in data['components'] + data['clips'] if entry.get('displayLabel'))
        semantic = bool(args.query and not args.id and not number_query.isdigit() and not exact_label)
        entries = query.select_entries(data, args.kind, args.status, '' if semantic else args.query,
                                       args.id, args.episode, args.scene_type, args.collection)
        if args.status not in ('drop', 'all'):
            if args.id or exact_label:
                resolved = []
                for entry in entries:
                    targets = entry.get('libraryMergedInto', [])
                    if entry.get('libraryDisposition') == 'merged' and len(targets) == 1 and targets[0].get('id'):
                        target = next((e for e in data['components'] + data['clips'] if e['id'] == targets[0]['id']), None)
                        if target and target.get('status') != 'drop' and not target.get('libraryDisposition'):
                            resolved.append({'recordType': 'component' if target in data['components'] else 'clip',
                                             **target, 'matchedAlias': entry['id']})
                    else:
                        resolved.append(entry)
                entries = resolved
            entries = [e for e in entries if not e.get('libraryDisposition')]
        if semantic:
            entries = rank_references(root, entries, args.query)
        for entry in entries:
            if 'matching' not in entry:
                entry['matching'] = {key: value for key, value in match_metadata(root, entry).items()
                                     if key != 'searchText'}
        if args.use:
            entries = [entry for entry in entries if args.use in entry['matching'].get('useIds', [])]
        if args.source:
            entries = [entry for entry in entries if entry['matching'].get('sourceId') == args.source]
        matched_count = len(entries)
        if args.limit:
            entries = entries[:args.limit]
        guidance = guidance_for(feedback, entries, args.query, args.episode)
        related_index = []
        if args.scene_type:
            _, _, selected, signature = applicable(root, args.scene_type, args.modifiers)
            ids = {r['id'] for r in selected}
            guidance = [dict(recordType='feedback-rule', **r) for r in feedback['rules'] if r['id'] in ids]
        elif not args.full:
            direct = select_rules(feedback, args.query, args.episode) if args.query else []
            ids = {r['id'] for r in direct}
            related_index = [{k: r[k] for k in ['id', 'title', 'when']} for r in guidance if r['id'] not in ids]
            guidance = direct
        bindings = {c['referenceId']: c for c in registry['clipBindings']}
        for e in entries:
            attach_execution(root, registry, e, e['recordType'])
            if e['id'] in bindings:
                binding = bindings[e['id']]
                e['savedSourceCode'] = [{**s, 'path': str(root / s['path'])} for s in binding['sourceCode']]
                e['hybridBoundary'] = binding.get('hybridBoundary')
        if not args.full:
            fields = ['recordType', 'id', 'displayLabel', 'title', 'summaryTitle', 'category', 'status', 'scopeNote', 'notes',
                      'useWhen', 'preserve', 'start', 'end', 'episodeId', 'referenceScope', 'media', 'sources',
                      'sourceFiles', 'sourceCode', 'savedSourceCode', 'sourceMappingStatus', 'hybridBoundary',
                      'compositionId', 'entryPoint', 'publicDir', 'dependencyManifest', 'sourceBundle', 'sourceFeedback',
                      'number', 'collectionId', 'aliases', 'sceneTypes', 'canonicalId', 'selectionDisposition',
                      'motionDescription', 'editableParameters', 'knownLimitations', 'sourceReadiness', 'tags',
                      'approvalScope', 'reviewStatus', 'originalLibraryReference', 'adaptationNeeds',
                      'relatedReferences', 'runtime', 'audioRole', 'nativeTiming', 'matching', 'currentVersion', 'execution', 'sourceExecutions', 'libraryDisposition', 'libraryMergedInto', 'matchedAlias']
            entries = [{k: e[k] for k in fields if k in e} for e in entries]
        output = {'selectionRevision': registry['selectionRevision'], 'count': len(entries),
                  'matchedCount': matched_count,
                  'selectionMeaning': registry['selectionMeaning'], 'entries': entries,
                  'feedbackRevision': feedback['revision'],
                  'guidanceMeaning': 'Read when the stated condition applies; source approval does not approve new adaptations.'}
        if args.scene_type:
            output['sceneType'] = args.scene_type
            output['guideSignature'] = signature
            output['guidance'] = selected
        elif args.query or args.id or args.episode or args.full:
            output['guidance'] = summarize_rules(guidance, args.full)
        else:
            output['guidanceIndex'] = [{k: r[k] for k in ['id', 'title', 'when']} for r in guidance]
        if related_index:
            output['relatedGuidanceIndex'] = related_index
            output['readingHint'] = 'Related entries are an index only. Read a matching scene packet before implementation; do not expand every rule.'
        print(json.dumps(output, ensure_ascii=False, indent=2))
        if args.id and len(entries) != 1:
            parser.exit(1, 'Exact reference not found in the requested status.\n')
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    portable = Path(__file__).resolve().parents[3] / 'scripts/catalog.py'
    if portable.is_file():
        import runpy
        runpy.run_path(str(portable), run_name='__main__')
    else:
        main()
