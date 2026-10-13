// T01e-ConditionCapsule：条件黑胶囊：圆点展开，逐字打出条件再补一段
// 观众要看懂的变化：一个条件 → 补上第二个条件，组合成完整前提
// 升级自 X003：保留“小圆点长成圆（轻微过冲）→ 打开成胶囊 → 逐字打出条件 → 胶囊再横向延长、补上一段”的两段式。
// 实测（X003 timelines，×1.5 到 1920）：圆点 30→255，24f 成圆；~60f 成 1185×366 胶囊，字 171；
// 延长到 1686×270，字 171→145。原版整句都是紫色；按 Fred 意见，紫色只给补充段。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
// 字体：沿 X003 原版用 MiSans Heavy 900（数字/英文在锐字真言里易误读，如 8 像 B）。
import React from 'react';
import { S, accentOn, cueAt, mix, p, q, textWidth, typed } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, textBase, useT } from '../kit/ui';

export type ConditionCapsuleProps = HandoffProps & {
  condition: string;  // 第一个条件（白字）
  extra: string;      // 补上的条件（紫字，通常以“+”开头）
  cues?: number[];    // 口播时间点（秒，场景内）：[0]=圆点出现，[1]=胶囊延长、补上第二个条件
};

export const conditionCapsuleDefaults: ConditionCapsuleProps = {
  condition: '8G显存笔记本',
  extra: '+量化模型',
};

const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

const MAX_W = 1640;
const PAD = 1.55;  // 单行胶囊两端留白（以字号计；含拉丁字宽估算误差）

export function ConditionCapsule(props: Partial<ConditionCapsuleProps>) {
  const c = { ...conditionCapsuleDefaults, ...props };
  const t = useT();

  // ---- 版式（全部按真实字宽计算）----
  const u1 = textWidth(c.condition, 1), u2 = textWidth(c.extra, 1), uAll = u1 + u2;
  // 第一段：一条胶囊
  const s1 = Math.min(171, MAX_W / (u1 + PAD));
  const h1 = s1 * 2.14;
  const w1 = Math.max(h1 * 1.7, u1 * s1 + PAD * s1);
  // 第二段：优先同一行延长；放不下（字号 < 100）就把补充段放到第二行，胶囊向下加厚
  const single = Math.min(145, s1 * 0.86, MAX_W / (uAll + PAD));
  const twoLine = single < 100;
  const s2 = twoLine ? Math.min(130, s1 * 0.9, MAX_W / (Math.max(u1, u2) + 3.22 * 0.72)) : single;
  const h2 = twoLine ? s2 * 3.22 : s2 * 1.86;
  const w2 = twoLine ? Math.max(u1, u2) * s2 + h2 * 0.72 : Math.max(w1, uAll * s2 + PAD * s2);
  const D = h1 * 0.7;  // 圆的直径（X003：255 / 366）

  // ---- 时间 ----
  const a0 = cueAt(c.cues, 0, 0.05);
  const grow = overshoot(t, a0, 0.36, 0.14, 0.04);
  const open = p(t, a0 + 0.42, a0 + 1.22);
  const n1 = Array.from(c.condition).length, n2 = Array.from(c.extra).length;
  const type1 = a0 + 1.0, type1End = type1 + Math.min(1.25, n1 * 0.11);
  const a1 = cueAt(c.cues, 1, Math.max(type1End + 0.9, 3.2));
  const ext = p(t, a1, a1 + 0.85);
  const type2 = a1 + 0.22, type2End = type2 + Math.min(0.95, n2 * 0.11);

  const w = t < a0 + 0.42 ? D * grow : mix(mix(D, w1, open), w2, ext);
  const h = t < a0 + 0.42 ? D * grow : mix(mix(D, h1, open), h2, ext);

  // 文字几何：整句按终态排好、由 CSS 精确居中；没打到的字只是透明占位，所以逐字打出时不跳位。
  // 第一阶段整句右移“补充段宽度的一半”，让第一段单独居中；延长时滑回组合位置，字号同步 171→145 收小。
  const y2a = twoLine ? 540 - s2 * 0.6 : 540;    // 第一段中线
  const y2b = twoLine ? 540 + s2 * 0.6 : 540;    // 补充段中线
  const size = mix(s1, s2, ext);
  const shift = twoLine ? 0 : (u2 * size) / 2 * (1 - ext);
  const fy = mix(540, y2a, ext);
  const shown = (s: string, a: number, b: number) => Array.from(typed(s, t, a, b)).length;
  const reveal = (s: string, a: number, b: number, color: string) => {
    const k = shown(s, a, b);
    return Array.from(s).map((ch, i) => <span key={i} style={{ color, opacity: i < k ? 1 : 0 }}>{ch}</span>);
  };

  const row = (s: number, y: number): React.CSSProperties => ({ ...textBase(s, 900, S.body), position: 'absolute', left: 0, width: 1920, top: y - s / 2, lineHeight: 1, textAlign: 'center' });
  const visible = t >= a0;
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {visible && <Pill box={{ x: 960 - w / 2, y: 540 - h / 2, w, h }} />}
      {/* 字放在胶囊外层、按舞台坐标定位，并按胶囊形状裁切：胶囊变形时文字不抖动、不出界 */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${540 - h / 2}px ${960 - w / 2}px ${540 - h / 2}px ${960 - w / 2}px round ${Math.min(w, h) / 2}px)` }}>
        <div style={{ ...row(size, fy), transform: `translateX(${shift}px)` }}>
          {reveal(c.condition, type1, type1End, '#fff')}
          {!twoLine && reveal(c.extra, type2, type2End, accentOn(true))}
        </div>
        {twoLine && <div style={row(s2, y2b)}>{reveal(c.extra, type2, type2End, accentOn(true))}</div>}
      </div>
    </Handoff>
    <Sfx name="pop" at={a0} />
    <Sfx name="typing" at={type1} duration={Math.round((type1End - type1) * 60) + 6} volume={0.4} />
    <Sfx name="slide" at={a1} />
    <Sfx name="typing" at={type2} duration={Math.round((type2End - type2) * 60) + 6} volume={0.4} />
  </Frame>;
}
