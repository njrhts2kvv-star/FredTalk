// T09b-EnableAuth：开通授权：按钮到授权弹窗到已开通
// 观众要看懂的变化：未开通 → 点开授权 → 状态变成已开通
// 关系：同一张真实界面。入口旁先挂一个“未开通”状态胶囊；光标点入口，截图里真实的授权区域
// 从原位提起、放大到能读清（其余界面白蒙失焦退后）；点“继续”后授权区落回原位，
// 相机推近入口，状态胶囊翻成黑底“已开通”。坐标全部是源图像素，换截图只改 props。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, quintic, textWidth } from '../kit/theme';
import { Box, ClickRing, Cursor, Frame, Handoff, HandoffProps, Sfx, between, textBase, useT } from '../kit/ui';

type Rect = { x: number; y: number; w: number; h: number };
export type EnableAuthProps = HandoffProps & {
  image: string;                        // public/ 下的真实界面截图
  imageSize: { w: number; h: number };
  entry: Rect;                          // 第一次点击的入口（状态胶囊挂在它右侧）
  dialog: Rect;                         // 截图里的授权区域：被提起放大
  confirm: Rect;                        // 授权区域里的确认按钮（在 dialog 内）
  offLabel: string;                     // 未开通状态
  onLabel: string;                      // 已开通状态
  cues?: number[];                      // [0]=点入口 [1]=点确认 [2]=状态变成已开通
};

export const enableAuthDefaults: EnableAuthProps = {
  image: 'media/m-auth-dot-setup.png',
  imageSize: { w: 1920, h: 1080 },
  entry: { x: 80, y: 110, w: 292, h: 44 },
  dialog: { x: 858, y: 532, w: 584, h: 414 },
  confirm: { x: 885, y: 870, w: 530, h: 52 },
  offLabel: '未开通',
  onLabel: '已开通',
};

const FULL: Box = { x: 60, y: 33.222106, w: 1800, h: 1013.555787 };
type Cam = { fx: number; fy: number; z: number };

export function EnableAuth(props: Partial<EnableAuthProps>) {
  const c = { ...enableAuthDefaults, ...props };
  const t = useT();

  const k = Math.max(FULL.w / c.imageSize.w, FULL.h / c.imageSize.h);
  const ox = FULL.x + (FULL.w - c.imageSize.w * k) / 2, oy = FULL.y + (FULL.h - c.imageSize.h * k) / 2;
  const W = (r: Rect): Box => ({ x: ox + r.x * k, y: oy + r.y * k, w: r.w * k, h: r.h * k });
  const entry = W(c.entry), dialog = W(c.dialog), confirm = W(c.confirm);

  const c1 = cueAt(c.cues, 0, 1.0);
  const c2 = cueAt(c.cues, 1, 2.6);
  const onAt = cueAt(c.cues, 2, c2 + 0.8);

  // 相机：只在授权完成后推近入口（读状态）
  const STATUS_H = 92;
  const statusSize = (s: string) => Math.min(46, 480 / Math.max(1, textWidth(s, 1)));
  const pillMaxW = Math.max(textWidth(c.offLabel, statusSize(c.offLabel)), textWidth(c.onLabel, statusSize(c.onLabel))) + 80;
  // 落点：入口 + 状态胶囊作为一组居中，放大到入口文字读得清
  const z1 = clamp((1320 - 34 - pillMaxW) / entry.w, 1.4, 2.4);
  const groupW = entry.w * z1 + 34 + pillMaxW;
  const target: Cam = {
    z: z1,
    fx: entry.x + (960 - (960 - groupW / 2)) / z1,
    fy: clamp(entry.y + entry.h / 2 + 40 / z1, FULL.y + (540 / z1) * 0.55, FULL.y + FULL.h - (540 / z1) * 0.55),
  };
  const push = quintic(t, c2 + 0.22, onAt - 0.02);
  const cam: Cam = { fx: mix(960, target.fx, push), fy: mix(540, target.fy, push), z: mix(1, target.z, push) };
  const toScreen = (x: number, y: number) => ({ x: (x - cam.fx) * cam.z + 960, y: (y - cam.fy) * cam.z + 540 });

  // 授权区：原位 → 画面中部放大（提起）→ 点确认后落回原位
  const lift = p(t, c1 + 0.08, c1 + 0.62) * (1 - q(t, c2 + 0.15, c2 + 0.6));
  const recede = q(t, c1 + 0.04, c1 + 0.5) * (1 - q(t, c2 + 0.15, c2 + 0.6));
  const sc = Math.min(1140 / dialog.w, 760 / dialog.h);
  const big: Box = { w: dialog.w * sc, h: dialog.h * sc, x: 960 - dialog.w * sc / 2, y: 610 - dialog.h * sc / 2 };
  const dtl = toScreen(dialog.x, dialog.y);
  const slot: Box = { x: dtl.x, y: dtl.y, w: dialog.w * cam.z, h: dialog.h * cam.z };
  const card = between(slot, big, lift);
  const cardScale = card.w / dialog.w;
  const inCard = (x: number, y: number) => ({ x: card.x + (x - dialog.x) * cardScale, y: card.y + (y - dialog.y) * cardScale });

  const enter = p(t, 0, 0.4);

  // 光标：右下滑入 → 入口；再到放大后的确认按钮；之后淡出
  const e = toScreen(entry.x + Math.min(entry.w * 0.32, 120), entry.y + entry.h * 0.82);
  const bigConfirm = inCard(confirm.x + confirm.w / 2, confirm.y + confirm.h * 0.78);
  const g1 = p(t, c1 - 0.7, c1 - 0.08), g2 = p(t, c2 - 0.8, c2 - 0.1);
  const start = { x: 1420, y: 1160 };
  const cx = mix(mix(start.x, e.x, g1), bigConfirm.x, g2), cy = mix(mix(start.y, e.y, g1), bigConfirm.y, g2);
  const pressAt = (at: number) => clamp(1 - Math.abs(t - at - 0.06) / 0.1);
  const press = Math.max(pressAt(c1), pressAt(c2));
  const cursorAlpha = 1 - q(t, c2 + 0.2, c2 + 0.5);

  // 状态胶囊：挂在入口右侧（屏幕空间，大小不随相机）
  const status = p(t, 0.2, 0.55);
  const on = p(t, onAt, onAt + 0.32);
  const sOff = statusSize(c.offLabel), sOn = statusSize(c.onLabel);
  const wOff = textWidth(c.offLabel, sOff) + 80, wOn = textWidth(c.onLabel, sOn) + 80;
  const sw = mix(wOff, wOn, on);
  const er = toScreen(entry.x + entry.w, entry.y + entry.h / 2);
  const sx = Math.min(er.x + 34, 1880 - sw);
  const sy = er.y - STATUS_H / 2;
  const bump = 1 + 0.08 * Math.sin(Math.PI * clamp((t - onAt) / 0.4));

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(960px,540px) scale(${cam.z}) translate(${-cam.fx}px,${-cam.fy}px)` }}>
        <div style={{
          position: 'absolute', left: FULL.x, top: FULL.y, width: FULL.w, height: FULL.h, borderRadius: S.radius, overflow: 'hidden',
          boxShadow: S.shadow, background: '#fff', opacity: enter, transform: `scale(${mix(0.965, 1, enter)})`,
        }}>
          <Img src={staticFile(c.image)} style={{
            position: 'absolute', left: ox - FULL.x, top: oy - FULL.y, width: c.imageSize.w * k, height: c.imageSize.h * k,
            filter: recede > 0.001 ? `blur(${15 * recede}px)` : undefined,
          }} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.76 * recede }} />
        </div>
      </div>

      {/* 提起的真实授权区（截图原像素裁切） */}
      {lift > 0.001 && <div style={{
        position: 'absolute', left: card.x, top: card.y, width: card.w, height: card.h, borderRadius: mix(4, S.radius, lift), overflow: 'hidden',
        background: '#fff', boxShadow: `0 ${mix(2, 24, lift)}px ${mix(6, 48, lift)}px rgba(0,0,0,${mix(0.03, 0.16, lift)})`, zIndex: 300,
      }}>
        <Img src={staticFile(c.image)} style={{
          position: 'absolute', left: -(dialog.x - ox) * cardScale, top: -(dialog.y - oy) * cardScale,
          width: c.imageSize.w * k * cardScale, height: c.imageSize.h * k * cardScale,
        }} />
      </div>}

      {/* 状态胶囊：白底灰字“未开通” → 黑底紫字“已开通” */}
      {status > 0 && <div style={{
        position: 'absolute', left: sx, top: sy + (1 - status) * 16, width: sw, height: STATUS_H, borderRadius: STATUS_H / 2,
        background: on > 0.5 ? S.dark : '#fff', boxShadow: on > 0.5 ? S.capsuleShadow : S.shadow,
        opacity: status, transform: `scale(${mix(0.86, 1, status) * bump})`, zIndex: 400, overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: S.dark, opacity: on }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - on }}>
          <span style={{ ...textBase(sOff, 500), color: S.muted }}>{c.offLabel}</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: on, transform: `translateY(${(1 - on) * 14}px)` }}>
          <span style={{ ...textBase(sOn, 900), color: S.accentDark }}>{c.onLabel}</span>
        </div>
      </div>}

      <ClickRing x={e.x} y={e.y} t={t} at={c1} />
      <ClickRing x={bigConfirm.x} y={bigConfirm.y} t={t} at={c2} />
      {cursorAlpha > 0 && <Cursor x={cx - 6} y={cy - 4} scale={1.1} press={press} style={{ opacity: cursorAlpha }} />}
    </Handoff>
    <Sfx name="pop" at={0.2} />
    <Sfx name="click" at={c1} />
    <Sfx name="whoosh-short" at={c1 + 0.08} />
    <Sfx name="click" at={c2} />
    <Sfx name="ding" at={onAt} />
  </Frame>;
}
