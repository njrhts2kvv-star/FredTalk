import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';
import type {Overrides} from './types';
import checkTimeline from './timelines/N005.json';
const sample=(f:number,points:number[][],column=1)=>interpolate(f,points.map(p=>p[0]),points.map(p=>p[column]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export function RebuiltN005({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,accent=overrides.accent??'#8554E8';
 const labels=overrides.words??['直出1080p高清视频','稳定呈现中文汉字内容','支持图片+音频+视频做参考'];
 const sizes=[151,143,110],spacing=[-1.3,-3.4,-.7],inkLeft=[7,6,5];
 return <AbsoluteFill style={{background:'#fff'}}>
  <div style={{position:'absolute',left:106,top:68,width:1708,height:945,borderRadius:68,background:'#000',boxShadow:'38px 27px 34px rgba(0,0,0,.32)'}}/>
  {checkTimeline.rows.map((track,i)=>{const scale=sample(f,track,4)/track[0][4],size=sizes[i]*scale;return <div key={i} style={{position:'absolute',left:sample(f,track,1)-inkLeft[i]*scale,top:sample(f,track,2)-size*.026,fontFamily:'MiSans',fontWeight:900,fontSize:size,lineHeight:1,letterSpacing:spacing[i]*scale,whiteSpace:'nowrap',color:'#fff'}}><span style={{color:accent}}>{i+1}.</span>{labels[i]}</div>})}
  <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>
   {checkTimeline.ticks.map((track,i)=>{if(f<track[0][0])return null;const x=sample(f,track),y=[281,555,813][i];const tipY=x<=1668?y+(x-1643)*18/25:y+18-(x-1668)*60/63;const d=x<=1668?`M1643 ${y} L${x} ${tipY}`:`M1643 ${y} L1668 ${y+18} L${x} ${tipY}`;return <path key={i} d={d} fill="none" stroke={accent} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round"/>})}
  </svg>
 </AbsoluteFill>;
}
