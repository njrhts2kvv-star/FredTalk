// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import {SmoothLoopVideo} from './SmoothLoopVideo';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,OffthreadVideo,Loop,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import data from '../../../specs/B066.json';
import {measured,type ClipSpec} from '../../../runtime/clip-spec';
export function RebuiltB066({frame,proof=false}:{frame:number;proof?:boolean}){
 const spec=data as unknown as ClipSpec;const card=data.objects.cards;const font=data.fonts[0];const [handle]=useState(()=>delayRender('B066 document font'));
 useEffect(()=>{new FontFace(font.family,`url(${staticFile(font.file)})`,{weight:font.weight}).load().then(f=>{document.fonts.add(f);continueRender(handle)}).catch(cancelRender)},[handle,font]);
 const first=measured(spec,'trackX',frame)[0];
 // R3：原版把聚光压暗做成整屏渐变（两侧白底被压成灰渐变）。改为同一条实测渐变只压在竖卡上（每张卡内按全屏坐标对齐），白底保持纯白，逐卡亮起的位置、曲线不变。
 const shadeBg=(alphas:number[])=>`linear-gradient(to right,${alphas.map((alpha,i)=>`rgba(0,0,0,${alpha}) ${i*data.objects.shade.step}px`).join(',')})`;const camera=measured(spec,'camera',frame);const shade=measured(spec,'shade',frame);
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>{data.content.media.map((src,i)=><div key={i} style={{position:'absolute',left:first+card.pitch*i,top:card.top,width:card.width,height:card.height,borderRadius:card.radius,overflow:'hidden',boxShadow:card.shadow,background:'#fff'/* R3：浅紫卡底 #f6f3fa → 白 */}}><div style={{position:'absolute',inset:0,transform:`scale(${camera[i]})`,transformOrigin:proof?'50% 50%':card.fredOrigins[i]}}>{proof||i!==3?proof?<Img src={staticFile(card.proofFiles[i])} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<SmoothLoopVideo src={staticFile(src.replace(/\.jpg$/,'.mp4'))} frame={frame} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{padding:'64px 38px',fontFamily:font.family,fontWeight:400,fontSynthesis:'none'}}>{/* R3：删眉题“FRED / 示例记录”(25px 紫)；标题 44→72px，三行 31→44px */}<div style={{fontSize:72,lineHeight:1.2,color:'#17131d'}}>{data.content.reviewUI.heading}</div>{data.content.reviewUI.lines.map((line,j)=><div key={j} style={{fontSize:44,lineHeight:1.4,marginTop:j?44:64,paddingBottom:40,borderBottom:'2px solid #e4e4e8',color:'#3e3648',whiteSpace:'nowrap'}}>{line}</div>)}</div>}</div><div style={{position:'absolute',top:-card.top,left:-(first+card.pitch*i),width:1920,height:1080,background:shadeBg(shade)}}/></div>)}{proof&&<div style={{position:'absolute',top:1024,left:0,width:'100%',textAlign:'center',fontSize:34,fontFamily:font.family,color:'#111',opacity:measured(spec,'label',frame)[0]}}>苹果</div>/* R3：删卡下英文小标签“Mic Pro”（34px，原版约 11.1–12.4s 出现） */}</AbsoluteFill>
}
