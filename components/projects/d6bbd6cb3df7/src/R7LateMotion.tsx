import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import {INK, LIGHT, mix, clamp} from './library/SelectedMotion';

const ease = (t: number, at: number, duration: number) => {
  const p = clamp((t - at) / duration);
  return p * p * (3 - 2 * p);
};
const heavy: React.CSSProperties = {fontFamily: 'SourceHanHeavy', fontWeight: 900, fontSynthesis: 'none', letterSpacing: 0};
const display: React.CSSProperties = {fontFamily: 'RuiZi', fontWeight: 700, fontSynthesis: 'none', letterSpacing: 0};

export function r7CommercialState(t: number, c: MotionProps['c']) {
  const move = ease(t, c(1), .6);
  return {
    centerX: mix(960, 1355, move),
    opacity: ease(t, .08, .35),
    entries: [ease(t, c(1) + .25, .42), ease(t, c(2), .42)],
  };
}

export function R7CommercialList({t, c}: MotionProps) {
  const s = r7CommercialState(t, c);
  return <AbsoluteFill data-component='B018-r7-conclusion-to-reasons'>
    <div style={{position: 'absolute', left: s.centerX - 430, top: 370, width: 860, ...heavy,
      fontSize: 154, textAlign: 'center', opacity: s.opacity, textShadow: '8px 11px 14px #0002'}}>更商业化</div>
    {['功能更多', '额度收紧'].map((text, i) => {
      const p = s.entries[i];
      return <div key={text} style={{position: 'absolute', left: 140, top: 220 + i * 290, width: 650,
        height: 220, borderRadius: 58, background: INK, boxShadow: '22px 18px 27px #0004',
        display: 'grid', placeItems: 'center', overflow: 'hidden', opacity: p,
        clipPath: `inset(0 ${100 * (1 - p)}% 0 0 round 58px)`, transform: `translateX(${(1 - p) * -28}px)`}}>
        <span data-qc-text style={{...display, fontSize: 126, color: LIGHT, whiteSpace: 'nowrap'}}>{text}</span>
      </div>;
    })}
  </AbsoluteFill>;
}

export function r7TeamSourceFrame(frame: number) {
  return Math.floor(Math.min(383, Math.max(0, frame)) / 2);
}

export function R7TeamSource() {
  const sourceFrame = r7TeamSourceFrame(useCurrentFrame());
  return <AbsoluteFill data-component='r7-team-native-frame-cache'>
    <Img src={staticFile(`media/r7-team-frames/${String(sourceFrame).padStart(3, '0')}.png`)}
      style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
  </AbsoluteFill>;
}
