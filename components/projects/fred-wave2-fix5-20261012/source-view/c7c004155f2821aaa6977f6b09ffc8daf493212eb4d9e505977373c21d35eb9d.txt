// T18b-ToolChain：多工具组合成一条工作流
// 观众要看懂的变化：几个工具 Logo → 排成一条工作流
// 关系：先是一堆散着的工具 Logo；它们按先后顺序依次归位排成一行（顺序本身就是流程）；
// 然后一个黑胶囊“活儿”从左边进入，依次穿过每个工具，每穿过一个就换成这个工具的产出，
// 最后落在右端成为结果。不画箭头：先后出现 + 对象移动表达上下游。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type ChainTool = {
  logo: string;     // 真实 Logo（必须是抠干净的透明 PNG，无底）
  name: string;     // 工具名
  output: string;   // 经过它之后，这份活儿变成什么
};

export type ToolChainProps = HandoffProps & {
  tools: ChainTool[];  // 2–4 个，按流程先后
  input: string;       // 一开始的那份活儿
  cues?: number[];     // [0]=开始归位，[1+i]=活儿穿过第 i 个工具
};

export const toolChainDefaults: ToolChainProps = {
  tools: [
    { logo: 'media/w9-logo-chatgpt.png', name: 'ChatGPT', output: '资料' },
    { logo: 'media/w9-logo-codex-hd.png', name: 'Codex', output: '代码' },
    { logo: 'media/w9-logo-doubao.png', name: '豆包工作', output: '整套PPT' },
  ],
  input: '想法',
};

const ROW_Y = 420;          // 卡片中线
const MARGIN = 80;

// 散开时的初始位置（固定种子，确定渲染）
const SCATTER = [
  { x: 760, y: 430, r: -10, s: 0.92 }, { x: 1110, y: 560, r: 8, s: 1.0 }, { x: 900, y: 650, r: -4, s: 0.86 },
  { x: 1230, y: 380, r: 12, s: 0.9 }, { x: 640, y: 610, r: 6, s: 0.88 },
];

export function ToolChain(props: Partial<ToolChainProps>) {
  const c = { ...toolChainDefaults, ...props };
  const t = useT();
  const tools = c.tools.slice(0, 4);
  const n = tools.length;

  // —— 版面：n 张卡 + (n+1) 个间隔（两端间隔放起点和结果） ——
  const total = 1920 - MARGIN * 2;
  const card = Math.min(290, (total - (n + 1) * 220) / n);
  const gap = (total - n * card) / (n + 1);
  const cardX = (i: number) => MARGIN + gap * (i + 1) + card * i;          // 卡片左边
  const gapCx = (i: number) => MARGIN + gap * i + card * i + gap / 2;     // 第 i 个间隔中心
  const words = [c.input, ...tools.map((x) => x.output)];
  let tokenSize = 54;
  const maxTokW = gap - 14;
  while (tokenSize > 30 && Math.max(...words.map((w) => textWidth(w, tokenSize) + tokenSize * 1.3)) > maxTokW) tokenSize -= 2;
  let nameSize = 56;
  while (nameSize > 34 && Math.max(...tools.map((x) => textWidth(x.name, nameSize))) > card + gap - 30) nameSize -= 2;

  // —— 时间线 ——
  const arrangeAt = cueAt(c.cues, 0, 0.5);
  const landAt = (i: number) => arrangeAt + i * 0.16;
  const tokenIn = arrangeAt + (n - 1) * 0.16 + 0.75;
  const passStep = n <= 3 ? 0.64 : 0.54;
  const passAt = tools.map((_, i) => cueAt(c.cues, 1 + i, tokenIn + 0.3 + i * passStep));
  const PASS = 0.5;
  const finalAt = passAt[n - 1] + PASS;

  // 活儿（token）的位置与文字
  let tokenX = gapCx(0), word = c.input;
  tools.forEach((_, i) => {
    const v = q(t, passAt[i], passAt[i] + PASS);
    if (v > 0) {
      tokenX = mix(gapCx(i), gapCx(i + 1), v);
      if (v >= 0.5) word = words[i + 1];
    }
  });
  // 结果落定：最后一份产出从链尾移到链下方正中，放大成结论胶囊
  const settle = q(t, finalAt + 0.05, finalAt + 0.66);
  const settleY = q(t, finalAt + 0.05, finalAt + 0.4), settleX = q(t, finalAt + 0.28, finalAt + 0.66);
  let finalSize = 96;
  while (finalSize > 56 && textWidth(words[n], finalSize) > 1100) finalSize -= 2;
  const fs = mix(tokenSize, finalSize, settle);
  const tokW = textWidth(word, fs) + fs * 1.3, tokH = fs * 1.9;
  const tokCx = mix(tokenX, 960, settleX);
  const tokCy = mix(ROW_Y, ROW_Y + card / 2 + 34 + 56 * 1.16 + 80 + finalSize * 0.95, settleY);
  const tokenAppear = springAt(t, tokenIn, 0.6);
  const landPop = springAt(t, finalAt + 0.45, 0.6);
  const tokScale = mix(0.4, 1, clamp(tokenAppear)) * (settle > 0.8 ? mix(0.94, 1, landPop) : 1);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 活儿：在卡片下层移动，穿过时被卡片挡住 */}
      {t >= tokenIn && <div style={{
        position: 'absolute', left: tokCx - tokW / 2, top: tokCy - tokH / 2, width: tokW, height: tokH, borderRadius: tokH / 2,
        background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${tokScale})`, opacity: clamp((t - tokenIn) / 0.1), zIndex: settle > 0.05 ? 20 : 1,
      }}>
        <span style={{ ...textBase(fs, 900), lineHeight: 1, color: settle > 0.3 ? S.accentDark : '#fff' }}>{word}</span>
      </div>}

      {tools.map((tool, i) => {
        const s = SCATTER[i % SCATTER.length];
        const pop = springAt(t, 0.03 + i * 0.07, 0.6);
        const appear = clamp((t - 0.03 - i * 0.07) / 0.12);
        const m = q(t, landAt(i), landAt(i) + 0.6);
        const x = mix(s.x - card / 2, cardX(i), m), y = mix(s.y - card / 2, ROW_Y - card / 2, m);
        const rot = mix(s.r, 0, m), sc = mix(s.s, 1, m) * mix(0.4, 1, clamp(pop));
        // 活儿穿过时，这张卡“接住”一下
        const busy = passAt[i] ? Math.sin(clamp((t - passAt[i] - 0.1) / 0.32) * Math.PI) : 0;
        const nameIn = p(t, landAt(i) + 0.45, landAt(i) + 0.8);
        const active = t >= passAt[i] + 0.1 && t < passAt[i] + PASS + 0.2;
        return <React.Fragment key={i}>
          <div style={{
            position: 'absolute', left: x, top: y, width: card, height: card,
            opacity: appear, transform: `rotate(${rot}deg) scale(${sc * (1 + 0.06 * busy)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 + (m > 0.5 ? 0 : i),
          }}>
            <Img src={staticFile(tool.logo)} style={{ width: card * 1.0, height: card * 1.0, objectFit: 'contain' }} />
          </div>
          <div style={{
            position: 'absolute', left: cardX(i) + card / 2 - 400, width: 800, top: ROW_Y + card / 2 + 34 + (1 - nameIn) * 16,
            textAlign: 'center', ...textBase(nameSize, 900), color: active ? S.accent : S.ink, opacity: nameIn,
          }}>{tool.name}</div>
        </React.Fragment>;
      })}
    </Handoff>
    <Sfx name="gather" at={arrangeAt} />
    <Sfx name="slide" at={passAt[0]} />
    <Sfx name="ding" at={finalAt + 0.45} />
  </Frame>;
}
