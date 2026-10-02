import React from 'react';
import {T,R,Sheet,Reveal,ease as e,mix,green,mint} from './primitives';
export function R2Clip5({t,page}:any){
 const w=page.words,a=e(t,2.2,2.85),b=e(t,4.9,5.5),c=e(t,6.5,7.1),d=e(t,8.2,8.8);
 const count=1+a+b+c,scale=mix(1.15,.88,e(t,4.2,4.8)),gap=296;
 const x=640-(248+gap*(count-1))*scale/2,y=mix(146,207,e(t,4.2,4.8));
 return <><R w={1280} h={720}/><T x={64} y={88} size={42}>{w[0]}</T>
 <g transform={`translate(${x} ${y}) scale(${scale})`}>
 <Reveal x={-16} y={-10} w={gap*3+280} h={472} p={d}><R x={-16} y={-10} w={gap*3+280} h={472} fill='#080908'/></Reveal>
 {[0,1,2,3].map(i=>{const p=[1,a,b,c][i];return p>0&&<g key={i} transform={`translate(${i*gap} ${i===1?(1-p)*220:i>1?(1-p)*410:0})`}><Reveal x={0} y={-65} w={280} h={530} p={p}><T x={124} y={-28} size={32} anchor='middle'>{w[i+1]}</T><Sheet w={248} h={450} dark answer={i===1} rows={i<2?2:3} stack={i===3?2:0} hand={i===3}/></Reveal></g>})}
 </g></>;
}
function Total({p=1,w}:any){return <g><T x={282} y={337} size={40}>{w[1]}</T>{[0,1,2].map(i=><R key={i} x={455} y={203+i*66} w={230+i*46} h={56} fill='#161815'/>)}<R x={455} y={426} w={385} h={64} fill='#161815'/><R x={469} y={440} w={153} h={34} r={4}/><path d={`M438 237 V418 H${438+416*p}`} stroke={green} strokeWidth={3} fill='none'/></g>}
function Rubric({p,w}:any){return <g><T x={470} y={202} anchor='middle' size={37}>{w[2]}</T><T x={775} y={202} anchor='middle' size={37}>{w[3]}</T><R x={355} y={229} w={230} h={330} fill='#171915'/><R x={607} y={229} w={368} h={330} fill='#171915'/>{[0,1,2,3,4].map(i=><g key={i}><R x={368} y={244+i*61} w={204} h={43} fill={i===1||i===2?'#222720':'#fafbf6'} r={4}/><R x={621} y={244+i*61} w={155} h={43} fill={i%2===0?'#fafbf6':'#222720'} r={4}/><R x={798} y={244+i*61} w={161} h={43} fill={i%2===1?'#fafbf6':'#222720'} r={4}/></g>)}<Reveal x={350} y={302} w={630} h={113} p={p} axis='x'><R x={358} y={303} w={224} h={111} fill='none' stroke={green} sw={5}/><R x={610} y={303} w={362} h={111} fill='none' stroke={green} sw={5}/></Reveal></g>}
export function R2Clip6({t,page}:any){
 const w=page.words,a=e(t,5.5,6.15),b=e(t,9.5,10.1),lift=e(t,11.8,12.45),pendingY=mix(340,140,lift);
 return <><R w={1280} h={720} fill='#000'/><T x={640} y={79} size={38} anchor='middle' fill='#fff'>{w[0]}</T>
 <R x={157} y={122} w={966} h={558} fill='#fdfdfb'/>
 {b<1&&<Reveal x={157} y={122} w={966} h={558} p={1-b} axis='x'>
 {a<1&&<Total p={e(t,2.5,3.2)} w={w}/>}
 {a>0&&<Reveal x={157} y={122} w={966} h={558} p={a} axis='x'><R x={157} y={122} w={966} h={558} fill='#fdfdfb'/><Rubric p={e(t,7.8,8.35)} w={w}/></Reveal>}
 </Reveal>}
 {b>0&&<Reveal x={157} y={122} w={966} h={558} p={b} axis='x'><R x={157} y={122} w={966} h={558}/><T x={240} y={572} size={25}>{w[1]}</T><T x={240} y={610} size={25}>{w[2]}</T><T x={240} y={648} size={25}>{w[3]}</T><R x={465} y={288} w={495} h={287} fill='#f6f8f4' stroke='#dce1d7'/><T x={712} y={520} size={40} anchor='middle'>{w[6]}</T><R x={490} y={340} w={444} h={99} fill='#fff' stroke='#e1e6de'/><g transform={`translate(0 ${pendingY-340})`}><R x={490} y={340} w={444} h={99} fill='#fff' stroke={green} sw={3}/><T x={712} y={403} size={36} anchor='middle'>{w[4]}</T></g>{lift>.97&&<T x={951} y={204} size={32}>{w[5]}</T>}</Reveal>}
 </>;
}
export function R2Clip8({t,page}:any){
 const w=page.words,a=e(t,2.4,3),fan=e(t,4.6,5.4),up=e(t,7.8,8.4);const dx=mix(0,-20,fan),dy=mix(0,-55,up);
 return <><R w={1280} h={720}/><g transform={`translate(${dx} ${dy})`}><T x={94} y={345} size={76}>{w[0]}</T><Reveal x={94} y={370} w={340} h={72} p={fan}><T x={94} y={429} size={65}>{w[2]}</T></Reveal>
 <g transform='translate(550 199)'><R y={0} w={mix(270,680,a)} h={44} stroke='#656c60' sw={1.5}/><T x={20} y={30} size={25}>{w[1]}</T>{[0,1,2,3,4].map(i=><R key={i} x={170+i*95} y={9} w={55*a} h={25} fill={i===0?mint:'#f4f6f0'}/>)}
 {[7,6,5,4,3,2,1,0].map(i=><g key={i} transform={`translate(${i*76*fan} 78)`}><Sheet w={164} h={255} rows={3}/></g>)}
 <R x={-12} y={-20} w={4} h={92} fill={green}/><R x={0} y={354} w={mix(190,690,fan)} h={3} fill={up>0?green:'#252b21'}/></g></g>
 <Reveal x={230} y={530} w={970} h={96} p={up}><T x={670} y={601} size={68} anchor='middle'>{w[3]}</T></Reveal></>;
}
