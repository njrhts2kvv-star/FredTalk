// T17b 代码终端演示：黑窗里敲下一条命令，输出一行行滚出来；跑完后相机推到结果行，结果行点亮为紫色、其余退后。
// 关系：一串滚动的过程输出 → 收束成观众该记住的那一行结果。
import React from 'react';
import { S, clamp, mix, p, quintic, typed } from '../kit/theme';
import { Box, Brand, Frame, MacWindow, Sfx, useT } from '../kit/ui';

export type TerminalRunProps = {
  title: string;
  command: string;
  outputLines: string[];
  resultIndex: number;   // outputLines 中要突出的结果行
  prompt: string;        // 提示符
};

export const terminalRunDefaults: TerminalRunProps = {
  title: 'zsh — fredtalk-site',
  command: 'npm test',
  outputLines: [
    '> fredtalk-site@1.5.0 test',
    '> vitest run',
    '',
    ' ✓ src/subtitle.test.ts (12 tests)',
    ' ✓ src/timeline.test.ts (8 tests)',
    ' ✓ src/render.test.ts (5 tests)',
    '',
    ' Test Files  3 passed (3)',
    '      Tests  25 passed (25)',
    '   Duration  1.84s',
  ],
  resultIndex: 8,
  prompt: '$',
};

const WIN_X = 180, WIN_W = 1560, AREA_TOP = 132, AREA_BOTTOM = 1040, MAX_ROWS = 10;
const BAR = 90;
const PAD_X = 64, PAD_TOP = 46, PAD_BOTTOM = 46;
const MONO_W = 0.6; // Source Code Pro 字宽 ≈ 0.6em

export function TerminalRun(props: Partial<TerminalRunProps>) {
  const c = { ...terminalRunDefaults, ...props };
  const t = useT();
  const lines = c.outputLines;
  const N = lines.length;
  const ri = clamp(Math.round(c.resultIndex), 0, Math.max(0, N - 1));

  // 字号：最长行放得下（上限 38）
  const cmdLine = `${c.prompt} ${c.command}`;
  const maxChars = Math.max(cmdLine.length + 2, ...lines.map((l) => Array.from(l).length));
  const size = Math.min(44, (WIN_W - PAD_X * 2) / (maxChars * MONO_W));
  const LH = Math.round(size * 1.5);
  // 窗高随行数自适应（命令行 + 输出 + 新提示符），超过 MAX_ROWS 行时滚动
  const visibleRows = Math.min(MAX_ROWS, N + 2);
  const winH = BAR + PAD_TOP + PAD_BOTTOM + visibleRows * LH;
  const WIN: Box = { x: WIN_X, y: AREA_TOP + (AREA_BOTTOM - AREA_TOP - winH) / 2, w: WIN_W, h: winH };

  // 时间轴
  const enter = p(t, 0, 0.45);
  const typeStart = 0.35, typeEnd = typeStart + Math.min(1.0, Array.from(c.command).length * 0.06 + 0.1);
  const runAt = typeEnd + 0.18;                        // 回车
  const dt = Math.min(0.15, 1.35 / Math.max(1, N));     // 每行间隔
  const streamStart = runAt + 0.2;
  const streamEnd = streamStart + dt * N;
  const shownCount = clamp((t - streamStart) / dt, 0, N); // 连续值，用于平滑滚动
  const doneRows = Math.floor(shownCount + 1e-6);
  const promptBack = t >= streamEnd + 0.08;            // 跑完回到新提示符
  const totalRows = 1 + doneRows + (promptBack ? 1 : 0);
  // 平滑滚动：内容超出可视行数时整体上移
  const scrollRows = Math.max(0, 1 + shownCount + (promptBack ? 1 : 0) - visibleRows);
  const scroll = scrollRows * LH;

  const focusAt = streamEnd + 0.3;
  const push = quintic(t, focusAt, focusAt + 0.6);
  const light = p(t, focusAt + 0.1, focusAt + 0.5);

  // 结果行在世界坐标中的位置（滚动后），用于相机
  const resText = lines[ri] ?? '';
  const lead = resText.length - resText.trimStart().length;
  const resX0 = WIN.x + PAD_X + lead * size * MONO_W;
  const resX1 = WIN.x + PAD_X + resText.length * size * MONO_W;
  const resY = WIN.y + BAR + PAD_TOP + (1 + ri) * LH - scroll + LH / 2;
  const zoom = Math.min(1.6, 1640 / (resX1 - resX0 + 120));
  // 结果行停在画面略低于中线处，给上方角标留出空间
  const fyEnd = Math.min(resY - 70 / zoom, WIN.y + WIN.h - 560 / zoom), fxEnd = (resX0 + resX1) / 2;
  const fx = mix(960, fxEnd, push), fy = mix(540, fyEnd, push), z = mix(1, zoom, push);
  // 推近终态里窗口是否盖满右上角标区：盖满才换深底角标，否则保持浅底版
  const scr = (x: number, y: number) => ({ x: (x - fxEnd) * zoom + 960, y: (y - fyEnd) * zoom + 540 });
  const wTL = scr(WIN.x, WIN.y), wBR = scr(WIN.x + WIN.w, WIN.y + WIN.h);
  const brandDark = wTL.y < 30 && wTL.x < 1540 && wBR.x > 1900 ? push : 0;

  const rowStyle = (row: number): React.CSSProperties => ({
    position: 'absolute', left: PAD_X, top: PAD_TOP + row * LH - scroll, height: LH, display: 'flex', alignItems: 'center',
    fontFamily: S.mono, fontWeight: 600, fontSize: size, whiteSpace: 'pre', fontSynthesis: 'none', lineHeight: 1,
  });
  const block = (h: number) => <span style={{ display: 'inline-block', width: size * 0.62, height: h, background: '#bdbdbd', marginLeft: 4 }} />;
  const dimOthers = mix(1, 0.24, light);

  return <Frame brand={false}>
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(960px,540px) scale(${z}) translate(${-fx}px,${-fy}px)` }}>
      <MacWindow box={{ ...WIN, y: WIN.y + (1 - enter) * 50 }} bar={BAR} title={c.title} style={{ opacity: enter }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* 命令行 */}
          <div style={{ ...rowStyle(0), opacity: dimOthers }}>
            <span style={{ color: '#8d8d93' }}>{c.prompt} </span>
            <span style={{ color: '#fff' }}>{typed(c.command, t, typeStart, typeEnd)}</span>
            {t < runAt && block(size * 1.15)}
          </div>
          {/* 输出流 */}
          {lines.slice(0, doneRows).map((line, i) => {
            const isRes = i === ri;
            const isMeta = /^\s*>/.test(line);
            const a = streamStart + i * dt;
            const show = p(t, a, a + 0.18);
            return <div key={i} style={{
              ...rowStyle(1 + i), opacity: show * (isRes ? 1 : dimOthers),
              color: isRes ? (light > 0.5 ? S.accentDark : '#ededf0') : isMeta ? '#8d8d93' : '#d9d9de',
              transform: `translateY(${(1 - show) * 10}px)`,
            }}>{line || ' '}</div>;
          })}
          {/* 新提示符 */}
          {promptBack && <div style={{ ...rowStyle(totalRows - 1), opacity: dimOthers }}>
            <span style={{ color: '#8d8d93' }}>{c.prompt} </span>{block(size * 1.15)}
          </div>}
        </div>
      </MacWindow>
    </div>
    {/* 角标：推近后整屏是深窗，换深底版 */}
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - brandDark, zIndex: 900 }}><Brand /></div>
    <div style={{ position: 'absolute', inset: 0, opacity: brandDark, zIndex: 900 }}><Brand dark /></div>
    <Sfx name="typing" at={typeStart} duration={Math.round((typeEnd - typeStart) * 60) + 4} volume={0.4} />
    <Sfx name="click" at={runAt} />
    <Sfx name="scroll" at={streamStart} duration={Math.round((streamEnd - streamStart) * 60) + 6} />
    <Sfx name="ding" at={focusAt + 0.45} />
  </Frame>;
}
