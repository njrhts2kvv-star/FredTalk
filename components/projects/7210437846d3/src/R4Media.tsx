import React from 'react';
import {AbsoluteFill, Sequence, interpolate} from 'remotion';
import {Media, phase, INK, X003Capsule} from './library/SelectedMotion';
import type {MotionProps} from './SemanticMotion';
import c001 from './specs/C001.json';
import b070 from './specs/B070.json';
import x003 from './library/timelines/X003.json';

type Rect = {x: number; y: number; width: number; height: number};
type Cue = MotionProps['c'];
type TrackSpec = {tracks: Record<string, {samples: number[][]}>};

export const r4MediaRect: Rect = {
  x: (1920 - 896 * 16 / 9) / 2,
  y: 24,
  width: 896 * 16 / 9,
  height: 896,
};

export const r4DefinitionRect = {
  x: 402,
  y: 68,
  width: 1116,
  height: 794,
  radius: 24,
};

export const r4UltrafastSourceRois: Rect[] = [
  {x: 600, y: 292, width: 570, height: 440},
  {x: 1210, y: 292, width: 585, height: 440},
];

export function r4DefinitionState(t: number, c: Cue) {
  const videoStartSeconds = c(2);
  const takeover = phase(t, videoStartSeconds, videoStartSeconds + .45);
  return {
    module: {...r4DefinitionRect, opacity: 1 - takeover},
    media: {...r4MediaRect, opacity: takeover},
    videoStartSeconds,
    takeover,
  };
}

export function r4SpeedMaskState(t: number, c: Cue) {
  const scale = r4MediaRect.width / 1920;
  const opacity = phase(t, c(1) + 1.1, c(1) + 1.4)
    * (1 - phase(t, c(2) - .15, c(2) + .2));
  return {
    opacity,
    sourceRois: r4UltrafastSourceRois,
    screenRois: r4UltrafastSourceRois.map(roi => ({
      x: r4MediaRect.x + roi.x * scale,
      y: r4MediaRect.y + roi.y * scale,
      width: roi.width * scale,
      height: roi.height * scale,
    })),
    mediaRect: r4MediaRect,
  };
}

export function r5SpeedEmphasisState(t: number, c: Cue) {
  const nativeSeconds = Math.min(3.6, Math.max(0, t - c(1)) * 3);
  const nativeFrame = Math.min(180, nativeSeconds * 50);
  const shell = (column: number) => interpolate(nativeFrame,
    x003.shell.map(row => row[0]), x003.shell.map(row => row[column]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = .55;
  const centerY = 132;
  const nominalWidth = 1440;
  const width = shell(3) / 1124 * nominalWidth * scale;
  const height = shell(4) * 1.5 * scale;
  return {
    text: '官方：生成速度最高 8×',
    comparison: '普通 Astra',
    comparisonText: '相较普通 Astra',
    comparisonOpacity: phase(t, c(1) + .9, c(1) + 1.1)
      * (1 - phase(t, c(2) - .2, c(2) + .2)),
    opacity: t < c(1) ? 0 : 1 - phase(t, c(2) - .2, c(2) + .2),
    nativeSeconds,
    sourceTimeSeconds: t * 1.55,
    nominalWidth,
    scale,
    centerY,
    bounds: {x: 960 - width / 2, y: centerY - height / 2, width, height},
  };
}

const frameStyle: React.CSSProperties = {
  position: 'absolute',
  left: r4MediaRect.x,
  top: r4MediaRect.y,
  width: r4MediaRect.width,
  height: r4MediaRect.height,
  padding: 0,
  border: 0,
  borderRadius: 0,
  boxShadow: 'none',
};

const display: React.CSSProperties = {
  fontFamily: 'RuiZi',
  fontWeight: 700,
  fontSynthesis: 'none',
  letterSpacing: 0,
};

function track(spec: unknown, name: string, frame: number) {
  const rows = (spec as TrackSpec).tracks[name].samples;
  return rows[0].slice(1).map((_, i) => interpolate(
    frame,
    rows.map(row => row[0]),
    rows.map(row => row[i + 1]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  ));
}

export function R4DefinitionWindow({t, n, c}: MotionProps) {
  const state = r4DefinitionState(t, c);
  const videoFrom = Math.round(state.videoStartSeconds * 60);
  const videoFrames = Math.max(1, Math.round(n * 60) - videoFrom);
  const rate = 11 / (videoFrames / 60);
  const lines = ['Dot', '自己的电脑', '持续干活'];
  const starts = [.15, c(1), c(1) + 1.25];

  return <AbsoluteFill data-component='C001-r4-handoff'>
    <div style={{...frameStyle, opacity: state.media.opacity}}>
      <Sequence from={videoFrom} durationInFrames={videoFrames}>
        <Media src='dot-setup-r4.mp4' fit='contain' rate={rate}/>
      </Sequence>
    </div>
    <div style={{
      position: 'absolute',
      left: state.module.x,
      top: state.module.y,
      width: state.module.width,
      height: state.module.height,
      borderRadius: state.module.radius,
      background: '#222225',
      boxShadow: '22px 18px 27px #0004',
      overflow: 'hidden',
      opacity: state.module.opacity,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        paddingLeft: 48,
        height: 78,
        background: '#151517',
      }}>{['#df3099', '#ffc354', '#4289ee'].map(color => <i key={color} style={{
        width: 23,
        height: 23,
        borderRadius: '50%',
        background: color,
      }}/>)}</div>
      {lines.map((text, i) => <div key={text} data-qc-text style={{
        ...display,
        position: 'absolute',
        left: 60,
        top: 126 + i * 195,
        width: state.module.width - 120,
        fontSize: i ? 126 : 160,
        lineHeight: 1.2,
        textAlign: 'center',
        color: i === 2 ? '#D6BEFF' : '#fff',
      }}>{[...text].map((character, j) => <span key={j} style={{
        opacity: t < starts[i] ? 0 : track(
          c001,
          `glyph${i * 4 + Math.min(3, Math.floor(j * 4 / text.length))}`,
          i * 52 + 45 + Math.max(0, t - starts[i]) * 140,
        )[0],
      }}>{character}</span>)}</div>)}
    </div>
  </AbsoluteFill>;
}

export function R4StageHandoff({t, c}: MotionProps) {
  const hand = phase(t, .6, 1.15);
  const native = interpolate(t, [0, .5, 1, 1.4], [65, 155, 320, 350], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const first = c(2);
  const second = c(4);
  const firstFrame = Math.round(first * 60);
  const secondFrame = Math.round(second * 60);

  return <AbsoluteFill data-component='B070-r4-unframed'>
    <div style={frameStyle}>
      {t < first && <Media src='name.mp4' fit='contain' rate={8.5}/>}
      <Sequence from={firstFrame} durationInFrames={secondFrame - firstFrame}>
        <Media src='task.mp4' fit='contain' rate={4.5}/>
      </Sequence>
      <Sequence from={secondFrame}>
        <Media src='result.mp4' fit='contain' rate={5.9}/>
      </Sequence>
    </div>
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: 1 - hand,
      transform: `translateY(${-hand * 1000}px)`,
    }}>{['命名', '任务', '结果'].map((text, i) => {
      const [x, y, width, height] = track(b070, 'pill' + i, native);
      return <div key={text} data-qc-text style={{
        ...display,
        position: 'absolute',
        left: x,
        top: y * .7 + 70,
        width,
        height: height * .7,
        borderRadius: 72,
        background: INK,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontSize: 112,
      }}>{text}</div>;
    })}</div>
  </AbsoluteFill>;
}

export function R4LandscapeDevice({t, c}: MotionProps) {
  const change = c(2) + .35;
  return <AbsoluteFill data-component='r4-unframed-remote-desktop'>
    <div style={frameStyle}>
      {t < change && <Media src='desktop.mp4' fit='contain' rate={4.9}/>}
      <Sequence from={Math.round(change * 60)}>
        <Media src='blender.mp4' fit='contain' rate={4.7}/>
      </Sequence>
    </div>
  </AbsoluteFill>;
}

export function R4SpeedEvidence({t, c}: MotionProps) {
  const mask = r4SpeedMaskState(t, c);
  const emphasis = r5SpeedEmphasisState(t, c);
  return <AbsoluteFill data-component='r5-ultrafast-continuous-source'>
    <div style={frameStyle}>
      <Media src='ultrafast.mp4' fit='contain' rate={1.55}/>
      <svg viewBox='0 0 1920 1080' width='100%' height='100%' style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: mask.opacity,
      }}>
        <defs><mask id='r4-ultrafast-comparison-mask'>
          <rect width={1920} height={1080} fill='#fff'/>
          {mask.sourceRois.map((roi, i) => <rect key={i}
            x={roi.x} y={roi.y} width={roi.width} height={roi.height}
            rx={16} fill='#000'/>)}</mask></defs>
        <rect width={1920} height={1080} fill='rgba(0,0,0,.58)'
          mask='url(#r4-ultrafast-comparison-mask)'/>
      </svg>
    </div>
    <div data-qc-speed-claim data-comparison={emphasis.comparison} style={{
      position: 'absolute',
      inset: 0,
      opacity: emphasis.opacity,
      pointerEvents: 'none',
      transform: `scale(${emphasis.scale})`,
      transformOrigin: `960px ${emphasis.centerY}px`,
    }}>
      <X003Capsule text={emphasis.text} t={emphasis.nativeSeconds}
        y={emphasis.centerY} width={emphasis.nominalWidth} cap={134}
        centerRevealedPrefix='官方：生成速度'/>
    </div>
    <div data-qc-speed-comparison style={{
      position: 'absolute',
      left: 560,
      top: 216,
      width: 800,
      fontFamily: 'MiSans',
      fontWeight: 700,
      fontSynthesis: 'none',
      fontSize: 34,
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: 'center',
      color: '#fff',
      textShadow: '0 2px 8px #0009',
      opacity: emphasis.comparisonOpacity,
    }}>{emphasis.comparisonText}</div>
  </AbsoluteFill>;
}
