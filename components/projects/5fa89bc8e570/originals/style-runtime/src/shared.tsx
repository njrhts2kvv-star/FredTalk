import type {ReactNode} from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const font = 'MiSans, Arial, sans-serif';
export const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const enter = (frame: number, start: number, duration = 22) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const Sound = ({at, file, volume = 0.12, playbackRate = 1, trimAfter}: {at: number; file: string; volume?: number; playbackRate?: number; trimAfter?: number}) => (
  <Sequence from={at} premountFor={30}>
    <Audio src={staticFile(file)} volume={volume} playbackRate={playbackRate} trimAfter={trimAfter} />
  </Sequence>
);

export const Stage = ({children}: {children: ReactNode}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, Math.round(0.18 * fps), Math.round(0.26 * fps));
  return (
    <AbsoluteFill style={{background: '#fff', fontFamily: font, alignItems: 'center', justifyContent: 'center'}}>
      <style>{`
        @font-face { font-family: MiSans; src: url('${staticFile('fonts/MiSans-Medium.otf')}'); font-weight: 500; }
        @font-face { font-family: MiSans; src: url('${staticFile('fonts/MiSans-Semibold.otf')}'); font-weight: 600; }
      `}</style>
      <div
        style={{
          width: 1600,
          height: 820,
          borderRadius: 34,
          background: '#1f2024',
          overflow: 'hidden',
          boxShadow: '0 28px 72px rgba(0,0,0,.14)',
          transform: `translateY(${(1 - p) * 16}px) scale(${0.992 + p * 0.008})`,
          opacity: interpolate(p, [0, 0.24, 1], [0, 1, 1]),
        }}
      >
        <div style={{height: 68, background: '#151619', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((color) => <div key={color} style={{width: 14, height: 14, borderRadius: 99, background: color}} />)}
        </div>
        <div style={{height: 752, position: 'relative'}}>{children}</div>
      </div>
      <Sound at={Math.round(0.18 * fps)} file="sfx/whoosh.wav" volume={0.1} />
    </AbsoluteFill>
  );
};
