import React from 'react';
import {audioPosition,branchState,clamp01,expandReturn,frostedFocusState,handoffState,slotState} from './motion-state.mjs';
type Box=[number,number,number,number];
const geometry=([x,y,width,height]:Box):React.CSSProperties=>({position:'absolute',left:x,top:y,width,height});

// Surface owns fill/shadow. Content clipping never changes this layer.
export function SoftSurface({box,children,fill='#fff',radius=28,shadow='0 12px 32px rgba(0,0,0,.10)',style={}}:{box:Box;children?:React.ReactNode;fill?:string;radius?:number;shadow?:string;style?:React.CSSProperties}){
 return <div data-motion-layer="surface" style={{...geometry(box),border:0,borderRadius:radius,background:fill,boxShadow:shadow,...style}}>{children}</div>;
}
export function ContentClip({children,progress=1,padding=0}:{children:React.ReactNode;progress?:number;padding?:number}){
 return <div data-motion-layer="content-clip" style={{position:'absolute',inset:padding,overflow:'hidden',clipPath:`inset(0 ${(1-clamp01(progress))*100}% 0 0)`}}>{children}</div>;
}
export function TranscriptSelection({lines,selection,fontSize=28,color='#111',accent='#3478f6',selectionFill='#eaf2ff',cursor=false}:{lines:string[];selection?:{line:number;start:number;end:number};fontSize?:number;color?:string;accent?:string;selectionFill?:string;cursor?:boolean}){
 return <div style={{fontSize,fontWeight:500,lineHeight:1.65,color,textAlign:'left',letterSpacing:0}}>{lines.map((line,i)=>{
  if(!selection||selection.line!==i)return <div key={i}>{line}</div>;
  const {start,end}=selection;if(start<0||end<=start||end>line.length)throw Error('Transcript selection must be a valid substring');
  return <div key={i}>{line.slice(0,start)}<span style={{position:'relative',background:selectionFill,borderRadius:2}}>{line.slice(start,end)}{cursor&&<span aria-hidden style={{position:'absolute',right:-2,top:0,width:2,height:'1em',background:accent}}/>}</span>{line.slice(end)}</div>;
 })}</div>;
}
export function WaveformTrack({amplitudes,duration,playhead,selection,width=600,height=140,accent='#3478f6',selectionFill='#eaf2ff',labels=[]}:{amplitudes:number[];duration:number;playhead:number;selection?:[number,number];width?:number;height?:number;accent?:string;selectionFill?:string;labels?:{seconds:number;text:string}[]}){
 if(!amplitudes.length||amplitudes.some(a=>!Number.isFinite(a)||a<0||a>1))throw Error('Supply normalized waveform samples from the declared audio source');
 const x=(t:number)=>audioPosition(t,duration,width);const plotHeight=height-32;
 if(selection&&(selection[0]<0||selection[1]<=selection[0]||selection[1]>duration))throw Error('Wave selection outside audio duration');
 return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
  {selection&&<rect x={x(selection[0])} y={4} width={x(selection[1])-x(selection[0])} height={plotHeight-8} rx={3} fill={selectionFill}/>}
  {amplitudes.map((a,i)=>{const px=(i+.5)*width/amplitudes.length;return <rect key={i} x={px-width/amplitudes.length*.26} y={(plotHeight-a*(plotHeight-12))/2} width={Math.max(1,width/amplitudes.length*.52)} height={Math.max(2,a*(plotHeight-12))} rx={1} fill="#111"/>;})}
  <rect x={Math.min(width-2,x(playhead))} y={0} width={2} height={plotHeight} fill={accent}/>
  {labels.map(l=><text key={l.seconds} x={x(l.seconds)} y={height-4} textAnchor={l.seconds===0?'start':l.seconds===duration?'end':'middle'} fontSize={18} fill="#111">{l.text}</text>)}
 </svg>;
}
export function BranchFocus({time,origin,targets,selected,expand,focus,children}:{time:number;origin:Box;targets:Box[];selected:number;expand:[number,number];focus:[number,number];children:(index:number)=>React.ReactNode}){
 const states=branchState({time,origin,targets,selected,expand,focus});
 return <>{states.map((s:{box:Box;visible:boolean;scale:number},i:number)=>s.visible&&<div key={i} style={{...geometry(s.box),transform:`scale(${s.scale})`,transformOrigin:'center'}}>{children(i)}</div>)}</>;
}
export function ExpandReturn({time,rest,expanded,open,close,children}:{time:number;rest:Box;expanded:Box;open:[number,number];close:[number,number];children:React.ReactNode}){
 return <SoftSurface box={expandReturn({time,rest,expanded,open,close}) as Box}>{children}</SoftSurface>;
}
export function SlotReplace({time,items,render}:{time:number;items:{at:number;value:string}[];render:(value:string)=>React.ReactNode}){
 const state=slotState(time,items);return state.index<0?null:<>{render(state.value as string)}</>;
}
export function FocusStage({background,foreground,progress,blur=12}:{background:React.ReactNode;foreground:React.ReactNode;progress:number;blur?:number}){
 const p=clamp01(progress);return <><div style={{filter:`blur(${blur*p}px)`,transform:`scale(${1-.06*p})`}}>{background}</div><div style={{position:'absolute',inset:0,visibility:p>0?'visible':'hidden'}}>{foreground}</div></>;
}
// All three layers keep the caller's stage geometry. Keep this component mounted
// through a focus sequence; changing foreground never restarts the backdrop.
export function FrostedFocus({background,foreground,progress,tone='light',blur=19,tintOpacity=.58}:{background:React.ReactNode;foreground:React.ReactNode;progress:number;tone?:'light'|'dark';blur?:number;tintOpacity?:number}){
 const s=frostedFocusState({progress,tone,blur,tintOpacity});
 const layer:React.CSSProperties={position:'absolute',inset:0};
 return <>
  <div data-motion-layer="frosted-background" style={{...layer,filter:`blur(${s.blurPx}px)`}}>{background}</div>
  <div data-motion-layer="frosted-tint" aria-hidden="true" style={{...layer,pointerEvents:'none',background:`rgba(${s.tintRgb.join(',')},${s.tintAlpha})`}}/>
  <div data-motion-layer="frosted-foreground" style={{...layer,visibility:s.foregroundVisible?'visible':'hidden'}}>{foreground}</div>
 </>;
}
export function ObjectHandoff({time,from,to,travel,swap,before,after}:{time:number;from:Box;to:Box;travel:[number,number];swap:[number,number];before:React.ReactNode;after:React.ReactNode}){
 const s=handoffState({time,from,to,travel,swap});
 return <SoftSurface box={s.box as Box}><ContentClip><div style={{position:'absolute',inset:0,clipPath:`inset(0 ${s.newContent*100}% 0 0)`}}>{before}</div><div style={{position:'absolute',inset:0,clipPath:`inset(0 0 0 ${s.oldContent*100}%)`}}>{after}</div></ContentClip></SoftSurface>;
}
export function ViewportMask({progress,color='#000',children}:{progress:number;color?:string;children?:React.ReactNode}){
 return <div data-motion-layer="viewport-mask" style={{position:'absolute',inset:0,background:color,clipPath:`inset(0 ${(1-clamp01(progress))*100}% 0 0)`}}>{children}</div>;
}
