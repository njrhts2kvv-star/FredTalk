import React from 'react';
import {interpolate} from 'remotion';
import {crisp, mix} from './motion';

// A single rounded perimeter drives both the drawing tip and the large disc.
const radius = 610;
const straight = 1600;
const arc = Math.PI * radius;
const length = 2 * (arc + straight);
const pointAt = (progress: number) => {
  const d = Math.max(0, Math.min(1, progress)) * length;
  if (d <= arc) {
    const angle = Math.PI / 2 - d / radius;
    return {x: 2720 + radius * Math.cos(angle), y: 1080 + radius * Math.sin(angle)};
  }
  if (d <= arc + straight) return {x: 2720 - (d - arc), y: 470};
  if (d <= 2 * arc + straight) {
    const angle = -Math.PI / 2 - (d - arc - straight) / radius;
    return {x: 1120 + radius * Math.cos(angle), y: 1080 + radius * Math.sin(angle)};
  }
  return {x: 1120 + d - 2 * arc - straight, y: 1690};
};
const points = Array.from({length: 241}, (_, i) => pointAt(i / 240));
const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');

export const PermissionOrbit: React.FC<{frame: number}> = ({frame}) => {
  const travel = interpolate(frame, [350, 359, 370, 384, 398, 411], [0, 0.16, 0.38, 0.65, 0.88, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p = pointAt(travel);
  const build = crisp(frame, 350, 356);
  return <svg width={3840} height={2160} style={{position: 'absolute', inset: 0}}>
    <path d={path} fill="none" stroke="#A5A8AB" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - travel} />
    <circle cx={p.x} cy={p.y} r={mix(0, 150, build)} fill="#000000" stroke="#FFFFFF" strokeWidth={7} />
  </svg>;
};
