// T22a-PostCard：帖子/推文卡
// 观众要看懂的变化：一条真实帖子截图浮起 → 关键句被荧光刷出并放大
// 关系：同一张帖子卡原位推近（对象身份不变）。卡片先带投影浮起让观众认出“这是谁发的一条帖子”；
// 紫色荧光笔沿关键句从左往右刷过；相机推近到这一句能整行读清，其余正文白蒙版 + 失焦退后，
// 关键句原像素保持清楚；中文翻译从左往右擦出，落在关键句正下方。
// 与库内区分：T05c 是文档里原句被划掉改写；T18c 是长页滚动停在卖点旁落胶囊；这里是“社交帖子 → 荧光刷句 → 推近 + 译文”。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, cameraTransform, clamp, cueAt, mix, p, quintic, textWidth } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type PostCardProps = HandoffProps & {
  image: string;        // 帖子截图（public 相对路径）；无关用户名请先在素材上打码
  imageWidth: number;   // 源图像素宽
  imageHeight: number;  // 源图像素高
  line: Box;            // 关键句所在区域（源图像素）
  translation: string;  // 关键句的中文翻译（一句）
  highlight?: string;   // translation 里染紫的一处
  cues?: number[];      // [0]=荧光笔开始刷，[1]=推近开始；译文跟在推近后
};

// 默认：Hugging Face 上 merve 发的 DeepSeek-OCR 帖子（公开页面，无登录截图，只含作者本人）
export const postCardDefaults: PostCardProps = {
  image: 'media/x7-hf-post.png',
  imageWidth: 3000,
  imageHeight: 1688,
  line: { x: 184, y: 496, w: 1560, h: 112 },
  translation: '离谱的是，它能读懂图表，再用 HTML 原样画出来',
  highlight: '读懂图表',
};

const MAX_CARD = { w: 1280, h: 760 };

function renderHi(text: string, hi: string | undefined, color: string) {
  if (!hi || !text.includes(hi)) return text;
  const i = text.indexOf(hi);
  return <>{text.slice(0, i)}<span style={{ color }}>{hi}</span>{text.slice(i + hi.length)}</>;
}

export function PostCard(props: Partial<PostCardProps>) {
  const c = { ...postCardDefaults, ...props };
  const t = useT();

  // —— 终态几何：卡片按源图比例放进 1280×760，居中 ——
  const k = Math.min(MAX_CARD.w / c.imageWidth, MAX_CARD.h / c.imageHeight);
  const cw = c.imageWidth * k, ch = c.imageHeight * k;
  const card: Box = { x: 960 - cw / 2, y: 540 - ch / 2 + 10, w: cw, h: ch };
  const ln: Box = { x: card.x + c.line.x * k, y: card.y + c.line.y * k, w: c.line.w * k, h: c.line.h * k };

  // —— 时间线 ——
  const brushAt = cueAt(c.cues, 0, 1.0);
  const pushAt = cueAt(c.cues, 1, Math.max(brushAt + 0.75, 1.9));
  const transAt = pushAt + 0.55;
  const enter = p(t, 0, 0.7);
  const brush = p(t, brushAt, brushAt + 0.6);
  const push = quintic(t, pushAt, pushAt + 0.7);
  const trans = p(t, transAt, transAt + 0.55);

  // —— 推近：整句宽度落在 1500 以内，字高上限 2.1 倍 ——
  const zoom = Math.max(1, Math.min(2.1, 1500 / ln.w));
  // —— 译文：一行放得下就一行（≥56），否则两行 ——
  const maxW = 1560;
  const oneSize = Math.min(68, maxW / Math.max(1, textWidth(c.translation, 1)));
  const lines = oneSize >= 56 ? [c.translation] : splitTwo(c.translation);
  const tSize = Math.min(68, maxW / Math.max(1, ...lines.map((l) => textWidth(l, 1))));
  // 关键句 + 译文作为一组在画面中线上下居中
  const GAP = 52;
  const groupH = ln.h * zoom + GAP + lines.length * tSize * 1.16;
  const LINE_SCREEN_Y = 540 - groupH / 2 + (ln.h * zoom) / 2;
  const fx = ln.x + ln.w / 2;
  const fy = ln.y + ln.h / 2 + (540 - LINE_SCREEN_Y) / zoom;
  const camera = cameraTransform(fx, fy, zoom, push);

  const lineBottom = LINE_SCREEN_Y + (ln.h * zoom) / 2;
  const transY = lineBottom + GAP;

  // 卡片入场：上浮 + 轻微放大，阴影一直在（浮起感来自位移 + 阴影）
  const lift = (1 - enter) * 70;
  const scaleIn = mix(0.95, 1, enter);
  const pad = 8;   // 关键句左右留一点（卡片像素）；上下严格按行框，不带进上一行的字脚

  const img = (style?: React.CSSProperties) => <Img src={staticFile(c.image)} style={{
    position: 'absolute', left: 0, top: 0, width: cw, height: ch, display: 'block', ...style,
  }} />;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camera }}>
        <div style={{
          position: 'absolute', left: card.x, top: card.y, width: cw, height: ch, borderRadius: S.radius,
          overflow: 'hidden', background: '#fff', opacity: clamp(enter * 2.2),
          // 推近后卡片边缘出画，投影随推近收掉，不在画面里留一条竖边
          boxShadow: `0 16px 25px 0 rgba(0,0,0,${(0.1333 * (1 - push)).toFixed(4)})`,
          transform: `translateY(${lift}px) scale(${scaleIn})`, transformOrigin: '50% 60%',
        }}>
          {/* 材料层：推近时失焦 + 白蒙版退后 */}
          <div style={{ position: 'absolute', inset: 0, filter: push > 0.01 ? `blur(${7 * push}px)` : undefined }}>{img()}</div>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.8 * push }} />
          {/* 关键句：原像素复制，始终清楚 */}
          <div style={{
            position: 'absolute', left: 0, top: 0, width: cw, height: ch,
            clipPath: `inset(${c.line.y * k}px ${cw - (c.line.x + c.line.w) * k - pad}px ${ch - (c.line.y + c.line.h) * k}px ${c.line.x * k - pad}px)`,
          }}>{img()}</div>
          {/* 荧光笔：紫色半透明，正片叠底，不盖住字 */}
          {brush > 0 && <div style={{
            position: 'absolute', left: c.line.x * k - 4, top: c.line.y * k + c.line.h * k * 0.12,
            width: (c.line.w * k + 8) * brush, height: c.line.h * k * 0.76, borderRadius: 6,
            background: S.accent, opacity: 0.24, mixBlendMode: 'multiply',
          }} />}
        </div>
      </div>

      {/* 译文：屏幕坐标，不随相机缩放；从左往右擦出 */}
      {trans > 0 && <div style={{
        position: 'absolute', left: 0, right: 0, top: transY, textAlign: 'center', color: S.ink,
        clipPath: `inset(0 ${100 * (1 - trans)}% 0 0)`, transform: `translateX(${(1 - trans) * 28}px)`,
      }}>
        {lines.map((l, i) => <div key={i} style={{ ...textBase(tSize, 900) }}>{renderHi(l, c.highlight, S.accent)}</div>)}
      </div>}
    </Handoff>
    <Sfx name="whoosh-short" at={brushAt} />
    <Sfx name="woosh" at={pushAt} />
    <Sfx name="pop" at={transAt} />
  </Frame>;
}

// 在中点附近断成两行，优先断在标点后
function splitTwo(text: string): string[] {
  const chars = Array.from(text);
  const half = textWidth(text, 1) / 2;
  let best = Math.ceil(chars.length / 2), score = Infinity, acc = 0;
  for (let i = 1; i < chars.length; i++) {
    acc += textWidth(chars[i - 1], 1);
    const sc = Math.abs(acc - half) + (/[，,、：:；;。！？!?]/.test(chars[i - 1]) ? -4 : chars[i - 1] === ' ' ? -1 : 0);
    if (sc < score) { score = sc; best = i; }
  }
  return [chars.slice(0, best).join('').trim(), chars.slice(best).join('').trim()];
}
