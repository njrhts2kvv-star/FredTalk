import type {CSSProperties,ReactNode} from 'react';
import {AbsoluteFill,Easing,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {Sound,font} from '../shared';

export type MotionSpec={stableId:string;layout:string;words:string[];background:'black'|'white';cues:number[];duration:number;sfx:string[]};
export type MotionProps={spec:MotionSpec};
export const phase=(frame:number,at:number,frames=22)=>interpolate(frame,[at,at+frames],[0,1],{easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;

export const LabCanvas=({dark,children}:{dark:boolean;children:ReactNode})=><AbsoluteFill style={{background:dark?'#000':'#fff',color:dark?'#fff':'#090909',fontFamily:font,overflow:'hidden'}}><style>{`@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Medium.otf')}');font-weight:500}@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Semibold.otf')}');font-weight:600}*{box-sizing:border-box}`}</style>{children}</AbsoluteFill>;

export const ClipText=({at,children,from='left',style}:{at:number;children:ReactNode;from?:'left'|'right'|'center';style?:CSSProperties})=>{
  const frame=useCurrentFrame();const p=phase(frame,at,16);
  const clip=from==='left'?`inset(0 ${(1-p)*100}% 0 0)`:from==='right'?`inset(0 0 0 ${(1-p)*100}%)`:`inset(0 ${(1-p)*50}%)`;
  return <div style={{clipPath:clip,...style}}>{children}</div>;
};

export const LabSfx=({spec}:{spec:MotionSpec})=><>{spec.sfx.map((name,index)=>{
  const cueIndex=spec.sfx.length===1?0:Math.round(index*(spec.cues.length-1)/(spec.sfx.length-1));
  return <Sound key={`${name}-${index}`} at={spec.cues[cueIndex]??10} file={`sfx/${name}.wav`} volume={name==='whoosh'||name==='swipe' ? .12 : .14}/>;
})}</>;

export const CenterCopy=({children,color='#fff',size=132,style}:{children:ReactNode;color?:string;size?:number;style?:CSSProperties})=><div style={{position:'absolute',inset:'100px 120px',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:size,fontWeight:600,lineHeight:1.06,letterSpacing:-4,color,whiteSpace:'pre-line',...style}}>{children}</div>;
