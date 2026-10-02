"""Check source attribution and current choices; never infer runtime or visual parity."""
from pathlib import Path
from common import digest, project_root
import json
import subprocess


def validate_reference_usage(manifest, catalog, base, scene_ids=None, root=None):
    errors = []
    lookup = {x['id']: x for x in catalog['components'] + catalog['clips']}
    cache = {}
    call_requests = []
    strict_calls = manifest.get("workflow", {}).get("componentMatching") == "v1"

    def check_file(record, label):
        if not isinstance(record, dict) or not all(isinstance(record.get(k), str) and record[k].strip() for k in ['path', 'sha256', 'symbol']):
            errors.append(label + ': path, sha256 and symbol required')
            return
        path = Path(record['path'])
        if not path.is_absolute():
            path = base / path
        try:
            if path not in cache:
                cache[path] = (digest(path), path.read_text())
            actual, text = cache[path]
            if actual != record['sha256']:
                errors.append(label + ': hash mismatch')
            if record['symbol'] not in text:
                errors.append(label + ': symbol not found (static text check only)')
        except (OSError, UnicodeError) as error:
            errors.append(label + ': ' + str(error))

    pages = manifest.get('pages', [])
    if scene_ids:
        missing = set(scene_ids) - {p.get('stableId') for p in pages}
        if missing:
            errors.append('Unknown target scenes: ' + ', '.join(sorted(missing)))
        pages = [page for page in pages if page.get('stableId') in scene_ids]
    if any(page.get('referenceChoices') for page in pages) and (
            manifest.get('referenceCatalogRevision') != catalog.get('catalogRevision') or not catalog.get('catalogRevision')):
        errors.append('Reference catalog revision changed or missing; reconcile current choices')
    for page in pages:
        pid = page.get('stableId', '<missing>')
        refs = page.get('referenceChoices', [])
        if not refs:
            disposition = page.get('referenceDisposition', {})
            if disposition.get('mode') not in ['original', 'preserved-media', 'talk-only'] or not disposition.get('reason'):
                errors.append(pid + ': referenceDisposition must explain non-library design')
        for ref in refs:
            label = pid + '/' + str(ref.get('id'))
            selected = lookup.get(ref.get('id'))
            if not selected or selected.get('status', 'keep') == 'drop' or selected.get('canonicalId') or selected.get('libraryDisposition'):
                errors.append(label + ': unknown, excluded or merged reference')
                continue
            if ref.get('useMode') not in ['full', 'local'] or not ref.get('keyAction'):
                errors.append(label + ': full/local useMode and observable keyAction required')
            records = (selected.get('sourceFiles', []) + selected.get('sourceCode', []) +
                       selected.get('currentSourceCode', []) + selected.get('savedSourceCode', []))
            allowed = {r.get('sha256') for r in records if r.get('sha256')}
            if ref.get('source', {}).get('sha256') not in allowed:
                errors.append(label + ': source does not belong to the selected reference')
            for field in ['source', 'implementation', 'callSite']:
                check_file(ref.get(field), label + '/' + field)
            if strict_calls:
                implementation=ref.get('implementation', {})
                call=ref.get('callSite', {})
                callee=call.get('callee')
                if not callee or callee.split('.')[-1] != implementation.get('symbol'):
                    errors.append(label + ': callSite callee must bind the actual implementation symbol')
                    continue
                for record, role, symbol in [(implementation,'implementation',implementation.get('symbol')),
                                               (call,'callSite',callee)]:
                    if record.get('path') and symbol:
                        path=Path(record['path'])
                        if not path.is_absolute(): path=base/path
                        if path.is_file():call_requests.append((label,role,call.get('symbol'),{'path':str(path),'symbol':symbol}))
    if call_requests:
        try:
            runtime_root=Path(root) if root else project_root()
            result=subprocess.run(['node',str(Path(__file__).with_name('check_component_calls.mjs'))],
                input=json.dumps({'root':str(runtime_root),'requests':[item[3] for item in call_requests]}),
                capture_output=True,text=True,timeout=30,check=True)
            for (label,role,owner,_),row in zip(call_requests,json.loads(result.stdout)):
                if row['parseErrors']:
                    errors.append(label+'/'+role+': source parser errors: '+ '; '.join(row['parseErrors'][:2]))
                elif role=='implementation' and not row['definitions']:
                    errors.append(label+': implementation must declare the actual adapted function')
                elif role=='callSite' and not any(use['owner']==owner for use in row['uses']):
                    errors.append(label+': callSite must contain an explicit JSX/component or call expression in '+str(owner))
        except (OSError,ValueError,subprocess.SubprocessError) as error:
            errors.append('Component call parsing failed: '+str(error))
    return errors
