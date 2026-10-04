import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, Img, interpolateColors} from 'remotion';
import {M,q,mix,Stage} from './UI';
import {GlassPrompt} from './CityPrompt';

const glass=(dark=false):React.CSSProperties=>({background:dark?'rgba(27,31,35,.52)':'rgba(245,247,250,.38)',border:'1px solid '+(dark?'#ffffff32':'#fff'),boxShadow:dark?'0 20px 48px #0003,inset 0 0 0 1px #fff06':'0 15px 40px #15202d0d,inset 0 0 0 1px #15202d0b',backdropFilter:'blur(22px)',borderRadius:24});
const shapeRadius=(shape:string)=>shape==='round'?'50%':shape==='capsule'?150:20;
function Prompt({c,t}:any){
 if(c.index===1)return <GlassPrompt t={t}/>;
 const [start,end]=c.promptWindow;if(t<start||t>end+.45)return null;
 const enter=q(t,start,start+.45),exit=q(t,end,end+.45),dark=c.promptStyle==='black-glass',desk=c.promptStyle==='workbench',inspect=c.promptStyle==='inspector',draft=c.promptStyle==='drafting';
 const beats=c.promptBeats;let focus=0;for(let i=0;i<beats.length;i++)focus=mix(focus,i,q(t,beats[i].at,beats[i].at+.65));
 const push=inspect?0:q(t,beats[0].at,beats[0].at+.7);const scale=mix(1,1.48,push)*(1-.05*exit);
 const panelX=260,panelY=160,panelW=1400;const focusY=panelY+130+focus*190;
 const tx=(960-(panelX+480)*scale)*push;const ty=(370-focusY*scale)*push;
 return <AbsoluteFill style={{background:`rgba(255,255,255,${.3*enter*(1-exit)})`}}>
 {desk&&<div style={{position:'absolute',left:210,top:105,width:1500,height:750,borderRadius:34,background:'linear-gradient(130deg,#65696e,#17191c 10%,#33363b 85%,#777)',boxShadow:'0 35px 80px #0003',transform:`translate(${tx}px,${ty+750*(1-enter)-900*exit}px) scale(${scale})`,transformOrigin:'-210px -105px'}}/>}
 <div style={{position:'absolute',left:panelX,top:panelY,width:panelW,minHeight:inspect?320:640,...glass(dark),background:dark?'rgba(14,18,24,.90)':desk?'#f4f6f9e8':draft?'#fffffff0':'rgba(255,255,255,.86)',color:dark?'#fff':'#20242b',borderRadius:dark?46:desk?14:draft?8:24,transform:`translate(${tx}px,${ty+750*(1-enter)-900*exit}px) scale(${scale})`,transformOrigin:`-${panelX}px -${panelY}px`,overflow:'hidden'}}>
 <div style={{padding:'20px 45px',fontSize:22,color:dark?'#a8aeba':'#79808c',borderBottom:'1px solid '+(dark?'#ffffff20':'#1b233017'),display:'flex',gap:22}}>{desk?<><span>●</span><span>提示词</span><span style={{marginLeft:'auto'}}>图像生成</span></>:draft?<><span>星轨仪</span><span style={{marginLeft:'auto'}}>结构要求</span></>:inspect?'物品与详情':'材质要求'}</div>
 <div style={{padding:'40px 60px',backgroundImage:draft?'linear-gradient(#7b879309 1px,transparent 1px),linear-gradient(90deg,#7b879309 1px,transparent 1px)':'none',backgroundSize:'28px 28px'}}>{beats.map((b:any,i:number)=><div key={i} style={{height:190,opacity:t<b.at?.62:1}}><div style={{fontSize:40,fontWeight:600,lineHeight:1.7}}><span style={{backgroundImage:`linear-gradient(${dark?'#7655a8':'#c7aaff'},${dark?'#7655a8':'#c7aaff'})`,backgroundSize:`${q(t,b.at,b.at+.65)*100}% 100%`,backgroundRepeat:'no-repeat',padding:'4px 5px',borderRadius:4}}>{b.text}</span></div><div style={{fontSize:24,lineHeight:1.65,marginTop:16,color:dark?'#b9bdc8':'#646b78'}}>{b.support}</div></div>)}</div></div></AbsoluteFill>;
}
function targetLayout(side:string,shot:any,detail:number){
 const i=side==='left'?0:1,overview={x:90+i*900,y:220,w:840};if(!shot)return overview;
 let dst;if(shot.side==='both')dst={x:110+i*940,y:115,w:720};else dst=side===shot.side?{x:90,y:245,w:1030}:{x:100,y:65,w:280};
 return {x:mix(overview.x,dst.x,detail),y:mix(overview.y,dst.y,detail),w:mix(overview.w,dst.w,detail)};
}
function frameFor(c:any,shot:any,k:number){
 const item=shot.items[k],both=shot.side==='both',portrait=c.index===4&&shot.side!=='both'&&item.span[1]>.35;
 if(both)return c.index===4?{x:310+k*940,y:485,w:380,h:380*item.span[1]*(c.assets[k===0?'left':'right'].size[1]/c.assets[k===0?'left':'right'].size[0])/item.span[0]}:{x:220+k*940,y:490,w:550,h:270};
 if(c.index===3&&shot.items.length===1)return {x:1330,y:180,w:300,h:570};
 if(c.index===3||shot.items.length===3)return {x:1270,y:105+k*250,w:470,h:185};
 if(c.index===4&&shot.items.length===2)return {x:1160+k*330,y:300,w:310,h:Math.min(430,310*item.span[1]*(c.assets[shot.side].size[1]/c.assets[shot.side].size[0])/item.span[0])};
 const h=item.shape==='capsule'?240:shot.items.length===1?430:270;
 return {x:1240,y:shot.items.length===1?280:175+k*365,w:item.shape==='round'?430:500,h:item.shape==='round'?430:h};
}
function Detail({c,shot,item,k,t,layout,dark}:any){
 const side=shot.side==='both'?(k===0?'left':'right'):shot.side,a=c.assets[side],r=a.size[1]/a.size[0];const geo=frameFor(c,shot,k);
 const p=q(t,shot.at+k*.12,shot.at+.48+k*.12),out=1-q(t,shot.end-.17,shot.end);const vis=p*out;
 const sx=layout.x+item.center[0]*layout.w,sy=layout.y+item.center[1]*layout.w*r;
 const destX=geo.x+geo.w/2,destY=geo.y+geo.h/2;
 // Crop covers its small fitted window. Clamp source coordinates to the image edges.
 const iw=Math.max(geo.w/item.span[0],geo.h/(item.span[1]*r));const ih=iw*r;
 const ox=Math.max(geo.w-iw,Math.min(0,geo.w/2-item.center[0]*iw)),oy=Math.max(geo.h-ih,Math.min(0,geo.h/2-item.center[1]*ih));
 return <AbsoluteFill style={{opacity:vis}}>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>
 <path d={`M ${sx} ${sy} L ${geo.x-25} ${destY} L ${geo.x} ${destY}`} fill='none' stroke={dark?'#ffffff':'#404b5e'} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/>
 <rect x={sx-item.span[0]*layout.w/2} y={sy-item.span[1]*layout.w*r/2} width={item.span[0]*layout.w} height={item.span[1]*layout.w*r} rx={item.shape==='rect'?5:28} fill='none' stroke='#fff' strokeWidth={3}/>
 <circle cx={sx} cy={sy} r={6} fill='#fff' stroke='#616a7880'/>
 </svg>
 <div style={{position:'absolute',left:geo.x,top:geo.y,width:geo.w,height:geo.h,transform:`translate(${28*(1-p)}px,${12*(1-p)}px) scale(${mix(.94,1,p)})`,transformOrigin:'0 50%'}}>
 <div style={{position:'absolute',inset:-10,...glass(dark),borderRadius:shapeRadius(item.shape),background:dark?'#ffffff12':'#f3f6f866'}}/>
 <div style={{position:'absolute',inset:0,borderRadius:shapeRadius(item.shape),overflow:'hidden',border:'2px solid #fff',boxShadow:'0 10px 35px #0002'}}><Img src={staticFile(a.src)} style={{position:'absolute',width:iw,height:ih,maxWidth:'none',left:ox,top:oy}}/></div>
 <div style={{position:'absolute',top:geo.h+17,left:-20,right:-20,textAlign:'center',fontSize:25,fontWeight:500,color:dark?'#dce1e8':'#4e5663'}}>{item.label}</div>
 </div></AbsoluteFill>;
}
export function Comparison({c,t}:any){
 const shot=c.shots.find((s:any)=>t>=s.at&&t<s.end);const previous=shot?c.shots.filter((s:any)=>s.at<shot.at).slice(-1)[0]:null;const next=shot?c.shots.find((s:any)=>s.at>=shot.end):null;const joinedIn=previous&&Math.abs(previous.end-shot.at)<.15;const joinedOut=next&&Math.abs(next.at-shot.end)<.15;const p=shot?(joinedIn?1:q(t,shot.at,shot.at+.6))*(joinedOut?1:1-q(t,shot.end-.3,shot.end)):0;const layoutAt=(side:string)=>{const dest=targetLayout(side,shot,p);if(!joinedIn)return dest;const from=targetLayout(side,previous,1);const tr=q(t,shot.at,shot.at+.6);return {x:mix(from.x,dest.x,tr),y:mix(from.y,dest.y,tr),w:mix(from.w,dest.w,tr)}};
 const isCity=c.index===1;const start=isCity?M.cityPrompt.enter:c.promptWindow[0],end=isCity?M.cityPrompt.gone:c.promptWindow[1]+.45;const fog=q(t,start,start+.5)*(1-q(t,end-.45,end));
 const dark=c.index===2||c.index===3&&(t>=140&&t<146.766);
 const bg=c.index===3?interpolateColors(t,[139.9,140.3,146.5,146.95],['#fff','#101419','#101419','#fff']):dark?'#101419':'#fff';
 const shotAge=shot?t-shot.at:0;const focusShift=shot&&shot.items.length>1?q(t,shot.at+(shot.end-shot.at)*.2,shot.at+(shot.end-shot.at)*.8):0;
 const camScale=1+.055*p;const camY=p*(10-26*focusShift);const camX=shot?.side==='both'?0:-22*p;
 const revealAt=Math.min(c.assets.left.revealAt,c.assets.right.revealAt),reveal=q(t,revealAt,revealAt+.65)*(shot?0:1);
 return <Stage dark={dark}><AbsoluteFill style={{background:bg}}/>
 <AbsoluteFill style={{transform:`translate(${camX}px,${camY}px) scale(${camScale})`,transformOrigin:'960px 450px'}}>
 <AbsoluteFill style={{filter:`blur(${18*fog}px)`}}>
 {(['left','right'] as const).map((side,i)=>{const a=c.assets[side],l=layoutAt(side),win=a.model==='Image 2.5',weight=shot?1:mix(1,win?1.06:.82,reveal);return <div key={side} style={{position:'absolute',left:l.x,top:l.y,width:l.w,height:l.w*a.size[1]/a.size[0],transform:`scale(${weight})`,transformOrigin:i?'100% 50%':'0 50%'}}>
 <div style={{position:'absolute',inset:-14,...glass(dark)}}/>
 <div style={{position:'absolute',inset:0,overflow:'hidden',borderRadius:12}}><Img src={staticFile(a.src)} style={{width:'100%',height:'100%'}}/><AbsoluteFill style={{background:dark?`rgba(14,18,24,${p*.13+(!win?.27*reveal:0)})`:`rgba(255,255,255,${p*.13+(!win?.32*reveal:0)})`}}/></div>
 {t<a.revealAt&&<div style={{position:'absolute',bottom:10,right:12,padding:'4px 10px',fontSize:l.w<400?16:23,color:dark?'#fff':'#333',background:dark?'#101419aa':'#ffffffbb',borderRadius:7}}>{side==='left'?'左图':'右图'}</div>}{t>=a.revealAt&&<div style={{position:'absolute',top:l.w<400?12:-62,left:l.w<400?12:0,padding:l.w<400?'4px 8px':0,background:l.w<400?(dark?'#101419bb':'#ffffffcc'):'none',borderRadius:6,fontSize:l.w<400?20:42,fontWeight:600,whiteSpace:'nowrap',clipPath:`inset(0 ${100*(1-q(t,a.revealAt,a.revealAt+.4))}% 0 0)`}}>{a.model}</div>}
 </div>})}
 </AbsoluteFill>
 {shot&&shot.items.map((item:any,k:number)=>{const side=shot.side==='both'?(k===0?'left':'right'):shot.side;return <Detail key={shot.at+'-'+k} c={c} shot={shot} item={item} k={k} t={t} layout={layoutAt(side)} dark={dark}/>})}
 </AbsoluteFill><Prompt c={c} t={t}/></Stage>;
}
