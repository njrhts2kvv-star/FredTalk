import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import t01 from './specs/r4-t01-motion.json';
import glyphOpacity from './specs/r4-t01-glyph-opacity.json';

const INK = '#151517';
const LIGHT = '#D6BEFF';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, value: number) => a + (b - a) * value;
const phase = (t: number, a: number, b: number) => {
  const q = clamp((t - a) / Math.max(0.001, b - a));
  return q * q * (3 - 2 * q);
};
const keyed = (t: number, anchors: number[][]) => {
  if (t <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    if (t <= anchors[i][0]) {
      const [a, from] = anchors[i - 1];
      const [b, to] = anchors[i];
      return mix(from, to, clamp((t - a) / Math.max(0.001, b - a)));
    }
  }
  return anchors[anchors.length - 1][1];
};

// Actual N038 is BatchB -> MediaScenesB, not the unreachable BatchB fallback.
// These seven objects retain its measured 480 x 270 source geometry.
const posterTimes = [0.2, 1, 2, 3, 3.8, 4.4];
const posters = [
  {id: 'dot', media: 'introducing-dots-carousel-launch.png', z: 1, s: 0,
    r: [[146,67,54,78],[109,48,71,101],[60,23,93,133],[13,-6,114,159],[-9,-36,124,185],[-62,-94,124,185]]},
  {id: 'sol', media: 'official-01.webp', z: 3, s: 0.16,
    r: [[136,164,36,50],[97,155,54,76],[49,137,83,116],[0,120,105,150],[-23,108,120,170],[-111,116,125,175]]},
  {id: 'cloud', media: 'official-04.webp', z: 2, s: 0.06,
    r: [[229,112,35,49],[195,102,58,80],[154,89,85,119],[112,77,111,158],[81,76,133,183],[46,242,133,183]]},
  {id: 'cli', media: 'official-05.webp', z: 1, s: 0.12,
    r: [[300,66,38,54],[298,84,47,67],[250,70,76,119],[213,17,111,158],[187,-22,124,183],[157,-146,124,183]]},
  {id: 'agents', media: 'official-09.webp', z: 4, s: 0.05,
    r: [[341,65,37,51],[345,57,55,78],[344,45,83,118],[339,36,115,158],[347,29,131,181],[466,28,131,181]]},
  {id: 'decisions', media: 'official-08.webp', z: 2, s: 0.22,
    r: [[316,158,39,53],[287,118,59,81],[296,110,84,119],[293,111,111,159],[291,149,130,183],[307,243,130,183]]},
  {id: 'team', media: 'official-15.webp', z: 5, s: 0.32,
    r: [[235,158,80,43],[232,124,99,55],[251,61,127,71],[272,0,155,87],[286,-40,174,97],[303,-80,174,97]]},
];

const posterCoordinate = (rows: number[][], column: number, t: number) => {
  let k = 1;
  while (k < posterTimes.length && t > posterTimes[k]) k++;
  if (k === posterTimes.length) return rows[k - 1][column];
  const q = k === 5 ? phase(t, 3.8, 4.4)
    : clamp((t - posterTimes[k - 1]) / (posterTimes[k] - posterTimes[k - 1]));
  return mix(rows[k - 1][column], rows[k][column], q);
};

export function r4OpeningState(t: number) {
  const referenceSeconds = keyed(t, [[0,.2],[.35,1],[.70,2],[1.05,3],[1.20,3.8],[1.85,4.4]]);
  const build = phase(t, 1.40, 2.15);
  const objects = posters.map((poster) => ({
    id: poster.id,
    media: poster.media,
    x: posterCoordinate(poster.r, 0, referenceSeconds) * 4,
    y: posterCoordinate(poster.r, 1, referenceSeconds) * 4,
    width: posterCoordinate(poster.r, 2, referenceSeconds) * 4,
    height: posterCoordinate(poster.r, 3, referenceSeconds) * 4,
    opacity: phase(referenceSeconds, poster.s, poster.s + .38) * (1 - phase(t, 1.85, 2.10)),
    z: poster.z,
  }));
  return {
    referenceSeconds,
    objects,
    module: {
      x: mix(650, 402, build), y: mix(260, 68, build),
      width: mix(620, 1116, build), height: mix(430, 794, build),
      radius: 24, opacity: phase(t, 1.40, 1.80),
    },
    textVisibility: {
      price: phase(t, 1.85, 2.10),
      question: phase(t, 2.05, 2.30),
    },
  };
}

export function R4OpeningPriceQuestion({t}: MotionProps) {
  const state = r4OpeningState(t);
  const panel = state.module;
  return <AbsoluteFill data-component='R4-N038' style={{overflow: 'hidden'}}>
    {state.objects.map((object) => <div key={object.id} style={{
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
        {['#df3099', '#ffc354', '#4289ee'].map((color) => <i key={color}
          style={{width: 23, height: 23, borderRadius: '50%', background: color}}/>)}
      </div>
      <div style={{position: 'absolute', left: 36, right: 36, top: 188,
        fontFamily: 'MiSans', fontWeight: 700, fontSynthesis: 'none',
        letterSpacing: 0, color: 'white', textAlign: 'center', lineHeight: 1.15,
        opacity: state.textVisibility.price, whiteSpace: 'nowrap'}}>
        <span style={{fontSize: 200}}>200</span>
        <span style={{fontSize: 94, marginLeft: 30}}>美元</span>
      </div>
      <div data-qc-text style={{position: 'absolute', left: 36, right: 36, top: 505,
        fontFamily: 'MiSans', fontWeight: 700, fontSynthesis: 'none',
        letterSpacing: 0, fontSize: 104, color: LIGHT, lineHeight: 1.2,
        textAlign: 'center', opacity: state.textVisibility.question,
        whiteSpace: 'nowrap'}}>值得继续掏吗？</div>
    </div>
  </AbsoluteFill>;
}

type TrackSpec = {tracks: Record<string, {samples: number[][]}>};
const sourceSpec = t01 as unknown as TrackSpec;
const sourceGlyphs = glyphOpacity as unknown as number[][][];

// The original T01 sampler retains measured native-frame holds between its anchors.
const measured = (name: string, frame: number) => {
  const rows = sourceSpec.tracks[name].samples;
  let i = 0;
  while (i < rows.length - 1 && rows[i + 1][0] <= frame) i++;
  const a = rows[i], b = rows[Math.min(i + 1, rows.length - 1)];
  const q = b[0] === a[0] || b[0] - a[0] > 1 ? 0
    : clamp((frame - a[0]) / (b[0] - a[0]));
  return a.slice(1).map((value, j) => mix(value, b[j + 1], q));
};

const defaultCues = [0, 1.8833333333333333, 3.933333333333333, 7.45];
export function r4DotUsageState(t: number, cues: number[] = defaultCues) {
  const chat = cues[1] ?? defaultCues[1];
  const work = cues[2] ?? defaultCues[2];
  const consume = cues[3] ?? defaultCues[3];
  const referenceFrame = keyed(t, [
    [0,0], [Math.min(1.45, chat - .3),60], [chat,60],
    [chat + .60,120], [work - .07,160], [work + .60,230],
    [work + 1.16,295], [consume,310], [consume + .50,360], [9.40,390],
  ]);
  const textVisibility = {
    pro: phase(t, 0, .35), chat: phase(t, chat, chat + .45),
    work: phase(t, work, work + .60), consume: phase(t, consume, consume + .45),
  };
  const cards = [
    {id: 'pro', lines: ['Pro 套餐包含首个 Dot']},
    {id: 'chat', lines: ['聊天', '不占 ChatGPT 额度']},
    {id: 'work', lines: ['Codex / ChatGPT 工作任务', '按对应规则消耗额度']},
  ].map((card, i) => {
    const [, sourceY, nativeWidth, height, textOpacity] = measured(`card${i}`, referenceFrame);
    const width = nativeWidth * (i === 0 ? 1.24 : 1.10);
    const main = i === 1 ? t < work : i === 2;
    const fontSize = main ? 100 : 80;
    const sourceHeight = height * .75;
    // Keep the source center trajectory; give the two-line context enough room at 80px.
    const h = i === 1 && !main && width > 0 ? Math.max(sourceHeight, 192) : sourceHeight;
    const sourceFrame = Math.max(0, Math.min(sourceGlyphs.length - 1, Math.floor(referenceFrame)));
    const sourceAlpha = sourceGlyphs[sourceFrame]?.[i] ?? [textOpacity];
    return {
      ...card,
      x: (1920 - width) / 2,
      y: sourceY * .75 + 78 + (sourceHeight - h) / 2,
      width, height: h,
      radius: Math.min(width / 2, h / 2, h * .32),
      fontSize, lineFontSizes: card.lines.map((_, line) => i === 2 && line === 0 ? 90 : fontSize),
      opacity: 1 - phase(t, 9.40, 9.60),
      glyphOpacities: sourceAlpha.map((alpha) => clamp(alpha)),
    };
  });
  const visible = cards.filter((card) => card.width > 0 && card.height > 0);
  return {
    referenceFrame, cards, textVisibility, rightColumn: false,
    bounds: {
      left: Math.min(...visible.map((card) => card.x)),
      top: Math.min(...visible.map((card) => card.y)),
      right: Math.max(...visible.map((card) => card.x + card.width)),
      bottom: Math.max(...visible.map((card) => card.y + card.height)),
    },
  };
}

export function R4DotUsageEvidence({t, c}: MotionProps) {
  const state = r4DotUsageState(t, [c(0), c(1), c(2), c(3)]);
  return <AbsoluteFill data-component='R4-T01'>
    {state.cards.map((card, i) => card.width > 0 && card.height > 0 && <div key={card.id}
      style={{position: 'absolute', left: card.x, top: card.y,
        width: card.width, height: card.height, borderRadius: card.radius,
        opacity: card.opacity, background: INK, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', boxSizing: 'border-box', padding: '6px 12px'}}>
      {card.lines.map((line, lineIndex) => {
        const cueAlpha = i === 0 ? state.textVisibility.pro
          : i === 1 ? state.textVisibility.chat
            : lineIndex === 0 ? state.textVisibility.work : state.textVisibility.consume;
        return <div data-qc-text key={line} style={{maxWidth: '100%', textAlign: 'center',
          fontFamily: 'MiSans', fontWeight: 700, fontSynthesis: 'none', letterSpacing: 0,
          fontSize: card.lineFontSizes[lineIndex], lineHeight: 1.12, whiteSpace: 'nowrap',
          color: lineIndex === 1 ? LIGHT : 'white', opacity: cueAlpha}}>
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
