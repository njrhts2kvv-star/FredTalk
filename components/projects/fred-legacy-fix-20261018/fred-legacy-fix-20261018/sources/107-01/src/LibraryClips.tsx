// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {Sequence} from 'remotion';
import {FilmScaled} from './ApprovedEpisode';

export const approvedRanges = {
  EP107CardsToQuestion: {startFrame: 540, endFrame: 720},
  EP107SupportToEvidence: {startFrame: 2880, endFrame: 3000},
  EP107VersionComparison: {startFrame: 4380, endFrame: 4800},
  EP107CapabilitiesMerge: {startFrame: 10320, endFrame: 10740},
  EP107ConclusionToReasons: {startFrame: 10980, endFrame: 11220},
} as const;

export type ApprovedClipId = keyof typeof approvedRanges;
export type ApprovedClipProps = {includeNarration?: boolean; includeSubtitles?: boolean};

// Offset the original film rather than restarting an already-moving scene.
export const ApprovedSceneExcerpt: React.FC<ApprovedClipProps & {clip: ApprovedClipId}> =
  ({clip, includeNarration = false, includeSubtitles = false}) => <Sequence
    from={-approvedRanges[clip].startFrame} layout="none">
    <FilmScaled includeNarration={includeNarration} includeSubtitles={includeSubtitles}/>
  </Sequence>;

export const CardsToQuestion: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP107CardsToQuestion"/>;
export const SupportToEvidence: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP107SupportToEvidence"/>;
export const VersionComparison: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP107VersionComparison"/>;
export const CapabilitiesMerge: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP107CapabilitiesMerge"/>;
export const ConclusionToReasons: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP107ConclusionToReasons"/>;
