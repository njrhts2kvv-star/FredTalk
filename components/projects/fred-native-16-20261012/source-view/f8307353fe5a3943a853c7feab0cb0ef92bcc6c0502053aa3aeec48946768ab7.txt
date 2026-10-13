// T12a 第X部分大章（快过渡 2s）：一个点在画面中心长成圆、再横向撑成宽胶囊，章节名在胶囊里落定。
// 关系：上一段注意力清零 → 一个新的容器 → 本部分名字。
import React from 'react';
import { S, clamp, p, springAt, textWidth } from '../kit/theme';
import { Frame, Sfx, abs, textBase, useT } from '../kit/ui';

export type PartTitleProps = {
  index: number;        // 第几部分
  label: string;        // 小标签；留空则用「第N部分」
  title: string;        // 部分标题
  dark: boolean;        // 深底版本（胶囊反白）
};

export const partTitleDefaults: PartTitleProps = {
  index: 1,
  label: '',
  title: '先把环境装好',
  dark: false,
};

function splitTitle(title: string, maxUnits: number): string[] {
  if (textWidth(title, 1) <= maxUnits) return [title];
  const chars = Array.from(title);
  const half = textWidth(title, 1) / 2;
  let best = Math.floor(chars.length / 2), bestScore = Infinity, acc = 0;
  for (let i = 1; i < chars.length; i++) {
    acc += textWidth(chars[i - 1], 1);
    const prev = chars[i - 1];
    const brk = /[，,、：:；; ]/.test(prev) ? -3 : /[的和与]/.test(prev) ? -1.5 : 0;
    const score = Math.abs(acc - half) + brk;
    if (score < bestScore) { bestScore = score; best = i; }
  }
  return [chars.slice(0, best).join('').trim(), chars.slice(best).join('').trim()];
}

const LABEL = 54, GAP = 22, PAD_Y = 64, PAD_X = 120;

export function PartTitle(props: Partial<PartTitleProps>) {
  const c = { ...partTitleDefaults, ...props };
  const t = useT();
  const label = c.label || `第${'一二三四五六七八九十'[c.index - 1] ?? c.index}部分`;

  // 单行放不下 ≥110px 时折成两行（优先在标点/空格处断），保持大字
  const lines = splitTitle(c.title, (1720 - PAD_X * 2) / 110);
  const lineW = Math.max(1, ...lines.map((l) => textWidth(l, 1)));
  const size = Math.min(150, (1720 - PAD_X * 2) / lineW);
  const LH = size * 1.08;
  const contentW = Math.max(lineW * size, textWidth(label, LABEL));
  const W = Math.min(1720, Math.max(880, contentW + PAD_X * 2));
  const H = PAD_Y * 2 + LABEL * 1.16 + GAP + LH * lines.length;

  // 点 → 圆（0–0.36s）→ 横向撑开带一次轻微过冲（T03 实测感：先冲过约 5% 再回落）
  const d = H * p(t, 0, 0.36);
  const spread = springAt(t, 0.3, 0.68);
  const w = d + (W - H) * Math.max(0, spread);
  const h = d;
  // T03 半径公式：接近正方时为圆，横向拉长后收为测得半径
  const r = Math.max(h * 0.3, (Math.min(w, h) / 2) * clamp(2 - w / Math.max(h, 1)));

  const lab = p(t, 0.62, 0.95);

  const capBg = c.dark ? '#fff' : S.dark;
  const titleColor = c.dark ? S.ink : '#fff';
  const labelColor = c.dark ? S.accent : S.accentDark;
  const top = 540 - h / 2;

  return <Frame dark={c.dark}>
    {h > 0.5 && <div style={{
      ...abs({ x: 960 - w / 2, y: top, w, h }), borderRadius: r, background: capBg, overflow: 'hidden',
      boxShadow: c.dark ? '30px 22px 25px #0009' : S.capsuleShadow,
    }}>
      <div style={{
        ...textBase(LABEL, 600), position: 'absolute', left: 0, right: 0, top: (h - H) / 2 + PAD_Y, textAlign: 'center',
        color: labelColor, letterSpacing: 4, opacity: lab, transform: `translateY(${(1 - lab) * 18}px)`,
      }}>{label}</div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: (h - H) / 2 + PAD_Y + LABEL * 1.16 + GAP, height: LH * lines.length,
        overflow: 'hidden', textAlign: 'center',
      }}>
        {lines.map((l, i) => {
          const li = p(t, 0.72 + i * 0.1, 1.18 + i * 0.1);
          return <div key={i} style={{ height: LH, overflow: 'hidden' }}>
            <div style={{ ...textBase(size, 400, S.display), lineHeight: 1.08, color: titleColor, transform: `translateY(${(1 - li) * LH}px)` }}>{l}</div>
          </div>;
        })}
      </div>
    </div>}
    <Sfx name="woosh" at={0} />
  </Frame>;
}
