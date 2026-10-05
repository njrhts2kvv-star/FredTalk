import React from 'react';
import {AbsoluteFill,Composition,Easing,Img,OffthreadVideo,interpolate,registerRoot,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {SmileySubtitle} from './SmileySubtitle';
import data from './production.json';
import contracts from './contracts.json';
type Sid=keyof typeof contracts;
export function Incoming({sceneId}:{sceneId:Sid}){
 const frame=useCurrentFrame();const{width}=useVideoConfig();const c=contracts[sceneId];
 const q=interpolate(frame,[0,c.headFrames-1],[0,1],{easing:Easing.bezier(.65,0,.2,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const scene=data.pages.find(s=>s.stableId===sceneId)!;
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
  {/* The inherited scene body is rendered from its exact terminal source state,
      without its burned global caption. Hold only for this short handoff. */}
  <Img src={staticFile('clean/'+c.previous+'.png')} style={{width:'100%',height:'100%',filter:`blur(${q*10}px)`}}/>
  <AbsoluteFill style={{opacity:q}}><OffthreadVideo src={staticFile('current/'+sceneId+'.mp4')} muted style={{width:'100%',height:'100%'}}/></AbsoluteFill>
  {/* Current narration stays crisp and at its original global cue time. */}
  <div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'top left'}}>
   <SmileySubtitle cues={data.cues} timeSeconds={(scene.startFrame+frame)/60}/>
  </div>
 </AbsoluteFill>;
}
const Root=()=> <>{(Object.keys(contracts) as Sid[]).map(sceneId=><Composition key={sceneId} id={sceneId+'-incoming'} component={Incoming} defaultProps={{sceneId}} width={3840} height={2160} fps={60} durationInFrames={contracts[sceneId].headFrames}/>)}</>;

