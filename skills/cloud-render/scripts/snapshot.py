#!/usr/bin/env python3
"""Copy an explicit dependency allowlist or verify its recorded hashes."""
import argparse,hashlib,json,shutil,os
from datetime import datetime, timezone
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--verify',type=Path);p.add_argument('--source',type=Path);p.add_argument('--destination',type=Path);p.add_argument('--paths',nargs='+');a=p.parse_args()
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def is_relative_to(p,other):
 try:p.relative_to(other)
 except ValueError:return False
 return True
private_policy=os.environ.get('FREDTALK_LOCAL_ONLY_POLICY')
private_assets=json.loads(Path(private_policy).read_text()).get('localOnlyAssets',[]) if private_policy else []
private_hashes={item['sha256'] for item in private_assets}
def require_exportable(f,n,h):
 if (any(part.startswith('bgm-local-only') for part in n.parts)
     or f.name in ['bgm-owner.json','.fred-local-only.json'] or h in private_hashes):
  raise ValueError(f'Local-only BGM/config cannot enter a cloud snapshot: {n}; mix it locally after download')
if a.verify:
 root=a.verify.resolve();m=json.loads((root/'snapshot.json').read_text())
 for n,h in m['sha256'].items():
  q=(root/n).resolve();assert is_relative_to(q,root),n;assert digest(q)==h,n
  require_exportable(q,Path(n),h)
 print('All snapshot hashes verified');raise SystemExit
if not(a.source and a.destination and a.paths):p.error('Supply source, destination and explicit paths')
root=a.source.resolve();dest=a.destination.resolve()
if dest.exists() or is_relative_to(dest,root):raise ValueError('Destination must be a new directory outside source')
files={}
for name in a.paths:
 q=root/name
 if q.is_symlink() or not is_relative_to(q.resolve(),root):raise ValueError(f'External or linked path: {name}')
 if not q.exists():raise FileNotFoundError(q)
 for f in ([q] if q.is_file() else q.rglob('*')):
  if f.is_symlink():raise ValueError(f'Resolve linked dependency explicitly: {f}')
  if not f.is_file():continue
  n=f.relative_to(root)
  if any(x in n.parts for x in ['node_modules','.git','.ssh']) or f.name.startswith('.env') or f.suffix in ['.pem','.key']:raise ValueError(f'Excluded sensitive/cache path: {n}')
  file_hash=digest(f)
  require_exportable(f,n,file_hash)
  files[str(n)]=file_hash
dest.mkdir(parents=True)
for n,h in files.items():
 target=dest/n;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/n,target)
 if digest(target)!=h or digest(root/n)!=h:raise RuntimeError(f'Source changed during snapshot: {n}; discard snapshot')
(dest/'snapshot.json').write_text(json.dumps({'source':str(root),'createdAt':datetime.now(timezone.utc).isoformat(),'sha256':files},indent=2))
print(f'Snapshotted {len(files)} files')
