// T09m-Keycap：快捷键（快过渡 3s）
// 观众要看懂的变化：几颗键帽 → 依次按下（按住不放），组合完成后落出一个动作名
// 关系：同一排白色立体键帽。每按下一颗：帽面下沉、阴影收紧、帽面翻成黑色（表示“按住”）；
// 最后一颗按下后，整排让到左边，动作名黑胶囊从上方落到右侧，落定那一下键帽一起松开回白。
// 键面 ⌘ ⇧ ⌥ ⌃ 用矢量画（云端字体不一定有这些符号），其他按文字。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, abs, center, textBase, useT } from '../kit/ui';

export type KeycapKey = {
  label: string;   // 键面主符号/字符
  sub?: string;    // 键面下方小字（如 command、shift），可省
};

export type KeycapProps = HandoffProps & {
  keys: KeycapKey[];     // 2–4 颗
  action: string;        // 组合落成的动作名
  highlight?: string;    // action 里染紫的词（深底 #D6BEFF），留空不强调
  cues?: number[];       // [i]=第 i 颗按下；[keys.length]=动作名落下。不传用默认节奏
};

// 默认内容：macOS 截屏与录屏工具栏 ⌘ ⇧ 5
export const keycapDefaults: KeycapProps = {
  keys: [{ label: '⌘', sub: 'command' }, { label: '⇧', sub: 'shift' }, { label: '5' }],
  action: '截屏与录屏',
  highlight: '',
};

const ICONS: Record<string, string[]> = {
  '⌘': ['M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3'],
  '⇧': ['M9 19v-6H4.5L12 5l7.5 8H15v6H9z'],
  '⌥': ['M3 5h5.5l7 14H21', 'M14.5 5H21'],
  '⌃': ['M5.5 14.5 12 8l6.5 6.5'],
};

const ink = (v: number) => {
  // 白 → 黑面 #19191c（同一进度插值，避免跳色）
  const ch = (a: number, b: number) => Math.round(mix(a, b, v));
  return `rgb(${ch(255, 0x19)},${ch(255, 0x19)},${ch(255, 0x1c)})`;
};

function Highlighted({ text, hl, color }: { text: string; hl?: string; color: string }) {
  const i = hl ? text.indexOf(hl) : -1;
  if (!hl || i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<span style={{ color }}>{hl}</span>{text.slice(i + hl.length)}</>;
}

export function Keycap(props: Partial<KeycapProps>) {
  const c = { ...keycapDefaults, ...props };
  const t = useT();
  const keys = (c.keys.length ? c.keys : keycapDefaults.keys).slice(0, 4);
  const n = keys.length;

  // —— 终态版式（先按 1 倍算，再整体缩到放得下）——
  const H0 = 214;
  const keyW0 = (k: KeycapKey) => {
    const hasSub = !!k.sub;
    const glyph = ICONS[k.label] ? H0 * 0.42 : textWidth(k.label, H0 * 0.42);
    const sub = hasSub ? textWidth(k.sub!, H0 * 0.15) : 0;
    return Math.max(H0, glyph + 110, sub + 90, hasSub ? H0 * 1.24 : 0);
  };
  const PLUS0 = 92;
  const keysW0 = keys.reduce((s, k) => s + keyW0(k), 0) + PLUS0 * (n - 1);
  const pillTextSize0 = 112;
  const pillW0 = textWidth(c.action, pillTextSize0) + 170;
  const GAP0 = 96;
  const total0 = keysW0 + GAP0 + pillW0;
  // 一排放得下（缩放不小于 0.8）就左右排；否则改成上下排：键帽一排在上，动作名胶囊落在下面，各自按宽度定大小
  const stacked = 1580 / total0 < 0.8;
  const sc = stacked ? Math.min(1, 1600 / keysW0) : Math.min(1, 1580 / total0);
  const pillSize = stacked ? Math.min(112, 1400 / Math.max(1, textWidth(c.action, 1))) : pillTextSize0 * sc;
  const H = H0 * sc, PLUS = PLUS0 * sc, GAP = GAP0 * sc;
  const pillW = stacked ? textWidth(c.action, pillSize) + 170 * (pillSize / pillTextSize0) : pillW0 * sc;
  const keysW = keysW0 * sc;
  const DEPTH = 17 * sc;
  const GAPV = 64;
  const pillHs = stacked ? Math.max(150, pillSize * 1.9) : H;
    const cy = 540;

  // —— 时间 ——
  const pressAt = keys.map((_, i) => cueAt(c.cues, i, 0.58 + i * 0.36 + (i === 2 ? 0.02 : 0)));
  const lastPress = pressAt[n - 1];
  const actAt = cueAt(c.cues, n, lastPress + 0.34);
  const shift = q(t, actAt - 0.16, actAt + 0.22);          // 整排先让位，胶囊再落进空出来的位置
  const drop = springAt(t, actAt + 0.16, 0.7);             // 胶囊落下（一次轻回弹）
  const dropIn = clamp((t - actAt - 0.16) / 0.06);
  const releaseAt = actAt + 0.36;                           // 胶囊落定的那一下，键帽一起松开

  const keysX0 = stacked ? 960 - keysW / 2 : mix(960 - keysW / 2, 960 - (keysW + GAP + pillW) / 2, shift);
  const keysCy = stacked ? mix(cy, cy - (pillHs + GAPV) / 2, shift) : cy;
  let cursor = keysX0;
  const boxes = keys.map((k, i) => {
    const w = keyW0(k) * sc;
    const b = { x: cursor, y: keysCy - H / 2, w, h: H };
    cursor += w + (i < n - 1 ? PLUS : 0);
    return b;
  });
  const pillX = stacked ? 960 - pillW / 2 : 960 - (keysW + GAP + pillW) / 2 + keysW + GAP;   // 终态位置；落下时整排已基本让开
  const pillH = pillHs;
  const pillCy = stacked ? cy - (pillHs + GAPV) / 2 + H / 2 + GAPV + pillHs / 2 + DEPTH : cy + DEPTH * 0.4;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {keys.map((k, i) => {
        const b = boxes[i];
        const appear = p(t, i * 0.06, i * 0.06 + 0.36);
        // 按下：0.07s 到底；松开：0.16s 回弹
        const down = clamp((t - pressAt[i]) / 0.07) * (1 - p(t, releaseAt + i * 0.04, releaseAt + i * 0.04 + 0.22));
        const dark = clamp((t - pressAt[i]) / 0.06) * (1 - clamp((t - releaseAt - i * 0.04) / 0.06));
        const sink = down * DEPTH * 0.82;
        const face = ink(dark);
        const glyphColor = dark > 0.5 ? '#fff' : S.ink;
        const subColor = dark > 0.5 ? '#a3a3ab' : S.muted;
        const icon = ICONS[k.label];
        const gs = H * 0.42;
        const radius = 34 * sc;
        return <div key={i} style={{ ...abs({ x: b.x, y: b.y + (1 - appear) * 46, w: b.w, h: b.h + DEPTH }), opacity: clamp(appear * 1.6) }}>
          {/* 键帽侧面（厚度）+ 落地阴影：按下时阴影收紧 */}
          <div style={{
            position: 'absolute', left: 0, top: DEPTH, width: b.w, height: b.h, borderRadius: radius, background: '#d2d2d7',
            boxShadow: `0 ${mix(22, 8, down) * sc}px ${mix(30, 12, down) * sc}px rgba(0,0,0,${mix(0.16, 0.1, down)})`,
          }} />
          {/* 帽面 */}
          <div style={{
            position: 'absolute', left: 0, top: sink, width: b.w, height: b.h, borderRadius: radius, background: face,
            boxShadow: `inset 0 ${-5 * sc}px 0 rgba(0,0,0,${0.05 * (1 - dark)})`,
          }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: k.sub ? H * 0.17 : 0, bottom: k.sub ? undefined : 0, height: k.sub ? gs : undefined, ...center }}>
              {icon
                ? <svg width={gs} height={gs} viewBox="0 0 24 24" fill="none" stroke={glyphColor} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
                  {icon.map((d, j) => <path key={j} d={d} />)}
                </svg>
                : <span style={{ ...textBase(gs, 900), lineHeight: 1, color: glyphColor }}>{k.label}</span>}
            </div>
            {k.sub && <div style={{ position: 'absolute', left: 0, right: 0, bottom: H * 0.12, textAlign: 'center', ...textBase(H * 0.15, 500), color: subColor }}>{k.sub}</div>}
          </div>
        </div>;
      })}
      {/* 键与键之间的 + */}
      {keys.slice(1).map((_, i) => {
        const b = boxes[i];
        const appear = p(t, 0.1 + i * 0.06, 0.45 + i * 0.06);
        return <div key={i} style={{ ...abs({ x: b.x + b.w, y: keysCy - H / 2 + DEPTH * 0.4, w: PLUS, h: H }), ...center, opacity: appear }}>
          <span style={{ ...textBase(H * 0.3, 500), lineHeight: 1, color: '#a3a3ab' }}>+</span>
        </div>;
      })}
      {/* 动作名胶囊：从上方落到右侧 */}
      {dropIn > 0 && <div style={{
        ...abs({ x: pillX, y: pillCy - pillH / 2 - (1 - drop) * 150, w: pillW, h: pillH }), borderRadius: pillH / 2,
        background: S.dark, boxShadow: S.capsuleShadow, ...center, opacity: dropIn,
      }}>
        <span style={{ ...textBase(pillSize, 400, S.display), lineHeight: 1, color: '#fff' }}>
          <Highlighted text={c.action} hl={c.highlight} color={S.accentDark} />
        </span>
      </div>}
    </Handoff>
    {pressAt.map((a, i) => <Sfx key={i} name="click" at={a} />)}
    <Sfx name="pop" at={actAt + 0.2} />
  </Frame>;
}
