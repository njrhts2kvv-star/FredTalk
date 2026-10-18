"""Restore deduplicated fonts, brand files and sound effects inside this package."""
from pathlib import Path
import hashlib,json,shutil
root=Path(__file__).resolve().parent
for item in json.loads((root/'asset-bindings.json').read_text()):
    target=(root/item['path']).resolve()
    if not target.is_relative_to(root) or target.is_symlink(): raise ValueError('Unsafe output path')
    source=root/'shared-assets'/item['sha256']
    with source.open('rb') as f: actual=hashlib.file_digest(f,'sha256').hexdigest()
    if actual!=item['sha256'] or source.stat().st_size!=item['size']: raise ValueError('Asset identity mismatch')
    if target.exists():
        with target.open('rb') as f: current=hashlib.file_digest(f,'sha256').hexdigest()
        if current!=actual: raise ValueError('Existing user asset differs: '+item['path'])
        continue
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(source,target)
print('Shared assets restored; install the selected project dependencies before rendering.')
