// T10a-ChatExtract：长回复拎要点
// 观众要看懂的变化：AI 一大段回复 → 其中几条关键句被拎出来排成清单
// 动作：真实回复截图先读清；口播念到哪句，那一句的真实像素就在原位“提起”（白条 + 投影 + 放大，原位留下浅紫印子）；
//       随后截图让到左侧退后（缩小 + 白蒙版 + 轻失焦），提起的句条依次飞到右侧，
//       同一个白条一路变形成编号清单行（motion-craft §4 对象连续：像素条淡出、排好的字淡入）；
//       最后一条（推荐项）被黑色从左往右刷过，变成黑卡，名字染深底紫。
// 与库内区分：T08e 是评论句拎成大号黑胶囊叠在前景；T02f 是虚化背景上直接点出大字清单；
//             这里是“像素条提起 → 排进侧边编号清单 → 推荐项变黑”，截图始终保留在左侧作为出处。
// 素材：Fred 真实录屏 114 期 01_输入素材/问 Codex 录屏项目.mp4 第 12.1 秒（回复写完那一帧），
//       裁出回复栏 x1240–3450、y290–2160（4K 像素）→ public/media/x10-codex-reply.png。
//       输入框左下橙色权限标识用 maskBoxes 同底色实心块从第一帧起盖掉。
// 换图：image + imageSize；items[i].box = 这句在截图里的像素框；maskBoxes = 要盖掉的区域（源图像素）。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, quintic, textWidth } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Sfx, abs, between, textBase, useT } from '../kit/ui';

export type ExtractItem = {
  name: string;     // 清单行的名字（加粗），如产品名
  note: string;     // 名字后的一句说明
  box: Box;         // 这句在截图里的像素框（源图像素）
};
export type ChatExtractProps = HandoffProps & {
  image: string;                          // 真实回复截图（public 下路径）
  imageSize: { w: number; h: number };
  maskBoxes?: Box[];                      // 源图里要实心盖掉的区域（源图像素）
  maskColor?: string;
  items: ExtractItem[];                   // 2–4 条；最后一条是推荐项，会变黑
  cues?: number[];                        // [i]=第 i 句提起；[n]=截图让位、句条飞向清单；[n+1]=推荐项变黑
};

export const chatExtractDefaults: ChatExtractProps = {
  image: 'media/x10-codex-reply.png',
  imageSize: { w: 2210, h: 1870 },
  maskBoxes: [{ x: 180, y: 1742, w: 222, h: 60 }],
  maskColor: '#fff',
  items: [
    { name: 'Subtitle Edit', note: '字幕精修', box: { x: 485, y: 745, w: 572, h: 55 } },      // 第二个值得试的是 Subtitle Edit
    { name: 'whisper.cpp', note: '以后做进 FredTalk', box: { x: 1078, y: 1151, w: 1004, h: 55 } }, // 以后要把录音转 SRT 做进 FredTalk，再选 whisper.cpp
    { name: 'Buzz', note: '现在先试', box: { x: 285, y: 1151, w: 274, h: 55 } },             // 我的选择是：现在先试 Buzz
  ],
};

// 主曲线先冲过目标一点、再回落（motion-craft §2）
const overshoot = (t: number, a: number, rise: number, settle: number, amount: number) =>
  p(t, a, a + rise) * (1 + amount) - amount * q(t, a + rise, a + rise + settle);

const COL_RIGHT = 1840;
const LIFT = 1.4;          // 原位提起的放大倍数（让截图里的小字读得清）
const MARK = 'rgba(133, 84, 232, 0.16)';

export function ChatExtract(props: Partial<ChatExtractProps>) {
  const c = { ...chatExtractDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 4);
  const n = Math.max(1, items.length);
  const rec = n - 1;   // 推荐项 = 最后一条

  // —— 清单行排版：同组同字阶，按最长一行算字号；放不下就换成两行（名字 / 说明） ——
  const PAD = 34, BADGE = 62, BGAP = 26;
  const MAX_COL = 820, MIN_COL = 600;
  const oneLine = (s: number, it: ExtractItem) => textWidth(it.name, s) + s * 0.55 + textWidth(it.note, s * 0.86);
  let size = 52;
  while (size > 40 && Math.max(...items.map((it) => oneLine(size, it))) > MAX_COL - PAD * 2 - BADGE - BGAP) size -= 2;
  const twoLine = Math.max(...items.map((it) => oneLine(size, it))) > MAX_COL - PAD * 2 - BADGE - BGAP;
  if (twoLine) {
    size = 48;
    while (size > 36 && Math.max(...items.map((it) => Math.max(textWidth(it.name, size), textWidth(it.note, size * 0.82)))) > MAX_COL - PAD * 2 - BADGE - BGAP) size -= 2;
  }
  const textW = Math.max(...items.map((it) => twoLine ? Math.max(textWidth(it.name, size), textWidth(it.note, size * 0.82)) : oneLine(size, it)));
  const colW = clamp(textW + PAD * 2 + BADGE + BGAP + 10, MIN_COL, MAX_COL);
  const rowH = twoLine ? size * 2.5 + 30 : Math.max(118, size * 2.2);
  const GAP = n > 3 ? 22 : 30;
  const groupH = n * rowH + (n - 1) * GAP;
  const colX = COL_RIGHT - colW;
  const rowBox = (i: number): Box => ({ x: colX, y: 520 - groupH / 2 + i * (rowH + GAP), w: colW, h: rowH });

  // —— 截图卡：开场居中读清 → 让到左侧退后 ——
  const aspect = c.imageSize.w / c.imageSize.h;
  const h0 = Math.min(900, 1500 / aspect), w0 = h0 * aspect;
  const A: Box = { x: 960 - w0 / 2, y: 545 - h0 / 2, w: w0, h: h0 };
  const leftRoom = colX - 70 - 80;
  const h1 = Math.min(840, leftRoom / aspect), w1 = h1 * aspect;
  const B: Box = { x: 80 + (leftRoom - w1) / 2, y: 545 - h1 / 2, w: w1, h: h1 };

  // —— 时间 ——
  const enter = p(t, 0, 0.45);
  const liftAt = (i: number) => cueAt(c.cues, i, [0.7, 1.18, 1.62, 2.0][i] ?? 0.7 + i * 0.45);
  const moveAt = cueAt(c.cues, n, liftAt(n - 1) + 0.62);
  const recAt = cueAt(c.cues, n + 1, moveAt + 1.55);
  const shift = quintic(t, moveAt, moveAt + 0.72);
  const card = between(A, B, shift);
  const k = card.w / c.imageSize.w;
  const stage = (b: Box): Box => ({ x: card.x + b.x * k, y: card.y + (1 - enter) * 40 + b.y * k, w: b.w * k, h: b.h * k });

  const recede = shift;   // 退后与让位共用同一进度
  const flyAt = (i: number) => moveAt + 0.08 + i * 0.15;
  const black = p(t, recAt, recAt + 0.42);
  const blackPop = 0.03 * Math.sin(Math.PI * clamp((t - recAt) / 0.5));   // 变黑时轻轻鼓一下再回到原大小

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 材料层：真实截图 + 盖掉的权限标识 + 提起后原位留下的浅紫印子 */}
      <div style={{
        ...abs({ ...card, y: card.y + (1 - enter) * 40 }), borderRadius: S.radius, overflow: 'hidden', boxShadow: S.shadow, background: '#fff',
        opacity: clamp(enter * 1.6), filter: recede > 0.01 ? `blur(${recede * 1.5}px)` : undefined,
      }}>
        <Img src={staticFile(c.image)} style={{ width: '100%', height: '100%', display: 'block' }} />
        {(c.maskBoxes ?? []).map((m, i) => <div key={i} style={{
          position: 'absolute', left: m.x * k, top: m.y * k, width: m.w * k, height: m.h * k, background: c.maskColor ?? '#fff',
        }} />)}
        {items.map((it, i) => {
          const m = p(t, liftAt(i), liftAt(i) + 0.3);
          return m > 0 && <div key={i} style={{
            position: 'absolute', left: (it.box.x - 8) * k, top: (it.box.y - 4) * k, width: (it.box.w + 16) * k, height: (it.box.h + 8) * k,
            background: MARK, borderRadius: 8, opacity: m,
          }} />;
        })}
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.42 * recede }} />
      </div>

      {/* 前景：从原位提起的句条 → 飞到右侧变成清单行 */}
      {items.map((it, i) => {
        const la = liftAt(i);
        if (t < la) return null;
        const lift = overshoot(t, la, 0.34, 0.2, 0.06);
        const fa = flyAt(i);
        const move = q(t, fa, fa + 0.68);
        const pixOut = clamp((move - 0.34) / 0.2);        // 后半程像素条先淡干净
        const morph = clamp((move - 0.56) / 0.26);        // 再淡入排好的字（两层不同时出现，避免叠字）
        const src = stage(it.box);
        // 原位提起：以句条中心放大，略向上浮
        const pad = 10 * LIFT;
        const sw = src.w * mix(1, LIFT, lift) + pad * 2, sh = src.h * mix(1, LIFT, lift) + pad;
        const lifted: Box = { x: clamp(src.x + src.w / 2 - sw / 2, 80, 1840 - sw), y: src.y + src.h / 2 - sh / 2 - 10 * lift, w: sw, h: sh };
        const b = between(lifted, rowBox(i), move);
        const tilt = Math.sin(Math.PI * move) * -1.6;
        const isRec = i === rec;
        const dark = isRec ? black : 0;
        const lineH = sh - pad;   // 像素条在框里的高度（保持比例）
        const imgH = mix(lineH, rowBox(i).h * 0.36, move);
        const imgW = imgH * (it.box.w / it.box.h);
        return <div key={i} style={{
          ...abs(b), zIndex: 20 + i, transform: `rotate(${tilt}deg) scale(${1 + (isRec ? blackPop : 0)})`, transformOrigin: '50% 50%',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: mix(12, S.radius, move), background: '#fff', overflow: 'hidden',
            boxShadow: dark > 0.5 ? S.capsuleShadow : S.shadow,
          }}>
            {/* 真实像素条：提起时读清，飞行后半程淡出 */}
            <div style={{
              position: 'absolute', left: mix(pad, PAD, move), top: (b.h - imgH) / 2, width: imgW, height: imgH, overflow: 'hidden', opacity: 1 - pixOut,
            }}>
              <Img src={staticFile(c.image)} style={{
                position: 'absolute', width: c.imageSize.w * (imgH / it.box.h), height: c.imageSize.h * (imgH / it.box.h),
                left: -it.box.x * (imgH / it.box.h), top: -it.box.y * (imgH / it.box.h), maxWidth: 'none',
              }} />
            </div>
            {/* 排好的清单行（两层：白卡黑字 / 黑卡白字，黑色从左往右刷过） */}
            {morph > 0 && <>
              <Row it={it} i={i} size={size} twoLine={twoLine} pad={PAD} badge={BADGE} bgap={BGAP} h={rowBox(i).h} dark={false} op={morph} />
              {isRec && black > 0 && <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 * (1 - black)}% 0 0)` }}>
                <div style={{ position: 'absolute', inset: 0, background: S.dark }} />
                <Row it={it} i={i} size={size} twoLine={twoLine} pad={PAD} badge={BADGE} bgap={BGAP} h={rowBox(i).h} dark op={1} />
              </div>}
            </>}
          </div>
        </div>;
      })}
    </Handoff>
    {items.map((_, i) => <Sfx key={i} name="pop" at={liftAt(i)} />)}
    <Sfx name="slide" at={moveAt} />
    <Sfx name="ding" at={recAt + 0.3} />
  </Frame>;
}

function Row({ it, i, size, twoLine, pad, badge, bgap, h, dark, op }: {
  it: ExtractItem; i: number; size: number; twoLine: boolean; pad: number; badge: number; bgap: number; h: number; dark: boolean; op: number;
}) {
  const ink = dark ? '#fff' : S.ink;
  const nameColor = dark ? accentOn(true) : S.ink;
  const tx = pad + badge + bgap;
  return <div style={{ position: 'absolute', inset: 0, opacity: op }}>
    <div style={{
      position: 'absolute', left: pad, top: (h - badge) / 2, width: badge, height: badge, borderRadius: badge / 2,
      background: dark ? '#fff' : S.dark, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ ...textBase(badge * 0.56, 900), color: dark ? S.ink : '#fff', lineHeight: 1 }}>{i + 1}</span>
    </div>
    {twoLine ? <div style={{ position: 'absolute', left: tx, top: 0, height: h, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: size * 0.12 }}>
      <span style={{ ...textBase(size, 900), color: nameColor, lineHeight: 1.1 }}>{it.name}</span>
      <span style={{ ...textBase(size * 0.82, 500), color: ink, lineHeight: 1.1 }}>{it.note}</span>
    </div> : <div style={{ position: 'absolute', left: tx, top: 0, height: h, display: 'flex', alignItems: 'center', gap: size * 0.55 }}>
      <span style={{ ...textBase(size, 900), color: nameColor, lineHeight: 1 }}>{it.name}</span>
      <span style={{ ...textBase(size * 0.86, 500), color: ink, lineHeight: 1 }}>{it.note}</span>
    </div>}
  </div>;
}
