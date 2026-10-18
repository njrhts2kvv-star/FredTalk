/* ===== episode-kit / ckit.tsx（本期共享件，骨架自带）=====
 * 来源：121 期 src/components/ckit.tsx（119、120、121 三期逐字节相同）。
 * 沿革：起于 117 期 Codex 卡（MiniKeys 键帽、CodexBox 输入框、TokenMeter/TokenGauge、CodexShot、FileTile）；118 期把 CodexBox 改成真实 Codex 输入框比例；
 *       119 期按 Fred 10-14 给的真实截图重画（底栏 + / 加载圈 / 模型名 / 麦克风 / 黑色发送钮，不画“完全访问”）。
 * 导出：RED；MiniKeys、keysWidth、KeyDef（键帽排）；CodexLogo、CodexBox、CodexTag（Codex 输入框与标识）；CodeBlock、UserBubble；
 *       TokenMeter、TokenGauge（token 读数竖条/半圆表）；CodexShot（Codex 桌面版真实截图）；FileTile、FolderGlyph、Ep116Thumb、Ep117Thumb（文件卡与缩略图）。
 * 每期要替换/确认：
 *   1. CodexBox 底栏写死的模型名 'GPT-6 Astra'（及后面的“中”），按本期 Codex 实际显示的模型改；placeholder 默认 '随心输入'，界面文案变了也改。
 *   2. Ep116Thumb（media/ep116-frame.jpg，116 成片一帧）和 Ep117Thumb（画 117 终端）是旧期缩略图，换成本期要展示的往期封面/帧，不用就删。
 *   3. CodexShot 的 media/x4-codex-full.png 是 Codex 桌面版截图，界面改版后要换新截图。
 *   用到的 public 素材：media/x6-logo-codex.png、media/x4-codex-full.png、media/ep116-frame.jpg（来源见 README“本期共享件”一节）。
 * 依赖：../../kit/theme、../../kit/ui（从 templates/component-kit 复制到工程 src/kit）。
 * ===== */
// C 组（S14–S19）共用小件，动作来源：
//   MiniKeys ← T09m Keycap（白键帽依次按下翻黑、松开回白；本期缩小、去掉动作名胶囊）
//   CodexBox ← INT03 CodexFullWindowFlow 的浮起输入框（白色输入框 + 打字机 + 黑色发送钮按下；本期按真实 Codex 输入框画法重画，不画“完全访问”）
//   TokenMeter ← T14f Gauge 的读数逻辑改竖条（只标“少/多”，不写数字）
//   TokenGauge ← T14f Gauge 指针动作（半圆档位 + 指针过冲回落；刻度只标“少/多”，末端红区）
//   CodexShot ← 116 s04-Placeholder RecThumb（x4 真实截图，“完全访问”实心盖住）
//   FileTile ← 116 s08-FileRow 的文件卡（缩略图 + 等宽文件名）
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, mix, p, textWidth } from '../../kit/theme';
import { Box, abs, center, textBase } from '../../kit/ui';

export const RED = '#ff5a5f'; // 只用于“爆炸”红区和报错（与 116 S12 同值）

// ---------------- MiniKeys ----------------
const GLYPH: Record<string, string[]> = {
  '⌘': ['M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3'],
  '⌃': ['M5.5 14.5 12 8l6.5 6.5'],
  '⏎': ['M19 5v7a3 3 0 0 1-3 3H6', 'M10 11l-4 4 4 4'],
};
export type KeyDef = { label: string; sub?: string; w?: number };
const keyW = (k: KeyDef, h: number) => k.w ?? Math.max(h, (GLYPH[k.label] ? h * 0.4 : textWidth(k.label, h * 0.36)) + h * 0.55, k.sub ? textWidth(k.sub, h * 0.15) + h * 0.45 : 0);
export const keysWidth = (keys: KeyDef[], h: number) => keys.reduce((s, k) => s + keyW(k, h), 0) + h * 0.42 * (keys.length - 1);

/** 一排键帽，(cx, cy) 为整排中心。pressAt[i]=第 i 颗按下；releaseAt 起全部松开。appear 0..1 整排出现。 */
export function MiniKeys({ t, cx, cy, h = 120, keys, pressAt, releaseAt = 1e9, appear = 1 }: {
  t: number; cx: number; cy: number; h?: number; keys: KeyDef[]; pressAt: number[]; releaseAt?: number; appear?: number;
}) {
  const plus = h * 0.42, depth = h * 0.08, radius = h * 0.17;
  let x = cx - keysWidth(keys, h) / 2;
  const out: React.ReactNode[] = [];
  keys.forEach((k, i) => {
    const w = keyW(k, h);
    const down = clamp((t - pressAt[i]) / 0.07) * (1 - p(t, releaseAt + i * 0.04, releaseAt + i * 0.04 + 0.2));
    const dark = clamp((t - pressAt[i]) / 0.06) * (1 - clamp((t - releaseAt - i * 0.04) / 0.06));
    const ch = (a: number, b: number) => Math.round(mix(a, b, dark));
    const face = `rgb(${ch(255, 0x19)},${ch(255, 0x19)},${ch(255, 0x1c)})`;
    const gc = dark > 0.5 ? '#fff' : S.ink;
    const g = GLYPH[k.label];
    const gs = h * 0.4;
    out.push(<div key={`k${i}`} style={{ ...abs({ x, y: cy - h / 2 + (1 - appear) * 30, w, h: h + depth }), opacity: clamp(appear * 1.6) }}>
      <div style={{ position: 'absolute', left: 0, top: depth, width: w, height: h, borderRadius: radius, background: '#d2d2d7', boxShadow: `0 ${mix(16, 6, down)}px ${mix(22, 10, down)}px rgba(0,0,0,${mix(0.16, 0.1, down)})` }} />
      <div style={{ position: 'absolute', left: 0, top: down * depth * 0.82, width: w, height: h, borderRadius: radius, background: face, boxShadow: '0 0 0 1.5px rgba(0,0,0,0.06) inset' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: k.sub ? h * 0.14 : 0, height: k.sub ? gs * 1.1 : h, ...center }}>
          {g ? <svg width={gs} height={gs} viewBox="0 0 24 24" fill="none" stroke={gc} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">{g.map((d, j) => <path key={j} d={d} />)}</svg>
            : <span style={{ ...textBase(h * 0.34, 900), lineHeight: 1, color: gc }}>{k.label}</span>}
        </div>
        {k.sub && <div style={{ position: 'absolute', left: 0, right: 0, bottom: h * 0.1, textAlign: 'center', ...textBase(h * 0.15, 500), color: dark > 0.5 ? '#a3a3ab' : S.muted }}>{k.sub}</div>}
      </div>
    </div>);
    x += w;
    if (i < keys.length - 1) {
      out.push(<div key={`p${i}`} style={{ ...abs({ x, y: cy - h / 2, w: plus, h }), ...center, opacity: appear }}>
        <span style={{ ...textBase(h * 0.3, 500), lineHeight: 1, color: S.faint }}>+</span>
      </div>);
      x += plus;
    }
  });
  return <>{out}</>;
}

// ---------------- Codex 输入框 ----------------
export const CodexLogo = ({ size, style }: { size: number; style?: React.CSSProperties }) =>
  <Img src={staticFile('media/x6-logo-codex.png')} style={{ width: size, height: size, objectFit: 'contain', borderRadius: size * 0.22, ...style }} />;

/** Codex 输入框（119 v4，按 Fred 10-14 给的真实截图重画）：白底大圆角、细描边 + 很淡的投影；左上 30px 正文；
 * 底栏：+ ／ 加载圈 ／ “GPT-6 Astra 中 ⌄” ／ 麦克风 ／ 黑色圆形发送钮。真实界面左下的“完全访问”按平台安全规则不画。
 * 推荐尺寸 w 900–1000、h 132–150（真实约 7:1 的扁长条）；fs 默认 30。box.h 不够高时底栏自动贴底。 */
export function CodexBox({ box, text, t, fs = 30, caret = true, send = 0, attach, attachH = 0, placeholder = '随心输入' }: {
  box: Box; text: string; t: number; fs?: number; caret?: boolean; send?: number; attach?: React.ReactNode; attachH?: number; placeholder?: string;
}) {
  const blink = Math.floor(t * 2.4) % 2 === 0;
  const k = Math.min(1.25, Math.max(0.8, box.h / 140));       // 底栏按框高缩放
  const BTN = 48 * k, row = 22 * k;
  return <div style={{ ...abs(box), background: '#fff', borderRadius: Math.min(36 * k, box.h / 2.6), boxShadow: '0 10px 28px rgba(0,0,0,0.08), 0 0 0 1.5px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
    {attach && <div style={{ position: 'absolute', left: 26, top: 22, right: 26, height: attachH }}>{attach}</div>}
    <div style={{ position: 'absolute', left: 28 * k, right: 28 * k, top: 22 * k + (attach ? attachH + 14 : 0), ...textBase(fs, 500), whiteSpace: 'normal', lineHeight: 1.4, color: text ? S.ink : '#b9b9be' }}>
      {text || placeholder}
      {caret && <span style={{ display: 'inline-block', width: 2.5, height: fs * 1.08, marginLeft: 2, verticalAlign: 'middle', background: blink ? S.ink : 'transparent' }} />}
    </div>
    {/* 底栏 */}
    <div style={{ position: 'absolute', left: 22 * k, right: 16 * k, bottom: 14 * k, height: BTN, display: 'flex', alignItems: 'center' }}>
      <svg width={row * 1.2} height={row * 1.2} viewBox="0 0 24 24" fill="none" stroke={S.ink} strokeWidth={2} strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
      <div style={{ flex: 1 }} />
      <svg width={row} height={row} viewBox="0 0 24 24" fill="none" style={{ marginRight: 16 * k }}><circle cx="12" cy="12" r="8.5" stroke="#d4d4d8" strokeWidth="3" /><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" stroke="#8e8e93" strokeWidth="3" strokeLinecap="round" /></svg>
      <span style={{ ...textBase(20 * k, 500), color: S.ink, marginRight: 6 * k }}>GPT-6 Astra</span>
      <span style={{ ...textBase(20 * k, 500), color: '#9a9aa0', marginRight: 8 * k }}>中</span>
      <svg width={row * 0.6} height={row * 0.6} viewBox="0 0 24 24" fill="none" stroke="#9a9aa0" strokeWidth={2.4} strokeLinecap="round" style={{ marginRight: 22 * k }}><path d="M6 9l6 6 6-6" /></svg>
      <svg width={row} height={row} viewBox="0 0 24 24" fill="none" stroke={S.ink} strokeWidth={2} strokeLinecap="round" style={{ marginRight: 18 * k }}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg>
      <div style={{ width: BTN, height: BTN, borderRadius: BTN / 2, background: text ? '#000' : '#000', ...center, transform: `scale(${1 - 0.14 * send})` }}>
        <svg width={BTN * 0.5} height={BTN * 0.5} viewBox="0 0 32 32" fill="none"><path d="M16 26V7M7 15.5L16 6.5L25 15.5" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  </div>;
}

/** 输入框外的 Codex 标识（logo + “Codex”） */
export const CodexTag = ({ x, y, size = 52 }: { x: number; y: number; size?: number }) =>
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: size * 0.3 }}>
    <CodexLogo size={size} /><span style={{ ...textBase(size * 0.72, 900), color: S.ink }}>Codex</span>
  </div>;

/** 代码块（Codex 回复里的命令）+ 右侧复制钮；copied 0..1 时钮变勾“已复制” */
export function CodeBlock({ box, code, fs = 32, copied = 0, lift = 0 }: { box: Box; code: string; fs?: number; copied?: number; lift?: number }) {
  return <div style={{ ...abs(box), borderRadius: 18, background: '#f3f3f5', boxShadow: `0 ${14 * lift}px ${26 * lift}px rgba(0,0,0,${0.18 * lift})`, transform: `scale(${1 + 0.025 * lift})` }}>
    <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, display: 'flex', alignItems: 'center', ...textBase(fs, 600, S.mono), color: S.ink }}>{code}</div>
    <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', height: 54, padding: '0 16px', borderRadius: 14, background: copied > 0.5 ? S.dark : '#fff', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
      {copied > 0.5
        ? <><svg width={28} height={28} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span style={{ ...textBase(26, 900), color: '#fff' }}>已复制</span></>
        : <><svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={S.ink} strokeWidth={2}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></svg><span style={{ ...textBase(26, 500), color: S.ink }}>复制</span></>}
    </div>
  </div>;
}

/** 用户消息黑气泡（真实 Codex 样式：黑底白字、全圆角） */
export const UserBubble = ({ box, text, fs = 30, style }: { box: Box; text: string; fs?: number; style?: React.CSSProperties }) =>
  <div style={{ ...abs(box), borderRadius: Math.min(box.h / 2, 40), background: '#000', color: '#fff', ...center, padding: '0 34px', ...textBase(fs, 500), whiteSpace: 'normal', lineHeight: 1.35, ...style }}>{text}</div>;

// ---------------- Token 计量 ----------------
/** 竖向计量条：value 0..1；只标“少/多” */
export function TokenMeter({ box, value, pulse = 0 }: { box: Box; value: number; pulse?: number }) {
  const v = clamp(value, 0, 1.05);
  return <div style={{ ...abs(box) }}>
    <div style={{ position: 'absolute', left: -20, right: -20, top: -58, textAlign: 'center', ...textBase(30, 600, S.mono), color: S.ink }}>Token</div>
    <div style={{ position: 'absolute', inset: 0, borderRadius: box.w / 2, background: '#ececf0', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${v * 100}%`, background: S.ink, borderRadius: box.w / 2, transform: `scaleX(${1 + 0.12 * pulse})` }} />
    </div>
    <div style={{ position: 'absolute', right: box.w + 14, top: 0, ...textBase(30, 900), color: S.muted }}>多</div>
    <div style={{ position: 'absolute', right: box.w + 14, bottom: 0, ...textBase(30, 900), color: S.muted }}>少</div>
  </div>;
}

/** 半圆 Token 表：指针 value 0..1；档位 少 / 多，末端红区（不写数字）。cx, cy 为表心。 */
export function TokenGauge({ cx, cy, r = 190, sw = 54, value, red = 0, shake = 0, appear = 1 }: {
  cx: number; cy: number; r?: number; sw?: number; value: number; red?: number; shake?: number; appear?: number;
}) {
  const th = (f: number) => Math.PI * (1 - f);
  const P = (f: number, rr: number) => ({ x: r + 40 + rr * Math.cos(th(f)), y: r + 40 - rr * Math.sin(th(f)) });
  const arc = (f0: number, f1: number) => { const a = P(f0, r), b = P(f1, r); return `M${a.x} ${a.y} A${r} ${r} 0 0 1 ${b.x} ${b.y}`; };
  const W = (r + 40) * 2;
  const ang = (th(clamp(value, 0, 1.04)) * 180) / Math.PI;
  const dx = Math.sin(shake * 60) * 10 * shake;
  const H = r + 40;
  return <div style={{ position: 'absolute', left: cx - W / 2 + dx, top: cy - H, width: W, height: H + 70, opacity: appear }}>
    <svg width={W} height={H + 40} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <path d={arc(0, 0.64)} fill="none" stroke="#e1e1e6" strokeWidth={sw} />
      <path d={arc(0.66, 0.82)} fill="none" stroke="#c4c4cc" strokeWidth={sw} />
      <path d={arc(0.84, 1)} fill="none" stroke={RED} strokeOpacity={0.35 + 0.65 * red} strokeWidth={sw + 10 * red} />
      <g transform={`translate(${r + 40} ${r + 40}) rotate(${-ang})`} style={{ filter: 'drop-shadow(6px 6px 6px rgba(0,0,0,0.25))' }}>
        <path d={`M${r + 4} 0 L0 -12 L-26 -7 L-26 7 L0 12 Z`} fill={S.dark} />
      </g>
      <circle cx={r + 40} cy={r + 40} r={24} fill={S.dark} /><circle cx={r + 40} cy={r + 40} r={9} fill="#fff" />
    </svg>
    <div style={{ position: 'absolute', left: 40 - 30, top: H + 4, width: 60, textAlign: 'center', ...textBase(32, 900), color: S.muted }}>少</div>
    <div style={{ position: 'absolute', left: W - 40 - 30, top: H + 4, width: 60, textAlign: 'center', ...textBase(32, 900), color: red > 0.5 ? RED : S.muted }}>多</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: H + 34, textAlign: 'center', ...textBase(30, 600, S.mono), color: S.ink }}>Token</div>
  </div>;
}

// ---------------- 真实截图 / 文件卡 ----------------
/** Codex 桌面版真实截图（x4-codex-full.png，3024×1712）铺满 box，左下“完全访问”实心盖住（沿 116 RecThumb） */
export function CodexShot({ box, radius = S.radius, style }: { box: Box; radius?: number; style?: React.CSSProperties }) {
  const W = 3024, H = 1712;
  const k = Math.max(box.w / W, box.h / H);
  const ox = (box.w - W * k) / 2, oy = (box.h - H * k) / 2;
  const m = { x: 1150, y: 1600, w: 170, h: 56 };
  return <div style={{ ...abs(box), borderRadius: radius, overflow: 'hidden', background: '#fff', ...style }}>
    <Img src={staticFile('media/x4-codex-full.png')} style={{ position: 'absolute', left: ox, top: oy, width: W * k, height: H * k, maxWidth: 'none' }} />
    <div style={{ position: 'absolute', left: ox + m.x * k, top: oy + m.y * k, width: m.w * k, height: m.h * k, background: '#fff' }} />
  </div>;
}

/** 成片文件卡：16:9 缩略图 + 等宽文件名 */
export function FileTile({ box, name, thumb, fs = 26, shadow = S.shadow, style }: { box: Box; name: string; thumb: React.ReactNode; fs?: number; shadow?: string; style?: React.CSSProperties }) {
  const tw = box.w - 40, th = tw * 9 / 16;
  return <div style={{ ...abs(box), background: '#fff', borderRadius: S.radius, boxShadow: shadow, ...style }}>
    <div style={{ position: 'absolute', left: 20, top: 20, width: tw, height: th, borderRadius: 12, overflow: 'hidden', background: S.dark }}>{thumb}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 20 + th + 14, textAlign: 'center', ...textBase(fs, 600, S.mono), color: S.ink }}>{name}</div>
  </div>;
}

/** 116 成片真实一帧当缩略图 */
export const Ep116Thumb = () => <Img src={staticFile('media/ep116-frame.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;

/** 本期成片缩略图：本期主角就是终端，画一帧白底 + 终端窗口（不编内容） */
export const Ep117Thumb = () => <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
  <div style={{ position: 'absolute', left: '14%', top: '14%', width: '72%', height: '66%', borderRadius: 10, background: S.windowBody, overflow: 'hidden', boxShadow: '-6px 3px 10px #0003' }}>
    <div style={{ height: '16%', background: S.windowBar, display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8 }}>
      {[S.accent, '#aaa', '#eee'].map((c) => <span key={c} style={{ width: 6, height: 6, borderRadius: 3, background: c }} />)}
    </div>
    {[0.62, 0.45, 0.7, 0.3].map((w, i) => <div key={i} style={{ marginLeft: '8%', marginTop: 7, width: `${w * 80}%`, height: 6, borderRadius: 3, background: i === 3 ? '#7ee2a8' : '#c9c9cf', opacity: 0.8 }} />)}
  </div>
</div>;

/** 简单 Finder 窗口里的文件夹/文件图标用的“文件夹”形 */
export const FolderGlyph = ({ size, color = S.faint }: { size: number; color?: string }) =>
  <svg width={size} height={size * 0.8} viewBox="0 0 40 32"><path d="M2 6a3 3 0 0 1 3-3h10l4 4h16a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill={color} /></svg>;
