// T05g-NotEqual：不等号拆开两个概念（升级自 L81-B065 前半段“录音 ≠ 记忆”）
// 观众要看懂的变化：两个容易混的概念 → 中间落下不等号，被明确分开
// 关系：黑窗里先立住概念 A → 概念 B 从左往右刷出、与 A 并排（像是一回事）→ 中间落下紫色圆章，
//   先是“=”，一道斜杠划过变成“≠”，两边同时被推开一点 —— 观众看到的是“被明确分开”。
// 保留原版：深色窗口容器、白色粗大字、A 先在 / B 左→右刷出 / 紫圆从中心弹出的顺序与节奏形态。
// 按 Fred 意见：只保留前半段（不做“内容整理 / 再次使用”的第二段），快过渡约 3 秒。
// 统一到 kit：MacWindow（X019 深窗，三点由 kit 决定）、深底紫 #D6BEFF、锐字真言大字、深窗白字投影、springAt 落定。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, MacWindow, Sfx, textBase, useT } from '../kit/ui';

export type NotEqualProps = HandoffProps & {
  left: string;        // 概念 A（先在）
  right: string;       // 概念 B（随后刷出）
  symbol: string;      // 圆章里的关系符号；'≠' 时画“= 再被斜杠划开”，其他字符（如 '>'、'≈'）直接显示
  cues?: number[];     // [0]=概念 B 出现，[1]=不等号落下；不传用默认 0.5 / 1.0
};

// 默认内容：第 91 期原话“录音 ≠ 记忆”
export const notEqualDefaults: NotEqualProps = {
  left: '录音',
  right: '记忆',
  symbol: '≠',
};

const MAX_SIZE = 176;      // 黑窗标题上限（DESIGN 2.3：黑窗标题 180）
const SPLIT_BELOW = 112;   // 单行字号低于这个值就把每边折成两行，保持大字
const INNER_W = 1440;      // 窗内可用宽

// 在最均衡处断成两行（优先标点、空格后）
function split2(s: string): string[] {
  const chars = Array.from(s);
  if (chars.length < 3) return [s];
  const half = textWidth(s, 1) / 2;
  let best = Math.ceil(chars.length / 2), score = Infinity, acc = 0;
  for (let i = 1; i < chars.length; i++) {
    acc += textWidth(chars[i - 1], 1);
    const sc = Math.abs(acc - half) + (/[，,、：:；; ]/.test(chars[i - 1]) ? -0.6 : 0);
    if (sc < score) { score = sc; best = i; }
  }
  return [chars.slice(0, best).join('').trim(), chars.slice(best).join('').trim()];
}

export function NotEqual(props: Partial<NotEqualProps>) {
  const c = { ...notEqualDefaults, ...props };
  const t = useT();

  // —— 排版：两边 + 圆章 + 间距 + 推开余量，按真实字宽算字号；太长就每边两行 ——
  const RING = 1.32, GAP = 0.42, PUSH = 0.14;               // 都以字号为单位
  const fixedUnits = RING + GAP * 2 + PUSH * 2;
  const unitsOf = (lines: string[]) => Math.max(1, ...lines.map((l) => textWidth(l, 1)));
  let L = [c.left], R = [c.right];
  let size = Math.min(MAX_SIZE, INNER_W / (unitsOf(L) + unitsOf(R) + fixedUnits));
  if (size < SPLIT_BELOW) {
    L = split2(c.left); R = split2(c.right);
    size = Math.min(MAX_SIZE * 0.86, INNER_W / (unitsOf(L) + unitsOf(R) + fixedUnits));
  }
  const lh = size * 1.16;
  const lw = unitsOf(L) * size, rw = unitsOf(R) * size;
  const ring = size * RING;
  const blockW = lw + rw + size * fixedUnits;
  const blockH = Math.max(L.length, R.length) * lh;

  // —— 窗口：宽度贴合内容（最窄 1100），高度给足上下呼吸 ——
  const BAR = 90;
  const winW = Math.min(1760, Math.max(1100, blockW + 300));
  const winH = Math.min(880, Math.max(640, blockH + BAR + 380));
  const win = { x: 960 - winW / 2, y: Math.max(130, 560 - winH / 2), w: winW, h: winH };
  const cx = winW / 2, cy = (winH - BAR) / 2;               // 窗内坐标（内容区）

  // —— 时间 ——
  const enter = p(t, 0, 0.4);                                // 窗口 + 概念 A，0.3 秒内已可辨认
  const bAt = cueAt(c.cues, 0, 0.5);
  const bIn = p(t, bAt, bAt + 0.4);
  const sAt = Math.max(bAt + 0.2, cueAt(c.cues, 1, 1.0));
  const ringS = springAt(t, sAt, 0.6);                       // 落下弹一下
  const isNe = c.symbol === '≠';
  const slash = p(t, sAt + 0.24, sAt + 0.46);
  const apart = q(t, sAt + 0.26, sAt + 0.56);                // 斜杠划下时两边被推开

  const pushPx = size * PUSH * (isNe ? apart : ringS > 0.6 ? 1 : 0);
  const leftX = cx - ring / 2 - size * GAP - lw - pushPx;
  const rightX = cx + ring / 2 + size * GAP + pushPx;
  const word = (lines: string[], x: number, w: number, extra: React.CSSProperties) =>
    <div style={{ position: 'absolute', left: x, top: cy - (lines.length * lh) / 2, width: w, ...extra }}>
      {lines.map((l, i) => <div key={i} style={{ ...textBase(size, 400, S.display), color: '#fff', textShadow: S.textShadowDark, textAlign: 'center' }}>{l}</div>)}
    </div>;

  const ink = S.ink, sw = ring * 0.085;
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <MacWindow box={{ ...win, y: win.y + (1 - enter) * 50 }} bar={BAR}
        style={{ opacity: clamp(t / 0.1), transform: `scale(${mix(0.94, 1, enter)})`, transformOrigin: '50% 50%' }}>
        {word(L, leftX, lw, { opacity: clamp(enter * 1.4), transform: `translateY(${(1 - enter) * 20}px)` })}
        {word(R, rightX, rw, {
          clipPath: `inset(-20% ${100 * (1 - bIn)}% -20% -10%)`, transform: `translateX(${(1 - bIn) * -30}px)`,
        })}
        {/* 紫色圆章：深底紫，落下弹一下；'=' 先在，斜杠划过成 '≠' */}
        {ringS > 0 && <div style={{
          position: 'absolute', left: cx - ring / 2, top: cy - ring / 2, width: ring, height: ring, borderRadius: ring / 2,
          background: S.accentDark, transform: `scale(${ringS})`, boxShadow: '0 10px 22px #0006',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isNe ? <svg width={ring} height={ring} viewBox="0 0 100 100" style={{ position: 'absolute', left: 0, top: 0 }}>
            <line x1="29" y1="40" x2="71" y2="40" stroke={ink} strokeWidth={sw / ring * 100} strokeLinecap="round" />
            <line x1="29" y1="60" x2="71" y2="60" stroke={ink} strokeWidth={sw / ring * 100} strokeLinecap="round" />
            <line x1="61" y1="22" x2="39" y2="78" stroke={ink} strokeWidth={sw / ring * 100} strokeLinecap="round"
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - slash} />
          </svg> : <span style={{ ...textBase(Math.min(ring * 0.62, (ring * 0.78) / Math.max(1, textWidth(c.symbol, 1))), 900), color: ink, lineHeight: 1 }}>{c.symbol}</span>}
        </div>}
      </MacWindow>
    </Handoff>
    <Sfx name="whoosh-short" at={0} />
    <Sfx name="pop" at={sAt} />
  </Frame>;
}
