// T21b-QAResolve：问题逐个被回答（收尾，和 T08e 首尾呼应）
// 观众要看懂的变化：几个问题胶囊 → 依次被答案接上，问号变对勾
// 动作：开场是和 T08e 同样外观的黑胶囊问题（锐字真言、深底紫问号），每个胶囊各占一行、居中；
//       轮到哪一问，这个问题胶囊就向左让位（右沿对齐到中线左侧），白底答案胶囊从它背后向右抽出（同一进度驱动，
//       motion-craft §3）；抽出过半时，问号原位翻转成紫色对勾。全部答完后整组停稳。
// 与库内区分：T21a 是几条方法收成一句话；T12b 是序号方块抽出名字；这里是“问题 → 答案”逐行接上并打勾。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, abs, textBase, useT } from '../kit/ui';

export type QAItem = {
  question: string;    // 问题（句尾问号会翻成对勾；没写问号也会留出对勾位）
  answer: string;      // 答案，1–2 行自动折行（也可用 \n 指定断行）
  highlight?: string;  // 答案里染紫的词（白底上用 #8554E8），留空不强调
};
export type QAResolveProps = HandoffProps & {
  items: QAItem[];     // 2–4 组
  cues?: number[];     // [i]=第 i 个问题被回答（让位 + 抽出答案）；不传用默认节奏
};

// 默认内容：第 114 期 S20“回到评论区那几个问题。地址在哪？左上角。怎么下载？有软件去 Releases，只有代码就 clone。
// 能不能帮忙部署？授权好 GitHub CLI，把地址交给 Codex 就行。”
export const qAResolveDefaults: QAResolveProps = {
  items: [
    { question: '地址在哪？', answer: '左上角：用户名 / 项目名', highlight: '左上角' },
    { question: '怎么下载？', answer: '有软件去 Releases，只有代码就 clone', highlight: 'Releases' },
    { question: '能不能帮我部署？', answer: '授权好 GitHub CLI，把地址交给 Codex', highlight: 'Codex' },
  ],
};

// 比 kit textWidth 稍保守：大写拉丁字母按 0.68 估（MiSans Heavy 大写偏宽）
const tw = (s: string, size: number) =>
  Array.from(s).reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.68 : /[\u0000-ÿ]/.test(ch) ? 0.58 : 1) * size, 0);

// 两行均衡断开：拉丁词不拆，优先在标点后断，行首不放标点
function splitTwo(s: string): string[] {
  if (s.includes('\n')) return s.split('\n').slice(0, 2).map((l) => l.trim());
  const tokens = s.match(/[A-Za-z0-9.\-_/+#]+|\s+|./gu) ?? [s];
  const total = tw(s, 1);
  let best = 1, bestScore = Infinity, acc = 0;
  for (let i = 1; i < tokens.length; i++) {
    acc += tw(tokens[i - 1], 1);
    if (/^[，,、。：:；;！!？?]$/.test(tokens[i])) continue;
    const soft = /^[，,、：:；;]$/.test(tokens[i - 1]) ? -2.2 : /^\s+$/.test(tokens[i - 1]) ? -0.4 : 0;
    const score = Math.abs(acc - total / 2) + soft;
    if (score < bestScore) { bestScore = score; best = i; }
  }
  return [tokens.slice(0, best).join('').trim(), tokens.slice(best).join('').trim()];
}

function Marked({ text, hl }: { text: string; hl?: string }) {
  const k = hl ? text.indexOf(hl) : -1;
  if (!hl || k < 0) return <>{text}</>;
  return <>{text.slice(0, k)}<span style={{ color: accentOn(false) }}>{hl}</span>{text.slice(k + hl.length)}</>;
}

const AREA = 1740;    // 整组最大宽
const GAP = 34;       // 问题胶囊与答案胶囊
const ROW_GAP = 42;
const MARK = 0.95;    // 问号 / 对勾槽宽（以字号计）

export function QAResolve(props: Partial<QAResolveProps>) {
  const c = { ...qAResolveDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 4);
  const n = Math.max(1, items.length);
  const bodies = items.map((it) => it.question.trim().replace(/[？?]+$/, ''));

  // —— 版式：问题胶囊（锐字真言）右对齐到同一条竖线，答案左对齐在竖线右侧 ——
  const qUnits = Math.max(1, ...bodies.map((b) => textWidth(b, 1) + MARK));
  const qs = Math.min(n >= 4 ? 72 : 88, 760 / (qUnits + 1.2));
  const qH = qs * 1.74;
  const qW = (i: number) => (textWidth(bodies[i], 1) + MARK) * qs + qs * 1.2;
  const qColW = Math.max(...items.map((_, i) => qW(i)));
  const padA = 46;
  // 答案字号：先看一行；有一条一行放不下 ≥44 就让它折两行；所有答案共用一个字号。
  // 答案列先限宽 780（长答案折两行，整组更紧凑）；限宽后字号 < 44 再放开到全宽。
  const fitAnswers = (avail: number) => {
    const oneFit = (s: string) => (avail - padA * 2) / Math.max(1, tw(s, 1));
    const two = items.map((it) => it.answer.includes('\n') || Math.min(54, oneFit(it.answer)) < 44);
    const lines = items.map((it, i) => (two[i] ? splitTwo(it.answer) : [it.answer]));
    const size = Math.min(54, ...lines.map((ls) => Math.min(...ls.map((l) => (avail - padA * 2) / Math.max(1, tw(l, 1))))));
    return { lines, size };
  };
  let fitted = fitAnswers(Math.min(AREA - qColW - GAP, 780));
  if (fitted.size < 44) fitted = fitAnswers(AREA - qColW - GAP);
  const aLines = fitted.lines;
  const as = fitted.size;
  const aH = (i: number) => (aLines[i].length > 1 ? as * 1.3 * 2 + 52 : Math.max(qH * 0.84, as * 2));
  const aW = (i: number) => Math.max(...aLines[i].map((l) => tw(l, as))) + padA * 2;
  const rowH = (i: number) => Math.max(qH, aH(i));
  const totalH = items.reduce((h, _, i) => h + rowH(i), 0) + ROW_GAP * (n - 1);
  const groupW = qColW + GAP + Math.max(...items.map((_, i) => aW(i)));
  const spine = 960 - groupW / 2 + qColW;                 // 问题右沿 = 这条竖线
  const rowTop = (i: number) => 540 - totalH / 2 + 12 + items.slice(0, i).reduce((h, _, k) => h + rowH(k) + ROW_GAP, 0);

  // —— 时间 ——
  const enterAt = (i: number) => 0.04 + i * 0.07;
  const answerAt = (i: number) => cueAt(c.cues, i, 0.8 + i * 1.12);
  const lastCheck = answerAt(n - 1) + 0.42;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {items.map((it, i) => {
        const e = p(t, enterAt(i), enterAt(i) + 0.42);
        const a = answerAt(i);
        const s = p(t, a, a + 0.66);                       // 让位与抽出共用这一个进度
        const w = qW(i);
        const cy = rowTop(i) + rowH(i) / 2;
        const qX = mix(960 - w / 2, spine - w, s);
        const qY = cy - qH / 2;
        const ah = aH(i), aw = aW(i);
        const aY = cy - ah / 2;
        const travel = aw + GAP + w / 2;
        const aX = qX + w + GAP - (1 - s) * travel;        // 从问题胶囊中心背后出发
        const clipL = qX + w / 2;
        const flipOut = q(t, a + 0.26, a + 0.4);           // 问号翻走
        const flipIn = p(t, a + 0.4, a + 0.62);            // 对勾翻上来
        const draw = p(t, a + 0.44, a + 0.78);
        const two = aLines[i].length > 1;
        const ar = two ? Math.min(ah / 2, 60) : ah / 2;
        return <React.Fragment key={i}>
          {/* 答案：白底胶囊，裁切左边界跟着问题胶囊中心走，看起来是从它背后抽出来 */}
          {s > 0.001 && <div style={{ position: 'absolute', left: clipL, top: aY - 50, width: 1920 - clipL, height: ah + 120, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: aX - clipL, top: 50, width: aw, height: ah, borderRadius: ar, background: '#fff',
              boxShadow: S.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* 文字块整体居中（宽度估算偏保守，左右留白保持对称），块内左对齐 */}
              <div>
                {aLines[i].map((l, k) => <div key={k} style={{ ...textBase(as, 900), lineHeight: 1.3, color: S.ink }}>
                  <Marked text={l} hl={it.highlight} />
                </div>)}
              </div>
            </div>
          </div>}
          {/* 问题：黑胶囊（与 T08e 同外观） */}
          <div style={{
            ...abs({ x: qX, y: qY + (1 - e) * 36, w, h: qH }), borderRadius: qH / 2, background: S.dark, boxShadow: S.capsuleShadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(e * 3),
            transform: `scale(${mix(0.9, 1, e)})`,
          }}>
            <span style={{ ...textBase(qs, 400, S.display), color: '#fff', display: 'flex', alignItems: 'center' }}>
              {bodies[i]}
              <span style={{ position: 'relative', display: 'inline-block', width: MARK * qs, height: qs * 1.16, perspective: qs * 6 }}>
                {flipOut < 1 && it.question.trim().match(/[？?]$/) && <span style={{
                  position: 'absolute', left: 0, right: 0, textAlign: 'center', color: accentOn(true),
                  transform: `rotateX(${flipOut * 90}deg)`, transformOrigin: '50% 50%',
                }}>？</span>}
                {flipIn > 0 && <svg viewBox="0 0 100 100" width={qs * 0.86} height={qs * 0.86} style={{
                  position: 'absolute', left: (MARK * qs - qs * 0.86) / 2, top: (qs * 1.16 - qs * 0.86) / 2,
                  transform: `rotateX(${(1 - flipIn) * -90}deg)`, overflow: 'visible',
                }}>
                  <path d="M16 54 L40 77 L86 25" fill="none" stroke={accentOn(true)} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={110} strokeDashoffset={110 * (1 - draw)} />
                </svg>}
              </span>
            </span>
          </div>
        </React.Fragment>;
      })}
    </Handoff>
    <Sfx name="pop" at={0.04} />
    {items.slice(0, 3).map((_, i) => <Sfx key={i} name="slide" at={answerAt(i)} />)}
    <Sfx name="ding" at={lastCheck} />
  </Frame>;
}
