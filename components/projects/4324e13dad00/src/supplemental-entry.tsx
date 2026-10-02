import React from 'react';
import {Composition, Sequence, registerRoot, useVideoConfig} from 'remotion';
import {FontGate} from './Media';
import {Clip017,Clip025,Clip027} from './BatchA';
import {Clip028,Clip042,Clip044} from './BatchB';
import {Clip052} from './BatchC';
import {Clip038} from './Clip038';
const scaleScene=(Scene:React.ComponentType<any>)=>function Scaled(){const {width}=useVideoConfig();return <FontGate><div style={{position:'absolute',width:1280,height:720,transform:`scale(${width/1280})`,transformOrigin:'0 0'}}><Scene/></div></FontGate>};
// Original 30fps editorial holds converted to 60fps frame positions.
const Edited042=()=> <><Sequence from={0} durationInFrames={180} layout="none"><Clip042/></Sequence><Sequence from={180} durationInFrames={240} layout="none"><Sequence from={-480} durationInFrames={720} layout="none"><Clip042/></Sequence></Sequence></>;
const Edited052=()=> <><Sequence from={0} durationInFrames={180} layout="none"><Clip052/></Sequence><Sequence from={180} durationInFrames={180} layout="none"><Sequence from={-420} durationInFrames={600} layout="none"><Clip052/></Sequence></Sequence></>;
const Root=()=> <>{[["017",Clip017,235],["025",Clip025,350],["027",Clip027,428],["028",Clip028,1078],["038",Clip038,360],["042",Edited042,420],["044",Clip044,420],["052",Edited052,360]].map(([id,component,frames])=><Composition key={String(id)} id={`Motion${id}`} component={scaleScene(component as React.ComponentType<any>)} width={1920} height={1080} fps={60} durationInFrames={Number(frames)}/>)}</>;
registerRoot(Root);
