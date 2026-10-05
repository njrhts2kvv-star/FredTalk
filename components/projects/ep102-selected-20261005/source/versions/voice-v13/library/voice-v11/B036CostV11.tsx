import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rect} from '../../common';
import b036TextOpacity from './b036-native-text-opacity.json';

/**
 * The actual retained B036 motion body is Batch2 case 36, not its index entry.
 * Source .../5fc95c3141eb16a7.../project/src/batch2.tsx:
 * SHA256 6eeecbf912a94a1f8f632a910c54fea4c1d8b9493ba36a9ad66a8017b75cb142.
 * Its measured right-oval growth, equals fade and per-character opacity are
 * copied unchanged; EP102 supplies only the three word slots and optional
 * incoming content instead of the reference actor. No counter is invented.
 */
export const B036_COST_PROVENANCE = {
  keepId: 'reference-legacy81-b036',
  symbol: 'Batch2 / case 36',
  sourceSha256: '6eeecbf912a94a1f8f632a910c54fea4c1d8b9493ba36a9ad66a8017b75cb142',
  textOpacitySha256: '11340b3cd1af344264a11947f9ae69371ef36baf96ba48e2b2f8e2d208b65f66',
  referenceFrames: 360,
  referenceFps: 60,
} as const;

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export function b036CostMotion(nativeFrame: number) {
  const fade = (start: number, end: number) => 1 - clamp((nativeFrame - start) / (end - start));
  const growthFrames = [22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
  const growthValues = [0, .22, .40, .55, .67, .80, .88, .95, .98, 1];
  let rightScale = nativeFrame >= 40 ? 1 : 0;
  for (let i = 1; i < growthFrames.length; i++) {
    if (nativeFrame >= growthFrames[i - 1] && nativeFrame < growthFrames[i]) {
      rightScale = lerp(growthValues[i - 1], growthValues[i],
        (nativeFrame - growthFrames[i - 1]) / (growthFrames[i] - growthFrames[i - 1]));
    }
  }
  return {
    leftOpacity: fade(216, 248),
    rightOpacity: fade(242, 272),
    equalsOpacity: clamp((nativeFrame - 84) / 30) * fade(260, 290),
    rightScale,
    textSampleFrame: Math.max(0, Math.min(b036TextOpacity.samples.length - 1, Math.floor(nativeFrame / 2 + 1e-6))),
  };
}

const pill = (x: number, opacity: number, scale = 1): React.CSSProperties => ({
  ...rect(x, 390, 400, 280), background: '#121214', color: '#fff', borderRadius: 90,
  boxShadow: '0 15px 35px #00000028', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 750, fontSize: 130, opacity, transform: `scale(${scale})`,
});

export function B036CostV11({nativeFrame, words = ['1 秒', '=', '1 积分'], incoming}: {
  nativeFrame: number; words?: readonly [string, string, string]; incoming?: React.ReactNode;
}) {
  const motion = b036CostMotion(nativeFrame);
  const chars = Array.from(words[2]);
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    {nativeFrame > 190 && incoming}
    <div style={pill(290, motion.leftOpacity)}>{words[0]}</div>
    <div style={pill(1230, motion.rightOpacity, motion.rightScale)}/>
    <div style={{...rect(1230, 390, 400, 280), display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 750, fontSize: 130, color: '#fff', opacity: motion.rightOpacity, transform: `scale(${motion.rightScale})`}}>
      {chars.map((char, i) => {
        const track = Math.min(1, Math.floor(i * 2 / chars.length));
        return <span key={i} style={{opacity: b036TextOpacity.samples[motion.textSampleFrame][track + 1]}}>{char}</span>;
      })}
    </div>
    <div style={{...rect(800, 350, 320, 275), fontSize: 275, fontWeight: 700, lineHeight: 1.28,
      color: '#121214', textAlign: 'center', whiteSpace: 'pre-line', opacity: motion.equalsOpacity}}>{words[1]}</div>
  </AbsoluteFill>;
}
