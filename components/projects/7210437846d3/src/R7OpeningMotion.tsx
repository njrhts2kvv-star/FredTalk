import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import {r4OpeningState} from './R4Replacements';
import {R4DefinitionWindow, r4DefinitionRect} from './R4Media';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const smooth = (t: number, start: number, end: number) => {
  const p = clamp((t - start) / (end - start));
  return p * p * (3 - 2 * p);
};

const posterTimes = [0, .45, .95, 1.45, 1.90, 2.55];
const posterGeometry = [0, .35, .70, 1.05, 1.20, 1.85]
  .map(time => r4OpeningState(time).objects);
const posterStarts = [0, .16, .06, .12, .05, .22, .32];
type Track = {values: number[]; tangents: number[]};

// Shared knot derivatives keep all seven objects moving through the source anchors.
const makeTrack = (values: number[], preserveShape: boolean): Track => {
  const steps = posterTimes.slice(1).map((time, i) => time - posterTimes[i]);
  const slopes = steps.map((step, i) => (values[i + 1] - values[i]) / step);
  const tangents = values.map((_, i) => {
    if (i === 0 || i === values.length - 1) return 0;
    const previous = slopes[i - 1], next = slopes[i];
    const before = steps[i - 1], after = steps[i];
    if (!preserveShape) return (after * previous + before * next) / (before + after);
    if (previous * next <= 0) return 0;
    const a = 2 * after + before, b = after + 2 * before;
    return (a + b) / (a / previous + b / next);
  });
  return {values, tangents};
};

const posterTracks = posterGeometry[0].map((_, i) => ({
  x: makeTrack(posterGeometry.map(objects => objects[i].x), false),
  y: makeTrack(posterGeometry.map(objects => objects[i].y), false),
  width: makeTrack(posterGeometry.map(objects => objects[i].width), true),
  height: makeTrack(posterGeometry.map(objects => objects[i].height), true),
}));

const sampleTrack = (t: number, track: Track) => {
  if (t <= posterTimes[0]) return track.values[0];
  if (t >= posterTimes[posterTimes.length - 1]) return track.values[track.values.length - 1];
  let i = 0;
  while (t > posterTimes[i + 1]) i++;
  const duration = posterTimes[i + 1] - posterTimes[i];
  const p = (t - posterTimes[i]) / duration, p2 = p * p, p3 = p2 * p;
  return (2 * p3 - 3 * p2 + 1) * track.values[i]
    + (p3 - 2 * p2 + p) * duration * track.tangents[i]
    + (-2 * p3 + 3 * p2) * track.values[i + 1]
    + (p3 - p2) * duration * track.tangents[i + 1];
};

export function r7OpeningPriceState(t: number) {
  const build = smooth(t, 1.65, 2.45);
  return {
    objects: posterGeometry[0].map((object, i) => ({
      id: object.id, media: object.media, z: object.z,
      x: sampleTrack(t, posterTracks[i].x),
      y: sampleTrack(t, posterTracks[i].y),
      width: sampleTrack(t, posterTracks[i].width),
      height: sampleTrack(t, posterTracks[i].height),
      opacity: smooth(t, posterStarts[i], posterStarts[i] + .38)
        * (1 - smooth(t, 1.90, 2.70)),
    })),
    module: {
      x: mix(650, 402, build), y: mix(260, 68, build),
      width: mix(620, 1116, build), height: mix(430, 794, build),
      radius: 24, opacity: smooth(t, 1.65, 2.05),
    },
    textVisibility: {
      price: smooth(t, 2.10, 2.40), question: smooth(t, 2.35, 2.65),
    },
  };
}

function openingPriceContents(visibility: {price: number; question: number}) {
  const display: React.CSSProperties = {
    fontFamily: 'RuiZi', fontWeight: 700, fontSynthesis: 'none',
    letterSpacing: 0, textAlign: 'center', whiteSpace: 'nowrap',
  };
  return <>
    <div data-qc-text data-r7-price style={{...display, position: 'absolute', left: 36,
      right: 36, top: 188, color: '#fff', lineHeight: 1.15,
      clipPath: `inset(0 ${100 * (1 - visibility.price)}% 0 0)`}}>
      <span style={{fontSize: 200}}>200</span>
      <span style={{fontSize: 94, marginLeft: 30}}>美元</span>
    </div>
    <div data-qc-text data-r7-question style={{...display, position: 'absolute', left: 36,
      right: 36, top: 505, fontSize: 104, color: '#D6BEFF', lineHeight: 1.2,
      clipPath: `inset(0 ${100 * (1 - visibility.question)}% 0 0)`
    }}>值得继续掏吗？</div>
  </>;
}

export function R7OpeningPriceQuestion({t}: MotionProps) {
  const state = r7OpeningPriceState(t), panel = state.module;
  return <AbsoluteFill data-component='R7-N038-continuous' style={{overflow: 'hidden'}}>
    {state.objects.map(object => <div key={object.id} style={{
      position: 'absolute', left: object.x, top: object.y,
      width: object.width, height: object.height, opacity: object.opacity,
      zIndex: object.z, borderRadius: 18, overflow: 'hidden',
      boxShadow: '16px 16px 24px #0003', background: 'white',
    }}><Img data-media-id={object.id} src={staticFile(`media/${object.media}`)} style={{
      width: '100%', height: '100%', objectFit: 'cover',
    }}/></div>)}
    <div style={{position: 'absolute', left: panel.x, top: panel.y,
      width: panel.width, height: panel.height, borderRadius: panel.radius,
      opacity: panel.opacity, zIndex: 20, background: '#222225',
      overflow: 'hidden', boxShadow: '22px 18px 27px #0004'}}>
      <div style={{height: 78, background: '#151517', display: 'flex',
        alignItems: 'center', gap: 22, paddingLeft: 48}}>
        {['#df3099', '#ffc354', '#4289ee'].map(color => <i key={color}
          style={{width: 23, height: 23, borderRadius: '50%', background: color}}/>)}
      </div>
      {openingPriceContents(state.textVisibility)}
    </div>
  </AbsoluteFill>;
}

// Only outgoing content crosses the seam; S04 supplies the single persistent shell.
export function R7OpeningTextHandoff({t}: MotionProps) {
  return <div data-r7-text-handoff style={{position: 'absolute',
    left: r4DefinitionRect.x, top: r4DefinitionRect.y,
    width: r4DefinitionRect.width, height: r4DefinitionRect.height,
    opacity: 1 - smooth(t, 0, .15), overflow: 'hidden', pointerEvents: 'none'}}>
    {openingPriceContents({price: 1, question: 1})}
  </div>;
}

export function R7DefinitionWindow(props: MotionProps) {
  return <R4DefinitionWindow {...props}/>;
}
