// 共享表面与基元：沿 expansion-selected shared.tsx（109 规范）与 X019/W01 窗口规格。
import React, { CSSProperties, useLayoutEffect } from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, cancelRender, continueRender,
  delayRender, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { S, mix } from './theme';

export const useT = () => useCurrentFrame() / useVideoConfig().fps;

let fontsReady: Promise<void> | undefined;
const FACES: [string, number, string][] = [
  [S.body, 500, 'fonts/MiSans-Medium.otf'],
  [S.body, 600, 'fonts/MiSans-Semibold.otf'],
  [S.body, 900, 'fonts/MiSans-Heavy.otf'],
  [S.display, 400, 'fonts/RuiZi.ttf'],
  [S.mono, 600, 'fonts/SourceCodePro-Semibold.otf'],
  [S.kai, 400, 'fonts/LXGWWenKai-Regular.ttf'],
];
export function Fonts() {
  useLayoutEffect(() => {
    const handle = delayRender('Fred exact local font files');
    fontsReady ??= Promise.all(FACES.map(async ([family, weight, path]) => {
      const face = new FontFace(family, `url(${staticFile(path)})`, { weight: String(weight) });
      await face.load();
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(face);
    })).then(() => undefined);
    fontsReady.then(() => continueRender(handle)).catch((e) => cancelRender(e));
  }, []);
  return null;
}

// 角标：1080 逻辑舞台位置（父层 scale 后不再 ×2）。浅底深紫字 / 深底白字。
export function Brand({ dark = false }: { dark?: boolean }) {
  return <Img src={staticFile(dark ? 'brand/dark.png' : 'brand/light.png')} style={{
    position: 'absolute', left: dark ? 1554.5 : 1549.5, top: dark ? 41 : 36,
    width: dark ? 335 : 345.5, height: dark ? 75 : 85, objectFit: 'contain', zIndex: 900,
  }} />;
}

export function Frame({ children, brand = true, dark = false, background }: {
  children: React.ReactNode; brand?: boolean; dark?: boolean; background?: string;
}) {
  const { width } = useVideoConfig();
  return <AbsoluteFill style={{
    background: background ?? (dark ? S.dark : '#fff'), overflow: 'hidden', fontFamily: S.body,
    fontWeight: 500, fontSynthesis: 'none', color: dark ? '#fff' : S.ink,
  }}>
    <Fonts />
    <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      {children}{brand && <Brand dark={dark} />}
    </div>
  </AbsoluteFill>;
}

export type Box = { x: number; y: number; w: number; h: number };
export const abs = ({ x, y, w, h }: Box): CSSProperties => ({ position: 'absolute', left: x, top: y, width: w, height: h });
export const between = (a: Box, b: Box, t: number): Box => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), w: mix(a.w, b.w, t), h: mix(a.h, b.h, t) });
export const center: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center' };

export function Surface({ box, dark = false, radius = S.radius, shadow = S.shadow, style, children }: {
  box: Box; dark?: boolean; radius?: number; shadow?: string; style?: CSSProperties; children?: React.ReactNode;
}) {
  return <div style={{
    ...abs(box), background: dark ? S.dark : '#fff', color: dark ? '#fff' : S.ink, border: 'none',
    borderRadius: radius, boxShadow: shadow, overflow: 'hidden', ...style,
  }}>{children}</div>;
}

export function Pill({ box, dark = true, shadow = S.capsuleShadow, style, children }: {
  box: Box; dark?: boolean; shadow?: string; style?: CSSProperties; children?: React.ReactNode;
}) {
  return <Surface box={box} dark={dark} radius={Math.min(box.w, box.h) / 2} shadow={shadow} style={{ ...center, ...style }}>{children}</Surface>;
}

// 深色 Mac 窗口（X019：体 #212123，栏 #161618，r36，三点 #8554E8/#aaa/#eee）。light 版用于浅底界面卡。
export function MacWindow({ box, light = false, bar = 90, radius = 36, shadow, style, children, title }: {
  box: Box; light?: boolean; bar?: number; radius?: number; shadow?: string; style?: CSSProperties; children?: React.ReactNode; title?: string;
}) {
  const dot = Math.round(bar * 0.267);
  return <div style={{
    ...abs(box), borderRadius: radius, overflow: 'hidden', background: light ? '#fff' : S.windowBody,
    boxShadow: shadow ?? (light ? S.shadow : S.windowShadow), ...style,
  }}>
    <div style={{ height: bar, background: light ? '#f4f4f6' : S.windowBar, display: 'flex', alignItems: 'center', gap: dot, paddingLeft: bar * 0.63, position: 'relative' }}>
      {[S.accent, '#aaa', light ? '#ddd' : '#eee'].map((c) => <span key={c} style={{ width: dot, height: dot, borderRadius: dot, background: c }} />)}
      {title && <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: bar * 0.36, color: light ? S.muted : '#8d8d93', fontWeight: 500 }}>{title}</div>}
    </div>
    <div style={{ position: 'absolute', left: 0, top: bar, right: 0, bottom: 0 }}>{children}</div>
  </div>;
}

export function Media({ src, box, radius = S.radius, fit = 'cover', start = 0, style, objectPosition }: {
  src: string; box: Box; radius?: number; fit?: 'cover' | 'contain'; start?: number; style?: CSSProperties; objectPosition?: string;
}) {
  const { fps } = useVideoConfig();
  const image = /\.(png|jpe?g|webp)$/i.test(src);
  const inner: CSSProperties = { width: '100%', height: '100%', objectFit: fit, objectPosition, display: 'block' };
  return <div style={{ ...abs(box), borderRadius: radius, overflow: 'hidden', ...style }}>
    {image ? <Img src={staticFile(src)} style={inner} /> : <OffthreadVideo muted src={staticFile(src)} startFrom={Math.round(start * fps)} style={inner} />}
  </div>;
}

// 光标沿 expansion shared.tsx：黑填白边箭头 + 软投影
export function Cursor({ x, y, scale = 1, press = 0, style }: { x: number; y: number; scale?: number; press?: number; style?: CSSProperties }) {
  return <svg width={65 * scale} height={80 * scale} viewBox="0 0 52 64" style={{
    position: 'absolute', left: x, top: y, filter: 'drop-shadow(0 4px 5px #0003)', transform: `scale(${1 - 0.12 * press})`, transformOrigin: '10% 5%', zIndex: 800, ...style,
  }}>
    <path d="M5 3 L5 50 L17 38 L27 60 L37 55 L27 34 L44 34 Z" fill="#171719" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
  </svg>;
}

// 点击反馈：紫色扩散环（深/浅底按承载面取色）
export function ClickRing({ x, y, t, at, dark = false }: { x: number; y: number; t: number; at: number; dark?: boolean }) {
  const v = Math.max(0, Math.min(1, (t - at) / 0.45));
  if (v <= 0 || v >= 1) return null;
  const r = 18 + 52 * v;
  return <div style={{
    position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r,
    border: `${6 * (1 - v) + 1}px solid ${dark ? S.accentDark : S.accent}`, opacity: 1 - v, zIndex: 790,
  }} />;
}

export function Sfx({ name, at, volume = 0.5, duration = 60 }: { name: string; at: number; volume?: number; duration?: number }) {
  const { fps } = useVideoConfig();
  return <Sequence from={Math.round(at * fps)} durationInFrames={duration} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>;
}

export const textBase = (size: number, weight = 900, family: string = S.body): CSSProperties => ({
  fontFamily: family, fontWeight: weight, fontSize: size, lineHeight: 1.16, fontSynthesis: 'none', whiteSpace: 'nowrap',
});
