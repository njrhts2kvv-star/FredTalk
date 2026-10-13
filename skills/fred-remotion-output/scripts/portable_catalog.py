"""Derive current execution entries from the distributed catalog and safe asset routes."""
import json
from pathlib import Path
from common import digest

def load_portable(root):
 root=Path(root);path=root/'library/catalog.json'
 data=json.loads(path.read_text());routes=json.loads((root/'library/routes.json').read_text())
 media=json.loads((root/'library/media-manifest.json').read_text())['files']
 revision=digest(path);entries=[]
 def routed(record):
  relative=routes.get(record.get('url'))
  if not relative:return None
  asset=media.get(relative,{})
  source=root/relative
  sha=digest(source) if source.is_file() else asset.get('sha256') or record.get('sha256')
  return {'path':relative,'sha256':sha,'url':record['url'],**({'symbol':record['symbol']} if record.get('symbol') else {})}
 for item in data['items']:
  row=dict(item,id=item.get('referenceId') or item['id'],displayLabel=item['label'],recordType='clip' if item.get('kind')=='clips' else 'component',
           useWhen=item.get('description',''),summaryTitle=item.get('title'),status=item.get('selectionStatus',item.get('status','keep')))
  row['aliases']=list(dict.fromkeys([item['id'],item['label'],*item.get('aliases',[])]))
  if item.get('archivedFromSkill') or item.get('defaultReuse') is False:row['libraryDisposition']='archived'
  if item.get('mergedInto'):row['libraryDisposition']='merged'
  row['sourceCode']=[record for s in item.get('sources',[]) if (record:=routed(s))]
  row['sourceFiles']=row['sourceCode']
  previews=item.get('previews',[])
  row['media']={}
  row['coreFrames']=[]
  for preview in previews:
   if preview.get('videoUrl'):
    record=routed({'url':preview['videoUrl'],'sha256':preview.get('sha256')})
    if record:row['media']=record
   for url in [preview.get('posterUrl'),*[f.get('url') for f in preview.get('keyframes',[])]]:
    if url and (record:=routed({'url':url})):row['coreFrames'].append(record)
  impl=item.get('implementation',{})
  row['nativeTiming']={k:impl[k] for k in ['fps','durationInFrames','width','height'] if k in impl}
  row['editableParameters']=item.get('reusability',{}).get('parameters',[])
  row['knownLimitations']=item.get('reusability',{}).get('limitations',[])
  entries.append(row)
 history=json.loads((root/'library/history.json').read_text()) if (root/'library/history.json').exists() else []
 labels={entry['displayLabel']:entry for entry in entries}
 for old in history:
  canonical=labels.get(old.get('canonicalLabel'))
  if canonical:
   canonical['aliases']=list(dict.fromkeys([*canonical['aliases'],*[x for x in [old.get('id'),old.get('label')] if x]]))
 catalog={'catalogRevision':revision,'selectionRevision':revision,'components':[e for e in entries if e['recordType']=='component'],'clips':[e for e in entries if e['recordType']=='clip']}
 registry={'distribution':'portable','selectionRevision':revision,'selectionMeaning':'Current public catalog with reviewed source/media routes; no author-machine state.','clipBindings':[],'episodeBundles':[],'currentVisualBindings':[]}
 return registry,catalog
