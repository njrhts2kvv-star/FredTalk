import React from 'react';
import {AppScreen009} from './AppScreens009';
import data from '../../../../specs/R009.json';
import {ClipSpec,measured} from '../../../../runtime/clip-spec';
const spec=data as unknown as ClipSpec;
export const TraeTitleV3=({t}:{t:number})=>{
 const frame=(t-45.466667)*60;
 const ys=measured(spec,'phones',frame),[size,x,blur,opacity]=measured(spec,'title',frame),o=data.objects;
 const [rightEdge]=measured(spec,'tailRight',frame);const tail=Math.max(0,Math.min(1,(frame-170)/10));
 return <><div style={{position:'absolute',left:0,top:280,width:1920,height:550,background:'#f2f2f2',filter:'blur(55px)',opacity:frame<200?.8:0}}/>{frame<80&&ys.map((y,i)=><div key={i} style={{position:'absolute',left:o.phones.x[i],top:y,width:o.phones.width,height:o.phones.height,borderRadius:o.phones.radius,overflow:'hidden',border:'10px solid #111',boxSizing:'border-box',boxShadow:'20px 16px 25px #0004'}}><AppScreen009 index={i}/><div style={{position:'absolute',left:155,top:18,width:170,height:43,borderRadius:30,background:'#000'}}/></div>)}
 <div style={{position:'absolute',left:x*(1-tail)+rightEdge*tail,top:540,transform:`translate(${-50-50*tail}%,-50%)`,whiteSpace:'nowrap',fontSize:size,fontWeight:700,filter:`blur(${blur}px)`,opacity,color:'#000'}}>{o.title.prefix}<span style={frame<125?{color:'#000'}:{color:'transparent',background:'linear-gradient(120deg,#ba9dde 0%,#8960ca 38%,#cbb6ea 68%,#8052c4 100%)',backgroundClip:'text',WebkitBackgroundClip:'text'}}>{o.title.emphasis}</span></div></>;
};
