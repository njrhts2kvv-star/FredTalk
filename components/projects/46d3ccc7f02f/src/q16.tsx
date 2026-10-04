import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, Sequence, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const tween = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const bullets = ['直接读写文件', '操作文件', '本机运行'];

export const Q16: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load Q16 font'));
  useEffect(() => {document.fonts.load('80px MiSans').then(() => continueRender(fontHandle));}, [fontHandle]);
  const compare = f >= 203 ? 1 : 0;
  const outro = f >= 434 ? 1 : 0;
  const chatTops = [365,337,309,280,252,225,199,175,154,136,122,111,102,97,94,93];
  const chatTop = chatTops[Math.max(0,Math.min(15,f-203))]*2;
  const chatReveal = tween(f,203,206);
  return <AbsoluteFill style={{background: '#000', color: '#fff', fontFamily: 'MiSans, sans-serif', overflow: 'hidden'}}>
    <div style={{position:'absolute',left:interpolate(compare,[0,1],[144,130],clamp),top:interpolate(compare,[0,1],[100,232],clamp),width:interpolate(compare,[0,1],[1632,780],clamp),height:interpolate(compare,[0,1],[920,440],clamp),borderRadius:15,overflow:'hidden',background:'#fff',opacity:1-outro}}>
      <Sequence from={0} durationInFrames={203} layout="none"><OffthreadVideo muted src={staticFile('media/q16-agent-clean-motion.mp4')} style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>
      <Sequence from={203} durationInFrames={231} layout="none"><Img src={staticFile('media/q16-agent-clean-final.png')} style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>
    </div>
    <div style={{position: 'absolute', left: interpolate(compare,[0,1],[725,220],clamp), top: 20,
      background: '#7C3AED', color: '#fff', padding: '5px 22px', fontSize: 85,
      whiteSpace: 'nowrap', lineHeight: 1.1, borderRadius: 10, opacity: 1-outro}}>独立端Agent</div>
    <div style={{position:'absolute',left:950,top:chatTop,width:906,height:890,background:'#fff',borderRadius:22,overflow:'hidden',opacity:compare*chatReveal*(1-outro)}}>
      <Sequence from={203} durationInFrames={15} layout="none"><Img src={staticFile('media/q16-chat-stable-first.png')} style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>
      <Sequence from={218} durationInFrames={216} layout="none"><OffthreadVideo src={staticFile('media/q16-chat-stable-motion.mp4')} muted style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>
    </div>
    <div style={{position: 'absolute', top: 24, left: 1200, background: '#fff', color: '#111',
      padding: '5px 23px', fontSize: 85, borderRadius: 10, opacity: compare*(1-outro)}}>对话型AI</div>
    {bullets.map((label, i) => <div key={label} style={{position: 'absolute',
      left: interpolate(compare, [0,1], [1250,270], clamp),
      top: interpolate(compare,[0,1],[310,238],clamp) + i*160, fontSize: 85, fontStyle: 'normal', color: '#111', background: '#ffffffec', padding: '6px 12px', borderRadius: 12,
      boxShadow: '0 8px 22px #00000024', whiteSpace: 'nowrap',
      opacity: tween(f, 45+i*70, 57+i*70)*(1-outro)}}>－{label}</div>)}
    {['云端运行', '文件量少'].map((label, i) => <div key={label} style={{position: 'absolute',
      right: 20, top: 450+i*145, fontSize: 66, fontStyle: 'normal', color: '#111', background: '#ffffffec', padding: '6px 12px', borderRadius: 12,
      boxShadow: '0 8px 22px #00000024', opacity: compare*tween(f,280+i*70,300+i*70)*(1-outro)}}>－{label}</div>)}
    <div style={{position:'absolute',left:15,bottom:13,width:290,height:290,borderRadius:'50%',background:'#fff',overflow:'hidden',opacity:compare*(1-outro)}}>
      <Sequence from={203} durationInFrames={150} layout="none"><OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>
      <Sequence from={353} durationInFrames={81} layout="none"><OffthreadVideo transparent muted src={staticFile('characters/Fred_皱眉思考_1440p30_Alpha.webm')} style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>
    </div>
    <Sequence from={434}><AbsoluteFill style={{background:'#fff'}}><OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} style={{position:'absolute',width:1080,height:1080,left:420,top:0,objectFit:'contain'}} />
      <div style={{position:'absolute',right:80,top:80,background:'#7C3AED',color:'#fff',borderRadius:12,padding:'12px 24px',fontSize:60}}>① 本地文件处理</div>
      <div style={{position:'absolute',right:80,top:180,background:'#fff',color:'#111',borderRadius:12,padding:'12px 24px',fontSize:60,opacity:tween(f,449,450)}}>{f < 450 ? '' : `② ${'上下文更长'.slice(0,Math.min(5,f-450))}`}</div>
    </AbsoluteFill></Sequence>
  </AbsoluteFill>;
};
