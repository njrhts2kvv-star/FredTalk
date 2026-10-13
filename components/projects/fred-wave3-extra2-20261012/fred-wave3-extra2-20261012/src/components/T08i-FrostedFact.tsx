// T08i-FrostedFact：毛玻璃要点卡
// 观众要看懂的变化：真实画面虚化 → 一张毛玻璃卡浮起，写着一个关键事实
// 关系：录屏一直在播（不换成纯色页），只是轻微失焦、提亮退后；一张毛玻璃卡从下方浮起，
// 卡片里透出的是“卡片正后方”的同一段录屏（重度模糊 + 白雾），随卡片位置实时对齐，所以录屏滚动时玻璃里的光影也在流动。
// 卡内大字事实从左向右擦出，下面一行小注随后升起。
// 与库内区分：T09n 是黑卡接管 + 计时；T08b/T18c 是相机推近原像素；这里是材质变化——上下文保留在玻璃后面，前景补一句事实。
// 素材：114 期自动录屏 07-Releases-assets.mp4 的 2.4–7.6s（LosslessCut Releases 页滚到 Assets 列表），
// 缩成 1920×1080：public/media/x9-releases.mp4。公开页、无登录、无账号信息。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Sfx, abs, textBase, useT } from '../kit/ui';

export type FrostedFactProps = HandoffProps & {
  media: string;        // 录屏视频或截图（铺满画面）
  start?: number;       // 视频起播秒数
  fact: string;         // 关键事实（大字，一行）
  highlight: string;    // fact 里染紫的词
  note?: string;        // 小注（可留空）
  brand?: boolean;      // 录屏全屏，默认不加角标
  cues?: number[];      // [0]=画面退后，[1]=玻璃卡浮起
};

export const frostedFactDefaults: FrostedFactProps = {
  media: 'media/x9-releases.mp4',
  start: 0,
  fact: '苹果芯片的 Mac 选 arm64',
  highlight: 'arm64',
  note: 'Intel 芯片的老 Mac 选 x64',
  brand: false,
};

const RADIUS = 36;
const PAD_X = 92, PAD_TOP = 70, PAD_BOTTOM = 74, NOTE_GAP = 26;

export function FrostedFact(props: Partial<FrostedFactProps>) {
  const c = { ...frostedFactDefaults, ...props };
  const t = useT();

  // —— 终态版式：大字一行按宽度定字号，小注跟随 ——
  const fSize = Math.min(104, 1320 / Math.max(1, textWidth(c.fact, 1)));
  const nSize = c.note ? Math.min(46, 1320 / Math.max(1, textWidth(c.note, 1))) : 0;
  const fW = textWidth(c.fact, fSize), nW = c.note ? textWidth(c.note, nSize) : 0;
  const innerW = Math.max(fW, nW);
  const cardW = Math.max(760, innerW + PAD_X * 2);
  const cardH = PAD_TOP + fSize * 1.16 + (c.note ? NOTE_GAP + nSize * 1.16 : 0) + PAD_BOTTOM;
  const cx = 960, cy = 488;                       // 卡片终态中心：字幕区上方
  const card = { x: cx - cardW / 2, y: cy - cardH / 2, w: cardW, h: cardH };

  // —— 时间 ——
  const recedeAt = cueAt(c.cues, 0, 0.45);
  const riseAt = cueAt(c.cues, 1, recedeAt + 0.25);
  const recede = q(t, recedeAt, recedeAt + 0.6);
  const rise = p(t, riseAt, riseAt + 0.7);
  const frost = q(t, riseAt, riseAt + 0.55);      // 玻璃的雾化程度与浮起同步
  const factIn = p(t, riseAt + 0.3, riseAt + 0.85);
  const noteIn = p(t, riseAt + 0.6, riseAt + 1.05);

  const dy = (1 - rise) * 90;
  const sc = mix(0.94, 1, rise);
  const live = { ...card, y: card.y + dy };

  const hl = c.highlight && c.fact.includes(c.highlight) ? c.highlight : '';
  const [pre, post = ''] = hl ? c.fact.split(hl) : [c.fact];

  return <Frame brand={c.brand ?? false}>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 录屏：轻微失焦 + 提亮退后，仍然看得出是哪一页 */}
      <div style={{ position: 'absolute', inset: 0, filter: recede > 0.01 ? `blur(${6 * recede}px)` : undefined, transform: `scale(${mix(1, 1.02, recede)})` }}>
        <Media src={c.media} box={{ x: 0, y: 0, w: 1920, h: 1080 }} radius={0} start={c.start ?? 0} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0.34 * recede }} />

      {/* 毛玻璃卡：里面是卡片正后方的同一段录屏，重度模糊 + 白雾 */}
      {rise > 0 && <div style={{
        ...abs(live), borderRadius: RADIUS, overflow: 'hidden', opacity: clamp(rise * 2.2),
        transform: `scale(${sc})`, transformOrigin: '50% 60%',
        boxShadow: '0 30px 60px 0 rgba(0,0,0,0.16), 0 16px 25px 0 rgba(0,0,0,0.1333333333)',
      }}>
        <div style={{ position: 'absolute', left: -live.x - 40, top: -live.y - 40, width: 2000, height: 1160, filter: `blur(${mix(4, 15, frost)}px)` }}>
          <Media src={c.media} box={{ x: 40, y: 40, w: 1920, h: 1080 }} radius={0} start={c.start ?? 0}
            style={{ transform: `scale(${mix(1, 1.02, recede)})`, transformOrigin: `${960 + 40}px ${540 + 40}px` }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: mix(0.2, 0.5, frost) }} />
        {/* 玻璃上沿的一层亮面（白色，不是彩色渐变底）*/}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '46%', background: 'linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0))' }} />

        {/* 大字事实：从左向右擦出 */}
        <div style={{
          position: 'absolute', left: (cardW - fW) / 2, top: PAD_TOP, width: fW + fSize * 0.2,
          clipPath: `inset(-10% ${100 * (1 - factIn)}% -10% 0)`, transform: `translateX(${(1 - factIn) * 24}px)`,
        }}>
          <span style={{ ...textBase(fSize, 900), color: S.ink }}>
            {pre}{hl && <span style={{ color: accentOn(false) }}>{hl}</span>}{post}
          </span>
        </div>
        {c.note && <div style={{
          position: 'absolute', left: (cardW - nW) / 2, top: PAD_TOP + fSize * 1.16 + NOTE_GAP,
          opacity: noteIn, transform: `translateY(${(1 - noteIn) * 16}px)`,
        }}>
          <span style={{ ...textBase(nSize, 500), color: S.muted }}>{c.note}</span>
        </div>}
      </div>}
    </Handoff>
    <Sfx name="whoosh-short" at={riseAt} />
    <Sfx name="ding" at={riseAt + 0.55} />
  </Frame>;
}
