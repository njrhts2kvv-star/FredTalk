import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Canvas, clamp, Pill, Reveal} from '../carriers';
import {Sound} from '../shared';

const labels = ['Prompt', '模型原理', '工具教程'];

export const Sample02ModuleSplit = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const establish = clamp(frame, 16, 48);
  const cover = clamp(frame, 150, 184);
  return (
    <Canvas>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', gap: 28}}>
          {labels.map((label, index) => {
            const offset = (index - 1) * 510;
            return <Pill key={label} style={{width: 460, transform: `translateX(${(1 - establish) * -offset}px) scale(${0.18 + establish * 0.82})`, borderRadius: 40 - establish * 6}}>{label}</Pill>;
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 1560 * cover, height: 360, borderRadius: 42, background: '#000', transform: 'translate(-50%,-50%)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
        {cover > 0.72 ? <Reveal start={172} style={{fontSize: 124, fontWeight: 600}}>模型一升级，技巧就过期</Reveal> : null}
      </div>
      <Sound at={16} file="sfx/pop.wav" volume={0.16} />
      <Sound at={Math.round(2.5 * fps)} file="sfx/swipe.wav" volume={0.16} />
    </Canvas>
  );
};
