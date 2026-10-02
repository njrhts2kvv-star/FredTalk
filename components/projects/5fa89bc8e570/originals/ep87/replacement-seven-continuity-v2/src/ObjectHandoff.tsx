import React from 'react';
import {handoffState,lerp} from './handoff-state.mjs';
type Box=[number,number,number,number];
const full:Box=[-8,-8,1296,736];
const rect=(b:number[])=>({x:b[0],y:b[1],width:b[2],height:b[3]});
const grow=(b:number[],p:number)=>b.map((v,i)=>lerp(v,full[i],p));
const color=(a:string,b:string,p:number)=>'#'+[1,3,5].map(i=>Math.round(lerp(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),p)).toString(16).padStart(2,'0')).join('');
export function ObjectHandoff({before,after,frame,boundary,Old,New,config}:any){
 const f=frame-boundary+30,s=handoffState(f,config),[x,y,w,h]=s.box;
 const oldTime=(before.durationInFrames-30)/60,newTime=.5;
 // Contexts stay fixed. Only the selected real carrier travels between scenes.
 const oldContext=grow(config.from,s.oldContext),newContext=grow(config.to,s.newContext);
 const id='object-handoff-'+after.index;
 const contextTransform=(b:number[],p:number)=>`translate(${b[0]+b[2]/2} ${b[1]+b[3]/2}) scale(${p}) translate(${-b[0]-b[2]/2} ${-b[1]-b[3]/2})`;
 const fit=(b:number[],content:number)=>{const k=Math.min(w/b[2],h/b[3])*content;return `translate(${x+w/2} ${y+h/2}) scale(${k}) translate(${-b[0]-b[2]/2} ${-b[1]-b[3]/2})`;};
 return <>
  <defs>
   <clipPath id={id+'-old-context'}><rect {...rect(oldContext)}/></clipPath>
   <clipPath id={id+'-new-context'}><rect {...rect(newContext)}/></clipPath>
   <mask id={id+'-old-surround'} maskUnits='userSpaceOnUse' x={-10} y={-10} width={1300} height={740}><rect {...rect(full)} fill='white'/><rect {...rect(config.from)} fill='black'/></mask>
   <mask id={id+'-new-surround'} maskUnits='userSpaceOnUse' x={-10} y={-10} width={1300} height={740}><rect {...rect(full)} fill='white'/><rect {...rect(config.to)} fill='black'/></mask>
   <clipPath id={id+'-old-object'}><rect {...rect(config.from)}/></clipPath>
   <clipPath id={id+'-new-object'}><rect {...rect(config.to)}/></clipPath>
   <clipPath id={id+'-old-content'}><rect x={x} y={y} width={w} height={h}/></clipPath>
   <clipPath id={id+'-new-content'}><rect x={x} y={y} width={w} height={h}/></clipPath>
  </defs>
  {s.oldContext>0&&<g transform={contextTransform(config.from,s.oldContext)}><g mask={`url(#${id}-old-surround)`}><Old t={oldTime} page={before}/></g></g>}
  {s.newContext>0&&<g transform={contextTransform(config.to,s.newContext)}><g mask={`url(#${id}-new-surround)`}><New t={newTime} page={after}/></g></g>}
  {<>
   <rect x={x} y={y} width={w} height={h} rx={12*Math.sin(Math.PI*s.travel)} stroke='#8c9786' strokeWidth={2*Math.sin(Math.PI*s.travel)} fill={color(config.fromFill,config.toFill,s.travel)}/>
   {s.oldContent>0&&<g clipPath={`url(#${id}-old-content)`}><g transform={fit(config.from,s.oldContent)}><g clipPath={`url(#${id}-old-object)`}><Old t={oldTime} page={before}/></g></g></g>}
   {s.newContent>0&&<g clipPath={`url(#${id}-new-content)`}><g transform={fit(config.to,s.newContent)}><g clipPath={`url(#${id}-new-object)`}><New t={newTime} page={after}/></g></g></g>}
  </>}
 </>;
}
