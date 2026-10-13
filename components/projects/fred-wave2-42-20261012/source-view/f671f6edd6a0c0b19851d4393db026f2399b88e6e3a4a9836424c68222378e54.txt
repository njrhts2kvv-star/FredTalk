// T19c-ReactionCard：惊叹反应——Fred 形象加短评
// 观众要看懂的变化：看到结果 → Fred 惊叹，短评落定
// 关系：结果先占住画面（观众先看到它）；Fred 从右下探进来看结果、露出惊讶（真实 3D 透明动作），
// 结果被他的反应轻轻“震”一下让出位置，一句短评从上方落进黑胶囊，停在结果和 Fred 之间。
import React from 'react';
import { Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type ReactionCardProps = HandoffProps & {
  result: string;          // 结果素材（图片或视频）
  resultAspect?: number;   // 结果宽高比，默认 16/9
  character: string;       // Fred 透明 webm（VP9 alpha）或透明 PNG
  characterStart?: number; // 人物视频从第几秒开始播（跳过前面的站立）
  holdAt?: number;         // 人物视频播到第几秒（素材时间）定格在表情最足的一帧
  characterFlip?: boolean; // 左右镜像（人物素材朝右时，翻过来让他朝向结果）
  comment: string;         // 黑胶囊短评
  highlight?: string;      // 短评里染紫的词
  cues?: number[];         // [0]=Fred 探进来，[1]=短评落定
};

export const reactionCardDefaults: ReactionCardProps = {
  result: 'media/w9-result-water-town.jpg',
  resultAspect: 16 / 9,
  character: 'media/w9-fred-surprise.webm',
  characterStart: 0.5,
  holdAt: 2.9,
  comment: '这细节也太足了',
  highlight: '太足了',
};

// 人物视频 1440×1440，角色可见范围约 x 760–1370、y 286–1440（右下惊讶）
const CHAR = { size: 1120, x: 820, y: 1080 - 1120 + 30 };

function Comment({ text, keyword, size }: { text: string; keyword?: string; size: number }) {
  const base = { ...textBase(size, 400, S.display), color: '#fff', lineHeight: 1 };
  if (!keyword || !text.includes(keyword)) return <span style={base}>{text}</span>;
  const i = text.indexOf(keyword);
  return <span style={base}>{text.slice(0, i)}<span style={{ color: S.accentDark }}>{keyword}</span>{text.slice(i + keyword.length)}</span>;
}

export function ReactionCard(props: Partial<ReactionCardProps>) {
  const c = { ...reactionCardDefaults, ...props };
  const t = useT();
  const frame = useCurrentFrame();
  const isVideo = /\.(webm|mov|mp4)$/i.test(c.character);
  const resultIsVideo = /\.(webm|mov|mp4)$/i.test(c.result);
  const start = c.characterStart ?? 0;
  const holdFrame = Math.round(Math.max(0, (c.holdAt ?? 99) - start) * 60);

  const charAt = cueAt(c.cues, 0, 0.35);
  const landAt = cueAt(c.cues, 1, 1.45);

  // —— 结果卡：先出现、占主位；Fred 反应时被“震”一下并略向左让 ——
  const aspect = c.resultAspect ?? 16 / 9;
  const cardW = Math.min(1180, 700 * aspect), cardH = cardW / aspect;
  const enter = p(t, 0, 0.4);
  const shift = q(t, charAt, charAt + 0.6);
  const jolt = springAt(t, landAt - 0.35, 0.6);
  const cardX = mix(960 - cardW / 2, 90, shift);
  const cardY = 150 + (1 - enter) * 40;

  // —— Fred：从右下探入 ——
  const charIn = p(t, charAt, charAt + 0.6);

  // —— 短评胶囊：从上方落下，落在结果下沿与 Fred 之间 ——
  let size = 104;
  while (size > 64 && textWidth(c.comment, size) > 980) size -= 2;
  const pillH = size * 1.8, pillW = textWidth(c.comment, size) + size * 1.5;
  const drop = springAt(t, landAt, 0.7);
  const pillIn = clamp((t - landAt) / 0.12);
  const pillX = Math.min(90 + cardW * 0.5 - pillW / 2 + 140, 1360 - pillW);
  const pillY = cardY + cardH - pillH * 0.35;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 结果 */}
      <div style={{
        position: 'absolute', left: cardX, top: cardY, width: cardW, height: cardH, borderRadius: S.radius, overflow: 'hidden',
        boxShadow: S.shadow, opacity: enter, transform: `scale(${mix(1, 1.025, Math.sin(clamp(jolt) * Math.PI))})`,
      }}>
        {resultIsVideo
          ? <OffthreadVideo muted src={staticFile(c.result)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Img src={staticFile(c.result)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      </div>

      {/* Fred 3D：右下，透明视频，表情最足处定格 */}
      <div style={{
        position: 'absolute', left: CHAR.x + (1 - charIn) * 260, top: CHAR.y + (1 - charIn) * 120, width: CHAR.size, height: CHAR.size,
        opacity: charIn, zIndex: 5, transform: c.characterFlip ? 'scaleX(-1)' : undefined,
      }}>
        {isVideo
          ? <Freeze frame={holdFrame} active={frame >= holdFrame}>
              <OffthreadVideo muted transparent src={staticFile(c.character)} startFrom={Math.round(start * 60)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Freeze>
          : <Img src={staticFile(c.character)} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }} />}
      </div>

      {/* 短评 */}
      {pillIn > 0 && <div style={{
        position: 'absolute', left: pillX, top: pillY - (1 - clamp(drop)) * 120, width: pillW, height: pillH, borderRadius: pillH / 2,
        background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: pillIn, transform: `scale(${mix(0.86, 1, drop)})`, zIndex: 10,
      }}>
        <Comment text={c.comment} keyword={c.highlight} size={size} />
      </div>}
    </Handoff>
    <Sfx name="slide" at={charAt} />
    <Sfx name="pop" at={landAt} />
  </Frame>;
}
