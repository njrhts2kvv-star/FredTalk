import React, {useEffect,useState} from 'react';
import {AbsoluteFill,continueRender,delayRender,interpolate,useCurrentFrame} from 'remotion';
import summaryMotion from './sp023-source-motion.json';
import planningMotion from './sp024-source-motion.json';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
type FontBox={x:number;y:number;width:number;height:number};
const WindowWords:React.FC<{kind:'SP023'|'SP024'}>=({kind})=>{
 const frame=useCurrentFrame();const words=kind==='SP023'?['视频总结','调研搜集','定时任务']:['明确目标','自动规划','主动跟进'];
 const motion=kind==='SP023'?summaryMotion:planningMotion;const row=motion[Math.min(frame,motion.length-1)];
 const [handle]=useState(()=>delayRender('measure MiSans Heavy ink bounds'));const [metrics,setMetrics]=useState<FontBox[]>([]);
 useEffect(()=>{document.fonts.load('900 200px MiSans').then(()=>{
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.style.cssText='position:absolute;top:-5000px;visibility:hidden';document.body.append(svg);
  const boxes=words.map(word=>{const text=document.createElementNS('http://www.w3.org/2000/svg','text');text.textContent=word;text.setAttribute('font-family','MiSans');text.setAttribute('font-size','200');text.setAttribute('font-weight','900');svg.append(text);const ctx=document.createElement('canvas').getContext('2d')!;ctx.font='900 200px MiSans';const b=ctx.measureText(text.textContent!);return {x:-b.actualBoundingBoxLeft,y:-b.actualBoundingBoxAscent,width:b.actualBoundingBoxLeft+b.actualBoundingBoxRight,height:b.actualBoundingBoxAscent+b.actualBoundingBoxDescent};});svg.remove();setMetrics(boxes);continueRender(handle);
 });},[handle,kind]);
 const top=interpolate(frame,[0,6,12,18,24],kind==='SP023'?[-1248,-764,-65,85,107]:[-1280,-1140,-140,107,107],clamp);
 return <AbsoluteFill style={{background:'#fff',fontFamily:'MiSans, sans-serif',overflow:'hidden'}}>
  <div style={{position:'absolute',left:396,top,width:1769,height:1260,borderRadius:38,background:'#202225',overflow:'hidden',boxShadow:'0 18px 30px #0003'}}>
   <div style={{height:115,background:'#131416',display:'flex',alignItems:'center',gap:31,paddingLeft:70}}>{['#ed2491','#ffbd4d','#3984fd'].map(color=><div key={color} style={{width:31,height:31,borderRadius:'50%',background:color}}/>)}</div>
   <svg width="1769" height="1260" style={{position:'absolute',inset:0,overflow:'hidden'}}>{words.map((word,i)=>{
    const native=row.words[i];const font=metrics[i];if(!native.bounds||!font||frame<(kind==='SP023'?[24,60,93]:[20,74,127])[i])return null;
    const stable=kind==='SP023'?[[828,353,900,191],[829,696,902,192],[828,1014,903,193]][i]:[[839,349,873,214],[874,651,846,213],[836,974,876,214]][i];
    const [bx,by,bw,bh]=native.bounds;const [x,y,width,height]=stable;const moving=kind==='SP024'&&frame<([20,74,127][i]+42);const center=moving?by+bh/2:y+height/2;
    const sx=width/font.width,sy=sx,inkTop=center-font.height*sy/2;const blur=kind==='SP024'&&moving?Math.max(0,(bh-height)/12):Math.max(0,(1-native.opacity)*2);
    return <g key={word} opacity={kind==='SP023'?1:native.opacity} style={{filter:`blur(${blur}px)`}}>
     <text fontFamily="MiSans" fontSize="200" fontWeight="900" fill="#fff" transform={`translate(${x-396-font.x*sx} ${inkTop-top-font.y*sy}) scale(${sx} ${sy})`}>{kind==='SP023'?word.split('').map((character,c)=><tspan key={c} opacity={native.characters[c]}>{character}</tspan>):word}</text>
     {kind==='SP024'&&moving&&bh>height+35&&<text fontFamily="MiSans" fontSize="200" fontWeight="900" fill="#fff" opacity=".23" transform={`translate(${x-396-font.x*sx} ${inkTop-top-font.y*sy+Math.min(70,bh-height)}) scale(${sx} ${sy})`}>{word}</text>}
    </g>;
   })}</svg>
  </div>
 </AbsoluteFill>;
};
export const SP023:React.FC=()=> <WindowWords kind="SP023"/>;
export const SP024:React.FC=()=> <WindowWords kind="SP024"/>;
