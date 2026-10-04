import React from 'react';
import {Loop, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import bindings from './material-bindings.json';
const replacements: Record<string, string> = bindings.replacements;
const durations: Record<string, number> = bindings.videoDurations;
export function resolveMaterial(name: string): string {
  const normalized = name.replace(/^\/+/, '');
  if (/^audio\//.test(normalized)) throw new Error('Source audio is excluded from library replay.');
  if (replacements[normalized]) return replacements[normalized];
  if (bindings.frameFallback && /^(code-revision|review-revision03|review03|reassessment)\/.+\.(png|jpg)$/.test(normalized)) {
    if (/SP006|SP012|phone|device/i.test(normalized)) return 'approved-materials/demo-phone.svg';
    if (/document|report|doc/i.test(normalized)) return 'approved-materials/demo-document.svg';
    return 'approved-materials/demo-workspace.svg';
  }
  return name;
}
export const approvedStaticFile = (name: string): string => staticFile(resolveMaterial(name));
// Keep the scene/carrier clock; loop only replacement videos to cover long carriers.
export const ApprovedVideo: React.FC<React.ComponentProps<typeof OffthreadVideo>> = (props) => {
  const {fps} = useVideoConfig();
  const key = Object.keys(durations).find(path => props.src.endsWith(path));
  if (!key) return <OffthreadVideo {...props}/>;
  const rate = props.playbackRate ?? 1;
  const {startFrom, endAt, trimBefore, trimAfter, ...safeProps} = props;
  const renderSrc = bindings.renderVideos[key as keyof typeof bindings.renderVideos];
  const duration = Math.max(1, Math.floor(durations[key] * fps / rate));
  return <Loop durationInFrames={duration} layout="none"><OffthreadVideo {...safeProps} src={renderSrc ? staticFile(renderSrc) : props.src} muted/></Loop>;
};
