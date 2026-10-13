// T03e-StepChain：步骤折行串起（升级自 N027 流程线绕回）
// 观众要看懂的变化：一串步骤 → 依次串起并折到下一行，看到完整链路
// 原版（ChalkBoard.tsx）：黑板窗里 8 个节点 3/3/2 排三行，行内短箭头，行尾一条长线向右下拐、横扫回左侧、
// 再拐进下一行行首（S 形绕回）；整板自上而下遮罩揭开。
// 升级：保留“行内箭头 + 行尾绕回下一行”的拓扑；步骤 3–9 自动定每行个数（行数 ≥2 时才折行）、字号按最长一行算；
// 改为逐步出现、连线按顺序画出（口播 cue 驱动），外观换成 kit 的深色 MacWindow，线条只保留拓扑必需的干净单线。
import React from 'react';
import { S, accentOn, cueAt, p, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, MacWindow, Sfx, textBase, useT } from '../kit/ui';

export type StepChainProps = HandoffProps & {
  steps: string[];      // 3–9 个步骤
  title?: string;       // 窗口标题栏文字，可省
  highlight?: number;   // 需要染紫的步骤序号（从 0 开始），不需要就不传
  cues?: number[];      // [i] = 第 i 步出现（秒）
};

export const stepChainDefaults: StepChainProps = {
  steps: ['制作脚本', '设计分镜', '确定画风', '人物设定', '光影设计', '运镜手法', '动作设计', '剪辑拼接'],
  title: 'AI 视频制作流程',
};

     // 内容区最大宽
const INNER_H = 560;      // 内容区最大高（窗口 ≤ 820，保证不压角标）
const ARROW = 0.95;       // 行内箭头长度（×字号）
const PAD = 0.32;         // 文字与箭头间隙（×字号）
const PITCH = 2.3;        // 行距（×字号），中间留给绕回线

type Plan = { rows: number[][]; size: number };

// 平均分行：先排满的行在前，例如 7 → 3/2/2，8 → 3/3/2
function splitRows(n: number, per: number): number[][] {
  const rows = Math.ceil(n / per);
  const out: number[][] = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    const cnt = Math.ceil((n - k) / (rows - r));
    out.push(Array.from({ length: cnt }, (_, j) => k + j));
    k += cnt;
  }
  return out;
}

function plan(steps: string[]): Plan {
  const n = steps.length;
  let best: Plan | null = null;
  for (const per of [3, 4, 2, 5]) {
    const rows = splitRows(n, per);
    if (n >= 4 && rows.length < 2) continue;          // 有 4 步以上就要看到折行
    if (rows.length > 4) continue;
    const widest = Math.max(...rows.map((r) => r.reduce((w, i) => w + textWidth(steps[i], 1), 0) + (r.length - 1) * (ARROW + PAD * 2)));
    // 窗口总宽 ≤ 1740：内容 + 两侧绕回线（1.15×字号）+ 两侧留白（1.3×字号）
    const byW = 1740 / (widest + (rows.length > 1 ? 4.9 : 2.6));
    const byH = INNER_H / ((rows.length - 1) * PITCH + 1.2);
    const size = Math.min(rows.length === 1 ? 140 : 96, byW, byH);   // 单行时就是一句大字流程
    // 3 个一行是原版节奏，字号差不多时优先
    const score = size + (per === 3 ? 4 : 0);
    if (!best || score > best.size + (best.rows[0].length === 3 ? 4 : 0)) best = { rows, size };
  }
  return best ?? { rows: splitRows(n, 3), size: 56 };
}

function Arrowhead({ x, y, s, opacity }: { x: number; y: number; s: number; opacity: number }) {
  return <path d={`M${x - s} ${y - s * 0.75} L${x} ${y} L${x - s} ${y + s * 0.75}`} fill="none" stroke={S.faint}
    strokeWidth={Math.max(5, s * 0.3)} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />;
}

export function StepChain(props: Partial<StepChainProps>) {
  const c = { ...stepChainDefaults, ...props };
  const t = useT();
  const steps = c.steps.slice(0, 9);
  const n = steps.length;
  const { rows, size } = plan(steps);

  // ---- 几何 ----
  const pad = PAD * size, arrow = ARROW * size, pitch = PITCH * size;
  const rowW = rows.map((r) => r.reduce((w, i) => w + textWidth(steps[i], size), 0) + (r.length - 1) * (arrow + pad * 2));
  const contentW = Math.max(...rowW);
  const contentH = (rows.length - 1) * pitch + size * 1.2;
  const bulge = rows.length > 1 ? size * 1.15 : 0;                 // 绕回线在左右两侧伸出的宽度
  const winW = Math.min(1760, Math.max(1100, contentW + 2 * (bulge + size * 1.3)));
  const winH = Math.min(820, contentH + 90 + 2 * Math.max(95, size * 1.0));
  const win = { x: 960 - winW / 2, y: 540 - winH / 2 + 10, w: winW, h: winH };
  const left = 960 - contentW / 2;
  const top = win.y + 90 + (winH - 90 - contentH) / 2;
  const pos: { x: number; w: number; cy: number; row: number }[] = [];
  rows.forEach((r, ri) => {
    let x = left;
    r.forEach((i) => {
      const w = textWidth(steps[i], size);
      pos[i] = { x, w, cy: top + ri * pitch + size * 0.6, row: ri };
      x += w + pad * 2 + arrow;
    });
  });

  // ---- 时间：逐步出现，折行时多给 0.3s 让线绕回去 ----
  const wraps = rows.length - 1;
  const base = Math.min(1.0, (5.5 - 0.3 * wraps) / Math.max(1, n - 1));
  const appear: number[] = [];
  steps.forEach((_, i) => {
    const fallback = i === 0 ? 0.2 : appear[i - 1] + base + (pos[i].row !== pos[i - 1].row ? 0.3 : 0);
    appear.push(cueAt(c.cues, i, fallback));
  });
  const enter = p(t, 0, 0.5);

  // 连接线 i → i+1：行内短箭头，跨行是 S 形绕回
  const links = steps.slice(0, -1).map((_, i) => {
    const a = pos[i], b = pos[i + 1];
    const wrap = a.row !== b.row;
    const dur = wrap ? 0.6 : 0.32;
    const end = appear[i + 1] - 0.04;
    const start = Math.max(appear[i] + 0.15, end - dur);
    const prog = p(t, start, end);
    let d: string, tip: { x: number; y: number };
    if (!wrap) {
      const x0 = a.x + a.w + pad, x1 = b.x - pad;
      d = `M${x0} ${a.cy} L${x1} ${a.cy}`;
      tip = { x: x1, y: a.cy };
    } else {
      const ex = a.x + a.w + pad * 0.7, lx = b.x - pad;
      const mid = (a.cy + b.cy) / 2;
      d = `M${ex} ${a.cy} C${ex + bulge} ${a.cy} ${ex + bulge} ${mid} ${ex} ${mid} L${lx - pad} ${mid} ` +
          `C${lx - pad - bulge} ${mid} ${lx - pad - bulge} ${b.cy} ${lx} ${b.cy}`;
      tip = { x: lx, y: b.cy };
    }
    return { d, tip, prog, wrap, start };
  });

  const ink = '#fff';
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <MacWindow box={{ ...win, y: win.y + (1 - enter) * 50 }} title={c.title} style={{ opacity: enter }} />
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - enter) * 50}px)` }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {links.map((l, i) => l.prog > 0 && <React.Fragment key={i}>
            <path d={l.d} pathLength={1} fill="none" stroke={S.faint} strokeWidth={Math.max(5, size * 0.06)} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="1 1" strokeDashoffset={1 - l.prog} />
            <Arrowhead x={l.tip.x} y={l.tip.y} s={size * 0.2} opacity={l.prog > 0.92 ? 1 : 0} />
          </React.Fragment>)}
        </svg>
        {steps.map((s, i) => {
          const e = p(t, appear[i], appear[i] + 0.42);
          if (e <= 0) return null;
          return <div key={i} style={{ ...textBase(size, 900), position: 'absolute', left: pos[i].x, top: pos[i].cy - size * 0.58,
            color: c.highlight === i ? accentOn(true) : ink, opacity: e, transform: `translateX(${(1 - e) * -18}px)` }}>{s}</div>;
        })}
      </div>
    </Handoff>
    <Sfx name="pop" at={appear[0]} />
    {links.filter((l) => l.wrap).slice(0, 2).map((l, i) => <Sfx key={i} name="slide" at={l.start} />)}
    <Sfx name="ding" at={appear[n - 1]} />
  </Frame>;
}
