import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';
import type {Overrides} from './index';
import cues from './timelines/N007.json';
const sample=(f:number,p:number[][])=>interpolate(f,p.map(v=>v[0]),p.map(v=>v[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export function RebuiltN007({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,w=overrides.words??[],accent=overrides.accent??'#8554E8';
 const body=w[1]??'在这段创作说明中概括描述整段视频\n的时长和视频的大致内容，或者也可\n以补充一些关于视频的画面风格以及\n画质氛围感的附加信息。';
 const example=(w[2]??'生成一支10秒的产品演示短片： @产品1 放在 @场景1 桌面上，@镜\n头2 推近它的正面，配合着 @音频1 展示。\n整体为产品展示画面，柔和自然光，画质细腻，氛围清晰放松。').split('\n');
 const top=sample(f,cues.cardTop),bottom=sample(f,cues.cardBottom);
 return <AbsoluteFill style={{background:'#fff',fontFamily:'MiSans'}}>
  <div style={{position:'absolute',left:18,top:15,fontSize:78,lineHeight:1,fontWeight:900,color:accent,textShadow:'5px 6px 5px #0005'}}>{w[0]??'二、摘要'}</div>
  <div style={{position:'absolute',left:76,top:266,fontSize:108,lineHeight:'138px',fontWeight:900,color:'#000',whiteSpace:'pre',opacity:sample(f,cues.bodyAlpha),textShadow:'10px 12px 11px #0006'}}>{body}</div>
  {f>=18&&<div style={{position:'absolute',left:63,top,width:1794,height:bottom-top,borderRadius:88,background:'#000',boxShadow:'29px 17px 22px #0005'}}/>}
  {f>=24&&example.map((line,i)=><div key={i} style={{position:'absolute',left:115,top:749+i*76,fontSize:56,lineHeight:1,fontWeight:400,whiteSpace:'nowrap',color:'white'}}>{Array.from(line).map((char,j)=>{const original=cues.exampleLetters[Math.min(i,2)],idx=Math.min(original.length-1,Math.floor(j/Math.max(1,Array.from(line).length-1)*(original.length-1)));return <span key={j} style={{opacity:sample(f,original[idx].alpha)}}>{char}</span>})}</div>)}
 </AbsoluteFill>;
}
