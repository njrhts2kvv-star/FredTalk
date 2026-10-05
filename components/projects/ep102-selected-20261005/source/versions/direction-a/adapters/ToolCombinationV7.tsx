// B027's measured four-film convergence, with Fred's latest scale/mask correction.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Media, rect, progress, mix, track} from '../common';
import spec from '../native/L81-B027.json';

export function ToolCombinationV7({frame}: {frame: number}) {
  const nf = track(frame, [[0, 0], [130, 108], [210, 189], [250, 250], [570, 539]]);
  const values = (name: string) => (spec.tracks as any)[name].fields.map((_: unknown, i: number) =>
    track(nf, (spec.tracks as any)[name].samples.map((k: number[]) => [k[0], k[i + 1]])));
  const [radius] = values('roundness');
  const collect = progress(frame, 210, 265), conceal = progress(frame, 240, 275);
  return <AbsoluteFill style={{background: '#fff'}}>
    <div style={{position: 'absolute', inset: 0, transform: 'translateY(-55px) scale(.9)', transformOrigin: '50% 45%'}}>
      {frame < 275 && ['game-transition', 'storm', 'fight', 'oriental'].map((id, i) => {
        const [cx, cy, w, h, opacity] = values('circle' + i);
        const x = mix(cx, 1410, collect), y = mix(cy, 573.777778, collect);
        const width = mix(w, 350 / .9, collect), height = mix(h, 350 / .9, collect);
        return <div key={id} style={{...rect(x - width / 2, y - height / 2, width, height), opacity: opacity * (1 - conceal), borderRadius: `${mix(radius, 50, collect)}%`, overflow: 'hidden', boxShadow: '25px 18px 28px #0003'}}>
          <Media id={id} start={id === 'storm' ? 1.5 : 0} style={{objectFit: 'cover'}}/>
        </div>;
      })}
    </div>
    {frame > 230 && <>
      <div style={{...rect(315, 335, 720, 350), fontSize: 105, fontWeight: 900, letterSpacing: -4, opacity: progress(frame, 230, 270), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>WorkBuddy</div>
      <div style={{...rect(1030, 335, 105, 350), fontSize: 105, fontWeight: 900, opacity: progress(frame, 240, 275), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>+</div>
      <div style={{...rect(1190, 335, 350, 350), borderRadius: '50%', overflow: 'hidden', opacity: progress(frame, 250, 290), boxShadow: '0 20px 40px #0003'}}>
        <Media id="oriental" style={{objectFit: 'cover'}}/>
        <AbsoluteFill style={{background: '#000', opacity: .7}}/>
        <AbsoluteFill style={{fontSize: 105, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Flova</AbsoluteFill>
      </div>
    </>}
  </AbsoluteFill>;
}
