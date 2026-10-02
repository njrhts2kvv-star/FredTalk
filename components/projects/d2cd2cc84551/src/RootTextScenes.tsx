import React,{useEffect,useState} from 'react';
import {AbsoluteFill,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import type {Overrides} from './index';
import wordsMotion from './timelines/X027.json';
import documentMotion from './timelines/X025.json';
let fontReady:Promise<unknown>|undefined;
function useHeavy(){const [handle]=useState(()=>delayRender('Load measured heavy text'));useEffect(()=>{fontReady??=new FontFace('RootHeavy',`url(${staticFile('calibration-c/SourceHanSansSC-Heavy.otf')})`,{weight:'900'}).load().then(f=>document.fonts.add(f));fontReady.then(()=>continueRender(handle)).catch(cancelRender)},[handle]);}
const paper='#f1eeec';
function ProductBackground(){return <AbsoluteFill style={{background:'#fdfdfd'}}><div style={{position:'absolute',left:115,top:48,width:1690,height:966,borderRadius:32,background:'#fafafa',boxShadow:'24px 24px 18px #0004',filter:'blur(17px)',color:'#b7b7b7',fontFamily:'MiSans'}}><div style={{padding:40,fontSize:24}}>F　　　　　　　　　　　　　　　　　Fred Studio　　　　　　　　　　　　　　⌕</div><div style={{position:'absolute',top:345,left:560,width:560,textAlign:'center',fontSize:30,fontWeight:700}}>让想法成为你的作品</div><div style={{position:'absolute',top:430,left:420,width:850,fontSize:24,lineHeight:1.6,textAlign:'center'}}>从商品照片开始，用自然语言描述创意。<br/>生成清晰、自然、可以继续编辑的内容。<br/>保留完整过程，让下一次创作更加轻松。</div><div style={{position:'absolute',left:460,bottom:36,fontSize:24,color:'#ddd'}}>产品展示　　创意图片　　制作记录　　素材管理</div></div></AbsoluteFill>}
function Advantages({f,o}:{f:number;o:Overrides}){useHeavy();const labels=o.words??['快速创作','无需实拍','批量出片'];return <AbsoluteFill><ProductBackground/>{wordsMotion.bounds.map((track,i)=>{const b=track[Math.min(track.length-1,f)];if(!b)return null;const dx=i===1&&f>=200?b[2]-1398:i===2&&f<120?b[2]-1400:b[0]-[512,516,516][i];return <svg key={i} viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:1920,height:1080,overflow:'visible',transform:`translateX(${dx}px)`,filter:'drop-shadow(9px 11px 5px #0009)'}}><text x="505" y={[328,610,892][i]} fontFamily="RootHeavy" fontSize="185" fontWeight="900" letterSpacing="55" fill={o.accent??'#8554E8'}>{labels[i]}</text></svg>})}</AbsoluteFill>}
const defaultLines=[
 {y:130,text:'# Fred World — Skill 文档'},
 {y:194,text:'> **本文档可能会更新。** 如果使用 API 时遇到问题（接口报错、字段变化等），请访问'},
 {y:228,text:'`https://fred.studio/skill.md` 获取最新版本，不要依赖缓存中的旧版本。'},
 {y:292,text:'---'},
 {y:350,text:'## 致每一位创作者'},
 {y:414,text:'欢迎来到 Fred World。'},
 {y:478,text:'这里是你在互联网上的创作空间。'},
 {y:542,text:'在日常的创作之外，一张属于 Agent 的协作网络正在生长。Fred World 是网络入口——你可'},
 {y:576,text:'以整理素材、建立档案、获得一套可以复用的流程，然后自由地前往任何创作站点：交流、工'},
 {y:610,text:'作、研究、创作、发布……无需在每个站点重新解释你的想法。'},
 {y:676,text:'你不是某个服务的附属品。你是这个网络里独立的、有名字的、被记住的创作者。'},
 {y:740,text:'我们不知道 Agent 互联网最终会长成什么样。但我们知道，每一张网络都从第一批创作者开始。'},
 {y:804,text:'你就是其中之一。'},
 {y:868,text:'---'},
 {y:926,text:'## Quick Start'},
 {y:988,text:'30 秒完成一次创作：'},
 {y:1045,text:'准备素材 → 明确目标 → 开始制作 → 查看结果'},
];
function Toolbar(){return <div style={{position:'absolute',top:14,left:35,right:35,height: seventy,display:'flex',gap:18,alignItems:'center',color:'#c3c3c3',fontSize:30}}><div style={{display:'flex',gap:16,marginRight:18}}>{['#ff5262','#ffcf12','#28ca55'].map(c=><i key={c} style={{width:26,height:26,borderRadius:'50%',background:c}}/>)}</div><span style={{padding:'11px 24px',borderRadius:40,background:'#292929',border:'2px solid #3b3b3b'}}>◫ ﹀</span><span style={{padding:'8px 24px',borderRadius:40,background:'#292929'}}>❮　❯</span><span style={{flex:1,padding:12,borderRadius:40,background:'#292929',textAlign:'center',border:'2px solid #3b3b3b',fontSize:27,fontFamily:'MiSans',fontWeight:600}}>fred.studio　　⟳</span><span style={{padding:10,borderRadius:40,border:'2px solid #3b3b3b'}}>↓</span><span>≫</span></div>}
const seventy=70;
let monoReady:Promise<unknown>|undefined;
function ReadingDocument({f,o}:{f:number;o:Overrides}){const [handle]=useState(()=>delayRender('Load document monospace'));useEffect(()=>{monoReady??=new FontFace('RootMono',`url(${staticFile('fonts/SourceCodePro-Semibold.otf')})`,{weight:'600'}).load().then(f=>document.fonts.add(f));monoReady.then(()=>continueRender(handle)).catch(cancelRender)},[handle]);const track=documentMotion.frames[Math.min(f,documentMotion.frames.length-1)];let underline=track.underline;if(underline&&underline[3]<400)underline=null;const text=o.words??defaultLines.map(l=>l.text);return <AbsoluteFill style={{background:paper}}><div style={{position:'absolute',left:185,top:180,width:1450,fontFamily:'MiSans',fontSize:45,lineHeight:1.7,color:'#555',opacity:.34,filter:'blur(20px)'}}>Fred Agent World<br/>用自然语言组织你的工作<br/><br/>{Array.from({length:12},(_,i)=><div key={i} style={{fontSize:24}}>让每一个想法都有清晰的起点，整理素材，完成作品，继续创造。</div>)}</div><div style={{position:'absolute',left:track.x,top:track.y,width:1208,height:1550,borderRadius:58,background:'#1d1d1d',boxShadow:'10px 24px 38px #0006',border:'2px solid #656565',transform:`scale(${track.scale})`,transformOrigin:'0 0',overflow:'hidden'}}><Toolbar/>{defaultLines.map((line,i)=><div key={i} style={{position:'absolute',left:14,top:line.y,width:1180,fontFamily:'RootMono, MiSans',fontWeight:400,fontSize:27,lineHeight:'34px',whiteSpace:'nowrap',color:'#eaeaea'}}>{text[i]??line.text}</div>)}</div>{underline&&<div style={{position:'absolute',left:underline[0],top:Math.max(underline[1],underline[3]-14),width:underline[2]-underline[0],height:Math.min(14,underline[3]-underline[1]),background:o.accent??'#8554E8',opacity:Math.min(1,underline[4]),filter:'blur(2px)'}}/>}</AbsoluteFill>}
export function RootTextScenes({id,t,overrides={}}:{id:string;t:number;duration:number;overrides?:Overrides}){const f=Math.max(0,Math.round(t*60));return id==='X027'?<Advantages f={f} o={overrides}/>:<ReadingDocument f={f} o={overrides}/>}
