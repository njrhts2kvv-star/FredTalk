import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Incoming} from './versions/incoming';
import {InstallV7} from './versions/install-v8/adapters/MediaRevisionV7';

/** The original repair is a 4K component, mounted outside the logical canvas.
 * Its underlying approved current.mp4 already carries a caption. For a clean
 * reuse, rebuild that current layer from its exact InstallV7 source instead.
 */
export function IncomingAdapter({includeSubtitles = true}: {includeSubtitles?: boolean}) {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  if (includeSubtitles) return <Incoming sceneId="S04"/>;
  const q = interpolate(frame, [0, 35], [0, 1], {easing: Easing.bezier(.65, 0, .2, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
    <Img src={staticFile('clean/S03.png')} style={{width: '100%', height: '100%', filter: `blur(${q * 10}px)`}}/>
    <AbsoluteFill style={{opacity: q}}>
      <div style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: 'top left', overflow: 'hidden'}}><InstallV7 frame={frame}/></div>
    </AbsoluteFill>
  </AbsoluteFill>;
}
