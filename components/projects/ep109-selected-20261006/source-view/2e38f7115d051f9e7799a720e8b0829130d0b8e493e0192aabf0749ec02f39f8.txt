import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile} from 'remotion';
import listMotion from './variety-native/X006.json';
import focusWindowMotion from './variety-native/sp021-extra-native.json';
import focusArrowMotion from './variety-native/sp021-source-motion.json';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = (t: number, start: number, duration: number) => {
  const p = clamp((t - start) / duration);
  return p * p * (3 - 2 * p);
};
const rect = (left: number, top: number, width: number, height: number): React.CSSProperties =>
  ({position: 'absolute', left, top, width, height});
const font: React.CSSProperties = {fontFamily: 'Fred MiSans, sans-serif', fontWeight: 900, fontSynthesis: 'none'};
const assets = ['media/knife-fighter-three-view.png', 'media/counterpart-three-view.png', 'media/market-scene.png'];
const shadow = '0 16px 25px #0002';
type Box = [number, number, number, number];
const blend = (from: Box, to: Box, p: number): Box => from.map((n, i) => mix(n, to[i], p)) as Box;

/** Adapted RebuiltX006: same three numbered rows, dark blurred backdrop and native per-glyph alpha. */
export function FightMotivationList({t,src="media/positive-preview-1080p.mp4",sourceIn=5,fps=60}: {t: number;src?:string;sourceIn?:number;fps?:number}) {
  const curves = listMotion.curves as Record<string, number[][]>;
  const sample = (f: number, values: number[][]) => interpolate(f, values.map(v => v[0]), values.map(v => v[1]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const labels = ['为什么打', '谁占上风', '怎么结束'];
  const starts = [.16, .98, 2.20];
  const nativeStarts = [48, 71, 96];
  return <AbsoluteFill data-component="EP109-X006-motivation" style={{background: '#19191c', fontFamily: 'Fred RuiZi', fontWeight:400}}>
    <OffthreadVideo src={staticFile(src)} startFrom={Math.round(sourceIn*fps)} muted style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
    <AbsoluteFill style={{background:'#000',opacity:.65}}/>
    <div style={{...rect(145, 76, 1920, 1080), transform: 'scale(.85)', transformOrigin: '0 0'}}>
      {labels.map((label, i) => {
        const f = Math.min(166, nativeStarts[i] + (t - starts[i]) * 30);
        return <React.Fragment key={label}>
          <div style={{...rect(225, 208 + i * 246, 340, 220), fontSize: 184, lineHeight: 1, color: '#D6BEFF',
            textShadow: '8px 8px 6px #000', opacity: sample(0, curves[`number${i}`])}}>{i + 1}、</div>
          <div style={{...rect(650, 204 + i * 246, 1100, 220), fontSize: 177, lineHeight: 1, letterSpacing: -1,
            whiteSpace: 'nowrap', color: '#fff', textShadow: '8px 8px 6px #000'}}>
            {[...label].map((c, j) => {
              const nativeCount = i === 2 ? 6 : 4;
              const k = Math.min(nativeCount - 1, Math.floor(j / label.length * nativeCount));
              return <span key={j} style={{opacity: sample(f, curves[`row${i}char${k}`])}}>{c}</span>;
            })}
          </div>
        </React.Fragment>;
      })}
    </div>
  </AbsoluteFill>;
}

/** AssetsReferenceV9 LiftedAsset/AssetGroup travel: same image objects grow from native nodes into reading frames. */
function LiftedCharacterReferences({t}: {t: number}) {
  const travel = (seconds: number, from: number, to: number) => interpolate(seconds, [from, to], [0, 1], {
    easing: Easing.bezier(.65, 0, .2, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const nodes: Box[] = [[268, 365, 470, 264.375], [1182, 365, 470, 264.375]];
  const targets: Box[] = [[130, 212, 780, 438.75], [1010, 212, 780, 438.75]];
  return <AbsoluteFill data-component="EP109-10205-character-lift" style={{background: '#fff', ...font}}>
    {nodes.map((node, i) => {
      const lift = travel(t, .12 + i * .32, .72 + i * .32);
      const box = blend(node, targets[i], lift);
      return <React.Fragment key={assets[i]}>
        <Img src={staticFile(assets[i])} style={{...rect(...box), borderRadius: mix(12, 22, lift),
          objectFit: 'cover', opacity: travel(t, .02 + i * .10, .20 + i * .10)}}/>
        <div style={{...rect(targets[i][0], 703, 780, 88), fontSize: 72, textAlign: 'center', opacity: lift}}>
          {i === 0 ? '刀客' : '地痞'}</div>
      </React.Fragment>;
    })}
    <div style={{...rect(150, 829, 1620, 78), fontSize: 44, fontWeight: 500, textAlign: 'center',
      opacity: ease(t, 2.55, .28)}}>人物三视图 · 长相与服装</div>
  </AbsoluteFill>;
}

export function FightCharacterReferences({t}: {t: number}) {
  return <LiftedCharacterReferences t={t}/>;
}

/** R6CapabilityMerge: continuous three-to-one paths and source fade/result handoff, with light media carriers. */
export function FightSharedReference({t}: {t: number}) {
  const arrange = ease(t, .08, .70);
  const merge = ease(t, 2.62, .72);
  const result = ease(t, 2.84, .44);
  const alpha = 1 - ease(t, 2.82, .50);
  const labelAlpha = 1 - ease(t, 2.58, .30);
  const resultCaption = ease(t, 3.34, .24);
  const oldBoxes: Box[] = [[130, 212, 780, 438.75], [1010, 212, 780, 438.75], [1298, 410, 470, 264.375]];
  return <AbsoluteFill data-component="EP109-10704-shared-reference" style={{background: '#fff', ...font}}>
    {assets.map((src, i) => {
      const entry = i === 2 ? ease(t, .22, .38) : 1;
      const base: Box = [150 + i * 574, 210 + (1 - entry) * 45, 470, 264.375];
      const arranged = blend(oldBoxes[i], base, arrange);
      const width = mix(arranged[2], 240, merge), height = mix(arranged[3], 135, merge);
      const x = mix(arranged[0], 960 - width / 2, merge), y = mix(arranged[1], 480 - height / 2, merge);
      return <React.Fragment key={src}>
        <Img src={staticFile(src)} style={{...rect(x, y, width, height), borderRadius: mix(22, 36, arrange),
          objectFit: 'cover', opacity: entry * alpha}}/>
        <div style={{...rect(mix(oldBoxes[i][0], 150 + i * 574, arrange), mix(703, 544.375, arrange), mix(780, 470, arrange), 96),
          fontSize: mix(72, 78, arrange), textAlign: 'center', opacity: entry * labelAlpha}}>{['刀客', '地痞', '集市'][i]}</div>
      </React.Fragment>;
    })}
    <div style={{...rect(150, 829, 1620, 78), fontSize: 44, fontWeight: 500, textAlign: 'center',
      opacity: 1 - arrange}}>人物三视图 · 长相与服装</div>
    <div style={{...rect(150, 775, 1620, 86), fontSize: 44, fontWeight: 500, textAlign: 'center',
      opacity: ease(t, .60, .32) * labelAlpha}}>场景图 · 街道、摊位与空间关系</div>
    <div style={{...rect(460, 316.5, 1000, 330), borderRadius: 165, background: '#111114', boxShadow: '22px 18px 27px #0004',
      opacity: result, transform: `translateY(${(1 - result) * 18}px)`, display: 'grid', placeItems: 'center'}}>
      <span style={{fontSize: 126, color: '#D6BEFF'}}>共同参考</span>
    </div>
    <div style={{...rect(140, 704, 1640, 90), fontSize: 56, fontWeight: 500, textAlign: 'center',
      opacity: resultCaption}}>人物与场景保持一致</div>
  </AbsoluteFill>;
}

/** SP021: native window drop, three ability rows and the outlined arrow; arrow follows the spoken action. */
export function FightActionFocus({t}: {t: number}) {
  const f = Math.max(0, Math.min(54, Math.floor(t * 30)));
  const state = focusArrowMotion[f];
  const bounds = state.arrow;
  // Keep SP021's measured horizontal entry and left-facing silhouette.
  // The first target is the action relationship; subsequent rows keep the spoken focus progression.
  const arrowX = bounds ? bounds[0] - 4 : 1920;
  const row = ease(t, .95, .45) + ease(t, 2.10, .46);
  const arrowY = focusWindowMotion[f].windowTop + 176 + 215 / 2 - 90 + row * 210;
  return <AbsoluteFill data-component="EP109-SP021-action-focus" style={{background: '#fff', ...font}}>
    <div style={{...rect(192, 104, 1920, 1080), transform: 'scale(.80)', transformOrigin: '0 0'}}>
      <div style={{...rect(297, focusWindowMotion[f].windowTop, 1327, 944), borderRadius: 30,
        background: '#232326', overflow: 'hidden'}}>
        <div style={{height: 86, background: '#141518', display: 'flex', gap: 22, alignItems: 'center', paddingLeft: 54}}>
          {['#ed2491', '#ffbd4d', '#3984fd'].map(color => <div key={color} style={{width: 24, height: 24, background: color, borderRadius: '50%'}}/>)}
        </div>
        {['动作关系', '发力命中', '受击反馈'].map((line, i) => <div key={line} style={{...rect(184, 176 + i * 210, 1020, 215),
          color: '#fff', whiteSpace: 'nowrap', fontSize: 205, lineHeight: 1, letterSpacing: 39}}>{line}</div>)}
      </div>
      <svg style={{...rect(arrowX, arrowY, 265, 180), opacity: state.opacity}} viewBox="0 0 280 180">
        <path d="M 8 90 L 102 8 Q 112 0 118 12 L 118 44 L 244 44 Q 269 44 269 68 L 269 112 Q 269 136 244 136 L 118 136 L 118 168 Q 112 180 102 172 Z"
          fill="#D6BEFF" stroke="#fff" strokeWidth={8}/>
      </svg>
    </div>
  </AbsoluteFill>;
}

/** PullV7 final summary: three evidence objects feed one model; one output appears only at its spoken cue. */
export function FightModelHandoff({t}: {t: number}) {
  const summary = ease(t, 5.16, .70);
  const bridge = ease(t, 9.883, .72);
  const output = ease(t, 11.417, .65);
  const labels = ['人物', '场景', '动作关系 · 镜头节奏'];
  const media = ['media/knife-fighter-three-view.png', 'media/market-scene.png', 'media/rev2-evidence-impact.jpg'];
  return <AbsoluteFill data-component="EP109-10204-model-handoff" style={{background: '#000', ...font}}>
    <div style={{position: 'absolute', inset: 0, opacity: 1 - summary}}>
      <Img src={staticFile('media/storyboard-grid.png')} style={{...rect(300, 94, 1320, 742.5), objectFit: 'contain', borderRadius: 22}}/>
      <div style={{...rect(220, 865, 1480, 75), fontSize: 58, textAlign: 'center', color: '#fff', lineHeight: 1.25,
        opacity: ease(t, .08, .30) * (1 - ease(t, 2.40, .25))}}>每一秒都写死</div>
      <div style={{...rect(220, 865, 1480, 75), fontSize: 58, textAlign: 'center', color: '#fff', lineHeight: 1.25,
        opacity: ease(t, 2.65, .30)}}>动作反而不顺畅</div>
    </div>
    {media.map((src, i) => {
      const enter = summary * ease(t, 5.16 + i * .55, .42);
      return <div key={src} style={{...rect(90, 132 + i * 247, 370, 208.125),
        opacity: enter, transform: `translateX(${(1 - enter) * -35}px)`}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12}}/>
        <div style={{...rect(0, 213.125, 370, 34), color: '#fff',
          fontSize: i === 2 ? 27 : 32, lineHeight: 1, textAlign: 'center'}}>{labels[i]}</div>
      </div>;
    })}
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: bridge}}>
      {[236.0625, 483.0625, 730.0625].map(y => <path key={y} d={`M460 ${y} C625 ${y},630 472,755 472`}
        stroke="#fff" strokeWidth={4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - bridge}/>)}
      <path d="M1185 472 H1260" stroke="#fff" strokeWidth={4} fill="none" pathLength={1}
        strokeDasharray={1} strokeDashoffset={1 - output}/>
    </svg>
    <div style={{...rect(755, 257, 430, 430), borderRadius: '50%', background: '#171719', opacity: bridge,
      display: 'grid', placeItems: 'center'}}><span style={{fontSize: 100, color: '#D6BEFF'}}>模型</span></div>
    <div style={{...rect(1260, 308.875, 580, 326.25), borderRadius: 22, overflow: 'hidden', opacity: output}}>
      <Sequence from={685} layout="none"><OffthreadVideo src={staticFile('media/positive-preview-1080p.mp4')} muted
        style={{width: '100%', height: '100%', objectFit: 'cover'}}/></Sequence>
    </div>
    <div style={{...rect(1230, 666, 640, 108), fontSize: 51, fontWeight: 500, color: '#fff', textAlign: 'center', opacity: output}}>
      顺出中间动作</div>
  </AbsoluteFill>;
}
