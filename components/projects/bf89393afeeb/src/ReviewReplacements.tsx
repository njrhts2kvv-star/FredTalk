import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Freeze,
  OffthreadVideo,
  interpolate,
  staticFile,
} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import conditionCues from './specs/X003-trajectory.json';
import decisionCues from './specs/N032-trajectory.json';

type CueProps = Pick<MotionProps, 't' | 'c'>;
type Samples = number[][];

const INK = '#171719';
const LIGHT = '#D6BEFF';
const FONT: React.CSSProperties = {
  fontFamily: 'MiSans',
  fontWeight: 600,
  fontSynthesis: 'none',
  letterSpacing: 0,
};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const value = (frame: number, samples: Samples, column = 1) =>
  interpolate(frame, samples.map((row) => row[0]), samples.map((row) => row[column]), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
const enter = (time: number, at: number, duration = 1 / 3) =>
  interpolate(time, [at, at + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// C009/WordGrid and its Stage: keep the four slots and left-to-right surface reveal.
export function JevWordGrid({t, c}: CueProps) {
  const stage = enter(t, c(3), 0.28);
  const words = [
    {text: 'Jev', at: c(3), fontSize: 128},
    {text: '极速决策', at: c(3) + 0.22, fontSize: 114},
    {text: '进入大厂产品', at: c(4), fontSize: 96},
    {text: 'OpenAI 也做出来了', at: c(5), fontSize: 76},
  ];

  return (
    <AbsoluteFill data-component="C009-WordGrid" style={FONT}>
      <AbsoluteFill style={{background:'#fff',opacity:stage}} />
      <div style={{
        position: 'absolute', left: 145, top: 168, width: 1630, height: 668,
        borderRadius: 34, background: '#1f2024', overflow: 'hidden',
        boxShadow: '0 28px 72px rgba(0,0,0,.14)',
        transform: `translateY(${(1 - stage) * 16}px) scale(${0.992 + stage * 0.008})`,
        opacity: interpolate(stage, [0, 0.24, 1], [0, 1, 1]),
      }}>
        <div style={{height: 62, background: '#151619', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12}}>
          {[0, 1, 2].map((i) => <div key={i} style={{width: 14, height: 14, borderRadius: 99, background: '#747579'}} />)}
        </div>
        <div style={{position: 'relative', height: 606}}>
          <div style={{position: 'absolute', inset: '30px 45px 42px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14}}>
            {words.map((word, index) => {
              const p = enter(t, word.at);
              return (
                <div key={word.text} style={{position: 'relative', border: '1px solid #3b3c41', borderRadius: 20, overflow: 'hidden', background: index === 3 ? '#25262b' : '#222328', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{position: 'absolute', inset: 0, background: '#303137', transformOrigin: 'left', transform: `scaleX(${p})`, opacity: index === 3 ? 0.72 : 0.42}} />
                  <div data-qc-text style={{position: 'relative', color: index === 3 ? LIGHT : '#fff', fontSize: word.fontSize, lineHeight: 1.25, whiteSpace: 'nowrap', transform: `translateX(${(1 - p) * -16}px)`, opacity: interpolate(p, [0, 0.18, 1], [0, 1, 1])}}>{word.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Condition({frame}: {frame: number}) {
  const first = 'Opus 5.5 很强';
  const second = ' + 消耗正常';
  const chars = Array.from(first + second);
  const firstLength = Array.from(first).length;
  const size = value(frame, conditionCues.textSize) * 0.88 + 2;
  const globalExit = interpolate(frame, [198, 209], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shell = [1,2,3,4].map(column => value(frame, conditionCues.shell, column) * 1.5);

  return (
    <AbsoluteFill data-component="X003-RebuiltX003" style={FONT}>
      <div style={{position: 'absolute', left: value(frame, conditionCues.shell, 1) * 1.5, top: value(frame, conditionCues.shell, 2) * 1.5, width: value(frame, conditionCues.shell, 3) * 1.5, height: value(frame, conditionCues.shell, 4) * 1.5, borderRadius: value(frame, conditionCues.radius), background: INK, boxShadow: '35px 18px 20px #0005'}} />
      <AbsoluteFill style={{clipPath:`inset(${shell[1]}px ${1920-shell[0]-shell[2]}px ${1080-shell[1]-shell[3]}px ${shell[0]}px)`}}>
      <div data-qc-text style={{position: 'absolute', left: value(frame, conditionCues.textX) - 6, top: 542 - size * 0.51, fontWeight: 700, fontSize: size, lineHeight: 1, transform: `scaleX(${0.95 + 0.009 * Math.max(0, Math.min(1, (frame - 120) / 30))})`, transformOrigin: 'left center', whiteSpace: 'nowrap', color: LIGHT, opacity: globalExit}}>
        {chars.map((char, i) => {
          const original = i < firstLength
            ? Math.min(6, Math.floor(i * 7 / firstLength))
            : 7 + Math.min(4, Math.floor((i - firstLength) * 5 / Array.from(second).length));
          return <span key={i} style={{visibility: frame >= conditionCues.letterStarts[original] ? 'visible' : 'hidden', opacity: value(frame, conditionCues.letterExit[original])}}>{char}</span>;
        })}
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// N032: measured question collapse, answer displacement and the same canonical Fred actor.
function DecisionBadge({frame}: {frame: number}) {
  const question = decisionCues.question;
  const answer = decisionCues.answer;
  const qx = frame < 8 ? value(frame, [[0, 640], [3, 700], [5, 678], [8, 641]])
    : frame > 81 ? value(frame, [[81, 1141], [83, 1460]]) : value(frame, question);
  const questionWidth = frame < 8 ? value(frame, [[0, 140], [2, 180], [4, 209], [8, 220]])
    : frame < 70 ? 220 : frame < 77
      ? value(frame, [[70, 210], [72, 192], [74, 168], [75, 145], [76, 111], [77, 35]])
      : value(frame, [[77, 35], [78, 8], [79, 95], [80, 139], [81, 180], [83, 216]]);
  const scale = value(frame, answer, 4) / 142;
  const answerX = value(frame, answer);
  const answerWidth = frame < 75
    ? value(frame, [[70, 0], [71, 8], [72, 40], [73, 80], [74, 146], [75, 238]])
    : 260 * scale;
  const actorX = value(frame, [[69, 1740], [72, 1530], [75, 1160], [78, 905], [81, 785], [85, 740], [90, 710]]);
  const actorFrame = Math.min(120, Math.max(0, Math.round((frame - 69) * 2)));

  return (
    <AbsoluteFill data-component="N032-RebuiltN032" style={FONT}>
      {frame >= 69 && <div style={{position: 'absolute', left: actorX, top: -150, width: 1370, height: 1370, filter: 'drop-shadow(15px 12px 10px #0004)'}}>
        <Freeze frame={actorFrame}>
          <OffthreadVideo muted transparent startFrom={115} src={staticFile('media/fred-actor-show.webm')} style={{width: '100%', height: '100%', objectFit: 'contain', transform: 'scaleX(-1)'}} />
        </Freeze>
      </div>}
      {frame < 83 && <div style={{position: 'absolute', left: (qx - questionWidth / 2) * 1.5, top: (360 - 110) * 1.5, width: questionWidth * 1.5, height: 330, borderRadius: '50%', background: INK, boxShadow: '30px 15px 18px #0005', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div data-qc-text style={{fontWeight: 700, fontSize: 210 * (frame < 8 ? 1 : value(frame, question, 4) / 95), color: LIGHT, lineHeight: 1, transform: `scaleX(${questionWidth / 220})`, opacity: value(frame, [[0, 0], [2, 0], [4, 0.8], [7, 1]])}}>?</div>
      </div>}
      {frame >= 70 && <div style={{position: 'absolute', left: (answerX - answerWidth / 2) * 1.5 - 55, top: (360 - 130 * scale) * 1.5 - 100, width: answerWidth * 1.5, height: 390 * scale, borderRadius: '50%', background: INK, boxShadow: '30px 15px 18px #0005', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
        <div data-qc-text style={{fontSize: 150 * scale, fontWeight: 700, lineHeight: 1, color: LIGHT, transform: `scaleX(${Math.min(1, answerWidth / (260 * scale))})`, whiteSpace: 'nowrap'}}>考虑</div>
      </div>}
    </AbsoluteFill>
  );
}

export function CompetitorDecision({t, c}: CueProps) {
  const morphAt = c(2) + 1.5;
  const handoffAt = morphAt + 0.25;
  const answerAt = c(2) + 3;
  const conditionFrame = value(t, [
    [0, 0], [0.9, 38], [1.9, 61], [c(1) - 0.1, 110],
    [c(1) + 0.55, 145], [morphAt - 0.15, 198], [handoffAt, 209],
  ]);
  const decisionFrame = value(t, [
    [handoffAt, 0], [handoffAt + 0.25, 8],
    [answerAt, 69], [answerAt + 0.35, 85], [answerAt + 0.75, 96],
    [answerAt + 1.65, 144], [answerAt + 2, 164],
  ]);

  return (
    <AbsoluteFill data-component="X003-N032-continuous" style={{...FONT, background: '#fff', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 192, top: 28, width: 1920, height: 1080, transform: 'scale(0.8)', transformOrigin: '0 0'}}>
        {t < handoffAt && <Condition frame={conditionFrame} />}
        {t >= handoffAt && <DecisionBadge frame={decisionFrame} />}
      </div>
    </AbsoluteFill>
  );
}
