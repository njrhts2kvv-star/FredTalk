import type {CSSProperties,ReactNode} from 'react';
import {AbsoluteFill,Easing,Img,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {Sound,font} from '../shared';
import type {V11Spec} from './types';

export const ease=(frame:number,at:number,frames=20)=>interpolate(frame,[at,at+frames],[0,1],{
  easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp',
});
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;

export const Canvas=({dark,children}:{dark:boolean;children:ReactNode})=><AbsoluteFill style={{
  background:dark?'#000':'#fff',color:dark?'#fff':'#090909',fontFamily:font,overflow:'hidden',
}}><style>{`@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Medium.otf')}');font-weight:500}@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Semibold.otf')}');font-weight:600}*{box-sizing:border-box}`}</style>{children}</AbsoluteFill>;

export const Wipe=({at,from='left',children,style}:{at:number;from?:'left'|'right'|'center';children:ReactNode;style?:CSSProperties})=>{
  const f=useCurrentFrame();const p=ease(f,at,18);
  const clip=from==='left'?`inset(0 ${(1-p)*100}% 0 0)`:from==='right'?`inset(0 0 0 ${(1-p)*100}%)`:`inset(0 ${(1-p)*50}%)`;
  return <div style={{clipPath:clip,...style}}>{children}</div>;
};

export const Sfx=({spec}:{spec:V11Spec})=><>{spec.sfx.map((name,index)=>{
  const cueIndex=spec.sfx.length===1?0:Math.round(index*(spec.cues.length-1)/(spec.sfx.length-1));
  return <Sound key={`${name}-${index}`} at={spec.cues[cueIndex]??10} file={`sfx/${name==='scroll'?'scroll.mp3':`${name}.wav`}`} volume={name==='whoosh'||name==='swipe'?.14:.15} playbackRate={name==='scroll'?1.85:1}/>;
})}</>;

export const Character=({pose='thinking',style}:{pose?:'thinking'|'judging'|'confirming';style?:CSSProperties})=>{
  const file=pose==='judging'?'fred-judging.png':pose==='confirming'?'fred-confirming.png':'fred-thinking.png';
  return <Img src={staticFile(`characters/${file}`)} style={{position:'absolute',objectFit:'contain',...style}}/>;
};

export const CenterText=({children,size=132,color,style}:{children:ReactNode;size?:number;color?:string;style?:CSSProperties})=><div style={{position:'absolute',left:100,right:100,textAlign:'center',fontSize:size,fontWeight:600,lineHeight:1.05,letterSpacing:-3,color,...style}}>{children}</div>;
