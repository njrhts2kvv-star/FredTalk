import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, Img, Sequence} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import {r4OpeningState} from './R4Replacements';
import {r4MediaRect} from './R4Media';
import {ACCENT, INK, LIGHT, Media, MediaWindow, clamp, fitSize, mix} from './library/SelectedMotion';

const smooth = (t: number, start: number, end: number) => {
  const p = clamp((t - start) / Math.max(.001, end - start));
  return p * p * (3 - 2 * p);
};

export function r6OpeningState(t: number) {
  const leave = smooth(t, 1.68, 2.35);
  return {
    dimOpacity: .3 * (1 - smooth(t, 1.65, 2.3)),
    lines: ['OpenAI', 'DevDay 2026'].map((text, i) => {
      const enter = smooth(t, .10 + i * .18, .54 + i * .18);
      return {
        text, top: 240 + i * 230 + (1 - enter) * 28 - leave * 24,
        opacity: enter * (1 - leave),
      };
    }),
  };
}

export function R6Opening({t}: MotionProps) {
  const state = r6OpeningState(t);
  return <AbsoluteFill data-component='R6-opening-smooth'>
    <MediaWindow t={3} full><Media src='stage.mp4'/></MediaWindow>
    <div style={{position: 'absolute', inset: 0,
      background: `rgba(0,0,0,${state.dimOpacity})`}}/>
    {state.lines.map((line, i) => <div key={line.text} data-qc-text style={{
      position: 'absolute', left: 140, top: line.top, width: 1640,
      fontFamily: 'SourceHanHeavy', fontWeight: 900, fontSynthesis: 'none',
      letterSpacing: 0, fontSize: fitSize(line.text, 1590, 166),
      lineHeight: 1.16, textAlign: 'center', color: i ? LIGHT : '#fff',
      textShadow: '6px 8px 7px #0006', opacity: line.opacity,
    }}>{line.text}</div>)}
  </AbsoluteFill>;
}

const posterTimes = [0, .45, .95, 1.45, 1.90, 2.55];
const posterGeometry = [0, .35, .70, 1.05, 1.20, 1.85]
  .map(time => r4OpeningState(time).objects);
const posterStarts = [0, .16, .06, .12, .05, .22, .32];

export function r6OpeningPriceState(t: number) {
  let index = 1;
  while (index < posterTimes.length - 1 && t > posterTimes[index]) index++;
  const progress = smooth(t, posterTimes[index - 1], posterTimes[index]);
  const build = smooth(t, 1.65, 2.45);
  return {
    objects: posterGeometry[0].map((object, i) => {
      const from = posterGeometry[index - 1][i];
      const to = posterGeometry[index][i];
      return {
        id: object.id, media: object.media, z: object.z,
        x: mix(from.x, to.x, progress), y: mix(from.y, to.y, progress),
        width: mix(from.width, to.width, progress),
        height: mix(from.height, to.height, progress),
        opacity: smooth(t, posterStarts[i], posterStarts[i] + .38)
          * (1 - smooth(t, 1.90, 2.70)),
      };
    }),
    module: {
      x: mix(650, 402, build), y: mix(260, 68, build),
      width: mix(620, 1116, build), height: mix(430, 794, build),
      radius: 24, opacity: smooth(t, 1.65, 2.05),
    },
    textVisibility: {
      price: smooth(t, 2.10, 2.40), question: smooth(t, 2.35, 2.65),
    },
  };
}

export function R6OpeningPriceQuestion({t}: MotionProps) {
  const state = r6OpeningPriceState(t);
  const panel = state.module;
  const display: React.CSSProperties = {
    fontFamily: 'RuiZi', fontWeight: 700, fontSynthesis: 'none',
    letterSpacing: 0, textAlign: 'center', whiteSpace: 'nowrap',
  };
  return <AbsoluteFill data-component='R6-N038-smooth' style={{overflow: 'hidden'}}>
    {state.objects.map(object => <div key={object.id} style={{
      position: 'absolute', left: object.x, top: object.y,
      width: object.width, height: object.height, opacity: object.opacity,
      zIndex: object.z, borderRadius: 18, overflow: 'hidden',
      boxShadow: '16px 16px 24px #0003', background: 'white',
    }}><Img src={staticFile(`media/${object.media}`)} style={{
      width: '100%', height: '100%', objectFit: 'cover',
    }}/></div>)}
    <div style={{position: 'absolute', left: panel.x, top: panel.y,
      width: panel.width, height: panel.height, borderRadius: panel.radius,
      opacity: panel.opacity, zIndex: 20, background: '#222225',
      overflow: 'hidden', boxShadow: '22px 18px 27px #0004'}}>
      <div style={{height: 78, background: '#151517', display: 'flex',
        alignItems: 'center', gap: 22, paddingLeft: 48}}>
        {['#df3099', '#ffc354', '#4289ee'].map(color => <i key={color}
          style={{width: 23, height: 23, borderRadius: '50%', background: color}}/>)}
      </div>
      <div data-qc-text style={{...display, position: 'absolute', left: 36,
        right: 36, top: 188, color: '#fff', lineHeight: 1.15,
        opacity: state.textVisibility.price}}>
        <span style={{fontSize: 200}}>200</span>
        <span style={{fontSize: 94, marginLeft: 30}}>美元</span>
      </div>
      <div data-qc-text style={{...display, position: 'absolute', left: 36,
        right: 36, top: 505, fontSize: 104, color: LIGHT, lineHeight: 1.2,
        opacity: state.textVisibility.question}}>值得继续掏吗？</div>
    </div>
  </AbsoluteFill>;
}

export const R6_STAGE_LEAD_SECONDS = 55 / 60;

// Lead and S05 share one label clock; media remains mounted by its existing scene.
export function r6StageState(sharedSeconds: number, nameCue = 65 / 60) {
  const exitAt = R6_STAGE_LEAD_SECONDS + nameCue + .15;
  const leave = smooth(sharedSeconds, exitAt, exitAt + .65);
  return {
    exitAt,
    cards: ['命名', '任务', '结果'].map((text, i) => {
      const enter = smooth(sharedSeconds, i * .13, i * .13 + .46);
      return {
        text, x: 470, y: (58 + i * 350) * .7 + 70 + (1 - enter) * 24 - leave * 28,
        width: 980, height: 264 * .7, opacity: enter * (1 - leave),
      };
    }),
  };
}

function StageLabels({sharedSeconds, nameCue}: {sharedSeconds: number; nameCue: number}) {
  const state = r6StageState(sharedSeconds, nameCue);
  return <div data-stage-clock={sharedSeconds} style={{position: 'absolute', inset: 0}}>
    {state.cards.map(card => <div key={card.text} data-qc-text style={{
      position: 'absolute', left: card.x, top: card.y, width: card.width,
      height: card.height, opacity: card.opacity, borderRadius: 72,
      background: INK, display: 'grid', placeItems: 'center', color: '#fff',
      fontFamily: 'RuiZi', fontWeight: 700, fontSynthesis: 'none',
      letterSpacing: 0, fontSize: 112,
    }}>{card.text}</div>)}
  </div>;
}

export function R6StageLead({t, c}: MotionProps) {
  return <StageLabels sharedSeconds={t} nameCue={c(1)}/>;
}

export function R6StageHandoff({t, c}: MotionProps) {
  const first = c(2);
  const second = c(4);
  const firstFrame = Math.round(first * 60);
  const secondFrame = Math.round(second * 60);
  return <AbsoluteFill data-component='R6-B070-unframed'>
    <div style={{position: 'absolute', left: r4MediaRect.x, top: r4MediaRect.y,
      width: r4MediaRect.width, height: r4MediaRect.height,
      padding: 0, border: 0, borderRadius: 0, boxShadow: 'none'}}>
      {t < first && <Media src='name.mp4' fit='contain' rate={8.5}/>}
      <Sequence from={firstFrame} durationInFrames={secondFrame - firstFrame}>
        <Media src='task.mp4' fit='contain' rate={4.5}/>
      </Sequence>
      <Sequence from={secondFrame}>
        <Media src='result.mp4' fit='contain' rate={5.9}/>
      </Sequence>
    </div>
    <StageLabels sharedSeconds={t + R6_STAGE_LEAD_SECONDS} nameCue={c(1)}/>
  </AbsoluteFill>;
}

export const R6_SUPPORT_ENTER_SECONDS = 304 / 60;

export function r6SupportState(t: number) {
  return {
    cards: ['沟通需求', '安排工作', '持续跟进'].map((text, i) => {
      const start = R6_SUPPORT_ENTER_SECONDS + i * .09;
      const enter = smooth(t, start, start + .60);
      return {
        text, x: 190, y: 160 + i * 242 + (1 - enter) * 24,
        width: 1540, height: 210, opacity: enter,
      };
    }),
  };
}

export function R6SupportFlow({t}: MotionProps) {
  const state = r6SupportState(t);
  return <AbsoluteFill data-component='R6-support-flow'>
    <MediaWindow t={t}><Media src='introducing-dots-carousel-launch.png'/></MediaWindow>
    <AbsoluteFill style={{background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(18px)'}}/>
    {state.cards.map((card, i) => <div key={card.text} data-qc-text style={{
      position: 'absolute', left: card.x, top: card.y, width: card.width,
      height: card.height, opacity: card.opacity, fontFamily: 'RuiZi',
      fontWeight: 700, fontSynthesis: 'none', letterSpacing: 0,
      fontSize: fitSize(card.text, 1500, 166), lineHeight: 1.2, textAlign: 'center',
      color: i === 2 ? ACCENT : INK, textShadow: '6px 8px 5px #0003',
    }}>{card.text}</div>)}
  </AbsoluteFill>;
}
