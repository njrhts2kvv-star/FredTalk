'use strict';
const $ = selector => document.querySelector(selector);
const audio = $('#audio'), selector = $('#scene-select'), follow = $('#follow'), dialog = $('#zoom');
const status = $('#save-state');
let data, videoReviewData, storageKey, store, selectedScene = null, modalScene = null;
let currentView = new URLSearchParams(location.search).get("view") || "keyframes";
if(!["suggestion","keyframes","video"].includes(currentView)) currentView="keyframes";
let uploadsInFlight = 0;
const views = new Map(), jobs = new Map(), timers = new Map();
const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${(seconds % 60).toFixed(3).padStart(6,'0')}`;
const element = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
function appendVideo(container,item,label) {
  container.append(element('div',label,'previous-video-label'));
  const video=element('video',undefined,'previous-video');video.controls=true;video.preload='none';video.playsInline=true;
  video.setAttribute('aria-label',label);if(item.poster)video.poster=item.poster;
  const start=element('button','加载本段视频','load-video');
  start.onclick=()=>{video.src=item.url;video.load();start.remove();};
  container.append(video,start);
}
document.addEventListener('play',event=>{
  if(!event.target.matches('audio,video'))return;
  document.querySelectorAll('audio,video').forEach(media=>{if(media!==event.target)media.pause();});
},true);
const choices = {pending:'待看',keep:'采用',change:'需要调整',skip:'不采用'};
const routeLabels = {recording:'录屏',remotion:'Remotion 动画','generated-video':'生成动画',mixed:'录屏 + Remotion 动画（混合）'};

function localSave() {
  try { localStorage.setItem(storageKey, JSON.stringify(store)); return true; }
  catch { status.textContent = '浏览器保存失败，请立即导出意见。'; return false; }
}
function recordFor(scene) {
  if(!Object.hasOwn(store.records,scene.stableId))store.records[scene.stableId] = {stableId:scene.stableId,sceneIdentity:scene.identity,version:data.version,view:currentView,choice:'pending',note:'',revision:0};
  return store.records[scene.stableId];
}
function save(scene) {
  const record = recordFor(scene), snapshot = {choice:record.choice,note:record.note,attachments:structuredClone(record.attachments || []),selection:structuredClone(record.selection || null),frameId:scene.frames[views.get(scene.stableId).index]?.id || null};
  const run = (jobs.get(scene.stableId) || Promise.resolve()).then(async () => {
    const response = await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...snapshot,version:data.version,view:currentView,sceneIdentity:scene.identity,stableId:scene.stableId,revision:record.revision || 0})});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '服务器保存失败');
    record.revision = result.revision;
    record.updatedAt = result.updatedAt;
    record.approvalScope=result.approvalScope;record.animationApproved=false;record.needsChanges=result.needsChanges;
    if (record.note === snapshot.note && record.choice === snapshot.choice && JSON.stringify(record.attachments || []) === JSON.stringify(snapshot.attachments) && JSON.stringify(record.selection || null) === JSON.stringify(snapshot.selection)) record.unsynced = false;
    localSave();
    status.textContent = `已保存到本机 · ${new Date().toLocaleTimeString()}`;
  }).catch(error => { record.unsynced = true; localSave(); status.textContent = `${error.message} 草稿未丢失。`; });
  jobs.set(scene.stableId,run);
  return run;
}
function changed(scene) {
  views.get(scene.stableId)?.updateJudgment?.();
  const record = recordFor(scene);
  record.unsynced = true;
  record.clientUpdatedAt = new Date().toISOString();
  if (localSave()) status.textContent = '草稿已保存在浏览器';
  clearTimeout(timers.get(scene.stableId));
  timers.set(scene.stableId,setTimeout(() => save(scene),450));
}
function showFrame(scene, index, {seek=false} = {}) {
  if(!scene.frames.length) return;
  const view = views.get(scene.stableId);
  const next = Math.max(0,Math.min(scene.frames.length - 1,index));
  const frame = scene.frames[next];
  if (view.index !== next) {
    view.index = next;
    view.image.src = frame.url;
    view.image.alt = `${scene.stableId} ${scene.title} ${format(frame.timeSeconds)}`;
    view.frameLabel.textContent = `${next + 1} / ${scene.frames.length} · ${frame.timeSeconds===null?'时间待映射':format(frame.timeSeconds)}`;
    view.cue.textContent = frame.spokenCue || frame.label;
    view.slider.value = next;
    view.previous.disabled = next === 0;
    view.next.disabled = next === scene.frames.length - 1;
  }
  if (seek && frame.timeSeconds!==null) audio.currentTime = frame.timeSeconds;
  if (modalScene === scene.stableId) {
    $('#zoom-image').src = frame.url;
    $('#zoom-label').textContent = `${scene.stableId} · ${scene.title} · ${format(frame.timeSeconds)} · ${next + 1}/${scene.frames.length}`;
    $('#zoom-prev').disabled = next === 0;
    $('#zoom-next').disabled = next === scene.frames.length - 1;
  }
}
function focusScene(scene, scroll=false) {
  if (selectedScene) views.get(selectedScene)?.row.classList.remove('focused');
  selectedScene = scene?.stableId || null;
  selector.value = selectedScene || '';
  if (!scene) return;
  const view = views.get(scene.stableId);
  view.row.classList.add('focused');
  if (scroll) view.row.scrollIntoView({block:'start',behavior:'instant'});
}
function step(scene, delta) { showFrame(scene,views.get(scene.stableId).index + delta); }
function attachmentThumbnail(item, remove) {
  const box = element('div',undefined,'attachment');
  const link = element('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener'; link.title = item.name;
  const image = element('img'); image.src = item.url; image.alt = item.name; image.loading = 'lazy'; link.append(image); box.append(link);
  if (remove) { const button = element('button','×','remove-image'); button.title = '移除图片'; button.setAttribute('aria-label',`移除图片 ${item.name}`); button.onclick = remove; box.append(button); }
  return box;
}
function imageAttachments(scene, feedback, record) {
  const toolbar = element('div',undefined,'attachment-toolbar'), add = element('button','添加图片'), input = element('input');
  input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp,image/gif'; input.multiple = true; input.hidden = true; input.setAttribute('aria-label',`${scene.stableId}添加图片`);
  const message = element('span','','attachment-status'); message.setAttribute('role','status');
  const gallery = element('div',undefined,'attachments');
  const refresh = () => gallery.replaceChildren(...(record.attachments || []).map((item,index) => attachmentThumbnail(item,() => {record.attachments.splice(index,1); refresh(); changed(scene);})));
  let queue = Promise.resolve();
  function receive(files) {
    const batch = Array.from(files); if (!batch.length) return;
    uploadsInFlight++;
    queue = queue.then(async () => {
      add.disabled = true;
      const errors = [];
      for (const file of batch) {
        try {
          if ((record.attachments || []).length >= 10) throw new Error('每段最多 10 张图片');
          if (!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)) throw new Error('支持 PNG、JPG、WebP 和 GIF');
          if (file.size > 10*1024*1024) throw new Error('每张图片不能超过 10 MB');
          message.textContent = `正在添加 ${file.name}`;
          const preview = new Image(), localUrl = URL.createObjectURL(file);
          try { preview.src = localUrl; await preview.decode(); } finally { URL.revokeObjectURL(localUrl); }
          const response = await fetch('/api/images',{method:'POST',headers:{'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name)},body:file});
          const result = await response.json(); if (!response.ok) throw new Error(result.error || '图片保存失败');
          record.attachments ||= [];
          if (!record.attachments.some(item => item.id === result.id)) record.attachments.push(result);
          refresh(); changed(scene);
        } catch (error) { errors.push(`${file.name}: ${error.message}`); }
      }
      message.textContent = errors.join('；') || `已添加 ${(record.attachments || []).length} 张`;
    }).finally(() => { uploadsInFlight--; add.disabled = false; });
  }
  add.title = '选择图片，也可拖入或粘贴截图'; add.onclick = () => input.click();
  input.onchange = () => { receive(input.files); input.value = ''; };
  feedback.addEventListener('paste',event => { const files = [...(event.clipboardData?.items || [])].filter(item => item.kind === 'file').map(item => item.getAsFile()).filter(Boolean); if (files.length) { event.preventDefault(); receive(files); } });
  feedback.addEventListener('dragover',event => { if ([...(event.dataTransfer?.types || [])].includes('Files')) { event.preventDefault(); feedback.classList.add('drag-over'); } });
  feedback.addEventListener('dragleave',event => { if (!feedback.contains(event.relatedTarget)) feedback.classList.remove('drag-over'); });
  feedback.addEventListener('drop',event => { event.preventDefault(); feedback.classList.remove('drag-over'); receive(event.dataTransfer.files); });
  toolbar.append(add,input,message); feedback.append(toolbar,gallery); refresh();
}
function makeRow(scene) {
  const row = element('article',undefined,'scene'); row.id = `scene-${scene.stableId}`;
  const copy = element('section'); copy.append(element('h2',`${scene.stableId} · ${scene.title}`),element('div',scene.startSeconds===null?'全片时间待映射':`${format(scene.startSeconds)} — ${format(scene.endSeconds)}`,'timing'),element('p',scene.narration,'narration'));
  const visual = element('section');
  const videoOnlyKeyframes = currentView==='keyframes' && !scene.frames.length && scene.videos.length>0;
  if(currentView==='suggestion') {
    const advice=scene.suggestion;
    const suggestedRoute=typeof advice.suggested==='object'?advice.suggested.route:advice.suggested;
    visual.append(element('p',`建议：${routeLabels[suggestedRoute] || suggestedRoute || '待补充'}`),element('p',advice.suggestionReason || ''));
    const rec=advice.recommendation;
    if(rec?.reason) visual.append(element('p',rec.reason));
    for(const candidate of scene.candidates){
      visual.append(element('h3',candidate.label));
      const button=element('button',undefined,'image-button'), image=element('img');
      image.src=candidate.image.url;image.loading='lazy';image.alt=candidate.label;button.append(image);
      button.onclick=()=>{modalScene=null;$('#zoom-image').src=candidate.image.url;$('#zoom-label').textContent=candidate.label;$('#zoom-prev').disabled=true;$('#zoom-next').disabled=true;dialog.showModal();};
      visual.append(button);
      if(candidate.clip) appendVideo(visual,candidate.clip,`${scene.stableId} 动态参考`);
    }
    if(!scene.candidates.length) visual.append(element('p','方向图待补充'));
  } else {
    for(const videoData of scene.videos) appendVideo(visual,videoData,`${scene.stableId} ${videoData.label}`);
  }
  const imageButton = element('button',undefined,'image-button'), image = element('img');
  image.loading = 'lazy'; imageButton.title = '放大关键帧'; imageButton.append(image);
  const controls = element('div',undefined,'frame-controls');
  const previous = element('button','←'), next = element('button','→'), frameLabel = element('output'), slider = element('input');
  previous.title = '上一帧'; previous.setAttribute('aria-label','上一帧'); next.title = '下一帧'; next.setAttribute('aria-label','下一帧');
  slider.type = 'range'; slider.min = 0; slider.max = scene.frames.length - 1; slider.step = 1; slider.setAttribute('aria-label',`${scene.stableId}关键帧`);
  controls.append(previous,frameLabel,next,slider);
  const cue = element('p','','frame-cue');
  if(currentView!=='suggestion' && scene.frames.length) visual.append(imageButton,controls,cue);
  else if(currentView==='keyframes')visual.append(element('p',videoOnlyKeyframes?'本段直接播放视频，无需关键帧。':'真实关键帧待生成'));
  const feedback = element('section',undefined,'feedback'), buttons = element('div',undefined,'choices');
  const record = videoOnlyKeyframes
    ? (videoReviewData?.currentRecords?.[scene.stableId] || {choice:'pending',note:'',attachments:[]})
    : recordFor(scene);
  function syncButtons() { for (const button of buttons.children) { const active = button.dataset.choice === record.choice; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); } }
  for (const [choice,title] of Object.entries(choices)) {
    const button = element('button',title); button.dataset.choice = choice;
    button.disabled = videoOnlyKeyframes;
    button.onclick = () => { record.choice = choice; syncButtons(); updateJudgment(); changed(scene); };
    buttons.append(button);
  }
  syncButtons();
  if(currentView==='suggestion'){
    record.selection ||= {route:'',candidateId:''};
    const route=element('select');route.setAttribute('aria-label',`${scene.stableId}制作方式`);
    route.append(...[['','尚未选择'],['recording','录屏'],['remotion','Remotion 动画'],['generated-video','生成动画'],['mixed','录屏 + Remotion 动画（混合）']].map(([v,t])=>new Option(t,v)));
    route.value=record.selection.route;
    route.onchange=()=>{record.selection.route=route.value;changed(scene);};
    const candidate=element('select');candidate.setAttribute('aria-label',`${scene.stableId}方向选择`);
    candidate.append(new Option('尚未选择',''),...scene.candidates.map(c=>new Option(c.label,c.id)),new Option('这些方向都不选','__none__'));
    candidate.value=record.selection.candidateId;
    candidate.onchange=()=>{record.selection.candidateId=candidate.value;changed(scene);};
    feedback.append(route,candidate);
    if(scene.existingUserSelection || scene.existingProductionRoute) feedback.append(element('p','已有选择保留；本次未选不会覆盖。'));
  }
  const judgment=element('p',undefined,'scope-note');
  const updateJudgment=()=>{judgment.textContent=videoOnlyKeyframes
    ? (record.choice==='keep'?'视频已采用；可在「逐段视频」页修改意见。':'请在「逐段视频」页填写本段视频意见。')
    :record.choice==='keep'&&(record.note?.trim()||record.attachments?.length)?'保留主体，仍有修改意见':({suggestion:'本页确认方向',keyframes:'本页确认静态画面',video:'本页记录视频审看意见'})[currentView];};
  feedback.append(judgment);updateJudgment();
  if(record.inheritedFrom&&!videoOnlyKeyframes){const inherited=record.inheritedFrom;
    feedback.append(element('p',`已沿用上一版的判断：${choices[inherited.choice]||'待看'}${inherited.identityChanged?'（本段内容已更新，请留意）':''}。上一版的文字和图片在下方「往期意见」。`,'scope-note'));}
  const note = element('textarea'); note.value = record.note || ''; note.setAttribute('aria-label',`${scene.stableId}修改意见`);
  note.disabled = videoOnlyKeyframes;
  note.oninput = () => { record.note = note.value; updateJudgment(); changed(scene); };
  feedback.append(buttons,note);
  if(record.serverRecord){
    const conflict=element('details');conflict.open=true;
    conflict.append(element('summary','保存冲突：磁盘已有另一处的意见'),element('pre',record.serverRecord.note||'（无文字）'));
    const useServer=element('button','使用磁盘版本'),useDraft=element('button','继续编辑我的草稿');
    useServer.onclick=()=>{const previous=structuredClone(record);delete previous.serverRecord;Object.assign(record,record.serverRecord,{conflictDraft:previous,unsynced:false});delete record.serverRecord;note.value=record.note;syncButtons();updateJudgment();localSave();conflict.remove();status.textContent='已使用磁盘版本，原草稿仍包含在导出中';};
    useDraft.onclick=()=>{record.revision=record.serverRecord.revision;record.conflictDraft=structuredClone(record.serverRecord);delete record.serverRecord;conflict.remove();changed(scene);};
    conflict.append(useServer,useDraft);feedback.append(conflict);
  }
  if (!videoOnlyKeyframes) imageAttachments(scene,feedback,record);
  const historyData = videoOnlyKeyframes ? videoReviewData : data;
  const historyView = videoOnlyKeyframes ? 'video' : currentView;
  const history = Object.entries(historyData?.feedback.versions || {}).filter(([version,bucket]) => version !== historyData.version && bucket.view === historyView && bucket.records?.[scene.stableId]).map(([version,bucket]) => ({version,...bucket.records[scene.stableId]}));
  if (history.length) { const details = element('details'); if(record.inheritedFrom) details.open = true; details.append(element('summary',`往期意见（${history.length}版）`)); for (const record of history) { details.append(element('pre',`${record.updatedAt || record.version.slice(0,12)} · ${choices[record.choice] || '待看'}\n${record.note || ''}`)); const gallery = element('div',undefined,'attachments'); gallery.append(...(record.attachments || []).map(item => attachmentThumbnail(item))); details.append(gallery); } feedback.append(details); }
  row.append(copy,visual,feedback);
  views.set(scene.stableId,{row,image,frameLabel,cue,previous,next,slider,index:-1,updateJudgment});
  previous.onclick = () => step(scene,-1); next.onclick = () => step(scene,1);
  slider.oninput = () => showFrame(scene,Number(slider.value));
  image.onerror = () => { cue.textContent = '关键帧读取失败'; cue.classList.add('frame-error'); };
  image.onload = () => cue.classList.remove('frame-error');
  imageButton.onclick = () => { modalScene = scene.stableId; showFrame(scene,views.get(scene.stableId).index); dialog.showModal(); };
  if(currentView!=='suggestion')showFrame(scene,0);
  return row;
}
async function load() {
  const response = await fetch('/api/review?view='+currentView,{cache:'no-store'});
  if (!response.ok) throw new Error((await response.json()).error || '审看数据读取失败');
  data = await response.json();
  videoReviewData = null;
  if(currentView==='keyframes' && data.scenes.some(scene=>!scene.frames.length && scene.videos.length)) {
    const videoResponse = await fetch('/api/review?view=video',{cache:'no-store'});
    if (!videoResponse.ok) throw new Error((await videoResponse.json()).error || '视频意见读取失败');
    videoReviewData = await videoResponse.json();
  }
  storageKey = `production-review:${data.episodeKey}:${currentView}:${data.version}`;
  let local; try { local = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}
  const records = structuredClone(data.currentRecords || data.feedback.versions?.[data.version]?.records || {});
  for (const [id,draft] of Object.entries(local?.records || {})) {
    if(draft.unsynced && records[id] && (records[id].revision||0)!==(draft.revision||0)) records[id]={...draft,serverRecord:records[id]};
    else if(draft.unsynced || !records[id])records[id]=draft;
    else if(draft.conflictDraft)records[id].conflictDraft=draft.conflictDraft;
  }
  store = {schemaVersion:2,episodeKey:data.episodeKey,version:data.version,view:currentView,records};
  document.title=data.title+' · 制作审看';$('h1').textContent=document.title;
  $('#final-link').textContent=data.example?'完整示例 →':'最终成片 →';
  if(data.audioReviewUrl){$('#audio-link').href=data.audioReviewUrl;$('#audio-link').hidden=false;}
  for(const button of document.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===currentView));
  $('#visual-heading').textContent=({suggestion:'方向参考',keyframes:'实际关键帧',video:'逐段视频与画面'})[currentView];
  views.clear(); selectedScene = null;
  $('#scenes').replaceChildren(...data.scenes.map(makeRow));
  selector.replaceChildren(new Option('选择场景',''),...data.scenes.map(scene => new Option(`${scene.stableId} · ${scene.title}`,scene.stableId)));
  $('#counts').textContent = `${data.scenes.length}/${data.totalSceneCount} 段 · ${data.scenes.reduce((n,s) => n+s.frames.length,0)} 帧`;
  $('#stage').textContent = (data.versionLabel || '当前版本')+' · '+({suggestion:'方向选择',keyframes:'静态画面审看',video:'视频审看'})[currentView];
  $('#empty').hidden = data.scenes.length !== 0;
  if (data.audioUrl && audio.getAttribute('src') !== data.audioUrl) audio.src = data.audioUrl;
  audio.hidden=!data.audioUrl;follow.disabled=!data.audioUrl;
  status.textContent = Object.values(records).some(r => r.unsynced) ? '有浏览器草稿待保存' : `已载入 · 版本 ${data.version.slice(0,10)}`;
  document.body.dataset.ready = 'true';
}
audio.addEventListener('timeupdate',() => {
  $('#time').textContent = format(audio.currentTime);
  if (!follow.checked || !data) return;
  const scene = data.scenes.find(s => s.startSeconds <= audio.currentTime && s.endSeconds > audio.currentTime);
  if (!scene) { focusScene(null); return; }
  const index = scene.frames.findLastIndex(frame => frame.timeSeconds <= audio.currentTime);
  showFrame(scene,Math.max(0,index));
  if (selectedScene !== scene.stableId) { focusScene(scene,true); }
});
selector.onchange = () => {
  const scene = data.scenes.find(s => s.stableId === selector.value); if (!scene) return;
  // Seek just inside the scene: media timestamp rounding can land before its boundary.
  if(scene.startSeconds!==null)audio.currentTime = Math.min(scene.startSeconds+0.001,(scene.startSeconds+scene.endSeconds)/2);
  focusScene(scene,true); showFrame(scene,0);
};
$('#speed').onchange = event => { audio.playbackRate = Number(event.target.value); };
$('#close').onclick = () => dialog.close();
dialog.addEventListener('close',() => { modalScene = null; });
for (const [id,delta] of [['#zoom-prev',-1],['#zoom-next',1]]) $(id).onclick = () => { const scene = data.scenes.find(s => s.stableId === modalScene); if (scene) step(scene,delta); };
dialog.addEventListener('keydown',event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); const scene = data.scenes.find(s => s.stableId === modalScene); if (scene) step(scene,event.key === 'ArrowLeft' ? -1 : 1); } });
async function flush() {
  if(uploadsInFlight){status.textContent='图片正在保存，请稍后操作';return false;}
  for(const timer of timers.values())clearTimeout(timer);
  await Promise.all(data.scenes.filter(scene=>recordFor(scene).unsynced).map(save));
  return !Object.values(store.records).some(r=>r.unsynced);
}
$('#export').onclick = async () => {
  try {
    const r=await fetch('/api/export');if(!r.ok)throw Error('导出读取失败');
    const output=await r.json();
    for(let index=0;index<localStorage.length;index++){
      const key=localStorage.key(index);if(!key.startsWith(`production-review:${data.episodeKey}:`))continue;
      try{const draft=JSON.parse(localStorage.getItem(key));if(!draft?.version||!draft?.view)continue;
        const bucket=output.versions[draft.version] ||= {createdAt:new Date().toISOString(),view:draft.view,records:{}};
        for(const [id,record] of Object.entries(draft.records||{}))if(record.unsynced||record.conflictDraft||!bucket.records[id])bucket.records[id]=record;
      }catch{}
    }
    output.versions[data.version]={createdAt:new Date().toISOString(),view:currentView,records:structuredClone(store.records)};
    async function attachImages(value){
      if(!value || typeof value!=='object')return;
      if(Array.isArray(value.attachments))for(const item of value.attachments){
        if(item.dataUrl)continue;
        const r=await fetch(item.url);if(!r.ok)throw Error('图片导出失败，请保留当前草稿');
        const blob=await r.blob();item.dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
      }
      for(const [key,child] of Object.entries(value))if(key!=='attachments')await attachImages(child);
    }
    await attachImages(output.versions);
    const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));
    const link=element('a');link.href=url;link.download=`${data.episodeKey}-review-feedback.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){status.textContent=e.message;}
};
$('#import').onclick=()=>$('#import-file').click();
$('#import-file').onchange=async event=>{
  try{
    const file=event.target.files[0];if(!file)return;
    if(!await flush())return;
    const r=await fetch('/api/import',{method:'POST',headers:{'Content-Type':'application/json'},body:await file.text()});
    const result=await r.json();if(!r.ok)throw Error(result.error);await load();status.textContent=`${result.message} · 新增 ${result.added}，保留 ${result.kept}`;
  }catch(e){status.textContent=e.message;}finally{event.target.value='';}
};
for(const button of document.querySelectorAll('[data-view]'))button.onclick=async()=>{
  if(!await flush())return;audio.pause();document.querySelectorAll('video').forEach(v=>v.pause());
  currentView=button.dataset.view;history.replaceState(null,'','?view='+currentView);await load().catch(e=>status.textContent=e.message);
};
$('#reload').onclick = async () => {if(uploadsInFlight){status.textContent='图片正在保存，请稍后刷新';return;}await flush();load().catch(error=>status.textContent=error.message);};
window.addEventListener('beforeunload',event => { if (uploadsInFlight || (store && Object.values(store.records).some(r => r.unsynced))) { event.preventDefault(); event.returnValue = ''; } });
load().catch(error => { status.textContent = error.message; $('#empty').hidden = false; $('#empty').textContent = '审看数据读取失败'; });
