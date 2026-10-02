import React from 'react';
import {AbsoluteFill} from 'remotion';
import motion from './X040-motion.json';
const at=(f:number,k:number)=>{const n=Math.max(0,Math.min(479,f)),a=Math.floor(n),b=Math.min(479,a+1);return motion[a][k]+(motion[b][k]-motion[a][k])*(n-a)};
export function MediaWorkflow({t,accent}:{t:number;accent:string}){
 const f=t*60,colors=['#171719',accent,'#171719'];
 return <AbsoluteFill style={{background:'white'}}>
  {f<10&&<div style={{position:'absolute',left:160,top:-966-f*18,width:1600,height:970,borderRadius:26,background:'#282829',boxShadow:'12px 15px 18px #0005'}}/>}
  {[0,1].map(i=><svg key={i} width="220" height="98" viewBox="0 0 220 98" style={{position:'absolute',left:at(f,3+i)-220,top:491,visibility:at(f,3+i)?'visible':'hidden'}}><path d="M17 33H159V0L220 49L159 98V65H17A16 16 0 0 1 17 33Z" fill={colors[i]}/></svg>)}
  <svg width="296" height="296" viewBox="0 0 296 296" style={{position:'absolute',left:220,top:at(f,0),filter:'drop-shadow(16px 18px 10px #0005)'}}><rect x="14" y="14" width="268" height="268" rx="18" fill="white" stroke={colors[0]} strokeWidth="28"/><path d="M62 62H108V108H62ZM62 234L120 160L151 196L236 112V234Z" fill={colors[0]}/></svg>
  <svg width="302" height="306" viewBox="0 0 302 306" style={{position:'absolute',left:798,top:at(f,1),filter:'drop-shadow(16px 18px 10px #0005)'}}><rect x="14" y="14" width="274" height="278" rx="25" fill="white" stroke={colors[1]} strokeWidth="28"/><path d="M15 84H287M107 14L60 84M198 14L151 84" fill="none" stroke={colors[1]} strokeWidth="28"/><path d="M119 132L203 183L119 233Z" fill="white" stroke={colors[1]} strokeWidth="27" strokeLinejoin="round"/></svg>
  <svg width="348" height="292" viewBox="0 0 348 292" style={{position:'absolute',left:1396,top:at(f,2),filter:'drop-shadow(16px 18px 10px #0005)'}}><path d="M242 62H335L287 146L335 232H242" fill="white" stroke={colors[2]} strokeWidth="23"/><rect width="244" height="292" rx="10" fill={colors[2]}/>{[0,1].map(row=>[0,1,2,3].map(i=><rect key={`${row}-${i}`} x={24+i*55} y={row?236:20} width="32" height="36" rx="11" fill="white"/>))}</svg>
 </AbsoluteFill>;
}
