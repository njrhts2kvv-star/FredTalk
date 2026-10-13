// T12h-RoleSwitch：身份切换（快过渡 2s）
// 观众要看懂的变化：大胶囊里的身份 A → 翻转成身份 B
// 动作：黑色大胶囊居中立住，里面是当前身份；切换时旧身份向上翻走、新身份从下面翻上来（同一进度驱动），
//       胶囊宽度跟着新文字走，并带一次过冲回落；上方一行小字交代“讲完谁”。
// 与库内区分：T12a 是“点长成胶囊 + 章节名”；T12b 是“序号翻动 + 名字抽出”；T01f 是“圆点胀成句子”。
//            这里是同一枚胶囊里身份 A→B 的翻转替换。
// 规则：外观、动效、字体、音效只用 ../kit（见 DESIGN.md 第 2 节）；所有内容走 props；不改 kit。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, abs, textBase, useT } from '../kit/ui';

export type RoleSwitchProps = HandoffProps & {
  from: string;         // 旧身份
  to: string;           // 新身份
  note: string;         // 胶囊上方一行小字（例：讲完使用者 →）；留空不显示
  accentTo: boolean;    // 新身份是否染紫（黑胶囊上用 #D6BEFF）
  cues?: number[];      // [0]=开始翻转；不传用默认节奏
};

// 默认内容：第 114 期 S17“讲完使用者，我们换到上传者的角度。”
export const roleSwitchDefaults: RoleSwitchProps = {
  from: '使用者',
  to: '上传者',
  note: '讲完使用者，换个身份',
  accentTo: true,
};

const MAX_W = 1600;
const NOTE_FS = 52, NOTE_GAP = 44;

export function RoleSwitch(props: Partial<RoleSwitchProps>) {
  const c = { ...roleSwitchDefaults, ...props };
  const t = useT();

  // —— 版式：两个身份共用一个字号（按较长的那个算），胶囊高度不变、宽度随文字 ——
  const units = Math.max(1, textWidth(c.from, 1), textWidth(c.to, 1));
  const size = Math.min(196, (MAX_W - 0) / (units + 1.5));
  const H = size * 1.86;
  const wOf = (s: string) => Math.max(H * 1.5, textWidth(s, size) + size * 1.5);
  const wA = wOf(c.from), wB = wOf(c.to);
  const noteBlock = c.note ? NOTE_FS * 1.16 + NOTE_GAP : 0;
  const top = 540 - (H + noteBlock) / 2 + noteBlock + 10;   // 胶囊上沿；整组垂直居中

  // —— 时间 ——
  const enter = p(t, 0, 0.32);
  const noteIn = p(t, 0.1, 0.46);
  const at = cueAt(c.cues, 0, 0.62);
  const flip = q(t, at, at + 0.46);                          // 两段文字共用同一进度
  // 宽度：主曲线走到新宽度，再叠一次 5% 的过冲回落（宽度相同时也有“落定”的一下）
  const width = mix(wA, wB, p(t, at, at + 0.5));
  const bump = p(t, at + 0.12, at + 0.42) - q(t, at + 0.42, at + 0.72);
  const w = width * (1 + 0.05 * bump) * mix(0.9, 1, enter);
  const h = H * (1 + 0.02 * bump) * mix(0.9, 1, enter);

  const travel = H * 0.78;
  const roleStyle = (dy: number, rot: number, color: string, o: number): React.CSSProperties => ({
    ...textBase(size, 400, S.display), position: 'absolute', left: 0, right: 0, top: h / 2 - size * 0.58,
    textAlign: 'center', color, opacity: o, lineHeight: 1.16,
    transform: `perspective(${H * 3}px) translateY(${dy}px) rotateX(${rot}deg)`, transformOrigin: '50% 50%',
  });

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {c.note && <div style={{
        ...textBase(NOTE_FS, 900), position: 'absolute', left: 0, right: 0, top: top - noteBlock, textAlign: 'center', color: S.ink,
        opacity: noteIn, clipPath: `inset(0 ${50 * (1 - noteIn)}% 0 ${50 * (1 - noteIn)}%)`,
      }}>{c.note}</div>}
      <div style={{
        ...abs({ x: 960 - w / 2, y: top + (H - h) / 2 + (1 - enter) * 40, w, h }), borderRadius: h / 2, background: S.dark,
        boxShadow: S.capsuleShadow, overflow: 'hidden', opacity: clamp(enter * 3),
      }}>
        {flip < 1 && <div style={roleStyle(-flip * travel, flip * 62, '#fff', 1 - clamp((flip - 0.55) / 0.4))}>{c.from}</div>}
        {flip > 0 && <div style={roleStyle((1 - flip) * travel, -(1 - flip) * 62, c.accentTo ? accentOn(true) : '#fff', clamp(flip / 0.45))}>{c.to}</div>}
      </div>
    </Handoff>
    <Sfx name="pop" at={0} />
    <Sfx name="woosh" at={at} />
  </Frame>;
}
