import type {CSSProperties,ReactNode} from 'react';
import {AbsoluteFill,Easing,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {Sound,font} from '../shared';
import type {V7Spec} from './types';

export const reveal=(frame:number,at:number,frames=16)=>interpolate(frame,[at,at+frames],[0,1],{
  easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp',
});

export const V7Canvas=({dark,children}:{dark:boolean;children:ReactNode})=><AbsoluteFill style={{
  background:dark?'#000':'#fff',color:dark?'#fff':'#090909',fontFamily:font,overflow:'hidden',
}}><style>{`@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Medium.otf')}');font-weight:500}@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Semibold.otf')}');font-weight:600}*{box-sizing:border-box}`}</style>{children}</AbsoluteFill>;

export const V7Sfx=({spec}:{spec:V7Spec})=><>{spec.sfx.map((name,i)=>{
  const ext=name==='scroll'?'.mp3':'.wav';
  return <Sound key={`${name}-${i}`} at={spec.cues[Math.min(i,spec.cues.length-1)]??10} file={`sfx/${name}${ext}`} volume={name==='scroll'?.18:.13} playbackRate={name==='scroll'?1.85:1}/>;
})}</>;

export const FixedReveal=({at,children,from='left',style}:{at:number;children:ReactNode;from?:'left'|'right'|'center'|'top';style?:CSSProperties})=>{
  const f=useCurrentFrame();const p=reveal(f,at);
  const clip=from==='left'?`inset(0 ${(1-p)*100}% 0 0)`:from==='right'?`inset(0 0 0 ${(1-p)*100}%)`:from==='top'?`inset(0 0 ${(1-p)*100}% 0)`:`inset(0 ${(1-p)*50}%)`;
  const positioned=style&&['left','right','top','bottom','width','height','inset'].some((key)=>key in style);
  const base:CSSProperties=positioned?{position:'absolute'}:{position:'absolute',inset:0};
  return <div style={{...base,clipPath:clip,...style}}>{children}</div>;
};

export const Surface=({children,dark=false,style}:{children?:ReactNode;dark?:boolean;style?:CSSProperties})=><div style={{
  background:dark?'#101010':'#f3f3f1',color:dark?'#fff':'#090909',borderRadius:32,
  boxShadow:dark?'0 30px 70px rgba(0,0,0,.34)':'0 26px 64px rgba(0,0,0,.13)',
  overflow:'hidden',position:'absolute',...style,
}}>{children}</div>;

export const Headline=({children,dark=false,style}:{children:ReactNode;dark?:boolean;style?:CSSProperties})=><div style={{
  position:'absolute',left:160,right:160,top:86,height:140,display:'flex',alignItems:'center',justifyContent:'center',
  color:dark?'#fff':'#090909',fontSize:96,lineHeight:1.05,fontWeight:600,letterSpacing:-3,textAlign:'center',whiteSpace:'pre-line',...style,
}}>{children}</div>;

export const Conclusion=({children,dark=false,style}:{children:ReactNode;dark?:boolean;style?:CSSProperties})=><div style={{
  position:'absolute',left:150,right:150,bottom:74,minHeight:126,display:'flex',alignItems:'center',justifyContent:'center',
  color:dark?'#fff':'#090909',fontSize:88,lineHeight:1.08,fontWeight:600,letterSpacing:-2.5,textAlign:'center',whiteSpace:'pre-line',...style,
}}>{children}</div>;

export const fill=(active:boolean,dark:boolean)=>active?(dark?'#fff':'#090909'):(dark?'#171717':'#efefed');
export const ink=(active:boolean,dark:boolean)=>active?(dark?'#090909':'#fff'):(dark?'#8a8a8a':'#777');
