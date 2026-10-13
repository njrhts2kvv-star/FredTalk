// T01g-DarkWindowType：黑窗打字：背景失焦，黑窗里逐行打出规则
// 观众要看懂的变化：界面退后 → 黑窗里逐行打出几条规则
// 升级自 X019：保留“背景界面失焦 → 深色 Mac 窗从右侧滑入 → 大标题逐字打出 → 规则逐行打出、块状光标停在当前行末”的结构；
// 原版规格（XScenesB.tsx:23）：窗 1412×1004 r36，体 #212123、栏 #161618 高 90；标题锐字 180、正文 84，
// 白字投影 8px 9px 5px #000；光标为实心块，停到下一行开始，不闪烁；背景 blur 0→16px。
// 本版：窗口用 kit 的 MacWindow；宽高按文字自适应（右上角标区域不压）；行数 1–4；没打到的字透明占位，打字时整行不跳位。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, MacWindow, Media, Sfx, textBase, useT } from '../kit/ui';

export type DarkWindowTypeProps = HandoffProps & {
  title: string;        // 黑窗大标题（可留空）
  lines: string[];      // 规则 1–4 行
  highlight: string;    // 某一行里染紫的一处关键词（深底 #D6BEFF）；留空不染
  background: string;   // 退后的真实界面截图（public 下路径）
  cues?: number[];      // 口播时间点（秒，场景内）：[0]=黑窗进入，[1]=标题开始打，[2..]=第 1..n 行开始打
};

export const darkWindowTypeDefaults: DarkWindowTypeProps = {
  title: '制作规则',
  lines: ['每次创作可以替换文字图片和视频', '完成一条后保存项目文件', '检查之后再完成最终输出'],
  highlight: '保存项目文件',
  background: 'media/w2-codex-full.jpg',
};

const BAR = 90;
const MAX_W = 1500, MIN_W = 1100;
const BRAND_SAFE_TOP = 150;   // 窗口伸到角标下方时，顶边不高于此（角标 y 36–121，再留出呼吸）

// 块状光标：零宽锚点，不挤动后面的透明占位字
function Caret({ h, w }: { h: number; w: number }) {
  return <span style={{ position: 'relative', display: 'inline-block', width: 0, height: '1em', verticalAlign: 'baseline' }}>
    <span style={{ position: 'absolute', left: w * 0.12, top: '50%', width: w, height: h, transform: 'translateY(-50%)', background: S.faint }} />
  </span>;
}

export function DarkWindowType(props: Partial<DarkWindowTypeProps>) {
  const c = { ...darkWindowTypeDefaults, ...props };
  const t = useT();
  const lines = c.lines.slice(0, 4);
  const n = lines.length;
  const hasTitle = c.title.trim().length > 0;

  // ---- 版式：按最长行算字号与窗口宽，再按可用高度整体收缩 ----
  const padX = 110;
  const maxUnits = Math.max(1, ...lines.map((l) => textWidth(l, 1)));
  let L = Math.min(n <= 2 ? 96 : 84, (MAX_W - padX * 2) / maxUnits);
  let T = Math.min(180, (MAX_W - padX * 2) * 0.9 / Math.max(1, textWidth(c.title, 1)));   // 锐字真言拉丁字偏宽，标题多留一成
  const pitchK = 1.9, gapK = 0.3;   // 行距 = 1.9×字号（X019：160/84）；标题后空 0.3×标题字号
  const padY = 70;
  const natural = (tt: number, ll: number) => padY * 2 + (hasTitle ? tt * 1.04 + tt * gapK : 0) + (n - 1) * ll * pitchK + ll * 1.2;
  const bodyMax = 1080 - BRAND_SAFE_TOP - 26 - BAR;
  const k = Math.min(1, (bodyMax - padY * 2) / (natural(T, L) - padY * 2));
  T *= k; L *= k;
  const bodyH = natural(T, L);
  const W = clamp(Math.max(textWidth(c.title, T), maxUnits * L) + padX * 2, MIN_W, MAX_W);
  const H = BAR + bodyH;
  const X = (1920 - W) / 2;
  const reachesBrand = X + W > 1540;
  const Y = reachesBrand ? Math.max(BRAND_SAFE_TOP, (1080 - H) / 2) : (1080 - H) / 2;

  // ---- 时间 ----
  const a0 = cueAt(c.cues, 0, 0.1);
  const recede = q(t, a0 - 0.05, a0 + 0.55);          // 背景失焦+白蒙版
  const slide = p(t, a0, a0 + 0.7);                     // 窗从右侧滑入
  const titleN = Array.from(c.title).length;
  const titleAt = cueAt(c.cues, 1, a0 + 0.78);
  const titleEnd = hasTitle ? titleAt + Math.min(titleN * (10 / 60), 0.9) : titleAt;   // 标题约 10 帧/字，长标题封顶 0.9 秒
  // 正文：默认 5–7 帧/字，按剩余时长自动收紧，保证结尾 ≥0.8 秒稳定
  const lineStart0 = hasTitle ? titleEnd + 0.12 : titleAt;
  const counts = lines.map((l) => Array.from(l).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const budget = Math.max(0.8, 5.2 - lineStart0 - 0.12 * (n - 1));
  const perChar = Math.max(2.5 / 60, Math.min(6.5 / 60, budget / Math.max(1, total)));
  const starts: number[] = [];
  const ends: number[] = [];
  let cursor = lineStart0;
  lines.forEach((_, i) => {
    const s0 = cueAt(c.cues, 2 + i, cursor);
    starts.push(s0);
    ends.push(s0 + counts[i] * perChar);
    cursor = ends[i] + 0.12;
  });

  const shown = (len: number, a: number, b: number) => Math.floor(clamp((t - a) / Math.max(0.001, b - a)) * len);
  // 一处强调词：找第一次出现的行
  const hlLine = c.highlight ? lines.findIndex((l) => l.includes(c.highlight)) : -1;

  const renderRow = (text: string, size: number, a: number, b: number, caretUntil: number, mark: boolean, isTitle: boolean) => {
    const arr = Array.from(text);
    const k2 = shown(arr.length, a, b);
    const hlFrom = mark ? Array.from(text.slice(0, text.indexOf(c.highlight))).length : -1;
    const hlTo = mark ? hlFrom + Array.from(c.highlight).length : -1;
    const caretOn = t >= a && t < caretUntil;
    return <div style={{ ...textBase(size, 400, S.display), lineHeight: 1, color: '#fff', textAlign: 'center', textShadow: S.textShadowDark, whiteSpace: 'nowrap' }}>
      {arr.map((ch, i) => <React.Fragment key={i}>
        {caretOn && i === k2 && <Caret h={size * (isTitle ? 1.02 : 1.38)} w={size * (isTitle ? 0.34 : 0.7)} />}
        <span style={{ opacity: i < k2 ? 1 : 0, color: i >= hlFrom && i < hlTo ? accentOn(true) : '#fff' }}>{ch}</span>
      </React.Fragment>)}
      {caretOn && k2 >= arr.length && <Caret h={size * (isTitle ? 1.02 : 1.38)} w={size * (isTitle ? 0.34 : 0.7)} />}
    </div>;
  };

  const lastCaret = ends.length ? ends[n - 1] + 14 / 60 : titleEnd + 14 / 60;
  return <Frame>
    {/* 背景：真实界面在第一帧可见，随后失焦退后（不作用于前景黑窗与角标） */}
    <div style={{ position: 'absolute', inset: 0, filter: `blur(${recede * 16}px)`, transform: `scale(${mix(1, 1.04, recede)})` }}>
      <Media src={c.background} box={{ x: 0, y: 0, w: 1920, h: 1080 }} radius={0} />
    </div>
    <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.74 * recede }} />
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <MacWindow box={{ x: mix(1920 + 40, X, slide), y: Y, w: W, h: H }} bar={BAR}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: padY, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {hasTitle && <div style={{ height: T * 1.04 + T * gapK }}>
            {renderRow(c.title, T, titleAt, titleEnd, n ? starts[0] : lastCaret, false, true)}
          </div>}
          {lines.map((l, i) => <div key={i} style={{ height: i < n - 1 ? L * pitchK : L * 1.2, display: 'flex', alignItems: 'flex-start' }}>
            {renderRow(l, L, starts[i], ends[i], i < n - 1 ? starts[i + 1] : lastCaret, i === hlLine, false)}
          </div>)}
        </div>
      </MacWindow>
    </Handoff>
    <Sfx name="whoosh-short" at={a0} />
    {hasTitle && <Sfx name="typing" at={titleAt} duration={Math.round((titleEnd - titleAt) * 60) + 4} volume={0.4} />}
    {lines.map((_, i) => <Sfx key={i} name="typing" at={starts[i]} duration={Math.round((ends[i] - starts[i]) * 60) + 4} volume={0.4} />)}
  </Frame>;
}
