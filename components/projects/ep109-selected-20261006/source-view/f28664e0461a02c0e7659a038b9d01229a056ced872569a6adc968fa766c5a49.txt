import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile} from 'remotion';
import {FullscreenVideoWindow} from '../shared/FullscreenVideoWindow';
import promptMotion from './entry-private/B009-prompt-motion.json';
import evidenceMotion from './entry-private/N054-evidence-motion.json';
import fightPrompt from './entry-private/ep109-fight-prompt-v4.json';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const track = (f: number, points: number[][]) => interpolate(
  f, points.map(p => p[0]), points.map(p => p[1]),
  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
);

/** Partial adaptation of N004: its measured selected-window closing curve
 * enlarges one centered movie; horizontal stops and secondary panes are omitted
 * per current feedback. The media source clock remains continuous.
 */
export function FightOpeningEntry({t,src='media/negative-preview-1080p.mp4',sourceIn=2,fps=60}:{t:number;src?:string;sourceIn?:number;fps?:number}) {
  // Retarget the approved N004 measured closing curve to one centered carrier.
  // The new entrance intentionally omits the two horizontal carousel stops.
  const f=150+21*Math.max(0,Math.min(1,t/.42));
  const close=track(f,[[150,0],[154,.014],[158,.065],[162,.18],[166,.40],[168,.57],[170,.70],[171,.73]])/.73;
  const scale=.002+.998*close;
  return <AbsoluteFill style={{background:'#fff'}}><div style={{position:'absolute',inset:0,transform:`scale(${scale})`,transformOrigin:'960px 540px'}}>
    <FullscreenVideoWindow src={staticFile(src)} videoProps={{muted:true,startFrom:Math.round(sourceIn*fps)}}/>
  </div></AbsoluteFill>;
}

/** L81-B009 source RebuiltBRepresentatives(number=9): complete original
 * prompt in the dark window, measured glyph establishment, independent
 * original-text layer. New requested action is one fast vertical sweep.
 */
export function FightPromptScroll({t}: {t: number}) {
  const rows = fightPrompt.rows;
  const entry = promptMotion.glyphEntry;
  const nativeFrame = Math.round(track(t, [[0, 73], [.18, 90]]));
  const entryRows = nativeFrame >= entry.startFrame && nativeFrame <= entry.endFrame
    ? entry.values[nativeFrame - entry.startFrame] : undefined;
  const lineHeight = 44;
  const viewportHeight = 655;
  const handoff=track(t,[[0,0],[2.05,0],[2.32,1]]);
  const windowX=140-80*handoff, windowY=50-16.777894*handoff,windowWidth=1640+160*handoff,windowHeight=820+193.555787*handoff;
  // Full text lives in one continuous layer; the sweep reaches the actual
  // last line and holds it. The subtitle remains a separate root overlay.
  const scroll = track(t, [[0, 0], [.38, 0], [.56, .04], [.83, .22], [1.25, .69], [1.68, .95], [1.9, 1], [2.35, 1]]) * Math.max(0, rows.length * lineHeight - viewportHeight);
  return <AbsoluteFill style={{background: '#171719', fontFamily: 'Fred MiSans', fontSynthesis: 'none'}}>
    <div style={{position: 'absolute', left: windowX, top: windowY, width: windowWidth, height: windowHeight,
      background: promptMotion.window.fill, borderRadius: promptMotion.window.radius,
      boxShadow: '35px 14px 30px #0004', overflow: 'hidden',
    }}>
      <div style={{height: promptMotion.window.headerHeight, background: '#121617', display: 'flex', gap: 30, paddingLeft: 55, alignItems: 'center'}}>
        {['#d92c89', '#f6b444', '#397df5'].map(c => <div key={c} style={{width: 25, height: 25, borderRadius: '50%', background: c}}/>)}
      </div>
      <div style={{position: 'absolute', left: 110, top: 130, width: 1420, height: viewportHeight, overflow: 'hidden'}}>
        <div style={{transform: `translateY(${-scroll}px)`, fontSize: 32, lineHeight: `${lineHeight}px`, fontWeight: 500, color: '#fff'}}>
          {rows.map((text, i) => {
            const head = /^[一二三四五六]、|^动作\+|^景别 \+|^场景反馈|^高燃节奏/.test(text);
            const row = entryRows?.[Math.round(i * (entry.rows - 1) / Math.max(1, rows.length - 1))];
            return <div key={i} style={{height: lineHeight, whiteSpace: 'nowrap', color: head ? '#D6BEFF' : '#fff', fontWeight: head ? 900 : 500}}>
              {Array.from(text).map((char, j) => <span key={j} style={{opacity: row ? row[Math.round(j * (row.length - 1) / Math.max(1, text.length - 1))] : 1}}>{char}</span>)}
            </div>;
          })}
        </div>
      </div>
    </div>
  </AbsoluteFill>;
}

/** N054 source UsageEvidence and its measured N054-motion.json: source
 * evidence shrinks to the left, then narration establishes right-hand words.
 * A genuine reference movie substitutes for the unrecorded operation slot.
 */
export function FightReferenceAnalysis({t, src = 'media/original-reference-preview-1080p.mp4', sourceIn = 0, fps = 60}: {
  t: number; src?: string; sourceIn?: number; fps?: number;
}) {
  // The reference's first 42 frames contain the actual scale/side-move.
  // Hold an established movie before the narration says "下载并分析".
  const nativeFrame = Math.round(track(t, [[0, 0], [2.4, 0], [3.1, 42]]));
  const m = evidenceMotion[Math.max(0, Math.min(311, nativeFrame))];
  const labels = ['风格', '动作逻辑', '场景要素'];
  const cues = [3.567, 6.217, 8.167];
  const nativeAlpha = evidenceMotion.map(frame => frame.alpha);
  // Reuse each source word's measured fade curve, now tied to the actual cues.
  const alphaStarts = [0, 1, 2].map(i => nativeAlpha.findIndex(alpha => alpha[i] > 0));
  return <AbsoluteFill style={{background: '#fff', fontFamily: 'Fred MiSans', fontSynthesis: 'none'}}>
    <div style={{position: 'absolute', left: m.x, top: m.y, width: 1106, height: 644,
      borderRadius: 26, overflow: 'hidden', background: '#fff',
      boxShadow: '0 5px 13px 7px #0006', transform: `scale(${m.scale})`, transformOrigin: '0 0',
    }}>
      <OffthreadVideo muted src={staticFile(src)} startFrom={Math.round(sourceIn * fps)} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
    </div>
    {labels.map((label, i) => {
      const alphaFrame = Math.max(0, Math.min(311, alphaStarts[i] + Math.floor((t - cues[i]) * 60)));
      const opacity = t < cues[i] ? 0 : evidenceMotion[alphaFrame].alpha[i];
      return <svg key={label} style={{position: 'absolute', left: 1309, top: [296, 491, 686][i], width: 540, height: 125, overflow: 'visible', opacity}}>
        <text x={0} y={97} fontFamily="Fred RuiZi" fontSize={104} fontWeight={400} fill="#000">{label}</text>
      </svg>;
    })}
  </AbsoluteFill>;
}
