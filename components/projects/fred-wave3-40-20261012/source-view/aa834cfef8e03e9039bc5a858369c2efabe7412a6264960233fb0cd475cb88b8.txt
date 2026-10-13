// T15g-RankReveal：排行揭晓
// 观众要看懂的变化：名次从后往前一行行翻上来 → 第一名最后揭晓
// 关系：先铺好各名次的空位，再从最后一名开始，一行行以底边为轴“翻”起（rotateX 由帧算，分数随翻起滚到位）；
//       最后停一拍，第一名更大、黑底、弹着翻出。和 T15a（条形长度排名）不同：这里比的是“谁在第几”的揭晓顺序，不是长度。
import React from 'react';
import { S, clamp, cueAt, mix, p, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Sfx, Surface, textBase, useT } from '../kit/ui';

export type RankRow = { name: string; score: number; logo?: string };   // logo 为 public 下的图片路径，可空
export type RankRevealProps = HandoffProps & {
  rows: RankRow[];        // 3–6 行，按名次从第 1 名到最后一名给出
  decimals: number;
  prefix: string;
  suffix: string;
  caption?: string;       // 排行出处一行，可空
  cues?: number[];        // 按揭晓顺序（最后一名在前）：[0]=最后一名翻起，…，最后一个=第一名
};

// 真实数据：FredTalk 107 期 DeepSWE v1.1 各模型最高得分（deepswe.png 折线读数，与 107 期口播一致）：GPT-6.1 Sol 75.4%、GPT-6 Astra 74.3%、GPT-6 Sol 69.0%。
export const rankRevealDefaults: RankRevealProps = {
  rows: [
    { name: 'GPT-6.1 Sol', score: 75.4 },
    { name: 'GPT-6 Astra', score: 74.3 },
    { name: 'GPT-6 Sol', score: 69.0 },
  ],
  decimals: 1,
  prefix: '',
  suffix: '%',
  caption: 'DeepSWE v1.1 最高得分',
};

const fmt = (v: number, d: number) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const glyph = (ch: string) => (/\d/.test(ch) ? 0.6 : /[.,:]/.test(ch) ? 0.3 : ch === '%' ? 0.86 : ch === ' ' ? 0.28 : /[\u0000-ÿ]/.test(ch) ? 0.62 : 1);
const numWidth = (s: string, size: number) => Array.from(s).reduce((w, ch) => w + glyph(ch) * size, 0);
function Num({ text, size, color }: { text: string; size: number; color: string }) {
  return <span style={{ ...textBase(size, 900), lineHeight: 1, display: 'inline-flex', color, fontVariantNumeric: 'tabular-nums' }}>
    {Array.from(text).map((ch, i) => <span key={i} style={{ display: 'inline-block', width: glyph(ch) * size, textAlign: 'center' }}>{ch}</span>)}
  </span>;
}

const ROW_X = 280, ROW_W = 1360;

export function RankReveal(props: Partial<RankRevealProps>) {
  const c = { ...rankRevealDefaults, ...props };
  const t = useT();
  const rows = c.rows.slice(0, 6);
  const n = Math.max(1, rows.length);

  // —— 版式：第一名更大；总高不超过 830，保证右上角标留空 ——
  const capH = c.caption ? 84 : 0;
  const gap = 24;
  const avail = 830 - capH;
  const rowH = Math.min(156, (avail - gap * (n - 1)) / (n - 1 + 1.5));
  const heroH = n === 1 ? Math.min(234, avail) : rowH * 1.5;
  const H = heroH + (n - 1) * (rowH + gap) + (n > 1 ? 0 : 0);
  const top0 = (1080 - H - capH) / 2 + 6;
  const rowTop = (i: number) => (i === 0 ? top0 : top0 + heroH + gap + (i - 1) * (rowH + gap));
  const str = (v: number) => `${c.prefix}${fmt(v, c.decimals)}${c.suffix}`;
  const maxScoreW = Math.max(...rows.map((r) => numWidth(str(r.score), 1)));

  // —— 时间线：最后一名先翻，第一名最后；第一名前停一拍 ——
  const order = [...rows.keys()].reverse();                   // 揭晓顺序：最后一名 → 第一名
  const step = Math.min(0.62, 2.8 / Math.max(1, n - 1));
  const times = order.map((_, k) => cueAt(c.cues, k, k === order.length - 1 && n > 1 ? 0.3 + (n - 1) * step + 0.55 : 0.3 + k * step));
  const timeOf = (rank: number) => times[order.indexOf(rank)];

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {rows.map((r, i) => {
        const isHero = i === 0 && n > 1;
        const h = isHero ? heroH : rowH;
        const y = rowTop(i);
        const at = timeOf(i);
        const slot = p(t, 0, 0.35);
        const flip = isHero ? Math.max(0, springAt(t, at, 0.85)) : p(t, at, at + 0.62);
        const vis = isHero ? clamp((t - at) / 0.05) : clamp((t - at) / 0.05);
        const roll = p(t, at + 0.1, at + (isHero ? 1.05 : 0.8));
        const angle = (1 - flip) * 90;
        const lift = (1 - clamp(flip)) * 34;
        const pop = isHero ? 1 + 0.025 * clamp(1 - Math.abs(springAt(t, at + 0.1, 0.8) - 1) * 6, 0, 1) : 1;
        // 版式
        const pad = Math.round(h * 0.28);
        const rankSize = Math.round(h * (isHero ? 0.62 : 0.56));
        const logoSize = Math.round(h * 0.56);
        const nameX = pad + rankSize * 0.62 + pad * 0.9 + (r.logo ? logoSize + pad * 0.7 : 0);
        const scoreSize = Math.min(Math.round(h * (isHero ? 0.52 : 0.46)), 96);
        const scoreW = maxScoreW * scoreSize;
        const nameMax = ROW_W - nameX - scoreW - pad * 2;
        const nameSize = Math.min(Math.round(h * (isHero ? 0.46 : 0.42)), nameMax / Math.max(1, textWidth(r.name, 1)));
        const fg = isHero ? '#fff' : S.ink;
        const rankColor = isHero ? S.accentDark : S.faint;
        return <React.Fragment key={i}>
          {/* 空位：先铺好，观众知道有几名 */}
          <div style={{ position: 'absolute', left: ROW_X, top: y, width: ROW_W, height: h, borderRadius: S.radius, background: S.ink, opacity: 0.05 * slot * (1 - vis) }} />
          {vis > 0 && <div style={{ position: 'absolute', left: ROW_X, top: y, width: ROW_W, height: h, opacity: clamp(flip * 4), transformOrigin: '50% 100%',
            transform: `translateY(${lift}px) perspective(1500px) rotateX(${angle.toFixed(2)}deg) scale(${pop})`, zIndex: isHero ? 3 : 1 }}>
            <Surface box={{ x: 0, y: 0, w: ROW_W, h }} dark={isHero} radius={S.radius} shadow={isHero ? S.capsuleShadow : S.shadow} style={{ overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: pad, top: (h - rankSize) / 2, width: rankSize * 0.62, textAlign: 'center', ...textBase(rankSize, 900), lineHeight: 1, color: rankColor }}>{i + 1}</div>
              {r.logo && <Media src={r.logo} box={{ x: pad + rankSize * 0.62 + pad * 0.9, y: (h - logoSize) / 2, w: logoSize, h: logoSize }} fit="contain" radius={Math.round(logoSize * 0.2)} />}
              <div style={{ position: 'absolute', left: nameX, top: (h - nameSize * 1.16) / 2, ...textBase(nameSize, 900), color: fg }}>{r.name}</div>
              <div style={{ position: 'absolute', left: ROW_W - pad - scoreW, top: (h - scoreSize) / 2, width: scoreW, display: 'flex', justifyContent: 'flex-end' }}>
                <Num text={str(r.score * roll)} size={scoreSize} color={isHero ? S.accentDark : S.ink} />
              </div>
            </Surface>
          </div>}
        </React.Fragment>;
      })}
      {c.caption && <div style={{ position: 'absolute', left: ROW_X, top: top0 + H + 40, width: ROW_W, textAlign: 'center', ...textBase(42, 500), color: S.muted, opacity: p(t, 0.3, 0.8) }}>{c.caption}</div>}
    </Handoff>
    <Sfx name="pop" at={times[0]} />
    {n > 1 && <Sfx name="whoosh-short" at={times[times.length - 1]} />}
    <Sfx name="ding" at={times[times.length - 1] + 0.35} duration={90} />
  </Frame>;
}
