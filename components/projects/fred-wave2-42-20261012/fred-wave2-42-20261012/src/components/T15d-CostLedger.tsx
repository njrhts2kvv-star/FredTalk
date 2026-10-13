// T15d-CostLedger：成本账单逐行累计
// 观众要看懂的变化：一项项费用 → 累计成合计
// 关系：一张账单卡，费用一行行记上去；每记一行，这一行的金额（紫色副本）落进底部黑色合计栏，合计数随之加上去；
//       最后一笔加完，合计落定。方向是“分项 → 汇总”，和 L81-R005（总数拆成几份）相反；
//       和 T14c（单个价格逐位滚动）不同：这里的数字变化来自一笔笔加进来的账。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, Surface, textBase, useT } from '../kit/ui';

export type LedgerItem = { label: string; detail?: string; amount: number };
export type CostLedgerProps = HandoffProps & {
  caption?: string;        // 这张账单算的是什么（卡片左上一行，可空）
  items: LedgerItem[];     // 2–7 行
  prefix: string;          // 货币符号
  decimals: number;
  totalLabel: string;      // 例：合计
  totalUnit?: string;      // 合计后面的小字（例：/ 次、/ 月），可空
  cues?: number[];         // [i]=第 i 行记上去的时间（秒）；不传按默认节奏
};

// 真实单价：GPT-6.1 Sol 输入 $2.00、缓存输入 $0.10、输出 $10.00 / 百万 token（ep107 models.png）；token 用量是一次长任务的示例量
export const costLedgerDefaults: CostLedgerProps = {
  caption: 'GPT-6.1 Sol 跑一次长任务',
  items: [
    { label: '输入', detail: '120 万 token × $2.00', amount: 2.4 },
    { label: '缓存输入', detail: '600 万 token × $0.10', amount: 0.6 },
    { label: '输出', detail: '18 万 token × $10.00', amount: 1.8 },
  ],
  prefix: '$',
  decimals: 2,
  totalLabel: '合计',
  totalUnit: '/ 次',
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

export function CostLedger(props: Partial<CostLedgerProps>) {
  const c = { ...costLedgerDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 7);
  const n = Math.max(1, items.length);
  const money = (v: number) => `${c.prefix}${fmt(v, c.decimals)}`;
  const total = items.reduce((a, it) => a + it.amount, 0);

  // —— 排版 ——
  const dense = n > 4;                 // 行多时收紧边距、合计栏，卡片可以更高
  const PAD = dense ? 56 : 72;
  const capSize = dense ? 44 : 50;
  const capH = c.caption ? capSize * 1.3 + 26 : 0;
  const totalH = dense ? 156 : 186;
  const rowH = Math.min(176, ((dense ? 960 : 900) - 2 * PAD - capH - totalH - 36) / n);
  const hasDetail = items.some((it) => it.detail) && rowH >= 104;
  const labelSize = Math.min(68, rowH * (hasDetail ? 0.4 : 0.5));
  const detailSize = Math.round(labelSize * 0.68);
  const amtSize = Math.min(82, rowH * 0.48);
  const leftW = Math.max(...items.map((it) => Math.max(textWidth(it.label, labelSize), hasDetail && it.detail ? textWidth(it.detail, detailSize) : 0)), c.caption ? textWidth(c.caption, capSize) : 0);
  const amtW = Math.max(...items.map((it) => numWidth(money(it.amount), amtSize)));
  const totalSize = dense ? 96 : 112;
  const totalW = numWidth(money(total), totalSize) + (c.totalUnit ? textWidth(c.totalUnit, 44) + 22 : 0);
  const cardW = clamp(Math.max(leftW + amtW + 160, textWidth(c.totalLabel, 72) + totalW + 140) + 2 * PAD, 1240, 1640);
  const cardH = 2 * PAD + capH + n * rowH + 36 + totalH;
  const cardY = (1080 - cardH) / 2 + 12;
  // 卡片顶边高到角标那一带时，整体左移让开右上角标（x ≥ 1549）
  const cardX = cardY < 130 ? Math.min((1920 - cardW) / 2, 1530 - cardW) : (1920 - cardW) / 2;
  const rowsTop = cardY + PAD + capH;
  const barBox = { x: cardX + 28, y: cardY + cardH - 28 - totalH, w: cardW - 56, h: totalH };
  const totalRight = barBox.x + barBox.w - 64 - (c.totalUnit ? textWidth(c.totalUnit, 44) + 22 : 0);
  const totalCy = barBox.y + totalH / 2;

  // —— 时间线：每行记上 → 0.3s 后金额副本飞入合计栏 → 合计数加上去 ——
  const gap = Math.min(0.9, 2.5 / n);
  const addAt = (i: number) => cueAt(c.cues, i, 0.55 + i * gap);
  const flyAt = (i: number) => addAt(i) + 0.32;
  const FLY = 0.42;
  const countAt = (i: number) => flyAt(i) + FLY - 0.08;
  const COUNT = 0.36;
  const lastLand = countAt(n - 1) + COUNT;
  const cardIn = p(t, 0, 0.45);
  const settle = springAt(t, lastLand, 0.6);
  const final = p(t, lastLand, lastLand + 0.35);
  const running = items.reduce((a, it, i) => a + it.amount * p(t, countAt(i), countAt(i) + COUNT), 0);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 40}px)` }}>
        <Surface box={{ x: cardX, y: cardY, w: cardW, h: cardH }} />
        {c.caption && <div style={{ position: 'absolute', left: cardX + PAD, top: cardY + PAD - 8, ...textBase(capSize, 500), color: S.muted }}>{c.caption}</div>}

        {items.map((it, i) => {
          const a = p(t, addAt(i), addAt(i) + 0.42);
          const y = rowsTop + i * rowH;
          const lift = 1 - p(t, flyAt(i), flyAt(i) + 0.3);   // 记上那一下金额是墨色，副本飞走后略退
          return <div key={i} style={{ position: 'absolute', left: cardX + PAD, top: y, width: cardW - 2 * PAD, height: rowH, opacity: a, transform: `translateY(${(1 - a) * -26}px)` }}>
            <div style={{ position: 'absolute', left: 0, top: hasDetail && it.detail ? rowH / 2 - (labelSize * 1.16 + detailSize * 1.2 + 6) / 2 : (rowH - labelSize * 1.16) / 2 }}>
              <div style={{ ...textBase(labelSize, 500), color: S.ink }}>{it.label}</div>
              {hasDetail && it.detail && <div style={{ ...textBase(detailSize, 500), color: S.muted, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{it.detail}</div>}
            </div>
            <div style={{ position: 'absolute', right: 0, top: (rowH - amtSize) / 2, opacity: mix(0.7, 1, lift) }}><Num text={money(it.amount)} size={amtSize} color={S.ink} /></div>
          </div>;
        })}

        {/* 合计栏 */}
        <Surface dark box={barBox} shadow={S.capsuleShadow} />
        <div style={{ position: 'absolute', left: barBox.x + 64, top: totalCy - 72 * 0.58, ...textBase(72, 400, S.display), color: '#fff', lineHeight: 1.16 }}>{c.totalLabel}</div>
        <div style={{
          position: 'absolute', left: totalRight - numWidth(money(running), totalSize), top: totalCy - totalSize / 2,
          transform: `scale(${1 + (1 - settle) * 0.05 * (t >= lastLand ? 1 : 0)})`, transformOrigin: '100% 50%',
        }}><Num text={money(running)} size={totalSize} color={mixColor('#ffffff', S.accentDark, final)} /></div>
        {c.totalUnit && <div style={{ position: 'absolute', left: totalRight + 22, top: totalCy + totalSize * 0.5 - 44 * 1.16, ...textBase(44, 500), color: S.faint }}>{c.totalUnit}</div>}
      </div>

      {/* 每行金额的紫色副本：从行尾落进合计栏 */}
      {items.map((it, i) => {
        const f = q(t, flyAt(i), flyAt(i) + FLY);
        if (f <= 0 || f >= 1) return null;
        const w = numWidth(money(it.amount), amtSize);
        const sx = cardX + cardW - PAD - w, sy = rowsTop + i * rowH + (rowH - amtSize) / 2;
        const ex = totalRight - w * 0.8, ey = totalCy - amtSize * 0.4;
        return <div key={i} style={{
          position: 'absolute', left: mix(sx, ex, f), top: mix(sy, ey, f), opacity: clamp((1 - f) * 4) * clamp(f * 6),
          transform: `scale(${mix(1, 0.8, f)})`, transformOrigin: '0 0',
        }}><Num text={money(it.amount)} size={amtSize} color={ey + amtSize * 0.4 - mix(sy, ey, f) < totalH / 2 + 10 ? S.accentDark : S.accent} /></div>;
      })}
    </Handoff>
    <Sfx name="whoosh-short" at={0.02} />
    {items.map((_, i) => <Sfx key={i} name="scroll" at={countAt(i)} duration={Math.round(COUNT * 60)} />)}
    <Sfx name="ding" at={lastLand} duration={90} />
  </Frame>;
}
