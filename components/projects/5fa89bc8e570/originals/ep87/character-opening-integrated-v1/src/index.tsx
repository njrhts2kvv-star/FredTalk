import React from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,useVideoConfig} from 'remotion';
import manifest from '../manifest.json';
import {Scene} from './replacement-seven-continuity-v2/src/Scene';
import {sourceFrameAt} from './clock.mjs';
import {WorkBuddyOpening} from './Opening';
import {Brand,Slides} from './continuous-v1/src/shared';
import {WorkBuddyBrandVisible} from './BrandVisibility';
function AudioTimedSceneContent({groupId}:{groupId:string}){
 const frame=useCurrentFrame(),{width}=useVideoConfig(),group=manifest.groups.find(g=>g.id===groupId)!;
 if(groupId==='ep87-group-1'&&frame<594){
  const p=Math.max(0,(frame-564)/30),enter=Math.max(0,Math.min(1,(p-.48)/.52)),reveal=enter*enter*(3-2*enter);
  const travel=p*p*(3-2*p),dx=(551.875-350)*(1-travel),dy=(192.1875-200)*(1-travel);
  return <AbsoluteFill style={{background:'#fff'}}><div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'0 0'}}>
   <WorkBuddyOpening frame={Math.min(frame/2,281.5)} handoff={p}/>
   {enter>0&&<svg width={1920} height={1080} viewBox='0 0 1280 720' style={{position:'absolute',inset:0,fontFamily:'MiSans'}}>
    <clipPath id='incoming-courseware'><rect x={350} y={110} width={550*reveal} height={430}/></clipPath>
    <g transform={`translate(${dx} ${dy+18*(1-reveal)})`}><g clipPath='url(#incoming-courseware)'><g transform='translate(350 200)'><Brand x={25} y={-40}/><g transform='translate(25 35) scale(.72)'><Slides title={manifest.sourceManifest.groups[0].pages[1].words[1]}/></g></g></g></g>
   </svg>}
  </div></AbsoluteFill>;
 }
 return <Scene groupId={groupId} sourceFrame={sourceFrameAt(group.clock,frame)}/>;
}
function AudioTimedScene({groupId}:{groupId:string}){
 return <WorkBuddyBrandVisible.Provider value={groupId!=='ep87-group-1'}><AudioTimedSceneContent groupId={groupId}/></WorkBuddyBrandVisible.Provider>;
}
registerRoot(()=> <>{manifest.groups.map(g=><Composition key={g.id} id={g.id} component={AudioTimedScene} defaultProps={{groupId:g.id}} width={manifest.width} height={manifest.height} fps={manifest.fps} durationInFrames={g.durationInFrames}/>)}</>);
