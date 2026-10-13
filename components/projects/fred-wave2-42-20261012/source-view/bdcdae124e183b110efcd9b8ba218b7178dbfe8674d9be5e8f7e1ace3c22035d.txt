// T02f-BlurList：虚化界面上点出几种方式（升级自 X006 三项清单）
// 观众要看懂的变化：真实界面虚化退后 → 前景逐行点出几种方式
// 原版动作（RebuiltX006.tsx + X006.json）：工作流界面 blur 12 + scale 1.12 作为背景；紫色序号“1、2、3、”先在，
// 白色标签每行分 4–6 组逐组点亮（组间 2–4 帧@30），行首 48/71/96f@30；文字投影 8px 8px 6px #000。
// 升级：背景换成真实截图（props，可换图片或视频），开场先给 0.25s 清晰界面再退后（黑蒙 + 失焦 + 轻放大）；
// 项数 2–5，字号按行数和最长标签自适应；同组标签共用左边界（原版第三行左移的错位不保留）。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Sfx, textBase, useT } from '../kit/ui';

export type BlurListProps = HandoffProps & {
  background: string;   // 真实界面截图/录屏（public 相对路径）
  items: string[];      // 2–5 种方式
  dim?: number;         // 黑蒙强度，默认 .6；浅色截图可调到 .68 让白字更稳
  cues?: number[];      // [i] = 第 i 行开始点亮（秒）
};

export const blurListDefaults: BlurListProps = {
  background: 'media/w3-flova-canvas.png',
  items: ['文生视频', '图生视频', '参考图生视频'],
};

// 每行分几组点亮：短词逐字，长词 6 组（X006：4 字 4 组、6 字 6 组）
const groupsOf = (n: number) => Math.min(n, n <= 4 ? 4 : 6);

export function BlurList(props: Partial<BlurListProps>) {
  const c = { ...blurListDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 5);
  const n = Math.max(1, items.length);

  // ---- 背景退后：先看清 0.25s，再黑蒙 + 失焦 + 轻放大 ----
  const recede = q(t, 0.25, 0.95);

  // ---- 排版：行距按行数，字号再受最长一行宽度约束 ----
  const pitch = Math.min(246, 820 / n);
  const numUnit = textWidth(`${n}、`, 1) + 0.18;               // 序号列（含间隙）
  const labelUnit = Math.max(...items.map((s) => textWidth(s, 1)));
  const size = Math.min(184, pitch * 0.74, 1560 / (numUnit + labelUnit * 0.96));
  const labelSize = size * 0.96;
  const blockW = size * numUnit + labelSize * labelUnit;
  const left = Math.max(150, 960 - blockW / 2 - 20);
  const top0 = 540 - (pitch * (n - 1) + size) / 2 + 10;

  // ---- 时间：序号先就位，标签按口播逐行点亮 ----
  const gap = Math.min(0.8, 2.5 / Math.max(1, n - 1));
  const rowAt = items.map((_, i) => cueAt(c.cues, i, 1.05 + i * gap));

  const shadow = S.textShadowDark;
  return <Frame dark>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, filter: `blur(${16 * recede}px)`, transform: `scale(${1 + 0.06 * recede})`, transformOrigin: '45% 47%' }}>
        <Media src={c.background} box={{ x: 0, y: 0, w: 1920, h: 1080 }} radius={0} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: (c.dim ?? 0.6) * recede }} />

      {items.map((label, i) => {
        const y = top0 + i * pitch;
        const numIn = p(t, 0.4 + i * 0.08, 0.75 + i * 0.08);
        const chars = Array.from(label);
        const g = groupsOf(chars.length);
        return <React.Fragment key={i}>
          <div style={{ ...textBase(size, 900), position: 'absolute', left: left + (1 - numIn) * -24, top: y, lineHeight: 1,
            color: accentOn(true), textShadow: shadow, opacity: numIn }}>{i + 1}、</div>
          <div style={{ ...textBase(labelSize, 900), position: 'absolute', left: left + size * numUnit, top: y + (size - labelSize) * 0.5, lineHeight: 1,
            color: '#fff', textShadow: shadow }}>
            {chars.map((ch, j) => {
              const k = Math.min(g - 1, Math.floor((j / chars.length) * g));
              const at = rowAt[i] + k * 0.085;
              return <span key={j} style={{ opacity: clamp((t - at) / 0.12) }}>{ch}</span>;
            })}
          </div>
        </React.Fragment>;
      })}
    </Handoff>
    {n <= 3 && <Sfx name="whoosh-short" at={0.25} />}
    {rowAt.map((a, i) => <Sfx key={i} name="pop" at={a} />)}
  </Frame>;
}
