// T19a 痛点困扰：Fred 小人抚额发愁，身边一个个冒出困扰气泡，最后一个最大；随后所有气泡被挤压收拢成一句黑胶囊“问题：…”。
// 关系：多个零散的烦恼（越来越重）→ 归结成一个要解决的问题，给后面的方案留出口。
import React from 'react';
import { Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { S, clamp, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Sfx, textBase, useT } from '../kit/ui';

export type PainPointProps = {
  character: string;        // 透明 webm（VP9 alpha）或透明 PNG
  pains: string[];          // 2–4 条，最后一条最重
  keyword?: string;         // 最后一条里染紫的词
  summary: string;          // 黑胶囊结论
  summaryKey?: string;      // 胶囊里染紫的片段
  holdAt?: number;          // 人物视频在该秒定格（默认 4.25：原片 4.4s 后手会放下，定格保住苦恼姿态）
};

export const painPointDefaults: PainPointProps = {
  character: 'media/d-fred-distress.webm',
  pains: ['每次都要重新交代背景', '改完一处又坏一处', '聊久了它就忘了前面', '项目规则全靠我记'],
  keyword: '全靠我记',
  summary: '问题：AI 记不住你的项目',
  summaryKey: '记不住',
  holdAt: 4.25,
};

const LEFT_EDGE = 880, RIGHT_EDGE = 1830;
const HEAD = { x: 690, y: 400 };            // 小人头部大致位置：气泡从这里“冒出”

function Highlight({ text, keyword, color }: { text: string; keyword?: string; color: string }) {
  if (!keyword || !text.includes(keyword)) return <>{text}</>;
  const i = text.indexOf(keyword);
  return <>{text.slice(0, i)}<span style={{ color }}>{keyword}</span>{text.slice(i + keyword.length)}</>;
}

export function PainPoint(props: Partial<PainPointProps>) {
  const c = { ...painPointDefaults, ...props };
  const t = useT();
  const frame = useCurrentFrame();
  const holdFrame = Math.round((c.holdAt ?? 99) * 60);
  const pains = c.pains.slice(0, 4);
  const n = pains.length;
  const isVideo = /\.(webm|mov|mp4)$/i.test(c.character);

  // —— 时间线 ——
  const popAt = (i: number) => 0.3 + i * (1.86 / Math.max(1, n - 1));   // 最后一条约 2.16s 冒出
  const sqAt = (i: number) => 3.15 + i * 0.06;          // 先冒出的先被挤进去
  const sumIn = p(t, 3.35, 3.8);
  const sumPop = springAt(t, 3.35, 0.6);
  const charIn = p(t, 0, 0.45);

  // 结论胶囊
  let sumSize = 88;
  while (sumSize > 56 && textWidth(c.summary, sumSize) > 860) sumSize -= 2;
  const sumW = textWidth(c.summary, sumSize) + 140, sumH = sumSize * 1.9;
  const sumCx = clamp(1355, LEFT_EDGE + sumW / 2, RIGHT_EDGE - sumW / 2), sumCy = 560;

  // 气泡布局：前几条左右交错往下排，最后一条居中最大
  const bubbles = pains.map((text, i) => {
    const last = i === n - 1;
    let size = last ? 96 : 66;
    const maxW = last ? RIGHT_EDGE - LEFT_EDGE : 760;
    while (size > 40 && textWidth(text, size) + size * 1.6 > maxW) size -= 2;
    const w = textWidth(text, size) + size * 1.6, h = size * 2.3;
    let cx: number, cy: number;
    if (last) { cx = clamp(1360, LEFT_EDGE + w / 2, RIGHT_EDGE - w / 2); cy = n <= 2 ? 640 : 800; }
    else { cx = i % 2 === 0 ? LEFT_EDGE + w / 2 : RIGHT_EDGE - w / 2; cy = (n <= 2 ? 360 : 250) + i * 172; }
    return { text, last, size, w, h, cx, cy };
  });

  return <Frame>
    {/* 小人：贴底，左侧 */}
    <div style={{ position: 'absolute', left: -150, top: 90, width: 990, height: 990, opacity: charIn, transform: `translateY(${(1 - charIn) * 40}px)` }}>
      {isVideo
        ? <Freeze frame={holdFrame} active={frame >= holdFrame}><OffthreadVideo muted transparent src={staticFile(c.character)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></Freeze>
        : <Img src={staticFile(c.character)} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }} />}
    </div>

    {bubbles.map((b, i) => {
      const at = popAt(i);
      const v = springAt(t, at, 0.55);
      const squeeze = q(t, sqAt(i), sqAt(i) + 0.4);
      const op = clamp((t - at) / 0.12) * (1 - clamp((squeeze - 0.3) / 0.3));
      const textOp = 1 - clamp(squeeze / 0.4);              // 挤压一开始字就先退，避免和胶囊字叠在一起
      // 冒出：从小人头部方向飞出放大；收拢：被挤向结论胶囊并缩小
      const x = mix(mix(HEAD.x, b.cx, clamp(v)), sumCx, squeeze);
      const y = mix(mix(HEAD.y, b.cy, clamp(v)), sumCy, squeeze);
      const s = mix(0.35, 1, v);
      const sx = mix(1, 0.18, squeeze), sy = mix(1, 0.5, squeeze);   // 横向被挤扁，收进胶囊那一行
      return <div key={i} style={{
        position: 'absolute', left: x - b.w / 2, top: y - b.h / 2, width: b.w, height: b.h, borderRadius: S.radius,
        background: '#fff', boxShadow: S.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: op, transform: `scale(${s * sx}, ${s * sy})`, zIndex: 10 + i,
      }}>
        <span style={{ ...textBase(b.size, 900), color: S.ink, lineHeight: 1, opacity: textOp }}>
          {b.last ? <Highlight text={b.text} keyword={c.keyword} color={S.accent} /> : b.text}
        </span>
      </div>;
    })}

    <div style={{
      position: 'absolute', left: sumCx - sumW / 2, top: sumCy - sumH / 2, width: sumW, height: sumH, borderRadius: sumH / 2,
      background: S.ink, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: sumIn, transform: `scale(${mix(0.3, 1, sumPop)}, ${mix(0.6, 1, sumPop)})`, zIndex: 5,
    }}>
      <span style={{ ...textBase(sumSize, 900), color: '#fff', lineHeight: 1, opacity: p(t, 3.62, 3.95) }}>
        <Highlight text={c.summary} keyword={c.summaryKey} color={S.accentDark} />
      </span>
    </div>

    {bubbles.map((_, i) => <Sfx key={i} name="pop" at={popAt(i)} />)}
    <Sfx name="gather" at={3.15} />
  </Frame>;
}
