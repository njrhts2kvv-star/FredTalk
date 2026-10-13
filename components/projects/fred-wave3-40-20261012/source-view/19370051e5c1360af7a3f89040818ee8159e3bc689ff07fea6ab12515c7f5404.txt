// T15f-DonutShare：占比环
// 观众要看懂的变化：一个圆环 → 各部分依次长出，主角那块抽出并亮出比例
// 关系：一圈圆环由一个“笔头”顺时针扫出，各块按占比依次长出（右侧名单跟着出现）→ 其余块退成浅灰，
//       主角那块沿半径向外抽出并染紫，环中央的大数字滚到它的占比。
//       和 T15a（横条长出）、T14e（并排数字卡）不同：这里是同一个整体被切分，主角从整体里被“拎出来”。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type DonutSegment = { label: string; value: number };
export type DonutShareProps = HandoffProps & {
  segments: DonutSegment[];   // 2–5 段；占比 = value / 总和
  highlight: number;          // 主角在 segments 里的序号
  decimals: number;           // 占比小数位
  centerNote: string;         // 环长出时中央的一句说明；主角抽出后让位给大数字
  highlightLabel?: string;    // 大数字下方的小字；不传用主角名称
  cues?: number[];            // [0]=环开始长；[1]=主角抽出
};

// 示例内容（明显是示意数据，不是实测结论）：100 条测试里与官方结果一致 87 条、轻微差异 9 条、不一致 4 条。
// 真实的 113 期开源版 JEV 一致率要等实测后用 props 替换。
export const donutShareDefaults: DonutShareProps = {
  segments: [
    { label: '完全一致', value: 87 },
    { label: '轻微差异', value: 9 },
    { label: '结果不同', value: 4 },
  ],
  highlight: 0,
  decimals: 0,
  centerNote: '100 条示例',
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

const CX = 640, CY = 550, RM = 290, SW = 132;
const TONES = [S.ink, '#6c6c72', '#a3a3ab', '#c4c4cb', '#dcdce0'];
const GREY = '#d3d3d9';
const pt = (a: number, r = RM) => ({ x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) });
const arc = (a0: number, a1: number) => {
  const e = Math.min(a1, a0 + Math.PI * 2 - 0.002);
  const s = pt(a0), f = pt(e);
  return `M${s.x.toFixed(2)} ${s.y.toFixed(2)} A${RM} ${RM} 0 ${e - a0 > Math.PI ? 1 : 0} 1 ${f.x.toFixed(2)} ${f.y.toFixed(2)}`;
};

export function DonutShare(props: Partial<DonutShareProps>) {
  const c = { ...donutShareDefaults, ...props };
  const t = useT();
  const segs = c.segments.slice(0, 5);
  const n = Math.max(1, segs.length);
  const hi = clamp(Math.round(c.highlight), 0, n - 1);
  const total = segs.reduce((a, s) => a + Math.max(0, s.value), 0) || 1;
  const GAP = 11 / RM;                       // 块与块之间约 11px 的缝
  let acc = 0;
  const parts = segs.map((s, i) => {
    const share = Math.max(0, s.value) / total;
    const a0 = acc * Math.PI * 2;
    acc += share;
    return { ...s, i, share, a0, span: share * Math.PI * 2 };
  });

  // —— 时间线 ——
  const ringAt = cueAt(c.cues, 0, 0.35);
  const ringDur = 2.3;
  const pullAt = cueAt(c.cues, 1, ringAt + ringDur + 0.45);
  const sweep = q(t, ringAt, ringAt + ringDur);
  const head = sweep * Math.PI * 2;
  const light = p(t, pullAt, pullAt + 0.5);
  const pull = springAt(t, pullAt, 0.75);
  const rollV = p(t, pullAt + 0.12, pullAt + 1.15);
  const enter = p(t, 0, 0.5);

  // 中央大数字：按宽度自适应
  const hp = parts[hi];
  const hiPct = hp.share * 100;
  const finalStr = `${fmt(hiPct, c.decimals)}%`;
  const innerR = RM - SW / 2 - 26;
  const bigSize = Math.min(168, (innerR * 2 * 0.92) / Math.max(1, numWidth(finalStr, 1)));
  const noteSize = Math.min(58, Math.max(38, (innerR * 2 * 0.9 * 1.9) / Math.max(1, textWidth(c.centerNote, 1))));   // 放不下就拆成两行，字不再缩小
  const labelText = c.highlightLabel ?? hp.label;
  const labelSize = Math.min(52, Math.max(36, (innerR * 2 * 0.86 * 1.9) / Math.max(1, textWidth(labelText, 1))));

  // 右侧名单：名称一行放不下就拆两行；名称列与数字列贴近，整块在右侧区域居中
  const rowH = Math.min(136, 700 / n);
  const listX = 1110, listR = 1800, areaW = listR - listX;
  const vs = Math.min(60, rowH * 0.46);
  const valW = numWidth('100%', vs);
  const labelMax = areaW - 62 - 72 - valW;
  const base = Math.min(62, rowH * 0.46);
  const longest = Math.max(...parts.map((x) => textWidth(x.label, 1)));
  const oneLine = Math.min(base, labelMax / Math.max(1, longest));
  const twoLine = oneLine < 42;
  const ls = twoLine ? Math.max(30, Math.min(base, labelMax / Math.max(1, longest / 2 + 0.6))) : oneLine;
  const splitLabel = (label: string): string[] => {
    if (!twoLine || textWidth(label, 1) * ls <= labelMax) return [label];
    const chars = Array.from(label);
    let acc2 = 0;
    const half = textWidth(label, 1) / 2;
    let k = 0;
    while (k < chars.length - 1 && acc2 + textWidth(chars[k], 1) / 2 < half) { acc2 += textWidth(chars[k], 1); k++; }
    return [chars.slice(0, k + 1).join(''), chars.slice(k + 1).join('')];
  };
  const lines = parts.map((x) => splitLabel(x.label));
  const labelW = Math.max(...lines.flat().map((l) => textWidth(l, ls)));
  const blockW = 62 + labelW + 72 + valW;
  const bx = listX + Math.max(0, (areaW - blockW) / 2);
  const y0 = CY - (n * rowH) / 2;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: enter }}>
        <circle cx={CX} cy={CY} r={RM} fill="none" stroke={S.ink} strokeOpacity={0.06} strokeWidth={SW} />
        {[...parts].sort((a, b) => Number(a.i === hi) - Number(b.i === hi)).map((s) => {
          const vis = clamp((head - s.a0) / Math.max(1e-6, s.span));
          if (vis <= 0.001) return null;
          const a0 = s.a0 + (n > 1 ? GAP / 2 : 0), a1 = s.a0 + s.span * vis - (n > 1 && vis >= 0.999 ? GAP / 2 : 0);
          if (a1 - a0 <= 0.002) return null;
          const isHi = s.i === hi;
          const tone = TONES[s.i % TONES.length];
          const color = isHi ? mixColor(tone, S.accent, light) : mixColor(tone, GREY, light);
          const am = s.a0 + s.span / 2;
          const k = isHi ? pull * 54 : 0;
          return <path key={s.i} d={arc(a0, a1)} fill="none" stroke={color} strokeWidth={SW}
            transform={`translate(${(Math.sin(am) * k).toFixed(2)} ${(-Math.cos(am) * k).toFixed(2)})`} />;
        })}
      </svg>

      {/* 环中央：先是一句说明，主角抽出后换成大数字 */}
      <div style={{ position: 'absolute', left: CX - innerR * 0.92, top: CY - 80, width: innerR * 1.84, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...textBase(noteSize, 900), whiteSpace: 'normal', color: S.ink, opacity: clamp(1 - light * 3) * p(t, ringAt, ringAt + 0.5) }}>{c.centerNote}</div>
      <div style={{ position: 'absolute', left: CX - innerR, top: CY - bigSize * 0.5 - 30, width: innerR * 2, display: 'flex', justifyContent: 'center', opacity: clamp(light * 3), transform: `scale(${mix(0.9, 1, light)})` }}>
        <Num text={`${fmt(hiPct * rollV, c.decimals)}%`} size={bigSize} color={S.ink} />
      </div>
      <div style={{ position: 'absolute', left: CX - innerR, top: CY + bigSize * 0.5 + 6, width: innerR * 2, textAlign: 'center', ...textBase(labelSize, 500), whiteSpace: 'normal', color: S.muted, opacity: clamp(light * 3 - 0.6) }}>{labelText}</div>

      {/* 右侧名单：跟着笔头出现 */}
      {parts.map((s) => {
        const a = clamp((head - s.a0) / 0.35);
        const isHi = s.i === hi;
        const tone = TONES[s.i % TONES.length];
        const dim = isHi ? 0 : light;
        const swatch = isHi ? mixColor(tone, S.accent, light) : mixColor(tone, GREY, light);
        const text = isHi ? S.ink : mixColor(S.ink, S.faint, dim);
        const vcol = isHi ? mixColor(S.ink, S.accent, light) : text;
        const str = `${fmt(s.share * 100, c.decimals)}%`;
        const L = lines[s.i];
        return <div key={s.i} style={{ position: 'absolute', left: bx, top: y0 + s.i * rowH, width: blockW, height: rowH, opacity: a, transform: `translateX(${(1 - a) * 36}px)` }}>
          <div style={{ position: 'absolute', left: 0, top: rowH / 2 - 17, width: 34, height: 34, borderRadius: 999, background: swatch }} />
          <div style={{ position: 'absolute', left: 62, top: (rowH - ls * 1.16 * L.length) / 2, ...textBase(ls, 900), color: text }}>{L.map((ln, k) => <div key={k}>{ln}</div>)}</div>
          <div style={{ position: 'absolute', left: blockW - numWidth(str, vs), top: (rowH - vs) / 2, transform: `scale(${isHi ? 1 + 0.1 * light : 1})`, transformOrigin: '100% 50%' }}>
            <Num text={str} size={vs} color={vcol} />
          </div>
        </div>;
      })}
    </Handoff>
    <Sfx name="slide" at={ringAt} />
    <Sfx name="woosh" at={pullAt} />
    <Sfx name="scroll" at={pullAt + 0.12} duration={Math.round(1.0 * 60)} volume={0.35} />
    <Sfx name="ding" at={pullAt + 1.1} duration={90} />
  </Frame>;
}
