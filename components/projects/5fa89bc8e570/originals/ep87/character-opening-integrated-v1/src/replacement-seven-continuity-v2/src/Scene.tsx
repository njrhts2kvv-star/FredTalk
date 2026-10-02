import React from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import current from '../../../manifest.json';
const manifest={...current.sourceManifest,groups:current.sourceManifest.groups.map(g=>({...g,pages:g.pages.filter(p=>p.index<=16)}))};
import {Clip1} from '../../continuous-v1/src/Clip1';
import {Clip2} from '../../continuous-v1/src/Clip2';
import {Clip3} from '../../continuous-v1/src/Clip3';
import {Clip4} from '../../continuous-v1/src/Clip4';
import {Bridge as OriginalBridge} from '../../continuous-v1/src/Bridges';
import {Clip7} from '../../followup-v1/src-repair/MaterialsTrial';
import {Clip9,Clip11} from '../../followup-v1/src-repair/Responsibility';
import {Clip15,Clip16,Clip17,Clip18} from '../../followup-v1/src-repair/Closing';
import {R2Clip5,R2Clip6,R2Clip8} from './Materials';
import {R2Clip10,R2Clip12,R2Clip13} from './Teaching';
import {R2Clip14} from './Chain';
import {ease,mix,R} from './primitives';
import {ObjectHandoff} from './ObjectHandoff';
import {e as legacyEase} from '../../continuous-v1/src/shared';
const registry:any={Clip1,Clip2,Clip3,Clip4,R2Clip5,R2Clip6,Clip7,R2Clip8,Clip9,R2Clip10,Clip11,R2Clip12,R2Clip13,R2Clip14,Clip15,Clip16,Clip17,Clip18};
function LegacyHandoff({before,after,frame,boundary}:any){
 const p=legacyEase(frame,boundary-30,boundary+30),edge=mix(-260,1540,p),gap=90;
 const Old=registry[before.componentId],New=registry[after.componentId];
 return <><clipPath id='legacy-old'><path d={`M${edge+gap} 0 Q${edge+gap+160} 360 ${edge+gap} 720 H1800 V0 Z`}/></clipPath><clipPath id='legacy-new'><path d={`M-400 0 H${edge} Q${edge+160} 360 ${edge} 720 H-400 Z`}/></clipPath><g clipPath='url(#legacy-old)'><Old t={(before.durationInFrames-30)/60} page={before}/></g><g clipPath='url(#legacy-new)'><New t={.5} page={after}/></g></>;
}
function LocalHandoff({before,after,frame,boundary}:any){
 const p=ease(frame,boundary-30,boundary+30),Old=registry[before.componentId],New=registry[after.componentId];
 // The meeting edge is shared: outgoing and incoming reading areas never overlap.
 const vertical=[7,10,12,15].includes(after.index),reverse=after.index===12;
 const shift=vertical?720:1280,sign=reverse?-1:1;
 const oldX=vertical?0:-shift*p,oldY=vertical?-sign*shift*p:0;
 const newX=vertical?0:shift*(1-p),newY=vertical?sign*shift*(1-p):0;
 const edge=vertical?(reverse?720*p:720*(1-p)):1280*(1-p);
 return <>
 <clipPath id='r2-old'><rect x={0} y={vertical&&reverse?edge:0} width={vertical?1280:edge} height={vertical?(reverse?720-edge:edge):720}/></clipPath>
 <clipPath id='r2-new'><rect x={vertical?0:edge} y={vertical&&!reverse?edge:0} width={vertical?1280:1280-edge} height={vertical?(reverse?edge:720-edge):720}/></clipPath>
 <g clipPath='url(#r2-old)'><g transform={`translate(${oldX} ${oldY})`}><Old t={(before.durationInFrames-30)/60} page={before}/></g></g>
 <g clipPath='url(#r2-new)'><g transform={`translate(${newX} ${newY})`}><New t={.5} page={after}/></g></g>
 </>;
}
export function Scene({groupId,sourceFrame}:any){
 const [handle]=React.useState(()=>delayRender('Local MiSans ready'));
 React.useEffect(()=>{const f=new FontFace('MiSans',`url(${staticFile('fonts/MiSans-Semibold.otf')})`,{weight:'600'});f.load().then(font=>{document.fonts.add(font);if(!document.fonts.check('600 40px MiSans'))throw Error('Font load failed');continueRender(handle)}).catch(cancelRender)},[handle]);
 const frame=sourceFrame,group=manifest.groups.find(g=>g.id===groupId)!;
 const index=group.pages.findIndex(p=>frame>=p.offsetFrames&&frame<p.offsetFrames+p.durationInFrames),page=group.pages[index],Component=registry[page.componentId];
 const ji=group.pages.findIndex((p,i)=>i>0&&frame>=p.offsetFrames-30&&frame<p.offsetFrames+30);let content;
 if(ji>0){const after=group.pages[ji],before=group.pages[ji-1],boundary=after.offsetFrames;
  if(after.index<=4)content=<OriginalBridge frame={frame} join={{boundaryFrame:boundary,startFrame:boundary-30,endFrame:boundary+30}} index={ji-1} components={[Clip1,Clip2,Clip3,Clip4]} pages={group.pages}/>;
  else if(manifest.replacementIndices.includes(after.index)||manifest.replacementIndices.includes(before.index))content=<ObjectHandoff before={before} after={after} frame={frame} boundary={boundary} Old={registry[before.componentId]} New={registry[after.componentId]} config={manifest.handoffs.find(h=>h.after===after.index)}/>;
  else content=<LegacyHandoff before={before} after={after} frame={frame} boundary={boundary}/>;
 }else content=<Component t={(frame-page.offsetFrames)/60} page={page}/>;
 return <AbsoluteFill style={{background:'#fff'}}><svg width='100%' height='100%' viewBox='0 0 1280 720' style={{fontFamily:'MiSans'}}>{content}</svg></AbsoluteFill>;
}
