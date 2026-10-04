import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, Sequence, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const on = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const stacks = [
  {id: 'a', left: 330, top: 24, width: 320, height: 348, start: 68},
  {id: 'b', left: 1336, top: 60, width: 364, height: 410, start: 72},
  {id: 'c', left: 200, top: 480, width: 280, height: 308, start: 77},
  {id: 'd', left: 772, top: 710, width: 308, height: 250, start: 85},
  {id: 'e', left: 1442, top: 526, width: 338, height: 414, start: 91},
];

export const Q15: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load Q15 font'));
  useEffect(() => {document.fonts.load('90px MiSans').then(() => continueRender(fontHandle));}, [fontHandle]);
  const stacked = on(f, 63, 100);
  const dim = on(f, 177, 195);
  return <AbsoluteFill style={{background: '#030303', color: '#fff', overflow: 'hidden'}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      {stacks.map((item) => <line key={item.id} x1="960" y1="560" x2={item.left+item.width/2}
        y2={item.top+item.height/2} stroke="#fff" strokeWidth="3" strokeDasharray="8 5"
        opacity={on(f, item.start-9, item.start+11)} />)}
    </svg>
    {stacks.map((item) => {
      const appear = on(f, item.start, item.start+13);
      return <div key={item.id} style={{position:'absolute',left:item.left,top:item.top,width:item.width,height:item.height,
        opacity:appear,transform:`scale(${.68+.32*appear})`,filter:`blur(${dim*4}px)`,overflow:'hidden',borderRadius:12,background:'#fff'}}>
        <Img src={staticFile(`q15-${item.id}.png`)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}} />

      </div>;
    })}
    <div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center',
      fontFamily: 'MiSans, sans-serif', fontSize: 117, color: '#eee', fontStyle: 'italic',
      fontWeight: 500}}>AI对话框</div>
    <div style={{position: 'absolute', top: 480, left: 600, width: 720, height: 95,
      borderRadius: 22, background: '#fff', color: '#111', boxShadow: '0 10px 26px #00000026', boxSizing: 'border-box',
      transform: `translateY(${-6*stacked}px)`}}>
      <div style={{position: 'absolute', right: 90, top: 11, width: 63, height: 63,
        borderRadius: '50%', border: 'none', textAlign: 'center', fontSize: 53, lineHeight: '54px'}}>＋</div>
      <div style={{position: 'absolute', right: 16, top: 11, width: 63, height: 63,
        borderRadius: '50%', border: 'none', textAlign: 'center', fontSize: 44, lineHeight: '54px'}}>◉</div>
    </div>
    <AbsoluteFill style={{background: '#000', opacity: dim*.61}} />
    <div style={{position:'absolute',left:15,bottom:12,width:292,height:292,borderRadius:'50%',background:'#fff',overflow:'hidden'}}>
      <Sequence from={0} durationInFrames={150} layout="none"><OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>
      <Sequence from={150} durationInFrames={180} layout="none"><OffthreadVideo transparent muted playbackRate={150/180} src={staticFile('characters/Fred_皱眉思考_1440p30_Alpha.webm')} style={{width:'100%',height:'100%',objectFit:'contain'}} /></Sequence>
    </div>
    <div style={{position: 'absolute', left: 280, top: 266, width:530, height:216, display:'grid',placeItems:'center', background: '#7C3AED', borderRadius: 15, boxShadow: '0 10px 26px #00000026',
      color: '#fff', fontSize: 138, fontFamily: 'SmileySans, sans-serif', opacity: on(f, 186, 207),
      clipPath:`inset(${(1-on(f,186,207))*100}% 0 0 0)`}}>理解素材</div>
    <div style={{position: 'absolute', left: 1130, top: 266, width:530, height:216, display:'grid',placeItems:'center', background: '#7C3AED', borderRadius: 15, boxShadow: '0 10px 26px #00000026',
      color: '#fff', fontSize: 138, fontFamily: 'SmileySans, sans-serif', opacity: on(f, 222, 243),
      clipPath:`inset(${(1-on(f,222,243))*100}% 0 0 0)`}}>理解语义</div>
    <div style={{position: 'absolute', left: 550, top: 510, fontSize: 190, color: '#fff', fontWeight:700,
      fontStyle: 'normal', fontFamily:'SmileySans, sans-serif',opacity: on(f, 273, 297)}}>多模态Agent</div>
  </AbsoluteFill>;
};
