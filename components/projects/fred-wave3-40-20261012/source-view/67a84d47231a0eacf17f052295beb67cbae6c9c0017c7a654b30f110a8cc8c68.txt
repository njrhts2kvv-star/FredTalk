// T16b-VersionStack：版本迭代
// 观众要看懂的变化：旧版本卡 → 被新版本卡一张张盖上，变化点被点亮
// 动作：当前版本卡在画面正中；新版本卡从右侧滑进来、不透明地整张盖住它；同一进度里旧卡往上退一格、略缩小，
//   只把自己的表头（版本名 + 说明）露在新卡上方，像一叠文件夹的标签。新卡落定后，新增点逐条“点亮”：
//   黑圆章里的 + 弹出，文字从淡灰变成墨色。终态：上方一排旧版本标签 + 正中当前版本卡，版本名染紫。
// 返修（Fred：“有点丑”）：去掉半透明叠字和浅紫荧光条；卡片全不透明、旧卡只露表头；整叠水平居中、关键内容 y ≤ 880；
//   滑入距离限制在安全区内。
// 和 T16a（时间轴）区分：这里没有轴，是叠盖，对象是同一位置上的“当前版本”。
// 默认内容：示例内容（v1/v2/v3 能力演进），不是某个产品的真实更新日志；换成任何版本只需改 versions。
import React from 'react';
import { useVideoConfig } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, Surface, textBase, useT } from '../kit/ui';

export type Version = { name: string; label?: string; points: string[] };
export type VersionStackProps = HandoffProps & {
  versions: Version[];   // 2–4 张，按先后；points 每张 1–4 条新增点
  cues?: number[];       // [k-1]=第 k 张卡（k≥1）开始滑入
};

export const versionStackDefaults: VersionStackProps = {
  versions: [
    { name: 'v1', label: '基础版', points: ['只能聊天问答', '结果要手动复制'] },
    { name: 'v2', label: '联网版', points: ['能直接读你的文件', '能联网查资料', '结果自动保存'] },
    { name: 'v3', label: '自动版', points: ['自己拆步骤做完', '做完主动汇报', '出错自己重试'] },
  ],
};

const tw = (s: string, f: number) => Array.from(s).reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.68 : /[\u0000-ÿ]/.test(ch) ? 0.6 : 1) * f, 0);
const TOP = 150, BOTTOM = 880;
const PADX = 64, HEAD_TOP = 22;

export function VersionStack(props: Partial<VersionStackProps>) {
  const c = { ...versionStackDefaults, ...props };
  const t = useT();
  const { durationInFrames, fps } = useVideoConfig();
  const dur = durationInFrames / fps;
  const vs = c.versions.slice(0, 4).map((v) => ({ ...v, points: v.points.slice(0, 4) }));
  const n = Math.max(1, vs.length);

  // ---------- 终态版式 ----------
  const maxP = Math.max(1, ...vs.map((v) => v.points.length));
  const nameSize = 68, labelSize = 38;
  const headW = Math.max(...vs.map((v) => tw(v.name, nameSize) + (v.label ? 28 + tw(v.label, labelSize) : 0)));
  const DISC = 44;
  const ptUnits = Math.max(1, ...vs.flatMap((v) => v.points.map((x) => tw(x, 1))));
  const headH = HEAD_TOP + nameSize * 1.16;        // 表头高（旧卡只露这一截）
  const tabH = headH + 8;
  // 要点字号：先按宽度定上限，再保证“整叠（旧卡表头 + 当前卡）”放进 TOP–BOTTOM，旧卡表头不被压住
  let ptSize = Math.max(32, Math.min(52, (1300 - PADX * 2 - DISC - 22) / ptUnits));
  const hOf = (f: number) => Math.round(headH + 34 + maxP * Math.round(f * 1.62) + 40);
  while (ptSize > 32 && hOf(ptSize) + (n - 1) * tabH > BOTTOM - TOP) ptSize -= 1;
  const W = Math.round(clamp(Math.max(headW, ptUnits * ptSize + DISC + 22) + PADX * 2, 940, 1300));
  const rowH = Math.round(ptSize * 1.62);
  const H = hOf(ptSize);
  const PEEK = n > 1 ? Math.min(Math.round(tabH), (BOTTOM - TOP - H) / (n - 1)) : 0;
  const stackH = H + (n - 1) * PEEK;
  const baseTop = TOP + (BOTTOM - TOP - stackH) / 2 + (n - 1) * PEEK;   // 当前卡的顶边
  const X = 960 - W / 2;

  // ---------- 时间线：按组件时长铺开 ----------
  const lightDur = (k: number) => 0.2 + vs[k].points.length * 0.16;
  const SLIDE = 0.55;
  const first = Math.min(1.35, 0.55 + lightDur(0));
  const step = n > 2 ? clamp((dur - first - SLIDE - lightDur(n - 1) - 0.7) / (n - 2), 0.85, 1.6) : 0;
  const inAt = vs.map((_, k) => (k === 0 ? 0 : cueAt(c.cues, k - 1, first + (k - 1) * step)));
  const landAt = (k: number) => (k === 0 ? 0.4 : inAt[k] + SLIDE);
  // 卡 k 被压到第几层：之后每来一张新卡就退一格（同一进度）
  const depth = (k: number) => vs.reduce((d, _, j) => (j > k ? d + q(t, inAt[j], inAt[j] + SLIDE) : d), 0);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {vs.map((v, k) => {
        if (k > 0 && t < inAt[k]) return null;
        const d = depth(k);
        const isTop = d < 0.5;
        // 进场：第一张从下方升起；后面的从右侧滑进来（距离留在安全区内）
        const e = k === 0 ? p(t, 0, 0.45) : p(t, inAt[k], inAt[k] + SLIDE);
        const dx = k === 0 ? 0 : (1 - e) * Math.min(320, 1840 - (X + W));
        const dy = k === 0 ? (1 - e) * 50 : 0;
        const op = k === 0 ? e : clamp((t - inAt[k]) / 0.08);
        const top = baseTop - d * PEEK;
        const sc = 1 - d * 0.035;
        const veil = clamp(d) * 0.4;
        const lit = (i: number) => p(t, landAt(k) + 0.12 + i * 0.16, landAt(k) + 0.12 + i * 0.16 + 0.3);
        const cur = 1 - clamp(d * 2);   // 1 = 当前卡
        return <div key={k} style={{
          position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, zIndex: k,
          transform: `translate(${dx}px, ${dy}px)`, opacity: op,
        }}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: `960px ${top}px`, transform: `scale(${sc})` }}>
            <Surface box={{ x: X, y: top, w: W, h: H }} shadow={k > 0 && !isTop ? S.shadow : '0 22px 40px 0 rgba(0,0,0,0.18)'}>
              {/* 表头：版本名（当前卡染紫）+ 说明 */}
              <div style={{ position: 'absolute', left: PADX, top: HEAD_TOP, display: 'flex', alignItems: 'baseline', gap: 28 }}>
                <span style={{ ...textBase(nameSize, 900), color: cur > 0.5 && k === n - 1 && t > landAt(k) ? accentOn(false) : S.ink }}>{v.name}</span>
                {v.label && <span style={{ ...textBase(labelSize, 500), color: S.muted }}>{v.label}</span>}
              </div>
              {/* 新增点：+ 圆章弹出，文字由灰变墨 */}
              {v.points.map((pt, i) => {
                const l = lit(i);
                const pop = springAt(t, landAt(k) + 0.12 + i * 0.16, 0.5);
                const y = headH + 34 + i * rowH;
                return <div key={i} style={{ position: 'absolute', left: PADX, top: y, height: rowH, display: 'flex', alignItems: 'center', gap: 22 }}>
                  <div style={{ width: DISC, height: DISC, borderRadius: DISC / 2, background: l > 0 ? S.dark : 'transparent', border: l > 0 ? 'none' : `3px solid ${S.faint}`, boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${l > 0 ? mix(0.5, 1, pop) : 0.7})`, flex: 'none' }}>
                    {l > 0 && <span style={{ ...textBase(DISC * 0.78, 900), color: '#fff', lineHeight: 1, marginTop: -3 }}>+</span>}
                  </div>
                  <span style={{ ...textBase(ptSize, l > 0.5 ? 900 : 500), color: l > 0.5 ? S.ink : S.faint }}>{pt}</span>
                </div>;
              })}
              {/* 退后：白蒙版，只盖卡面（旧卡的表头仍读得出） */}
              <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: veil }} />
            </Surface>
          </div>
        </div>;
      })}
    </Handoff>
    <Sfx name="pop" at={0.05} />
    {inAt.slice(1).map((a, i) => <Sfx key={i} name="slide" at={a} />)}
    <Sfx name="ding" at={landAt(n - 1) + 0.12} />
  </Frame>;
}
