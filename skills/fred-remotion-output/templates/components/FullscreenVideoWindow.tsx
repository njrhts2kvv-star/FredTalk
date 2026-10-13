import React from 'react';
import {OffthreadVideo} from 'remotion';
import {fullscreenVideoWindowGeometry} from './fullscreen-video-window-geometry';

export type FullscreenVideoWindowProps = {
  src: string;
  /** Local stage dimensions; leave at 1920x1080 inside a parent scale(2). */
  canvasWidth?: number;
  canvasHeight?: number;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  /** Remotion media timing/audio props, in the current composition's clock. */
  videoProps?: Omit<React.ComponentProps<typeof OffthreadVideo>, 'src' | 'style' | 'className'>;
};

/** Stable playback shell. No episode cues, freezing, looping or entrance animation. */
export function FullscreenVideoWindow({
  src,
  canvasWidth = 1920,
  canvasHeight = 1080,
  objectFit = 'cover',
  objectPosition = 'center',
  videoProps,
}: FullscreenVideoWindowProps) {
  const geometry = fullscreenVideoWindowGeometry(canvasWidth, canvasHeight);
  return <div data-fred-component="fullscreen-video-window" style={{
    position: 'absolute',
    ...geometry,
    border: 'none',
    overflow: 'hidden',
    background: '#fff',
  }}>
    <OffthreadVideo muted {...videoProps} src={src} style={{
      width: '100%',
      height: '100%',
      objectFit,
      objectPosition,
    }}/>
  </div>;
}
