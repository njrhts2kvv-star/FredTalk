// T03d-CauseChain：因果链推进
// 观众要看懂的变化：一个原因 → 一步步推出结果
// 关系：每一步都从上一步“底下”被推出来，向右下错开一级落位，整组随之居中；最后一步是结果，落成黑胶囊。
// 不画箭头：先后出现 + 从上一张卡下面滑出来 = “由它导致”。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type CauseChainProps = HandoffProps & {
  steps: string[];       // 第一项是原因，最后一项是结果；3–5 项
  highlight: string;     // 结果里染紫的词（黑胶囊上 #D6BEFF）
  cues?: number[];       // [i]=第 i 步出现（秒）；不传按默认节奏
};

export const causeChainDefaults: CauseChainProps = {
  steps: ['对话越聊越长', '前面定的规则被挤出上下文', 'AI 又按自己的习惯写', '改一处，坏一处'],
  highlight: '坏一处',
};

const STEP_X = 150;    // 每一级向右错开
const ROW_GAP = 40;    // 上下两级之间的空隙

export function CauseChain(props: Partial<CauseChainProps>) {
  const c = { ...causeChainDefaults, ...props };
  const t = useT();
  const steps = c.steps.slice(0, 5);
  const n = Math.max(2, steps.length);
  const last = steps.length - 1;

  // 尺寸：中间步骤白卡、结果黑胶囊
  const cardH = n > 4 ? 118 : 140;
  const resH = n > 4 ? 160 : 196;
  const avail = (i: number) => 1760 - i * STEP_X;  // 每一级可用宽（随错开减少）
  const midSize = Math.min(n > 4 ? 60 : 70, ...steps.slice(0, last).map((s, i) => (avail(i) - 120) / Math.max(1, textWidth(s, 1))));
  const resSize = Math.min(n > 4 ? 108 : 124, (avail(last) - 160) / Math.max(1, textWidth(steps[last], 1)));
  const w = (i: number) => i === last ? textWidth(steps[i], resSize) + resSize * 1.6 : textWidth(steps[i], midSize) + midSize * 1.8;
  const h = (i: number) => (i === last ? resH : cardH);
  const slotY = (i: number) => steps.slice(0, i).reduce((a, _, k) => a + h(k) + ROW_GAP, 0);
  const slotX = (i: number) => i * STEP_X;

  // 时间：第 0 步立刻出现，其余按口播
  const step = Math.min(0.95, 3.0 / (n - 1));
  const at = (i: number) => (i === 0 ? cueAt(c.cues, 0, 0.05) : cueAt(c.cues, i, 0.75 + (i - 1) * step));
  const dur = 0.62;
  const vs = steps.map((_, i) => p(t, at(i), at(i) + dur));

  // 相机：已出现的部分整体居中（跟着新的一级平移）
  const extent = (k: number) => {
    let right = 0;
    for (let i = 0; i <= k; i++) right = Math.max(right, slotX(i) + w(i));
    return { wid: right, hei: slotY(k) + h(k) };
  };
  let ox = 0, oy = 0;
  for (let k = 0; k <= last; k++) {
    const e = extent(k);
    const tx = 960 - e.wid / 2, ty = 540 - e.hei / 2;
    const m = k === 0 ? 1 : q(t, at(k), at(k) + dur + 0.1);
    ox = k === 0 ? tx : mix(ox, tx, m);
    oy = k === 0 ? ty : mix(oy, ty, m);
  }

  const [pre, post = ''] = c.highlight && steps[last].includes(c.highlight) ? steps[last].split(c.highlight) : [steps[last]];

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', left: ox, top: oy }}>
        {steps.map((s, i) => {
          const v = vs[i];
          // 从上一级的位置（在它下面）滑出到自己的位置
          const fromX = i === 0 ? 0 : slotX(i - 1) + 10, fromY = i === 0 ? -30 : slotY(i - 1) + (h(i - 1) - h(i)) / 2;
          const x = mix(fromX, slotX(i), v), y = mix(fromY, slotY(i), v);
          const vis = i === 0 ? v : clamp(v * 6);
          // 旧的一级在下一级推出后略退后，焦点留给最新一级
          const dim = i === last ? 1 : mix(1, 0.62, vs[i + 1] ?? 0);
          const box = { x, y, w: w(i), h: h(i) };
          const style = { opacity: vis, zIndex: 10 - i, transform: `scale(${mix(0.94, 1, v)})`, transformOrigin: 'left center' };
          if (i === last) {
            return <Pill key={i} box={box} style={style}>
              <span style={{ ...textBase(resSize, 400, S.display), color: '#fff' }}>
                {pre}{c.highlight && steps[last].includes(c.highlight) && <span style={{ color: S.accentDark }}>{c.highlight}</span>}{post}
              </span>
            </Pill>;
          }
          return <Surface key={i} box={box} style={{ ...style, display: 'flex', alignItems: 'center', paddingLeft: midSize * 0.9 }}>
            <span style={{ ...textBase(midSize, 900), color: S.ink, opacity: dim }}>{s}</span>
          </Surface>;
        })}
      </div>
    </Handoff>
    <Sfx name="pop" at={at(0)} />
    <Sfx name="slide" at={at(1)} />
    <Sfx name="ding" at={at(last) + dur * 0.6} />
  </Frame>;
}
