import {interpolate, useCurrentFrame} from 'remotion';
import {enter, Sound, Stage} from './shared';

const nodes = [
  {text: '看见信息', at: 88},
  {text: '找到规律', at: 135},
  {text: '做出选择', at: 182},
];

export const PathBuild = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{position: 'absolute', left: 80, right: 80, top: 270, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {nodes.map((node, index) => {
          const p = enter(frame, node.at, 24);
          const line = index < nodes.length - 1 ? enter(frame, node.at + 23, 19) : 0;
          return (
            <div key={node.text} style={{display: 'flex', alignItems: 'center'}}>
              <div style={{color: '#f5f5f7', fontSize: 102, fontWeight: 600, letterSpacing: '-0.05em', whiteSpace: 'nowrap', transform: `translateX(${(1 - p) * -18}px)`, opacity: interpolate(p, [0, 0.16, 1], [0, 1, 1])}}>{node.text}</div>
              {index < 2 && <div style={{width: 76, height: 3, background: '#5c5d62', margin: '0 22px', transformOrigin: 'left', transform: `scaleX(${line})`, position: 'relative'}}><div style={{position: 'absolute', right: -2, top: -6, width: 14, height: 14, borderTop: '3px solid #77787e', borderRight: '3px solid #77787e', transform: 'rotate(45deg)'}} /></div>}
              <Sound at={node.at} file={index === 2 ? 'sfx/pop.wav' : 'sfx/click.wav'} volume={index === 2 ? 0.14 : 0.09} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
