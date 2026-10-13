// T08e-CommentPull：评论里拎出问题
// 观众要看懂的变化：一张真实评论截图 → 里面的几个问题被框出、拎成大号黑胶囊叠在前景
// 动作：评论列表先读清；口播念到哪个问题，荧光就从左往右扫过那一句（字同时转紫）；
//       问完后评论区退后（缩小 + 失焦 + 白蒙版），被框住的几句依次从原位“拎起”，
//       同一个对象一路长大成黑胶囊（motion-craft §4 对象连续），左对齐叠放在前景，问号用深底紫。
// 与库内区分：N002 是凭空写出问句；T17a 是配置文件里拎出一行；这里问题来自评论原文，先框后拎、多句叠放。
//
// 素材说明：默认用 Fred 录的真实评论区（114 期 01_输入素材/327ec936…_raw.mp4 的 4.3s / 5.9s / 9.3s 三帧），
// 裁出 5 条评论行拼成一张评论卡 public/media/x1-comments.png；其他用户的头像和昵称已在图里高斯模糊打码，
// Fred 回复里的“群聊·Fred AI分享群”（加群/私域风险词）所在行全部裁掉，不上屏。
// 竖图（高 > 宽 × 0.8）时评论卡靠左、问题胶囊叠在右侧；横图时胶囊叠在截图前景中央。
// 换图：image = 'media/<截图>.png'，imageSize = 截图像素尺寸，questions[i].box = 这句在截图里的像素框（隐私区域先在图里打码）。
// image 留空时退回“重建示意”评论列表（白卡、灰圆头像、灰色打码条），用 comments + questions[i].comment。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Sfx, abs, textBase, useT } from '../kit/ui';

export type PullQuestion = {
  text: string;      // 拎出后胶囊里的问题（建议与评论里被框住的原话一致）
  box?: Box;         // 截图模式：这句在截图里的像素框
  comment?: number;  // 重建模式：在第几条评论里（0 起）
  quote?: string;    // 重建模式：评论里被框住的原话；不传 = text
};
export type CommentPullProps = HandoffProps & {
  image: string;                         // 真实评论截图（public 下路径）；留空 = 用 comments 重建示意
  imageSize: { w: number; h: number };   // 截图像素尺寸
  comments: string[];                    // 重建示意的评论文字（3–6 条）
  questions: PullQuestion[];             // 2–4 个问题
  cues?: number[];                       // [i]=第 i 个问题被框住；[问题数]=评论退后、开始拎起
};

// 默认内容：第 114 期 S01“评论区问得最多的……地址在哪？怎么下载？能不能帮我部署一下？”
// image 为真实评论卡（打码版）；comments 只在 image 留空时用作重建示意。
export const commentPullDefaults: CommentPullProps = {
  image: 'media/x1-comments.png',
  imageSize: { w: 1060, h: 1209 },
  comments: [
    '老师太厉害了！这个 Skill 的地址在哪？',
    '这条也是 AI 剪的？完全看不出来',
    '点进去全是代码，到底怎么下载？',
    '支持开源，已三连',
    '照着弄了半天没跑起来，能不能帮我部署？',
  ],
  questions: [
    { text: '地址在哪？', comment: 0, box: { x: 179, y: 349, w: 401, h: 66 } },      // 请问开源地址在哪儿
    { text: '怎么下载？', comment: 2, box: { x: 179, y: 803, w: 437, h: 66 } },      // 你好，这套Skill怎么下
    { text: '能不能帮我部署？', comment: 4, box: { x: 179, y: 1034, w: 222, h: 66 } }, // 在线帮部署
  ],
};

// 先冲过目标一点、再回落（motion-craft §2）
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

// 评论折行：最多两行，不把被框住的原话拆开
function wrapComment(text: string, size: number, maxW: number, keep: [number, number] | null): string[] {
  if (textWidth(text, size) <= maxW) return [text];
  const chars = Array.from(text);
  let best = -1, bestScore = Infinity, acc = 0;
  for (let i = 1; i < chars.length; i++) {
    acc += textWidth(chars[i - 1], size);
    if (acc > maxW) break;
    if (keep && i > keep[0] && i < keep[1]) continue;
    if (/[，,、。：:；;！!？?]/.test(chars[i])) continue;
    const rest = textWidth(chars.slice(i).join(''), size);
    if (rest > maxW) continue;
    const score = Math.abs(acc - rest) + (/[，,、。！!？?]/.test(chars[i - 1]) ? -size * 2 : 0);
    if (score < bestScore) { bestScore = score; best = i; }
  }
  if (best < 0) return [text];
  return [chars.slice(0, best).join(''), chars.slice(best).join('')];
}

const MAX_CARD_W = 1480;
const AVATAR = 62, PAD_X = 60, PAD_Y = 52, ROW_GAP = 40, NAME_H = 22, NAME_GAP = 16;
const NAME_W = [148, 112, 176, 128, 160, 120];
const HL = 'rgba(133, 84, 232, 0.16)';    // 荧光底：浅底紫 #8554E8 的 16% 透明

function QuestionText({ text, size, color }: { text: string; size: number; color: string }) {
  const m = text.match(/^(.*?)([？?]+)$/);
  if (!m) return <>{text}</>;
  return <>{m[1]}<span style={{ color }}>{m[2]}</span></>;
}

export function CommentPull(props: Partial<CommentPullProps>) {
  const c = { ...commentPullDefaults, ...props };
  const t = useT();
  const qs = c.questions.slice(0, 4);
  const n = Math.max(1, qs.length);
  const useImage = !!c.image;
  const side = useImage && c.imageSize.h > c.imageSize.w * 0.8;   // 竖图：评论卡靠左，胶囊在右
  const SIDE_GAP = 90;

  // —— 时间：问题依次被框住 → 评论退后、依次拎起 ——
  const markAt = (i: number) => cueAt(c.cues, i, 0.75 + i * 0.62);
  const liftAt = cueAt(c.cues, n, markAt(n - 1) + 0.66);
  const liftStart = (i: number) => liftAt + i * 0.13;
  const rec = q(t, liftAt - 0.05, liftAt + 0.6);
  const enter = p(t, 0, 0.5);

  // —— 材料层几何：重建列表 or 截图 ——
  let card: Box;
  let fs = 40;
  type Row = { lines: string[]; top: number; h: number };
  let rows: Row[] = [];
  const quoteOf = (qq: PullQuestion) => qq.quote ?? qq.text;
  const comments = c.comments.slice(0, 6);
  if (!useImage) {
    const textX = PAD_X + AVATAR + 26;
    const keepOf = (ci: number): [number, number] | null => {
      const qq = qs.find((x) => x.comment === ci);
      if (!qq) return null;
      const s = Array.from(comments[ci]); const k = comments[ci].indexOf(quoteOf(qq));
      if (k < 0) return null;
      const s0 = Array.from(comments[ci].slice(0, k)).length;
      return s.length ? [s0, s0 + Array.from(quoteOf(qq)).length] : null;
    };
    for (fs = 40; fs >= 32; fs -= 2) {
      const maxTextW = MAX_CARD_W - textX - PAD_X;
      let y = PAD_Y;
      rows = comments.map((cm, ci) => {
        const lines = wrapComment(cm, fs, maxTextW, keepOf(ci));
        const h = NAME_H + NAME_GAP + lines.length * fs * 1.36;
        const r = { lines, top: y, h };
        y += h + ROW_GAP;
        return r;
      });
      if (y - ROW_GAP + PAD_Y <= 820) break;
    }
    const widest = Math.max(...rows.flatMap((r) => r.lines.map((l) => textWidth(l, fs))));
    const w = clamp(textX + widest + PAD_X, 980, MAX_CARD_W);
    const h = rows.length ? rows[rows.length - 1].top + rows[rows.length - 1].h + PAD_Y : 400;
    card = { x: 960 - w / 2, y: 540 - h / 2 + 10, w, h };
  } else {
    const k = side ? Math.min(820 / c.imageSize.w, 860 / c.imageSize.h) : Math.min(1500 / c.imageSize.w, 820 / c.imageSize.h);
    const w = c.imageSize.w * k, h = c.imageSize.h * k;
    card = { x: 960 - w / 2, y: 540 - h / 2 + 10, w, h };   // 竖图的 x 在下面按整组宽度重排
  }
  const textX = PAD_X + AVATAR + 26;

  // 每个问题在材料层里的框（舞台坐标，未退后时）
  const quoteBox = (qq: PullQuestion): Box & { line?: number; row?: number; before?: string } => {
    if (useImage && qq.box) {
      const k = card.w / c.imageSize.w;
      return { x: card.x + qq.box.x * k, y: card.y + qq.box.y * k, w: qq.box.w * k, h: qq.box.h * k };
    }
    const ri = qq.comment ?? 0;
    const r = rows[ri];
    const quote = quoteOf(qq);
    if (!r) return { x: 960, y: 540, w: 10, h: 10 };
    const li = Math.max(0, r.lines.findIndex((l) => l.includes(quote)));
    const before = (r.lines[li] ?? '').split(quote)[0] ?? '';
    const lh = fs * 1.36;
    return {
      x: card.x + textX + textWidth(before, fs), y: card.y + r.top + NAME_H + NAME_GAP + li * lh + (lh - fs * 1.16) / 2,
      w: textWidth(quote, fs), h: fs * 1.16, line: li, row: ri, before,
    };
  };

  // —— 前景胶囊：左对齐叠放，整组居中 ——
  const units = Math.max(...qs.map((qq) => textWidth(qq.text, 1)));
  const big = Math.min(side ? 96 : 104, (side ? 1740 - card.w - SIDE_GAP : 1300) / (units + 1.3), 820 / (n * 1.78 + (n - 1) * 0.3));
  const pillH = big * 1.78, GAP = big * 0.3;
  const pillW = (qq: PullQuestion) => textWidth(qq.text, big) + big * 1.3;
  const groupW = Math.max(...qs.map(pillW));
  const groupH = n * pillH + (n - 1) * GAP;
  // 竖图：评论卡 + 间距 + 胶囊列整体居中
  const groupX = side ? 960 - (card.w + SIDE_GAP + groupW) / 2 + card.w + SIDE_GAP : 960 - groupW / 2;
  // 竖图：先居中读评论，拎起时评论卡和胶囊共用同一进度让到左侧（让位 = 给胶囊腾出右半边）
  if (side) card = { ...card, x: mix(960 - card.w / 2, groupX - SIDE_GAP - card.w, rec) };
  const toBox = (i: number): Box => ({ x: groupX, y: 540 - groupH / 2 + 10 + i * (pillH + GAP), w: pillW(qs[i]), h: pillH });

  // 退后：以卡片中心缩小
  const recScale = mix(1, side ? 0.97 : 0.94, rec);
  const ccx = card.x + card.w / 2, ccy = card.y + card.h / 2;
  const toStage = (b: Box): Box => ({ x: ccx + (b.x - ccx) * recScale, y: ccy + (b.y - ccy) * recScale, w: b.w * recScale, h: b.h * recScale });


  // 每个问题的进度
  const st = qs.map((qq, i) => {
    const mark = p(t, markAt(i), markAt(i) + 0.36);
    const a = liftStart(i);
    const move = q(t, a, a + 0.66);                       // 位置：smoothstep 搬移
    const grow = overshoot(t, a, 0.6, 0.24, 0.045);       // 尺寸：过冲 4.5% 再回落
    return { mark, a, move, grow, lifted: t >= a };
  });

  const materialStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, transformOrigin: `${ccx}px ${ccy}px`,
    transform: `translateY(${(1 - enter) * 40}px) scale(${recScale})`, filter: rec > 0.001 && !side ? `blur(${rec * 10}px)` : undefined,
    opacity: clamp(enter * 1.6),
  };

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 材料层：评论列表（重建示意）或真实截图 */}
      <div style={materialStyle}>
        {useImage ? <>
          <div style={{ ...abs(card), borderRadius: S.radius, overflow: 'hidden', boxShadow: S.shadow }}>
            <Img src={staticFile(c.image)} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
          {qs.map((qq, i) => {
            const b = quoteBox(qq);
            const m = st[i].mark;
            return m > 0 && <div key={i} style={{
              ...abs({ x: b.x - 10, y: b.y - 6, w: b.w + 20, h: b.h + 12 }), background: HL, borderRadius: 12,
              clipPath: `inset(0 ${100 * (1 - m)}% 0 0 round 12px)`, opacity: st[i].lifted ? 0 : 1,
            }} />;
          })}
        </> : <div style={{ ...abs(card), background: '#fff', borderRadius: S.radius, boxShadow: S.shadow }}>
          {rows.map((r, ri) => {
            const qi = qs.findIndex((qq) => qq.comment === ri);
            const qq = qi >= 0 ? qs[qi] : null;
            const quote = qq ? quoteOf(qq) : '';
            const e = p(t, 0.06 + ri * 0.05, 0.46 + ri * 0.05);
            return <div key={ri} style={{ position: 'absolute', left: 0, top: r.top, width: card.w, height: r.h, opacity: e, transform: `translateY(${(1 - e) * 18}px)` }}>
              {/* 头像：灰圆；用户名：灰色打码条 */}
              <div style={{ position: 'absolute', left: PAD_X, top: 0, width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, background: '#e4e4e8' }} />
              <div style={{ position: 'absolute', left: textX, top: 0, width: NAME_W[ri % NAME_W.length], height: NAME_H, borderRadius: NAME_H / 2, background: '#e4e4e8' }} />
              {r.lines.map((l, li) => {
                const k = qq ? l.indexOf(quote) : -1;
                const style: React.CSSProperties = { ...textBase(fs, 500), position: 'absolute', left: textX, top: NAME_H + NAME_GAP + li * fs * 1.36, lineHeight: 1.36, color: S.ink };
                if (k < 0 || !qq) return <div key={li} style={style}>{l}</div>;
                const m = st[qi].mark;
                const gone = st[qi].lifted;
                return <div key={li} style={style}>
                  {l.slice(0, k)}
                  <span style={{ position: 'relative', display: 'inline-block', color: gone ? 'transparent' : S.ink }}>
                    {m > 0 && !gone && <span style={{
                      position: 'absolute', left: -10, right: -10, top: '4%', bottom: '4%', background: HL, borderRadius: 12,
                      clipPath: `inset(0 ${100 * (1 - m)}% 0 0 round 12px)`,
                    }} />}
                    <span style={{ position: 'relative' }}>{quote}</span>
                    {/* 紫字层：跟着荧光一起扫过 */}
                    {m > 0 && !gone && <span style={{
                      position: 'absolute', left: 0, top: 0, color: S.accent, clipPath: `inset(0 ${100 * (1 - m)}% 0 0)`,
                    }}>{quote}</span>}
                  </span>
                  {l.slice(k + quote.length)}
                </div>;
              })}
            </div>;
          })}
        </div>}
      </div>
      {/* 白蒙版：材料退后 */}
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: (side ? 0.3 : 0.7) * rec }} />
      {/* 前景：从原位拎起的黑胶囊 */}
      {qs.map((qq, i) => {
        const s = st[i];
        if (!s.lifted) return null;
        const from = toStage(quoteBox(qq));
        const fromBox: Box = { x: from.x - from.h * 0.5, y: from.y - from.h * 0.25, w: from.w + from.h, h: from.h * 1.5 };
        const to = toBox(i);

        const cy = mix(fromBox.y + fromBox.h / 2, to.y + to.h / 2, s.move);
        const w = mix(fromBox.w, to.w, s.grow), h = mix(fromBox.h, to.h, s.grow);
        // 左沿锚定：左沿从原位走到落点、胶囊向右长大；再夹在左右安全区内（过冲那一下也不出画）
        const left = clamp(mix(fromBox.x, to.x, s.move), 80, 1840 - w);
        const startFs = useImage && qq.box ? qq.box.h * (card.w / c.imageSize.w) * 0.7 : fs;
        const size = mix(startFs * recScale, big, s.grow);
        const tilt = Math.sin(Math.PI * s.move) * -2.4;
        const sh = clamp(s.move * 1.4);
        return <div key={i} style={{
          ...abs({ x: left, y: cy - h / 2, w, h }), zIndex: 10 + i, transform: `rotate(${tilt}deg)`,
        }}>
          {/* 投影随拎起逐渐长出来（独立一层，避免小胶囊一出现就挂着大投影） */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: h / 2, background: S.dark, boxShadow: S.capsuleShadow, opacity: sh }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: h / 2, background: S.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...textBase(size, 400, S.display), color: '#fff' }}>
              <QuestionText text={qq.text} size={size} color={accentOn(true)} />
            </span>
          </div>
        </div>;
      })}
    </Handoff>
    {qs.slice(0, 3).map((_, i) => <Sfx key={i} name="pop" at={markAt(i)} />)}
    <Sfx name="woosh" at={liftAt} />
  </Frame>;
}
