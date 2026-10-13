// T18f-LogoGrid：Logo 矩阵
// 观众要看懂的变化：一墙 Logo 铺开 → 被框成几组，点出其中一组
// 动作：Logo 错开浮现成一面墙（按组排好）→ 同组的 Logo 向彼此收拢、两组之间拉开，白卡从下面长出、组名胶囊随后出现（对象不消失、不交换位置、不交叉） → 点名的那一组抬起放大，其余退后。
// 和 T18b（工具串成流程）区分：这里没有先后，只有“归类”。
// 素材（都是库里已抠干净的真实 Logo，透明底）：ChatGPT / Codex / 豆包工作 取自 fred-wave2-fix5 的 w9-logo-*（已在 T18b 返修里确认干净）；
//   WorkBuddy 取自 ep87 的 workbuddy.png（原图白底），本组件制作时按圆角方块外形做了遮罩，已目视检查无白边。
//   库里目前只有这 4 个能直接用的干净 Logo，所以默认墙只有 4 个；传更多 logos 会自动排成多行（容量测试按 12 个看过）。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type LogoItem = { src: string; name: string; group: number; scale?: number };
export type LogoGridProps = HandoffProps & {
  logos: LogoItem[];    // 1–12 个，按 group 稳定排序后排成墙；group 是归到第几组
  groups: string[];     // 组名
  focus: number;        // 最后点出哪一组
  cues?: number[];      // [0]=墙开始浮现，[1]=开始分组，[2]=点出一组
};

export const logoGridDefaults: LogoGridProps = {
  logos: [
    { src: 'media/x6-logo-chatgpt.png', name: 'ChatGPT', group: 0 },
    { src: 'media/x6-logo-doubao.png', name: '豆包工作', group: 0 },
    { src: 'media/x6-logo-codex.png', name: 'Codex', group: 1 },
    { src: 'media/x6-logo-workbuddy.png', name: 'WorkBuddy', group: 1, scale: 0.86 },
  ],
  groups: ['对话和资料', '动手做事'],
  focus: 1,
};

const WALL_COLS: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5, 11: 4, 12: 4 };
const NAME_SIZE = 34;

export function LogoGrid(props: Partial<LogoGridProps>) {
  const c = { ...logoGridDefaults, ...props };
  const t = useT();
  // 墙上的顺序按 group 稳定排序：同组在墙上就挨着，分组时只是收拢和拉开，不交叉
  const logos = c.logos.slice(0, 12).map((x, k) => ({ x, k })).sort((a, b) => a.x.group - b.x.group || a.k - b.k).map((m) => m.x);
  const N = Math.max(1, logos.length);
  const G = Math.max(1, c.groups.length);
  const focus = clamp(Math.round(c.focus), 0, G - 1);
  const maxName = Math.max(1, ...logos.map((x) => textWidth(x.name, 1)));

  // ---------- 墙：终态位置 ----------
  const cols = WALL_COLS[N] ?? 4;
  const rows = Math.ceil(N / cols);
  const Px = Math.min(340, 1560 / cols);
  const L = Math.min(240, 700 / rows - 84, Px * 0.62);
  const Py = L + 84;
  const CY = 590;
  const wallPos = (i: number) => {
    const row = Math.floor(i / cols), col = i % cols;
    const inRow = row === rows - 1 ? N - row * cols : cols;
    return { x: 960 + (col - (inRow - 1) / 2) * Px, y: CY - (rows * Py) / 2 + row * Py + L / 2 };
  };

  // ---------- 分组：每组一个白卡，内部按网格排 ----------
  const members = Array.from({ length: G }, (_, g) => logos.map((x, i) => ({ x, i })).filter((m) => m.x.group === g).map((m) => m.i));
  const PADG = 36, TOP = 62, GAP = 56;
  const layout = (L2: number) => {
    const cellW = Math.max(L2 * 1.4, maxName * NAME_SIZE + 28), cellH = L2 + 84;
    const boxes = members.map((m) => {
      const k = Math.max(1, m.length);
      const cg = k <= 2 ? k : k <= 4 ? 2 : 3;
      const rg = Math.ceil(k / cg);
      return { cg, rg, w: cg * cellW + PADG * 2, h: TOP + rg * cellH + PADG - 10 };
    });
    const perRow = G <= 3 ? G : G === 4 ? 2 : 3;
    const lines: number[][] = [];
    for (let g = 0; g < G; g += perRow) lines.push(Array.from({ length: Math.min(perRow, G - g) }, (_, k) => g + k));
    const lineW = lines.map((ln) => ln.reduce((a, g) => a + boxes[g].w, 0) + GAP * (ln.length - 1));
    const lineH = lines.map((ln) => Math.max(...ln.map((g) => boxes[g].h)));
    return { cellW, cellH, boxes, lines, lineW, lineH, W: Math.max(...lineW), H: lineH.reduce((a, b) => a + b, 0) + GAP * (lines.length - 1) };
  };
  let L2 = Math.min(L, 220);
  let lay = layout(L2);
  while ((lay.W > 1640 || lay.H > 780) && L2 > 70) { L2 -= 6; lay = layout(L2); }
  const gTop = CY - lay.H / 2 + 10;
  const gBox = members.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
  lay.lines.forEach((ln, li) => {
    let x = 960 - lay.lineW[li] / 2;
    const y = gTop + lay.lineH.slice(0, li).reduce((a, b) => a + b + GAP, 0);
    ln.forEach((g) => { gBox[g] = { x, y, w: lay.boxes[g].w, h: lay.boxes[g].h }; x += lay.boxes[g].w + GAP; });
  });
  const groupPos = (i: number) => {
    const g = logos[i].group, j = members[g].indexOf(i), b = gBox[g], cg = lay.boxes[g].cg;
    const col = j % cg, row = Math.floor(j / cg);
    return { x: b.x + PADG + (col + 0.5) * lay.cellW, y: b.y + TOP + row * lay.cellH + L2 / 2 };
  };

  // ---------- 时间线 ----------
  const wallAt = cueAt(c.cues, 0, 0.1);
  const groupAt = cueAt(c.cues, 1, 1.9 + (N > 8 ? 0.3 : 0));
  const focusAt = cueAt(c.cues, 2, groupAt + 1.7);
  const boxIn = p(t, groupAt + 0.25, groupAt + 0.95);
  const lift = p(t, focusAt, focusAt + 0.7);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {Array.from({ length: G }, (_, g) => {
        const b = gBox[g];
        const isF = g === focus;
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const sc = isF ? mix(1, 1.07, lift) : mix(1, 0.96, lift);
        const op = isF ? 1 : mix(1, 0.4, lift);
        const label = c.groups[g] ?? '';
        const lfs = Math.min(40, (b.w - 80) / Math.max(1, textWidth(label, 1)));
        const lw = textWidth(label, lfs) + 72, lh = 64;
        const tagOpen = p(t, groupAt + 0.6, groupAt + 1.1);
        return <div key={g} style={{ position: 'absolute', inset: 0, transform: `scale(${sc})`, transformOrigin: `${cx}px ${cy}px`, opacity: op, zIndex: isF && lift > 0 ? 5 : 1 }}>
          {/* 分组白卡：同一批 Logo 滑进来之后才长出来 */}
          <Surface box={{ x: b.x, y: b.y, w: b.w, h: b.h }} shadow={isF && lift > 0 ? `0 ${16 + 12 * lift}px ${25 + 16 * lift}px 0 rgba(0,0,0,${0.1333 + 0.08 * lift})` : S.shadow}
            style={{ opacity: boxIn, transform: `scale(${mix(0.95, 1, boxIn)})`, transformOrigin: '50% 50%', overflow: 'visible' }} />
          {boxIn > 0 && <Pill box={{ x: b.x + PADG - 6, y: b.y - lh / 2, w: lw, h: lh }}
            style={{ clipPath: tagOpen < 0.999 ? `inset(-40px ${100 * (1 - tagOpen)}% -40px 0 round ${lh / 2}px)` : undefined, overflow: 'visible', zIndex: 3 }}>
            <span style={{ ...textBase(lfs, 400, S.display), color: '#fff', position: 'relative' }}>
              <span style={{ opacity: isF ? 1 - lift : 1 }}>{label}</span>
              {isF && <span style={{ position: 'absolute', left: 0, top: 0, color: S.accentDark, opacity: lift }}>{label}</span>}
            </span>
          </Pill>}
          {members[g].map((i) => {
            const it = logos[i];
            const w0 = wallPos(i), g0 = groupPos(i);
            const d = (((i * 5) % N) / N) * 0.5;
            const a = wallAt + d;
            const inP = p(t, a, a + 0.6);
            const mv = q(t, groupAt + (i % 4) * 0.05, groupAt + 0.9 + (i % 4) * 0.05);
            const x = mix(w0.x, g0.x, mv), y = mix(w0.y, g0.y, mv) + (1 - inP) * 36;
            const size = mix(L, L2, mv) * (it.scale ?? 1);
            const nameTop = y + mix(L, L2, mv) / 2 + 12;
            return <React.Fragment key={i}>
              <Img src={staticFile(it.src)} style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, objectFit: 'contain', opacity: inP, transform: `scale(${mix(0.86, 1, inP)})`, zIndex: 2 }} />
              <div style={{ position: 'absolute', left: x - 200, width: 400, top: nameTop, textAlign: 'center', ...textBase(NAME_SIZE, 500), opacity: inP, zIndex: 2 }}>{it.name}</div>
            </React.Fragment>;
          })}
        </div>;
      })}
    </Handoff>
    <Sfx name="pop" at={wallAt + 0.1} volume={0.4} />
    <Sfx name="gather" at={groupAt} />
    <Sfx name="ding" at={focusAt + 0.2} />
  </Frame>;
}
