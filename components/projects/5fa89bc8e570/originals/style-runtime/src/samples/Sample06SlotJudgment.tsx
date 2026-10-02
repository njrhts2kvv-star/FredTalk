import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Canvas, clamp} from '../carriers';
import {Sound} from '../shared';

const words = ['信息', '证据', '判断'];

export const Sample06SlotJudgment = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const open = clamp(frame, 8, 40, 28, 1520);
  return (
    <Canvas>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: open, height: open < 100 ? open : 450, borderRadius: open < 100 ? '50%' : 44, background: '#000', transform: 'translate(-50%,-50%)', overflow: 'hidden'}}>
        {words.map((word, index) => {
          const start = 64 + index * 64;
          const enter = clamp(frame, start, start + 22);
          const leave = index === words.length - 1 ? 0 : clamp(frame, start + 52, start + 72);
          return <div key={word} style={{position: 'absolute', inset: 0, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: index === 2 ? 164 : 150, fontWeight: 600, transform: `translateY(${(1 - enter) * 100 - leave * 100}px)`, opacity: enter * (1 - leave)}}>{word}</div>;
        })}
      </div>
      <Sound at={8} file="sfx/whoosh.wav" volume={0.18} />
      {words.map((word, index) => <Sound key={word} at={64 + index * 64} file={index === 2 ? 'sfx/pop.wav' : 'sfx/swipe.wav'} volume={0.16} />)}
    </Canvas>
  );
};
