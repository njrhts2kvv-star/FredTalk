import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {approvedRanges, CardsToQuestion, SupportToEvidence, VersionComparison,
  CapabilitiesMerge, ConclusionToReasons} from './LibraryClips';

const components = {
  EP107CardsToQuestion: CardsToQuestion,
  EP107SupportToEvidence: SupportToEvidence,
  EP107VersionComparison: VersionComparison,
  EP107CapabilitiesMerge: CapabilitiesMerge,
  EP107ConclusionToReasons: ConclusionToReasons,
};

const Root = () => <>{Object.entries(approvedRanges).map(([id, range]) =>
  <Composition key={id} id={id} component={components[id as keyof typeof components]}
    durationInFrames={range.endFrame - range.startFrame} fps={60}
    width={3840} height={2160} defaultProps={{includeNarration: true}}/>
)}</>;

registerRoot(Root);
