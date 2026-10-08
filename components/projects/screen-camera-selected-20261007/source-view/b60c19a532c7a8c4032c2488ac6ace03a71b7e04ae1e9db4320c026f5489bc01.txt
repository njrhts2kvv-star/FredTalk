import React from 'react';
import {AbsoluteFill,Img,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {FullscreenVideoWindow} from './components/FullscreenVideoWindow';
export type Box=[number,number,number,number];
export type CodexFullProps={desktopSrc?:string;playbackSrc?:string;prompt?:string;typingSeconds?:number};
export const DEFAULT_PROMPT='请做一个微信对话动画：输入消息，发送后收到回复，最后停留展示结果。';
export const INPUT_ROI:Box=[1065,1474,1472,201];
export const USER_ROI:Box=[2054,399,484,86];
export const REPLY_ROI:Box=[1054,568,1490,830];
const clamp=(p:number)=>p<=1e-9?0:p>=1-1e-9?1:p;
const ease=(p:number)=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const progress=(t:number,start:number,seconds:number)=>ease(clamp((t-start)/seconds));
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const REPLY_ROWS=[
 {y:0,h:80,at:0,d:.18},{y:90,h:55,at:.23,d:.28},{y:164,h:53,at:.54,d:.20},
 {y:238,h:48,at:.77,d:.23},{y:284,h:46,at:1.03,d:.23},{y:330,h:46,at:1.29,d:.25},
 {y:377,h:47,at:1.57,d:.24},{y:430,h:59,at:1.84,d:.26},{y:508,h:47,at:2.14,d:.27},
 {y:554,h:51,at:2.44,d:.25},{y:623,h:154,at:2.75,d:.32},{y:777,h:53,at:3.13,d:.20},
];
export function fullTimeline(props:CodexFullProps={}){
 const typeStart=1.55,typeEnd=typeStart+(props.typingSeconds??2.3),sendClick=typeEnd+.55,sendAt=sendClick+.13,returnEnd=sendAt+.62,replyStart=returnEnd+.18,replyEnd=replyStart+3.6,mp4MouseStart=replyEnd+.5,mp4Click=mp4MouseStart+.6,playStartFrame=Math.round((mp4Click+.17)*60);
 return {typeStart,typeEnd,sendClick,sendAt,returnEnd,replyStart,replyEnd,mp4MouseStart,mp4Click,playStartFrame,totalFrames:playStartFrame+300};
}
export function fullState(props:CodexFullProps,t:number){
 const clock=fullTimeline(props),factor=1080/1712,left=(1920-3024*factor)/2;
 const lift=progress(t,1.05,.65),back=progress(t,clock.sendAt,.62),q=lift*(1-back);
 const original:Box=[500,900,1000,137];
 const target:Box=[260,438,1400,192];
 const input=original.map((v,i)=>mix(v,target[i],q)) as Box;
 const chars=Array.from(props.prompt??DEFAULT_PROMPT),count=Math.floor(clamp((t-clock.typeStart)/(props.typingSeconds??2.3))*chars.length);
 const text=t<clock.sendAt?chars.slice(0,count).join(''):'';
 const bubbleP=progress(t,clock.sendAt,.62),bubbleTarget:Box=[720,210,780,116];
 const bubbleFrom:Box=[650,482,620,620*USER_ROI[3]/USER_ROI[2]];
 const bubble=bubbleFrom.map((v,i)=>mix(v,bubbleTarget[i],bubbleP)) as Box;
 const send={x:input[0]+1427*input[2]/INPUT_ROI[2],y:input[1]+153*input[2]/INPUT_ROI[2]};
 const mp4={x:left+1355*factor,y:1027*factor};
 return {clock,factor,left,q,input,bubble,bubbleP,send,mp4,text,count,chars,replyProgress:REPLY_ROWS.map(r=>clamp((t-clock.replyStart-r.at)/r.d))};
}
function Pixels({src,box,width,height}:{src:string;box:Box;width:number;height:number}){
 const scale=width/box[2];return <div style={{position:'absolute',inset:0,overflow:'hidden'}}><Img src={src} style={{position:'absolute',left:-box[0]*scale,top:-box[1]*scale,width:3024*scale,height:1712*scale,maxWidth:'none'}}/></div>;
}
function Cursor({x,y,pulse=0,opacity=1}:{x:number;y:number;pulse?:number;opacity?:number}){
 return <svg width="36" height="50" viewBox="0 0 38 52" style={{position:'absolute',left:x-3,top:y-2,filter:'drop-shadow(0 2px 2px #0003)',opacity,transform:`scale(${1-.08*pulse})`,transformOrigin:'top left'}}><path d="M3 2L3 39L13 30L21 48L28 44L20 26L34 25Z" fill="white" stroke="#111" strokeWidth="2.4" strokeLinejoin="round"/></svg>;
}
/** N040 relation: real input is lifted from its page, background recedes, submit restores the page. */
export function CodexFullWindowFlow(props:CodexFullProps){
 const frame=useCurrentFrame(),{fps,width}=useVideoConfig(),t=frame/fps,s=fullState(props,t),src=staticFile(props.desktopSrc??'codex-full.png');
 const inputScale=s.input[2]/INPUT_ROI[2],sendP=progress(t,s.clock.typeEnd,.55),sendPulse=Math.max(0,1-Math.abs(t-s.clock.sendClick)/.12);
 const mp4P=progress(t,s.clock.mp4MouseStart,.6),mp4Pulse=Math.max(0,1-Math.abs(t-s.clock.mp4Click)/.12);
 const open=progress(t,s.clock.playStartFrame/60,.5),windowScale=.18+.82*open,cx=mix(s.mp4.x,960,open),cy=mix(s.mp4.y,540,open);
 const a=progress(t,.45,.85),b=progress(t,s.clock.sendAt,.95),c=progress(t,s.clock.replyStart+2.65,.9);
 const yaw=-12*a+24*b-5*c,pitch=7*a-3*b;
 const zoom=1+.12*a+.18*b+.28*c;
 const focusX=mix(960,1000,b),focusY=mix(540,510,b);
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden',perspective:2600}}>
 <div style={{position:'absolute',width:1920,height:1080,transform:`translate(${960-focusX}px,${540-focusY}px) scale(${width/1920*zoom}) rotateX(${pitch}deg) rotateY(${yaw}deg)`,transformOrigin:`${focusX}px ${focusY}px`,fontFamily:'-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif'}}>
  <div data-codex-page style={{position:'absolute',inset:0,filter:`blur(${s.q*4}px)`}}>
   <Img src={src} style={{position:'absolute',left:s.left,top:0,width:3024*s.factor,height:1080}}/>
   {/* Reset only the previous chat area for this illustrated new conversation. App chrome remains real. */}
   <div style={{position:'absolute',left:s.left+593*s.factor,top:91*s.factor,width:2410*s.factor,height:1367*s.factor,background:'#fff'}}/>
   <div style={{position:'absolute',left:s.left+1045*s.factor,top:1455*s.factor,width:1513*s.factor,height:239*s.factor,background:'#fff'}}/>
   {t>=s.clock.replyStart && <div data-codex-reply style={{position:'absolute',left:500,top:370,width:1000,color:'#202124',fontSize:29,lineHeight:'46px'}}>
    {['可以，动画按下面的顺序呈现：','先聚焦输入框，完整输入这条消息。','发送后，消息回到对话区，显示收到的回复。','镜头靠近回复内容，停留两秒让观众看清。'].map((text,i)=>{
      const n=Math.floor(clamp((t-s.clock.replyStart-i*.8)/.72)*text.length);
      return <div key={i} style={{minHeight:64,marginBottom:i===0?20:0,fontWeight:i===0?600:400}}>{text.slice(0,n)}{n>0&&n<text.length&&<span style={{opacity:.5}}>▍</span>}</div>;
    })}
    <div style={{marginTop:28,color:'#64746d',fontSize:24,opacity:progress(t,s.clock.replyStart+3.6,.3)}}>✓ 输入 → 发送 → 回复 → 停留</div>
   </div>}
  </div>
  <div data-focus-dim style={{position:'absolute',inset:0,background:'#000',opacity:s.q*.34}}/>
  {t>=s.clock.sendAt && <div data-user-message style={{position:'absolute',left:s.bubble[0],top:s.bubble[1],width:s.bubble[2],height:s.bubble[3],borderRadius:28,overflow:'hidden',background:'#f1f1f1',opacity:clamp((t-s.clock.sendAt)/.12),padding:'16px 24px',boxSizing:'border-box',fontSize:27,lineHeight:'40px',color:'#202124'}}>{props.prompt??DEFAULT_PROMPT}</div>}
  <div data-floating-input style={{position:'absolute',left:s.input[0],top:s.input[1],width:s.input[2],height:s.input[3],boxShadow:`0 ${mix(2,12,s.q)}px ${mix(8,32,s.q)}px rgba(0,0,0,${mix(.04,.09,s.q)})`,borderRadius:48*inputScale,overflow:'hidden'}}>
   <Pixels src={src} box={INPUT_ROI} width={s.input[2]} height={s.input[3]}/>
   <div style={{position:'absolute',left:23*inputScale,top:30*inputScale,width:1310*inputScale,height:70*inputScale,background:'#fff',fontSize:25*inputScale,lineHeight:`${34*inputScale}px`,whiteSpace:'normal',color:s.text?'#111':'#c5c5c5'}}>
    {s.text||'随心输入'}{t<s.clock.sendAt && t>.25 && <span style={{display:'inline-block',width:2.7*inputScale,height:32*inputScale,marginLeft:3*inputScale,background:'#111',verticalAlign:'-6px',opacity:t<s.clock.typeEnd||Math.floor(t*2)%2===0?1:0}}/>}
   </div>
   {s.text && <div style={{position:'absolute',left:1400*inputScale,top:126*inputScale,width:54*inputScale,height:54*inputScale,borderRadius:'50%',background:'#000',display:'grid',placeItems:'center',transform:`scale(${1-.12*sendPulse})`}}><svg width={29*inputScale} height={29*inputScale} viewBox="0 0 32 32" fill="none"><path d="M16 26V6M6 16L16 6L26 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
  </div>
  {t>=s.clock.typeEnd && t<s.clock.sendAt+.2 && <Cursor x={mix(1810,s.send.x,sendP)} y={mix(730,s.send.y,sendP)} pulse={sendPulse} opacity={1-clamp((t-s.clock.sendAt)/.2)}/>}

 </div>
 </AbsoluteFill>;
}
