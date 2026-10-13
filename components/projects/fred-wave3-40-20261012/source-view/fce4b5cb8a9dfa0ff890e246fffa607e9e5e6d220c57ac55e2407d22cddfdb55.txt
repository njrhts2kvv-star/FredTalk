// T13a-StackLayers：分层结构
// 观众要看懂的变化：几层从下往上叠起 → 当前讲的那一层被点亮
// 关系：几块带厚度的板（正面 + 透视顶面）从底层开始逐块落下、压在下一层上（下层被压得轻轻一沉）；
//       叠好后，目标层像抽屉一样“拉开”：板变黑、略微前凸、正面向下展开，说明写在展开的这一截里，其余层退淡、上下让位。
//       和 T04d（树状分支后聚焦一类）、T03d（因果错位推进）不是同一动作：这里是“物理叠层 + 拉开一层”。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth, wipe } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type StackLayer = {
  name: string;     // 层名（锐字真言大字）：应用 / 模型 / 算力
  item: string;     // 这一层里的具体东西：Codex / JEV-27B / RTX PRO 6000
  logo?: string;    // 可选：真实 Logo（public 路径）
};
export type StackLayersProps = HandoffProps & {
  layers: StackLayer[];   // 从上到下 2–5 层（落下顺序是从最底层开始）
  focus: number;          // 点亮第几层（从 0 开始，按上到下）
  note: string;           // 点亮后在这一层里展开的说明
  highlight: string;      // note 里染紫的词（黑板上 #D6BEFF）；'' 不染
  cues?: number[];        // [0..n-1] 从最底层开始逐层落下；[n] 点亮目标层
};

// 113 期：讲“部署”时，模型层被点亮——模型落在算力上跑起来
export const stackLayersDefaults: StackLayersProps = {
  layers: [
    { name: '应用', item: 'Codex', logo: 'media/x8-codex.png' },
    { name: '模型', item: 'JEV-27B' },
    { name: '算力', item: 'RTX PRO 6000 · 96GB' },
  ],
  focus: 1,
  note: '部署：把模型放到这台机器上跑起来',
  highlight: '跑起来',
};

// 锐字真言的拉丁字形不适合产品名：拉丁片段改用 MiSans Heavy（同字号、同基线）
function DisplayText({ text, size, color }: { text: string; size: number; color: string }) {
  const runs = text.match(/[\u0000-ÿ]+|[^\u0000-ÿ]+/g) ?? [text];
  return <span style={{ ...textBase(size, 400, S.display), color }}>
    {runs.map((r, i) => /^[\u0000-ÿ]+$/.test(r)
      ? <span key={i} style={{ fontFamily: S.body, fontWeight: 900 }}>{r}</span>
      : <React.Fragment key={i}>{r}</React.Fragment>)}
  </span>;
}

// 圆角多边形（只给指定的角加圆角）
const roundedPath = (pts: [number, number][], radii: number[]) => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[(i - 1 + n) % n];
    const [nx, ny] = pts[(i + 1) % n];
    const r = radii[i];
    const l1 = Math.hypot(px - x, py - y), l2 = Math.hypot(nx - x, ny - y);
    const a = [x + ((px - x) / l1) * r, y + ((py - y) / l1) * r];
    const b = [x + ((nx - x) / l2) * r, y + ((ny - y) / l2) * r];
    d += `${i === 0 ? 'M' : 'L'}${a[0]} ${a[1]} Q${x} ${y} ${b[0]} ${b[1]} `;
  }
  return d + 'Z';
};

// 落定过冲：主曲线先到 1+amount，再用 smoothstep 回到 1
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);
const bump = (t: number, a: number, dur: number) => {
  const v = clamp((t - a) / dur);
  return v > 0 && v < 1 ? Math.sin(Math.PI * v) : 0;
};

const W = 1120;
const CX = 960;
const CY = 498;
const PAD = 60;

export function StackLayers(props: Partial<StackLayersProps>) {
  const c = { ...stackLayersDefaults, ...props };
  const t = useT();
  const layers = c.layers.slice(0, 5);
  const n = Math.max(1, layers.length);
  const fi = Math.min(n - 1, Math.max(0, c.focus));

  // ---- 版式：先按终态算几何 ----
  const H = n <= 3 ? 136 : n === 4 ? 112 : 92;      // 正面高
  const D = n <= 3 ? 48 : n === 4 ? 40 : 34;        // 透视顶面高
  const G = n <= 3 ? 30 : n === 4 ? 24 : 18;        // 层间空隙
  const inset = W * 0.035;                          // 顶面后缘收窄（透视）
  const nameSize = Math.min(H * 0.5, 70, ...layers.map((l) => 300 / Math.max(1, textWidth(l.name, 1))));
  const logoS = H * 0.46;
  const itemFit = Math.max(...layers.map((l) => textWidth(l.item, 1) + (l.logo ? (logoS + 22) / 50 : 0)), 1);
  const itemSize = Math.min(H * 0.36, 50, (W - PAD * 2 - 360) / itemFit);
  const noteSize = Math.min(52, (W - PAD * 2) / Math.max(1, textWidth(c.note, 1)));
  const E = noteSize * 1.16 + (n <= 3 ? 50 : 40);  // 拉开后多出来的一截

  // ---- 时间 ----
  const land = (j: number) => cueAt(c.cues, j, 0.06 + j * 0.5 + j * j * 0.04);   // j = 从底层数第几块
  const lastLand = land(n - 1);
  const F = cueAt(c.cues, n, lastLand + 1.0);
  const lit = p(t, F, F + 0.65);
  const sweep = wipe(t, F, F + 0.5);   // 黑面从左向右擦过这一层（两层反色，不经过灰色中间态）
  const open = q(t, F, F + 0.6);
  const noteIn = p(t, F + 0.28, F + 0.78);

  const fullH = (e: number) => n * (D + H) + (n - 1) * G + E * e;
  const topOf = (i: number, e: number) => {
    let y = CY - fullH(e) / 2;
    for (let k = 0; k < i; k++) y += D + H + (k === fi ? E * e : 0) + G;
    return y;
  };

  const hi = c.highlight && c.note.includes(c.highlight) ? c.highlight : '';
  const [nb, na = ''] = hi ? c.note.split(hi) : [c.note, ''];

  const order = Array.from({ length: n }, (_, k) => n - 1 - k);   // 从底层开始画，上层盖在下层之上

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {order.map((i) => {
        const L = layers[i];
        const j = n - 1 - i;
        const a = land(j);
        const drop = overshoot(t, a, 0.46, 0.2, 0.045);
        const vis = clamp((t - a) / 0.12);
        if (vis <= 0) return null;
        // 上一层落下压到这一层时，这一层轻轻一沉
        const above = i > 0 ? land(j + 1) : -10;
        const dip = i > 0 ? 7 * bump(t, above + 0.2, 0.32) : 0;
        const isF = i === fi;
        const e = open;
        const h = H + (isF ? E * e : 0);
        const y0 = topOf(i, e) + mix(-210, 0, drop) + dip;
        const x0 = CX - W / 2;
        const sw = isF ? sweep : 0;
        const dim = isF ? 0 : lit;
        const sc = isF ? 1 + 0.045 * lit : 1 - 0.015 * lit;
        const topPath = roundedPath([[x0 + inset, y0], [x0 + W - inset, y0], [x0 + W, y0 + D], [x0, y0 + D]], [14, 14, 0, 0]);
        const face = (dark: boolean) => {
          const ink = dark ? '#fff' : S.ink;
          return <div style={{ position: 'absolute', inset: 0, background: dark ? S.dark : '#fff', borderRadius: '0 0 22px 22px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: PAD, right: PAD, top: 0, height: H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 1 - 0.62 * dim }}>
              <DisplayText text={L.name} size={nameSize} color={ink} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                {L.logo ? <Img src={staticFile(L.logo)} style={{ width: logoS, height: logoS, objectFit: 'contain' }} /> : null}
                <span style={{ ...textBase(itemSize, 900), color: ink }}>{L.item}</span>
              </div>
            </div>
            {dark && noteIn > 0 && <div style={{
              position: 'absolute', left: PAD, top: H - 6, ...textBase(noteSize, 500), color: '#fff',
              clipPath: `inset(0 ${100 * (1 - noteIn)}% 0 0)`, transform: `translateX(${(1 - noteIn) * 24}px)`,
            }}>
              {nb}{hi && <span style={{ fontWeight: 900, color: accentOn(true) }}>{hi}</span>}{na}
            </div>}
          </div>;
        };
        return <div key={i} style={{
          position: 'absolute', inset: 0, opacity: vis, zIndex: isF ? 20 : 10,
          transform: `scale(${sc})`, transformOrigin: `${CX}px ${y0 + D + h / 2}px`,
        }}>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <path d={topPath} fill="#f4f4f6" />
          </svg>
          {sw > 0 && <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${1920 - x0 - W * sw}px 0 0)` }}>
            <path d={topPath} fill="#3a3a40" />
          </svg>}
          <div style={{ position: 'absolute', left: x0, top: y0 + D, width: W, height: h, borderRadius: '0 0 22px 22px', boxShadow: sw > 0.5 ? S.capsuleShadow : S.shadow }}>
            {face(false)}
            {sw > 0 && <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${W * (1 - sw)}px 0 0)` }}>{face(true)}</div>}
          </div>
        </div>;
      })}
    </Handoff>
    <Sfx name="pop" at={land(0)} />
    <Sfx name="pop" at={lastLand} />
    <Sfx name="woosh" at={F} />
  </Frame>;
}
