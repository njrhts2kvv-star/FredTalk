import {CountV3} from './CountV3';
import {EncoderV3} from './EncoderV3';
import {MontageV3} from './MontageV3';
import {VersionV3} from './VersionV3';
import {FeaturesV3} from './FeaturesV3';
import {CalendarV3} from './CalendarV3';
import React from 'react';
import {OffthreadVideo,Sequence,staticFile} from 'remotion';
import {Center,Mac,Icon,Photo,p,mix,lime,shadow} from './common';
export const Calendar=({t}:{t:number})=>{
 const q=p(t,1.04,1.43),circle=p(t,1.75,2.15);
 return <>{t<1.43&&<Center style={{fontSize:220,fontWeight:700,letterSpacing:-8,transform:`scale(${mix(1,14,q)})`,opacity:1-q,filter:`blur(${(p(t,.06,.15)-p(t,.15,.3))*8}px)`,textShadow:'10px 10px 8px #0004'}}>{'每日记录'.slice(0,Math.ceil(Math.min(1,Math.max(0,(t-.02)/.85))*4))}</Center>}{t>1.04&&<Center><Mac style={{width:1490,height:1020,transform:`scale(${mix(.38,1,q)})`,opacity:q,color:'#eee'}}><div style={{padding:'26px 42px',fontSize:60}}>2026年7月 · 记录 <span style={{float:'right',fontSize:30,color:'#aaa'}}>‹　›　 今天</span></div><div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'0 40px',gap:0,textAlign:'center',fontSize:37}}>{['日','一','二','三','四','五','六'].map(v=><div key={v} style={{height:90,color:'#888'}}>{v}</div>)}{Array.from({length:35},(_,i)=>{const d=i-2;return <div key={i} style={{height:123,position:'relative',borderTop:'1px solid #ffffff0b',paddingTop:30}}>{d>0&&d<=31?d:''}{d===31&&<svg style={{position:'absolute',inset:0}} width="100%" height="100%" viewBox="0 0 174 123"><ellipse cx="87" cy="58" rx="80" ry="34" fill="none" stroke="#ce2350" strokeWidth="7" pathLength="1" strokeDasharray="1" strokeDashoffset={1-circle} transform="rotate(-8 87 58)"/></svg>}</div>})}</div></Mac></Center>}</>;
};
const words=['留下每天的声音','整理会议和想法','自动归档到知识库'];
export const Features=({t,inWindow=false}:{t:number,inWindow?:boolean})=>{
 const third=p(t,18.2,19.4),wrap=p(t,20.98,21.58);
 const body=<div style={{position:'absolute',left:inWindow?65:285,top:inWindow?170:mix(490,240,p(t,16.8,18)),fontSize:148,fontWeight:800,lineHeight:1.29,color:'#ffffff',textShadow:'0 3px 10px #000b',WebkitTextStroke:'1px #0008',whiteSpace:'nowrap'}}><div>{words[0].slice(0,Math.ceil(p(t,15.1,16.9)*words[0].length))}</div><div style={{height:190*third,overflow:'hidden'}}>{words[1].slice(0,Math.ceil(p(t,18.2,20)*words[1].length))}</div><div>{words[2].slice(0,Math.ceil(p(t,17,18.3)*words[2].length))}</div></div>;
 return <><Photo name="seedance-ui.jpg" style={{position:'absolute',inset:0,filter:'blur(13px) brightness(.77)'}}/>{inWindow?<Center><Mac style={{width:1620,height:1030}}>{body}</Mac></Center>:<><Center><Mac style={{width:1620,height:1030,opacity:wrap*.8}}/></Center>{body}</>}</>;
};
export const Version=({t}:{t:number})=>{
 const open=p(t,22.3,23),flip=p(t,28.1,28.65),value=t<24.6?'20':`${20+Math.min(5,Math.floor((t-24.6)/.62)+1)}`;
 return <><Photo name="seedance-ui.jpg" style={{filter:'blur(12px) brightness(.75)'}}/><Center><Mac style={{width:1620,height:1030,transform:`perspective(2200px) rotateY(${mix(90,0,open)+flip*90}deg)`}}><Center style={{fontSize:176,fontWeight:800,color:'white',paddingTop:40,opacity:p(t,23,23.55)}}>记录 {value} 条<svg width="240" height="240" viewBox="0 0 200 200" style={{width:230*p(t,24.3,24.9),marginLeft:35}}><path d="M15 160Q120 150 148 50L171 65L158 10L111 32L132 43Q112 124 15 140Z" fill="#fbc83b"/></svg></Center></Mac></Center></>;
};
const Pill=({t,start,text,initialWidth=0}:{t:number,start:number,text:string,initialWidth?:number})=><Center style={{transform:`translateY(${initialWidth?44.5*(1-p(t,start,start+.5)):0}px)`}}><div style={{background:'black',borderRadius:160,width:mix(initialWidth,1450,p(t,start,start+.5)),height:initialWidth?mix(initialWidth,340,p(t,start,start+.5)):340,overflow:'hidden',boxShadow:shadow,display:'flex',alignItems:'center',justifyContent:'center',whiteSpace:'nowrap',fontSize:130,color:'#d2b8f2',fontWeight:700}}>{text.slice(0,Math.ceil(p(t,start+.55,start+1.3)*text.length))}</div></Center>;
export const Count=({t}:{t:number})=>{
 const q=p(t,179.8,180.6),shift=p(t,181.25,182);return <>{q<1&&<div style={{opacity:1-q,transform:`scale(${mix(1,.72,q)})`,position:'absolute',inset:0}}><Pill t={t} start={176.6} text="真实的上下文记录"/></div>}<div style={{position:'absolute',left:mix(960,250,shift),top:550,transform:`translate(-50%,-50%) scale(${mix(.65,1,q)})`,fontSize:235,fontWeight:700,color:'#ffbf21',textShadow:'6px 8px 5px #000a',opacity:q}}>50</div><svg width="1920" height="1080" style={{position:'absolute'}}>{[0,1,2].map((i)=>{const v=p(t,181.5+i*1.24,182+i*1.24);return <path key={i} d={`M420 550L${mix(420,880,v)} ${mix(550,250+i*300,v)}`} stroke="#111" strokeWidth={v>0?18:0} fill="none"/>})}</svg>{['张图片','条视频','段音频'].map((txt,i)=><div key={txt} style={{position:'absolute',left:950,top:150+i*300,fontSize:150,fontWeight:700,whiteSpace:'nowrap',textShadow:'5px 7px 5px #0009',color:'white',WebkitTextStroke:'5px #222',opacity:p(t,182.1+i*1.24,182.5+i*1.24),transform:`translateX(${70*(1-p(t,182.1+i*1.24,182.5+i*1.24))}px)`}}><span style={{color:[lime,'#319aef','#e97aaa'][i]}}>{i===0?'30':'10'}</span>{txt}</div>)}</>;
};
export const Encoder=({t}:{t:number})=>{
 const merge=p(t,200.55,201.7),unified=p(t,202.2,203.2);return <><div style={{position:'absolute',top:35,textAlign:'center',width:'100%',fontSize:100,fontWeight:700,color:t<197.1?lime:'#edb825',textShadow:'4px 5px 5px #0007'}}>记录{t<197.1?'输入':'整理'}</div>{[0,1,2,3].map(i=>{const grow=p(t,190.7+i*.22,191.65+i*.22),x=mix(255+i*470,960+(i%2-.5)*145,merge),y=mix(440,440+(Math.floor(i/2)-.5)*145,merge);return <React.Fragment key={i}><div style={{position:'absolute',left:x,top:y,width:320,height:320,borderRadius:60,background:'black',boxShadow:shadow,display:'flex',alignItems:'center',justifyContent:'center',transform:`translate(-50%,-50%) scale(${grow*mix(1,.52,merge)})`,opacity:1-unified}}><div style={{opacity:p(t,192.55+i*.63,193.02+i*.63)}}><Icon kind={i} size={224} color="#e4cfff"/></div></div>{merge<1&&<><div style={{position:'absolute',left:255+i*470-9,top:600,width:18,height:250*p(t,194.6,195.2),background:'#111',opacity:1-merge}}/><div style={{position:'absolute',left:255+i*470,top:mix(850,1200,merge),transform:`translate(-50%,-50%) scale(${p(t,191.7+i*.12,192.3+i*.12)})`,width:345,height:150,borderRadius:100,background:'black',color:'#d2b8f2',fontSize:92,fontWeight:700,textAlign:'center',paddingTop:10,boxShadow:shadow}}>{['文本','图片','视频','音频'][i].slice(0,Math.ceil(p(t,192.5,193.6)*2))}</div></>}</React.Fragment>})}<Center style={{opacity:p(t,201.5,202.1)}}><div style={{marginTop:90,width:575,height:575,borderRadius:112,background:'black',boxShadow:shadow,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#d2b8f2'}}><svg width="350" height="350" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="5" style={{opacity:unified}}><path d="M100 10L177 55V145L100 190L23 145V55Z M45 60H91L118 78V137L91 150H48 M47 80H90V132H46 M45 103H80M133 74V131M148 86V120"/>{[60,80,103,132,150].map(y=><circle key={y} cx="45" cy={y} r="5" fill="currentColor"/>)}</svg><div style={{fontSize:49,fontWeight:700,opacity:unified}}>Codex 上下文</div></div></Center></>;
};
export const Track=({t}:{t:number})=>{const move=p(t,58,64),tail=p(t,64,67.8);return <svg width="1920" height="1080" viewBox="0 0 1920 1080"><g transform="translate(180 1080) rotate(-30)"><path d="M-600 -20H2600M-600 -180H2600" stroke="black" strokeWidth="25"/>{Array.from({length:12},(_,i)=><path key={i} d={`M${i*90-500+tail*800} -30v-140`} stroke="black" strokeWidth="3"/>)}<g transform={`translate(${mix(-350,500,move)},-200)`}><rect width="540" height="190" fill="white" stroke="black" strokeWidth="5" rx="10"/>{Array.from({length:16},(_,i)=><path key={i} d={`M15 ${12+i*10}h510`} stroke="black" strokeWidth="3"/>)}{[70,450].map(x=><ellipse key={x} cx={x} cy="205" rx="29" ry="19" fill="white" stroke="black" strokeWidth="6"/>)}</g></g></svg>};
export const Seedance=({t,start}:{t:number,start:number})=>{
 if(t<3)return <CalendarV3 t={t}/>;
 if(t<22.3)return <FeaturesV3 t={t}/>;
 if(t<28.65)return <VersionV3 t={t}/>;
 if(t<31.35)return <Features t={t} inWindow/>;
 if(t<36.5)return <Sequence from={Math.round((31.35-start)*60)} layout="none"><Photo name='revision/fred-conversation.mp4' style={{width:1920,height:1080}}/></Sequence>;
 if(t<40.25)return <Pill t={t} start={36.5} text="留下每天的声音" initialWidth={330}/>;
 if(t<52.1)return <Sequence from={Math.round((40.25-start)*60)} layout="none"><Photo name='revision/fred-conversation.mp4' style={{width:1920,height:1080}}/></Sequence>;
 if(t<57.4)return <><Photo name="character-blur.jpg" style={{filter:'blur(17px) brightness(.65)'}}/><Center style={{fontSize:110,color:'#d2b8f2',opacity:1-p(t,55.2,56.2)}}>{'把声音记录整理为自己的知识库'.slice(0,Math.ceil(p(t,52.1,54.6)*14))}</Center></>;
 if(t<68)return <Track t={t}/>;
 if(t<187)return <CountV3 t={t}/>;
 if(t<205)return <EncoderV3 t={t}/>;
 return <MontageV3 t={t}/>;
};
