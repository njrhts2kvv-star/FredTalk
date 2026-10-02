import React from 'react';
import {Easing,interpolate} from 'remotion';
// Adapted from retained EP82 Method: root moves aside, curved branches draw,
// each child establishes and settles, then the selected branch takes focus.
// Source: fred-remotion-output/assets/episode-code/ep82-preview-v5/src/Scenes.tsx, Method.
// EP99 changes: current work choices, monochrome surface, selection instead of
// Skill storage, and an opaque vertical handoff to actual Codex footage.
const q=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:Easing.bezier(.2,.8,.2,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
function Node({x,y,w,h,text,size,scale=1,opacity=1}:{x:number;y:number;w:number;h:number;text:string;size:number;scale?:number;opacity?:number}){
 return <div style={{position:'absolute',left:x-w/2,top:y-h/2,width:w,height:h,borderRadius:34,background:'#111',color:'#fff',boxShadow:'0 12px 22px #00000020',display:'grid',placeItems:'center',transform:`scale(${scale})`,opacity,fontSize:size,fontWeight:600,lineHeight:1.18,whiteSpace:'pre',textAlign:'center'}}>{text}</div>;
}
export function WorkSelection({f,media}:{f:number;media:React.ReactNode}){
 const enter=q(f,132,160),branch=q(f,180,218),select=q(f,408,458),take=q(f,550,600);
 const rootX=mix(960,420,branch),rootY=mix(480,270,branch);
 const cues=[226,264,302],labels=['低粉爆款视频处理','整理素材','内容分析'];
 return <>
  <div style={{position:'absolute',inset:0,background:'#fff',transform:`translateY(${-1080*take}px)`,opacity:enter}}>
   <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>
    {cues.map((cue,i)=>{const grow=q(f,cue-16,cue+12)*(1-select);if(grow<=0)return null;const y=290+i*220;
     return <path key={i} d={`M${rootX} ${rootY+95} C${rootX} ${y} ${rootX} ${y} 930 ${y}`} pathLength={1} stroke='#111' fill='none' strokeWidth={7} strokeLinecap='round' strokeDasharray={1} strokeDashoffset={1-grow}/>;})}
   </svg>
   {select<1&&<Node x={rootX} y={rootY} w={560} h={220} text='日常工作' size={108} scale={enter*(1-select)}/>}
   {cues.map((cue,i)=>{
    const born=q(f,cue,cue+24),chosen=i===0;
    return born>0&&<Node key={i} x={chosen?mix(1290,960,select):1290} y={chosen?mix(290,360,select):290+i*220} w={chosen?mix(770,1080,select):770} h={chosen?mix(165,190,select):165} text={labels[i]} size={chosen?mix(65,98,select):78} scale={born*(chosen?1:1-select)}/>;
   })}
   <div style={{position:'absolute',left:280,top:545,width:1360,textAlign:'center',fontSize:66,fontWeight:500,opacity:q(f,450,482),transform:`translateY(${28*(1-q(f,450,482))}px)`}}>标题、文案、视频内容</div>
   <div style={{position:'absolute',left:280,top:665,width:1360,textAlign:'center',fontSize:63,fontWeight:600,opacity:q(f,480,510)}}>每天重复，逐条判断</div>
  </div>
  <div style={{position:'absolute',inset:0,background:'#fff',transform:`translateY(${1080*(1-take)}px)`}}>{media}</div>
 </>;
}
