// T09i-PickRow：按条件选中一行
// 观众要看懂的变化：一列选项 → 条件胶囊连到匹配的那一行，其余退灰
// 关系：同一张真实列表截图（只取文件名一列）。左侧依次落下条件胶囊，引线落到匹配行，该行用真实像素原位提起放大（motion-craft §11），
// 其余行变淡（白蒙版 + 轻失焦）。支持 1–3 组条件依次，前面选中的行保持提起，终态是“条件 → 对应文件”一目了然。
// 返修（Fred：“windows 放下面可能被字幕挡”）：列表按“最低一条被选中行 ≤ y 900”反算缩放和位置，整组（胶囊列 + 列表）水平居中；
//   胶囊右对齐成一列，纵向对准各自那一行，引线是短横线；拉丁字用 MiSans Heavy（锐字真言的拉丁字形不适合产品名）。
// 素材：lossless-cut releases/latest 的 Assets 真实截图 gh-losslesscut-assets.png（2026-10-12 抓取，18 行）。
// 注意 Windows 包是 .7z，不是 .zip。也可用于选套餐、选版本：换图、换像素框即可。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, springAt } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, Sfx, Surface, textBase, useT } from '../kit/ui';

export type PickCondition = {
  label: string;     // 条件，例如“苹果芯片 Mac”
  row: Box;          // 匹配行在截图里的像素框（整行）
};

export type PickRowProps = HandoffProps & {
  image: string;
  imageWidth: number;
  imageHeight: number;
  crop: Box;                    // 要展示的列表区域（源图像素），上下边落在行间分隔线
  conditions: PickCondition[];  // 1–3 组，按讲解顺序
  cues?: number[];              // [i]=第 i 个条件胶囊出现
};

export const pickRowDefaults: PickRowProps = {
  image: 'media/gh-losslesscut-assets.png',
  imageWidth: 3840,
  imageHeight: 2160,
  crop: { x: 710, y: 717, w: 890, h: 882 },   // 文件名一列（右边界在 sha256 列之前），10 行，上下边落在分隔线
  conditions: [
    { label: '苹果芯片 Mac', row: { x: 740, y: 805, w: 2360, h: 90 } },   // LosslessCut-mac-arm64.dmg
    { label: 'Windows', row: { x: 740, y: 1509, w: 2360, h: 90 } },       // LosslessCut-win-x64.7z
  ],
};

const SAFE_TOP = 140;        // 角标下方
const SAFE_BOTTOM = 890;     // 字幕上方：被选中的行（含提起放大）不低于这里
const LIFT = 1.14;           // 选中行原位放大
const GAP = 110;             // 胶囊列与列表之间（引线长度）

// 锐字真言只用于中文；拉丁片段换 MiSans Heavy，同字号同基线（T02e 写法）
function DisplayText({ text, size, color }: { text: string; size: number; color: string }) {
  const runs = text.match(/[\u0000-ÿ]+|[^\u0000-ÿ]+/g) ?? [text];
  return <span style={{ ...textBase(size, 400, S.display), color, lineHeight: 1 }}>
    {runs.map((r, i) => /^[\u0000-ÿ]+$/.test(r)
      ? <span key={i} style={{ fontFamily: S.body, fontWeight: 900 }}>{r}</span>
      : <React.Fragment key={i}>{r}</React.Fragment>)}
  </span>;
}
const labelUnits = (s: string) => Array.from(s).reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.68 : /[\u0000-ÿ]/.test(ch) ? 0.6 : 1), 0);

export function PickRow(props: Partial<PickRowProps>) {
  const c = { ...pickRowDefaults, ...props };
  const t = useT();
  const conds = c.conditions.slice(0, 3);
  const n = conds.length;

  // —— 胶囊尺寸：统一字号，宽度按最长条件 ——
  const size = Math.max(36, Math.min(50, ...conds.map((cd) => 440 / (labelUnits(cd.label) + 1.6))));
  const pillH = Math.round(size * 1.85);
  const pillW = conds.map((cd) => labelUnits(cd.label) * size + size * 1.6);
  const colW = Math.max(...pillW);

  // —— 列表缩放：高度放进安全区，最低选中行（放大后）不低于 SAFE_BOTTOM ——
  const lowest = Math.max(...conds.map((cd) => cd.row.y + cd.row.h)) - c.crop.y;
  const kFit = Math.min(1.0, (SAFE_BOTTOM - SAFE_TOP) / c.crop.h, (1700 - colW - GAP) / c.crop.w);
  const k = kFit;
  const W = c.crop.w * k, H = c.crop.h * k;
  // 纵向：先居中于安全区，再保证最低选中行（含放大余量）在 SAFE_BOTTOM 之上
  const rowHmax = Math.max(...conds.map((cd) => cd.row.h)) * k;
  let Y = SAFE_TOP + (SAFE_BOTTOM - SAFE_TOP - H) / 2;
  Y = Math.min(Y, SAFE_BOTTOM - lowest * k - rowHmax * (LIFT - 1) / 2);
  Y = Math.max(SAFE_TOP, Y);
  const groupW = colW + GAP + W;
  const X0 = (1920 - groupW) / 2;                // 胶囊列左边
  const X = X0 + colW + GAP;                     // 列表左边
  const imgL = X - c.crop.x * k, imgT = Y - c.crop.y * k;
  const rowBox = conds.map((cd): Box => {        // 行框裁到展示区域内（右边的列已裁掉）
    const x1 = Math.max(cd.row.x, c.crop.x), x2 = Math.min(cd.row.x + cd.row.w, c.crop.x + c.crop.w);
    return { x: X + (x1 - c.crop.x) * k, y: Y + (cd.row.y - c.crop.y) * k, w: (x2 - x1) * k, h: cd.row.h * k };
  });

  // 胶囊纵向对准各自那一行；相邻两行太近时依次往下让，保证不叠
  const cy = conds.map((_, i) => rowBox[i].y + rowBox[i].h / 2);
  const order = conds.map((_, i) => i).sort((a, b) => cy[a] - cy[b]);
  const pillCy = [...cy];
  order.forEach((i, j) => { if (j > 0) pillCy[i] = Math.max(pillCy[i], pillCy[order[j - 1]] + pillH + 22); });

  // —— 时间线 ——
  const step = n === 3 ? 1.35 : 1.8;
  const at = conds.map((_, i) => cueAt(c.cues, i, 0.6 + i * step));
  const pill = at.map((a) => springAt(t, a, 0.6));
  const line = at.map((a) => p(t, a + 0.3, a + 0.62));
  const lift = at.map((a) => p(t, a + 0.55, a + 1.0));
  const dim = Math.max(0, ...lift);
  const enter = p(t, 0, 0.45);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 真实列表：其余行退后（轻失焦 + 白蒙版） */}
      <Surface box={{ x: X, y: Y + (1 - enter) * 40, w: W, h: H }} style={{ opacity: enter }}>
        <Img src={staticFile(c.image)} style={{ position: 'absolute', left: imgL - X, top: imgT - Y, width: c.imageWidth * k, height: c.imageHeight * k, maxWidth: 'none', filter: dim > 0.01 ? `blur(${2.5 * dim}px)` : undefined }} />
        <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.72 * dim }} />
      </Surface>

      {/* 引线：胶囊右端 → 匹配行左端（短横线；行被让位时斜接） */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 5 }}>
        {conds.map((_, i) => {
          if (line[i] <= 0) return null;
          const x1 = X0 + colW + 10, x2 = rowBox[i].x - (rowBox[i].w * (LIFT - 1)) / 2 * lift[i] - 6;
          const y1 = pillCy[i], y2 = cy[i];
          const xe = mix(x1, x2, line[i]), ye = mix(y1, y2, line[i]);
          return <g key={i}>
            <path d={`M ${x1} ${y1} L ${xe} ${ye}`} stroke={S.ink} strokeWidth={5} strokeLinecap="round" fill="none" />
            <circle cx={xe} cy={ye} r={8 * clamp(line[i] * 1.5)} fill={S.ink} />
          </g>;
        })}
      </svg>

      {/* 匹配行：同一行的真实像素，原位提起放大 */}
      {conds.map((_, i) => {
        if (lift[i] <= 0.001) return null;
        const r = rowBox[i];
        const e = lift[i];
        return <div key={i} style={{
          position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', background: '#fff',
          borderRadius: mix(0, 14, e), transform: `scale(${mix(1, LIFT, e)})`, transformOrigin: '50% 50%',
          boxShadow: `0 ${mix(2, 20, e)}px ${mix(6, 34, e)}px rgba(0,0,0,${mix(0.04, 0.18, e)})`, zIndex: 10 + i,
        }}>
          <Img src={staticFile(c.image)} style={{ position: 'absolute', left: imgL - r.x, top: imgT - r.y, width: c.imageWidth * k, height: c.imageHeight * k, maxWidth: 'none' }} />
        </div>;
      })}

      {/* 条件胶囊：右对齐成一列，从引线起点处弹出 */}
      {conds.map((cd, i) => {
        if (t < at[i]) return null;
        const pp = pill[i];
        return <div key={i} style={{
          position: 'absolute', left: X0 + colW - pillW[i], top: pillCy[i] - pillH / 2, width: pillW[i], height: pillH, borderRadius: pillH / 2,
          background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: clamp((t - at[i]) / 0.1), transform: `translateX(${(1 - clamp(pp)) * 36}px) scale(${mix(0.72, 1, pp)})`, transformOrigin: '100% 50%', zIndex: 20,
        }}>
          <DisplayText text={cd.label} size={size} color="#fff" />
        </div>;
      })}
    </Handoff>
    {at.map((a, i) => <Sfx key={i} name="pop" at={a} />)}
    <Sfx name="slide" at={at[0] + 0.55} />
  </Frame>;
}
