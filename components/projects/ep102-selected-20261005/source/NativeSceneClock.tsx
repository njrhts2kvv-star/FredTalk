import React, {useContext} from 'react';
import {Freeze, Internals, useCurrentFrame, useVideoConfig} from 'remotion';

function ClockGuard({expected, children}: {expected: number; children: React.ReactNode}) {
  const actual = useCurrentFrame();
  if (actual !== expected) throw new Error(`EP102 native clock mismatch: expected ${expected}; got ${actual}`);
  return <>{children}</>;
}

/** Remotion 4.0.473 also uses cumulatedNegativeFrom in playbackRate media time.
 * A negative excerpt Sequence changes that value and shifts rate != 1 clips.
 * Freeze maps each output frame to its original scene frame; the original
 * positive scene clock has zero pre-roll and its complete scene duration.
 * The pinned runtime's context is necessary to preserve both media trims and
 * inner positive Sequences when the excerpt is shorter than the original scene.
 */
export function NativeSceneClock({frame, durationInFrames, children}: {frame: number; durationInFrames: number; children: React.ReactNode}) {
  const parent = useContext(Internals.SequenceContext);
  const manager = useContext(Internals.CompositionManager);
  const videoConfig = useVideoConfig();
  const relativeFrom = parent?.relativeFrom ?? 0;
  const context = {
    cumulatedFrom: 0, relativeFrom, cumulatedNegativeFrom: 0,
    durationInFrames, parentFrom: 0, id: 'ep102-selected-native-scene',
    height: null, width: null, premounting: false, postmounting: false,
    premountDisplay: null, postmountDisplay: null,
  };
  // useTimelinePosition clamps to the composition metadata, independently of
  // Sequence duration. Retain the full native duration inside this subtree too.
  const nativeManager = {...manager, currentCompositionMetadata: {...videoConfig, durationInFrames: durationInFrames + Math.max(0, relativeFrom)}};
  return <Internals.CompositionManager.Provider value={nativeManager}>
    <Freeze frame={frame}><Internals.SequenceContext.Provider value={context}>
      <ClockGuard expected={frame}>{children}</ClockGuard>
    </Internals.SequenceContext.Provider></Freeze>
  </Internals.CompositionManager.Provider>;
}
