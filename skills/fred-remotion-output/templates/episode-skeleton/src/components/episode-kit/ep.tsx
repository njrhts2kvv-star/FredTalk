/* ===== episode-kit / ep.tsx（本期共享件，骨架自带）=====
 * 来源：121 期 src/components/ep.tsx（119、120、121 三期逐字节相同）。
 * 沿革：起于 119 期（Github 工具推荐）：BlackPill 沿 106 期 Overlays；Shot/viewAt 沿 117 v2b-kit PageView；ToolHeader 沿 117 S12 段标题胶囊；
 *       120、121 期原样沿用，章节头（chap.tsx / g4.tsx）都基于这里的 ToolHeader 与 HEADER。
 * 导出：BlackPill、pillWidth（黑胶囊）；View、viewAt、Shot、fit（截图/视频按源像素推近取景）；HEADER、ToolHeader（左上常驻段标题胶囊）；
 *       Label、PriceCard、Check、CodeCard、sinkStyle；TOOLS、TILE、ToolTile、ToolIntro、Header（工具卡与居中放大再飞左上的段标题）；FrostFocus、FrostLayer（毛玻璃）。
 * 每期要替换：
 *   1. TOOLS（5 个工具：name、short、logo 路径、paid 被替代的付费产品、role）——119 期的 Upscayl/PDFMathTranslate/Handy/VideoLingo/DogSC，必须换成本期的；
 *      条数不是 5 时同步改 TILE 里的 5（排布宽度公式）。ToolTile/ToolIntro/Header 都按 TOOLS[i] 取数。
 *   2. 不是“工具推荐”类的期，TOOLS/TILE/ToolTile/ToolIntro/PriceCard 可整体删，保留 BlackPill、Shot、ToolHeader、FrostFocus 等通用件。
 *   用到的 public 素材：TOOLS 里的各 logo（119 期：media/logo-upscayl.png、logo-pdf2zh.png、logo-handy.png、logo-videolingo.png、icon-DogSC.png），其余都是调用时传入的路径。
 * 依赖：../../kit/theme、../../kit/ui。
 * ===== */
// 119 期共享绘制件。来源：BlackPill 沿 106 期 Overlays（T01f/T12d 胶囊过冲写法）；Shot/viewAt 沿 117 v2b-kit PageView（截图按源像素推近）；
// ToolHeader 沿 117 S12 段标题胶囊（左上常驻、换段时换字）；PriceTag 沿 T14 数字落定；BeforeAfter 沿 Upscayl 自带的滑杆对比（媒体本身的交互）。
import React, { CSSProperties } from 'react';
import { Img, OffthreadVideo, staticFile, useVideoConfig } from 'remotion';
import { S, clamp, mix, p, q, quintic, settle, textWidth } from '../../kit/theme';
import { Box, abs, textBase } from '../../kit/ui';

// ---------- 黑胶囊（中心擦开 + 4% 过冲；out 段缩小淡出） ----------
export function BlackPill({ t, cx, cy, text, keyWord, size = 64, at, out = 1e9, h, font = 'display', dark = true, style }: {
  t: number; cx: number; cy: number; text: string; keyWord?: string; size?: number; at: number; out?: number; h?: number;
  font?: 'display' | 'body'; dark?: boolean; style?: CSSProperties;
}) {
  const H = h ?? size * 1.85;
  const open = p(t, at, at + 0.42);
  const o = q(t, out, out + 0.3);
  if (open <= 0 || o >= 1) return null;
  const fam = font === 'display' ? S.display : S.body;
  const tw = textWidth(text, size) * (font === 'display' ? 1 : 1.03);
  const w = tw + H * 0.9;
  const ki = keyWord ? text.indexOf(keyWord) : -1;
  const e = clamp(open);
  const fg = dark ? '#fff' : S.ink;
  return <div style={{
    position: 'absolute', left: cx - w / 2, top: cy - H / 2, width: w, height: H, borderRadius: H / 2, background: dark ? S.dark : '#fff',
    boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
    clipPath: `inset(0 ${50 * (1 - e)}% 0 ${50 * (1 - e)}% round ${H / 2}px)`,
    transform: `scale(${(open > 1 ? open : 1) * mix(1, 0.86, o)})`, opacity: 1 - o, zIndex: 50, ...style,
  }}>
    <span style={{ ...textBase(size, font === 'display' ? 400 : 900, fam), color: fg, lineHeight: 1, opacity: clamp((open - 0.3) * 2.5) }}>
      {ki >= 0 ? <>{text.slice(0, ki)}<span style={{ color: dark ? S.accentDark : S.accent }}>{keyWord}</span>{text.slice(ki + keyWord!.length)}</> : text}
    </span>
  </div>;
}
export const pillWidth = (text: string, size: number, font: 'display' | 'body' = 'display') => textWidth(text, size) * (font === 'display' ? 1 : 1.03) + size * 1.85 * 0.9;

// ---------- 截图 / 视频按源像素取景（fx, fy = 源图中心点，s = 缩放） ----------
export type View = { fx: number; fy: number; s: number };
/** 关键帧相机：每次 0.6 秒 quintic 到位（不慢推）。 */
export function viewAt(t: number, v0: View, keys: { t: number; to: View; dur?: number }[]): View {
  let v = v0;
  for (const k of keys) {
    const e = quintic(t, k.t, k.t + (k.dur ?? 0.6));
    if (e <= 0) break;
    v = { fx: mix(v.fx, k.to.fx, e), fy: mix(v.fy, k.to.fy, e), s: mix(v.s, k.to.s, e) };
  }
  return v;
}
export function Shot({ src, w, h, box, view, radius = S.radius, shadow = S.shadow, video, videoStart = 0, children, style, bg = '#fff' }: {
  src: string; w: number; h: number; box: Box; view: View; radius?: number; shadow?: string; video?: boolean; videoStart?: number;
  children?: React.ReactNode; style?: CSSProperties; bg?: string;
}) {
  const { fps } = useVideoConfig();
  const left = box.w / 2 - view.fx * view.s, top = box.h / 2 - view.fy * view.s;
  const inner: CSSProperties = { position: 'absolute', left: 0, top: 0, width: w, height: h, maxWidth: 'none' };
  return <div style={{ ...abs(box), borderRadius: radius, overflow: 'hidden', boxShadow: shadow, background: bg, ...style }}>
    <div style={{ position: 'absolute', left, top, width: w, height: h, transform: `scale(${view.s})`, transformOrigin: '0 0' }}>
      {video ? <OffthreadVideo muted src={staticFile(src)} startFrom={Math.round(videoStart * fps)} style={inner} /> : <Img src={staticFile(src)} style={inner} />}
      {children}
    </div>
  </div>;
}
/** 让 view 正好装下源区域 r（留 pad 像素） */
export const fit = (box: Box, r: Box, pad = 0): View => ({ fx: r.x + r.w / 2, fy: r.y + r.h / 2, s: Math.min((box.w - pad * 2) / r.w, (box.h - pad * 2) / r.h) });

// ---------- 段标题胶囊（左上常驻）：编号圆 + logo + 名字 ----------
export const HEADER = { x: 70, y: 46, h: 92 };
export function ToolHeader({ t, n, name, logo, at = 0, out = 1e9, from }: {
  t: number; n: number; name: string; logo?: string; at?: number; out?: number; from?: { x: number; y: number; s: number };
}) {
  const e = settle(t, at, 0.6);
  const o = q(t, out, out + 0.35);
  if (t < at || o >= 1) return null;
  const size = 40, H = HEADER.h, logoS = logo ? 58 : 0;
  const w = 26 + 64 + 18 + (logo ? logoS + 14 : 0) + textWidth(name, size) * 1.03 + 36;
  const fx = from ? mix(from.x, HEADER.x, clamp(e)) : HEADER.x, fy = from ? mix(from.y, HEADER.y, clamp(e)) : HEADER.y;
  const sc = from ? mix(from.s, 1, clamp(e)) : (e > 1 ? e : mix(0.7, 1, clamp(e)));
  return <div style={{ position: 'absolute', left: fx, top: fy, width: w, height: H, borderRadius: H / 2, background: S.dark, boxShadow: S.capsuleShadow,
    display: 'flex', alignItems: 'center', gap: 0, paddingLeft: 14, transform: `scale(${sc})`, transformOrigin: '0 50%', opacity: clamp(e * 3) * (1 - o), zIndex: 60 }}>
    <div style={{ width: 64, height: 64, borderRadius: 32, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...textBase(34, 900), color: S.ink }}>{n}</div>
    <div style={{ width: 18 }} />
    {logo && <Img src={staticFile(logo)} style={{ width: logoS, height: logoS, objectFit: 'contain', marginRight: 14, borderRadius: 14 }} />}
    <span style={{ ...textBase(size, 900), color: '#fff' }}>{name}</span>
  </div>;
}

// ---------- 白卡片标签（贴在媒体旁边的小说明） ----------
export function Label({ t, at, x, y, text, size = 40, dark = false, out = 1e9, anchor = 'left' }: {
  t: number; at: number; x: number; y: number; text: string; size?: number; dark?: boolean; out?: number; anchor?: 'left' | 'center' | 'right';
}) {
  const e = p(t, at, at + 0.35), o = q(t, out, out + 0.3);
  if (e <= 0 || o >= 1) return null;
  const H = size * 1.9, w = textWidth(text, size) * 1.03 + H * 0.8;
  const left = anchor === 'left' ? x : anchor === 'center' ? x - w / 2 : x - w;
  return <div style={{ position: 'absolute', left, top: y, width: w, height: H, borderRadius: H / 2, background: dark ? S.dark : '#fff', boxShadow: S.capsuleShadow,
    display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: e * (1 - o), transform: `translateY(${(1 - e) * 16}px) scale(${mix(0.9, 1, e)})`, zIndex: 55 }}>
    <span style={{ ...textBase(size, 900), color: dark ? '#fff' : S.ink }}>{text}</span>
  </div>;
}

// ---------- 价格牌（数字落定） ----------
export function PriceCard({ t, box, logo, name, price, unit, at, free = false, strike = 1e9, dim = 0 }: {
  t: number; box: Box; logo?: string; name: string; price: string; unit?: string; at: number; free?: boolean; strike?: number; dim?: number;
}) {
  const e = settle(t, at, 0.6);
  if (t < at) return null;
  const sk = p(t, strike, strike + 0.35);
  const dark = !free;
  return <div style={{ ...abs(box), borderRadius: 36, background: dark ? '#fff' : S.dark, boxShadow: S.shadow, overflow: 'hidden',
    opacity: clamp(e * 3) * mix(1, 0.45, dim), transform: `translateY(${(1 - clamp(e)) * 60}px) scale(${e > 1 ? e : 1})`, filter: dim > 0.01 ? `grayscale(${dim})` : undefined,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      {logo && <Img src={staticFile(logo)} style={{ width: 92, height: 92, objectFit: 'contain', borderRadius: 20 }} />}
      <span style={{ ...textBase(60, 900), color: dark ? S.ink : '#fff' }}>{name}</span>
    </div>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span style={{ ...textBase(free ? 120 : 112, 900), color: free ? S.accentDark : S.ink, lineHeight: 1 }}>{price}</span>
      {unit && <span style={{ ...textBase(44, 600), color: dark ? S.muted : '#c9c9cf' }}>{unit}</span>}
      {sk > 0 && <div style={{ position: 'absolute', left: -14, top: '52%', height: 10, borderRadius: 5, width: `calc(${sk * 100}% + 28px)`, background: S.accent }} />}
    </div>
  </div>;
}

// ---------- 打勾圆 ----------
export function Check({ x, y, r, t, at, dark = false }: { x: number; y: number; r: number; t: number; at: number; dark?: boolean }) {
  if (t < at) return null;
  const c = settle(t, at, 0.5), stroke = p(t, at + 0.06, at + 0.3);
  return <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: dark ? S.dark : '#fff', transform: `scale(${mix(0.3, 1, c)})`, boxShadow: '0 6px 14px #0003' }}>
    <svg width={r * 2} height={r * 2} viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0 }}>
      <path d="M6.4 12.4 L10.3 16.1 L17.8 8.3" stroke={dark ? '#fff' : S.ink} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="18" strokeDashoffset={18 * (1 - stroke)} />
    </svg>
  </div>;
}

// ---------- 代码块（README 原文） ----------
export function CodeCard({ box, lines, t, at, perLine = 0.18, title, style }: { box: Box; lines: string[]; t: number; at: number; perLine?: number; title?: string; style?: CSSProperties }) {
  return <div style={{ ...abs(box), borderRadius: 26, background: '#f6f8fa', boxShadow: S.shadow, overflow: 'hidden', ...style }}>
    {title && <div style={{ height: 70, borderBottom: '2px solid #e4e7eb', display: 'flex', alignItems: 'center', paddingLeft: 34, ...textBase(30, 600), color: S.muted }}>{title}</div>}
    <div style={{ padding: '26px 34px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {lines.map((l, i) => { const e = p(t, at + i * perLine, at + i * perLine + 0.25); return <div key={i} style={{ ...textBase(34, 600, S.mono), color: l.startsWith('#') ? '#8b949e' : '#24292f', opacity: e, transform: `translateX(${(1 - e) * 20}px)` }}>{l}</div>; })}
    </div>
  </div>;
}

/** 整组沉出画面（交接用，不做半透明溶解） */
export const sinkStyle = (k: number, origin = '960px 600px'): CSSProperties => ({ position: 'absolute', inset: 0, transform: `translateY(${k * k * 900}px) scale(${mix(1, 0.94, k)})`, transformOrigin: origin });

// ---------- 五个工具（S02 建立，S11 呼应） ----------
export const TOOLS = [
  { n: 1, name: 'Upscayl', logo: 'media/logo-upscayl.png', paid: '画质修复会员', role: '修图' },
  { n: 2, name: 'PDFMathTranslate', short: 'PDFMath\nTranslate', logo: 'media/logo-pdf2zh.png', paid: '论文翻译会员', role: '翻论文' },
  { n: 3, name: 'Handy', logo: 'media/logo-handy.png', paid: 'Typeless', role: '语音输入' },
  { n: 4, name: 'VideoLingo', logo: 'media/logo-videolingo.png', paid: '字幕翻译服务', role: '翻视频' },
  { n: 5, name: 'DogSC', logo: 'media/icon-DogSC.png', paid: 'Screen Studio', role: '录屏' },
] as const;
export const TILE = (i: number, y = 250, w = 300, gap = 44): Box => ({ x: 960 - (5 * w + 4 * gap) / 2 + i * (w + gap), y, w, h: 330 });
/** 工具卡：logo + 名字（白卡） */
export function ToolTile({ box, i, style, dim = 0, lift = 0 }: { box: Box; i: number; style?: CSSProperties; dim?: number; lift?: number }) {
  const tl = TOOLS[i];
  const k = box.w / 300;
  const nm = tl.name.length > 10 ? 30 : 40;
  return <div style={{ ...abs(box), borderRadius: 32 * k, background: '#fff', boxShadow: lift > 0 ? `0 ${24 * lift}px ${40 * lift}px rgba(0,0,0,${0.12 + 0.12 * lift})` : S.shadow,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 * k, opacity: mix(1, 0.4, dim), filter: dim > 0.01 ? `grayscale(${dim})` : undefined,
    transform: `translateY(${-lift * 26}px)`, ...style }}>
    <Img src={staticFile(tl.logo)} style={{ width: 150 * k, height: 150 * k, objectFit: 'contain', borderRadius: 34 * k }} />
    <span style={{ ...textBase(nm * k, 900), color: S.ink }}>{tl.name}</span>
  </div>;
}

// ---------- 段标题：先在画面中央放大出现（编号 + logo + 名字），说完名字飞到左上变成常驻标题 ----------
const headerW = (name: string, logo: boolean) => 14 + 64 + 18 + (logo ? 58 + 14 : 0) + textWidth(name, 40) * 1.03 + 36;
/** at：出现；fly：开始飞向左上；k：中央时的放大倍数；from：出现时从哪个框长出来（不传则回弹出现） */
export function ToolIntro({ t, i, at, fly, k = 2.3, cy = 470, out = 1e9 }: { t: number; i: number; at: number; fly: number; k?: number; cy?: number; out?: number }) {
  const tl = TOOLS[i];
  const w = headerW(tl.name, true), H = HEADER.h;
  const e = settle(t, at, 0.6);
  const f = quintic(t, fly, fly + 0.55);
  const o = q(t, out, out + 0.35);
  if (t < at || o >= 1) return null;
  const s = mix(k * (e > 1 ? e : mix(0.6, 1, clamp(e))), 1, f);
  const dx = mix(960 - HEADER.x - (w * k) / 2, 0, f), dy = mix(cy - HEADER.y - (H * k) / 2, 0, f);
  return <div style={{ position: 'absolute', left: HEADER.x, top: HEADER.y, width: w, height: H, borderRadius: H / 2, background: S.dark, boxShadow: S.capsuleShadow,
    display: 'flex', alignItems: 'center', paddingLeft: 14, transformOrigin: '0 0', transform: `translate(${dx + o * -700}px, ${dy}px) scale(${s})`, opacity: clamp(e * 3) * (1 - o), zIndex: 60 }}>
    <div style={{ width: 64, height: 64, borderRadius: 32, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...textBase(34, 900), color: S.ink }}>{tl.n}</div>
    <div style={{ width: 18 }} />
    <Img src={staticFile(tl.logo)} style={{ width: 58, height: 58, objectFit: 'contain', marginRight: 14, borderRadius: 14 }} />
    <span style={{ ...textBase(40, 900), color: '#fff' }}>{tl.name}</span>
  </div>;
}
/** 常驻标题（段中途接续用，直接在左上） */
export const Header = ({ t, i, out = 1e9 }: { t: number; i: number; out?: number }) => <ToolIntro t={t} i={i} at={-5} fly={-5} out={out} />;

// ---------- 黑白毛玻璃聚焦（Fred 10-14：“之前喜欢的黑白毛玻璃、半透明、磨砂，配合居中去突出重点”）----------
/** 整屏压一层半透明黑 + 背景模糊，结论胶囊（白底黑字）居中；at 起 0.35s 进，out 起 0.3s 退。放在场景最上层。 */
export function FrostFocus({ t, at, out = 1e9, text, keyWord, size = 84, cy = 470, sub }: {
  t: number; at: number; out?: number; text: string; keyWord?: string; size?: number; cy?: number; sub?: string;
}) {
  const g = p(t, at, at + 0.35) * (1 - q(t, out, out + 0.3));
  if (g <= 0) return null;
  return <>
    <div style={{ position: 'absolute', inset: 0, background: `rgba(14,14,16,${0.42 * g})`, backdropFilter: `blur(${16 * g}px) saturate(${mix(1, 0.6, g)})`, WebkitBackdropFilter: `blur(${16 * g}px)`, zIndex: 80 }} />
    <BlackPill t={t} cx={960} cy={cy} text={text} keyWord={keyWord} size={size} at={at + 0.08} out={out} dark={false} style={{ zIndex: 85 }} />
    {sub && <div style={{ position: 'absolute', left: 0, right: 0, top: cy + size * 1.2, textAlign: 'center', zIndex: 85, opacity: p(t, at + 0.3, at + 0.6) * (1 - q(t, out, out + 0.3)) }}>
      <span style={{ ...textBase(Math.round(size * 0.45), 600), color: 'rgba(255,255,255,0.86)' }}>{sub}</span>
    </div>}
  </>;
}

/** 毛玻璃底层（Fred 10-14 第二轮：蒙版上可以放完整组件，不只一句话；有的黑半透明、有的白半透明，避免全片同一个样子）。
 * tone='dark'：约 42% 黑 + 模糊；tone='light'：约 55% 白 + 模糊（上面放黑卡/黑胶囊）。组件写在 children 里，自己管入场；层级 80 以上。 */
export function FrostLayer({ t, at, out = 1e9, tone = 'dark', children }: { t: number; at: number; out?: number; tone?: 'dark' | 'light'; children?: React.ReactNode }) {
  const g = p(t, at, at + 0.35) * (1 - q(t, out, out + 0.3));
  if (g <= 0) return null;
  const bg = tone === 'dark' ? `rgba(14,14,16,${0.42 * g})` : `rgba(250,250,252,${0.58 * g})`;
  return <>
    <div style={{ position: 'absolute', inset: 0, background: bg, backdropFilter: `blur(${16 * g}px)`, WebkitBackdropFilter: `blur(${16 * g}px)`, zIndex: 80 }} />
    <div style={{ position: 'absolute', inset: 0, zIndex: 85, opacity: clamp(g * 1.4) }}>{children}</div>
  </>;
}
