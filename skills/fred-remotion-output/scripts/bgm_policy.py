"""Explicit user-supplied music and optional user-owned export exclusions."""
import hashlib
import json
import os
from pathlib import Path

def digest(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as stream:
  for chunk in iter(lambda:stream.read(1024*1024),b''):h.update(chunk)
 return h.hexdigest()
def load_policy():
 # Private identities never ship. Users may explicitly configure their own deny list.
 path=os.environ.get('FREDTALK_LOCAL_ONLY_POLICY')
 return json.loads(Path(path).read_text()) if path else {'localOnlyAssets':[]}
def machine_fingerprint():return None
def authorized_owner(config_path=None):return None
def resolve_music(explicit_path=None):
 if not explicit_path:raise ValueError('No music supplied. Provide your own --bgm.')
 path=Path(explicit_path).resolve(strict=True);actual=digest(path)
 if actual in {x['sha256'] for x in load_policy().get('localOnlyAssets',[])}:
  raise ValueError('Local-only music cannot be used in a portable release. Supply your own BGM.')
 return path,actual,'user-supplied'
def export_exclusion(path,sha256=None):
 path=Path(path)
 if any(part.startswith('bgm-local-only') for part in path.parts) or path.name in {'bgm-owner.json','.fred-local-only.json'}:
  return 'local-only music or owner configuration'
 if (sha256 or digest(path)) in {x['sha256'] for x in load_policy().get('localOnlyAssets',[])}:
  return 'user-defined local-only music content hash'
 return None
