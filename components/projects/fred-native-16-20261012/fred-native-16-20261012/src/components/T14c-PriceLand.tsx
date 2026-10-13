// T14c 价格落定：大号价格像里程表一样逐位滚到最终值，随后旧价格在旁边被划掉，黑胶囊给出差额。
// 关系：新价格（主体）先落定 → 让出右侧给旧价格对照 → 旧价被划掉退后 → 差额结论接走阅读。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type PriceLandProps = {
  label: string;            // 新价格是什么（例：GPT-6.1 Sol 输出价）
  value: number;            // 新价格数值
  decimals: number;         // 小数位
  prefix: string;           // 货币符号，可为空
  unit: string;             // 单位（例：/ 百万 token）
  compareLabel: string;     // 旧/贵的那一档
  compareValue: number;
  deltaText: string;        // 黑胶囊结论
  deltaKey?: string;        // 胶囊里染紫的关键片段；缺省时自动取数字/百分比
  background?: string | null; // 可选真实截图，作为失焦上下文
};

export const priceLandDefaults: PriceLandProps = {
  label: 'GPT-6.1 Sol 输出价',
  value: 10,
  decimals: 2,
  prefix: '$',
  unit: '/ 百万 token',
  compareLabel: 'GPT-6 Astra',
  compareValue: 50,
  deltaText: '便宜 80%',
  background: null,
};

const fmt = (v: number, d: number) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// 一位里程表数字：只渲染窗口附近的格子，滚动越快越虚
function DigitColumn({ pos, size, cellW }: { pos: number; size: number; cellW: number }) {
  const base = Math.floor(pos);
  const frac = pos - base;
  const H = size;
  const STEP = size * 1.15;           // 相邻数字间距：静止时上下邻位完全藏在窗外
  return <span style={{
    position: 'relative', display: 'inline-block', width: cellW, height: H * 1.24, marginTop: -H * 0.08, overflow: 'hidden', verticalAlign: 'top',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 7%, #000 93%, transparent 100%)',
    maskImage: 'linear-gradient(to bottom, transparent 0%, #000 7%, #000 93%, transparent 100%)',
  }}>
    {[-1, 0, 1, 2].map((k) => {
      const idx = base + k;
      const n = ((idx % 10) + 10) % 10;
      return <span key={k} style={{
        position: 'absolute', left: 0, width: cellW, textAlign: 'center', top: H * 0.12 + (k - frac) * STEP, lineHeight: 1, height: H,
      }}>{n}</span>;
    })}
  </span>;
}

export function PriceLand(props: Partial<PriceLandProps>) {
  const c = { ...priceLandDefaults, ...props };
  const t = useT();

  const text = fmt(c.value, c.decimals);
  const chars = Array.from(text);
  const digitIdx = chars.map((ch, i) => (/\d/.test(ch) ? i : -1)).filter((i) => i >= 0);

  // —— 字号自适应：最终态主价格组（×0.86）不超过 860 宽 ——
  const unitSize = 54;
  const measure = (size: number) => {
    const cellW = size * 0.6;
    const numW = chars.reduce((w, ch) => w + (/\d/.test(ch) ? cellW : size * 0.3), 0);
    const preW = c.prefix ? textWidth(c.prefix, size * 0.5) + size * 0.06 : 0;
    const unitW = c.unit ? textWidth(c.unit, unitSize) + 24 : 0;
    return { cellW, numW, preW, unitW, total: preW + numW + unitW };
  };
  let size = 220;
  while (size > 120 && measure(size).total * 0.86 > 860) size -= 4;
  const m = measure(size);
  const labelW = textWidth(c.label, 56);
  const groupW = Math.max(m.total, labelW);

  // —— 时间线 ——
  const enter = p(t, 0.05, 0.55);
  const rollStart = 0.25;
  const landAt = (i: number) => 1.15 + i * 0.14;                 // 从高位到低位依次落定
  const nD = digitIdx.length;
  const landed = landAt(nD - 1);
  const settle = springAt(t, landed, 0.55);                       // 落定瞬间的轻微顿挫
  const shift = q(t, 2.0, 2.6);                                   // 主价格让位
  const cmp = p(t, 2.1, 2.65);
  const strike = p(t, 2.8, 3.15);
  const delta = p(t, 3.4, 3.85);

  // 主价格组：先居中，再侧移并缩小
  const scale = mix(1, 0.86, shift);
  const groupCx = mix(960, 590, shift);
  const groupCy = mix(520, 470, shift);
  const blockH = 56 * 1.3 + 24 + size * 1.08;

  // 对照卡
  const cmpText = `${c.prefix}${fmt(c.compareValue, c.decimals)}`;
  let cmpSize = 128;
  while (cmpSize > 72 && textWidth(cmpText, cmpSize) > 520) cmpSize -= 4;
  const cmpLabelSize = 46;
  const cardW = Math.max(textWidth(cmpText, cmpSize), textWidth(c.compareLabel, cmpLabelSize)) + 120;
  const cardH = cmpLabelSize * 1.3 + 18 + cmpSize * 1.1 + 100;
  const cardX = mix(1980, 1380 - cardW / 2 + 40, cmp);
  const cardY = 470 - cardH / 2;

  // 胶囊
  const key = c.deltaKey ?? (c.deltaText.match(/[\d.]+\s*[%倍x×]?/)?.[0] ?? '');
  const [dBefore, dAfter] = key && c.deltaText.includes(key) ? [c.deltaText.slice(0, c.deltaText.indexOf(key)), c.deltaText.slice(c.deltaText.indexOf(key) + key.length)] : [c.deltaText, ''];
  const pillSize = 80;
  const pillW = textWidth(c.deltaText, pillSize) + 140;
  const pillH = 150;
  const pillCx = 960;
  const pillY = 770;

  // 每一位的滚动位置
  const posFor = (i: number, d: number) => {
    const spins = 2 + (nD - 1 - i);                               // 低位多转几圈
    const target = spins * 10 + d;
    return p(t, rollStart, landAt(i)) * target;
  };

  // 有真实截图时整屏转深底：截图失焦 + 黑蒙版做上下文；胶囊随之反白
  const dark = !!c.background;
  const fg = dark ? '#fff' : S.ink;
  return <Frame dark={dark}>
    {c.background && <div style={{ position: 'absolute', inset: 0 }}>
      <Img src={staticFile(c.background)} style={{ position: 'absolute', inset: -40, width: 2000, height: 1160, objectFit: 'cover', filter: `blur(${mix(6, 22, enter)}px)` }} />
      <div style={{ position: 'absolute', inset: 0, background: S.dark, opacity: mix(0.4, 0.78, enter) }} />
    </div>}

    {/* 主价格组 */}
    <div style={{
      position: 'absolute', left: groupCx - groupW / 2, top: groupCy - blockH / 2, width: groupW, height: blockH,
      transform: `scale(${scale * mix(0.94, 1, enter)})`, transformOrigin: '50% 50%', opacity: enter,
    }}>
      <div style={{ ...textBase(56, 500), color: fg, opacity: 0.72, position: 'absolute', left: 0, top: 0 }}>{c.label}</div>
      <div style={{
        position: 'absolute', left: 0, top: 56 * 1.3 + 24, display: 'flex', alignItems: 'flex-start',
        transform: `translateY(${(1 - settle) * -10}px)`,
      }}>
        {c.prefix && <span style={{ ...textBase(size * 0.5, 900), color: fg, lineHeight: 1, marginTop: size * 0.12, marginRight: size * 0.06 }}>{c.prefix}</span>}
        <span style={{ ...textBase(size, 900), lineHeight: 1, display: 'inline-flex', color: fg }}>
          {chars.map((ch, i) => {
            if (!/\d/.test(ch)) return <span key={i} style={{ display: 'inline-block', width: size * 0.3, textAlign: 'center', height: size * 1.08, lineHeight: 1, paddingTop: size * 0.04 }}>{ch}</span>;
            const di = digitIdx.indexOf(i);
            return <DigitColumn key={i} pos={posFor(di, Number(ch))} size={size} cellW={m.cellW} />;
          })}
        </span>
        {c.unit && <span style={{ ...textBase(unitSize, 500), color: fg, opacity: 0.72, marginLeft: 24, alignSelf: 'flex-end', marginBottom: size * 0.14 }}>{c.unit}</span>}
      </div>
    </div>

    {/* 对照：旧价格卡，划掉后退后 */}
    <Surface box={{ x: cardX, y: cardY, w: cardW, h: cardH }} style={{ opacity: cmp }}>
      <div style={{ position: 'absolute', left: 60, top: 50, ...textBase(cmpLabelSize, 500), color: S.ink, opacity: 0.72 }}>{c.compareLabel}</div>
      <div style={{ position: 'absolute', left: 60, top: 50 + cmpLabelSize * 1.3 + 18, ...textBase(cmpSize, 900), lineHeight: 1.1, color: strike > 0.5 ? S.faint : S.ink }}>
        {cmpText}
        <span style={{ position: 'absolute', left: -8, top: '52%', height: 9, borderRadius: 5, background: S.ink, width: (textWidth(cmpText, cmpSize) + 16) * strike }} />
      </div>
    </Surface>

    <Pill dark={!dark} shadow={dark ? S.shadow : S.capsuleShadow} box={{ x: pillCx - pillW / 2, y: pillY + (1 - delta) * 24, w: pillW, h: pillH }}
      style={{ opacity: delta, transform: `scale(${mix(0.82, 1, clamp(delta * 1.2))})` }}>
      <span style={{ ...textBase(pillSize, 400, S.display), color: dark ? S.ink : '#fff', lineHeight: 1 }}>
        {dBefore}<span style={{ color: dark ? S.accent : S.accentDark }}>{key}</span>{dAfter}
      </span>
    </Pill>

    <Sfx name="scroll" at={rollStart} duration={Math.round((landed - rollStart) * 60)} />
    <Sfx name="ding" at={landed} duration={90} />
    <Sfx name="woosh" at={2.0} />
    <Sfx name="slide" at={2.8} />
    <Sfx name="pop" at={3.4} />
  </Frame>;
}
