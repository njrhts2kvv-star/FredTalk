/* ===== episode-kit / g4.tsx（本期共享件，骨架自带）=====
 * 来源：121 期 src/components/g4.tsx（起于 120 期 Gemini 4，121 期被 chap.tsx 引用 ClipWindow/MarkIcon/Mark）。
 * 沿革：120 期新建（章节头、结论胶囊、模型小卡、大播放窗口）；121 期沿用，另建 chap.tsx 放自己的章节与翻页件。
 * 导出：ToolHeader（转出）；CHAPTERS、Mark、VERDICTS、MARK_COLOR、ChapterHeader、MarkIcon、VerdictChip（章节结论）；
 *       MODELS、ModelKey、ModelChip、modelChipWidth（模型 logo+名字小卡）；BIG、ClipWindow（大播放窗口）；SourceTag（“来源：…”小字）；INSERT_LAST_CARD、SEAM_NOTE。
 * 每期要替换：
 *   1. CHAPTERS（120 期：前端/游戏/照图复刻/长任务/写作）——换成本期章名；
 *   2. VERDICTS（每章结论 mark + text，与口播结论一致，数量与 CHAPTERS 一致）——120 期内容，必须重写；
 *   3. MODELS（120 期的 Gemini 4 Argon / Claude Opus 5.5 / Sonnet 5.5 / Claude Code / GPT-6 Astra / 豆包 的名字、short、logo）——按本期出场模型改；
 *   4. INSERT_LAST_CARD 是 116 起固定插入段末帧的白底大黑卡框，插入段不变则不改。
 *   用到的 public 素材：MODELS 里的 logo：media/logo-gemini.png、media/claude-mark.png、media/claude-app-icon.png、media/x6-logo-chatgpt.png、media/x6-logo-doubao.png；
 *       media/insert-last.png（只在注释里，INSERT_LAST_CARD 对应的末帧图，场景自己引用）。
 * 依赖：../../kit/theme、../../kit/ui、./ep（ToolHeader）。注意：chap.tsx 也导出 CHAPTERS/ChapterHeader，同一场景里别两边混用。
 * ===== */
// 120 期共享件（只由主会话改；分身需要新共享件时报给主会话）。
// 来源：ChapterHeader = 119 ToolHeader（117 S12 段标题胶囊，左上常驻）；VerdictChip = 117 UseCard 打勾/叉的结论胶囊；
// ModelChip = 119 ToolTile 的 logo+名字横排小卡；ClipWindow = 108 大播放组件外壳（可指定框、按源像素取景）；SourceTag = episode-assembly 第 2 节“来源：…”小字。
import React, { CSSProperties } from 'react';
import { Img, OffthreadVideo, staticFile, useVideoConfig } from 'remotion';
import { S, clamp, mix, p, q, settle, textWidth } from '../../kit/theme';
import { Box, abs, center, textBase } from '../../kit/ui';
import { ToolHeader } from './ep';

export { ToolHeader };

// ---------- 五个章节（S01 预告、各章开头、S10 成绩单都用这一份） ----------
export const CHAPTERS = [
  { n: 1, name: '前端' },
  { n: 2, name: '游戏' },
  { n: 3, name: '照图复刻' },
  { n: 4, name: '长任务' },
  { n: 5, name: '写作' },
] as const;
export type Mark = 'good' | 'mid' | 'bad';
/** 每章结论（章末盖章，S10 成绩单逐行复现；文字与口播结论一致） */
export const VERDICTS: { mark: Mark; text: string }[] = [
  { mark: 'bad', text: '没有更强' },
  { mark: 'mid', text: '能玩，不好看' },
  { mark: 'good', text: '照着做得到' },
  { mark: 'mid', text: '能力真，会钻空子' },
  { mark: 'good', text: '进步明显' },
];
export const MARK_COLOR: Record<Mark, string> = { good: '#1f9d55', mid: '#e0a100', bad: '#ff5a5f' };

/** 章节常驻标题：左上，编号 + 章名（不带 logo）。和 119 同一外形。 */
export const ChapterHeader = ({ t, ch, at = 0, out = 1e9, from }: { t: number; ch: number; at?: number; out?: number; from?: { x: number; y: number; s: number } }) =>
  <ToolHeader t={t} n={CHAPTERS[ch - 1].n} name={CHAPTERS[ch - 1].name} at={at} out={out} from={from} />;

// ---------- 结论小图标（勾 / 半 / 叉） ----------
export function MarkIcon({ mark, r, t, at }: { mark: Mark; r: number; t: number; at: number }) {
  if (t < at) return null;
  const c = settle(t, at, 0.5), s = p(t, at + 0.06, at + 0.32);
  const col = MARK_COLOR[mark];
  const d = mark === 'good' ? ['M6.4 12.4 L10.3 16.1 L17.8 8.3'] : mark === 'bad' ? ['M7.5 7.5 L16.5 16.5', 'M16.5 7.5 L7.5 16.5'] : ['M7 12 L17 12'];
  return <div style={{ width: r * 2, height: r * 2, borderRadius: r, background: col, transform: `scale(${mix(0.3, 1, clamp(c))})`, boxShadow: '0 6px 14px #0002', flex: 'none' }}>
    <svg width={r * 2} height={r * 2} viewBox="0 0 24 24">
      {d.map((x, i) => <path key={i} d={x} stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="20" strokeDashoffset={20 * (1 - s)} />)}
    </svg>
  </div>;
}

/** 结论胶囊：图标 + “章名 · 结论”。dark=黑底白字。宽度按文字自适应，(cx, cy) 为中心。 */
export function VerdictChip({ t, at, cx, cy, ch, size = 48, dark = true, out = 1e9, showName = true, style }: {
  t: number; at: number; cx: number; cy: number; ch: number; size?: number; dark?: boolean; out?: number; showName?: boolean; style?: CSSProperties;
}) {
  const v = VERDICTS[ch - 1];
  const e = settle(t, at, 0.5), o = q(t, out, out + 0.3);
  if (t < at || o >= 1) return null;
  const name = CHAPTERS[ch - 1].name;
  const H = size * 1.9, r = size * 0.55;
  const label = showName ? `${name}  ${v.text}` : v.text;
  const w = r * 2 + 22 + textWidth(label, size) * 1.03 + H * 0.7;
  return <div style={{ position: 'absolute', left: cx - w / 2, top: cy - H / 2, width: w, height: H, borderRadius: H / 2, background: dark ? S.dark : '#fff', boxShadow: S.capsuleShadow,
    display: 'flex', alignItems: 'center', gap: 22, paddingLeft: H * 0.28, opacity: clamp(e * 3) * (1 - o), transform: `scale(${mix(0.85, 1, clamp(e)) * mix(1, 0.9, o)})`, zIndex: 70, ...style }}>
    <MarkIcon mark={v.mark} r={r} t={t} at={at + 0.12} />
    <span style={{ ...textBase(size, 900), color: dark ? '#fff' : S.ink, whiteSpace: 'nowrap' }}>
      {showName && <span style={{ color: dark ? S.accentDark : S.accent }}>{name}</span>}{showName ? '  ' : ''}{v.text}
    </span>
  </div>;
}

// ---------- 模型 ----------
export const MODELS = {
  gemini: { name: 'Gemini 4 Argon', short: 'Gemini 4', logo: 'media/logo-gemini.png' },
  opus: { name: 'Claude Opus 5.5', short: 'Claude', logo: 'media/claude-mark.png' },
  sonnet: { name: 'Claude Sonnet 5.5', short: 'Sonnet 5.5', logo: 'media/claude-mark.png' },
  claudeCode: { name: 'Claude Code', short: 'Claude Code', logo: 'media/claude-app-icon.png' },
  gpt: { name: 'GPT-6 Astra', short: 'GPT', logo: 'media/x6-logo-chatgpt.png' },
  doubao: { name: '豆包', short: '豆包', logo: 'media/x6-logo-doubao.png' },
} as const;
export type ModelKey = keyof typeof MODELS;
/** 模型小胶囊：logo + 名字（白底），(cx, cy) 中心；short=true 用短名 */
export function ModelChip({ m, cx, cy, size = 40, short = false, dark = false, style }: { m: ModelKey; cx: number; cy: number; size?: number; short?: boolean; dark?: boolean; style?: CSSProperties }) {
  const md = MODELS[m];
  const name = short ? md.short : md.name;
  const H = size * 1.9, L = size * 1.25;
  const w = L + 16 + textWidth(name, size) * 1.03 + H * 0.65;
  return <div style={{ position: 'absolute', left: cx - w / 2, top: cy - H / 2, width: w, height: H, borderRadius: H / 2, background: dark ? S.dark : '#fff', boxShadow: '0 10px 24px rgba(0,0,0,0.14)',
    display: 'flex', alignItems: 'center', gap: 16, paddingLeft: H * 0.26, zIndex: 60, ...style }}>
    <Img src={staticFile(md.logo)} style={{ width: L, height: L, objectFit: 'contain' }} />
    <span style={{ ...textBase(size, 900), color: dark ? '#fff' : S.ink, whiteSpace: 'nowrap' }}>{name}</span>
  </div>;
}
export const modelChipWidth = (m: ModelKey, size = 40, short = false) => { const H = size * 1.9; return size * 1.25 + 16 + textWidth(short ? MODELS[m].short : MODELS[m].name, size) * 1.03 + H * 0.65; };

// ---------- 第三方测评视频窗 ----------
/** 主视频窗默认几何（108 大播放组件 1080 舞台值：1800 宽，居中） */
export const BIG: Box = { x: 60, y: 33.1, w: 1800, h: 1013.8 };
/** 视频窗：圆角白底阴影；src 为 public 相对路径；from=片段内起播秒；rate=播放速度；
 *  view 可选：{fx, fy, s} 按 1920×1080 源像素取景推近（相机用 ep.tsx 的 viewAt 算）。 */
export function ClipWindow({ src, box, from = 0, rate = 1, view, radius = 24, shadow = '0 16px 25px rgba(0,0,0,0.1333)', style, children, freezeAt }: {
  src: string; box: Box; from?: number; rate?: number; view?: { fx: number; fy: number; s: number }; radius?: number; shadow?: string; style?: CSSProperties;
  children?: React.ReactNode; freezeAt?: number;
}) {
  const { fps } = useVideoConfig();
  const v = view ?? { fx: 960, fy: 540, s: Math.max(box.w / 1920, box.h / 1080) };
  const left = box.w / 2 - v.fx * v.s, top = box.h / 2 - v.fy * v.s;
  return <div style={{ ...abs(box), borderRadius: radius, overflow: 'hidden', boxShadow: shadow, background: '#111', ...style }}>
    <div style={{ position: 'absolute', left, top, width: 1920, height: 1080, transform: `scale(${v.s})`, transformOrigin: '0 0' }}>
      <OffthreadVideo muted src={staticFile(src)} startFrom={Math.round(from * fps)} playbackRate={rate} style={{ width: 1920, height: 1080 }} />
    </div>
    {children}
  </div>;
}

/** 来源小字：左下角，第三方视频/截图上屏时加（不念出来）。 */
export function SourceTag({ text, t, at = 0, out = 1e9, dark = false }: { text: string; t: number; at?: number; out?: number; dark?: boolean }) {
  const e = p(t, at, at + 0.3) * (1 - q(t, out, out + 0.25));
  if (e <= 0) return null;
  return <div style={{ position: 'absolute', left: 44, top: 1018, height: 40, ...center, paddingInline: 16, borderRadius: 20, background: dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.86)', opacity: e, zIndex: 95 }}>
    <span style={{ ...textBase(22, 600), color: dark ? '#fff' : S.muted }}>来源：{text}</span>
  </div>;
}

// ---------- 跨组交接几何 ----------
/** INSERT 末帧白底大黑卡（与 119 同一素材 media/insert-last.png） */
export const INSERT_LAST_CARD: Box = { x: 105, y: 90, w: 1703, h: 895 };
/** 组间接缝（S03→S04、S07→S08）：上一段最后 0.4s 内容沉出，只剩白底 + 左上章节标题；下一段首帧就是这个状态。 */
export const SEAM_NOTE = 'white + ChapterHeader only';
