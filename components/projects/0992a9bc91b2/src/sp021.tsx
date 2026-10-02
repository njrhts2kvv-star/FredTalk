import extraMotion from './sp021-extra-native.json';
import arrowMotion from './sp021-source-motion.json';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const SP021: React.FC = () => {
  const frame = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load MiSans Heavy'));
  useEffect(() => {
    document.fonts.load('900 205px MiSans').then(() => continueRender(fontHandle));
  }, [fontHandle]);
  const bounds=arrowMotion[Math.min(frame,arrowMotion.length-1)].arrow;
  const arrowX=bounds?bounds[0]-4:1920;
  const arrowY=bounds?(frame<=36?714:bounds[1]-4):714;
  const windowY=extraMotion[Math.min(frame,extraMotion.length-1)].windowTop;
  const arrowOpacity=arrowMotion[Math.min(frame,arrowMotion.length-1)].opacity;
  return <AbsoluteFill style={{background: '#fff', fontFamily: 'MiSans, sans-serif'}}>
    <div style={{position: 'absolute', left: 297, top: windowY, width: 1327, height: 944,
      borderRadius: 30, background: '#232326', overflow: 'hidden'}}>
      <div style={{height: 86, background: '#141518', display: 'flex', gap: 22, alignItems: 'center', paddingLeft: 54}}>
        {['#ed2491', '#ffbd4d', '#3984fd'].map(color =>
          <div key={color} style={{width: 24, height: 24, background: color, borderRadius: '50%'}} />)}
      </div>
      {['能力解析', '使用方法', '效果展示'].map((line, index) =>
        <div key={line} style={{position: 'absolute', left: 184, top: 176 + index * 210,
          color: '#fff', whiteSpace: 'nowrap', fontSize: 205, lineHeight: 1,
          letterSpacing: 39, fontWeight: 900}}>{line}</div>)}
    </div>
    <svg style={{position: 'absolute', left: arrowX, top: arrowY,
      width: 265, height: 180, opacity: arrowOpacity}}
      viewBox="0 0 280 180">
      <path d="M 8 90 L 102 8 Q 112 0 118 12 L 118 44 L 244 44 Q 269 44 269 68 L 269 112 Q 269 136 244 136 L 118 136 L 118 168 Q 112 180 102 172 Z"
        fill="#7C3AED" stroke="#fff" strokeWidth="8" />
    </svg>
  </AbsoluteFill>;
};
