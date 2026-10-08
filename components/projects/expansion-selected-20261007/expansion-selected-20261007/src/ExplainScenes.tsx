import React, {CSSProperties} from 'react';
import {Frame, Surface, Text, Pill, Media, useT, q, mix, media} from './shared';

const ink = '#19191c';
const accent = '#8554E8';
const lightAccent = '#D6BEFF';
const rect = (x: number, y: number, w: number, h: number): CSSProperties =>
  ({position: 'absolute', left: x, top: y, width: w, height: h});
const fade = (t: number, a: number, b: number) => q(t, a, b);
const opacity = (t: number, a: number, b: number, out?: [number, number]) =>
  fade(t, a, b) * (out ? 1 - fade(t, out[0], out[1]) : 1);
const active = (t: number, a: number, b: number, c: number, d: number) =>
  q(t, a, b) * (1 - q(t, c, d));
const center: CSSProperties = {display: 'flex', alignItems: 'center', justifyContent: 'center'};
const heavy: CSSProperties = {fontWeight: 900, fontSynthesis: 'none', lineHeight: 1.12};
export type ExplainContent = {words?: string[]; imageSources?: string[]; videoSrc?: string; videoStart?: number};
const word = (words: string[] | undefined, index: number, fallback: string) => words?.[index] ?? fallback;

/** Split one preparation task into two real groups; after reading, merge them into the next check. */
export function EX08({words}: ExplainContent = {}) {
  const t = useT();
  const enter = q(t, 0, .42);
  const unfold = q(t, 1.15, 1.85);
  const rows = [q(t, 2.05, 2.45), q(t, 3.65, 4.05)];
  const merge = q(t, 5.6, 6.35);
  const next = q(t, 6.4, 6.9);
  return <Frame>
    {['准备资产', '组织动作'].map((s, i) => {
      const label = word(words, i, s);
      const x = i === 0 ? mix(255, 470, merge) : mix(1035, 990, merge);
      const y = mix(335, 195, unfold) + merge * 105;
      const w = mix(630, 460, merge);
      const h = mix(220, 560, unfold) * mix(1, .31, merge);
      return <Surface key={label} x={x} y={y} w={w} h={h} dark
        style={{opacity: enter * (1 - next), overflow: 'hidden', transform: `translateY(${(1 - enter) * 25}px)`}}>
        <div style={{...rect(30, mix(46, 16, merge), w - 60, mix(145, 120, merge)), ...center, ...heavy, fontSize: mix(90, 60, merge), color: lightAccent}}>{label}</div>
        {(i === 0 ? ['人物身份', '场景空间'] : ['攻防关系', '镜头节奏']).map((s, j) => <div key={j}
          style={{...rect(30, 230 + j * 150, w - 60, 105), ...center, fontSize: 78, fontWeight: 500,
            lineHeight: 1.1, color: '#fff', opacity: rows[j] * (1 - merge), transform: `translateY(${(1 - rows[j]) * 26}px)`}}>{word(words, 2 + i * 2 + j, s)}</div>)}
      </Surface>;
    })}
    <Surface x={260} y={mix(690, 305, next)} w={1400} h={385} dark
      style={{opacity: next, transform: `scale(${mix(.94, 1, next)})`, ...center}}>
      <div style={{textAlign: 'center'}}>
        <div style={{...heavy, fontSize: 117, color: lightAccent}}>{word(words, 6, '生成后逐项检查')}</div>
        <div style={{fontSize: 54, fontWeight: 500, lineHeight: 1.3, color: '#fff', marginTop: 38}}>{word(words, 7, '动作接上了吗？打中之后有反应吗？')}</div>
      </div>
    </Surface>
  </Frame>;
}

export {EX05} from './NovelScenes';
