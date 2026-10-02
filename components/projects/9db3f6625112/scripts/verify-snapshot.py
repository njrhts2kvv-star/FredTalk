import hashlib,json
from pathlib import Path
root=Path.cwd();manifest=json.loads((root/'snapshot.json').read_text());bad=[]
for name,expected in manifest['files'].items():
 p=root/name
 if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=expected:bad.append(name)
if bad:raise SystemExit('Snapshot mismatch: '+', '.join(bad))
print('Verified',len(manifest['files']),'snapshot inputs')
