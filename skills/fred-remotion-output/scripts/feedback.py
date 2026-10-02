"""Retrieve scoped historical guidance without changing preferred asset selections."""
import json
from pathlib import Path


def load_feedback(root):
    path = Path(root) / 'skills/fred-remotion-output/references/feedback-rules.json'
    data = json.loads(path.read_text())
    if data.get('schemaVersion') != 1:
        raise ValueError('Unsupported feedback schema; inspect the current Skill reference.')
    return data


def searchable(rule):
    # Evidence quotes and filenames are provenance, not subject tags.
    return json.dumps({k: rule[k] for k in
                       ['title', 'keywords', 'when', 'prefer', 'avoid', 'scope', 'checks']},
                      ensure_ascii=False).casefold()


def select_rules(data, query='', episode=None, item_id=None):
    terms = query.casefold().split()
    return [dict(recordType='feedback-rule', **rule) for rule in data['rules']
            if (not episode or str(episode) in rule['episodes'])
            and (not item_id or rule['id'] == item_id)
            and all(term in searchable(rule) for term in terms)]


def guidance_for(data, entries, query='', episode=None):
    if not query and not entries:
        return select_rules(data, episode=episode)
    matched = {r['id'] for r in select_rules(data, query, episode)} if query else set()
    # Inspect semantic fields only. Source paths often contain every episode or
    # component name and would make unrelated constraints match all candidates.
    fields = ['title', 'summaryTitle', 'category', 'useWhen', 'motionDescription',
              'notes', 'preserve', 'scopeNote']
    subjects = ' '.join(json.dumps({k: e[k] for k in fields if k in e},
                                  ensure_ascii=False) for e in entries).casefold()
    for rule in data['rules']:
        if episode and str(episode) not in rule['episodes']:
            continue
        if any(term.casefold() in subjects for term in rule['keywords']):
            matched.add(rule['id'])
    return [dict(recordType='feedback-rule', **r) for r in data['rules'] if r['id'] in matched]


def summarize_rules(rules, full=False):
    if full:
        return rules
    fields = ['recordType', 'id', 'title', 'when', 'prefer', 'avoid', 'scope', 'checks', 'episodes']
    return [{**{k: r[k] for k in fields},
             'evidence': [{k: e[k] for k in ['episode', 'kind', 'path', 'line', 'quote']}
                          for e in r['evidence']]} for r in rules]
