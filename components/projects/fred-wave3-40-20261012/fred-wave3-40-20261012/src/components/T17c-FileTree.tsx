// T17c-FileTree：文件夹结构
// 观众要看懂的变化：一个文件夹 → 逐层展开成目录树，关键文件被点亮并标注
// 关系：同一棵树。根文件夹先在画面中央；第一层子项从它下面依次“长”出来（下方各行被推开，不跳位），
// 竖线随子项一起画下去；再展开第二层。展开完，整棵树让到左边，关键行被一条黑条从左擦过：
// 黑条经过的地方文件名反白，并一路延伸到右侧标注列，把这一行的用途带出来（同一个对象，不另起卡片）。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type TreeRow = { name: string; depth: number; note?: string };

export type FileTreeProps = HandoffProps & {
  tree: TreeRow[];       // 按显示顺序；depth 0 为根；文件夹名以 / 结尾
  cues?: number[];       // [0..maxDepth-1]=第 1..maxDepth 层展开；之后依次是每个带 note 的行点亮
};

// 默认内容：Fred 的公开仓库 FredTalk 的真实目录（git ls-files 核对，2026-10-12）
export const fileTreeDefaults: FileTreeProps = {
  tree: [
    { name: 'FredTalk/', depth: 0 },
    { name: 'apps/', depth: 1 },
    { name: 'docs/', depth: 1 },
    { name: 'scripts/', depth: 1, note: '安装、检查用的脚本' },
    { name: 'skills/', depth: 1, note: 'Skill 本体都在这里' },
    { name: 'fred-remotion-output/', depth: 2 },
    { name: 'fred-remake/', depth: 2 },
    { name: 'cloud-render/', depth: 2 },
    { name: '.gitignore', depth: 1 },
    { name: 'README.md', depth: 1, note: '先看这个：项目说明书' },
  ],
};

const MONO = 0.6 / 0.58;   // Source Code Pro 每字约 0.6em；textWidth 的拉丁字按 0.58 估
const LINE = '#c9c9cf';

function Icon({ folder, size, color }: { folder: boolean; size: number; color: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    {folder
      ? <path d="M2.5 6.2A1.7 1.7 0 0 1 4.2 4.5h4.6l2.1 2.2h8.9a1.7 1.7 0 0 1 1.7 1.7v9.4a1.7 1.7 0 0 1-1.7 1.7H4.2a1.7 1.7 0 0 1-1.7-1.7z" fill={color} />
      : <g fill="none" stroke={color} strokeWidth={1.9} strokeLinejoin="round"><path d="M6 2.8h8.2l4.3 4.3v14.1H6z" /><path d="M14 2.8v4.5h4.5" /></g>}
  </svg>;
}

export function FileTree(props: Partial<FileTreeProps>) {
  const c = { ...fileTreeDefaults, ...props };
  const t = useT();
  const rows = (c.tree.length ? c.tree : fileTreeDefaults.tree).slice(0, 14).map((r) => ({ ...r, depth: Math.max(0, Math.round(r.depth)) }));
  const n = rows.length;
  const maxDepth = Math.max(0, ...rows.map((r) => r.depth));

  // —— 终态版式 ——
  const LH = Math.min(92, 860 / n);
  const NOTE = Math.min(46, LH * 0.54);
  const longestName = Math.max(...rows.map((r) => r.depth * 1.4 + 1.5 + textWidth(r.name, 1) * MONO));
  const notes = rows.filter((r) => r.note).map((r) => r.note as string);
  const noteUnits = Math.max(0, ...notes.map((s) => textWidth(s, 1)));
  // 字号：树 + 标注列一起放进 1640 宽
  // 标注列紧跟在“带标注的行”里最长的文件名后面（不被别的长行拖远）
  const unitW = (r: TreeRow) => r.depth * 1.4 + 1.5 + textWidth(r.name, 1) * MONO;
  const litLongest = Math.max(0, ...rows.filter((r) => r.note).map(unitW));
  const needUnits = Math.max(longestName, noteUnits ? litLongest + 1.8 + noteUnits * 0.92 + 1.0 : 0);
  const FS = Math.min(52, LH * 0.58, 1640 / needUnits);
  const NS = Math.min(NOTE, FS * 0.92);
  const IND = FS * 1.4, ICON = FS * 1.08, GAPI = FS * 0.42;
  const treeW = longestName * FS;
  const COL_GAP = FS * 1.8;
  const noteW = noteUnits * NS;
  const groupW = Math.max(treeW, noteUnits ? litLongest * FS + COL_GAP + noteW + NS * 0.9 : 0);

  // —— 时间 ——
  const layerGap = maxDepth > 1 ? Math.min(0.86, 1.5 / (maxDepth - 1)) : 0.86;   // 层多就展开得紧一点
  const layerAt = (d: number) => cueAt(c.cues, d - 1, 0.42 + (d - 1) * layerGap);
  const order = rows.map((r, i) => rows.slice(0, i).filter((x) => x.depth === r.depth).length);
  const w = rows.map((r, i) => r.depth === 0 ? 1 : q(t, layerAt(r.depth) + order[i] * 0.055, layerAt(r.depth) + order[i] * 0.055 + 0.42));
  // 行内容在它被让出大半空间后才显出来，展开途中不和下一行叠字
  const shown = rows.map((r, i) => r.depth === 0 ? p(t, 0, 0.32) : clamp((w[i] - 0.5) / 0.5));
  const lastLayerEnd = maxDepth > 0 ? layerAt(maxDepth) + rows.filter((r) => r.depth === maxDepth).length * 0.055 + 0.42 : 0.4;
  const litRows = rows.map((r, i) => (r.note ? i : -1)).filter((i) => i >= 0);
  const lightStart = lastLayerEnd + 0.42;
  const lightGap = litRows.length > 1 ? Math.min(0.66, (4.15 - lightStart) / (litRows.length - 1)) : 0;   // 最后一条在 4.15s 前点亮，留足稳定阅读
  const lightAt = (k: number) => cueAt(c.cues, maxDepth + k, lightStart + k * lightGap);
  const shift = noteUnits ? q(t, lastLayerEnd + 0.02, lastLayerEnd + 0.52) : 0;

  // 行位置：每行的 y = 它前面各行“已展开份额”之和，展开时下方各行被连续推开
  const H = w.reduce((s, v) => s + v, 0) * LH;
  const top = 556 - H / 2;
  const ys = rows.map((_, i) => top + w.slice(0, i).reduce((s, v) => s + v, 0) * LH);
  const left = mix(960 - treeW / 2, 960 - groupW / 2, shift);
  const iconX = (r: TreeRow) => left + r.depth * IND;
  const nameX = (r: TreeRow) => iconX(r) + ICON + GAPI;
  const colX = left + litLongest * FS + COL_GAP;

  // 竖线：每个有子项的行，从图标下方画到最后一个直接子项
  const lines: React.ReactNode[] = [];
  rows.forEach((r, i) => {
    const kids: number[] = [];
    for (let j = i + 1; j < n && rows[j].depth > r.depth; j++) if (rows[j].depth === r.depth + 1) kids.push(j);
    if (!kids.length) return;
    const cx = iconX(r) + ICON / 2;
    const y0 = ys[i] + LH / 2 + ICON * 0.5;
    const last = kids[kids.length - 1];
    const yEnd = ys[last] + LH / 2;
    const vis = Math.max(...kids.map((k) => w[k]));
    lines.push(<path key={`v${i}`} d={`M${cx} ${y0} L${cx} ${Math.max(y0, yEnd)}`} stroke={LINE} strokeWidth={3} strokeLinecap="round" opacity={clamp(vis * 1.5)} />);
    kids.forEach((k) => {
      const y = ys[k] + LH / 2;
      lines.push(<path key={`h${k}`} d={`M${cx} ${y} L${iconX(rows[k]) - FS * 0.26} ${y}`} stroke={LINE} strokeWidth={3} strokeLinecap="round" opacity={shown[k]} />);
    });
  });

  const rowContent = (r: TreeRow, i: number, ink: string, noteInk?: string) => {
    const folder = r.name.endsWith('/');
    return <>
      <div style={{ position: 'absolute', left: iconX(r), top: ys[i] + (LH - ICON) / 2 }}><Icon folder={folder} size={ICON} color={ink} /></div>
      <div style={{ position: 'absolute', left: nameX(r), top: ys[i], height: LH, display: 'flex', alignItems: 'center', ...textBase(FS, 600, S.mono), lineHeight: 1, color: ink }}>{r.name}</div>
      {noteInk && r.note && <div style={{ position: 'absolute', left: colX, top: ys[i], height: LH, display: 'flex', alignItems: 'center', ...textBase(NS, 500), lineHeight: 1, color: noteInk }}>{r.note}</div>}
    </>;
  };

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>{lines}</svg>
      {rows.map((r, i) => <div key={i} style={{ position: 'absolute', inset: 0, opacity: shown[i], transform: `translateX(${(1 - shown[i]) * -18}px)` }}>
        {rowContent(r, i, r.depth === 0 ? S.ink : '#2a2a2e')}
      </div>)}
      {/* 关键行：黑条从左擦过，经过处反白，并延伸到标注列 */}
      {litRows.map((i, k) => {
        const r = rows[i];
        const at = lightAt(k);
        const e = p(t, at, at + 0.55);
        if (e <= 0) return null;
        const h = Math.min(LH * 0.86, FS * 1.7);
        const x0 = iconX(r) - FS * 0.5;
        const x1 = colX + noteW + NS * 0.9;   // 所有亮条右端对齐，像文件管理器里的选中行
        const reveal = x0 + (x1 + 70 - x0) * e;   // 多擦 70px，给右下投影留位置
        return <div key={i} style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${1920 - reveal}px 0 0)` }}>
          <div style={{ position: 'absolute', left: x0, top: ys[i] + (LH - h) / 2, width: x1 - x0, height: h, borderRadius: h / 2, background: S.dark, boxShadow: S.capsuleShadow }} />
          {rowContent(r, i, '#fff', k === litRows.length - 1 || t < lightAt(k + 1) ? S.accentDark : '#fff')}
        </div>;
      })}
    </Handoff>
    {maxDepth > 0 && <Sfx name="slide" at={layerAt(1)} />}
    {litRows.map((_, k) => <Sfx key={k} name="pop" at={lightAt(k)} />)}
  </Frame>;
}
