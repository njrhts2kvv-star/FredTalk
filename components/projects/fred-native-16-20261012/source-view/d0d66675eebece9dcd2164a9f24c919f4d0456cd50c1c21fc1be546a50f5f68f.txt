// T05b 以前 vs 现在：旧做法的一串步骤堆起来，被压成一叠退到左侧；现在的一句话做法接管中心。
// 关系：以前的 N 步（同一组卡片）→ 压缩成一叠变暗退后（保留身份作对照）→ 黑胶囊里的新做法成为阅读焦点。
import React from 'react';
import { S, clamp, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Sfx, center, textBase, useT } from '../kit/ui';

export type BeforeNowProps = {
  beforeLabel: string;
  beforeSteps: string[];   // 建议 3–5 步
  nowLabel: string;
  nowText: string;
  highlight: string;       // nowText 中要染紫的关键词（深底 #D6BEFF）
};

export const beforeNowDefaults: BeforeNowProps = {
  beforeLabel: '以前',
  beforeSteps: ['打开 PS 找模板', '一张张抠图换背景', '手动调色、对齐尺寸', '导出再压缩上传', '改一处，全部重来'],
  nowLabel: '现在',
  nowText: '一句话让豆包直接出图',
  highlight: '一句话',
};

const CARD_W = 960;
const CARD_X = 620;          // 步骤卡左缘（建立阶段）
const PILE = { cx: 340, cy: 585, scale: 0.46, step: 24 };   // 压成一叠后的位置、缩放、每张露边
const NOW = { left: 640, right: 1830, cy: 560 };

// 一行放得下（字号 ≥ 84）就一行；否则在最均衡处（优先标点后）断成两行
function fitLines(text: string, maxW: number, maxSize: number) {
  const one = Math.min(maxSize, maxW / Math.max(1, textWidth(text, 1)));
  if (one >= 84) return { lines: [text], size: one };
  const chars = Array.from(text);
  let best = { cost: Infinity, at: Math.ceil(chars.length / 2) };
  for (let i = 2; i < chars.length - 1; i++) {
    const a = chars.slice(0, i).join(''), b = chars.slice(i).join('');
    const bonus = /[，,、：:；; ]/.test(chars[i - 1]) ? 0.82 : 1;
    const cost = Math.max(textWidth(a, 1), textWidth(b, 1)) * bonus;
    if (cost < best.cost) best = { cost, at: i };
  }
  const lines = [chars.slice(0, best.at).join('').trim(), chars.slice(best.at).join('').trim()];
  return { lines, size: Math.min(maxSize, maxW / Math.max(...lines.map((l) => textWidth(l, 1)))) };
}

// 按字符位置染紫：返回带高亮的一行
function HighlightLine({ line, offset, from, to }: { line: string; offset: number; from: number; to: number }) {
  const chars = Array.from(line);
  return <>{chars.map((ch, k) => {
    const idx = offset + k;
    return <span key={k} style={idx >= from && idx < to ? { color: S.accentDark } : undefined}>{ch}</span>;
  })}</>;
}

export function BeforeNow(props: Partial<BeforeNowProps>) {
  const c = { ...beforeNowDefaults, ...props };
  const t = useT();
  const steps = c.beforeSteps.slice(0, 6);
  const n = Math.max(1, steps.length);

  // —— 建立：步骤卡快速堆起（总长约 1.1s，步数多时间隔更短）——
  const gapT = Math.min(0.24, 0.95 / n);
  const cardH = n <= 4 ? 128 : n === 5 ? 112 : 96;
  const gapY = n <= 4 ? 26 : 20;
  const listH = n * cardH + (n - 1) * gapY;
  const listTop = 540 - listH / 2 + 10;
  const stepSize = Math.min(cardH * 0.46, ...steps.map((s) => (CARD_W - 190) / Math.max(1, textWidth(s, 1))));

  // —— 压缩退后 ——
  const squeeze = p(t, 1.75, 2.4);
  const dim = q(t, 1.9, 2.5);

  // —— 现在：黑胶囊接管 ——
  const nowOpen = p(t, 2.3, 3.0);
  const nowGrow = p(t, 2.3, 2.62);
  const textIn = p(t, 2.62, 3.05);
  const maxW = NOW.right - NOW.left;
  const fit = fitLines(c.nowText, maxW - 200, 118);
  const nowSize = fit.size;
  const capH = Math.round(nowSize * (fit.lines.length === 1 ? 2.15 : 3.5));
  const capW = Math.min(maxW, Math.max(...fit.lines.map((l) => textWidth(l, nowSize))) + 200);
  const capR = Math.min(capH / 2, 110);
  const capCx = (NOW.left + NOW.right) / 2;
  const w = mix(capH * 0.35, capW, nowOpen);
  const h = mix(capH * 0.35, capH, nowGrow);
  const hlFrom = c.highlight ? Array.from(c.nowText).length - Array.from(c.nowText.slice(Math.max(0, c.nowText.indexOf(c.highlight)))).length : -1;
  const hl = c.highlight && c.nowText.includes(c.highlight) ? [hlFrom, hlFrom + Array.from(c.highlight).length] : [-1, -1];
  let offset = 0;
  const lineOffsets = fit.lines.map((l) => { const o = c.nowText.indexOf(l, offset); offset = o + l.length; return Array.from(c.nowText.slice(0, o)).length; });

  // 标签：以前（跟随卡组）/ 现在（胶囊左上）
  const beforeLabelSize = mix(104, 64, squeeze);
  const labelX = mix(CARD_X - 70 - textWidth(c.beforeLabel, 104), PILE.cx - (CARD_W * PILE.scale) / 2 + 12, squeeze);
  const labelY = mix(listTop - 4, NOW.cy - capH / 2 - 104, squeeze);
  const labelIn = p(t, 0, 0.35);

  return <Frame>
    {/* 以前：标签 */}
    <div style={{
      ...textBase(beforeLabelSize, 900), position: 'absolute', left: labelX, top: labelY,
      color: S.ink, opacity: labelIn * mix(1, 0.42, dim), transform: `translateY(${(1 - labelIn) * 20}px)`,
    }}>{c.beforeLabel}</div>

    {/* 以前：步骤卡 → 一叠 */}
    {steps.map((s, i) => {
      const enter = p(t, 0.08 + i * gapT, 0.08 + i * gapT + 0.38);
      const listCx = CARD_X + CARD_W / 2, listCy = listTop + i * (cardH + gapY) + cardH / 2;
      // 一叠：后面的卡在上方露出边缘，最后一步在最前面
      const pileCy = PILE.cy + ((n - 1) / 2 - (n - 1 - i)) * PILE.step;
      const back = n - 1 - i;   // 0 = 最前一张
      const rot = (back === 0 ? 0 : (back % 2 ? -1 : 1) * (2.4 + back * 0.9)) * squeeze;
      const cx = mix(listCx, PILE.cx, squeeze), cy = mix(listCy, pileCy, squeeze);
      const sc = mix(1, PILE.scale, squeeze) * mix(0.96, 1, enter);
      const front = i === n - 1;
      return <div key={i} style={{
        position: 'absolute', left: cx - CARD_W / 2, top: cy - cardH / 2 + (1 - enter) * 46, width: CARD_W, height: cardH,
        transform: `scale(${sc}) rotate(${rot}deg)`, transformOrigin: '50% 50%',
        background: '#fff', borderRadius: S.radius, boxShadow: S.shadow, opacity: enter * mix(1, 0.62, dim),
        display: 'flex', alignItems: 'center', paddingLeft: 56, gap: 34, overflow: 'hidden', zIndex: 10 + i,
      }}>
        <span style={{ ...textBase(stepSize, 900), color: S.faint, width: stepSize * 0.9, textAlign: 'center', opacity: front ? 1 : 1 - squeeze }}>{i + 1}</span>
        <span style={{ ...textBase(stepSize, i === n - 1 ? mix(500, 900, squeeze) : 500), color: mix(0, 1, dim) > 0.5 ? S.muted : S.ink, opacity: front ? 1 : 1 - squeeze }}>{s}</span>
      </div>;
    })}
    {/* 现在：标签 + 黑胶囊 */}
    <div style={{
      ...textBase(64, 900), position: 'absolute', left: capCx - capW / 2 + 12, top: NOW.cy - capH / 2 - 104,
      color: S.ink, opacity: textIn, transform: `translateY(${(1 - textIn) * 16}px)`,
    }}>{c.nowLabel}</div>
    <div style={{
      position: 'absolute', left: capCx - w / 2, top: NOW.cy - h / 2, width: w, height: h, borderRadius: Math.min(h / 2, capR),
      background: S.dark, boxShadow: S.capsuleShadow, opacity: clamp(nowGrow * 3), overflow: 'hidden', ...center, zIndex: 50,
    }}>
      <span style={{
        ...textBase(nowSize, 900), lineHeight: 1.22, color: '#fff', opacity: textIn, textAlign: 'center',
        transform: `translateX(${(1 - textIn) * 24}px)`, clipPath: `inset(0 ${100 * (1 - textIn)}% 0 0)`,
      }}>{fit.lines.map((l, k) => <div key={k}><HighlightLine line={l} offset={lineOffsets[k]} from={hl[0]} to={hl[1]} /></div>)}</span>
    </div>

    <Sfx name="slide" at={0.08} />
    <Sfx name="gather" at={1.75} />
    <Sfx name="pop" at={2.3} />
  </Frame>;
}
