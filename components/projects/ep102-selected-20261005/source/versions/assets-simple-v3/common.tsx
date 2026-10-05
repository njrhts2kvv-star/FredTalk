import React,{useEffect,useState,CSSProperties} from 'react';
import {AbsoluteFill,Img,OffthreadVideo,staticFile,delayRender,continueRender,cancelRender,interpolate} from 'remotion';
import assets from './assets.json';
export const asset=(id:string)=>staticFile((assets as Record<string,{src:string}>)[id].src);
export const progress=(f:number,a:number,b:number)=>{const q=Math.max(0,Math.min(1,(f-a)/(b-a)));return q*q*(3-2*q)};
export const mix=(a:number,b:number,q:number)=>a+(b-a)*q;
export const track=(f:number,keys:number[][])=>interpolate(f,keys.map(k=>k[0]),keys.map(k=>k[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const rect=(x:number,y:number,w:number,h:number):CSSProperties=>({position:'absolute',left:x,top:y,width:w,height:h});
export function Fonts(){const[handle]=useState(()=>delayRender('EP102 canonical fonts'));useEffect(()=>{Promise.all([['EP102','misans-medium.otf','500'],['EP102','misans-heavy.otf','900']].map(([name,file,weight])=>new FontFace(name,`url(${staticFile('fonts/'+file)})`,{weight}).load().then(f=>document.fonts.add(f)))).then(()=>continueRender(handle)).catch(cancelRender)},[handle]);return null}
export function Media({id,style={},start=0,rate=1}:{id:string;style?:CSSProperties;start?:number;rate?:number}){const s={width:'100%',height:'100%',objectFit:'contain' as const,...style};return /\.(png|jpe?g|webp)$/i.test((assets as any)[id].src)?<Img src={asset(id)} style={s}/>:<OffthreadVideo src={asset(id)} muted startFrom={Math.round(start*60)} playbackRate={rate} style={s}/>}
// Keep the source logo's native aspect ratio. The previous 345x85 box
// squeezed the dark logo (2172x724) vertically and made the badge visibly
// distorted in every dark explanation scene.
export function Corner({dark=false}:{dark?:boolean}){
 // Normalize the visible alpha bounds, preserving the source pixels' ratio.
 const source=dark?[2172,724,295,184,1528,341]:[1198,295,18,18,1162,259];
 const scale=330/source[4];
 return <div style={{...rect(1550,32,330,source[5]*scale),overflow:'hidden'}}><Img src={staticFile(dark?'brand/darkBackground.png':'brand/lightBackground.png')} style={{position:'absolute',left:-source[2]*scale,top:-source[3]*scale,width:source[0]*scale,height:source[1]*scale,maxWidth:'none'}}/></div>;
}
export function Recording({id,sourceStart=0,rate=1}:{id:string;sourceStart?:number;rate?:number}){return <AbsoluteFill style={{background:'#fff'}}><Media id={id} start={sourceStart} rate={rate}/></AbsoluteFill>}
