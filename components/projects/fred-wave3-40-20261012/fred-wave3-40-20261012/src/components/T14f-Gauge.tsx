// T14f-Gauge：仪表读数
// 观众要看懂的变化：一个仪表盘 → 指针走到读数，所在区间被点亮
// 关系：半圆弧分成 2–4 档（每档标名），指针从最左端摆到读数、轻轻过冲再回落，中央数字跟着指针滚动；
//       指针停下后，读数所在那一档亮成紫色。和 T14d（直尺上两点位移）、T15a（条形）不同：这里是单个读数落在“档位”里的哪一段。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, quintic, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type GaugeZone = { label: string; to: number };   // to = 这一档的上界；最后一档应等于 max
export type GaugeProps = HandoffProps & {
  value: number;
  min: number;
  max: number;
  decimals: number;
  prefix: string;
  suffix: string;
  zones: GaugeZone[];     // 2–4 档，按上界从小到大
  caption?: string;       // 读数下面的一句说明（含数据出处），可空
  cues?: number[];        // [0]=指针开始走；[1]=所在档亮起
};

// 真实素材：autotrust/JEV-27B 模型卡自称“六组基准平均 84.07（官方 Jev 1.13 为 83.85）”，未经独立验证（来自 113 期交接文件）。
// 档位 偏低 / 中等 / 较高 只是示意刻度，不是评测标准。
export const gaugeDefaults: GaugeProps = {
  value: 84.07,
  min: 0,
  max: 100,
  decimals: 2,
  prefix: '',
  suffix: '',
  zones: [{ label: '偏低', to: 60 }, { label: '中等', to: 80 }, { label: '较高', to: 100 }],
  caption: '六组基准平均分 · 模型卡自称，未独立验证',
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

const CX = 960, CY = 690, RM = 450, SW = 96;
const TRACK = '#e1e1e6';

export function Gauge(props: Partial<GaugeProps>) {
  const c = { ...gaugeDefaults, ...props };
  const t = useT();
  const span = Math.max(1e-9, c.max - c.min);
  const frac = (v: number) => clamp((v - c.min) / span);
  // 角度：0 = 最左端，π = 最右端（沿上半圆顺时针）
  const th = (f: number) => Math.PI * (1 - f);                 // 数学角
  const P = (f: number, r: number) => ({ x: CX + r * Math.cos(th(f)), y: CY - r * Math.sin(th(f)) });
  const zones = c.zones.slice(0, 4).map((z, i, arr) => ({ ...z, from: i === 0 ? c.min : arr[i - 1].to }));
  const target = clamp(c.value, c.min, c.max);
  const zi = Math.max(0, zones.findIndex((z) => target <= z.to + 1e-9));
  const GAPPX = 9;

  // —— 时间线 ——
  const needleAt = cueAt(c.cues, 0, 1.2);
  const needleDur = 1.5;
  const lightAt = cueAt(c.cues, 1, needleAt + needleDur + 0.2);
  const light = p(t, lightAt, lightAt + 0.5);
  const sweepP = quintic(t, needleAt, needleAt + needleDur);       // 0→1（读数滚动用，不过冲）
  const ov = 0.05;
  const needleF = frac(target) * (sweepP * (1 + ov) - ov * q(t, needleAt + needleDur, needleAt + needleDur + 0.4));
  const curVal = c.min + (target - c.min) * sweepP;
  const hubIn = p(t, 0.5, 1.0);
  const finalStr = `${c.prefix}${fmt(target, c.decimals)}${c.suffix}`;
  const numSize = Math.min(150, 760 / Math.max(1, numWidth(finalStr, 1)));

  // 指针：细长的三角体，尖端伸进色带
  const angle = (th(needleF) * 180) / Math.PI;                    // 数学角（度）
  const L = RM + 6, back = 40;
  const arcPath = (f0: number, f1: number, r: number) => {
    const a = P(f0, r), b = P(f1, r);
    return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A${r} ${r} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  };

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {zones.map((z, i) => {
          const g = GAPPX / RM;
          const f0 = frac(z.from) + (i === 0 ? 0 : g / (2 * Math.PI) * 1.0), f1 = frac(z.to) - (i === zones.length - 1 ? 0 : g / (2 * Math.PI) * 1.0);
          const grow = p(t, 0.12 + i * 0.12, 0.7 + i * 0.12);
          if (grow <= 0.001 || f1 <= f0) return null;
          const on = i === zi ? light : 0;
          const r = RM + on * 8;
          return <path key={i} d={arcPath(f0, f0 + (f1 - f0) * grow, r)} fill="none" stroke={mixColor(TRACK, S.accent, on)} strokeWidth={SW + on * 16} />;
        })}
      </svg>

      {/* 档位名：放在色带外侧，贴着弧线中点 */}
      {zones.map((z, i) => {
        const mid = (frac(z.from) + frac(z.to)) / 2;
        const pos = P(mid, RM + SW / 2 + 82);
        const size = 48;
        const w = textWidth(z.label, size);
        const on = i === zi ? light : 0;
        const a = p(t, 0.5 + i * 0.12, 0.95 + i * 0.12);
        const cosv = Math.cos(th(mid));
        const left = pos.x - w / 2 + cosv * (w / 2 + 6);
        return <div key={i} style={{ position: 'absolute', left, top: pos.y - size * 0.58, ...textBase(size, 900), color: mixColor(S.faint, S.ink, on), opacity: a, transform: `scale(${1 + 0.12 * on})`, transformOrigin: '50% 50%' }}>{z.label}</div>;
      })}

      {/* 两端刻度 */}
      {[c.min, c.max].map((v, i) => {
        const s = `${fmt(v, Number.isInteger(v) ? 0 : c.decimals)}${c.suffix.trim().length <= 1 ? c.suffix : ''}`;
        const w = numWidth(s, 44);
        return <div key={i} style={{ position: 'absolute', left: (i ? CX + RM : CX - RM) - w / 2, top: CY + 30, opacity: p(t, 0.4, 0.9) }}>
          <Num text={s} size={44} color={S.faint} />
        </div>;
      })}

      {/* 指针 */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: hubIn, overflow: 'visible' }}>
        <g transform={`translate(${CX} ${CY}) rotate(${-angle})`} style={{ filter: 'drop-shadow(10px 10px 8px rgba(0,0,0,0.28))' }}>
          <path d={`M${L} 0 L0 -17 L${-back} -9 L${-back} 9 L0 17 Z`} fill={S.dark} />
        </g>
        <circle cx={CX} cy={CY} r={36} fill={S.dark} />
        <circle cx={CX} cy={CY} r={13} fill="#fff" />
      </svg>

      {/* 中央读数 */}
      <div style={{ position: 'absolute', left: CX - 360, top: CY + 90, width: 720, display: 'flex', justifyContent: 'center', opacity: p(t, 0.6, 1.1) }}>
        <Num text={`${c.prefix}${fmt(curVal, c.decimals)}${c.suffix}`} size={numSize} color={S.ink} />
      </div>
      {c.caption && <div style={{ position: 'absolute', left: 0, top: CY + 90 + numSize + 30, width: 1920, textAlign: 'center', ...textBase(Math.min(48, 1500 / Math.max(1, textWidth(c.caption, 1))), 500), color: S.muted, opacity: p(t, 0.8, 1.3) }}>{c.caption}</div>}
    </Handoff>
    <Sfx name="whoosh-short" at={needleAt} />
    <Sfx name="scroll" at={needleAt} duration={Math.round(needleDur * 60)} volume={0.35} />
    <Sfx name="ding" at={lightAt} duration={90} />
  </Frame>;
}
