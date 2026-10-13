// T09f-BatchQueue：批量入队：逐项选中，计数跳动
// 观众要看懂的变化：一列待处理 → 逐项勾选进入队列，计数增加
// 关系：同一张真实列表截图。相机推近列表，每行左侧出现勾选圈；光标逐项点选，
// 被选中那一行的真实像素复制出来飞进右侧黑色队列胶囊，胶囊里的数字跳一格；没选的行保持原样。
// 坐标全部是源图像素，换截图只改 props。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, quintic, textWidth } from '../kit/theme';
import { Box, ClickRing, Cursor, Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

type Rect = { x: number; y: number; w: number; h: number };
export type BatchQueueProps = HandoffProps & {
  image: string;                          // public/ 下的真实列表截图
  imageSize: { w: number; h: number };
  crop?: Rect;                            // 只显示源图的这一块（去黑边等）；省略=整张
  rows: Rect[];                           // 列表各行（源图像素），2–8 行
  pick: number[];                         // 按顺序勾选哪些行（rows 的下标）
  label: string;                          // 队列胶囊上的文字
  unit: string;                           // 数字后的单位
  cues?: number[];                        // [i]=第 i 次勾选的点击时间
};

export const batchQueueDefaults: BatchQueueProps = {
  image: 'media/m-queue-codex-sidebar.png',
  imageSize: { w: 2560, h: 1442 },
  crop: { x: 44, y: 0, w: 2516, h: 1417 },
  rows: [
    { x: 58, y: 777, w: 532, h: 56 },
    { x: 58, y: 836, w: 532, h: 56 },
    { x: 58, y: 895, w: 532, h: 56 },
    { x: 58, y: 954, w: 532, h: 56 },
    { x: 58, y: 1012, w: 532, h: 56 },
  ],
  pick: [0, 1, 2, 4],
  label: '已加入队列',
  unit: '项',
};

const FULL: Box = { x: 60, y: 33.222106, w: 1800, h: 1013.555787 };

function Check({ size, on }: { size: number; on: number }) {
  return <div style={{ position: 'relative', width: size, height: size }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: size, background: '#fff', boxShadow: `inset 0 0 0 ${Math.max(3, size * 0.07)}px #a3a3ab` }} />
    <div style={{ position: 'absolute', inset: 0, borderRadius: size, background: S.accent, transform: `scale(${on})` }} />
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0, opacity: on }}>
      <path d="M6.5 12.5 L10.5 16.2 L17.5 8.3" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="18" strokeDashoffset={18 * (1 - on)} />
    </svg>
  </div>;
}

export function BatchQueue(props: Partial<BatchQueueProps>) {
  const c = { ...batchQueueDefaults, ...props };
  const rows = (c.rows.length ? c.rows : batchQueueDefaults.rows).slice(0, 8);
  const pick = c.pick.filter((i) => i >= 0 && i < rows.length).slice(0, rows.length);
  const crop = c.crop ?? { x: 0, y: 0, w: c.imageSize.w, h: c.imageSize.h };
  const t = useT();

  // 源图（裁切区）→ 舞台（cover，居中）
  const k = Math.max(FULL.w / crop.w, FULL.h / crop.h);
  const ox = FULL.x + (FULL.w - crop.w * k) / 2 - crop.x * k, oy = FULL.y + (FULL.h - crop.h * k) / 2 - crop.y * k;
  const W = (r: Rect): Box => ({ x: ox + r.x * k, y: oy + r.y * k, w: r.w * k, h: r.h * k });
  const boxes = rows.map(W);

  // 时间：推近列表 → 勾选圈出现 → 按 cue 逐项勾选；落进队列后计数 +1
  const defaults = [1.2, 1.78, 2.38, 2.92, 3.42, 3.88, 4.3, 4.7];
  const gap = pick.length > 4 ? 0.48 : 0.58;
  const selAt = (i: number) => cueAt(c.cues, i, pick.length > 4 ? 1.15 + i * gap + (i % 2) * 0.05 : defaults[i]);
  const FLY = 0.55;
  const landAt = (i: number) => selAt(i) + FLY;

  // 相机：列表放到左半屏中部，放大到行文字读得清
  const x0 = Math.min(...boxes.map((b) => b.x)), x1 = Math.max(...boxes.map((b) => b.x + b.w));
  const y0 = Math.min(...boxes.map((b) => b.y)), y1 = Math.max(...boxes.map((b) => b.y + b.h));
  const z = Math.min(2.6, 900 / (x1 - x0), 820 / (y1 - y0));
  const LIST_CX = 560;
  const tgt = { fx: (x0 + x1) / 2 + (960 - LIST_CX) / z, fy: (y0 + y1) / 2 };
  const push = quintic(t, 0.12, 0.72);
  const cam = { fx: mix(960, tgt.fx, push), fy: mix(540, tgt.fy, push), z: mix(1, z, push) };
  const toScreen = (x: number, y: number) => ({ x: (x - cam.fx) * cam.z + 960, y: (y - cam.fy) * cam.z + 540 });

  const enter = p(t, 0, 0.35);

  // 队列胶囊（屏幕空间，右侧）
  const count = pick.filter((_, i) => t >= landAt(i)).length;
  const lastLand = pick.length ? landAt(pick.length - 1) : 2;
  const NUM = 120, LAB = 52;
  const digits = String(Math.max(pick.length, 9)).length;
  const numW = digits * NUM * 0.62;
  const QW = 64 + textWidth(c.label, LAB) + 30 + numW + 14 + textWidth(c.unit, LAB) + 64;
  const QH = 190;
  const Q: Box = { x: Math.min(1860 - QW, 1240), y: 330, w: QW, h: QH };
  const qShow = p(t, 0.55, 0.95);
  const numX = Q.x + 64 + textWidth(c.label, LAB) + 30;
  const target = { x: numX + numW / 2, y: Q.y + QH / 2 };
  // 数字滚动：最近一次落入的时刻
  const lastI = count - 1;
  const roll = lastI >= 0 ? p(t, landAt(lastI), landAt(lastI) + 0.3) : 1;
  const bump = lastI >= 0 ? 1 + 0.07 * Math.sin(Math.PI * clamp((t - landAt(lastI)) / 0.35)) : 1;

  // 光标：每次落在要勾选那一行的勾选圈上
  const checkCenter = (b: Box) => ({ x: b.x + b.h * 0.5, y: b.y + b.h / 2 });
  const pts = pick.map((ri) => { const cc = checkCenter(boxes[ri]); return toScreen(cc.x, cc.y); });
  let cx = 1500, cy = 1160;
  pick.forEach((_, i) => {
    const g = p(t, selAt(i) - (i === 0 ? 0.7 : 0.42), selAt(i) - 0.06);
    cx = mix(cx, pts[i].x, g); cy = mix(cy, pts[i].y, g);
  });
  const press = Math.max(0, ...pick.map((_, i) => clamp(1 - Math.abs(t - selAt(i) - 0.06) / 0.1)));
  const cursorOut = q(t, lastLand, lastLand + 0.4);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(960px,540px) scale(${cam.z}) translate(${-cam.fx}px,${-cam.fy}px)` }}>
        <div style={{
          position: 'absolute', left: FULL.x, top: FULL.y, width: FULL.w, height: FULL.h, borderRadius: S.radius, overflow: 'hidden',
          boxShadow: S.shadow, background: '#fff', opacity: enter, transform: `scale(${mix(0.965, 1, enter)})`,
        }}>
          <Img src={staticFile(c.image)} style={{ position: 'absolute', left: ox - FULL.x, top: oy - FULL.y, width: c.imageSize.w * k, height: c.imageSize.h * k }} />
        </div>
      </div>

      {/* 勾选圈（屏幕空间） */}
      {boxes.map((b, ri) => {
        const appear = p(t, 0.62 + ri * 0.06, 0.95 + ri * 0.06);
        if (appear <= 0) return null;
        const order = pick.indexOf(ri);
        const on = order >= 0 ? springOn(t, selAt(order)) : 0;
        const cc = checkCenter(b);
        const s = toScreen(cc.x, cc.y);
        const size = b.h * 0.56 * cam.z;
        return <div key={ri} style={{ position: 'absolute', left: s.x - size / 2, top: s.y - size / 2, opacity: appear, transform: `scale(${mix(0.6, 1, appear)})`, zIndex: 500 }}>
          <Check size={size} on={on} />
        </div>;
      })}

      {/* 队列胶囊 */}
      {qShow > 0 && <div style={{
        position: 'absolute', left: Q.x, top: Q.y + (1 - qShow) * 24, width: Q.w, height: Q.h, borderRadius: Q.h / 2, background: S.dark,
        boxShadow: S.capsuleShadow, opacity: qShow, transform: `scale(${mix(0.88, 1, qShow) * bump})`, zIndex: 600, overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 64, top: 0, height: Q.h, display: 'flex', alignItems: 'center', ...textBase(LAB, 500), color: '#fff' }}>{c.label}</div>
        <div style={{ position: 'absolute', left: numX - Q.x, top: 0, width: numW, height: Q.h, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...textBase(NUM, 900), fontVariantNumeric: 'tabular-nums', color: count > 0 ? S.accentDark : '#fff', transform: `translateY(${(1 - roll) * 70}px)`, opacity: roll }}>{count}</div>
          {roll < 1 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...textBase(NUM, 900), fontVariantNumeric: 'tabular-nums', color: '#fff', transform: `translateY(${-roll * 70}px)`, opacity: 1 - roll }}>{Math.max(0, count - 1)}</div>}
        </div>
        <div style={{ position: 'absolute', left: numX - Q.x + numW + 14, top: 0, height: Q.h, display: 'flex', alignItems: 'center', ...textBase(LAB, 500), color: '#fff' }}>{c.unit}</div>
      </div>}

      {/* 被选中的行：真实像素复制一份，飞进队列 */}
      {pick.map((ri, i) => {
        const v = q(t, selAt(i) + 0.08, landAt(i));
        if (v <= 0 || v >= 1) return null;
        // 只复制行的文字部分（让开左侧勾选圈）
        const cut = rows[ri].h;
        const src = { ...rows[ri], x: rows[ri].x + cut, w: rows[ri].w - cut };
        const b = W(src);
        const tl = toScreen(b.x, b.y);
        const w0 = b.w * cam.z, h0 = b.h * cam.z;
        const sc = mix(1, 0.3, v);
        const cxr = mix(tl.x + w0 / 2, target.x, v), cyr = mix(tl.y + h0 / 2, target.y, v) - Math.sin(Math.PI * v) * 90;
        const ks = k * cam.z;
        return <div key={i} style={{
          position: 'absolute', left: cxr - w0 * sc / 2, top: cyr - h0 * sc / 2, width: w0 * sc, height: h0 * sc, borderRadius: 14 * sc + 4,
          overflow: 'hidden', background: '#fff', boxShadow: '0 16px 30px rgba(0,0,0,0.2)', opacity: 1 - q(t, landAt(i) - 0.14, landAt(i)), zIndex: 650,
        }}>
          <Img src={staticFile(c.image)} style={{
            position: 'absolute', left: -src.x * ks * sc, top: -src.y * ks * sc,
            width: c.imageSize.w * ks * sc, height: c.imageSize.h * ks * sc,
          }} />
        </div>;
      })}

      {pick.map((_, i) => <ClickRing key={i} x={pts[i].x} y={pts[i].y} t={t} at={selAt(i)} />)}
      {cursorOut < 1 && <Cursor x={cx - 6} y={cy - 4} scale={1.1} press={press} style={{ opacity: 1 - cursorOut }} />}
    </Handoff>
    <Sfx name="woosh" at={0.12} />
    {pick.map((_, i) => <Sfx key={i} name="click" at={selAt(i)} />)}
    <Sfx name="ding" at={lastLand} />
  </Frame>;
}

// 勾选圈填充：点下后 0.3 秒填满
function springOn(t: number, at: number) {
  return p(t, at, at + 0.3);
}
