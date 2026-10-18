// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Media} from './Media';

/** Source motion rebuilt as independent editable containers. Content is replaceable. */
export const Clip036: React.FC<{media?:string[];labels?:string[]}> = ({media=['shared/screen.mp4','shared/portrait-2.png','shared/portrait-3.mp4'],labels=['文本','生图','视频']}) => {
 const f=useCurrentFrame();
 const ramp=(a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const smooth=(a:number,b:number)=>{const t=ramp(a,b);return t*t*(3-2*t)};
 const merge=smooth(109,125);
 const exit=smooth(142,149);
 const shift=smooth(8,18);
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden',fontFamily:'FredHeavy'}}>
  {f<19&&<>
   <div style={{position:'absolute',left:-25+shift*1480,top:584,width:445,height:205,borderRadius:75,background:'#000',filter:'blur(12px)'}}/>
   <div style={{position:'absolute',left:70+shift*1480,top:30,width:1140,height:660,borderRadius:70,overflow:'hidden',boxShadow:'18px -14px 36px #0007'}}><Media src="shared/interface.png" fit="contain" style={{background:'white'}}/></div>
  </>}
  {f>=10&&f<130&&media.map((src,i)=>{
   const enters=smooth(10+i,19+i);
   const baseX=[14,448,884][i];
   const targetX=152+i*325.33;
   const x=baseX+(1-enters)*1280+(targetX-baseX)*merge;
   const y=72+(1-enters)*[50,135,-15][i]-10*merge;
   const textIn=smooth([25,40,55][i],[33,48,63][i]);
   return <div key={i} style={{position:'absolute',left:x,top:y,width:384-58.67*merge,height:576+20*merge,borderRadius:76*(1-merge),overflow:'hidden',background:'#000',boxShadow:`${18*(1-merge)}px ${14*(1-merge)}px ${20*(1-merge)}px #0003`,opacity:1-ramp(119,129)}}>
     <div style={{position:'absolute',inset:0,opacity:ramp([17,32,47][i],[24,39,54][i])*(1-ramp(111,125))}}><Media src={src}/></div>
     <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:112,letterSpacing:-3,opacity:textIn*(1-ramp(110,122)),transform:`scale(${1.23-.23*textIn})`,textShadow:'0 4px 12px #0008'}}>{labels[i]}</div>
   </div>;
  })}
  {f>=116&&<div style={{position:'absolute',left:152+exit*122,top:62+exit*170,width:976-exit*576,height:596-exit*282,borderRadius:76-exit*24,background:'#000',opacity:ramp(116,127),boxShadow:'23px 15px 24px #0003'}}/>}
  {f>=127&&<div style={{position:'absolute',left:385+exit*195,top:280+exit*20,width:510,height:160,opacity:ramp(127,139),background:`rgb(${255-exit*238},${255-exit*238},${255-exit*238})`,maskImage:`url(${staticFile('036/agnes-mask.png')})`,maskSize:'100% 100%',WebkitMaskImage:`url(${staticFile('036/agnes-mask.png')})`,WebkitMaskSize:'100% 100%'}}/>}
  {f>=141&&<div style={{position:'absolute',left:320+exit*10,top:330,fontSize:40,fontStyle:'italic',fontFamily:'serif',color:'#858585',opacity:exit}}>Agnes</div>}
 </AbsoluteFill>;
};
export default Clip036;
