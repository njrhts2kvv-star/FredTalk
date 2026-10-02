import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import {r7DotUsageState} from './R7MidMotion';
import {fitSize, textStyle} from './library/SelectedMotion';

export function r7SingleLineChatState(t: number, c: MotionProps['c']) {
  const state = r7DotUsageState(t, c);
  return {...state, cards: state.cards.map(card => {
    if (card.id !== 'chat') return card;
    const text = '聊天不占 ChatGPT 额度';
    const size = fitSize(text, card.width - 48, card.lineFontSizes[0]);
    return {...card, lines: [text], lineFontSizes: [size], lineOpacities: [card.opacity],
      lineTops: [(card.height - size * 1.12) / 2]};
  })};
}

export function R7DotUsageSingleLine({t, c}: MotionProps) {
  const state = r7SingleLineChatState(t, c);
  return <AbsoluteFill data-component='R7-T01-single-white-chat'>
    {state.cards.map(card => <div key={card.id}
      style={{position: 'absolute', left: card.x, top: card.y, width: card.width,
        height: card.height, borderRadius: card.radius, background: '#151517',
        opacity: card.opacity, overflow: 'hidden'}}>
      {card.lines.map((line, i) => <div data-qc-text key={line}
        style={{...textStyle, position: 'absolute', left: 12, right: 12,
          top: card.lineTops[i], height: card.lineFontSizes[i] * 1.12,
          textAlign: 'center', fontSize: card.lineFontSizes[i], lineHeight: 1.12,
          whiteSpace: 'nowrap', color: i === 1 ? '#D6BEFF' : 'white',
          opacity: card.lineOpacities[i]}}>{line}</div>)}
    </div>)}
  </AbsoluteFill>;
}
