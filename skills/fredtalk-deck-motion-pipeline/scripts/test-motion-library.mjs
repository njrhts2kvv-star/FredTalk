import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {digest,writeJson,loadLibrary,selectEntries,verifyLibrary,historicalDecisions} from './motion-library.mjs';
import {validateMotionContract} from './validate-motion-contract.mjs';
import {reviewMotionSources} from './review-motion-source.mjs';
const temporary=fn=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'fred-motion-test-'));try{return fn(root);}finally{fs.rmSync(root,{recursive:true,force:true});}};

test('selection is exact and preserves two source versions sharing a composition ID',()=>{
 const manifest={entries:[{referenceId:'source-a',approvalId:'approved-a',compositionId:'same',status:'confirmed-current'},{referenceId:'source-b',approvalId:'approved-b',compositionId:'same',status:'confirmed-current'},{referenceId:'old',status:'superseded'}]};
 assert.equal(selectEntries(manifest).length,2);
 assert.equal(selectEntries(manifest,{id:'same'}).length,0);
 assert.equal(selectEntries(manifest,{id:'approved-b'})[0].referenceId,'source-b');
 assert.equal(selectEntries(manifest,{status:'historical'})[0].referenceId,'old');
});
test('a changed approval ledger invalidates a previously built index',()=>temporary(root=>{
 writeJson(path.join(root,'approval-ledger.json'),{activeReferenceIds:[]});
 writeJson(path.join(root,'library-manifest.json'),{schemaVersion:2,ledgerSha256:digest(path.join(root,'approval-ledger.json')),entries:[]});
 assert.equal(loadLibrary(root).manifest.entries.length,0);
 writeJson(path.join(root,'approval-ledger.json'),{activeReferenceIds:['new']});
 assert.throws(()=>loadLibrary(root),/Stale/);
}));
test('changed media bytes are detected independently of file names',()=>temporary(root=>{
 fs.writeFileSync(path.join(root,'source.mp4'),'original-media');
 const entry={referenceId:'a',status:'confirmed-current',video:'source.mp4',sha256:digest(path.join(root,'source.mp4')),sourceFiles:[],kind:'media-dependency',acceptance:{evidence:'user-selection',scope:'reference'}};
 writeJson(path.join(root,'approval-ledger.json'),{activeReferenceIds:['a']});
 writeJson(path.join(root,'library-manifest.json'),{schemaVersion:2,ledgerSha256:digest(path.join(root,'approval-ledger.json')),entries:[entry]});
 writeJson(path.join(root,'runtime/dependencies.json'),{files:[]});
 assert.equal(verifyLibrary(root).verdict,'PASS');fs.writeFileSync(path.join(root,'source.mp4'),'changed-media');
 assert.equal(verifyLibrary(root).verdict,'FAIL');
}));
test('existing contracts without new declarations remain valid',()=>assert.deepEqual(validateMotionContract({pages:[{stableId:'old'}]},'/tmp/c.json'),[]));
test('a reviewed source motion permits specific alpha behavior but expires on source edits',()=>temporary(root=>{
 const file=path.join(root,'Source.tsx');fs.writeFileSync(file,'const View = () => <div style={{opacity: visible}}>text</div>;');
 assert.equal(reviewMotionSources([file],root).length,1);
 const review={file:'Source.tsx',checksum:'sha256:'+digest(file),rules:['dynamic-opacity'],frameRange:[0,4],reason:'Original object visibility switch',evidence:'Inspected exact source interval'};
 assert.deepEqual(reviewMotionSources([file],root,[review]),[]);
 fs.appendFileSync(file,'\nconst newMotion = true;');assert.ok(reviewMotionSources([file],root,[review]).some(x=>x.includes('stale')));
 review.checksum='sha256:'+digest(file);fs.appendFileSync(file,'\nconst pages = [];');review.checksum='sha256:'+digest(file);assert.ok(reviewMotionSources([file],root,[review]).some(x=>x.includes('registry')));
}));
test('historical approval wording cannot make an old decision selectable',()=>{
 const records=historicalDecisions({historicalDecisions:[{decision:{approvalId:'old',status:'confirmed-current'}}]},{id:'old'});
 assert.equal(records.length,1);assert.equal(records[0].selectable,false);assert.equal(records[0].recordType,'historical-decision');
});
test('standalone video can omit Deck mapping and badge while default Deck cannot',()=>temporary(root=>{
 const contract={deliveryProfile:'standalone-video',pages:[{stableId:'clip',scriptAnchor:'spoken cue',sourceBeatIds:['a'],durationSeconds:4,outputFile:'clip.mp4',background:'white',badgeVariant:'none',cues:[{startSeconds:0,endSeconds:2,event:'select phrase',screenTarget:'text'}]}]};
 const file=path.join(root,'c.json');const run=()=>JSON.parse(spawnSync(process.execPath,[path.join(import.meta.dirname,'validate-contract.mjs'),'--contract',file,'--json'],{encoding:'utf8'}).stdout);
 writeJson(file,contract);assert.equal(run().verdict,'PASS');
 delete contract.deliveryProfile;writeJson(file,contract);const result=run();assert.equal(result.verdict,'FAIL');
 assert.ok(result.failures.some(x=>x.includes('deckMapping')));assert.ok(result.failures.some(x=>x.includes('badgeVariant')));
}));
test('import resolves code and public dependencies without overwriting a live library or leaving its root',()=>temporary(root=>{
 const archive=path.join(root,'archive');fs.mkdirSync(path.join(archive,'src'),{recursive:true});fs.mkdirSync(path.join(archive,'public'));
 fs.writeFileSync(path.join(archive,'clip.mp4'),'selected-source');fs.writeFileSync(path.join(archive,'src/index.ts'),"import './part';\n");fs.writeFileSync(path.join(archive,'src/part.ts'),'export const value = 1;');fs.writeFileSync(path.join(archive,'public/item.bin'),'media');
 const asset={referenceId:'source-a',localVideo:'clip.mp4',sha256:digest(path.join(archive,'clip.mp4')),sourceFiles:['src/index.ts'],renderJob:'a',kind:'source-composition'};
 const plan={collectionId:'test',acceptance:{evidence:'fixture-selection',scope:'test'},runtimeDependencies:{remotion:'4.0.519'},assets:[asset],jobs:{a:{entryPoint:'src/index.ts',publicDir:'public'}}};
 const planFile=path.join(root,'plan.json'),target=path.join(root,'library');writeJson(planFile,plan);
 const run=where=>spawnSync(process.execPath,[path.join(import.meta.dirname,'sync-approved-style-library.mjs'),'--source',archive,'--plan',planFile,'--library',where],{encoding:'utf8'});
 assert.equal(run(target).status,0);assert.equal(verifyLibrary(target).verdict,'PASS');assert.ok(fs.existsSync(path.join(target,'runtime/src/part.ts')));assert.ok(fs.existsSync(path.join(target,'runtime/public/item.bin')));
 const ledgerHash=digest(path.join(target,'approval-ledger.json'));assert.notEqual(run(target).status,0);assert.equal(digest(path.join(target,'approval-ledger.json')),ledgerHash);
 plan.assets[0].referenceId='../escape';writeJson(planFile,plan);assert.notEqual(run(path.join(root,'new-library')).status,0);assert.equal(fs.existsSync(path.join(root,'new-library')),false);
 fs.unlinkSync(path.join(target,'runtime/dependencies.json'));assert.equal(verifyLibrary(target).verdict,'FAIL');
}));
test('surface clipping, no-border conflicts and partial full-screen masks are rejected',()=>{
 const contract={pages:[{stableId:'p',visualContract:{objects:[{id:'surface',border:'none',strokeWidth:2,clipScope:'surface'},{id:'mask',role:'full-screen-mask',coverage:'subtitle-safe'}]}}]};
 assert.equal(validateMotionContract(contract,'/tmp/c.json').length,3);
 contract.pages[0].visualContract.objects=[{id:'surface',border:'none',strokeWidth:0,clipScope:'content'},{id:'mask',role:'full-screen-mask',coverage:'viewport'}];
 assert.deepEqual(validateMotionContract(contract,'/tmp/c.json'),[]);
});
test('H3 reconstruction requires real source bytes, intermediate states and ordered clocks',()=>temporary(root=>{
 const source=path.join(root,'h3.mp4');fs.writeFileSync(source,'source');
 const r={sourceVideo:{path:'h3.mp4',checksum:'sha256:'+digest(source),fps:30,startFrame:0,endFrameExclusive:90},mode:'full-remotion',output:{fps:60,durationInFrames:240},preserve:['branch motion'],adapt:[],mediaDependencies:[],review:{status:'agent-reviewed',evidence:'inspected source interval'},states:[{sourceFrame:0,role:'opening',objectIds:['document']},{sourceFrame:40,role:'intermediate',objectIds:['document']},{sourceFrame:89,role:'final',objectIds:['document']}],timeMap:[{sourceFrame:0,outputFrame:0,beatId:'a'},{sourceFrame:89,outputFrame:239,beatId:'b'}]};
 const contract={pages:[{stableId:'p',productionRoute:'h3-remotion',reconstruction:r}]};
 assert.deepEqual(validateMotionContract(contract,path.join(root,'c.json')),[]);
 r.timeMap[1].sourceFrame=-1;assert.ok(validateMotionContract(contract,path.join(root,'c.json')).some(x=>x.includes('timeMap')));
 r.timeMap[1].sourceFrame=89;fs.writeFileSync(source,'new output');assert.ok(validateMotionContract(contract,path.join(root,'c.json')).some(x=>x.includes('checksum mismatch')));
}));
test('a stale upstream tail fails after a local source replacement',()=>temporary(root=>{
 fs.writeFileSync(path.join(root,'tail.mp4'),'old-tail');
 const contract={pages:[{stableId:'next',upstreamTail:{path:'tail.mp4',checksum:'sha256:'+digest(path.join(root,'tail.mp4')),stateId:'end-state'}}]};
 assert.deepEqual(validateMotionContract(contract,path.join(root,'c.json')),[]);
 fs.writeFileSync(path.join(root,'tail.mp4'),'new-tail');assert.ok(validateMotionContract(contract,path.join(root,'c.json')).length);
}));
test('an unchanged PNG cannot hide a changed upstream source video',()=>temporary(root=>{
 fs.writeFileSync(path.join(root,'tail.png'),'same-png');fs.writeFileSync(path.join(root,'upstream.mp4'),'original-video');
 const tail={path:'tail.png',checksum:'sha256:'+digest(path.join(root,'tail.png')),stateId:'end-state',sourceVideo:{path:'upstream.mp4',checksum:'sha256:'+digest(path.join(root,'upstream.mp4'))},frameIndex:59};
 const contract={pages:[{stableId:'next',upstreamTail:tail}]},file=path.join(root,'c.json');
 assert.deepEqual(validateMotionContract(contract,file),[]);
 fs.writeFileSync(path.join(root,'upstream.mp4'),'new-video');assert.ok(validateMotionContract(contract,file).some(x=>x.includes('upstreamTail.sourceVideo: checksum mismatch')));
}));
