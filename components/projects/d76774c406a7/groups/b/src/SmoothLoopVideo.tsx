import React from 'react';
import {Freeze, OffthreadVideo} from 'remotion';

// Keep output time continuous while overlapping the last 12 source frames
// with the first 12, then continue from the next source frame.
export function SmoothLoopVideo({src,frame,durationInFrames=300,style}:{
 src:string; frame:number; durationInFrames?:number; style?:React.CSSProperties;
}) {
 const overlap=12;
 const elapsed=Math.max(0,frame);
 const period=durationInFrames-overlap;
 const local=elapsed<durationInFrames?elapsed:overlap+(elapsed-durationInFrames)%period;
 const opacity=Math.max(0,(local-period)/overlap);
 return <div style={{position:'relative',width:'100%',height:'100%'}}>
  <Freeze frame={local}><OffthreadVideo muted src={src} style={style}/></Freeze>
  {opacity>0&&<div style={{position:'absolute',inset:0,opacity}}>
   <Freeze frame={local-period}><OffthreadVideo muted src={src} style={style}/></Freeze>
  </div>}
 </div>;
}
