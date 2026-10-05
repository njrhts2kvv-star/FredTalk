"""Download optional private release packs; verify before safe extraction."""
import argparse
import hashlib
import json
import shutil
import subprocess
import tarfile
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def digest(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def records():return json.loads((ROOT/'library/media-manifest.json').read_text())['files']
@lru_cache(maxsize=4)
def bundled_fonts(root):
 registry=root/'skills/fred-remotion-output/references/typography-registry.json'
 if not registry.is_file():return {}
 return {face['sha256']:root/face['path'] for face in json.loads(registry.read_text())['faces'] if face['path'].startswith('library/fonts/')}
def available(v):
 for p in (bundled_fonts(ROOT).get(v['sha256']),ROOT/'.artifacts/objects'/v['sha256'],ROOT/'library/demo'/v['sha256']):
  if p is None:continue
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
def assemble_pack(pack, folder):
 target=folder/pack['name']
 for part in pack['parts']:
  source=folder/part['name']
  if source.stat().st_size!=part['size'] or digest(source)!=part['sha256']:
   raise ValueError('Part checksum mismatch: '+part['name'])
 temporary=folder/(pack['name']+'.assembling')
 with temporary.open('wb') as out:
  for part in pack['parts']:
   with (folder/part['name']).open('rb') as src:shutil.copyfileobj(src,out)
 if digest(temporary)!=pack['sha256']:
  temporary.unlink();raise ValueError('Assembled pack checksum mismatch')
 temporary.replace(target)
 for part in pack['parts']:(folder/part['name']).unlink()
 return target
def validate_release_manifest(release, manifest_bytes):
 expected=release.get('manifestSha256')
 actual=hashlib.sha256(manifest_bytes).hexdigest()
 if expected!=actual:
  raise ValueError('Release manifest does not match current dependencies; rebuild media packs before downloading.')

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('action',choices=['status','download','verify','materialize']);p.add_argument('--project',help='Materialize only one repository-relative project directory');args=p.parse_args()
 files=records();unique={v['sha256']:v for v in files.values() if v['status']=='reviewed'}
 if args.action=='status':
  print(json.dumps({'reviewedObjects':len(unique),'downloadBytes':sum(v['size'] for v in unique.values()),'installedObjects':sum(available(v) is not None for v in unique.values()),'excludedPaths':sum(v['status']!='reviewed' for v in files.values())},indent=2));return
 if args.action=='download':
  release=json.loads((ROOT/'library/releases.json').read_text());validate_release_manifest(release,(ROOT/'library/media-manifest.json').read_bytes());folder=ROOT/'.artifacts/downloads';folder.mkdir(parents=True,exist_ok=True)
  for pack in release['packs']:
   target=folder/pack['name']
   if not target.exists():
    for entry in pack.get('parts',[pack]):
     if not (folder/entry['name']).exists():
      subprocess.run(['gh','release','download',pack.get('tag',release['tag']),'--repo',release['repository'],'--pattern',entry['name'],'--dir',str(folder)],check=True)
    if pack.get('parts'):assemble_pack(pack,folder)
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
