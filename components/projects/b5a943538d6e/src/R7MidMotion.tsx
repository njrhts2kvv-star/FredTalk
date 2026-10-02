import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import {Media, textStyle} from './library/SelectedMotion';
import {r6PriceState} from './R6MidMotion';

const INK = '#151517';
const LIGHT = '#D6BEFF';
const ACCENT = '#8554E8';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const phase = (t: number, a: number, b: number) => {
  const p = clamp((t - a) / Math.max(.001, b - a));
  return p * p * (3 - 2 * p);
};

type DotCard = {
  id: string;
  lines: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  opacity: number;
  lineFontSizes: number[];
  lineOpacities: number[];
  lineTops: number[];
};

const dotCard = (card: Omit<DotCard, 'x' | 'radius'>): DotCard => ({...card,
  x: (1920 - card.width) / 2,
  radius: Math.min(card.width / 2, card.height / 2, card.height * .32),
});

export function r7DotUsageState(t: number, c: MotionProps['c']) {
  const chatCue = c(1), workCue = c(2), consumeCue = c(3);
  const proEnter = phase(t, c(0), c(0) + .25);
  const chatEnter = phase(t, chatCue, chatCue + .45);
  const chatRetreat = phase(t, workCue, workCue + .48);
  const workEnter = phase(t, workCue + .22, workCue + .58);
  const workText = workEnter;
  const consumeReveal = phase(t, consumeCue, consumeCue + .65);
  const chatFont = mix(100, 80, chatRetreat);
  const chatHeight = mix(256.5, 192, chatRetreat);
  const workHeight = mix(162, 256.5, consumeReveal);

  // The main work card is a single-line capsule until its second spoken cue.
  const cards = [
    dotCard({id: 'pro', lines: ['Pro 套餐包含首个 Dot'],
      width: 905.2, height: 162, y: mix(402, 132, chatEnter), opacity: proEnter,
      lineFontSizes: [80], lineOpacities: [proEnter], lineTops: [(162 - 80 * 1.12) / 2]}),
    dotCard({id: 'chat', lines: ['聊天', '不占 ChatGPT 额度'],
      width: mix(1276, 803, chatRetreat), height: chatHeight,
      y: mix(375.5 - 20 * chatEnter, 657, chatRetreat), opacity: chatEnter,
      lineFontSizes: [chatFont, chatFont], lineOpacities: [chatEnter, chatEnter],
      lineTops: [chatHeight / 2 - chatFont * 1.12, chatHeight / 2]}),
    dotCard({id: 'work', lines: ['Codex / ChatGPT 工作任务', '按对应规则消耗额度'],
      width: 1276, height: workHeight,
      y: 483.75 - workHeight / 2 + 16 * (1 - workEnter), opacity: workEnter,
      lineFontSizes: [90, 100], lineOpacities: [workText, consumeReveal],
      lineTops: [workHeight / 2 - 50.4 - 56 * consumeReveal, workHeight / 2 - 5.6]}),
  ];
  return {cards, consumeReveal};
}

export function R7DotUsageEvidence({t, c}: MotionProps) {
  const state = r7DotUsageState(t, c);
  return <AbsoluteFill data-component='R7-T01-continuous'>
    {state.cards.map(card => <div key={card.id}
      style={{position: 'absolute', left: card.x, top: card.y, width: card.width,
        height: card.height, borderRadius: card.radius, background: INK,
        opacity: card.opacity, overflow: 'hidden'}}>
      {card.lines.map((line, i) => <div data-qc-text key={line}
        style={{...textStyle, position: 'absolute', left: 12, right: 12,
          top: card.lineTops[i], height: card.lineFontSizes[i] * 1.12,
          textAlign: 'center', fontSize: card.lineFontSizes[i], lineHeight: 1.12,
          whiteSpace: 'nowrap', color: i === 1 ? LIGHT : 'white',
          opacity: card.lineOpacities[i]}}>{line}</div>)}
    </div>)}
  </AbsoluteFill>;
}

export function r7PriceState(t: number, c: MotionProps['c']) {
  const state = r6PriceState(t, c);
  const opening = phase(t, c(0), c(0) + 1.1);
  const question = phase(t, c(1), c(1) + .7);
  const sol = phase(t, c(2), c(2) + .7);
  const comparison = phase(t, c(3), c(3) + .7);
  const retainEvidenceFocus = 1 - state.reveal;
  const columnMasks = [
    .09 * question + .30 * sol - .39 * comparison,
    .09 * question - .09 * sol,
    .09 * question + .30 * sol + .04 * comparison,
  ].map(value => Math.max(0, value) * retainEvidenceFocus);
  const scale = 1 + retainEvidenceFocus * (
    .018 * opening + .005 * question + .022 * sol - .017 * comparison
    + .005 * phase(t, c(0), c(4)));
  const {width, height} = state.media;
  const canvasWidth = Math.min(width, height * 16 / 9);
  const canvasHeight = canvasWidth * 9 / 16;
  return {...state, columnMasks,
    canvasMask: .045 * opening * retainEvidenceFocus,
    camera: {scale, origin: '50% 60%'},
    canvas: {x: (width - canvasWidth) / 2, y: (height - canvasHeight) / 2,
      width: canvasWidth, height: canvasHeight},
  };
}

export function R7PriceBranches({t, c}: MotionProps) {
  const state = r7PriceState(t, c), media = state.media, canvas = state.canvas;
  return <AbsoluteFill data-component='R7-R005-model-focus'>
    <div style={{position: 'absolute', left: media.x, top: media.y,
      width: media.width, height: media.height, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: canvas.x, top: canvas.y,
        width: canvas.width, height: canvas.height,
        transform: `scale(${state.camera.scale})`, transformOrigin: state.camera.origin}}>
        <Media src='models.png'/>
        <svg data-r7-mask='real-model-canvas' viewBox='0 0 1920 1080'
          width='100%' height='100%' style={{position: 'absolute', inset: 0}}>
          <rect width={1920} height={1080} fill='black' opacity={state.canvasMask}/>
          {state.columnMasks.map((opacity, i) => <rect key={i} x={i * 640}
            width={640} height={1080} fill='black' opacity={opacity}/>)}
        </svg>
      </div>
    </div>
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
