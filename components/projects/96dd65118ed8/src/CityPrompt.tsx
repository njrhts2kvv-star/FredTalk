import React from 'react';
import {AbsoluteFill,interpolate,Easing} from 'remotion';
import {M,mix as lerp} from './UI';
const progress=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.22,.75,.15,1)});
function Highlight({text,at,t,duration=.65}:{text:string;at:number;t:number;duration?:number}){
 const p=progress(t,at,at+duration);
 return <span style={{position:'relative',display:'inline',boxDecorationBreak:'clone',WebkitBoxDecorationBreak:'clone',padding:'3px 0',backgroundImage:'linear-gradient(#c7aaff,#c7aaff)',backgroundPosition:'left center',backgroundSize:`${p*100}% 100%`,backgroundRepeat:'no-repeat',color:'#25212d',borderRadius:3}}>{text}</span>;
}
function PromptText({t}:{t:number}){
 const words=M.cityPromptText;
 const targets=M.cityPrompt.highlights;
 const nodes:React.ReactNode[]=[];let pos=0;
 targets.forEach((h,i)=>{const at=words.indexOf(h.text,pos);nodes.push(words.slice(pos,at));nodes.push(<Highlight key={i} text={h.text} at={h.at} t={t} duration={h.duration}/>);pos=at+h.text.length;});nodes.push(words.slice(pos));
 return <>{nodes}</>;
}
export function GlassPrompt({t}:{t:number}){
 const enter=progress(t,M.cityPrompt.enter,M.cityPrompt.enter+.55),exit=progress(t,M.cityPrompt.exit,M.cityPrompt.gone);
 let zoom=1,tx=0,ty=0;
 M.cityPrompt.camera.forEach((c)=>{const p=progress(t,c.at,c.end);zoom=lerp(zoom,c.scale,p);tx=lerp(tx,960-c.x*c.scale,p);ty=lerp(ty,360-c.y*c.scale,p);});
 const cameraExit=progress(t,M.cityPrompt.exit,M.cityPrompt.gone);
 zoom=lerp(zoom,1,cameraExit);tx*=1-cameraExit;ty*=1-cameraExit;
 if(t<M.cityPrompt.enter||t>=M.cityPrompt.gone)return null;
 return <AbsoluteFill>
  <AbsoluteFill style={{background:`rgba(255,255,255,${.20*enter*(1-exit)})`}}/>
  <div style={{position:'absolute',left:170,top:95,width:1580,height:765,borderRadius:26,overflow:'hidden',background:'rgba(255,255,255,.64)',backdropFilter:'blur(30px) saturate(.5)',border:'1px solid rgba(255,255,255,.95)',boxShadow:'0 20px 80px #18223512',transform:`translate(${tx}px,${ty+lerp(900,0,enter)-950*exit}px) scale(${zoom})`,transformOrigin:'-170px -95px'}}>
   <div style={{padding:'45px 54px',fontSize:29,lineHeight:1.78,fontWeight:500,color:'#39363f',whiteSpace:'pre-wrap',transform:'none'}}><PromptText t={t}/></div>
  </div>
 </AbsoluteFill>;
}
