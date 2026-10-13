// T12c-CaseTurn：案例转折（快过渡 3s）
// 观众要看懂的变化：讲完道理 → 转进一个具体案例
// 动作：刚讲完的道理是一枚居中大胶囊；它缩小、坐到案例卡上沿左侧保留上下文，一张真实作品/界面卡以左边为轴
//       翻进来接管画面，案例名牌最后贴在卡片左下角。
// 与库内区分：L81-B075 是虚线舞台切案例、107-02 是三项收束接案例；这里的主动作是“道理让位 + 案例卡 3D 翻入”。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Media, Pill, Sfx, textBase, useT } from '../kit/ui';

export type CaseTurnProps = HandoffProps & {
  point: string;        // 刚讲完的道理（一句话）
  highlight: string;    // point 里染紫的词（深底 #D6BEFF），留空不强调
  media: string;        // 案例卡素材（public 相对路径，图片或视频）
  mediaStart?: number;  // 视频素材起点（秒）
  caseTitle: string;    // 案例名牌；留空不显示
  cues?: number[];      // [0]=道理让位、案例卡翻入，[1]=案例名牌出现
};

// 默认内容：第 94 期 Image 2.5 实测，第一个案例“水巷春集”微缩水城（真实生成作品）
export const caseTurnDefaults: CaseTurnProps = {
  point: '同一段提示词，看谁细节更足',
  highlight: '细节',
  media: 'media/w7-case-water-town.jpg',
  caseTitle: '案例一：水巷春集',
};

const CARD_W = 1152, CARD_H = 648;   // 16:9 案例卡
const TOP_PILL_H = 104;              // 让位后胶囊高度
const DOCK_X = 0;                    // 胶囊与卡片左边对齐，坐在卡片上沿（底边贴着卡片顶边，不盖住素材内容）
const DOCK_OVERLAP = 0;

function Highlighted({ text, hl, color }: { text: string; hl: string; color: string }) {
  const i = hl ? text.indexOf(hl) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<span style={{ color }}>{hl}</span>{text.slice(i + hl.length)}</>;
}

export function CaseTurn(props: Partial<CaseTurnProps>) {
  const c = { ...caseTurnDefaults, ...props };
  const t = useT();
  const turnAt = cueAt(c.cues, 0, 0.8);
  const titleAt = cueAt(c.cues, 1, 1.85);

  // —— 道理胶囊：居中大字 → 缩小，跨贴到案例卡上沿左侧（成为卡片的“出处”，不做页眉） ——
  const units = Math.max(1, textWidth(c.point, 1));
  const bigSize = Math.min(128, 1700 / units);
  const smallSize = Math.min(58, (CARD_W - DOCK_X * 2) / 1.12 / units);
  const cardX = (1920 - CARD_W) / 2;
  const cardY = 540 - CARD_H / 2 + 44;                 // 整组略偏下，给上沿胶囊留位
  const smallW = textWidth(c.point, smallSize) + smallSize * 1.6;

  const enter = p(t, 0, 0.36);
  const move = q(t, turnAt, turnAt + 0.6);
  const size = mix(bigSize, smallSize, move);
  const pillH = mix(bigSize * 1.9, TOP_PILL_H, move);
  const pillW = textWidth(c.point, size) + mix(bigSize * 1.5, smallSize * 1.6, move);
  const pillCx = mix(960, cardX + DOCK_X + smallW / 2, move);
  const pillCy = mix(540, cardY - TOP_PILL_H / 2 + DOCK_OVERLAP, move);

  // —— 案例卡：以左边为轴翻入（像翻开一页），落定后不再动 ——
  const flip = p(t, turnAt + 0.28, turnAt + 0.98);
  const rot = mix(80, 0, flip);                    // 右边从画面深处转过来，不朝镜头冲出画面
  const name = p(t, titleAt, titleAt + 0.38);
  const nameSize = Math.min(54, (CARD_W - 200) / 1.1 / Math.max(1, textWidth(c.caseTitle, 1)));
  const nameW = textWidth(c.caseTitle, nameSize) + nameSize * 1.5;
  const nameH = nameSize * 1.9;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 案例卡（翻入） */}
      {flip > 0 && <div style={{ position: 'absolute', inset: 0, perspective: 2600, perspectiveOrigin: `960px ${cardY + CARD_H / 2}px` }}>
        <div style={{
          position: 'absolute', left: cardX, top: cardY, width: CARD_W, height: CARD_H,
          transform: `rotateY(${rot}deg)`, transformOrigin: '0% 50%',
          opacity: clamp(flip * 4), borderRadius: S.radius, boxShadow: S.shadow, background: '#fff',
        }}>
          <Media src={c.media} start={c.mediaStart ?? 0} box={{ x: 0, y: 0, w: CARD_W, h: CARD_H }} />
          {/* 翻转途中背面方向的暗面，落定后为 0 */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: S.radius, background: '#000', opacity: (1 - flip) * 0.35 }} />
          {c.caseTitle && <Pill box={{ x: 40, y: CARD_H - nameH - 40 + (1 - name) * 22, w: nameW, h: nameH }}
            style={{ opacity: name, transform: `scale(${mix(0.86, 1, name)})`, transformOrigin: '0% 100%' }}>
            <span style={{ ...textBase(nameSize, 400, S.display), color: '#fff' }}>{c.caseTitle}</span>
          </Pill>}
        </div>
      </div>}
      {/* 道理胶囊（让位后保留在上方） */}
      <Pill box={{ x: pillCx - pillW / 2, y: pillCy - pillH / 2, w: pillW, h: pillH }}
        style={{ opacity: clamp(enter * 1.6), transform: `scale(${mix(0.88, 1, enter)})` }}>
        <span style={{ ...textBase(size, 400, S.display), color: '#fff' }}>
          <Highlighted text={c.point} hl={c.highlight} color={S.accentDark} />
        </span>
      </Pill>
    </Handoff>
    <Sfx name="pop" at={0} />
    <Sfx name="woosh" at={turnAt} />
    {c.caseTitle && <Sfx name="pop" at={titleAt} />}
  </Frame>;
}
