// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Loop, interpolate, staticFile, useCurrentFrame, delayRender, continueRender, cancelRender} from 'remotion';

const lerp = (t:number, a:number, b:number, x:number, y:number) => interpolate(t,[a,b],[x,y],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const ease = (t:number,a:number,b:number) => {const p=lerp(t,a,b,0,1);return p*p*(3-2*p)};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const clip053Metadata = {width:1280,height:720,fps:60,durationInFrames:480};

/** Rebuilt foreground. Background photography uses two clean source still plates;
 * see analysis/053-contract.json for known fidelity limitations. */
export const Clip053: React.FC = () => {
 const [fontHandle] = useState(() => delayRender('Load original-language capsule fonts'));
 useEffect(() => {
   Promise.all([document.fonts.load('112px Clip053Heavy'), document.fonts.load('29px Clip053Regular')])
     .then(() => continueRender(fontHandle)).catch(cancelRender);
 }, [fontHandle]);
 const t=useCurrentFrame()/60;
 const fade=1-ease(t,6.42,6.84);
 
 const subtitle=t<.86?'我会顺着本地生活最真实的经营路径':t<2.72?'到店前到店中到店后':t<5?'带大家看看有赞的AI到底是怎么落地':t<6.1?'解决实际问题的':'先说到店前这个阶段的核心';
 const pill=(index:number,label:string,color:string,start:number)=>{
   const appear=ease(t,start,start+.28);
   const widen=ease(t,start+.13,start+.5);
   let y=index===0?mix(360,154,ease(t,1.66,1.98)):index===1?360:mix(360,568,ease(t,2.66,3.03));
   if(index===0)y=mix(y,360,ease(t,5.55,5.98));
   const x=index===2?mix(640,1540,ease(t,5.12,5.56)):index===1?mix(640,1540,ease(t,5.37,5.77)):640;
   const width=mix(174,426,widen);
   const textOpacity=ease(t,start+.21,start+.46);
   return <div key={label} style={{position:'absolute',left:x,top:y,width,height:174,borderRadius:90,background:'#000',overflow:'hidden',transform:`translate(-50%,-50%) scale(${appear})`,opacity:index===0?fade:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
     <div style={{whiteSpace:'nowrap',fontFamily:'Clip053Heavy',fontWeight:900,fontSize:112,lineHeight:1,color:'#fff',letterSpacing:3,transform:'scaleX(.93) scaleY(1.08)',opacity:textOpacity}}><span>到店</span><span style={{color}}>{label}</span></div>
   </div>;
 };
 return <AbsoluteFill style={{background:'#0a0815',overflow:'hidden'}}>
   <style>{`@font-face{font-family:Clip053Heavy;src:url('${staticFile('053/MiSans-Heavy.otf')}')}@font-face{font-family:Clip053Regular;src:url('${staticFile('053/MiSans-Regular.otf')}')}`}</style>
   <div style={{position:'absolute',inset:-20,filter:`blur(${lerp(t,.36,.9,0,13)}px)`,transform:'scale(1.035)'}}><Loop durationInFrames={306}><OffthreadVideo muted src={staticFile('shared/landscape-1.mp4')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Loop></div>
   {pill(0,'前','#8960ca',.91)}
   {pill(1,'中','#ffa900',1.70)}
   {pill(2,'后','#087bfa',2.30)}
   {t>=7.42&&<div style={{position:'absolute',left:mix(151,228,ease(t,7.42,7.98)),top:mix(350,360,ease(t,7.42,7.8)),width:mix(0,200,ease(t,7.42,7.72)),height:mix(0,200,ease(t,7.42,7.72)),borderRadius:'50%',background:'#ffa400',transform:'translate(-50%,-50%)'}}/>}

 </AbsoluteFill>;
};
export default Clip053;
