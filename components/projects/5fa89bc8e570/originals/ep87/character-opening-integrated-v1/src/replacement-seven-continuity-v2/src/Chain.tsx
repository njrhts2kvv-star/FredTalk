import React from 'react';
import {T,R,Sheet,Cells,Reveal,ease as e,mix,green} from './primitives';
function Slides({w=300,h=205,p=1}:any){return <g><R w={w} h={h} fill='#11130f'/><Reveal x={14} y={12} w={w-28} h={h-24} p={p} axis='x'><Sheet x={16} y={23} w={w*.27} h={h*.77} rows={3}/><R x={w*.38} y={24} w={w*.56} h={h*.48} fill='#fff'/><R x={w*.38} y={24} w={w*.56} h={12} fill={green}/><R x={w*.43} y={h*.73} w={w*.43} h={17} fill={green} r={4}/></Reveal></g>}
export function R2Clip14({t,page}:any){
 const w=page.words,bridge=e(t,5.3,6.1),compact=e(t,8.4,9.1),up=e(t,9.5,10.1),lower=e(t,12.2,12.8);
 const s=mix(1,.60,compact),tx=mix(79,78,compact),ty=mix(228,369,compact);
 return <><R w={1280} h={720}/><g transform={`translate(${tx} ${ty}) scale(${s})`}>
 <T x={70} y={-35} size={32} anchor='middle'>{w[0]}</T><R x={0} w={150} h={224} fill='#131510'/><R x={12} y={11} w={145} h={217} stroke='#dce2d7'/><R x={12} y={95} w={145} h={44} fill='#11130f'/><T x={84} y={127} size={27} anchor='middle' fill='#fff'>{w[1]}</T>
 {[0,1,2].map(i=>{const p=e(t,[.8,1.5,2.4][i],[1.3,2.05,2.95][i]);const x=[194,352,709][i];return <Reveal key={i} x={x} y={-70} w={i===1?325:140} h={310} p={p} axis='x'><T x={x} y={-20} size={31}>{w[i+2]}</T>{i===1?<g transform={`translate(${x} 7)`}><Slides w={317} h={215} p={e(t,1.8,2.5)}/></g>:<Sheet x={x} y={4} w={132} h={219} rows={i===0?3:4}/>}</Reveal>})}
 <g transform={`translate(${mix(900,915,bridge)} ${mix(4,-46,bridge)})`}><Reveal x={-5} y={-70} w={257} h={390} p={e(t,3.2,3.7)} axis='x'><T x={0} y={-20} size={31}>{bridge>.8?w[6]:w[5]}</T><Sheet w={mix(132,200,bridge)} h={mix(219,299,bridge)} rows={3} stack={bridge>.1?3:0}/></Reveal></g>
 </g>
 <path d={`M774 435 H808 V${mix(435,279,up)} H854`} fill='none' stroke='#41493b' strokeWidth={2} strokeDasharray={300} strokeDashoffset={300*(1-up)}/>
 <Reveal x={844} y={167} w={357} h={296} p={up} axis='x'><T x={855} y={213} size={35}>{w[7]}</T><g transform='translate(855 231)'><Slides w={350} h={228} p={e(t,10.1,11.2)}/></g></Reveal>
 <path d={`M774 451 H808 V548 H854`} fill='none' stroke='#535d4c' strokeWidth={1.8} strokeDasharray={180} strokeDashoffset={180*(1-lower)}/>
 <Reveal x={849} y={483} w={285} h={169} p={lower}><T x={855} y={517} size={30}>{w[8]}</T><g transform='translate(855 531)'><Slides w={219} h={117} p={e(t,12.5,13.1)}/></g></Reveal>
 </>;
}
