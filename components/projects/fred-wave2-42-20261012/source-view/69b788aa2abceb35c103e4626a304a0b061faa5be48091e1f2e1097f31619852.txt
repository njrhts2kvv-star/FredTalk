// T20b-PainContrast：痛点反差开场
// 观众要看懂的变化：费劲的旧做法 → 一刀切到轻松的结果
// 关系：旧做法是一张越堆越长的待办窗口（步骤快速往上堆）；一刀斜切，窗口裂成两半向两侧飞开，
// 露出后面已经做好的真实结果，一句结论落在胶囊里。
import React from 'react';
import { S, clamp, cueAt, mix, p, wipe, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, MacWindow, Media, Pill, Sfx, textBase, useT } from '../kit/ui';

export type PainContrastProps = HandoffProps & {
  painTitle: string;     // 旧做法的标题
  painSteps: string[];   // 旧做法的步骤（越多越显得费劲；3–9）
  resultImage: string;   // 轻松的结果：真实作品/截图
  caption: string;       // 结果胶囊里的一句话
  highlight: string;     // caption 里染紫的词（黑胶囊上 #D6BEFF）
  cues?: number[];       // [0]=斜切（默认 2.35s）
};

export const painContrastDefaults: PainContrastProps = {
  painTitle: '以前：手动做一张游戏界面',
  painSteps: ['找参考、定配色', '一格一格画道具图标', '中文字一个个对齐', '数值和按钮重新排', '导出一看，糊了', '改一处，整张重来'],
  resultImage: 'media/w8-inventory-image25.jpg',
  caption: '现在：一句提示词，整张直接出',
  highlight: '直接出',
};

const WIN = { x: 250, y: 120, w: 1420, h: 840 };
const BAR = 90;
// 刀口：从左下 (0, 770) 到右上 (1920, 310)
const CUT_L = 770, CUT_R = 310;

export function PainContrast(props: Partial<PainContrastProps>) {
  const c = { ...painContrastDefaults, ...props };
  const t = useT();
  const steps = c.painSteps.slice(0, 9);
  const n = Math.max(1, steps.length);

  const cutAt = cueAt(c.cues, 0, 2.35);
  const enter = p(t, 0, 0.45);
  const stepAt = (i: number) => 0.3 + i * Math.min(0.3, 1.75 / n);

  // 待办窗口内容
  const titleSize = Math.min(84, (WIN.w - 200) / Math.max(1, textWidth(c.painTitle, 1)));
  const stepSize = Math.min(60, (WIN.w - 320) / Math.max(1, ...steps.map((s) => textWidth(s, 1))));
  const rowH = stepSize * 1.75;
  const listTop = 80 + titleSize * 1.16 + 50;               // 窗内坐标
  const listH = WIN.h - BAR - listTop - 50;
  const visRows = Math.max(1, Math.floor(listH / rowH));
  // 堆到超出可见行数时，整列往上滚，始终露出最新一条
  let scroll = 0;
  steps.forEach((_, i) => { if (i >= visRows) scroll += rowH * p(t, stepAt(i), stepAt(i) + 0.25); });

  const painLayer = <MacWindow light box={{ ...WIN, y: WIN.y + (1 - enter) * 50 }} bar={BAR} style={{ opacity: enter }}>
    <div style={{ ...textBase(titleSize, 900), position: 'absolute', left: 100, top: 80, color: S.ink }}>{c.painTitle}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: listTop, height: listH, overflow: 'hidden' }}>
      {steps.map((s, i) => {
        const v = p(t, stepAt(i), stepAt(i) + 0.3);
        return <div key={i} style={{ position: 'absolute', left: 100, top: i * rowH - scroll + (1 - v) * 30, height: rowH, display: 'flex', alignItems: 'center', gap: stepSize * 0.7, opacity: v }}>
          <span style={{ ...textBase(stepSize, 500), color: S.faint, width: stepSize * 1.2, textAlign: 'right' }}>{i + 1}</span>
          <span style={{ ...textBase(stepSize, 500), color: '#3a3a40' }}>{s}</span>
        </div>;
      })}
    </div>
  </MacWindow>;

  // 斜切：两半沿刀口法线方向分开，略带旋转
  const k = wipe(t, cutAt, cutAt + 0.75);
  const dx = 150 * k, dy = 720 * k;
  const upper = `polygon(0 0, 1920px 0, 1920px ${CUT_R}px, 0 ${CUT_L}px)`;
  const lower = `polygon(0 ${CUT_L}px, 1920px ${CUT_R}px, 1920px 1080px, 0 1080px)`;
  const piece = (clip: string, sx: number, sy: number, rot: number) =>
    <div style={{ position: 'absolute', inset: 0, clipPath: clip, transform: `translate(${sx}px, ${sy}px) rotate(${rot}deg)`, transformOrigin: '960px 540px',
      opacity: 1 - clamp((k - 0.55) / 0.45), filter: k > 0 ? `blur(${k * 6}px)` : undefined }}>{painLayer}</div>;

  // 结果：在后面等着，被切开时露出、轻推到位
  const reveal = p(t, cutAt + 0.05, cutAt + 0.9);
  const IMG = { x: 300, y: 128, w: 1320, h: 742.5 };
  const capSize = Math.min(84, 1300 / Math.max(1, textWidth(c.caption, 1)));
  const capW = textWidth(c.caption, capSize) + capSize * 1.8;
  const capH = capSize * 2;
  const cap = p(t, cutAt + 0.55, cutAt + 1.0);
  const [pre, post = ''] = c.highlight && c.caption.includes(c.highlight) ? c.caption.split(c.highlight) : [c.caption];

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {t >= cutAt && <div style={{ position: 'absolute', inset: 0, transform: `scale(${mix(0.92, 1, reveal)})`, transformOrigin: '960px 500px' }}>
        <Media src={c.resultImage} box={IMG} style={{ boxShadow: S.shadow }} />
        <Pill box={{ x: 960 - capW / 2, y: IMG.y + IMG.h - capH * 0.45 + (1 - cap) * 24, w: capW, h: capH }} style={{ opacity: cap }}>
          <span style={{ ...textBase(capSize, 400, S.display), color: '#fff' }}>
            {pre}{c.highlight && c.caption.includes(c.highlight) && <span style={{ color: S.accentDark }}>{c.highlight}</span>}{post}
          </span>
        </Pill>
      </div>}
      {t < cutAt ? painLayer : <>
        {piece(upper, -dx, -dy, -4 * k)}
        {piece(lower, dx, dy, 4 * k)}
      </>}
    </Handoff>
    <Sfx name="pop" at={stepAt(0)} />
    <Sfx name="woosh" at={cutAt} />
    <Sfx name="ding" at={cutAt + 0.6} />
  </Frame>;
}
