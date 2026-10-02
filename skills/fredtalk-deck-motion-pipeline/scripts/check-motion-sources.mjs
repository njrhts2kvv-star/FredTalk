#!/usr/bin/env node
// Bundles source registries and reads metadata. Does not render delivery media.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {loadLibrary,writeJson} from './motion-library.mjs';
const args=process.argv.slice(2);const value=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1];};
if(args.includes('--help')||!value('--output')){console.log('Usage: check-motion-sources.mjs --output <qc.json> [--job <name>] [--library <path>] [--runtime <project-runtime>]\nOnly source bundle and composition metadata are checked; no full-motion parity or user acceptance is asserted.');process.exit(args.includes('--help')?0:2);}
const {root,manifest}=loadLibrary(value('--library'));
const skillRoot=path.resolve(root,'../..'),runtime=path.resolve(value('--runtime')??path.join(skillRoot,'../_runtime/remotion/approved-motion-library'));
const require=createRequire(path.join(runtime,'package.json'));
const {bundle}=require('@remotion/bundler');const {getCompositions}=require('@remotion/renderer');
const actual=require('remotion/package.json').version;
if(actual!=='4.0.519')throw Error(`Expected original-source runtime 4.0.519, got ${actual}`);
const output=path.resolve(value('--output'));fs.mkdirSync(path.dirname(output),{recursive:true});
const groups=Object.groupBy(manifest.entries.filter(e=>e.entryPoint&&e.status==='confirmed-current'&&(!value('--job')||e.renderJob===value('--job'))),e=>e.renderJob);
const results=[];
for(const [job,entries] of Object.entries(groups)){
 try{
  const serveUrl=await bundle({entryPoint:path.resolve(root,entries[0].entryPoint),publicDir:path.resolve(root,entries[0].publicDir),outDir:path.join(path.dirname(output),'source-bundles',job),webpackOverride:c=>({...c,resolve:{...c.resolve,modules:[path.join(runtime,'node_modules'),'node_modules']}})});
  const comps=await getCompositions(serveUrl,{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE});
  const selected=entries.map(e=>{const c=comps.find(c=>c.id===e.compositionId);if(!c)throw Error(`Missing selected composition ${e.referenceId}/${e.compositionId}`);return {referenceId:e.referenceId,compositionId:c.id,fps:c.fps,width:c.width,height:c.height,durationInFrames:c.durationInFrames};});
  results.push({job,status:'source-bundle-and-metadata-passed',selected});console.log(`${job}: ${selected.length} selected source compositions loaded`);
 }catch(e){results.push({job,status:'failed',error:e.message});console.error(`${job}: ${e.message}`);}
 writeJson(output,{checkedAt:new Date().toISOString(),runtimeVersion:actual,libraryLedgerSha256:manifest.ledgerSha256,results,fullMotionParity:'not-tested'});
}
if(!results.length||results.some(r=>r.status==='failed'))process.exitCode=1;
