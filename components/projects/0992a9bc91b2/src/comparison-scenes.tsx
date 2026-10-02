import {DARK_PURPLE,purpleOnDark,purpleOnSurface} from "../surface-purple.ts";
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';

import extraSP014 from './sp014-extra-native.json';

const clamp = {extrapolateLeft:'clamp', extrapolateRight:'clamp'} as const;
const phase = (f:number,a:number,b:number) => interpolate(f,[a,b],[0,1],clamp);
const shadow = '0 14px 26px #0003';
const stage: React.CSSProperties = {background:'#fff',fontFamily:'MiSans, sans-serif',overflow:'hidden'};
const media: React.CSSProperties = {width:'100%',height:'100%',objectFit:'contain'};

export const SP001: React.FC = () => {
  const f=useCurrentFrame();
  const results=phase(f,398,424)*(1-phase(f,894,920));
  const scroll=interpolate(f,[684,690,700,710,720,730,740],[0,18,135,520,899,1013,1030],clamp);
  const windowEnter=phase(f,25,45);
  const windowExit=phase(f,970,1015);
  return <AbsoluteFill style={stage}>
    {f<45&&<div style={{position:'absolute',left:1215-2200*phase(f,0,40),top:800,padding:'30px 40px',background:'#fff',boxShadow:shadow,fontSize:56,whiteSpace:'nowrap'}}>Library 老师，你这有办法批量制作吗？</div>}
    <div style={{position:'absolute',left:200+1920*(1-windowEnter),top:60-1120*windowExit,width:1520,height:988,borderRadius:36,background:'#202326',boxShadow:shadow,overflow:'hidden',filter:`blur(${results*17}px)`}}>
      <div style={{height:90,background:'#121416',display:'flex',gap:32,alignItems:'center',paddingLeft:62}}>
        {['#ed2491','#ffbd4d','#3984fd'].map(color=><span key={color} style={{width:25,height:25,borderRadius:'50%',background:color}}/>)}
      </div>
      <div style={{position:'absolute',left:555-380*phase(f,80,130),top:116+100*(1-phase(f,55,80)),width:410,height:728,borderRadius:22,overflow:'hidden',opacity:phase(f,42,55),transform:`scale(${.7+.3*phase(f,55,80)})`}}>
        <Img src={staticFile('sp001-subject.png')} style={media}/>
      </div>
      {[0,1,2,3,4,5].map(i=><div key={i} style={{position:'absolute',left:730+(i%3)*218,top:133+Math.floor(i/3)*380,width:177,height:315,borderRadius:10,overflow:'hidden',opacity:phase(f,150+i*12,168+i*12)}}>
        <Img src={staticFile(`sp001-group${i<3?1:2}-${i%3}.png`)} style={media}/>
      </div>)}
      <div style={{position:'absolute',left:610,top:862,width:300,height:100,borderRadius:46,background:'#7C3AED',color:'#fff',fontSize:52,fontWeight:900,display:'grid',placeItems:'center',opacity:phase(f,240,264)*(1-phase(f,275,310))}}>开始制作</div>
    </div>
    {[1,2].map(group=>{
      const show=1;
      if(group===1&&f>=740)return null;
      return <div key={group} style={{position:'absolute',inset:0,opacity:show*(1-phase(f,894,920))}}>
        {[0,1,2].map(i=>{
          const expand=phase(f,398+i*3,448+i*3);
          const x=930+i*218+(128+i*592-(930+i*218))*expand;
          const y=133+(group===2?1030:0)-scroll;
          return <div key={i} style={{position:'absolute',left:x,top:y,width:177+(478-177)*expand,height:315+(850-315)*expand,borderRadius:10+16*expand,overflow:'hidden',boxShadow:shadow,opacity:phase(f,398,405),transform:'none'}}>
            <Img src={staticFile(f>=448&&(group===1||f>=684)?`code-revision/sp001-group${group}-${i}/${String(Math.min(f,919)).padStart(4,'0')}.png`:`sp001-group${group}-${i}.png`)} style={media}/>
          </div>;
        })}
      </div>;
    })}
  </AbsoluteFill>;
};

export const SP011: React.FC = () => {
  const f=useCurrentFrame();
  const outward=phase(f,62,77);
  const labels=['多图参考','人像视频','视频编辑','文生+模板'];
  const doc=phase(f,122,138);
  return <AbsoluteFill style={stage}>
    {labels.map((label,i)=>{
      const enter=phase(f,[0,3,7,11][i],[7,11,15,19][i]);
      const right=i%2===1;
      const bottom=i>=2;
      return <div key={label} style={{position:'absolute',left:(right?1065:16)+(right?128:-140)*outward,top:(bottom?550:50)+(bottom?196:-190)*outward,width:838,height:476,borderRadius:80,overflow:'hidden',boxShadow:shadow,opacity:enter,transform:`scale(${.2+.8*enter})`}}>
        {f>=58?<Img src={staticFile(`code-revision/sp011-card-${i}/${String(Math.min(f,121)).padStart(4,'0')}.png`)} style={{...media,objectFit:'fill'}}/>:<OffthreadVideo src={staticFile(`sp011-card-${i}.mp4`)} muted style={{...media,objectFit:'cover'}}/>}
        <div style={{position:'absolute',inset:0,background:'#0005'}}/>
        <div style={{position:'absolute',top:137,left:i>=2?40:80,right:80,height:194,borderRadius:18,background:'#050505',color:'#fff',display:'grid',placeItems:'center',fontSize:i===3?144:154,fontWeight:900,whiteSpace:'nowrap',opacity:phase(f,22+i*2,32+i*2)}}>{label}</div>
      </div>;
    })}
    <div style={{position:'absolute',left:520,top:320,fontSize:435,fontWeight:900,lineHeight:1,color:'#050505',opacity:phase(f,69,81)*(1-doc)}}>30<span style={{color:'#7C3AED'}}>+</span></div>
    <div style={{position:'absolute',left:1920-1430*doc,top:0,width:1320,height:1040,background:'#fff',boxShadow:shadow,opacity:doc,overflow:'hidden'}}>
      <Img src={staticFile('sp011-document.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
    </div>
  </AbsoluteFill>;
};

export const SP014: React.FC = () => {
  const f=useCurrentFrame();
  const observed=extraSP014[Math.min(f,extraSP014.length-1)];
  const face='face' in observed ? observed.face : null;
  const rawCarrier='carrier' in observed ? observed.carrier : null;
  const carrier=rawCarrier && rawCarrier[0]<960 && rawCarrier[0]+rawCarrier[2]>960 && rawCarrier[1]<540 && rawCarrier[1]+rawCarrier[3]>540 ? rawCarrier : null;
  return <AbsoluteFill style={stage}>
    {face && <div style={{position:'absolute',left:face[0],top:face[1],width:face[2],height:face[3],borderRadius:60,overflow:'hidden'}}><Img src={staticFile(`review03/sp014-face/${String(f).padStart(4,'0')}.png`)} style={{...media,objectFit:'fill'}}/></div>}
    {f<60&&<div style={{position:'absolute',bottom:0,left:0,right:0,height:64,background:'#fff'}}/>}
    {[0,1,2,3].map(i=>{
      const cue=[64,67,63,67][i];const enter=phase(f,cue,cue+1);
      return <div key={i} style={{position:'absolute',left:i%2?984:40,top:i>=2?558:18,width:896,height:504,borderRadius:64,overflow:'hidden',boxShadow:shadow,opacity:enter,transform:`translateY(${phase(f,219,227)*(i<2?-650:650)}px)`}}>
        <OffthreadVideo src={staticFile(`sp014-card-${i}.mp4`)} muted style={{...media,objectFit:'cover'}}/>
      </div>;
    })}
    {carrier && <div style={{position:'absolute',left:carrier[0],top:carrier[1],width:carrier[2],height:carrier[3],borderRadius:Math.min(carrier[2],carrier[3])/2-(Math.min(carrier[2],carrier[3])/2-140)*phase(f,242,255),background:'#030303',boxShadow:shadow,display:'grid',placeItems:'center',overflow:'hidden'}}>
      <span style={{fontSize:206,fontWeight:900,color:'#fff',whiteSpace:'nowrap',opacity:phase(f,244,260)}}>降维<span style={{color:DARK_PURPLE}}>打击</span></span>
    </div>}
  </AbsoluteFill>;
};
