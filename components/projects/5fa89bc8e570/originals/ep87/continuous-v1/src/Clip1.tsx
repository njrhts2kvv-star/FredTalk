import React from 'react';
import {e,mix,Box,Text,Brand,Slides,C} from './shared';
export function Clip1({t,page}:any){const w=page.words,c=page.cues;const expand=e(t,c[0],1.4),side=e(t,c[1],5.65),final=e(t,c[2],9.5),title=e(t,9.4,9.85),sub=e(t,10,10.45);return <>
 <Brand x={503} y={100}/>
 <g style={{display:final<1?undefined:'none'}} transform={`translate(${mix(230,45,side)-740*final} ${mix(175,230,side)}) scale(${mix(1,.67,side)})`}>
  <Box w={mix(740,850,expand)} h={425}/><Text x={370} y={45} size={25} anchor='middle'>{w[1]}</Text>
  <g transform={`translate(${mix(126,40,expand)} 100)`}><Slides title={w[2]}/></g>
 </g>
 {side>0&&<g transform={`translate(${mix(1350,715,side)+(200-715)*final} ${mix(230,185,final)})`}>
  <rect x={4} y={7} width={mix(500,880,final)} height={mix(284.75,420,final)} rx={32} fill='#000' opacity={.06}/>
  <rect width={mix(500,880,final)} height={mix(284.75,420,final)} rx={32} fill='#fff' stroke='#e6e8e6' strokeWidth={final>.22?0:1.5}/>
  <rect width={mix(500,880,final)*e(final,.05,.45)} height={mix(284.75,420,final)} rx={32} fill='#080808'/>
  <clipPath id='comment-copy'><rect width={mix(500,880,final)} height={mix(284.75,420,final)} rx={32}/></clipPath>
  {final<.25&&<g clipPath='url(#comment-copy)'><g transform={`translate(0 ${-300*e(final,0,.25)})`}><Text x={42} y={30.15} size={20} fill='#333'>{w[3]}</Text><Text x={42} y={107.2} size={43} fill='#111'><tspan x={42}>{w[4].slice(0,6)}</tspan><tspan x={42} dy={61}>{w[4].slice(6)}</tspan></Text></g></g>}
  {title>0&&<g transform={`translate(440 ${210+45*(1-title)}) scale(${title})`}><Text x={0} y={0} size={104} anchor='middle'>{w[5]}</Text></g>}
  {sub>0&&<g transform={`translate(440 ${310+25*(1-sub)}) scale(${sub})`}><Text x={0} y={0} size={52} fill={C} anchor='middle'>{w[6]}</Text></g>}
 </g>}
 </>;}
