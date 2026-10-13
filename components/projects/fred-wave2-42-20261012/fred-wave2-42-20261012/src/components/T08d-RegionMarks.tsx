// T08d-RegionMarks：界面多区域依次标注
// 观众要看懂的变化：一张界面 → 几个区域按顺序被标出
// 关系：同一张界面不换；一块“清楚的窗口”在界面上依次移到第 1、2、3 个区域（其余白蒙版失焦），
// 相机跟着推近；当前区域旁边是一句带编号的黑胶囊说明，离开时说明收成区域角上的编号圆点。
// 最后回到全貌：只剩按顺序排好的编号圆点，观众能对上每块区域刚才讲了什么。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, cameraTransform, clamp, cueAt, mix, p, q, quintic, springAt, textWidth } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Sfx, between, textBase, useT } from '../kit/ui';

export type Region = { box: Box; label: string };   // box 为源图像素

export type RegionMarksProps = HandoffProps & {
  image: string;
  imageWidth: number;
  imageHeight: number;
  regions: Region[];   // 2–5 个，按讲解顺序
  cues?: number[];     // [i]=第 i 个区域被标出；[regions.length]=回到全貌
};

export const regionMarksDefaults: RegionMarksProps = {
  image: 'media/m-form-dot-name.png',
  imageWidth: 1920,
  imageHeight: 1080,
  regions: [
    { box: { x: 330, y: 205, w: 735, h: 205 }, label: '先挑颜色' },
    { box: { x: 330, y: 425, w: 735, h: 410 }, label: '再选角色或宠物' },
    { box: { x: 1092, y: 210, w: 445, h: 640 }, label: '右边预览，满意就保存' },
  ],
};

const AREA = { x: 110, y: 150, w: 1700, h: 900 };   // 界面卡可用区（角标在上方让开）
const DOT = 66;

export function RegionMarks(props: Partial<RegionMarksProps>) {
  const c = { ...regionMarksDefaults, ...props };
  const t = useT();
  const regs = c.regions.slice(0, 5);
  const n = regs.length;

  // 界面卡：按比例放进可用区
  const k = Math.min(AREA.w / c.imageWidth, AREA.h / c.imageHeight);
  const W = c.imageWidth * k, H = c.imageHeight * k;
  const X = AREA.x + (AREA.w - W) / 2, Y = AREA.y + (AREA.h - H) / 2;
  const scr = (b: Box): Box => ({ x: X + b.x * k, y: Y + b.y * k, w: b.w * k, h: b.h * k });
  const boxes = regs.map((r) => scr(r.box));

  // —— 时间线 ——
  const step = n <= 3 ? 1.05 : n === 4 ? 0.82 : 0.66;
  const at = regs.map((_, i) => cueAt(c.cues, i, 0.4 + i * step));
  const backAt = cueAt(c.cues, n, at[n - 1] + Math.max(0.95, step + 0.15));
  const enter = p(t, 0, 0.45);

  // 当前区域索引与窗口在两区域间的搬移进度
  let idx = 0;
  at.forEach((a, i) => { if (t >= a) idx = i; });
  const move = idx === 0 ? 1 : q(t, at[idx], at[idx] + 0.5);
  const prevBox = boxes[Math.max(0, idx - 1)];
  const hole = between(prevBox, boxes[idx], move);
  const on = quintic(t, at[0], at[0] + 0.45) * (1 - quintic(t, backAt, backAt + 0.55));   // 蒙版与相机强度

  const pad = 14;
  // 说明胶囊尺寸（相机要给它留出一侧）
  const pills = regs.map((r) => {
    let size = 64;
    while (size > 42 && textWidth(r.label, size) > 760) size -= 2;
    return { size, h: size * 1.9, w: textWidth(r.label, size) + size * 1.7 };
  });
  const GAP = 34;
  const sideOf = (i: number) => (boxes[i].x + boxes[i].w / 2 > X + W / 2 ? -1 : 1);   // 1=胶囊放右边
  // 相机：推近到当前窗口（不超出能读清所需），区域 + 胶囊整组居中
  const zoomOf = (i: number) => Math.max(1, Math.min(boxes[i].w * boxes[i].h < 60000 ? 1.8 : 1.45, (1760 - pills[i].w - GAP - DOT) / (boxes[i].w + pad * 2), 700 / (boxes[i].h + pad * 2)));
  const camXOf = (i: number) => boxes[i].x + boxes[i].w / 2 + sideOf(i) * (pills[i].w + GAP + (sideOf(i) < 0 ? DOT : 0)) / 2 / zoomOf(i);
  const pi = Math.max(0, idx - 1);
  const zoom = mix(zoomOf(pi), zoomOf(idx), move);
  const camX = mix(camXOf(pi), camXOf(idx), move);
  const camera = cameraTransform(camX, hole.y + hole.h / 2, zoom, on);
  const cfx = mix(960, camX, on), cfy = mix(540, hole.y + hole.h / 2, on), z = mix(1, zoom, on);
  const toScreen = (x: number, y: number) => ({ x: (x - cfx) * z + 960, y: (y - cfy) * z + 540 });

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camera }}>
        {/* 界面全貌：退后时白蒙版 + 失焦 */}
        <div style={{
          position: 'absolute', left: X, top: Y + (1 - enter) * 50, width: W, height: H, borderRadius: S.radius, overflow: 'hidden',
          boxShadow: S.shadow, opacity: enter,
        }}>
          <Img src={staticFile(c.image)} style={{ width: W, height: H, display: 'block', filter: on > 0.01 ? `blur(${13 * on}px)` : undefined }} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.76 * on }} />
        </div>
        {/* 清楚的窗口：在区域间搬移，里面是原像素 */}
        {on > 0.01 && <div style={{
          position: 'absolute', left: hole.x - pad, top: hole.y - pad, width: hole.w + pad * 2, height: hole.h + pad * 2,
          borderRadius: 20, overflow: 'hidden', boxShadow: S.shadow, opacity: clamp(on * 1.6), background: '#fff',
        }}>
          <Img src={staticFile(c.image)} style={{ position: 'absolute', left: X - hole.x + pad, top: Y - hole.y + pad, width: W, height: H }} />
        </div>}
      </div>

      {/* 编号圆点：区域左上角，跟随相机位置但不随相机放大 */}
      {regs.map((_, i) => {
        if (t < at[i] + 0.12) return null;
        const b = boxes[i];
        const pos = toScreen(b.x - pad - 4, b.y + Math.min(46, b.h / 2));
        const pop = springAt(t, at[i] + 0.12, 0.6);
        const current = i === idx && t < backAt;
        return <div key={i} style={{
          position: 'absolute', left: pos.x - DOT / 2, top: pos.y - DOT / 2, width: DOT, height: DOT, borderRadius: DOT / 2,
          background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${mix(0.3, 1, pop)})`, opacity: clamp((t - at[i] - 0.12) / 0.12), zIndex: 20,
        }}>
          <span style={{ ...textBase(40, 900), lineHeight: 1, color: current ? S.accentDark : '#fff' }}>{i + 1}</span>
        </div>;
      })}

      {/* 当前区域的说明胶囊：只在讲到它时出现，下一块开始时收回 */}
      {regs.map((r, i) => {
        const inV = p(t, at[i] + 0.3, at[i] + 0.62);
        const end = i < n - 1 ? at[i + 1] : backAt;
        const outV = clamp((t - end) / 0.2);
        const v = inV * (1 - outV);
        if (v <= 0) return null;
        const { size, h, w } = pills[i];
        const b = boxes[i];
        const placeRight = sideOf(i) === 1;
        const right = toScreen(b.x + b.w + pad, b.y + b.h / 2);
        const left = toScreen(b.x - pad, b.y + b.h / 2);
        const x = placeRight ? Math.min(right.x + GAP, 1880 - w) : Math.max(40, left.x - GAP - DOT / 2 - 8 - w);
        const y = clamp(right.y - h / 2, 140, 1040 - h);
        return <div key={i} style={{
          position: 'absolute', left: x + (1 - v) * (placeRight ? -24 : 24), top: y, width: w, height: h, borderRadius: h / 2,
          background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: v, zIndex: 30,
        }}>
          <span style={{ ...textBase(size, 400, S.display), color: '#fff', lineHeight: 1 }}>{r.label}</span>
        </div>;
      })}
    </Handoff>
    {at.map((a, i) => <Sfx key={i} name={i === 0 ? 'whoosh-short' : 'slide'} at={a} />)}
    <Sfx name="woosh" at={backAt} />
  </Frame>;
}
