#!/usr/bin/env python3
"""Find exact selected reference versions and source-linked episode ranges."""
import argparse
import json
from pathlib import Path


def strip_prefix(text, prefix):
    """str.removeprefix, available before Python 3.9."""
    return text[len(prefix):] if text.startswith(prefix) else text


def select_entries(data, kind='all', status='keep', query='', item_id=None, episode=None, scene_type=None, collection=None):
    result = []
    number_query = strip_prefix(query.strip(), '#')
    entries = ([] if kind == 'clips' else [('component', c) for c in data['components']])
    entries += ([] if kind == 'components' else [('clip', c) for c in data['clips']])
    # A displayed library label identifies one exact reference, even when it is
    # still optional. Ordinary semantic searches retain the requested status.
    exact_label = number_query.casefold() if any(
        entry.get('displayLabel', '').casefold() == number_query.casefold()
        for _, entry in entries if entry.get('displayLabel')) else None
    for item_kind, entry in entries:
        if entry.get('defaultReuse') is False and status != 'all':
            continue
        state = entry.get('status', 'keep')
        if state == 'drop' and status not in ('drop', 'all'):
            continue
        if not item_id and not exact_label and status != 'all' and state != status:
            continue
        if item_id and strip_prefix(item_id.casefold(), '#') not in [
                entry['id'].casefold(), entry.get('displayLabel', '').casefold()]:
            continue
        if exact_label and entry.get('displayLabel', '').casefold() != exact_label:
            continue
        if entry.get('canonicalId') and not item_id and not exact_label and status not in ('all', 'drop'):
            continue
        aliases = [a for a in entry.get('aliases', []) if not collection or a['collectionId'] == collection]
        if collection and entry.get('collectionId') != collection and not aliases:
            continue
        if scene_type and scene_type not in entry.get('sceneTypes', []):
            continue
        if episode and (item_kind != 'clip' or entry.get('episodeId') != str(episode)):
            continue
        searchable = ' '.join(str(entry.get(k, '')) for k in [
            'id', 'displayLabel', 'title', 'summaryTitle', 'category', 'useWhen',
            'motionDescription', 'notes', 'preserve', 'tags', 'sceneTypes'])
        if number_query.isdigit():
            numbers = [a['number'] for a in aliases]
            if not collection or entry.get('collectionId') == collection:
                numbers.append(entry.get('number'))
            if not collection:
                numbers.extend(entry.get('tags', []))
            if not any(str(n).isdigit() and int(n) == int(number_query) for n in numbers):
                continue
        elif not exact_label and query.casefold() not in searchable.casefold():
            continue
        result.append({'recordType': item_kind, **entry})
    return result


def main():
    project_pack = Path.cwd() / 'skills/fred-remake/assets/preferred-motion'
    default = project_pack if project_pack.is_dir() else Path(__file__).resolve().parent.parent / 'assets/preferred-motion'
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--library', type=Path, default=default)
    parser.add_argument('--kind', choices=['all', 'components', 'clips'], default='all')
    parser.add_argument('--status', choices=['keep', 'optional', 'drop', 'all'], default='keep')
    parser.add_argument('--query', default='')
    parser.add_argument('--id')
    parser.add_argument('--episode')
    parser.add_argument('--scene-type')
    parser.add_argument('--collection', help='Scope original feedback numbers and cross-library aliases')
    parser.add_argument('--full', action='store_true', help='Include every source and review field')
    args = parser.parse_args()
    path = args.library / 'catalog.json'
    if not path.is_file():
        parser.error('Preferred catalogue is missing. Run from the FredTalk project or pass --library.')
    data = json.loads(path.read_text())
    live = Path(data['selectionFile'])
    if live.is_file() and json.loads(live.read_text())['revision'] != data['selectionRevision']:
        parser.error('Picker selection changed. Refresh the preference catalogue before using it as current.')
    entries = select_entries(data, args.kind, args.status, args.query, args.id, args.episode, args.scene_type, args.collection)
    if not args.full:
        fields = ['recordType', 'id', 'displayLabel', 'number', 'title', 'summaryTitle', 'status', 'category',
                  'notes', 'scopeNote', 'useWhen', 'motionDescription', 'preserve', 'episodeId',
                  'start', 'end', 'referenceScope', 'media', 'sources', 'sourceFiles', 'sourceCode',
                  'compositionId', 'entryPoint', 'publicDir', 'dependencyManifest', 'sourceBundle', 'sourceFeedback',
                  'sourceReadiness', 'sourceMappingStatus', 'newReusableComponentStatus', 'fullMotionParity',
                  'collectionId', 'aliases', 'sceneTypes', 'canonicalId', 'selectionDisposition',
                  'editableParameters', 'knownLimitations', 'tags', 'approvalScope',
                  'reviewStatus', 'originallibraryReference', 'adaptationNeeds',
                  'relatedReferences', 'runtime', 'audioRole', 'nativeTiming']
        entries = [{k: entry[k] for k in fields if k in entry} for entry in entries]
    print(json.dumps({'selectionRevision': data['selectionRevision'], 'count': len(entries),
                      'scope': 'Selected references; not approval of new adaptations', 'entries': entries},
                     ensure_ascii=False, indent=2))
    if args.id and len(entries) != 1:
        parser.exit(1, 'Exact ID must resolve to one entry in the requested status.\n')


if __name__ == '__main__':
    portable=Path(__file__).resolve().parents[3]/'scripts/catalog.py'
    if portable.is_file():
        import runpy
        runpy.run_path(str(portable),run_name='__main__')
    else:
        main()
