// T01f-DotToLine：圆点胀成关键句胶囊（快过渡）
// 观众要看懂的变化：一个点 → 长成一句关键句胶囊
// 升级自 L81-T03：保留“圆点长成圆 → 横向展开带一次过冲 → 字分组亮起”的节奏形态；
// 实测轨迹（T03.json pill）：0→42f 长成 326 圆、末段微回缩；47f 起横向展开，~80f 冲到 1524，97f 回落到 1462 停稳。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
// 字体：沿 T03 原版用 MiSans Heavy 900（产品名、数字更好认）。
import React from 'react';
import { S, accentOn, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, textBase, useT } from '../kit/ui';

export type DotToLineProps = HandoffProps & {
  text: string;       // 关键句；太长会自动折成两行（也可用 \n 指定断行）
  highlight: string;  // 句中染紫的一处关键词（黑胶囊上用 #D6BEFF）；留空则不染
  cues?: number[];    // 口播时间点（秒，场景内）：[0]=圆点出现，[1]=横向展开成句
};

export const dotToLineDefaults: DotToLineProps = {
  text: '把声音留成记忆',
  highlight: '记忆',
};

// 先冲过目标一点、再回落（T03 实测：过冲约为展开量的 5.5%）
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

// 均衡断行：不在标点前断，优先在标点/空格后断；行尾标点不上屏（大字惯例）
const PUNCT = /[，,、。：:；;！!？?]/;
const trimEnd = (l: string) => l.trim().replace(/[，,、。：:；;]+$/, '');
const splitTwo = (s: string): string[] => {
  if (s.includes('\n')) return s.split('\n').slice(0, 2).map(trimEnd);
  const chars = Array.from(s);
  const total = textWidth(s, 1);
  let best = Math.ceil(chars.length / 2), bestScore = Infinity, acc = 0;
  for (let i = 1; i < chars.length; i++) {
    acc += textWidth(chars[i - 1], 1);
    if (PUNCT.test(chars[i])) continue;
    const soft = /[，,、：:；; ]/.test(chars[i - 1]) ? -1.6 : 0;
    const score = Math.abs(acc - total / 2) + soft;
    if (score < bestScore) { bestScore = score; best = i; }
  }
  return [trimEnd(chars.slice(0, best).join('')), trimEnd(chars.slice(best).join(''))];
};

const MAX_W = 1640;   // 胶囊最大宽（含两端圆头；过冲 5.5% 后仍留边）
const PAD = 1.3;      // 胶囊两端留白（以字号计）

export function DotToLine(props: Partial<DotToLineProps>) {
  const c = { ...dotToLineDefaults, ...props };
  const t = useT();

  // ---- 版式：按真实字宽算字号，一行放不下（< 112px）就折成两行 ----
  let lines = c.text.includes('\n') ? splitTwo(c.text) : [c.text];
  const widest = (ls: string[]) => Math.max(...ls.map((l) => textWidth(l, 1)));
  // 单行：两端各留 0.65 字；两行：圆头更大，两端按胶囊高度留白
  const fit1 = (ls: string[]) => Math.min(165, MAX_W / (widest(ls) + PAD));
  const fit2 = (ls: string[]) => Math.min(132, MAX_W / (widest(ls) + 3.22 * 0.72));
  let size = lines.length > 1 ? fit2(lines) : fit1(lines);
  if (lines.length === 1 && size < 112 && Array.from(c.text).length > 3) { lines = splitTwo(c.text); size = fit2(lines); }
  const two = lines.length > 1;
  const H = two ? size * 1.16 * 2 + size * 0.9 : size * 2.1;
  const W = Math.max(H * 1.9, widest(lines) * size + (two ? H * 0.72 : PAD * size));
  const D = Math.min(330, H * 0.92);   // 圆的直径：略小于最终高度，展开时高度再长一点（T03：326→358）

  // ---- 时间 ----
  const a0 = cueAt(c.cues, 0, 0.03);   // 圆点出现
  const a1 = cueAt(c.cues, 1, Math.max(a0 + 0.62, 0.72)); // 横向展开
  const grow = overshoot(t, a0, 0.56, 0.14, 0.03);
  const open = overshoot(t, a1, 0.55, 0.3, 0.055);
  const tall = p(t, a1, a1 + 0.8);
  const w = mix(D * grow, W, open);
  const h = mix(D * grow, H, tall);
  const textAt = a1 + 0.34;

  // 逐字亮起（T03：8 组依次显隐），左到右
  const chars = lines.map((l) => Array.from(l));
  const total = chars.reduce((n, l) => n + l.length, 0);
  const step = Math.min(0.045, 0.42 / Math.max(1, total));
  const hl = c.highlight && c.text.includes(c.highlight) ? c.highlight : '';
  let k = 0;
  const renderLine = (line: string, li: number) => {
    const arr = Array.from(line);
    // 标出强调词所在的字
    const mark = new Array(arr.length).fill(false);
    if (hl) {
      const at = line.indexOf(hl);
      if (at >= 0) { const s0 = Array.from(line.slice(0, at)).length; for (let i = 0; i < Array.from(hl).length; i++) mark[s0 + i] = true; }
    }
    return <div key={li} style={{ ...textBase(size, 900, S.body), color: '#fff', textAlign: 'center' }}>
      {arr.map((ch, i) => {
        const i0 = k++;
        const o = p(t, textAt + i0 * step, textAt + i0 * step + 0.22);
        return <span key={i} style={{ opacity: o, color: mark[i] ? accentOn(true) : '#fff' }}>{ch}</span>;
      })}
    </div>;
  };

  const visible = t >= a0;
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {visible && <Pill box={{ x: 960 - w / 2, y: 540 - h / 2, w, h }}>
        <div style={{ position: 'absolute', left: w / 2 - W / 2, top: h / 2 - H / 2, width: W, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {two && chars.length ? lines.map(renderLine) : renderLine(lines[0], 0)}
        </div>
      </Pill>}
    </Handoff>
    <Sfx name="pop" at={a0} />
    <Sfx name="slide" at={a1} />
  </Frame>;
}
