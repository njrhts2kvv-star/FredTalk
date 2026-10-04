import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (f: number, start: number, end: number) => interpolate(f, [start, end], [0, 1], clamp);

const inputs = [
  {label: '文字', icon: 'T', start: 0},
  {label: '图片', icon: '▧', start: 16},
  {label: '视频', icon: '▣', start: 32},
  {label: '音频', icon: '◀', start: 48},
] as const;

export const Q11: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load Q11 font'));
  useEffect(() => {
    Promise.all([document.fonts.load('32px SmileySans'), document.fonts.load('68px MiSans')])
      .then(() => continueRender(fontHandle));
  }, [fontHandle]);
  const arrows = at(f, 91, 107);
  const output = at(f, 108, 111);
  const outputText = at(f, 111, 115);
  const cut = f >= 209;
  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <div style={{position: 'relative', width: 960, height: 540, transform: 'scale(2)', transformOrigin: 'top left',
      fontFamily: 'SmileySans, sans-serif', color: '#fff'}}>
      {!cut && <>
        <div style={{position: 'absolute', left: 290, top: 54, display: 'flex', alignItems: 'baseline',
          fontFamily: 'MiSans, sans-serif', fontSize: 67, fontWeight: 900, letterSpacing: 0}}>
          <span>Gemini</span><span style={{marginLeft: 8}}>Omni</span>
        </div>
        <div style={{position: 'absolute', left: 507, top: 62, width: 170, height: 112,
          background: 'transparent', borderRadius: 7}}>
          <div style={{position: 'absolute', left: 18, top: 64, width: 122, height: 39,
            background: '#7C3AED', color: '#fff', textAlign: 'center', lineHeight: '39px', fontSize: 35}}>全模态</div>
        </div>
        
        <div style={{position: 'absolute', left: 166, top: 208, fontSize: 46}}>输入：</div>
        {inputs.map((entry, index) => {
          const opacity = entry.start === 0 ? 1 : at(f, entry.start, entry.start + 8);
          const x = 267 + index * 120;
          return <React.Fragment key={entry.label}>
            <div style={{position: 'absolute', left: x, top: 215, width: 111, height: 54,
              borderRadius: 5, background: '#fff', color: '#111', opacity,
              display: 'flex', alignItems: 'center', gap: 7, fontSize: 28}}>
              <span style={{marginLeft: 15}}>{entry.label}</span>
            </div>
            {f >= 88 && <svg style={{position: 'absolute', left: x + 37, top: 280, width: 36, height: 44, opacity: arrows}}
              viewBox="0 0 36 44"><path d="M13 0h10v22h11L18 42 2 22h11z" fill="none" stroke="#fff" strokeWidth="3" /></svg>}
          </React.Fragment>;
        })}
        {f >= 90 && <div style={{position: 'absolute', left: 166, top: 340, fontSize: 46, opacity: arrows}}>输出：</div>}
        {output > 0 && <div style={{position: 'absolute', left: 266, top: 339, width: 480, height: 67,
          background: '#fff', color: '#111', borderRadius: 12, boxShadow: '0 8px 22px #00000026', boxSizing: 'border-box', opacity: output,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 43}}>
          <span style={{opacity:outputText}}>全模态输出</span>
        </div>}
        <div style={{position: 'absolute', left: 6, bottom: 8, width: 120, height: 120, overflow: 'hidden',
          borderRadius: '50%', background: '#fff'}}>
          <Sequence from={0} durationInFrames={150} layout="none"><OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} style={{position:'absolute',width:140,left:-10,top:0}} /></Sequence>
          <Sequence from={150} durationInFrames={59} layout="none"><OffthreadVideo transparent muted src={staticFile('characters/Fred_皱眉思考_1440p30_Alpha.webm')} style={{position:'absolute',width:140,left:-10,top:0}} /></Sequence>
        </div>

      </>}
      {cut && <div style={{position: 'absolute', inset: 0,
        background: '#fff', color: '#111'}}>
        <Sequence from={209} layout="none"><OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} style={{position: 'absolute', left: 210, top: 0,
          width: 540, height: 540, objectFit: 'contain'}} /></Sequence>

      </div>}
    </div>
  </AbsoluteFill>;
};
