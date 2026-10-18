// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {Composition, registerRoot, useVideoConfig} from 'remotion';
import {FontGate} from './Media';
import {Clip014,Clip015,Clip016,Clip017,Clip024,Clip025,Clip027} from './BatchA';
import {Clip028,Clip033,Clip041,Clip042,Clip044,Clip045} from './BatchB';
import {Clip048,Clip049,Clip051,Clip052} from './BatchC';
import {Clip026} from './Clip026';
import {Clip036} from './Clip036';
import {Clip038} from './Clip038';
import {Clip053} from './Clip053';
const scaleScene=(Scene:React.ComponentType<any>)=>function Scaled(){
 const {width}=useVideoConfig();
 return <FontGate><div style={{position:'absolute',width:1280,height:720,transform:`scale(${width/1280})`,transformOrigin:'0 0'}}><Scene/></div></FontGate>;
};
const Root=()=> <>
<Composition id="Motion014" component={scaleScene(Clip014)} width={1920} height={1080} fps={30} durationInFrames={231}/>
<Composition id="Motion015" component={scaleScene(Clip015)} width={1920} height={1080} fps={60} durationInFrames={1437}/>
<Composition id="Motion016" component={scaleScene(Clip016)} width={1920} height={1080} fps={60} durationInFrames={378}/>
<Composition id="Motion017" component={scaleScene(Clip017)} width={1920} height={1080} fps={60} durationInFrames={235}/>
<Composition id="Motion024" component={scaleScene(Clip024)} width={1920} height={1080} fps={60} durationInFrames={1540}/>
<Composition id="Motion025" component={scaleScene(Clip025)} width={1920} height={1080} fps={60} durationInFrames={350}/>
<Composition id="Motion026" component={scaleScene(Clip026)} width={1920} height={1080} fps={60} durationInFrames={310}/>
<Composition id="Motion027" component={scaleScene(Clip027)} width={1920} height={1080} fps={60} durationInFrames={428}/>
<Composition id="Motion028" component={scaleScene(Clip028)} width={1920} height={1080} fps={60} durationInFrames={1078}/>
<Composition id="Motion033" component={scaleScene(Clip033)} width={1920} height={1080} fps={30} durationInFrames={450}/>
<Composition id="Motion036" component={scaleScene(Clip036)} width={1920} height={1080} fps={30} durationInFrames={150}/>
<Composition id="Motion038" component={scaleScene(Clip038)} width={1920} height={1080} fps={30} durationInFrames={180}/>
<Composition id="Motion041" component={scaleScene(Clip041)} width={1920} height={1080} fps={30} durationInFrames={180}/>
<Composition id="Motion042" component={scaleScene(Clip042)} width={1920} height={1080} fps={30} durationInFrames={360}/>
<Composition id="Motion044" component={scaleScene(Clip044)} width={1920} height={1080} fps={30} durationInFrames={210}/>
<Composition id="Motion045" component={scaleScene(Clip045)} width={1920} height={1080} fps={30} durationInFrames={210}/>
<Composition id="Motion048" component={scaleScene(Clip048)} width={1920} height={1080} fps={30} durationInFrames={420}/>
<Composition id="Motion049" component={scaleScene(Clip049)} width={1920} height={1080} fps={60} durationInFrames={480}/>
<Composition id="Motion051" component={scaleScene(Clip051)} width={1920} height={1080} fps={30} durationInFrames={240}/>
<Composition id="Motion052" component={scaleScene(Clip052)} width={1920} height={1080} fps={30} durationInFrames={300}/>
<Composition id="Motion053" component={scaleScene(Clip053)} width={1920} height={1080} fps={60} durationInFrames={480}/>
</>;
registerRoot(Root);
