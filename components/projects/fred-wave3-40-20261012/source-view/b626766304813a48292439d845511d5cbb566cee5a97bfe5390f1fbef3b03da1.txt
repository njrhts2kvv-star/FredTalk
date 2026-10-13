// T18e-LogoVersus：两方对决（快过渡）
// 观众要看懂的变化：两个 Logo 从两边撞到中间 → VS 落定
// 关系：两张 Logo 卡从左右两侧冲向中线，在中线“撞”上（各自被压扁一点），随即弹开到对称落点；
// 撞开的空隙里黑色圆章带着 VS 大字（MiSans Heavy，锐字真言的 S 像 5）弹出落定，两边名字从卡片下方擦出。
// 没有干净 Logo 时，一侧可只给 label：卡片换成黑色大胶囊卡，字就是身份（例如“开源版 vs 官方”）。
// 与库内区分：T05d 是两个工具并排比较条目；T18a 是单工具名片展开；这里是 2–3 秒的对冲开场。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type VersusSide = {
  logo?: string | null;   // 透明底真实 Logo（public 相对路径）；不传则用黑卡大字
  name: string;           // 卡片下方的名字；无 Logo 时就是卡片里的大字
};

export type LogoVersusProps = HandoffProps & {
  left: VersusSide;
  right: VersusSide;
  vs?: string;            // 中间大字，默认 VS
  cues?: number[];        // [0]=两张卡撞上的时刻
};

export const logoVersusDefaults: LogoVersusProps = {
  left: { logo: 'media/x6-logo-codex.png', name: 'Codex' },
  right: { logo: 'media/x6-logo-chatgpt.png', name: 'ChatGPT' },
  vs: 'VS',
};

const CARD = 460;        // Logo 卡边长
const GAP = 380;         // 弹开后两卡内缘间距（VS 圆章放在这里）
const CY = 480;          // 卡片中心高度（名字在下方，整组竖向居中）

export function LogoVersus(props: Partial<LogoVersusProps>) {
  const c = { ...logoVersusDefaults, ...props };
  const t = useT();
  const hitAt = cueAt(c.cues, 0, 0.36);

  // 无 Logo 的一侧：黑卡宽度按字算，两侧取同宽保证对称
  const labelSize = (s: VersusSide) => Math.min(150, 520 / Math.max(1, textWidth(s.name, 1)));
  const cardW = (s: VersusSide) => s.logo ? CARD : Math.max(CARD, Math.min(640, textWidth(s.name, labelSize(s)) + 140));
  const w = Math.max(cardW(c.left), cardW(c.right));
  const finalL = 960 - GAP / 2 - w, finalR = 960 + GAP / 2;

  // —— 运动：冲入（ease-out）→ 中线相撞 → 弹开落定（springAt）——
  const rush = p(t, hitAt - 0.36, hitAt);
  const bounce = springAt(t, hitAt, 0.62);
  const contactL = 960 - w - 4, contactR = 960 + 4;
  const startL = 80, startR = 1840 - w;     // 起点留在画面内（左右各 ≥80 的安全边）
  const xL = t < hitAt ? mix(startL, contactL, rush) : mix(contactL, finalL, bounce);
  const xR = t < hitAt ? mix(startR, contactR, rush) : mix(contactR, finalR, bounce);
  // 撞击瞬间：横向压扁 8%，0.2s 恢复
  const squash = 1 - 0.08 * clamp(1 - Math.abs(t - hitAt) / 0.12) ;
  const appear = clamp((t - (hitAt - 0.36)) / 0.08);

  // VS 圆章：撞开后弹出
  const vsPop = springAt(t, hitAt + 0.04, 0.6);
  const vsIn = clamp((t - hitAt - 0.04) / 0.08);
  const VS = 280;
  const vsText = c.vs ?? 'VS';
  const vsSize = Math.min(118, (VS * 0.6) / Math.max(0.58, textWidth(vsText, 1) * 1.12));

  // 名字：撞开后从左往右擦出
  const nameAt = hitAt + 0.38;
  const nameIn = p(t, nameAt, nameAt + 0.42);
  // MiSans 的拉丁字母实际比 0.58 估算宽，按 1.12 倍留余量
  const nameSize = (s: VersusSide) => Math.min(64, (w + 60) / Math.max(1, textWidth(s.name, 1) * 1.12));

  const card = (s: VersusSide, x: number, side: 'l' | 'r') => {
    const ls = labelSize(s);
    return <div key={side} style={{
      position: 'absolute', left: x, top: CY - CARD / 2, width: w, height: CARD, borderRadius: s.logo ? 36 : 48,
      background: s.logo ? '#fff' : S.dark, boxShadow: s.logo ? S.shadow : S.capsuleShadow, opacity: appear,
      transform: `scaleX(${squash}) scaleY(${2 - squash})`, transformOrigin: side === 'l' ? '100% 50%' : '0% 50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {s.logo
        ? <Img src={staticFile(s.logo)} style={{ width: CARD * 0.62, height: CARD * 0.62, objectFit: 'contain' }} />
        : <span style={{ ...textBase(ls, 400, S.display), color: '#fff' }}>{s.name}</span>}
    </div>;
  };

  const nameRow = (s: VersusSide, x: number, k: number) => s.logo ? <div key={k} style={{
    position: 'absolute', left: x - 60, width: w + 120, top: CY + CARD / 2 + 44, textAlign: 'center',
    ...textBase(nameSize(s), 900), color: S.ink,
    clipPath: `inset(-10px ${100 * (1 - nameIn)}% -10px 0)`, transform: `translateY(${(1 - nameIn) * 16}px)`,
  }}>{s.name}</div> : null;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {card(c.left, xL, 'l')}
      {card(c.right, xR, 'r')}
      {nameIn > 0 && nameRow(c.left, finalL, 1)}
      {nameIn > 0 && nameRow(c.right, finalR, 2)}
      {vsIn > 0 && <div style={{
        position: 'absolute', left: 960 - VS / 2, top: CY - VS / 2, width: VS, height: VS, borderRadius: VS / 2,
        background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: vsIn, transform: `scale(${mix(0.3, 1, vsPop)}) rotate(${mix(-14, 0, vsPop)}deg)`, zIndex: 5,
      }}>
        <span style={{ ...textBase(vsSize, 900), color: '#fff', transform: 'translateY(-2px)' }}>{vsText}</span>
      </div>}
    </Handoff>
    <Sfx name="whoosh-short" at={Math.max(0, hitAt - 0.36)} />
    <Sfx name="ding" at={hitAt + 0.04} />
  </Frame>;
}
