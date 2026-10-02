import {interpolate, useCurrentFrame} from 'remotion';
import {Sound, font, ease} from './shared';

export const ShapeExpand = () => {
  const frame = useCurrentFrame();
  const shape = interpolate(frame, [52, 82], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const words = interpolate(frame, [92, 112], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{width: 1920, height: 1080, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font}}>
      <div style={{width: interpolate(shape, [0, 1], [58, 1080]), height: interpolate(shape, [0, 1], [58, 430]), borderRadius: interpolate(shape, [0, 1], [99, 42]), background: '#17181b', boxShadow: `0 ${interpolate(shape, [0, 1], [8, 34])}px ${interpolate(shape, [0, 1], [24, 88])}px rgba(0,0,0,.16)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
        <div style={{color: '#fff', fontSize: 128, fontWeight: 600, letterSpacing: '-0.06em', whiteSpace: 'nowrap', transform: `translateX(${(1 - words) * 28}px)`, opacity: interpolate(words, [0, 0.16, 1], [0, 1, 1])}}>把复杂变清楚</div>
      </div>
      <Sound at={52} file="sfx/whoosh.wav" volume={0.1} />
      <Sound at={92} file="sfx/pop.wav" volume={0.13} />
    </div>
  );
};
