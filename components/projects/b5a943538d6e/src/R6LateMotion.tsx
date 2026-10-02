import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {MotionProps} from './SemanticMotion';
import {Media, fitSize, INK, LIGHT, mix, clamp} from './library/SelectedMotion';
import {JevWordGrid} from './ReviewReplacements';
import choices from './specs/C005.json';

const ease = (t: number, start: number, duration: number) => {
  const p = clamp((t - start) / duration);
  return p * p * (3 - 2 * p);
};
const display: React.CSSProperties = {fontFamily: 'RuiZi', fontWeight: 700, fontSynthesis: 'none', letterSpacing: 0};
const heavy: React.CSSProperties = {fontFamily: 'SourceHanHeavy', fontWeight: 900, fontSynthesis: 'none', letterSpacing: 0};
const body: React.CSSProperties = {fontFamily: 'MiSans', fontWeight: 700, fontSynthesis: 'none', letterSpacing: 0};
const shadow = '22px 18px 27px #0004';

export function r6CreditState(t: number, c: MotionProps['c']) {
  const enter = ease(t, 0, .44), aside = ease(t, c(1), .46);
  const camera = ease(t, .65, .46);
  return {enter, aside, camera, brush: ease(t, .65, .7), width: mix(mix(580, 1450, enter), 1160, camera), scroll: 616 * enter};
}

export function R6CreditReading({t, c}: MotionProps) {
  const s = r6CreditState(t, c), width = s.width;
  return <AbsoluteFill data-component='X025-r6-continuous-camera'>
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: mix((1920 - width) / 2, 65, s.camera), top: mix(20, 154, s.enter), width, height: mix(838, 720, s.enter), overflow: 'hidden', borderRadius: 8, boxShadow: '12px 18px 38px #0002'}}>
        <div style={{width: 828, height: 1196, position: 'relative', transform: `scale(${width / 828}) translateY(${-s.scroll}px)`, transformOrigin: '0 0'}}>
          <Media src='email.png'/>
          <div style={{position: 'absolute', left: 540, top: 676, width: 187 * s.brush, height: 23, background: LIGHT, opacity: .62, mixBlendMode: 'multiply'}}/>
        </div>
      </div>
    </div>
    <div data-qc-credit-claim style={{position: 'absolute', left: 1290, top: 192, width: 550, ...body, fontSize: 57, lineHeight: 1.28, color: INK, clipPath: `inset(0 ${100 * (1 - s.brush)}% 0 0)`, opacity: s.brush}}>
      一次性赠送<br/><span style={{fontSize: 90}}>62,500 点</span><br/>使用额度
    </div>
    <div style={{position: 'absolute', left: 1360, top: 606, width: 490, ...display, fontSize: 72, opacity: s.aside}}>我的感觉</div>
    <div style={{position: 'absolute', left: 1340, top: 715, width: 510, ...display, fontSize: 99, color: '#8554E8', opacity: s.aside}}>不太耐用</div>
  </AbsoluteFill>;
}

export function r6MontageState(t: number, c: MotionProps['c']) {
  const starts = [c(1), c(2), c(2) + .85, c(2) + 1.92];
  const ends = [c(2) - .12, c(2) + .78, c(2) + 1.84, c(2) + 3.15];
  return starts.map((start, i) => ease(t, start, .22) * (1 - ease(t, ends[i] - .22, .22)));
}

export function R6EvidenceMontage({t, c}: MotionProps) {
  const focus = r6MontageState(t, c), any = Math.max(...focus);
  const files = ['official-04.webp', 'official-05.webp', 'official-06.webp', 'official-07.webp'];
  const baseWidth = 708, baseHeight = 398.25;
  return <AbsoluteFill data-component='R016-r6-spoken-focus'>{files.map((src, i) => {
    const p = focus[i], enter = ease(t, i * .045, .36);
    const width = mix(baseWidth, 1500, p), height = width * 9 / 16;
    const x = mix(i % 2 ? 1005 : 188, (1920 - width) / 2, p);
    const y = mix(i < 2 ? 83 : 532, 470 - height / 2, p);
    return <div key={src} style={{position: 'absolute', left: x, top: y + (1 - enter) * 30, width, height,
      zIndex: p > .001 ? 10 : 1, opacity: enter * mix(1, .16, any - p),
      overflow: 'hidden', borderRadius: 22, boxShadow: shadow}}><Media src={src}/></div>;
  })}</AbsoluteFill>;
}

export function r6DecisionState(t: number, c: MotionProps['c']) {
  const at = Math.max(.4, c(1) - .12), collapseAt = c(1) + 1.5;
  return {at, collapseAt, root: ease(t, at, .42), leaves: Array.from({length: 6}, (_, i) => ease(t, at + .14 + i * .075, .48)),
    collapse: ease(t, collapseAt, .7), compare: ease(t, c(3), .4)};
}

export function R6DecisionTree({t, c}: MotionProps) {
  const s = r6DecisionState(t, c), shape = choices.nativeStates[360], flow = choices.nativeStates[650].flow;
  const [rx, ry, rw, rh] = shape.root, words = ['选项 A', '选项 B', '选项 C', '选项 D', '选项 E', '选项 F'];
  const treeAlpha = s.root * (1 - s.collapse);
  return <AbsoluteFill data-component='C005-r6-continuous-choice-flow'>
    <div style={{position: 'absolute', left: 95, top: 98, width: 1730, height: 770, opacity: 1 - s.root}}><Media src='official-08.webp'/></div>
    <div style={{position: 'absolute', left: 182, top: 40, width: 1920, height: 1080, transform: 'scale(.81)', transformOrigin: '0 0', opacity: 1 - s.compare}}>
      <div style={{position: 'absolute', inset: 0, opacity: treeAlpha, transform: `translateY(${s.collapse * 80}px) scale(${mix(1, .84, s.collapse)})`, transformOrigin: '960px 540px'}}>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>{shape.leaves.map(([x, y, w], i) => <path key={i}
          d={`M${rx + rw / 2} ${ry + rh} V350 H${x + w / 2} V${y}`} fill='none' stroke={INK} strokeWidth={8} opacity={s.leaves[i]}/>)}</svg>
        <div style={{position: 'absolute', left: rx, top: ry + (1 - s.root) * 38, width: rw, height: rh, borderRadius: rh / 2, background: INK, display: 'grid', placeItems: 'center', color: LIGHT, ...heavy, fontSize: 117}}>几个选择</div>
        {shape.leaves.map(([x, y, w, h], i) => <div key={i} style={{position: 'absolute', left: x, top: y + (1 - s.leaves[i]) * 54,
          width: w, height: h, borderRadius: 60, background: INK, opacity: s.leaves[i], display: 'grid', placeItems: 'center', color: '#fff', ...heavy, fontSize: 72, writingMode: 'vertical-rl'}}>{words[i]}</div>)}
      </div>
      {flow.map(([x, y, w, h], i) => <div key={i} style={{position: 'absolute', left: x + (i ? 1 : -1) * 95 * (1 - s.collapse), top: y,
        width: w, height: h, borderRadius: 50, background: INK, opacity: s.collapse, display: 'grid', placeItems: 'center', color: LIGHT, ...heavy, fontSize: 118}}>{i ? '快速判断' : '选择'}</div>)}
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: s.collapse}}><path d='M744 540 H1130 M1064 486 L1140 540 L1064 594' fill='none' stroke={INK} strokeWidth={22} strokeLinecap='round' strokeLinejoin='round'/></svg>
    </div>
    <JevWordGrid t={t} c={c}/>
  </AbsoluteFill>;
}

export function r6CapabilityState(t: number, c: MotionProps['c']) {
  const starts = [c(1) + .16, c(1) + 1.25, c(1) + 2.42];
  return {starts, entries: starts.map(at => ease(t, at, .38)), merge: ease(t, c(3), .72),
    result: ease(t, c(3) + .22, .44), x: 460, y: 316.5, width: 1000, height: 330, radius: 165, fontSize: fitSize('ChatGPT', 476, 130)};
}

export function R6CapabilityMerge({t, c}: MotionProps) {
  const s = r6CapabilityState(t, c), words = ['云端 Agent', '团队协作', '极速决策'];
  const media = ['official-04.webp', 'official-16.webp', 'official-08.webp'];
  return <AbsoluteFill data-component='R006-r6-cue-bound-merge'>
    <div style={{position: 'absolute', left: 140, top: 372, width: 1640, ...heavy, textAlign: 'center', fontSize: 150,
      opacity: ease(t, .12, .36) * (1 - ease(t, c(1) - .22, .38))}}>整体看下来</div>
    {words.map((word, i) => {
      const enter = s.entries[i], alpha = enter * (1 - ease(t, c(3) + .2, .5));
      const width = mix(470, 240, s.merge), height = mix(355, 180, s.merge);
      const x = mix(150 + i * 574, 960 - width / 2, s.merge), y = mix(210 + (1 - enter) * 45, 480 - height / 2, s.merge);
      return <React.Fragment key={word}>
        <div style={{position: 'absolute', left: x, top: y, width, height, borderRadius: 36, background: INK, boxShadow: shadow, overflow: 'hidden', opacity: alpha}}><Media src={media[i]}/></div>
        <div style={{position: 'absolute', left: 150 + i * 574, top: 635, width: 470, ...display, fontSize: 78, textAlign: 'center', opacity: alpha}}>{word}</div>
      </React.Fragment>;
    })}
    <div data-qc-chatgpt-block style={{position: 'absolute', left: s.x, top: s.y, width: s.width, height: s.height, borderRadius: s.radius,
      background: INK, boxShadow: shadow, opacity: s.result, transform: `translateY(${(1 - s.result) * 18}px)`, display: 'grid', placeItems: 'center'}}>
      <div data-qc-chatgpt-text style={{...heavy, fontSize: s.fontSize, color: LIGHT}}>ChatGPT</div>
    </div>
    <div style={{position: 'absolute', left: 140, top: 681.5, width: 1640, ...display, fontSize: 69, textAlign: 'center', opacity: s.result}}>一口气整合进来</div>
  </AbsoluteFill>;
}

export function R6CommercialList({t, c}: MotionProps) {
  return <AbsoluteFill data-component='B018-r6-stable-pill-reveal'>
    <div style={{position: 'absolute', left: 925, top: 370, width: 860, ...heavy, fontSize: 154, textAlign: 'center',
      opacity: ease(t, .08, .35), textShadow: '8px 11px 14px #0002'}}>更商业化</div>
    {['功能更多', '额度收紧'].map((text, i) => {
      const p = ease(t, c(i + 1), .42), textAlpha = ease(t, c(i + 1) + .12, .28);
      return <div key={text} style={{position: 'absolute', left: 140, top: 220 + i * 290, width: 650, height: 220,
        borderRadius: 58, background: INK, boxShadow: shadow, display: 'grid', placeItems: 'center', overflow: 'hidden',
        opacity: p, clipPath: `inset(0 ${100 * (1 - p)}% 0 0 round 58px)`, transform: `translateX(${(1 - p) * -28}px)`}}>
        <span data-qc-text style={{...display, fontSize: 126, color: LIGHT, whiteSpace: 'nowrap', opacity: textAlpha}}>{text}</span>
      </div>;
    })}
  </AbsoluteFill>;
}
