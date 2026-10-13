// T04a 比喻映射图：抽象概念的每个部件，一行一行对上生活里的比喻，最后两列合成一句。
// 关系：左列真实概念（黑胶囊点亮）← 右列打乱顺序的比喻卡移动过来与之对齐（不画箭头）→ 全部配好后两列向中间合拢成一句。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Sfx, center, textBase, useT } from '../kit/ui';

export type MetaphorPair = { left: string; right: string };
export type MetaphorMapProps = {
  concept: string;          // 左列名（真实概念）
  metaphor: string;         // 右列名（生活比喻）
  pairs: MetaphorPair[];    // 2–4 对
  summary: string;          // 合成的一句，'≈' 后半句染紫
  fred?: string;            // 可选：透明 Fred 侧边探头（PNG），空字符串关闭
};

export const metaphorMapDefaults: MetaphorMapProps = {
  concept: '程序世界',
  metaphor: '餐厅',
  pairs: [
    { left: 'API', right: '服务员' },
    { left: '发请求', right: '点菜' },
    { left: '返回结果', right: '上菜' },
  ],
  summary: 'API ≈ 餐厅服务员',
  fred: 'media/b-fred-peek.png',
};

const L_CX = 640;          // 左列中心
const R_CX_FINAL = 1240;   // 配对后右卡中心（贴近左侧）
const R_CX_START = 1300;   // 未配对时右卡中心（稍远、变淡）

// 未配对时右列的打乱顺序：把第 i 项放到 order[i] 行
const shuffled = (n: number) => Array.from({ length: n }, (_, i) => (i + 1) % n);

export function MetaphorMap(props: Partial<MetaphorMapProps>) {
  const c = { ...metaphorMapDefaults, ...props };
  const t = useT();
  const pairs = c.pairs.slice(0, 5);
  const n = Math.max(1, pairs.length);
  const order = shuffled(n);

  // 行几何：整组在标题下居中
  const rowH = n <= 3 ? 150 : n === 4 ? 128 : 108;
  const gap = n <= 3 ? 46 : 32;
  const listH = n * rowH + (n - 1) * gap;
  const top = 300 + (720 - listH) / 2;
  const rowY = (i: number) => top + i * (rowH + gap);

  // 字号：同列同字号，按最长项与可用宽度自适应
  const capW = 500, cardW = 500;
  const size = Math.min(rowH * 0.42, 74, ...pairs.flatMap((pr) => [(capW - 90) / Math.max(1, textWidth(pr.left, 1)), (cardW - 90) / Math.max(1, textWidth(pr.right, 1))]));

  // 时序
  const intro = p(t, 0.02, 0.5);
  const step = Math.min(0.6, 1.9 / n);
  const linkDur = Math.min(0.62, step + 0.04);
  const pairAt = (i: number) => 0.55 + i * step;
  // 全部配好后留约 0.8s 读完整映射，再合拢
  const mergeAt = Math.min(3.4, pairAt(n - 1) + linkDur + 0.8);
  // 合拢：先收字 → 右卡贴到左胶囊 → 每行收向中线 → 形状化成一个合成胶囊
  const merge = q(t, mergeAt, mergeAt + 0.3);              // 列名退场
  const textOut = q(t, mergeAt, mergeAt + 0.2);
  const dock = p(t, mergeAt, mergeAt + 0.38);
  const gather = p(t, mergeAt + 0.2, mergeAt + 0.66);
  const shapeOut = q(t, mergeAt + 0.4, mergeAt + 0.62);
  const sumIn = p(t, mergeAt + 0.4, mergeAt + 0.82);
  const sumText = p(t, mergeAt + 0.6, mergeAt + 0.95);

  // 右卡位置模拟：第 i 步把比喻 i 换到第 i 行，原来占着这一行的卡换到它空出的位置（交换，不画箭头）
  const slotAt = (j: number) => {
    const slots = [...order];
    for (let i = 0; i < n; i++) {
      const v = p(t, pairAt(i), pairAt(i) + linkDur);
      const from = slots[i];
      const k = slots.indexOf(i);           // 当前占着第 i 行的卡
      if (v < 1) {                          // 这一步还没做完：只有参与交换的两张卡在动
        if (j === i) return { slot: mix(from, i, v), x: 0 };
        if (j === k) return { slot: mix(i, from, v), x: Math.sin(Math.PI * v) * 70 };
        return { slot: slots[j], x: 0 };
      }
      slots[k] = from; slots[i] = i;
    }
    return { slot: slots[j], x: 0 };
  };

  // 当前正在配的那一对（用于紫色）
  const current = pairs.findIndex((_, i) => t >= pairAt(i) && (i === n - 1 ? t < mergeAt : t < pairAt(i + 1)));

  // 合成句
  const [sumA, sumB] = c.summary.includes('≈') ? [c.summary.slice(0, c.summary.indexOf('≈') + 1), c.summary.slice(c.summary.indexOf('≈') + 1)] : [c.summary, ''];
  const sumSize = Math.min(124, 1340 / Math.max(1, textWidth(c.summary, 1)));
  const sumW = textWidth(c.summary, sumSize) + sumSize * 1.6;
  const sumH = sumSize * 2.1;

  const headSize = 52;
  const fredIn = q(t, 0.9, 1.5) * (1 - q(t, mergeAt, mergeAt + 0.4));

  return <Frame>
    {/* 列名：概念 / 比喻（随合拢淡出） */}
    {[{ text: c.concept, cx: L_CX }, { text: c.metaphor, cx: R_CX_FINAL }].map((h, k) => <div key={k} style={{
      ...textBase(headSize, 900), position: 'absolute', left: h.cx - textWidth(h.text, headSize) / 2, top: top - 112 + (1 - intro) * 20,
      color: S.faint, opacity: intro * (1 - merge),
    }}>{h.text}</div>)}

    {pairs.map((pr, i) => {
      const enter = p(t, 0.05 + i * 0.08, 0.5 + i * 0.08);
      const link = p(t, pairAt(i), pairAt(i) + linkDur);           // 右卡移动对齐
      const light = q(t, pairAt(i), pairAt(i) + 0.3);           // 左侧点亮成黑胶囊
      const isCur = i === current;
      const y = rowY(i);
      // 合拢：整行（左胶囊 + 贴上的右卡）收向画面中心
      const dockX = L_CX + capW / 2 + cardW / 2 - 30;
      const rowCx = L_CX + (cardW - 30) / 2;
      const mx = (960 - rowCx) * gather, my = (540 - (y + rowH / 2)) * gather;
      const fade = 1 - shapeOut;
      const pos = slotAt(i);
      const rx = mix(mix(R_CX_START, R_CX_FINAL, link) + pos.x, dockX, dock) + mx, ry = top + pos.slot * (rowH + gap);
      return <React.Fragment key={i}>
        {/* 左：概念（未点亮为白卡，点亮为黑胶囊） */}
        <div style={{
          position: 'absolute', left: L_CX - capW / 2 + mx, top: y + my + (1 - enter) * 30, width: capW, height: rowH,
          borderRadius: rowH / 2, background: `rgb(${mix(255, 25, light)},${mix(255, 25, light)},${mix(255, 28, light)})`,
          boxShadow: light > 0.5 ? S.capsuleShadow : S.shadow, opacity: enter * fade, transform: `scale(${mix(1, 0.86, gather)})`, ...center, zIndex: 30,
        }}>
          <span style={{ ...textBase(size, 900), opacity: 1 - textOut, color: light > 0.5 ? (isCur ? S.accentDark : '#fff') : S.muted }}>{pr.left}</span>
        </div>
        {/* 右：比喻白卡，从打乱的位置移到与左侧同一行 */}
        <div style={{
          position: 'absolute', left: rx - cardW / 2, top: ry + my + (1 - enter) * 30, width: cardW, height: rowH,
          borderRadius: S.radius, background: '#fff', boxShadow: S.shadow, ...center, zIndex: link > 0 && link < 1 ? 20 : 10,
          opacity: enter * mix(0.42, 1, link) * fade, transform: `scale(${mix(1, 0.86, gather)})`,
        }}>
          <span style={{ ...textBase(size, link > 0.5 ? 900 : 500), opacity: 1 - textOut, color: isCur && link > 0.5 ? S.accent : S.ink }}>{pr.right}</span>
        </div>
      </React.Fragment>;
    })}

    {/* 合成句：黑胶囊 */}
    <div style={{
      position: 'absolute', left: 960 - sumW / 2, top: 540 - sumH / 2 + (1 - sumIn) * 24, width: sumW, height: sumH, borderRadius: sumH / 2,
      background: S.dark, boxShadow: S.capsuleShadow, opacity: sumIn, transform: `scale(${mix(0.8, 1, sumIn)})`, ...center, zIndex: 40,
    }}>
      <span style={{ ...textBase(sumSize, 900), color: '#fff', opacity: sumText, transform: `translateY(${(1 - sumText) * 14}px)` }}>{sumA}<span style={{ color: S.accentDark }}>{sumB}</span></span>
    </div>

    {/* 可选：Fred 从右下探头看配对过程，合拢前退出 */}
    {c.fred ? <Img src={staticFile(c.fred)} style={{
      position: 'absolute', right: -6 - (1 - fredIn) * 330, bottom: -40, height: 560, opacity: fredIn,
    }} /> : null}

    <Sfx name="pop" at={0.05} />
    {pairs.map((_, i) => <Sfx key={i} name="slide" at={pairAt(i)} />)}
    <Sfx name="gather" at={mergeAt} />
    <Sfx name="ding" at={mergeAt + 0.75} />
  </Frame>;
}
