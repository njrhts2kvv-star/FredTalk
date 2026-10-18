// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {Media} from './Media';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const progress=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const ease=(t:number,a:number,b:number)=>{const p=progress(t,a,b);return p*p*(3-2*p)};
export const clip026Metadata={width:1280,height:720,fps:60,durationInFrames:310};
/** Original capsule foreground rebuilt in editable text and CSS geometry.
 * The final ComfyUI screen recording is an explicitly retained real UI asset,
 * not a rendered remake. See analysis/026-contract.json for fidelity limits. */
export const Clip026: React.FC=()=>{
 const t=useCurrentFrame()/60;
 const focus=ease(t,2.54,2.91);
 const background=ease(t,2.78,3.35);
 const exit=ease(t,3.43,3.76);
 const labels=['高清放大','人物换装','照片换脸','参考生图','自动分镜'];
 const starts=[1.07,.27,-.24,.30,1.10];
 const pill=(i:number)=>{
  const appear=ease(t,starts[i],starts[i]+.34);
  const widen=ease(t,starts[i]+.12,starts[i]+.48);
  const ty=ease(t,starts[i]+.12,starts[i]+.52);
  const text=ease(t,starts[i]+.28,starts[i]+.79);
  const normalY=360+(i-2)*146;
  const originY=i===0?214:i===4?506:360;
  const y=i===2?360:mix(originY,normalY,ty);
  const scale=i===2?mix(1,2.14,focus):1;
  const width=i===2?mix(332,348,ease(t,0,.18)):mix(130,348,widen);
  return <div key={i} style={{position:'absolute',left:i===2?mix(640,1850,exit):640,top:y,width,height:136,borderRadius:50,background:'#000',boxShadow:'20px 12px 18px rgba(0,0,0,.28)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',transform:`translate(-50%,-50%) scale(${i===2?scale:appear})`,opacity:i===2?1:1-background,filter:i===2?'none':`blur(${background*9}px)`,zIndex:i===2?8:5}}>
   <div style={{fontFamily:'FredHeavy',fontSize:86,fontWeight:900,lineHeight:1,whiteSpace:'nowrap',color:'#8960ca',opacity:i===2?mix(.045,1,ease(t,0,.47)):text,letterSpacing:-1}}>{labels[i]}</div>
  </div>;
 };
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
  <style>{`@font-face{font-family:Clip026Heavy;src:url('${staticFile('026/MiSans-Heavy.otf')}')}@font-face{font-family:Clip026Regular;src:url('${staticFile('026/MiSans-Regular.otf')}')}`}</style>
  {t<3.8&&<div style={{position:'absolute',inset:0,background:'#1c1d1c',opacity:background}}><Media src="shared/screen.mp4" style={{position:'absolute',width:1280,height:720,filter:`blur(${mix(11,0,ease(t,3.2,3.8))}px)`}}/></div>}
  {t<3.8&&<>{[0,1,3,4,2].map(pill)}</>}
  {t>=3.8&&<Media src="shared/screen.mp4"/>}
 </AbsoluteFill>;
};
export default Clip026;
