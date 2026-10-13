// T13b-MetaphorMorph：比喻变形
// 观众要看懂的变化：一个抽象概念 → 变成一个生活里的东西
// 关系：先只有一张概念卡；它一边向右走、一边被黑面从左向右擦过，擦过的地方就变成生活物件（同一张卡变形）；
//       左边随即浮现概念卡留住原身份；两卡之间长出“就像”胶囊，最后一句写清对应关系。
//       和 T04a（两列文字逐行配对）不同：这里是画面对象本身变成另一个东西。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, textWidth, wipe } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, textBase, useT } from '../kit/ui';

export type MetaphorSymbol = 'lock' | 'cloche' | 'gpu' | 'table' | 'book' | 'key';
export type MetaphorSide = {
  name: string;            // 卡上的大字
  sub?: string;            // 一行补充（可省）
  symbol?: MetaphorSymbol; // 没有真实图片时用干净的图形符号
  image?: string;          // 有真实素材时优先用图片（public 路径）
};
export type MetaphorMorphProps = HandoffProps & {
  concept: MetaphorSide;   // 抽象概念（白卡）
  object: MetaphorSide;    // 生活里的东西（黑卡）
  link: string;            // 中间胶囊：就像
  line: string;            // 最后一句对应关系
  highlight: string;       // line 里染紫的词
  cues?: number[];         // [0]=分身变形开始；[1]=对应关系出现
};

// 113 期第 3 段：闭源，就像去餐厅吃饭——只能点菜、按份付钱，菜谱拿不到
export const metaphorMorphDefaults: MetaphorMorphProps = {
  concept: { name: '闭源模型', sub: '只能付费调官方接口', symbol: 'lock' },
  object: { name: '去餐厅吃饭', sub: '厨房在别人那里', symbol: 'cloche' },
  link: '就像',
  line: '只能点菜、按份付钱，菜谱拿不到',
  highlight: '菜谱拿不到',
};

// 干净的实心图形（240×240 视图），fg 为主色、bg 为挖空色
function Symbol({ kind, fg, bg, size }: { kind: MetaphorSymbol; fg: string; bg: string; size: number }) {
  const body = (() => {
    switch (kind) {
      case 'lock': return <>
        <path d="M74 112 V82 a46 46 0 0 1 92 0 V112" fill="none" stroke={fg} strokeWidth={26} strokeLinecap="round" />
        <rect x={40} y={104} width={160} height={118} rx={28} fill={fg} />
        <circle cx={120} cy={152} r={17} fill={bg} />
        <rect x={111} y={158} width={18} height={36} rx={9} fill={bg} />
      </>;
      case 'cloche': return <>
        <path d="M34 182 a86 86 0 0 1 172 0 Z" fill={fg} />
        <circle cx={120} cy={88} r={15} fill={fg} />
        <path d="M70 160 a52 52 0 0 1 30 -44" fill="none" stroke={bg} strokeWidth={10} strokeLinecap="round" />
        <rect x={14} y={190} width={212} height={20} rx={10} fill={fg} />
      </>;
      case 'gpu': return <>
        <rect x={8} y={70} width={206} height={100} rx={16} fill={fg} />
        <rect x={214} y={58} width={18} height={126} rx={5} fill={fg} />
        {[70, 152].map((cx) => <g key={cx}>
          <circle cx={cx} cy={120} r={38} fill={bg} />
          {[0, 72, 144, 216, 288].map((a) => <path key={a} transform={`rotate(${a} ${cx} 120)`}
            d={`M${cx} 120 C${cx + 6} 104 ${cx + 20} 92 ${cx + 30} 96 C${cx + 22} 108 ${cx + 12} 116 ${cx} 120 Z`} fill={fg} />)}
          <circle cx={cx} cy={120} r={9} fill={fg} />
        </g>)}
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <rect key={k} x={40 + k * 22} y={170} width={12} height={22} rx={3} fill={fg} />)}
      </>;
      case 'table': return <>
        <path d="M44 86 H196 L224 112 H16 Z" fill={fg} />
        <rect x={16} y={110} width={208} height={18} rx={6} fill={fg} />
        <rect x={34} y={126} width={18} height={92} rx={6} fill={fg} />
        <rect x={188} y={126} width={18} height={92} rx={6} fill={fg} />
        <rect x={72} y={126} width={14} height={62} rx={5} fill={fg} opacity={0.55} />
        <rect x={154} y={126} width={14} height={62} rx={5} fill={fg} opacity={0.55} />
      </>;
      case 'book': return <>
        <path d="M120 70 C96 54 56 50 22 58 V190 C56 182 96 186 120 202 Z" fill={fg} />
        <path d="M120 70 C144 54 184 50 218 58 V190 C184 182 144 186 120 202 Z" fill={fg} />
        <path d="M120 74 V198" stroke={bg} strokeWidth={6} />
        {[0, 1, 2].map((k) => <path key={k} d={`M44 ${92 + k * 26} C66 ${88 + k * 26} 86 ${90 + k * 26} 102 ${96 + k * 26}`} fill="none" stroke={bg} strokeWidth={7} strokeLinecap="round" />)}
      </>;
      case 'key': return <>
        <circle cx={78} cy={120} r={50} fill={fg} /><circle cx={78} cy={120} r={20} fill={bg} />
        <rect x={116} y={108} width={110} height={24} rx={8} fill={fg} />
        <rect x={180} y={128} width={18} height={34} rx={5} fill={fg} /><rect x={206} y={128} width={18} height={24} rx={5} fill={fg} />
      </>;
    }
  })();
  return <svg width={size} height={size} viewBox="0 0 240 240">{body}</svg>;
}

const CW = 500, CH = 560, TOP = 150;
const AX = 560, BX = 1360;         // 终态：概念卡 / 物件卡中心

export function MetaphorMorph(props: Partial<MetaphorMorphProps>) {
  const c = { ...metaphorMorphDefaults, ...props };
  const t = useT();

  const enter = p(t, 0, 0.5);
  const at = cueAt(c.cues, 0, 1.2);
  const lineAt = cueAt(c.cues, 1, at + 1.3);
  const split = q(t, at, at + 0.85);                                     // 两卡分开
  const travel = p(t, at, at + 0.85) * 1.03 - 0.03 * q(t, at + 0.85, at + 1.1); // 物件卡落位带一点过冲
  const sweep = wipe(t, at + 0.05, at + 0.75);                         // 黑面擦过物件卡
  const pillOpen = p(t, at + 0.45, at + 0.9) * 1.055 - 0.055 * q(t, at + 0.9, at + 1.15);
  const lineIn = p(t, lineAt, lineAt + 0.5);

  // 字号按真实文字宽度算
  const nameSize = Math.min(78, ...[c.concept.name, c.object.name].map((s) => (CW - 70) / Math.max(1, textWidth(s, 1))));
  const subSize = Math.max(30, Math.min(40, ...[c.concept.sub ?? '', c.object.sub ?? ''].filter(Boolean).map((s) => (CW - 70) / Math.max(1, textWidth(s, 1)))));
  const linkSize = Math.min(64, 200 / Math.max(1, textWidth(c.link, 1)));
  const linkW = textWidth(c.link, linkSize) + linkSize * 1.4, linkH = linkSize * 1.85;
  const lineSize = Math.min(66, 1640 / Math.max(1, textWidth(c.line, 1)));
  const lineW = textWidth(c.line, lineSize) + 40;

  const hi = c.highlight && c.line.includes(c.highlight) ? c.highlight : '';
  const [lb, la = ''] = hi ? c.line.split(hi) : [c.line, ''];

  const face = (side: MetaphorSide, dark: boolean) => {
    const fg = dark ? '#fff' : S.ink;
    return <div style={{ position: 'absolute', inset: 0, background: dark ? S.dark : '#fff', borderRadius: S.radius, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 46, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {side.image
          ? <Img src={staticFile(side.image)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18 }} />
          : <Symbol kind={side.symbol ?? 'lock'} fg={fg} bg={dark ? S.dark : '#fff'} size={250} />}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 350, textAlign: 'center', ...textBase(nameSize, 900), color: fg }}>{side.name}</div>
      {side.sub ? <div style={{ position: 'absolute', left: 0, right: 0, top: 350 + nameSize * 1.16 + 18, textAlign: 'center', ...textBase(subSize, 500), color: dark ? '#a3a3ab' : S.muted }}>{side.sub}</div> : null}
    </div>;
  };

  const ghost = p(t, at + 0.2, at + 0.7);
  const bx = mix(960, BX, travel);
  const y = TOP + (1 - enter) * 50;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 概念卡的身份留在左边：分身走开后，从原位旁边浮现（与移动卡不重叠时才完全不透明） */}
      {ghost > 0 && <div style={{ position: 'absolute', left: AX - CW / 2 + (1 - ghost) * 70, top: y, width: CW, height: CH, borderRadius: S.radius, boxShadow: S.shadow,
        opacity: ghost, transform: `scale(${mix(0.95, 1, ghost)})` }}>
        {face(c.concept, false)}
      </div>}
      {/* 同一张卡：向右走，同时被黑面从左向右擦过，变成生活物件 */}
      <div style={{ position: 'absolute', left: bx - CW / 2, top: y, width: CW, height: CH, borderRadius: S.radius, opacity: enter,
        boxShadow: sweep > 0.5 ? S.capsuleShadow : S.shadow, transform: `scale(${mix(0.96, 1, enter) + 0.03 * Math.sin(Math.PI * split)})` }}>
        {face(c.concept, false)}
        {sweep > 0 && <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${CW * (1 - sweep)}px 0 0 round ${S.radius}px)` }}>{face(c.object, true)}</div>}
      </div>
      {/* 就像 */}
      {pillOpen > 0 && <Pill box={{ x: 960 - (linkW * pillOpen) / 2, y: TOP + CH / 2 - linkH / 2, w: linkW * pillOpen, h: linkH }} style={{ zIndex: 5 }}>
        <span style={{ ...textBase(linkSize, 400, S.display), color: '#fff', opacity: clamp((pillOpen - 0.5) / 0.25) }}>{c.link}</span>
      </Pill>}
      {/* 对应关系 */}
      {lineIn > 0 && <div style={{ position: 'absolute', left: 960 - lineW / 2, width: lineW, top: TOP + CH + 64 + (1 - lineIn) * 20, textAlign: 'center',
        ...textBase(lineSize, 900), color: S.ink, opacity: clamp(lineIn * 3), clipPath: `inset(0 ${100 * (1 - lineIn)}% 0 0)` }}>
        {lb}{hi && <span style={{ color: accentOn(false) }}>{hi}</span>}{la}
      </div>}
    </Handoff>
    <Sfx name="pop" at={0.02} />
    <Sfx name="woosh" at={at} />
    <Sfx name="pop" at={at + 0.45} />
    <Sfx name="ding" at={lineAt} />
  </Frame>;
}
