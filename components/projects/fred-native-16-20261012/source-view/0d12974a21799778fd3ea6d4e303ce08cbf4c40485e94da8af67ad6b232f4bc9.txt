// T05c 原句改写前后：规则文档里，旧写法被划掉收起，新写法逐字替换上去。
// 关系：同一文档、同一行原位改写（对象身份不变），相机推近改写行、读完再回全貌。
import React from 'react';
import { S, cameraTransform, mix, p, q, quintic, textWidth, typed } from '../kit/theme';
import { Frame, MacWindow, Pill, Sfx, textBase, useT } from '../kit/ui';

export type RewriteLineProps = {
  fileName: string;
  lines: string[];          // 文档各行；target 行中的 oldText 会被替换
  target: number;
  oldText: string;
  newText: string;
  badge: string;
};

export const rewriteLineDefaults: RewriteLineProps = {
  fileName: 'AGENTS.md',
  lines: ['# 项目协作规则', '- 回复时用中文沟通，尽量详细一些', '- 改代码前先说明要动哪些文件', '- 完成后跑一遍测试再提交'],
  target: 1,
  oldText: '尽量详细一些',
  newText: '先给结论，再列改动',
  badge: '已改写',
};

const LINE = 64;          // 文档正文字号
const LH = 118;           // 行距
const WIN = { x: 210, y: 215, w: 1500, h: 650 };
const TEXT_X = 110;
const TEXT_Y = 78;

export function RewriteLine(props: Partial<RewriteLineProps>) {
  const c = { ...rewriteLineDefaults, ...props };
  const t = useT();
  const enter = p(t, 0, 0.7);
  // 推近改写行 → 读完回全貌（quintic，停稳阅读）
  const push = quintic(t, 0.75, 1.35) * (1 - quintic(t, 3.55, 4.15));
  const strike = p(t, 1.45, 1.9);
  const collapse = q(t, 2.0, 2.35);
  const typeStart = 2.25, typeEnd = typeStart + Array.from(c.newText).length * 0.075;
  const badge = p(t, 4.1, 4.55);

  const lineY = WIN.y + 90 + TEXT_Y + c.target * LH + LINE * 0.58;
  const [before] = c.lines[c.target].split(c.oldText);
  const oldW = textWidth(c.oldText, LINE);
  const newX = WIN.x + TEXT_X + textWidth(before, LINE);
  const lineStart = WIN.x + TEXT_X, lineEnd = newX + textWidth(c.newText, LINE);
  // 推近只到整行都在画面内为止
  const zoom = Math.min(1.32, 1760 / (lineEnd - lineStart + 80));
  const camera = cameraTransform((lineStart + lineEnd) / 2, lineY, zoom, push);

  return <Frame>
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camera }}>
      <MacWindow light box={{ ...WIN, y: WIN.y + (1 - enter) * 60 }} bar={90} title={c.fileName}
        style={{ opacity: enter }}>
        {c.lines.map((line, i) => {
          const heading = line.startsWith('#');
          const dim = i !== c.target ? mix(1, 0.32, push) : 1;
          const style = { ...textBase(heading ? 64 : LINE, heading ? 900 : 500), position: 'absolute' as const, left: TEXT_X, top: TEXT_Y + i * LH, color: heading ? S.ink : '#3a3a40', opacity: dim };
          if (i !== c.target) return <div key={i} style={style}>{line}</div>;
          return <div key={i} style={{ ...style, display: 'flex', alignItems: 'center' }}>
            <span>{before}</span>
            <span style={{ position: 'relative', display: 'inline-block', width: oldW * (1 - collapse), overflow: 'hidden', color: mix(0, 1, strike) > 0.5 ? '#9a9aa2' : '#3a3a40' }}>
              <span style={{ whiteSpace: 'nowrap' }}>{c.oldText}</span>
              <span style={{ position: 'absolute', left: 0, top: '54%', height: 7, width: oldW * strike, background: S.ink, borderRadius: 4 }} />
            </span>
            <span style={{ ...textBase(LINE, 900), color: S.accent, marginLeft: collapse > 0 ? 6 : 0 }}>
              {typed(c.newText, t, typeStart, typeEnd)}
            </span>
          </div>;
        })}
      </MacWindow>
      <Pill box={{ x: lineEnd + 40, y: lineY - 48 + (1 - badge) * 20, w: 230, h: 96 }} style={{ opacity: badge, transform: `scale(${mix(0.8, 1, badge)})` }}>
        <span style={{ ...textBase(50, 400, S.display), color: '#fff' }}>{c.badge}</span>
      </Pill>
    </div>
    <Sfx name="slide" at={1.45} />
    <Sfx name="typing" at={typeStart} duration={Math.round((typeEnd - typeStart) * 60) + 6} volume={0.4} />
    <Sfx name="pop" at={4.1} />
  </Frame>;
}
