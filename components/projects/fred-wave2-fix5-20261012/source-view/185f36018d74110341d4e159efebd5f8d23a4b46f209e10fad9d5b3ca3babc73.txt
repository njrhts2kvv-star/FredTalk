// T05b2-BeforeNow：以前 vs 现在（返修自 T05b）：旧步骤收成一叠时仍可读
// 观众要看懂的变化：以前的多步收起退后 → 现在一句话接管
// 关系：以前的 N 步（同一组卡片）→ 收成左侧一叠紧凑卡（编号和关键词仍读得出，变灰退后）→ 黑胶囊里的新做法成为阅读焦点。
// 返修点（Fred）：旧版收成 0.46 倍小叠、非最前卡的字全部隐去，收起后读不出几步、各是什么。
//   现在收起时不再整体 scale，而是把卡片几何（宽、高、字号）插值到一列紧凑卡：每张保留编号 + 关键词，字号 ≥ 34。
//   其余动作、节奏、胶囊、音效保持 T05b 原样；补 HandoffProps 和 cues。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, center, textBase, useT } from '../kit/ui';

export type BeforeNowProps = HandoffProps & {
  beforeLabel: string;
  beforeSteps: string[];   // 建议 3–6 步
  beforeKeys?: string[];   // 收起后每张卡显示的关键词；缺省用 beforeSteps 原文
  nowLabel: string;
  nowText: string;
  highlight: string;       // nowText 中要染紫的关键词（深底 #D6BEFF）
  cues?: number[];         // [0]=旧步骤收起，[1]=现在的胶囊打开；不传用默认 1.75 / 2.3
};

export const beforeNowDefaults: BeforeNowProps = {
  beforeLabel: '以前',
  beforeSteps: ['打开 PS 找模板', '一张张抠图换背景', '手动调色、对齐尺寸', '导出再压缩上传', '改一处，全部重来'],
  nowLabel: '现在',
  nowText: '一句话让豆包直接出图',
  highlight: '一句话',
};

const CARD_W = 960;
const CARD_X = 620;          // 步骤卡左缘（建立阶段）
const PILE_W = 520;          // 收起后的紧凑一叠：宽
const GAP = 90;              // 一叠与胶囊之间的间距
const SIDE = 80;             // 整组左右最小留白
const LABEL_SIZE = 64, LABEL_H = 100;   // 两个标签共用字号；标签行占高（含与内容的间距）
const CY = 540 + LABEL_H / 2;           // 左右两列共享的中线：整组（标签行+内容）垂直居中

// 一行放得下（字号 ≥ 84）就一行；否则在最均衡处（优先标点后）断成两行
function fitLines(text: string, maxW: number, maxSize: number) {
  const one = Math.min(maxSize, maxW / Math.max(1, textWidth(text, 1)));
  if (one >= 84) return { lines: [text], size: one };
  const chars = Array.from(text);
  let best = { cost: Infinity, at: Math.ceil(chars.length / 2) };
  for (let i = 2; i < chars.length - 1; i++) {
    const a = chars.slice(0, i).join(''), b = chars.slice(i).join('');
    const bonus = /[，,、：:；; ]/.test(chars[i - 1]) ? 0.82 : 1;
    const cost = Math.max(textWidth(a, 1), textWidth(b, 1)) * bonus;
    if (cost < best.cost) best = { cost, at: i };
  }
  const lines = [chars.slice(0, best.at).join('').trim(), chars.slice(best.at).join('').trim()];
  return { lines, size: Math.min(maxSize, maxW / Math.max(...lines.map((l) => textWidth(l, 1)))) };
}

// 按字符位置染紫：返回带高亮的一行
function HighlightLine({ line, offset, from, to }: { line: string; offset: number; from: number; to: number }) {
  const chars = Array.from(line);
  return <>{chars.map((ch, k) => {
    const idx = offset + k;
    return <span key={k} style={idx >= from && idx < to ? { color: S.accentDark } : undefined}>{ch}</span>;
  })}</>;
}

export function BeforeNow(props: Partial<BeforeNowProps>) {
  const c = { ...beforeNowDefaults, ...props };
  const t = useT();
  const steps = c.beforeSteps.slice(0, 6);
  const n = Math.max(1, steps.length);
  const keys = steps.map((s, i) => (c.beforeKeys?.[i] || s));

  // —— 建立：步骤卡快速堆起（总长约 1.1s，步数多时间隔更短）——
  const gapT = Math.min(0.24, 0.95 / n);
  const cardH = n <= 4 ? 128 : n === 5 ? 112 : 96;
  const gapY = n <= 4 ? 26 : 20;
  const listH = n * cardH + (n - 1) * gapY;
  const listTop = CY - listH / 2;
  const stepSize = Math.min(cardH * 0.46, ...steps.map((s) => (CARD_W - 190) / Math.max(1, textWidth(s, 1))));

  // —— 收起后的紧凑一叠：每张一行，编号 + 关键词仍可读 ——
  const pileH = n <= 4 ? 92 : n === 5 ? 82 : 72;
  const pileGap = 14;
  const pileTotal = n * pileH + (n - 1) * pileGap;
  const pileTop = CY - pileTotal / 2;
  const pileSize = Math.max(30, Math.min(pileH * 0.48, ...keys.map((k) => (PILE_W - pileH * 0.5 - 40 - pileH * 0.55) / Math.max(1, textWidth(k, 1)))));

  // —— 压缩退后 ——
  const sq = cueAt(c.cues, 0, 1.75);
  const squeeze = p(t, sq, sq + 0.65);
  const dim = q(t, sq + 0.15, sq + 0.75);

  // —— 现在：黑胶囊接管 ——
  const na = cueAt(c.cues, 1, 2.3);
  const nowOpen = p(t, na, na + 0.7);
  const nowGrow = p(t, na, na + 0.32);
  const textIn = p(t, na + 0.32, na + 0.75);
  const maxW = 1920 - 2 * SIDE - PILE_W - GAP;
  const fit = fitLines(c.nowText, maxW - 200, 118);
  const nowSize = fit.size;
  const capH = Math.round(nowSize * (fit.lines.length === 1 ? 2.6 : 3.6));
  const capW = Math.min(maxW, Math.max(...fit.lines.map((l) => textWidth(l, nowSize))) + 200);
  const capR = Math.min(capH / 2, 110);
  const contentH = Math.max(pileTotal, capH);
  const groupW = PILE_W + GAP + capW;
  const pileX = (1920 - groupW) / 2;                 // 整组左右居中
  const capLeft = pileX + PILE_W + GAP;
  const capCx = capLeft + capW / 2;
  const labelRowY = CY - contentH / 2 - LABEL_H;     // 两个标签同一顶线、同一字号、同一基线
  const w = mix(capH * 0.35, capW, nowOpen);
  const h = mix(capH * 0.35, capH, nowGrow);
  const hlFrom = c.highlight ? Array.from(c.nowText).length - Array.from(c.nowText.slice(Math.max(0, c.nowText.indexOf(c.highlight)))).length : -1;
  const hl = c.highlight && c.nowText.includes(c.highlight) ? [hlFrom, hlFrom + Array.from(c.highlight).length] : [-1, -1];
  let offset = 0;
  const lineOffsets = fit.lines.map((l) => { const o = c.nowText.indexOf(l, offset); offset = o + l.length; return Array.from(c.nowText.slice(0, o)).length; });

  // 标签：以前（跟随卡组，收起后落在那一叠上方）/ 现在（胶囊左上）
  // 标签跟着第 1 张卡走：先上抬、再横移到卡片上方，避免途中压到卡片
  const labelUp = p(t, sq, sq + 0.22), labelOver = p(t, sq + 0.12, sq + 0.7);
  // 标签放在卡组左侧时，长标签自动缩字，不贴画布左缘
  const labelBig = Math.min(104, (CARD_X - 70 - 90) / Math.max(1, textWidth(c.beforeLabel, 1)));
  const beforeLabelSize = mix(labelBig, LABEL_SIZE, squeeze);
  const labelX = mix(CARD_X - 70 - textWidth(c.beforeLabel, labelBig), pileX + 8, labelOver);
  const labelY = mix(listTop - 4, labelRowY, labelUp);
  const labelIn = p(t, 0, 0.35);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 以前：标签 */}
      <div style={{
        ...textBase(beforeLabelSize, 900), position: 'absolute', left: labelX, top: labelY,
        color: dim > 0.5 ? S.muted : S.ink, opacity: labelIn, transform: `translateY(${(1 - labelIn) * 20}px)`,
      }}>{c.beforeLabel}</div>

      {/* 以前：步骤卡 → 紧凑一叠（几何插值，不整体缩小，字始终可读） */}
      {steps.map((s, i) => {
        const enter = p(t, 0.08 + i * gapT, 0.08 + i * gapT + 0.38);
        const listY = listTop + i * (cardH + gapY);
        const pileY = pileTop + i * (pileH + pileGap);
        const back = n - 1 - i;
        // 收起时轻微交错旋转，读起来像“一叠”，角度小到不影响阅读
        const rot = (back === 0 ? 0 : (back % 2 ? -1 : 1) * 0.9) * squeeze;
        const x = mix(CARD_X, pileX, squeeze) + (back % 2 ? -1 : 1) * 6 * squeeze;
        const y = mix(listY, pileY, squeeze);
        const cw = mix(CARD_W, PILE_W, squeeze), ch = mix(cardH, pileH, squeeze);
        const size = mix(stepSize, pileSize, squeeze);
        const label = squeeze > 0.5 ? keys[i] : s;
        const textCol = dim > 0.5 ? S.muted : S.ink;
        return <div key={i} style={{
          position: 'absolute', left: x, top: y + (1 - enter) * 46, width: cw, height: ch,
          transform: `scale(${mix(0.96, 1, enter)}) rotate(${rot}deg)`, transformOrigin: '50% 50%',
          background: '#fff', borderRadius: mix(S.radius, 18, squeeze), boxShadow: S.shadow, opacity: enter,
          display: 'flex', alignItems: 'center', paddingLeft: mix(56, 28, squeeze), gap: mix(34, 18, squeeze), overflow: 'hidden', zIndex: 10 + i,
        }}>
          <span style={{ ...textBase(size, 900), color: S.faint, width: size * 0.9, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
          <span style={{ ...textBase(size, squeeze > 0.5 ? 600 : 500), color: textCol, overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, paddingRight: 20 }}>{label}</span>
        </div>;
      })}
      {/* 现在：标签 + 黑胶囊 */}
      <div style={{
        ...textBase(LABEL_SIZE, 900), position: 'absolute', left: capLeft + 8, top: labelRowY,
        color: S.ink, opacity: textIn, transform: `translateY(${(1 - textIn) * 16}px)`,
      }}>{c.nowLabel}</div>
      <div style={{
        position: 'absolute', left: capCx - w / 2, top: CY - h / 2, width: w, height: h, borderRadius: Math.min(h / 2, capR),
        background: S.dark, boxShadow: S.capsuleShadow, opacity: clamp(nowGrow * 3), overflow: 'hidden', ...center, zIndex: 50,
      }}>
        <span style={{
          ...textBase(nowSize, 900), lineHeight: 1.22, color: '#fff', opacity: textIn, textAlign: 'center',
          transform: `translateX(${(1 - textIn) * 24}px)`, clipPath: `inset(0 ${100 * (1 - textIn)}% 0 0)`,
        }}>{fit.lines.map((l, k) => <div key={k}><HighlightLine line={l} offset={lineOffsets[k]} from={hl[0]} to={hl[1]} /></div>)}</span>
      </div>
    </Handoff>

    <Sfx name="slide" at={0.08} />
    <Sfx name="gather" at={sq} />
    <Sfx name="pop" at={na} />
  </Frame>;
}
