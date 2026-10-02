import React from 'react';
import {box} from './primitives';
const ramp=(t:number,a:number,b:number)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const ease=(v:number)=>v*v*(3-2*v);
export const denialState=(t:number)=>({
 border:ease(ramp(t,3.15,3.55)),
 title:ease(ramp(t,3.36,3.70)),
 sparkle:t<3.32||t>4.08?0:Math.sin(Math.PI*ramp(t,3.32,4.08))*(.72+.28*Math.cos((t-3.32)*Math.PI*9)),
});
export const Denial:React.FC<{t:number,x:number}>=({t,x})=>{
 const s=denialState(t);
 return <>
 <div style={{...box(x,570,590,450),background:'#e3e4e1',borderRadius:55,display:'flex',alignItems:'center',justifyContent:'center',fontSize:105,fontWeight:700,letterSpacing:-6,color:'#333432'}}>
 无权访问
 <svg style={{position:'absolute',inset:0,width:590,height:450,overflow:'visible'}}>
 <rect x="2" y="2" width="586" height="446" rx="53" stroke="#131413" strokeWidth="4" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1-s.border}/>
 {s.sparkle>0&&[[0,0,-1,-1],[590,0,1,-1],[0,450,-1,1],[590,450,1,1]].map(([cx,cy,dx,dy],i)=>{
 const distance=10+9*(1-s.sparkle),length=17*s.sparkle;
 return <g key={i} stroke="#242524" strokeWidth={2.5*s.sparkle} strokeLinecap="round">
 <path d={`M ${cx+dx*distance} ${cy+dy*distance} l ${dx*length} ${dy*length}`}/>
 {(i===2||i===3)&&<path d={`M ${cx-dx*50} ${cy+dy*(20+distance)} l ${dx*length*.4} ${dy*length*.7}`}/>}
 </g>;
 })}
 </svg>
 </div>
 {t>=3.36&&<div style={{...box(x,264,740,156),overflow:'hidden',textAlign:'center'}}>
 <div style={{position:'absolute',inset:0,fontSize:107,lineHeight:'156px',fontWeight:600,letterSpacing:-10,whiteSpace:'nowrap',color:`rgb(${Math.round(8+140*(1-s.title))},${Math.round(8+140*(1-s.title))},${Math.round(8+140*(1-s.title))})`,transform:`translateY(${135*(1-s.title)}px)`}}>不越权读取</div>
 </div>}
 </>;
};
