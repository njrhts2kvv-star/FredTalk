// T04d-CategoryFocus：展开分支后聚焦一类（升级自 L81-C003）
// 观众要看懂的变化：一个主题 → 展开几类 → 聚焦其中一类开讲
// 原版动作：主题黑块先在画面中部出现 → 移到左上成为树根 → 竖干 + 圆角横枝依次长出，子类黑块逐个出现
// → 被选中的一类放大移到画面中心，其余子类、树根和连线退掉。
// 升级：类别 2–5、聚焦哪一类由 props 指定；树的字号和间距按类别数和最长文字自适应、整体居中；
// 外观换成 kit 黑胶囊 + 锐字真言；紫色只给被聚焦的那一类（原版所有字都是紫色）；连线是拓扑必需，保留为干净的单色细线。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, between, textBase, useT } from '../kit/ui';
import type { Box } from '../kit/ui';

export type CategoryFocusProps = HandoffProps & {
  topic: string;          // 主题（树根）
  categories: string[];   // 2–5 类
  focus: number;          // 聚焦第几类（从 0 开始）
  cues?: number[];        // [0..n-1] 各类出现；[n] 开始聚焦
};

export const categoryFocusDefaults: CategoryFocusProps = {
  topic: '记录',
  categories: ['会议纪要', '日常想法', '工作待办'],
  focus: 0,
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

const pillOf = (text: string, size: number) => ({ w: textWidth(text, size) + size * 1.1, h: size * 1.55 });

export function CategoryFocus(props: Partial<CategoryFocusProps>) {
  const c = { ...categoryFocusDefaults, ...props };
  const t = useT();
  const cats = c.categories.slice(0, 5);
  const n = Math.max(1, cats.length);
  const fi = Math.min(n - 1, Math.max(0, c.focus));

  // ---- 树的尺寸：高度和宽度都要放得下 ----
  const longest = Math.max(...cats.map((s) => textWidth(s, 1)));
  const byH = 860 / (1.2 * 1.55 + 0.6 + n * 1.55 + (n - 1) * 0.42);
  const byW = 1500 / (textWidth(c.topic, 1.2) * 0.35 + 1.6 + longest + 1.1);
  const s = Math.min(108, byH, byW);             // 子类字号
  const rs = s * 1.2;                            // 树根字号
  const root = pillOf(c.topic, rs);
  const kids = cats.map((k) => pillOf(k, s));
  const gap = s * 0.42;
  const treeH = root.h + s * 0.6 + n * kids[0].h + (n - 1) * gap;
  const trunkOff = Math.min(root.w * 0.3, rs * 1.0);   // 竖干离树根左边的距离
  const childOff = trunkOff + s * 1.6;
  const treeW = Math.max(root.w, childOff + Math.max(...kids.map((k) => k.w)));
  const tx = 960 - treeW / 2, ty = 540 - treeH / 2 + 10;
  const rootTree: Box = { x: tx, y: ty, w: root.w, h: root.h };
  const rootIntro: Box = { x: 960 - root.w * 0.6, y: 540 - root.h * 0.6, w: root.w * 1.2, h: root.h * 1.2 };
  const trunkX = tx + trunkOff;
  const kidBox: Box[] = kids.map((k, i) => ({ x: tx + childOff, y: ty + root.h + s * 0.6 + i * (k.h + gap), w: k.w, h: k.h }));

  // ---- 时间 ----
  const rootIn = springAt(t, 0.04, 0.55);
  const move = q(t, 0.45, 1.0);
  const g = Math.min(0.34, 1.3 / n);
  const appear = cats.map((_, i) => cueAt(c.cues, i, 1.0 + i * g));
  const focusAt = cueAt(c.cues, n, appear[n - 1] + 0.75);
  const focus = q(t, focusAt, focusAt + 0.72);
  const recede = q(t, focusAt, focusAt + 0.5);

  // 聚焦后的大胶囊
  const fs = Math.min(150, 1400 / Math.max(1, textWidth(cats[fi], 1)));
  const fp = pillOf(cats[fi], fs);
  const finalBox: Box = { x: 960 - fp.w / 2, y: 540 - fp.h / 2, w: fp.w, h: fp.h };

  const rootBox = between(rootIntro, rootTree, move);
  const rootSize = mix(rs * 1.2, rs, move);
  const r = s * 0.42;   // 枝杈拐角半径
  const others = 1 - recede;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, opacity: others, filter: recede > 0 ? `blur(${recede * 14}px)` : undefined }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {kidBox.map((b, i) => {
            const cy = b.y + b.h / 2;
            const d = `M${trunkX} ${ty + root.h - 4} L${trunkX} ${cy - r} Q${trunkX} ${cy} ${trunkX + r} ${cy} L${b.x + 2} ${cy}`;
            const prog = p(t, appear[i] - 0.32, appear[i] + 0.02);
            if (prog <= 0 || (i === fi && focus > 0)) return null;
            return <path key={i} d={d} pathLength={1} fill="none" stroke={S.ink} strokeWidth={Math.max(5, s * 0.07)}
              strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - prog} />;
          })}
          {/* 被聚焦那一枝在聚焦开始时一起退掉 */}
          {focus > 0 && (() => {
            const b = kidBox[fi], cy = b.y + b.h / 2;
            return <path d={`M${trunkX} ${ty + root.h - 4} L${trunkX} ${cy - r} Q${trunkX} ${cy} ${trunkX + r} ${cy} L${b.x + 2} ${cy}`}
              fill="none" stroke={S.ink} strokeWidth={Math.max(5, s * 0.07)} strokeLinecap="round" />;
          })()}
        </svg>
        <Pill box={rootBox} style={{ opacity: clamp(rootIn * 2), transform: `scale(${mix(0.6, 1, rootIn)})` }}>
          <DisplayText text={c.topic} size={rootSize} color="#fff" />
        </Pill>
        {kidBox.map((b, i) => {
          if (i === fi) return null;
          const e = p(t, appear[i], appear[i] + 0.42);
          if (e <= 0) return null;
          return <Pill key={i} box={b} style={{ clipPath: `inset(0 ${100 * (1 - e)}% 0 0 round ${b.h / 2}px)` }}>
            <span style={{ opacity: p(t, appear[i] + 0.1, appear[i] + 0.4) }}><DisplayText text={cats[i]} size={s} color="#fff" /></span>
          </Pill>;
        })}
      </div>

      {/* 被聚焦的一类：原位出现 → 放大移到画面中心，字变紫 */}
      {(() => {
        const e = p(t, appear[fi], appear[fi] + 0.42);
        if (e <= 0) return null;
        const b = between(kidBox[fi], finalBox, focus);
        const size = mix(s, fs, focus);
        return <Pill box={b} style={{ clipPath: focus > 0 ? undefined : `inset(0 ${100 * (1 - e)}% 0 0 round ${b.h / 2}px)` }}>
          <span style={{ opacity: p(t, appear[fi] + 0.1, appear[fi] + 0.4) }}><DisplayText text={cats[fi]} size={size} color={focus > 0.25 ? accentOn(true) : '#fff'} /></span>
        </Pill>;
      })()}
    </Handoff>
    <Sfx name="pop" at={0.04} />
    <Sfx name="slide" at={appear[0] - 0.3} />
    <Sfx name="woosh" at={focusAt} />
  </Frame>;
}
