import {interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {enter, Sound, Stage} from './shared';

export const TwoBeat = () => {
  const frame = useCurrentFrame();
  const first = enter(frame, 62, 22);
  const second = enter(frame, 154, 22);
  const groupShift = interpolate(second, [0, 1], [0, -92]);
  return (
    <Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 0, transform: `translateY(${groupShift}px)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 122, fontWeight: 600, letterSpacing: '-0.055em', color: interpolateColors(second, [0, 1], ['#f5f5f7', '#85868b']), transform: `translate(${(1 - first) * -28}px, -50%)`, opacity: interpolate(first, [0, 0.16, 1], [0, 1, 1])}}>
          答案越来越快
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 184, textAlign: 'center', fontSize: 138, fontWeight: 600, letterSpacing: '-0.06em', color: '#fff', transform: `translate(${(1 - second) * 30}px, -50%)`, opacity: interpolate(second, [0, 0.16, 1], [0, 1, 1])}}>
          判断不能外包
        </div>
      </div>
      <Sound at={62} file="sfx/whoosh.wav" volume={0.09} />
      <Sound at={154} file="sfx/pop.wav" volume={0.14} />
    </Stage>
  );
};
