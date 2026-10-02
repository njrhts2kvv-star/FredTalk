import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fade = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const stages = [
  {title:'初步上手',start:0,end:361,exit:345,cards:['模型配置','3种权限模式','基本交互','/ 命令','项目：番茄钟'],cues:[-30,-10,63,193,284],widths:[272,352,272,208,368]},
  {title:'掌握&管理',start:361,end:812,exit:788,cards:['简单回退','后悔药：Git','管理&监控上下文'],cues:[116,231,282],widths:[272,336,464]},
  {title:'个性化',start:812,end:1162,exit:1141,cards:['CLAUDE.md','自动记忆'],cues:[115,171],widths:[336,272]},
  {title:'能力扩展',start:1162,end:1710,exit:1681,cards:['Skills','MCP · CLI','SubAgent','Hook','插件'],cues:[108,225,333,482,482],widths:[192,416,296,192,192]},
];

export const Q14: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load Q14 pixel font'));
  useEffect(() => {document.fonts.load('60px SmileySans').then(() => continueRender(fontHandle));}, [fontHandle]);
  const stage = stages.findIndex((s) => f >= s.start && f < s.end);
  const active = stages[Math.max(0,stage)];
  const gestures = ['伸手示意','皱眉思考','振作展示','握手邀请','抬手制止','双手制止','皱眉握拳','双手制止','皱眉握拳','振作展示','抚额苦恼'];
  const change = fade(f, active.start, active.start + 20);
  const xShift = (1-change) * -110;
  const stagePosition = fade(f,345,371)+fade(f,788,818)+fade(f,1141,1169);
  const titleOpacity=stage===0?1-fade(f,345,356):stage===1?fade(f,361,371)*(1-fade(f,788,803)):stage===2?fade(f,812,818)*(1-fade(f,1141,1154)):fade(f,1162,1169);
  return <AbsoluteFill style={{background: '#000', color: '#fff', fontFamily: 'SmileySans, sans-serif'}}>
    <div style={{position: 'absolute', top: 17, left: 810, width: 310, height: 110,
      background: '#7C3AED', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 61,
      fontWeight: 900, borderRadius: 12, boxShadow: '0 8px 24px #00000026', opacity:titleOpacity,transform: `translateX(${xShift}px)`}}>{active.title}</div>
    <div style={{position: 'absolute', left: Math.max(0,480-stagePosition*450), width: 1920, top: 281, height: 14,
      background: 'linear-gradient(90deg,#fff 0%,#fff 34%,#ffffff44 34%,#ffffff44 100%)'}} />
    {[-1,0,1,2,3].map((i) => {
      const x = 960 + (i-stagePosition) * 450;
      const previous = i < stage;
      return <div key={i} style={{position: 'absolute', left: x-49, top: 235, width: 98, height: 98,
        background: previous ? '#bda0ef' : i===stage ? '#7C3AED' : '#fff',
        border: 'none', boxSizing: 'border-box', borderRadius: '50%',
        boxShadow: '0 8px 24px #00000026'}} />;
    })}
    <div style={{position: 'absolute', left: 950, top: 177, width: 57, height: 70,
      background: '#7C3AED', border: 'none', boxSizing: 'border-box',
      clipPath: 'polygon(0 0,100% 0,100% 60%,35% 60%,35% 100%,0 100%)'}} />
    <div style={{position: 'absolute', top: 368, left: 0, right: 0, display: 'flex', alignItems: 'center',
      flexDirection: 'column', gap: 28, opacity: f < active.exit ? 1 : 0}}>
      {active.cards.map((card, i) => {
        const since = f-active.start;
        const appear = fade(since, active.cues[i], active.cues[i]+6);
        return <div key={card} style={{width: active.widths[i], height: 96, padding: '5px 23px', boxSizing: 'border-box',
          background:card==='MCP · CLI'?'transparent':'#fff',borderRadius:12,boxShadow:card==='MCP · CLI'?'none':'0 8px 24px #00000026',color:'#111',fontSize:56,
          whiteSpace: 'nowrap', textAlign: 'center', opacity: appear,
          transform: `translateY(${(1-appear)*38}px)`}}>{card==='MCP · CLI'?<div style={{display:'flex',gap:28,height:96,margin:'-5px -23px'}}>{['MCP','CLI'].map(text=><div key={text} style={{width:194,height:96,background:'#fff',borderRadius:12,display:'grid',placeItems:'center'}}>{text}</div>)}</div>:card}</div>;
      })}
    </div>
    <div style={{position:'absolute',left:55,bottom:40,width:320,height:320,borderRadius:'50%',overflow:'hidden',background:'#fff'}}>
      {gestures.map((gesture,i)=><Sequence key={`${gesture}-${i}`} from={i*150} durationInFrames={i===10?181:150} layout="none"><OffthreadVideo transparent muted playbackRate={i===10?150/181:1} src={staticFile(`characters/Fred_${gesture}_1440p30_Alpha.webm`)} style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>)}
    </div>
    <Sequence from={1681}><AbsoluteFill style={{background:'#fff'}}><OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} style={{position:'absolute',width:1080,height:1080,left:420,top:0,objectFit:'contain'}} /></AbsoluteFill></Sequence>
  </AbsoluteFill>;
};
