// FredTalk 109 规范表面 + 已认可锚点的精确值（出处见 qc/style-kit.md）。
import { Easing, interpolate } from 'remotion';

export const S = {
  ink: '#19191c',          // 黑面 / 正文墨色（109 / expansion shared.tsx:5）
  dark: '#19191c',
  windowBody: '#212123',   // X019 深窗体
  windowBar: '#161618',    // X019 标题栏
  muted: '#6c6c72',
  faint: '#a3a3ab',
  accent: '#8554E8',       // 浅底紫
  accentDark: '#D6BEFF',   // 深底紫
  radius: 24,
  shadow: '0 16px 25px 0 rgba(0,0,0,0.1333333333)',   // 109 默认软阴影
  capsuleShadow: '30px 22px 25px #0005',               // 复刻系黑胶囊右下投影（T03）
  windowShadow: '-25px 6px 35px #0003',                // X019 窗
  textShadowDark: '8px 9px 5px #000',                  // 深窗内白色大字
  body: 'Fred MiSans',
  display: 'Fred RuiZi',
  mono: 'Fred Source Code',
  kai: 'Fred WenKai',
} as const;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

// 主 ease-out：bezier(.22,1,.36,1)（X/N 系 p()、107 phase()）
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const p = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { easing: easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

// smoothstep（expansion q()、107 ease()、页面转场）
export const q = (t: number, a: number, b: number) => {
  const v = clamp((t - a) / (b - a));
  return v * v * (3 - 2 * v);
};

// 章节/擦出：bezier(.65,0,.2,1)（C034）
const chapterCurve = Easing.bezier(0.65, 0, 0.2, 1);
export const wipe = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { easing: chapterCurve, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

// 阻尼弹簧 1-exp(-8p)cos(9p)，默认 0.8s（shared.tsx:10）——不是 Remotion spring()
export const springAt = (t: number, delay: number, duration = 0.8) => {
  const v = clamp((t - delay) / duration);
  return v === 1 ? 1 : 1 - Math.exp(-8 * v) * Math.cos(9 * v);
};

// 相机 quintic（CAM01）：端点零速度零加速度
export const quintic = (t: number, a: number, b: number) => {
  const v = clamp((t - a) / (b - a));
  return v * v * v * (v * (6 * v - 15) + 10);
};

// 按字符逐字打出（X019：标题约 10f/字，正文 5–7f/字 @60fps）
export const typed = (s: string, t: number, a: number, b: number) => {
  const chars = Array.from(s);
  return chars.slice(0, Math.floor(clamp((t - a) / (b - a)) * chars.length)).join('');
};

// 中文按方块字估宽，拉丁/符号按 0.58（与 107 fitSize 规则一致）
export const textWidth = (s: string, size: number) =>
  Array.from(s).reduce((w, ch) => w + (/[\u0000-\u00ff]/.test(ch) ? 0.58 : 1) * size, 0);

// 2D 相机：把 focus 点推到画面中心并放大；push=0 时为原画面
export const cameraTransform = (focusX: number, focusY: number, zoom: number, push: number) => {
  const fx = mix(960, focusX, push), fy = mix(540, focusY, push), z = mix(1, zoom, push);
  return `translate(960px, 540px) scale(${z}) translate(${-fx}px, ${-fy}px)`;
};

// ---- v2（2026-10-12 Fred 同意加的接口；只新增，不改上面任何值）----

// 口播时间点：传了 cues 就用真实口播秒数，没传就用组件自带的默认节奏
export const cueAt = (cues: readonly number[] | undefined, i: number, fallback: number) =>
  cues && typeof cues[i] === 'number' && Number.isFinite(cues[i]) ? cues[i] : fallback;

// 按文字所在的承载面取色：深底（含白画布上的黑胶囊）用 #D6BEFF，浅底用 #8554E8
export const accentOn = (dark: boolean) => (dark ? S.accentDark : S.accent);
export const inkOn = (dark: boolean) => (dark ? '#fff' : S.ink);

// ---- v3（2026-10-14 Fred 119：“进来之后抖动一下”不自然）：无过冲的落定，替代场景里的 springAt 入场 ----
export const settle = (t: number, delay: number, duration = 0.8) => p(t, delay, delay + Math.max(0.3, duration * 0.6));
