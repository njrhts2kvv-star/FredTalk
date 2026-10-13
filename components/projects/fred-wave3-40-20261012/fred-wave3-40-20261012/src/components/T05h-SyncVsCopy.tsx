// T05h-SyncVsCopy：一次性拷贝 vs 持续同步
// 观众要看懂的变化：同一个源头更新 → 拷贝的那份停在旧版本，同步的那份跟着更新
// 关系（重写）：作者的项目是一块黑色版本牌（v1）。两份副本从它身后滑出，落到左右下方，各自带一根粗墨线连着源头
//   （左：Download ZIP，右：git clone）。ZIP 那根线随即从中间断开、两头缩回变淡 —— “拷完就断了”。
//   作者更新：黑牌上的 v1 翻成 v2 → 一颗 v2 小胶囊沿右边那根线流下去 → 右边副本翻成 v2（紫）；
//   左边副本仍是 v1，整张退淡。终态左右两份并排：断开 / 连着，v1 / v2，一眼看懂。
// 对象连续：副本从源头身后滑出；版本号原位翻动（不换卡）；更新沿线流动。构图左右对称、居中，关键内容 y ≤ 890。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type CopyWay = { title: string; note: string; after: string };
export type SyncVsCopyProps = HandoffProps & {
  author: string;               // 作者项目名
  authorNote: string;           // 项目名前的小字
  versions: [string, string];   // 旧版本、新版本
  zip: CopyWay;                 // 拷贝那份（左）
  clone: CopyWay;               // 同步那份（右）
  cues?: number[];              // [0]=副本拷出 [1]=ZIP 断开 [2]=作者更新
};

export const syncVsCopyDefaults: SyncVsCopyProps = {
  author: 'FredTalk',
  authorNote: '作者的项目',
  versions: ['v1', 'v2'],
  zip: { title: 'Download ZIP', note: '拷贝出去，就断开了', after: '停在 v1' },
  clone: { title: 'git clone', note: '一直连着源头', after: '跟着变成 v2' },
};

const CW = 470, CH = 250, CY = 560;
const LX = 960 - 470 - CW / 2, RX = 960 + 470 - CW / 2;   // 两份副本左边
const LINE = 9;

// 版本号原位翻动：旧的往上走，新的从下面上来（裁在一个窗口里）
function Roll({ from, to, v, size, color, toColor, w }: { from: string; to: string; v: number; size: number; color: string; toColor: string; w: number }) {
  const h = size * 1.2;
  return <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: -v * h, textAlign: 'center', ...textBase(size, 900), lineHeight: `${h}px`, color }}>{from}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: (1 - v) * h, textAlign: 'center', ...textBase(size, 900), lineHeight: `${h}px`, color: toColor }}>{to}</div>
  </div>;
}

// 源头底边中点 → 副本顶边中点的 S 形曲线
const pt = (x0: number, y0: number, x1: number, y1: number, u: number) => {
  const my = (y0 + y1) / 2, m = 1 - u;
  return {
    x: m * m * m * x0 + 3 * m * m * u * x0 + 3 * m * u * u * x1 + u * u * u * x1,
    y: m * m * m * y0 + 3 * m * m * u * my + 3 * m * u * u * my + u * u * u * y1,
  };
};
const pathOf = (x0: number, y0: number, x1: number, y1: number, u0: number, u1: number) => {
  const N = 24;
  return Array.from({ length: N + 1 }, (_, i) => { const a = pt(x0, y0, x1, y1, mix(u0, u1, i / N)); return `${i ? 'L' : 'M'} ${a.x.toFixed(1)} ${a.y.toFixed(1)}`; }).join(' ');
};

export function SyncVsCopy(props: Partial<SyncVsCopyProps>) {
  const c = { ...syncVsCopyDefaults, ...props };
  const t = useT();
  const [v1, v2] = c.versions;
  const nameLine = `${c.authorNote} · ${c.author}`;
  const srcW = Math.round(clamp(textWidth(nameLine, 30) + 90, 500, 900));   // 源头牌按名字宽度
  const SRC: Box = { x: 960 - srcW / 2, y: 150, w: srcW, h: 250 };

  // —— 时间线 ——
  const outAt = cueAt(c.cues, 0, 0.7);
  const cutAt = cueAt(c.cues, 1, outAt + 1.25);
  const updAt = cueAt(c.cues, 2, cutAt + 0.95);
  const srcIn = springAt(t, 0, 0.55);
  const out = q(t, outAt, outAt + 0.75);
  const tagIn = p(t, outAt + 0.55, outAt + 0.95);
  const cut = p(t, cutAt, cutAt + 0.45);
  const srcRoll = q(t, updAt, updAt + 0.45);
  const flowAt = updAt + 0.4, flowEnd = flowAt + 0.75;
  const flow = q(t, flowAt, flowEnd);
  const cloneRoll = q(t, flowEnd - 0.05, flowEnd + 0.4);
  const settle = p(t, flowEnd + 0.3, flowEnd + 0.75);

  // —— 尺寸：版本号、名字按宽度 ——
  const numSize = Math.min(130, (CW - 80) / Math.max(1, textWidth(v1, 1), textWidth(v2, 1)));
  const srcNum = Math.min(140, (SRC.w - 80) / Math.max(1, textWidth(v1, 1), textWidth(v2, 1)));
  const nameSize = Math.min(34, (SRC.w - 60) / Math.max(1, textWidth(nameLine, 1)));
  const tagSize = Math.min(40, ...[c.zip.title, c.clone.title].map((s) => (CW - 100) / Math.max(1, textWidth(s, 1) + 1.4)));
  const tagH = Math.round(tagSize * 1.75);
  const noteSize = Math.min(32, ...[c.zip.note, c.clone.note].map((s) => (CW + 120) / Math.max(1, textWidth(s, 1))));
  const afterSize = Math.min(36, ...[c.zip.after, c.clone.after].map((s) => (CW - 60) / Math.max(1, textWidth(s, 1))));

  // 副本：从源头身后滑出到左右
  const copyBox = (x: number): Box => ({ x: mix(SRC.x + (SRC.w - CW) / 2, x, out), y: mix(SRC.y, CY, out), w: CW, h: CH });
  const L = copyBox(LX), R = copyBox(RX);
  const sx = 960, sy = SRC.y + SRC.h;
  const zipDim = settle;

  const Copy = ({ b, way, isClone }: { b: Box; way: CopyWay; isClone: boolean }) => {
    const roll = isClone ? cloneRoll : 0;
    const dim = isClone ? 0 : zipDim;
    return <>
      <Surface box={b} style={{ opacity: clamp(out * 4) }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: (CH - numSize * 1.2) / 2 - mix(0, 22, settle), display: 'flex', justifyContent: 'center', opacity: clamp((out - 0.45) * 3) }}>
          <Roll from={v1} to={v2} v={roll} size={numSize} w={CW} color={S.ink} toColor={accentOn(false)} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: CH / 2 + numSize * 0.48, textAlign: 'center', opacity: settle, transform: `translateY(${(1 - settle) * 12}px)` }}>
          <span style={{ ...textBase(afterSize, 900), color: isClone ? accentOn(false) : S.muted }}>{way.after}</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.55 * dim }} />
      </Surface>
      {/* 方式：黑胶囊压在卡顶 */}
      {tagIn > 0 && (() => {
        const w = textWidth(way.title, tagSize) + tagSize * 1.4;
        return <Pill box={{ x: b.x + CW / 2 - w / 2, y: b.y - tagH / 2, w, h: tagH }} style={{ clipPath: `inset(0 ${50 * (1 - tagIn)}% 0 ${50 * (1 - tagIn)}% round ${tagH / 2}px)`, opacity: mix(1, 0.55, dim) }}>
          <span style={{ ...textBase(tagSize, 900), color: '#fff' }}>{way.title}</span>
        </Pill>;
      })()}
      {/* 说明小字：卡片下方 */}
      <div style={{ position: 'absolute', left: b.x - 60, width: CW + 120, top: b.y + CH + 24, textAlign: 'center', ...textBase(noteSize, 500),
        color: S.muted, opacity: tagIn * mix(1, 0.6, dim) }}>{way.note}</div>
    </>;
  };

  // 线：源头 → 副本顶边（胶囊上沿）
  const ly = L.y - tagH / 2, ry = R.y - tagH / 2;
  const lx = L.x + CW / 2, rx = R.x + CW / 2;
  const gap = 0.07 * cut;    // 断口
  const pulse = pt(sx, sy, rx, ry, flow);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {out > 0.02 && <>
          {/* 右：一直连着 */}
          <path d={pathOf(sx, sy, rx, ry, 0, 1)} fill="none" stroke={S.ink} strokeWidth={LINE} strokeLinecap="round" />
          {/* 左：断开 —— 从中间裂开，两头缩回变淡 */}
          {cut <= 0
            ? <path d={pathOf(sx, sy, lx, ly, 0, 1)} fill="none" stroke={S.ink} strokeWidth={LINE} strokeLinecap="round" />
            : <g opacity={mix(1, 0.85, cut)}>
              <path d={pathOf(sx, sy, lx, ly, 0, 0.5 - gap - 0.07 * cut)} fill="none" stroke={cut > 0.5 ? S.faint : S.ink} strokeWidth={LINE} strokeLinecap="round" />
              <path d={pathOf(sx, sy, lx, ly, 0.5 + gap + 0.07 * cut, 1)} fill="none" stroke={cut > 0.5 ? S.faint : S.ink} strokeWidth={LINE} strokeLinecap="round" />
            </g>}
        </>}
      </svg>

      {/* 副本（在源头下层，从它身后滑出） */}
      <Copy b={L} way={c.zip} isClone={false} />
      <Copy b={R} way={c.clone} isClone />

      {/* 作者的项目：黑色版本牌 */}
      <div style={{ position: 'absolute', left: SRC.x, top: SRC.y, width: SRC.w, height: SRC.h, transform: `scale(${mix(0.6, 1, srcIn)})`, opacity: clamp(t / 0.12), zIndex: 5 }}>
        <Surface box={{ x: 0, y: 0, w: SRC.w, h: SRC.h }} dark shadow={S.capsuleShadow}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', ...textBase(nameSize, 500), color: '#fff', opacity: 0.72 }}>{nameLine}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 30 + nameSize * 1.3 + 4, display: 'flex', justifyContent: 'center' }}>
            <Roll from={v1} to={v2} v={srcRoll} size={srcNum} w={SRC.w} color="#fff" toColor={accentOn(true)} />
          </div>
        </Surface>
      </div>

      {/* 更新：一颗新版本小胶囊沿右边的线流下去 */}
      {flow > 0 && flow < 1 && (() => {
        const w = textWidth(v2, 40) + 44, h = 64;
        return <Pill box={{ x: pulse.x - w / 2, y: pulse.y - h / 2, w, h }} shadow="0 8px 16px #0004" style={{ zIndex: 6 }}>
          <span style={{ ...textBase(40, 900), color: accentOn(true) }}>{v2}</span>
        </Pill>;
      })()}
    </Handoff>
    <Sfx name="pop" at={0.02} />
    <Sfx name="slide" at={outAt} />
    <Sfx name="whoosh-short" at={cutAt} />
    <Sfx name="pop" at={updAt} />
    <Sfx name="ding" at={flowEnd} />
  </Frame>;
}
