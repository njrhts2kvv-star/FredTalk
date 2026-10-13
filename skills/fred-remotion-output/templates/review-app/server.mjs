import http from 'node:http';
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash, randomUUID} from 'node:crypto';

const base = path.dirname(fileURLToPath(import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = (status, message) => Object.assign(new Error(message), {status});
const scopes = {keyframes:'static-keyframes', video:'video-review', suggestion:'storyboard-direction'};
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.wav':'audio/wav','.mp3':'audio/mpeg','.m4a':'audio/mp4','.mp4':'video/mp4','.srt':'text/plain; charset=utf-8'};
const inside = (file, root) => file === root || file.startsWith(root + path.sep);

export function createReviewServer({baseDir=base}={}) {
  const feedbackPath = path.join(baseDir,'feedback.json'), imagesDir = path.join(baseDir,'images');
  let queue = Promise.resolve();
  const hashes = new Map();
  async function hashFile(file) {
    const stat = await fs.stat(file);
    const key = [file,stat.dev,stat.ino,stat.size,stat.mtimeMs,stat.ctimeMs].join(':');
    if (!hashes.has(key)) {
      const hash = createHash('sha256');
      for await (const chunk of createReadStream(file)) hash.update(chunk);
      const after = await fs.stat(file);
      if (after.size !== stat.size || after.mtimeMs !== stat.mtimeMs || after.ctimeMs !== stat.ctimeMs) throw fail(409,'文件正在变化，请稍后刷新');
      hashes.set(key,hash.digest('hex'));
    }
    return hashes.get(key);
  }
  async function readFeedback() {
    try { return JSON.parse(await fs.readFile(feedbackPath,'utf8')); }
    catch(e) { if(e.code==='ENOENT')return {schemaVersion:2,versions:{}}; throw e; }
  }
  async function atomicWrite(file, data) {
    const temp = `${file}.${randomUUID()}.tmp`;
    await fs.writeFile(temp,JSON.stringify(data,null,2)); await fs.rename(temp,file);
  }
  async function config() {
    const data = JSON.parse(await fs.readFile(path.join(baseDir,'review.json'),'utf8'));
    if (data.schemaVersion !== 1 || !data.episodeKey) throw fail(409,'不支持的审看数据格式');
    const manifest = path.resolve(baseDir,data.manifestPath);
    if (digest(await fs.readFile(manifest)) !== data.manifestSha256) throw fail(409,'Manifest 已变化；先用 init_review_app.py --update 更新，原意见保留');
    return data;
  }
  async function asset(data, id) {
    const item = data.assets[id];
    if (!item || !/^[a-f0-9]{24}$/.test(id)) throw fail(403,'媒体未登记在当前审看数据中');
    const file = await fs.realpath(path.resolve(baseDir,item.path));
    if (await hashFile(file) !== item.sha256) throw fail(409,'媒体文件已变化，需重新生成审看数据');
    return file;
  }
  async function load(view='keyframes') {
    if (!scopes[view]) throw fail(400,'Unknown review view');
    const data = await config();
    // Check provenance assets too, even if they are not displayed in the browser.
    for (const id of Object.keys(data.assets)) await asset(data,id);
    const version = digest(JSON.stringify([data.episodeKey,view,data.scenes.map(s=>s.identity[view])]));
    const feedback = await readFeedback();
    const currentRecords = {...feedback.versions[version]?.records};
    for (const scene of data.scenes) {
      if (currentRecords[scene.stableId]) continue;
      // 2026-10-12 Fred: a new version keeps the last judgment (choice and direction
      // selection) of this scene, while its text and images stay in that older
      // version and are shown as history. Inherited choices are labelled, never a new approval.
      const previous = Object.entries(feedback.versions)
        .filter(([key,bucket])=>key!==version && bucket.view===view)
        .map(([key,bucket])=>({key,record:bucket.records[scene.stableId]}))
        .filter(x=>x.record)
        .sort((a,b)=>String(b.record.updatedAt).localeCompare(String(a.record.updatedAt)))[0];
      if (previous) {
        const same=previous.record.sceneIdentity===scene.identity[view];
        const choice=['pending','keep','change','skip'].includes(previous.record.choice)?previous.record.choice:'pending';
        let selection=view==='suggestion'?(previous.record.selection||null):null;
        if(selection?.candidateId && selection.candidateId!=='__none__' && !(scene.candidates||[]).some(c=>c.id===selection.candidateId))
          selection={route:selection.route||'',candidateId:''};
        currentRecords[scene.stableId]={stableId:scene.stableId,sceneIdentity:scene.identity[view],version,view,
          choice,note:'',attachments:[],selection,frameId:null,revision:0,approvalScope:scopes[view],animationApproved:false,
          needsChanges:choice==='change',
          inheritedFrom:{version:previous.key,updatedAt:previous.record.updatedAt||null,choice,identityChanged:!same},
          ...(same?{sourceVersion:previous.record.sourceVersion || previous.key,retainedIdentity:true}:{})};
      }
    }
    return {...data,assets:undefined,episodeRoot:undefined,manifestPath:undefined,finalRegistration:undefined,
      segmentIndexes:undefined,version,view,internalReview:!data.deliveryAllowed,
      totalSceneCount:data.scenes.length,
      scenes:data.scenes.map(s=>({...s,identity:s.identity[view]})),feedback,currentRecords};
  }
  async function attachment(item) {
    if (!/^[a-f0-9]{64}\.(png|jpg|webp|gif)$/.test(item?.id || '')) throw fail(400,'Invalid image attachment');
    const file = path.join(imagesDir,item.id);
    if (await hashFile(file).catch(()=>null) !== item.id.split('.')[0]) throw fail(400,'Image attachment missing or changed');
    return {id:item.id,name:String(item.name || item.id).slice(0,200),sha256:item.id.split('.')[0],
      size:(await fs.stat(file)).size,url:'/attachment?id='+item.id};
  }
  async function storeImage(bytes, name) {
    if (bytes.length > 10*1024*1024) throw fail(413,'每张图片不能超过 10 MB');
    const ext = bytes.length >= 24 && bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')) ? 'png'
      : bytes.length >= 4 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255 ? 'jpg'
      : bytes.length >= 16 && bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP' ? 'webp'
      : bytes.length >= 13 && ['GIF87a','GIF89a'].includes(bytes.toString('ascii',0,6)) ? 'gif' : null;
    if (!ext) throw fail(415,'支持 PNG、JPG、WebP 和 GIF 图片');
    const id = `${digest(bytes)}.${ext}`;
    await fs.mkdir(imagesDir,{recursive:true});
    await fs.writeFile(path.join(imagesDir,id),bytes,{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
    return attachment({id,name});
  }
  async function finalDelivery() {
    const pending = {ready:false,message:'成片尚未登记交付，完成渲染与检查后会显示在这里。'};
    try {
      const data = await config();
      if (!data.finalRegistration) return pending;
      const registrationPath = path.resolve(baseDir,data.finalRegistration);
      const registration = JSON.parse(await fs.readFile(registrationPath,'utf8'));
      const root = await fs.realpath(path.resolve(baseDir,data.episodeRoot));
      const resolve = async (value, relative=path.dirname(registrationPath)) => {
        const file = await fs.realpath(path.resolve(relative,value));
        if (!inside(file,root)) throw new Error('Delivery outside episode'); return file;
      };
      const [videoPath,receiptPath,manifestPath] = await Promise.all(
        [registration.videoPath,registration.receiptPath,registration.manifestPath].map(v=>resolve(v)));
      if (!inside(videoPath,path.join(root,'02_最终输出')) || path.extname(videoPath)!=='.mp4') return pending;
      const receipt = JSON.parse(await fs.readFile(receiptPath,'utf8'));
      const manifest = JSON.parse(await fs.readFile(manifestPath,'utf8'));
      const auth = manifest.workflow?.authorization;
      const formal = receipt.gate==='formal' && receipt.status==='PASS';
      const technical = receipt.gate==='final-technical-delivery' && receipt.status==='PASS'
        && receipt.creativeReview==='skipped-by-user' && auth?.mode==='direct-output'
        && typeof auth.source==='string' && auth.source.trim() && receipt.authorization===auth.source
        && ['frameCount','decode','audioPacketsPreserved','unchangedVclPreserved'].every(k=>receipt.checks?.[k]===true);
      const source = manifest.example;
      const window = source?.sourceWindow;
      const example = registration.kind==='example-preview' && source?.purpose==='review-template-example'
        && receipt.gate==='example-media-checks' && receipt.status==='PASS'
        && /^[a-f0-9]{64}$/.test(source.sourceSha256 || '') && receipt.sourceSha256===source.sourceSha256
        && Number.isInteger(window?.startFrame) && Number.isInteger(window?.endFrame)
        && window.startFrame>=0 && window.endFrame>window.startFrame && window.fps===data.fps
        && JSON.stringify(receipt.sourceWindow)===JSON.stringify(window)
        && receipt.frameCount===window.endFrame-window.startFrame
        && ['frameCount','decode','audioPresent','pcmPreserved'].every(k=>receipt.checks?.[k]===true);
      if ((registration.kind==='example-preview' ? !example : (!formal && !technical)) || receipt.errors?.length) return pending;
      if (!/^[a-f0-9]{64}$/.test(registration.videoSha256 || '') || receipt.videoSha256!==registration.videoSha256) return pending;
      if (await resolve(receipt.videoPath,path.dirname(receiptPath))!==videoPath) return pending;
      if (receipt.manifestSha256!==digest(await fs.readFile(manifestPath)) || manifestPath!==await fs.realpath(path.resolve(baseDir,data.manifestPath))) return pending;
      if (await hashFile(videoPath)!==registration.videoSha256) return pending;
      const stat = await fs.stat(videoPath);
      return {ready:true,message:example?'真实片段示例 · 已核对来源、时长和文件；示例不代表新制作批准。':'成片已完成技术交付',
        deliveryKind:example?'example-preview':'production',pageLabel:example?'完整示例':'最终成片',
        title:data.title,videoPath,videoUrl:'/final/video.mp4',
        filename:path.basename(videoPath),sha256:registration.videoSha256,size:stat.size,
        displayLabel:registration.displayLabel || (example?'片段示例':'最终成片'),creativeReview:example?'example-only':(receipt.creativeReview || '见交付回执')};
    } catch { return pending; }
  }
  const json = (res,status,value) => {res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  async function body(req,limit=100000) {
    if (!req.headers['content-type']?.startsWith('application/json')) throw fail(415,'JSON required');
    const chunks=[];let size=0;
    for await(const chunk of req){size+=chunk.length;if(size>limit)throw fail(413,'Request too large');chunks.push(chunk);}
    return JSON.parse(Buffer.concat(chunks).toString());
  }
  async function sendFile(req,res,file) {
    const size=(await fs.stat(file)).size;let start=0,end=size-1,code=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match||(!match[1]&&!match[2]))throw fail(416,'Invalid range');
      if(!match[1])start=Math.max(0,size-Number(match[2]));
      else {start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),size-1);}
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=size){res.setHeader('Content-Range',`bytes */${size}`);throw fail(416,'Unsatisfiable range');}
      code=206;
    }
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':end-start+1,'Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    if(code===206)headers['Content-Range']=`bytes ${start}-${end}/${size}`;
    res.writeHead(code,headers);if(req.method==='HEAD')return res.end();
    const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    try {
      const host=req.headers.host || '';
      if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host))throw fail(403,'Local host only');
      if(req.headers.origin && req.headers.origin!==`http://${host}`)throw fail(403,'Cross-origin request rejected');
      const url=new URL(req.url,`http://${host}`);
      if(req.method==='GET' && url.pathname==='/api/review')return json(res,200,await load(url.searchParams.get('view')||'keyframes'));
      if(req.method==='GET' && url.pathname==='/api/final'){const {videoPath,...status}=await finalDelivery();return json(res,200,status);}
      if(req.method==='POST' && url.pathname==='/api/images'){
        if(!['image/png','image/jpeg','image/webp','image/gif'].includes(req.headers['content-type']))throw fail(415,'Unsupported image type');
        const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>10*1024*1024)throw fail(413,'Image too large');chunks.push(c);}
        return json(res,201,await storeImage(Buffer.concat(chunks),decodeURIComponent(req.headers['x-file-name']||'image')));
      }
      if(req.method==='POST' && url.pathname==='/api/feedback'){
        const patch=await body(req);
        const job=queue.then(async()=>{
          const data=await load(patch.view);
          if(patch.version!==data.version)throw fail(409,'版本已变化，草稿保留，请刷新核对');
          const scene=data.scenes.find(s=>s.stableId===patch.stableId);
          if(!scene||patch.sceneIdentity!==scene.identity||!['pending','keep','change','skip'].includes(patch.choice)||typeof patch.note!=='string'||patch.note.length>50000)throw fail(400,'Invalid feedback');
          if(patch.view==='keyframes'&&!scene.frames.length || patch.view==='video'&&!scene.videos.length)throw fail(400,'当前没有可审看产物');
          const store=await readFeedback();
          if(store.schemaVersion!==2)throw fail(409,'Unsupported existing feedback schema');
          const bucket=store.versions[data.version] ||= {createdAt:new Date().toISOString(),view:patch.view,records:{}};
          const old=bucket.records[scene.stableId];
          if((patch.revision||0)!==(old?.revision||0))throw fail(409,'另一页面已更新，草稿保留，请刷新核对');
          const attachments=patch.attachments ?? old?.attachments ?? [];
          if(!Array.isArray(attachments)||attachments.length>10)throw fail(400,'每段最多 10 张图片');
          const selection=patch.selection ?? old?.selection ?? null;
          if(selection && (patch.view!=='suggestion'||!['recording','remotion','generated-video','mixed',''].includes(selection.route||'')||selection.candidateId && selection.candidateId!=='__none__'&&!scene.candidates.some(c=>c.id===selection.candidateId)))throw fail(400,'Invalid direction selection');
          const selected=selection?.candidateId && scene.candidates.find(c=>c.id===selection.candidateId);
          const record={stableId:scene.stableId,sceneIdentity:scene.identity,version:data.version,view:patch.view,choice:patch.choice,note:patch.note,
            frameId:scene.frames.some(f=>f.id===patch.frameId)?patch.frameId:null,
            selection:selection?{...selection,sha256:selected?.image?.sha256||null}:null,
            revision:(old?.revision||0)+1,updatedAt:new Date().toISOString(),approvalScope:scopes[patch.view],animationApproved:false,
            needsChanges:patch.choice==='change'||!!patch.note.trim()||!!attachments.length,
            attachments:await Promise.all(attachments.map(attachment))};
          if (data.currentRecords[scene.stableId]?.sourceVersion) record.sourceVersion=data.currentRecords[scene.stableId].sourceVersion;
          if (data.currentRecords[scene.stableId]?.inheritedFrom) record.inheritedFrom=data.currentRecords[scene.stableId].inheritedFrom;
          bucket.records[scene.stableId]=record;await atomicWrite(feedbackPath,store);return record;
        });queue=job.catch(()=>{});return json(res,200,await job);
      }
      if(req.method==='GET' && url.pathname==='/api/export'){
        const data=await config(),store=await readFeedback();
        for(const bucket of Object.values(store.versions))for(const record of Object.values(bucket.records))for(const item of record.attachments||[]){
          await attachment(item);item.dataUrl=`data:${types[path.extname(item.id)]};base64,${(await fs.readFile(path.join(imagesDir,item.id))).toString('base64')}`;
        }
        return json(res,200,{...store,episodeKey:data.episodeKey,exportedAt:new Date().toISOString(),savedToManifest:false});
      }
      if(req.method==='POST' && url.pathname==='/api/import'){
        const incoming=await body(req,50*1024*1024);
        const job=queue.then(async()=>{
          const data=await config();
          if(incoming.schemaVersion!==2||incoming.episodeKey!==data.episodeKey||!incoming.versions)throw fail(400,'导入文件不属于本期或格式不支持');
          const store=await readFeedback();let added=0,kept=0;
          const imported={};
          for(const [version,bucket] of Object.entries(incoming.versions)){
            if(!/^[a-f0-9]{64}$/.test(version)||!scopes[bucket.view]||!bucket.records)throw fail(400,'Invalid import bucket');
            imported[version]={createdAt:bucket.createdAt,view:bucket.view,records:{}};
            for(const [sid,record] of Object.entries(bucket.records)){
              if(!data.scenes.some(s=>s.stableId===sid)||record.stableId!==sid||record.view!==bucket.view||record.version!==version||!['pending','keep','change','skip'].includes(record.choice)||typeof record.note!=='string'||record.note.length>50000||!Number.isSafeInteger(record.revision)||record.revision<0||!/^[a-f0-9]{64}$/.test(record.sceneIdentity||''))throw fail(400,'Invalid import record');
              const liveVersion=digest(JSON.stringify([data.episodeKey,bucket.view,data.scenes.map(s=>s.identity[bucket.view])]));
              if(version===liveVersion && record.sceneIdentity!==data.scenes.find(s=>s.stableId===sid).identity[bucket.view])throw fail(400,'Import identity mismatch');
              if(store.versions[version]?.records?.[sid]){kept++;continue;}
              if(!Array.isArray(record.attachments||[])||(record.attachments||[]).length>10)throw fail(400,'Invalid import attachments');
              const attachments=[];
              for(const item of record.attachments||[]){
                const match=/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(item.dataUrl||'');
                if(!match)throw fail(400,'导入图片缺失，请使用完整导出文件');
                const restored=await storeImage(Buffer.from(match[2],'base64'),item.name);
                if(restored.id!==item.id)throw fail(400,'Import attachment identity mismatch');attachments.push(restored);
              }
              imported[version].records[sid]={...record,attachments,unsynced:false,approvalScope:scopes[bucket.view],animationApproved:false};added++;
            }
          }
          for(const [version,bucket] of Object.entries(imported)){
            store.versions[version] ||= {...bucket,records:{}};
            Object.assign(store.versions[version].records,bucket.records);
          }
          await atomicWrite(feedbackPath,store);return {added,kept,message:'导入完成；已有记录保留，历史意见不继承为新版认可'};
        });queue=job.catch(()=>{});return json(res,200,await job);
      }
      if(!['GET','HEAD'].includes(req.method))throw fail(405,'Method not allowed');
      if(url.pathname==='/final/video.mp4'){const final=await finalDelivery();if(!final.ready)throw fail(409,final.message);return await sendFile(req,res,final.videoPath);}
      if(url.pathname==='/attachment'){const item=await attachment({id:url.searchParams.get('id')});return await sendFile(req,res,path.join(imagesDir,item.id));}
      const media=/^\/media\/([a-f0-9]{24})$/.exec(url.pathname);
      if(media)return await sendFile(req,res,await asset(await config(),media[1]));
      const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css','/final':'final.html','/final/':'final.html','/final/app.js':'final.js'};
      if(!files[url.pathname])throw fail(404,'Not found');return await sendFile(req,res,path.join(baseDir,files[url.pathname]));
    }catch(e){if(!res.headersSent)json(res,e.status||(e instanceof SyntaxError?400:500),{error:e.message});else res.destroy();}
  });
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.argv[2]||8148);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid port');
  createReviewServer().listen(port,'127.0.0.1',()=>console.log(`Review: http://127.0.0.1:${port}/`));
}
