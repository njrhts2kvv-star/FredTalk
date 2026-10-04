import {approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';

const bounds = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], bounds);
const avatar = staticFile('characters/fred07-frames/frame-030.png');

const Face: React.FC<{left: number; top: number; size: number; frame: number; start: number}> =
  ({left, top, size, frame, start}) => {
    const p = frame >= start ? 1 : 0;
    return <Img src={avatar} style={{position: 'absolute', left, top, width: size, height: size,
      background:'#fff',objectFit:'contain',borderRadius: size * .18, opacity: p, transform: `scale(${.72 + .28 * p})`}} />;
  };

const Tag: React.FC<{text: string; left: number; top: number; color: string; frame: number; start: number}> =
  ({text, left, top, color, frame, start}) => {
    const p = progress(frame, start, start + 9);
    return <div style={{position: 'absolute', left, top, padding: '4px 15px 8px', background: color,
      color: '#fff', borderRadius: 12, boxShadow: '0 8px 22px #00000020', fontSize: 63, lineHeight: 1.08, fontFamily: 'SmileySans, sans-serif',
      whiteSpace: 'nowrap', opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>{text}</div>;
  };

const SmallRole: React.FC<{frame: number; start: number; left: number; text: string}> =
  ({frame, start, left, text}) => {
    const p = progress(frame, start, start + 12);
    return <div style={{position: 'absolute', left, top: 560, width: 232, height: 355,
      borderRadius: 18, boxShadow: '0 12px 26px #00000026', background: '#fff', color: '#111', textAlign: 'center',
      opacity: p, transform: `translateY(${(1 - p) * 35}px)`}}>
      <Img src={staticFile(`characters/fred07-frames/frame-${String(text==='生活助理'?1:text==='工作助理'?30:60).padStart(3,'0')}.png`)} style={{width: 165, height: 165, borderRadius: 83, marginTop: 28}} />
      <div style={{fontSize: 43, marginTop: 25, fontWeight: 900}}>{text}</div>
    </div>;
  };

export const Q05: React.FC = () => {
  const frame = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load Q05 fonts'));
  useEffect(() => {
    Promise.all([document.fonts.load('60px SmileySans'), document.fonts.load('40px MiSans')])
      .then(() => continueRender(fontHandle));
  }, [fontHandle]);
  const diagram = progress(frame, 278, 310);
  const title = frame < 67 ? 1 : 0;
  const role = (frame >= 67 ? 1 : 0) * (1 - progress(frame, 269, 290));
  const branch = progress(frame, 564, 587);
  const agents = [
    {left: 494, label: '生活助理', start: 300},
    {left: 844, label: '工作助理', start: 323},
    {left: 1194, label: '学习导师', start: 347},
  ];
  return <AbsoluteFill style={{background: '#000', color: '#fff', fontFamily: 'MiSans, sans-serif'}}>
    
    <div style={{position: 'absolute', top: 300, left: 0, width: '100%', textAlign: 'center', opacity: title}}>
      <span style={{background: '#7C3AED', color: '#fff', padding: '1px 17px', fontSize: 57}}>步骤 2</span>
      <div style={{fontSize: 132, fontWeight: 900, marginTop: 20}}>多Agent &amp; 多模型</div>
    </div>
    <div style={{opacity: role}}>
      <Face left={680} top={300} size={480} frame={frame} start={67} />
      <Tag text="多Agent" left={1180} top={286} color="#7C3AED" frame={frame} start={89} />
      {['不同身份', '不同记忆', '完全隔离'].map((text, i) =>
        <div key={text} style={{position: 'absolute', top: 440 + i * 105, left: 1190,
          fontFamily: 'SmileySans, sans-serif', fontSize: 84, opacity: progress(frame, 146 + i * 33, 148 + i * 33)}}>－{text}</div>)}
    </div>
    <div style={{opacity: diagram, transform: `translateX(${-190 * branch}px) scale(${1 - .22 * branch})`,
      transformOrigin: '0 0'}}>
      <Face left={868} top={62} size={184} frame={frame} start={278} />
      <Tag text="多Agent" left={815} top={335} color="#7C3AED" frame={frame} start={287} />
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <line x1="960" y1="247" x2="960" y2="335" stroke="#fff" strokeWidth="4" strokeDasharray="10 10" opacity={progress(frame, 280, 300)} />
        {agents.map((item) => {
          const p = progress(frame, item.start - 6, item.start + 12);
          return <line key={item.label} x1="960" y1="408" x2={item.left + 116} y2="560"
            stroke="#fff" strokeWidth="3" strokeDasharray="8 9" opacity={p} />;
        })}
        <line x1="1110" y1="748" x2="660" y2="748" stroke="#7C3AED" strokeWidth="4" opacity={progress(frame, 445, 465)} />
      </svg>
      {agents.map((item) => <SmallRole key={item.label} frame={frame} start={item.start} left={item.left} text={item.label} />)}
    </div>
    <Tag text="多模型" left={1440} top={390} color="#7C3AED" frame={frame} start={576} />
  </AbsoluteFill>;
};
