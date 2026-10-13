// T04b-RoleSplit：角色分工：每个工具各管一环
// 观众要看懂的变化：一件事 → 拆给几个工具，各管一环
// 关系：一整条黑胶囊（一件事）沿分段处裂开成几段（各环节），每段下方落下负责它的工具。不画连线：靠同一列上下归组表达“谁管哪段”。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type Role = { step: string; tool: string; logo: string };
export type RoleSplitProps = HandoffProps & {
  task: string;          // 整件事
  roles: Role[];         // 2–4 段：每段的环节名 + 负责的工具（名字 + Logo 路径）
  highlight: string;     // task 里染紫的词（黑胶囊上用 #D6BEFF）；'' 不染
  cues?: number[];       // [0]=胶囊裂开（默认 1.1s）；[1..n]=第 i 个工具落位
};

export const roleSplitDefaults: RoleSplitProps = {
  task: '做一期 AI 工具测评视频',
  roles: [
    { step: '写口播稿', tool: 'ChatGPT', logo: 'media/w8-chatgpt-mark.png' },
    { step: '生成配图', tool: '豆包', logo: 'media/w8-doubao-mark.png' },
    { step: '做动画出片', tool: 'Codex', logo: 'media/w8-codex-mark.png' },
  ],
  highlight: '测评视频',
};

const BAR_H = 210;

// 环节名太长时拆成两行：优先在中间附近的标点/空格处断开
const splitTwo = (s: string): string[] => {
  const ch = Array.from(s);
  const mid = ch.length / 2;
  let best = -1;
  ch.forEach((c, i) => { if (/[、，,\s·/]/.test(c) && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; });
  if (best > 0 && best < ch.length - 1) return [ch.slice(0, best + (/\s/.test(ch[best]) ? 0 : 1)).join('').replace(/[、，,]$/, ''), ch.slice(best + 1).join('').trim()];
  const k = Math.ceil(mid);
  return [ch.slice(0, k).join(''), ch.slice(k).join('')];
};
const BAR_Y = 330;
const GAP = 40;

export function RoleSplit(props: Partial<RoleSplitProps>) {
  const c = { ...roleSplitDefaults, ...props };
  const t = useT();
  const roles = c.roles.slice(0, 4);
  const n = Math.max(1, roles.length);

  const splitAt = cueAt(c.cues, 0, 1.1);
  const toolAt = (i: number) => cueAt(c.cues, i + 1, splitAt + 0.75 + i * 0.5);

  // 尺寸：整条宽度同时容纳整句与每段环节名
  const stepFit = Math.max(...roles.map((r) => textWidth(r.step, 1)), 1);
  const segW = Math.min((1720 - (n - 1) * GAP) / n, Math.max(420, stepFit * 92 + 120));
  const W = segW * n + (n - 1) * GAP;           // 裂开后的总宽（含缝）
  const X0 = 960 - W / 2;
  const taskSize = Math.min(124, (W - 160) / Math.max(1, textWidth(c.task, 1)));
  const oneLine = Math.min(96, (segW - 80) / stepFit);
  const twoLines = oneLine < 60;   // 一行放不下大字时，统一改两行
  const stepLines = roles.map((r) => (twoLines && textWidth(r.step, 1) * oneLine > (segW - 80) * 0.75 ? splitTwo(r.step) : [r.step]));
  const stepSize = twoLines
    ? Math.min(72, BAR_H / 2.7, ...stepLines.map((ls) => (segW - 70) / Math.max(1, ...ls.map((l) => textWidth(l, 1)))))
    : oneLine;

  const enter = p(t, 0, 0.5);
  const split = q(t, splitAt, splitAt + 0.6);
  const gap = GAP * split;
  const segWNow = (W - (n - 1) * gap) / n;
  const innerR = mix(0, BAR_H / 2, split);
  const taskOut = clamp((t - splitAt) / 0.18);
  const stepIn = p(t, splitAt + 0.2, splitAt + 0.6);

  const [pre, post = ''] = c.highlight && c.task.includes(c.highlight) ? c.task.split(c.highlight) : [c.task];
  const hl = c.highlight && c.task.includes(c.highlight);

  // 工具卡：白卡从下方升起，顶边塞进对应那段胶囊下面（同一列 = 这一段归它管）
  const nameFit = Math.max(...roles.map((r) => textWidth(r.tool, 1)), 1);
  const logo = 128;
  const cardW = segW - 56;
  const nameSize = Math.min(68, (cardW - 70) / nameFit);
  const TUCK = 40;
  const cardH = 330;
  const toolY = BAR_Y + BAR_H - TUCK;
  const blockH = BAR_H - TUCK + cardH;
  const dyEnd = (1080 - blockH) / 2 - BAR_Y;
  const dyStart = (1080 - BAR_H) / 2 - BAR_Y; // 先居中；裂开时整组上移给工具卡让位

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${mix(dyStart, dyEnd, q(t, splitAt, splitAt + 0.7))}px)` }}>
        {roles.map((r, i) => {
          const x = X0 + i * (segWNow + gap);
          const first = i === 0, last = i === n - 1;
          const R = BAR_H / 2;
          const radius = `${first ? R : innerR}px ${last ? R : innerR}px ${last ? R : innerR}px ${first ? R : innerR}px`;
          return <div key={i} style={{
            position: 'absolute', left: x, top: BAR_Y + (1 - enter) * 40, width: segWNow + (split < 1 && !last ? 1 : 0), height: BAR_H,
            background: S.dark, borderRadius: radius, boxShadow: split > 0.02 || n === 1 ? S.capsuleShadow : 'none', opacity: enter,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ opacity: stepIn, transform: `translateY(${(1 - stepIn) * 18}px)`, textAlign: 'center' }}>
              {stepLines[i].map((l, li) => <div key={li} style={{ ...textBase(stepSize, 400, S.display), color: '#fff' }}>{l}</div>)}
            </div>
          </div>;
        })}
        {/* 裂开前：一整条的阴影与整句（裂开瞬间淡出） */}
        <div style={{ position: 'absolute', left: X0, top: BAR_Y + (1 - enter) * 40, width: W, height: BAR_H, borderRadius: BAR_H / 2,
          boxShadow: S.capsuleShadow, opacity: enter * (1 - clamp(split * 4)), zIndex: -1 }} />
        <div style={{ position: 'absolute', left: X0, top: BAR_Y + (1 - enter) * 40, width: W, height: BAR_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: enter * (1 - taskOut) }}>
          <span style={{ ...textBase(taskSize, 400, S.display), color: '#fff' }}>
            {pre}{hl && <span style={{ color: S.accentDark }}>{c.highlight}</span>}{post}
          </span>
        </div>
        {roles.map((r, i) => {
          const a = toolAt(i);
          const s = springAt(t, a, 0.6);
          const v = p(t, a, a + 0.45);
          const x = X0 + i * (segW + GAP) + 28;
          return <div key={i} style={{ position: 'absolute', left: x, top: toolY + (1 - v) * 90, width: cardW, height: cardH, zIndex: -1,
            background: '#fff', borderRadius: S.radius, boxShadow: S.shadow, opacity: v,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, paddingTop: TUCK }}>
            <Img src={staticFile(r.logo)} style={{ width: logo, height: logo, objectFit: 'contain', transform: `scale(${mix(0.7, 1, s)})` }} />
            <span style={{ ...textBase(nameSize, 900), color: S.ink }}>{r.tool}</span>
          </div>;
        })}
      </div>
    </Handoff>
    <Sfx name="pop" at={0.02} />
    <Sfx name="slide" at={splitAt} />
    <Sfx name="pop" at={toolAt(0)} />
    <Sfx name="ding" at={toolAt(n - 1) + 0.35} />
  </Frame>;
}
