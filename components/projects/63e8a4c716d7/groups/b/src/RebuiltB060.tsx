import {FiveFontFace} from "../../../five-fonts.ts";
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import data from '../../../specs/B060.json';
import {measured,ClipSpec} from '../../../runtime/clip-spec';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function RebuiltB060({frame}:{frame:number}){
 const [handle]=useState(()=>delayRender('B060 font'));
 useEffect(()=>{Promise.all(data.fonts.map(font=>new FiveFontFace(font.family,`url(${staticFile(font.file)})`).load())).then(fonts=>{fonts.forEach(f=>document.fonts.add(f));continueRender(handle)}).catch(cancelRender)},[handle]);
 const val=(k:string)=>measured(data as ClipSpec,k,frame);const [cx,cy,r,op]=val('center');const [px,py,pr]=val('platform');const scale=pr/386;const font=data.fonts[0].family;const words=data.content.texts;
 const X=(x:number)=>px+(x-1116)*scale,Y=(y:number)=>py+(y-552)*scale;
 const wave=clamp((frame-151)/15)*(1-clamp((frame-199)/27));
 const headingTokens=['+','+$','-$','-$+','-/+','-/+','#/++','#/<+','#&<+<','#&<=<','*&-=<','*&-=<'];
 const flow=clamp((frame-113)/9)*(1-clamp((frame-146)/10));
 return <AbsoluteFill style={{background:'#f6f8fa'}}><svg width='1920' height='1080' style={{fontFamily:font,opacity:val('globalOpacity')[0]}}>
 <defs><linearGradient id='b60-accent' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#7348ad'/><stop offset='1' stopColor='#a57bdc'/></linearGradient><radialGradient id='b60-side'><stop offset='0' stopColor='#ad8dcd' stopOpacity='.14'/><stop offset='.66' stopColor='#ad8dcd' stopOpacity='.14'/><stop offset='1' stopColor='#ad8dcd' stopOpacity='0'/></radialGradient><radialGradient id='b60-glow'><stop offset='.77' stopColor='white' stopOpacity='0'/><stop offset='.94' stopColor='white' stopOpacity='.8'/><stop offset='1' stopColor='white' stopOpacity='0'/></radialGradient><filter id='b60-blur'><feGaussianBlur stdDeviation='7'/></filter></defs>
 <circle cx={px} cy={py} r={pr} fill='#d1bddf' opacity='.09'/><circle cx={px} cy={py} r={pr*.77} fill='#b997d2' opacity='.15'/><circle cx={px} cy={py} r={pr*.232} fill='#f6f8fa'/>
 <circle cx={X(485)} cy={py} r={pr} fill='url(#b60-side)'/><circle cx={X(1710)} cy={py} r={pr} fill='url(#b60-side)'/>
 {[0,1,2,3].map((i)=>{const positions=[[247,329],[104,445],[247,565],[105,670]];const [x,y]=positions[i];return <g key={i} opacity={clamp((frame-i*8+14)/14)}><circle cx={X(x)} cy={Y(y)} r={68*scale} fill={['#a284ba','#826198','#b39cc6','#705785'][i]}/><text x={X(x)} y={Y(y)+12*scale} fontSize={35*scale} textAnchor='middle' fill='white'>{words[8+i]}</text></g>})}
 {[0,1,2].map(i=>{const [x,y,w,h,opacity]=val('left'+i);return <g key={i} opacity={opacity}><rect x={x} y={y} width={w} height={h} rx={h/2} fill='url(#b60-accent)'/><text x={x+w/2} y={y+h*.7} fontSize={h*.59} fill='white' textAnchor='middle'>{words[i]}</text></g>})}
 <g opacity={clamp((frame-60)/24)}><rect x={X(686)} y={Y(406)} width={98*scale} height={292*scale} rx={50*scale} fill='#fff'/>{words[3].split('').map((c,i)=><text key={i} x={X(735)} y={Y(452+i*56)} textAnchor='middle' fontSize={49*scale} fill='#4e535b'>{c}</text>)}</g>
 <g opacity={flow}>{Array.from({length:9},(_,i)=>{const t=clamp((frame-113-i*.8)/34),sx=X(735),sy=Y(552+(i-4)*12);const ex=sx+(px-sx)*t;const d=`M ${sx} ${sy} C ${sx+(px-sx)*.3} ${sy+(i-4)*10*scale}, ${ex-70*scale} ${py+(i-4)*3}, ${ex} ${py}`;return <g key={i}><path d={d} fill='none' stroke={i%2?'#b396d9':'white'} strokeWidth={7*scale} filter='url(#b60-blur)'/><path d={d} fill='none' stroke={i%3?'#e7daf9':'#8d60bd'} strokeWidth={1.8*scale}/></g>})}</g>
 <g opacity={op}><circle cx={cx} cy={cy} r={r} fill='url(#b60-accent)'/>{wave>0&&<><circle cx={cx} cy={cy} r={r*1.28} fill='url(#b60-glow)' opacity={wave}/><circle cx={cx} cy={cy} r={r*.74} fill='url(#b60-glow)' opacity={wave}/><circle cx={cx} cy={cy} r={r*.94} fill='none' stroke='#b994e9' strokeWidth={8} opacity={wave*.65}/></>}
 <g opacity={clamp((frame-157)/12)} fill='white' fontSize={r*.255} textAnchor='middle'><text x={cx} y={cy-r*.08}>统一整理</text><text x={cx} y={cy+r*.25}>声音记录</text></g></g>
 {[0,1,2].map(i=>{const [x,y,w,h,opacity]=val('right'+i);return <g key={i} opacity={opacity}><rect x={x} y={y} width={w} height={h} rx={h/2} fill='url(#b60-accent)'/><text x={x+w/2} y={y+h*.69} fontSize={h*.43} fill='white' textAnchor='middle'>{words[5+i]}</text></g>})}
 </svg>{frame>=468&&<div aria-label={words[4]} style={{position:'absolute',left:710,top:65,fontFamily:data.fonts[1].family,fontWeight:400,fontSize:84,lineHeight:1,letterSpacing:-3,color:'#080808'}}>{headingTokens[Math.min(11,Math.floor(frame-468))]}{frame>=478&&<span style={{display:'inline-block',height:91,width:5,background:'#777',verticalAlign:'middle',marginLeft:4}}/>}</div>}</AbsoluteFill>
}
