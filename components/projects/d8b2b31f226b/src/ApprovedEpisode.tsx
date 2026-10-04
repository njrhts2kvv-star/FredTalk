import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {Composition, registerRoot, AbsoluteFill, Sequence, Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {Opening,Reveal,Workbench,Questions,Meeting,Ending} from './scenes';
import {Segment6Visual} from './Segment6';
import {Fonts,E} from './visuals';
import {SmileySubtitle} from './SmileySubtitle';
import {SceneTimingProvider,mapSceneTime} from './SceneTiming';
import timeline from './timeline.json';
import cues from './cues.json';
const starts=timeline.starts;
const scenes=[Opening,Reveal,Workbench,Questions,Meeting,Segment6Visual,Ending];
const Brand=()=>{
 const f=useCurrentFrame();const i=starts.findIndex((start,n)=>n<7&&f>=start&&f<starts[n+1]);
 if(i<0)return null;
 const t=mapSceneTime((f-starts[i])/60,timeline.sceneTimeMaps[i]);
 const visible=i===0?t>=5:i===1?t<3.65:i===2?t<4.0667:i===3?true:i===5?t>=6.65:i===6;
 return visible?<Img src={staticFile(i===6&&t>=.25?'brand-dark.png':'brand.png')} style={{position:'absolute',left:1549.5,top:36,width:345.5,height:85,zIndex:10000}}/>:null;
};
const Join:React.FC<React.PropsWithChildren<{index:number}>>=({children,index})=>{const f=useCurrentFrame();const join=[1,2,4,5].includes(index)?E(f/60,0,index===5?.1:.3):1;return <AbsoluteFill style={{opacity:join}}>{children}</AbsoluteFill>};
export const Episode:React.FC=()=>{const {width}=useVideoConfig();return <AbsoluteFill style={{background:'#fff'}}><div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'0 0'}}><Fonts/>{scenes.map((Scene,i)=><Sequence key={i} from={starts[i]} durationInFrames={starts[i+1]-starts[i]+(i<6&&[1,2,4,5].includes(i+1)?18:0)}><SceneTimingProvider index={i}><Join index={i}><Scene/></Join></SceneTimingProvider></Sequence>)}<SmileySubtitle cues={cues}/><Brand/></div></AbsoluteFill>};
// Audio is muxed from the exact supplied WAV after visual rendering, avoiding segment AAC gaps.
