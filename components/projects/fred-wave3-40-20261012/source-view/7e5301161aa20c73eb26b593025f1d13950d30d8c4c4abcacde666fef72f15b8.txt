// T22b-NewsStack：新闻叠放
// 观众要看懂的变化：几条新闻标题卡 → 快速叠落，最后一张停在最前
// 关系：几条真实新闻页头截图像一张张报纸从镜头前落到桌面上（由大变小、带旋转，落下轻弹一下），
// 一张压一张叠成一摞；最后一张落下后摆正、放大到能读清标题，下面那几张失焦退后，只当“最近很多这样的新闻”的上下文。
// 每张卡左上角压一枚黑胶囊写来源和日期，随卡片一起动。
// 与库内区分：NMC01 是关键词快闪（同一个词在多张页面上对齐闪切）；这里是整张标题卡叠落成摞、最后一张接管阅读。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type NewsItem = {
  image: string;      // 新闻页头截图（标题 + 署名日期），public 相对路径
  width: number;      // 源图像素宽
  height: number;     // 源图像素高
  source: string;     // 来源，例如 TechCrunch
  date: string;       // 日期，例如 10月1日
};

export type NewsStackProps = HandoffProps & {
  items: NewsItem[];  // 2–5 条，最后一条停在最前
  cues?: number[];    // [i]=第 i 张开始落下；[n]=最后一张摆正放大
};

// 默认：TechCrunch 2026 年 9–10 月的真实报道（无登录截图），最后一张是 Jev 相关
export const newsStackDefaults: NewsStackProps = {
  items: [
    { image: 'media/x7-news-1.jpg', width: 2640, height: 1180, source: 'TechCrunch', date: '10月8日' },
    { image: 'media/x7-news-2.jpg', width: 2640, height: 1180, source: 'TechCrunch', date: '10月8日' },
    { image: 'media/x7-news-3.jpg', width: 2640, height: 1180, source: 'TechCrunch', date: '9月30日' },
    { image: 'media/x7-news-4.jpg', width: 2640, height: 1180, source: 'TechCrunch', date: '10月1日' },
  ],
};

// 叠放时每张的落点（相对画面中心的偏移、角度）；按顺序左右交替，最后一张靠中
const REST = [
  { dx: -150, dy: -34, r: -7 },
  { dx: 150, dy: -6, r: 5.5 },
  { dx: -70, dy: 40, r: -3.5 },
  { dx: 96, dy: 22, r: 4 },
  { dx: -20, dy: -16, r: -2 },
];
const CX = 960, CY = 560;
const PILE_W = 1060;     // 叠放时的卡宽
const FRONT_MAX = { w: 1600, h: 720 };   // 最后一张摆正后的上限（标题字高约 48px）

function Chip({ source, date, scale, opacity }: { source: string; date: string; scale: number; opacity: number }) {
  const size = 30 * scale, h = 64 * scale;
  const w = textWidth(source, size) + textWidth(date, size) + size * 0.7 + h * 0.9;
  return <div style={{
    position: 'absolute', left: 30 * scale, top: -h * 0.42, width: w, height: h, borderRadius: h / 2, background: S.dark,
    boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size * 0.7, opacity,
  }}>
    <span style={{ ...textBase(size, 900), color: '#fff' }}>{source}</span>
    <span style={{ ...textBase(size, 500), color: S.faint }}>{date}</span>
  </div>;
}

export function NewsStack(props: Partial<NewsStackProps>) {
  const c = { ...newsStackDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 5);
  const n = items.length;

  // 默认节奏：间隔逐渐拉开（0.37 → 0.42s），不机械等距
  const dropAt = items.map((_, i) => cueAt(c.cues, i, 0.05 + i * 0.37 + i * i * 0.02));
  const frontAt = cueAt(c.cues, n, dropAt[n - 1] + 0.78);
  const front = q(t, frontAt, frontAt + 0.62);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {items.map((it, i) => {
        const last = i === n - 1;
        const rest = last ? { dx: 0, dy: 18, r: 2.5 } : REST[i % REST.length];
        const aspect = it.height / it.width;
        // 摆正后的尺寸：宽 1600 以内、高 720 以内
        const fw = Math.min(FRONT_MAX.w, FRONT_MAX.h / aspect);
        const fall = p(t, dropAt[i], dropAt[i] + 0.42);           // 位置 / 角度：ease-out 落到点上
        const thud = springAt(t, dropAt[i], 0.6);                  // 尺寸：从镜头前落到桌面，轻弹一下
        if (t < dropAt[i]) return null;
        // 起点：离镜头更近（更大）、更偏外侧、角度更大
        const x0 = CX + rest.dx * 1.55, y0 = CY + rest.dy - 90;
        let x = mix(x0, CX + rest.dx, fall), y = mix(y0, CY + rest.dy, fall);
        let rot = mix(rest.r * 2.4, rest.r, fall);
        let s = mix(1.18, 1, thud);
        let w = PILE_W;
        // 后落下的卡压上来时，下面的卡被轻轻压实（下沉 + 微缩）
        const pressed = items.slice(i + 1).reduce((a, _, j) => a + p(t, dropAt[i + 1 + j] + 0.3, dropAt[i + 1 + j] + 0.5), 0);
        y += pressed * 5; s *= 1 - pressed * 0.008;
        // 最后一张：摆正、放大、回到中心
        if (last) { x = mix(x, CX, front); y = mix(y, 540, front); rot = mix(rot, 0, front); w = mix(PILE_W, fw, front); }
        const h = w * aspect;
        // 来源胶囊只留最上面一张：下一张落下时收掉，避免几枚胶囊叠在同一个角
        const chipOn = i < n - 1 ? 1 - p(t, dropAt[i + 1] + 0.12, dropAt[i + 1] + 0.3) : 1;
        // 下面几张：最后一张接管时失焦退后
        const recede = last ? 0 : front;
        return <div key={i} style={{
          position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, zIndex: i,
          transform: `rotate(${rot}deg) scale(${s * mix(1, 0.94, recede)})`, opacity: Math.min(1, (t - dropAt[i]) / 0.05),
          filter: recede > 0.01 ? `blur(${6 * recede}px)` : undefined,
        }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: S.radius, overflow: 'hidden', boxShadow: S.shadow, background: '#fff' }}>
            <Img src={staticFile(it.image)} style={{ width: '100%', height: '100%', display: 'block' }} />
            {recede > 0 && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.55 * recede }} />}
          </div>
          <Chip source={it.source} date={it.date} scale={Math.min(1.2, w / PILE_W)} opacity={chipOn} />
        </div>;
      })}
    </Handoff>
    <Sfx name="whoosh-short" at={dropAt[0]} />
    <Sfx name="whoosh-short" at={dropAt[n - 1]} volume={0.4} />
    <Sfx name="woosh" at={frontAt} />
  </Frame>;
}
