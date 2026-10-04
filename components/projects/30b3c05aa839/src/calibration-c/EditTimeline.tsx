import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../../material-policy';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
const q=(f:number,a:number,b:number)=>{let p=Math.max(0,Math.min(1,(f-a)/(b-a)));return p*p*(3-2*p)};
export function EditTimeline({t,accent,assets}:{t:number;accent:string;assets?:Record<string,string>}){
 const f=t*30,p=q(f,51,71),back=q(f,123,138),actorX=930-625*p+400*back;
 const film=(i:number)=>assets?.[`film${i}`]??staticFile(`group-c/clean-film${1+(i-1)%2}.mp4`);
 const pic=(i:number)=>assets?.[`image${i}`]??staticFile(`group-c/image${i}.jpg`);
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans'}}>
 <div style={{position:'absolute',left:70-850*p,top:-450+t*125,width:610}}>{[1,2,3,1,2,3].map((n,i)=><div key={i} style={{height:343,width:610,marginBottom:28,borderRadius:28,overflow:'hidden',boxShadow:'0 5px 14px #0005'}}><OffthreadVideo src={film(n)} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>)}</div>
 <div style={{position:'absolute',left:actorX-290,top:-20,width:1335,height:1335}}><OffthreadVideo src={assets?.actor??staticFile('group-c/think.webm')} trimBefore={144} playbackRate={.09} muted transparent style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>
 <div style={{position:'absolute',left:2030-780*p+790*back,top:0,width:410,height:1080,background:'#161618',color:'#aaa',overflow:'hidden',boxShadow:'0 0 13px #0003'}}>
 <div style={{height:34,background:'#212124',padding:'8px 14px',fontSize:12,boxSizing:'border-box'}}>‹ 媒体　　音频　　文本　　特效</div>
 <div style={{height:68,display:'flex',alignItems:'center',gap:12,fontSize:11,padding:'0 12px'}}>{['选择','分割','删除','吸附','缩放'].map(x=><span key={x}>{x}</span>)}</div>
 <div style={{height:26,paddingLeft:54,fontSize:9,display:'flex',justifyContent:'space-between',borderBottom:'1px solid #555'}}>{['00:00','00:05','00:10','00:15','00:20'].map(x=><span key={x}>{x}</span>)}</div>
 <div style={{position:'absolute',left:0,top:128,width:410,transform:`translateY(${-30*q(f,80,112)}px)`}}>{Array.from({length:17},(_,row)=><div key={row} style={{display:'flex',height:52+(row%3)*7,borderBottom:'1px solid #252529',gap:3,paddingTop:5,boxSizing:'border-box'}}><div style={{width:42,fontSize:10,flexShrink:0,padding:'7px 8px'}}>◉　{row%3===0?'♫':'▣'}</div><div style={{display:'flex',gap:4,marginLeft:(row*29)%90}}>{Array.from({length:row%3===0?2:4},(_,j)=><div key={j} style={{width:row%3===0?140:64+(j%2)*17,height:37,background:row%3===0?'#463758':'#46464b',borderRadius:3,overflow:'hidden',position:'relative'}}>{row%3===0?<svg width={140} height={37}>{Array.from({length:65},(_,k)=><line key={k} x1={k*2+3} x2={k*2+3} y1={18-(3+Math.abs(Math.sin(k*2.71+row))*12)} y2={18+(3+Math.abs(Math.sin(k*2.71+row))*12)} stroke={accent} strokeWidth={1.2}/>)}</svg>:<><Img src={pic(1+(row+j)%4)} style={{height:37,width:'100%',objectFit:'cover',opacity:.65}}/><div style={{position:'absolute',top:2,left:2,fontSize:7,color:'white'}}>Fred_{row}_{j}.mp4</div></>}</div>)}</div></div>)}</div>
 <div style={{position:'absolute',top:115,bottom:0,left:220,width:1,background:'#ddd'}}><div style={{position:'absolute',left:-4,top:0,width:9,height:12,background:'#ddd',clipPath:'polygon(0 0,100% 0,100% 70%,50% 100%,0 70%)'}}/></div>
 </div>
 </AbsoluteFill>;
}
