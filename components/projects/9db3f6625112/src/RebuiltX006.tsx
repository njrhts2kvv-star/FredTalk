import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';
import type {Overrides} from './index';
import cues from './timelines/X006.json';
const sample=(f:number,p:number[][])=>interpolate(f,p.map(v=>v[0]),p.map(v=>v[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const fade=(f:number,a:number,b:number)=>Math.max(0,Math.min(1,(f-a)/(b-a)));
function WorkflowBackdrop({f,accent}:{f:number;accent:string}){
 const focus=1-fade(f,159,179);
 return <AbsoluteFill style={{background:'#19191c',overflow:'hidden',filter:`blur(${12*focus}px)`,transform:`scale(${1+.12*focus})`,transformOrigin:'45% 47%'}}>
  <div style={{height:62,background:'#242429',color:'#aaa',fontSize:22,padding:'20px 55px'}}>Fred · 视频工作流 <span style={{float:'right',color:accent}}>保存　运行　预览</span></div>
  <div style={{position:'absolute',left:170,top:125,width:470,height:365,background:'#25252b',borderRadius:10,padding:30,color:'#999',fontSize:24,lineHeight:1.9}}>项目说明<br/>视频内容与目标<br/>输入参考与场景<br/>镜头与素材关系<br/>输出视频设置</div>
  <div style={{position:'absolute',left:160,top:530,width:1520,height:470,background:'#29262f',border:'3px solid #625578',borderRadius:12}}/>
  <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>{Array.from({length:12},(_,i)=><path key={i} d={`M ${240+i%4*290} ${640+Math.floor(i/4)*95} C ${580+i%3*170} ${400+i*27}, ${680+i%3*180} ${830-i*12}, ${1100+i%3*150} ${590+i*29}`} fill="none" stroke={i%3===0?accent:'#85838d'} strokeWidth={3}/>)}</svg>
  {Array.from({length:12},(_,i)=><div key={i} style={{position:'absolute',left:220+i%4*300,top:590+Math.floor(i/4)*120,width:230,height:93,background:i%4===2?'#544567':'#34343a',border:'2px solid #6b6974',borderRadius:10,padding:12,color:'#b6b4bd',fontSize:18}}> {['输入文字','参考图片','画面生成','视频输出'][i%4]}<div style={{marginTop:10,height:16,background:'#242429'}}/></div>)}
  <div style={{position:'absolute',left:1360,top:786,width:270,height:190,background:'#ddd',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,color:'#333'}}>Fred 预览</div>
 </AbsoluteFill>;
}
export function RebuiltX006({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,accent=overrides.accent??'#8554E8',labels=overrides.words??['文生视频','图生视频','参考图生视频'];
 const curves=cues.curves as Record<string,number[][]>;
 return <AbsoluteFill style={{background:'#19191c',fontFamily:'MiSans',fontWeight:900}}>
  <WorkflowBackdrop f={f} accent={accent}/>
  {labels.slice(0,3).map((label,i)=><React.Fragment key={i}>
   <div style={{position:'absolute',left:225,top:208+i*246,fontSize:184,lineHeight:1,color:accent,textShadow:'8px 8px 6px #000',opacity:sample(f,curves[`number${i}`])}}>{i+1}、</div>
   <div style={{position:'absolute',left:[711,711,534][i],top:204+i*246,fontSize:177,lineHeight:1,letterSpacing:-1,whiteSpace:'nowrap',color:'#fff',textShadow:'8px 8px 6px #000'}}>{Array.from(label).map((c,j)=>{const count=i===2?6:4,idx=Math.min(count-1,Math.floor(j/Array.from(label).length*count));return <span key={j} style={{opacity:sample(f,curves[`row${i}char${idx}`])}}>{c}</span>})}</div>
  </React.Fragment>)}
 </AbsoluteFill>;
}
