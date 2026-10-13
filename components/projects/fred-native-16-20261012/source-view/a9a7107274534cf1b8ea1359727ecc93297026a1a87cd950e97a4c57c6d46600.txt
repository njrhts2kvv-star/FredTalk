// T01d 测评阶段结论：实测作品先摆出来，随后退到毛玻璃后面，一张评分卡落下，分项打分 + 一句结论。
// 关系：真实材料（作品）→ 退后保留身份 → 前景评分卡读出判断（材料→判断）。
import React from 'react';
import { S, clamp, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Media, Sfx, textBase, useT } from '../kit/ui';

export type Dimension = { label: string; score: number };   // score: 0–10
export type VerdictCardProps = {
  media: string[];          // 1–4 张实测作品（图片或视频，public 相对路径）
  dimensions: Dimension[];  // 2–3 个维度
  verdict: string;          // 一句结论
  highlight: string;        // 结论里染紫的关键词（浅底 #8554E8）
};

export const verdictCardDefaults: VerdictCardProps = {
  media: ['media/b-work-image3.jpg', 'media/b-case-1-right.jpg', 'media/b-result-1.jpg'],
  dimensions: [
    { label: '画面质感', score: 9 },
    { label: '中文字准确', score: 7.5 },
    { label: '出图速度', score: 6 },
  ],
  verdict: '画质能打，中文字还要多试几次',
  highlight: '画质能打',
};

const CARD_W = 1180;
const PAD = 80;

function fmt(v: number, decimals: boolean) {
  return decimals ? v.toFixed(1) : String(Math.round(v));
}

export function VerdictCard(props: Partial<VerdictCardProps>) {
  const c = { ...verdictCardDefaults, ...props };
  const t = useT();
  const media = c.media.slice(0, 4);
  const dims = c.dimensions.slice(0, 4);
  const m = Math.max(1, media.length);

  // —— 作品条：16:9 卡片横排 ——
  const gap = 36;
  const mw = Math.min(760, (1728 - (m - 1) * gap) / m);
  const mh = mw * 9 / 16;
  const mx0 = (1920 - (m * mw + (m - 1) * gap)) / 2;
  const my = 540 - mh / 2 + 10;

  // —— 退后 + 评分卡 ——
  const recede = q(t, 1.6, 2.2);
  const card = p(t, 1.85, 2.45);
  const barAt = (i: number) => 2.35 + i * 0.22;
  const verdictIn = p(t, 3.3, 3.85);

  // 卡片尺寸：维度行 + 结论行
  const rowH = 96, rowGap = 22;
  // 维度名：同一字号；超过 380 宽就在两行内放下
  const LABEL_MAX = 380;
  let labelSize = 52;
  while (labelSize > 34 && dims.some((d) => textWidth(d.label, labelSize) > LABEL_MAX * (rowH >= labelSize * 2.4 ? 1.9 : 1))) labelSize -= 1;
  const labelW = Math.min(LABEL_MAX, Math.max(...dims.map((d) => textWidth(d.label, labelSize)))) + 44;
  const valueW = 210;
  const barX = PAD + labelW, barW = CARD_W - PAD * 2 - labelW - valueW;
  const inner = CARD_W - PAD * 2;
  // 结论：优先一行（≥60px），否则两行、三行，字号随行数自适应
  const units = Math.max(1, textWidth(c.verdict, 1));
  const vLines = [1, 2, 3].find((L) => Math.min(78, (inner * L * 0.9) / units) >= 60) ?? 3;
  const vSize = Math.min(78, (inner * (vLines === 1 ? 1 : vLines * 0.9)) / units);
  const twoLines = vLines > 1;
  const verdictH = vSize * 1.22 * vLines;
  const cardH = PAD + dims.length * rowH + (dims.length - 1) * rowGap + 64 + verdictH + PAD;
  const cardX = (1920 - CARD_W) / 2, cardY = (1080 - cardH) / 2 + 20;

  const hi = c.highlight && c.verdict.includes(c.highlight) ? c.verdict.indexOf(c.highlight) : -1;
  const verdictNode = hi < 0 ? c.verdict : <>
    {c.verdict.slice(0, hi)}<span style={{ color: S.accent }}>{c.highlight}</span>{c.verdict.slice(hi + c.highlight.length)}
  </>;

  return <Frame>
    {/* 作品条：建立后整体失焦、缩小、蒙白（保留身份） */}
    <div style={{ position: 'absolute', inset: 0, filter: `blur(${14 * recede}px)`, transform: `scale(${mix(1, 0.92, recede)})`, transformOrigin: '50% 50%' }}>
      {media.map((src, i) => {
        const enter = p(t, 0.04 + i * 0.12, 0.04 + i * 0.12 + 0.55);
        return <Media key={i} src={src} box={{ x: mx0 + i * (mw + gap), y: my + (1 - enter) * 60, w: mw, h: mh }}
          style={{ boxShadow: S.shadow, opacity: enter, transform: `scale(${mix(0.94, 1, enter)})` }} />;
      })}
    </div>
    <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.6 * recede }} />

    {/* 评分卡 */}
    <div style={{
      position: 'absolute', left: cardX, top: cardY + (1 - card) * 70, width: CARD_W, height: cardH,
      background: '#fff', borderRadius: S.radius, boxShadow: S.shadow, opacity: clamp(card * 1.4),
      transform: `scale(${mix(0.97, 1, card)})`,
    }}>
      {dims.map((d, i) => {
        const v = p(t, barAt(i), barAt(i) + 0.8);
        const score = clamp(d.score, 0, 10);
        const y = PAD + i * (rowH + rowGap);
        const decimals = dims.some((x) => !Number.isInteger(x.score));
        return <React.Fragment key={i}>
          <div style={{ ...textBase(labelSize, 900), lineHeight: 1.12, whiteSpace: 'normal', position: 'absolute', left: PAD, top: y, width: labelW - 30, height: rowH, display: 'flex', alignItems: 'center', color: S.ink }}>{d.label}</div>
          <div style={{ position: 'absolute', left: barX, top: y + rowH / 2 - 14, width: barW, height: 28, borderRadius: 14, background: '#efeff2', overflow: 'hidden' }}>
            <div style={{ width: barW * (score / 10) * v, height: '100%', borderRadius: 14, background: S.dark }} />
          </div>
          <div style={{
            position: 'absolute', left: CARD_W - PAD - valueW + 24, top: y, width: valueW - 24, height: rowH,
            display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', paddingTop: (rowH - 76 * 1.16) / 2 + 4,
          }}>
            <span style={{ ...textBase(76, 900), color: S.ink, opacity: clamp(v * 4) }}>{fmt(score * v, decimals)}</span>
            <span style={{ ...textBase(36, 500), color: S.faint, marginLeft: 6, opacity: clamp(v * 4) }}>/10</span>
          </div>
        </React.Fragment>;
      })}
      {/* 结论：从左向右刷出 */}
      <div style={{
        ...textBase(vSize, 900), lineHeight: 1.22, whiteSpace: twoLines ? 'normal' : 'nowrap',
        position: 'absolute', left: PAD, top: cardH - PAD - verdictH, width: inner, color: S.ink,
        clipPath: `inset(-10% ${100 * (1 - verdictIn)}% -10% 0)`, transform: `translateY(${(1 - verdictIn) * 14}px)`,
      }}>{verdictNode}</div>
    </div>

    <Sfx name="woosh" at={1.6} />
    <Sfx name="scroll" at={barAt(0)} duration={Math.round((barAt(dims.length - 1) + 0.8 - barAt(0)) * 60)} />
    <Sfx name="ding" at={3.8} />
  </Frame>;
}
