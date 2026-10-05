import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Media, mix, progress, rect} from '../../common';
import waves from '../../voice-waves-v6.json';

/**
 * Episode slots derived from the retained reference-legacy81-r052 / Clip052.
 * True source: .../29ba35204f4a7fce.../groups/r/faithful/src/BatchC.tsx,
 * SHA256 c60d41dff95c1aaa5bf6d0bc1ac420ab4bab9f8e61a02405d37fcc98d1a2f38d.
 * Preserve its input shrinking into a source column (1.0–1.5s), followed by
 * separate output objects (1.47–2.0s). Only one original and the two actual
 * EP102 candidates exist here; no reference Fred footage or mock workspace.
 * The horizontal/audio slot sizes differ from the portrait reference slots.
 */
export const R052_AUDIO_PROVENANCE = {
  keepId: 'reference-legacy81-r052',
  symbol: 'Clip052',
  sourceSha256: 'c60d41dff95c1aaa5bf6d0bc1ac420ab4bab9f8e61a02405d37fcc98d1a2f38d',
  referenceFrames: 360,
  referenceFps: 60,
} as const;

type Box = [number, number, number, number];
const blend = (a: Box, b: Box, q: number): Box => a.map((v, i) => mix(v, b[i], q)) as Box;
const START: Box = [690, 170, 540, 700];
const TARGETS: Box[] = [[150, 250, 480, 580], [720, 250, 480, 580], [1290, 250, 480, 580]];
const AUDIO = [
  {id: 'voice-0', label: '原声'},
  {id: 'voice-2', label: '复刻 A'},
  {id: 'voice-3', label: '复刻 B'},
] as const;

/** Exported geometry makes the episode boundaries auditable without rendering. */
export function r052AudioObjects(frame: number, review = false) {
  const t = frame / 60;
  // The source Clip052 uses smoothstep e(t, 1.0, 1.5) and e(t, 1.47, 2.0).
  const arrange = review ? 1 : progress(t, 1.0, 1.5);
  const appear = review ? 1 : progress(t, 1.47, 2.0);
  return AUDIO.map((audio, i) => ({
    ...audio,
    box: i === 0 ? blend(START, TARGETS[0], arrange)
      : [TARGETS[i][0], TARGETS[i][1] + (1 - appear) * 22.5, TARGETS[i][2], TARGETS[i][3]] as Box,
    opacity: i === 0 ? 1 : appear,
  }));
}

/** These are the measured PCM bins, not an animation or an audition clock. */
function AudioMaterial({id, label, box, focused, dim}: {id: string; label: string; box: Box; focused: boolean; dim: number}) {
  const bars = (waves as Record<string, number[]>)[id];
  const scale = Math.min(box[2] / 480, box[3] / 580);
  return <div style={{...rect(...box), overflow: 'hidden', borderRadius: 28, background: '#202124', color: '#fff',
    boxShadow: focused ? '0 0 0 6px #8554E8, 0 18px 30px #0003' : '0 18px 30px #0003', opacity: dim}}>
    <div style={{...rect((box[2] - 480 * scale) / 2, (box[3] - 580 * scale) / 2, 480, 580), transform: `scale(${scale})`, transformOrigin: 'top left'}}>
      <div style={{...rect(145, 34, 190, 190), overflow: 'hidden', borderRadius: '50%'}}>
        <Media id="tan-single" style={{objectFit: 'cover', objectPosition: '50% 24%'}}/>
      </div>
      <div style={{...rect(20, 264, 440, 92), fontSize: 66, fontWeight: 900, lineHeight: 1.2, textAlign: 'center'}}>{label}</div>
      <svg width={400} height={112} viewBox="0 0 400 112" style={{position: 'absolute', left: 40, top: 380}}>
        {bars.map((v, i) => <rect key={i} x={i * 400 / bars.length} y={56 - v * 49} width={400 / bars.length * .61}
          height={Math.max(3, v * 98)} rx={1.9} fill={focused ? '#D2B8F2' : '#fff'}/>)}
      </svg>
    </div>
  </div>;
}

export function R052AudioCandidatesV11({frame, review = false, focus = -1, opacity = 1}: {frame: number; review?: boolean; focus?: number; opacity?: number}) {
  return <AbsoluteFill style={{opacity, overflow: 'hidden'}}>
    {r052AudioObjects(frame, review).map((audio, i) => <div key={audio.id} style={{opacity: audio.opacity}}>
      <AudioMaterial {...audio} focused={i === focus} dim={focus < 0 || i === focus ? 1 : .63}/>
    </div>)}
  </AbsoluteFill>;
}
