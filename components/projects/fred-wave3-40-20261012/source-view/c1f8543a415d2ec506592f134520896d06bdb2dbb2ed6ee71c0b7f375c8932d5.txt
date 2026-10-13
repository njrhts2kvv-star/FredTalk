// T09l-LinkCarry：复制地址交给 AI
// 观众要看懂的变化：一个地址被复制 → 带着走到对话框里粘贴发送
// 关系：左上是真实的 GitHub 克隆面板截图，右下是真实的 Codex 输入框截图。
// 光标点下复制键（复制键变成勾）→ 地址行从原位被拎起，长成写着完整地址的黑胶囊 → 光标拖着它沿弧线走到输入框 →
// 落进输入框那一下胶囊的底色退掉、字变回正文墨色，成为输入框里的一段文字 → 光标去点发送键。
// 主角始终是“这一个地址”（同一个对象：截图里的地址行 → 胶囊 → 输入框里的字）。和 T09d2 区分：不是任务状态，是“地址被带过去”。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Box, ClickRing, Cursor, Frame, Handoff, HandoffProps, Sfx, abs, between, textBase, useT } from '../kit/ui';

type Rect = { x: number; y: number; w: number; h: number };
type Pt = { x: number; y: number };

export type LinkCarryProps = HandoffProps & {
  source: string;                 // 左侧真实截图
  sourceSize: { w: number; h: number };
  sourceCrop: Rect;               // 只显示这一块（源图像素）
  field: Rect;                    // 截图里地址行的框（源图像素）
  copyButton: Pt;                 // 截图里复制键的中心（源图像素）
  url: string;                    // 完整地址（截图里可能被截断，胶囊里显示完整的）
  target: string;                 // 右侧输入框截图
  targetSize: { w: number; h: number };
  targetCrop: Rect;               // 输入框本体（源图像素）
  placeholder: Rect;              // 输入框里占位文字的区域（盖白后写入文字）
  textStart: Pt;                  // 输入框第一行文字的起点（左端、行中线，源图像素）
  sendButton: Pt;                 // 发送键中心（源图像素）
  sendRadius: number;             // 发送键半径（源图像素）
  prefix: string;                 // 地址前已经写好的话，可留空
  maskBoxes?: Rect[];             // 输入框截图里要实心盖掉的区域（源图像素），如权限提示
  maskColor?: string;             // 盖块颜色，取输入框底色
  cues?: number[];                // [0]=点复制，[1]=拎起开走，[2]=点发送
};

// 默认内容：114 期 clone 地址（Fred 的公开仓库 FredTalk，GitHub Code 菜单真实截图）→ Codex 真实输入框
export const linkCarryDefaults: LinkCarryProps = {
  source: 'media/x4-gh-code-menu.png',
  sourceSize: { w: 3840, h: 2160 },
  sourceCrop: { x: 1716, y: 606, w: 792, h: 322 },
  field: { x: 1744, y: 780, w: 664, h: 64 },
  copyButton: { x: 2448, y: 812 },
  url: 'https://github.com/njrhts2kvv-star/FredTalk.git',
  target: 'media/x4-input-reference.png',
  targetSize: { w: 1300, h: 202 },
  targetCrop: { x: 20, y: 12, w: 1266, h: 171 },
  placeholder: { x: 36, y: 28, w: 260, h: 56 },
  textStart: { x: 44, y: 56 },
  sendButton: { x: 1246, y: 144 },
  sendRadius: 25,
  prefix: '帮我下载这个项目：',
  // 盖掉左下角橙色“完全访问”（含图标）：平台安全规则里无安全语境的权限表达不上屏
  maskBoxes: [{ x: 100, y: 126, w: 134, h: 36 }],
  maskColor: '#fff',
};

const MONO = 0.6 / 0.58;

export function LinkCarry(props: Partial<LinkCarryProps>) {
  const c = { ...linkCarryDefaults, ...props };
  const t = useT();

  // —— 版式：左上截图面板，右下输入框；都按“截图里的字能读清”定缩放 ——
  const SK = Math.min(1.2, 940 / c.sourceCrop.w, 420 / c.sourceCrop.h);
  const TK = Math.min(1.16, 1460 / c.targetCrop.w);
  const INPUT_W = c.targetCrop.w * TK, INPUT_H = c.targetCrop.h * TK;
  // 上下两块共用一条竖中线；整组在角标下方垂直居中
  const GAPY = 110;
  const groupH = c.sourceCrop.h * SK + GAPY + INPUT_H;
  const top = Math.max(150, 560 - groupH / 2);
  const PANEL: Box = { x: 960 - c.sourceCrop.w * SK / 2, y: top, w: c.sourceCrop.w * SK, h: c.sourceCrop.h * SK };
  const INPUT: Box = { x: 960 - INPUT_W / 2, y: top + PANEL.h + GAPY, w: INPUT_W, h: INPUT_H };
  const sp = (pt: Pt) => ({ x: PANEL.x + (pt.x - c.sourceCrop.x) * SK, y: PANEL.y + (pt.y - c.sourceCrop.y) * SK });
  const tp = (pt: Pt) => ({ x: INPUT.x + (pt.x - c.targetCrop.x) * TK, y: INPUT.y + (pt.y - c.targetCrop.y) * TK });
  const fieldTL = sp(c.field);
  const FIELD: Box = { x: fieldTL.x, y: fieldTL.y, w: c.field.w * SK, h: c.field.h * SK };
  const copy = sp(c.copyButton);
  const send = tp(c.sendButton);
  const sendR = c.sendRadius * TK;
  const ts0 = tp(c.textStart);

  // 输入框里的文字：前缀（正文）+ 地址（代码字体）；字号按输入框可用宽度收
  const availW = send.x - sendR - 40 - ts0.x;
  const units = textWidth(c.prefix, 1) + textWidth(c.url, 1) * MONO + 0.3;
  // 一行放不下（字号会小于 30）就把地址换到第二行
  const twoLines = !!c.prefix && availW / units < 30;   // 两行时整体上移一点，避开下排按钮
  const FS = twoLines ? Math.min(32, availW / (textWidth(c.url, 1) * MONO), availW / textWidth(c.prefix, 1)) : Math.min(36, availW / units);
  const prefixW = twoLines ? 0 : textWidth(c.prefix, FS) + (c.prefix ? FS * 0.15 : 0);
  const urlW = textWidth(c.url, FS) * MONO;
  const ts = { x: ts0.x, y: ts0.y - (twoLines ? FS * 0.3 : 0) };
  const urlY = twoLines ? ts.y + FS * 1.2 : ts.y;

  // 胶囊（拎起后的样子）：完整地址，字号略大于输入框里的字
  const PS = Math.min(40, 1480 / (textWidth(c.url, 1) * MONO));
  const PH = PS * 2.1, PW = textWidth(c.url, PS) * MONO + PH;
  const liftBox: Box = { x: Math.min(FIELD.x - 6, 1840 - PW), y: FIELD.y - PH - 26, w: PW, h: PH };
  const landBox: Box = { x: ts.x + prefixW, y: urlY - FS * 0.7, w: urlW, h: FS * 1.4 };

  // —— 时间 ——
  const enter = p(t, 0, 0.42);
  const enter2 = p(t, 0.1, 0.52);
  const copyAt = cueAt(c.cues, 0, 1.0);
  const liftAt = copyAt + 0.12;
  const goAt = cueAt(c.cues, 1, liftAt + 0.5);
  const FLY = 0.85;
  const landAt = goAt + FLY;
  const sendAt = cueAt(c.cues, 2, landAt + 0.55);
  const lift = p(t, liftAt, liftAt + 0.4);
  const fly = q(t, goAt, landAt);
  const landed = t >= landAt;                                 // 落进输入框：胶囊换成输入框里的字（同起点同字号）
  const pasteGlow = landed ? 1 - p(t, landAt + 0.12, landAt + 0.6) : 0;   // 刚粘贴的那段带一下浅紫选区，随即退掉
  const copied = p(t, copyAt + 0.04, copyAt + 0.3);

  // 胶囊路径：拎起（原位→上方）→ 二次贝塞尔弧线飞到落点
  const liftFrom: Box = { ...FIELD };
  const startB = between(liftFrom, liftBox, lift);
  const p0 = { x: liftBox.x + liftBox.w / 2, y: liftBox.y + liftBox.h / 2 };
  const p2 = { x: landBox.x + landBox.w / 2, y: landBox.y + landBox.h / 2 };
  const ctrl = { x: Math.max(p0.x, p2.x) + 360, y: Math.min(p0.y, p2.y) + 40 };
  const bez = (u: number) => ({
    x: (1 - u) * (1 - u) * p0.x + 2 * (1 - u) * u * ctrl.x + u * u * p2.x,
    y: (1 - u) * (1 - u) * p0.y + 2 * (1 - u) * u * ctrl.y + u * u * p2.y,
  });
  const along = bez(fly);
  const sizeK = mix(1, FS / PS, q(t, goAt + FLY * 0.35, landAt));   // 飞行后半段缩到输入框字号
  const curW = mix(liftBox.w, landBox.w + PH * 0.9 * (FS / PS), fly <= 0 ? 0 : q(t, goAt + FLY * 0.35, landAt));
  const curH = PH * sizeK;
  const flying = t >= goAt;
  const pillBox: Box = flying
    ? { x: along.x - curW / 2, y: along.y - curH / 2, w: curW, h: curH }
    : startB;
  const pillFS = flying ? PS * sizeK : mix(c.field.h * SK * 0.42, PS, lift);
  const box = pillBox;
  const fs = Math.min(pillFS, (box.w - box.h * 0.6) / (textWidth(c.url, 1) * MONO));   // 拎起途中字跟着框长，不被裁

  // 光标：从右下进场 → 复制键 → 抓住胶囊左端随它走 → 发送键
  let cx = 1500, cy = 1150;
  const toCopy = p(t, 0.35, copyAt - 0.04);
  cx = mix(cx, copy.x, toCopy); cy = mix(cy, copy.y, toCopy);
  const grab = { x: box.x + Math.min(box.h * 0.9, 60), y: box.y + box.h * 0.62 };
  const toGrab = p(t, liftAt + 0.1, goAt);
  cx = mix(cx, grab.x, toGrab); cy = mix(cy, grab.y, toGrab);
  const toSend = p(t, landAt + 0.06, sendAt - 0.04);
  cx = mix(cx, send.x, toSend); cy = mix(cy, send.y, toSend);
  const press = Math.max(clamp(1 - Math.abs(t - copyAt) / 0.1), clamp(1 - Math.abs(t - sendAt) / 0.1));
  const sendPress = clamp(1 - Math.abs(t - sendAt - 0.03) / 0.12);
  const cursorOut = q(t, sendAt + 0.35, sendAt + 0.75);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 左上：GitHub 克隆面板（真实截图） */}
      <div style={{ ...abs({ ...PANEL, y: PANEL.y + (1 - enter) * 36 }), borderRadius: S.radius, overflow: 'hidden', background: '#fff', boxShadow: S.shadow, opacity: enter }}>
        <Img src={staticFile(c.source)} style={{ position: 'absolute', left: -c.sourceCrop.x * SK, top: -c.sourceCrop.y * SK, width: c.sourceSize.w * SK, height: c.sourceSize.h * SK }} />
        {/* 复制键 → 勾（GitHub 真实反馈） */}
        {copied > 0 && <div style={{ position: 'absolute', left: copy.x - PANEL.x - 26 * SK, top: copy.y - PANEL.y - 26 * SK, width: 52 * SK, height: 52 * SK, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={40 * SK} height={40 * SK} viewBox="0 0 24 24" style={{ transform: `scale(${mix(0.6, 1, copied)})` }}>
            <path d="M5 12.5 L10 17 L19 7.5" stroke={S.ink} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22" strokeDashoffset={22 * (1 - copied)} />
          </svg>
        </div>}
        {/* 地址行被拎走后留下的浅色空位 */}
        {lift > 0 && <div style={{ position: 'absolute', left: FIELD.x - PANEL.x, top: FIELD.y - PANEL.y, width: FIELD.w, height: FIELD.h, borderRadius: 10 * SK, background: '#fff', opacity: 0.72 * lift }} />}
      </div>

      {/* 右下：Codex 输入框（真实截图） */}
      <div style={{ ...abs({ ...INPUT, y: INPUT.y + (1 - enter2) * 36 }), borderRadius: 28 * TK, overflow: 'hidden', background: '#fff', boxShadow: S.shadow, opacity: enter2 }}>
        <Img src={staticFile(c.target)} style={{ position: 'absolute', left: -c.targetCrop.x * TK, top: -c.targetCrop.y * TK, width: c.targetSize.w * TK, height: c.targetSize.h * TK }} />
        {(c.maskBoxes ?? []).map((m, i) => <div key={i} style={{ position: 'absolute', left: (m.x - c.targetCrop.x) * TK, top: (m.y - c.targetCrop.y) * TK, width: m.w * TK, height: m.h * TK, background: c.maskColor ?? '#fff' }} />)}
        {/* 盖住占位字，写入真实要发的话 */}
        <div style={{ position: 'absolute', left: (c.placeholder.x - c.targetCrop.x) * TK, top: (c.placeholder.y - c.targetCrop.y) * TK, width: c.placeholder.w * TK, height: c.placeholder.h * TK, background: '#fff' }} />
        <div style={{ position: 'absolute', left: ts.x - INPUT.x, top: ts.y - INPUT.y - FS * 0.7, height: FS * 1.4, display: 'flex', alignItems: 'center', ...textBase(FS, 500), lineHeight: 1, color: S.ink }}>{c.prefix}</div>
        {/* 发送键：输入框有字时是上箭头（盖住截图里的语音键），点下时按下去 */}
        <div style={{
          position: 'absolute', left: send.x - INPUT.x - sendR, top: send.y - INPUT.y - sendR, width: sendR * 2, height: sendR * 2, borderRadius: sendR,
          background: S.dark, transform: `scale(${1 - 0.14 * sendPress})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width={sendR * 1.1} height={sendR * 1.1} viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      {/* 地址：截图里的那一行 → 黑胶囊 → 输入框里的字 */}
      {landed && <div style={{ ...abs({ x: landBox.x - 6, y: landBox.y, w: landBox.w + 12, h: landBox.h }), borderRadius: 8, background: S.accent, opacity: 0.16 * pasteGlow, zIndex: 689 }} />}
      {landed && <div style={{ ...abs(landBox), display: 'flex', alignItems: 'center', ...textBase(FS, 600, S.mono), lineHeight: 1, color: S.ink, zIndex: 690 }}>{c.url}</div>}
      {lift > 0 && !landed && <div style={{
        ...abs(box), borderRadius: box.h / 2, zIndex: 700, background: S.dark,
        boxShadow: `30px 22px 25px rgba(0,0,0,${0.33 * clamp(lift * 2)})`,
        overflow: 'hidden',
      }}>
        {/* 文字左端按估算宽度对中；落定时与输入框里那层墨色字同起点、同字号，反色交接不叠影 */}
        <span style={{ position: 'absolute', left: (box.w - textWidth(c.url, fs) * MONO) / 2, top: 0, height: box.h, display: 'flex', alignItems: 'center', ...textBase(fs, 600, S.mono), lineHeight: 1, color: '#fff', opacity: clamp(lift * 3 - 0.6) }}>{c.url}</span>
      </div>}

      <ClickRing x={copy.x} y={copy.y} t={t} at={copyAt} />
      <ClickRing x={send.x} y={send.y} t={t} at={sendAt} />
      {cursorOut < 1 && <Cursor x={cx - 6} y={cy - 4} scale={1.1} press={press} style={{ opacity: clamp(p(t, 0.3, 0.55)) * (1 - cursorOut) }} />}
    </Handoff>
    <Sfx name="click" at={copyAt} />
    <Sfx name="woosh" at={goAt} />
    <Sfx name="click" at={sendAt} />
  </Frame>;
}
