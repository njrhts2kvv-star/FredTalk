"""Freeze only render inputs, detect source mutation, and emit a verifiable manifest."""
import argparse,hashlib,json,shutil,datetime,os
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('destination',type=Path);p.add_argument('--reuse',type=Path,help='Prior immutable snapshot for hash-checked hardlink reuse');args=p.parse_args()
root=Path(__file__).resolve().parents[1];dest=args.destination.resolve()
reuse=args.reuse.resolve() if args.reuse else None
reuse_files=json.loads((reuse/'snapshot.json').read_text())['files'] if reuse else {}
if dest.exists():raise SystemExit('Snapshot destination already exists; choose a new immutable directory')
paths=[Path(x) for x in ['package.json','package-lock.json','tsconfig.json','manifest.json']]
for directory in ['src','public','scripts']:
 paths.extend(f.relative_to(root) for f in (root/directory).rglob('*') if f.is_file() and '__pycache__' not in f.parts)
manifest={}
for rel in paths:
 source=root/rel;before=hashlib.sha256(source.read_bytes()).hexdigest();out=dest/rel;out.parent.mkdir(parents=True,exist_ok=True)
 if reuse and reuse_files.get(str(rel))==before and hashlib.sha256((reuse/rel).read_bytes()).hexdigest()==before:
  os.link(reuse/rel,out)
 else:shutil.copy2(source,out)
 after=hashlib.sha256(source.read_bytes()).hexdigest();copied=hashlib.sha256(out.read_bytes()).hexdigest()
 if before!=after or before!=copied:raise SystemExit(f'Source changed during snapshot: {rel}')
 manifest[str(rel)]=before
for name, expected in manifest.items():
 if hashlib.sha256((root/name).read_bytes()).hexdigest()!=expected:raise SystemExit(f'Source changed before snapshot completed: {name}')
(dest/'snapshot.json').write_text(json.dumps({'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':manifest},indent=2))
print(json.dumps({'destination':str(dest),'files':len(manifest)}))
