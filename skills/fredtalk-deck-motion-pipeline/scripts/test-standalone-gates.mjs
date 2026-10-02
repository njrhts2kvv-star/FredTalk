#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {verifyFormalApproval} from './stage-gate-formal.mjs';
import {productionCommandKind} from './production-command.mjs';

const root = mkdtempSync(join(tmpdir(), 'fred-standalone-4k-project-'));
const scripts = import.meta.dirname;
const hash = path => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
const file = (name, data) => { const path=join(root,name); writeFileSync(path,typeof data==='string'?data:JSON.stringify(data)); return path; };
mkdirSync(join(root,'src'));
file('reference.svg','<svg xmlns="http://www.w3.org/2000/svg"/>');
file('src/Scene.tsx','export const Scene=({progress}) => <div style={{opacity:progress}}>Visible focus</div>;');
file('preview-render.mjs','console.log("render action fixture executed");');
const pages = Array.from({length:4},(_,i)=>({stableId:`p${i}`,sourceBeatIds:[`b${i}`],scriptAnchor:`script ${i}`,exactScreenWords:[`word ${i}`],oneQuestion:`question ${i}`,layoutFamily:'device-window',majorGeometry:'window',readingOrder:[`word ${i}`],visualCenter:'media',styleTrack:'real-evidence',mediaRole:'real-evidence',referenceImages:[],finalFrameReference:{path:'reference.svg',checksum:hash(join(root,'reference.svg'))},typographyRoles:[{role:'label',text:`word ${i}`,sizeClass:'normal'}],connectorType:'none',pathTopology:'none',spokenOrder:[`b${i}`],timingSource:'audio-timecode',motionEvents:[{sourceBeatId:`b${i}`,event:'show result',cueFrame:i*12+2}],noFade:false,primaryMotion:'device-reveal',secondaryMotion:'caption-focus',additionalMotions:['handoff'],startFrame:i*12,durationInFrames:12,finalHoldFrames:1,implementationComponentId:'Device',background:'white'}));
const base={contractVersion:1,deliveryProfile:'standalone-video',productionSourceDir:'src',timelineFps:24,outputSpec:{width:3840,height:2160,fps:24},pages};
const cases=[];
const test=(name,fn)=>{try{fn();cases.push({name,pass:true});}catch(e){cases.push({name,pass:false,error:e.message});}};
const writeContract=(value, suffix='')=>{
 const manifest=file('manifest.json',{pages:value.pages.map(({stableId,sourceBeatIds})=>({stableId,sourceBeatIds}))});
 value.runtimeSource={type:'manifest-derived',sourcePath:'manifest.json',checksum:hash(manifest)};
 file('contract.json',value);file('brief.md',value.pages.map(p=>`${p.stableId}\n${p.exactScreenWords.join('\n')}`).join('\n')+suffix);
};
const run=(stage)=>spawnSync(process.execPath,[join(scripts,'validate-stage-gate.mjs'),'--stage',stage,'--contract',join(root,'contract.json'),'--prompt',join(root,'brief.md'),'--receipt-out',join(root,`${stage}.json`),...(stage==='direction'?[]:['--previous-receipt',join(root,`${{motion:'direction',render:'motion'}[stage]}.json`)]),...(stage==='render'?['--source-dir',join(root,'src')]:[])],{encoding:'utf8'});
const passStages=(contract=structuredClone(base),suffix='')=>{writeContract(contract,suffix);for(const s of ['direction','motion','render']){const r=run(s);assert.equal(r.status,0,`${s}: ${r.stdout} ${r.stderr}`);}};
try{
 test('standalone permits content-driven repeated layouts, equal source timing and purposeful opacity',()=>passStages());
 test('same-role typography and brand geometry do not trigger a global-layout lock',()=>passStages(structuredClone(base),'\n同组统一字号；品牌角标固定坐标。'));
 test('pure-media scenes need no invented screen words or typography',()=>{const c=structuredClone(base);for(const p of c.pages){p.exactScreenWords=[];p.typographyRoles=[];p.readingOrder=['actual media result'];}passStages(c);});
 test('global cues use the scene start offset',()=>{const c=structuredClone(base);c.pages=[{...c.pages[0],startFrame:1200,durationInFrames:300,motionEvents:[{sourceBeatId:'b0',event:'show result',cueFrame:1260}]}];passStages(c);});
 test('out-of-range cue is still blocked',()=>{const c=structuredClone(base);c.pages[0].motionEvents[0].cueFrame=99;writeContract(c);run('direction');const r=run('motion');assert.notEqual(r.status,0);assert.match(r.stdout,/cue|hold|range/);});
 test('stale media evidence is still blocked',()=>{const c=structuredClone(base);c.pages[0].finalFrameReference.checksum='sha256:stale';writeContract(c);run('direction');assert.notEqual(run('motion').status,0);});
 test('Deck layout policy remains explicitly scoped to Deck',()=>{const c=structuredClone(base);c.deliveryProfile='deck';writeContract(c);assert.notEqual(run('direction').status,0);});
 test('handwritten second page registry is still blocked for standalone',()=>{file('src/Bad.tsx','const pages = [{id:"second-fact-source"}];');writeContract(structuredClone(base));run('direction');run('motion');const r=run('render');assert.notEqual(r.status,0);assert.match(r.stdout,/registry|fact source/);rmSync(join(root,'src/Bad.tsx'));});
 test('4k preview name is not formal approval',()=>assert.deepEqual(productionCommandKind(['node','render-4k-preview.mjs']),{render:true,formal:false}));
 test('generic renderer name has no artificial formal prerequisite',()=>assert.deepEqual(productionCommandKind(['node','render.mjs','final-job.json']),{render:true,formal:false}));
 test('Remotion dimensions are not production approval',()=>assert.deepEqual(productionCommandKind(['npx','remotion','render','src/index.tsx','Main','out.mp4','--width','3840','--height','2160']),{render:true,formal:false}));
 test('a preview in a path containing 4k is accepted by the runner',()=>{passStages();const r=spawnSync(process.execPath,[join(scripts,'run-stage-gate.mjs'),'--stage','render','--action','preview-render','--contract',join(root,'contract.json'),'--prompt',join(root,'brief.md'),'--previous-receipt',join(root,'motion.json'),'--receipt-out',join(root,'render.json'),'--source-dir',join(root,'src'),'--',process.execPath,join(root,'preview-render.mjs')],{encoding:'utf8'});assert.equal(r.status,0,`${r.stdout} ${r.stderr}`);});
 const makeMedia=(name,size,fps)=>{const out=join(root,name);const r=spawnSync('ffmpeg',['-v','error','-f','lavfi','-i',`color=white:s=${size}:r=${fps}`,'-frames:v','2','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',out],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return out;};
 const preview=makeMedia('viewed-4k.mp4','3840x2160',24);
 const portrait=makeMedia('viewed-portrait.mp4','1080x1920',24);
 const approved=(path=preview,contract=base,overrides={},warnings=[])=>{const contractChecksum=`sha256:${'1'.repeat(64)}`;const approvalPath=file('approval.json',{approvalKind:'preview-acceptance',status:'approved',approvedBy:'user',approvedAt:new Date().toISOString(),representativePages:contract.pages.map(p=>p.stableId),coverage:['white'],contractChecksum,previewFiles:[{path,checksum:hash(path)}],qualityChecks:{typography:true,layout:true,spokenTiming:true,motionClarity:true,finalFrame:true},...overrides});const failures=[];verifyFormalApproval({approvalPath,contractChecksum,sourceTreeChecksum:`sha256:${'2'.repeat(64)}`,contract,pages:contract.pages,failures,warnings});return failures;};
 test('actual 4k24 viewed preview is valid without an extra 1080 render',()=>assert.deepEqual(approved(),[]));
 test('actual portrait preview is valid for a portrait delivery',()=>assert.deepEqual(approved(portrait,{...base,outputSpec:{width:2160,height:3840,fps:24}}),[]));
 test('actual target risks do not require unrelated grid/curve/branch layouts',()=>assert.deepEqual(approved(),[]));
 test('wrong delivery aspect remains blocked',()=>assert.match(approved(portrait).join('\n'),/aspect|dimensions/));
 test('wrong native frame rate remains blocked',()=>assert.match(approved(preview,{...base,timelineFps:60}).join('\n'),/fps|frame rate/));
 test('restored identical hash preserves historical sample acceptance',()=>{const warnings=[];assert.deepEqual(approved(preview,base,{approvedAt:'2000-01-01T00:00:00Z'},warnings),[]);assert.ok(warnings.some(message=>/mtime|restor|modification/.test(message)));});
 test('restored sample with different bytes still fails its recorded hash',()=>assert.match(approved(preview,base,{approvedAt:'2000-01-01T00:00:00Z',previewFiles:[{path:preview,checksum:`sha256:${'0'.repeat(64)}`}]}).join('\n'),/checksum/));
 test('invalid historical decision time is still rejected',()=>assert.match(approved(preview,base,{approvedAt:'not-an-iso-date'}).join('\n'),/valid ISO/));
 test('future decision time outside clock tolerance is rejected',()=>assert.match(approved(preview,base,{approvedAt:new Date(Date.now()+120000).toISOString()}).join('\n'),/future/));
 test('bounded clock skew is not treated as a fabricated future decision',()=>assert.deepEqual(approved(preview,base,{approvedAt:new Date(Date.now()+30000).toISOString()}),[]));
 console.log(JSON.stringify({passed:cases.filter(c=>c.pass).length,total:cases.length,cases},null,2));
 assert.ok(cases.every(c=>c.pass),'standalone regressions failed');
}finally{rmSync(root,{recursive:true,force:true});}
