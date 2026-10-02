import React,{useEffect,useState} from 'react';
import {AbsoluteFill,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import data from '../../../specs/B065.json';
import {measured,type ClipSpec} from '../../../runtime/clip-spec';
export function RebuiltB065({frame,proof=false}:{frame:number;proof?:boolean}){
 const spec=data as unknown as ClipSpec;const font=data.fonts[0];const [handle]=useState(()=>delayRender('B065 same-glyph font'));
 useEffect(()=>{const f=new FontFace(font.family,`url(${staticFile(font.file)})`,{weight:'400'});f.load().then(face=>{document.fonts.add(face);continueRender(handle)}).catch(cancelRender)},[handle,font.family,font.file]);
 const words=proof?data.content.referenceText:data.content.text;const opacity=measured(spec,'textOpacity',frame);const [x,y,w,h]=measured(spec,'circle',frame);const window=data.objects.window;
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
  <div style={{position:'absolute',left:window.bounds[0],top:window.bounds[1],width:window.bounds[2],height:window.bounds[3],borderRadius:window.radius,background:window.background,boxShadow:window.shadow,overflow:'hidden'}}><div style={{height:window.headerHeight,background:window.headerBackground}}/>{['#e43390','#ffc15a','#4388ff'].map((color,i)=><div key={color} style={{position:'absolute',left:52+i*46,top:35,width:24,height:24,borderRadius:'50%',background:color}}/>)}</div>
  {data.objects.labels.map((label,i)=><div key={i} style={{position:'absolute',left:label.centerX-500,top:label.top,width:1000,fontFamily:font.family,fontSize:label.fontSize,letterSpacing:label.letterSpacing,lineHeight:1,fontWeight:400,fontSynthesis:'none',color:'#fff',whiteSpace:'nowrap',textAlign:'center',opacity:opacity[i],textShadow:'4px 6px 6px #0007'}}>{words[[0,1,3,4][i]]}</div>)}
  {w>0&&h>0&&<div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:'50%',background:proof?'#ef6932':data.content.accent,opacity:opacity[0]}}><svg viewBox="0 0 180 180" width="100%" height="100%"><g fill="none" stroke={data.objects.inequality.ink} strokeWidth={data.objects.inequality.strokeWidth} strokeLinecap="round"><path d="M 43 72 L 134 72 M 43 106 L 134 106 M 111 45 L 69 134"/></g></svg></div>}
 </AbsoluteFill>
}
