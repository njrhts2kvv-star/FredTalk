// T09o-ZoomLens：放大镜看细节
// 观众要看懂的变化：画面不动 → 一个圆形放大镜移到细节处放大
// 关系：同一张真实截图全程不动（不推相机），只有一枚圆形镜片在画面上移动：镜片里是同一位置 2–3 倍的原像素，
// 镜片外轻暗。镜片滑到第 1 处停稳，旁边黑胶囊从镜片边擦出一句说明；说明收回后镜片沿行滑到第 2 处，再停稳读。
// 与库内区分：T09a / T08d / T18c 是相机推近整张界面；T09n 是整屏虚化接管。这里全局不动，只放大局部，
// 观众始终看得到“细节在整页的哪个位置”。
// 素材：114 期 LosslessCut Releases 页 Assets 列表真实截图 gh-losslesscut-assets.png（3840×2160，无登录公开页）。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, quintic, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type LensStop = {
  x: number; y: number;      // 镜片中心对准的源图像素
  label?: string;            // 停稳后镜片旁的一句说明（可留空）
  highlight?: string;        // label 里染紫的词
};

export type ZoomLensProps = HandoffProps & {
  image: string;
  imageSize: { w: number; h: number };
  view: { x: number; y: number; w: number; h: number };   // 源图里铺满画面的区域（按 cover 铺满，全程不动）
  stops: LensStop[];         // 1–3 处，按讲解顺序
  from?: { x: number; y: number };   // 镜片出现的位置（源图像素），默认在第 1 处右侧同一行
  zoom: number;              // 镜片放大倍数（相对画面上的原图），2–3
  radius: number;            // 镜片半径（1080 逻辑 px）
  brand?: boolean;           // 截图全屏，默认不加角标
  cues?: number[];           // [i]=镜片停到第 i 处
};

export const zoomLensDefaults: ZoomLensProps = {
  image: 'media/gh-losslesscut-assets.png',
  imageSize: { w: 3840, h: 2160 },
  // Assets 表整块：上边落在 Assets 上方的分隔线留白，下边落在表格底边与表情行之间
  view: { x: 427, y: 140, w: 2987, h: 1680 },
  stops: [
    { x: 1024, y: 851, label: '苹果芯片的 Mac 下这个', highlight: '苹果芯片' },
    { x: 1005, y: 1115, label: 'Intel 芯片的 Mac 下这个', highlight: 'Intel' },
  ],
  zoom: 1.85,
  radius: 272,
  brand: false,
};

const EDGE = 28, SAFE_BOTTOM = 900;   // 镜片不出画；停稳时镜片在字幕区上方。说明胶囊左右留 80

export function ZoomLens(props: Partial<ZoomLensProps>) {
  const c = { ...zoomLensDefaults, ...props };
  const t = useT();
  const stops = (c.stops.length ? c.stops : zoomLensDefaults.stops).slice(0, 3);
  const n = stops.length;
  const R = c.radius;
  const M = c.zoom;

  // —— 截图铺满（cover），全程不动 ——
  const k = Math.max(1920 / c.view.w, 1080 / c.view.h);
  const ox = (1920 - c.view.w * k) / 2 - c.view.x * k;
  const oy = (1080 - c.view.h * k) / 2 - c.view.y * k;
  const W = c.imageSize.w * k, H = c.imageSize.h * k;
  const toScreen = (s: { x: number; y: number }) => ({ x: ox + s.x * k, y: oy + s.y * k });
  const keep = (pt: { x: number; y: number }) => ({
    x: clamp(pt.x, EDGE + R, 1920 - EDGE - R),
    y: clamp(pt.y, EDGE + R, SAFE_BOTTOM - R),
  });

  // —— 说明胶囊尺寸（先算终态，决定放镜片左边还是右边）——
  const GAP = 34;
  const pills = stops.map((s) => {
    if (!s.label) return null;
    const size = Math.min(54, 760 / Math.max(1, textWidth(s.label, 1)));
    return { size, h: size * 1.9, w: textWidth(s.label, size) + size * 1.6 };
  });
  const targets = stops.map((s) => keep(toScreen(s)));
  const sideOf = (i: number) => {
    const pl = pills[i];
    if (!pl) return 1;
    return targets[i].x + R + GAP + pl.w <= 1920 - 80 ? 1 : -1;
  };

  // —— 时间 ——
  const MOVE = 0.7;
  // 默认节奏：最后一处在 3.4s 前停稳，留 ≥1.2s 读最后一句
  const step = n <= 2 ? 1.75 : 2.15 / (n - 1);
  const at = stops.map((_, i) => cueAt(c.cues, i, 1.25 + i * step));
  const appear = 0.22;
  const start = keep(toScreen(c.from ?? { x: stops[0].x + 1150, y: stops[0].y }));
  // 镜片中心：出现点 → 第 1 处 → 第 2 处…（quintic，两端零速度，停稳时完全静止）
  // 目标贴边时镜片被挪进画面，镜片里仍对准目标本身（offset = 目标真实位置 − 镜片位置）
  const raw = stops.map((s) => toScreen(s));
  let lx = start.x, ly = start.y, offX = 0, offY = 0;
  stops.forEach((_, i) => {
    const v = quintic(t, at[i] - MOVE, at[i]);
    lx = mix(lx, targets[i].x, v);
    ly = mix(ly, targets[i].y, v);
    offX = mix(offX, raw[i].x - targets[i].x, v);
    offY = mix(offY, raw[i].y - targets[i].y, v);
  });
  const pop = springAt(t, appear, 0.62);
  const on = clamp((t - appear) / 0.16);
  const dim = q(t, appear, appear + 0.5);

  // 镜片里看到的源图位置（镜片中心下方的那一点，贴边时加 offset）
  const srcX = (lx + offX - ox) / k, srcY = (ly + offY - oy) / k;
  const scale = mix(0.42, 1, pop);
  const r = R * scale;

  // 当前说明：停稳后 0.12s 擦出，下一次移动前 0.12s 收回
  const labelState = stops.map((_, i) => {
    const inV = p(t, at[i] + 0.12, at[i] + 0.5);
    const outV = i < n - 1 ? q(t, at[i + 1] - MOVE - 0.2, at[i + 1] - MOVE + 0.02) : 0;
    return inV * (1 - outV);
  });

  return <Frame brand={c.brand ?? false}>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 原画面：全程不动 */}
      <Img src={staticFile(c.image)} style={{ position: 'absolute', left: ox, top: oy, width: W, height: H }} />

      {/* 外部轻暗：镜片位置留出一个圆洞 */}
      {on > 0 && <div style={{
        position: 'absolute', left: lx - r, top: ly - r, width: r * 2, height: r * 2, borderRadius: '50%',
        boxShadow: `0 0 0 4000px rgba(0,0,0,${0.3 * dim})`,
      }} />}

      {/* 镜片：同一位置的原像素放大 M 倍；白圈 + 阴影 */}
      {on > 0 && <div style={{
        position: 'absolute', left: lx - r, top: ly - r, width: r * 2, height: r * 2, borderRadius: '50%',
        overflow: 'hidden', background: '#fff', opacity: on,
        boxShadow: '0 26px 44px 0 rgba(0,0,0,0.32)',
      }}>
        <Img src={staticFile(c.image)} style={{
          position: 'absolute', left: r - srcX * k * M * scale, top: r - srcY * k * M * scale,
          width: W * M * scale, height: H * M * scale, maxWidth: 'none',
        }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 0 ${10 * scale}px #fff, inset 0 0 18px ${12 * scale}px rgba(0,0,0,0.10)` }} />
      </div>}

      {/* 说明胶囊：从镜片边沿横向擦出，不随镜片移动（只在停稳时出现）*/}
      {stops.map((s, i) => {
        const pl = pills[i];
        const v = labelState[i];
        if (!pl || v <= 0) return null;
        const side = sideOf(i);
        const tg = targets[i];
        const x = side === 1 ? tg.x + R + GAP : tg.x - R - GAP - pl.w;
        const y = tg.y - pl.h / 2;
        const hl = s.highlight && s.label!.includes(s.highlight) ? s.highlight : '';
        const [pre, post = ''] = hl ? s.label!.split(hl) : [s.label!];
        const inset = 100 * (1 - v);
        return <div key={i} style={{
          position: 'absolute', left: x + (1 - v) * -side * 26, top: y, width: pl.w, height: pl.h, borderRadius: pl.h / 2,
          background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
          clipPath: side === 1 ? `inset(0 ${inset}% 0 0 round ${pl.h / 2}px)` : `inset(0 0 0 ${inset}% round ${pl.h / 2}px)`,
        }}>
          <span style={{ ...textBase(pl.size, 400, S.display), color: '#fff' }}>
            {pre}{hl && <span style={{ color: accentOn(true) }}>{hl}</span>}{post}
          </span>
        </div>;
      })}
    </Handoff>
    <Sfx name="pop" at={appear} />
    {at.map((a, i) => <Sfx key={i} name="slide" at={a - MOVE} volume={0.4} />)}
  </Frame>;
}
