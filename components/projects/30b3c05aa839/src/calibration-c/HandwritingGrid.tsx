import {approvedStaticFile as staticFile} from '../../material-policy';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill, delayRender, continueRender, cancelRender} from 'remotion';
import motion from './X039-motion.json';
const fontReady=()=>{const face=new FontFace('FredHandwriting',`url(${staticFile('calibration-c/MuYaoHandwriting.ttf')})`,{weight:'400'});return face.load().then(font=>{document.fonts.add(font)})};
let fontPromise:Promise<unknown>|undefined;
export function HandwritingGrid({t,words,accent}:{t:number;words?:string[];accent:string}){
 const [handle]=useState(()=>delayRender('Load independent handwriting font'));
 useEffect(()=>{(fontPromise??=fontReady()).then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 const f=Math.max(0,Math.min(479,Math.round(t*60))),boxes=motion[f];
 // This is an explicit real-font candidate; source family is still unresolved.
 const labels=['奇幻治愈','细腻手绘','暖柔色调','生活刻画'];
 const baseWidths=[626,644,622,628],sizes=[176.7,186,184.4,160],spacing=[-9.7,-24,-27.85,15],inkLeft=[28.5,11.4,21.5,35.6];
 return <AbsoluteFill style={{background:'white'}}>
  <div style={{position:'absolute',left:296,top:80,width:1324,height:940,borderRadius:30,overflow:'hidden',background:'#202124',boxShadow:'10px 12px 18px #0006'}}>
   <div style={{height:82,background:'#101617',display:'flex',gap:17,paddingLeft:50,paddingTop:29,boxSizing:'border-box'}}>{[accent,'#b9b9b9','#747474'].map((color,i)=><i key={i} style={{width:23,height:23,borderRadius:'50%',background:color}}/>)}</div>
  </div>
  {boxes.map(([x,y,w,_h,alpha],i)=>{const scale=w/baseWidths[i];return <div key={i} style={{position:'absolute',left:x-inkLeft[i]*scale,top:y+[1.6,-7.1,.6,.6][i]*scale,fontFamily:'FredHandwriting',fontWeight:400,fontSize:sizes[i],letterSpacing:spacing[i],lineHeight:1,whiteSpace:'nowrap',color:'white',opacity:alpha,transform:`scale(${scale})`,transformOrigin:'0 0',textShadow:'4px 7px 7px #000b'}}>{words?.[i]??labels[i]}</div>})}
 </AbsoluteFill>
}
