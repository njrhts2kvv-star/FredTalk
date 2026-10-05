import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from 'remotion';
import {Media, mix, rect} from '../common';

type Box = [number, number, number, number];
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {
  easing: Easing.bezier(.65, 0, .2, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
const columns = [
  {file: 'S14-user-1.png', native: [512, 1180], originX: 425, from: 60},
  {file: 'S14-user-2.png', native: [482, 1246], originX: 567, from: 190},
  {file: 'S14-user-3.png', native: [572, 1178], originX: 710, from: 300},
  {file: 'S14-user-4.png', native: [582, 1182], originX: 855, from: 410},
];

/** T06 category lift with Fred's accumulated leftward grouping revision.
 * Each complete native HD category enters once; the established group shifts
 * left before its next neighbor arrives. All four remain side by side
 * through the final frame, using the actual canvas as their background. No tray.
 */
export function CanvasRevisionV14({frame}: {frame: number}) {
  const mask = ease(frame, 60, 92);
  const base = 1920 / 1500;
  // Three 30-frame leftward shifts complete before the next image enters.
  const shifts = ease(frame, 158, 188) + ease(frame, 268, 298) + ease(frame, 378, 408);
  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <div style={{...rect(0, (1080 - 757 * base) / 2, 1920, 757 * base)}}>
      <Media id="canvas" style={{objectFit: 'contain'}}/>
    </div>
    <AbsoluteFill style={{background: '#000', opacity: mask * .78}}/>
    {columns.map((column, i) => {
      const enter = ease(frame, column.from, column.from + 24);
      const presence = enter;
      if (presence === 0) return null;
      const focus = enter;
      const height = mix(260, 820, focus);
      const width = height * column.native[0] / column.native[1];
      const originCenter = (column.originX + 55) * base;
      const groupCenter = 960 + i * 420 - shifts * 210;
      // After the group makes room, a new column grows inside that empty slot.
      // Moving it from the old native x would cross the previous column.
      const centerX = i === 0 ? mix(originCenter, groupCenter, focus) : groupCenter;
      const centerY = mix(445, 495, focus);
      const box: Box = [centerX - width / 2, centerY - height / 2, width, height];
      return <Img key={column.file} src={staticFile('v14-assets/' + column.file)} style={{...rect(...box), opacity: presence, objectFit: 'contain'}}/>;
    })}
  </AbsoluteFill>;
}
