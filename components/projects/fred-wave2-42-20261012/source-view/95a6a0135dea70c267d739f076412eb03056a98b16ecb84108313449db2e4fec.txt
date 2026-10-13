// T05e-FitOrNot：适用 / 不适用
// 观众要看懂的变化：一组情况 → 分到适合和不适合两边
// 关系：一摞情况卡先在中间排好；按口播逐张“分拣”到左右两边，落到“适合”一边的卡翻成黑底（被选中），不适合的保持白卡。
import React from 'react';
import { S, clamp, cueAt, mix, p, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, textBase, useT } from '../kit/ui';

export type FitItem = { text: string; fit: boolean };
export type FitOrNotProps = HandoffProps & {
  fitLabel: string;
  unfitLabel: string;
  items: FitItem[];      // 中间的顺序就是分拣顺序；2–8 项
  highlight: string;     // 某张“适合”卡里染紫的词（深底 #D6BEFF）；'' 不染
  cues?: number[];       // [i]=第 i 张卡开始分拣（秒）；不传按默认节奏
};

export const fitOrNotDefaults: FitOrNotProps = {
  fitLabel: '适合交给 Codex',
  unfitLabel: '还是自己来',
  items: [
    { text: '改整个项目、顺手跑测试', fit: true },
    { text: '一句话就能答的小问题', fit: false },
    { text: '批量改几十个文件', fit: true },
    { text: '需要你当场拍板的设计', fit: false },
    { text: '照着规则修 bug', fit: true },
    { text: '登录账号、填密码', fit: false },
  ],
  highlight: '跑测试',
};

const COL_L = 500, COL_R = 1420;    // 两列中心
const COL_W_MAX = 820;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixColor = (a: string, b: string, v: number) => {
  const [r1, g1, b1] = hex(a), [r2, g2, b2] = hex(b);
  return `rgb(${Math.round(mix(r1, r2, v))},${Math.round(mix(g1, g2, v))},${Math.round(mix(b1, b2, v))})`;
};

export function FitOrNot(props: Partial<FitOrNotProps>) {
  const c = { ...fitOrNotDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 8);
  const n = Math.max(1, items.length);

  // 尺寸：按项数与最长文字自适应。终态 = 表头一行 + 两列卡片，整体垂直居中
  const nFit = items.filter((x) => x.fit).length, nUn = n - nFit;
  const colRows = Math.max(nFit, nUn, 1);
  const longest = Math.max(...items.map((x) => textWidth(x.text, 1)), 1);
  const headSize = Math.min(64, 800 / Math.max(1, textWidth(c.fitLabel, 1), textWidth(c.unfitLabel, 1)));
  const headW = (s: string) => textWidth(s, headSize) + headSize * 1.7;
  const headH = headSize * 1.9;
  const rowGap = 26, headGap = 52;
  const slotH = Math.min(148, (900 - headH - headGap - (colRows - 1) * rowGap) / colRows);
  const total = headH + headGap + colRows * slotH + (colRows - 1) * rowGap;
  const headY = (1080 - total) / 2;
  const colTop = headY + headH + headGap;
  const fsEnd = Math.min(66, slotH * 0.46, (COL_W_MAX - 110) / longest);
  const wEnd = longest * fsEnd + fsEnd * 2.4;
  // 起始：中间一摞，放在表头下方
  const gap = n > 6 ? 12 : 16;
  const cardH = Math.min(96, (1030 - colTop - (n - 1) * gap) / n);
  const size = Math.min(54, cardH * 0.52, 900 / longest);
  const wStart = longest * size + size * 2.4;
  const stackTop = colTop + (1030 - colTop - (n * cardH + (n - 1) * gap)) / 2;

  const enter = p(t, 0, 0.5);
  const head = p(t, 0.1, 0.55);
  const step = Math.min(0.48, 2.5 / n);
  const at = (i: number) => cueAt(c.cues, i, 1.0 + i * step);
  const dur = 0.55;

  let fi = 0, ui = 0;
  const vs = items.map((_, i) => p(t, at(i), at(i) + dur));
  const cards = items.map((it, i) => {
    const k = it.fit ? fi++ : ui++;
    const v = vs[i];
    // 中间一摞从上往下被取走，剩下的原地不动：列从上往下长，始终在剩余卡片的上方
    const sx = 960, sy = stackTop + i * (cardH + gap) + cardH / 2;
    const tx = it.fit ? COL_L : COL_R, ty = colTop + k * (slotH + rowGap) + slotH / 2;
    const x = mix(sx, tx, v), y = mix(sy, ty, v);
    const h = mix(cardH, slotH, v);
    const flip = it.fit ? clamp((v - 0.55) / 0.35) : 0;
    const appear = p(t, 0.04 * i, 0.04 * i + 0.45);
    const fs = mix(size, fsEnd, v);
    const w = mix(wStart, wEnd, v);
    const hl = it.fit && c.highlight && it.text.includes(c.highlight) ? c.highlight : '';
    const [pre, post = ''] = hl ? it.text.split(hl) : [it.text];
    return <div key={i} style={{
      position: 'absolute', left: x - w / 2, top: y - h / 2 + (1 - appear) * 30, width: w, height: h,
      borderRadius: S.radius, background: mixColor('#ffffff', S.dark, flip), boxShadow: it.fit && flip > 0.5 ? S.capsuleShadow : S.shadow,
      display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appear * enter,
      transform: `scale(${1 + 0.04 * Math.sin(Math.PI * v)})`, zIndex: v > 0 && v < 1 ? 20 : 10,
    }}>
      <span style={{ ...textBase(fs, 900), color: flip > 0.5 ? '#fff' : S.ink }}>
        {pre}{hl && <span style={{ color: flip > 0.5 ? S.accentDark : S.ink }}>{hl}</span>}{post}
      </span>
    </div>;
  });

  const lastAt = at(n - 1) + dur;
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <Pill box={{ x: COL_L - headW(c.fitLabel) / 2, y: headY + (1 - head) * 24, w: headW(c.fitLabel), h: headH }} style={{ opacity: head }}>
        <span style={{ ...textBase(headSize, 400, S.display), color: '#fff' }}>{c.fitLabel}</span>
      </Pill>
      <Pill dark={false} box={{ x: COL_R - headW(c.unfitLabel) / 2, y: headY + (1 - head) * 24, w: headW(c.unfitLabel), h: headH }} shadow={S.shadow} style={{ opacity: head }}>
        <span style={{ ...textBase(headSize, 400, S.display), color: S.ink }}>{c.unfitLabel}</span>
      </Pill>
      {cards}
    </Handoff>
    <Sfx name="pop" at={0.05} />
    <Sfx name="whoosh-short" at={at(0)} />
    <Sfx name="ding" at={lastAt} />
  </Frame>;
}
