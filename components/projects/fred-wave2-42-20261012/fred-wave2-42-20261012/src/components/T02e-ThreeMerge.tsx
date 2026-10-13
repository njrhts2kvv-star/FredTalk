// T02e-ThreeMerge：三项汇聚长胶囊（升级自 107-04 EP107CapabilitiesMerge）
// 观众要看懂的变化：几项能力依次建立 → 汇聚成一个长胶囊结论
// 原版动作（R6LateMotion.tsx:91-118）：各项按口播 0.38s 进入（上移 45px）→ 0.72s 汇聚到中心（缩小 ~0.5）
// → 旧项 0.5s 淡出 → 结果胶囊延迟 0.22s、0.44s 落定，副句跟随。曲线保持 smoothstep 形态（q）。
// 升级：项数 2–4、媒体可选（全部有媒体 = 证据卡；否则 = 黑胶囊）、宽度/字号按内容自适应、外观统一到 kit。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Pill, Sfx, textBase, useT } from '../kit/ui';

export type MergeItem = { label: string; media?: string };

export type ThreeMergeProps = HandoffProps & {
  items: MergeItem[];   // 2–4 项；每项都给 media 时显示证据卡，否则显示黑胶囊
  result: string;       // 汇聚后的长胶囊结论
  highlight: string;    // result 里染紫的部分（胶囊是深底 → #D6BEFF）；整句都强调就写整句
  sub?: string;         // 胶囊下方的一句补充，可省
  cues?: number[];      // [0..n-1] 各项出现；[n] 开始汇聚
};

export const threeMergeDefaults: ThreeMergeProps = {
  items: [
    { label: '云端 Agent', media: 'media/w3-cloud-agent.webp' },
    { label: '团队协作', media: 'media/w3-team.webp' },
    { label: '极速决策', media: 'media/w3-decisions.webp' },
  ],
  result: 'ChatGPT',
  highlight: 'ChatGPT',
  sub: '一口气整合进来',
};

// 锐字真言的拉丁字形不适合产品名：拉丁片段改用 MiSans Heavy，中文仍用锐字真言（同字号、同基线）
function DisplayText({ text, size, color }: { text: string; size: number; color: string }) {
  const runs = text.match(/[\u0000-\u00ff]+|[^\u0000-\u00ff]+/g) ?? [text];
  return <span style={{ ...textBase(size, 400, S.display), color }}>
    {runs.map((r, i) => /^[\u0000-\u00ff]+$/.test(r)
      ? <span key={i} style={{ fontFamily: S.body, fontWeight: 900 }}>{r}</span>
      : <React.Fragment key={i}>{r}</React.Fragment>)}
  </span>;
}

// 长标签折两行：只在空格处断（中文词不硬拆），没有空格就保持一行
function splitTwo(s: string): string[] {
  const parts = s.split(' ');
  if (parts.length < 2) return [s];
  const half = textWidth(s, 1) / 2;
  let best = 1, bestD = Infinity;
  for (let i = 1; i < parts.length; i++) {
    const d = Math.abs(textWidth(parts.slice(0, i).join(' '), 1) - half);
    if (d < bestD) { bestD = d; best = i; }
  }
  return [parts.slice(0, best).join(' '), parts.slice(best).join(' ')];
}

const USABLE = 1680;   // 120 → 1800
const GAP = 70;

export function ThreeMerge(props: Partial<ThreeMergeProps>) {
  const c = { ...threeMergeDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 4);
  const n = Math.max(1, items.length);
  const cards = items.every((it) => !!it.media);

  // ---- 时间：默认按 107 的口播间隔（≈1.1s），4 项时收紧 ----
  const step = n >= 4 ? 0.86 : 1.12;
  const starts = items.map((_, i) => cueAt(c.cues, i, 0.08 + i * step));
  const mergeAt = cueAt(c.cues, n, starts[n - 1] + 1.05);
  const merge = q(t, mergeAt, mergeAt + 0.72);
  // 结果胶囊从汇聚到中心的那一叠里长出来（不透明，避免和下面的卡片半透明叠影），落定轻弹一次
  const resultAt = mergeAt + 0.48;
  const result = t >= resultAt ? 1 : 0;
  const grow = springAt(t, resultAt, 0.62);
  const gone = q(t, resultAt + 0.05, resultAt + 0.3);
  const subIn = p(t, resultAt + 0.35, resultAt + 0.8);

  // ---- 结果胶囊：字号按真实宽度 ----
  const rSize = Math.min(150, 1250 / Math.max(1, textWidth(c.result, 1)));
  const pillH = Math.max(250, rSize * 2.3);
  const pillW = Math.max(pillH * 2.6, textWidth(c.result, rSize) + rSize * 2.4);
  const subSize = c.sub ? Math.min(68, 1500 / Math.max(1, textWidth(c.sub, 1))) : 0;
  const groupH = pillH + (c.sub ? 40 + subSize * 1.16 : 0);
  const pillY = 540 - groupH / 2;
  const pillCY = pillY + pillH / 2;
  const hi = c.highlight && c.result.includes(c.highlight) ? c.highlight : '';
  const [before, after = ''] = hi ? c.result.split(hi) : [c.result, ''];

  // ---- 各项排版 ----
  const colW = Math.min(cards ? 620 : 560, (USABLE - (n - 1) * GAP) / n);
  const rowW = n * colW + (n - 1) * GAP;
  const x0 = 960 - rowW / 2;
  const cardH = colW * (n >= 4 ? 0.8 : 0.66);
  // 标签：一行放得下且 ≥60px 就一行；否则在空格/中点折成两行，再按最长行定字号
  const oneLine = Math.min(84, (colW * 0.94) / Math.max(1, ...items.map((it) => textWidth(it.label, 1))));
  const twoLines = oneLine < 60 && items.some((it) => it.label.includes(' '));
  const labelLines = items.map((it) => (twoLines ? splitTwo(it.label) : [it.label]));
  const labelSize = twoLines
    ? Math.min(84, (colW * 0.94) / Math.max(1, ...labelLines.flat().map((l) => textWidth(l, 1))))
    : oneLine;
  const blockH = cards ? cardH + 44 + labelSize * 1.16 * (twoLines ? 2 : 1) : 0;
  const cardY = 540 - blockH / 2;
  const pillTextSize = Math.min(n <= 2 ? 130 : 116, (colW - 110) / Math.max(1, ...items.map((it) => textWidth(it.label, 1))));
  const itemPillH = Math.max(150, pillTextSize * 1.9);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {items.map((it, i) => {
        const e = p(t, starts[i], starts[i] + 0.4);
        const alpha = e * (1 - gone);
        if (alpha <= 0.001) return null;
        const colX = x0 + i * (colW + GAP);
        if (cards) {
          const w = mix(colW, colW * 0.42, merge), h = mix(cardH, cardH * 0.42, merge);
          const x = mix(colX, 960 - w / 2, merge);
          const y = mix(cardY + (1 - e) * 45, pillCY - h / 2, merge);
          return <React.Fragment key={i}>
            <Media src={it.media!} box={{ x, y, w, h }} style={{ opacity: alpha, boxShadow: S.shadow, transform: `scale(${mix(0.96, 1, e)})` }} />
            <div style={{ ...textBase(labelSize, 900), position: 'absolute', left: colX, width: colW, textAlign: 'center',
              top: cardY + cardH + 44 + (1 - e) * 30, opacity: alpha * (1 - clamp(merge * 1.6)), color: S.ink }}>
              {labelLines[i].map((l, j) => <div key={j}>{l}</div>)}</div>
          </React.Fragment>;
        }
        // 无媒体：黑胶囊横擦进入（107 列表胶囊 clipPath 写法），汇聚时滑向中心并收进结果胶囊
        const w0 = Math.min(colW, textWidth(it.label, pillTextSize) + pillTextSize * 2.2);
        const w = mix(w0, w0 * 0.5, merge), h = mix(itemPillH, itemPillH * 0.6, merge);
        const cx = mix(colX + colW / 2, 960, merge);
        return <Pill key={i} box={{ x: cx - w / 2, y: pillCY - h / 2 + (1 - e) * 28, w, h }}
          style={{ opacity: alpha, clipPath: `inset(0 ${100 * (1 - e)}% 0 0 round ${h / 2}px)` }}>
          <span style={{ opacity: p(t, starts[i] + 0.12, starts[i] + 0.4) * (1 - clamp(merge * 3)) }}><DisplayText text={it.label} size={pillTextSize * mix(1, 0.6, merge)} color="#fff" /></span>
        </Pill>;
      })}

      {result > 0 && <Pill box={{ x: 960 - pillW / 2, y: pillY, w: pillW, h: pillH }}
        style={{ opacity: result, transform: `scale(${mix(0.3, 1, grow)})` }}>
        <span style={{ display: 'flex', alignItems: 'baseline' }}>
          {before && <DisplayText text={before} size={rSize} color="#fff" />}
          {hi && <DisplayText text={hi} size={rSize} color={accentOn(true)} />}
          {after && <DisplayText text={after} size={rSize} color="#fff" />}
        </span>
      </Pill>}
      {c.sub && subIn > 0 && <div style={{ ...textBase(subSize, 900), position: 'absolute', left: 0, width: 1920, textAlign: 'center',
        top: pillY + pillH + 40 + (1 - subIn) * 16, opacity: subIn, color: S.ink }}>{c.sub}</div>}
    </Handoff>
    {starts.map((s, i) => <Sfx key={i} name="pop" at={s} />)}
    <Sfx name="gather" at={mergeAt} />
  </Frame>;
}
