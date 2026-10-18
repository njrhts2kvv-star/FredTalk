// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {Audio, Sequence} from 'remotion';
import {Episode} from './ApprovedEpisode';

export const approvedRanges = {
  EP103ScatterQuestion: {startFrame: 360, endFrame: 540},
  EP103EvidenceClaims: {startFrame: 3120, endFrame: 3360},
  EP103ContinuityFramework: {startFrame: 3420, endFrame: 4140},
} as const;

export type ApprovedClipId = keyof typeof approvedRanges;
export type ApprovedClipProps = {includeNarration?: boolean; includeSubtitles?: boolean};

/** Exact accepted scene replay. The original film clock stays continuous.
 * Text, media and motion are editable in scenes.tsx / Segment6.tsx after copying
 * this source bundle into a new episode; this is not a generic layout API.
 */
export const ApprovedSceneExcerpt: React.FC<ApprovedClipProps & {clip: ApprovedClipId; holdScene?: number}> =
  ({clip, includeNarration = false, includeSubtitles = false, holdScene}) => {
    const {startFrame, endFrame} = approvedRanges[clip];
    return <>
      <Sequence from={-startFrame} layout="none"><Episode subtitles={includeSubtitles} holdScene={holdScene}/></Sequence>
      {includeNarration && <Audio src={staticFile('narration.wav')}
        trimBefore={startFrame} trimAfter={endFrame}/>}
    </>;
  };

export const ScatterQuestion: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP103ScatterQuestion"/>;
export const EvidenceClaims: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP103EvidenceClaims"/>;
export const ContinuityFramework: React.FC<ApprovedClipProps> = props =>
  <ApprovedSceneExcerpt {...props} clip="EP103ContinuityFramework" holdScene={5}/>;
