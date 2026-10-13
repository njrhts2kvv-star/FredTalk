// T14a2-ABTimeRace：A/B 耗时赛跑（返修自 T14a）：轨道加长
// 观众要看懂的变化：两方同时开跑 → 快的一方先到，倍数落定
// 关系：同一起跑线、同一比例尺 → A 先停（叮）→ B 跑完 → 两条一起定格，差距本身就是证据 → 黑胶囊给倍数。
// 返修点（Fred）：轨道条更长，占满主要画面宽度。
//   旧版名字、轨道、计时器挤在同一行，轨道只剩约 800px；现在名字和计时器在卡片上沿一行，
//   轨道独占下面整行（约 1550px，贯穿卡片内宽）。其余动作、节奏、胶囊、音效保持 T14a 原样；补 HandoffProps 和 cues。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type RaceSide = { name: string; seconds: number };
export type ABTimeRaceProps = HandoffProps & {
  a: RaceSide;              // 快的一方
  b: RaceSide;              // 慢的一方
  resultText?: string;      // 缺省自动写“快 x 倍”
  resultKey?: string;       // 胶囊里染紫的片段；缺省取数字
  cues?: number[];          // [0]=开跑，[1]=慢的一方到终点，[2]=倍数胶囊落下；不传用默认 0.6 / 3.1 / 3.45
};

export const aBTimeRaceDefaults: ABTimeRaceProps = {
  a: { name: 'Codex 并行改', seconds: 38 },
  b: { name: '手动逐个改', seconds: 122 },
};

// 时间显示：一分钟内带一位小数，超过一分钟用 m:ss
const clock = (s: number) => {
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

const CARD_X = 100, CARD_W = 1720, GAP = 40;
const PAD_X = 64, PAD_Y = 40, HEAD_GAP = 24;
const BAR_H = 84;

export function ABTimeRace(props: Partial<ABTimeRaceProps>) {
  const c = { ...aBTimeRaceDefaults, ...props };
  const t = useT();
  const RACE_START = cueAt(c.cues, 0, 0.6);
  const RACE_END = Math.max(RACE_START + 0.6, cueAt(c.cues, 1, RACE_START + 2.5));   // 不论真实秒数，慢的一方都在这段里跑完
  const RES = cueAt(c.cues, 2, RACE_END + 0.35);
  const fast = Math.min(c.a.seconds, c.b.seconds), slow = Math.max(c.a.seconds, c.b.seconds, 0.001);
  const ratio = slow / Math.max(fast, 0.001);
  const ratioText = ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(1);
  const result = c.resultText ?? `快 ${ratioText} 倍`;
  const key = c.resultKey ?? (result.match(/[\d.]+/)?.[0] ?? '');

  // 上沿一行：名字（左）+ 计时器（右）；名字字号按两边较长的名字自适应
  const timerSize = 72;
  const timerCol = textWidth(clock(slow), timerSize) + 20;
  const nameMax = CARD_W - PAD_X * 2 - timerCol - 60;
  const longest = Math.max(textWidth(c.a.name, 1), textWidth(c.b.name, 1));
  const nameSize = Math.max(48, Math.min(76, nameMax / Math.max(1, longest)));
  const headH = Math.max(nameSize, timerSize) * 1.16;
  const CARD_H = PAD_Y * 2 + headH + HEAD_GAP + BAR_H;
  // 轨道：贯穿卡片内宽
  const trackX = PAD_X;
  const trackW = CARD_W - PAD_X * 2;

  // 模拟时钟：比例尺把最慢的一方压到 RACE_END
  const scale = (RACE_END - RACE_START) / slow;        // 每真实秒对应的画面秒
  const realElapsed = clamp((t - RACE_START) / scale, 0, slow);

  const pillSize = 84, pillH = 156, pillGap = 64;
  const settledTop = Math.max(132, (1080 - (CARD_H * 2 + GAP + pillGap + pillH)) / 2 + 24);
  // 赛跑时两条轨道居中；结论出现前整组上移让出胶囊位置
  const top = mix(settledTop + (pillGap + pillH) / 2, settledTop, q(t, RES - 0.15, RES + 0.3));
  const fastFinish = RACE_START + fast * scale;
  const res = p(t, RES, RES + 0.45);

  const rows = [c.a, c.b].map((side, i) => {
    const enter = p(t, 0.04 + i * 0.1, 0.5 + i * 0.1);
    const run = Math.min(realElapsed, side.seconds);
    const done = realElapsed >= side.seconds - 1e-6 && t >= RACE_START;
    const isFast = side.seconds === fast;
    const finishAt = RACE_START + side.seconds * scale;
    const pulse = isFast ? Math.max(0, 1 - Math.abs(t - finishAt - 0.12) / 0.18) : 0;   // 停表瞬间计时器轻轻一跳
    const y = top + i * (CARD_H + GAP);
    const w = trackW * (run / slow);
    const headTop = PAD_Y;
    return <Surface key={i} box={{ x: CARD_X + (1 - enter) * -80, y, w: CARD_W, h: CARD_H }} style={{ opacity: enter }}>
      <div style={{ position: 'absolute', left: PAD_X, top: headTop + (headH - nameSize * 1.16) / 2, ...textBase(nameSize, 900), color: S.ink }}>{side.name}</div>
      <div style={{
        position: 'absolute', right: PAD_X, top: headTop + (headH - timerSize * 1.16) / 2, width: timerCol, textAlign: 'right',
        ...textBase(timerSize, 600, S.mono), color: done && isFast ? S.accent : S.ink,
        transform: `scale(${1 + 0.08 * pulse})`, transformOrigin: '100% 50%',
      }}>{clock(run)}</div>
      <div style={{ position: 'absolute', left: trackX, top: PAD_Y + headH + HEAD_GAP, width: Math.max(w, run > 0 ? BAR_H : 0), height: BAR_H, borderRadius: BAR_H / 2, background: S.ink }} />
    </Surface>;
  });

  const pillW = textWidth(result, pillSize) + 150;
  const [before, after] = key && result.includes(key) ? [result.slice(0, result.indexOf(key)), result.slice(result.indexOf(key) + key.length)] : [result, ''];
  const pillY = top + 2 * CARD_H + GAP + pillGap;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {rows}
      <Pill box={{ x: 960 - pillW / 2, y: pillY + (1 - res) * 26, w: pillW, h: pillH }}
        style={{ opacity: res, transform: `scale(${mix(0.82, 1, q(t, RES, RES + 0.35))})` }}>
        <span style={{ ...textBase(pillSize, 400, S.display), color: '#fff', lineHeight: 1 }}>
          {before}<span style={{ color: S.accentDark }}>{key}</span>{after}
        </span>
      </Pill>
    </Handoff>
    <Sfx name="whoosh-short" at={0.04} />
    <Sfx name="ding" at={fastFinish} duration={90} />
    <Sfx name="pop" at={RES} />
  </Frame>;
}
