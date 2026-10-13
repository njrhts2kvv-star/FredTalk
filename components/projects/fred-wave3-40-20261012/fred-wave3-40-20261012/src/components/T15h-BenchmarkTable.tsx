// T15h-BenchmarkTable：多方测评表
// 观众要看懂的变化：一张多列测评表 → 逐格落下对错和数值，最后一行合计亮出赢家
// 动作：每一方是一张白卡列（黑胶囊表头压在卡顶），评测项写在左侧、细线贯穿各列 → 按列依次落格
//   （对勾 = 黑圆章弹出 + 白勾画出；叉 = 淡灰叉画出；数值落下）→ 合计逐列亮出 → 赢家整张卡抬起放大、合计染紫，其余卡退后变淡。
// 返修（Fred：“太丑了”）：去掉通栏黑表头 + 灰字的 Excel 感，改成 T05d 那样的卡片列 + 黑胶囊表头；字号 34–36；
//   对勾做成有分量的黑圆章；赢家整列抬起（上移 + 放大 + 更深阴影），其他列白蒙版退后；整表居中、不占满画面。
// 和 T05d（两方逐项、格子翻黑）区分：多方 + 结果符号 + 合计行 + 整卡抬起。
// 默认内容：明显的示例内容（方案甲/乙/丙），不是实测数据。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, springAt } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type BenchmarkCell = boolean | string;   // true=对勾，false=叉，字符串=数值
export type BenchmarkRow = { label: string; cells: BenchmarkCell[] };
export type BenchmarkTableProps = HandoffProps & {
  columns: string[];        // 被比较的几方（2–5）
  rows: BenchmarkRow[];     // 评测项（2–7 行）
  totalLabel: string;       // 合计行的名字
  totals?: string[];        // 每列合计；不传就按对勾数自动算（"3/4"）
  winner?: number;          // 赢家列；不传取对勾最多的一列
  cues?: number[];          // [0..n-1]=第 j 列开始落格；[n]=赢家抬起
};

// 示例内容（非实测）
export const benchmarkTableDefaults: BenchmarkTableProps = {
  columns: ['方案甲', '方案乙', '方案丙'],
  rows: [
    { label: '上手快', cells: [true, true, false] },
    { label: '能自动执行', cells: [false, true, true] },
    { label: '价格可控', cells: [true, false, true] },
    { label: '结果稳定', cells: [false, true, false] },
    { label: '上手天数', cells: ['1 天', '3 天', '2 天'] },
  ],
  totalLabel: '合计',
};

const tw = (s: string, f: number) => Array.from(s).reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.68 : /[\u0000-ÿ]/.test(ch) ? 0.6 : 1) * f, 0);

// 对勾：黑圆章弹出，白勾沿路径画出
function Check({ d, pop, draw }: { d: number; pop: number; draw: number }) {
  return <div style={{ width: d, height: d, borderRadius: d / 2, background: S.dark, transform: `scale(${pop})`, boxShadow: '0 6px 12px #0003', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={d * 0.62} height={d * 0.62} viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
      <path d="M4 12.6 L9.8 18.2 L20.2 5.8" pathLength={1} fill="none" stroke="#fff" strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="1 1" strokeDashoffset={1 - draw} />
    </svg>
  </div>;
}
// 叉：淡灰两笔画出（不抢对勾）
function Cross({ d, draw }: { d: number; draw: number }) {
  const s = d * 0.5;
  return <svg width={s} height={s} viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
    <path d="M5 5 L19 19" pathLength={1} stroke={S.faint} strokeWidth={4.2} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - clamp(draw * 2)} />
    <path d="M19 5 L5 19" pathLength={1} stroke={S.faint} strokeWidth={4.2} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - clamp(draw * 2 - 1)} />
  </svg>;
}

export function BenchmarkTable(props: Partial<BenchmarkTableProps>) {
  const c = { ...benchmarkTableDefaults, ...props };
  const t = useT();
  const cols = c.columns.slice(0, 5);
  const n = Math.max(1, cols.length);
  const rows = c.rows.slice(0, 7);
  const R = rows.length;

  // ---------- 内容 → 终态版式 ----------
  const tickCount = (j: number) => rows.filter((r) => r.cells[j] === true).length;
  const countable = rows.filter((r) => r.cells.some((x) => typeof x === 'boolean')).length;
  const totals = cols.map((_, j) => c.totals?.[j] ?? `${tickCount(j)}/${countable}`);
  const winner = clamp(Math.round(c.winner ?? cols.reduce((best, _, j) => (tickCount(j) > tickCount(best) ? j : best), 0)), 0, n - 1);

  // 字号从 36 往下找：整表宽 ≤ 1740
  const plan = (f: number) => {
    const labelW = Math.max(tw(c.totalLabel, f), ...rows.map((r) => tw(r.label, f)));
    const colW = cols.map((name, j) => Math.max(f * 6.6, tw(name, f) + f * 2.2, ...rows.map((r) => (typeof r.cells[j] === 'string' ? tw(r.cells[j] as string, f) + f * 1.6 : 0)), tw(totals[j], f * 1.25) + f * 1.6));
    const cw = Math.max(...colW);                 // 各列等宽，更整齐
    const gap = f * 1.0;
    const width = labelW + f * 1.8 + n * cw + (n - 1) * gap;
    return { f, labelW, cw, gap, width };
  };
  let L = plan(36);
  for (let f = 36; f >= 26 && L.width > 1740; f -= 1) L = plan(f);
  const { f, labelW, cw, gap, width } = L;

  const pillH = Math.round(f * 1.9);
  const totalH = Math.round(f * 2.8);
  const rowH = Math.round(Math.min(f * 2.55, (880 - 150 - pillH - totalH - 30) / Math.max(1, R)));
  const cardH = pillH / 2 + 18 + R * rowH + totalH;
  const groupH = pillH / 2 + cardH;
  const top = 150 + (880 - 150 - groupH) / 2;    // 表头胶囊顶边
  const cardY = top + pillH / 2;
  const rowY = (i: number) => cardY + pillH / 2 + 18 + i * rowH;
  const totalY = rowY(R);
  const X0 = (1920 - width) / 2;
  const colX = (j: number) => X0 + labelW + f * 1.8 + j * (cw + gap);
  const sym = Math.round(f * 1.45);

  // ---------- 时间线 ----------
  const enterAt = (j: number) => 0.04 + j * 0.07;
  const step = Math.min(0.85, 3.0 / n);
  const colAt = cols.map((_, j) => cueAt(c.cues, j, 0.85 + j * step));
  const cellAt = (j: number, i: number) => colAt[j] + i * 0.07;
  const totAt = (j: number) => cellAt(j, R) + 0.1;
  const liftAt = Math.max(cueAt(c.cues, n, totAt(n - 1) + 0.55), totAt(n - 1) + 0.3);
  const lift = p(t, liftAt, liftAt + 0.55);
  const lands = springAt(t, liftAt, 0.7);

  const labelIn = p(t, 0.15, 0.6);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 行分隔细线：从评测项一直贯穿到最后一列（卡片之间也连着） */}
      {Array.from({ length: R }, (_, i) => <div key={i} style={{
        position: 'absolute', left: X0, top: rowY(i + 1) - 1, width: (width) * labelIn, height: 2, background: S.ink, opacity: 0.08,
      }} />)}

      {/* 评测项 */}
      {rows.map((r, i) => <div key={i} style={{
        ...textBase(f, 900), position: 'absolute', left: X0, top: rowY(i) + (rowH - f * 1.16) / 2, color: S.ink,
        opacity: labelIn * mix(1, 0.55, lift), transform: `translateX(${(1 - labelIn) * -24}px)`,
      }}>{r.label}</div>)}
      <div style={{ ...textBase(f * 1.05, 900), position: 'absolute', left: X0, top: totalY + (totalH - f * 1.2) / 2, color: S.ink, opacity: labelIn }}>{c.totalLabel}</div>

      {/* 每一方：白卡列 + 黑胶囊表头 */}
      {cols.map((name, j) => {
        const e = p(t, enterAt(j), enterAt(j) + 0.5);
        const won = j === winner;
        const back = won ? 0 : lift;
        const x = colX(j);
        const shadow = won && lift > 0 ? `0 ${16 + 22 * lift}px ${25 + 25 * lift}px 0 rgba(0,0,0,${0.133 + 0.08 * lift})` : S.shadow;
        return <div key={j} style={{
          position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: e,
          transform: `translateY(${(1 - e) * 50 - (won ? 26 * lift : 0)}px)`, zIndex: won ? 3 : 1,
        }}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: `${x + cw / 2}px ${cardY + cardH / 2}px`, transform: `scale(${won ? mix(1, 1.045, lift) + (1 - lands) * 0.01 * (lift > 0 ? 1 : 0) : mix(1, 0.97, back)})` }}>
            <Surface box={{ x, y: cardY, w: cw, h: cardH }} shadow={shadow}>
              {/* 卡内细线（与外面那条同一高度） */}
              {Array.from({ length: R }, (_, i) => <div key={i} style={{ position: 'absolute', left: 18, right: 18, top: rowY(i + 1) - cardY - 1, height: 2, background: S.ink, opacity: 0.08 }} />)}
              {/* 格子 */}
              {rows.map((r, i) => {
                const v = r.cells[j];
                const a = cellAt(j, i);
                if (t < a) return null;
                const pop = springAt(t, a, 0.5);
                const draw = p(t, a + 0.1, a + 0.4);
                const box: React.CSSProperties = { position: 'absolute', left: 0, width: cw, top: rowY(i) - cardY, height: rowH, display: 'flex', alignItems: 'center', justifyContent: 'center' };
                if (v === true) return <div key={i} style={box}><Check d={sym} pop={mix(0.3, 1, pop)} draw={draw} /></div>;
                if (v === false) return <div key={i} style={box}><Cross d={sym} draw={draw} /></div>;
                return <div key={i} style={{ ...box, opacity: clamp((t - a) / 0.12), transform: `translateY(${(1 - p(t, a, a + 0.35)) * -16}px)` }}>
                  <span style={{ ...textBase(f, 900), color: S.ink }}>{String(v)}</span>
                </div>;
              })}
              {/* 合计 */}
              <div style={{ position: 'absolute', left: 18, right: 18, top: totalY - cardY - 2, height: 4, borderRadius: 2, background: S.ink, opacity: 0.85 * p(t, totAt(j) - 0.1, totAt(j) + 0.2) }} />
              {t >= totAt(j) && <div style={{ position: 'absolute', left: 0, width: cw, top: totalY - cardY, height: totalH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ ...textBase(f * 1.25, 900), color: won && lift > 0.5 ? accentOn(false) : S.ink, transform: `scale(${mix(0.6, 1, springAt(t, totAt(j), 0.5)) * (won ? mix(1, 1.12, lift) : 1)})`, display: 'inline-block' }}>{totals[j]}</span>
              </div>}
              {/* 退后：白蒙版（不失焦，仍读得出） */}
              <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.55 * back }} />
            </Surface>
            {/* 黑胶囊表头压在卡顶 */}
            <Pill box={{ x: x + cw / 2 - (cw - f * 0.6) / 2, y: top, w: cw - f * 0.6, h: pillH }} style={{ opacity: mix(1, 0.5, back) }}>
              <span style={{ ...textBase(f, 900), color: won && lift > 0.5 ? accentOn(true) : '#fff' }}>{name}</span>
            </Pill>
          </div>
        </div>;
      })}
    </Handoff>
    <Sfx name="whoosh-short" at={0.02} />
    {colAt.map((a, j) => <Sfx key={j} name="pop" at={a} />)}
    <Sfx name="ding" at={liftAt} />
  </Frame>;
}
