import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';
import type {Overrides} from './index';
import cues from './timelines/X008.json';
const val=(f:number,p:number[][],col=1)=>interpolate(f,p.map(v=>v[0]),p.map(v=>v[col]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const ramp=(f:number,a:number,b:number)=>Math.max(0,Math.min(1,(f-a)/(b-a)));
export function RebuiltX008({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,accent=overrides.accent??'#8554E8',w=overrides.words??[],curves=cues.curves as Record<string,number[][]>;
 const firstScale=val(f,cues.firstText,4)/159,font=171*firstScale;
 const shell=(track:number[][],z:number,offsetY=0)=>{const x=val(f,track,1),y=val(f,track,2),width=val(f,track,3),height=val(f,track,4);return <div style={{position:'absolute',left:x,top:y+offsetY,width,height,borderRadius:Math.abs(width-height)<2?height/2:val(f,track,5),background:'black',boxShadow:'30px 18px 22px #0005',zIndex:z}}/>;};
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans'}}>
  {f<40&&<AbsoluteFill style={{opacity:1-ramp(f,20,39),background:'#fbfbfd',padding:70}}><div style={{fontSize:42,fontWeight:900}}>Fred 创作工作台</div><div style={{marginTop:30,height:280,border:'2px solid #ddd',borderRadius:24,padding:40,fontSize:32}}>输入创作想法，添加图片与视频参考<div style={{marginTop:45,height:80,background:'#ece7f8',borderRadius:15}}/></div><div style={{display:'flex',gap:25,marginTop:45}}>{['参考素材','视频案例','创作记录','镜头方案'].map((s,i)=><div key={s} style={{flex:1,height:330,background:i%2?'#e1dbe9':'#e5e5e8',borderRadius:20,padding:25,fontSize:30}}>{s}</div>)}</div><div style={{position:'absolute',left:80,top:-ramp(f,0,15)*1100,width:1650,height:1020,background:'white',borderRadius:35,boxShadow:'20px 20px 20px #0004',padding:70,fontSize:30}}>Fred 视频创作说明<div style={{fontSize:23,lineHeight:2.7,marginTop:50,color:'#555'}}>参考资料与素材说明<br/>镜头关系和运动次序<br/>字体变化与画面交接<br/>可替换文字与视频素材</div></div></AbsoluteFill>}
  {f>=41&&f<281&&shell(cues.firstShell,2,40*ramp(f,275,281))}
  {f>=205&&shell(cues.secondShell,f>=276?3:1)}
  {f>=70&&<div style={{position:'absolute',left:val(f,cues.firstText,1)-7*firstScale,top:val(f,cues.firstText,2)-font*.026,fontSize:font,fontWeight:900,lineHeight:1,letterSpacing:-5.8*firstScale,whiteSpace:'nowrap',color:accent,zIndex:4}}>{Array.from(w[0]??'提示词怎么写').map((c,j,chars)=>{const k=Math.min(5,Math.floor(j/chars.length*6));return <span key={j} style={{opacity:val(f,curves[`firstIn${k}`])*val(f,curves[`firstOut${k}`])}}>{c}</span>})}</div>}
  {f>=232&&<div style={{position:'absolute',left:373,top:369,fontSize:172,fontWeight:900,lineHeight:1,letterSpacing:-6.5,whiteSpace:'nowrap',color:accent,zIndex:4}}>{Array.from(w[1]??'模型的基础能力').map((c,j,chars)=>{const k=Math.min(6,Math.floor(j/chars.length*7));return <span key={j} style={{opacity:val(f,curves[`second${k}`])}}>{c}</span>})}</div>}
 </AbsoluteFill>;
}
