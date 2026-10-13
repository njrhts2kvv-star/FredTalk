// T05d 工具方案并排：两个真实工具在同一组标准上逐行比，每行赢的一格翻成黑面，最后赢得多的一整列抬起。
// 关系：同一标准 → 两边各给一个答案 → 胜方格子变黑（逐行累积）→ 总胜方整列抬起、另一列退后。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Sfx, textBase, useT } from '../kit/ui';

export type Tool = { name: string; logo: string };
export type FaceOffRow = { label: string; left: string; right: string; winner: 'left' | 'right' | 'tie' };
export type ToolFaceOffProps = { left: Tool; right: Tool; rows: FaceOffRow[] };

export const toolFaceOffDefaults: ToolFaceOffProps = {
  left: { name: 'Codex', logo: 'media/b-codex-logo.png' },
  right: { name: '豆包', logo: 'media/b-doubao-logo.png' },
  rows: [
    { label: '改整个项目', left: '直接改文件、跑测试', right: '只给代码片段', winner: 'left' },
    { label: '上手门槛', left: '要装客户端', right: '网页打开就用', winner: 'right' },
    { label: '长任务', left: '能连续跑一小时', right: '中途容易停下', winner: 'left' },
    { label: '读本地文件', left: '整个文件夹都能读', right: '一次传几个文件', winner: 'left' },
  ],
};

// 列几何：标准列 + 两个工具列
const COL = { label: { x: 120, w: 400 }, left: { x: 560, w: 600 }, right: { x: 1200, w: 600 } };
const HEAD_Y = 150, HEAD_H = 150;

function fitSize(text: string, width: number, max: number, min = 30) {
  return clamp(width / Math.max(1, textWidth(text, 1)), min, max);
}

// 放不下一行时自己断成两行：优先在标点后断，其次取两行最均衡处
function breakLines(text: string, size: number, width: number) {
  if (textWidth(text, size) <= width * 0.96) return [text];
  const chars = Array.from(text);
  let best = { cost: Infinity, at: Math.ceil(chars.length / 2) };
  for (let i = 2; i < chars.length - 1; i++) {
    const cost = Math.max(textWidth(chars.slice(0, i).join(''), 1), textWidth(chars.slice(i).join(''), 1)) * (/[，,、：:；; ]/.test(chars[i - 1]) ? 0.7 : 1);
    if (cost < best.cost) best = { cost, at: i };
  }
  return [chars.slice(0, best.at).join('').trim(), chars.slice(best.at).join('').trim()];
}

// 同职责文字共用一个字号：从 max 往下找，使每段文字在宽度内最多两行、且两行高度放得进 boxH
function sharedSize(texts: string[], width: number, boxH: number, max: number, min = 28) {
  for (let s = max; s > min; s -= 1) {
    const ok = texts.every((tx) => {
      const lines = breakLines(tx, s, width);
      return lines.length === 1 || (s * 1.2 * 2 <= boxH && lines.every((l) => textWidth(l, s) <= width));
    });
    if (ok) return s;
  }
  return min;
}

export function ToolFaceOff(props: Partial<ToolFaceOffProps>) {
  const c = { ...toolFaceOffDefaults, ...props };
  const t = useT();
  const rows = c.rows.slice(0, 6);
  const n = Math.max(1, rows.length);

  // 行高按行数自适应，整张表在标题下方垂直居中
  const top = HEAD_Y + HEAD_H + 40, bottom = 1010;
  const gap = n <= 4 ? 26 : 18;
  const rowH = Math.min(150, (bottom - top - (n - 1) * gap) / n);
  const tableH = n * rowH + (n - 1) * gap;
  const rowsTop = top + (bottom - top - tableH) / 2;

  // 时序：表头 0–0.45s；每行建立 + 0.42s 后翻出胜方；最后整列抬起
  const head = p(t, 0.02, 0.45);
  const step = Math.min(0.62, 2.5 / n);
  const rowAt = (i: number) => 0.55 + i * step;
  const lastFlip = rowAt(n - 1) + 0.42 + 0.3;
  const liftAt = Math.max(3.6, lastFlip + 0.25);
  const lift = p(t, liftAt, liftAt + 0.5);

  const leftWins = rows.filter((r) => r.winner === 'left').length;
  const rightWins = rows.filter((r) => r.winner === 'right').length;
  const champ: 'left' | 'right' | 'tie' = leftWins === rightWins ? 'tie' : leftWins > rightWins ? 'left' : 'right';

  const cellPad = 44;
  const cellSize = sharedSize(rows.flatMap((r) => [r.left, r.right]), COL.left.w - cellPad * 2, rowH - 26, Math.min(rowH * 0.36, 54));
  const labelSize = sharedSize(rows.map((r) => r.label), COL.label.w - 20, rowH, Math.min(rowH * 0.4, 60));

  const columnStyle = (side: 'left' | 'right'): React.CSSProperties => {
    const won = champ === side, lost = champ !== 'tie' && champ !== side;
    const col = COL[side];
    return {
      position: 'absolute', left: col.x, top: 0, width: col.w, height: 1080,
      transform: `translateY(${won ? -16 * lift : 0}px) scale(${won ? mix(1, 1.035, lift) : 1})`,
      transformOrigin: `50% ${rowsTop + tableH / 2}px`, opacity: lost ? mix(1, 0.7, lift) : 1,
    };
  };

  const Header = ({ side }: { side: 'left' | 'right' }) => {
    const tool = c[side];
    const nameSize = fitSize(tool.name, COL[side].w - 170, 76);
    const logo = 112;
    const w = logo + 28 + textWidth(tool.name, nameSize);
    return <div style={{
      position: 'absolute', left: (COL[side].w - w) / 2, top: HEAD_Y + (HEAD_H - logo) / 2 + (1 - head) * 30,
      display: 'flex', alignItems: 'center', gap: 28, opacity: head,
    }}>
      <Img src={staticFile(tool.logo)} style={{ width: logo, height: logo, objectFit: 'contain', borderRadius: 26 }} />
      <span style={{ ...textBase(nameSize, 900), color: champ === side && lift > 0.5 ? S.accent : S.ink }}>{tool.name}</span>
    </div>;
  };

  const Cell = ({ side, row, i }: { side: 'left' | 'right'; row: FaceOffRow; i: number }) => {
    const enter = p(t, rowAt(i) + (side === 'left' ? 0.06 : 0.12), rowAt(i) + (side === 'left' ? 0.06 : 0.12) + 0.42);
    const win = row.winner === side;
    const flip = win ? q(t, rowAt(i) + 0.42, rowAt(i) + 0.72) : 0;
    const y = rowsTop + i * (rowH + gap);
    // 胜方：白面 → 黑面（文字反白、加粗）；败方保持白面
    const bg = `rgb(${mix(255, 25, flip)},${mix(255, 25, flip)},${mix(255, 28, flip)})`;
    const ink = flip > 0.5 ? '#fff' : S.ink;
    const loseDim = row.winner !== 'tie' && !win ? mix(1, 0.55, q(t, rowAt(i) + 0.42, rowAt(i) + 0.72)) : 1;
    return <div style={{
      position: 'absolute', left: 0, top: y + (1 - enter) * 40, width: COL[side].w, height: rowH,
      background: bg, borderRadius: S.radius, boxShadow: flip > 0.5 ? S.capsuleShadow : S.shadow, opacity: enter,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      <span style={{ ...textBase(cellSize, win && flip > 0.5 ? 900 : 500), lineHeight: 1.2, textAlign: 'center', color: ink, opacity: loseDim }}>{breakLines(side === 'left' ? row.left : row.right, cellSize, COL[side].w - cellPad * 2).map((l, k) => <div key={k}>{l}</div>)}</span>
    </div>;
  };

  return <Frame>
    {/* 标准列：只放文字，不做卡片 */}
    {rows.map((r, i) => {
      const enter = p(t, rowAt(i), rowAt(i) + 0.4);
      const y = rowsTop + i * (rowH + gap);
      return <div key={i} style={{
        ...textBase(labelSize, 900), lineHeight: 1.2, position: 'absolute', left: COL.label.x, top: y + (1 - enter) * 30,
        width: COL.label.w - 20, height: rowH, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: S.ink, opacity: enter,
      }}>{breakLines(r.label, labelSize, COL.label.w - 20).map((l, k) => <div key={k}>{l}</div>)}</div>;
    })}

    {(['left', 'right'] as const).map((side) => <div key={side} style={columnStyle(side)}>
      <Header side={side} />
      {rows.map((r, i) => <Cell key={i} side={side} row={r} i={i} />)}
    </div>)}

    {rows.map((_, i) => <Sfx key={i} name="slide" at={rowAt(i)} />)}
    <Sfx name="ding" at={liftAt} />
  </Frame>;
}
