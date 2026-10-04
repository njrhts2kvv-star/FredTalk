import {approvedStaticFile as staticFile} from '../material-policy';
import {FiveFontFace} from "../five-fonts.ts";
import React,{useEffect,useState} from 'react';
import {delayRender, continueRender, cancelRender} from 'remotion';

let fontsReady:Promise<unknown>|undefined;
const q=(t:number,a:number,b:number)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*(3-2*p)};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;

/** Typography-only replacement for the user-reviewed X050 inline branch.
 * The parent keeps its original Pane/Document. Entry/exit/opacity/rotation
 * times and paths below are copied from all-remaining-first-pass unchanged.
 */
export function X050TypographyRepair({t,accent,words}:{t:number;accent:string;words?:string[]}){
 const [handle]=useState(()=>delayRender('Load X050 revision typography'));
 useEffect(()=>{fontsReady??=Promise.all([
  new FiveFontFace('X050RevisionHeavy',`url(${staticFile('calibration-c/MiSans-Heavy.otf')})`,{weight:'900'}),
  new FiveFontFace('X050RevisionLatin',`url(${staticFile('calibration-c/MiSans-Heavy.otf')})`,{weight:'900'}),
 ].map(face=>face.load().then(font=>document.fonts.add(font))));fontsReady.then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 return <>
 {['功能欠缺','出现 bug','内容错误'].map((fallback,i)=>{
  const a=1.45+i*.55,p=q(t,a,a+.22),out=q(t,a+.43,a+.75),text=words?.[i]??fallback;
  const label=i===1?text.replace(/\s+(?=bug)/,''):text;
  return <div key={i} style={{position:'absolute',left:mix(2200,700,p)+(i===1?1:-1)*out*1800,top:mix(780,420,p)-out*190,width:[472,492,472][i],height:147.5,transform:`rotate(${mix(8,i===1?8:-8,p)}deg)`,opacity:p*(1-out)}}>
   <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',fontFamily:'X050RevisionHeavy',fontWeight:900,fontSize:[183,181,188][i],lineHeight:1.25,letterSpacing:i===0?4:i===1?10:0,whiteSpace:'nowrap',color:'#171719'}}>{label.slice(0,2)}<span style={{color:accent}}>{label.slice(2)}</span></div>
  </div>;
 })}
 <div style={{position:'absolute',inset:0,opacity:q(t,8,8.5),transform:`scale(${mix(1.12,1,q(t,8,8.5))})`,transformOrigin:'960px 540px'}}>
  <svg width={1920} height={1080}><text x={85} y={643} fontSize={270} fontFamily='X050RevisionHeavy' fontWeight={900} letterSpacing={-33} fill='#171719'>{words?.[3]??'严重消耗'}</text><text x={1070} y={650} fontSize={309} fontFamily='X050RevisionLatin' textLength={words?.[4] ? undefined : 768.984375} lengthAdjust='spacingAndGlyphs' fontWeight={900} letterSpacing={5} fill={accent}>{words?.[4]??'Token'}</text></svg>
 </div>
 </>;
}
