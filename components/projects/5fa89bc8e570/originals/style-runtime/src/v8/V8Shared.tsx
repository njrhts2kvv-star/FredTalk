import type {CSSProperties,ReactNode} from 'react';
import {AbsoluteFill,Easing,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {font} from '../shared';
import {V7Sfx} from '../v7/V7Shared';
import type {V8Spec} from './types';

export const cut=(frame:number,at:number,frames=14)=>interpolate(frame,[at,at+frames],[0,1],{
  easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp',
});

export const V8Canvas=({dark,children}:{dark:boolean;children:ReactNode})=><AbsoluteFill style={{
  background:dark?'#000':'#fff',color:dark?'#fff':'#090909',fontFamily:font,overflow:'hidden',
}}><style>{`@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Medium.otf')}');font-weight:500}@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Semibold.otf')}');font-weight:600}*{box-sizing:border-box}`}</style>{children}</AbsoluteFill>;

export const Clip=({at,children,from='left',style}:{at:number;children:ReactNode;from?:'left'|'right'|'center'|'top';style?:CSSProperties})=>{
  const frame=useCurrentFrame();const p=cut(frame,at);
  const clip=from==='left'?`inset(0 ${(1-p)*100}% 0 0)`:from==='right'?`inset(0 0 0 ${(1-p)*100}%)`:from==='top'?`inset(0 0 ${(1-p)*100}% 0)`:`inset(0 ${(1-p)*50}%)`;
  const positioned=style&&['left','right','top','bottom','width','height','inset'].some((key)=>key in style);
  return <div style={{position:'absolute',...(positioned?{}:{inset:0}),clipPath:clip,...style}}>{children}</div>;
};

export const FullCenter=({children,size=150,style}:{children:ReactNode;size?:number;style?:CSSProperties})=><div style={{
  position:'absolute',inset:'90px 130px',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',
  fontSize:size,fontWeight:600,lineHeight:1.06,letterSpacing:-4,whiteSpace:'pre-line',...style,
}}>{children}</div>;

export const FixedPanel=({children,dark=false,style}:{children?:ReactNode;dark?:boolean;style?:CSSProperties})=><div style={{
  position:'absolute',background:dark?'#111':'#f1f1ef',color:dark?'#fff':'#090909',borderRadius:30,overflow:'hidden',
  boxShadow:dark?'0 30px 70px rgba(0,0,0,.38)':'0 26px 62px rgba(0,0,0,.12)',...style,
}}>{children}</div>;

export const BigCopy=({children,dark=false,style}:{children:ReactNode;dark?:boolean;style?:CSSProperties})=><div style={{
  color:dark?'#fff':'#090909',fontSize:104,fontWeight:600,lineHeight:1.08,letterSpacing:-3,textAlign:'center',whiteSpace:'pre-line',...style,
}}>{children}</div>;

export const Sfx=({spec}:{spec:V8Spec})=><V7Sfx spec={spec}/>;

export const activeIndex=(frame:number,cues:number[],count:number)=>{
  let active=0;for(let i=0;i<count;i++)if(frame>=(cues[i+1]??cues.at(-1)??0))active=i;return Math.min(count-1,active);
};

