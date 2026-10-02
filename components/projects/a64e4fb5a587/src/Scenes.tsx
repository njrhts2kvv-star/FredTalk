import React from 'react';
import {AbsoluteFill,Img,staticFile,interpolate,Easing} from 'remotion';
import manifest from '../manifest.json';
const B='#111111',W='#ffffff',P='#bda4fa';
// EP91 intro / approved A43 exact crisp curve and large-object smootherstep.
const q=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{easing:Easing.bezier(.16,1,.3,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const s=(t:number,a:number,b:number)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*p*(p*(p*6-15)+10)};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const T=({x=0,y=0,size=60,fill=B,anchor='middle',weight=600,children}:any)=><text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight}>{children}</text>;
// EP91 masked vertical copy entry, preserving sharp letterforms.
const Slot=({t,at,x=960,y=400,w=1700,h=150,children}:any)=><svg x={x-w/2} y={y} width={w} height={h} overflow="hidden"><g transform={`translate(${w/2} ${h*(1-q(t,at,at+.45))})`}>{children}</g></svg>;
const Tick=({x=0,y=0,p=1,color=B}:any)=><path d={`M${x-15} ${y} l12 12 l27 -31`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/>;
const Surface=({x=0,y=0,w=400,h=250,fill=W,r=20,shadow=false}:any)=><rect x={x} y={y} width={w} height={h} rx={r} fill={fill} filter={shadow?'url(#soft)':undefined}/>;
const Stage=({children}:any)=><svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position:'absolute',fontFamily:'FredMiSans',fontSynthesis:'none'}}><defs><filter id="soft" x="-30%" y="-30%" width="160%" height="190%"><feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#000" floodOpacity=".12"/></filter></defs>{children}</svg>;
export function Bridge({t}:any){const w=manifest.copy.bridge;const wipe=s(t,5.3667,6.08);const collect=s(t,8.58,9.24),field=0,exit=q(t,10.32,10.43);
 return <AbsoluteFill style={{background:W}}>{wipe<1&&<Img src={staticFile('opening-tail.png')} style={{width:1920,height:1080,objectFit:'cover',transform:`translateX(${-1920*wipe}px)`}}/>}<Stage>
 {[0,1,2].map(i=>{const enter=q(t,5.69+i*.23,6.55+i*.23);const y=340+(1-enter)*160-100*collect;const x=[310,790,1230][i]+(1-enter)*1450;const ww=[410,360,420][i];return <g key={i} transform={`translate(${x} ${y}) scale(${1-.15*collect})`}>
 <Surface w={ww} h={330} fill={i===1?B:W} r={32} shadow/>
 <T x={ww/2} y={83} size={i===2?56:65} fill={i===1?W:B}>{w[i]}</T>
 {i<2?<><rect x={70} y={159} width={ww-140} height={95} rx={48} fill={i===1?'#343434':'#eee'}/><circle cx={i===0?mix(ww-115,115,q(t,6.82,7.35)):mix(115,ww-115,q(t,7.15,7.68))} cy={206} r={39} fill={i===0?P:W}/></>:<>{[0,1,2].map(j=><g key={j}><rect x={64} y={139+j*52} width={28} height={28} rx={6} fill={P}/><Tick x={77} y={154+j*52} p={q(t,7.25+j*.16,7.58+j*.16)} color={B}/><rect x={116} y={149+j*52} width={[200,160,182][j]*q(t,7.15+j*.16,7.55+j*.16)} height={10} rx={5} fill="#aaa"/></g>)}</>}
 </g>})}
 {collect>0&&<g transform={`translate(960 ${820-140*collect}) scale(${collect})`}><T size={88}>{w[3]}</T></g>}
 {field>0&&<><Surface x={mix(790,0,field)} y={mix(340,0,field)} w={mix(360,1920,field)} h={mix(330,1080,field)} r={32*(1-field)} fill={B}/><g transform={`translate(0 ${-600*exit})`}><Slot t={t} at={9.28} y={405} h={150}><T y={110} size={102} fill={W}>{w[3]}</T></Slot></g></>}
 </Stage></AbsoluteFill>;
}
function Workflow({t,x=960,y=495,scale=1,at=24.4,completed=false,showTitle=true}:any){const w=manifest.copy.rule;return <g transform={`translate(${x} ${y}) scale(${scale})`}>
 {showTitle&&<T y={-246} size={76} fill={W}>{w[10]}</T>}
 {[w[11],w[12],w[13]].map((label,i)=>{const enter=completed?1:q(t,at+i*.18,at+.6+i*.18),done=completed?1:q(t,at+.7+i*.42,at+1.1+i*.42);return <g key={label} transform={`translate(${-545+i*365} ${-140+80*(1-enter)}) scale(${enter})`}>
 <Surface w={330} h={320} fill={W} r={20}/><T x={165} y={70} size={48}>{label}</T>
 {[0,1,2].map(j=><rect key={j} x={40} y={112+j*37} width={[230,175,205][j]*done} height={13} rx={4} fill={j===0&&i===1?'#999':'#ddd'}/>)}
 <circle cx={275} cy={270} r={24} fill="#ddd"/><Tick x={274} y={269} p={done}/></g>})}
 </g>}
export function Rule({t}:any){const w=manifest.copy.rule;const choose=q(t,15.80,16.48),push=s(t,17.2,18.76),doc=q(t,18.77,19.25),threshold=s(t,20.766,21.40),complex=s(t,24.4,25.03);
 return <AbsoluteFill style={{background:B}}><Stage>
 {t<18.77&&<g transform={`translate(960 ${470-90*choose}) scale(${1+1.05*push})`}>
 <g transform={`translate(0 ${-430*choose-150*q(t,13.5,14.2)})`}><Slot t={t} at={12.39} x={0} y={-130} h={145}><T y={110} size={112} fill={W}>{w[0]}</T></Slot><Slot t={t} at={13.65} x={0} y={50} h={90}><T x={-85} y={61} size={56} fill={P}>{w[1]}</T><rect x={90} y={16} width={126} height={52} rx={26} fill="#444"/><circle cx={mix(116,190,q(t,14.25,14.8))} cy={42} r={21} fill={P}/></Slot></g>
 {t>=13.65&&<g transform={`translate(0 ${160*(1-choose)})`}>
 {manifest.copy.skillSteps.map((label,i)=><g key={i} transform={`translate(0 ${-85+i*108})`}><rect x={-420} y={-45} width={840*q(t,13.65+i*.2,14.3+i*.2)} height={80} rx={10} fill="#242424"/><T y={10} size={40} fill="#ddd">{label}</T></g>)}
 {choose>0&&<><Surface x={-560} y={-59} w={1120*choose} h={118} r={14} fill={P}/><svg x={-560} y={-60} width={1120*choose} height={120} overflow="hidden"><T x={560} y={81} size={78}>{w[2]}</T></svg></>}</g>}
 </g>}
 {t>=18.77&&complex<1&&<>
 <rect width={1920} height={1080} fill={W}/>
 {threshold<1&&<g transform={`translate(${-1920*threshold} ${110*(1-doc)})`}>
 <T x={960} y={235} size={76}>{w[2]}</T>
 <rect x={340} y={315} width={1240} height={295} rx={20} fill="#f4f4f4"/>
 <rect x={720} y={336} width={480*q(t,19.35,19.76)} height={74} rx={8} fill={P}/><T x={960} y={393} size={62}>{w[3]}</T>
 <rect x={540} y={428} width={840*q(t,19.70,20.17)} height={76} rx={8} fill={P}/><T x={960} y={486} size={62}>{w[4]}</T><T x={960} y={577} size={62}>{w[5]}</T>
 <svg x={300} y={680} width={1320} height={160} overflow="hidden"><rect width={1320} height={160} fill={W}/><T x={660} y={108} size={94}>{w[6].slice(0,Math.floor(Math.max(0,t-19.05)*7))}</T></svg>
 </g>}
 {threshold>0&&<g transform={`translate(${1920*(1-threshold)} 0)`}>
 <T x={475} y={543} size={260}>{w[7]}</T><T x={475} y={664} size={67} fill="#737373">{w[8]}</T>
 <Slot t={t} at={22.8} x={1275} y={350} w={850} h={130}><T y={95} size={87}>{w[9].replace(' Skill','')}</T></Slot>
 <Slot t={t} at={23.0} x={1275} y={492} w={850} h={160}><T y={120} size={145}>Skill</T></Slot>
 </g>}
 </>}
 {complex>0&&<>
 <rect width={1920} height={1080} fill={B}/>
 <Workflow t={t}/>
 <Slot t={t} at={26.1} y={767} h={90}><T y={62} size={57} fill={W}>{w[14]}</T></Slot>
 {complex<1&&<g transform={`translate(${mix(0,765,complex)} ${mix(0,355,complex)}) scale(${mix(1,.19,complex)})`}><Surface w={1920} h={1080} fill={W}/><T x={475} y={543} size={260}>{w[7]}</T><T x={475} y={664} size={67}>{w[8]}</T><T x={1275} y={440} size={87}>{w[9].replace(' Skill','')}</T><T x={1275} y={615} size={145}>Skill</T></g>}
 </>}
 </Stage></AbsoluteFill>;
}
function WebPage({t,forceDone=false}:any){const w=manifest.copy.task;const edit=forceDone?1:q(t,30.05,30.5),align=forceDone?1:s(t,31.05,31.90);return <g>
 <Surface x={-700} y={-285} w={1400} h={570} r={27} fill={W}/>
 <g transform={`translate(${mix(-215,0,align)} 0)`}><T y={-120} size={94}>{w[1]}</T>
 <rect x={-360} y={-57} width={720} height={26} rx={8} fill="#eee"/><rect x={-285} y={-9} width={570} height={20} rx={7} fill="#f0f0f0"/>
 <Surface x={-205} y={67} w={410} h={110} fill={B} r={18}/>
 {edit<1?<><T y={143} size={53} fill={W}>{w[2]}</T><rect x={-140} y={89} width={280*q(t,29.94,30.17)} height={70} fill="#bda4fa55"/></>:<T y={143} size={53} fill={W}>{w[3]}</T>}
 {t>=29.94&&t<30.65&&<rect x={145} y={91} width={3} height={67} fill={P}/>}</g>
 </g>}
export function Task({t}:any){const w=manifest.copy.task,enter=s(t,27.7667,28.5),crowd=s(t,32.4,33.25),inspect=s(t,35.03,35.70),remove=s(t,37.12,38.0),recover=s(t,37.6,38.4),compare=s(t,39.4667,40.25);
 const cx=mix(mix(960,370,crowd),960,recover)*(1-compare)+510*compare;
 const cy=mix(mix(505,612,crowd),500,recover);const size=mix(mix(1,.39,crowd),1,recover)*(1-compare)+.43*compare;
 return <AbsoluteFill style={{background:B}}><Stage>
 {enter<1&&<g transform={`translate(${-1800*enter} 0)`}><Workflow t={t} completed/></g>}
 <g transform={`translate(${cx+1900*(1-enter)} ${cy}) scale(${size})`}><WebPage t={t}/></g>
 {enter===1&&crowd<1&&<><Slot t={t} at={28.55} y={99} h={90}><T y={60} size={58} fill={W}>{t<29.94?w[0]:t<31.05?w[4]:w[5]}</T></Slot></>}
 {crowd>0&&recover<1&&<>
 {[0,1,2].map(i=>{const z=q(t,32.4+i*.27,33.1+i*.27);const x=760+i*285+1600*(1-z)+1900*remove;const y=220+i*95+130*inspect;return <g key={i} transform={`translate(${x} ${y}) rotate(${(-5+i*4)*(1-inspect)})`}>
 <Surface w={450} h={420} fill={i===2?W:'#e9e9e9'} r={20} shadow/><T x={225} y={80} size={49}>{w[6+i]}</T>
 <rect x={32} y={130} width={386} height={100} rx={12} fill="#ddd"/><T x={225} y={190} size={30}>{w[10]}</T>
 {[0,1,2,3].map(j=><rect key={j} x={38} y={260+j*30} width={[345,268,315,220][j]} height={13} rx={4} fill="#ccc"/>)}</g>})}
 <g transform={`translate(${-1500*inspect} 0)`}><Slot t={t} at={33.2} x={370} y={386} w={800} h={120}><T y={90} size={89} fill={W}>{w[9]}</T></Slot></g>
 {inspect>0&&remove<1&&<g transform={`translate(960 ${-180+380*inspect-800*remove})`}><Surface x={-675} y={-75} w={1350} h={150} fill={W} r={18}/><T x={-570} y={18} size={52} anchor="start">{w[10]}</T><T x={245} y={18} size={37}>{w[11]}</T><Surface x={430} y={-44} w={190} h={88} fill={B} r={14}/><T x={525} y={15} size={42} fill={W}>{w[12]}</T></g>}
 {t>=36.5&&t<37.12&&<g transform={`translate(${mix(1770,1490,q(t,36.5,36.95))} ${mix(400,215,q(t,36.5,36.95))})`}><path d="M0 0 L0 42 L12 31 L23 53 L32 48 L22 28 L38 28 Z" fill={W} stroke={B} strokeWidth={3}/></g>}
 </>}
 {recover>0&&compare===0&&<Slot t={t} at={38.18} y={111} h={100}><T y={65} size={58} fill={W}>{w[15]}</T></Slot>}
 {compare>0&&<><g transform={`translate(0 ${90*(1-compare)})`}><T x={510} y={210} size={64} fill={W}>{w[0]}</T><T x={510} y={735} size={44} fill={W}>{w[15]}</T></g><g transform={`translate(${1550*(1-compare)} 0)`}><Workflow t={t} x={1370} y={484} scale={.76} completed showTitle={false}/><T x={1370} y={210} size={64} fill={W}>{w[13]}</T><T x={1370} y={735} size={48} fill={W}>{w[14]}</T></g></>}
 </Stage></AbsoluteFill>;
}
