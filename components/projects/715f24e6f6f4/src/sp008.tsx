import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

import carrierMotion from './sp008-carrier-motion.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

export const SP008: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load SP008 MiSans font'));
  useEffect(() => {document.fonts.load('900 158px MiSans').then(() => continueRender(fontHandle));}, [fontHandle]);
  const phase=interpolate(f,[145,150,160,166],[0,.2,.87,1],clamp);
  const handoff=interpolate(f,[158,160,163,166],[0,.184,.7,1],clamp);
  const rows = [
    {label: '筹划阶段', y: 58, start: 5},
    {label: '开发阶段', y: 407, start: 15},
    {label: '测试阶段', y: 757, start: 47},
  ];
  return <AbsoluteFill style={{background: '#fff', fontFamily: 'MiSans, sans-serif', overflow: 'hidden'}}>
    <AbsoluteFill style={{background: '#111', opacity: phase}}>
      <div style={{position:'absolute',left:550,top:180,width:820,textAlign:'center',fontSize:58,color:'#fff',lineHeight:1.5}}>在 <span style={{color:'#C4B5FD'}}>HaiSnap</span><br/>打破技术边界，探索更多可能</div>
      <Img src={staticFile('code-revision/sp008-hai-ui.png')} style={{position:'absolute',left:390,top:360,width:1140,height:435,objectFit:'fill'}}/>
    </AbsoluteFill>
    {f < 12 && <svg style={{position:'absolute',left:919,top:485,transform:`rotate(${f*24}deg)`,opacity:1-ramp(f,8,12)}} width="82" height="82" viewBox="0 0 82 82">
      <circle cx="41" cy="41" r="25" fill="none" stroke="#7C3AED" strokeWidth="21" strokeDasharray="80 157" strokeLinecap="round"/>
      <circle cx="41" cy="41" r="9" fill="#fff"/>
    </svg>}
    {rows.map((item, i) => {
      const measured = carrierMotion[Math.min(f,carrierMotion.length-1)].find(box=>Math.abs(box[1]-item.y)<100);
      if (!measured) return null;
      const [measuredX, measuredY, measuredWidth, measuredHeight] = measured;
      const left = measuredX===0 ? measuredWidth-982 : measuredX;
      const showText = i === 0 ? 1 : i === 1 ? ramp(f, 131, 151) : 0;
      return <div key={item.label} style={{position: 'absolute', left,
        top: measuredY, width: 982, height: measuredHeight, borderRadius: 80,
        background: '#000', boxShadow: '15px 22px 22px #0003',
        opacity: 1,
        transform: 'none', transformOrigin: 'center'}}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          color: '#fff', fontSize: 158, fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap',
          opacity: showText}}>{item.label}</div>
      </div>;
    })}
    <svg style={{position: 'absolute', left:1500-1426*handoff, top: 89,
      opacity: ramp(f, 70, 84)}}
      width="214" height="173" viewBox="0 0 180 140">
      <path d="M18 70 L67 113 L157 18" fill="none" stroke="#7C3AED" strokeWidth="31"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </AbsoluteFill>;
};
