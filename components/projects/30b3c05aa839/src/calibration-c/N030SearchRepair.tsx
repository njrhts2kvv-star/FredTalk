import {approvedStaticFile as staticFile} from '../../material-policy';
import React,{useEffect,useState} from 'react';
import {delayRender, continueRender, cancelRender} from 'remotion';
import glyphs from './N030-repair-glyphs.json';
let ready:Promise<unknown>|undefined;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const q=(t:number,a:number,b:number)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p)};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
/** Only replaces the N030 search object. Parent retains its previously approved phones/media. */
export function N030SearchRepair({t,query='AI编程'}:{t:number;query?:string}){
 const [handle]=useState(()=>delayRender('Load licensed pixel font'));
 useEffect(()=>{ready??=new FontFace('N030RepairPixel',`url(${staticFile('calibration-c/fusion-pixel-12px-proportional-zh_hans.ttf')})`).load().then(f=>document.fonts.add(f));ready.then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 // Keep the already viewed draft's appearance and corner-move timing.
 const circle=q(t,0,.25),grow=q(t,.25,.85),move=q(t,2.25,2.75);
 const width=mix(mix(42,254,circle),1414,grow),height=mix(42,254,circle);
 const shown=query.slice(0,Math.floor(clamp((t-1.1)/.85)*query.length));
 let offset=0;
 return <div style={{position:'absolute',left:mix(960,240,move),top:mix(540,70,move),transform:`translate(-50%,-50%) scale(${mix(1,400/1414,move)})`,transformOrigin:'center',width,height,border:'13px solid #666',borderRadius:80,background:'#dfdfdf',boxSizing:'border-box',overflow:'hidden'}}>
 <div style={{position:'absolute',left:12,top:12,bottom:12,right:13+140*grow,borderRadius:66,background:'#fff'}}/>
 <svg width={1060} height={185} style={{position:'absolute',left:63,top:32,overflow:'visible'}}>{[...shown].map((c,i)=>{const rows=(glyphs as Record<string,string[]>)[c];const x=offset;offset+=(rows?.[0].length??12)*13.85;return rows?<g key={i} transform={`translate(${x} 0)`}>{rows.flatMap((row,y)=>[...row].map((bit,k)=>bit==='1'?<rect key={`${y}-${k}`} x={k*13.85} y={y*13.85} width={12.8} height={12.8} fill='#050505'/>:null))}</g>:<text key={i} x={x} y={157} fontFamily='N030RepairPixel' fontSize={166.2} fill='#050505'>{c}</text>})}</svg>
 <svg width={116} height={116} viewBox='0 0 116 116' style={{position:'absolute',right:23,top:61,opacity:q(t,.6,.85)}}><circle cx={47} cy={44} r={36} fill='none' stroke='white' strokeWidth={5}/><path d='M74 74L99 99' stroke='white' strokeWidth={9} strokeLinecap='round'/></svg>
 </div>;
}
