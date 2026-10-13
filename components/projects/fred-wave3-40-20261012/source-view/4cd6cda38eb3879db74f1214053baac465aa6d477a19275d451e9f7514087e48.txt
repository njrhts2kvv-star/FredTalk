// T13d-RequestTrip：请求往返
// 观众要看懂的变化：你发出的请求 → 沿线到服务器，再带着结果回来
// 关系：左边是“你”（真实 Logo），右边是服务器黑卡；上面一条去程、下面一条回程，调用地址挂在去程上方。
//       请求胶囊从 Logo 里出发，沿去程走过去（走过的线变黑），钻进服务器；服务器闪一下、底部进度条走满；
//       结果胶囊从服务器里出来沿回程回到“你”这边停靠，中间的耗时读数跟着整趟往返一起走、最后停住。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type RequestTripProps = HandoffProps & {
  you: { name: string; logo?: string };                    // 左：发请求的一方
  server: { kicker?: string; name: string; sub?: string }; // 右：服务器
  addressLabel: string;    // 调用地址
  address: string;         // 示例地址，不放真实地址
  request: string;         // 请求胶囊上的字
  result: string;          // 结果胶囊上的字
  highlight: string;       // result 里染紫的词（黑胶囊上 #D6BEFF）
  timeLabel?: string;      // 耗时读数前缀；不传则不显示耗时
  seconds?: number;        // 往返耗时（秒）
  cues?: number[];         // [0]=请求出发；[1]=服务器处理；[2]=结果出发
};

// 113 期第 9–10 段：复制调用地址发给 Codex，它就能调用自己部署的 JEV（地址为示例）
export const requestTripDefaults: RequestTripProps = {
  you: { name: '你的 Codex', logo: 'media/x8-codex.png' },
  server: { kicker: '自己部署的', name: 'JEV-27B', sub: 'RTX PRO 6000 · 96GB' },
  addressLabel: '调用地址',
  address: 'https://your-jev.example/v1',
  request: '这条客服意见属于哪一类？',
  result: '结果：物流问题',
  highlight: '物流问题',
  timeLabel: '往返耗时',
  seconds: 0.82,
};

const CY = 470;
const YOU_X = 320;
const CARD = { x: 1370, y: CY - 160, w: 420, h: 320 };
const SRV_X = CARD.x + CARD.w / 2;
const LX0 = 470, LX1 = CARD.x - 30;
const REQ_Y = CY - 62, RES_Y = CY + 62;

export function RequestTrip(props: Partial<RequestTripProps>) {
  const c = { ...requestTripDefaults, ...props };
  const t = useT();

  // ---- 时间 ----
  const enter = p(t, 0, 0.45);
  const lanes = p(t, 0.12, 0.7);
  const addr = p(t, 0.35, 0.85);
  const D = cueAt(c.cues, 0, 1.0);
  const P = cueAt(c.cues, 1, D + 1.0);
  const R = cueAt(c.cues, 2, P + 0.62);
  const go = q(t, D, D + 1.0);
  const back = q(t, R, R + 0.85);
  const dockAt = R + 0.85;
  const dock = springAt(t, dockAt - 0.05, 0.6);
  const flash = (() => { const v = clamp((t - P) / 0.34); return v > 0 && v < 1 ? Math.sin(Math.PI * v) : 0; })();
  const work = p(t, P, P + 0.55);
  const workOut = 1 - q(t, R + 0.2, R + 0.5);

  // ---- 尺寸 ----
  const reqSize = Math.max(30, Math.min(38, 680 / Math.max(1, textWidth(c.request, 1))));
  const reqW = textWidth(c.request, reqSize) + reqSize * 1.5, reqH = reqSize * 2.1;
  const resSize = Math.min(46, 560 / Math.max(1, textWidth(c.result, 1)));
  const resW = textWidth(c.result, resSize) + resSize * 1.5, resH = resSize * 2.0;
  const nameSize = Math.min(80, (CARD.w - 70) / Math.max(1, textWidth(c.server.name, 1)));
  const subSize = Math.max(28, Math.min(32, (CARD.w - 70) / Math.max(1, textWidth(c.server.sub ?? '', 1))));
  const youSize = Math.min(c.you.logo ? 46 : 72, 300 / Math.max(1, textWidth(c.you.name, 1)));
  const monoW = (s: string, size: number) => Array.from(s).length * 0.6 * size;
  const addrSize = Math.min(34, 900 / Math.max(1, textWidth(c.addressLabel, 1) + Array.from(c.address).length * 0.6 + 0.6));
  const addrW = textWidth(c.addressLabel, addrSize) + addrSize * 0.6 + monoW(c.address, addrSize) + addrSize * 1.8;

  // 请求：从 Logo 中心出发，钻进服务器卡（卡在上层，自然“吞进去”）
  const reqStart = LX0 + reqW / 2;   // 从 Logo 右侧的去程起点长出来，不压 Logo、不出左侧安全区
  const reqX = mix(reqStart, SRV_X, go);
  const reqIn = p(t, D, D + 0.28);
  // 结果：从服务器出来，停在回程左端
  const dockX = LX0 + resW / 2;
  const resX = mix(SRV_X, dockX, back);
  const resIn = t >= R ? 1 : 0;

  // 耗时读数：整趟往返期间按真实比例走
  const tripP = clamp((t - D) / Math.max(0.01, dockAt - D));
  const secs = (c.seconds ?? 0) * tripP;
  const showTime = !!c.timeLabel && typeof c.seconds === 'number';
  const timeIn = p(t, D, D + 0.3);
  const timeDone = t >= dockAt;
  const tSize = 46;
  const secStr = secs.toFixed(2);

  const hi = c.highlight && c.result.includes(c.highlight) ? c.highlight : '';
  const [rb, ra = ''] = hi ? c.result.split(hi) : [c.result, ''];

  const lane = (y: number, from: number, to: number, ink: number, dir: 1 | -1) => {
    const len = (to - from) * lanes;
    const x0 = dir === 1 ? from : to - len;
    const hx = dir === 1 ? to : from;
    return <g>
      <line x1={x0} y1={y} x2={x0 + len} y2={y} stroke="#dcdce0" strokeWidth={6} strokeLinecap="round" />
      {ink > 0 && <line x1={dir === 1 ? from : to} y1={y} x2={dir === 1 ? Math.min(to, from + ink) : Math.max(from, to - ink)} y2={y} stroke={S.ink} strokeWidth={6} strokeLinecap="round" />}
      {lanes > 0.98 && !(dir === -1 && ink > (to - from) * 0.5) && <path d={`M${hx - dir * 18} ${y - 16} L${hx} ${y} L${hx - dir * 18} ${y + 16}`} fill="none"
        stroke={ink >= to - from - 2 ? S.ink : '#dcdce0'} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
    </g>;
  };

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 30}px)` }}>
        {/* 两条路：去程 / 回程 */}
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {lane(REQ_Y, LX0, LX1, clamp(reqX - LX0, 0, LX1 - LX0), 1)}
          {lane(RES_Y, LX0, LX1, t >= R ? clamp(LX1 - (resX - resW / 2), 0, LX1 - LX0) : 0, -1)}
        </svg>

        {/* 调用地址：挂在去程上方 */}
        <Surface box={{ x: (LX0 + LX1) / 2 - addrW / 2, y: REQ_Y - 132, w: addrW, h: addrSize * 2.2 }} radius={addrSize * 1.1}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: addrSize * 0.6, clipPath: `inset(0 ${100 * (1 - addr)}% 0 0 round ${addrSize * 1.1}px)` }}>
          <span style={{ ...textBase(addrSize, 500), color: S.muted }}>{c.addressLabel}</span>
          <span style={{ fontFamily: S.mono, fontWeight: 600, fontSize: addrSize, fontSynthesis: 'none', whiteSpace: 'nowrap', color: S.ink }}>{c.address}</span>
        </Surface>

        {/* 左：你 */}
        {c.you.logo ? <Img src={staticFile(c.you.logo)} style={{ position: 'absolute', left: YOU_X - 92, top: CY - 112, width: 184, height: 184, objectFit: 'contain', zIndex: 2 }} /> : null}
        <div style={{ position: 'absolute', left: YOU_X - 200, width: 400, top: c.you.logo ? CY + 88 : CY - youSize * 0.6, textAlign: 'center', ...textBase(youSize, 900), color: S.ink }}>{c.you.name}</div>

        {/* 请求胶囊（在服务器卡下层） */}
        {t >= D && go < 1 && <Pill box={{ x: reqX - reqW / 2, y: REQ_Y - reqH / 2, w: reqW, h: reqH }}
          style={{ zIndex: 5, transformOrigin: 'left center', transform: `scale(${mix(0.4, 1, reqIn)})`, opacity: clamp(reqIn * 4) }}>
          <span style={{ ...textBase(reqSize, 500), color: '#fff' }}>{c.request}</span>
        </Pill>}

        {/* 结果胶囊：出来、沿回程走、停靠后轻弹一下 */}
        {resIn > 0 && <Pill box={{ x: resX - resW / 2, y: RES_Y - resH / 2, w: resW, h: resH }}
          style={{ zIndex: back < 0.3 ? 5 : 12, transform: `scale(${t >= dockAt - 0.05 ? mix(1.08, 1, dock) : 1})`, transformOrigin: 'left center' }}>
          <span style={{ ...textBase(resSize, 900), color: '#fff' }}>{rb}{hi && <span style={{ color: accentOn(true) }}>{hi}</span>}{ra}</span>
        </Pill>}

        {/* 右：服务器 */}
        <div style={{ position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: S.radius, background: S.dark,
          boxShadow: S.capsuleShadow, zIndex: 10, overflow: 'hidden', transform: `scale(${1 + 0.035 * flash})` }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {c.server.kicker ? <span style={{ ...textBase(Math.max(28, Math.min(32, (CARD.w - 60) / Math.max(1, textWidth(c.server.kicker, 1)))), 500), color: '#a3a3ab', whiteSpace: 'normal', width: CARD.w - 60, textAlign: 'center' }}>{c.server.kicker}</span> : null}
            <span style={{ ...textBase(nameSize, 900), color: flash > 0.2 ? accentOn(true) : '#fff' }}>{c.server.name}</span>
            {c.server.sub ? <span style={{ ...textBase(subSize, 500), color: '#a3a3ab', whiteSpace: 'normal', width: CARD.w - 60, textAlign: 'center' }}>{c.server.sub}</span> : null}
          </div>
          {work > 0 && <div style={{ position: 'absolute', left: 40, right: 40, bottom: 30, height: 8, borderRadius: 4, background: '#3a3a40', opacity: workOut }}>
            <div style={{ width: `${100 * work}%`, height: '100%', borderRadius: 4, background: accentOn(true) }} />
          </div>}
        </div>

        {/* 耗时读数 */}
        {showTime && timeIn > 0 && <div style={{ position: 'absolute', left: (LX0 + LX1) / 2 - 300, width: 600, top: RES_Y + 92 + (1 - timeIn) * 16, textAlign: 'center', opacity: timeIn }}>
          <span style={{ ...textBase(tSize, 500), color: S.muted }}>{c.timeLabel} </span>
          <span style={{ ...textBase(tSize * 1.25, 900), color: timeDone ? accentOn(false) : S.ink, fontVariantNumeric: 'tabular-nums' }}>{secStr}</span>
          <span style={{ ...textBase(tSize, 900), color: timeDone ? accentOn(false) : S.ink }}> 秒</span>
        </div>}
      </div>
    </Handoff>
    <Sfx name="whoosh-short" at={D} />
    <Sfx name="pop" at={P} />
    <Sfx name="slide" at={R} />
    <Sfx name="ding" at={dockAt} />
  </Frame>;
}
