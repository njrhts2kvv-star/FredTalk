import {interpolate, useCurrentFrame} from 'remotion';
import {enter, Sound, Stage} from './shared';

const words = [
  {text: '理解', at: 72},
  {text: '筛选', at: 112},
  {text: '验证', at: 152},
  {text: '决定', at: 192},
];

export const WordGrid = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{position: 'absolute', inset: '58px 88px 62px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14}}>
        {words.map((word, index) => {
          const p = enter(frame, word.at, 20);
          return (
            <div key={word.text} style={{position: 'relative', border: '1px solid #3b3c41', borderRadius: 20, overflow: 'hidden', background: index === 3 ? '#25262b' : '#222328', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{position: 'absolute', inset: 0, background: '#303137', transformOrigin: 'left', transform: `scaleX(${p})`, opacity: index === 3 ? 0.72 : 0.42}} />
              <div style={{position: 'relative', color: index === 3 ? '#fff' : '#e7e7e9', fontSize: 132, fontWeight: 600, letterSpacing: '-0.06em', transform: `translateX(${(1 - p) * -16}px)`, opacity: interpolate(p, [0, 0.18, 1], [0, 1, 1])}}>{word.text}</div>
              <Sound at={word.at} file={index === 3 ? 'sfx/pop.wav' : 'sfx/click.wav'} volume={index === 3 ? 0.14 : 0.085} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
