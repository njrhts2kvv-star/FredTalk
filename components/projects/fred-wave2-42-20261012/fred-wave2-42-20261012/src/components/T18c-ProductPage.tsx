// T18c-ProductPage：产品官网长页滚动，到卖点处停住标注
// 观众要看懂的变化：一张产品官网长页 → 滚到卖点处停住标注
// 关系：同一张官网长页连续滚动（路过连贯），每到一个卖点停稳：相机推近、其余页面白蒙版失焦，
// 卖点那一块被轻轻提起，旁边落一句黑胶囊卖点；读完收回、继续滚到下一个卖点。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, cameraTransform, clamp, cueAt, mix, p, quintic, springAt, textWidth, wipe } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type SellPoint = {
  box: Box;            // 卖点区域，长页源图像素
  label: string;       // 黑胶囊里的一句卖点
  highlight?: string;  // label 里染紫的词
};

export type ProductPageProps = HandoffProps & {
  page: string;        // 官网长页（竖向拼好的整页截图）
  pageWidth: number;   // 源图像素宽
  pageHeight: number;  // 源图像素高
  points: SellPoint[]; // 1–3 个卖点，按页面从上到下
  cues?: number[];     // 口播时间点：[2i]=开始滚向第 i 个卖点，[2i+1]=第 i 个卖点开始标注
};

export const productPageDefaults: ProductPageProps = {
  page: 'media/w9-doubao-long.jpg',
  pageWidth: 1920,
  pageHeight: 2567,
  points: [
    { box: { x: 1170, y: 960, w: 615, h: 300 }, label: '不用导出再搬运', highlight: '不用导出' },
    { box: { x: 166, y: 1880, w: 610, h: 296 }, label: '只看你有权限的', highlight: '有权限' },
  ],
};

const VIEW = { x: 120, y: 140, w: 1680 };      // 页面卡：底边出画，表示页面还很长
const VIEW_BOTTOM = 1080;
const READ_Y = 610;                             // 卖点停在可视区中线

function Label({ text, keyword, size }: { text: string; keyword?: string; size: number }) {
  const color = S.accentDark;
  if (!keyword || !text.includes(keyword)) return <span style={{ ...textBase(size, 400, S.display), color: '#fff' }}>{text}</span>;
  const i = text.indexOf(keyword);
  return <span style={{ ...textBase(size, 400, S.display), color: '#fff' }}>
    {text.slice(0, i)}<span style={{ color }}>{keyword}</span>{text.slice(i + keyword.length)}
  </span>;
}

export function ProductPage(props: Partial<ProductPageProps>) {
  const c = { ...productPageDefaults, ...props };
  const t = useT();
  const pts = c.points.slice(0, 3);
  const n = pts.length;
  const k = VIEW.w / c.pageWidth;
  const visH = (VIEW_BOTTOM - VIEW.y) / k;
  const maxScroll = Math.max(0, c.pageHeight - visH);

  // —— 时间线：每个卖点 = 滚动（路过）→ 停稳标注（阅读） ——
  const span = n === 1 ? 2.2 : n === 2 ? 2.55 : 1.75;
  const scrollAt = pts.map((_, i) => cueAt(c.cues, 2 * i, 0.35 + i * span));
  const markAt = pts.map((_, i) => cueAt(c.cues, 2 * i + 1, scrollAt[i] + 0.95));
  const targets = pts.map((pt) => clamp(pt.box.y + pt.box.h / 2 - (READ_Y - VIEW.y) / k, 0, maxScroll));

  const scrollOf = (time: number) => {
    let s = 0;
    pts.forEach((_, i) => {
      const from = i === 0 ? 0 : targets[i - 1];
      const dist = Math.abs(targets[i] - from) * k;
      const dur = clamp(0.55 + dist / 2600, 0.6, 1.0);
      s = mix(s, targets[i], wipe(time, scrollAt[i], scrollAt[i] + dur));
    });
    return s;
  };
  const scroll = scrollOf(t);
  const vel = (scrollOf(t + 1 / 60) - scroll) * k;     // 每帧位移（屏幕像素）
  const ghost = clamp(Math.abs(vel) * 0.7, 0, 34);

  // 当前标注强度（前一个卖点在下一次滚动开始前收回）
  const focusOf = (i: number) => {
    const release = i < n - 1 ? scrollAt[i + 1] - 0.08 : 99;
    return quintic(t, markAt[i], markAt[i] + 0.55) * (1 - quintic(t, release, release + 0.42));
  };
  const focus = pts.map((_, i) => focusOf(i));
  let cur = 0;
  focus.forEach((f, i) => { if (f > focus[cur]) cur = i; });
  const f = focus[cur];
  const pt = pts[cur];

  // 区域在页面卡内的屏幕位置（相机之前）
  const rx = VIEW.x + pt.box.x * k, ry = VIEW.y + (pt.box.y - scroll) * k;
  const rw = pt.box.w * k, rh = pt.box.h * k;

  // 胶囊尺寸
  let size = 80;
  while (size > 52 && textWidth(pt.label, size) > 1200) size -= 2;
  const pillH = size * 1.86, pillW = textWidth(pt.label, size) + size * 1.9;
  const gap = 40;

  // 相机：推近到卖点能读清；区域 + 胶囊整组居中
  const zoom = Math.max(1, Math.min(1.7, 1000 / rw, (720 - pillH - gap) / rh));
  const fx = rx + rw / 2, fy = ry + rh / 2 + (pillH + gap) / 2 / zoom;
  const camera = cameraTransform(fx, fy, zoom, f);
  // 相机后的屏幕坐标（与 cameraTransform 同一公式）
  const cfx = mix(960, fx, f), cfy = mix(540, fy, f), z = mix(1, zoom, f);
  const toScreen = (x: number, y: number) => ({ x: (x - cfx) * z + 960, y: (y - cfy) * z + 540 });
  const lift = mix(1, 1.035, f);
  const rTop = toScreen(rx, ry - (lift - 1) * rh / 2), rBot = toScreen(rx + rw, ry + rh + (lift - 1) * rh / 2);
  let pillY = rBot.y + gap;
  if (pillY + pillH > 1040) pillY = rTop.y - gap - pillH;
  const pillX = clamp(rTop.x, 60, 1860 - pillW);
  const pillIn = clamp((t - markAt[cur] - 0.38) / 0.3) * (cur < n - 1 ? 1 - clamp((t - (scrollAt[cur + 1] - 0.08)) / 0.22) : 1);
  const pillPop = springAt(t, markAt[cur] + 0.38, 0.6);

  const enter = p(t, 0, 0.5);
  const pageImg = (extra?: React.CSSProperties) => <Img src={staticFile(c.page)} style={{
    position: 'absolute', left: 0, top: -scroll * k, width: VIEW.w, height: c.pageHeight * k, display: 'block', ...extra,
  }} />;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camera }}>
        {/* 页面卡：真实官网长页，底边出画 */}
        <div style={{
          position: 'absolute', left: VIEW.x, top: VIEW.y + (1 - enter) * 60, width: VIEW.w, height: VIEW_BOTTOM - VIEW.y + 60,
          borderRadius: S.radius, overflow: 'hidden', background: '#fff', boxShadow: S.shadow, opacity: enter,
        }}>
          <div style={{ position: 'absolute', inset: 0, filter: f > 0.01 ? `blur(${14 * f}px)` : undefined }}>
            {pageImg()}
            {ghost > 2 && pageImg({ transform: `translateY(${ghost}px)`, opacity: 0.2 })}
            {ghost > 2 && pageImg({ transform: `translateY(${-ghost}px)`, opacity: 0.2 })}
          </div>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.76 * f }} />
        </div>
        {/* 卖点区域：原像素清楚、轻轻提起 */}
        {f > 0.01 && <div style={{
          position: 'absolute', left: rx, top: ry, width: rw, height: rh, borderRadius: 18, overflow: 'hidden',
          boxShadow: S.shadow, opacity: clamp(f * 1.6), transform: `scale(${lift}) translateY(${-6 * f}px)`, background: '#fff',
        }}>
          <Img src={staticFile(c.page)} style={{
            position: 'absolute', left: -pt.box.x * k, top: -pt.box.y * k, width: VIEW.w, height: c.pageHeight * k,
          }} />
        </div>}
      </div>

      {/* 卖点胶囊：屏幕坐标，不随相机缩放 */}
      {pillIn > 0 && <div style={{
        position: 'absolute', left: pillX, top: pillY + (1 - pillIn) * 18, width: pillW, height: pillH, borderRadius: pillH / 2,
        background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: pillIn, transform: `scale(${mix(0.7, 1, pillPop)})`, transformOrigin: '20% 50%',
      }}>
        <Label text={pt.label} keyword={pt.highlight} size={size} />
      </div>}
    </Handoff>
    {scrollAt.map((a, i) => <Sfx key={`s${i}`} name="slide" at={a} />)}
    {markAt.map((a, i) => <Sfx key={`m${i}`} name="pop" at={a + 0.38} />)}
  </Frame>;
}
