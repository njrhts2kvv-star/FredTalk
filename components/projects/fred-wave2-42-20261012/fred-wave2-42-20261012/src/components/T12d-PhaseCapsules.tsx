// T12d-PhaseCapsules：阶段胶囊：几枚胶囊依次建立，聚焦当前阶段
// 观众要看懂的变化：整体分成前/中/后几个阶段 → 收到当前要讲的这一段
// 升级自 L81-R053（specs/R053.json tracks）：保留
//   ① 每枚都从画面中心的圆点长成圆（54→75f，0→328）、再压成胶囊（75→90f，宽略冲过 652 后回 640）；
//   ② 新胶囊在中心诞生时，上一枚让到自己的槽位（pill0 99→117f 上移；最后一枚成形后下移到底部槽位）；
//   ③ 逐项退出：其余胶囊自下而上依次向右加速滑出（~26f，相隔 ~8f），保留的那枚回到中心。
// 本版：项数 2–4、文字、强调字、保留哪一段都是 props；原版末尾“放大淡出”改为放大停住（聚焦当前阶段，留足阅读）；
// 背景用 Fred 自己的文章页，白蒙版+失焦退后（原版为反相暗化视频）。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Pill, Sfx, textBase, useT } from '../kit/ui';

export type PhaseItem = { text: string; highlight?: string };
export type PhaseCapsulesProps = HandoffProps & {
  items: PhaseItem[];   // 2–4 个阶段；highlight 为该项里染紫的字（深底 #D6BEFF）
  focus: number;        // 最后保留并聚焦的阶段序号（从 0 开始）
  background: string;   // 退后的真实素材（public 下路径）；留空则纯白底
  cues?: number[];      // 口播时间点（秒，场景内）：[0..n-1]=第 i 枚出现，[n]=其余退出、聚焦开始
};

export const phaseCapsulesDefaults: PhaseCapsulesProps = {
  items: [{ text: '记录前', highlight: '前' }, { text: '记录中', highlight: '中' }, { text: '记录后', highlight: '后' }],
  focus: 0,
  background: 'media/w2-article-title.jpg',
};

const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

export function PhaseCapsules(props: Partial<PhaseCapsulesProps>) {
  const c = { ...phaseCapsulesDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 4);
  const n = Math.max(1, items.length);
  const focus = Math.min(n - 1, Math.max(0, Math.round(c.focus)));

  // ---- 版式：R053 稳定 640×258、行距 310、字 168；项多时按高度收，字长时按宽度收 ----
  const pitch = Math.min(310, 880 / n);
  let H = pitch * 0.83;
  let font = H * 0.65;
  const units = Math.max(...items.map((it) => textWidth(it.text, 1)));
  const maxW = 1500;
  if (units * font + font * 1.4 > maxW) { font = maxW / (units + 1.4); }
  const W = Math.max(H * 2.2, units * font + font * 1.4);
  const D = Math.min(H * 1.27, 420);   // 圆的直径（328 / 258）
  const slotY = (i: number) => 540 + (i - (n - 1) / 2) * pitch;

  // ---- 时间：默认间隔 0.8 / 0.6 / 0.6 秒（R053 按口播 58f、32f）----
  const born = items.map((_, i) => cueAt(c.cues, i, 0.1 + (i === 0 ? 0 : 0.8 + (i - 1) * 0.6)));
  const lastFormed = born[n - 1] + 0.62;
  const E = cueAt(c.cues, n, Math.max(lastFormed + 0.9, 3.6));   // 退出 / 聚焦开始
  const exiting = items.map((_, i) => i).filter((i) => i !== focus).sort((a, b) => b - a);  // 自下而上
  const exitAt = (i: number) => E + exiting.indexOf(i) * 0.13;
  const exitEnd = E + Math.max(0, exiting.length - 1) * 0.13 + 0.45;
  const toCenter = q(t, exitEnd - 0.15, exitEnd + 0.45);
  const zoom = p(t, exitEnd + 0.3, exitEnd + 0.9);

  // 背景：真实页面先看清，0.8 秒内失焦退后
  const recede = q(t, 0.05, 0.85);

  const pills = items.map((it, i) => {
    const a = born[i];
    if (t < a) return null;
    const grow = p(t, a, a + 0.35);                              // 圆点 → 圆
    const squash = overshoot(t, a + 0.3, 0.22, 0.12, 0.025);     // 圆 → 胶囊（宽度略冲过）
    let w = mix(D * grow, W, squash);
    let h = mix(D * grow, H, squash);
    // 让位：中心诞生；下一枚诞生时让到自己的槽位，最后一枚成形后就位
    const leaveAt = i < n - 1 ? born[i + 1] - 0.02 : a + 0.58;
    const settle = q(t, leaveAt, leaveAt + 0.32);
    // 让位时沿运动方向略拉长（R053 pill0 上移时高度 258→564 再回落），只给一点，不做弹跳
    const stretch = Math.sin(Math.PI * settle) * 0.16;
    h *= 1 + stretch;
    w *= 1 - stretch * 0.25;
    let y = mix(540, slotY(i), settle);
    let x = 960;
    let scale = 1;
    let opacity = 1;
    if (i === focus) {
      y = mix(y, 540, toCenter);
      scale = mix(1, 1.18, zoom);
    } else {
      const v = clamp((t - exitAt(i)) / 0.45);
      x += 1500 * v * v * v;          // 向右加速滑出
      opacity = v >= 1 ? 0 : 1;
    }
    const chars = Array.from(it.text);
    const hl = it.highlight && it.text.includes(it.highlight) ? it.highlight : '';
    const hlFrom = hl ? Array.from(it.text.slice(0, it.text.indexOf(hl))).length : -1;
    const hlTo = hl ? hlFrom + Array.from(hl).length : -1;
    const textAt = a + 0.32;
    return <div key={i} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity, zIndex: 10 + i,
      transform: `translate(${x - 960}px, ${y - 540}px) scale(${scale})`, transformOrigin: '960px 540px' }}>
      <Pill box={{ x: 960 - w / 2, y: 540 - h / 2, w, h }}>
        <div style={{ ...textBase(font, 400, S.display), lineHeight: 1, color: '#fff', whiteSpace: 'nowrap', transform: `scaleY(${1 / (1 + stretch)})` }}>
          {chars.map((ch, k) => <span key={k} style={{ opacity: p(t, textAt + k * 0.06, textAt + k * 0.06 + 0.25),
            color: k >= hlFrom && k < hlTo ? accentOn(true) : '#fff' }}>{ch}</span>)}
        </div>
      </Pill>
    </div>;
  });

  return <Frame>
    {c.background && <>
      <div style={{ position: 'absolute', inset: 0, filter: `blur(${recede * 18}px)`, transform: `scale(${mix(1, 1.06, recede)})` }}>
        <Media src={c.background} box={{ x: 0, y: 0, w: 1920, h: 1080 }} radius={0} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.76 * recede }} />
    </>}
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {pills}
    </Handoff>
    {born.map((a, i) => <Sfx key={i} name="pop" at={a} />)}
    <Sfx name="slide" at={E} />
  </Frame>;
}
