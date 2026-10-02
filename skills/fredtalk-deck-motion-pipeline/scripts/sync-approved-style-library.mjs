#!/usr/bin/env node
// Import an explicitly selected source package. Existing targets are never overwritten.
import fs from 'node:fs';
import path from 'node:path';
import {digest,json,writeJson,inside,defaultLibrary} from './motion-library.mjs';
const args=process.argv.slice(2);const value=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1];};
if(args.includes('--help') || !value('--source') || !value('--plan')) {console.log('Usage: sync-approved-style-library.mjs --source <archive> --plan <approved-import.json> [--library <new-directory>]\nPlan: collectionId, acceptance, assets[], jobs{entryPoint,publicDir}, historicalDecisions[]. Build in a new directory, verify, then switch the active library.');process.exit(args.includes('--help')?0:2);}
const source=fs.realpathSync(value('--source')),plan=json(value('--plan')),target=path.resolve(value('--library')??defaultLibrary);
if(fs.existsSync(target))throw Error('Target exists. Import into a new staging directory; do not overwrite a live library.');
if(!plan.acceptance?.evidence || !plan.acceptance?.scope || !plan.assets?.length)throw Error('Explicit selection and acceptance evidence required');
const selectedIds=plan.assets.map(a=>a.referenceId);
if(!plan.collectionId || !plan.runtimeDependencies || selectedIds.some(id=>typeof id!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(id)) || new Set(selectedIds).size!==selectedIds.length)throw Error('Plan requires a collection, runtime versions and unique safe reference IDs');
const imported=new Map(),sameBytes=new Map(),bareModules=new Set();
for(const shared of plan.sharedFiles??[]){
  if(!path.isAbsolute(shared.file)||digest(shared.file)!==shared.sha256)throw Error('Shared asset hash mismatch');
  sameBytes.set(shared.sha256,shared.file);
}
const copyFile=(relative,to=relative)=>{
  const from=inside(source,relative),dest=inside(target,to);
  if(!fs.realpathSync(from).startsWith(source+path.sep))throw Error(`Source asset leaves archive: ${relative}`);
  if(imported.has(to))return;
  const sha256=digest(from);fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(sameBytes.has(sha256))fs.linkSync(sameBytes.get(sha256),dest);else {fs.copyFileSync(from,dest);sameBytes.set(sha256,dest);}
  imported.set(to,{file:to,sha256,bytes:fs.statSync(dest).size,sourcePath:relative});
};
const resolveImport=(from,spec)=>{
  const base=path.resolve(path.dirname(from),spec);
  if(!base.startsWith(source+path.sep))throw Error(`Import leaves archive: ${spec}`);
  const candidates=[base,...['.ts','.tsx','.mjs','.js','.jsx','.json','.css'].map(x=>base+x),...['index.ts','index.tsx','index.js'].map(x=>path.join(base,x))];
  const found=candidates.find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
  if(!found)throw Error(`Unresolved import ${spec} from ${path.relative(source,from)}`);return found;
};
const visit=relative=>{
  if(imported.has('runtime/'+relative))return;
  copyFile(relative,'runtime/'+relative);
  if(!/\.(?:mjs|js|jsx|ts|tsx|css)$/.test(relative))return;
  const file=inside(source,relative),body=fs.readFileSync(file,'utf8');
  const specs=[...body.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*|\brequire\s*\(\s*)['"]([^'"]+)['"]/g)].map(m=>m[1]);
  for(const spec of specs){if(spec.startsWith('.'))visit(path.relative(source,resolveImport(file,spec)));else if(spec.startsWith('/'))throw Error(`Absolute code import ${spec}`);else bareModules.add(spec);}
};
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const entries=[];
for(const a of plan.assets){
  if(digest(inside(source,a.localVideo))!==a.sha256)throw Error(`Selected original changed: ${a.referenceId}`);
  const video=`videos/current/${a.referenceId}${path.extname(a.localVideo)}`;
  copyFile(a.localVideo,video);
  for(const f of a.sourceFiles)visit(f);
  const job=a.renderJob?plan.jobs[a.renderJob]:null;
  if(a.renderJob&&!job)throw Error(`Missing job ${a.renderJob}`);
  if(job){visit(job.entryPoint);for(const f of walk(inside(source,job.publicDir)))copyFile(path.relative(source,f),'runtime/'+path.relative(source,f));}
  entries.push({...a,video,sourceFiles:a.sourceFiles.map(f=>'runtime/'+f),entryPoint:job?'runtime/'+job.entryPoint:null,publicDir:job?'runtime/'+job.publicDir:null,dependencyManifest:'runtime/dependencies.json',status:'confirmed-current',acceptance:plan.acceptance,fullMotionParity:'not-verified',componentReadiness:a.sourceStatus==='historical-manifest-candidate'?'source-mapping-review-required':a.kind==='media-dependency'?'media-only':a.kind==='hybrid-composition'?'partial-native':'source-located-keyframe-trial-recorded'});
}
const packageFile=path.join(target,'runtime/package.json');
writeJson(packageFile,{name:'fred-approved-motion-sources',private:true,type:'module',dependencies:plan.runtimeDependencies});
imported.set('runtime/package.json',{file:'runtime/package.json',sha256:digest(packageFile),bytes:fs.statSync(packageFile).size,sourcePath:null,generatedFrom:'plan.runtimeDependencies'});
writeJson(path.join(target,'runtime/dependencies.json'),{schemaVersion:1,scope:'Static relative import closure plus each selected job public directory and generated runtime package. Dynamic public names are retained conservatively; this is not a claim of a minimal runtime.',bareModules:[...bareModules].sort(),files:[...imported.values()].sort((a,b)=>a.file.localeCompare(b.file))});
const ledger={schemaVersion:2,collectionId:plan.collectionId,activeReferenceIds:entries.map(e=>e.referenceId),approvals:entries,historicalDecisions:plan.historicalDecisions??[]};
writeJson(path.join(target,'approval-ledger.json'),ledger);
writeJson(path.join(target,'library-manifest.json'),{schemaVersion:2,collectionId:plan.collectionId,ledgerSha256:digest(path.join(target,'approval-ledger.json')),entries});
console.log(JSON.stringify({library:target,selected:entries.length,files:imported.size,uniqueFileHashes:sameBytes.size,bareModules:[...bareModules]}));
