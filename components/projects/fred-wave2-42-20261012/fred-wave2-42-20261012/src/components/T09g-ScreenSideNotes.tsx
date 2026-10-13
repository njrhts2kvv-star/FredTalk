// T09g-ScreenSideNotes：录屏 + 侧栏讲解
// 观众要看懂的变化：录屏让出右侧 → 要点按口播逐条点亮
// 关系：录屏一直连续播放（媒体时钟不断）。开场全屏大窗，随后整窗缩到左侧让位，右侧一列白卡要点；
// 口播讲到哪条，那张卡翻成黑卡、关键词变紫，同时录屏在窗内推近这条要点对应的画面区域。
// 讲过的卡退回白卡黑字，还没讲到的保持浅灰。录屏全屏时不加角标，让位后角标淡入。
import React from 'react';
import { OffthreadVideo, staticFile, useVideoConfig } from 'remotion';
import { S, clamp, cueAt, mix, p, q, quintic, textWidth } from '../kit/theme';
import { Box, Brand, Frame, Handoff, HandoffProps, Sfx, between, textBase, useT } from '../kit/ui';

type Rect = { x: number; y: number; w: number; h: number };
export type SideNote = {
  text: string;
  highlight?: string;   // 这条里染紫的词（一条只染一处）
  focus?: Rect;         // 点亮时录屏推近的区域（源视频像素）；省略=看全画面
};
export type ScreenSideNotesProps = HandoffProps & {
  video: string;                          // public/ 下的录屏（H.264）
  videoSize: { w: number; h: number };
  start: number;                          // 从录屏第几秒开始播
  notes: SideNote[];                      // 2–4 条
  cues?: number[];                        // [0]=让位开始；[1..n]=第 i 条点亮
};

export const screenSideNotesDefaults: ScreenSideNotesProps = {
  video: 'media/m-screen-left-dot-desktop.mp4',
  videoSize: { w: 1920, h: 1080 },
  start: 0,
  notes: [
    { text: '左边照常和 dot 聊天', highlight: '聊天', focus: { x: 20, y: 100, w: 520, h: 640 } },
    { text: '它在自己的云电脑上干活', highlight: '云电脑', focus: { x: 560, y: 70, w: 1300, h: 940 } },
    { text: '你随时可以一键接管', highlight: '接管', focus: { x: 940, y: 880, w: 560, h: 200 } },
  ],
};

const FULL: Box = { x: 60, y: 33.222106, w: 1800, h: 1013.555787 };
const COL_X = 1262, COL_W = 600, TOP = 150, BOTTOM = 1000;
const PAD_X = 36, PAD_Y = 34;

// 断行：先算最少行数，再按“每行差不多长”均分；中文逐字、拉丁按词，关键词不拆开
function wrap(text: string, size: number, maxW: number, keep = '') {
  const raw = text.match(/[A-Za-z0-9.+\-_/]+\s*|\s+|./gu) ?? [];
  // 关键词合成一个不可拆的块
  const tokens: string[] = [];
  const hs = keep ? text.indexOf(keep) : -1;
  let pos = 0;
  for (const tk of raw) {
    const inKeep = hs >= 0 && pos > hs && pos < hs + keep.length;
    if (inKeep && tokens.length) tokens[tokens.length - 1] += tk; else tokens.push(tk);
    pos += tk.length;
  }
  const total = textWidth(text.trim(), size);
  const n = Math.max(1, Math.ceil(total / maxW));
  if (n === 1) return [text.trim()];
  const target = total / n;
  const lines: string[] = [];
  let cur = '';
  for (const tk of tokens) {
    const next = cur + tk;
    const over = textWidth(next.trimEnd(), size) > maxW;
    const enough = lines.length < n - 1 && textWidth(cur.trimEnd(), size) >= target * 0.92 && textWidth(next.trimEnd(), size) > target * 1.08;
    const punct = /^[，。、；：！？）」』,.!?;:)]/.test(tk);  // 标点不放行首
    if (cur.trim() && !punct && (over || enough)) { lines.push(cur.trimEnd()); cur = tk.trimStart(); }
    else cur = next;
  }
  if (cur.trim()) lines.push(cur.trimEnd());
  return lines;
}

export function ScreenSideNotes(props: Partial<ScreenSideNotesProps>) {
  const c = { ...screenSideNotesDefaults, ...props };
  const notes = (c.notes.length ? c.notes : screenSideNotesDefaults.notes).slice(0, 4);
  const n = notes.length;
  const t = useT();
  const { fps } = useVideoConfig();

  // 时间：让位 → 卡片入场 → 逐条点亮
  const shrinkAt = cueAt(c.cues, 0, 0.5);
  const defaultLit = n <= 2 ? [1.6, 3.4] : n === 3 ? [1.55, 2.95, 4.3] : [1.5, 2.55, 3.55, 4.6];
  const litAt = (i: number) => cueAt(c.cues, i + 1, defaultLit[i] ?? 1.5 + i);
  const shrink = quintic(t, shrinkAt, shrinkAt + 0.62);

  // 录屏窗：全屏大窗 → 左侧（保持比例）
  const aspect = c.videoSize.w / c.videoSize.h;
  const sw = COL_X - 60 - 68, sh = sw / aspect;
  const SMALL: Box = { x: 60, y: 540 - sh / 2 + 20, w: sw, h: sh };
  const win = between(FULL, SMALL, shrink);

  // 要点卡：统一字号（同组同字阶），放不下先换行、再整体缩字
  const innerW = COL_W - PAD_X * 2;
  const layout = (sz: number) => notes.map((nt) => wrap(nt.text, sz, innerW, nt.highlight));
  const gap = n > 3 ? 26 : 34;
  const stackH = (s: number, ls: string[][]) => ls.reduce((h, l) => h + l.length * s * 1.28 + PAD_Y * 2, 0) + gap * (n - 1);
  // 优先：全部一行（字号可降到 44）；否则 52 起两行均分；仍放不下再整体缩
  let size = 52;
  let lines = layout(size);
  for (let s2 = 52; s2 >= 44; s2 -= 2) { const l2 = layout(s2); if (l2.every((l) => l.length === 1)) { size = s2; lines = l2; break; } }
  while (size > 34 && (lines.some((l) => l.length > 2) || stackH(size, lines) > BOTTOM - TOP)) { size -= 2; lines = layout(size); }
  const total = stackH(size, lines);
  let yy = TOP + (BOTTOM - TOP - total) / 2 + 10;
  const cards = lines.map((ls) => { const h = ls.length * size * 1.28 + PAD_Y * 2; const b = { x: COL_X, y: yy, w: COL_W, h }; yy += h + gap; return b; });

  // 窗内推近：当前点亮那条的 focus；之前看全画面
  type Z = { fx: number; fy: number; z: number };
  const zoomFor = (f?: Rect): Z => {
    if (!f) return { fx: 0.5, fy: 0.5, z: 1 };
    const z = Math.min(2.2, c.videoSize.w / f.w, c.videoSize.h / f.h);
    const hx = 0.5 / z, hy = 0.5 / z;
    return { z, fx: clamp((f.x + f.w / 2) / c.videoSize.w, hx, 1 - hx), fy: clamp((f.y + f.h / 2) / c.videoSize.h, hy, 1 - hy) };
  };
  let zc: Z = { fx: 0.5, fy: 0.5, z: 1 };
  notes.forEach((nt, i) => {
    const v = quintic(t, litAt(i) - 0.08, litAt(i) + 0.55);
    const to = zoomFor(nt.focus);
    zc = { fx: mix(zc.fx, to.fx, v), fy: mix(zc.fy, to.fy, v), z: mix(zc.z, to.z, v) };
  });
  const brandIn = p(t, shrinkAt + 0.3, shrinkAt + 0.8);

  return <Frame brand={false}>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 录屏窗：圆角 24、软阴影、无描边；视频连续播放 */}
      <div style={{ position: 'absolute', left: win.x, top: win.y, width: win.w, height: win.h, borderRadius: S.radius, overflow: 'hidden', boxShadow: S.shadow, background: '#000' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, width: win.w, height: win.h, transformOrigin: '0 0',
          transform: `translate(${win.w / 2}px, ${win.h / 2}px) scale(${zc.z}) translate(${-zc.fx * win.w}px, ${-zc.fy * win.h}px)`,
        }}>
          <OffthreadVideo muted src={staticFile(c.video)} startFrom={Math.round(c.start * fps)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* 要点卡 */}
      {cards.map((b, i) => {
        const appear = p(t, shrinkAt + 0.42 + i * 0.09, shrinkAt + 0.82 + i * 0.09);
        if (appear <= 0) return null;
        const on = p(t, litAt(i), litAt(i) + 0.3);
        const off = i < n - 1 ? p(t, litAt(i + 1), litAt(i + 1) + 0.3) : 0;
        const dark = on * (1 - off);               // 当前：黑卡
        const read = on > 0.5;                      // 讲过/正在讲：黑字（深卡上白字）
        const nt = notes[i];
        const hl = nt.highlight && nt.text.includes(nt.highlight) ? nt.highlight : '';
        const color = dark > 0.5 ? '#fff' : read ? S.ink : S.faint;
        const weight = dark > 0.5 ? 900 : 500;
        // 在断好的行里给关键词染色
        let consumed = 0;
        const hlStart = hl ? nt.text.indexOf(hl) : -1;
        return <div key={i} style={{
          position: 'absolute', left: b.x + (1 - appear) * 60, top: b.y, width: b.w, height: b.h, borderRadius: S.radius,
          background: '#fff', boxShadow: dark > 0.5 ? S.capsuleShadow : S.shadow, opacity: appear,
          transform: `scale(${1 + 0.035 * dark})`, transformOrigin: '0% 50%', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: S.dark, opacity: dark }} />
          <div style={{ position: 'absolute', left: PAD_X, top: PAD_Y }}>
            {lines[i].map((ln, li) => {
              const startIdx = nt.text.indexOf(ln, consumed);
              consumed = startIdx + ln.length;
              const chars = Array.from(ln);
              return <div key={li} style={{ ...textBase(size, weight), lineHeight: 1.28, color }}>
                {chars.map((ch, ci) => {
                  const gi = startIdx + ci;
                  const inHl = hlStart >= 0 && gi >= hlStart && gi < hlStart + hl.length;
                  return <span key={ci} style={inHl && read ? { color: dark > 0.5 ? S.accentDark : S.accent, fontWeight: 900 } : undefined}>{ch}</span>;
                })}
              </div>;
            })}
          </div>
        </div>;
      })}
    </Handoff>
    <div style={{ position: 'absolute', inset: 0, opacity: brandIn, pointerEvents: 'none' }}><Brand /></div>
    <Sfx name="slide" at={shrinkAt} />
    {notes.map((_, i) => <Sfx key={i} name="pop" at={litAt(i)} />)}
  </Frame>;
}
