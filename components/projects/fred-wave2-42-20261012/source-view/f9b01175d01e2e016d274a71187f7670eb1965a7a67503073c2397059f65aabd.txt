// T20c-UpdateFlash：更新快讯开场
// 观众要看懂的变化：产品名落定 → 几个更新点快速亮出
// 关系：官方发布图在后面退后（白蒙版 + 失焦）当上下文；产品 Logo + 名字落定在画面中央，随后上移让位，
// 几个更新点从产品名下方依次弹出排成一行，停住阅读。不是新闻快切：同一个产品对象始终在场。
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, textBase, useT } from '../kit/ui';

export type UpdateFlashProps = HandoffProps & {
  product: string;
  logo: string;          // 产品 Logo（透明底），'' 不显示
  backdrop: string;      // 退后的官方发布图/截图，'' 不用
  points: string[];      // 2–4 个更新点
  highlight: string;     // 某个更新点里染紫的词（黑胶囊上 #D6BEFF）
  cues?: number[];       // [0]=名字上移、开始出更新点（默认 1.0s）；[1..n]=第 i 个更新点
};

export const updateFlashDefaults: UpdateFlashProps = {
  product: 'ChatGPT 桌面端',
  logo: 'media/w8-chatgpt-mark.png',
  backdrop: 'media/w8-dots-launch.jpg',
  points: ['新增 dot 助手', '能在云电脑里替你操作', '名字形象自己定'],
  highlight: '云电脑',
};

export function UpdateFlash(props: Partial<UpdateFlashProps>) {
  const c = { ...updateFlashDefaults, ...props };
  const t = useT();
  const points = c.points.slice(0, 4);
  const n = Math.max(1, points.length);

  const liftAt = cueAt(c.cues, 0, 1.0);
  const pointAt = (i: number) => cueAt(c.cues, i + 1, liftAt + 0.12 + i * 0.26);

  // 产品名：先大后定
  const land = p(t, 0, 0.55);
  const lift = q(t, liftAt, liftAt + 0.5);
  const nameSize0 = Math.min(150, 1300 / Math.max(1, textWidth(c.product, 1)));
  const logo0 = c.logo ? nameSize0 * 1.15 : 0;
  const scale = mix(1, 0.8, lift);
  const rowW0 = logo0 + (c.logo ? nameSize0 * 0.35 : 0) + textWidth(c.product, nameSize0);

  // 更新点：一行放下（字号按总宽算）；放不下时两行
  const pad = 1.5, gap = 36;
  const em = points.reduce((a, x) => a + textWidth(x, 1) + pad, 0);  // 一行总宽（字号=1）
  let ptSize = Math.min(72, (1640 - (n - 1) * gap) / Math.max(1, em));
  let rows: string[][] = [points];
  if (ptSize < 50 && n > 2) {
    const half = Math.ceil(n / 2);
    rows = [points.slice(0, half), points.slice(half)];
    const w1 = Math.max(...rows.map((r) => r.reduce((a, x) => a + textWidth(x, 1) + pad, 0)));
    ptSize = Math.min(72, (1640 - gap) / w1);
  }
  const ptH = ptSize * 2;
  const rowGap = 30;
  const blockH = rows.length * ptH + (rows.length - 1) * rowGap;
  // 终态：名字 + 更新点整体居中
  const nameH = nameSize0 * 1.2 * 0.8;
  const endTop = (1080 - (nameH + 70 + blockH)) / 2;
  const nameCy = mix(540, endTop + nameH / 2, lift);
  const ptTop = endTop + nameH + 70;

  const bd = p(t, 0, 0.6);
  let idx = 0;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {c.backdrop && <AbsoluteFill style={{ opacity: bd }}>
        <Img src={staticFile(c.backdrop)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${mix(6, 16, bd)}px)`, transform: 'scale(1.08)' }} />
        <AbsoluteFill style={{ background: 'rgba(255,255,255,0.76)' }} />
      </AbsoluteFill>}
      <div style={{ position: 'absolute', left: 960 - rowW0 / 2, top: nameCy - nameSize0 * 0.6, width: rowW0, height: nameSize0 * 1.2,
        display: 'flex', alignItems: 'center', gap: nameSize0 * 0.35, transform: `scale(${scale * mix(1.12, 1, land)})`, transformOrigin: 'center center',
        opacity: land, filter: `blur(${(1 - land) * 10}px)`, zIndex: 10 }}>
        {c.logo && <Img src={staticFile(c.logo)} style={{ width: logo0, height: logo0, objectFit: 'contain' }} />}
        <span style={{ ...textBase(nameSize0, 900), color: S.ink }}>{c.product}</span>
      </div>
      {rows.map((row, r) => {
        const rw = row.reduce((a, x) => a + textWidth(x, ptSize) + ptSize * pad, 0) + (row.length - 1) * gap;
        let x = 960 - rw / 2;
        return row.map((pt) => {
          const i = idx++;
          const w = textWidth(pt, ptSize) + ptSize * pad;
          const a = pointAt(i);
          const v = p(t, a, a + 0.38);
          const s = springAt(t, a, 0.55);
          // 从产品名下方冒出，落到自己的位置
          const tx = x, ty = ptTop + r * (ptH + rowGap);
          const fx = 960 - w / 2, fy = nameCy;
          x += w + gap;
          const hl = c.highlight && pt.includes(c.highlight);
          const [pre, post = ''] = hl ? pt.split(c.highlight) : [pt];
          return <Pill key={i} box={{ x: mix(fx, tx, v), y: mix(fy, ty, v), w, h: ptH }}
            style={{ opacity: clamp(v * 3), transform: `scale(${mix(0.6, 1, s)})`, zIndex: 5 }}>
            <span style={{ ...textBase(ptSize, 400, S.display), color: '#fff' }}>
              {pre}{hl && <span style={{ color: S.accentDark }}>{c.highlight}</span>}{post}
            </span>
          </Pill>;
        });
      })}
    </Handoff>
    <Sfx name="whoosh-short" at={0.02} />
    <Sfx name="pop" at={pointAt(0)} />
    <Sfx name="ding" at={pointAt(n - 1) + 0.35} />
  </Frame>;
}
