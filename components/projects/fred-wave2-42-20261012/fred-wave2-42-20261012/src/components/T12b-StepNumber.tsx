// T12b-StepNumber：第 N 点步骤号（快过渡 2.5s）
// 观众要看懂的变化：大号序号落定 → 接出这一步的名字
// 动作：黑色方块里的数字像计数器一样从上一步翻到这一步（落定）；随后方块让到左边，
//       一条黑胶囊从方块背后抽出来，带出这一步的名字。
// 与库内区分：T12a 是“点长成胶囊 + 第N部分”；T01f 是“圆点胀成句子胶囊”；这里的主动作是序号翻动 + 名字从方块后抽出。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, abs, textBase, useT } from '../kit/ui';

export type StepNumberProps = HandoffProps & {
  index: number;        // 这一步的序号
  from?: number;        // 从哪个数翻上来；不传 = index-1；≤0 或等于 index 时数字直接升起落定
  name: string;         // 这一步的名字
  highlight: string;    // name 里染紫的词（深底 #D6BEFF），留空不强调
  cues?: number[];      // [0]=序号开始翻动，[1]=名字抽出；不传用默认节奏
};

// 默认内容：第 112 期《API 是什么》第三部分“怎么用”的第二步
export const stepNumberDefaults: StepNumberProps = {
  index: 2,
  name: '把 Key 放进 .env 文件',
  highlight: '.env',
};

// 把一句话折成 n 行，优先在标点/空格处断，行宽尽量均衡
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
      const prev = chars[i - 1];
      const brk = /[，,、：:；; ]/.test(prev) ? -2.5 : /[的和与把]/.test(chars[i]) ? -1 : 0;
      const score = Math.abs(acc - target) + brk;
      if (score < bestScore) { bestScore = score; best = i; }
    }
    out.push(chars.slice(start, best).join('').trim());
    start = best;
  }
  out.push(chars.slice(start).join('').trim());
  return out.filter(Boolean);
}

const TILE_H = 400;
const DIGIT = 330;
const GAP = 64;        // 方块右边到名字的距离
const PAD_R = 92;      // 名字右侧留白

function Highlighted({ text, hl, color }: { text: string; hl: string; color: string }) {
  const i = hl ? text.indexOf(hl) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<span style={{ color }}>{hl}</span>{text.slice(i + hl.length)}</>;
}

export function StepNumber(props: Partial<StepNumberProps>) {
  const c = { ...stepNumberDefaults, ...props };
  const t = useT();
  const cur = String(c.index);
  const fromN = c.from ?? c.index - 1;
  const hasPrev = fromN > 0 && fromN !== c.index;
  const prev = String(fromN);

  // —— 尺寸：数字方块按位数加宽；名字先尝试一行 ≥104px，否则两行 ——
  const digitW = Math.max(textWidth(cur, DIGIT), hasPrev ? textWidth(prev, DIGIT) : 0);
  const tileW = Math.max(TILE_H, digitW + 150);
  const avail = 1760 - tileW - GAP - PAD_R;
  const one = Math.min(140, avail / Math.max(1, textWidth(c.name, 1)));
  const lines = one >= 104 ? [c.name] : splitLines(c.name, 2);
  const lineUnits = Math.max(1, ...lines.map((l) => textWidth(l, 1)));
  const size = Math.min(lines.length > 1 ? 118 : 140, avail / lineUnits);
  const nameW = lineUnits * size;
  const LH = lines.length > 1 ? 1.26 : 1.16;            // 两行时稍拉开行距，锐字真言字面大
  const pillH = lines.length > 1 ? Math.min(TILE_H - 30, size * LH * 2 + 84) : Math.max(270, size * 1.9);
  const groupW = tileW + GAP + nameW + PAD_R;

  // —— 时间 ——
  const rollAt = cueAt(c.cues, 0, 0.2);
  const outAt = cueAt(c.cues, 1, 1.0);
  const tileIn = p(t, 0, 0.32);                           // 方块 0.3s 内立住
  const roll = springAt(t, rollAt, 0.62);                  // 数字翻动落定（带一次轻微回弹）
  // 方块让到左边与胶囊抽出共用同一进度：胶囊右端单调走到终点，不会先冲出画面
  const shift = p(t, outAt, outAt + 0.6);
  const ext = shift;

  const tileX = mix(960 - tileW / 2, 960 - groupW / 2, shift);
  const tileY = 540 - TILE_H / 2;
  const pillLeft = tileX + tileW / 2;                      // 胶囊从方块中心开始（藏在方块后）
  const pillW = tileW / 2 + GAP + nameW + PAD_R;
  const pillY = 540 - pillH / 2;

  // 数字：上一位往上翻走，这一位从下面翻上来
  const travel = TILE_H * 0.92;
  const digitStyle = (dy: number): React.CSSProperties => ({
    ...textBase(DIGIT, 400, S.display), position: 'absolute', left: 0, right: 0, textAlign: 'center',
    top: TILE_H / 2 - DIGIT * 0.58 + dy, color: '#fff', lineHeight: 1.16,
  });

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 名字胶囊：藏在方块后面，向右抽出 */}
      {ext > 0.001 && <div style={{ ...abs({ x: pillLeft, y: pillY - 40, w: pillW + 80, h: pillH + 100 }), overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 40, width: pillW, height: pillH, borderRadius: pillH / 2,
          background: S.dark, boxShadow: S.capsuleShadow, transform: `translateX(${-(1 - ext) * pillW}px)`,
        }}>
          <div style={{ position: 'absolute', left: tileW / 2 + GAP, top: (pillH - lines.length * size * LH) / 2 }}>
            {lines.map((l, i) => <div key={i} style={{ ...textBase(size, 400, S.display), lineHeight: LH, color: '#fff' }}>
              <Highlighted text={l} hl={c.highlight} color={S.accentDark} />
            </div>)}
          </div>
        </div>
      </div>}
      {/* 序号方块 */}
      <div style={{
        ...abs({ x: tileX, y: tileY, w: tileW, h: TILE_H }), background: S.dark, borderRadius: 36,
        boxShadow: S.capsuleShadow, overflow: 'hidden', opacity: clamp(tileIn * 1.6),
        transform: `scale(${mix(0.86, 1, tileIn)})`,
      }}>
        {hasPrev && <div style={digitStyle(-roll * travel)}>{prev}</div>}
        <div style={{ ...digitStyle((1 - roll) * travel), opacity: hasPrev ? 1 : clamp(roll * 2) }}>{cur}</div>
      </div>
    </Handoff>
    <Sfx name="pop" at={0} />
    <Sfx name="slide" at={outAt} />
  </Frame>;
}
