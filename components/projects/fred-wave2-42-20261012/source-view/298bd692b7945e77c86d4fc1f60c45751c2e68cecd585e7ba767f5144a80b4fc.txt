// T01b-TermDefine：概念定义（5s）
// 观众要看懂的变化：一个术语 → 拆出一句人话定义
// 动作：术语先以黑色大卡单独立住；随后黑卡上移收窄，一张白色释义卡从黑卡下沿“抽出”展开，
//       逐行读出人话定义，最后关键处点紫。
// 与库内区分：X003/T01e 是胶囊逐字补条件；T01g 是黑窗打字；这里是“术语卡 → 下方抽出释义卡”的上下两层关系。
import React from 'react';
import { S, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type TermDefineProps = HandoffProps & {
  term: string;         // 术语
  alias: string;        // 术语的全称/译名（可空）
  definition: string;   // 一句人话定义
  highlight: string;    // definition 里染紫的词（浅底 #8554E8），留空不强调
  cues?: number[];      // [0]=释义卡抽出，[1]=关键词点紫
};

// 默认内容：第 112 期《API 是什么》开头对 API 的解释
export const termDefineDefaults: TermDefineProps = {
  term: 'API',
  alias: '应用程序编程接口',
  definition: '按约定的规则，调用别人做好的能力',
  highlight: '别人做好的能力',
};

// 把一句话折成 n 行，优先在标点/空格处断
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

const MAX_W = 1640;
const DEF_PAD_X = 96, DEF_PAD_Y = 72;

export function TermDefine(props: Partial<TermDefineProps>) {
  const c = { ...termDefineDefaults, ...props };
  const t = useT();
  const openAt = cueAt(c.cues, 0, 1.15);
  const hlAt = cueAt(c.cues, 1, 2.75);

  // —— 释义：一行 ≥80px 放得下就一行，否则两行/三行 ——
  const units = Math.max(1, textWidth(c.definition, 1));
  const innerMax = MAX_W - 80 - DEF_PAD_X * 2;
  const nLines = [1, 2, 3].find((L) => Math.min(112, innerMax / (units / L * 1.08)) >= 84) ?? 3;
  const lines = splitLines(c.definition, nLines);
  const lineUnits = Math.max(1, ...lines.map((l) => textWidth(l, 1)));
  const defSize = Math.min(112, innerMax / lineUnits);
  const defLH = defSize * 1.3;
  const defW = Math.max(980, lineUnits * defSize + DEF_PAD_X * 2);
  const defH = lines.length * defLH + DEF_PAD_Y * 2 - (defLH - defSize * 1.16);

  // —— 术语卡：开场大字 → 抽出释义时收小上移、和释义卡同宽 ——
  const termBig = Math.min(260, 1300 / Math.max(1, textWidth(c.term, 1)));
  const termSmall = Math.min(164, 900 / Math.max(1, textWidth(c.term, 1)));
  const aliasSize = c.alias ? Math.min(58, 600 / Math.max(1, textWidth(c.alias, 1))) : 0;
  const m = q(t, openAt, openAt + 0.6);
  const termSize = mix(termBig, termSmall, m);
  const aliasGap = c.alias ? mix(56, 44, m) : 0;
  const contentW = textWidth(c.term, termSize) + (c.alias ? aliasGap + textWidth(c.alias, aliasSize) : 0);
  const cardW0 = contentW + termBig * 1.2;            // 锐字真言的拉丁字母比估算略宽，左右多留一点
  const cardW1 = Math.max(defW + 80, textWidth(c.term, termSmall) + (c.alias ? 44 + textWidth(c.alias, aliasSize) : 0) + termSmall * 0.9);
  const cardW = mix(cardW0, cardW1, m);
  const cardH = mix(termBig * 1.55, termSmall * 1.6, m);
  const tuck = 34;                                       // 释义卡顶部藏在黑卡下沿后面
  const blockH = termSmall * 1.6 + defH - tuck;
  const cardY1 = 540 - blockH / 2;
  const cardY = mix(540 - termBig * 1.55 / 2, cardY1, m);
  const enter = p(t, 0, 0.4);

  // —— 释义卡抽出：从黑卡下沿往下展开 ——
  const unfold = p(t, openAt + 0.2, openAt + 0.85);
  const defX = 960 - (cardW1 - 80) / 2, defBoxW = cardW1 - 80;
  const defTop = cardY + cardH - tuck;
  const hl = p(t, hlAt, hlAt + 0.35);
  const hlColor = `rgb(${mix(0x19, 0x85, hl)}, ${mix(0x19, 0x54, hl)}, ${mix(0x1c, 0xe8, hl)})`;

  const renderLine = (l: string) => {
    const k = c.highlight ? l.indexOf(c.highlight) : -1;
    if (k < 0) {
      // 强调词被折行拆开时，按字符区间逐段染色
      const all = c.definition.indexOf(c.highlight);
      if (!c.highlight || all < 0) return l;
      const lineStart = c.definition.indexOf(l);
      const a = Math.max(all, lineStart), b = Math.min(all + c.highlight.length, lineStart + l.length);
      if (b <= a) return l;
      return <>{l.slice(0, a - lineStart)}<span style={{ color: hlColor }}>{l.slice(a - lineStart, b - lineStart)}</span>{l.slice(b - lineStart)}</>;
    }
    return <>{l.slice(0, k)}<span style={{ color: hlColor }}>{c.highlight}</span>{l.slice(k + c.highlight.length)}</>;
  };

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 释义卡（在黑卡后面） */}
      {unfold > 0 && <div style={{ position: 'absolute', left: defX - 60, top: defTop, width: defBoxW + 120, height: defH + 80, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 60, top: -(1 - unfold) * defH, width: defBoxW, height: defH,
          background: '#fff', borderRadius: `0 0 ${S.radius}px ${S.radius}px`, boxShadow: S.shadow,
        }}>
          {lines.map((l, i) => {
            const e = p(t, openAt + 0.45 + i * 0.16, openAt + 0.85 + i * 0.16);
            return <div key={i} style={{
              ...textBase(defSize, 900), position: 'absolute', left: 0, right: 0, textAlign: 'center',
              top: DEF_PAD_Y + tuck * 0.5 + i * defLH, color: S.ink, opacity: e, transform: `translateY(${(1 - e) * 20}px)`,
            }}>{renderLine(l)}</div>;
          })}
        </div>
      </div>}
      {/* 术语黑卡 */}
      <div style={{
        position: 'absolute', left: 960 - cardW / 2, top: cardY, width: cardW, height: cardH, borderRadius: S.radius,
        background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: aliasGap,
        opacity: Math.min(1, enter * 1.6), transform: `scale(${mix(0.9, 1, enter)})`,
      }}>
        <span style={{ ...textBase(termSize, 400, S.display), color: '#fff' }}>{c.term}</span>
        {c.alias && <span style={{ ...textBase(aliasSize, 500), color: S.faint, transform: `translateY(${termSize * 0.08}px)` }}>{c.alias}</span>}
      </div>
    </Handoff>
    <Sfx name="pop" at={0} />
    <Sfx name="slide" at={openAt} />
  </Frame>;
}
