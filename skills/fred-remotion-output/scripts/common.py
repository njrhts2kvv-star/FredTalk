"""Project-local reference resolution; no global asset fallback."""
import hashlib
import json
from pathlib import Path


def digest(path):
    with Path(path).open('rb') as f:
        if hasattr(hashlib, 'file_digest'):
            return hashlib.file_digest(f, 'sha256').hexdigest()
        sha = hashlib.sha256()
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            sha.update(chunk)
        return sha.hexdigest()


def strip_prefix(text, prefix):
    """str.removeprefix, available before Python 3.9."""
    return text[len(prefix):] if text.startswith(prefix) else text


def is_relative_to(path, other):
    """Path.is_relative_to, available before Python 3.9."""
    try:
        Path(path).relative_to(other)
    except ValueError:
        return False
    return True


def project_root(explicit=None):
    candidates = [Path(explicit).absolute()] if explicit else [Path.cwd(), *Path.cwd().parents]
    for root in candidates:
        if (root / 'skills/fred-remotion-output/assets/dependency-registry.json').is_file():
            return root
    raise ValueError('Run inside the FredTalk project or pass --project-root; assets are project-local.')


def load_references(root):
    skill = root / 'skills/fred-remotion-output'
    registry = json.loads((skill / 'assets/dependency-registry.json').read_text())
    path = root / registry['selectionCatalog']
    data = json.loads(path.read_text())
    if digest(path) != registry['selectionCatalogSha256'] or data['selectionRevision'] != registry['selectionRevision']:
        raise ValueError('Reference catalogue changed; refresh dependency bindings before using current preferences.')
    sources = data.get('selectionSources', [])
    if not isinstance(sources, list):
        raise ValueError('selectionSources must be an array')
    for source in sources:
        if not isinstance(source, dict) or not source.get('path') or not source.get('sha256'):
            raise ValueError('Each selection source needs path and sha256')
        source_path = Path(source['path'])
        if not source_path.is_absolute():
            source_path = root / source_path
        if digest(source_path) != source['sha256']:
            raise ValueError('Selection source snapshot changed: ' + str(source_path))
    live = Path(data['selectionFile'])
    if live.exists() and json.loads(live.read_text())['revision'] != data['selectionRevision']:
        raise ValueError('Picker selection changed; curate the new selection before using this snapshot.')
    current = registry.get('currentVisualDelivery')
    if current and digest(root / current['path']) != current['sha256']:
        raise ValueError('Current visual delivery changed; refresh its exact source bindings.')
    # Derived source versions do not change selected IDs/media or review identity.
    entries = {entry['id']: entry for entry in data.get('components', []) + data.get('clips', [])}
    for binding in registry.get('currentVisualBindings', []):
        if binding['itemId'].startswith('component:'):
            entry = entries.get(binding.get('referenceId'))
            if entry is not None:
                entry['currentSourceCode'] = [{**source, 'path': str(root / source['path'])}
                                              for source in binding['sourceCode']]
    for binding in registry.get('clipBindings', []):
        entry = entries.get(binding['referenceId'])
        if entry is not None:
            entry['savedSourceCode'] = [{**source, 'path': str(root / source['path'])}
                                        for source in binding['sourceCode']]
    from library_matching import library_disposition, library_merge_labels, visual_label
    for entry in entries.values():
        disposition = library_disposition(root, entry)
        if disposition: entry['libraryDisposition'] = disposition
        labels = library_merge_labels(root, entry)
        if labels:
            entry['libraryMergedInto'] = [{'label': label, 'id': next((target['id'] for target in entries.values()
                                                                    if visual_label(target) == label), None)}
                                          for label in labels]
    return registry, data
