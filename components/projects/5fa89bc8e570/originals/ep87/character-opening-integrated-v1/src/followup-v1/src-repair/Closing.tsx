import React from 'react';
import {e,mix,Box,Text,Paper,Window,Stack,Title,Rule,Outline} from './graphics';
export function Clip13({t,page}:any){const w=page.words,c=page.cues,a=e(t,0,1),b=e(t,c[1],6.5),d=e(t,c[2],8.7);return <>
<Window x={mix(385,95,b)} y={mix(155,205,b)} w={mix(510,435,b)} h={mix(425,350,b)}><Text x={mix(280,214,b)} y={57} size={36} anchor='middle'>{w[0]}</Text><Stack x={mix(95,70,b)} y={105} s={mix(1.15,.83,b)*(.8+.2*a)} n={4} kind='grid'/></Window>
{b>0&&<g transform={`translate(${mix(1320,700,b)-30*d} 145)`}><Box w={510+70*d} h={450} fill='#f5f7f5'/><Text x={30} y={68} size={43} fill='#111'>{w[2]}</Text><Outline x={25} y={105} w={465+70*d} h={305}/></g>}
{b>.1&&<g transform={`translate(${mix(640,548,b)} 299)`}><Box w={120} h={53} fill='#232a26' r={26}/><Text x={60} y={38} size={31} anchor='middle'>{w[1]}</Text></g>}
<g transform={`translate(${mix(502,728,b)} ${mix(350,270,b)})`}><Rule w={mix(120,435,b)+50*d} h={52}/>{b>.9&&<Text x={mix(60,216,b)} y={39} size={36} fill='#111' anchor='middle'>{w[3]}</Text>}</g>
</>}
export function Clip14({t,page}:any){const w=page.words,c=page.cues,a=e(t,1.8,3),b=e(t,c[2],7.2),d=e(t,c[3],11.2),z=e(t,c[4],12.5);
return <><g transform={`translate(${mix(330,60,b)} ${mix(150,125,b)}) scale(${mix(1,.52,b)})`}><Text x={0} y={-30} size={40} fill='#111'>{w[0]}</Text>
<Box w={630} h={474} r={25}/>
<clipPath id='book-exit'><rect x={0} y={-30} width={630} height={504}/></clipPath><clipPath id='recap-grid'><rect width={630} height={474*e(a,.54,1)}/></clipPath>
{a<.46&&<g clipPath='url(#book-exit)'><g transform={`translate(125 ${-500*e(a,0,.46)}) scale(${1-a*.3})`}><Stack s={1.55}/><Text x={140} y={100} size={36} fill='#111' anchor='middle'>{w[1]}</Text></g></g>}
{a>.54&&<g clipPath='url(#recap-grid)'>{[0,1,2,3].filter(i=>i!==3||b<.01).map(i=><g key={i} transform={`translate(${(i%2)*315} ${Math.floor(i/2)*237+60*(1-a)})`}><Box w={295} h={217} r={20}/><Text x={20} y={42} size={32}>{w[i+2]}</Text>{i===1?<Outline x={38} y={65} w={219} h={135}/>:<Paper x={100} y={63} s={.58}/>}</g>)}</g>}</g>
{b>0&&<g transform={`translate(${mix(1340,490,b)-60*d} 145)`}><Text x={0} y={-30} size={40} fill='#111'>{w[6]}</Text><Box w={mix(485,320,d)} h={440} r={24}/><Text x={30} y={52} size={38}>{w[5]}</Text><Stack x={mix(120,65,d)} y={115} s={mix(1.13,.88,d)} n={3}/></g>}
{d>0&&<Window x={mix(1350,780,d)} y={145} w={410} h={mix(440,205,z)}><Text x={25} y={50} size={36}>{w[7]}</Text><Outline x={25} y={76} w={360} h={mix(310,112,z)}/></Window>}
{z>0&&<Window x={780} y={mix(760,375,z)} w={410} h={210}><Text x={25} y={50} size={36}>{w[8]}</Text><Outline x={25} y={75} w={360} h={115}/></Window>}
</>}
export function Clip15({t,page}:any){const w=page.words,c=page.cues,a=e(t,0,1),b=e(t,c[1],5.1),d=e(t,c[2],9.7);
return <><Window x={mix(220, mix(250,680,d),b)} y={130} w={mix(520,mix(770,500,d),b)} h={470}>
<Stack x={mix(125,100,b)-35*d} y={mix(120,115,b)} s={mix(1.18,1.22,b)-.12*d} n={4} highlight={b}/>
{b>0&&<Text x={mix(385,250,d)} y={65} size={mix(49,41,d)} anchor='middle'>{w[1]}</Text>}</Window>
<clipPath id="value-label-exit"><rect x={760} y={180} width={500} height={240}/></clipPath>
{b<.35&&<g clipPath="url(#value-label-exit)" transform={`translate(0 ${-300*e(b,0,.35)})`}><Text x={785} y={355} size={49} fill='#111'>{w[0]}</Text></g>}
{d>0&&<g transform={`translate(${mix(-550,90,d)} 245)`}><Text x={245} y={0} size={43} fill='#111' anchor='middle'>{w[2]}</Text><Outline x={25} y={58} w={440} h={185}/><Rule x={49} y={88} w={380} h={35}/></g>}</>}
export function Clip16({t,page}:any){const w=page.words,c=page.cues,b=e(t,c[1],4.5);return <>
<Window x={mix(430,95,b)} y={mix(100,180,b)} w={mix(430,370,b)} h={mix(490,380,b)}><Text x={mix(215,185,b)} y={63} size={41} anchor='middle'>{w[0]}</Text><Stack x={mix(100,80,b)} y={mix(135,115,b)} s={mix(1.14,.87,b)} n={3}/></Window>
{b>0&&<g transform={`translate(${mix(1320,515,b)} 125)`}><Box w={670} h={465} fill='#f5f7f5' r={26}/><Text x={335} y={78} size={56} fill='#111' anchor='middle'>{w[1]}</Text><Outline x={36} y={132} w={590} h={275}/><Rule x={60} y={160} w={542} h={34}/></g>}</>}
export function Clip17({t,page}:any){const w=page.words,c=page.cues,b=e(t,c[3],5.6),z=e(t,6,7);return <>
{b>0&&<Title text={w[3]} y={mix(55,145,b)} size={50} p={b}/>}
<g transform={`translate(${640*(1-mix(1,.8,b))} ${mix(0,90,b)}) scale(${mix(1,.8,b)})`}><Window x={120} y={100} w={1040} h={500}>
{[0,1,2].map(i=>{let p=e(t,c[i],c[i]+.65);return <g key={i} transform={`translate(${42+i*325} ${40+400*(1-p)})`}><Box w={306} h={420} r={22} fill={i===1?'#242a26':'#111'}/>{i===0?<><Paper x={64} y={40} s={.95}/>{[0,1,2].map(k=><g key={k}><rect x={92} y={94+k*56} width={115} height={30} rx={4} fill='#e3e8e4'/>{k<2&&<path d={`M150 ${124+k*56}v26`} stroke='#a4ada7' strokeWidth={3}/>}</g>)}</>:<Stack x={64} y={40} s={.95} n={i===2?2:1}/>}<Text x={153} y={350} size={37} anchor='middle'>{w[i]}</Text></g>})}
</Window></g></>}
export function Clip18({t,page}:any){const w=page.words,c=page.cues,a=e(t,0,1.1),b=e(t,c[1],3.8),d=e(t,c[2],7.3);
return <><Window x={mix(450,100,b)} y={mix(180,90,b)} w={mix(630,1080,b)} h={mix(385,550,b)}>
{b<.46&&<g transform={`translate(0 ${-450*e(b,0,.46)})`}><Text x={315} y={200} size={80} anchor='middle'>{w[1]}</Text></g>}
{b>.54&&d<1&&<g transform={`translate(0 ${650*d+550*(1-e(b,.54,1))})`}><Text x={60} y={145} size={94}>{w[2]}</Text><Text x={560} y={145} size={62}>{w[3]}</Text><Outline x={45} y={200} w={470} h={295}/><Outline x={560} y={200} w={475} h={295}/></g>}
{d>0&&<g><Box x={24} y={24} w={1032} h={502*d} fill='#fff' r={20}/>{d>.65&&<Text x={540} y={305} size={74} anchor='middle' fill='#111'>{w[4]}</Text>}</g>}
</Window><Text x={mix(130,145,b)} y={mix(430,153,b)} size={mix(95,37,b)} fill={d>.1?'#111':b>.8?'#fff':'#111'}>{w[0]}</Text></>}
