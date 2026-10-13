// T21d-SaveChecklist：可截图清单
// 观众要看懂的变化：本期要点 → 逐条打勾，整页停住方便截图
// 关系：一张白纸清单先整页铺开（所有条目都在，未完成的是浅灰字 + 空圈），按口播逐条打勾：
// 空圈长成黑圆、白勾一笔画出，这一行同时从浅灰变成实墨。全部勾完后，纸面“咔嚓”一下（白闪 + 轻按），
// 底部浮出一行小字“截图保存”，整页停住 ≥1.5 秒。
// 与库内区分：T01c 是口诀胶囊撞齐；T21a 是方法回顾；T08g 是对照页面验证标准。这里是带勾的操作清单，终态就是一张可截图的页。
// 默认内容：114 期（GitHub）结尾清单。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, Surface, textBase, useT } from '../kit/ui';

export type SaveChecklistProps = HandoffProps & {
  title: string;         // 清单标题（纸面第一行）
  items: string[];       // 3–7 条
  highlights?: string[]; // 每条里打勾后染紫的词，可留空
  hint: string;          // 底部小字，如“截图保存”
  cues?: number[];       // [i]=第 i 条打勾；[items.length]=整页定格
};

export const saveChecklistDefaults: SaveChecklistProps = {
  title: '用 GitHub 上的开源软件',
  items: ['找项目', '下载对的版本', '授权 GitHub CLI', '一句话跑起来', '传之前备好三个文件'],
  highlights: ['', '对的版本', '', '一句话', '三个文件'],
  hint: '截图保存',
};

const PAD_X = 84, PAD_TOP = 70, PAD_BOTTOM = 66;

export function SaveChecklist(props: Partial<SaveChecklistProps>) {
  const c = { ...saveChecklistDefaults, ...props };
  const t = useT();
  const items = c.items.slice(0, 7);
  const n = Math.max(1, items.length);

  // —— 终态版式：字号克制，纸面贴合内容宽度、整体在字幕区上方 ——
  // 条目少时整体放大一档，避免小纸片 + 大块空白；条目多时行距压缩，正文不小于约 34px
  const boost = n <= 3 ? 1.3 : n === 4 ? 1.12 : 1;
  const rowH = Math.min(98 * boost, 520 / n);
  const maxUnits = Math.max(1, ...items.map((s) => textWidth(s, 1)));
  const iSize = Math.min(54 * boost, rowH * 0.56, 900 / maxUnits);
  const box = Math.round(Math.max(44, iSize * 1.12));       // 勾选圈直径
  const gap = iSize * 0.62;
  const tSize = Math.min(68 * boost, (1100 - PAD_X * 2) / Math.max(1, textWidth(c.title, 1)));
  const titleGap = 40;
  const itemsW = box + gap + maxUnits * iSize;
  const paperW = Math.max(760, Math.max(itemsW, textWidth(c.title, tSize)) + PAD_X * 2 + iSize);
  const paperH = PAD_TOP + tSize * 1.16 + titleGap + n * rowH + PAD_BOTTOM;
  const hSize = 36;
  const blockH = paperH + 30 + hSize * 1.16;
  const paperX = 960 - paperW / 2;
  // 纸 + 小字整体中心约在 y=480；纸面右缘碰到角标列时，顶边让到角标下方
  const paperY = Math.max(paperX + paperW > 1530 ? 140 : 60, 480 - blockH / 2);
  const listX = PAD_X, listY = PAD_TOP + tSize * 1.16 + titleGap;

  // —— 时间 ——
  const enter = p(t, 0, 0.55);
  const at = items.map((_, i) => cueAt(c.cues, i, 0.95 + i * (n > 5 ? 0.5 : 0.62)));
  const snapAt = cueAt(c.cues, n, at[n - 1] + 0.62);
  const flash = clamp((t - snapAt) / 0.06) * (1 - q(t, snapAt + 0.06, snapAt + 0.42));
  const press = Math.sin(clamp((t - snapAt) / 0.3) * Math.PI) * 0.014;
  const hintIn = p(t, snapAt + 0.18, snapAt + 0.6);

  const ink = (k: number) => `rgb(${mix(0xa3, 0x19, k)}, ${mix(0xa3, 0x19, k)}, ${mix(0xab, 0x1c, k)})`;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <Surface box={{ x: paperX, y: paperY + (1 - enter) * 60, w: paperW, h: paperH }}
        style={{ opacity: clamp(enter * 1.6), transform: `scale(${1 - press})` }}>
        {/* 标题 */}
        <div style={{ ...textBase(tSize, 900), position: 'absolute', left: PAD_X, top: PAD_TOP, color: S.ink }}>{c.title}</div>

        {items.map((s, i) => {
          const rowIn = p(t, 0.12 + i * 0.06, 0.12 + i * 0.06 + 0.42);           // 整页铺开：一行行摊开
          const done = springAt(t, at[i], 0.5);                                   // 黑圆长出（一次回弹）
          const fill = clamp((t - at[i]) / 0.08);
          const stroke = p(t, at[i] + 0.08, at[i] + 0.34);                        // 白勾一笔画出
          const lit = p(t, at[i], at[i] + 0.3);
          const hl = c.highlights?.[i] && s.includes(c.highlights[i]) ? c.highlights[i] : '';
          const [pre, post = ''] = hl ? s.split(hl) : [s];
          const y = listY + i * rowH;
          return <div key={i} style={{
            position: 'absolute', left: listX, top: y, height: rowH, display: 'flex', alignItems: 'center', gap,
            opacity: rowIn, transform: `translateY(${(1 - rowIn) * 18}px)`,
          }}>
            <div style={{ position: 'relative', width: box, height: box, flex: 'none' }}>
              {/* 空圈 */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `4px solid ${S.faint}`, boxSizing: 'border-box', opacity: 1 - fill }} />
              {/* 黑圆 + 白勾 */}
              {fill > 0 && <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%', background: S.dark, opacity: fill,
                transform: `scale(${mix(0.4, 1, done)})`,
              }}>
                <svg width={box} height={box} viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0 }}>
                  <path d="M6.6 12.4 L10.4 16 L17.6 8.4" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="17" strokeDashoffset={17 * (1 - stroke)} />
                </svg>
              </div>}
            </div>
            <span style={{ ...textBase(iSize, 500), color: ink(lit) }}>
              {pre}{hl && <span style={{ color: lit > 0.5 ? accentOn(false) : ink(lit) }}>{hl}</span>}{post}
            </span>
          </div>;
        })}

        {/* 定格那一下：纸面白闪 */}
        {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.85 * flash }} />}
      </Surface>

      {/* 底部小字 */}
      {hintIn > 0 && <div style={{
        position: 'absolute', left: 0, right: 0, top: paperY + paperH + 30, textAlign: 'center',
        opacity: hintIn, transform: `translateY(${(1 - hintIn) * 12}px)`,
      }}>
        <span style={{ ...textBase(hSize, 500), color: S.muted }}>{c.hint}</span>
      </div>}
    </Handoff>
    {at.map((a, i) => <Sfx key={i} name="click" at={a} volume={0.35} />)}
    <Sfx name="notify" at={snapAt} volume={0.4} />
  </Frame>;
}
