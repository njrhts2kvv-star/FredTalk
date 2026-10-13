// T09e-ResultBrowse：产物浏览：生成结果逐个打开
// 观众要看懂的变化：一列产物 → 逐个打开看清，再回到总览
// 关系：同一组真实生成结果始终是同一批对象。总览时一排白卡（图 + 文件名）；点开一张，它从自己的卡位
// 放大成大图，其余收进底部胶片条；点胶片条里的下一张，两张原位互换（大图回条、条里那张放大）；
// 看完后全部回到总览原位。胶片条里当前项保留缩略图本身：略放大、提起阴影，其余缩略图降到 0.45 透明度，无彩色描边。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Box, ClickRing, Cursor, Frame, Handoff, HandoffProps, Sfx, between, textBase, useT } from '../kit/ui';

export type ResultItem = { src: string; w: number; h: number; name: string };
export type ResultBrowseProps = HandoffProps & {
  items: ResultItem[];                    // 2–6 个产物（真实生成结果）
  open: number[];                         // 依次打开哪些（items 下标），默认前 3 个
  cues?: number[];                        // [i]=第 i 次打开；[open.length]=回到总览
};

export const resultBrowseDefaults: ResultBrowseProps = {
  items: [
    { src: 'media/w5-result-phoenix.jpg', w: 1672, h: 941, name: '凤凰设定' },
    { src: 'media/w5-result-palace.jpg', w: 1672, h: 941, name: '云海仙宫' },
    { src: 'media/w5-result-sculpture.jpg', w: 1254, h: 1254, name: '金色雕塑' },
    { src: 'media/w5-result-watertown.jpg', w: 2048, h: 1152, name: '水巷春集' },
  ],
  open: [0, 1, 2],
};

const CAP_H = 86;          // 总览卡片下方文件名区
const VIEW = { x: 240, y: 136, w: 1440, h: 726 };   // 大图可用区
const STRIP_Y = 926, STRIP_H = 112;

export function ResultBrowse(props: Partial<ResultBrowseProps>) {
  const c = { ...resultBrowseDefaults, ...props };
  const items = (c.items.length ? c.items : resultBrowseDefaults.items).slice(0, 6);
  const n = items.length;
  const opens = (c.open.length ? c.open : [0]).filter((i) => i >= 0 && i < n).slice(0, 4);
  const m = opens.length;
  const t = useT();

  // 时间：每次打开 / 互换 0.5 秒，停稳看 ≥0.5 秒；最后回总览
  const DUR = 0.5;
  const defaultOpen = m <= 2 ? [0.8, 2.1] : m === 3 ? [0.7, 1.72, 2.72] : [0.62, 1.42, 2.2, 2.98];
  const openAt = (k: number) => cueAt(c.cues, k, defaultOpen[k] ?? 0.7 + k);
  const closeAt = cueAt(c.cues, m, openAt(m - 1) + (m >= 4 ? 0.95 : 1.05));

  // 总览：一排（≤4）或两排白卡；图区 4:3
  const rowsN = n > 4 ? 2 : 1;
  const perRow = Math.ceil(n / rowsN);
  const GAP = 40;
  const cardW = Math.min(400, (1720 - GAP * (perRow - 1)) / perRow, rowsN === 2 ? 330 : 400);
  const imgH = cardW * 0.75;
  const totalH = rowsN * (imgH + CAP_H) + (rowsN - 1) * GAP;
  const top0 = 560 - totalH / 2 + 10;
  const ov: Box[] = items.map((_, i) => {
    const r = Math.floor(i / perRow), col = i % perRow;
    const inRow = r === rowsN - 1 ? n - perRow * (rowsN - 1) : perRow;
    const rowW = inRow * cardW + (inRow - 1) * GAP;
    return { x: 960 - rowW / 2 + col * (cardW + GAP), y: top0 + r * (imgH + CAP_H + GAP), w: cardW, h: imgH };
  });
  // 胶片条
  const thumbW = Math.min(170, (1500 - 24 * (n - 1)) / n);
  const stripW = n * thumbW + (n - 1) * 24;
  const film: Box[] = items.map((_, i) => ({ x: 960 - stripW / 2 + i * (thumbW + 24), y: STRIP_Y, w: thumbW, h: STRIP_H }));
  // 大图：按原图比例放进可用区
  const viewer = (i: number): Box => {
    const it = items[i];
    const s = Math.min(VIEW.w / it.w, VIEW.h / it.h);
    const w = it.w * s, h = it.h * s;
    return { x: 960 - w / 2, y: VIEW.y + (VIEW.h - h) / 2, w, h };
  };

  // 阶段：0=总览，k=第 k 次打开，m+1=回总览
  const v = opens.map((_, k) => q(t, openAt(k), openAt(k) + DUR));
  const vClose = q(t, closeAt, closeAt + DUR + 0.05);
  const boxOf = (i: number) => {
    let b = ov[i];
    opens.forEach((oi, k) => { b = between(b, oi === i ? viewer(i) : film[i], v[k]); });
    return between(b, ov[i], vClose);
  };
  const browsing = v[0] * (1 - vClose);           // 0=总览，1=浏览中
  const current = (() => { let cur = -1; opens.forEach((oi, k) => { if (v[k] > 0.5) cur = oi; }); return vClose > 0.5 ? -1 : cur; })();

  const enter = p(t, 0, 0.4);

  // 光标：总览里点第一张；之后点胶片条里的下一张；看完淡出
  const target = (k: number) => {
    const oi = opens[k];
    const b = k === 0 ? ov[oi] : film[oi];
    return { x: b.x + b.w * 0.55, y: b.y + b.h * (k === 0 ? 0.62 : 0.7) };
  };
  let cx = 1420, cy = 1170;
  opens.forEach((_, k) => { const g = p(t, openAt(k) - (k === 0 ? 0.6 : 0.5), openAt(k) - 0.06); const tg = target(k); cx = mix(cx, tg.x, g); cy = mix(cy, tg.y, g); });
  const press = Math.max(0, ...opens.map((_, k) => clamp(1 - Math.abs(t - openAt(k) - 0.06) / 0.1)));
  const cursorOut = q(t, openAt(m - 1) + 0.15, openAt(m - 1) + 0.5);

  // 名称胶囊：当前大图停稳时出现在大图下沿
  const NAME = 44;

  // 渲染顺序：正在放大的那张在最上
  const order = items.map((_, i) => i).sort((a, b) => (a === current ? 1 : 0) - (b === current ? 1 : 0));

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 胶片条里当前项：保留缩略图本身，略放大 + 提起阴影（其余缩略图降到 0.45） */}
      {opens.map((oi, k) => {
        const a = clamp(v[k] * 2 - 1) * (k < m - 1 ? 1 - clamp(v[k + 1] * 2) : 1) * (1 - clamp(vClose * 4));
        if (a <= 0) return null;
        const b = film[oi];
        const g = 1.1;
        return <div key={'slot' + k} style={{
          position: 'absolute', left: b.x - b.w * (g - 1) / 2, top: b.y - b.h * (g - 1) / 2 - 6, width: b.w * g, height: b.h * g, borderRadius: 15,
          overflow: 'hidden', background: '#fff', boxShadow: '0 18px 30px rgba(0,0,0,0.22)', opacity: a * enter, zIndex: 5,
        }}><Img src={staticFile(items[oi].src)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>;
      })}

      {order.map((i) => {
        const it = items[i];
        const b = boxOf(i);
        const cap = 1 - browsing;                 // 文件名只在总览出现
        const isBig = b.w > thumbW * 2.2 && b.h > STRIP_H * 2;
        // 缩在胶片条里的其他项降到 0.45；大图和总览全不透明
        const dim = clamp((1 - clamp((b.w - thumbW) / (cardW - thumbW))) * 3 - 2) * browsing;
        const r = mix(14, S.radius, clamp((b.w - thumbW) / (cardW - thumbW)));
        return <div key={i} style={{
          position: 'absolute', left: b.x, top: b.y + (1 - enter) * 40, width: b.w, height: b.h + CAP_H * cap, borderRadius: r,
          background: '#fff', boxShadow: isBig && current === i ? '0 24px 50px rgba(0,0,0,0.18)' : S.shadow, overflow: 'hidden', opacity: enter * (1 - 0.55 * dim),
          zIndex: current === i ? 20 : 10,
        }}>
          <Img src={staticFile(it.src)} style={{ position: 'absolute', left: 0, top: 0, width: b.w, height: b.h, objectFit: 'cover', display: 'block' }} />
          {cap > 0.01 && <div style={{
            position: 'absolute', left: 0, right: 0, top: b.h, height: CAP_H, display: 'flex', alignItems: 'center', paddingLeft: 30,
            ...textBase(Math.min(40, (b.w - 60) / Math.max(1, textWidth(it.name, 1))), 500), color: S.ink, opacity: clamp(cap * 3 - 2),
          }}>{it.name}</div>}
        </div>;
      })}

      {/* 当前大图的名称胶囊 */}
      {opens.map((oi, k) => {
        const a = clamp((v[k] - 0.7) / 0.3) * (k < m - 1 ? 1 - clamp(v[k + 1] / 0.25) : 1) * (1 - clamp(vClose / 0.25));
        if (a <= 0) return null;
        const vb = viewer(oi);
        const size = Math.min(NAME, 700 / Math.max(1, textWidth(items[oi].name, 1)));
        const w = textWidth(items[oi].name, size) + 96, h = 96;
        return <div key={'name' + k} style={{
          position: 'absolute', left: vb.x + 40, top: vb.y + vb.h - h / 2 + (1 - a) * 14, width: w, height: h, borderRadius: h / 2,
          background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: a, zIndex: 30,
        }}>
          <span style={{ ...textBase(size, 900), color: '#fff' }}>{items[oi].name}</span>
        </div>;
      })}

      {opens.map((_, k) => { const tg = target(k); return <ClickRing key={k} x={tg.x} y={tg.y} t={t} at={openAt(k)} />; })}
      {cursorOut < 1 && <Cursor x={cx - 6} y={cy - 4} scale={1.1} press={press} style={{ opacity: 1 - cursorOut }} />}
    </Handoff>
    {opens.map((_, k) => <Sfx key={k} name="click" at={openAt(k)} />)}
    <Sfx name="woosh" at={openAt(0) + 0.02} />
    <Sfx name="slide" at={closeAt} />
  </Frame>;
}
