// T02a 本期N件事预告：N 张编号卡依次立起排成一排，看全后当前这一件被抬起、其余退到 35%。
// 关系：本期全貌（N 件事）→ 现在讲到第几件。终态可在每个章节开头复用（mode='chapter'）。
import React from 'react';
import { S, mix, p, q } from '../kit/theme';
import { Frame, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type AgendaThreeProps = {
  items: string[];      // 2–5 项
  current: number;      // 0 起；-1 表示只预告、不聚焦
  mode: 'preview' | 'chapter';   // preview：逐张建立后聚焦；chapter：直接整排出现并聚焦（章节开头复用）
};

export const agendaThreeDefaults: AgendaThreeProps = {
  items: ['装好 Codex 并登录', '让它读懂你的项目', '用一句话改出成品'],
  current: 0,
  mode: 'preview',
};

const GAP = 44, CARD_H = 420, PAD = 46;

// 比 kit textWidth 更保守：大写拉丁字母按 0.68 估（MiSans Heavy 大写偏宽）
const tw = (str: string, size: number) =>
  Array.from(str).reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.68 : /[\u0000-\u00ff]/.test(ch) ? 0.58 : 1) * size, 0);

// 标题最多两行：拉丁词整体不拆，中文逐字；从大到小找能放进两行的字号
function wrap(title: string, size: number, inner: number): string[] {
  const tokens = title.match(/[A-Za-z0-9.\-_/+#]+|\s+|./gu) ?? [];
  const lines: string[] = [''];
  for (const tk of tokens) {
    const cur = lines[lines.length - 1];
    if (cur && tw(cur + tk, size) > inner) lines.push(tk.trim() ? tk : '');
    else lines[lines.length - 1] = cur + tk;
  }
  return lines.map((l) => l.trim()).filter(Boolean);
}
// 平衡折行：在能放下的前提下，把每行宽度收窄到接近平均，避免“改/出成品”这类断头
function balanced(title: string, size: number, inner: number): string[] {
  const k = wrap(title, size, inner).length;
  if (k <= 1) return [title.trim()];
  const total = tw(title, size);
  for (let w = total / k; w <= inner; w += size * 0.25) {
    const lines = wrap(title, size, w);
    if (lines.length === k) return lines;
  }
  return wrap(title, size, inner);
}
function layoutTitle(title: string, inner: number, maxLines: number) {
  for (let size = 84; size >= 48; size -= 2) {
    const lines = wrap(title, size, inner);
    if (lines.length <= maxLines && lines.every((l) => tw(l, size) <= inner)) return size;
  }
  return 48;
}

export function AgendaThree(props: Partial<AgendaThreeProps>) {
  const c = { ...agendaThreeDefaults, ...props };
  const t = useT();
  const n = Math.max(1, c.items.length);
  // 2–3 项：横排竖卡（编号在上、标题在下）；4–5 项：卡太窄会把字压小，改为竖排横条（编号在左、标题单行）
  const stacked = n >= 4;
  const cardW = stacked ? 0 : Math.min(520, (1720 - GAP * (n - 1)) / n);
  const rowGap = 26;
  const rowH = stacked ? Math.min(150, (900 - rowGap * (n - 1)) / n) : 0;
  const pillW = stacked ? rowH * 0.95 : 136, pillH = stacked ? rowH - 2 * 30 : 92;
  const inner = stacked ? 1300 - PAD * 2 - pillW - 40 : cardW - PAD * 2;
  const maxLines = stacked ? 1 : 2;
  const size = stacked
    ? Math.min(72, rowH * 0.48, ...c.items.map((s) => inner / Math.max(1, tw(s, 1))))
    : Math.min(...c.items.map((s) => layoutTitle(s, inner, maxLines)));
  const linesOf = (s: string) => (stacked ? [s] : balanced(s, size, inner));
  const stackW = stacked ? Math.min(1300, PAD * 2 + pillW + 40 + Math.max(...c.items.map((s) => tw(s, size)))) : 0;
  const boxOf = (i: number) => stacked
    ? { x: (1920 - stackW) / 2, y: 540 + 20 - (n * rowH + (n - 1) * rowGap) / 2 + i * (rowH + rowGap), w: stackW, h: rowH }
    : { x: (1920 - (n * cardW + (n - 1) * GAP)) / 2 + i * (cardW + GAP), y: 540 - CARD_H / 2 + 20, w: cardW, h: CARD_H };

  const chapter = c.mode === 'chapter';
  const startAt = (i: number) => (chapter ? 0.02 : 0.12 + i * 0.34);
  const buildDur = chapter ? 0.4 : 0.5;
  const focusAt = chapter ? 0.55 : startAt(n - 1) + 0.95;
  const focus = c.current >= 0 && c.current < n ? q(t, focusAt, focusAt + 0.55) : 0;

  return <Frame>
    {c.items.map((title, i) => {
      const e = p(t, startAt(i), startAt(i) + buildDur);
      const num = p(t, startAt(i) + 0.12, startAt(i) + 0.45);
      const isCur = i === c.current;
      const lift = isCur ? focus : 0;
      const dim = !isCur ? focus : 0;
      const b = boxOf(i);
      return <div key={i} style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none',
        opacity: e * mix(1, 0.35, dim), zIndex: isCur ? 2 : 1,
        transform: stacked ? `translateX(${(1 - e) * 120 + 30 * lift}px)` : `translateY(${(1 - e) * 80 - 40 * lift}px)`,
      }}>
        <Surface box={b} shadow={lift > 0 ? `0 ${16 + 18 * lift}px ${25 + 20 * lift}px 0 rgba(0,0,0,${0.133 + 0.07 * lift})` : S.shadow}
          style={{ transform: `scale(${mix(1, stacked ? 1.05 : 1.08, lift) * mix(1, 0.97, dim)})`, overflow: 'visible' }}>
          <Pill box={stacked ? { x: 30, y: 30, w: pillW, h: pillH } : { x: PAD, y: PAD, w: pillW, h: pillH }} style={{ opacity: num, transform: `scale(${mix(0.6, 1, num)})` }}>
            <span style={{ ...textBase(stacked ? pillH * 0.62 : 60, 900), color: S.accentDark }}>{String(i + 1).padStart(2, '0')}</span>
          </Pill>
          <div style={stacked
            ? { position: 'absolute', left: 30 + pillW + 40, top: (rowH - size * 1.16) / 2, color: S.ink }
            : { position: 'absolute', left: PAD, right: PAD, bottom: PAD + 4, color: S.ink }}>
            {linesOf(title).map((l, k) => <div key={k} style={{ ...textBase(size, 900), lineHeight: stacked ? 1.16 : 1.2 }}>{l}</div>)}
          </div>
        </Surface>
      </div>;
    })}
    {!chapter && c.items.map((_, i) => <Sfx key={i} name="pop" at={startAt(i)} />)}
    {chapter && <Sfx name="whoosh-short" at={0.02} />}
    {c.current >= 0 && c.current < n && <Sfx name="slide" at={focusAt} />}
  </Frame>;
}
