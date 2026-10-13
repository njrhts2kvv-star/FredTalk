// T14a A/B 耗时赛跑：两种做法同时开跑，快的先到终点停表，慢的继续跑完，倍数结论落下。
// 关系：同一起跑线、同一比例尺 → A 先停（叮）→ B 跑完 → 两条一起定格，差距本身就是证据 → 黑胶囊给倍数。
import React from 'react';
import { S, clamp, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type RaceSide = { name: string; seconds: number };
export type ABTimeRaceProps = {
  a: RaceSide;              // 快的一方
  b: RaceSide;              // 慢的一方
  resultText?: string;      // 缺省自动写“快 x 倍”
  resultKey?: string;       // 胶囊里染紫的片段；缺省取数字
};

export const abTimeRaceDefaults: ABTimeRaceProps = {
  a: { name: 'Codex 并行改', seconds: 38 },
  b: { name: '手动逐个改', seconds: 122 },
};

// 时间显示：一分钟内带一位小数，超过一分钟用 m:ss
const clock = (s: number) => {
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

const CARD_X = 120, CARD_W = 1680, CARD_H = 236, GAP = 48;
const RACE_START = 0.6, RACE_END = 3.1;     // 不论真实秒数，慢的一方都在这段里跑完

export function ABTimeRace(props: Partial<ABTimeRaceProps>) {
  const c = { ...abTimeRaceDefaults, ...props };
  const t = useT();
  const fast = Math.min(c.a.seconds, c.b.seconds), slow = Math.max(c.a.seconds, c.b.seconds, 0.001);
  const ratio = slow / Math.max(fast, 0.001);
  const ratioText = ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(1);
  const result = c.resultText ?? `快 ${ratioText} 倍`;
  const key = c.resultKey ?? (result.match(/[\d.]+/)?.[0] ?? '');

  // 名字列宽按两边较长的名字自适应
  let nameSize = 76;
  const longest = Math.max(textWidth(c.a.name, 1), textWidth(c.b.name, 1));
  while (nameSize > 50 && longest * nameSize > 640) nameSize -= 2;
  const nameCol = longest * nameSize;
  const timerSize = 72;
  const timerCol = textWidth(clock(slow), timerSize) + 20;
  const trackX = CARD_X + 64 + nameCol + 56;
  const trackW = CARD_X + CARD_W - 64 - timerCol - 40 - trackX;
  const barH = 84;

  // 模拟时钟：比例尺把最慢的一方压到 RACE_END
  const scale = (RACE_END - RACE_START) / slow;        // 每真实秒对应的画面秒
  const realElapsed = clamp((t - RACE_START) / scale, 0, slow);

  const pillSize = 84, pillH = 156, pillGap = 80;
  const settledTop = (1080 - (CARD_H * 2 + GAP + pillGap + pillH)) / 2 + 30;
  // 赛跑时两条轨道居中；结论出现前整组上移让出胶囊位置
  const top = mix(settledTop + (pillGap + pillH) / 2, settledTop, q(t, 3.3, 3.75));
  const fastFinish = RACE_START + fast * scale;
  const res = p(t, 3.45, 3.9);

  const rows = [c.a, c.b].map((side, i) => {
    const enter = p(t, 0.04 + i * 0.1, 0.5 + i * 0.1);
    const run = Math.min(realElapsed, side.seconds);
    const done = realElapsed >= side.seconds - 1e-6 && t >= RACE_START;
    const isFast = side.seconds === fast;
    const finishAt = RACE_START + side.seconds * scale;
    const pulse = isFast ? Math.max(0, 1 - Math.abs(t - finishAt - 0.12) / 0.18) : 0;   // 停表瞬间计时器轻轻一跳
    const y = top + i * (CARD_H + GAP);
    const w = trackW * (run / slow);
    return <Surface key={i} box={{ x: CARD_X + (1 - enter) * -80, y, w: CARD_W, h: CARD_H }} style={{ opacity: enter }}>
      <div style={{ position: 'absolute', left: 64, top: (CARD_H - nameSize * 1.16) / 2, ...textBase(nameSize, 900), color: S.ink }}>{side.name}</div>
      <div style={{ position: 'absolute', left: trackX - CARD_X, top: (CARD_H - barH) / 2, width: Math.max(w, run > 0 ? barH : 0), height: barH, borderRadius: barH / 2, background: S.ink }} />
      <div style={{
        position: 'absolute', right: 64, top: (CARD_H - timerSize * 1.16) / 2, width: timerCol, textAlign: 'right',
        ...textBase(timerSize, 600, S.mono), color: done && isFast ? S.accent : S.ink,
        transform: `scale(${1 + 0.08 * pulse})`, transformOrigin: '100% 50%',
      }}>{clock(run)}</div>
    </Surface>;
  });

  const pillW = textWidth(result, pillSize) + 150;
  const [before, after] = key && result.includes(key) ? [result.slice(0, result.indexOf(key)), result.slice(result.indexOf(key) + key.length)] : [result, ''];
  const pillY = top + 2 * CARD_H + GAP + pillGap;

  return <Frame>
    {rows}
    <Pill box={{ x: 960 - pillW / 2, y: pillY + (1 - res) * 26, w: pillW, h: pillH }}
      style={{ opacity: res, transform: `scale(${mix(0.82, 1, q(t, 3.45, 3.8))})` }}>
      <span style={{ ...textBase(pillSize, 400, S.display), color: '#fff', lineHeight: 1 }}>
        {before}<span style={{ color: S.accentDark }}>{key}</span>{after}
      </span>
    </Pill>
    <Sfx name="whoosh-short" at={0.04} />
    <Sfx name="ding" at={fastFinish} duration={90} />
    <Sfx name="pop" at={3.45} />
  </Frame>;
}
