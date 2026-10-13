// T11d-AlternateFocus：素材与代码窗口交替聚焦
// 观众要看懂的变化：两组画面 → 轮流清晰、轮流退后
// 升级自 L81-R016：保留“四段素材先排开 → 素材整体失焦退后、前景大字逐句滚动接替 → 大字退下、素材重新清晰”的交替关系与节奏。
// 按 Fred 意见“文字可以改成白色”：前景大字改为白色 MiSans Heavy，素材退后时叠黑色半透明蒙版（DESIGN 2.1 退后规则），
// 白字在任何素材上都读得清；原版紫字、旧字体与字距全部去掉。
import React from 'react';
import { S, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Sfx, textBase, useT } from '../kit/ui';

export type AlternateFocusProps = HandoffProps & {
  media: string[];      // 2–6 段素材（public 相对路径，视频或图片）
  lines: string[];      // 1–3 句前景白字，逐句滚动接替
  highlight?: string;   // 可选：句中染紫的词（深色承载面，#D6BEFF）；默认不染，整句白字
  cues?: number[];      // [0]=素材退后、第一句出现；[1..n-1]=换下一句；[n]=字退下、素材回到清晰
};

export const alternateFocusDefaults: AlternateFocusProps = {
  media: ['media/w4-fred-family.mp4', 'media/w4-fred-conversation.mp4', 'media/w4-fred-team-meeting.mp4', 'media/w4-fred-mic-clip.mp4'],
  lines: ['随身记录', '留下真实经历'],
};

const STAGE = { x: 60, y: 130, w: 1800, h: 920 };   // 素材区：顶部让开右上角标
const GAP = 28;

function grid(n: number) {
  const cols = n <= 2 ? n : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const w = Math.min((STAGE.w - GAP * (cols - 1)) / cols, ((STAGE.h - GAP * (rows - 1)) / rows) * 16 / 9);
  const h = w * 9 / 16;
  const top = STAGE.y + (STAGE.h - (rows * h + (rows - 1) * GAP)) / 2;
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / cols), col = i % cols;
    const inRow = r === rows - 1 ? n - r * cols : cols;
    const left = 960 - (inRow * w + (inRow - 1) * GAP) / 2;
    return { x: left + col * (w + GAP), y: top + r * (h + GAP), w, h };
  });
}

export function AlternateFocus(props: Partial<AlternateFocusProps>) {
  const c = { ...alternateFocusDefaults, ...props };
  const t = useT();
  const media = c.media.slice(0, 6);
  const lines = c.lines.slice(0, 3);
  const boxes = grid(media.length);

  // 节奏：默认 1.5s 退后；每句读 ~1.45s；最后一句读完素材回到清晰
  const step = Math.min(1.45, 3.0 / lines.length);   // 保证素材回清晰后仍有 ≥0.6s 稳定
  const back = cueAt(c.cues, 0, 1.5);
  const swaps = lines.map((_, i) => (i === 0 ? back + 0.3 : cueAt(c.cues, i, back + 0.3 + i * step)));
  const ret = cueAt(c.cues, lines.length, swaps[lines.length - 1] + step);

  // 素材层：退后 = 失焦 16px + 每块素材上的黑蒙版 .5 + 轻微缩小（白画布不被染灰）；回来时反向
  const recede = q(t, back, back + 0.55) * (1 - q(t, ret + 0.05, ret + 0.6));

  // 字号按最长一句自适应，同组共用一个字号与基线
  const longest = Math.max(...lines.map((l) => textWidth(l, 1)));
  const size = Math.min(168, 1500 / Math.max(1, longest));
  const band = size * 1.4;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, filter: recede > 0.001 ? `blur(${recede * 16}px)` : undefined, transform: `scale(${mix(1, 0.97, recede)})`, transformOrigin: '960px 590px' }}>
        {media.map((src, i) => {
          const e = p(t, i * 0.07, i * 0.07 + 0.5);   // 整组自上落入，0.3s 内已可辨认
          const b = boxes[i];
          return <div key={i} style={{ position: 'absolute', left: b.x, top: b.y - (1 - e) * 70, width: b.w, height: b.h, opacity: e, borderRadius: S.radius, boxShadow: S.shadow }}>
            <Media src={src} box={{ x: 0, y: 0, w: b.w, h: b.h }} radius={S.radius} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: S.radius, background: S.dark, opacity: recede * 0.5 }} />
          </div>;
        })}
      </div>
      {/* 前景白字：在一条带内滚动接替（旧句上移退出，新句自下进入），不叠在同一位置 */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 590 - band / 2, height: band, overflow: 'hidden' }}>
        {lines.map((line, i) => {
          const inAt = swaps[i];
          const outAt = i < lines.length - 1 ? swaps[i + 1] : ret;
          // 旧句先上移退出（0.3s），新句稍后自下进入（0.45s），两句不在同一位置重叠
          const vin = p(t, i === 0 ? inAt : inAt + 0.16, (i === 0 ? inAt : inAt + 0.16) + 0.45);
          const vout = q(t, outAt, outAt + 0.3);
          if (vin <= 0 || vout >= 1) return null;
          const y = (1 - vin) * band * 0.8 - vout * band * 0.8;
          const [before, after] = c.highlight && line.includes(c.highlight) ? line.split(c.highlight) : [line, undefined];
          return <div key={i} style={{
            ...textBase(size, 900), position: 'absolute', left: 0, right: 0, top: (band - size * 1.16) / 2, textAlign: 'center',
            color: '#fff', textShadow: S.textShadowDark, opacity: Math.min(vin, 1 - vout), transform: `translateY(${y}px)`,
          }}>
            {before}{after !== undefined && <span style={{ color: S.accentDark }}>{c.highlight}</span>}{after}
          </div>;
        })}
      </div>
    </Handoff>
    <Sfx name="woosh" at={back} />
    {swaps.slice(1).map((s, i) => <Sfx key={i} name="whoosh-short" at={s} volume={0.4} />)}
    <Sfx name="woosh" at={ret} volume={0.4} />
  </Frame>;
}
