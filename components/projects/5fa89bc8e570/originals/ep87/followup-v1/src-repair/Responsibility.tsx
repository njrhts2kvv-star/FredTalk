import React from 'react';
import {e,mix,Box,Text,Paper,Window,Stack,Title,Rule,Outline} from './graphics';
export function Clip9({t,page}:any){const w=page.words,c=page.cues,a=e(t,0,1.2),b=e(t,c[1],6.8),d=e(t,c[2],9.1);return <>
<Window x={mix(240,105,b)} y={110} w={mix(800,530,b)} h={495}><Text x={44} y={67} size={38}>{w[0]}</Text><Text x={44} y={119} size={40}>{w[1]}</Text><Stack x={70} y={mix(225,206,a)} s={.94} n={3} kind='grid'/><Paper x={270} y={192} s={.78}/></Window>
{b>0&&<g transform={`translate(${mix(1125,720,b)} 110)`}><Box w={465} h={495} fill='#fafbfa'/><Text x={40} y={70} size={44} fill='#111'>{w[3]}</Text>{d>0&&<Text x={40} y={132} size={48} fill='#111'>{w[4]}</Text>}</g>}
<g transform={`translate(${mix(675,805,b)} ${mix(260,325,d)})`}><Paper s={1.1}/>{t>2.2&&<><Rule x={20} y={91} w={155}/><Text x={99} y={119} size={34} anchor='middle' fill='#111'>{w[2]}</Text></>}</g>
</>}
export function Clip10({t,page}:any){const w=page.words,c=page.cues,b=e(t,c[1],5.2),d=e(t,c[2],9.6);return <>
<Window x={mix(290,90,d)} y={mix(165,215,d)} w={mix(700,590,d)} h={mix(390,345,d)}>
<Text x={30} y={52} size={29}>{w[0]}</Text><Stack x={mix(42,25,b)} y={90} s={mix(1,.7,b)} kind='grid' n={2}/>
<Text x={mix(440,330,b)} y={190} size={mix(65,49,b)} anchor='middle'>{w[1]}</Text>
{b>0&&<g transform={`translate(0 ${45*(1-b)})`}><Text x={mix(440,350,b)} y={270} size={48} anchor='middle'>{w[2]}</Text></g>}
</Window>{d>0&&<g transform={`translate(${mix(1330,720,d)} 130)`}><Box w={470} h={475} fill='#f6f8f6' r={28}/><Text x={36} y={76} size={44} fill='#111'>{w[3]}</Text><Outline x={25} y={120} w={420} h={320}/></g>}</>}
export function Clip11({t,page}:any){const w=page.words,c=page.cues,b=e(t,c[1],5.5),d=e(t,c[2],9.4),z=e(t,12,13.3);
return <><Window x={mix(150,80,d)} y={110} w={mix(980,550,d)} h={490}>
<g style={{display:b<1?undefined:'none'}} transform={`translate(0 ${-180*b})`}><Text x={290} y={72} size={44} anchor='middle'>{w[0]}</Text><Text x={650} y={72} size={44} anchor='middle'>{w[1]}</Text></g>
<clipPath id='common-title'><rect x={0} y={0} width={1000} height={98}/></clipPath>
{b>.6&&<g clipPath='url(#common-title)'><Text x={mix(490,275,d)} y={75+80*(1-e(b,.6,1))} size={mix(46,39,d)} anchor='middle'>{w[2]}</Text></g>}
{[0,1,2].map(i=><g key={i} transform={`translate(${mix(95+i*285,150+i*30,b)-75*d} ${mix(132,150,b)+i*10*b}) scale(${mix(1.2,1.1,d)})`}><Paper/><Rule x={18} y={101} w={144} progress={e(t,.6+i*.4,1.4+i*.4)}/></g>)}
</Window>{d>0&&<Window x={mix(1360,660,d)} y={110} w={535} h={490}><Text x={267} y={75} size={42} anchor='middle'>{t<10.7?w[3]:w[4]}</Text><Stack x={115} y={145} s={1.1} n={3} highlight={1}/>{z>0&&<g transform={`translate(50 ${mix(470,360,z)})`}><Box w={435} h={95} fill='#f1f5f2' r={15}/><Text x={217} y={62} size={38} anchor='middle' fill='#111'>{w[5]}</Text></g>}</Window>}</>}
export function Clip12({t,page}:any){const w=page.words,c=page.cues,a=e(t,.5,1.8),b=e(t,c[1],6.1),d=e(t,c[2],10.4);const s=mix(1,.85,d);return <><g transform={`translate(${640*(1-s)} ${25*d}) scale(${s})`}><Window x={130} y={90} w={1020} h={520}>
<g transform={`translate(35 35) scale(${mix(.65,1,a)-.17*b})`}><Text x={50} y={45} size={40}>{w[0]}</Text><Stack x={75} y={115} s={1.28} n={3}/><Rule x={105} y={251} w={176}/><Text x={195} y={279} size={40} fill='#111' anchor='middle'>{w[1]}</Text></g>
{b>0&&<g transform={`translate(${mix(1100,535,b)} 58)`}><Text x={220} y={37} size={37} anchor='middle'>{w[2]}</Text><Outline x={0} y={85} w={435} h={300}/><Rule x={35} y={120} w={365} h={60}/><Text x={217} y={162} size={46} anchor='middle' fill='#111'>{w[3]}</Text></g>}
</Window></g>{d>0&&<Title text={w[4]} y={622} size={62} p={d}/>}</>}
