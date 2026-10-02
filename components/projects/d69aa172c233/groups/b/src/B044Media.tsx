import React from 'react';
import {Freeze, Img, OffthreadVideo} from 'remotion';
import {cleanStaticFile} from './clean-assets';

export function B044Media({name,frame,startFrame}:{name:string;frame:number;startFrame:number}) {
 const src=cleanStaticFile(name);
 const style:React.CSSProperties={width:'100%',height:'100%',objectFit:'cover'};
 if(!/\.mp4(?:\?|$)/.test(src)) return <Img src={src} style={style}/>;
 const length=src.includes('fred-mic-power')?350:300;
 const blend=12;
 const elapsed=Math.max(0,frame-startFrame);
 const local=elapsed<length?elapsed:blend+(elapsed-length)%(length-blend);
 const mix=Math.max(0,(local-(length-blend))/blend);
 return <div style={{position:'relative',width:'100%',height:'100%'}}>
  <Freeze frame={local}><OffthreadVideo muted src={src} style={style}/></Freeze>
  {mix>0&&<div style={{position:'absolute',inset:0,opacity:mix}}><Freeze frame={local-(length-blend)}><OffthreadVideo muted src={src} style={style}/></Freeze></div>}
 </div>;
}
