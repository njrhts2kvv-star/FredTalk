import React from 'react';
import {AbsoluteFill,Freeze,OffthreadVideo,Sequence,interpolate,staticFile} from 'remotion';
import type {Overrides} from './index';
import cues from './timelines/N032.json';
const v=(f:number,p:number[][],c=1)=>interpolate(f,p.map(r=>r[0]),p.map(r=>r[c]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export function RebuiltN032({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,accent=overrides.accent??'#8554E8',aq=cues.answer,qq=cues.question;
 const qx=f<8?v(f,[[0,640],[3,700],[5,678],[8,641]]):f>81?v(f,[[81,1141],[83,1460]]):v(f,qq),qy=360;
 const qWidth=f<8?v(f,[[0,140],[2,180],[4,209],[8,220]]):f<70?220:f<77?v(f,[[70,210],[72,192],[74,168],[75,145],[76,111],[77,35]]):v(f,[[77,35],[78,8],[79,95],[80,139],[81,180],[83,216]]);
 const aScale=v(f,aq,4)/142,ax=v(f,aq),answerWidth=f<75?v(f,[[70,0],[71,8],[72,40],[73,80],[74,146],[75,238]]):260*aScale;
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans'}}>
 {f<10&&<div style={{position:'absolute',left:165,top:467,fontSize:147,fontWeight:900,letterSpacing:-1.1,color:accent,whiteSpace:'nowrap'}}>{Array.from('8G显存笔记本+量化模型').map((c,i)=><span key={i} style={{opacity:v(f,[[0,[1,1,1,0,0,0,0,.15,.55,.12,.6,.3][i]],[5,i<3?1:0],[9,0]]),filter:`blur(${v(f,[[0,i<3?0:3],[5,4],[9,12]])}px)`}}>{c}</span>)}</div>}
 {f>=69&&<Sequence from={138}><div style={{position:'absolute',left:v(f,[[69,1740],[72,1530],[75,1160],[78,905],[81,785],[85,740],[90,710]])+(overrides.actorFraming?.x??0),top:-150+(overrides.actorFraming?.y??0),width:1370*(overrides.actorFraming?.scale??1),height:1370*(overrides.actorFraming?.scale??1),filter:'drop-shadow(15px 12px 10px #0004)'}}><Freeze frame={Math.min(120,Math.max(0,Math.round((f-69)*2)))}><OffthreadVideo muted transparent startFrom={115} src={staticFile(overrides.assets?.actor??'group-a/actor-show.webm')} style={{width:'100%',height:'100%',objectFit:'contain',transform:'scaleX(-1)'}}/></Freeze></div></Sequence>}
 {f<83&&<div style={{position:'absolute',left:(qx-qWidth/2)*1.5,top:(qy-110)*1.5,width:qWidth*1.5,height:330,borderRadius:'50%',background:'black',boxShadow:'30px 15px 18px #0005',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{fontFamily:'SourceSans3, MiSans',fontSize:210*(f<8?1:v(f,qq,4)/95),fontWeight:900,color:accent,lineHeight:1,transform:`scaleX(${qWidth/220})`,opacity:v(f,[[0,0],[2,0],[4,.8],[7,1]])}}>?</div></div>}
 {f>=70&&<div style={{position:'absolute',left:(ax-answerWidth/2)*1.5,top:(360-130*aScale)*1.5,width:answerWidth*1.5,height:390*aScale,borderRadius:'50%',background:'black',boxShadow:'30px 15px 18px #0005',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}><div style={{fontSize:226*aScale,fontWeight:900,lineHeight:1,color:accent,transform:`scaleX(${Math.min(1,answerWidth/(260*aScale))})`,whiteSpace:'nowrap'}}>{overrides.words?.[1]??'能'}</div></div>}
 </AbsoluteFill>;
}
