import React from 'react';
import {T,R,Sheet,Cells,Reveal,ease as e,mix,green} from './primitives';
import {summaryState} from './summary-state.mjs';
export function R2Clip10({t,page}:any){
 const w=page.words,band=e(t,4.4,5),up=e(t,8.2,8.9),q=e(t,8.75,9.2);const {sy,scale:ss,bandY,bandH}=summaryState(up);
 return <><R w={1280} h={720}/><R x={1280*(1-band)} y={bandY} w={1280*band} h={bandH} fill='#101110'/>
 <g transform={`translate(${mix(0,290,up)} ${sy}) scale(${ss})`}>
 <T x={151} y={mix(289,379,band)} size={mix(137,108,band)} fill={band>.75?'#fff':'#111'}>{w[1]}</T>
 <Reveal x={664} y={284} w={550} h={110} p={band} axis='x'><T x={700} y={379} size={108} fill='#fff'>{w[2]}</T></Reveal>
 <T x={161} y={mix(348,425,band)} size={24} fill={band>.75?'#fff':'#111'}>{w[0]}</T>
 <Reveal x={157} y={358} w={1000} h={190} p={mix(.23,1,e(t,.6,1.7))} axis='x'><Cells x={157} y={mix(365,436,band)} w={975} h={117} count={4} active={t>2.5?3:-1}/></Reveal>
 </g>
 <Reveal x={130} y={330} w={1070} h={112} p={q}><T x={640} y={419} size={98} anchor='middle'>{w[3]}</T></Reveal>
 {[0,1,2].map(i=>{const p=e(t,9.2+i*.2,9.65+i*.2);return p>0&&<g key={i} transform={`translate(0 ${60*(1-p)})`}><Reveal x={160+i*330} y={464} w={314} h={155} p={p}><R x={164+i*330} y={470} w={310} h={151} fill='#00000009'/><R x={160+i*330} y={464} w={310} h={148} fill='#fafbf8' stroke='#e0e4db'/><R x={181+i*330} y={489} w={116} h={12} fill='#b7bdb3'/><R x={181+i*330} y={513} w={161} h={6} fill='#dfe3da'/></Reveal></g>})}
 </>;
}
function AgendaRow({x=0,y=0,label='',dark=false,accent=false,width=1020}:any){return <g transform={`translate(${x} ${y})`}><R x={4} y={6} w={width} h={119} fill='#00000009'/><R w={width} h={119} fill='#fff' stroke='#e1e4dc'/><R w={745} h={119} fill={dark?'#242722':'#fff'} stroke={dark?'#242722':'#72796d'}/><T x={40} y={77} size={40} fill={dark?'#fff':'#111'}>{label}</T><path d='M350 8 H400 L443 51 V108 H714' stroke={accent?green:dark?'#6b7165':'#353d30'} strokeWidth={accent?7:4} fill='none'/><R x={451} y={11} w={274} h={88} fill='#fff'/><R x={480} y={38} w={125} h={11} fill='#b2bbae'/><R x={480} y={61} w={202} h={7} fill='#d8dfd3'/>{accent&&<R x={450} y={102} w={265} h={5} fill={green}/>}</g>}
export function R2Clip12({t,page}:any){
 const w=page.words,order=e(t,1.5,2.15),pull=e(t,7.1,7.8),spread=e(t,8.6,9.3),end=e(t,10.5,11.1);const s=mix(1,.68,spread),tx=mix(90,275,spread),ty=mix(152,140,spread)-30*end;
 return <><R w={1280} h={720}/><g transform={`translate(${tx} ${ty}) scale(${s})`}>
 {spread>0&&<R x={-32} y={-30} w={1087} h={530} fill='#fff' stroke='#e0e5db' sw={2}/>}
 <AgendaRow x={mix(0,45,order)} y={mix(0,137,order)} dark width={1010}/>
 <AgendaRow x={mix(35,0,order)} y={mix(137,0,order)} label={w[0]} dark accent={t>.6} width={1040}/>
 <Reveal x={765} y={2} w={285} h={113} p={e(t,3.2,3.65)} axis='x'><T x={785} y={82} size={62}>{w[1]}</T></Reveal>
 <g transform={`translate(0 ${mix(274,386,pull)})`}><AgendaRow label={w[2]} width={745}/><Reveal x={770} y={0} w={315} h={115} p={e(t,7.8,8.25)} axis='x'><T x={786} y={82} size={61}>{w[3]}</T></Reveal></g>
 </g><Reveal x={170} y={539} w={980} h={103} p={end}><T x={640} y={623} size={72} anchor='middle'>{w[4]}</T></Reveal></>;
}
export function R2Clip13({t,page}:any){
 const w=page.words,lift=e(t,1,2.2),next=e(t,4.1,4.8),teacher=e(t,5.6,6.1),focus=e(t,6.7,7.3);const s=mix(.53,1,lift),x=640-430*s,y=345-255*s;
 return <><R w={1280} h={720}/><g transform={`translate(${x} ${y}) scale(${s})`}>
 {[3,2,1].map(i=><g key={i} transform={`translate(${i*14} ${i*12})`}><R w={835-i*12} h={495} fill='#fff' stroke='#e0e3db' sw={1.5}/></g>)}
 <R x={4} y={8} w={860} h={500} fill='#00000008'/><R w={860} h={500} fill='#fff' stroke='#e5e8e0' sw={1.5} r={10}/>
 <Reveal x={38} y={28} w={785} h={75} p={1-next} axis='x'><T x={42} y={87} size={56}>{w[0]}</T></Reveal>
 {next>0&&<Reveal x={38} y={28} w={785} h={75} p={next} axis='x'><R x={38} y={28} w={785} h={77}/><T x={42} y={87} size={56}>{w[2]}</T></Reveal>}
 {[0,1,2,3].map(i=><g key={i}><R x={42+(i%2)*391} y={131+Math.floor(i/2)*171} w={373} h={155} fill='#f6f8f3' stroke={i===0&&t>1?green:'none'} sw={2}/><R x={57+(i%2)*391} y={151+Math.floor(i/2)*171} w={120} h={5} fill='#ccd3c7'/></g>)}
 {focus>0&&<Reveal x={40} y={23} w={770} h={82} p={focus} axis='x'><R x={40} y={23} w={770} h={82}/><T x={43} y={86} size={59}>{w[3]}</T></Reveal>}
 {focus>0&&<g transform={`translate(54 143) scale(${mix(.05,.39,focus)})`}><Cells w={884} h={340} count={2} active={0}/></g>}
 <Reveal x={296} y={-44} w={269} h={76} p={teacher}><R x={305} y={-33} w={249} h={54} fill='#090a08' r={24}/><T x={430} y={5} size={33} anchor='middle' fill='#fff'>{w[1]}</T></Reveal>
 </g></>;
}
