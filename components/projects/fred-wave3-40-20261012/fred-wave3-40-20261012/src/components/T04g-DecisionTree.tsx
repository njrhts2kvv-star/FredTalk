// T04g-DecisionTree：该选哪条路
// 观众要看懂的变化：一个问题 → 分叉成几条路，按条件落到推荐答案
// 关系：根问题黑胶囊在上；向下分叉的路依次画出，条件标签挂在每条路的竖段上，路的尽头是答案白卡。
//       全部摆好后，一条墨线沿推荐那条路从根“流”下去，流进答案卡——卡从上往下被染黑、轻轻抬起，
//       其余路、条件和答案退淡。和 T04d（树根在左上、聚焦一类放大到中央）不同：这里是按条件走到推荐答案。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth, wipe } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type DecisionBranch = {
  condition: string;   // 挂在路上的条件
  answer: string;      // 路尽头的答案
  note?: string;       // 答案下的一句补充（可省）
};
export type DecisionTreeProps = HandoffProps & {
  question: string;          // 根问题
  branches: DecisionBranch[]; // 2–3 条
  recommend: number;         // 推荐第几条（从 0 开始）；-1 表示不推荐
  cues?: number[];           // [0..n-1] 第 i 条路出现；[n] 沿推荐路走下去
};

// 113 期结尾建议：偶尔用 → 官方接口；想握在手里 / 想比一比 → 租机器部署开源版，先租一两天试
export const decisionTreeDefaults: DecisionTreeProps = {
  question: '想用 JEV，走哪条路？',
  branches: [
    { condition: '偶尔用一用', answer: '直接调官方接口', note: '最省事' },
    { condition: '想握在自己手里 / 想比一比', answer: '租机器部署开源版', note: '先租一两天试一试' },
  ],
  recommend: 1,
};

// 锐字真言的拉丁字形不适合产品名：拉丁片段改用 MiSans Heavy
function DisplayText({ text, size, color }: { text: string; size: number; color: string }) {
  const runs = text.match(/[\u0000-ÿ]+|[^\u0000-ÿ]+/g) ?? [text];
  return <span style={{ ...textBase(size, 400, S.display), color }}>
    {runs.map((r, i) => /^[\u0000-ÿ]+$/.test(r)
      ? <span key={i} style={{ fontFamily: S.body, fontWeight: 900 }}>{r}</span>
      : <React.Fragment key={i}>{r}</React.Fragment>)}
  </span>;
}

const ROOT_TOP = 168;
const LY = 600;            // 答案卡顶边
const R = 30;              // 拐角半径

export function DecisionTree(props: Partial<DecisionTreeProps>) {
  const c = { ...decisionTreeDefaults, ...props };
  const t = useT();
  const br = c.branches.slice(0, 3);
  const n = Math.max(1, br.length);
  const rec = c.recommend >= 0 && c.recommend < n ? c.recommend : -1;

  // ---- 几何 ----
  const rootSize = Math.min(84, 1200 / Math.max(1, textWidth(c.question, 1)));
  const rootH = rootSize * 1.75, rootW = textWidth(c.question, rootSize) + rootSize * 1.6;
  const rootBottom = ROOT_TOP + rootH;
  const splitY = rootBottom + 64;
  const maxLW = n === 1 ? 760 : n === 2 ? 660 : 500;
  // 卡宽贴合内容：短答案不撑成大白卡
  const LW = Math.min(maxLW, Math.max(400, ...br.map((b) => Math.max(textWidth(b.answer, 62), textWidth(b.note ?? '', 40)) + 150)));
  const span = n === 1 ? 0 : n === 2 ? 840 : 1120;
  const bx = (i: number) => (n === 1 ? 960 : 960 - span / 2 + (span / (n - 1)) * i);
  const ansSize = Math.min(62, ...br.map((b) => (LW - 90) / Math.max(1, textWidth(b.answer, 1))));
  const noteSize = Math.max(30, Math.min(40, ...br.filter((b) => b.note).map((b) => (LW - 90) / Math.max(1, textWidth(b.note ?? '', 1)))));
  const hasNote = br.some((b) => b.note);
  const LH = 40 * 2 + ansSize * 1.16 + (hasNote ? 14 + noteSize * 1.16 : 0);
  const chipSize = Math.max(30, Math.min(40, ...br.map((b) => (LW - 60) / Math.max(1, textWidth(b.condition, 1)))));
  const chipH = chipSize * 1.95;
  const chipY = (splitY + LY) / 2 + 6 - chipH / 2;

  const pathOf = (i: number) => {
    const x = bx(i);
    if (Math.abs(x - 960) < 1) return `M960 ${rootBottom} L960 ${LY}`;
    const s = Math.sign(x - 960);
    return `M960 ${rootBottom} L960 ${splitY - R} Q960 ${splitY} ${960 + s * R} ${splitY} L${x - s * R} ${splitY} Q${x} ${splitY} ${x} ${splitY + R} L${x} ${LY}`;
  };

  // ---- 时间 ----
  const rootIn = p(t, 0.02, 0.5) * 1.055 - 0.055 * q(t, 0.5, 0.72);
  const appear = br.map((_, i) => cueAt(c.cues, i, 0.8 + i * 0.68 + (i > 1 ? 0.1 : 0)));
  const lastAppear = appear[n - 1];
  const T = cueAt(c.cues, n, lastAppear + 1.0);
  const trace = p(t, T, T + 0.6);
  const fill = wipe(t, T + 0.42, T + 0.85);
  const lift = springAt(t, T + 0.55, 0.65);
  const dim = rec >= 0 ? q(t, T, T + 0.5) : 0;
  const noteIn = p(t, T + 0.75, T + 1.15);

  const leafFace = (b: DecisionBranch, dark: boolean, isRec: boolean, textOpacity = 1) => <div style={{
    position: 'absolute', inset: 0, background: dark ? S.dark : '#fff', borderRadius: S.radius,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'inherit',
  }}><div style={{ opacity: textOpacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
    <span style={{ ...textBase(ansSize, 900), color: dark ? '#fff' : S.ink }}>{b.answer}</span>
    {b.note ? <span style={{ ...textBase(noteSize, dark ? 900 : 500), color: dark ? accentOn(true) : S.muted,
      opacity: dark && isRec ? mix(0.35, 1, noteIn) : 1 }}>{b.note}</span> : null}
  </div></div>;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 路：底线淡灰，推荐那条被墨线走一遍 */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {br.map((_, i) => {
          const draw = p(t, appear[i] - 0.34, appear[i] + 0.06);
          if (draw <= 0) return null;
          const isRec = i === rec;
          return <path key={i} d={pathOf(i)} pathLength={1} fill="none" stroke="#c9c9ce" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={isRec ? 1 : 1 - 0.6 * dim} />;
        })}
        {rec >= 0 && trace > 0 && <path d={pathOf(rec)} pathLength={1} fill="none" stroke={S.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="1 1" strokeDashoffset={1 - trace} />}
      </svg>

      {/* 根问题 */}
      <Pill box={{ x: 960 - (rootW * rootIn) / 2, y: ROOT_TOP, w: Math.max(rootH, rootW * rootIn), h: rootH }} style={{ opacity: clamp(rootIn * 4), zIndex: 20 }}>
        <span style={{ opacity: clamp((rootIn - 0.5) / 0.3) }}><DisplayText text={c.question} size={rootSize} color="#fff" /></span>
      </Pill>

      {br.map((b, i) => {
        const e = p(t, appear[i], appear[i] + 0.45);
        if (e <= 0) return null;
        const isRec = i === rec;
        const fade = isRec ? 1 : 1 - 0.6 * dim;   // 只退文字，卡和条件签保持实心，不透出后面的线
        const x = bx(i);
        const chipW = textWidth(b.condition, chipSize) + chipSize * 1.4;
        const up = isRec ? -16 * lift : 0;
        return <React.Fragment key={i}>
          {/* 条件：挂在竖段上，从左向右擦出 */}
          <Surface box={{ x: x - chipW / 2, y: chipY, w: chipW, h: chipH }} radius={chipH / 2}
            style={{ zIndex: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
              clipPath: `inset(-40px ${100 * (1 - e)}% -40px 0 round ${chipH / 2}px)` }}>
            <span style={{ ...textBase(chipSize, isRec && dim > 0.5 ? 900 : 500), color: S.ink, opacity: fade }}>{b.condition}</span>
          </Surface>
          {/* 答案卡 */}
          <div style={{ position: 'absolute', left: x - LW / 2, top: LY + (1 - e) * 40 + up, width: LW, height: LH, borderRadius: S.radius, zIndex: isRec ? 18 : 12,
            boxShadow: isRec && fill > 0.5 ? S.capsuleShadow : S.shadow, opacity: clamp(e * 2.5), transform: `scale(${isRec ? 1 + 0.04 * lift : 1})` }}>
            {leafFace(b, false, isRec, fade)}
            {isRec && fill > 0 && <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 ${100 * (1 - fill)}% 0 round ${S.radius}px)` }}>{leafFace(b, true, true)}</div>}
          </div>
        </React.Fragment>;
      })}
    </Handoff>
    <Sfx name="pop" at={0.02} />
    <Sfx name="slide" at={appear[0] - 0.3} />
    {rec >= 0 && <Sfx name="woosh" at={T} />}
    {rec >= 0 && <Sfx name="ding" at={T + 0.6} />}
  </Frame>;
}
