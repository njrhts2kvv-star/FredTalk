import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createReviewServer} from '../templates/review-app/server.mjs';
const hash = b=>createHash('sha256').update(b).digest('hex');
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'shared-review-'));
let server;
try {
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=','base64');
 await fs.writeFile(path.join(temp,'frame.png'),png);
 await fs.writeFile(path.join(temp,'voice.wav'),Buffer.alloc(256,7));
 await fs.writeFile(path.join(temp,'manifest.json'),'{}');
 const scene={stableId:'chapter-intro',title:'Portable',startSeconds:0,endSeconds:2,narration:'测试',
   frames:[{id:'frame-a',url:'/media/'+ 'a'.repeat(24),timeSeconds:0}],videos:[{url:'/media/'+ 'a'.repeat(24),label:'V1'}],candidates:[],
   identity:{keyframes:hash('frame'),video:hash('video'),suggestion:hash('direction')}};
 const config={schemaVersion:1,episodeKey:'another-person-episode',title:'另一项目',manifestPath:'manifest.json',manifestSha256:hash('{}'),
  episodeRoot:'.',assets:{['a'.repeat(24)]:{path:'frame.png',sha256:hash(png)},['b'.repeat(24)]:{path:'voice.wav',sha256:hash(Buffer.alloc(256,7))}},
  scenes:[scene,{...structuredClone(scene),stableId:'unchanged-scene'}],deliveryAllowed:true,fps:60};
 const write=()=>fs.writeFile(path.join(temp,'review.json'),JSON.stringify(config));await write();
 server=createReviewServer({baseDir:temp});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let origin=`http://127.0.0.1:${server.address().port}`;
 const get=async(view='keyframes')=>(await fetch(origin+'/api/review?view='+view)).json();
 const post=(route,data)=>fetch(origin+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const data=await get();assert.equal(data.episodeKey,config.episodeKey);
 const patch={view:'keyframes',version:data.version,stableId:scene.stableId,sceneIdentity:scene.identity.keyframes,choice:'keep',note:'还要放大',revision:0,frameId:'frame-a'};
 const r=await post('/api/feedback',patch);assert.equal(r.status,200);const saved=await r.json();assert.equal(saved.needsChanges,true);assert.equal(saved.animationApproved,false);
 assert.equal((await post('/api/feedback',patch)).status,409);
 assert.equal((await fetch(origin+'/api/feedback',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.com'},body:JSON.stringify(patch)})).status,403);
 assert.equal((await post('/api/feedback',{...patch,stableId:'unchanged-scene'})).status,200);
 const videoData=await get('video');assert.notEqual(videoData.version,data.version);assert.equal(videoData.feedback.versions[videoData.version],undefined);
 const upload=await fetch(origin+'/api/images',{method:'POST',headers:{'Content-Type':'image/png'},body:png});assert.equal(upload.status,201);
 const attachment=await upload.json();assert.equal((await post('/api/feedback',{...patch,revision:1,attachments:[attachment]})).status,200);
 const exported=await(await fetch(origin+'/api/export')).json();assert.match(exported.versions[data.version].records[scene.stableId].attachments[0].dataUrl,/^data:image\/png;base64,/);
 assert.equal((await fetch(origin+'/feedback.json')).status,404);
 assert.equal((await fetch(origin+'/media/'+ 'c'.repeat(24))).status,403);
 let range=await fetch(origin+'/media/'+ 'b'.repeat(24),{headers:{Range:'bytes=10-19'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,10);
 range=await fetch(origin+'/media/'+ 'b'.repeat(24),{headers:{Range:'bytes=-8'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,8);
 assert.equal((await fetch(origin+'/media/'+ 'b'.repeat(24),{headers:{Range:'bytes=999-'}})).status,416);
 assert.equal((await fetch(origin+'/media/'+ 'b'.repeat(24),{method:'HEAD'})).headers.get('content-length'),'256');
 // A user may write advice before choosing a route or candidate.
 const directionData=await get('suggestion');
 const directionPatch={view:'suggestion',version:directionData.version,stableId:scene.stableId,
   sceneIdentity:scene.identity.suggestion,choice:'pending',note:'Advice without a selection',revision:0,
   selection:{route:'',candidateId:''}};
 let directionResponse=await post('/api/feedback',directionPatch);
 assert.equal(directionResponse.status,200,'Unselected direction must still save feedback');
 assert.equal((await directionResponse.json()).selection.sha256,null);
 directionResponse=await post('/api/feedback',{...directionPatch,revision:1,selection:{route:'recording',candidateId:'__none__'}});
 assert.equal(directionResponse.status,200);
 assert.equal((await directionResponse.json()).selection.sha256,null);
 scene.candidates=[{id:'option-one',image:{url:'/media/'+ 'a'.repeat(24),sha256:hash(png)}}];await write();
 directionResponse=await post('/api/feedback',{...directionPatch,revision:2,selection:{route:'remotion',candidateId:'option-one'}});
 assert.equal(directionResponse.status,200);
 assert.equal((await directionResponse.json()).selection.sha256,hash(png));
 assert.equal((await post('/api/feedback',{...directionPatch,revision:3,selection:{route:'remotion',candidateId:'unknown'}})).status,400);
 // Restart recovers disk state, without browser storage.
 server.closeAllConnections();await new Promise(r=>server.close(r));
 server=createReviewServer({baseDir:temp});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin=`http://127.0.0.1:${server.address().port}`;
 assert.equal((await get()).feedback.versions[data.version].records[scene.stableId].attachments.length,1);
 const importSame=await post('/api/import',exported);assert.equal(importSame.status,200);assert.equal((await importSame.json()).kept,2);
 await fs.unlink(path.join(temp,'feedback.json'));await fs.rm(path.join(temp,'images'),{recursive:true});
 assert.equal((await post('/api/import',exported)).status,200);
 assert.equal((await fetch(origin+attachment.url)).status,200);
 scene.identity.keyframes=hash('new-frame');await write();
 const changed=await get();assert.notEqual(changed.version,data.version);assert.equal(changed.feedback.versions[changed.version],undefined);const inherited=changed.currentRecords['chapter-intro'];assert.equal(inherited.choice,'keep');assert.equal(inherited.note,'');assert.deepEqual(inherited.attachments,[]);assert.equal(inherited.inheritedFrom.identityChanged,true);assert.equal(inherited.inheritedFrom.version,data.version);assert.equal(inherited.animationApproved,false);assert.equal(inherited.sourceVersion,undefined);assert.equal(changed.currentRecords['unchanged-scene'].sourceVersion,data.version);assert.equal(changed.currentRecords['unchanged-scene'].note,'');assert.equal(changed.currentRecords['unchanged-scene'].inheritedFrom.identityChanged,false);
 assert.equal((await get('video')).version,videoData.version);
 assert.equal(changed.feedback.versions[data.version].records[scene.stableId].note,'还要放大');
 assert.equal((await post('/api/feedback',patch)).status,409);
 await fs.writeFile(path.join(temp,'frame.png'),Buffer.from('changed'));
 assert.equal((await fetch(origin+'/api/review')).status,409);
 await fs.writeFile(path.join(temp,'frame.png'),png);
 await fs.mkdir(path.join(temp,'02_最终输出'));
 const mp4=Buffer.alloc(500,8);await fs.writeFile(path.join(temp,'02_最终输出/demo.mp4'),mp4);
 const receipt={gate:'formal',status:'PASS',errors:[],videoPath:'02_最终输出/demo.mp4',videoSha256:hash(mp4),manifestSha256:hash('{}')};
 await fs.writeFile(path.join(temp,'receipt.json'),JSON.stringify(receipt));
 await fs.writeFile(path.join(temp,'final.json'),JSON.stringify({videoPath:'02_最终输出/demo.mp4',receiptPath:'receipt.json',manifestPath:'manifest.json',videoSha256:hash(mp4)}));
 config.finalRegistration='final.json';await write();
 assert.equal((await(await fetch(origin+'/api/final')).json()).ready,true);
 assert.equal((await fetch(origin+'/final/video.mp4',{headers:{Range:'bytes=0-31'}})).status,206);
 receipt.manifestSha256=hash('stale');await fs.writeFile(path.join(temp,'receipt.json'),JSON.stringify(receipt));
 assert.equal((await(await fetch(origin+'/api/final')).json()).ready,false);
 receipt.gate='final-technical-delivery';receipt.manifestSha256=hash('{}');receipt.authorization='unauthorized';receipt.creativeReview='skipped-by-user';
 await fs.writeFile(path.join(temp,'receipt.json'),JSON.stringify(receipt));
 assert.equal((await(await fetch(origin+'/api/final')).json()).ready,false);
 // Example previews have separate provenance/checks and never imply formal PASS.
 const example={purpose:'review-template-example',sourceSha256:hash('source'),sourceWindow:{startFrame:0,endFrame:120,fps:60}};
 const exampleManifest=JSON.stringify({example});
 await fs.writeFile(path.join(temp,'manifest.json'),exampleManifest);
 config.manifestSha256=hash(exampleManifest);await write();
 const exampleReceipt={gate:'example-media-checks',status:'PASS',errors:[],videoPath:'02_最终输出/demo.mp4',
   videoSha256:hash(mp4),manifestSha256:hash(exampleManifest),sourceSha256:example.sourceSha256,
   sourceWindow:example.sourceWindow,frameCount:120,checks:{decode:true,frameCount:true,audioPresent:true,pcmPreserved:true}};
 await fs.writeFile(path.join(temp,'receipt.json'),JSON.stringify(exampleReceipt));
 const exampleRegistration={kind:'example-preview',videoPath:'02_最终输出/demo.mp4',receiptPath:'receipt.json',manifestPath:'manifest.json',videoSha256:hash(mp4)};
 await fs.writeFile(path.join(temp,'final.json'),JSON.stringify(exampleRegistration));
 const exampleStatus=await(await fetch(origin+'/api/final')).json();
 assert.equal(exampleStatus.ready,true);assert.equal(exampleStatus.deliveryKind,'example-preview');
 assert.match(exampleStatus.message,/示例/);assert.equal(exampleStatus.creativeReview,'example-only');
 exampleReceipt.sourceWindow.endFrame=119;await fs.writeFile(path.join(temp,'receipt.json'),JSON.stringify(exampleReceipt));
 assert.equal((await(await fetch(origin+'/api/final')).json()).ready,false);
 await fs.writeFile(path.join(temp,'manifest.json'),'{"changed":true}');
 assert.equal((await fetch(origin+'/api/review')).status,409);
 console.log('PASS: portable scene IDs, per-view feedback, keep with changes, disk restart, concurrency/origin, image round trip, scoped invalidation, exact asset hashes, ranges/HEAD/416, final receipt identity and authorization.');
}finally{if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await fs.rm(temp,{recursive:true,force:true});}
