import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ElasticClickVideo} from './ElasticClickVideo';
import {fullscreenVideoWindowGeometry} from '../../shared/fullscreen-video-window-geometry';

export type OpeningV5Props = {src?: string; sourceIn?: number; showCursor?: boolean};
/** Retarget the approved elastic entry directly to the final shell; no later contraction. */
export function OpeningV5({src = 'media/negative-preview-1080p.mp4', sourceIn = 2, showCursor = true}: OpeningV5Props) {
  const {fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const shadow = interpolate(t, [.833333, .933333], [0, .1333333333], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shell = fullscreenVideoWindowGeometry();
  const scale = shell.height / 1080;
  return <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: shell.left, top: shell.top, width: shell.width, height: shell.height,
      overflow: 'hidden', borderRadius: shell.borderRadius, boxShadow: `0 16px 25px 0 rgba(0,0,0,${shadow})`}}>
      <div style={{position: 'absolute', left: (shell.width - 1920 * scale) / 2, top: 0,
        width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
        <ElasticClickVideo src={staticFile(src)} trimBefore={Math.round(sourceIn * fps)} showCursor={showCursor}/>
      </div>
    </div>
  </AbsoluteFill>;
}
