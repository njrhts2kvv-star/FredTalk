import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {Episode} from './ApprovedEpisode';

export const approvedRanges = {
  EP103ScatterQuestion: {startFrame: 360, endFrame: 540},
  EP103EvidenceClaims: {startFrame: 3120, endFrame: 3360},
  EP103ContinuityFramework: {startFrame: 3420, endFrame: 4140},
} as const;

export type ApprovedClipId = keyof typeof approvedRanges;
export type ApprovedClipProps = {includeNarration?: boolean};

/** Exact accepted scene replay. The original film clock stays continuous.
 * Text, media and motion are editable in scenes.tsx / Segment6.tsx after copying
 * this source bundle into a new episode; this is not a generic layout API.
 */
export const ApprovedSceneExcerpt: React.FC<ApprovedClipProps & {clip: ApprovedClipId}> =
  ({clip, includeNarration = true}) => {
    const {startFrame, endFrame} = approvedRanges[clip];
    return <>
      <Sequence from={-startFrame} layout="none"><Episode/></Sequence>
      {includeNarration && <Audio src={staticFile('narration.wav')}
        trimBefore={startFrame} trimAfter={endFrame}/>}
    </>;
  };

export const ScatterQuestion: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP103ScatterQuestion"/>;
export const EvidenceClaims: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP103EvidenceClaims"/>;
export const ContinuityFramework: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP103ContinuityFramework"/>;
