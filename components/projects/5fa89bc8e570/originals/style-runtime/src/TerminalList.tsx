import {interpolate, useCurrentFrame} from 'remotion';
import {Sound, Stage} from './shared';

const lines = [
  {text: '先看问题', start: 72, end: 126},
  {text: '再找证据', start: 142, end: 198},
  {text: '最后做决定', start: 214, end: 278},
];

export const TerminalList = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1180, color: '#f3f3f5', fontSize: 106, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1.38, textAlign: 'center'}}>
        {lines.map((line) => {
          const count = Math.floor(interpolate(frame, [line.start, line.end], [0, line.text.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          const active = frame >= line.start && frame <= line.end + 12;
          return <div key={line.text} style={{height: 146}}><span>{line.text.slice(0, count)}</span>{active && <span style={{display: 'inline-block', width: 4, height: 88, background: '#b4b5b9', marginLeft: 12, verticalAlign: -8, opacity: frame % 26 < 18 ? 1 : 0}} />}</div>;
        })}
      </div>
      </div>
      <Sound at={72} file="sfx/typewriter.wav" volume={0.14} trimAfter={210} />
    </Stage>
  );
};
