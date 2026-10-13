// T13c-CapacityFit：装不装得下
// 观众要看懂的变化：一个容器 → 东西放进去，装得下或溢出
// 关系：几只开口容器按容量画出真实高度比例；模型方块先悬在上方认清大小，再分身落进每只容器。
//       放不下的，露在容器口外的那一截变成紫色斑纹，并在同一高度标出“超出多少”；装得下的那只最后点亮。
//       和 T05e（卡片分拣到两边）、T15a（条形依次长出）不是同一动作：这里是“同一个东西往不同大小的容器里放”。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type Container = { size: number; label: string };
export type CapacityFitProps = HandoffProps & {
  item: { name: string; size: number };  // 要放进去的东西
  unit: string;                           // GB
  containers: Container[];                // 1–4 只，按顺序从左到右
  overText: string;                       // 溢出标签前缀：超出
  fitText: string;                        // 装得下的标签
  cues?: number[];                        // [0]=开始落下；[1]=装得下的那只点亮
};

// 113 期第 5 段：完整版约 52GB；常见游戏显卡 8–24GB，作者建议 80GB 以上
export const capacityFitDefaults: CapacityFitProps = {
  item: { name: 'JEV-27B 完整版', size: 52 },
  unit: 'GB',
  containers: [
    { size: 8, label: '入门游戏卡' },
    { size: 24, label: '高端游戏卡' },
    { size: 80, label: '专业显卡' },
  ],
  overText: '超出',
  fitText: '装得下',
};

const BASE = 748;          // 容器底
const MAX_H = 440;         // 最大量对应的高度
const WALL = 10;
const SRC_TOP = 128;

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

export function CapacityFit(props: Partial<CapacityFitProps>) {
  const c = { ...capacityFitDefaults, ...props };
  const t = useT();
  const cs = c.containers.slice(0, 4);
  const n = Math.max(1, cs.length);

  // ---- 几何 ----
  const gap = n <= 3 ? 150 : 96;
  const colW = Math.min(n === 1 ? 400 : 300, (1600 - (n - 1) * gap) / n);
  const total = n * colW + (n - 1) * gap;
  const colX = (i: number) => 960 - total / 2 + i * (colW + gap);   // 左边
  const maxCap = Math.max(c.item.size, ...cs.map((k) => k.size));
  const k = MAX_H / maxCap;
  const ch = (v: number) => Math.max(26, v * k);
  const bw = colW - WALL * 2 - 20;
  const bh = c.item.size * k;
  const blockTop = BASE - WALL / 2 - 4 - bh;
  const fits = cs.map((x) => x.size >= c.item.size);
  const fitIdx = fits.findIndex(Boolean);

  // 字号
  const capSize = Math.min(66, ...cs.map((x) => (colW + gap * 0.6) / Math.max(1, textWidth(fmt(x.size) + c.unit, 1))));
  const labSize = Math.max(30, Math.min(36, ...cs.map((x) => (colW + gap * 0.6) / Math.max(1, textWidth(x.label, 1)))));
  const numSize = Math.min(64, (bw - 30) / Math.max(1, textWidth(fmt(c.item.size) + c.unit, 1)));
  // 名字一行放不下（小于 26px）就折成两行，不缩到读不清
  const nameOne = Math.min(34, (bw - 30) / Math.max(1, textWidth(c.item.name, 1)));
  const nameLines = nameOne < 26 ? 2 : 1;
  const nameSize = nameLines === 1 ? nameOne : Math.min(34, ((bw - 30) * 2 * 0.9) / Math.max(1, textWidth(c.item.name, 1)));
  const pillSize = Math.min(40, ...cs.map((x) => (colW + gap - 70) / Math.max(1, textWidth(x.size >= c.item.size ? c.fitText : `${c.overText} ${fmt(c.item.size - x.size)}${c.unit}`, 1))));
  const pillH = pillSize * 1.9;
  const pillCY = blockTop - pillH / 2 - 24;

  // ---- 时间 ----
  const src = p(t, 0.02, 0.45);
  const dropAt = cueAt(c.cues, 0, 1.05);
  const order = cs.map((_, i) => i).sort((a, b) => Math.abs(colX(a) + colW / 2 - 960) - Math.abs(colX(b) + colW / 2 - 960) || a - b);
  const spread = q(t, dropAt, dropAt + 0.5);                 // 分身从主方块后面横向滑出，停在各自容器上方
  const lead = order[0];                                      // 主方块：去离中间最近的那只，始终在最上层
  const startOf = (i: number) => dropAt + 0.42 + order.indexOf(i) * 0.16;
  const landOf = (i: number) => startOf(i) + 0.55;
  const lastLand = Math.max(...cs.map((_, i) => landOf(i)));
  const fitAt = cueAt(c.cues, 1, lastLand + 0.55);
  const fitOn = p(t, fitAt, fitAt + 0.45);

  // 方块上的字放在面积够大的那一截里（紫色溢出段或黑色段），不让颜色分界线穿过文字
  const textH = nameSize * 1.16 * nameLines + numSize * 1.16 + 4;
  const labelBand = (overH: number) => {
    const inside = bh - overH;
    if (overH >= textH + 28 && overH >= inside) return { top: 0, height: overH };
    if (inside >= textH + 28) return { top: overH, height: inside };
    if (overH >= textH + 28) return { top: 0, height: overH };
    return { top: 0, height: bh };
  };
  const block = (x: number, y: number, key: string, overH: number, stripe: number, textOpacity = 1, z = 1) => (
    <div key={key} style={{ position: 'absolute', zIndex: z, left: x, top: y, width: bw, height: bh, borderRadius: 14, background: S.dark, boxShadow: S.capsuleShadow, overflow: 'hidden' }}>
      {overH > 0 && stripe > 0 && <svg width={bw} height={overH} style={{ position: 'absolute', left: 0, top: 0, clipPath: `inset(${100 * (1 - stripe)}% 0 0 0)` }}>
        <defs>
          <pattern id={`st-${key}`} width={30} height={30} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={30} height={30} fill={S.accent} />
            <rect width={12} height={30} fill="#fff" opacity={0.2} />
          </pattern>
        </defs>
        <rect width={bw} height={overH} fill={`url(#st-${key})`} />
      </svg>}
      <div style={{ position: 'absolute', left: 0, right: 0, opacity: textOpacity, ...labelBand(overH), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <span style={{ ...textBase(nameSize, 500), color: '#fff', whiteSpace: nameLines === 2 ? 'normal' : 'nowrap', width: bw - 30, textAlign: 'center' }}>{c.item.name}</span>
        <span style={{ ...textBase(numSize, 900), color: '#fff' }}>{fmt(c.item.size)}{c.unit}</span>
      </div>
    </div>
  );

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 容器：开口 U 形，高度按容量比例 */}
      {cs.map((x, i) => {
        const x0 = colX(i), x1 = x0 + colW, top = BASE - ch(x.size);
        const r = Math.min(20, ch(x.size) / 2);
        const draw = p(t, 0.05 + i * 0.08, 0.6 + i * 0.08);
        const lab = p(t, 0.2 + i * 0.08, 0.65 + i * 0.08);
        const lit = i === fitIdx ? fitOn : 0;
        const d = `M${x0} ${top} L${x0} ${BASE - r} Q${x0} ${BASE} ${x0 + r} ${BASE} L${x1 - r} ${BASE} Q${x1} ${BASE} ${x1} ${BASE - r} L${x1} ${top}`;
        return <React.Fragment key={i}>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <path d={d} pathLength={1} fill="none" stroke={S.ink} strokeWidth={WALL} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          </svg>
          <div style={{ position: 'absolute', left: x0 - gap / 2, width: colW + gap, top: BASE + 26 + (1 - lab) * 16, textAlign: 'center', opacity: lab }}>
            <div style={{ ...textBase(capSize, 900), color: lit > 0.5 ? accentOn(false) : S.ink }}>{fmt(x.size)}{c.unit}</div>
            <div style={{ ...textBase(labSize, 500), color: S.muted, marginTop: 4 }}>{x.label}</div>
          </div>
        </React.Fragment>;
      })}

      {/* 悬在上方的方块：先认清大小（落下开始后由各分身接手） */}
      {t < dropAt && block(960 - bw / 2, SRC_TOP + (1 - src) * 30, 'src', 0, 0)}

      {/* 分身落进各容器 */}
      {t >= dropAt && cs.map((x, i) => {
        const a = startOf(i);
        const fall = p(t, a, a + 0.55) * 1.03 - 0.03 * q(t, a + 0.55, a + 0.78);
        const xOf = (j: number) => mix(960 - bw / 2, colX(j) + colW / 2 - bw / 2, spread);
        const tx = xOf(i);
        const ty = mix(SRC_TOP, blockTop, fall);
        const overH = Math.max(0, (c.item.size - x.size) * k);
        const stripe = p(t, landOf(i), landOf(i) + 0.35);
        // 还藏在主方块后面时不显示字，完全滑出后字再出现，避免两层字叠在一起
        const clear = i === lead ? 1 : clamp((Math.abs(tx - xOf(lead)) - bw) / 30);
        return block(tx, ty, `b${i}`, overH, stripe, clear, i === lead ? 3 : 2);
      })}

      {/* 同一高度的结果标签 */}
      {cs.map((x, i) => {
        const fit = fits[i];
        const a = fit ? fitAt : landOf(i) + 0.22;
        const v = p(t, a, a + 0.42) * 1.05 - 0.05 * q(t, a + 0.42, a + 0.62);
        if (v <= 0) return null;
        const text = fit ? c.fitText : `${c.overText} ${fmt(c.item.size - x.size)}${c.unit}`;
        const w = textWidth(text, pillSize) + pillSize * 1.6;
        const box = { x: colX(i) + colW / 2 - w / 2, y: pillCY - pillH / 2, w, h: pillH };
        const style = { transform: `scale(${v})`, opacity: clamp(v * 3), zIndex: 30 };
        if (fit) return <Pill key={i} box={box} style={style}>
          <span style={{ ...textBase(pillSize, 900), color: accentOn(true) }}>{text}</span>
        </Pill>;
        const num = `${fmt(c.item.size - x.size)}${c.unit}`;
        return <Surface key={i} box={box} radius={pillH / 2} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...textBase(pillSize, 900), color: S.ink }}>{c.overText} <span style={{ color: accentOn(false) }}>{num}</span></span>
        </Surface>;
      })}
    </Handoff>
    <Sfx name="pop" at={0.02} />
    <Sfx name="slide" at={dropAt} />
    <Sfx name="pop" at={Math.min(...cs.map((_, i) => landOf(i))) + 0.22} />
    {fitIdx >= 0 && <Sfx name="ding" at={fitAt} />}
  </Frame>;
}
