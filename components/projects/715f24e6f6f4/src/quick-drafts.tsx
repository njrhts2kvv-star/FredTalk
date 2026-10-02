import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

import extraSP017 from './sp017-extra-native.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fade = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const useFont = (font: string) => {
  const [handle] = useState(() => delayRender(`load ${font}`));
  useEffect(() => {
    Promise.race([
      document.fonts.load(`900 80px ${font}`),
      new Promise((resolve) => window.setTimeout(resolve, 5000)),
    ]).finally(() => continueRender(handle));
  }, [font, handle]);
};

export const SP009: React.FC = () => {
  const f=useCurrentFrame();useFont('MiSans');
  const words=['UI 设计','编程语言','应用逻辑','算法开发','功能调用'];
  const starts=[8,47,82,118,153];
  return <AbsoluteFill style={{background:'#111',color:'#fff',fontFamily:'MiSans, sans-serif'}}>
    <AbsoluteFill style={{filter:'blur(13px)'}}>
      <Img src={staticFile('sp009-ui-background.png')} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>
      <OffthreadVideo src={staticFile('sp009-ui-top.mp4')} muted style={{position:'absolute',left:0,top:0,width:1920,height:320,objectFit:'fill',maskImage:'linear-gradient(to bottom,black 82%,transparent)'}}/>
      <OffthreadVideo src={staticFile('sp009-ui-bottom.mp4')} muted style={{position:'absolute',left:0,top:760,width:1920,height:230,objectFit:'fill',maskImage:'linear-gradient(to bottom,transparent,black 18%)'}}/>
    </AbsoluteFill>
    {words.map((word,i)=>{
      const enter=fade(f,starts[i],starts[i]+8);
      const leave=fade(f,i===4?185:starts[i+1],i===4?194:starts[i+1]+8);
      return <div key={word} style={{position:'absolute',top:375,left:0,right:0,textAlign:'center',color:'#7C3AED',fontSize:288,fontWeight:900,letterSpacing:9,
        opacity:enter*(1-leave),filter:`blur(${(1-enter)*14+leave*14}px)`,transform:`translateX(${(1-enter)*1200-leave*1200}px)`}}>{word}</div>;
    })}
  </AbsoluteFill>;
};

export const SP017: React.FC = () => {
  const f=useCurrentFrame();useFont('MiSans');
  const phases=[{text:'分析剧本',start:4,x:530,y:430,size:220},{text:'生成素材',start:31,x:530,y:430,size:220},{text:'自动搭建工作流',start:57,x:170,y:428,size:210}];
  return <AbsoluteFill style={{background:'#101010',color:'#fff',fontFamily:'MiSans, sans-serif'}}>
    {phases.map((item,i)=>{
      const show=fade(f,item.start,item.start+(i===2?6:7));const leave=i<2?fade(f,63,76):interpolate(f,[112,115,125,128],[0,.35,.9,1],clamp);
      const x=i===1?item.x+270*fade(f,41,47):item.x;const y=i===0?item.y-270*fade(f,18,24):i===1?item.y+270*fade(f,41,47):item.y;
      return <div key={item.text} style={{position:'absolute',left:x+(1-show)*1250,top:y,fontSize:item.size,fontWeight:900,whiteSpace:'nowrap',opacity:show*(1-leave),filter:`blur(${(1-show)*12+leave*2}px)`,transform:`scaleX(${1+(1-show)*.32+leave*.2}) skewX(-4deg)`,transformOrigin:'left center'}}>{item.text}</div>;
    })}
    <AbsoluteFill style={{background:'#fff',opacity:Math.max(0,(extraSP017[Math.min(f,extraSP017.length-1)].background-20)/235)}}/>
  </AbsoluteFill>;
};

const Capsule: React.FC<{x:number;y:number;label:string;next:string;changeAt:number;frame:number;start:number;wordStart:number}> =
  ({x,y,label,next,changeAt,frame,start,wordStart}) => {
    const grow=fade(frame,start,start+17);const replace=fade(frame,changeAt,changeAt+15);
    return <div style={{position:'absolute',left:x+(1-grow)*120,top:y,width:312+263*grow,height:305,borderRadius:152.5-57.5*grow,background:'#020202',boxShadow:'0 12px 20px #0003',opacity:(frame>=start?1:0)*(1-.8*fade(frame,291,305)),display:'grid',placeItems:'center',color:'#fff',fontSize:154,fontWeight:900,whiteSpace:'nowrap'}}>
      <span style={{position:'absolute',opacity:fade(frame,wordStart,wordStart+18)*(1-replace),filter:`blur(${replace*7}px)`}}>{label}</span>
      <span style={{position:'absolute',opacity:replace,filter:`blur(${(1-replace)*7}px)`}}>{next}</span>
    </div>;
  };

export const SP020: React.FC = () => {
  const f = useCurrentFrame(); useFont('MiSans');
  return <AbsoluteFill style={{background: '#fff', fontFamily: 'MiSans, sans-serif'}}>
    <div style={{position:'absolute',left:42,top:28,width:575,height:1018,borderRadius:44,overflow:'hidden',opacity:1-fade(f,0,12)}}>
      <OffthreadVideo src={staticFile('sp020-first.mp4')} muted style={{width:'100%',height:'100%',objectFit:'fill'}} />
    </div>
    <div style={{position: 'absolute', left: 672, top: 28, width: 575, height: 1018,
      borderRadius: 44, overflow: 'hidden', opacity: 1 - fade(f, 8, 28)}}>
      <OffthreadVideo src={staticFile('sp020-man.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'fill'}} />
    </div>
    <div style={{position: 'absolute', left: 1295, top: 28, width: 575, height: 1018,
      borderRadius: 44, overflow: 'hidden', opacity: 1 - fade(f, 8, 28)}}>
      <OffthreadVideo src={staticFile('sp020-pack.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'fill'}} />
    </div>
    <Capsule x={52} y={205} label="大模型" next="没基础" changeAt={222} frame={f} start={28} wordStart={88} />
    <Capsule x={674} y={390} label="剧本" next="大产量" changeAt={245} frame={f} start={44} wordStart={104} />
    <Capsule x={1260} y={680} label="产品图" next="走捷径" changeAt={283} frame={f} start={65} wordStart={124} />

  </AbsoluteFill>;
};
