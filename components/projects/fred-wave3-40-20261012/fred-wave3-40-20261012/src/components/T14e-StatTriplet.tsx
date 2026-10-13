// T14e-StatTriplet：三个关键数字
// 观众要看懂的变化：几项指标 → 数字同时滚动、依次落定成一排
// 关系：2–4 张数字卡同时从底下升起并同时开始滚动，按口播顺序依次停稳（每张停下时自己轻轻一弹）；
//       最后主角卡变黑、放大一点，数字染紫。和 T14c（单个数字逐位滚动＋划掉旧价）不同：这里是一排并列指标的“一屏总结”。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, Surface, textBase, useT } from '../kit/ui';

export type Stat = {
  label: string;      // 指标名（卡片上方）
  value: number;
  decimals?: number;
  prefix?: string;    // 数字前缀，例：$
  suffix?: string;    // 数字后缀，例：%
  unit?: string;      // 单位小字（卡片下方），可空
};
export type StatTripletProps = HandoffProps & {
  stats: Stat[];      // 2–4 项
  hero: number;       // 主角卡序号（最后放大、变黑）
  cues?: number[];    // [0]=数字开始滚动；[1]=主角卡放大
};

// 真实素材：FredTalk 107 期 models.png（OpenAI GPT-6.1 Sol 定价卡）：输入 $2.00、输出 $10.00、缓存输入 $0.10。
// 图上只写了 “$ input | $ output | $ cached input”，没有写计价单位；单位“美元 / 百万 token”按该系列 API 的通行计价写出，需要时用 props 改。
export const statTripletDefaults: StatTripletProps = {
  stats: [
    { label: '输入', value: 2, decimals: 2, prefix: '$', unit: '美元 / 百万 token' },
    { label: '输出', value: 10, decimals: 2, prefix: '$', unit: '美元 / 百万 token' },
    { label: '缓存输入', value: 0.1, decimals: 2, prefix: '$', unit: '美元 / 百万 token' },
  ],
  hero: 2,
};

const fmt = (v: number, d: number) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const glyph = (ch: string) => (/\d/.test(ch) ? 0.6 : /[.,:]/.test(ch) ? 0.3 : ch === '%' ? 0.86 : ch === '$' ? 0.62 : ch === ' ' ? 0.28 : /[\u0000-ÿ]/.test(ch) ? 0.62 : 1);
const numWidth = (s: string, size: number) => Array.from(s).reduce((w, ch) => w + glyph(ch) * size, 0);
function Num({ text, size, color }: { text: string; size: number; color: string }) {
  return <span style={{ ...textBase(size, 900), lineHeight: 1, display: 'inline-flex', color, fontVariantNumeric: 'tabular-nums' }}>
    {Array.from(text).map((ch, i) => <span key={i} style={{ display: 'inline-block', width: glyph(ch) * size, textAlign: 'center' }}>{ch}</span>)}
  </span>;
}
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixColor = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], t))).join(',')})`; };

export function StatTriplet(props: Partial<StatTripletProps>) {
  const c = { ...statTripletDefaults, ...props };
  const t = useT();
  const stats = c.stats.slice(0, 4);
  const n = Math.max(1, stats.length);
  const hero = clamp(Math.round(c.hero), 0, n - 1);

  // —— 版式：卡宽按项数；数字字号取全组最小，保证同一组同字号 ——
  const gap = n >= 4 ? 30 : 40;
  const cardW = Math.min(560, (1560 - gap * (n - 1)) / n);
  const cardH = 470;
  const rowW = cardW * n + gap * (n - 1);
  const left0 = 960 - rowW / 2;
  const top0 = 540 - cardH / 2 + 16;
  const str = (s: Stat, v: number) => `${s.prefix ?? ''}${fmt(v, s.decimals ?? 0)}${s.suffix ?? ''}`;
  const widest = Math.max(...stats.map((s) => numWidth(str(s, s.value), 1)));
  const numSize = Math.min(168, (cardW - 70) / Math.max(1, widest));
  const labelSize = Math.min(58, (cardW - 60) / Math.max(1, Math.max(...stats.map((s) => textWidth(s.label, 1)))));
  const unitSize = Math.min(40, (cardW - 50) / Math.max(1, Math.max(...stats.map((s) => textWidth(s.unit ?? '', 1)), 1)));

  // —— 时间线：同时滚动，错开结束 ——
  const rollAt = cueAt(c.cues, 0, 0.6);
  const ends = stats.map((_, i) => rollAt + 1.25 + i * 0.4);
  const lastEnd = Math.max(...ends);
  const heroAt = cueAt(c.cues, 1, lastEnd + 0.4);
  const heroP = springAt(t, heroAt, 0.7);
  const heroQ = q(t, heroAt, heroAt + 0.28);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {stats.map((s, i) => {
        const rise = p(t, 0.04 + i * 0.07, 0.55 + i * 0.07);
        const roll = p(t, rollAt, ends[i]);
        const landed = springAt(t, ends[i] - 0.05, 0.5);
        const isHero = i === hero;
        const dark = isHero ? heroQ : 0;
        const scale = 1 + (isHero ? 0.07 * heroP : 0) + (t >= ends[i] - 0.05 ? 0.035 * (1 - landed) : 0);
        const bg = mixColor('#ffffff', S.dark, dark);
        const ink = mixColor(S.ink, '#ffffff', dark);
        const numColor = isHero ? mixColor(S.ink, S.accentDark, dark) : S.ink;
        const sub = mixColor(S.muted, '#b8b8c0', dark);
        const full = str(s, s.value);
        const fw = numWidth(full, numSize);
        const x = left0 + i * (cardW + gap);
        return <Surface key={i} box={{ x, y: top0 + (1 - rise) * 90, w: cardW, h: cardH }} radius={S.radius}
          style={{ overflow: 'visible', background: bg, color: ink, opacity: rise, transform: `scale(${scale})`, transformOrigin: '50% 60%',
            boxShadow: dark > 0.5 ? S.capsuleShadow : S.shadow, zIndex: isHero ? 3 : 1 }}>
          <div style={{ position: 'absolute', left: 0, top: 54, width: cardW, textAlign: 'center', ...textBase(labelSize, 900), color: ink }}>{s.label}</div>
          <div style={{ position: 'absolute', left: (cardW - fw) / 2, top: cardH / 2 - numSize * 0.5 + 8, width: fw, display: 'flex', justifyContent: 'flex-end' }}>
            <Num text={str(s, s.value * roll)} size={numSize} color={numColor} />
          </div>
          {s.unit && <div style={{ position: 'absolute', left: 0, top: cardH - 40 - unitSize * 1.16 - 14, width: cardW, textAlign: 'center', ...textBase(unitSize, 500), color: sub }}>{s.unit}</div>}
        </Surface>;
      })}
    </Handoff>
    <Sfx name="scroll" at={rollAt} duration={Math.round((lastEnd - rollAt) * 60)} volume={0.4} />
    <Sfx name="pop" at={heroAt} />
  </Frame>;
}
