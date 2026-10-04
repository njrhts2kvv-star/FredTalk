import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../../material-policy';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill, Img, delayRender, continueRender, cancelRender} from 'remotion';
import glyphs from './N030-dot-glyphs.json';
let ready:Promise<unknown>|undefined;
const q=(f:number,a:number,b:number)=>{const p=Math.max(0,Math.min(1,(f-a)/(b-a)));return p*p*(3-2*p)};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
function DotText({text}:{text:string}){let x=0;return <svg width={1070} height={190}>{[...text].map((c,i)=>{const rows=(glyphs as Record<string,string[]>)[c];const at=x;x+=(rows?.[0].length??16)*11+8;return rows?<g key={i} transform={`translate(${at} 0)`}>{rows.flatMap((row,y)=>[...row].map((v,j)=>v==='1'?<rect key={`${j}-${y}`} x={j*11} y={y*11} width={10.1} height={10.1} fill='#080808'/>:null))}</g>:<text key={i} x={at} y={160} fontFamily='SearchPixel' fontSize={176}>{c}</text>})}</svg>}
export function DotSearch({t,accent,words,assets}:{t:number;accent:string;words?:string[];assets?:Record<string,string>}){
 const [handle]=useState(()=>delayRender('Load search pixel font'));useEffect(()=>{ready??=new FontFace('SearchPixel',`url(${staticFile('calibration-c/Unifont.otf')})`).load().then(f=>document.fonts.add(f));ready.then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 const f=t*60,grow=q(f,22,87),move=q(f,155,197),scale=mix(1,400/1414,move),query=words?.[0]??'AI编程';
 const n=f<88?0:f<101?1:f<113?2:f<125?3:query.length;
 const pic=(i:number)=>assets?.[`image${i}`]??staticFile(`group-c/image${i}.jpg`);
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans'}}>
 {f<22?<OffthreadVideo src={assets?.actor??staticFile('group-c/present.webm')} transparent muted style={{position:'absolute',left:430,top:-130,width:1160,height:1160,opacity:1-q(f,0,21)}}/>:null}
 <div style={{position:'absolute',left:mix(960,240,move),top:mix(540,70,move),width:mix(254,1414,grow),height:254,transform:`translate(-50%,-50%) scale(${scale})`,transformOrigin:'center',border:'13px solid #626262',borderRadius:80,background:'#dfdfdf',boxSizing:'border-box',opacity:q(f,4,22),overflow:'hidden'}}>
 <div style={{position:'absolute',left:12,top:12,bottom:12,right:140*grow+13,borderRadius:66,background:'white'}}/>
 <div style={{position:'absolute',left:65,top:23}}><DotText text={query.slice(0,n)}/></div>
 <svg width={116} height={116} viewBox='0 0 116 116' style={{position:'absolute',right:23,top:61,opacity:grow}}><circle cx={47} cy={44} r={36} fill='none' stroke='white' strokeWidth={5}/><path d='M74 74L99 99' stroke='white' strokeWidth={9} strokeLinecap='round'/></svg>
 </div>
 {[0,1].map(i=>{const enter=q(f,i?190:176,i?219:205),scroll=i?420*q(f,244,329):380*q(f,231,316);return <div key={i} style={{position:'absolute',left:i?1170:310,top:mix(1170,150,enter),width:410,height:850,borderRadius:58,background:'#151517',padding:12,boxSizing:'border-box',boxShadow:'8px 9px 14px #0004'}}><div style={{height:'100%',borderRadius:47,background:'white',overflow:'hidden',position:'relative'}}>
 <div style={{height:42,padding:'13px 27px 0',fontSize:13,boxSizing:'border-box'}}>12:34<span style={{float:'right'}}>▴ ▰</span></div><div style={{position:'absolute',top:11,left:132,width:122,height:26,background:'#050505',borderRadius:20}}/>
 <div style={{height:43,padding:'4px 16px',fontSize:16,display:'flex',alignItems:'center',gap:13}}>‹<div style={{height:33,background:'#f2f2f2',borderRadius:17,flex:1,padding:'6px 14px',boxSizing:'border-box',fontSize:14}}>⌕ AI 编程</div><span>搜索</span></div>
 <div style={{height:36,display:'flex',justifyContent:'space-around',fontSize:14,alignItems:'center',borderBottom:'1px solid #eee'}}>{['综合','视频','用户','直播'].map((w,j)=><span key={w} style={{fontWeight:j===1?650:400,color:j===1?accent:'#555'}}>{w}</span>)}</div>
 <div style={{position:'absolute',top:122,bottom:32,left:0,right:0,overflow:'hidden'}}><div style={{transform:`translateY(${-scroll}px)`,padding:9,display:i?'grid':'block',gridTemplateColumns:'1fr 1fr',gap:9}}>{Array.from({length:10},(_,j)=>i?<div key={j} style={{marginBottom:11}}><Img src={pic(1+j%4)} style={{width:'100%',height:190+(j%3)*37,objectFit:'cover',borderRadius:8}}/><div style={{fontSize:13,lineHeight:'20px',marginTop:5}}>{['用 AI 写出自己的第一个应用','一个想法，变成可运行的工具','如何让 Agent 理解你的需求'][j%3]}</div><div style={{fontSize:10,color:'#888',marginTop:5}}>FredTalk　　♡ {120+j*37}</div></div>:<div key={j} style={{marginBottom:19}}><div style={{height:185,position:'relative',overflow:'hidden',borderRadius:9}}><Img src={pic(1+j%4)} style={{width:'100%',height:'100%',objectFit:'cover'}}/><span style={{position:'absolute',bottom:8,right:9,fontSize:12,color:'white'}}>03:{12+j}</span></div><div style={{fontSize:16,lineHeight:'23px',paddingTop:5}}>{['AI 编程从需求到交付','让工具理解你的创作流程','制作自己的效率应用'][j%3]}</div><div style={{fontSize:11,color:'#777',marginTop:6}}>FredTalk · {2026} 年 9 月</div></div>)}</div></div>
 <div style={{position:'absolute',bottom:9,left:130,width:126,height:5,borderRadius:4,background:'#111'}}/></div></div>})}
 </AbsoluteFill>;
}
