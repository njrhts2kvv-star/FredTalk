// T09n-WaitSkip：等待快进（快过渡 3s）
// 观众要看懂的变化：一段等待 → 时间胶囊快速翻过，直接到完成
// 关系：同一张录屏画面。先看清 0.2s → 虚化暗下（材料退后），中央黑卡接管：
// 分钟数像里程表一样滚到目标值，进度条同一进度快进到头；到头那一下，条头的圆点长成完成勾；
// 随后黑卡收起，录屏恢复清晰（回到原画面继续讲）。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Sfx, abs, textBase, useT } from '../kit/ui';

export type WaitSkipProps = HandoffProps & {
  image: string;        // 录屏截图或视频（public 相对路径）
  imageSize?: { w: number; h: number };   // 源图尺寸，用来把 maskBoxes 换算到画面（铺满方式同 Media cover）
  maskBoxes?: { x: number; y: number; w: number; h: number }[];   // 源图里要实心盖掉的区域（源图像素）
  maskColor?: string;
  label: string;        // 在等什么，如“安装依赖”
  minutes: number;      // 等了多久（整数分钟）
  prefix?: string;      // 数字前的字，默认“约”
  suffix?: string;      // 数字后的字，默认“分钟后”
  brand?: boolean;      // 录屏全屏时默认不加角标
  cues?: number[];      // [0]=开始快进，[1]=到头完成，[2]=恢复清晰
};

// 默认内容：Codex 桌面端真实界面（114 期“装依赖要等一会儿”）
export const waitSkipDefaults: WaitSkipProps = {
  image: 'media/x4-codex-full.png',
  imageSize: { w: 3024, h: 1712 },
  // 盖掉输入框左下橙色“完全访问”（含图标）：平台安全规则里无安全语境的权限表达不上屏
  maskBoxes: [{ x: 1156, y: 1606, w: 158, h: 44 }],
  maskColor: '#fff',
  label: '安装依赖',
  minutes: 8,
  prefix: '约',
  suffix: '分钟后',
  brand: false,
};

// 里程表：每一位是 0–9 的竖列，按连续数值滚动；低位走完一圈时高位才进一格
function Odometer({ value, digits, size, color }: { value: number; digits: number; size: number; color: string }) {
  const cellW = size * 0.62, cellH = size * 1.16;   // 数字用 MiSans Heavy（锐字真言的数字不好认）
  return <div style={{ display: 'flex', height: cellH, overflow: 'hidden' }}>
    {Array.from({ length: digits }, (_, i) => {
      const k = digits - 1 - i;              // 位权
      const unit = Math.pow(10, k);
      const lower = value % unit;
      const carry = k === 0 ? 0 : clamp(lower - (unit - 1));
      const pos = k === 0 ? value % 10 : (Math.floor(value / unit) + carry) % 10;
      const lead = k > 0 && value < unit ? clamp(value / unit * 4) : 1; // 前导 0 不显示
      return <div key={i} style={{ position: 'relative', width: cellW * lead, height: cellH, opacity: lead, overflow: 'hidden' }}>   {/* 前导位还没出现时不占宽度，不留空洞 */}
        <div style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${-pos * cellH}px)` }}>
          {Array.from({ length: 11 }, (_, d) => <div key={d} style={{
            ...textBase(size, 900), width: cellW, height: cellH, lineHeight: `${cellH}px`, textAlign: 'center', color,
          }}>{d % 10}</div>)}
        </div>
      </div>;
    })}
  </div>;
}

export function WaitSkip(props: Partial<WaitSkipProps>) {
  const c = { ...waitSkipDefaults, ...props };
  const t = useT();
  const minutes = Math.max(1, Math.round(c.minutes));
  const digits = String(minutes).length;
  const prefix = c.prefix ?? '约', suffix = c.suffix ?? '分钟后';

  // —— 时间 ——
  const ffAt = cueAt(c.cues, 0, 0.42);
  const doneAt = cueAt(c.cues, 1, Math.max(ffAt + 0.9, 1.72));
  const backAt = cueAt(c.cues, 2, doneAt + 0.3);
  const recede = q(t, 0.18, 0.5) * (1 - q(t, backAt, backAt + 0.4));
  const cardIn = p(t, 0.2, 0.55);                       // 和虚化同步进来，不在清晰画面上先出现
  const cardOut = q(t, backAt, backAt + 0.24);
  const ff = q(t, ffAt, doneAt);                         // 快进：先加速再减速，到头停住
  const value = ff * minutes;
  const check = p(t, doneAt, doneAt + 0.32);

  // —— 黑卡版式：大字一行按宽度自适应 ——
  const BIG = Math.min(168, 1180 / (textWidth(prefix, 1) + digits * 0.62 + textWidth(suffix, 1) + 0.4));
  const LAB = Math.min(64, 1180 / Math.max(1, textWidth(c.label, 1) + 1.2));
  const rowW = textWidth(prefix, BIG) + (prefix ? BIG * 0.2 : 0) + digits * BIG * 0.62 + BIG * 0.2 + textWidth(suffix, BIG);
  const PAD = 84;
  const cardW = Math.max(880, rowW + PAD * 2, textWidth(c.label, LAB) + LAB * 1.2 + PAD * 2);
  const BAR_H = 14, DOT = 54;
  const cardH = PAD * 0.85 + LAB * 1.16 + 34 + BIG * 1.16 + 46 + DOT + PAD * 0.75;
  const card = { x: 960 - cardW / 2, y: 540 - cardH / 2, w: cardW, h: cardH };
  const barY = PAD * 0.85 + LAB * 1.16 + 34 + BIG * 1.16 + 46 + DOT / 2;
  const barX0 = PAD, barW = cardW - PAD * 2 - DOT / 2;
  const headX = barX0 + barW * ff;
  const hold = clamp((t - doneAt) / 0.08);

  return <Frame brand={c.brand ?? false} dark>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 录屏：先看清，再虚化暗下；完成后恢复 */}
      <div style={{ position: 'absolute', inset: 0, filter: `blur(${16 * recede}px)`, transform: `scale(${1 + 0.05 * recede})`, transformOrigin: '50% 50%' }}>
        <Media src={c.image} box={{ x: 0, y: 0, w: 1920, h: 1080 }} radius={0} />
        {c.imageSize && (c.maskBoxes ?? []).map((m, i) => {
          const k = Math.max(1920 / c.imageSize!.w, 1080 / c.imageSize!.h);
          const ox = (1920 - c.imageSize!.w * k) / 2, oy = (1080 - c.imageSize!.h * k) / 2;
          return <div key={i} style={{ position: 'absolute', left: ox + m.x * k, top: oy + m.y * k, width: m.w * k, height: m.h * k, background: c.maskColor ?? '#fff' }} />;
        })}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0.58 * recede }} />

      {/* 中央黑卡 */}
      {cardIn > 0 && cardOut < 1 && <div style={{
        ...abs(card), borderRadius: 48, background: S.dark, boxShadow: S.capsuleShadow, overflow: 'hidden',
        opacity: clamp(cardIn * 1.5) * (1 - cardOut) * (1 - cardOut), transform: `translateY(${(1 - cardIn) * 36 - cardOut * 20}px) scale(${mix(0.94, 1, cardIn) * mix(1, 0.86, cardOut)})`,
      }}>
        {/* 第一行：快进符号 + 在等什么 */}
        <div style={{ position: 'absolute', left: PAD, top: PAD * 0.85, height: LAB * 1.16, display: 'flex', alignItems: 'center', gap: LAB * 0.36 }}>
          <svg width={LAB * 0.86} height={LAB * 0.62} viewBox="0 0 28 20" style={{ opacity: 0.55 + 0.45 * Math.abs(Math.sin(value * Math.PI * 0.5)) * (1 - hold) + 0.45 * hold }}>
            <path d="M1 1 L13 10 L1 19 Z M14 1 L26 10 L14 19 Z" fill="#fff" />
          </svg>
          <span style={{ ...textBase(LAB, 900), color: '#fff' }}>{c.label}</span>
        </div>
        {/* 第二行：约 [N] 分钟后 */}
        <div style={{ position: 'absolute', left: PAD, top: PAD * 0.85 + LAB * 1.16 + 34, height: BIG * 1.16, display: 'flex', alignItems: 'center' }}>
          {prefix && <><span style={{ ...textBase(BIG, 400, S.display), color: '#fff' }}>{prefix}</span><div style={{ width: BIG * 0.2 }} /></>}
          <Odometer value={value} digits={digits} size={BIG} color={accentOn(true)} />
          <div style={{ width: BIG * 0.2 }} />
          <span style={{ ...textBase(BIG, 400, S.display), color: '#fff' }}>{suffix}</span>
        </div>
        {/* 第三行：进度条，条头圆点到头后长成完成勾 */}
        <div style={{ position: 'absolute', left: barX0, top: barY - BAR_H / 2, width: barW, height: BAR_H, borderRadius: BAR_H / 2, background: 'rgba(255,255,255,0.16)' }} />
        <div style={{ position: 'absolute', left: barX0, top: barY - BAR_H / 2, width: Math.max(BAR_H, barW * ff), height: BAR_H, borderRadius: BAR_H / 2, background: '#fff', opacity: clamp((t - ffAt) / 0.08) }} />
        {(() => {
          const r = mix(BAR_H * 1.1, DOT / 2, check);
          return <div style={{ position: 'absolute', left: headX - r, top: barY - r, width: r * 2, height: r * 2, borderRadius: r, background: check > 0 ? accentOn(true) : '#fff', opacity: clamp((t - ffAt) / 0.08) }}>
            <svg width={r * 2} height={r * 2} viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0, opacity: check }}>
              <path d="M6.5 12.5 L10.5 16.2 L17.5 8.3" stroke={S.dark} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="18" strokeDashoffset={18 * (1 - check)} />
            </svg>
          </div>;
        })()}
      </div>}
    </Handoff>
    <Sfx name="whoosh-short" at={0.18} />
    <Sfx name="scroll" at={ffAt} duration={Math.round((doneAt - ffAt) * 60)} />
    <Sfx name="ding" at={doneAt} />
  </Frame>;
}
