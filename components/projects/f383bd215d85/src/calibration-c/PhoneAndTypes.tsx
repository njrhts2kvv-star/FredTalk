import React from 'react';
import {AbsoluteFill,Img,staticFile,interpolate} from 'remotion';
import motion from './X032-motion.json';
const sample=(f:number,k:number)=>{const at=Math.max(0,Math.min(134,f)),a=Math.floor(at),b=Math.min(134,a+1);return motion[a][k]+(motion[b][k]-motion[a][k])*(at-a)};
export function PhoneAndTypes({t,words,accent,wallpaper}:{t:number;words?:string[];accent:string;wallpaper?:string}){
 const f=t*30,x=sample(f,3),y=sample(f,4),width=sample(f,5),scale=width/498;
 const tool=interpolate(f,[120,134],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'white'}}>
  <div style={{position:'absolute',inset:0,clipPath:'inset(0 0 0 720px)'}}>
   {[words?.[0]??'指定分镜',words?.[1]??'现有素材'].map((word,i)=><div key={i} style={{position:'absolute',left:sample(f,i?2:0)-7,top:(i?618:sample(f,1))-(i?5:2),fontFamily:'MiSans',fontSize:169,fontWeight:900,lineHeight:1,whiteSpace:'nowrap',color:'#050505',visibility:f<(i?73:8)?'hidden':'visible',textShadow:'7px 10px 10px #0005'}}>{word}</div>)}
  </div>
  <div style={{position:'absolute',left:x,top:y,width:498,height:1016,transform:`scale(${scale})`,transformOrigin:'top left',borderRadius:86,background:'#151517',boxShadow:'13px 16px 19px #0005, inset 0 0 0 3px #777',padding:15,boxSizing:'border-box'}}>
   <div style={{position:'absolute',left:-3,top:180,width:5,height:54,background:'#444',borderRadius:3}}/><div style={{position:'absolute',left:-3,top:270,width:5,height:80,background:'#444',borderRadius:3}}/><div style={{position:'absolute',right:-3,top:252,width:5,height:115,background:'#444',borderRadius:3}}/>
   <div style={{position:'relative',width:468,height:986,borderRadius:72,overflow:'hidden',background:'#f5f5f5'}}>
    <div style={{height:53,background:'#eee',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 27px',fontSize:18,fontWeight:600}}><span>12:59</span><span style={{fontSize:15}}>▴ ▰</span></div>
    <div style={{position:'absolute',left:150,top:10,width:160,height:33,borderRadius:20,background:'#050505'}}><i style={{position:'absolute',right:12,top:10,width:12,height:12,borderRadius:8,background:'#182033'}}/></div>
    <div style={{height:49,background:'#eee',display:'flex',justifyContent:'center',alignItems:'center',fontSize:19,fontWeight:600}}><span style={{position:'absolute',left:20,fontSize:34,fontWeight:400}}>‹</span>Fred 创作助手<span style={{position:'absolute',right:18,fontSize:26}}>···</span></div>
    <div style={{position:'absolute',left:0,right:0,top:102,bottom:69+tool*165,overflow:'hidden',background:'#202425'}}>
     <Img src={wallpaper??staticFile('group-c/image2.jpg')} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.72,filter:'grayscale(1)'}}/>
    </div>
    <div style={{position:'absolute',left:0,right:0,bottom:30+tool*165,height:39,background:'#eee',display:'flex',gap:8,alignItems:'center',padding:'0 13px',fontSize:25}}><span style={{fontSize:22}}>◎</span><div style={{height:29,flex:1,background:'white',borderRadius:6}}/><span>☺</span><span style={{border:'1px solid #777',width:23,height:23,borderRadius:20,fontSize:21,lineHeight:'21px',textAlign:'center'}}>+</span></div>
    <div style={{position:'absolute',left:0,right:0,bottom:30,height:165*tool,overflow:'hidden',background:'#efefef',display:'flex',justifyContent:'space-around',paddingTop:18,boxSizing:'border-box'}}>{['照片','拍摄','语音','文件'].map((label,i)=><div key={label} style={{fontSize:16,textAlign:'center',color:'#777'}}><div style={{background:'white',width:68,height:68,borderRadius:15,display:'grid',placeItems:'center',marginBottom:9}}><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={i===0?accent:'#555'} strokeWidth="2"><rect x="3" y="4" width="22" height="20" rx="3"/><path d={i===0?'M5 20L11 13L16 18L20 12L24 18':i===1?'M10 11H18V18H10Z':i===2?'M14 7V20M9 10V18M19 10V18':'M8 10H20M8 14H20M8 18H17'}/></svg></div>{label}</div>)}</div>
    <div style={{position:'absolute',bottom:12,left:160,width:148,height:5,borderRadius:5,background:'#161616'}}/>
   </div>
  </div>
 </AbsoluteFill>
}
