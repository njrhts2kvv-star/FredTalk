import React from 'react';
import {e,mix,Box,Text,Brand,Slides,Paper} from './shared';
export function Clip2({t,page}:any){const w=page.words,c=page.cues;const move=e(t,c[0],2),collect=e(t,c[1],4),take=e(t,c[2],6.2),chain=e(t,c[3],9.75);const spread=move*(1-collect);return <>
 <g style={{display:take<1?undefined:'none'}} transform={`translate(${mix(350,70,move)-700*take} 200)`}><Brand x={25} y={-40}/><Box w={550} h={340}/><g transform='translate(25 35) scale(.72)'><Slides title={w[1]}/></g></g>
 {move>0&&<g style={{display:take<1?undefined:'none'}} transform={`translate(${mix(1280,860,move)} ${240-40*take}) scale(${1-.25*take})`}>
  {[2,1,0].map(i=><Paper key={i} x={i*(12+50*spread)} y={i*8} s={.85}/>)}
  <Text x={95} y={-34} size={35} anchor='middle' fill='#111'>{collect>.5?w[3]:w[2]}</Text>
 </g>}
 {take>0&&<g transform={`translate(${mix(810,200,take)+(65-200)*chain} ${mix(160,175,chain)})`}>
  <Box w={mix(mix(230,880,take),1150,chain)} h={430}/>
  <clipPath id='workload-copy'><rect width={mix(mix(230,880,take),1150,chain)} height={430} rx={32}/></clipPath>
  <g clipPath='url(#workload-copy)'><g style={{display:chain<1?undefined:'none'}} transform={`translate(${-900*chain} 0)`}><Paper x={55} y={55} s={1.25}/><Text x={370} y={180} size={42}>{w[4]}</Text><Text x={370} y={255} size={66}>{w[5]}</Text></g></g>
  {[0,1,2].map((i)=>{const p=e(t,c[3+i],c[3+i]+.65);return p>0&&<g key={i} transform={`translate(${25+375*i} ${38+55*(1-p)}) scale(${p})`}><Box w={350} h={354} fill='#161816' r={22}/><Text x={175} y={53} size={i===2?32:39} anchor='middle'>{w[6+i]}</Text><Paper x={i===1?82:91} y={88} s={1} kind={i===1?'grid':'sheet'} mark={i===0?e(t,9.7,10.2):0}/>{i<2&&<path d='M350 192H375' stroke='#fff' strokeWidth={3}/>}</g>;})}
 </g>}
 </>;}
