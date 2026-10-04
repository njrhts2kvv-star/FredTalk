import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../../../../material-policy';
import {useShuHei} from './useShuHei';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill, Loop, interpolate, useCurrentFrame, delayRender, continueRender, cancelRender} from 'remotion';
import raw from '../../../../specs/R053.json';
import {ClipSpec,measured} from '../../../../runtime/clip-spec';
export const clip053Metadata={width:1280,height:720,fps:60,durationInFrames:411};
export const Clip053:React.FC=()=>{
 useShuHei();
 const f=useCurrentFrame(),spec=raw as ClipSpec;
 const ramp=(a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const [ry,rz,scale,x,blur]=measured(spec,'background',f);
 return <AbsoluteFill style={{background:'#0a0815',overflow:'hidden'}}><div style={{position:'absolute',width:1920,height:1080,transform:'scale(0.666666667)',transformOrigin:'0 0'}}>
 <style>{`@font-face{font-family:Clip053Heavy;src:url('${staticFile('053/MiSans-Heavy.otf')}');font-weight:900}`}</style>
 <div style={{position:'absolute',inset:-30,filter:`invert(1) brightness(0.7) blur(${blur}px)`,transform:`perspective(1800px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale}) translateX(${x}px)`}}><Loop durationInFrames={306}><OffthreadVideo muted src={staticFile('shared/landscape-1.mp4')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Loop></div>
 {['前','中','后'].map((label,i)=>{
 const[cx,cy,w,h,opacity]=measured(spec,`pill${i}`,f);
 const light=measured(spec,`textLight${i}`,f);
 return <div key={label} style={{position:'absolute',left:cx-w/2,top:cy-h/2,width:w,height:h,borderRadius:h/2,background:'#000',overflow:'hidden',opacity,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{flexShrink:0,whiteSpace:'nowrap',fontFamily:'OfficialShuHei',fontWeight:700,fontSize:168,lineHeight:1,color:'white'}}>{Array.from('记录'+label).map((char,j)=><span key={j} style={{opacity:light[j],color:j===2?'#8960ca':'white'}}>{char}</span>)}</div></div>
 })}
 </div></AbsoluteFill>;
};
export default Clip053;
