import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Canvas, clamp, Phone, Reveal} from '../carriers';
import {Sound} from '../shared';

export const Sample03PhoneCounter = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phone = clamp(frame, 10, 44);
  const roll = clamp(frame, 82, 228);
  const value = Math.max(1, Math.round(interpolate(roll, [0, 0.42, 0.72, 1], [100, 72, 22, 1])));
  return (
    <Canvas>
      <div style={{position: 'absolute', left: 180, top: 0, bottom: 0, width: 870, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Phone style={{transform: `scale(${0.08 + phone * 0.92})`, borderRadius: 90 - phone * 14}}>
          <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#111'}}>
            <div style={{fontSize: 184, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{value}</div>
            <div style={{fontSize: 70, fontWeight: 600, marginTop: -12}}>秒</div>
          </div>
        </Phone>
      </div>
      <div style={{position: 'absolute', right: 130, top: 0, bottom: 0, width: 720, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Reveal start={46} style={{fontSize: 126, fontWeight: 600, lineHeight: 1.12}}>答案<br />越来越快</Reveal>
        <Reveal start={230} style={{fontSize: 72, fontWeight: 600, lineHeight: 1.25, marginTop: 54}}>但判断<br />没有快捷键</Reveal>
      </div>
      <Sound at={10} file="sfx/pop.wav" volume={0.12} />
      <Sound at={Math.round(1.36 * fps)} file="sfx/scroll.mp3" volume={0.24} playbackRate={1.7} />
      <Sound at={Math.round(3.84 * fps)} file="sfx/click.wav" volume={0.13} />
    </Canvas>
  );
};
