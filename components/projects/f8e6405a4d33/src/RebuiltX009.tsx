import {DARK_PURPLE,purpleOnDark,purpleOnSurface} from "../surface-purple.ts";
import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';
import type {Overrides} from './index';
import cues from './timelines/X009.json';
const opacity=(f:number,p:number[][])=>interpolate(f,p.map(v=>v[0]),p.map(v=>v[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export function RebuiltX009({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,accent=overrides.accent??'#8554E8',labels=overrides.words??['直出1080p高清视频','稳定呈现中文汉字内容','支持图片+音频+视频做参考'];
 return <AbsoluteFill style={{background:'white'}}>
  <div style={{position:'absolute',left:106,top:68,width:1708,height:945,borderRadius:68,background:'black',boxShadow:'38px 27px 34px #0005'}}/>
  {labels.slice(0,3).map((label,i)=>{const chars=Array.from(`${i+1}.${label}`),size=[151,143,110][i];return <div key={i} style={{position:'absolute',left:197,top:[206,472,749][i]-size*.026,fontFamily:'MiSans',fontSize:size,fontWeight:900,lineHeight:1,letterSpacing:[-1.3,-3.4,-.7][i],whiteSpace:'nowrap',color:'white'}}>{chars.map((c,j)=>{const original=cues.rows[i],idx=Math.min(original.length-1,Math.floor(j/(chars.length-1)*(original.length-1)));return <span key={j} style={{color:j<2?purpleOnDark(accent):undefined,opacity:opacity(f,original[idx].alpha)}}>{c}</span>})}</div>})}
 </AbsoluteFill>;
}
