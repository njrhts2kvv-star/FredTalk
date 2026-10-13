// T14b-SpecLand：单项参数落定
// 观众要看懂的变化：一个参数名 → 数值落定并标出含义
// 关系：居中黑色圆角卡里，参数名先占住卡心（观众先知道“在说哪一项”）→ 参数名让位缩成卡内上方小标签 → 数值像盖章一样一次压到位（不滚动）
//       → 卡下方用一句话刷出这个数是什么意思，关键词染紫。和 T14c（逐位滚动＋旧价划掉＋差额胶囊）不是同一动作。
// 返修（Fred：“很奇怪，很丑”）：不再是左对齐裸数字＋悬浮上标，改为黑卡容器、货币符号/单位与数字同基线小一号、整组居中；可选失焦背景截图作上下文。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth, wipe } from '../kit/theme';
import { Img, staticFile } from 'remotion';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type SpecLandProps = HandoffProps & {
  label: string;         // 参数名（例：GPT-6.1 Sol 缓存输入价）
  value: number;         // 数值
  decimals: number;      // 小数位
  prefix: string;        // 数值前缀（货币符号等），可为空
  suffix: string;        // 紧贴数值的后缀（%、x、ms 等），可为空
  unit: string;          // 数值右侧的小号单位（例：/ 百万 token），可为空
  meaning: string;       // 这个数意味着什么（一句话）
  highlight?: string;    // meaning 里染紫的关键词，只强调一处
  background?: string | null;   // 失焦退后的上下文截图（public 下路径），null 关闭
  cues?: number[];       // [0]=数值落定，[1]=含义刷出（秒，场景内）
};

// 真实定价：GPT-6.1 Sol 缓存输入 $0.10、标准输入 $2.00（ep107 models.png），0.10 / 2.00 = 1/20
export const specLandDefaults: SpecLandProps = {
  label: 'GPT-6.1 Sol 缓存输入价',
  value: 0.1,
  decimals: 2,
  prefix: '$',
  suffix: '',
  unit: '/ 百万 token',
  meaning: '只要正常输入价的 1/20',
  highlight: '1/20',
  background: 'media/m-models-pricing.png',
};

const fmt = (v: number, d: number) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
// 等宽数字格：数字 0.6em，标点 0.3em，保证同组数字对齐、不因字形宽度跳动
const glyph = (ch: string) => (/\d/.test(ch) ? 0.6 : /[.,:]/.test(ch) ? 0.3 : ch === '%' ? 0.86 : ch === ' ' ? 0.28 : /[\u0000-ÿ]/.test(ch) ? 0.62 : 1);
const numWidth = (s: string, size: number) => Array.from(s).reduce((w, ch) => w + glyph(ch) * size, 0);
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixColor = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], t))).join(',')})`; };

const MAX_W = 1500;      // 卡与含义句的最大宽
const PAD_X = 120;       // 卡内左右留白

export function SpecLand(props: Partial<SpecLandProps>) {
  const c = { ...specLandDefaults, ...props };
  const t = useT();
  const landAt = cueAt(c.cues, 0, 0.95);
  const meanAt = cueAt(c.cues, 1, landAt + 1.0);

  // —— 数值行：货币符号 / 数字 / 后缀 / 单位 同基线，符号与单位小一号 ——
  const numText = fmt(c.value, c.decimals) + c.suffix;
  const preRatio = 0.56, unitRatio = 0.34;
  const rowW = (size: number) => (c.prefix ? numWidth(c.prefix, size * preRatio) + size * 0.06 : 0) + numWidth(numText, size)
    + (c.unit ? textWidth(c.unit, size * unitRatio) + size * 0.14 : 0);
  const innerMax = MAX_W - 2 * PAD_X;
  let size = 300;
  while (size > 110 && rowW(size) > innerMax) size -= 4;
  const unitSize = size * unitRatio;
  const valueW = rowW(size);

  // 标签：卡内上方小字；开场在卡心放大
  const labelEnd = Math.max(34, Math.min(50, innerMax / Math.max(1, textWidth(c.label, 1))));
  const labelStart = Math.max(labelEnd, Math.min(100, (MAX_W - 2 * 80) / Math.max(1, textWidth(c.label, 1))));
  const labelEndW = textWidth(c.label, labelEnd);

  // 卡尺寸
  const cardW = Math.min(MAX_W, Math.max(1000, valueW, labelEndW) + 2 * PAD_X);
  const labelH = labelEnd * 1.16;
  const valueH = size * 1.0;
  const cardPadTop = 56, cardGap = 18, cardPadBot = 70;
  const cardH = Math.max(cardPadTop + labelH + cardGap + valueH + cardPadBot, 2 * labelStart * 1.16 + 120);

  // 含义：一行放得下就一行（≤76），否则 52 并折行（居中）
  let mSize = Math.min(76, MAX_W / Math.max(1, textWidth(c.meaning, 1)));
  const wrap = mSize < 46;
  if (wrap) mSize = 52;
  const mLines = wrap ? Math.ceil(textWidth(c.meaning, mSize) / MAX_W) : 1;
  const meaningH = mSize * 1.32 * mLines;
  const meanGap = 56;

  const groupH = cardH + meanGap + meaningH;
  const cardTop = (1080 - groupH) / 2 + 14;
  const cardLeft = (1920 - cardW) / 2;
  const meanTop = cardTop + cardH + meanGap;

  // —— 时间线 ——
  const intro = p(t, 0, 0.42);                       // 卡与参数名 0.3 秒内可辨认
  const yield_ = q(t, landAt - 0.6, landAt - 0.1);   // 参数名让位：变小、上移、退为卡内标签
  const stamp = p(t, landAt - 0.22, landAt + 0.12);  // 数值从放大+虚化压到位
  const settle = springAt(t, landAt + 0.08, 0.55);
  const reveal = wipe(t, meanAt, meanAt + 0.55);
  const keyOn = p(t, meanAt + 0.4, meanAt + 0.75);

  const lSize = mix(labelStart, labelEnd, yield_);
  const labelTopEnd = cardPadTop;
  const labelTopStart = cardH / 2 - lSize * 0.58;
  const lTop = mix(labelTopStart, labelTopEnd, yield_);
  const lColor = mixColor('#ffffff', S.faint, yield_);

  const [mBefore, mAfter] = c.highlight && c.meaning.includes(c.highlight)
    ? [c.meaning.slice(0, c.meaning.indexOf(c.highlight)), c.meaning.slice(c.meaning.indexOf(c.highlight) + c.highlight.length)]
    : [c.meaning, ''];
  const hasKey = !!c.highlight && c.meaning.includes(c.highlight);

  const vScale = mix(1.16, 1, stamp) * (1 + (1 - settle) * 0.025);
  const bgOn = !!c.background;
  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {bgOn && <>
        <Img src={staticFile(c.background!)} style={{ position: 'absolute', left: -40, top: -40, width: 2000, height: 1160, objectFit: 'cover', filter: 'blur(16px)', opacity: intro }} />
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.86 * intro }} />
      </>}

      {/* 黑色圆角卡 */}
      <div style={{
        position: 'absolute', left: cardLeft, top: cardTop + (1 - intro) * 36, width: cardW, height: cardH, borderRadius: S.radius,
        background: S.dark, boxShadow: S.capsuleShadow, opacity: clamp(intro * 2),
        transform: `scale(${mix(0.94, 1, intro)})`, transformOrigin: '50% 50%', overflow: 'hidden',
      }}>
        {/* 参数名：卡心大字 → 卡内上方小标签（居中） */}
        <div style={{ position: 'absolute', left: 0, width: cardW, textAlign: 'center', top: lTop, ...textBase(lSize, 500), color: lColor, opacity: intro }}>{c.label}</div>

        {/* 数值：一次压到位，不滚动；符号/单位与数字同基线 */}
        <div style={{
          position: 'absolute', left: (cardW - valueW) / 2, top: cardPadTop + labelH + cardGap, width: valueW, height: valueH,
          display: 'flex', alignItems: 'baseline', justifyContent: 'center', lineHeight: 1,
          opacity: clamp(stamp * 1.6), filter: `blur(${(1 - stamp) * 14}px)`, transform: `scale(${vScale})`, transformOrigin: '50% 60%',
        }}>
          {c.prefix && <span style={{ ...textBase(size * preRatio, 900), lineHeight: 1, color: '#fff', marginRight: size * 0.06 }}>{c.prefix}</span>}
          <span style={{ ...textBase(size, 900), lineHeight: 1, display: 'inline-flex', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {Array.from(numText).map((ch, i) => <span key={i} style={{ display: 'inline-block', width: glyph(ch) * size, textAlign: 'center' }}>{ch}</span>)}
          </span>
          {c.unit && <span style={{ ...textBase(unitSize, 500), lineHeight: 1, color: '#fff', marginLeft: size * 0.14 }}>{c.unit}</span>}
        </div>
      </div>

      {/* 含义：卡下方居中，从左往右刷出，关键词稍后染紫 */}
      <div style={{
        position: 'absolute', left: (1920 - MAX_W) / 2, top: meanTop, width: MAX_W, textAlign: 'center',
        ...textBase(mSize, 500), whiteSpace: wrap ? 'normal' : 'nowrap', lineHeight: 1.32, color: S.ink,
        clipPath: `inset(-10px ${(1 - reveal) * 100}% -10px -10px)`, visibility: reveal <= 0 ? 'hidden' : 'visible',
      }}>
        {mBefore}{hasKey && <span style={{ fontWeight: 900, color: mixColor(S.ink, S.accent, keyOn) }}>{c.highlight}</span>}{mAfter}
      </div>
    </Handoff>
    <Sfx name="pop" at={0} />
    <Sfx name="ding" at={landAt + 0.08} duration={90} />
    <Sfx name="whoosh-short" at={meanAt} />
  </Frame>;
}
