// T09a 点击入口导航：真实界面截图里，相机先推到第一个入口，光标滑入按下；焦点交给第二个入口再点一次。
// 关系：观众始终跟着“下一步点哪里”——同一张界面、同一支光标，焦点从入口 A 交接到入口 B，其余界面白蒙退后。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, mix, p, quintic, textWidth } from '../kit/theme';
import { Box, ClickRing, Cursor, Frame, Sfx, between, textBase, useT } from '../kit/ui';

export type ClickTarget = { x: number; y: number; w: number; h: number; label?: string; labelSide?: 'right' | 'left' | 'above' | 'below' };
export type ClickPathProps = {
  image: string;                       // public/ 下的截图路径
  imageSize: { w: number; h: number }; // 截图原始像素
  clicks: ClickTarget[];               // 源图像素坐标；默认取前两个（只给一个时只点一次）
  timing: { firstClick: number; secondClick: number };
  maxZoom: number;
};

export const clickPathDefaults: ClickPathProps = {
  image: 'media/a-codex-full.png',
  imageSize: { w: 3024, h: 1712 },
  clicks: [
    { x: 118, y: 628, w: 214, h: 62, label: '进入项目' },
    { x: 2104, y: 1596, w: 282, h: 66, label: '切换模型', labelSide: 'above' },
  ],
  timing: { firstClick: 1.45, secondClick: 3.25 },
  maxZoom: 2.3,
};

// FullscreenVideoWindow 1080 逻辑几何
const FULL: Box = { x: 60, y: 33.222106, w: 1800, h: 1013.555787 };
type Cam = { fx: number; fy: number; z: number };

export function ClickPath(props: Partial<ClickPathProps>) {
  const c = { ...clickPathDefaults, ...props, timing: { ...clickPathDefaults.timing, ...props.timing } };
  const t = useT();
  // 源图 → 窗口（cover，居中裁切）
  const k = Math.max(FULL.w / c.imageSize.w, FULL.h / c.imageSize.h);
  const ox = FULL.x + (FULL.w - c.imageSize.w * k) / 2, oy = FULL.y + (FULL.h - c.imageSize.h * k) / 2;
  const toWorld = (b: ClickTarget): Box => ({ x: ox + b.x * k, y: oy + b.y * k, w: b.w * k, h: b.h * k });
  const targets = (c.clicks.length ? c.clicks : clickPathDefaults.clicks).slice(0, 2);
  const boxes = targets.map(toWorld);
  const two = boxes.length > 1;

  // 每个入口的停靠相机：放大到能读，焦点夹在窗口内，不露出窗外空白
  const camFor = (b: Box): Cam => {
    const z = Math.min(c.maxZoom, 1100 / (b.w + 260), 600 / (b.h + 200));
    // 允许露出窗外约 1/4 屏的白底，让贴边入口也能靠近画面中部
    const hx = 960 / z * 0.72, hy = 540 / z * 0.62;
    return {
      z,
      fx: clamp(b.x + b.w / 2, FULL.x + hx, FULL.x + FULL.w - hx),
      fy: clamp(b.y + b.h / 2 - 40 / z, FULL.y + hy, FULL.y + FULL.h - hy),
    };
  };
  const c1 = c.timing.firstClick, c2 = c.timing.secondClick;
  const home: Cam = { fx: 960, fy: 540, z: 1 };
  const s1 = camFor(boxes[0]);
  const s2 = two ? camFor(boxes[1]) : s1;
  const m1 = quintic(t, c1 - 0.95, c1 - 0.35);       // 推到入口 A（0.6s）
  const m2 = two ? quintic(t, c2 - 1.0, c2 - 0.4) : 0; // 横移到入口 B（0.6s）
  const lerpCam = (a: Cam, b: Cam, v: number): Cam => ({ fx: mix(a.fx, b.fx, v), fy: mix(a.fy, b.fy, v), z: mix(a.z, b.z, v) });
  const cam = lerpCam(lerpCam(home, s1, m1), s2, m2);
  const toScreen = (x: number, y: number) => ({ x: (x - cam.fx) * cam.z + 960, y: (y - cam.fy) * cam.z + 540 });

  const enter = p(t, 0, 0.45);
  // 光标：从右下滑入 → A；再滑到 B（ease，比相机略晚出发、先到）
  const pt = (b: Box) => toScreen(b.x + b.w * 0.5, b.y + b.h * 0.86); // 光标尖落在入口下沿，箭身不压字
  const a = pt(boxes[0]), b = two ? pt(boxes[1]) : a;
  const g1 = p(t, c1 - 0.8, c1 - 0.1), g2 = two ? p(t, c2 - 0.85, c2 - 0.1) : 0;
  const start = { x: 1500, y: 1180 };
  const cx = mix(mix(start.x, a.x, g1), b.x, g2), cy = mix(mix(start.y, a.y, g1), b.y, g2);
  const pressAt = (at: number) => clamp(1 - Math.abs(t - at - 0.06) / 0.1);
  const press = Math.max(pressAt(c1), two ? pressAt(c2) : 0);

  // 焦点：按下后其余界面白蒙 .55 退后；交接时焦点框随相机移到 B
  const focus = p(t, c1 + 0.05, c1 + 0.4);
  const hole = two ? between(boxes[0], boxes[1], quintic(t, c2 - 0.95, c2 - 0.35)) : boxes[0];
  const pad = 10 / Math.max(1, cam.z) + 6;

  const label = (i: number) => {
    const tg = targets[i];
    if (!tg?.label) return null;
    const at = i === 0 ? c1 : c2;
    const show = p(t, at + 0.12, at + 0.5) * (i === 0 && two ? 1 - p(t, c2 - 1.05, c2 - 0.8) : 1);
    if (show <= 0) return null;
    const bx = boxes[i];
    const tl = toScreen(bx.x, bx.y), br = toScreen(bx.x + bx.w, bx.y + bx.h);
    const size = 56, h = 104, w = textWidth(tg.label, size) + 92;
    // 按 labelSide 放在目标旁；越界时翻到对侧；避开右上角标区
    const side = tg.labelSide ?? 'right';
    let x: number, y: number;
    if (side === 'above' || side === 'below') {
      x = clamp((tl.x + br.x) / 2 - w / 2, 40, 1880 - w);
      y = side === 'above' ? tl.y - 40 - h : br.y + 70;
      if (y < 40 || y + h > 1040) y = side === 'above' ? br.y + 70 : tl.y - 40 - h;
    } else {
      x = side === 'right' ? br.x + 44 : tl.x - 44 - w;
      if (x + w > 1880 || x < 40) x = side === 'right' ? tl.x - 44 - w : br.x + 44;
      y = (tl.y + br.y) / 2 - h / 2;
    }
    y = clamp(y, x + w > 1530 ? 140 : 40, 1040 - h);
    return <div key={i} style={{
      position: 'absolute', left: x, top: y + (1 - show) * 18, width: w, height: h, borderRadius: h / 2,
      background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: show, transform: `scale(${mix(0.86, 1, show)})`, zIndex: 700,
    }}>
      <span style={{ ...textBase(size, 400, S.display), color: '#fff' }}>{tg.label}</span>
    </div>;
  };

  return <Frame>
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(960px,540px) scale(${cam.z}) translate(${-cam.fx}px,${-cam.fy}px)` }}>
      <div style={{
        position: 'absolute', left: FULL.x, top: FULL.y, width: FULL.w, height: FULL.h, borderRadius: S.radius, overflow: 'hidden',
        boxShadow: S.shadow, background: '#fff', opacity: enter, transform: `scale(${mix(0.965, 1, enter)})`,
      }}>
        <Img src={staticFile(c.image)} style={{ position: 'absolute', left: ox - FULL.x, top: oy - FULL.y, width: c.imageSize.w * k, height: c.imageSize.h * k }} />
        {focus > 0 && <div style={{
          position: 'absolute', left: hole.x - FULL.x - pad, top: hole.y - FULL.y - pad, width: hole.w + pad * 2, height: hole.h + pad * 2,
          borderRadius: 12, boxShadow: `0 0 0 6000px rgba(255,255,255,${0.55 * focus})`,
        }} />}
      </div>
    </div>
    {label(0)}{two && label(1)}
    <ClickRing x={a.x} y={a.y} t={t} at={c1} />
    {two && <ClickRing x={b.x} y={b.y} t={t} at={c2} />}
    <Cursor x={cx - 6} y={cy - 4} scale={1.1} press={press} />
    <Sfx name="whoosh-short" at={c1 - 0.95} />
    <Sfx name="click" at={c1} />
    {two && <Sfx name="click" at={c2} />}
  </Frame>;
}
