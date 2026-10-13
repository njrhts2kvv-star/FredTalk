// T20f-ResultFirst：先看结果再倒回来
// 观众要看懂的变化：成品画面全屏 → 缩到一角，标题“这是怎么做的”落定
// 关系：开场直接是成片（全屏、在播放）；读到一个精彩瞬间后，同一段画面不中断地 quintic 缩成右上卡片
// （角标让开，卡片在角标下方），左侧标题逐行从基线下方升起落定，卡片仍在继续播放，带着观众“倒回去”看做法。
// 与库内区分：T20a 是作品墙推近一张 + 钩子胶囊；T20c 是更新快闪；这里是“同一段成片从全屏让位成角落卡片”，
// 成片与问题同屏并存，画面时钟连续。
// 素材：Fred 第 110 期成片 EP110-final-v1-4K60.mp4 的 25.0–30.6s（3D 运镜扫过组件库），
// 裁掉底部烧录字幕带后缩成 1920×1080：public/media/x9-ep110-result.mp4。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, quintic, springAt, textWidth } from '../kit/theme';
import { Box, Brand, Frame, Handoff, HandoffProps, Media, Sfx, textBase, useT } from '../kit/ui';

export type ResultFirstProps = HandoffProps & {
  media: string;        // 成片视频或截图（public 相对路径，16:9）
  start?: number;       // 视频从第几秒开始播
  title: string;        // 标题；用 \n 指定换行，不写时按宽度自动分行
  highlight: string;    // title 里染紫的词
  badge?: string;       // 卡片左下的小胶囊（如“成品”），留空不显示
  cues?: number[];      // [0]=开始缩小，[1]=标题开始落定
};

export const resultFirstDefaults: ResultFirstProps = {
  media: 'media/x9-ep110-result.mp4',
  start: 0,
  title: '这是\n怎么做的？',
  highlight: '怎么做',
  badge: '成品',
};

const FULL: Box = { x: 0, y: 0, w: 1920, h: 1080 };
const CARD_W = 1000;
const CARD: Box = { x: 1920 - 84 - CARD_W, y: 206, w: CARD_W, h: CARD_W * 9 / 16 };   // 顶边在角标下方（角标底 121），整组在字幕区上方居中
const COL = { x: 112, w: CARD.x - 112 - 76 };                                         // 左侧标题栏

// 自动分行：按目标行宽均分；英文/数字整词不拆，标点不放行首，优先在标点后、不在强调词中间断开
function splitTitle(title: string, maxUnits: number, highlight: string): string[] {
  if (title.includes('\n')) return title.split('\n').filter(Boolean);
  const total = textWidth(title, 1);
  if (total <= maxUnits) return [title];
  const tokens = title.match(/[A-Za-z0-9.\-_]+ ?|[，。、？！：；,.?!:;）)」”]+|./gu) ?? [title];
  // 标点并到前一个 token
  const toks: string[] = [];
  tokens.forEach((tk) => { if (/^[，。、？！：；,.?!:;）)」”]+$/.test(tk) && toks.length) toks[toks.length - 1] += tk; else toks.push(tk); });
  const L = Math.ceil(total / maxUnits);
  const hiA = highlight ? title.indexOf(highlight) : -1, hiB = hiA < 0 ? -1 : hiA + highlight.length;
  const lines: string[] = [];
  let start = 0, pos = 0;
  const offsets = toks.map((tk) => { const o = pos; pos += tk.length; return o; });
  for (let k = 1; k < L; k++) {
    const target = (total * k) / L;
    let best = -1, bestScore = Infinity, acc = textWidth(toks.slice(0, start).join(''), 1);
    for (let i = start + 1; i < toks.length; i++) {
      acc += textWidth(toks[i - 1], 1);
      const off = offsets[i];
      const score = Math.abs(acc - target) - (/[，。、？！：；,.?!:;]$/.test(toks[i - 1]) ? 2.2 : 0) + (off > hiA && off < hiB ? 4 : 0);
      if (score < bestScore) { bestScore = score; best = i; }
    }
    if (best < 0) break;
    lines.push(toks.slice(start, best).join('').trim());
    start = best;
  }
  lines.push(toks.slice(start).join('').trim());
  return lines.filter(Boolean);
}

export function ResultFirst(props: Partial<ResultFirstProps>) {
  const c = { ...resultFirstDefaults, ...props };
  const t = useT();

  // —— 时间 ——
  const shrinkAt = cueAt(c.cues, 0, 1.35);
  const shrinkDur = 0.8;
  const titleAt = cueAt(c.cues, 1, shrinkAt + 0.42);
  const shrink = quintic(t, shrinkAt, shrinkAt + shrinkDur);

  // —— 卡片：同一段视频从全屏连续缩到右上（只用 transform，媒体时钟不中断）——
  const s = mix(1, CARD.w / FULL.w, shrink);
  const x = mix(FULL.x, CARD.x, shrink), y = mix(FULL.y, CARD.y, shrink);
  const radius = mix(0, S.radius, q(t, shrinkAt, shrinkAt + shrinkDur * 0.6));
  const shadowK = clamp(shrink * 1.4);

  // —— 标题：按左栏宽度定字号，整块与卡片垂直居中 ——
  const lines = splitTitle(c.title, COL.w / 100, c.highlight);   // 不写 \n 时：每行至少保持约 100px 大字
  const maxUnits = Math.max(1, ...lines.map((l) => textWidth(l, 1)));
  const latinish = /[A-Za-z0-9]/.test(c.title) ? 1.08 : 1;   // MiSans Heavy 拉丁字母比估算宽，留余量
  const size = Math.min(150, COL.w / (maxUnits * latinish), 560 / (lines.length * 1.18));
  const LH = size * 1.18;
  const blockH = lines.length * LH;
  const top = CARD.y + CARD.h / 2 - blockH / 2 - size * 0.04;
  const hiStart = c.highlight ? c.title.replace(/\n/g, '').indexOf(c.highlight) : -1;
  let offset = 0;
  const lineParts = lines.map((l) => {
    const a = offset; offset += Array.from(l).length;
    if (hiStart < 0) return [l, '', ''];
    const chars = Array.from(l);
    const s0 = clamp(hiStart - a, 0, chars.length), s1 = clamp(hiStart + Array.from(c.highlight).length - a, 0, chars.length);
    return [chars.slice(0, s0).join(''), chars.slice(s0, s1).join(''), chars.slice(s1).join('')];
  });

  // 小胶囊：卡片落定后压在卡片左下角
  const badgeAt = shrinkAt + shrinkDur + 0.05;
  const bPop = springAt(t, badgeAt, 0.6);
  const bSize = 44, bH = bSize * 1.9, bW = c.badge ? textWidth(c.badge, bSize) + bSize * 1.5 : 0;
  const brandIn = q(t, shrinkAt + shrinkDur * 0.5, shrinkAt + shrinkDur + 0.1);

  return <Frame brand={false}>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 成片：全屏 → 右上卡片 */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: FULL.w, height: FULL.h, transformOrigin: '0 0',
        transform: `translate(${x}px, ${y}px) scale(${s})`, borderRadius: radius / s, overflow: 'hidden',
        boxShadow: `0 ${24 / s}px ${40 / s}px 0 rgba(0,0,0,${0.2 * shadowK})`, background: S.dark,
      }}>
        <Media src={c.media} box={FULL} radius={0} start={c.start ?? 0} />
      </div>

      {/* 左侧标题：逐行从基线下方升起（行内裁切，不淡入叠字）*/}
      {lineParts.map((parts, i) => {
        const v = p(t, titleAt + i * 0.1, titleAt + i * 0.1 + 0.62);
        if (v <= 0) return null;
        return <div key={i} style={{ position: 'absolute', left: COL.x, top: top + i * LH, height: LH, width: COL.w + 40, overflow: 'hidden' }}>
          <div style={{ ...textBase(size, 900), lineHeight: `${LH}px`, color: S.ink, transform: `translateY(${(1 - v) * LH * 0.9}px)` }}>
            {parts[0]}<span style={{ color: accentOn(false) }}>{parts[1]}</span>{parts[2]}
          </div>
        </div>;
      })}

      {c.badge && t >= badgeAt && <div style={{
        position: 'absolute', left: CARD.x - bW * 0.28, top: CARD.y + CARD.h - bH * 0.62, width: bW, height: bH, borderRadius: bH / 2,
        background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${mix(0.5, 1, bPop)})`, opacity: clamp((t - badgeAt) / 0.1),
      }}>
        <span style={{ ...textBase(bSize, 400, S.display), color: '#fff' }}>{c.badge}</span>
      </div>}
    </Handoff>
    {/* 角标：全屏播放时不加，缩成卡片后再出现 */}
    {brandIn > 0 && <div style={{ position: 'absolute', inset: 0, opacity: brandIn }}><Brand /></div>}
    <Sfx name="woosh" at={shrinkAt} />
    {c.badge && <Sfx name="pop" at={badgeAt} />}
  </Frame>;
}
