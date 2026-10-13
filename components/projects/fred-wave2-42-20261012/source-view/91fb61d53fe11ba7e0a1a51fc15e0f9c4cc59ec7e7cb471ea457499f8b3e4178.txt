// T15a-ScoreBars：跑分条形图：条依次长出，主角高亮
// 观众要看懂的变化：几个对象 → 按分数长出条形，主角被点亮
// 关系：横向条从同一条起跑线依次长出（读数跟着条走）→ 全部长完后，其他条退成淡灰，主角那条染紫、读数放大。
//       和 T14a（两条同时赛跑、按时间停表）、L81-B062（两根竖柱对照）不是同一动作：这里是多对象排名＋点亮主角。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type ScoreItem = { label: string; value: number };
export type ScoreBarsProps = HandoffProps & {
  items: ScoreItem[];     // 2–8 项，按给定顺序从上到下
  highlight: number;      // 主角在 items 里的序号
  decimals: number;
  prefix: string;
  suffix: string;         // 例：%、分
  max?: number;           // 条形满格对应的数；不传取最大值（零起点，条长与数值成正比）
  caption?: string;       // 数据出处一行（放在图下方，弱化），可空
  cues?: number[];        // [0]=第一条开始长，[1]=主角点亮
};

// 真实跑分：DeepSWE v1.1 各模型最高得分（ep107 deepswe.png 折线读数：6.1 Sol 75.4%、6 Astra 74.3%、6 Sol 69.0%）
export const scoreBarsDefaults: ScoreBarsProps = {
  items: [
    { label: 'GPT-6.1 Sol', value: 75.4 },
    { label: 'GPT-6 Astra', value: 74.3 },
    { label: 'GPT-6 Sol', value: 69.0 },
  ],
  highlight: 0,
  decimals: 1,
  prefix: '',
  suffix: '%',
  caption: 'DeepSWE v1.1 最高得分',
};

const fmt = (v: number, d: number) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const glyph = (ch: string) => (/\d/.test(ch) ? 0.6 : /[.,:]/.test(ch) ? 0.3 : ch === '%' ? 0.86 : ch === ' ' ? 0.28 : /[\u0000-ÿ]/.test(ch) ? 0.62 : 1);
const numWidth = (s: string, size: number) => Array.from(s).reduce((w, ch) => w + glyph(ch) * size, 0);
function Num({ text, size, color }: { text: string; size: number; color: string }) {
  return <span style={{ ...textBase(size, 900), lineHeight: 1, display: 'inline-flex', color, fontVariantNumeric: 'tabular-nums' }}>
    {Array.from(text).map((ch, i) => <span key={i} style={{ display: 'inline-block', width: glyph(ch) * size, textAlign: 'center' }}>{ch}</span>)}
  </span>;
}
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixColor = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], t))).join(',')})`; };

const LEFT = 150, RIGHT = 1770;

export function ScoreBars(props: Partial<ScoreBarsProps>) {
  const c = { ...scoreBarsDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 8);
  const n = Math.max(1, items.length);
  const hi = clamp(Math.round(c.highlight), 0, n - 1);
  const str = (v: number) => `${c.prefix}${fmt(v, c.decimals)}${c.suffix}`;
  const top = Math.max(...items.map((it) => it.value), 1e-9);
  const max = c.max ?? top;   // 默认最长的一条占满：条长仍与数值成正比（零起点）

  // —— 排版：行高按项数，标签列按最长标签 ——
  const capH = c.caption ? 90 : 0;
  const rowH = Math.min(190, (800 - capH) / n);
  const barH = Math.round(rowH * 0.52);
  let labelSize = Math.min(72, rowH * 0.4);
  const longest = Math.max(...items.map((it) => textWidth(it.label, 1)));
  while (labelSize > 40 && longest * labelSize > 560) labelSize -= 2;
  const labelCol = longest * labelSize;
  const valSize = Math.min(84, rowH * 0.46);
  const valCol = Math.max(...items.map((it) => numWidth(str(it.value), valSize * 1.12)));
  const barX = LEFT + labelCol + 48;
  const barMax = RIGHT - barX - valCol * 1.12 - 34;   // 主角读数放大 12% 后仍不出画
  const blockH = n * rowH + capH;
  const y0 = (1080 - blockH) / 2 + 10;

  // —— 时间线：条与条错开 0.34 秒，每条 0.95 秒长完 ——
  const growAt = cueAt(c.cues, 0, 0.3);
  const gap = Math.min(0.34, 1.6 / n);
  const growDur = 0.95;
  const growEnd = growAt + (n - 1) * gap + growDur;
  const lightAt = cueAt(c.cues, 1, growEnd + 0.35);
  const light = p(t, lightAt, lightAt + 0.5);
  const pulse = springAt(t, lightAt, 0.6);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {items.map((it, i) => {
        const enter = p(t, 0.02 + i * 0.06, 0.4 + i * 0.06);
        const g = p(t, growAt + i * gap, growAt + i * gap + growDur);
        const isHi = i === hi;
        const fade = isHi ? 0 : light;                       // 非主角退后
        const w = Math.max(barH, barMax * clamp(it.value / max) * g);
        const y = y0 + i * rowH;
        const barColor = isHi ? mixColor(S.ink, S.accent, light) : mixColor(S.ink, S.faint, fade);
        const textColor = isHi ? S.ink : mixColor(S.ink, S.faint, fade);
        const vColor = isHi ? mixColor(S.ink, S.accent, light) : textColor;
        const vs = isHi ? 1 + 0.12 * light + (1 - pulse) * 0.03 * (light > 0 ? 1 : 0) : 1;
        return <div key={i} style={{ position: 'absolute', left: 0, top: y, width: 1920, height: rowH, opacity: enter, transform: `translateX(${(1 - enter) * -40}px)` }}>
          <div style={{ position: 'absolute', left: LEFT + labelCol - textWidth(it.label, labelSize), top: (rowH - labelSize * 1.16) / 2, ...textBase(labelSize, 900), color: textColor }}>{it.label}</div>
          <div style={{ position: 'absolute', left: barX, top: (rowH - barH) / 2, width: w, height: barH, borderRadius: barH / 2, background: barColor, opacity: g > 0 ? mix(1, 0.45, fade) : 0 }} />
          <div style={{
            position: 'absolute', left: barX + w + 30, top: (rowH - valSize) / 2, opacity: clamp(g * 3),
            transform: `scale(${vs})`, transformOrigin: '0% 50%',
          }}><Num text={str(it.value * g)} size={valSize} color={vColor} /></div>
        </div>;
      })}
      {c.caption && <div style={{
        position: 'absolute', left: barX, top: y0 + n * rowH + 34, ...textBase(42, 500), color: S.muted, opacity: q(t, 0.2, 0.7),
      }}>{c.caption}</div>}
    </Handoff>
    <Sfx name="scroll" at={growAt} duration={Math.round((growEnd - growAt) * 60)} />
    <Sfx name="ding" at={lightAt} duration={90} />
  </Frame>;
}
