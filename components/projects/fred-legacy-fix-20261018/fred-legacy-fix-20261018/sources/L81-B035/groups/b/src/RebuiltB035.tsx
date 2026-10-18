// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import {InterfaceB035,NavB035,CanvasB035} from './InterfacesB035';
import React,{useState,useEffect} from 'react';import {AbsoluteFill,Img,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import data from '../../../specs/B035.json';import {measured,type ClipSpec} from '../../../runtime/clip-spec';
// R2 返修：手机屏内自绘假界面 → Fred 第 123 期豆包 Personal Agent 真实手机截图（拼接长图，滚动轨迹不变）；背景假桌面 → Codex 桌面真实截图
const R2_SCREENS=['fred-r2/b035-phone0.jpg','fred-r2/b035-phone1.jpg','fred-r2/b035-phone2.jpg','fred-r2/b035-phone3.jpg'];
const R2_DESKTOP='fred-r2/b035-desktop.png';
export function RebuiltB035({frame,proof=false}:{frame:number;proof?:boolean}){
 const spec=data as unknown as ClipSpec;const phones=data.objects.phones;const canvas=data.objects.canvas;const font=data.fonts[0];const [handle]=useState(()=>delayRender('B035 Fred UI font'));useEffect(()=>{new FontFace(font.family,`url(${staticFile(font.file)})`,{weight:font.weight}).load().then(f=>{document.fonts.add(f);continueRender(handle)}).catch(cancelRender)},[handle,font]);
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
 <div style={{position:'absolute',left:canvas.bounds[0],top:canvas.bounds[1],width:canvas.bounds[2],height:canvas.bounds[3],filter:`blur(${measured(spec,'canvasBlur',frame)[0]}px)`}}>{proof?<Img src={staticFile(canvas.proofFile)} style={{width:'100%',height:'100%'}}/>:<div style={{position:'absolute',inset:0,borderRadius:25,overflow:'hidden',boxShadow:'0 0 14px #777',background:'#fff'}}><Img src={staticFile(R2_DESKTOP)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top left'}}/></div>}</div>
 {data.content.media.map((src,i)=>{const [x,y,w,h]=measured(spec,`phone${i}`,frame);const scroll=measured(spec,`content${i}`,frame)[0];return <div key={i} style={{position:'absolute',left:x,top:y,width:w,height:h,background:phones.fill,borderRadius:phones.radius,boxShadow:phones.shadow,overflow:'hidden'}}>{proof?<Img src={staticFile(phones.proofFiles[i])} style={{width:'100%',height:'100%'}}/>:<div style={{position:'absolute',inset:phones.inset,borderRadius:phones.innerRadius,overflow:'hidden',background:'#fff'}}><div style={{position:'absolute',top:scroll,left:0,width:'100%'}}><Img src={staticFile(R2_SCREENS[i])} style={{width:'100%',display:'block'}}/></div></div>}</div>})}
 </AbsoluteFill>
}
