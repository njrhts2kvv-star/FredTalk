// T14d-ValueShift：前后数值变化
// 观众要看懂的变化：旧数值 → 变成新数值，差值亮出
// 关系：同一把刻度尺上，旧值的指针先立住 → 指针沿尺滑到新值（读数跟着走），旧位置留一个淡影
//       → 两点之间那一段被染紫，差值写在这段下面。差距是“尺上的一段长度”，
//       和 T14c（逐位滚动＋划掉旧价＋差额胶囊）、T14a（两条赛跑）不是同一动作。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type ShiftPoint = { name: string; value: number };
export type ValueShiftProps = HandoffProps & {
  label: string;          // 量的是什么（例：DeepSWE v1.1 得分）
  from: ShiftPoint;       // 旧
  to: ShiftPoint;         // 新
  decimals: number;
  prefix: string;         // 数值前缀（$ 等）
  suffix: string;         // 数值后缀（% 等）
  min?: number;           // 刻度尺两端；不传按两值自动留白
  max?: number;
  deltaText?: string;     // 差值文案；不传自动写 “+6.4 个百分点” / “−$8.00”
  deltaKey?: string;      // deltaText 里染紫的片段；缺省取带符号的数字
  cues?: number[];        // [0]=指针开始移动，[1]=差值亮出
};

// 真实跑分：DeepSWE v1.1，GPT-6 Sol 最高 69.0% → GPT-6.1 Sol 最高 75.4%，+6.4 个百分点（ep107 deepswe.png 与当期口播）
export const valueShiftDefaults: ValueShiftProps = {
  label: 'DeepSWE v1.1 得分',
  from: { name: 'GPT-6 Sol', value: 69.0 },
  to: { name: 'GPT-6.1 Sol', value: 75.4 },
  decimals: 1,
  prefix: '',
  suffix: '%',
};

const fmt = (v: number, d: number) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const glyph = (ch: string) => (/\d/.test(ch) ? 0.6 : /[.,:]/.test(ch) ? 0.3 : ch === '%' ? 0.86 : ch === ' ' ? 0.28 : /[\u0000-ÿ]/.test(ch) ? 0.62 : 1);
const numWidth = (s: string, size: number) => Array.from(s).reduce((w, ch) => w + glyph(ch) * size, 0);
function Num({ text, size, color }: { text: string; size: number; color: string }) {
  return <span style={{ ...textBase(size, 900), lineHeight: 1, display: 'inline-flex', color, fontVariantNumeric: 'tabular-nums' }}>
    {Array.from(text).map((ch, i) => <span key={i} style={{ display: 'inline-block', width: glyph(ch) * size, textAlign: 'center' }}>{ch}</span>)}
  </span>;
}
// 刻度留白取整：按差值的数量级取步长
const niceStep = (span: number) => {
  const e = Math.pow(10, Math.floor(Math.log10(Math.max(span, 1e-9))));
  const m = span / e;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e;
};

const TRACK_X = 160, TRACK_W = 1600, TRACK_Y = 640, TRACK_H = 26;

export function ValueShift(props: Partial<ValueShiftProps>) {
  const c = { ...valueShiftDefaults, ...props };
  const t = useT();
  const moveAt = cueAt(c.cues, 0, 1.15);
  const moveEnd = moveAt + 1.1;
  const deltaAt = cueAt(c.cues, 1, moveEnd + 0.25);

  const a = c.from.value, b = c.to.value;
  const lo = Math.min(a, b), hi = Math.max(a, b), span = Math.max(hi - lo, Math.abs(hi) * 0.01, 1e-6);
  const step = niceStep(span / 2);
  let min = c.min ?? Math.floor((lo - span * 0.55) / step) * step;
  if (c.min === undefined && lo >= 0) min = Math.max(0, min);
  const max = c.max ?? Math.ceil((hi + span * 0.55) / step) * step;
  const xOf = (v: number) => TRACK_X + TRACK_W * clamp((v - min) / Math.max(max - min, 1e-9));

  // —— 时间线 ——
  const intro = p(t, 0, 0.5);
  const move = q(t, moveAt, moveEnd);
  const settle = springAt(t, moveEnd - 0.05, 0.5);
  const ghost = p(t, moveAt, moveAt + 0.35);
  const newName = p(t, moveEnd - 0.2, moveEnd + 0.25);
  const delta = p(t, deltaAt, deltaAt + 0.45);

  const cur = mix(a, b, move);
  const xa = xOf(a), xb = xOf(b), xc = xOf(cur);
  const str = (v: number) => `${v < 0 ? '−' : ''}${c.prefix}${fmt(Math.abs(v), c.decimals)}${c.suffix}`;

  const tick = (v: number) => `${v < 0 ? '−' : ''}${c.prefix}${fmt(Math.abs(v), Number.isInteger(v) ? 0 : c.decimals)}${c.suffix}`;
  // 指针列：名字在上、读数胶囊在下、尖点落在尺上
  const valSize = 116;
  const nameSize = 58;
  const pillW = (v: number) => numWidth(str(v), valSize) + 100;
  const pillH = 168;
  const colW = (name: string, v: number) => Math.max(pillW(v), textWidth(name, nameSize));
  const colBottom = TRACK_Y - 34;
  // 新旧两列在终态挤在一起时，旧值淡影改放到尺下
  const ghostLow = Math.abs(xb - xa) < (colW(c.from.name, a) + colW(c.to.name, b)) / 2 + 40;

  const diff = b - a;
  const pct = c.suffix === '%';
  const autoDelta = `${diff >= 0 ? '+' : '−'}${c.prefix}${fmt(Math.abs(diff), c.decimals)}${pct ? ' 个百分点' : c.suffix}`;
  const deltaText = c.deltaText ?? autoDelta;
  const key = c.deltaKey ?? (deltaText.match(/[+\-−]?\s*[$¥]?[\d.,]+%?/)?.[0] ?? '');
  const ki = key ? deltaText.indexOf(key) : -1;
  const deltaSize = Math.min(128, 1300 / Math.max(1, textWidth(deltaText, 1)));
  const dW = textWidth(deltaText, deltaSize);
  const spanL = Math.min(xa, xb), spanR = Math.max(xa, xb);
  const dCx = clamp((spanL + spanR) / 2, 120 + dW / 2, 1800 - dW / 2);
  const dTop = ghostLow ? 210 : TRACK_Y + TRACK_H + 92;

  const labelSize = Math.min(72, 1400 / Math.max(1, textWidth(c.label, 1)));

  const column = (name: string, v: number, x: number, opts: { dim: number; low?: boolean; nameOpacity?: number; pulse?: number }) => {
    const w = pillW(v);
    const ink = opts.dim > 0.5;
    const top = opts.low ? TRACK_Y + TRACK_H + 34 : colBottom - pillH - nameSize * 1.3 - 14;
    const pillTop = opts.low ? top : top + nameSize * 1.3 + 14;
    const nameTop = opts.low ? top + pillH + 14 : top;
    return <>
      <div style={{ position: 'absolute', left: x - textWidth(name, nameSize) / 2, top: nameTop, ...textBase(nameSize, 500), color: ink ? S.ink : S.faint, opacity: opts.nameOpacity ?? 1 }}>{name}</div>
      <div style={{
        position: 'absolute', left: x - w / 2, top: pillTop, width: w, height: pillH, borderRadius: pillH / 2,
        background: ink ? S.dark : '#fff', boxShadow: ink ? S.capsuleShadow : S.shadow,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + (opts.pulse ?? 0) * 0.04})`,
      }}>
        <Num text={str(v)} size={valSize} color={ink ? '#fff' : S.faint} />
      </div>
    </>;
  };

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, opacity: intro, transform: `translateY(${(1 - intro) * 36}px)` }}>
        <div style={{ position: 'absolute', left: 960 - textWidth(c.label, labelSize) / 2, top: ghostLow ? 96 : 148, ...textBase(labelSize, 900), color: S.ink }}>{c.label}</div>

        {/* 刻度尺：底色是墨色的极淡一层，两端标数 */}
        <div style={{ position: 'absolute', left: TRACK_X, top: TRACK_Y, width: TRACK_W, height: TRACK_H, borderRadius: TRACK_H / 2, background: S.ink, opacity: 0.08 }} />
        {[min, max].map((v, i) => { const s = tick(v); return <div key={i} style={{
          position: 'absolute', top: TRACK_Y + TRACK_H + 20, left: i ? TRACK_X + TRACK_W - numWidth(s, 44) : TRACK_X, opacity: 1 - delta,
        }}><Num text={s} size={44} color={S.faint} /></div>; })}

        {/* 差距这一段：随指针长出，染紫 */}
        <div style={{
          position: 'absolute', top: TRACK_Y, height: TRACK_H, borderRadius: TRACK_H / 2, background: S.accent,
          left: Math.min(xa, xc), width: Math.abs(xc - xa), opacity: move > 0 ? 1 : 0,
        }} />
        {/* 尺上的两个落点 */}
        <div style={{ position: 'absolute', left: xa - 19, top: TRACK_Y + TRACK_H / 2 - 19, width: 38, height: 38, borderRadius: 19, background: '#fff', boxShadow: S.shadow, opacity: ghost }} />
        <div style={{ position: 'absolute', left: xc - 22, top: TRACK_Y + TRACK_H / 2 - 22, width: 44, height: 44, borderRadius: 22, background: S.dark, boxShadow: S.capsuleShadow }} />

        {/* 旧值淡影：指针一走就留在原处 */}
        <div style={{ position: 'absolute', inset: 0, opacity: ghost }}>
          {column(c.from.name, a, xa, { dim: 0, low: ghostLow })}
        </div>
        {/* 活动指针：读数随位置走；名字在落定时换成新的 */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {column(newName > 0 ? c.to.name : c.from.name, cur, xc, { dim: 1, nameOpacity: newName > 0 ? newName : 1 - ghost, pulse: (1 - settle) * (move >= 1 ? 1 : 0) })}
        </div>
      </div>

      {/* 差值：写在紫色这段的下面（拥挤时放到上方） */}
      <div style={{
        position: 'absolute', left: dCx - dW / 2, top: dTop + (1 - delta) * 24, opacity: delta, ...textBase(deltaSize, 900), color: S.ink,
        transform: `scale(${mix(0.9, 1, delta)})`, transformOrigin: '50% 50%',
      }}>
        {ki >= 0 ? <>{deltaText.slice(0, ki)}<span style={{ color: S.accent }}>{key}</span>{deltaText.slice(ki + key.length)}</> : deltaText}
      </div>
    </Handoff>
    <Sfx name="pop" at={0.05} />
    <Sfx name="scroll" at={moveAt} duration={Math.round((moveEnd - moveAt) * 60)} />
    <Sfx name="ding" at={moveEnd - 0.05} duration={90} />
    <Sfx name="pop" at={deltaAt} />
  </Frame>;
}
