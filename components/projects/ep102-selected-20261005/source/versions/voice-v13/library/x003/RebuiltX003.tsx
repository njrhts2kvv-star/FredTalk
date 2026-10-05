import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';
import type {Overrides} from './index';
import cues from './timelines/X003.json';
const value=(f:number,p:number[][],col=1)=>interpolate(f,p.map(v=>v[0]),p.map(v=>v[col]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export function RebuiltX003({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,w=overrides.words??[],accent=overrides.accent??'#8554E8';
 const first=w[0]??'8G显存笔记本',second=w[1]??'+量化模型',chars=Array.from(first+second),size=(value(f,cues.textSize)+2)*.8;
 return <AbsoluteFill style={{background:'white'}}>
  <div style={{position:'absolute',left:value(f,cues.shell,1)*1.5,top:value(f,cues.shell,2)*1.5,width:value(f,cues.shell,3)*1.5,height:value(f,cues.shell,4)*1.5,borderRadius:value(f,cues.radius),background:'black',boxShadow:'35px 18px 20px #0005'}}/>
  <div style={{position:'absolute',left:value(f,cues.textX)-6,top:542-size*.51,fontFamily:'EP102',fontWeight:900,fontSize:size,lineHeight:1,letterSpacing:-1.1,transform:`scaleX(${.95+.009*Math.max(0,Math.min(1,(f-120)/30))})`,transformOrigin:'left center',whiteSpace:'nowrap',color:accent}}>{chars.map((c,i)=>{
   const firstLength=Array.from(first).length,original=i<firstLength?Math.min(6,Math.floor(i*7/firstLength)):7+Math.min(4,Math.floor((i-firstLength)*5/Array.from(second).length));
   return <span key={i} style={{visibility:f>=cues.letterStarts[original]?'visible':'hidden',opacity:value(f,cues.letterExit[original])}}>{c}</span>;
  })}</div>
 </AbsoluteFill>;
}
