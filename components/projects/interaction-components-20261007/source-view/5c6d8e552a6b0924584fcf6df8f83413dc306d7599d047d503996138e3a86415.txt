import React from 'react';
import {AbsoluteFill,Audio,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
export type ChatMessage={id:string;kind:'system'|'date'|'outgoing'|'incoming'|'incoming-card';text?:string;title?:string;lines?:string[];appearAt:number};
export type WeChatProps={contactName?:string;selfInitial?:string;peerInitial?:string;messages?:ChatMessage[];messageSoundSrc?:string;messageVolume?:number;withSound?:boolean;fontFamily?:string};
export const DEFAULT_MESSAGES:ChatMessage[]=[
 {id:'tap',kind:'system',text:'“小林”拍了拍我',appearAt:.45},
 {id:'okay',kind:'outgoing',text:'好的',appearAt:1.25},
 {id:'reference-request',kind:'outgoing',text:'把这次拍摄的参考资料发我一下',appearAt:3},
 {id:'first-date',kind:'date',text:'今天 10:30',appearAt:4.85},
 {id:'forwarded-chat',kind:'incoming-card',title:'项目沟通记录',lines:['小林：参考图已经上传。','小周：开场用近景，镜头再慢慢拉远。','小林：片尾保留两秒展示结果。'],appearAt:5.25},
 {id:'acknowledgement',kind:'outgoing',text:'收到，我先做一版预览',appearAt:7.75},
 {id:'second-date',kind:'date',text:'今天 10:32',appearAt:9.3},
 {id:'version',kind:'outgoing',text:'预览版本：V01',appearAt:9.65},
];
const clamp=(p:number)=>Math.max(0,Math.min(1,p));
const ease=(p:number)=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const out3=(p:number)=>1-Math.pow(1-p,3);
function measure(text:string,size:number,family:string){
 if(typeof document!=='undefined'){const c=document.createElement('canvas').getContext('2d');if(c){c.font=`${size}px ${family}`;return c.measureText(text).width;}}
 return Array.from(text).reduce((s,c)=>s+(/[\u0000-\u00ff]/.test(c)?.56:1)*size,0);
}
function wrappedLines(text:string,width:number,size:number,family:string){let count=1,line='';for(const ch of Array.from(text)){if(ch==='\n'){count++;line='';continue;}if(line&&measure(line+ch,size,family)>width){count++;line=ch;}else line+=ch;}return count;}
export function chatLayout(props:WeChatProps,t:number){
 const family=props.fontFamily??'"PingFang SC", -apple-system, sans-serif',messages=props.messages??DEFAULT_MESSAGES;
 if(!messages.length||messages.some((m,i)=>!m.id||m.appearAt<0||(i&&m.appearAt<=messages[i-1].appearAt)||((m.kind==='outgoing'||m.kind==='incoming'||m.kind==='system'||m.kind==='date')&&!m.text)|| (m.kind==='incoming-card'&&(!m.title||!m.lines?.length))))throw new Error('Messages require ordered times and actual text/card content');
 let top=112;const rows=messages.map(m=>{let width=2342,height=45;
  if(m.kind==='outgoing'||m.kind==='incoming'){width=Math.min(740,Math.max(84,measure(m.text!,30,family)+48));height=Math.max(85,wrappedLines(m.text!,width-48,30,family)*42+36);}
  if(m.kind==='incoming-card'){width=494;height=Math.max(300,90+m.lines!.reduce((n,line)=>n+wrappedLines(line,width-48,25,family)*34,0)+65);}
  if(m.kind==='date')height=41;
  const y=top;top+=height+(m.kind==='incoming-card'?26:m.kind==='outgoing'?34:24);
  return {...m,y,width,height};});
 const bottom=rows[rows.length-1].y+rows[rows.length-1].height;let shift=0;
 for(let i=0;i<rows.length;i++){if(t<rows[i].appearAt)break;const to=1092-(rows[i].y+rows[i].height),from=i?1092-(rows[i-1].y+rows[i-1].height):to;shift=from+(to-from)*ease(clamp((t-rows[i].appearAt)/.4));}
 return {family,rows,shift,finalShift:1092-bottom};
}
function Avatar({initial,self=false}:{initial:string;self?:boolean}){return <div style={{width:72,height:72,borderRadius:13,background:self?'#CEDCDD':'#CCD8E9',color:self?'#416B68':'#4C608A',display:'grid',placeItems:'center',fontSize:29,fontWeight:500}}>{initial}</div>;}
/** Approved chat-message-flow entry/yield relation; all sample text is now editable and neutral. */
export function WeChatConversation(props:WeChatProps){
 const frame=useCurrentFrame(),{fps,width,height}=useVideoConfig(),t=frame/fps,s=chatLayout(props,t),scale=Math.min(width/2370,height/1136);
 return <AbsoluteFill style={{background:'#FAFAFA',overflow:'hidden'}}>
  <div style={{position:'absolute',left:(width-2370*scale)/2,top:(height-1136*scale)/2,width:2370,height:1136,transform:`scale(${scale})`,transformOrigin:'top left',fontFamily:s.family,color:'#171717'}}>
   <div style={{position:'absolute',left:0,top:0,width:2370,height:94,borderBottom:'1px solid #eee',background:'#FAFAFA',zIndex:10,boxSizing:'border-box'}}>
    <strong style={{position:'absolute',left:32,top:26,fontSize:30}}>{props.contactName??'项目沟通'}</strong>
    <div style={{position:'absolute',right:42,top:24,display:'flex',gap:38,color:'#5b5b5b',fontSize:31}}><span>☏</span><span>···</span></div>
   </div>
   <div style={{position:'absolute',left:0,top:94,width:2370,height:1042,overflow:'hidden'}}>
    {s.rows.filter(m=>t>=m.appearAt).map(m=>{const p=out3(clamp((t-m.appearAt)/.32)),motion=m.kind==='outgoing'||m.kind==='incoming'||m.kind==='incoming-card';
      const y=m.y-94+s.shift+18*(1-p);
      if(!motion)return <div key={m.id} style={{position:'absolute',left:0,top:y,width:2370,height:m.height,textAlign:'center',color:m.kind==='date'?'#a3a3ab':'#8a8a8a',fontSize:26,opacity:p,lineHeight:'45px'}}>{m.text}</div>;
      const own=m.kind==='outgoing',left=own?2228-m.width:140;
      return <div data-message-id={m.id} key={m.id} style={{position:'absolute',left:0,top:y,width:2370,height:m.height,opacity:p,transform:`scale(${.98+.02*p})`,transformOrigin:own?'right bottom':'left bottom'}}>
       <div style={{position:'absolute',left:own?2255:40,top:0}}><Avatar initial={own?(props.selfInitial??'我'):(props.peerInitial??'林')} self={own}/></div>
       <div style={{position:'absolute',left,top:0,width:m.width,height:m.height,borderRadius:14,background:own?'#9FEF9C':m.kind==='incoming'?'#FFFFFF':'#EEEEF0',boxSizing:'border-box',padding:own?'17px 24px':'24px 24px 58px',overflow:'visible'}}>
        <div style={{position:'absolute',left:own?undefined:-8,right:own?-8:undefined,top:26,width:18,height:18,transform:'rotate(45deg)',background:own?'#9FEF9C':m.kind==='incoming'?'#FFFFFF':'#EEEEF0'}}/>
        {own||m.kind==='incoming'?<div data-editable-text style={{fontSize:30,lineHeight:'42px',whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{m.text}</div>:<>
         <div data-card-title style={{fontSize:30,fontWeight:500,lineHeight:'40px',marginBottom:14}}>{m.title}</div>
         <div data-card-lines style={{fontSize:25,lineHeight:'34px',color:'#9c9ca4',whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{m.lines!.map((line,i)=><div key={i}>{line}</div>)}</div>
         <div style={{position:'absolute',left:24,right:24,bottom:0,height:52,borderTop:'1px solid #e2e2e5',fontSize:25,lineHeight:'52px',color:'#9c9ca4'}}>聊天记录</div>
        </>}
       </div>
      </div>;
    })}
   </div>
  </div>
  {props.withSound!==false&&(props.messages??DEFAULT_MESSAGES).filter(m=>m.kind==='incoming-card'||m.kind==='incoming').map(m=><Sequence key={m.id} from={Math.round(m.appearAt*fps)} durationInFrames={45}><Audio src={staticFile(props.messageSoundSrc??'sfx/message.wav')} volume={props.messageVolume??.35}/></Sequence>)}
 </AbsoluteFill>;
}
