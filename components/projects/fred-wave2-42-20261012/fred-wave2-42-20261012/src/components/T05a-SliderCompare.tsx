// T05a-SliderCompare：滑杆前后对比
// 观众要看懂的变化：同一画面 → 滑杆擦过，看到前后差别
// 关系：两张同题材图叠在同一位置（对象身份不变），一根干净的竖线滑杆从右擦到左露出“后”，再回到中间停住并排读差别。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth, wipe } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Pill, Sfx, textBase, useT } from '../kit/ui';

export type SliderCompareProps = HandoffProps & {
  before: string;        // 前（被擦掉的一张），public 下路径
  after: string;         // 后（被露出的一张）
  beforeLabel: string;
  afterLabel: string;    // 后一张的标签用紫色
  caption: string;       // 顶部说明胶囊；'' 不显示
  rest: number;          // 滑杆最后停的位置（0–1，从左算）
  cues?: number[];       // [0]=滑杆开始擦（默认 1.0s）；[1]=回到停留位置（默认 2.55s）
};

export const sliderCompareDefaults: SliderCompareProps = {
  before: 'media/w8-petal-image2.jpg',
  after: 'media/w8-petal-image25.jpg',
  beforeLabel: 'Image 2',
  afterLabel: 'Image 2.5',
  caption: '同一句提示词',
  rest: 0.64,
};

const BOX = { x: 210, y: 180, w: 1500, h: 843.75 };

function SideLabel({ text, x, y, align, accent, opacity }: { text: string; x: number; y: number; align: 'left' | 'right'; accent: boolean; opacity: number }) {
  const size = Math.min(44, (BOX.w * 0.42 - 70) / Math.max(1, textWidth(text, 1)));
  const w = textWidth(text, size) + size * 1.5;
  const h = size * 1.9;
  return <Pill box={{ x: align === 'left' ? x : x - w, y, w, h }} shadow={S.shadow} style={{ opacity }}>
    <span style={{ ...textBase(size, 900), color: accent ? S.accentDark : '#fff' }}>{text}</span>
  </Pill>;
}

export function SliderCompare(props: Partial<SliderCompareProps>) {
  const c = { ...sliderCompareDefaults, ...props };
  const t = useT();

  const enter = p(t, 0, 0.55);
  const sweepAt = cueAt(c.cues, 0, 1.0);
  const backAt = cueAt(c.cues, 1, sweepAt + 1.55);
  const rest = clamp(c.rest, 0.15, 0.85);
  // 滑杆：停在右边缘（整张都是“前”）→ 擦到左边露出“后” → 回到停留位置
  const sweep = wipe(t, sweepAt, sweepAt + 1.05);
  const back = q(t, backAt, backAt + 0.7);
  const s = mix(mix(1, 0.04, sweep), rest, back);
  const lineX = BOX.w * s;

  const capSize = Math.min(48, 1100 / Math.max(1, textWidth(c.caption, 1)));
  const capW = textWidth(c.caption, capSize) + capSize * 1.8;
  const capH = capSize * 2;
  const cap = p(t, 0.15, 0.6);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', left: BOX.x, top: BOX.y + (1 - enter) * 50, width: BOX.w, height: BOX.h, opacity: enter,
        transform: `scale(${mix(0.97, 1, enter)})`, borderRadius: S.radius, boxShadow: S.shadow }}>
        <Media src={c.after} box={{ x: 0, y: 0, w: BOX.w, h: BOX.h }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: BOX.w, height: BOX.h, clipPath: `inset(0 ${BOX.w - lineX}px 0 0)` }}>
          <Media src={c.before} box={{ x: 0, y: 0, w: BOX.w, h: BOX.h }} />
        </div>
        {/* 标签：哪一边露得够多才显示 */}
        <SideLabel text={c.beforeLabel} x={32} y={BOX.h - 32 - 84} align="left" accent={false} opacity={clamp((s - 0.2) / 0.12)} />
        <SideLabel text={c.afterLabel} x={BOX.w - 32} y={BOX.h - 32 - 84} align="right" accent opacity={clamp((0.8 - s) / 0.12)} />
        {/* 滑杆：干净竖线 + 小手柄 */}
        <div style={{ position: 'absolute', left: lineX - 3, top: 0, width: 6, height: BOX.h, background: '#fff', boxShadow: S.shadow, opacity: clamp(enter * 2 - 0.6) }} />
        <div style={{ position: 'absolute', left: lineX - 30, top: BOX.h / 2 - 48, width: 60, height: 96, borderRadius: 30, background: '#fff', boxShadow: S.shadow,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: clamp(enter * 2 - 0.6) }}>
          <span style={{ width: 5, height: 34, borderRadius: 3, background: S.ink }} />
          <span style={{ width: 5, height: 34, borderRadius: 3, background: S.ink }} />
        </div>
      </div>
      {c.caption && <Pill box={{ x: 960 - capW / 2, y: BOX.y - capH / 2 + (1 - cap) * 16, w: capW, h: capH }} style={{ opacity: cap, zIndex: 5 }}>
        <span style={{ ...textBase(capSize, 400, S.display), color: '#fff' }}>{c.caption}</span>
      </Pill>}
    </Handoff>
    {c.caption && <Sfx name="pop" at={0.15} />}
    <Sfx name="slide" at={sweepAt} />
    <Sfx name="slide" at={backAt} />
  </Frame>;
}
