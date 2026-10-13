// T12i-QuestionBeat：一句问题砸下（快过渡 2s）
// 观众要看懂的变化：一个问题 → 大字落定，问号弹出
// 动作：黑窗 0.3 秒内立住；问题大字逐字从上方砸进各自的位置（过冲半拍再回正，像落地）；
//       字落稳后，句尾问号单独以一次回弹弹出（深底紫）。可选左上白色小胶囊写步骤号。
// 与库内区分：T12a 是“点长成胶囊 + 第N部分”；T12b 是“序号翻动 + 名字从方块后抽出”；
//            这里主角是问题本身：字砸下落定，问号最后弹出。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, abs, textBase, useT } from '../kit/ui';

export type QuestionBeatProps = HandoffProps & {
  question: string;   // 问题；句尾的 ？/? 会被拿出来单独弹出（没写问号也会补一个）
  label: string;      // 左上小号步骤号（例：第二步）；留空不显示
  cues?: number[];    // [0]=大字开始砸下，[1]=问号弹出；不传用默认节奏
};

// 默认内容：第 114 期 S11“第二步，也是最多人卡住的：下载哪个？”
export const questionBeatDefaults: QuestionBeatProps = {
  question: '下载哪个？',
  label: '第二步',
};

// 先冲过目标一点、再回落（motion-craft §2）
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

// 均衡折成两行：优先在标点/空格后断；行尾标点不上屏
const splitTwo = (s: string): string[] => {
  const chars = Array.from(s);
  const total = textWidth(s, 1);
  let best = Math.ceil(chars.length / 2), bestScore = Infinity, acc = 0;
  for (let i = 1; i < chars.length; i++) {
    acc += textWidth(chars[i - 1], 1);
    if (/[，,、。：:；;！!]/.test(chars[i])) continue;
    const soft = /[，,、：:；; ]/.test(chars[i - 1]) ? -2 : 0;
    const score = Math.abs(acc - total / 2) + soft;
    if (score < bestScore) { bestScore = score; best = i; }
  }
  const tidy = (l: string) => l.trim().replace(/[，,、。：:；;]+$/, '');
  return [tidy(chars.slice(0, best).join('')), tidy(chars.slice(best).join(''))];
};

const MAX_TEXT_W = 1440;   // 大字最大行宽
const PAD_X = 112, PAD_Y = 92;
const CHIP_H = 76, CHIP_FS = 42, CHIP_GAP = 34;
const MARK_W = 0.92;       // 问号槽宽（以字号计）

export function QuestionBeat(props: Partial<QuestionBeatProps>) {
  const c = { ...questionBeatDefaults, ...props };
  const t = useT();
  const body = c.question.trim().replace(/[？?]+$/, '');

  // —— 版式：一行能放下 ≥124px 就一行，否则两行；问号槽跟在最后一行 ——
  const fit = (ls: string[]) => Math.min(ls.length > 1 ? 150 : 178,
    ...ls.map((l, i) => MAX_TEXT_W / Math.max(1, textWidth(l, 1) + (i === ls.length - 1 ? MARK_W : 0))));
  let lines = [body];
  let size = fit(lines);
  if (size < 124 && Array.from(body).length > 4) { lines = splitTwo(body); size = fit(lines); }
  const LH = size * (lines.length > 1 ? 1.28 : 1.14);   // 两行时拉开行距，下一行砸进来时不贴着上一行
  const lineW = (i: number) => textWidth(lines[i], size) + (i === lines.length - 1 ? MARK_W * size : 0);
  const contentW = Math.max(...lines.map((_, i) => lineW(i)));
  const chipW = c.label ? textWidth(c.label, CHIP_FS) + CHIP_FS * 1.3 : 0;
  const W = Math.max(contentW, chipW) + PAD_X * 2;
  const chipBlock = c.label ? CHIP_H + CHIP_GAP : 0;
  const H = PAD_Y * 2 + chipBlock + lines.length * LH;
  const X = 960 - W / 2, Y = 540 - H / 2 + 8;
  const textX = X + PAD_X;                  // 步骤号与大字共用左边界
  const textY = Y + PAD_Y + chipBlock;

  // —— 时间 ——
  const slamAt = cueAt(c.cues, 0, 0.2);
  const panel = p(t, 0, 0.3);
  const chip = p(t, 0.08, 0.42);
  const chars = lines.map((l) => Array.from(l));
  const total = chars.reduce((n, l) => n + l.length, 0);
  const step = Math.min(0.05, 0.3 / Math.max(1, total));
  const markAt = cueAt(c.cues, 1, slamAt + total * step + 0.3);
  const mark = springAt(t, markAt, 0.62);
  const markVis = clamp((t - markAt) / 0.08);

  let k = 0;
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{
        ...abs({ x: X, y: Y, w: W, h: H }), background: S.dark, borderRadius: 48, boxShadow: S.capsuleShadow,
        opacity: clamp(panel * 1.8), transform: `scale(${mix(0.9, 1, panel)})`,
      }} />
      {c.label && <div style={{
        ...abs({ x: textX, y: Y + PAD_Y, w: chipW, h: CHIP_H }), borderRadius: CHIP_H / 2, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: panel,
        clipPath: `inset(0 ${100 * (1 - chip)}% 0 0 round ${CHIP_H / 2}px)`, transform: `translateX(${(1 - chip) * -18}px)`,
      }}>
        <span style={{ ...textBase(CHIP_FS, 900), color: S.ink }}>{c.label}</span>
      </div>}
      {lines.map((l, li) => {
        const last = li === lines.length - 1;
        // 每行一条“槽”：字从这一行的上沿砸进来（槽不越过上一行，避免叠字），槽底多留一点给过冲
        return <div key={li} style={{
          position: 'absolute', left: textX, top: textY + li * LH, height: LH + size * 0.12,
          width: lineW(li) + size * 0.4, overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'flex-start' }}>
            {chars[li].map((ch, i) => {
              const a = slamAt + (k++) * step;
              const d = overshoot(t, a, 0.24, 0.16, 0.07);
              return <span key={i} style={{
                ...textBase(size, 400, S.display), lineHeight: 1.14, color: '#fff', display: 'inline-block',
                opacity: t >= a ? 1 : 0, transform: `translateY(${(1 - d) * -LH * 0.85}px) scale(${mix(1.18, 1, clamp(d))})`,
                transformOrigin: '50% 100%',
              }}>{ch}</span>;
            })}
            {last && <span style={{
              ...textBase(size, 400, S.display), lineHeight: 1.14, color: accentOn(true), display: 'inline-block',
              width: MARK_W * size, textAlign: 'center', opacity: markVis,
              transform: `translateY(${(1 - mark) * size * 0.22}px) scale(${Math.max(0, mark)}) rotate(${(1 - mark) * -28}deg)`,
              transformOrigin: '50% 78%',
            }}>？</span>}
          </div>
        </div>;
      })}
    </Handoff>
    <Sfx name="whoosh-short" at={0} />
    <Sfx name="pop" at={markAt} />
  </Frame>;
}
