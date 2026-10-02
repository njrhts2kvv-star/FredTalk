import React from 'react';
import {e,mix,Box,Text,Brand,Paper,Record,C} from './shared';
import {partFourState} from './joins.mjs';
export function Clip4({t,page}:any){const w=page.words,c=page.cues;const first=e(t,c[0],1.5),second=e(t,c[1],3.5),take=e(t,c[2],7.5),final=e(t,c[3],10),headline=e(t,c[4],10.7);const fixed=partFourState(t);return <>
 <g style={{display:take<1?undefined:'none'}} transform={`translate(${mix(365,65,first)-450*take} 267) scale(.72)`}><Box w={252} h={320}/><Brand x={12} y={40} s={.73} dark/>{[2,1,0].map(i=><Paper key={i} x={20+i*14} y={72+i*3} s={.82} kind='grid'/>)}</g>
 {first>0&&<g style={{display:fixed.oldVisible?undefined:'none'}} transform={`translate(${mix(480,300,first)-760*take} ${185+80*take}) scale(${first*mix(1,.7,take)})`}>
  <Box w={360} h={470}/><Text x={28} y={77} size={43}>{w[1]}</Text><Text x={28} y={133} size={40}>{w[2]}</Text>
  <g transform='translate(58 201)'>{Array.from({length:16},(_,i)=><g key={i}><rect x={(i%4)*60} y={Math.floor(i/4)*48} width={49} height={40} rx={5} fill={i===5?'#ddd':'#4a4e4a'}/><Text x={(i%4)*60+25} y={Math.floor(i/4)*48+31} size={30} fill={i===5?'#111':'#fff'} anchor='middle'>?</Text></g>)}</g>
 </g>}
 {second>0&&<g transform={`translate(${mix(1320,700,second)+(210-700)*take} ${mix(185,180,take)})`}>
  <Box w={mix(515,860,take)} h={mix(470,425,final)}/>
  <clipPath id='individual-copy'><rect width={mix(515,860,take)} height={mix(470,425,final)} rx={32}/></clipPath>
  <g clipPath='url(#individual-copy)'><g style={{display:take<1?undefined:'none'}} transform={`translate(${-700*fixed.copyOut} 0)`}><Text x={30} y={77} size={43}>{w[3]}</Text><Text x={30} y={133} size={43}>{w[4]}</Text></g></g>
  <g clipPath='url(#individual-copy)'><Record x={mix(35,660,take)} y={mix(195,130,final)} s={mix(.95,.83,final)}/>
  {fixed.placeholderY<600&&<Box x={230} y={fixed.placeholderY} w={240} h={214} fill='#292e2b' r={18}/>}</g>
  {fixed.conclusion>0&&<g transform={`translate(42 ${mix(215,120,final)+50*(1-fixed.conclusion)}) scale(${fixed.conclusion})`}><Text x={0} y={0} size={mix(70,44,final)}>{w[5]}</Text></g>}
  {headline>0&&<g transform={`translate(42 ${255+45*(1-headline)}) scale(${headline})`}><Text x={0} y={0} size={83}>{w[6]}</Text><rect x={0} y={27} width={12} height={53} rx={5} fill={C}/></g>}
 </g>}
 </>;}
