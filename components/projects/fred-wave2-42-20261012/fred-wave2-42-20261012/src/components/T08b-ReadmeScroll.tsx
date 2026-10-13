// T08b-ReadmeScroll：长网页滚动阅读，到标题停住
// 观众要看懂的变化：一张长页面 → 滚到关键段落停下读清
// 关系：同一张长文档连续向下滚（路过几个小节不停），减速停在目标标题；相机推近这一节，
// 上下文白蒙版退后；正文按阅读顺序从“未读的浅色”被读成实墨，左侧一条紫色阅读线跟着走到段尾。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, cameraTransform, clamp, cueAt, mix, p, quintic, wipe } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Sfx, useT } from '../kit/ui';

export type ReadmeScrollProps = HandoffProps & {
  page: string;        // 长页面整图（竖向）
  pageWidth: number;   // 源图像素宽
  pageHeight: number;  // 源图像素高
  startY: number;      // 开场停在哪一处（源图像素 y）
  focus: Box;          // 要读清的一节：标题 + 正文（源图像素）
  bodyTop: number;     // 正文从哪一行开始（源图像素 y，标题在它上面）
  cues?: number[];     // [0]=开始滚动，[1]=推近，[2]=开始读正文
};

export const readmeScrollDefaults: ReadmeScrollProps = {
  page: 'media/w9-article-long.jpg',
  pageWidth: 2116,
  pageHeight: 11866,
  startY: 6826,
  focus: { x: 40, y: 10020, w: 2030, h: 380 },
  bodyTop: 10225,
};

const VIEW = { x: 230, y: 0, w: 1310 };   // 文档纸面：上下都出画，表示页面很长；右缘让开角标
const STOP_Y = 330;                        // 目标小节停在画面上三分之一

export function ReadmeScroll(props: Partial<ReadmeScrollProps>) {
  const c = { ...readmeScrollDefaults, ...props };
  const t = useT();
  const k = VIEW.w / c.pageWidth;
  const maxScroll = Math.max(0, c.pageHeight - 1080 / k);
  const from = clamp(c.startY, 0, maxScroll);
  const target = clamp(c.focus.y - STOP_Y / k, 0, maxScroll);

  const scrollAt = cueAt(c.cues, 0, 0.3);
  const dist = Math.abs(target - from) * k;
  const scrollDur = clamp(0.9 + dist / 1900, 1.1, 2.1);
  const pushAt = cueAt(c.cues, 1, scrollAt + scrollDur + 0.12);
  const readAt = cueAt(c.cues, 2, pushAt + 0.7);
  const bodyH = c.focus.y + c.focus.h - c.bodyTop;
  const readDur = clamp(0.9 + bodyH * k / 260, 1.0, 1.9);

  const scrollOf = (time: number) => mix(from, target, wipe(time, scrollAt, scrollAt + scrollDur));
  const scroll = scrollOf(t);
  const vel = (scrollOf(t + 1 / 60) - scroll) * k;
  const ghost = clamp(Math.abs(vel) * 0.75, 0, 40);

  const push = quintic(t, pushAt, pushAt + 0.6);
  const read = clamp((t - readAt) / readDur);                 // 匀速读，像视线往下走
  const readEase = read * read * (3 - 2 * read);

  // 目标小节的屏幕位置（相机之前）
  const fx = VIEW.x + c.focus.x * k, fy = (c.focus.y - scroll) * k;
  const fw = c.focus.w * k, fh = c.focus.h * k;
  const zoom = Math.max(1, Math.min(1.9, 1780 / fw, 900 / fh));
  const camera = cameraTransform(fx + fw / 2, fy + fh / 2, zoom, push);

  const bodyY = (c.bodyTop - scroll) * k;                     // 正文起点（页面坐标 → 屏幕）
  const bodyBottom = fy + fh;
  const readLine = mix(bodyY, bodyBottom, readEase);
  const unread = clamp((t - (pushAt + 0.2)) / 0.3) * (1 - clamp((read - 0.97) / 0.03));
  const enter = p(t, 0, 0.45);

  const pageImg = (extra?: React.CSSProperties) => <Img src={staticFile(c.page)} style={{
    position: 'absolute', left: 0, top: -scroll * k, width: VIEW.w, height: c.pageHeight * k, display: 'block', ...extra,
  }} />;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camera }}>
        {/* 纸面：长页面正文栏，上下出画 */}
        <div style={{
          position: 'absolute', left: VIEW.x, top: -40 + (1 - enter) * 50, width: VIEW.w, height: 1160,
          background: '#fff', boxShadow: S.shadow, overflow: 'hidden', opacity: enter,
        }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 40, bottom: 0, filter: push > 0.01 ? `blur(${12 * push}px)` : undefined }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              {pageImg()}
              {ghost > 2 && pageImg({ transform: `translateY(${ghost}px)`, opacity: 0.2 })}
              {ghost > 2 && pageImg({ transform: `translateY(${-ghost}px)`, opacity: 0.2 })}
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.8 * push }} />
        </div>

        {/* 目标小节：原像素保持清楚（不提起，就是纸面上被读的那一段） */}
        {push > 0.01 && <div style={{
          position: 'absolute', left: fx, top: fy, width: fw, height: fh, overflow: 'hidden', opacity: clamp(push * 1.5),
        }}>
          <Img src={staticFile(c.page)} style={{
            position: 'absolute', left: -c.focus.x * k, top: -c.focus.y * k, width: VIEW.w, height: c.pageHeight * k,
          }} />
          {/* 未读部分：浅色，阅读线走过的地方变成实墨 */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: readLine - fy, bottom: 0, background: '#fff', opacity: 0.62 * unread,
          }} />
        </div>}

        {/* 紫色阅读线：只在正文左侧，跟着读到段尾 */}
        {read > 0 && <div style={{
          position: 'absolute', left: fx - 26 / zoom, top: bodyY, width: 9 / zoom, height: Math.max(0, readLine - bodyY),
          borderRadius: 6, background: S.accent, opacity: clamp(read * 6) * push,
        }} />}
      </div>
    </Handoff>
    <Sfx name="slide" at={scrollAt} />
    <Sfx name="woosh" at={pushAt} />
  </Frame>;
}
