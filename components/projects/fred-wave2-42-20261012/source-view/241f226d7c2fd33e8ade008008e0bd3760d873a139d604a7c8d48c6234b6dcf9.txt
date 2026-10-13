// T03c-Cycle：三者循环互通（升级自 L81-B064）
// 观众要看懂的变化：几个环节 → 连成互通的循环，再落一个结论
// 原版：黑窗里“记录 / 整理 / 检索”三角排布，三条手绘双向箭头依次画出；之后整窗失焦、前景出紫色大字结论，
// 再回到三角并在下方点出“随时找回”。
// 升级：节点 3–4 个（3 = 三角，4 = 四角环），字号按最长节点自适应；双向箭头保留为干净的单线 + 两端箭头
// （拓扑必需），手绘质感只保留“依次画出”的动作；画完后沿环逐个点亮一圈表达“互通”；
// 结论用材料→结论的退后方式（窗内失焦 + 压暗）落在前景，一句话只染紫一处。窗口统一为 kit MacWindow。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, MacWindow, Sfx, textBase, useT } from '../kit/ui';

export type CycleProps = HandoffProps & {
  nodes: string[];      // 3–4 个环节，按循环顺序
  result: string;       // 落定的结论
  highlight: string;    // result 里染紫的部分（深窗内 → #D6BEFF）
  cues?: number[];      // [0..n-1] 各环节出现；[n] 结论落定
};

export const cycleDefaults: CycleProps = {
  nodes: ['记录', '检索', '整理'],
  result: '重要内容随时找回',
  highlight: '随时找回',
};

const WIN = { x: 260, y: 140, w: 1400, h: 840 };
const BODY_CY = WIN.y + 90 + (WIN.h - 90) / 2;

export function Cycle(props: Partial<CycleProps>) {
  const c = { ...cycleDefaults, ...props };
  const t = useT();
  const nodes = c.nodes.slice(0, 4);
  const n = nodes.length;

  // ---- 节点位置：3 = 正三角（上 / 右下 / 左下，顺时针），4 = 四角（左上 / 右上 / 右下 / 左下）----
  const longest = Math.max(...nodes.map((s) => textWidth(s, 1)));
  // 三角：底边两点 ±400；四角：左右间距随最长节点放宽，保证横边至少约 240px
  const size = n === 3
    ? Math.min(130, 470 / Math.max(1, longest))
    : Math.min(130, 265 / (longest / 2 + 0.42));
  const halfMax = (longest * size) / 2 + size * 0.42;
  const rx = Math.min(650 - halfMax, Math.max(380, halfMax + 200));
  const pts = n === 3
    ? [{ x: 960, y: BODY_CY - 225 }, { x: 960 + 400, y: BODY_CY + 205 }, { x: 960 - 400, y: BODY_CY + 205 }]
    : [{ x: 960 - rx, y: BODY_CY - 190 }, { x: 960 + rx, y: BODY_CY - 190 }, { x: 960 + rx, y: BODY_CY + 190 }, { x: 960 - rx, y: BODY_CY + 190 }];
  const half = nodes.map((s) => ({ w: textWidth(s, size) / 2 + size * 0.42, h: size * 0.62 + size * 0.3 }));

  // ---- 时间 ----
  const appear = nodes.map((_, i) => cueAt(c.cues, i, 0.25 + i * (n === 3 ? 0.5 : 0.42)));
  const edgeAt = nodes.map((_, i) => (i < n - 1 ? Math.max(appear[i], appear[i + 1]) + 0.1 : appear[n - 1] + 0.55));
  const loopAt = edgeAt[n - 1] + 0.6;
  const step = 0.3;
  const resultAt = cueAt(c.cues, n, loopAt + n * step + 0.25);
  const recede = q(t, resultAt - 0.05, resultAt + 0.45);
  const res = p(t, resultAt + 0.1, resultAt + 0.6);
  const enter = p(t, 0, 0.5);

  // 边：两个节点框之间，去掉框内部分
  const trim = (a: number, b: number) => {
    const A = pts[a], B = pts[b];
    const dx = B.x - A.x, dy = B.y - A.y;
    const k = (h: { w: number; h: number }) => Math.min(h.w / Math.max(1e-6, Math.abs(dx)), h.h / Math.max(1e-6, Math.abs(dy)));
    const ka = k(half[a]), kb = k(half[b]);
    return { x0: A.x + dx * ka, y0: A.y + dy * ka, x1: B.x - dx * kb, y1: B.y - dy * kb };
  };
  const head = (x: number, y: number, ux: number, uy: number, s: number) =>
    `M${x - ux * s - uy * s * 0.72} ${y - uy * s + ux * s * 0.72} L${x} ${y} L${x - ux * s + uy * s * 0.72} ${y - uy * s - ux * s * 0.72}`;

  // 一圈点亮：当前节点染紫 0.3s，传给下一个
  const litNode = (i: number) => {
    const a = loopAt + i * step;
    return clamp((t - a) / 0.08) * (1 - clamp((t - a - step) / 0.12));
  };
  const litEdge = (i: number) => {
    const a = loopAt + i * step + step * 0.5;
    return clamp((t - a) / 0.1) * (1 - clamp((t - a - step) / 0.15));
  };

  const hi = c.highlight && c.result.includes(c.highlight) ? c.highlight : '';
  const [before, after = ''] = hi ? c.result.split(hi) : [c.result, ''];
  const rSize = Math.min(150, 1180 / Math.max(1, textWidth(c.result, 1)));

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 50}px)` }}>
        <MacWindow box={WIN} />
        {/* 窗内材料层：结论出现时失焦 + 压暗退后 */}
        <div style={{ position: 'absolute', left: WIN.x, top: WIN.y + 90, width: WIN.w, height: WIN.h - 90, overflow: 'hidden', borderRadius: '0 0 36px 36px' }}>
          <div style={{ position: 'absolute', left: -WIN.x, top: -(WIN.y + 90), width: 1920, height: 1080,
            filter: recede > 0 ? `blur(${recede * 16}px)` : undefined, opacity: mix(1, 0.32, recede) }}>
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              {nodes.map((_, i) => {
                const j = (i + 1) % n;
                if (n === 2 && i === 1) return null;
                const e = trim(i, j);
                const prog = p(t, edgeAt[i], edgeAt[i] + 0.45);
                if (prog <= 0) return null;
                // 从中点向两端同时画出（双向）
                const mx = (e.x0 + e.x1) / 2, my = (e.y0 + e.y1) / 2;
                const ax = mix(mx, e.x0, prog), ay = mix(my, e.y0, prog), bx = mix(mx, e.x1, prog), by = mix(my, e.y1, prog);
                const len = Math.hypot(e.x1 - e.x0, e.y1 - e.y0), ux = (e.x1 - e.x0) / len, uy = (e.y1 - e.y0) / len;
                const glow = litEdge(i);
                const col = glow > 0 ? `rgba(255,255,255,${mix(0.62, 1, glow)})` : S.faint;
                const sw = Math.max(6, size * 0.07);
                return <g key={i} stroke={col} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d={`M${ax} ${ay} L${bx} ${by}`} />
                  {prog > 0.97 && <><path d={head(e.x1, e.y1, ux, uy, size * 0.24)} /><path d={head(e.x0, e.y0, -ux, -uy, size * 0.24)} /></>}
                </g>;
              })}
            </svg>
            {nodes.map((s, i) => {
              const e = p(t, appear[i], appear[i] + 0.42);
              if (e <= 0) return null;
              const lit = litNode(i);
              return <div key={i} style={{ ...textBase(size, 900), position: 'absolute', left: pts[i].x - textWidth(s, size) / 2, top: pts[i].y - size * 0.58,
                color: lit > 0.5 ? accentOn(true) : '#fff', textShadow: S.textShadowDark, opacity: e,
                transform: `translateY(${(1 - e) * 22}px) scale(${1 + 0.06 * lit})` }}>{s}</div>;
            })}
          </div>
        </div>
        {res > 0 && <div style={{ position: 'absolute', left: WIN.x, width: WIN.w, top: BODY_CY - rSize * 0.58 + (1 - res) * 24, textAlign: 'center',
          ...textBase(rSize, 400, S.display), color: '#fff', textShadow: S.textShadowDark, opacity: res }}>
          {before}{hi && <span style={{ color: accentOn(true) }}>{hi}</span>}{after}
        </div>}
      </div>
    </Handoff>
    <Sfx name="pop" at={appear[0]} />
    <Sfx name="woosh" at={loopAt} />
    <Sfx name="ding" at={resultAt + 0.1} />
  </Frame>;
}
