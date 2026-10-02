import React,{useEffect,useState} from 'react';
import {AbsoluteFill,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import motion from './N049-motion.json';
let ready:Promise<unknown>|undefined;
function load(){const face=new FontFace('AskAiHeavy',`url(${staticFile('calibration-c/SourceHanSansSC-Heavy.otf')})`,{weight:'900'});return face.load().then(f=>document.fonts.add(f));}
const suggestions=[['资讯：创作工具与 AI 工作流的最新进展','想了解如何用 AI 优化日常工作流程，请提供思路','让创作更简单的方法有哪些？'],['整理今天的创作灵感和参考素材','资讯：独立创作者如何建立自己的素材库','用通俗语言解释视频制作流程'],['教我用动画做无缝变装转场特效','给出改善工作效率的日常方法','资讯：从脚本到成片的自动化创作流程']];
function Home({accent}:{accent:string}){return <div style={{position:'relative',width:1728,height:966,background:'#fcfcfc',borderRadius:48,boxShadow:'10px 14px 12px #0005',overflow:'hidden',fontFamily:'MiSans',fontWeight:400,color:'#171719'}}>
 <div style={{height:34,borderBottom:'1px solid #e9e9e9',textAlign:'right',paddingRight:18,color:'#aaa',fontSize:17}}>−　□　×</div>
 <div style={{position:'absolute',top:47,left:20,fontSize:23}}>◧　▧</div><div style={{position:'absolute',top:47,left:0,width:'100%',textAlign:'center',fontSize:14}}>新对话<div style={{fontSize:11,color:'#ccc',marginTop:5}}>内容由 AI 生成，请仔细甄别</div></div><div style={{position:'absolute',right:20,top:48,fontSize:20}}>♧　▢</div>
 <div style={{position:'absolute',top:333,width:'100%',textAlign:'center',fontSize:28,fontWeight:800}}>有什么我能帮你的吗？</div>
 <div style={{position:'absolute',top:401,width:'100%',display:'grid',gap:8}}>{suggestions.map((row,i)=><div key={i} style={{display:'flex',justifyContent:'center',gap:8}}>{row.map(s=><div key={s} style={{padding:'11px 16px',borderRadius:12,background:'#f2f2f2',fontSize:15,whiteSpace:'nowrap'}}>{s}</div>)}</div>)}</div>
 <div style={{position:'absolute',bottom:16,left:464,width:800,height:98,borderRadius:25,background:'white',boxShadow:'0 3px 20px #0001',padding:'15px 20px',boxSizing:'border-box'}}><div style={{fontSize:17,color:'#bcbcbc'}}>发消息或输入“/”选择技能</div><div style={{display:'flex',justifyContent:'space-between',fontSize:15,marginTop:24}}>{['＋','◌ 专家 ›','◷ 数据分析','▤ 帮我写作','▣ 视频生成','▧ 图像生成','‹/› 编程','⊞ 更多','♩'].map((x,i)=><span key={x} style={{color:i===1?accent:undefined}}>{x}</span>)}</div></div>
 </div>}
export function AskAiHomepage({t,words,accent}:{t:number;words?:string[];accent:string}){
 const [handle]=useState(()=>delayRender('Load measured Source Han Heavy'));useEffect(()=>{(ready??=load()).then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 const f=Math.max(0,Math.min(167,Math.round(t*60))),m=motion[f];
 return <AbsoluteFill style={{background:'white'}}>
 {m.chatBottom>0&&<div style={{position:'absolute',left:246,top:m.chatBottom-790,width:1290,height:790,borderRadius:26,background:'#f6f6f6',boxShadow:'8px 10px 15px #0004',padding:40,boxSizing:'border-box',fontFamily:'MiSans',fontWeight:400}}><div style={{marginTop:555,fontSize:23,lineHeight:1.8}}>创作素材已整理完成，可以开始制作下一段动画。<div style={{marginTop:25,border:'1px solid #ddd',borderRadius:18,padding:20,color:'#888'}}>继续提问…</div></div></div>}
 {[0,1].map(i=><svg key={i} style={{position:'absolute',left:0,top:m.wordsY[i],width:1920,height:230,overflow:'visible'}}><defs><filter id={`ask-shadow-${i}`} x='-30%' y='-30%' width='180%' height='180%'><feDropShadow dx='9' dy='10' stdDeviation='5' floodOpacity='.5'/></filter></defs><g fontFamily='AskAiHeavy' fontWeight={900} fontSize={199} fill={i?accent:'#171719'} filter={`url(#ask-shadow-${i})`}>{(words?.[i]?Array.from(words[i]):i?['找','A','I']:['有','问','题']).map((c,j)=><text key={j} x={(i?[1150,1403,1610]:[173,416,645])[j]??(i?1150:173)+j*238} y={171}>{c}</text>)}</g></svg>)}
 <div style={{position:'absolute',left:m.pageX,top:60}}><Home accent={accent}/></div>
 </AbsoluteFill>;
}
