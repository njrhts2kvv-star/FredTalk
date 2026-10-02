import React from 'react';
import {AbsoluteFill, Audio, Composition, Easing, Img, interpolate, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {Video} from '@remotion/media';
import manifest from '../../third-opening-repair/docs/manifest.json';

const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.45,0,.18,1)});
const ThirdOpeningRepair:React.FC=()=>{
  const f=useCurrentFrame();
  const shift=ease(f,manifest.holdUntilFrame,155);
  const grow=ease(f,manifest.holdUntilFrame+5,manifest.joinFrame);
  const panelScale=.16+.84*grow;
  const mediaWidth=2160*2432/1408;
  return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
    {f<manifest.joinFrame ? <>
      <div style={{position:'absolute',left:340,top:490-2200*shift,width:3160,height:1178,borderRadius:355,overflow:'hidden',background:'#000'}}>
        <Img src={staticFile('third-opening-repair/opening.png')} style={{position:'absolute',width:3840,height:2160,left:-340,top:-490,filter:'contrast(1.3)'}}/>
      </div>
      {f>=manifest.holdUntilFrame+5 && <div style={{position:'absolute',left:(3840-mediaWidth)/2,top:0,width:mediaWidth,height:2160,transform:`translateY(${420*(1-grow)}px) scale(${panelScale})`,transformOrigin:'center',borderRadius:140*(1-grow),overflow:'hidden'}}>
        <Img src={staticFile('third-opening-repair/join.png')} style={{width:'100%',height:'100%'}}/>
      </div>}
    </> : <Video src={staticFile('third-opening-repair/reference.mp4')} muted style={{position:'absolute',left:(3840-mediaWidth)/2,top:0,width:mediaWidth,height:2160}}/>}
    <Audio src={staticFile('third-opening-repair/reference.mp4')}/>
  </AbsoluteFill>;
};
const Root:React.FC=()=> <Composition id={manifest.pages[0].stableId} component={ThirdOpeningRepair} width={manifest.width} height={manifest.height} fps={manifest.fps} durationInFrames={manifest.pages[0].durationInFrames}/>;
registerRoot(Root);

