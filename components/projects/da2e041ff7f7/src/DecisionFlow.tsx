import React from 'react';
import {Easing,interpolate} from 'remotion';
// EP99 adaptation of retained C04 Matrix's staggered point-to-pill expansion
// and EP95 row29's centered join-and-consolidate. No EP95 copy is modified.
const q=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:Easing.bezier(.22,.8,.2,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const abs:React.CSSProperties={position:'absolute'};
function Pill({text,x,y,w=540,h=182,appear=1,dark=true,size=88}:{text:string;x:number;y:number;w?:number;h?:number;appear?:number;dark?:boolean;size?:number}){return <div style={{...abs,left:x,top:y,width:w,height:h,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:h/2,background:dark?'#131315':'#fff',color:dark?'#fff':'#161618',boxShadow:'0 14px 32px #00000013',border:dark?'none':'2px solid #ddd',fontSize:size,fontWeight:600,whiteSpace:'nowrap',opacity:appear,transform:`translate(-50%,-50%) scale(${lerp(.78,1,appear)})`}}>{text}</div>}
export function Decisions({f,background}:{f:number;background:React.ReactNode}){
 const enter=q(f,0,28),turn=q(f,200,231),done=q(f,341,379);
 const words=['售后问题？','需要退款？','物流问题？','是否紧急？','送到哪里？','符合标准？'];
 return <>
 <div style={{...abs,inset:0,filter:`blur(${18*enter}px)`}}>{background}</div><div style={{...abs,inset:0,background:`rgba(255,255,255,${enter})`}}/>
 <div style={{...abs,inset:0,opacity:1-turn,transform:`translateY(${-120*turn}px)`}}>
 <div style={{...abs,left:160,top:225,width:1600,fontSize:112,fontWeight:600,textAlign:'center',opacity:enter}}>不是替代 Codex</div>
 <Pill text="Jev" x={600} y={610} appear={enter}/><Pill text="Codex" x={1320} y={610} dark={false} appear={q(f,64,91)}/>
 <div style={{...abs,left:905,top:551,width:110,textAlign:'center',fontSize:86,fontWeight:500,opacity:q(f,94,118),color:'#888'}}>+</div>
 </div>
 <div style={{...abs,inset:0,opacity:turn}}>
 <div style={{...abs,left:120,top:170,width:1680,textAlign:'center',fontSize:86,fontWeight:600,opacity:1-done}}>大量重复的小判断</div>
 <div style={{...abs,inset:0,opacity:1,transform:`translateX(${-2100*done}px)`,transformOrigin:'960px 560px'}}>
 {words.map((text,i)=>{const col=i%3,row=Math.floor(i/3),a=q(f,218+row*12+col*6,247+row*12+col*6),check=q(f,318+i*4,337+i*4);return <div key={text} style={{...abs,left:lerp(960,400+col*560,a),top:lerp(560,470+row*204,a),width:lerp(24,500,a),height:lerp(24,158,a),transform:'translate(-50%,-50%)',borderRadius:26,overflow:'hidden',background:check>.5?'#151517':'#f1f1f3',color:check>.5?'white':'#161618',display:'flex',alignItems:'center',justifyContent:'center',gap:22,fontSize:53,fontWeight:600,whiteSpace:'nowrap',opacity:a}}><span>{text}</span><span style={{opacity:check,fontSize:47}}>✓</span></div>})}
 </div>
 <div style={{...abs,inset:0,opacity:done,transform:`translateX(${2100*(1-done)}px)`}}><Pill text="Jev" x={960} y={370} w={500} h={170}/><div style={{...abs,left:110,top:540,width:1700,textAlign:'center',fontSize:145,fontWeight:600,letterSpacing:-3}}>更快，更便宜</div></div>
 </div>
 </>;
}
export function Routing({f}:{f:number}){
 const finish=q(f,263,296),xs=[370,960,1550],times=[0,100,160];
 return <>
 <div style={{...abs,inset:0,filter:`blur(${18*finish}px)`}}>
 <svg width={1920} height={1080} style={{...abs,inset:0}}>{[0,1].map(i=><path key={i} d={`M${xs[i]+258} 475 H${xs[i+1]-258}`} stroke='#aaa' strokeWidth={5} fill='none' pathLength={1} strokeDasharray={1} strokeDashoffset={1-q(f,times[i+1]-12,times[i+1]+12)}/>)}</svg>
 {['程序和脚本','Jev','Codex'].map((label,i)=>{const a=i===0?1:q(f,times[i],times[i]+24);return <div key={label} style={{opacity:a,transform:`translateY(${35*(1-a)}px)`}}><Pill text={label} x={xs[i]} y={475} w={520} h={205} size={label.length>4?67:100}/><div style={{...abs,left:xs[i]-260,top:650,width:520,textAlign:'center',fontSize:96,fontWeight:600}}>{['规则','筛选','分析'][i]}</div></div>})}
 {[0,1,2].map(i=>{const a=q(f,38+i*9,74+i*9),b=q(f,120+i*7,156+i*7),c=q(f,191+i*7,230+i*7);return <div key={i} style={{...abs,left:lerp(lerp(lerp(300+i*50,370,a),960,b),1550,c)-10,top:824,width:20,height:20,borderRadius:'50%',background:'#777',opacity:(1-c)*q(f,20+i*8,34+i*8)}}/>})}
 </div>
 <div style={{...abs,inset:0,background:`rgba(0,0,0,${.76*finish})`}}/>
 <div style={{...abs,left:90,top:405,width:1740,textAlign:'center',fontSize:176,lineHeight:1.4,fontWeight:600,color:'white',opacity:finish,transform:`translateY(${40*(1-finish)}px)`}}>更快，更省</div>
 </>;
}
