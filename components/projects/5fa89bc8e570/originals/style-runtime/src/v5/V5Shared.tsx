import type {CSSProperties, ReactNode} from 'react';
import {Img, AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Sound, font} from '../shared';

export const motion = (frame: number, start: number, frames = 24) => interpolate(frame, [start, start + frames], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});

export const V5Canvas = ({dark, children}: {dark: boolean; children: ReactNode}) => (
  <AbsoluteFill style={{background: dark ? '#000' : '#fff', color: dark ? '#fff' : '#090909', fontFamily: font, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Medium.otf')}');font-weight:500}@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Semibold.otf')}');font-weight:600}`}</style>
    {children}
  </AbsoluteFill>
);

export const QuickText = ({children, at, from = 'left', style}: {children: ReactNode; at: number; from?: 'left' | 'right' | 'center'; style?: CSSProperties}) => {
  const frame = useCurrentFrame();
  const p = motion(frame, at, 22);
  const inset = from === 'left' ? `0 ${(1 - p) * 100}% 0 0` : from === 'right' ? `0 0 0 ${(1 - p) * 100}%` : `0 ${(1 - p) * 50}%`;
  const x = from === 'left' ? (1 - p) * 24 : from === 'right' ? (p - 1) * 24 : 0;
  return <div style={{clipPath: `inset(${inset})`, transform: `translateX(${x}px)`, ...style}}>{children}</div>;
};

export const SfxPair = ({cues, names}: {cues: number[]; names: string[]}) => <>{names.map((name, i) => (
  <Sound key={`${name}-${i}`} at={cues[Math.min(i, cues.length - 1)] ?? 10} file={`sfx/${name === 'scroll' ? 'scroll.mp3' : `${name}.wav`}`} volume={name === 'scroll' ? 0.16 : 0.14} playbackRate={name === 'scroll' ? 1.65 : 1} />
))}</>;

export const FredCard = ({at, dark, pose = 'thinking', style}: {at: number; dark: boolean; pose?: string; style?: CSSProperties}) => {
  const frame = useCurrentFrame();
  const p = motion(frame, at, 26);
  const source = pose === 'judging' ? 'fred-judging.png' : pose === 'pointing' ? 'fred-pointing.png' : pose === 'confirming' ? 'fred-confirming.png' : 'fred-thinking.png';
  return <div style={{width: 440, height: 650, overflow: 'hidden', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, transform: `translateX(${(1 - p) * -30}px)`, ...style}}>
    <Img src={staticFile(`characters/${source}`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
  </div>;
};

export const DeviceFrame = ({kind, dark, children, style}: {kind: 'phone' | 'desktop' | 'monitor'; dark: boolean; children: ReactNode; style?: CSSProperties}) => {
  if (kind === 'phone') return <div style={{width: 270, height: 540, padding: 13, borderRadius: 52, background: dark ? '#fff' : '#111', ...style}}><div style={{height: '100%', borderRadius: 40, background: dark ? '#111' : '#fff', color: dark ? '#fff' : '#111', overflow: 'hidden', position: 'relative'}}>{children}</div></div>;
  const monitor = kind === 'monitor';
  return <div style={{...style}}><div style={{width: monitor ? 780 : 850, height: monitor ? 455 : 500, borderRadius: 26, border: monitor ? `18px solid ${dark ? '#fff' : '#111'}` : 'none', background: dark ? '#161616' : '#f4f4f4', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,.18)'}}>{!monitor && <div style={{height: 52, background: dark ? '#242424' : '#e6e6e6'}} />}{children}</div>{monitor && <><div style={{width: 62, height: 65, margin: '0 auto', background: dark ? '#fff' : '#111'}}/><div style={{width: 220, height: 18, margin: '0 auto', borderRadius: 20, background: dark ? '#fff' : '#111'}}/></>}</div>;
};

export const FileCard = ({label, dark = false, style}: {label: string; dark?: boolean; style?: CSSProperties}) => <div style={{width: 300, height: 380, borderRadius: 26, background: dark ? '#171717' : '#fff', color: dark ? '#fff' : '#111', border: `4px solid ${dark ? '#333' : '#111'}`, padding: 34, boxShadow: '0 20px 50px rgba(0,0,0,.13)', ...style}}><div style={{width: 68, height: 84, borderRadius: 10, border: `5px solid ${dark ? '#fff' : '#111'}`}}/><div style={{fontSize: 48, fontWeight: 600, marginTop: 76}}>{label}</div><div style={{height: 8, width: '80%', background: dark ? '#555' : '#ddd', marginTop: 30}}/><div style={{height: 8, width: '55%', background: dark ? '#555' : '#ddd', marginTop: 16}}/></div>;
