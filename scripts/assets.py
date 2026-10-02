"""Download optional private release packs; verify before safe extraction."""
import argparse
import hashlib
import json
import shutil
import subprocess
import tarfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def digest(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def records():return json.loads((ROOT/'library/media-manifest.json').read_text())['files']
def available(v):
 for p in (ROOT/'.artifacts/objects'/v['sha256'],ROOT/'library/demo'/v['sha256']):
  if p.is_file():return p
 return None
def extract(pack, expected):
 objects=ROOT/'.artifacts/objects';objects.mkdir(parents=True,exist_ok=True)
 with tarfile.open(pack,'r:gz') as tar:
  for member in tar:
   name=member.name
   if not member.isfile() or name not in expected or '/' in name:raise ValueError('Unexpected archive member')
   if member.size!=expected[name]:raise ValueError('Unexpected object size')
   target=objects/name;temp=objects/(name+'.part')
   with tar.extractfile(member) as src,temp.open('wb') as out:shutil.copyfileobj(src,out)
   if digest(temp)!=name:temp.unlink();raise ValueError('Object checksum mismatch')
   temp.replace(target)
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('action',choices=['status','download','verify','materialize']);p.add_argument('--project',help='Materialize only one repository-relative project directory');args=p.parse_args()
 files=records();unique={v['sha256']:v for v in files.values() if v['status']=='reviewed'}
 if args.action=='status':
  print(json.dumps({'reviewedObjects':len(unique),'downloadBytes':sum(v['size'] for v in unique.values()),'installedObjects':sum(available(v) is not None for v in unique.values()),'excludedPaths':sum(v['status']!='reviewed' for v in files.values())},indent=2));return
 if args.action=='download':
  release=json.loads((ROOT/'library/releases.json').read_text());folder=ROOT/'.artifacts/downloads';folder.mkdir(parents=True,exist_ok=True)
  for pack in release['packs']:
   target=folder/pack['name']
   if not target.exists():subprocess.run(['gh','release','download',release['tag'],'--repo',release['repository'],'--pattern',pack['name'],'--dir',str(folder)],check=True)
   if digest(target)!=pack['sha256']:raise ValueError('Pack checksum mismatch: '+pack['name'])
   extract(target,{h:v['size'] for h,v in unique.items()});target.unlink()
  print('Downloaded and verified reviewed assets.');return
 missing=[]
 for h,v in unique.items():
  f=available(v)
  if not f or digest(f)!=h:missing.append(h)
 if missing:raise SystemExit(f'{len(missing)} objects missing or invalid; run download first.')
 if args.action=='verify':print(f'Verified {len(unique)} objects.');return
 count=0
 if args.project:
  project=(ROOT/args.project).resolve()
  if not project.is_relative_to(ROOT/'components/projects'):raise SystemExit('Choose a path under components/projects/')
 for name,v in files.items():
  if v['status']!='reviewed' or not name.startswith('components/'):continue
  target=(ROOT/name).resolve()
  if not target.is_relative_to(ROOT/'components'):raise ValueError('Unsafe target')
  if args.project and not target.is_relative_to(project):continue
  target.parent.mkdir(parents=True,exist_ok=True)
  if target.exists() and digest(target)!=v['sha256']:raise ValueError('Refusing to overwrite changed asset: '+name)
  if not target.exists():shutil.copyfile(available(v),target)
  count+=1
 print(f'Materialized {count} asset paths. Adapt in a separate working copy.')
if __name__=='__main__':main()
