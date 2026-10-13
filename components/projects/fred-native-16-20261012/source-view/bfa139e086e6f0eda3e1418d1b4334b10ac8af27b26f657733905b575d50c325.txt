// T20a 成果先行开场：一整墙真实作品先砸到观众眼前，镜头推进其中一张成为主角，钩子问题压在作品上落定。
// 关系：作品墙（很多结果）→ 其中一张（这期要做出的结果）→ 钩子问题（凭什么/怎么做到）。
import React from 'react';
import { S, cameraTransform, mix, p, quintic, textWidth } from '../kit/theme';
import { Box, Frame, Media, Sfx, abs, between, textBase, useT } from '../kit/ui';

export type ResultFirstHookProps = {
  media: string[];      // public/ 下的图片或视频路径；墙面按顺序循环填满 12 格
  heroIndex: number;    // media 中作为主角放大的那一张
  hook: string;         // 钩子问题
  highlight: string;    // hook 中要染紫的关键词（找不到则整句白色）
};

export const resultFirstHookDefaults: ResultFirstHookProps = {
  media: [
    'media/c-work-image1.jpg', 'media/c-fred-still3.jpg', 'media/c-work-image3.jpg', 'media/c-112-B02.jpg',
    'media/c-work-image2.jpg', 'media/c-fred-still4.jpg', 'media/c-112-B01.jpg', 'media/c-work-image4.jpg',
    'media/c-fred-still2.jpg', 'media/c-112-B05.jpg', 'media/c-fred-still5.jpg', 'media/c-112-B03.jpg',
  ],
  heroIndex: 2,
  hook: '这些图，一句话就能做出来？',
  highlight: '一句话',
};

const COLS = 4, ROWS = 3, GAP = 24;
const TW = 424, TH = 238.5;
const X0 = (1920 - (COLS * TW + (COLS - 1) * GAP)) / 2;
const Y0 = 176;
const HERO_SLOT = 6;                                 // 第 2 行第 3 列：靠近画面中心
const HERO_TARGET: Box = { x: 160, y: 150, w: 1600, h: 900 };   // 不压右上角标（y ≥ 121）
function splitHook(hook: string, maxUnits: number): string[] {
  if (textWidth(hook, 1) <= maxUnits) return [hook];
  const chars = Array.from(hook), half = textWidth(hook, 1) / 2;
  let best = Math.ceil(chars.length / 2), score = Infinity, acc = 0;
  for (let i = 1; i < chars.length; i++) {
    acc += textWidth(chars[i - 1], 1);
    const prev = chars[i - 1];
    const sc = Math.abs(acc - half) + (/[，,、：:；;？?！!]/.test(prev) ? -5 : prev === ' ' ? -1 : 0);
    if (sc < score) { score = sc; best = i; }
  }
  return [chars.slice(0, best).join(''), chars.slice(best).join('')];
}
const slotBox = (k: number): Box => ({ x: X0 + (k % COLS) * (TW + GAP), y: Y0 + Math.floor(k / COLS) * (TH + GAP), w: TW, h: TH });

export function ResultFirstHook(props: Partial<ResultFirstHookProps>) {
  const c = { ...resultFirstHookDefaults, ...props };
  const t = useT();
  const n = COLS * ROWS;
  const hero = ((c.heroIndex % c.media.length) + c.media.length) % c.media.length;
  // 主角固定放在中心格，其余格按顺序循环填充（跳过主角，避免重复同图相邻）
  const others = c.media.filter((_, i) => i !== hero);
  const pool = others.length ? others : c.media;
  const srcFor = (k: number) => (k === HERO_SLOT ? c.media[hero] : pool[(k < HERO_SLOT ? k : k - 1) % pool.length]);

  // 入场顺序：从右往左一列一列砸进来，每格 4 帧
  const order = (k: number) => (COLS - 1 - (k % COLS)) * ROWS + Math.floor(k / COLS);
  const enterAt = (k: number) => 0.02 + order(k) * (4 / 60);
  const enter = (k: number) => p(t, enterAt(k), enterAt(k) + 0.42);

  // 推进：墙面整体向主角推近并失焦；主角从格子长成近全屏
  const push = quintic(t, 1.2, 1.85);
  const heroBox0 = slotBox(HERO_SLOT);
  const heroGrow = quintic(t, 1.2, 1.95);
  const hb = between(heroBox0, HERO_TARGET, heroGrow);
  const he = enter(HERO_SLOT);
  const camera = cameraTransform(heroBox0.x + TW / 2, heroBox0.y + TH / 2, 1.45, push);

  // 钩子：黑胶囊横向长开，字随胶囊露出。单行放不下 ≥92px 时折两行（优先在标点后断），保持大字
  const MAXW = 1440;
  const lines = splitHook(c.hook, MAXW / 92);
  const lineW = Math.max(1, ...lines.map((l) => textWidth(l, 1)));
  const size = Math.min(120, MAXW / lineW);
  const LH = size * 1.22;
  const padX = size * 0.62;
  const capW = lineW * size + padX * 2, capH = LH * lines.length + size * 0.4;
  const capR = Math.min(capH / 2, lines.length > 1 ? 64 : capH / 2);
  const capY = HERO_TARGET.y + HERO_TARGET.h - capH - 64;
  const land = p(t, 2.15, 2.6);
  const w = mix(Math.min(capH, capW), capW, land);
  const textIn = p(t, 2.3, 2.75);
  const hiAt = c.highlight ? c.hook.indexOf(c.highlight) : -1;
  const hiEnd = hiAt < 0 ? -1 : hiAt + c.highlight.length;
  let offset = 0;
  const lineSpans = lines.map((l) => {
    const start = c.hook.indexOf(l, offset); offset = start + l.length;
    const a = Math.max(0, Math.min(l.length, hiAt - start)), b = Math.max(0, Math.min(l.length, hiEnd - start));
    return hiAt < 0 ? [l, '', ''] : [l.slice(0, a), l.slice(a, b), l.slice(b)];
  });

  return <Frame>
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camera, filter: `blur(${14 * push}px)` }}>
      {Array.from({ length: n }, (_, k) => {
        if (k === HERO_SLOT) return null;
        const e = enter(k), b = slotBox(k);
        return <Media key={k} src={srcFor(k)} box={{ ...b, x: b.x + (1 - e) * 340 }} radius={S.radius}
          style={{ opacity: e, boxShadow: S.shadow }} />;
      })}
    </div>
    <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.42 * push }} />
    <Media src={srcFor(HERO_SLOT)} box={{ ...hb, x: hb.x + (1 - he) * 340 }} radius={S.radius}
      style={{ opacity: he, boxShadow: heroGrow > 0 ? '0 24px 40px 0 rgba(0,0,0,0.2)' : S.shadow, zIndex: 2 }} />
    {land > 0 && <div style={{
      ...abs({ x: 960 - w / 2, y: capY + (1 - land) * 24, w, h: capH }), borderRadius: capR, background: S.dark,
      boxShadow: S.capsuleShadow, overflow: 'hidden', zIndex: 3, opacity: Math.min(1, land * 3),
    }}>
      <div style={{
        position: 'absolute', left: (w - lineW * size) / 2, width: lineW * size, top: (capH - LH * lines.length) / 2,
        color: '#fff', opacity: textIn, transform: `translateY(${(1 - textIn) * 26}px)`, textAlign: 'center',
      }}>
        {lineSpans.map((sp, i) => <div key={i} style={{ ...textBase(size, 900), lineHeight: `${LH}px` }}>
          {sp[0]}<span style={{ color: S.accentDark }}>{sp[1]}</span>{sp[2]}
        </div>)}
      </div>
    </div>}
    <Sfx name="whoosh-short" at={0.02} />
    <Sfx name="woosh" at={1.2} volume={0.4} />
    <Sfx name="pop" at={2.15} />
  </Frame>;
}
