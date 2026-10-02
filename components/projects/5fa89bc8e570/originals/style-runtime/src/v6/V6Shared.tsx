import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Sound, font} from '../shared';
import type {V5Spec} from '../v5/types';

export const arrive = (frame:number, at:number, frames=22) => interpolate(frame,[at,at+frames],[0,1],{
  easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp',
});

export const Canvas=({dark,children}:{dark:boolean;children:ReactNode})=><AbsoluteFill style={{
  background:dark?'#050505':'#f8f8f6',color:dark?'#fff':'#080808',fontFamily:font,overflow:'hidden',
}}><style>{`@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Medium.otf')}');font-weight:500}@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Semibold.otf')}');font-weight:600}`}</style>{children}</AbsoluteFill>;

export const Slab=({children,dark=true,style}:{children?:ReactNode;dark?:boolean;style?:CSSProperties})=><div style={{
  borderRadius:34,background:dark?'linear-gradient(145deg,#202020,#050505)':'linear-gradient(145deg,#fff,#e8e8e5)',
  color:dark?'#fff':'#080808',boxShadow:dark?'0 34px 80px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.13)':'0 34px 80px rgba(0,0,0,.17), inset 0 1px 0 rgba(255,255,255,.9)',
  display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',...style,
}}>{children}</div>;

export const Cut=({at,children,from='left',style}:{at:number;children:ReactNode;from?:'left'|'right'|'center';style?:CSSProperties})=>{
  const frame=useCurrentFrame();const p=arrive(frame,at);
  const clip=from==='left'?`inset(0 ${(1-p)*100}% 0 0)`:from==='right'?`inset(0 0 0 ${(1-p)*100}%)`:`inset(0 ${(1-p)*50}%)`;
  return <div style={{clipPath:clip,transform:`translateX(${from==='left'?(1-p)*28:from==='right'?(p-1)*28:0}px)`,...style}}>{children}</div>;
};

export const Character=({pose,at,style}:{pose:'thinking'|'judging'|'pointing'|'confirming';at:number;style?:CSSProperties})=>{
  const frame=useCurrentFrame();const p=arrive(frame,at,24);
  return <Img src={staticFile(`characters/fred-${pose}.png`)} style={{width:760,height:850,objectFit:'contain',clipPath:`inset(0 ${(1-p)*100}% 0 0)`,transform:`translateX(${(1-p)*-30}px)`,...style}}/>;
};

export const Sfx=({spec}:{spec:V5Spec})=><>{spec.sfx.map((name,i)=>{
  const ext=name==='scroll'?'.mp3':'.wav';
  return <Sound key={`${name}-${i}`} at={spec.cues[Math.min(i,spec.cues.length-1)]??10} file={`sfx/${name}${ext}`} volume={name==='scroll'?.18:.14} playbackRate={name==='scroll'?1.7:1}/>;
})}</>;
