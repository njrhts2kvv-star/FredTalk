// T18a 单工具名片：先认出是谁（真实 Logo 独占一张小卡），卡片再展开出名字和一句定位，最后三项能力依次落进卡里。
// 关系：身份（Logo）→ 名字 → 它是干什么的 → 具体能做哪几件事；背后真实官网失焦，只作“这是个真产品”的上下文。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Box, Frame, Sfx, between, textBase, useT } from '../kit/ui';

export type ToolCardProps = {
  logo: string;               // public 下的透明 Logo
  name: string;
  tagline: string;            // 一句定位
  capabilities: string[];     // 2–4 项
  background?: string | null; // 可选真实产品截图（失焦）
};

export const toolCardDefaults: ToolCardProps = {
  logo: 'media/d-doubao-logo.png',
  name: '豆包工作',
  tagline: '做 PPT、理表格、整理文件，统统先让她干',
  capabilities: ['做 PPT', '处理表格', '定时任务'],
  background: 'media/d-doubao-site.jpg',
};

const PAD = 76;

export function ToolCard(props: Partial<ToolCardProps>) {
  const c = { ...toolCardDefaults, ...props };
  const t = useT();

  // —— 尺寸自适应 ——
  let nameSize = 150;
  while (nameSize > 80 && textWidth(c.name, nameSize) > 980) nameSize -= 4;
  let tagSize = 58;
  while (tagSize > 38 && textWidth(c.tagline, tagSize) > 1120) tagSize -= 2;
  let capSize = 54;
  const capH = 116, capGap = 32;
  const caps = c.capabilities.slice(0, 4);
  const rowW = (size: number) => caps.reduce((w, s) => w + textWidth(s, size) + size * 1.9, 0) + capGap * Math.max(0, caps.length - 1);
  while (capSize > 38 && rowW(capSize) > 1700 - PAD * 2) capSize -= 2;   // 能力胶囊一行放不下时缩字号，不压扁胶囊
  const capW = caps.map((s) => textWidth(s, capSize) + capSize * 1.9);
  const capRow = rowW(capSize);
  const logo = 250, logoGap = 64;
  const textCol = Math.max(textWidth(c.name, nameSize), textWidth(c.tagline, tagSize));
  const innerW = Math.max(logo + logoGap + textCol, capRow);
  const cardW = Math.min(1700, innerW + PAD * 2);
  const headH = Math.max(logo, nameSize * 1.16 + 20 + tagSize * 1.3);
  const cardH = PAD + headH + 72 + capH + PAD;
  const final: Box = { x: 960 - cardW / 2, y: 540 - cardH / 2 + 20, w: cardW, h: cardH };

  // 起始：只包住 Logo 的方卡，居中
  const seed = logo + 100;
  const start: Box = { x: 960 - seed / 2, y: 540 - seed / 2, w: seed, h: seed };

  // —— 时间线 ——
  const appear = p(t, 0.02, 0.45);
  const pop = springAt(t, 0.02, 0.7);
  const open = q(t, 0.65, 1.2);
  const nameIn = p(t, 0.95, 1.45);
  const tagIn = p(t, 1.45, 1.9);
  const capAt = (i: number) => 2.15 + i * 0.36;

  const card = between(start, final, open);
  const logoX = mix(card.x + (card.w - logo) / 2, final.x + PAD, open);
  const logoY = mix(card.y + (card.h - logo) / 2, final.y + PAD + (headH - logo) / 2, open);
  const textX = final.x + PAD + logo + logoGap;
  const nameY = final.y + PAD + (headH - (nameSize * 1.16 + 20 + tagSize * 1.3)) / 2;
  const capY = final.y + PAD + headH + 72;
  const capX0 = final.x + PAD;

  return <Frame>
    {c.background && <div style={{ position: 'absolute', inset: 0 }}>
      <Img src={staticFile(c.background)} style={{ position: 'absolute', inset: -40, width: 2000, height: 1160, objectFit: 'cover', filter: `blur(${mix(3, 18, q(t, 0, 0.9))}px)` }} />
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: mix(0.25, 0.76, q(t, 0, 0.9)) }} />
    </div>}

    <div style={{
      position: 'absolute', left: card.x, top: card.y, width: card.w, height: card.h, borderRadius: mix(48, S.radius, open),
      background: '#fff', boxShadow: S.shadow, opacity: appear, transform: `scale(${mix(0.6, 1, pop)})`,
    }} />
    <Img src={staticFile(c.logo)} style={{
      position: 'absolute', left: logoX, top: logoY, width: logo, height: logo, objectFit: 'contain',
      opacity: appear, transform: `scale(${mix(0.5, 1, pop)})`,
    }} />

    <div style={{
      position: 'absolute', left: textX, top: nameY, ...textBase(nameSize, 900), color: S.ink,
      clipPath: `inset(0 ${100 * (1 - nameIn)}% 0 0)`, transform: `translateX(${(1 - nameIn) * 30}px)`,
    }}>{c.name}</div>
    <div style={{
      position: 'absolute', left: textX, top: nameY + nameSize * 1.16 + 20, ...textBase(tagSize, 500), color: S.ink,
      opacity: tagIn * 0.82, transform: `translateY(${(1 - tagIn) * 18}px)`,
    }}>{c.tagline}</div>

    {caps.map((s, i) => {
      const v = p(t, capAt(i), capAt(i) + 0.34);
      const x = capX0 + capW.slice(0, i).reduce((a, b) => a + b, 0) + capGap * i;
      return <div key={i} style={{
        position: 'absolute', left: x, top: capY + (1 - v) * 22, width: capW[i], height: capH, borderRadius: capH / 2,
        background: S.ink, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: v, transform: `scale(${mix(0.85, 1, v)})`,
      }}>
        <span style={{ ...textBase(capSize, 900), color: '#fff', lineHeight: 1 }}>{s}</span>
      </div>;
    })}

    <Sfx name="pop" at={0.02} />
    <Sfx name="woosh" at={0.65} />
    {caps.map((_, i) => <Sfx key={i} name="click" at={capAt(i)} />)}
  </Frame>;
}
