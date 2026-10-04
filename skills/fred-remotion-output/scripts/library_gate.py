"""Portable delivery gate. Evidence checks never replace actual visual inspection."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
STAGES = ('suggestion', 'keyframes')

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def acceptance_signature(manifest, page, stage):
    value = {'stage':stage,'page':{k:v for k,v in page.items() if k!='componentAcceptance'},
        'context':{k:manifest.get(k) for k in ['audio','subtitles','timelineFps','brandCorner','designContract','referenceCatalogRevision']}}
    return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True).encode()).hexdigest()

def load_catalog():
    path = ROOT/'library/catalog.json'
    data = json.loads(path.read_text())
    routes = json.loads((ROOT/'library/routes.json').read_text())
    media = json.loads((ROOT/'library/media-manifest.json').read_text())['files']
    items = {}
    for item in data['items']:
        hashes = []
        for preview in item['previews']:
            for url in [preview.get('videoUrl'),preview.get('posterUrl'),*[f.get('url') for f in preview.get('keyframes',[])]]:
                record = media.get(routes.get(url),{})
                if record.get('status')=='reviewed': hashes.append(record['sha256'])
        source_hashes = []
        for source in item['sources']:
            relative = routes.get(source.get('url'))
            if relative and (ROOT/relative).is_file(): source_hashes.append(digest(ROOT/relative))
        record = {'mediaHashes':hashes,'sourceHashes':source_hashes}
        for name in [item['id'],item['label'],item.get('referenceId')]:
            if name: items[name] = record
    return {'revision':digest(path),'items':items}

def text(value):
    return isinstance(value,str) and bool(value.strip())

def validate_library_gate(manifest, stage, base, catalog=None):
    if stage not in STAGES: return ['Unknown gate stage']
    catalog = load_catalog() if catalog is None else catalog
    base = Path(base)
    errors = []
    pages = manifest.get('pages',[])
    if not pages: return ['Nonempty scene scope required']
    calls = []
    def file(record,label):
        if not isinstance(record,dict) or not text(record.get('path')):
            errors.append(label+': evidence file required'); return None
        path = Path(record['path']); path = path if path.is_absolute() else base/path
        if not path.is_file() or digest(path)!=record.get('sha256'):
            errors.append(label+': missing or changed evidence'); return None
        return path
    for page in pages:
        sid = page.get('stableId','<missing>'); mode = page.get('implementationMode')
        route = page.get('productionRoute',{}); suggested = route.get('suggested')
        if isinstance(suggested,dict): suggested = suggested.get('route')
        animated = route.get('selected') in ['remotion','mixed'] or suggested in ['remotion','mixed']
        refs = page.get('referenceChoices',[])
        placeholder = page.get('recordingPlaceholder')
        if placeholder:
            if mode!='talk-only' or animated or refs or not text(placeholder.get('requiredShot')):
                errors.append(sid+': placeholder cannot disguise animation')
            continue
        if mode=='preserved-media' and not animated:
            records = page.get('mediaContract',[])
            if not records: errors.append(sid+': actual mediaContract required')
            for record in records: file(record,sid+'/media')
            continue
        auth = page.get('originalAuthorization',{})
        original = (mode=='original' and auth.get('by')=='user' and auth.get('sceneId')==sid and auth.get('allowOriginal') is True
            and all(text(auth.get(k)) for k in ['source','quote','requestedAt']))
        if mode not in ['reference','adapted'] and not original:
            errors.append(sid+': approved reuse required; original needs current scene authorization'); continue
        if not original:
            if manifest.get('referenceCatalogRevision')!=catalog['revision']: errors.append(sid+': catalog revision changed or missing')
            if not refs: errors.append(sid+': selected component required')
            for ref in refs:
                rid = ref.get('id'); selected = catalog['items'].get(rid)
                if not selected: errors.append(sid+': reference is not active: '+str(rid)); continue
                if any(not text(ref.get(k)) for k in ['reason','preserve','change','useScope']): errors.append(sid+': explain adaptation boundary')
                evidence = [r for r in page.get('componentPlan',{}).get('inspectedReferences',[]) if r.get('id')==rid]
                if not evidence: errors.append(sid+': inspect selected preview first')
                for r in evidence:
                    file(r,sid+'/preview')
                    if r.get('sha256') not in selected['mediaHashes'] or not text(r.get('observations')):
                        errors.append(sid+': inspection must bind reviewed preview and observed action')
                if stage=='keyframes':
                    if ref.get('source',{}).get('sha256') not in selected['sourceHashes']: errors.append(sid+': source does not belong to selected component')
                    for name in ['source','implementation','callSite']:
                        record = ref.get(name,{}); path = file(record,sid+'/'+name)
                        if not text(record.get('symbol')): errors.append(sid+'/'+name+': symbol required')
                        elif name=='source' and path and record['symbol'] not in path.read_text(): errors.append(sid+': source symbol not found')
                        if name!='source' and path:
                            symbol = record.get('symbol') if name=='implementation' else record.get('callee')
                            if not text(symbol): errors.append(sid+': explicit callee required')
                            else: calls.append((sid,name,record.get('symbol'),{'path':str(path),'symbol':symbol}))
                    if ref.get('callSite',{}).get('callee','').split('.')[-1]!=ref.get('implementation',{}).get('symbol'):
                        errors.append(sid+': call must bind implementation')
        acceptance = page.get('componentAcceptance',{})
        if (acceptance.get('status')!='passed' or acceptance.get('reviewer')!='assistant' or acceptance.get('stage')!=stage
            or acceptance.get('contextSha256')!=acceptance_signature(manifest,page,stage)):
            errors.append(sid+': missing or stale visual acceptance')
        if any(not text(acceptance.get('checks',{}).get(k)) for k in ['semanticFit','corePreserved','visualQuality']): errors.append(sid+': concrete visual checks required')
        evidence = acceptance.get('evidence',[])
        if not evidence: errors.append(sid+': acceptance evidence required')
        for record in evidence: file(record,sid+'/acceptance')
        if stage=='keyframes':
            review = page.get('keyframeReview',{}); frames = review.get('frames',[]); sources = review.get('sourceFiles',[])
            if not frames or not sources: errors.append(sid+': rendered frames and source files required')
            for record in [*frames,*sources]: file(record,sid+'/output')
            if not any(r.get('sha256') in {f.get('sha256') for f in frames} for r in evidence): errors.append(sid+': inspect current output')
    if calls:
        try:
            result = subprocess.run(['node',str(Path(__file__).with_name('check_component_calls.mjs'))],
                input=json.dumps({'root':str(ROOT),'requests':[r[3] for r in calls]}),capture_output=True,text=True,check=True,timeout=30)
            rows = json.loads(result.stdout)
            if len(rows)!=len(calls): raise ValueError('Incomplete parser response')
            for (sid,role,owner,_),row in zip(calls,rows):
                if row['parseErrors'] or (role=='implementation' and not row['definitions']) or (role=='callSite' and not any(u['owner']==owner for u in row['uses'])):
                    errors.append(sid+': source declaration/call parsing failed')
        except (OSError,ValueError,subprocess.SubprocessError): errors.append('Source parser unavailable; install apps/library dependencies')
    return errors

def main():
    p = argparse.ArgumentParser(description=__doc__); p.add_argument('--manifest',type=Path,required=True)
    p.add_argument('--stage',choices=STAGES,required=True); p.add_argument('--signature',action='store_true'); p.add_argument('--output',type=Path)
    args = p.parse_args(); manifest = json.loads(args.manifest.read_text())
    if args.signature:
        print(json.dumps({'catalogRevision':load_catalog()['revision'],'scenes':{s['stableId']:acceptance_signature(manifest,s,args.stage) for s in manifest['pages']}},indent=2));return
    errors = validate_library_gate(manifest,args.stage,args.manifest.parent)
    result = {'status':'FAIL' if errors else 'PASS','stage':args.stage,'errors':errors,'manifestSha256':digest(args.manifest)}
    if args.output: args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2));p.exit(bool(errors))
if __name__=='__main__': main()
