import React from 'react';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame} from 'remotion';
import {box,Card,Person,Pill,Ring,blue} from './primitives';
import {Denial} from './Denial';
import './fonts';
const ease=(p:number)=>p*p*(3-2*p);
const p=(t:number,a:number,b:number)=>ease(Math.max(0,Math.min(1,(t-a)/(b-a))));
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const SixthSentence:React.FC=()=>{
const t=useCurrentFrame()/60;
const lift=p(t,.75,1.55),split=p(t,1.7,2.55),flow=p(t,5.7,6.6);
const pan=p(t,9.25,10.3),pull=p(t,11.65,12.8);
const worldScale=mix(1,.64,pull),worldX=mix(-650*pan,45,pull),worldY=310*pull;
const rx=mix(mix(960,620,split),530,flow);
const ry=mix(mix(640,565,lift),575,flow);
const rw=mix(mix(335,610,lift),530,flow),rh=mix(mix(255,460,lift),400,flow);
const trace=t>.9&&t<1.9?p(t,.9,1.65):0;
const taskIn=p(t,7.65,8.25),chatIn=p(t,9.75,10.35);
return <AbsoluteFill style={{background:'#FFFFFF',fontFamily:'MiSans',color:'#121212',overflow:'hidden'}}>
<style>{`*{box-sizing:border-box}`}</style>
<Audio src={staticFile('sixth-sentence/source-audio.m4a')}/>
<div style={{position:'absolute',width:1920,height:1080,transform:'scale(2)',transformOrigin:'top left',fontWeight:500}}>
{t<2.6&&<div style={{position:'absolute',inset:0,transform:`translateX(${-2200*split}px)`}}>
<div style={{...box(960,560,1190,600),border:'4px solid #262626',borderRadius:75,background:'linear-gradient(#fff 0 40%,#e7ebed 40% 100%)',boxShadow:'0 22px 50px #00000017'}}/>
{[570,960,1350].map((x,i)=><Person key={i} x={x} label={['HR','业务面试官','负责人'][i]}/>)}
<Card x={570} y={640} w={335} h={255} title="对比表"/>
<Card x={1350} y={640} w={335} h={255} title="进度看板"/>
<Pill x={960} y={960} w={470} h={110} text="无需复制粘贴"/>
{t<.8&&<Ring x={mix(1220,1370,p(t,0,.7))} y={255}/>}
</div>}
<div style={{position:'absolute',inset:0,transformOrigin:'0 0',transform:`translate(${worldX}px,${worldY}px) scale(${worldScale})`}}>
<Card x={rx} y={ry} w={rw} h={rh} title="面试记录" trace={trace}/>
{t>=1.8&&t<6.65&&<div style={{transform:`translateX(${2100*flow}px)`}}>
<Denial t={t} x={mix(2200,1430,split)}/>
</div>}
{t>2&&t<6.5&&<Ring x={mix(1070,820,p(t,5.7,6.5))} y={mix(565,615,p(t,6.2,6.5))} t={t}/>}
{t>=5.9&&<><svg style={{position:'absolute',inset:0,width:2500,height:1080,overflow:'visible'}}>
<path d={`M530 838 H${mix(530,2250,p(t,6,10.55))}`} fill="none" stroke="#242424" strokeWidth="4"/>
<circle cx="530" cy="838" r="20" stroke="#333" strokeWidth="4" fill="white"/>
{t>8.3&&<circle cx="1600" cy="838" r="20" stroke="#333" strokeWidth="4" fill="white"/>}
{t>10.5&&<path d="M2220 810l30 28-30 28" stroke="#222" strokeWidth="4" fill="none"/>}
</svg>
<div style={{transform:`translateY(${180*(1-p(t,6.45,7.1))}px)`,clipPath:t<6.45?'inset(100%)':undefined}}><Pill x={1050} y={785} w={350} h={160} text="Agent"/></div>
{t>7.6&&<div style={{transform:`translateX(${700*(1-taskIn)}px)`}}><Card x={1600} y={570} w={530} h={400} title="跟进任务" task trace={t<9.3?p(t,8.1,8.8):0}/></div>}
{t>9.7&&<div style={{...box(2170,685,525,170),transform:`scale(${mix(.35,1,chatIn)})`,border:'4px solid #242424',background:'white',borderRadius:85,display:'flex',alignItems:'center',justifyContent:'center',fontSize:61,fontWeight:700,whiteSpace:'nowrap'}}>
群内提醒反馈
<svg width="45" height="40" style={{position:'absolute',right:-12,bottom:-9}}><path d="M2 2L39 34 1 25" fill="white" stroke="#242424" strokeWidth="4"/></svg>
</div>}
{t>=6.5&&t<10.8&&<Ring x={t<7.7?mix(820,2150,p(t,7,7.7)):t<9.4?mix(2150,1630,p(t,7.7,8.5)):mix(1630,1908,p(t,9.4,10.3))} y={t<7.7?mix(615,838,p(t,7,7.7)):t<9.4?838:mix(838,685,p(t,9.4,10.3))}/>}
</>}
</div>
{t>12.1&&<div style={{position:'absolute',inset:0,transformOrigin:'960px 345px',transform:`scale(${mix(.65,1,p(t,12.1,12.65))})`}}><Pill x={960} y={345} w={655} h={180} text="推进招聘流程"/></div>}
</div>
</AbsoluteFill>;
};
