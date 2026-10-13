// T16a-Timeline：时间线
// 观众要看懂的变化：一条时间轴 → 节点依次点亮，当前节点展开说明
// 动作：浅底轨先铺开 → 粗墨线从左往右推进，经过一个节点，节点圆点落下点亮（日期大字在上、事件在下）
//   → 当前节点：整条轴上移让位、其余退淡，这颗圆点离开轴、一路变形长成居中的黑卡（同一个对象：圆 → 圆角卡），卡里写日期、事件和说明。
// 返修（Fred：“有点丑”）：细线 + 小灰字 → 14px 粗墨线、圆点落定回弹；日期 Heavy 大字 / 事件 Medium 小一档，字阶拉开；
//   当前节点不再在右下角挂白卡，而是长成画面正中的黑卡，终态构图居中、上下留白均衡、关键内容 y ≤ 880。
// 和 T16b（叠盖版本卡）区分：这里是“轴”，对象是节点，展开是节点自己长成卡。
// 默认内容：FredTalk 近期真实期号时间线（期号与选题名取自 00_每期项目 的文件夹名）。展开卡的说明文字是示例写法，换 detail 即可。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type TimelineNode = { date: string; title: string; detail?: string };
export type TimelineProps = HandoffProps & {
  nodes: TimelineNode[];   // 3–6 个，按时间先后
  focus?: number;          // 最后展开哪个节点（从 0 起），默认最后一个
  cues?: number[];         // [i]=第 i 个节点点亮；[n]=展开说明
};

export const timelineDefaults: TimelineProps = {
  nodes: [
    { date: '105 期', title: 'Codex 更新全教程' },
    { date: '107 期', title: 'OpenAI Dev Day' },
    { date: '108 期', title: 'Codex 视频制作日常' },
    { date: '110 期', title: '3D 运镜组件库' },
    { date: '112 期', title: 'API 是什么' },
    { date: '114 期', title: 'GitHub', detail: '把项目放上 GitHub，每次改动都有记录，随时能回到上一版' },
  ],
};

const tw = (s: string, f: number) => Array.from(s).reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.66 : /[\u0000-ÿ]/.test(ch) ? 0.58 : 1) * f, 0);

// 按宽度折行：拉丁词整体不拆，中文逐字
function wrap(text: string, size: number, width: number): string[] {
  const tokens = text.match(/[A-Za-z0-9.\-_/+#']+|\s+|./gu) ?? [];
  const lines: string[] = [''];
  for (const tk of tokens) {
    const cur = lines[lines.length - 1];
    const punct = /^[，。、；：！？,.;:!?）)]$/.test(tk);   // 标点不放行首
    if (cur && !punct && tw(cur + tk, size) > width) lines.push(tk.trim() ? tk : '');
    else lines[lines.length - 1] = cur + tk;
  }
  return lines.map((l) => l.trim()).filter(Boolean);
}

// 平衡折行：行数不变的前提下把每行收窄到接近平均，避免“更新全/教程”这类断头
function balanced(text: string, size: number, width: number): string[] {
  const k = wrap(text, size, width).length;
  if (k <= 1) return [text.trim()];
  for (let w = tw(text, size) / k; w <= width; w += size * 0.25) {
    const lines = wrap(text, size, w);
    if (lines.length === k) return lines;
  }
  return wrap(text, size, width);
}

// 事件名两行折法：优先在空格 / 中英交界处断，其次取两行最均衡处（不拆英文单词）
function split2(text: string, size: number, width: number): string[] {
  if (tw(text, size) <= width) return [text];
  const ch = Array.from(text);
  let best = -1, cost = Infinity;
  for (let i = 1; i < ch.length; i++) {
    if (/[A-Za-z0-9]/.test(ch[i - 1]) && /[A-Za-z0-9]/.test(ch[i])) continue;
    if (/^[，。、；：！？,.;:!?）)]$/.test(ch[i])) continue;
    const a = ch.slice(0, i).join('').trim(), b = ch.slice(i).join('').trim();
    const w = Math.max(tw(a, size), tw(b, size));
    if (w > width) continue;
    const nice = ch[i - 1] === ' ' || ch[i] === ' ' || /[，、,]/.test(ch[i - 1]) ? 0.72 : /[A-Za-z0-9]/.test(ch[i - 1]) !== /[A-Za-z0-9]/.test(ch[i]) ? 0.85 : 1;
    if (w * nice < cost) { cost = w * nice; best = i; }
  }
  return best < 0 ? wrap(text, size, width) : [ch.slice(0, best).join('').trim(), ch.slice(best).join('').trim()];
}

const AX0 = 150, AX1 = 1770;   // 轴两端
const LINE = 14;               // 轴粗
const DOT = 36;

export function Timeline(props: Partial<TimelineProps>) {
  const c = { ...timelineDefaults, ...props };
  const t = useT();
  const nodes = c.nodes.slice(0, 6);
  const n = Math.max(1, nodes.length);
  const fi = clamp(Math.round(c.focus ?? n - 1), 0, n - 1);

  // ---------- 终态版式 ----------
  const sp = (AX1 - AX0) / n;
  const nx = (i: number) => AX0 + (i + 0.5) * sp;
  const labW = sp - 30;
  const dateSize = Math.min(60, labW / Math.max(1, ...nodes.map((x) => tw(x.date, 1))));
  let evSize = 36;
  for (; evSize > 26; evSize -= 1) if (nodes.every((x) => split2(x.title, evSize, labW).length <= 2)) break;
  const evLines = nodes.map((x) => split2(x.title, evSize, labW));
  const evH = Math.max(...evLines.map((l) => l.length)) * evSize * 1.25;
  const dateGap = 30, evGap = 34;
  const aboveH = dateSize * 1.16 + dateGap;
  const belowH = evGap + evH;

  // 聚焦卡（终态居中）
  const fNode = nodes[fi];
  const tSize = Math.min(76, 1100 / Math.max(1, tw(fNode.title, 1)));
  // 卡宽贴合内容：说明按每行 ≤1000px 估行数，再与标题宽度取大
  let dSize = 40;
  const dNat = fNode.detail ? tw(fNode.detail, dSize) : 0;
  const dRows = Math.max(1, Math.ceil(dNat / 1000));
  const inner = Math.round(clamp(Math.max(tw(fNode.title, tSize), fNode.detail ? (dNat / dRows) * 1.08 : 0, 520), 520, 1100));
  const cardW = inner + 140;
  let dLines = fNode.detail ? balanced(fNode.detail, dSize, inner) : [];
  while (dLines.length > 3 && dSize > 30) { dSize -= 2; dLines = balanced(fNode.detail!, dSize, inner); }
  const pillSize = Math.min(40, dateSize * 0.8);
  const pillH = Math.round(pillSize * 1.7);
  const cardH = Math.round(54 + pillH + 22 + tSize * 1.2 + (dLines.length ? 18 + dLines.length * dSize * 1.42 : 0) + 54);

  // 轴的两个位置：建立时整组垂直居中；聚焦后上移，给卡让出下方
  const AY0 = 540 - (belowH - aboveH) / 2;
  const top2 = 196;
  const AY2 = top2 + aboveH;
  const cardY = Math.min(880 - cardH, AY2 + belowH + 64);
  const cardX = 960 - cardW / 2;

  // ---------- 时间线 ----------
  const step = Math.min(0.55, 2.5 / n);
  const at = nodes.map((_, i) => cueAt(c.cues, i, 0.4 + i * step));
  const F = cueAt(c.cues, n, at[n - 1] + 0.75);
  const track = p(t, 0.02, 0.45);
  // 墨线头：在相邻节点之间推进；第一个节点之前从轴头出发
  const headX = (() => {
    if (t <= at[0]) return mix(AX0, nx(0), p(t, at[0] - 0.3, at[0]));
    for (let i = 0; i < n - 1; i++) if (t < at[i + 1]) return mix(nx(i), nx(i + 1), q(t, at[i], at[i + 1]));
    return mix(nx(n - 1), AX1, p(t, at[n - 1], at[n - 1] + 0.5));
  })();
  const shift = q(t, F, F + 0.6);
  const AY = mix(AY0, AY2, shift);
  const travel = q(t, F + 0.12, F + 0.82);
  const content = p(t, F + 0.7, F + 1.1);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 底轨（极淡）+ 墨线 */}
      <div style={{ position: 'absolute', left: AX0, top: AY - LINE / 2, width: (AX1 - AX0) * track, height: LINE, borderRadius: LINE / 2, background: S.ink, opacity: 0.08 }} />
      <div style={{ position: 'absolute', left: AX0, top: AY - LINE / 2, width: Math.max(0, headX - AX0), height: LINE, borderRadius: LINE / 2, background: S.ink, opacity: track }} />

      {nodes.map((nd, i) => {
        const land = springAt(t, at[i], 0.6);
        const shown = t >= at[i];
        const isF = i === fi;
        const dim = isF ? 0 : shift;
        const lab = p(t, at[i] + 0.05, at[i] + 0.45);
        const x = nx(i);
        return <React.Fragment key={i}>
          {/* 日期：Heavy 大字 */}
          <div style={{
            ...textBase(dateSize, 900), position: 'absolute', left: x - labW / 2, width: labW, textAlign: 'center',
            top: AY - LINE / 2 - dateGap - dateSize * 1.16 + (1 - lab) * 18, opacity: lab * mix(1, 0.35, dim),
            color: isF && shift > 0.5 ? S.accent : S.ink,
          }}>{nd.date}</div>
          {/* 事件：Medium 小一档 */}
          <div style={{
            position: 'absolute', left: x - labW / 2, width: labW, top: AY + LINE / 2 + evGap - 8 - (1 - lab) * 14, opacity: lab * mix(1, 0.35, dim),
          }}>{evLines[i].map((l, k) => <div key={k} style={{ ...textBase(evSize, 500), lineHeight: 1.25, textAlign: 'center', color: '#3a3a40' }}>{l}</div>)}</div>
          {/* 圆点：从上方落到轴上，回弹一次 */}
          {shown && <div style={{
            position: 'absolute', left: x - DOT / 2, top: AY - DOT / 2 - (1 - clamp(land)) * 24, width: DOT, height: DOT, borderRadius: DOT / 2,
            background: isF && shift > 0 ? S.accent : S.ink, border: '6px solid #fff', boxSizing: 'border-box', boxShadow: '0 4px 10px #0003',
            transform: `scale(${mix(0, 1, land) * (isF ? mix(1, 1.25, shift) : 1)})`, opacity: mix(1, 0.45, dim),
          }} />}
        </React.Fragment>;
      })}

      {/* 当前节点：同一颗圆点离开轴，长成居中的黑卡 */}
      {t >= F + 0.12 && (() => {
        const fx = nx(fi), fy = AY;
        const w = mix(DOT, cardW, travel), h = mix(DOT, cardH, travel);
        const cx = mix(fx, 960, travel), cy = mix(fy, cardY + cardH / 2, travel);
        return <div style={{
          position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: mix(DOT / 2, S.radius + 8, clamp(travel * 1.6)),
          background: S.dark, boxShadow: S.capsuleShadow, overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', left: 70, top: 54, width: inner, opacity: content, transform: `translateY(${(1 - content) * 18}px)` }}>
            <div style={{ display: 'inline-flex', height: pillH, padding: `0 ${pillSize * 0.7}px`, borderRadius: pillH / 2, background: accentOn(true), alignItems: 'center' }}>
              <span style={{ ...textBase(pillSize, 900), color: S.ink, lineHeight: 1 }}>{fNode.date}</span>
            </div>
            <div style={{ ...textBase(tSize, 900), color: '#fff', marginTop: 22, lineHeight: 1.2 }}>{fNode.title}</div>
            {dLines.length > 0 && <div style={{ marginTop: 18 }}>{dLines.map((l, k) => <div key={k} style={{ ...textBase(dSize, 500), color: '#fff', opacity: 0.88, lineHeight: 1.42 }}>{l}</div>)}</div>}
          </div>
        </div>;
      })()}
    </Handoff>
    <Sfx name="whoosh-short" at={0.02} />
    {at.map((a, i) => <Sfx key={i} name="pop" at={a} volume={0.4} />)}
    <Sfx name="slide" at={F} />
    <Sfx name="ding" at={F + 0.82} />
  </Frame>;
}
