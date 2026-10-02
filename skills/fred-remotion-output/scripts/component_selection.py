"""Bounded scene candidates and decisions in the existing production Manifest."""
from common import load_references
from library_matching import rank_references, match_metadata


def shortlist(root, catalog, page, limit=3):
    plan=page.get('componentPlan', {})
    query=plan.get('query') or page.get('oneQuestion') or ''
    result={'query':query,'sceneType':page.get('sceneGuide',{}).get('type'),
            'candidates':[],'crossTypeFallback':False,
            'scope':'Candidates only; inspect exact video and interface before selecting. No approval inferred.'}
    if not query:
        result['needsDecision']='Define componentPlan.query as visible objects and actions, not raw narration.'
        return result
    entries=[{'recordType':kind,**e} for kind,key in [('component','components'),('clip','clips')]
             for e in catalog.get(key,[]) if e.get('status','keep')=='keep'
             and not e.get('canonicalId') and not e.get('libraryDisposition')]
    ranked=rank_references(root,entries,query)
    if plan.get('use'):
        ranked=[e for e in ranked if plan['use'] in e['matching'].get('useIds',[])]
    if plan.get('source'):
        ranked=[e for e in ranked if e['matching'].get('sourceId')==plan['source']]
    typed=[e for e in ranked if result['sceneType'] in e.get('sceneTypes',[])]
    if typed:
        selected=typed[:limit]
    else:
        selected=ranked[:limit];result['crossTypeFallback']=bool(selected)
    for entry in selected:
        metadata=entry.get('matching') or match_metadata(root,entry)
        result['candidates'].append({k:entry[k] for k in ['id','displayLabel','title','useWhen','sceneTypes','collectionId',
            'editableParameters','knownLimitations','nativeTiming','motionDescription'] if k in entry} | {
            'label':metadata['label'],'reasons':metadata.get('reasons',[]),
            'productionUse':{k:metadata[k] for k in ['useIds','sourceId','inputObjects','action','segmentRole','nativeDurationSeconds','adaptation'] if k in metadata},
            'resolveCommand':'references.py --id '+entry['id']+' --full'})
    if not selected:
        result['needsDecision']='No match: split objects/actions or inspect another scene type before original design.'
    return result


def scene_shortlist(root,page,limit=3):
    _,catalog=load_references(root)
    return shortlist(root,catalog,page,limit)


def validate_component_plan(pages,catalog):
    errors=[];lookup={x['id']:x for key in ['components','clips'] for x in catalog.get(key,[])}
    for page in pages:
        pid=page.get('stableId','<missing>');plan=page.get('componentPlan')
        if not isinstance(plan,dict):
            errors.append(pid+': componentPlan required for componentMatching=v1');continue
        mode=page.get('implementationMode');refs={r.get('id') for r in page.get('referenceChoices',[])}
        if plan.get('search')=='not-needed':
            if mode not in ['preserved-media','talk-only'] or refs or not plan.get('decisionReason'):
                errors.append(pid+': not-needed search needs a pure media/talk responsibility and decisionReason')
            continue
        if not isinstance(plan.get('query'),str) or not plan['query'].strip():
            errors.append(pid+': componentPlan query must describe visible objects and actions')
        candidates=plan.get('candidates',[])
        if not isinstance(candidates,list):
            errors.append(pid+': componentPlan candidates must be an array');continue
        selected=set();seen=set()
        for row in candidates:
            if not isinstance(row,dict):
                errors.append(pid+': invalid componentPlan candidate');continue
            cid=row.get('id');entry=lookup.get(cid)
            if cid in seen:errors.append(pid+': duplicate componentPlan candidate')
            seen.add(cid)
            if not entry or entry.get('status')=='drop' or entry.get('canonicalId') or entry.get('libraryDisposition'):
                errors.append(pid+': candidate is unknown, excluded or merged: '+str(cid))
            if row.get('decision') not in ['selected','rejected'] or not row.get('reason'):
                errors.append(pid+': each candidate needs selected/rejected and a concrete reason')
            if row.get('decision')=='selected':selected.add(cid)
        if selected!=refs:
            errors.append(pid+': selected componentPlan candidates must match actual referenceChoices')
        if mode in ['reference','adapted'] and not refs:
            errors.append(pid+': library mode needs an actual selected reference')
        if not refs and not plan.get('decisionReason'):
            errors.append(pid+': non-library route needs a scene-specific decisionReason')
    return errors


def main():
    import argparse,json
    from pathlib import Path
    from common import project_root
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root');parser.add_argument('--manifest',type=Path,required=True)
    parser.add_argument('--scene-id',action='append');parser.add_argument('--limit',type=int,default=3)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    try:
        if args.limit<1:raise ValueError('--limit must be positive')
        root=project_root(args.project_root);_,catalog=load_references(root)
        manifest=json.loads(args.manifest.read_text());pages=manifest['pages']
        if args.scene_id:
            unknown=set(args.scene_id)-{p['stableId'] for p in pages}
            if unknown:raise ValueError('Unknown scene ID: '+','.join(sorted(unknown)))
            pages=[p for p in pages if p['stableId'] in args.scene_id]
        result={'scope':'Read-only shortlist from current scene tasks. No Manifest edits or automatic selection.',
                'catalogRevision':catalog.get('catalogRevision'),
                'scenes':[{'stableId':p['stableId'],'narration':[s.get('text') for s in p.get('sourceSpans',[])],
                           'cues':p.get('motionEvents',[]),'declaredPlan':p.get('componentPlan'),
                           **shortlist(root,catalog,p,args.limit)} for p in pages]}
        text=json.dumps(result,ensure_ascii=False,indent=2)
        if args.output:
            args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(text+'\n')
            print(json.dumps({'scenes':len(pages),'output':str(args.output)},ensure_ascii=False))
        else:print(text)
    except (OSError,ValueError,KeyError) as error:parser.exit(1,str(error)+'\n')

if __name__=='__main__':main()
