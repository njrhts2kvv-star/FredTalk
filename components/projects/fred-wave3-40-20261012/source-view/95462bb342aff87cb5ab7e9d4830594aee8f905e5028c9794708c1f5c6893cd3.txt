// T01h-CautionTag：注意澄清（快过渡 3s）
// 观众要看懂的变化：一个容易误会的点 → “注意”标签盖下，澄清句落定
// 关系：先只给出那个容易被误会的对象（黑胶囊里一个词）；一枚黑框“注意”方章旋转着从上方盖下（springAt），
// 正好压在胶囊左端；盖下之后胶囊被“压”到方章下面，同一进度向右长出澄清句，整组落定居中。
// 与库内区分：T06b 是整句被划掉换答案；T01e 是胶囊补条件；T05g 是不等号对比。这里是“对象 + 盖章 + 澄清”，
// 原对象不被否定，只被补上一句纠正。
// 默认内容：113 期“注意啊，它不是官方出的”。可选 backdrop 叠在虚化的录屏/截图上。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Sfx, textBase, useT } from '../kit/ui';

export type CautionTagProps = HandoffProps & {
  subject: string;      // 容易被误会的对象（先出现）
  clarify: string;      // 澄清句（盖章后长出来）
  highlight: string;    // clarify 里染紫的词（黑胶囊上 #D6BEFF）
  stamp: string;        // 方章文字，1–2 个字
  backdrop?: string;    // 可选：虚化在后面的录屏/截图
  cues?: number[];      // [0]=方章盖下，[1]=澄清句长出
};

export const cautionTagDefaults: CautionTagProps = {
  subject: 'JEV-27B',
  clarify: '不是 JEV 官方出的',
  highlight: '不是',
  stamp: '注意',
};

const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

export function CautionTag(props: Partial<CautionTagProps>) {
  const c = { ...cautionTagDefaults, ...props };
  const t = useT();

  // —— 终态版式（先算终态，再让东西走到终态）——
  // 一行放得下 ≥84px 就一行胶囊；否则澄清句折成两行，容器从胶囊长成圆角黑卡（同一对象），不塞细长胶囊
  const subjU = textWidth(c.subject, 1);
  const gapU = 0.36;
  const restU = textWidth(c.clarify, 1);
  const EXTRA = 3.3;                               // 方章 + 内边距约 3.3 个字宽
  const one = Math.min(124, 1680 / (subjU + gapU + restU + EXTRA));
  const hl = c.highlight && c.clarify.includes(c.highlight) ? c.highlight : '';
  let rows: string[] = [c.clarify];
  if (one < 84) {
    const chars = Array.from(c.clarify);
    const hiA = hl ? c.clarify.indexOf(hl) : -1, hiB = hiA + Array.from(hl).length;
    let best = Math.ceil(chars.length / 2), score = Infinity, acc = 0;
    for (let i = 1; i < chars.length; i++) {
      acc += textWidth(chars[i - 1], 1);
      const l1 = subjU + gapU + acc, l2 = restU - acc;
      const sc = Math.abs(l1 - l2) - (/[，,：:；;]/.test(chars[i - 1]) ? 6.5 : /[、]/.test(chars[i - 1]) ? 2.5 : 0) + (hiA >= 0 && i > hiA && i < hiB ? 6 : 0)
        + (/[A-Za-z0-9]/.test(chars[i - 1]) && /[A-Za-z0-9]/.test(chars[i]) ? 6 : 0);
      if (sc < score) { score = sc; best = i; }
    }
    rows = [chars.slice(0, best).join(''), chars.slice(best).join('').trim()];
  }
  const two = rows.length > 1;
  const line1U = subjU + gapU + textWidth(rows[0], 1);
  const line2U = two ? textWidth(rows[1], 1) : 0;
  const size = two ? Math.min(124, 1680 / (Math.max(line1U, line2U) + EXTRA)) : one;
  const h0 = size * 1.86;                          // 只有对象时的胶囊高
  const LH = two ? size * 1.32 : h0;
  const h1 = two ? LH * 2 + size * 0.7 : h0;
  const r1 = two ? Math.min(h1 / 2, size * 0.78) : h0 / 2;
  const ST = Math.round(h0 * 1.12);                // 方章边长
  const OV = ST * 0.32;                            // 方章压住容器左端的宽度
  const pad = size * 0.7;                          // MiSans Heavy 的拉丁字母比 0.58 估算略宽，右侧多留一点
  const subjW = subjU * size, gapW = gapU * size;
  const w0 = subjW + pad * 2;                      // 只有对象时
  const w1 = OV + size * 0.5 + Math.max(line1U, line2U) * size + pad;
  const groupW = ST - OV + w1;
  const left = 960 - groupW / 2;
  const cy = 500;                                  // 字幕区上方
  const x0 = 960 - w0 / 2, x1 = left + ST - OV;
  const tx0 = x0 + pad, tx1 = x1 + OV + size * 0.5;

  // —— 时间 ——
  const stampAt = cueAt(c.cues, 0, 0.5);
  const extAt = cueAt(c.cues, 1, stampAt + 0.3);
  const open = overshoot(t, 0, 0.36, 0.22, 0.05);
  const slam = springAt(t, stampAt, 0.55);
  const stampVis = clamp((t - stampAt) / 0.06);
  const hit = clamp((t - stampAt - 0.12) / 0.3);   // 盖下那一下：胶囊轻微下压后回位
  const jolt = hit > 0 && hit < 1 ? Math.sin(hit * Math.PI) * (1 - hit) * 10 : 0;
  const ext = overshoot(t, extAt, 0.5, 0.24, 0.03);
  const reveal = p(t, extAt + 0.08, extAt + (two ? 0.5 : 0.62));
  const reveal2 = p(t, extAt + 0.32, extAt + 0.78);

  const pw = mix(Math.min(h0, w0), w0, clamp(open)) * (open > 1 ? open : 1);
  const pillW = ext > 0 ? mix(w0, w1, ext) : pw;
  const pillX = ext > 0 ? mix(x0, x1, ext) : 960 - pw / 2;
  const textX = mix(tx0, tx1, clamp(ext));
  const pillH = ext > 0 ? mix(h0, h1, clamp(ext)) : h0;
  const radius = ext > 0 ? mix(h0 / 2, r1, clamp(ext)) : h0 / 2;
  const textTop = mix((h0 - LH) / 2, (h1 - LH * rows.length) / 2, clamp(ext));
  const seg = (text: string) => {
    if (!hl || !text.includes(hl)) return <>{text}</>;
    const i = text.indexOf(hl);
    return <>{text.slice(0, i)}<span style={{ color: accentOn(true) }}>{hl}</span>{text.slice(i + hl.length)}</>;
  };

  // 方章：从上方 1.8 倍、斜 −24° 盖下到 −8°
  const sScale = mix(1.8, 1, slam);
  const sRot = mix(-24, -8, slam);
  const stampSize = Math.min(ST * 0.36, (ST * 0.74) / Math.max(1, textWidth(c.stamp, 1)));
  const border = Math.max(8, ST * 0.055);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {c.backdrop && <>
        <div style={{ position: 'absolute', inset: 0, filter: 'blur(16px)', transform: 'scale(1.04)' }}>
          <Media src={c.backdrop} box={{ x: 0, y: 0, w: 1920, h: 1080 }} radius={0} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.76 }} />
      </>}

      {/* 黑胶囊：对象 → 澄清句（文字随容器右端露出，不淡入叠字）；两行时同一容器长高成圆角黑卡 */}
      <div style={{
        position: 'absolute', left: pillX, top: cy - pillH / 2 + jolt, width: pillW, height: pillH, borderRadius: radius,
        background: S.dark, boxShadow: S.capsuleShadow, overflow: 'hidden', opacity: clamp(t / 0.08),
      }}>
        <div style={{ position: 'absolute', left: textX - pillX, top: textTop, height: LH, display: 'flex', alignItems: 'center' }}>
          <span style={{ ...textBase(size, 900), color: '#fff', opacity: clamp((open - 0.35) / 0.4) }}>{c.subject}</span>
          {ext > 0 && <span style={{
            display: 'inline-block', marginLeft: gapW, clipPath: `inset(-20% ${100 * (1 - reveal)}% -20% 0)`,
            transform: `translateX(${(1 - reveal) * 18}px)`,
          }}>
            <span style={{ ...textBase(size, 900), color: '#fff' }}>{seg(rows[0])}</span>
          </span>}
        </div>
        {two && ext > 0 && <div style={{
          position: 'absolute', left: textX - pillX, top: textTop + LH, height: LH, display: 'flex', alignItems: 'center',
          clipPath: `inset(-20% ${100 * (1 - reveal2)}% -20% 0)`, transform: `translateX(${(1 - reveal2) * 18}px)`,
        }}>
          <span style={{ ...textBase(size, 900), color: '#fff' }}>{seg(rows[1])}</span>
        </div>}
      </div>

      {/* 黑框方章 */}
      {stampVis > 0 && <div style={{
        position: 'absolute', left: mix(x0 - ST + OV * 0.45, left, clamp(ext)), top: cy - ST / 2 + jolt * 0.4, width: ST, height: ST, borderRadius: 26,
        background: '#fff', border: `${border}px solid ${S.dark}`, boxSizing: 'border-box', boxShadow: S.capsuleShadow,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `rotate(${sRot}deg) scale(${sScale})`, opacity: stampVis, zIndex: 2,
      }}>
        <span style={{ ...textBase(stampSize, 400, S.display), color: S.dark, lineHeight: 1 }}>{c.stamp}</span>
      </div>}
    </Handoff>
    <Sfx name="pop" at={0} />
    <Sfx name="whoosh-short" at={stampAt - 0.05} />
    <Sfx name="ding" at={extAt + 0.5} />
  </Frame>;
}
