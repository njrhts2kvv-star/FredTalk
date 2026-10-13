// __ID__：__TITLE__
// 观众要看懂的变化：__CHANGE__
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type __NAME__Props = HandoffProps & {
  material: string;   // TODO：换成本组件真正需要的内容（文字、数量、素材路径），每一项都要能传入
  result: string;
  highlight: string;  // result 里染紫的关键词（深底 #D6BEFF）
  cues?: number[];    // 口播时间点（秒，场景内）：[0]=结论出现；不传用默认节奏
};

// 默认内容用 Fred 的真实素材/真实场景，不写 lorem、不写英文眉题。
export const __CAMEL__Defaults: __NAME__Props = {
  material: '__TITLE__',
  result: '一句结论落在胶囊里',
  highlight: '结论',
};

export function __NAME__(props: Partial<__NAME__Props>) {
  const c = { ...__CAMEL__Defaults, ...props };
  const t = useT();

  // 1) 建立：0.3 秒内主体开始出现（p = bezier(.22,1,.36,1)）
  const enter = p(t, 0, 0.6);
  // 2) 变化：一个主动作，绑定一个音效
  const at = cueAt(c.cues, 0, 1.6);
  const change = q(t, at, at + 0.7);
  // 3) 阅读：结尾留 ≥0.6 秒稳定

  // 文字按真实长度自适应：字号 = min(上限, 可用宽 / 估算宽)
  const resultSize = Math.min(120, 1500 / Math.max(1, textWidth(c.result, 1)));
  const pillW = textWidth(c.result, resultSize) + resultSize * 1.6;
  const [before, after = ''] = c.result.split(c.highlight);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
    {/* 材料退后：整体变淡缩小，文字先退干净，不能在前景下面留残字 */}
    <Surface box={{ x: 260, y: 300 + (1 - enter) * 50, w: 1400, h: 420 }}
      style={{ opacity: enter * mix(1, 0.35, change), transform: `scale(${mix(1, 0.94, change)})` }}>
      <div style={{ ...textBase(Math.min(96, 1240 / Math.max(1, textWidth(c.material, 1))), 900), position: 'absolute', left: 80, top: 160,
        opacity: 1 - clamp(change * 2.5) }}>{c.material}</div>
    </Surface>
    <Pill box={{ x: 960 - pillW / 2, y: 470 + (1 - change) * 24, w: pillW, h: resultSize * 2 }} style={{ opacity: clamp(change * 3) }}>
      <span style={{ ...textBase(resultSize, 400, S.display), color: '#fff' }}>
        {before}{c.result.includes(c.highlight) && <span style={{ color: S.accentDark }}>{c.highlight}</span>}{after}
      </span>
    </Pill>
    </Handoff>
    <Sfx name="pop" at={at} />
  </Frame>;
}
