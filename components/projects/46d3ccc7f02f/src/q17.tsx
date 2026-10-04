import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, Sequence, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const progress = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const FredAvatar: React.FC<{frame:number}> = () => <div style={{position:'absolute',left:15,bottom:35,width:150,height:150,borderRadius:'50%',overflow:'hidden',background:'#fff'}}>
  <Sequence from={0} durationInFrames={150} layout="none"><OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} style={{width:175,height:175,marginLeft:-13,objectFit:'contain'}} /></Sequence>
  <Sequence from={150} durationInFrames={180} layout="none"><OffthreadVideo transparent muted playbackRate={150/180} src={staticFile('characters/Fred_皱眉思考_1440p30_Alpha.webm')} style={{width:175,height:175,marginLeft:-13,objectFit:'contain'}} /></Sequence>
</div>;

export const Q17: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load Q17 font'));
  useEffect(() => {
    document.fonts.load('56px SmileySans').then(() => continueRender(fontHandle));
  }, [fontHandle]);
  const focus = f < 27 ? -1 : f < 51 ? 0 : f < 70 ? 1 : f < 87 ? 2 : f < 105 ? 3 : 4;
  const speech = progress(f, 133, 146);
  const bubble = progress(f, 136, 144);
  const text = progress(f, 176, 187);
  const secondText = progress(f, 192, 204);
  return <AbsoluteFill style={{background: '#030303', color: '#fff', overflow: 'hidden'}}>
    <div style={{position: 'relative', width: 960, height: 540,
      transform: 'scale(2)', transformOrigin: 'top left',
      fontFamily: 'SmileySans, sans-serif'}}>
      <div style={{position:'absolute',inset:0,transform:`translateY(${-60*speech}px) scale(${1-.22*speech})`,transformOrigin:'480px 0'}}>
      <div style={{position: 'absolute', top: 120, left: 365, width: 230, height: 120,
        display: 'grid', placeItems: 'center', borderRadius: 9, background: '#7C3AED',
        color: '#fff', fontSize: 71}}>大问题</div>
      {Array.from({length: 5}, (_, index) => {
        const reveal = progress(f, 15 + index * 3, 25 + index * 3);
        return <div key={index} style={{position: 'absolute', top: 276, left: 80 + index * 166,
          width: 127, height: 78, borderRadius: 5, background: focus === index ? '#7C3AED' : '#fff',
          display: 'grid', placeItems: 'center', color: focus === index ? '#fff' : '#111', fontSize: 51,
          opacity: reveal, transform: `translateY(${(1 - reveal) * -55}px)`,
          boxShadow: '0 8px 22px #00000026'}}>
          问题{index + 1}
        </div>;
      })}
      </div>
      {speech > 0 && <>
        <div style={{position:'absolute',left:615,top:232,width:265,height:265,borderRadius:'50%',background:'#fff',opacity:bubble}} />

        <div style={{position: 'absolute', left: 235, top: 232, width: 365, height: 152,
          background: '#fff', borderRadius: 13, color: '#090909',
          opacity: bubble, transform: `scale(${.8 + bubble * .2})`,
          padding: '14px 22px', boxSizing: 'border-box',
          fontSize: 41, lineHeight: 1.05}}>
          <div style={{position:'absolute',right:20,bottom:-42,width:0,height:0,borderTop:'44px solid #fff',borderLeft:'85px solid transparent'}} />
          <div style={{opacity: text}}>怎么写提示词？</div><div style={{opacity: secondText}}>怎么拆解问题？</div>
        </div>
        <Sequence from={133} durationInFrames={151} layout="none"><OffthreadVideo src={staticFile('characters/Fred_抚额苦恼_1440p30_Alpha.webm')} transparent muted style={{position:'absolute',left:600,top:230,width:280,height:280,opacity:bubble}} /></Sequence>
        <Sequence from={284} durationInFrames={46} layout="none"><OffthreadVideo src={staticFile('characters/Fred_皱眉思考_1440p30_Alpha.webm')} transparent muted style={{position:'absolute',left:600,top:230,width:280,height:280}} /></Sequence>
      </>}
      <FredAvatar frame={f} />

    </div>
  </AbsoluteFill>;
};
