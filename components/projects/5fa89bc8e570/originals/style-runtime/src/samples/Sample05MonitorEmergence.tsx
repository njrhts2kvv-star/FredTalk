import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Canvas, clamp, Monitor, Reveal} from '../carriers';
import {Sound} from '../shared';

const nodes = ['局部连接', '反复反馈', '共同适应'];

export const Sample05MonitorEmergence = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const build = clamp(frame, 8, 44);
  const lock = clamp(frame, 198, 230);
  return (
    <Canvas>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Monitor style={{transform: `scaleX(${0.06 + build * 0.94}) scaleY(${0.16 + build * 0.84})`}}>
          <div style={{position: 'absolute', inset: 0, background: lock > 0.5 ? '#111216' : '#fff', color: lock > 0.5 ? '#fff' : '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: 80, fontWeight: 600, marginBottom: 72, transform: `translateY(${-lock * 130}px)`}}>复杂能力，怎么出现？</div>
            <div style={{display: 'flex', gap: 26, opacity: 1 - lock}}>
              {nodes.map((node, index) => {
                const p = clamp(frame, 82 + index * 30, 108 + index * 30);
                return <div key={node} style={{width: 330, height: 170, borderRadius: 28, background: '#111216', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 600, transform: `scale(${0.2 + p * 0.8})`}}>{node}</div>;
              })}
            </div>
            {lock > 0.32 ? <Reveal start={214} style={{fontSize: 118, fontWeight: 600, position: 'absolute', top: 350}}>从连接中涌现</Reveal> : null}
          </div>
        </Monitor>
      </div>
      <Sound at={8} file="sfx/whoosh.wav" volume={0.17} />
      {nodes.map((node, index) => <Sound key={node} at={82 + index * 30} file="sfx/click.wav" volume={0.12} />)}
      <Sound at={Math.round(3.3 * fps)} file="sfx/pop.wav" volume={0.15} />
    </Canvas>
  );
};
