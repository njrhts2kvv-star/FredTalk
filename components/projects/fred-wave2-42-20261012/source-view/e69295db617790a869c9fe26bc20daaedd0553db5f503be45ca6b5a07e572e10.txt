// T12g-ChapterRecap：章节进度回顾（快过渡 3s）
// 观众要看懂的变化：已讲的划过 → 当前这一章点亮
// 动作：整期章节竖排列出；一条黑胶囊从第一章出发往下“划过”已讲的章节（划过即打上删除线、退成灰），
//       停在当前章，把它点亮成黑底白字。
// 与库内区分：T02a 是卡片横排立起；T12d 是三枚胶囊逐项建立；X023 是倾斜目录滚动。这里是“一条高亮滑块沿竖排目录扫过并停靠”。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type ChapterRecapProps = HandoffProps & {
  chapters: string[];   // 整期章节名（2–10 项）
  current: number;      // 当前章（从 0 开始）；它之前的都算已讲
  highlight: string;    // 当前章里染紫的词（深底 #D6BEFF），留空不强调
  cues?: number[];      // [0]=滑块开始往下划，[1]=停在当前章（落定）
};

// 默认内容：第 112 期《API 是什么》三个部分，现在进入第三部分
export const chapterRecapDefaults: ChapterRecapProps = {
  chapters: ['API 到底是什么', '什么时候会用到', 'API 到底怎么用'],
  current: 2,
  highlight: '',
};

export function ChapterRecap(props: Partial<ChapterRecapProps>) {
  const c = { ...chapterRecapDefaults, ...props };
  const t = useT();
  const items = c.chapters.slice(0, 10);
  const n = Math.max(1, items.length);
  const cur = Math.max(0, Math.min(n - 1, Math.round(c.current)));

  // —— 版式：行高随项数，字号按最长一项和行高取小 ——
  const rowH = Math.min(214, 820 / n);
  const maxUnits = Math.max(1, ...items.map((s) => textWidth(s, 1)));
  const size = Math.min(136, rowH * 0.62, 1360 / maxUnits);
  const padX = size * 0.62;
  const barH = Math.min(rowH * 0.86, size * 1.62);
  const listW = maxUnits * size;
  const listX = 960 - listW / 2;                     // 文字左边界（同组共用）
  const listY = 540 - (n * rowH) / 2 + 10;
  const rowCy = (i: number) => listY + i * rowH + rowH / 2;
  const textTop = (i: number) => rowCy(i) - size * 0.58;

  // —— 时间 ——
  const sweepAt = cueAt(c.cues, 0, 0.62);
  const landAt = cueAt(c.cues, 1, sweepAt + Math.min(1.5, 0.42 * cur + 0.2));
  const barIn = p(t, 0.22, 0.52);
  const travel = cur === 0 ? 1 : q(t, sweepAt, landAt);
  const pos = travel * cur;                          // 滑块所在的“行号”（连续）
  const i0 = Math.floor(pos), i1 = Math.min(n - 1, i0 + 1), f = pos - i0;
  const wOf = (i: number) => textWidth(items[i], size) + padX * 2;
  const barW = mix(wOf(i0), wOf(i1), f) * barIn;
  const barX = listX - padX;
  const barY = mix(rowCy(i0), rowCy(i1), f) - barH / 2;
  const land = p(t, landAt, landAt + 0.3);           // 停靠后轻微加重阴影

  // 每一项被划过的进度：滑块中心越过这一行下半之后开始画删除线
  const struck = (i: number) => i < cur ? clamp((pos - i - 0.35) / 0.45) : 0;
  const hiColor = (i: number) => (i === cur ? mix(0, 1, land) : 0);

  const rowText = (i: number, color: string, withHl: boolean) => {
    const s = items[i];
    const k = withHl && c.highlight ? s.indexOf(c.highlight) : -1;
    const body = k < 0 ? s : <>{s.slice(0, k)}<span style={{ color: hiColor(i) > 0.5 ? S.accentDark : '#fff' }}>{c.highlight}</span>{s.slice(k + c.highlight.length)}</>;
    return <div style={{ ...textBase(size, 900), position: 'absolute', left: listX, top: textTop(i), color }}>{body}</div>;
  };

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 底层：墨色（未讲）/ 灰色+删除线（已讲） */}
      {items.map((s, i) => {
        const e = p(t, i * 0.06, 0.34 + i * 0.06);
        const st = struck(i);
        const w = textWidth(s, size);
        return <div key={i} style={{ position: 'absolute', inset: 0, opacity: e, transform: `translateY(${(1 - e) * 26}px)` }}>
          {rowText(i, st > 0.02 ? S.faint : S.ink, false)}
          {st > 0 && <div style={{
            position: 'absolute', left: listX - size * 0.06, top: rowCy(i) - size * 0.04, height: Math.max(6, size * 0.075),
            width: (w + size * 0.12) * st, background: S.faint, borderRadius: 6,
          }} />}
        </div>;
      })}
      {/* 黑色滑块：内部放同位置的白字副本，滑到哪一行哪一行变白 */}
      {barW > 1 && <div style={{
        position: 'absolute', left: barX, top: barY, width: barW, height: barH, borderRadius: barH / 2,
        background: S.dark, overflow: 'hidden', boxShadow: S.capsuleShadow,
      }}>
        <div style={{ position: 'absolute', left: -barX, top: -barY, width: 1920, height: 1080 }}>
          {items.map((_, i) => <React.Fragment key={i}>{rowText(i, '#fff', i === cur)}</React.Fragment>)}
        </div>
      </div>}
    </Handoff>
    <Sfx name="pop" at={0.22} />
    {cur > 0 && <Sfx name="slide" at={sweepAt} />}
    <Sfx name="ding" at={cur > 0 ? landAt : 0.52} />
  </Frame>;
}
