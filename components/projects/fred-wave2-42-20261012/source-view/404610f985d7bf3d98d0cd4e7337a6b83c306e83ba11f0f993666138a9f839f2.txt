// T12e-ChapterBar：章节白条擦出（快过渡）
// 观众要看懂的变化：黑底 → 白条擦出章节标题，再缩成徽标停住
// 升级自 C034（Transition.tsx:12-16,45-58）：保留“白条从标题底部向上打开（条内反色黑字）→ 白条上移、收窄成章节徽标，
// 让出下面的白色标题”的两拍节奏和反色遮罩做法；曲线沿用 wipe() = bezier(.65,0,.2,1)，打开 3→30f、上移 36→68f。
// 本版：标签改成中文“第N部分”，标题改 MiSans Heavy 粗大字并按字宽自适应；白条用纯白、落定成白色胶囊徽标（原版 #e6e6e6 直角条）。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { S, cueAt, mix, textWidth, wipe } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type ChapterBarProps = HandoffProps & {
  label: string;      // 章节标签，中文：第一部分 / 第三部分
  title: string;      // 章节标题
  cues?: number[];    // 口播时间点（秒，场景内）：[0]=白条打开，[1]=白条上移缩成徽标
};

export const chapterBarDefaults: ChapterBarProps = {
  label: '第三部分',
  title: '生成可复用 Skill',
};

// 均衡断行：不在标点前断，优先在空格/标点后断
const splitTwo = (s: string): string[] => {
  const chars = Array.from(s);
  const total = textWidth(s, 1);
  let best = Math.ceil(chars.length / 2), bestScore = Infinity, acc = 0;
  for (let i = 1; i < chars.length; i++) {
    acc += textWidth(chars[i - 1], 1);
    if (/[，,、。：:；;！!？?]/.test(chars[i])) continue;
    const score = Math.abs(acc - total / 2) - (/[，,、：:；; ]/.test(chars[i - 1]) ? 1.6 : 0);
    if (score < bestScore) { bestScore = score; best = i; }
  }
  return [chars.slice(0, best).join('').trim().replace(/[，,、]$/, ''), chars.slice(best).join('').trim()];
};

export function ChapterBar(props: Partial<ChapterBarProps>) {
  const c = { ...chapterBarDefaults, ...props };
  const t = useT();

  // ---- 版式（1920 舞台）----
  // 一行放不下（字号 < 104）就均衡折成两行，白条按两行高度打开
  const oneLine = Math.min(170, 1600 / Math.max(1, textWidth(c.title, 1) + 1));
  const rows = oneLine < 104 ? splitTwo(c.title) : [c.title];
  const widest = Math.max(...rows.map((r) => textWidth(r, 1)));
  const Tz = rows.length > 1 ? Math.min(140, 1600 / (widest + 1)) : oneLine;
  const Lz = Math.min(84, Math.max(60, Tz * 0.52));
  const titleH = Tz * 1.16 * rows.length;
  const badgeH = Lz * 1.5;
  const gap = Tz * 0.3;
  const top0 = 540 - (badgeH + gap + titleH) / 2;
  const labelTop = top0, titleTop = top0 + badgeH + gap;
  const titleW = widest * Tz + Tz * 0.9;   // 含拉丁字宽估算误差
  const badgeW = textWidth(c.label, Lz) + Lz * 1.3;

  // ---- 时间（C034：3→30f 打开，36→68f 上移；2 秒版留 ≥0.8 秒停稳）----
  const a0 = cueAt(c.cues, 0, 0.05);
  const a1 = cueAt(c.cues, 1, a0 + 0.55);
  const open = wipe(t, a0, a0 + 0.45);
  const travel = wipe(t, a1, a1 + 0.53);

  const barW = mix(titleW, badgeW, travel);
  const barH = titleH * open + (badgeH - titleH) * travel;
  const barTop = titleTop + titleH * (1 - open) + (labelTop - titleTop) * travel;
  const barLeft = (1920 - barW) / 2;

  // 同一套文字画两遍：底层白字（黑底），白条里是反色黑字；白条移到哪里，哪里就反色
  const text = (color: string) => <>
    <div style={{ ...textBase(Lz, 600), position: 'absolute', left: 0, width: 1920, top: labelTop + (badgeH - Lz * 1.16) / 2, textAlign: 'center', color }}>{c.label}</div>
    <div style={{ ...textBase(Tz, 900), position: 'absolute', left: 0, width: 1920, top: titleTop, height: titleH, textAlign: 'center', color,
      clipPath: `inset(${100 * (1 - open)}% 0 0 0)` }}>{rows.map((r, i) => <div key={i}>{r}</div>)}</div>
  </>;

  return <Frame dark>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {text('#fff')}
      {barH > 0.5 && <div style={{ position: 'absolute', left: barLeft, top: barTop, width: barW, height: barH, background: '#fff', overflow: 'hidden',
        borderRadius: (barH / 2) * travel }}>
        <div style={{ position: 'absolute', left: -barLeft, top: -barTop, width: 1920, height: 1080 }}>{text(S.ink)}</div>
      </div>}
    </Handoff>
    <Sfx name="whoosh-short" at={a0} />
    <Sfx name="slide" at={a1} />
  </Frame>;
}
