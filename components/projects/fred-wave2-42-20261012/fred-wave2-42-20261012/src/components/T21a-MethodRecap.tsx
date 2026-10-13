// T21a-MethodRecap：方法总结收尾
// 观众要看懂的变化：本期几条方法 → 收成一句话
// 关系：几条方法先列出来，每条里的关键词是一枚小黑块；收尾时整行说明退后散去，
// 只剩关键词飞到同一行，补上连接字，拼成一句话落在大黑胶囊里。不是“几项汇聚成胶囊”：读者看到的是“每条只留下这个词”。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type MethodItem = { text: string; key: string };   // key 必须是 text 里的一段，也必须出现在 sentence 里
export type MethodRecapProps = HandoffProps & {
  items: MethodItem[];   // 2–4 条
  sentence: string;      // 收成的一句话（按顺序包含每条的 key）
  highlight: string;     // sentence 里染紫的一段（黑胶囊上 #D6BEFF）；'' 不染
  cues?: number[];       // [0]=开始收（默认 2.1s）；[1..n]=第 i 条出现（默认快速依次）
};

export const methodRecapDefaults: MethodRecapProps = {
  items: [
    { text: '项目规则写成文件，别每次口头交代', key: '写成文件' },
    { text: '大改动先让它出计划，你确认再动手', key: '出计划' },
    { text: '改完让它自己跑测试，过了才提交', key: '跑测试' },
  ],
  sentence: '写成文件，先出计划，再跑测试',
  highlight: '跑测试',
};

const ROW_H = 150;
// 锐字真言的拉丁字母比 MiSans 宽，关键词定位用单独的估宽
const dispWidth = (s: string, size: number) =>
  Array.from(s).reduce((w, ch) => w + (/[\u0000-\u00ff]/.test(ch) ? 0.68 : 1) * size, 0);
const ROW_GAP = 36;

type Seg = { s: string; key: number };   // key=-1 表示连接字

export function MethodRecap(props: Partial<MethodRecapProps>) {
  const c = { ...methodRecapDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 4);
  const n = Math.max(1, items.length);

  const gatherAt = cueAt(c.cues, 0, 2.1);
  const itemAt = (i: number) => cueAt(c.cues, i + 1, 0.05 + i * 0.32);

  // ---- 方法列表（逐条）：字号按最长一行算
  const longest = Math.max(...items.map((it) => textWidth(it.text, 1) + (it.text.includes(it.key) ? dispWidth(it.key, 1) - textWidth(it.key, 1) : dispWidth(it.key, 1) + 0.4)), 1);
  const lineSize = Math.min(70, 1480 / longest);
  const chipPad = lineSize * 0.36;
  const lineW = longest * lineSize + chipPad * 2 + lineSize * 2;
  const lineX = 960 - lineW / 2;
  const listH = n * ROW_H + (n - 1) * ROW_GAP;
  const listTop = 540 - listH / 2;

  // ---- 一句话：拆成 关键词 / 连接字
  const segs: Seg[] = [];
  let rest = c.sentence;
  items.forEach((it, i) => {
    const k = rest.indexOf(it.key);
    if (k < 0) return;
    if (k > 0) segs.push({ s: rest.slice(0, k), key: -1 });
    segs.push({ s: it.key, key: i });
    rest = rest.slice(k + it.key.length);
  });
  if (rest) segs.push({ s: rest, key: -1 });
  const senSize = Math.min(124, 1560 / Math.max(1, dispWidth(c.sentence, 1) + 1.6));
  const senW = dispWidth(c.sentence, senSize);
  const pillW = senW + senSize * 1.6, pillH = senSize * 1.9;
  const senX = 960 - senW / 2;
  const hlStart = c.highlight ? c.sentence.indexOf(c.highlight) : -1;
  const hlEnd = hlStart >= 0 ? hlStart + c.highlight.length : -1;

  // ---- 时间
  const recede = q(t, gatherAt, gatherAt + 0.45);                // 说明文字退后
  const fly = (i: number) => q(t, gatherAt + 0.15 + i * 0.08, gatherAt + 0.85 + i * 0.08);
  const pill = p(t, gatherAt + 0.45, gatherAt + 1.0);
  const glue = p(t, gatherAt + 0.85, gatherAt + 1.25);

  // 按句中位置给字上色（紫色只给 highlight）
  const colored = (s: string, offset: number, base: string) => {
    if (hlStart < 0 || offset + s.length <= hlStart || offset >= hlEnd) return <span style={{ color: base }}>{s}</span>;
    const a = Math.max(0, hlStart - offset), b = Math.min(s.length, hlEnd - offset);
    return <>
      <span style={{ color: base }}>{s.slice(0, a)}</span>
      <span style={{ color: S.accentDark }}>{s.slice(a, b)}</span>
      <span style={{ color: base }}>{s.slice(b)}</span>
    </>;
  };

  let off = 0;
  const senPos = segs.map((sg) => { const x = senX + dispWidth(c.sentence.slice(0, off), senSize); const o = off; off += sg.s.length; return { x, o }; });

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 方法行：白卡 + 说明文字；收尾时退后（缩小、失焦、淡出） */}
      {items.map((it, i) => {
        const v = p(t, itemAt(i), itemAt(i) + 0.4);
        const y = listTop + i * (ROW_H + ROW_GAP);
        const k = it.text.indexOf(it.key);
        const before = k >= 0 ? it.text.slice(0, k) : it.text, after = k >= 0 ? it.text.slice(k + it.key.length) : '';
        const bx = lineX + lineSize * 0.8;
        const kx = bx + textWidth(before, lineSize) + (k < 0 ? lineSize * 0.4 : 0);   // 找不到 key 时，关键词块接在整句后面
        const ax = kx + dispWidth(it.key, lineSize) + chipPad * 2;
        return <div key={i} style={{ position: 'absolute', left: lineX, top: y + (1 - v) * 40, width: lineW, height: ROW_H, borderRadius: S.radius, background: '#fff',
          boxShadow: S.shadow, opacity: v * (1 - recede), transform: `scale(${mix(1, 0.94, recede)})`, filter: recede > 0 ? `blur(${recede * 14}px)` : undefined }}>
          <span style={{ ...textBase(lineSize, 500), position: 'absolute', left: bx - lineX, top: (ROW_H - lineSize * 1.16) / 2, color: S.ink }}>{before}</span>
          {k >= 0 && <span style={{ ...textBase(lineSize, 500), position: 'absolute', left: ax - lineX, top: (ROW_H - lineSize * 1.16) / 2, color: S.ink }}>{after}</span>}
        </div>;
      })}
      {/* 大胶囊在关键词飞到之前从中间展开 */}
      <div style={{ position: 'absolute', left: 960 - pillW / 2 * mix(0.3, 1, pill), top: 540 - pillH / 2, width: pillW * mix(0.3, 1, pill), height: pillH,
        borderRadius: pillH / 2, background: S.dark, boxShadow: S.capsuleShadow, opacity: clamp(pill * 2) }} />
      {/* 关键词：从各自行里的位置飞到句子里 */}
      {segs.map((sg, si) => {
        const pos = senPos[si];
        if (sg.key < 0) {
          return <span key={si} style={{ ...textBase(senSize, 400, S.display), position: 'absolute', left: pos.x, top: 540 - senSize * 0.58, opacity: glue,
            transform: `translateY(${(1 - glue) * 14}px)` }}>{colored(sg.s, pos.o, '#fff')}</span>;
        }
        const i = sg.key, it = items[i];
        const v = p(t, itemAt(i), itemAt(i) + 0.4);
        const y0 = listTop + i * (ROW_H + ROW_GAP) + ROW_H / 2;
        const k = it.text.indexOf(it.key);
        const kx = lineX + lineSize * 0.8 + (k >= 0 ? textWidth(it.text.slice(0, k), lineSize) : textWidth(it.text, lineSize) + lineSize * 0.4) + chipPad;
        const f = fly(i);
        const size = mix(lineSize, senSize, f);
        const x = mix(kx, pos.x, f), cy = mix(y0 + (1 - v) * 40, 540, f);
        const chip = 1 - clamp((f - 0.55) / 0.35);       // 飞进大胶囊后，小黑块的底消失
        const cw = dispWidth(sg.s, size);
        return <div key={si} style={{ position: 'absolute', left: x - chipPad * chip, top: cy - size * 0.58 - chipPad * 0.55 * chip, opacity: v,
          padding: `${chipPad * 0.55 * chip}px ${chipPad * chip}px`, borderRadius: 14 + 10 * chip, background: chip > 0 ? `rgba(25,25,28,${chip})` : 'transparent',
          boxShadow: chip > 0.5 ? S.shadow : 'none', width: cw + chipPad * 2 * chip, boxSizing: 'border-box' }}>
          <span style={{ ...textBase(size, 400, S.display) }}>{colored(sg.s, pos.o, '#fff')}</span>
        </div>;
      })}
    </Handoff>
    <Sfx name="pop" at={itemAt(0)} />
    <Sfx name="gather" at={gatherAt + 0.15} />
    <Sfx name="ding" at={gatherAt + 1.0} />
  </Frame>;
}
