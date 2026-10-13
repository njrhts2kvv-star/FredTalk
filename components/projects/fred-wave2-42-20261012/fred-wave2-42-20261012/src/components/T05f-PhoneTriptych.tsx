// T05f-PhoneTriptych：一部手机展开成三屏对照
// 观众要看懂的变化：一部手机 → 展开成三屏，对照三种状态
// 升级自 L81-B024：保留“一部手机先建立，再从它身后展开成三部并排对照”的核心关系。
// 按 Fred 意见“需要调整动画（更顺、更有逻辑）”重做时间线：
//   - 原版前 2 秒只有一部小手机静止，展开时左右两部先后、不对称地冒出，右侧手机有抖动和二次位移，两侧屏幕还是同一张图；
//   - 现在：第一部手机就是第一种状态，展开时它向左让位、第二部在原位露出、第三部从它身后向右滑出——
//     三部用同一条曲线、相邻只差 0.06s，像一叠卡片顺序摊开，阅读顺序 = 左→右 = 状态 1→3；
//   - 每部屏幕是不同的真实素材，标签跟着各自手机出现；最后可选聚焦其中一部，其余退后。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Sfx, textBase, useT } from '../kit/ui';

export type PhoneScreen = { src: string; label: string; start?: number };

export type PhoneTriptychProps = HandoffProps & {
  screens: PhoneScreen[];   // 2–4 部手机的屏幕素材（竖屏视频或图片）与下方标签
  focus?: number;           // 最后聚焦第几部（0 起）；-1 或不传 = 不聚焦
  cues?: number[];          // [0]=展开开始；[1]=聚焦开始。不传用默认节奏
};

export const phoneTriptychDefaults: PhoneTriptychProps = {
  screens: [
    { src: 'media/w4-fred-meeting-portrait.mp4', label: '开会时' },
    { src: 'media/w4-fred-street-portrait.mp4', label: '路上聊天' },
    { src: 'media/w4-fred-walk-portrait.mp4', label: '散步想到' },
  ],
  focus: 2,
};

const BODY_H = 780;
const BODY_W = Math.round(BODY_H / 2.06);   // 约 379
const TOP = 140;                             // 手机顶边：右侧手机不压右上角标
const BEZEL = 12;
const LABEL_Y = TOP + BODY_H + 34;

function Phone({ src, start, x, scale, z, dim }: { src: string; start: number; x: number; scale: number; z: number; dim: number }) {
  const sw = BODY_W - BEZEL * 2, sh = BODY_H - BEZEL * 2;
  return <div style={{
    position: 'absolute', left: x - BODY_W / 2, top: TOP, width: BODY_W, height: BODY_H, zIndex: z,
    borderRadius: 58, background: S.dark, boxShadow: S.shadow, transform: `scale(${scale})`, transformOrigin: '50% 60%',
  }}>
    <Media src={src} start={start} box={{ x: BEZEL, y: BEZEL, w: sw, h: sh }} radius={46} />
    {/* 灵动岛 */}
    <div style={{ position: 'absolute', left: BODY_W / 2 - 52, top: BEZEL + 16, width: 104, height: 30, borderRadius: 15, background: S.dark }} />
    {/* 退后：白色蒙版（DESIGN 2.1，白约 .74 上限内取 .55，保留可辨认） */}
    <div style={{ position: 'absolute', inset: 0, borderRadius: 58, background: '#fff', opacity: dim * 0.55 }} />
  </div>;
}

export function PhoneTriptych(props: Partial<PhoneTriptychProps>) {
  const c = { ...phoneTriptychDefaults, ...props };
  const t = useT();
  const screens = c.screens.slice(0, 4);
  const n = screens.length;

  // 槽位：相邻间距随数量收紧，整组居中
  const gap = n <= 3 ? 150 : 70;
  const pitch = BODY_W + gap;
  const slotX = (i: number) => 960 + (i - (n - 1) / 2) * pitch;

  const enter = p(t, 0, 0.6);                    // 第一部手机 0.6s 内升起落定
  const spreadAt = cueAt(c.cues, 0, 1.45);
  const focusAt = cueAt(c.cues, 1, 3.7);
  const focus = c.focus ?? -1;
  const dimT = focus >= 0 && focus < n ? q(t, focusAt, focusAt + 0.5) : 0;

  // 标签字号：同组一个字号，按最长标签和槽宽自适应
  const longest = Math.max(...screens.map((s) => textWidth(s.label, 1)));
  const labelSize = Math.min(64, (pitch - 40) / Math.max(1, longest));

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {screens.map((s, i) => {
        // 第 0 部先在中间建立；展开时全部从画面中线出发、滑向各自槽位（同一曲线，相邻差 0.06s）。
        // 其余手机原本叠在第 0 部身后，第 0 部让到左侧时依次露出，不来回折返。
        const e = p(t, spreadAt + i * 0.06, spreadAt + i * 0.06 + 0.75);
        const e0 = p(t, spreadAt, spreadAt + 0.75);
        const x = mix(960, slotX(i), e);
        const hidden = i > 0 && e <= 0.001;
        const isFocus = i === focus;
        const dim = isFocus ? 0 : dimT;
        // 先近看一部（1.16 倍），展开时整组退到全貌（1 倍）——“从一部看到三部”
        const scale = (i === 0 ? mix(1.16, 1, e0) : mix(0.9, 1, e)) * mix(1, isFocus ? 1.03 : 0.96, dimT);
        const lift = i === 0 ? (1 - enter) * 90 : 0;
        // 标签：第 0 部随手机出现；其余在各自到位前后淡入
        const lab = i === 0 ? p(t, 0.35, 0.8) : p(t, spreadAt + i * 0.06 + 0.45, spreadAt + i * 0.06 + 0.85);
        const labelColor = isFocus && dimT > 0.5 ? S.accent : S.ink;
        return <React.Fragment key={i}>
          {!hidden && <div style={{ position: 'absolute', inset: 0, transform: `translateY(${lift}px)`, opacity: i === 0 ? enter : clamp(e * 4), zIndex: n - i }}>
            <Phone src={s.src} start={s.start ?? 0} x={x} scale={scale} z={n - i} dim={dim} />
          </div>}
          <div style={{
            ...textBase(labelSize, 900), position: 'absolute', left: x - pitch / 2, width: pitch, top: LABEL_Y + (scale - 1) * 0.4 * BODY_H + (1 - lab) * 16,
            textAlign: 'center', color: labelColor, opacity: lab * mix(1, 0.4, dim), zIndex: 10,
          }}>{s.label}</div>
        </React.Fragment>;
      })}
    </Handoff>
    <Sfx name="slide" at={spreadAt} />
    {focus >= 0 && focus < n && <Sfx name="pop" at={focusAt} volume={0.4} />}
  </Frame>;
}
