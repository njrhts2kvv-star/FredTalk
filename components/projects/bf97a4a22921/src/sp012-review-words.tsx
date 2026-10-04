import React, {useEffect,useState} from 'react';
import {continueRender,delayRender,useCurrentFrame} from 'remotion';
import motion from './sp012-review-motion.json';
type Ink={x:number;y:number;width:number;height:number};
const words=['生视频','生图','提示词'];
export const SP012Words:React.FC=()=>{
 const f=useCurrentFrame();const [handle]=useState(()=>delayRender('SP012 natural glyph metrics'));const [metrics,setMetrics]=useState<Ink[]>([]);
 useEffect(()=>{document.fonts.load('900 200px MiSans').then(()=>{
  const ctx=document.createElement('canvas').getContext('2d')!;ctx.font='900 200px MiSans';
  setMetrics(words.map(word=>{const b=ctx.measureText(word);return {x:-b.actualBoundingBoxLeft,y:-b.actualBoundingBoxAscent,width:b.actualBoundingBoxLeft+b.actualBoundingBoxRight,height:b.actualBoundingBoxAscent+b.actualBoundingBoxDescent};}));continueRender(handle);
 });},[handle]);
 return <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>{words.map((word,i)=>{
  const bounds=motion[f]?.[i],ink=metrics[i];if(!bounds||!ink)return null;
  const [x,y,w,h]=bounds;const scale=w/ink.width;const top=y+(h-ink.height*scale)/2;
  return <text key={word} fontFamily="MiSans" fontWeight="900" fontSize="200" fill={i===0?'#7c3aed':'#111'} transform={`translate(${x-ink.x*scale} ${top-ink.y*scale}) scale(${scale})`}>{word}</text>;
 })}</svg>;
};
