"""Resolve source-bound motion annotations against the current selection catalog."""
import json
from pathlib import Path
from common import digest


def load_patterns(root, kind='transitions'):
    names = {'transitions': 'transition-patterns.json', 'text-effects': 'text-patterns.json'}
    data = json.loads((root / 'skills/fred-remotion-output/references' / names[kind]).read_text())
    if data.get('schemaVersion') != 1:
        raise ValueError('Unsupported transition library schema')
    evidence = data['evidence']
    if digest(root / evidence['path']) != evidence['sha256']:
        raise ValueError('Transition preference evidence changed')
    confirmed = []
    for item in data['items']:
        selection = item.get('selection')
        if not selection:
            continue
        path = root / selection['path']
        if digest(path) != selection['sha256']:
            raise ValueError('Local motion selection evidence changed')
        decision = json.loads(path.read_text())['decisions'][selection['decisionKey']]
        expected = 'remove' if selection['status'] == 'drop' else 'keep'
        if decision['referenceId'] != item['id'] or decision['kind'] != kind or decision['decision'] != expected:
            raise ValueError('Local motion selection does not match its evidence')
        if expected == 'keep':
            confirmed.append(item['id'])
    data['_confirmedPatternIds'] = confirmed
    return data


def select_patterns(library, catalog, query='', item_id=None, scene_type=None, collection=None):
    sources = {x['id']: x for x in catalog['components']}
    result = []
    for item in library['items']:
        if item.get('selection', {}).get('status') == 'drop':
            continue
        if item_id and item['id'] != item_id:
            continue
        if scene_type and scene_type not in item['sceneTypes']:
            continue
        search = ' '.join(str(item.get(k, '')) for k in ['id', 'title', 'useWhen', 'tags', 'phases'])
        if query.casefold() not in search.casefold():
            continue
        examples = []
        for example in item['examples']:
            source = sources.get(example['referenceId'])
            if not source or source.get('canonicalId'):
                continue
            if source['status'] != 'keep' and item['id'] not in library.get('_confirmedPatternIds', []):
                continue
            if collection and source.get('collectionId') != collection:
                continue
            if source['referenceSha256'] != example['sourceSha256']:
                raise ValueError('Transition source changed; inspect the new video: ' + example['referenceId'])
            start, end, fps = example['startSeconds'], example['endSeconds'], example['fps']
            if not 0 <= start < end <= source['duration'] or fps != source['fps'] or \
               abs(start * fps - example['startFrame']) > .001 or \
               abs(end * fps - example['endFrameExclusive']) > .001:
                raise ValueError('Invalid transition source frame range: ' + item['id'])
            examples.append({**example, 'sourceVideo': source['media']['path'],
                             'sourceCode': source['sourceCode']})
        if examples:
            result.append({**item, 'recordType': library.get('recordType', 'transition-pattern'), 'examples': examples})
    return result
