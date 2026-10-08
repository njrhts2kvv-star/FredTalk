"""Portable semantic catalog lookup. No asset download or API key required."""
import argparse
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--episode');p.add_argument('--with',dest='modifiers');p.add_argument('--id');p.add_argument('--query',default='');p.add_argument('--scene-type');p.add_argument('--use');p.add_argument('--source');p.add_argument('--collection');p.add_argument('--kind');p.add_argument('--limit',type=int,default=3);p.add_argument('--full',action='store_true');p.add_argument('--list',action='store_true');p.add_argument('--project-root');p.add_argument('--status',default='keep');args=p.parse_args()
 if args.kind == 'rules':
  rules=json.loads((ROOT/'skills/fred-remotion-output/references/feedback-rules.json').read_text())['rules']
  if args.id:rules=[x for x in rules if x['id']==args.id]
  if args.query:rules=[x for x in rules if all(t in json.dumps(x,ensure_ascii=False).lower() for t in args.query.lower().split())]
  print(json.dumps({'count':len(rules),'entries':rules[:args.limit]},ensure_ascii=False,indent=2));return
 data=json.loads((ROOT/'library/catalog.json').read_text());routes=json.loads((ROOT/'library/routes.json').read_text());items=data['items']
 if args.list:
  print(json.dumps(data['scenarios'],ensure_ascii=False,indent=2));return
 if args.id:
  history=json.loads((ROOT/'library/history.json').read_text())
  alias=next((i.get('canonicalLabel') for i in history if args.id in {i.get('id'),i.get('label')} and i.get('canonicalLabel')),None)
  wanted=alias or args.id
  items=[i for i in items if wanted in {i['id'],i['label'],i.get('referenceId')}]
 if args.status=='keep':items=[i for i in items if not i.get('archivedFromSkill')]
 elif args.status=='archived':items=[i for i in items if i.get('archivedFromSkill')]

 if args.scene_type:items=[i for i in items if args.scene_type in i.get('sceneTypes',[])]
 if args.use:items=[i for i in items if args.use in i.get('matching',{}).get('useIds',[])]
 if args.source:items=[i for i in items if args.source==i.get('matching',{}).get('sourceId')]
 if args.collection:items=[i for i in items if args.collection in json.dumps(i,ensure_ascii=False)]
 if args.kind == 'transitions':items=[i for i in items if i.get('kind')=='transitions' or i['label'].startswith('L81-T')]
 elif args.kind == 'text-effects':items=[i for i in items if i.get('kind')=='text-effects' or i['label'].startswith('L81-W')]
 elif args.kind:items=[i for i in items if args.kind==i.get('kind')]
 if args.query:
  terms=args.query.lower().split()
  def score(i):
   text=json.dumps({k:i.get(k) for k in ('title','description','tags','matching')},ensure_ascii=False).lower()
   return sum(t in text for t in terms)
  items=sorted((i for i in items if score(i)),key=score,reverse=True)
 output=[]
 for i in items[:max(0,args.limit)]:
  result=i.copy() if args.full else {k:i.get(k) for k in ('id','label','title','matching','reusability','previews','sources')}
  result['sourceFiles']=[routes.get(s.get('url')) for s in i.get('sources',[]) if routes.get(s.get('url'))]
  output.append(result)
 print(json.dumps({'count':len(items),'returned':len(output),'entries':output},ensure_ascii=False,indent=2))
 if args.id and not output:p.exit(1,'Reference is not in the active collection. Historical identities are in library/history.json.\n')
if __name__=='__main__':main()
