// T04e-PackOpen：拆开看里面装了什么
// 观众要看懂的变化：一个整体（如仓库）→ 分层拆开，露出里面的几样东西
// 关系（重写）：一张真实仓库页卡居中 → 页上三块真实像素区域依次描边、原位“拎出”放大（motion-craft §4/§11），
//   飞到前景排成一排，每块下方擦出一个黑胶囊名字；同时页卡退后（缩小 + 失焦 + 白蒙版），只留作背景
//   → 最后上方长出一句结论胶囊“仓库 = 这个项目的文件夹”。同一个像素对象从页上到前景，不消失再出现。
// 读得清：三块都裁小范围（5 行文件名 / README 标题 / Releases 区块），前景里放到截图字约 25–30px。
// 关键内容全部在 y ≤ 880（避开字幕）。和 T02e（多项汇聚成一）方向相反：一拆多。
// 素材：Fred 仓库整页真实截图 gh-repo-full.png（2026-10-12 抓取，DPR 2）预裁成 x3b-repo-card.jpg（页卡，1600 宽）与 x3b-repo-*.png（各块原像素）。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Pill, Sfx, between, textBase, useT } from '../kit/ui';

export type PackPart = {
  image: string;   // 这块预先裁好的原像素小图（与 box 同尺寸）
  box: Box;        // 这块在源图里的像素框（裁切边落在行间分隔线 / 留白上），用来定位它在页卡上的原位
  label: string;   // 下方黑胶囊里的名字
};

export type PackOpenProps = HandoffProps & {
  cardImage: string;      // 页卡图（预先从源图 cardCrop 范围裁出并缩小；不直接加载 3840×9184 长图，避免无头浏览器解码卡住）
  cardCrop: Box;          // 页卡图对应的源图范围（源图像素），用来换算各块原位
  parts: PackPart[];      // 2–4 块，按讲解顺序
  result: string;         // 结论
  highlight?: string;     // 结论里染紫的词
  cues?: number[];        // [i]=第 i 块拎出；[n]=结论出现
};

export const packOpenDefaults: PackOpenProps = {
  cardImage: 'media/x3b-repo-card.jpg',
  cardCrop: { x: 700, y: 330, w: 2480, h: 2640 },
  parts: [
    { image: 'media/x3b-repo-code.png', box: { x: 716, y: 818, w: 434, h: 410 }, label: '代码' },                 // 文件列表 5 个文件夹
    { image: 'media/x3b-repo-readme.png', box: { x: 1240, y: 2440, w: 760, h: 240 }, label: 'README 说明书' },      // README 标题 + 一句话介绍
    { image: 'media/x3b-repo-releases.png', box: { x: 2592, y: 1374, w: 552, h: 230 }, label: 'Releases 软件' },      // 右侧 Releases 区块
  ],
  result: '仓库 = 这个项目的文件夹',
  highlight: '文件夹',
};

// 锐字真言只用于中文；拉丁与符号换 MiSans Heavy（同字号、同基线）
function DisplayText({ text, size, color, hl }: { text: string; size: number; color: string; hl?: string }) {
  const i = hl ? text.indexOf(hl) : -1;
  const segs = i < 0 ? [{ s: text, c: color }] : [{ s: text.slice(0, i), c: color }, { s: hl!, c: accentOn(true) }, { s: text.slice(i + hl!.length), c: color }];
  return <span style={{ ...textBase(size, 400, S.display), lineHeight: 1 }}>
    {segs.map((g, k) => (g.s.match(/[\u0000-ÿ]+|[^\u0000-ÿ]+/g) ?? []).map((r, j) => /^[\u0000-ÿ]+$/.test(r)
      ? <span key={`${k}-${j}`} style={{ fontFamily: S.body, fontWeight: 900, color: g.c }}>{r}</span>
      : <span key={`${k}-${j}`} style={{ color: g.c }}>{r}</span>))}
  </span>;
}
const dUnits = (s: string) => Array.from(s).reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.68 : /[\u0000-ÿ]/.test(ch) ? 0.6 : 1), 0);

const TOP = 140, BOTTOM = 880;
const PAD = 22;        // 前景卡内边距

export function PackOpen(props: Partial<PackOpenProps>) {
  const c = { ...packOpenDefaults, ...props };
  const t = useT();
  const parts = c.parts.slice(0, 4);
  const n = Math.max(1, parts.length);
  const cc = c.cardCrop;

  // —— 页卡（建立）：高度放进安全区，居中 ——
  const k0 = Math.min((BOTTOM - TOP) / cc.h, 1500 / cc.w);
  const CW = cc.w * k0, CH = cc.h * k0;
  const card: Box = { x: 960 - CW / 2, y: TOP + (BOTTOM - TOP - CH) / 2, w: CW, h: CH };
  const onCard = (b: Box): Box => ({ x: card.x + (b.x - cc.x) * k0, y: card.y + (b.y - cc.y) * k0, w: b.w * k0, h: b.h * k0 });

  // —— 终态：上方结论胶囊，中间一排前景卡，下方一行名字胶囊 ——
  const rSize = Math.min(72, 1400 / Math.max(1, dUnits(c.result)));
  const rH = Math.round(rSize * 1.75), rW = dUnits(c.result) * rSize + rSize * 1.6;
  const lSize = Math.min(46, ...parts.map((pt) => 380 / Math.max(1, dUnits(pt.label) + 1.4)));
  const lH = Math.round(lSize * 1.75);
  const GAP = 52, G1 = 54, G2 = 30;
  const availH = BOTTOM - TOP - 10 - rH - G1 - G2 - lH;
  const s = Math.min(1.0, (availH - 2 * PAD) / Math.max(...parts.map((pt) => pt.box.h)),
    (1760 - (n - 1) * GAP - n * 2 * PAD) / parts.reduce((a, pt) => a + pt.box.w, 0));
  const ws = parts.map((pt) => pt.box.w * s + 2 * PAD), hs = parts.map((pt) => pt.box.h * s + 2 * PAD);
  const rowW = ws.reduce((a, b) => a + b, 0) + (n - 1) * GAP;
  const maxH = Math.max(...hs);
  const groupH = rH + G1 + maxH + G2 + lH;                   // 整组在安全区里上下居中
  const gTop = TOP + (BOTTOM - TOP - groupH) / 2;
  const rBox: Box = { x: 960 - rW / 2, y: gTop, w: rW, h: rH };
  const midY = gTop + rH + G1 + maxH / 2;
  const slots: Box[] = parts.map((_, i) => ({ x: 960 - rowW / 2 + ws.slice(0, i).reduce((a, b) => a + b, 0) + i * GAP, y: midY - hs[i] / 2, w: ws[i], h: hs[i] }));
  const pillY = midY + maxH / 2 + G2;

  // —— 时间线 ——
  const enter = p(t, 0, 0.5);
  const at = parts.map((_, i) => cueAt(c.cues, i, 1.15 + i * 0.5));
  const LIFT = 0.8;
  const resAt = cueAt(c.cues, n, at[n - 1] + LIFT + 0.55);
  const recede = q(t, at[0], at[0] + 0.8);
  const res = p(t, resAt, resAt + 0.55) * 1.04 - 0.04 * q(t, resAt + 0.55, resAt + 0.85);   // 胶囊横向展开，过冲 4% 回落

  const fill = (src: string) => <Img src={staticFile(src)} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', display: 'block' }} />;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 页卡：真实仓库页，拎出开始后退后 */}
      <div style={{
        position: 'absolute', inset: 0, opacity: enter * mix(1, 0.9, recede), transformOrigin: `960px ${card.y + card.h / 2}px`,
        transform: `translateY(${(1 - enter) * 40}px) scale(${mix(1, 0.94, recede)})`, filter: recede > 0.01 ? `blur(${12 * recede}px)` : undefined,
      }}>
        <div style={{ position: 'absolute', left: card.x, top: card.y, width: card.w, height: card.h, borderRadius: S.radius, overflow: 'hidden', boxShadow: S.shadow, background: '#fff' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: card.w, height: card.h }}>{fill(c.cardImage)}</div>
          {/* 拎出后原位留一块浅灰空位，像被取走 */}
          {parts.map((pt, i) => {
            const b = onCard(pt.box);
            const gone = p(t, at[i] + 0.05, at[i] + 0.3);
            return <div key={i} style={{ position: 'absolute', left: b.x - card.x - 4, top: b.y - card.y - 4, width: b.w + 8, height: b.h + 8, borderRadius: 8, background: S.ink, opacity: 0.06 * gone }} />;
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.6 * recede }} />

      {/* 各块：先在页上描边点亮，再原位拎出、放大、飞到前景一排 */}
      {parts.map((pt, i) => {
        const mark = p(t, at[i] - 0.4, at[i] - 0.1);
        const lift = q(t, at[i], at[i] + LIFT);
        const from = onCard(pt.box);
        const fromPad: Box = { x: from.x - 6, y: from.y - 6, w: from.w + 12, h: from.h + 12 };
        const box = between(fromPad, slots[i], lift);
        const pad = mix(6, PAD, lift);
        const inner: Box = { x: pad, y: pad, w: box.w - 2 * pad, h: box.h - 2 * pad };
        const arc = Math.sin(Math.PI * lift) * -40;     // 拎起来的一点弧度
        const shadow = `0 ${mix(4, 22, lift)}px ${mix(8, 40, lift)}px 0 rgba(0,0,0,${mix(0.08, 0.18, lift)})`;
        return <React.Fragment key={i}>
          {/* 页上描边（拎出前提示位置）：随页卡一起，不受失焦影响 */}
          {lift < 0.02 && mark > 0 && <div style={{
            position: 'absolute', left: fromPad.x, top: fromPad.y, width: fromPad.w, height: fromPad.h, borderRadius: 10, boxSizing: 'border-box',
            border: `5px solid ${S.accent}`, opacity: mark, transform: `scale(${mix(1.15, 1, mark)})`,
          }} />}
          {lift > 0.001 && <div style={{
            position: 'absolute', left: box.x, top: box.y + arc, width: box.w, height: box.h, borderRadius: mix(8, 20, lift), background: '#fff',
            boxShadow: shadow, overflow: 'hidden', zIndex: 10 + i,
          }}>
            <div style={{ position: 'absolute', left: inner.x, top: inner.y, width: inner.w, height: inner.h, overflow: 'hidden' }}>{fill(pt.image)}</div>
          </div>}
        </React.Fragment>;
      })}

      {/* 名字胶囊：落定后从中间向两边擦出 */}
      {parts.map((pt, i) => {
        const e = p(t, at[i] + LIFT - 0.15, at[i] + LIFT + 0.3);
        if (e <= 0) return null;
        const w = dUnits(pt.label) * lSize + lSize * 1.4;
        const cx = slots[i].x + slots[i].w / 2;
        return <Pill key={i} box={{ x: cx - w / 2, y: pillY + (1 - e) * 14, w, h: lH }} style={{ clipPath: `inset(0 ${50 * (1 - e)}% 0 ${50 * (1 - e)}% round ${lH / 2}px)` }}>
          <DisplayText text={pt.label} size={lSize} color="#fff" />
        </Pill>;
      })}

      {/* 结论胶囊：横向展开（过冲回落），字随后出现 */}
      {res > 0 && <Pill box={{ x: 960 - (rW * res) / 2, y: rBox.y, w: rW * res, h: rH }} style={{ overflow: 'hidden' }}>
        <div style={{ opacity: clamp((t - resAt - 0.2) / 0.25), whiteSpace: 'nowrap', minWidth: rW - rSize * 1.6, textAlign: 'center' }}>
          <DisplayText text={c.result} size={rSize} color="#fff" hl={c.highlight} />
        </div>
      </Pill>}
    </Handoff>
    <Sfx name="whoosh-short" at={0} />
    {at.map((a, i) => <Sfx key={i} name="pop" at={a + 0.1} />)}
    <Sfx name="slide" at={at[0]} />
    <Sfx name="ding" at={resAt} />
  </Frame>;
}
