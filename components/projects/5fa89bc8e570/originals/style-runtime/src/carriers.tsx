import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {font} from './shared';

export const clamp = (frame: number, start: number, end: number, from = 0, to = 1) =>
  interpolate(frame, [start, end], [from, to], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const fast = (frame: number, start: number, end: number, from = 0, to = 1) =>
  interpolate(frame, [start, end], [from, to], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const Canvas = ({dark = false, children}: {dark?: boolean; children: ReactNode}) => (
  <AbsoluteFill style={{background: dark ? '#000' : '#fff', color: dark ? '#fff' : '#090909', fontFamily: font}}>
    <style>{`
      @font-face { font-family: MiSans; src: url('${staticFile('fonts/MiSans-Medium.otf')}'); font-weight: 500; }
      @font-face { font-family: MiSans; src: url('${staticFile('fonts/MiSans-Semibold.otf')}'); font-weight: 600; }
    `}</style>
    {children}
  </AbsoluteFill>
);

export const Reveal = ({children, start, y = 30, style}: {children: ReactNode; start: number; y?: number; style?: CSSProperties}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = clamp(frame, start, start + 0.38 * fps);
  return (
    <div style={{clipPath: `inset(${(1 - p) * 100}% 0 0 0)`, transform: `translateY(${(1 - p) * y}px)`, ...style}}>
      {children}
    </div>
  );
};

export const Phone = ({children, style}: {children: ReactNode; style?: CSSProperties}) => (
  <div style={{width: 430, height: 820, borderRadius: 76, background: '#111216', padding: 18, boxShadow: '0 34px 80px rgba(0,0,0,.2)', ...style}}>
    <div style={{height: '100%', borderRadius: 60, background: '#fff', overflow: 'hidden', position: 'relative'}}>
      <div style={{position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 130, height: 34, borderRadius: 99, background: '#0b0b0d', zIndex: 2}} />
      {children}
    </div>
  </div>
);

export const Desktop = ({children, dark = false, style}: {children: ReactNode; dark?: boolean; style?: CSSProperties}) => (
  <div style={{width: 1480, height: 790, borderRadius: 34, background: dark ? '#141519' : '#f5f5f6', overflow: 'hidden', boxShadow: '0 30px 90px rgba(0,0,0,.22)', ...style}}>
    <div style={{height: 64, background: dark ? '#202126' : '#e9e9eb', display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 28}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((color) => <span key={color} style={{width: 14, height: 14, borderRadius: 99, background: color}} />)}
    </div>
    <div style={{height: 726, position: 'relative', background: dark ? '#141519' : '#fff', color: dark ? '#fff' : '#111'}}>{children}</div>
  </div>
);

export const Monitor = ({children, style}: {children: ReactNode; style?: CSSProperties}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...style}}>
    <div style={{width: 1340, height: 680, border: '24px solid #111216', borderRadius: 34, background: '#fff', overflow: 'hidden', position: 'relative', boxShadow: '0 28px 80px rgba(0,0,0,.17)'}}>{children}</div>
    <div style={{width: 86, height: 96, background: '#111216'}} />
    <div style={{width: 330, height: 28, borderRadius: 99, background: '#111216'}} />
  </div>
);

export const Pill = ({children, dark = true, style}: {children: ReactNode; dark?: boolean; style?: CSSProperties}) => (
  <div style={{height: 210, borderRadius: 34, background: dark ? '#101114' : '#fff', color: dark ? '#fff' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 76, fontWeight: 600, boxShadow: '0 18px 48px rgba(0,0,0,.11)', ...style}}>{children}</div>
);
