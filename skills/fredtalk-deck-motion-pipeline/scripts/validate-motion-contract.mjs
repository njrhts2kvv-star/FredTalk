import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const text=x=>typeof x==='string'&&x.trim().length>0;
const list=x=>Array.isArray(x)&&x.length>0;
const hash=file=>'sha256:'+createHash('sha256').update(fs.readFileSync(file)).digest('hex');

// Checks declared contracts and real dependency bytes, not visual acceptance.
export function validateMotionContract(contract,contractPath){
 const failures=[],base=path.dirname(path.resolve(contractPath));
 const checkFile=(ref,label)=>{
  if(!text(ref?.path)||!text(ref?.checksum)){failures.push(`${label}: path/checksum required`);return;}
  try{if(hash(path.resolve(base,ref.path))!==ref.checksum)failures.push(`${label}: checksum mismatch`);}catch(e){failures.push(`${label}: ${e.message}`);}
 };
 for(const [i,dep] of (contract.runtimeDependencies??[]).entries())checkFile(dep,`runtimeDependencies[${i}]`);
 for(const p of (contract.pages??[]).filter(p=>!p.exclude)){
  const label=p.stableId??'page',r=p.reconstruction;
  if(p.productionRoute==='h3-remotion'&&!r)failures.push(`${label}: h3-remotion needs reconstruction`);
  if(r){
   checkFile(r.sourceVideo,`${label}.sourceVideo`);
   const src=r.sourceVideo??{},out=r.output??{};
   if(!(src.fps>0)||!Number.isInteger(src.startFrame)||!Number.isInteger(src.endFrameExclusive)||src.startFrame<0||src.endFrameExclusive<=src.startFrame)failures.push(`${label}: invalid source frame range/fps`);
   if(!(out.fps>0)||!Number.isInteger(out.durationInFrames)||out.durationInFrames<=0)failures.push(`${label}: invalid output clock`);
   if(!['full-remotion','hybrid-repair'].includes(r.mode))failures.push(`${label}: declare reconstruction mode`);
   if(r.mode==='hybrid-repair'&&(!list(r.bakedRanges)||!list(r.editableRanges)))failures.push(`${label}: hybrid ranges required`);
   if(!list(r.preserve)||!Array.isArray(r.adapt)||!Array.isArray(r.mediaDependencies))failures.push(`${label}: preserve/adapt/mediaDependencies required`);
   if(!['agent-reviewed','user-approved'].includes(r.review?.status)||!text(r.review?.evidence))failures.push(`${label}: actual reference review evidence required`);
   const states=r.states??[];
   if(states.length<3||!states.some(s=>s.role==='opening')||!states.some(s=>s.role==='intermediate')||!states.some(s=>s.role==='final'))failures.push(`${label}: opening, intermediate and final states required`);
   let lastState=-1;
   for(const s of states){if(!Number.isInteger(s.sourceFrame)||s.sourceFrame<src.startFrame||s.sourceFrame>=src.endFrameExclusive||s.sourceFrame<lastState||!list(s.objectIds))failures.push(`${label}: invalid object state`);lastState=s.sourceFrame;}
   const mapping=r.timeMap??[];let sourceFrame=-1,outputFrame=-1;
   if(mapping.length<2)failures.push(`${label}: timeMap anchors required`);
   for(const m of mapping){
    if(!Number.isInteger(m.sourceFrame)||!Number.isInteger(m.outputFrame)||m.sourceFrame<src.startFrame||m.sourceFrame>=src.endFrameExclusive||m.sourceFrame<sourceFrame||m.outputFrame<=outputFrame||m.outputFrame<0||m.outputFrame>=out.durationInFrames||!text(m.beatId))failures.push(`${label}: invalid or reversed timeMap`);
    sourceFrame=m.sourceFrame;outputFrame=m.outputFrame;
   }
  }
  if(p.upstreamTail){
   const tail=p.upstreamTail;checkFile(tail,`${label}.upstreamTail`);
   if(!text(tail.stateId))failures.push(`${label}: upstreamTail needs stateId`);
   if(/\.(png|jpe?g|webp|exr)$/i.test(tail.path??'')||tail.sourceVideo){
    checkFile(tail.sourceVideo,`${label}.upstreamTail.sourceVideo`);
    if(!Number.isInteger(tail.frameIndex)||tail.frameIndex<0)failures.push(`${label}: extracted tail needs frameIndex`);
   }
  }
  const ids=new Set();
  for(const o of p.visualContract?.objects??[]){
   if(!text(o.id)||ids.has(o.id))failures.push(`${label}: object IDs must be unique`);ids.add(o.id);
   if(o.border==='none'&&Number(o.strokeWidth??0)!==0)failures.push(`${label}.${o.id}: no-border conflicts with stroke`);
   if(o.clipScope==='surface'&&!text(o.intentionalOcclusion))failures.push(`${label}.${o.id}: surface clipping needs an intentional occlusion`);
   if(['background','full-screen-mask'].includes(o.role)&&o.coverage!=='viewport')failures.push(`${label}.${o.id}: full-screen layers must cover viewport`);
   if(o.visibleRange&&(!Array.isArray(o.visibleRange)||o.visibleRange.length!==2||o.visibleRange[0]<0||o.visibleRange[1]<=o.visibleRange[0]||!o.visibleRange.every(Number.isInteger)))failures.push(`${label}.${o.id}: invalid visibleRange`);
  }
 }
 return failures;
}
