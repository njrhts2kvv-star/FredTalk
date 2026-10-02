import React from 'react';
import {AbsoluteFill,OffthreadVideo,staticFile,useCurrentFrame} from 'remotion';
import {measuredSample} from './RebuiltGrid';
import spec from '../../../../specs/T10.json';

const PhoneEditor:React.FC<{width:number;height:number}>=({width,height})=>{
 const ui=spec.objects.phone.ui;
 return <div style={{position:'absolute',left:0,top:0,width:480,height:1000,transform:`scale(${width/480},${height/1000})`,transformOrigin:'0 0',fontFamily:'CTWRegular, sans-serif',color:'#171717',fontWeight:400}}>
  <div style={{position:'absolute',left:30,top:19,fontSize:20,fontWeight:700}}>{ui.time}<span style={{fontSize:14,marginLeft:5}}>◂</span></div>
  <div style={{position:'absolute',right:24,top:18,display:'flex',alignItems:'center',gap:9}}><span style={{fontSize:20}}>▥</span><span style={{fontSize:19}}>⌁</span><span style={{display:'inline-block',width:29,height:13,border:'2px solid #999',borderRadius:4,padding:2,boxSizing:'border-box'}}><span style={{display:'block',width:5,height:5,background:'#d7c775'}}/></span></div>
  <div style={{position:'absolute',left:144,top:10,width:190,height:39,background:'#050505',borderRadius:28}}><span style={{position:'absolute',left:15,top:13,width:13,height:13,borderRadius:'50%',background:'#b93835'}}/></div>
  <div style={{position:'absolute',left:17,top:76,fontSize:32,lineHeight:1}}>×</div>
  <div style={{position:'absolute',left:130,top:75,width:220,height:35,borderRadius:12,background:'#efeff0',display:'flex',alignItems:'center',padding:3,boxSizing:'border-box',fontSize:14}}>{ui.tabs.map((tab,i)=><div key={tab} style={{flex:1,textAlign:'center',padding:'6px 0',borderRadius:9,background:i===ui.activeTab?'white':'transparent',color:i===ui.activeTab?'#151515':'#999',fontWeight:i===ui.activeTab?700:400}}>{tab}</div>)}</div>
  {[{src:ui.secondaryMedia,x:-247},{src:spec.objects.phone.media,x:97}].map((slot,i)=><div key={i} style={{position:'absolute',left:slot.x,top:362,width:328,height:236,borderRadius:15,overflow:'hidden',background:'#ddd'}}><OffthreadVideo muted src={staticFile(slot.src)} style={{width:'100%',height:'100%',objectFit:'cover'}}/><span style={{position:'absolute',right:15,top:6,color:'white',fontSize:24,textShadow:'0 1px 4px #000'}}>×</span></div>)}
  <div style={{position:'absolute',left:440,top:454,width:49,height:56,borderRadius:13,background:'white',fontSize:33,color:'#929292',display:'grid',placeItems:'center'}}>+</div>
  <div style={{position:'absolute',left:10,top:842,width:460,height:97,borderRadius:22,background:'white',padding:'18px 19px',boxSizing:'border-box',boxShadow:'0 15px 24px #00000004'}}><div style={{fontSize:17,color:'#b8b8b8',whiteSpace:'nowrap'}}>{ui.prompt}</div><div style={{display:'flex',alignItems:'center',marginTop:16,fontSize:14,color:'#555'}}><span>{ui.model} ⌄</span><span style={{marginLeft:19}}>{ui.mode} ☷</span><span style={{marginLeft:'auto',background:'#262626',borderRadius:20,color:'white',padding:'4px 10px'}}>{ui.action}</span></div></div>
  <div style={{position:'absolute',left:0,top:951,width:'100%',textAlign:'center',fontSize:12,color:'#b1b1b1'}}>{ui.footer}<span style={{color:'#555',marginLeft:5}}>记录管理 ›</span></div>
 </div>;
};

export const RebuiltT10:React.FC=()=>{
 const f=useCurrentFrame(),p=spec.objects.phone,v=spec.objects.video;
 const[x,y,w,h]=measuredSample(spec.tracks,p.track,f),[vx,vy,vw,vh]=measuredSample(spec.tracks,v.track,f);
 const padding=w*p.borderRatio;
 return <AbsoluteFill style={{background:'white'}}>
  <div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:w*p.radiusRatio,background:'#111',boxShadow:'15px 15px 28px #0003',padding,boxSizing:'border-box'}}><div style={{position:'relative',width:'100%',height:'100%',background:'#f5f5f6',overflow:'hidden',borderRadius:w*.09}}><PhoneEditor width={w-padding*2} height={h-padding*2}/></div></div>
  <div style={{position:'absolute',left:vx,top:vy,width:vw,height:vh,borderRadius:vw*v.radiusRatio,overflow:'hidden',boxShadow:'18px 17px 25px #0003'}}><OffthreadVideo muted src={staticFile(v.media)} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
 </AbsoluteFill>;
};
