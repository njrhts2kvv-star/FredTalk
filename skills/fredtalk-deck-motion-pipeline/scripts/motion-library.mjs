import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const defaultLibrary = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/style-library');
export const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, JSON.stringify(value,null,2)+'\n'); };
export function inside(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) throw Error('Expected a relative asset path');
  const file = path.resolve(root, relative);
  if (!file.startsWith(path.resolve(root)+path.sep)) throw Error(`Path leaves source root: ${relative}`);
  return file;
}
export function loadLibrary(root=defaultLibrary) {
  root=fs.realpathSync(root);
  const ledger=json(path.join(root,'approval-ledger.json'));
  const manifest=json(path.join(root,'library-manifest.json'));
  if (manifest.schemaVersion!==2 || manifest.ledgerSha256!==digest(path.join(root,'approval-ledger.json'))) throw Error('Stale or unsupported motion library; regenerate the manifest from its ledger');
  return {root,ledger,manifest};
}
export function selectEntries(manifest, filters={}) {
  const status=filters.status??'current';
  if (!['current','historical','all'].includes(status)) throw Error('status must be current, historical or all');
  return manifest.entries.filter(x =>
    (status==='all' || (status==='current' ? x.status==='confirmed-current' : x.status!=='confirmed-current')) &&
    (!filters.id || [x.referenceId,x.approvalId,x.collectionLabel].includes(filters.id)) &&
    (!filters.kind || x.kind===filters.kind) &&
    (!filters.group || x.group===filters.group) &&
    (!filters.topology || x.semanticGrammar===filters.topology) &&
    (!filters.query || [x.semanticUse,x.semanticGrammar,x.name].join(' ').toLowerCase().includes(filters.query.toLowerCase())));
}
export function resolvedEntry(root, entry) {
  const file = rel => rel ? path.resolve(root,rel) : null;
  return {...entry, videoPath:file(entry.video), sourcePaths:(entry.sourceFiles??[]).map(file),
    entryPoint:file(entry.entryPoint), publicDir:file(entry.publicDir),
    dependencyManifestPath:file(entry.dependencyManifest), ledgerPath:path.join(root,'approval-ledger.json')};
}
export function historicalDecisions(ledger, filters={}) {
  return (ledger.historicalDecisions??[]).filter(record=>{
    const item=record.decision??record;
    return (!filters.id || [item.referenceId,item.approvalId,item.stableId].includes(filters.id)) &&
      (!filters.query || JSON.stringify(record).toLowerCase().includes(filters.query.toLowerCase()));
  }).map(record=>({...record,recordType:'historical-decision',selectable:false}));
}
export function verifyLibrary(root=defaultLibrary) {
  const failures=[];
  let data;
  try { data=loadLibrary(root); } catch(e) { return {verdict:'FAIL',failures:[e.message]}; }
  const {manifest,ledger}=data;root=data.root;
  const ids=new Set();const hashes=new Set();
  for(const e of manifest.entries.filter(e=>e.status==='confirmed-current')) {
    if(ids.has(e.referenceId)) failures.push(`Duplicate ID ${e.referenceId}`);ids.add(e.referenceId);
    if(hashes.has(e.sha256)) failures.push(`Duplicate selected source ${e.referenceId}`);hashes.add(e.sha256);
    if(!e.acceptance?.evidence || !e.acceptance?.scope) failures.push(`Missing acceptance evidence ${e.referenceId}`);
    try {if(digest(path.resolve(root,e.video))!==e.sha256) failures.push(`Video hash mismatch ${e.referenceId}`);} catch(err){failures.push(`${e.referenceId}: ${err.message}`);}
    for(const rel of e.sourceFiles??[]) if(!fs.existsSync(path.resolve(root,rel))) failures.push(`Missing indexed source ${rel}`);
    if(e.kind==='media-dependency' && e.entryPoint) failures.push(`Media falsely declares a code entry ${e.referenceId}`);
    if(e.kind==='hybrid-composition' && !e.reuseScope) failures.push(`Missing hybrid boundary ${e.referenceId}`);
  }
  let inventory;
  try { inventory=json(path.join(root,'runtime/dependencies.json'));if(!Array.isArray(inventory.files))throw Error('Invalid dependency inventory'); }
  catch(e) { return {verdict:'FAIL',currentCount:ids.size,failures:[...failures,e.message]}; }
  for(const f of inventory.files) {
    try {
      const p=inside(root,f.file);
      if(fs.lstatSync(p).isSymbolicLink()) failures.push(`Runtime asset is a symlink: ${f.file}`);
      if(digest(p)!==f.sha256) failures.push(`Dependency hash mismatch ${f.file}`);
    } catch(e) {failures.push(e.message);}
  }
  if(ids.size!==ledger.activeReferenceIds.length || ledger.activeReferenceIds.some(id=>!ids.has(id))) failures.push('Current index differs from selected ledger scope');
  return {verdict:failures.length?'FAIL':'PASS',currentCount:ids.size,dependencyFiles:inventory.files.length,failures};
}
