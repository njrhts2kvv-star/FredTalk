// T20d-PosterReveal：作品错层汇聚后散开，中央让出主题
// 观众要看懂的变化：一堆作品汇聚 → 散到四边，中央落出主题
// 升级自 N038：保留“作品先聚成一堆、再向四周散开、中央出现主题大字”的关系。
// 按 Fred 意见“动画需要调整更自然”重做：
//   - 原版 0.1–3.5s 整堆持续慢放大（全程慢漂），卡片越长越大互相乱压；散开时一次推出 900px，
//     大部分卡片直接出画、只剩被裁的残片；主题逐字由灰变紫、带 18px 模糊，首帧发灰。
//   - 现在：每张作品从画外沿自己的方向飞入（ease-out，错层 = 大小/层级/角度各不同），在中央叠成一摞后停稳 0.3s；
//     再沿“来时的方向”退回到四边的固定落点（全部有完整可辨的一角，不是残片），中央空出主题区；
//     主题整句一次上浮落定（墨色 + 一处紫色），没有逐字发灰和模糊。
import React from 'react';
import { S, cueAt, mix, p, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Sfx, textBase, useT } from '../kit/ui';

export type PosterRevealProps = HandoffProps & {
  works: string[];      // 4–10 张作品（public 相对路径，图片或视频）
  title: string;        // 中央主题；可用 \n 指定两行断点，否则过长时自动对半断行
  highlight?: string;   // 主题里染紫的一处（浅底 #8554E8）
  cues?: number[];      // [0]=开始散开；[1]=主题落定。不传用默认节奏
};

export const posterRevealDefaults: PosterRevealProps = {
  works: [
    'media/w4-work-6.jpg', 'media/w4-work-1.jpg', 'media/w4-work-5.jpg', 'media/w4-work-4.jpg',
    'media/w4-work-7.jpg', 'media/w4-work-2.jpg', 'media/w4-work-8.jpg', 'media/w4-work-3.jpg',
  ],
  title: '免费工具也能出片',
  highlight: '免费',
};

// 四边落点（中心坐标、宽高、角度）。中央 560–1360 × 380–700 留给主题；右上 1549–1895 × 36–121 让给角标。
// 顺序按“对角交替”排：任意前 n 张都分布在四边，不会只堆在上半屏
const SLOTS = [
  { x: 270, y: 215, w: 430, h: 270, r: -5 },    // 左上
  { x: 1660, y: 850, w: 450, h: 290, r: -4 },   // 右下
  { x: 1215, y: 150, w: 400, h: 250, r: -3 },   // 上中右
  { x: 690, y: 935, w: 420, h: 260, r: -3 },    // 下中左
  { x: 1690, y: 360, w: 400, h: 260, r: 5 },    // 右上（角标下方）
  { x: 230, y: 760, w: 400, h: 300, r: 5 },     // 左下
  { x: 760, y: 135, w: 380, h: 230, r: 3 },     // 上中左
  { x: 1175, y: 945, w: 400, h: 250, r: 3 },    // 下中右
  { x: 95, y: 480, w: 300, h: 200, r: -2 },     // 左缘
  { x: 1840, y: 610, w: 300, h: 200, r: 3 },    // 右缘
];

// 汇聚时的叠放：围着中心小幅错开，层层不同角度与大小（错层）
const PILE_SCALE = 1.62;   // 汇聚时整摞放大到画面主体尺寸（单张约 650×400），散开时回到 1
const PILE = [
  { dx: -40, dy: -20, r: -8, s: 0.78 }, { dx: 30, dy: -34, r: 6, s: 0.72 }, { dx: -22, dy: 26, r: 4, s: 0.8 },
  { dx: 46, dy: 18, r: -5, s: 0.74 }, { dx: -6, dy: -6, r: 9, s: 0.82 }, { dx: 24, dy: 34, r: -3, s: 0.76 },
  { dx: -36, dy: 8, r: 2, s: 0.7 }, { dx: 10, dy: -14, r: -6, s: 0.84 }, { dx: -18, dy: -30, r: 7, s: 0.7 }, { dx: 34, dy: 4, r: -2, s: 0.72 },
];

function splitTitle(title: string): string[] {
  if (title.includes('\n')) return title.split('\n').slice(0, 2).map((l) => l.trim());   // 手动断行优先
  if (1000 / Math.max(1, textWidth(title, 1)) >= 100) return [title];
  const chars = Array.from(title);
  const total = textWidth(title, 1);
  let best = 1, bestScore = Infinity;
  for (let k = 1; k < chars.length; k++) {
    const left = textWidth(chars.slice(0, k).join(''), 1);
    // 尽量对半；在空格或标点后断行加分
    const bonus = /[\s，,、：:]/.test(chars[k - 1]) ? -0.8 : 0;
    const score = Math.abs(left - total / 2) + bonus;
    if (score < bestScore) { bestScore = score; best = k; }
  }
  return [chars.slice(0, best).join('').trim(), chars.slice(best).join('').trim()];
}

function renderHighlight(line: string, highlight?: string) {
  if (!highlight || !line.includes(highlight)) return line;
  const i = line.indexOf(highlight);
  return <>{line.slice(0, i)}<span style={{ color: S.accent }}>{highlight}</span>{line.slice(i + highlight.length)}</>;
}

export function PosterReveal(props: Partial<PosterRevealProps>) {
  const c = { ...posterRevealDefaults, ...props };
  const t = useT();
  const works = c.works.slice(0, SLOTS.length);
  const n = works.length;
  const grow = n <= 4 ? 1.3 : n <= 6 ? 1.12 : 1;   // 作品少时落点卡片放大，四边不留大块空白

  const spreadAt = cueAt(c.cues, 0, 1.45);
  const titleAt = cueAt(c.cues, 1, spreadAt + 0.45);   // 等大部分卡片离开中央再落字

  // 飞入：0.05s 起，每张间隔 0.06s，单张 0.62s（汇聚 ~0.72s 的固定时长附近）
  const flyIn = (i: number) => p(t, 0.05 + i * 0.06, 0.05 + i * 0.06 + 0.62);
  // 散开：从顶层先走，间隔 0.035s，单张 0.8s
  const spread = (i: number) => p(t, spreadAt + (n - 1 - i) * 0.035, spreadAt + (n - 1 - i) * 0.035 + 0.8);

  // 主题：一行放得下（字号 ≥ 100）就一行；否则在中点附近断成两行，两行共用字号
  const lines = splitTitle(c.title);
  const size = Math.min(lines.length > 1 ? 130 : 150, 1000 / Math.max(1, ...lines.map((l) => textWidth(l, 1))));
  const tv = p(t, titleAt, titleAt + 0.55);
  const lineH = size * 1.16;
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {works.map((src, i) => {
        const base = SLOTS[i], pile = PILE[i];
        const slot = { ...base, w: base.w * grow, h: base.h * grow };
        // 方向：从中心指向落点；飞入起点在落点外侧更远处（画外），散开回到落点 = 沿来路退回
        const vx = slot.x - 960, vy = slot.y - 540, len = Math.hypot(vx, vy) || 1;
        const outX = slot.x + (vx / len) * 900, outY = slot.y + (vy / len) * 700;
        const a = flyIn(i), b = spread(i);
        const pileX = 960 + pile.dx * 1.6, pileY = 540 + pile.dy * 1.6, ps = (pile.s * PILE_SCALE) / grow;
        const x = b > 0 ? mix(pileX, slot.x, b) : mix(outX, pileX, a);
        const y = b > 0 ? mix(pileY, slot.y, b) : mix(outY, pileY, a);
        const rot = b > 0 ? mix(pile.r, slot.r, b) : mix(pile.r * 2, pile.r, a);
        const sc = b > 0 ? mix(ps, 1, b) : mix(ps * 1.12, ps, a);
        return <div key={i} style={{
          position: 'absolute', left: x - slot.w / 2, top: y - slot.h / 2, width: slot.w, height: slot.h,
          transform: `rotate(${rot}deg) scale(${sc})`, borderRadius: S.radius, boxShadow: S.shadow, background: '#fff',
          opacity: Math.min(1, a * 3), zIndex: i,
        }}>
          <Media src={src} box={{ x: 0, y: 0, w: slot.w, h: slot.h }} radius={S.radius} />
        </div>;
      })}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 540 - (lines.length * lineH) / 2 + (1 - tv) * 40,
        textAlign: 'center', color: S.ink, opacity: tv, zIndex: 50,
      }}>
        {lines.map((l, k) => <div key={k} style={{ ...textBase(size, 900) }}>{renderHighlight(l, c.highlight)}</div>)}
      </div>
    </Handoff>
    <Sfx name="gather" at={0.05} />
    <Sfx name="slide" at={spreadAt} />
    <Sfx name="pop" at={titleAt} volume={0.4} />
  </Frame>;
}
