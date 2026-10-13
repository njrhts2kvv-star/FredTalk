// T15b-TableRowFocus：表格行聚焦
// 观众要看懂的变化：一张完整表格 → 聚焦关键一行读清
// 关系：先给整张表的全貌 → 相机推近目标行 → 其余行白蒙版退后（数据模式不失焦，仍读得出），目标行（和表头）保持清楚并浮起一层 → 停稳阅读。
// 返修（Fred：“下面列表里的字体和大小很奇怪”）：数据模式所有行同一字号/行高/左对齐，首列 Heavy 900、其余列 Medium 500；
//   第二轮（Fred：“字体还是很大，表格太大了”）：数据模式表格整体缩小，宽 ≤1380、正文 34–40px（长文案自动换行降到 28 左右）、行高收紧、居中留白，相机 ≤1.15。
//   聚焦只做“白底卡浮起＋阴影”，字号不变（不再 scale），只有 focusCol 那一格染紫；退后行不糊成虚字。截图模式不变。
// 两种输入：
//   1) 传 image（真实表格截图）＋ rowBox（目标行在原图里的像素框）：截图原样，不套假窗，聚焦截图里的那一行；
//   2) 不传 image，传 columns＋rows：渲染一张干净的黑表头表格，focusCol 那一格染紫。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cameraTransform, cueAt, mix, p, quintic, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

type PxBox = { x: number; y: number; w: number; h: number };
export type TableRowFocusProps = HandoffProps & {
  columns: string[];          // 数据模式：表头
  rows: string[][];           // 数据模式：每行各列文字
  focusRow: number;           // 数据模式：聚焦第几行（从 0 起，不含表头）
  focusCol?: number;          // 数据模式：目标行里染紫的那一格（只强调一处），可空
  image?: string | null;      // 截图模式：public 下的图片路径
  imageSize?: [number, number];   // 截图原始宽高（像素）
  rowBox?: PxBox;             // 截图模式：目标行在原图里的框
  headerBox?: PxBox | null;   // 截图模式：表头框（可空）；给了就和目标行一起保持清楚
  cues?: number[];            // [0]=开始推近聚焦
};

// 真实内容：FredTalk 个人站文章《我把每天的声音，变成了 Codex 能继续使用的上下文》里的验收表（m-site-article-cli.jpg 原文）
export const tableRowFocusDefaults: TableRowFocusProps = {
  columns: ['输出', '验收时看什么'],
  rows: [
    ['新结论', '是否真的在讨论中确认，而不是模型推断'],
    ['变更要求', '与旧文档相比，具体变了哪里'],
    ['下一步', '动作、对象和责任是否明确'],
    ['未确定项', '分歧和待确认内容有没有被错误合并'],
    ['来源', '能否回到时间点或原句复核'],
  ],
  focusRow: 3,
  focusCol: 0,
  image: null,
};

type Layout = { box: PxBox; row: PxBox; header: PxBox | null; scale: number };

export function TableRowFocus(props: Partial<TableRowFocusProps>) {
  const c = { ...tableRowFocusDefaults, ...props };
  const t = useT();
  const focusAt = cueAt(c.cues, 0, 1.35);
  const enter = p(t, 0, 0.5);
  const push = quintic(t, focusAt, focusAt + 0.65);
  const recede = p(t, focusAt + 0.15, focusAt + 0.75);
  const lift = p(t, focusAt + 0.45, focusAt + 0.9);
  const keyOn = p(t, focusAt + 0.75, focusAt + 1.1);
  const useImage = !!c.image && !!c.rowBox && !!c.imageSize;

  // ---------- 数据模式：按真实文字宽度排表 ----------
  const nCol = Math.max(1, c.columns.length);
  const rows = c.rows;
  const fr = clamp(Math.round(c.focusRow), 0, Math.max(0, rows.length - 1));
  const colMax = Array.from({ length: nCol }, (_, j) => Math.max(textWidth(c.columns[j] ?? '', 1), ...rows.map((r) => textWidth(r[j] ?? '', 1))));
  // 字号从大往小试：先求不换行放得下；放不下就把最宽的几列封顶、在格内换行（每格最多 3 行），总高不超过 900
  const MAXW = 1380, MAXH = 640;   // 第二轮（Fred：“表格太大了”）：表格宽约 1300–1400、总高 ≤640，四周留白
  const plan = (f: number, maxLines: number) => {
    const pad = f * 0.7;
    const nat = colMax.map((w) => w * f + 2 * pad);
    let widths = nat;
    if (nat.reduce((a, b) => a + b, 0) > MAXW) {
      // 水位法：找一个上限 cap，使 Σmin(nat, cap) = MAXW
      let lo = 0, hi = Math.max(...nat);
      for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (nat.reduce((a, b) => a + Math.min(b, mid), 0) > MAXW) hi = mid; else lo = mid; }
      if (lo < f * 9 + 2 * pad) return null;   // 换行列至少 9 个字宽，避免窄列硬挤
      widths = nat.map((w) => Math.min(w, lo));
    }
    const lines = (txt: string, j: number) => Math.max(1, Math.ceil((textWidth(txt, f) - 1) / (widths[j] - 2 * pad)));
    const hOf = (cells: string[]) => { const L = Math.max(1, ...Array.from({ length: nCol }, (_, j) => lines(cells[j] ?? '', j))); return L > maxLines ? -1 : f * 1.25 * L + f * 0.7; };
    const heights = [c.columns, ...rows].map(hOf);
    if (heights.some((h) => h < 0)) return null;
    const total = heights.reduce((a, b) => a + b, 0);
    if (total > MAXH) return null;
    return { f, pad, widths, heights, total };
  };
  let P = null as ReturnType<typeof plan>;
  for (let f = 40; f >= 34 && !P; f -= 1) P = plan(f, 1);   // 先求一格一行
  for (let f = 38; f >= 28 && !P; f -= 1) P = plan(f, 2);
  for (let f = 34; f >= 24 && !P; f -= 1) P = plan(f, 3);
  P = P ?? { f: 28, pad: 25, widths: colMax.map((w) => w * 28 + 50), heights: [c.columns, ...rows].map(() => 60), total: 60 * (rows.length + 1) };
  const fs = P.f, px = P.pad, colW = P.widths, rowHs = P.heights;
  const tableW = colW.reduce((a, b) => a + b, 0);
  const tableH = P.total;
  const rowTop = (i: number) => rowHs.slice(0, i + 1).reduce((a, b) => a + b, 0);   // 第 i 行（数据行）的顶边
  const dataLayout: Layout = (() => {
    const box = { x: (1920 - tableW) / 2, y: (1080 - tableH) / 2 + 20, w: tableW, h: tableH };
    return { box, row: { x: box.x, y: box.y + rowTop(fr), w: tableW, h: rowHs[fr + 1] }, header: { x: box.x, y: box.y, w: tableW, h: rowHs[0] }, scale: 1 };
  })();

  // ---------- 截图模式 ----------
  const imageLayout: Layout | null = (() => {
    if (!useImage) return null;
    const [iw, ih] = c.imageSize!;
    // 截图全貌：不压右上角标（顶边低于 130），按 contain 放进 1740×900
    const s = Math.min(1740 / iw, 900 / ih);
    const box = { x: (1920 - iw * s) / 2, y: Math.max(130, (1080 - ih * s) / 2 + 10), w: iw * s, h: ih * s };
    const map = (b: PxBox) => ({ x: box.x + b.x * s, y: box.y + b.y * s, w: b.w * s, h: b.h * s });
    return { box, row: map(c.rowBox!), header: c.headerBox ? map(c.headerBox) : null, scale: s };
  })();
  const L = imageLayout ?? dataLayout;

  // 相机：把目标行（连同表头，如果离得不远）推到画面中央，推到能读清为止
  const zMax = useImage ? 2.6 : 1.45;
  const fx0 = L.row.x, fx1 = L.row.x + L.row.w;
  const zoomFor = (y0: number, y1: number) => Math.max(1, Math.min(zMax, 1760 / (fx1 - fx0), 760 / (y1 - y0 + 40)));
  const fy1 = L.row.y + L.row.h;
  const zRow = zoomFor(L.row.y, fy1);
  // 表头一起保留：前提是总高放得下，且不会让推近倍数掉太多
  const withHeader = L.header && fy1 - L.header.y < 940 && zoomFor(L.header.y, fy1) >= zRow * 0.85 ? L.header : null;
  const fy0 = withHeader ? withHeader.y : L.row.y;
  // 数据模式：整张表本来就占满画面，相机框住整表（轻推近），不把表的上下缘推出画面
  const camY0 = useImage ? fy0 : L.box.y, camY1 = useImage ? fy1 : L.box.y + L.box.h;
  const camX0 = useImage ? fx0 : L.box.x, camX1 = useImage ? fx1 : L.box.x + L.box.w;
  const zoom = useImage ? zoomFor(fy0, fy1) : Math.max(1, Math.min(1.15, 1500 / (camX1 - camX0), 780 / (camY1 - camY0)));
  const camera = cameraTransform((camX0 + camX1) / 2, (camY0 + camY1) / 2, zoom, push);

  const liftScale = useImage ? 1 + 0.025 * lift : 1;   // 数据模式字号不变，只浮起

  // 截图里的一块：用同一张图按原比例裁出来，像素与底图完全重合
  const ImageCrop = ({ b }: { b: PxBox }) => {
    return <div style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, overflow: 'hidden' }}>
      <Img src={staticFile(c.image!)} style={{ position: 'absolute', left: L.box.x - b.x, top: L.box.y - b.y, width: L.box.w, height: L.box.h, maxWidth: 'none' }} />
    </div>;
  };

  const cellText = (s: string, j: number, isFocus: boolean, header: boolean) => {
    const purple = isFocus && c.focusCol === j;
    return <div key={j} style={{
      width: colW[j], paddingLeft: px, paddingRight: px, boxSizing: 'border-box', display: 'flex', alignItems: 'center',
      ...textBase(fs, header || purple || j === 0 ? 900 : 500), whiteSpace: 'normal', lineHeight: 1.25, fontVariantNumeric: 'tabular-nums', color: header ? '#fff' : purple ? `rgb(${[0x19, 0x19, 0x1c].map((v, k) => Math.round(mix(v, [0x85, 0x54, 0xe8][k], keyOn))).join(',')})` : S.ink,
    }}>{s}</div>;
  };
  const HeaderRow = () => <div style={{ display: 'flex', height: rowHs[0], background: S.dark, borderRadius: `${S.radius}px ${S.radius}px 0 0` }}>
    {c.columns.map((h, j) => cellText(h, j, false, true))}
  </div>;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 40}px)` }}>
        <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camera }}>
          {/* 底层：整张表（退后时失焦） */}
          <div style={{ position: 'absolute', inset: 0, filter: useImage && recede > 0 ? `blur(${recede * 12}px)` : undefined }}>
            {useImage
              ? <div style={{ position: 'absolute', left: L.box.x, top: L.box.y, width: L.box.w, height: L.box.h, borderRadius: S.radius, overflow: 'hidden', boxShadow: S.shadow }}>
                <Img src={staticFile(c.image!)} style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
              : <div style={{ position: 'absolute', left: L.box.x, top: L.box.y, width: L.box.w, height: L.box.h, background: '#fff', borderRadius: S.radius, boxShadow: S.shadow, overflow: 'hidden' }}>
                <HeaderRow />
                {rows.map((r, i) => <div key={i} style={{ display: 'flex', height: rowHs[i + 1] }}>{Array.from({ length: nCol }, (_, j) => cellText(r[j] ?? '', j, false, false))}</div>)}
              </div>}
          </div>
          {/* 白蒙版：材料退后（只盖底层，目标行在它上面） */}
          <div style={{ position: 'absolute', left: -2000, top: -2000, width: 6000, height: 6000, background: '#fff', opacity: recede * (useImage ? 0.76 : 0.62) }} />

          {/* 表头保持清楚 */}
          {withHeader && useImage && <div style={{ opacity: recede }}><ImageCrop b={withHeader} /></div>}
          {withHeader && !useImage && <div style={{ position: 'absolute', left: withHeader.x, top: withHeader.y, width: withHeader.w, opacity: recede }}><HeaderRow /></div>}

          {/* 目标行：清楚、浮起一层 */}
          <div style={{
            position: 'absolute', left: L.row.x, top: L.row.y, width: L.row.w, height: L.row.h, opacity: recede,
            transform: `translateY(${useImage ? 0 : -8 * lift}px) scale(${liftScale})`, transformOrigin: '50% 50%',
            boxShadow: lift > 0 ? `0 ${(useImage ? 16 : 22) * lift}px ${(useImage ? 25 : 34) * lift}px 0 rgba(0,0,0,${(useImage ? 0.1333 : 0.2) * lift})` : undefined,
            borderRadius: useImage ? 10 * L.scale + 4 : 14, background: '#fff', overflow: 'hidden',
          }}>
            {useImage
              ? <Img src={staticFile(c.image!)} style={{ position: 'absolute', left: L.box.x - L.row.x, top: L.box.y - L.row.y, width: L.box.w, height: L.box.h, maxWidth: 'none' }} />
              : <div style={{ display: 'flex', height: rowHs[fr + 1] }}>{Array.from({ length: nCol }, (_, j) => cellText(rows[fr]?.[j] ?? '', j, true, false))}</div>}
          </div>
        </div>
      </div>
    </Handoff>
    <Sfx name="whoosh-short" at={0.02} />
    <Sfx name="woosh" at={focusAt} />
    <Sfx name="pop" at={focusAt + 0.45} />
  </Frame>;
}
