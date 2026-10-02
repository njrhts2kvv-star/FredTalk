import React from 'react';
import {e,mix,Box,Text,Paper,C,Window,Stack,Title,Rule} from './graphics';
export function Clip5({t,page}:any){const w=page.words,c=page.cues,a=e(t,0,1.4),end=e(t,9.6,10.6),s=mix(1,.86,end);
return <g transform={`translate(${640*(1-s)} ${350*(1-s)}) scale(${s})`}><Window x={mix(310,130,a)} y={mix(210,60,a)} w={mix(660,1020,a)} h={mix(330,610,a)}>
<Text x={38} y={64} size={mix(58,34,a)}>{w[0]}</Text>{t>1.4&&t<9.9&&<Text x={240} y={64} size={32}>{w[1]}</Text>}
{[0,1,2,3].map(i=>{const p=e(t,c[i+1],c[i+1]+.6),x=38+(i%2)*480,y=106+Math.floor(i/2)*239;return p>0&&<g key={i} transform={`translate(${x} ${y+70*(1-p)}) scale(${.85+.15*p})`}><Box w={464} h={216} fill='#1d1f1e' r={14}/><Paper x={171} y={12} s={.65} kind={i===2?'grid':'sheet'}/>{i===1&&<Rule x={184} y={75} w={90} h={17}/>}<Text x={232} y={199} size={30} anchor='middle'>{w[i+2]}</Text></g>})}</Window></g>}
export function Clip6({t,page}:any){const w=page.words,c=page.cues,a=e(t,0,.9),b=e(t,c[1],c[1]+1),d=e(t,c[2],c[2]+1.3),z=e(t,11.2,12.3);const x=mix(360,95,b),width=mix(560,740,b)-70*d;
return <><Title text={w[0]} y={95} size={44}/><Window x={x} y={150} w={width} h={410}>
<g transform={`translate(${mix(190,35,b)} ${mix(55,48,b)}) scale(${mix(1.2,.91,b)*(.9+.1*a)})`}><Stack n={Math.round(3-2*b)} kind='grid'/><Rule y={178} x={18} w={144} h={12} progress={e(t,1.3,2.7)}/></g>
<Text x={mix(298,117,b)} y={378} size={32} anchor='middle'>{w[1]}</Text>
{b>0&&<g transform={`translate(${220+500*(1-b)} 48)`}><Paper s={.91} kind='grid'/><Paper x={195} s={.91} kind='grid'/><Rule x={16} y={100} w={132} progress={e(t,5.5,6.5)}/><Rule x={210} y={100} w={132} progress={e(t,5.5,6.5)}/><Text x={82} y={330} size={30} anchor='middle'>{w[2]}</Text><Text x={276} y={330} size={30} anchor='middle'>{w[3]}</Text></g>}
</Window>
{d>0&&<Window x={mix(1330,790,d)} y={150} w={395} h={410}><Text x={104} y={57} size={31} anchor='middle'>{w[5]}</Text><Box x={20} y={82} w={167} h={252} fill='#252a27' r={14}/><Box x={202} y={82} w={173} h={252} fill='#252a27' r={14}/><Paper x={221} y={116} s={.7}/><Text x={288} y={372} size={27} anchor='middle'>{w[6]}</Text>{z>0&&<g transform={`translate(${mix(-650,37,z)} ${mix(210,116,z)})`}><Paper s={.7}/><Text x={67} y={256} size={25} anchor='middle'>{w[4]}</Text></g>}</Window>}
</>}
export function Clip7({t,page}:any){const w=page.words,c=page.cues,b=e(t,c[1],c[1]+1),d=e(t,9.1,10.5),a=e(t,.8,2.2);
return <><Window x={mix(180,90,b)} y={mix(95,135,b)} w={mix(920,1100,d)} h={mix(510,445,d)}>
<g transform={`translate(${mix(62,25,b)} ${mix(42,28,b)}) scale(${mix(1.6,.55,b)})`}><Stack n={2} kind='grid'/><Text x={90} y={40} size={21} fill='#111' anchor='middle'>{w[0]}</Text><Rule x={18} y={101} w={144} progress={a}/></g>

{t<4.8&&<g transform={`translate(0 ${-300*b})`}><Text x={500} y={125} size={46}>{w[1]}</Text></g>}
<g transform={`translate(${mix(485,215,b)-70*d} ${mix(210,145,b)}) scale(${mix(.68,1.12,b)-.28*d})`}><Paper kind='grid'/><Paper x={215} kind='grid'/><Rule x={18} y={101} w={144} progress={e(t,5,6.5)}/><Rule x={233} y={101} w={144} progress={e(t,5,6.5)}/></g>
<clipPath id='rerun-title'><rect x={150} y={0} width={700} height={115}/></clipPath>
{b>.7&&<g clipPath='url(#rerun-title)'><Text x={mix(492,305,d)} y={85+80*(1-e(b,.7,1))} size={mix(44,34,d)} anchor='middle'>{w[2]}</Text></g>}
{t>7.8&&<g transform={`translate(0 ${60*(1-e(t,7.8,8.4))})`}><Box x={mix(318.7,193.4,d)} y={mix(440,355,d)} w={235} h={58} fill='#303934' r={29}/><Text x={mix(436.2,310.9,d)} y={mix(480,395,d)} size={34} anchor='middle'>{w[3]}</Text></g>}
{d>0&&<g transform={`translate(${650+700*(1-d)} 30)`}><Text x={170} y={55} size={42} anchor='middle'>{w[4]}</Text><Stack x={55} y={118} s={1.05} n={5}/></g>}
</Window></>}
export function Clip8({t,page}:any){const w=page.words,c=page.cues,b=e(t,c[1],c[1]+1),d=e(t,c[2],c[2]+1),s=mix(1,.83,d);
return <><Title text={b<.5?w[0]:w[2]} y={105-160*d} size={60}/><g transform={`translate(${640*(1-s)} ${-30*d}) scale(${s})`}><Window x={mix(390,95,b)} y={160} w={mix(500,1090,b)} h={mix(390,355,b)}><Box x={38} y={28} w={mix(290,970,b)} h={44} fill='#27342e' r={8}/><Text x={mix(190,545,b)} y={61} size={30} anchor='middle'>{w[1]}</Text>
{[0,1,2,3,4,5].map(i=>{const p=i<2?1:e(t,3.5+(i-2)*.16,4.3+(i-2)*.16);return p>0&&<g key={i} transform={`translate(${mix(55+i*180,40+i*171,b)} ${105+70*(1-p)})`}><Paper s={.78} kind='grid'/><Rule x={15} y={81} w={110} h={22}/></g>})}
</Window></g>{d>0&&<Title text={w[3]} y={610} size={65} p={d}/>}</>}
