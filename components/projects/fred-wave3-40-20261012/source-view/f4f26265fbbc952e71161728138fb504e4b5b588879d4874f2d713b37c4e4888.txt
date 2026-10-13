// T15i-PlanTable：套餐对比
// 观众要看懂的变化：几个套餐并排 → 价格落定，推荐的那个抬起
// 动作：卡片依次落下 → 各卡价格数字从 0 滚到定价 → 权益行逐行画出对勾 → 推荐那张放大抬起、加黑色“推荐”胶囊，其余退后。
// 价格/套餐/会员对比，全库此前 0 条。不做彩色卡：白卡 + 阴影，紫色只给被推荐那张的价格。
// 默认内容：107 期（OpenAI Dev Day）官方模型定价卡 models.png —— GPT-6 Astra $10 / GPT-6.1 Sol $2 / GPT-6 Luna $0.10（输入价），
//   输出价 $50 / $10 / $0.50，缓存输入 $1 / $0.10 / $0.01；Sol 的官方说明是“接近 Astra 的智能，价格只有五分之一”。
//   定价单位图上没写，这里只写“输入价”，不加“每百万 token”。“推荐哪个”是示例选择，换内容用 recommend。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type Plan = {
  name: string;          // 套餐名
  price: number;         // 主价格（滚动到这个数）
  prefix?: string;       // 价格前缀，如 "$"、"¥"
  decimals?: number;     // 小数位；不传时整数不带小数、其余保留两位
  unit?: string;         // 价格下面的说明，如 "输入价"
  rows: string[];        // 权益行（每行一个对勾）
};
export type PlanTableProps = HandoffProps & {
  plans: Plan[];         // 2–4 个套餐
  recommend: number;     // 推荐第几个（从 0 起）
  tag: string;           // 推荐胶囊上的字
  cues?: number[];       // [0]=价格开始滚动，[1]=权益开始打勾，[2]=推荐抬起
};

export const planTableDefaults: PlanTableProps = {
  plans: [
    { name: 'Astra', price: 10, prefix: '$', unit: '输入价', rows: ['最聪明的模型', '输出 $50', '缓存输入 $1'] },
    { name: 'Sol', price: 2, prefix: '$', unit: '输入价', rows: ['接近 Astra 的智能', '输出 $10', '缓存输入 $0.10'] },
    { name: 'Luna', price: 0.1, prefix: '$', unit: '输入价', rows: ['快速的日常批量', '输出 $0.50', '缓存输入 $0.01'] },
  ],
  recommend: 1,
  tag: '推荐',
};

const Check = ({ size, v, color }: { size: number; v: number; color: string }) => <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', overflow: 'visible', flex: 'none' }}>
  <path d="M3.5 12.8 L9.6 18.6 L20.5 5.4" pathLength={1} fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={1} strokeDashoffset={1 - v} />
</svg>;

export function PlanTable(props: Partial<PlanTableProps>) {
  const c = { ...planTableDefaults, ...props };
  const t = useT();
  const plans = c.plans.slice(0, 4);
  const n = Math.max(1, plans.length);
  const rec = clamp(Math.round(c.recommend), 0, n - 1);
  const maxRows = Math.max(1, ...plans.map((x) => x.rows.length));

  // ---------- 终态版式 ----------
  const gap = n >= 4 ? 32 : 44;
  const cardW = Math.min(470, (1700 - gap * (n - 1)) / n);
  const pad = 48;
  const inner = cardW - pad * 2;
  const fmt = (pl: Plan, v: number) => v.toFixed(pl.decimals ?? (Number.isInteger(pl.price) ? 0 : 2));
  const nameSize = Math.min(54, inner / Math.max(1, ...plans.map((x) => textWidth(x.name, 1))));
  const priceSize = Math.min(124, inner / Math.max(1, ...plans.map((x) => textWidth(`${x.prefix ?? ''}${fmt(x, x.price)}`, 0.82))));
  // 权益行：先求“每行一行字”的最大字号（≤38）；放不下 30 就固定 30 并允许换到第二行
  const allRows = plans.flatMap((x) => x.rows);
  const textW = inner - 38 - 16;
  const linesAt = (sz: number) => Math.max(1, ...allRows.map((r) => Math.ceil(textWidth(r, sz) / textW - 0.001)));
  let rowSize = 38;
  while (rowSize > 30 && linesAt(rowSize) > 1) rowSize -= 1;
  const rowLines = Math.min(2, linesAt(rowSize));
  const rowH = Math.round(rowSize * 1.25 * rowLines + rowSize * 0.75);
  const nameH = Math.round(nameSize * 1.3), priceH = Math.round(priceSize * 1.1), unitH = 44;
  const cardH = pad + nameH + 14 + priceH + unitH + 26 + maxRows * rowH + pad - 6;
  const totalW = cardW * n + gap * (n - 1);
  const x0 = (1920 - totalW) / 2;
  const y0 = Math.max(190, (1080 - cardH) / 2 + 36);

  // ---------- 时间线 ----------
  const priceAt = cueAt(c.cues, 0, 0.75);
  const rowsAt = cueAt(c.cues, 1, priceAt + 1.25);
  const liftAt = cueAt(c.cues, 2, rowsAt + (maxRows - 1) * 0.3 + 0.95);
  const lift = p(t, liftAt, liftAt + 0.7);
  const priceOn = q(t, liftAt + 0.3, liftAt + 0.65);
  const tagOpen = p(t, liftAt + 0.2, liftAt + 0.75);
  const tagPop = 1 + 0.06 * Math.sin(clamp((t - liftAt - 0.2) / 0.6) * Math.PI);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {plans.map((pl, j) => {
        const isRec = j === rec;
        const inAt = 0.05 + j * 0.11;
        const enter = p(t, inAt, inAt + 0.55);
        const pa = priceAt + j * 0.12;
        const pv = p(t, pa, pa + 0.95);
        const x = x0 + j * (cardW + gap);
        const scale = isRec ? mix(1, 1.07, lift) : mix(1, 0.97, lift);
        const dy = isRec ? -26 * lift : 0;
        const op = enter * (isRec ? 1 : mix(1, 0.55, lift));
        const shadow = isRec ? `0 ${16 + 14 * lift}px ${25 + 20 * lift}px 0 rgba(0,0,0,${0.1333 + 0.09 * lift})` : S.shadow;
        const priceColor = isRec && priceOn > 0 ? `rgb(${[0x19, 0x19, 0x1c].map((a, k) => Math.round(mix(a, [0x85, 0x54, 0xe8][k], priceOn))).join(',')})` : S.ink;
        return <div key={j} style={{ position: 'absolute', left: x, top: y0 + (1 - enter) * 56 + dy, width: cardW, height: cardH, opacity: op, transform: `scale(${scale})`, transformOrigin: '50% 50%', zIndex: isRec ? 5 : 1 }}>
          <Surface box={{ x: 0, y: 0, w: cardW, h: cardH }} shadow={shadow} style={{ overflow: 'visible' }}>
            <div style={{ position: 'absolute', left: pad, top: pad, ...textBase(nameSize, 900) }}>{pl.name}</div>
            <div style={{ position: 'absolute', left: pad, top: pad + nameH + 14, height: priceH, display: 'flex', alignItems: 'baseline', color: priceColor, ...textBase(priceSize, 900), fontVariantNumeric: 'tabular-nums' }}>
              {pl.prefix && <span style={{ fontSize: priceSize * 0.5, marginRight: 4 }}>{pl.prefix}</span>}{fmt(pl, pl.price * pv)}
            </div>
            {pl.unit && <div style={{ position: 'absolute', left: pad, top: pad + nameH + 14 + priceH + 2, ...textBase(rowSize * 0.9, 500), color: S.muted }}>{pl.unit}</div>}
            {pl.rows.map((r, i) => {
              const ra = rowsAt + i * 0.3 + j * 0.07;
              const rv = p(t, ra, ra + 0.4);
              return <div key={i} style={{ position: 'absolute', left: pad, top: pad + nameH + 14 + priceH + unitH + 26 + i * rowH, height: rowH, display: 'flex', alignItems: 'center', gap: 16 }}>
                <Check size={rowSize * 1.0} v={rv} color={S.ink} />
                <span style={{ ...textBase(rowSize, 500), whiteSpace: 'normal', lineHeight: 1.25, width: textW, opacity: rv, transform: `translateX(${(1 - rv) * 14}px)` }}>{r}</span>
              </div>;
            })}
          </Surface>
          {isRec && lift > 0 && <div style={{ position: 'absolute', left: 0, top: 0, width: cardW, height: 0 }}>
            {(() => {
              const fs = 40, w = textWidth(c.tag, fs) + 72, h = 64;
              return <Pill box={{ x: cardW / 2 - w / 2, y: -h / 2, w, h }} style={{ clipPath: tagOpen < 0.999 ? `inset(-40px ${50 * (1 - tagOpen)}% -40px ${50 * (1 - tagOpen)}% round ${h / 2}px)` : undefined, transform: `scale(${tagPop})`, overflow: 'visible' }}>
                <span style={{ ...textBase(fs, 400, S.display), color: '#fff' }}>{c.tag}</span>
              </Pill>;
            })()}
          </div>}
        </div>;
      })}
    </Handoff>
    <Sfx name="scroll" at={priceAt} volume={0.4} duration={60} />
    <Sfx name="pop" at={rowsAt} volume={0.4} />
    <Sfx name="ding" at={liftAt + 0.2} />
  </Frame>;
}
