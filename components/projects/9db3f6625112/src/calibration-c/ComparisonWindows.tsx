import React from 'react';
import {AbsoluteFill,OffthreadVideo,Sequence,staticFile} from 'remotion';
import motion from './N023-motion.json';
const value=(f:number,k:number)=>{const at=Math.max(0,Math.min(125,f)),a=Math.floor(at),b=Math.min(125,a+1);return motion[a][k]+(motion[b][k]-motion[a][k])*(at-a)};
/** N023: native 30fps measurements mapped to the 60fps composition clock. */
export function ComparisonWindows({t,words,accent,films,closeups,actor}:{t:number;words?:string[];accent:string;films?:string[];closeups?:string[];actor?:string}) {
 const f=t*30,p=value(f,0),exit=value(f,1);
 return <AbsoluteFill style={{background:'white'}}>
  {[0,1].map(i=>{
   const width=i?520+(864-520)*p:1920+(864-1920)*p;
   const left=i?1370+(1016-1370)*p+exit:40*p-exit;
   const top=i?760+(298-760)*p:298*p;
   const scale=width/1920,shadowScale=i?width/864:p;
   const src=films?.[i]??staticFile(`group-c/clean-film${i+1}.mp4`);
   return <div key={i} style={{position:'absolute',left,top,width,height:width*9/16,borderRadius:i?40*width/864:40*p,overflow:'hidden',boxShadow:`${20*shadowScale}px ${22*shadowScale}px ${22*shadowScale}px #0008`}}>
    <Sequence durationInFrames={146} layout="none"><OffthreadVideo src={src} muted style={{width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(1)'}}/></Sequence>
    <Sequence from={146} layout="none"><OffthreadVideo src={closeups?.[i]||src} trimBefore={closeups?.[i]?0:60} muted style={{width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(1)',transform:closeups?.[i]?'none':'scale(1.28)',transformOrigin:'50% 50%'}}/></Sequence>
    <div style={{position:'absolute',left:22*scale,top:8*scale,fontFamily:'MiSans',fontWeight:900,fontSize:120*scale,lineHeight:1.15,whiteSpace:'nowrap',color:i?'white':accent,textShadow:`${2*scale}px ${3*scale}px ${4*scale}px #000`}}>{words?.[i]??(i?'参考片段':'AI生成')}</div>
   </div>;
  })}
  {actor&&<div style={{position:'absolute',left:460,top:1080-exit*1.06,width:1000,height:1000}}><OffthreadVideo src={actor} muted transparent style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>}
 </AbsoluteFill>;
}
