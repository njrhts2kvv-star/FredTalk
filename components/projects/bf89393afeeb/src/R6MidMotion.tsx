import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import {Media, textStyle} from './library/SelectedMotion';
import t01 from './specs/r4-t01-motion.json';
import glyphOpacity from './specs/r4-t01-glyph-opacity.json';
import version from './specs/R004.json';
import price from './specs/R005.json';

const INK = '#151517';
const LIGHT = '#D6BEFF';
const ACCENT = '#8554E8';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const phase = (t: number, a: number, b: number) => {
  const p = clamp((t - a) / Math.max(.001, b - a));
  return p * p * (3 - 2 * p);
};
const keyed = (t: number, anchors: number[][]) => {
  if (t <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    if (t <= anchors[i][0]) {
      const [a, from] = anchors[i - 1], [b, to] = anchors[i];
      return mix(from, to, clamp((t - a) / Math.max(.001, b - a)));
    }
  }
  return anchors[anchors.length - 1][1];
};
type TrackSpec = {tracks: Record<string, {samples: number[][]}>};
const sourceCards = t01 as unknown as TrackSpec;
const sourceGlyphs = glyphOpacity as unknown as number[][][];
const versionSource = version as unknown as TrackSpec;
const priceSource = price as unknown as TrackSpec;

// Sparse T01 samples encode native holds, not a new tween between distant anchors.
const measuredCard = (name: string, frame: number) => {
  const rows = sourceCards.tracks[name].samples;
  let i = 0;
  while (i < rows.length - 1 && rows[i + 1][0] <= frame) i++;
  const a = rows[i], b = rows[Math.min(i + 1, rows.length - 1)];
  const p = b[0] === a[0] || b[0] - a[0] > 1 ? 0
    : clamp((frame - a[0]) / (b[0] - a[0]));
  return a.slice(1).map((value, j) => mix(value, b[j + 1], p));
};
const sourceValue = (spec: TrackSpec, name: string, frame: number, column = 1) =>
  keyed(frame, spec.tracks[name].samples.map(row => [row[0], row[column]]));
const defaultDotCues = [0, 113 / 60, 236 / 60, 447 / 60];

export function r6DotUsageState(t: number, c: MotionProps['c'] = i => defaultDotCues[i]) {
  const chat = c(1), work = c(2), consume = c(3);
  const referenceFrame = keyed(t, [
    [0, 0], [Math.min(.38, chat - .15), 60], [chat, 60],
    [Math.min(chat + .25, work - .15), 120], [work, 160],
    [work + .16, 230], [work + .27, 270],
    [Math.min(work + .45, consume - .1), 310], [consume, 310],
    [consume + .18, 360], [consume + .35, 390],
  ]);
  const textVisibility = {
    pro: phase(t, 0, .18), chat: phase(t, chat, chat + .18),
    work: phase(t, work, work + .25), consume: phase(t, consume, consume + .18),
  };
  const cards = [
    {id: 'pro', lines: ['Pro 套餐包含首个 Dot']},
    {id: 'chat', lines: ['聊天', '不占 ChatGPT 额度']},
    {id: 'work', lines: ['Codex / ChatGPT 工作任务', '按对应规则消耗额度']},
  ].map((card, i) => {
    const [, sourceY, nativeWidth, nativeHeight, textOpacity] = measuredCard(`card${i}`, referenceFrame);
    const width = nativeWidth * (i === 0 ? 1.24 : 1.10);
    const main = i === 1 ? t < work : i === 2;
    const fontSize = main ? 100 : 80, sourceHeight = nativeHeight * .75;
    const height = i === 1 && !main && width > 0 ? Math.max(sourceHeight, 192) : sourceHeight;
    const sourceFrame = Math.max(0, Math.min(sourceGlyphs.length - 1, Math.floor(referenceFrame)));
    return {...card, x: (1920 - width) / 2,
      y: sourceY * .75 + 78 + (sourceHeight - height) / 2,
      width, height, radius: Math.min(width / 2, height / 2, height * .32),
      fontSize, lineFontSizes: card.lines.map((_, line) => i === 2 && line === 0 ? 90 : fontSize),
      opacity: 1, glyphOpacities: (sourceGlyphs[sourceFrame]?.[i] ?? [textOpacity]).map(clamp)};
  });
  return {referenceFrame, cards, textVisibility};
}

export function R6DotUsageEvidence({t, c}: MotionProps) {
  const state = r6DotUsageState(t, c);
  return <AbsoluteFill data-component='R6-T01'>
    {state.cards.map((card, i) => card.width > 0 && card.height > 0 && <div key={card.id}
      style={{position: 'absolute', left: card.x, top: card.y, width: card.width,
        height: card.height, borderRadius: card.radius, background: INK,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box', padding: '6px 12px'}}>
      {card.lines.map((line, lineIndex) => {
        const cueOpacity = i === 0 ? state.textVisibility.pro
          : i === 1 ? state.textVisibility.chat
            : lineIndex === 0 ? state.textVisibility.work : state.textVisibility.consume;
        return <div data-qc-text key={line} style={{...textStyle, maxWidth: '100%',
          textAlign: 'center', fontSize: card.lineFontSizes[lineIndex], lineHeight: 1.12,
          whiteSpace: 'nowrap', color: lineIndex === 1 ? LIGHT : 'white', opacity: cueOpacity}}>
          {[...line].map((letter, j, letters) => {
            const index = Math.min(card.glyphOpacities.length - 1,
              Math.floor(j * card.glyphOpacities.length / letters.length));
            return <span key={j} style={{opacity: card.glyphOpacities[index] ?? 0}}>{letter}</span>;
          })}
        </div>;
      })}
    </div>)}
  </AbsoluteFill>;
}

export function r6VersionState(t: number, c: MotionProps['c']) {
  const width = 710, height = 350, fontSize = 99;
  const oldEnter = phase(t, c(1), c(1) + .24);
  const nextEnter = phase(t, c(2), c(2) + .28);
  const arrowSourceFrame = mix(147, 164, phase(t, c(2) - .12, c(2) + .25));
  const arrowReveal = sourceValue(versionSource, 'arrowReveal', arrowSourceFrame);
  return {
    evidenceOpacity: 1 - oldEnter,
    old: {text: 'GPT-6 Sol', x: 90, y: 240 + 24 * (1 - oldEnter),
      width, height, fontSize, opacity: oldEnter},
    next: {text: 'GPT-6.1 Sol', x: 1120, y: 240 + 24 * (1 - nextEnter),
      width, height, fontSize, opacity: nextEnter},
    arrowSourceFrame, arrowReveal, captionOpacity: phase(t, c(3), c(3) + .26),
  };
}

const WindowDots = () => <div style={{display: 'flex', alignItems: 'center', gap: 16,
  height: 62, paddingLeft: 32, background: INK}}>
  {['#df3099', '#ffc354', '#4289ee'].map(color => <i key={color}
    style={{width: 16, height: 16, borderRadius: '50%', background: color}}/>)}
</div>;

export function R6VersionComparison({t, c}: MotionProps) {
  const state = r6VersionState(t, c);
  return <AbsoluteFill data-component='R6-version-arrow-adaptation'>
    <div style={{position: 'absolute', left: 80, top: 80, width: 1760, height: 805,
      opacity: state.evidenceOpacity}}><Media src='official-01.webp'/></div>
    {[state.old, state.next].map(card => <div key={card.text}
      style={{position: 'absolute', left: card.x, top: card.y, width: card.width,
        height: card.height, borderRadius: 28, background: '#222225', opacity: card.opacity,
        overflow: 'hidden', boxShadow: '22px 18px 27px #0004'}}>
      <WindowDots/>
      <div data-qc-text style={{...textStyle, position: 'absolute', left: 24, right: 24,
        top: 165, fontSize: card.fontSize, color: 'white', textAlign: 'center',
        lineHeight: 1.15, whiteSpace: 'nowrap'}}>{card.text}</div>
    </div>)}
    <svg width={220} height={185} viewBox='0 0 285 240'
      style={{position: 'absolute', left: 850, top: 320, transform: 'rotate(38deg)',
        clipPath: `inset(0 ${(1 - state.arrowReveal) * 100}% 0 0)`, opacity: state.arrowReveal > 0 ? 1 : 0,
        filter: 'drop-shadow(7px 7px 8px #0002)'}}>
      <path d='M12 210 Q179 196 207 63 L179 57 L256 0 L277 114 L243 98 Q166 224 20 234 Z' fill='#FFBF13'/>
    </svg>
    <div data-qc-text style={{...textStyle, position: 'absolute', left: 170, top: 725,
      width: 1580, fontSize: 88, textAlign: 'center', lineHeight: 1.15,
      color: ACCENT, opacity: state.captionOpacity}}>这才是真正的 Sol？</div>
  </AbsoluteFill>;
}

export function r6PriceState(t: number, c: MotionProps['c']) {
  const at = c(4), reveal = phase(t, at, at + .42);
  const referenceFrame = keyed(t, [[at, 250], [at + .42, 310], [at + .7, 340], [at + 1.05, 400]]);
  return {
    reveal, referenceFrame,
    media: {x: mix(60, 1130, reveal), y: mix(18, 145, reveal),
      width: mix(1800, 720, reveal), height: mix(900, 650, reveal)},
    numberOpacity: reveal * sourceValue(priceSource, 'number', referenceFrame, 5),
    branches: [1, 2].map(column => sourceValue(priceSource, 'branchLight', referenceFrame, column)),
    labels: [phase(t, at + .42, at + .7), phase(t, at + .7, at + 1.05)],
  };
}

export function R6PriceBranches({t, c}: MotionProps) {
  const state = r6PriceState(t, c), media = state.media;
  return <AbsoluteFill data-component='R6-R005'>
    <div style={{position: 'absolute', left: media.x, top: media.y,
      width: media.width, height: media.height}}><Media src='models.png'/></div>
    <div style={{position: 'absolute', inset: 0, opacity: state.reveal}}>
      <div data-qc-text style={{...textStyle, position: 'absolute', left: 94, top: 115,
        width: 1000, fontFamily: 'RuiZi', fontSize: 66, lineHeight: 1.2}}>标准 API 价格 · 相对 Astra</div>
      <div data-qc-text style={{...textStyle, position: 'absolute', left: 110, top: 325,
        width: 490, fontFamily: 'SourceHanHeavy', fontWeight: 900, fontSize: 230,
        color: ACCENT, textAlign: 'center', lineHeight: 1.2, opacity: state.numberOpacity,
        textShadow: '8px 10px 14px #0002'}}>1/5</div>
      <svg width={1140} height={900} style={{position: 'absolute'}}>
        {state.branches.map((opacity, i) => <path key={i}
          d={`M575 480 Q670 480 700 ${i ? 650 : 330}`} fill='none' stroke={INK}
          strokeWidth={16} opacity={opacity}/>)}
      </svg>
      {['标准输入', '标准输出'].map((text, i) => <div data-qc-text key={text}
        style={{...textStyle, position: 'absolute', left: 720, top: i ? 595 : 275,
          width: 430, fontFamily: 'SourceHanHeavy', fontWeight: 900, fontSize: 82,
          lineHeight: 1.2, opacity: state.labels[i]}}>{text}</div>)}
    </div>
  </AbsoluteFill>;
}
