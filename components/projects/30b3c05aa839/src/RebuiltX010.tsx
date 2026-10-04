import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';
import type {Overrides} from './index';
import cues from './timelines/X010.json';
const value=(f:number,p:number[][],col=1)=>interpolate(f,p.map(v=>v[0]),p.map(v=>v[col]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export function RebuiltX010({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,w=overrides.words??[],accent=overrides.accent??'#8554E8';
 const body=w[1]??'在这段创作说明中明确写清楚哪些\n内容不能变，以及防止画面崩坏、\n穿模、画面闪烁的控制词。';
 const lines=(w[2]??'@产品1 出现在镜头1、镜头2：完全保留 - 外形、材质、黑色机身与\n@图1 完全一致，不得改变。\n@产品2 出现在镜头2：部分保留 - 保留比例和尺寸，去掉多余标记。\n@场景1 出现在镜头1、镜头2：完全保留 - 桌面颜色、材质、空间布\n局不变。\n@音频1：完整使用 - 整段音频连续播放，镜头和动作节奏\n跟随音频。').split('\n');
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans'}}>
  <div style={{position:'absolute',left:18,top:15,fontSize:78,fontWeight:900,lineHeight:1,color:accent,textShadow:'5px 6px 5px #0005'}}>{w[0]??'三、约束'}</div>
  <div style={{position:'absolute',left:76,top:266,fontSize:108,fontWeight:900,lineHeight:'138px',whiteSpace:'pre',color:'#000',textShadow:'10px 12px 11px #0006',opacity:value(f,cues.bodyAlpha)}}>{body}</div>
  {f>=29&&<div style={{position:'absolute',left:value(f,cues.shell,1),top:value(f,cues.shell,2),width:value(f,cues.shell,3),height:f<35?Math.max(590,value(f,cues.shell,4)):value(f,cues.shell,4),borderRadius:88,background:'black',boxShadow:'29px 17px 22px #0005'}}/>}
  {f>=39&&lines.map((line,i)=><div key={i} style={{position:'absolute',left:114,top:264+i*82,fontSize:56,fontWeight:400,lineHeight:1,whiteSpace:'nowrap',color:'white'}}>{Array.from(line).map((c,j)=>{const source=cues.letters[Math.min(i,6)],idx=Math.min(source.length-1,Math.floor(j/Math.max(1,Array.from(line).length-1)*(source.length-1)));return <span key={j} style={{opacity:value(f,source[idx])}}>{c}</span>})}</div>)}
 </AbsoluteFill>;
}
