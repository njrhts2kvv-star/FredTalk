// T18d-RepoCard：项目名片
// 观众要看懂的变化：一个项目地址打出 → Star 数、语言、更新时间作为徽标依次落下
// 关系：白卡里 user/repo 逐字打出（斜杠和用户名浅、项目名黑），打完后卡片下方三枚黑胶囊徽标依次落下，
// 第一枚的 Star 数从 0 滚到真实值。终态是一张“地址 + 三项指标”的名片。
// 和 T18a（Logo 名片 + 能力）区分：这里的数据是项目地址和仓库指标，没有 Logo 与能力列表。
// 数据：Fred 仓库 njrhts2kvv-star/FredTalk 页面上真实可见的值，抓取日期 2026-10-12（Star 24、主语言 TypeScript、更新 4 天前）。
// 头像默认不放：仓库页面上的头像只有约 50px，放大会糊；有高清头像时用 avatar 传入。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type RepoBadge = {
  label: string;               // 指标名，例如 Star
  value: string | number;      // 数字会从 0 滚到该值
  highlight?: boolean;         // 值染紫（一个就够）
};

export type RepoCardProps = HandoffProps & {
  owner: string;
  repo: string;
  badges: RepoBadge[];         // 2–4 枚
  avatar?: string;             // 可选：左侧真实头像 / Logo（高清）
  cues?: number[];             // [i]=第 i 枚徽标落下；[badges.length]=地址开始打字
};

export const repoCardDefaults: RepoCardProps = {
  owner: 'njrhts2kvv-star',
  repo: 'FredTalk',
  badges: [
    { label: 'Star', value: 24, highlight: true },
    { label: '语言', value: 'TypeScript' },
    { label: '更新', value: '4 天前' },
  ],
};

const fmt = (v: string | number, e: number) => (typeof v === 'number' ? Math.round(v * e).toLocaleString('en-US') : v);

export function RepoCard(props: Partial<RepoCardProps>) {
  const c = { ...repoCardDefaults, ...props };
  const t = useT();
  const badges = c.badges.slice(0, 4);
  const n = badges.length;
  const address = `${c.owner}/${c.repo}`;
  const chars = Array.from(address);
  const slashAt = c.owner.length;          // 斜杠下标：此前（含）为浅色

  // —— 终态版式 ——
  const AV = c.avatar ? 150 : 0;
  const size = Math.min(118, (1560 - (AV ? AV + 50 : 0)) / Math.max(1, textWidth(address, 1)));
  const addrW = textWidth(address, size);
  const cardW = addrW + 150 + (AV ? AV + 50 : 0);
  const cardH = Math.max(size * 1.16 + 130, AV + 100);
  const lab = 46, val = 64, padX = 50;
  const badgeW = (b: RepoBadge) => textWidth(b.label, lab) + 26 + textWidth(typeof b.value === 'number' ? Math.round(b.value).toLocaleString('en-US') : b.value, val) + padX * 2;
  const sumW = badges.reduce((w, b) => w + badgeW(b), 0);
  const fit = Math.min(1, (cardW - 36 * (n - 1)) / sumW);       // 徽标整行最宽到名片宽，超了整体缩
  const bh = 140 * fit;
  // 左右边与名片严格对齐：多出来的宽度均分到胶囊之间
  const gap = n > 1 ? (cardW - sumW * fit) / (n - 1) : 0;
  const total = cardH + 76 + bh;
  const top = 540 - total / 2 + 10;
  const cardX = 960 - cardW / 2;
  const rowX = n > 1 ? cardX : 960 - sumW * fit / 2;
  const badgeY = top + cardH + 76;

  // —— 时间线 ——
  const enter = p(t, 0, 0.5);
  const typeAt = cueAt(c.cues, n, 0.35);
  const typeEnd = typeAt + Math.min(chars.length * 0.05, 1.3);   // 长地址加快，保证徽标有时间落下
  const shown = Math.floor(clamp((t - typeAt) / (typeEnd - typeAt)) * chars.length);
  const at = badges.map((_, i) => cueAt(c.cues, i, Math.max(typeEnd + 0.25, 1.6) + i * 0.58));

  let x = rowX;
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 名片：地址逐字打出，整行先按终态排好，没打到的字透明占位 */}
      <Surface box={{ x: cardX, y: top + (1 - enter) * 50, w: cardW, h: cardH }} style={{ opacity: enter }}>
        {c.avatar && <Img src={staticFile(c.avatar)} style={{ position: 'absolute', left: 75, top: (cardH - AV) / 2, width: AV, height: AV, borderRadius: AV / 2, objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', left: 75 + (AV ? AV + 50 : 0), top: 0, height: cardH, display: 'flex', alignItems: 'center' }}>
          {chars.map((ch, i) => <span key={i} style={{ ...textBase(size, 900), color: i >= shown ? 'transparent' : i <= slashAt ? S.faint : S.ink, whiteSpace: 'pre' }}>{ch}</span>)}
        </div>
      </Surface>

      {/* 徽标：黑胶囊依次落下（落下带一次轻回弹），Star 数在落下时滚动 */}
      {badges.map((b, i) => {
        const w = badgeW(b) * fit;
        const bx = x; x += w + gap;
        if (t < at[i]) return null;
        const land = springAt(t, at[i], 0.62);
        const y = mix(badgeY - 110, badgeY, land);
        const roll = p(t, at[i] + 0.1, at[i] + 0.8);
        return <Pill key={i} box={{ x: bx, y, w, h: bh }} style={{ opacity: clamp((t - at[i]) / 0.12), gap: 26 * fit }}>
          <span style={{ ...textBase(lab * fit, 500), color: 'rgba(255,255,255,.62)' }}>{b.label}</span>
          <span style={{ ...textBase(val * fit, 900), color: b.highlight ? S.accentDark : '#fff' }}>{fmt(b.value, roll)}</span>
        </Pill>;
      })}
    </Handoff>
    <Sfx name="typing" at={typeAt} duration={Math.round((typeEnd - typeAt) * 60) + 6} volume={0.4} />
    {at.map((a, i) => <Sfx key={i} name="pop" at={a} />)}
  </Frame>;
}
