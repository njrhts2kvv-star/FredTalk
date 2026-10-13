// T01c-PrincipleLines：原则口诀（5s）
// 观众要看懂的变化：几句原则 → 依次落定成一组口诀
// 动作：每句原则装在一枚黑胶囊里，从右侧滑入、撞到同一条左边界停住（轻微回弹）；
//       全部到齐后整组“锁定”：胶囊收拢、补齐成同一宽度，每句的关键词同时点紫。
// 与库内区分：L81-R053 是三胶囊建立后逐项退出；T12d 是阶段胶囊聚焦；X003/T01e 是单枚胶囊补条件。
//            这里是“逐句撞齐左边界 → 整组收拢成等宽口诀块”。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type PrincipleLinesProps = HandoffProps & {
  lines: string[];        // 2–4 句原则
  highlights: string[];   // 每句里染紫的词（深底 #D6BEFF），与 lines 一一对应，可留空
  cues?: number[];        // [0..n-1]=第 i 句滑入，[n]=整组锁定
};

// 默认内容：第 112 期《API 是什么》结尾的三句总结
export const principleLinesDefaults: PrincipleLinesProps = {
  lines: ['API 是调用能力的接口', 'Key 是你的通行证', '.env 是存配置的文件'],
  highlights: ['调用能力', '通行证', '存配置'],
};

export function PrincipleLines(props: Partial<PrincipleLinesProps>) {
  const c = { ...principleLinesDefaults, ...props };
  const t = useT();
  const lines = c.lines.slice(0, 4);
  const n = Math.max(1, lines.length);

  // —— 版式：同一字号；按最长句与可用高度取小 ——
  const maxUnits = Math.max(1, ...lines.map((l) => textWidth(l, 1)));
  const size = Math.min(150, 1380 / maxUnits, 800 / (n * 1.78 + (n - 1) * 0.3));
  const pillH = size * 1.78;
  const padL = size * 0.62, padR = size * 0.72;
  const gap0 = size * 0.34, gap1 = size * 0.16;          // 锁定前后的行距
  const widths = lines.map((l) => textWidth(l, size) + padL + padR);
  const maxW = Math.max(...widths);
  const left = 960 - maxW / 2;

  // —— 时间：默认相隔 0.8s；最后一句落定 0.6s 后锁定 ——
  const at = lines.map((_, i) => cueAt(c.cues, i, 0.12 + i * 0.8));
  const lockAt = cueAt(c.cues, n, at[n - 1] + 0.85);
  const lock = q(t, lockAt, lockAt + 0.4);
  const lockColor = p(t, lockAt + 0.1, lockAt + 0.45);
  const gap = mix(gap0, gap1, lock);
  const totalH = n * pillH + (n - 1) * gap;
  const top = 540 - totalH / 2 + 10;

  const accent = (k: number) => `rgb(${mix(255, 0xd6, k)}, ${mix(255, 0xbe, k)}, ${mix(255, 0xff, k)})`;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {lines.map((l, i) => {
        const s = springAt(t, at[i], 0.62);                 // 撞到左边界，轻微回弹后停住
        const vis = clamp((t - at[i]) / 0.12);
        if (vis <= 0) return null;
        const x = left + (1 - s) * 760;
        const w = mix(widths[i], maxW, lock);
        const y = top + i * (pillH + gap);
        const hl = c.highlights[i] ?? '';
        const k = hl ? l.indexOf(hl) : -1;
        return <div key={i} style={{
          position: 'absolute', left: x, top: y, width: w, height: pillH, borderRadius: pillH / 2,
          background: S.dark, boxShadow: S.capsuleShadow, opacity: vis, display: 'flex', alignItems: 'center',
        }}>
          <span style={{ ...textBase(size, 400, S.display), color: '#fff', marginLeft: padL }}>
            {k < 0 ? l : <>{l.slice(0, k)}<span style={{ color: accent(lockColor) }}>{hl}</span>{l.slice(k + hl.length)}</>}
          </span>
        </div>;
      })}
    </Handoff>
    {lines.map((_, i) => <Sfx key={i} name="pop" at={at[i]} />)}
    <Sfx name="ding" at={lockAt} />
  </Frame>;
}
