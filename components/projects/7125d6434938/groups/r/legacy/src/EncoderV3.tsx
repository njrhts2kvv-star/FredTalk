import {DARK_PURPLE,purpleOnDark,purpleOnSurface} from "../../../../surface-purple.ts";
import React,{useEffect,useState} from 'react';
import {delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import {Icon} from './common';
import data from '../../../../specs/R006.json';
import {ClipSpec,measured} from '../../../../runtime/clip-spec';
export const EncoderV3=({t}:{t:number})=>{
 const frame=(t-data.reference.referenceStart)*60,o=data.objects.encoder,spec=data as unknown as ClipSpec;
 const icons=measured(spec,'iconOpacity',frame),[merge,exit,unified]=measured(spec,'merge',frame);
 const ramp=(a:number,b:number)=>Math.min(1,Math.max(0,(frame-a)/(b-a)));
 const [gate]=useState(()=>delayRender('R006 font'));useEffect(()=>{const f=new FontFace('R006Heavy',`url(${staticFile(data.fonts[0].file)})`,{weight:'900'});f.load().then(f=>{document.fonts.add(f);continueRender(gate)}).catch(cancelRender)},[gate]);
 return <div style={{fontFamily:'R006Heavy',fontWeight:900}}><div style={{position:'absolute',top:20,width:1920,opacity:ramp(0,22),textAlign:'center',fontSize:100,color:frame<382?o.accent:'#ffbf13',textShadow:'4px 5px 6px #0008'}}>{frame<382?o.titleInitial:o.titleFinal}</div>
 {o.centers.map((cx,i)=>{const [bx,by,bw,bh]=measured(spec,`entryBox${i}`,frame),[lx,ly,lw,lh]=measured(spec,`entryLabel${i}`,frame),[light]=measured(spec,`labelLight${i}`,frame),[mx,my,mw,mh]=measured(spec,`mergeBox${i}`,frame),x=frame<560?bx:mx,size=frame<560?bw:mw,y=frame<560?by:my;return <React.Fragment key={i}><div style={{position:'absolute',left:x,top:y,width:size,height:frame<560?bh:mh,borderRadius:frame<40?Math.max(56,(320-bw)*.5):56,background:'#000',boxShadow:'26px 18px 27px #0004',display:'grid',placeItems:'center'}}>{frame<622&&<div style={{opacity:icons[i]*(1-ramp(600,622))}}><Icon kind={i} size={210} color={purpleOnDark(o.accent)}/></div>}</div><div style={{position:'absolute',left:cx-12,top:782-232*ramp(175+i*12,218+i*12),width:24,height:232*ramp(175+i*12,218+i*12),background:'#000',opacity:1-ramp(585,630)}}/><div style={{position:'absolute',left:lx,top:ly+450*ramp(570+i*5,622+i*5),width:lw,height:lh,borderRadius:100,background:'#000',boxShadow:'24px 19px 20px #0004',color:purpleOnDark(o.accent),fontSize:96,display:'grid',placeItems:'center',opacity:1-ramp(610+i*3,630+i*3)}}><span style={{opacity:light}}>{o.labels[i]}</span></div></React.Fragment>})}
 {merge>.9&&<div style={{position:'absolute',left:682,top:205,width:556,height:556,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:18,opacity:unified,color:purpleOnDark(o.accent)}}><svg width={300} height={300} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={7}><path d="M100 10L177 55V145L100 190L23 145V55Z M58 54H80L100 64H123V137H100L80 146H58 M51 77H98 M40 100H98 M51 123H98 M123 66L144 76V128L123 138 M154 89H168 M154 104H168 M154 118H168"/>{[[49,54],[43,77],[33,100],[43,123],[49,146]].map(([x,y])=><circle key={y} cx={x} cy={y} r={6} fill="currentColor" stroke="none"/>)}</svg><div style={{fontSize:45}}>{o.finalLabel}</div></div>}
 </div>;
};
