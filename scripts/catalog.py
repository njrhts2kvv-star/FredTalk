"""Portable semantic catalog lookup using the same ranked candidates as scene.py."""
import argparse
import json
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'skills/fred-remotion-output/scripts'))
from common import load_references
from library_matching import rank_references, match_metadata

def main():
 p=argparse.ArgumentParser(description=__doc__)
 for name in ['episode','id','query','scene-type','use','source','collection','kind','project-root']:
  p.add_argument('--'+name,default='' if name=='query' else None)
 p.add_argument('--with',dest='modifiers',action='append',default=[])
 p.add_argument('--access',choices=['all','public','installed'],default='all');p.add_argument('--limit',type=int,default=3);p.add_argument('--full',action='store_true');p.add_argument('--list',action='store_true');p.add_argument('--status',choices=['keep','archived','optional','drop','all'],default='keep')
 args=p.parse_args();root=Path(args.project_root).resolve() if args.project_root else ROOT
 if args.limit<1:p.error('--limit must be positive')
 data=json.loads((root/'library/catalog.json').read_text());routes=json.loads((root/'library/routes.json').read_text())
 if args.list:print(json.dumps(data['scenarios'],ensure_ascii=False,indent=2));return
 if args.kind=='rules':
  rules=json.loads((root/'skills/fred-remotion-output/references/feedback-rules.json').read_text())['rules']
  if args.id:rules=[x for x in rules if x['id']==args.id]
  if args.query:rules=[x for x in rules if all(t in json.dumps(x,ensure_ascii=False).casefold() for t in args.query.casefold().split())]
  print(json.dumps({'count':len(rules),'returned':min(len(rules),args.limit),'entries':rules[:args.limit]},ensure_ascii=False,indent=2));return
 _,normalized=load_references(root);rows=normalized['components']+normalized['clips']
 if args.id:rows=[e for e in rows if args.id in {e['id'],*e.get('aliases',[])}]
 if args.status=='keep':rows=[e for e in rows if not e.get('libraryDisposition') and e.get('status','keep')=='keep']
 elif args.status=='archived':rows=[e for e in rows if e.get('libraryDisposition')=='archived']
 elif args.status!='all':rows=[e for e in rows if e.get('status')==args.status]
 if args.scene_type:rows=[e for e in rows if args.scene_type in e.get('sceneTypes',[])]
 if args.kind=='components':rows=[e for e in rows if e['recordType']=='component']
 elif args.kind=='clips':rows=[e for e in rows if e['recordType']=='clip']
 elif args.kind=='transitions':rows=[e for e in rows if e.get('kind')=='transitions' or e['displayLabel'].startswith('L81-T')]
 elif args.kind=='text-effects':rows=[e for e in rows if e.get('kind')=='text-effects' or e['displayLabel'].startswith('L81-W')]
 if args.collection:rows=[e for e in rows if args.collection in {e.get('collectionId'),e.get('matching',{}).get('sourceId')}]
 if args.episode:rows=[e for e in rows if args.episode in str(e.get('episodeId','')) or args.episode in str(e.get('collectionId',''))]
 if args.access=='public':rows=[e for e in rows if not e.get('sourceAvailability',{}).get('authRequired')]
 if args.access=='installed':rows=[e for e in rows if e.get('sourceAvailability',{}).get('available',True)]
 if args.query:rows=rank_references(root,rows,args.query,args.scene_type)
 else:rows=[dict(e,matching=match_metadata(root,e)) for e in rows]
 if args.use:rows=[e for e in rows if args.use in e.get('matching',{}).get('useIds',[])]
 if args.source:rows=[e for e in rows if args.source==e.get('matching',{}).get('sourceId')]
 by_id={e.get('referenceId') or e['id']:e for e in data['items']};output=[]
 for row in rows[:args.limit]:
  item=by_id[row['id']]
  result=item.copy() if args.full else {k:item.get(k) for k in ['id','label','title','reusability','previews','sources']}
  result['matching']=row['matching'];result['sourceFiles']=row.get('sourceFiles',[])
  for key in ['sourceAvailability','sourcePackage','projectRoot','entryPoint','publicDir','earlyAccess']:
   if key in row:result[key]=row[key]
  result['candidateId']=row['id'];output.append(result)
 print(json.dumps({'catalogRevision':normalized['catalogRevision'],'count':len(rows),'returned':len(output),'entries':output},ensure_ascii=False,indent=2))
 if args.id and not output:p.exit(1,'Reference is not in the requested active collection. Inspect library/history.json for historical identities.\n')
if __name__=='__main__':main()
