// T06b-MythFlip：反常识（5s）
// 观众要看懂的变化：大家以为的 → 被划掉，换成真实答案
// 动作：常见说法写在一张白卡上；一条墨线从左到右逐行划掉它（字同时退成灰）；
//       白卡随后缩小上移、留作对照，真实答案装进黑胶囊从下方落定。
// 划线写法沿 T05c：线在字的中线，宽度随进度增长，字先退灰再被划过，不叠第二层字。
// 与库内区分：T05c 是文档行内原位改写；T14c 是价格划掉；这里是“整句常识被划掉 → 退为对照，答案另起一层落定”。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type MythFlipProps = HandoffProps & {
  myth: string;         // 大家以为的说法
  truth: string;        // 真实答案
  highlight: string;    // truth 里染紫的词（深底 #D6BEFF），留空不强调
  cues?: number[];      // [0]=开始划掉，[1]=答案落定
};

// 默认内容：第 112 期《API 是什么》——以前要自己研究文档写代码，现在可以交给 Codex
export const mythFlipDefaults: MythFlipProps = {
  myth: '用 API，得自己会写代码',
  truth: '说清需求，让 Codex 帮你调用',
  highlight: 'Codex',
};

function splitLines(text: string, lines: number): string[] {
  if (lines <= 1) return [text];
  const chars = Array.from(text);
  const total = textWidth(text, 1);
  const out: string[] = [];
  let start = 0;
  for (let k = 1; k < lines; k++) {
    const target = (total * k) / lines;
    let acc = textWidth(chars.slice(0, start).join(''), 1), best = start + 1, bestScore = Infinity;
    for (let i = start + 1; i < chars.length; i++) {
      acc += textWidth(chars[i - 1], 1);
      const brk = /[，,、：:；; ]/.test(chars[i - 1]) ? -2.5 : 0;
      const score = Math.abs(acc - target) + brk;
      if (score < bestScore) { bestScore = score; best = i; }
    }
    out.push(chars.slice(start, best).join('').trim());
    start = best;
  }
  out.push(chars.slice(start).join('').trim());
  return out.filter(Boolean);
}

const PAD_X = 100, PAD_Y = 78;

export function MythFlip(props: Partial<MythFlipProps>) {
  const c = { ...mythFlipDefaults, ...props };
  const t = useT();
  const strikeAt = cueAt(c.cues, 0, 1.25);
  const flipAt = cueAt(c.cues, 1, 2.35);

  // —— 常识白卡：一行 ≥96px 放得下就一行，否则两行 ——
  const mUnits = Math.max(1, textWidth(c.myth, 1));
  const mLines = Math.min(128, 1440 / mUnits) >= 96 ? [c.myth] : splitLines(c.myth, 2);
  const mLineUnits = Math.max(1, ...mLines.map((l) => textWidth(l, 1)));
  const mSize = Math.min(128, 1440 / mLineUnits);
  const mLH = mSize * 1.3;
  const cardW = mLineUnits * mSize + PAD_X * 2;
  const cardH = mLines.length * mLH - (mLH - mSize * 1.16) + PAD_Y * 2;

  // —— 答案胶囊 ——
  const tUnits = Math.max(1, textWidth(c.truth, 1));
  const tSize = Math.min(124, 1500 / tUnits);
  const pillH = tSize * 1.86;
  const pillW = textWidth(c.truth, tSize) + tSize * 1.5;

  // —— 落位：开场白卡居中；翻转后白卡缩到 0.72 上移，答案在下方 ——
  const S1 = 0.72, GAP = 56;
  const blockH = cardH * S1 + GAP + pillH;
  const cardCy1 = 540 - blockH / 2 + (cardH * S1) / 2;
  const pillY1 = 540 - blockH / 2 + cardH * S1 + GAP;

  const enter = p(t, 0, 0.4);
  const move = q(t, flipAt, flipAt + 0.55);
  const scale = mix(1, S1, move) * mix(0.92, 1, enter);
  const cardCy = mix(540, cardCy1, move) + (1 - enter) * 40;
  const drop = springAt(t, flipAt + 0.2, 0.7);
  const dropVis = clamp((t - flipAt - 0.2) / 0.16);

  // 逐行划线：每行依次，合计约 0.5s
  const per = 0.5 / mLines.length;
  const strikeOf = (i: number) => p(t, strikeAt + i * per, strikeAt + (i + 1) * per + 0.08);
  const thick = Math.max(7, mSize * 0.075);

  const [tb, ta = ''] = c.highlight && c.truth.includes(c.highlight) ? c.truth.split(c.highlight) : [c.truth];
  const hasHl = !!c.highlight && c.truth.includes(c.highlight);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 常识白卡 */}
      <Surface box={{ x: 960 - cardW / 2, y: cardCy - cardH / 2, w: cardW, h: cardH }}
        style={{ transform: `scale(${scale})`, opacity: clamp(enter * 1.6), overflow: 'visible' }}>
        {mLines.map((l, i) => {
          const s = strikeOf(i);
          const w = textWidth(l, mSize);
          return <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: PAD_Y + i * mLH, height: mSize * 1.16, display: 'flex', justifyContent: 'center' }}>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ ...textBase(mSize, 900), color: s > 0.35 ? S.faint : S.ink }}>{l}</span>
              <span style={{
                position: 'absolute', left: -mSize * 0.08, top: mSize * 0.6 - thick / 2, height: thick,
                width: (w + mSize * 0.16) * s, background: S.ink, borderRadius: thick / 2,
              }} />
            </span>
          </div>;
        })}
      </Surface>
      {/* 真实答案：黑胶囊从下方落定 */}
      {dropVis > 0 && <Pill box={{ x: 960 - pillW / 2, y: pillY1 + (1 - drop) * 90, w: pillW, h: pillH }}
        style={{ opacity: dropVis, transform: `scale(${mix(0.9, 1, clamp(drop))})` }}>
        <span style={{ ...textBase(tSize, 400, S.display), color: '#fff' }}>
          {tb}{hasHl && <span style={{ color: S.accentDark }}>{c.highlight}</span>}{ta}
        </span>
      </Pill>}
    </Handoff>
    <Sfx name="pop" at={0} />
    <Sfx name="slide" at={strikeAt} />
    <Sfx name="ding" at={flipAt + 0.2} />
  </Frame>;
}
