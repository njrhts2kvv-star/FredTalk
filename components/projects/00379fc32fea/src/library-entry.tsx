import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {approvedRanges, ScatterQuestion, EvidenceClaims, ContinuityFramework} from './LibraryClips';

const components = {EP103ScatterQuestion: ScatterQuestion,
  EP103EvidenceClaims: EvidenceClaims, EP103ContinuityFramework: ContinuityFramework};

registerRoot(() => <>{Object.entries(approvedRanges).map(([id, range]) =>
  <Composition key={id} id={id} component={components[id as keyof typeof components]}
    width={3840} height={2160} fps={60}
    durationInFrames={range.endFrame - range.startFrame}
    defaultProps={{includeNarration: true}}/>)}</>);
