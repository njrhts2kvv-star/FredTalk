import React from 'react';
import {AbsoluteFill} from 'remotion';
import {progress} from '../common';
import {RebuiltX003} from '../library/x003/RebuiltX003';
import {R052AudioCandidatesV11} from '../library/voice-v11/R052AudioCandidatesV11';
import {B036CostV11} from '../library/voice-v11/B036CostV11';
import {VoiceRevisionV10} from './VoiceRevisionV10';
import {VoiceV8} from './MajorRevisionV8';

/** Fred-selected X003: preserve its measured shell/letter cues and one word slot.
 * Only the episode word, requested white accent, font binding and cue clock vary.
 * Stop before the original second condition expansion: no second model word.
 */
function ModelName({frame}: {frame: number}) {
  const local = frame - 480;
  const nativeTime = Math.min(114 / 30, Math.max(0, local) * 1.8 / 60);
  return <><VoiceV8 frame={frame}/><AbsoluteFill style={{opacity: progress(local, 0, 20)}}>
    <RebuiltX003 t={nativeTime} overrides={{words: ['Seed Audio 1.0', ''], accent: '#fff'}}/>
  </AbsoluteFill></>;
}

/** Cost has 66 frames of source motion, then 28 frames of the complete formula. */
export const s08CostNativeFrame = (local: number) => Math.min(180, Math.max(0, local) * 180 / 66);

function Candidates({frame}: {frame: number}) {
  const local = frame - 715;
  return <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
    <R052AudioCandidatesV11 frame={local}/>
    {local < 18 && <AbsoluteFill style={{opacity: 1 - progress(local, 0, 18)}}><ModelName frame={714}/></AbsoluteFill>}
  </AbsoluteFill>;
}

function UnitCost({frame}: {frame: number}) {
  const local = frame - 924;
  return <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
    <R052AudioCandidatesV11 frame={208} review opacity={1 - progress(local, 0, 20)}/>
    <AbsoluteFill style={{opacity: progress(local, 0, 18)}}><B036CostV11 nativeFrame={s08CostNativeFrame(local)}/></AbsoluteFill>
  </AbsoluteFill>;
}

/** Return to the same three identities; emphasis is comparison, not a chosen winner. */
function LowCostIteration({frame}: {frame: number}) {
  const local = frame - 1018;
  const focus = local >= 18 && local < 66 ? 1 : local >= 72 && local < 116 ? 2 : -1;
  const returnOpacity = progress(local, 0, 18);
  const exitOpacity = 1 - progress(frame, 1128, 1156);
  return <><VoiceV8 frame={frame}/><AbsoluteFill style={{background: '#fff', opacity: exitOpacity, overflow: 'hidden'}}>
    <R052AudioCandidatesV11 frame={208} review focus={focus} opacity={returnOpacity}/>
    {local < 18 && <AbsoluteFill style={{opacity: 1 - returnOpacity}}><B036CostV11 nativeFrame={180}/></AbsoluteFill>}
  </AbsoluteFill></>;
}

/** This visual-only patch retains candidate/cost objects and the unchanged master clock. */
export function VoiceRevisionV13({frame}: {frame: number}) {
  // Remove the rejected generated-dialogue visual, retaining the real source clock.
  if (frame >= 2315 && frame < 2521) return <VoiceV8 frame={frame}/>;
  if (frame < 480 || frame >= 1156) return <VoiceRevisionV10 frame={frame}/>;
  if (frame < 715) return <ModelName frame={frame}/>;
  if (frame < 924) return <Candidates frame={frame}/>;
  if (frame < 1018) return <UnitCost frame={frame}/>;
  return <LowCostIteration frame={frame}/>;
}
