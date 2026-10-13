// T11c-FourClips：四格视频成果（背景干净版）
// 观众要看懂的变化：几段成果视频 → 同时排开看全貌
// 升级自 X020：保留“前两段先在、后两段从各自一侧滑入补齐 2×2”的节奏形态；
// 按 Fred 意见“后面的背景可以更干净一些”：去掉模糊工作台底图和灰色连线，改成纯白画布 + 软阴影白卡承载。
// 同时去掉原版结尾的画面内硬切放大（jump zoom），读全貌时画面停稳。
import React from 'react';
import { S, cueAt, mix, p, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Pill, Sfx, textBase, useT } from '../kit/ui';

export type FourClip = { src: string; caption?: string; start?: number };

export type FourClipsProps = HandoffProps & {
  clips: FourClip[];   // 2–6 段成果（public 相对路径，视频或图片）；caption 可留空
  cues?: number[];     // 每段到位的时间（秒）：[0]=第一段 … 不传用默认节奏
};

export const fourClipsDefaults: FourClipsProps = {
  clips: [
    { src: 'media/w4-broll-api-flow.mp4' },
    { src: 'media/w4-broll-drawing.mp4' },
    { src: 'media/w4-broll-house.mp4' },
    { src: 'media/w4-broll-card.mp4' },
  ],
};

// 默认到位节奏：前两段几乎同时建立，后面按“补一块、停一下”的间隔进入（不机械等距）
const DEFAULT_AT = [0.05, 0.4, 1.2, 1.85, 2.45, 3.0];
const ENTER = 0.55;

// 网格：按段数排 1×n / 2 列 / 3 列；顶部让开右上角标（2 行时主体顶边 ≈ 130）
function layout(n: number) {
  const cols = n <= 2 ? n : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const gap = 36;
  const areaW = cols === 3 ? 1800 : 1680, areaH = 860;
  const w = Math.min((areaW - gap * (cols - 1)) / cols, ((areaH - gap * (rows - 1)) / rows) * 16 / 9);
  const h = w * 9 / 16;
  const cy = rows === 1 ? 540 : 560;
  const top = cy - (rows * h + (rows - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / cols), col = i % cols;
    const inRow = r === rows - 1 ? n - r * cols : cols;   // 末行不满时居中
    const rowW = inRow * w + (inRow - 1) * gap;
    const x = 960 - rowW / 2 + col * (w + gap);
    // 入场方向：左半从左、右半从右、正中从下
    const mid = x + w / 2;
    const dir = Math.abs(mid - 960) < w * 0.3 ? 0 : mid < 960 ? -1 : 1;
    return { x, y: top + r * (h + gap), w, h, dir };
  });
}

export function FourClips(props: Partial<FourClipsProps>) {
  const c = { ...fourClipsDefaults, ...props };
  const t = useT();
  const clips = c.clips.slice(0, 6);
  const boxes = layout(clips.length);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {clips.map((clip, i) => {
        const at = cueAt(c.cues, i, DEFAULT_AT[i]);
        const e = p(t, at, at + ENTER);
        const b = boxes[i];
        const dx = b.dir * (1 - e) * 220, dy = b.dir === 0 ? (1 - e) * 160 : 0;
        // 字幕胶囊：字号按标签长度自适应，胶囊最宽 = 卡宽 − 48
        const capSize = clip.caption ? Math.min(44, (b.w - 48) / (textWidth(clip.caption, 1) + 1.4)) : 0;
        const capW = clip.caption ? textWidth(clip.caption, capSize) + capSize * 1.4 : 0;
        return <div key={i} style={{
          position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h,
          opacity: e, transform: `translate(${dx}px, ${dy}px) scale(${mix(0.94, 1, e)})`,
          borderRadius: S.radius, boxShadow: S.shadow, background: '#fff',
        }}>
          <Media src={clip.src} start={clip.start ?? 0} box={{ x: 0, y: 0, w: b.w, h: b.h }} radius={S.radius} />
          {clip.caption && <Pill box={{ x: 24, y: b.h - capSize * 1.8 - 24, w: capW, h: capSize * 1.8 }} shadow="none">
            <span style={{ ...textBase(capSize, 900), color: '#fff' }}>{clip.caption}</span>
          </Pill>}
        </div>;
      })}
    </Handoff>
    {clips.slice(0, 4).map((_, i) => <Sfx key={i} name="whoosh-short" at={cueAt(c.cues, i, DEFAULT_AT[i])} volume={0.4} />)}
  </Frame>;
}
