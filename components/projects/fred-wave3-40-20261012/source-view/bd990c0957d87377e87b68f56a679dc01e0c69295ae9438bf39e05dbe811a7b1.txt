// T02h-FileTrio：几个必备文件
// 观众要看懂的变化：几个文件卡依次立起 → 每张翻面露出一句用途
// 关系：同一组文件卡（文件形态：右上折角、正面是真实文件开头几行 + 文件名）。先从平躺依次立起，
// 再按口播逐张绕竖轴翻面（rotateY 由帧算出），背面是黑卡：上面保留文件名，下面一句用途。翻过去的保持翻面。
// 和 T02a 区分：主角是“文件”本身，动作是立起 + 翻面揭示，而不是清单逐项出现。
import React from 'react';
import { S, clamp, cueAt, mix, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type TrioFile = {
  name: string;          // 文件名（Source Code Pro）
  preview: string[];     // 正面露出的真实开头几行（1–4 行，退后的灰字）
  purpose: string;       // 翻面后的一句用途
  highlight?: string;    // purpose 里染紫的词
};

export type FileTrioProps = HandoffProps & {
  files: TrioFile[];     // 2–4 张
  cues?: number[];       // [i]=第 i 张翻面；不传用默认节奏
};

// 默认内容：114 期 S19。README.md / .gitignore 的开头取自 Fred 的 FredTalk 仓库真实文件；LICENSE 用 MIT 原文开头
export const fileTrioDefaults: FileTrioProps = {
  files: [
    { name: 'README.md', preview: ['# FredTalk', '用 Codex，把口播稿', '变成动态视频。'], purpose: '这是什么、怎么用', highlight: '怎么用' },
    { name: 'LICENSE', preview: ['MIT License', 'Copyright (c) 2026', 'Permission is hereby'], purpose: '别人能不能用、能不能改', highlight: '能不能改' },
    { name: '.gitignore', preview: ['node_modules/', '.env', 'media/'], purpose: '密码、密钥不要传上去', highlight: '不要传上去' },
  ],
};

const MONO = 0.6 / 0.58;

// 把一句话折成 n 行：在所有断法里挑“最长一行最短”的，标点后断行不罚分，其他位置断行罚 1.5 个字宽
// （优先按顿号、逗号自然断开；没有标点时再均分）。返回每行在原文里的起止下标，方便跨行染色。
function splitLines(text: string, lines: number): [number, number][] {
  const chars = Array.from(text);
  const n = chars.length;
  if (lines <= 1 || n < 2) return [[0, n]];
  const w = (a: number, b: number) => textWidth(chars.slice(a, b).join('').trim(), 1);
  const pen = (i: number) => /[，,、：:；;。 ]/.test(chars[i - 1]) ? 0
    : /[的时了和与就]/.test(chars[i - 1]) ? 0.8          // 虚词后面断，读起来顺
    : /[不的和与在把给让就都也还要能]/.test(chars[i]) ? 1.0 : 1.5;
  let best: [number, number][] = [[0, n]], bestCost = Infinity;
  const rec = (start: number, left: number, acc: [number, number][], maxW: number, cost: number) => {
    if (left === 1) {
      const m = Math.max(maxW, w(start, n));
      if (m + cost < bestCost) { bestCost = m + cost; best = [...acc, [start, n]]; }
      return;
    }
    for (let i = start + 1; i <= n - left + 1; i++) rec(i, left - 1, [...acc, [start, i]], Math.max(maxW, w(start, i)), cost + pen(i));
  };
  rec(0, lines, [], 0, 0);
  return best;
}

// 一行文字里，落在强调词范围内的字染紫（强调词被折到两行也能连续染色）
function LineText({ chars, from, to, hl, color }: { chars: string[]; from: number; to: number; hl: [number, number] | null; color: string }) {
  const seg = (a: number, b: number) => chars.slice(a, b).join('');
  if (!hl || hl[1] <= from || hl[0] >= to) return <>{seg(from, to).trim()}</>;
  const a = Math.max(from, hl[0]), b = Math.min(to, hl[1]);
  return <>{seg(from, a).trimStart()}<span style={{ color }}>{seg(a, b)}</span>{seg(b, to).trimEnd()}</>;
}

export function FileTrio(props: Partial<FileTrioProps>) {
  const c = { ...fileTrioDefaults, ...props };
  const t = useT();
  const files = (c.files.length ? c.files : fileTrioDefaults.files).slice(0, 4);
  const n = files.length;

  // —— 终态版式 ——
  const GAP = n >= 4 ? 48 : 64;
  const cardW = Math.min(500, (1660 - GAP * (n - 1)) / n);
  const cardH = Math.min(620, cardW * 1.3);
  const PAD = cardW * 0.1;
  const FOLD = cardW * 0.15;
  const x0 = 960 - (cardW * n + GAP * (n - 1)) / 2;
  const y0 = 556 - cardH / 2;
  const avail = cardW - PAD * 2;
  const nameSize = Math.min(54, ...files.map((f) => (avail - FOLD * 0.2) / Math.max(1, textWidth(f.name, 1) * MONO)));
  const prevSize = Math.min(34, avail / Math.max(1, ...files.flatMap((f) => f.preview.map((l) => textWidth(l, 1) * MONO))));
  // 用途：先试一行，太小就折成两三行；三张统一字号
  const layout = files.map((f) => {
    for (const k of [1, 2, 3]) {   // 一行放得下大字就一行，否则两行、三行
      const chars = Array.from(f.purpose);
      const ls = splitLines(f.purpose, k).map(([a, b]) => chars.slice(a, b).join('').trim());
      const size = Math.min(70, avail / Math.max(...ls.map((l) => textWidth(l, 1))));
      if (size >= 56 || k === 3) return { lines: ls, size };
    }
    return { lines: [f.purpose], size: 40 };
  });
  const purposeSize = Math.min(...layout.map((l) => l.size));

  // —— 时间 ——
  const standAt = (i: number) => i * 0.13;
  const flipAt = (i: number) => cueAt(c.cues, i, 1.45 + i * 1.05);
  const FLIP = 0.62;

  const shape = `polygon(0 0, ${cardW - FOLD}px 0, ${cardW}px ${FOLD}px, ${cardW}px ${cardH}px, 0 ${cardH}px)`;
  const fold = (dark: boolean) => <div style={{
    position: 'absolute', left: cardW - FOLD, top: 0, width: FOLD, height: FOLD,
    background: dark ? '#3a3a40' : '#e4e4e8', clipPath: 'polygon(0 0, 0 100%, 100% 100%)', borderBottomLeftRadius: FOLD * 0.18,
  }} />;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {files.map((f, i) => {
        const x = x0 + i * (cardW + GAP);
        const s = springAt(t, standAt(i), 0.78);             // 从平躺立起，轻回弹一次
        const vis = clamp((t - standAt(i)) / 0.12);
        const tilt = (1 - s) * 82;
        const v = q(t, flipAt(i), flipAt(i) + FLIP);          // 翻面进度
        const lift = Math.sin(Math.PI * v);
        const angle = 180 * v;
        const lay = layout[i];
        const ranges = splitLines(f.purpose, lay.lines.length);
        const chars = Array.from(f.purpose);
        const hlAt = f.highlight ? f.purpose.indexOf(f.highlight) : -1;
        const hl: [number, number] | null = hlAt >= 0 ? [Array.from(f.purpose.slice(0, hlAt)).length, Array.from(f.purpose.slice(0, hlAt)).length + Array.from(f.highlight as string).length] : null;
        const lines = ranges;
        const blockH = lines.length * purposeSize * 1.22;
        return <div key={i} style={{
          position: 'absolute', left: x, top: y0, width: cardW, height: cardH, perspective: 1800, opacity: vis,
          transform: `translateY(${-lift * 26}px) scale(${1 + 0.05 * lift})`,
        }}>
          <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transformOrigin: '50% 100%', transform: `rotateX(${tilt}deg)` }}>
            <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${angle}deg)` }}>
              {/* 正面：白色文件 */}
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', filter: `drop-shadow(0 ${16 + lift * 14}px ${25 + lift * 10}px rgba(0,0,0,${0.1333 + lift * 0.05}))` }}>
                <div style={{ position: 'absolute', inset: 0, background: '#fff', clipPath: shape, borderRadius: 26 }}>
                  {fold(false)}
                  <div style={{ position: 'absolute', left: PAD, top: PAD * 1.05, right: FOLD + 8 }}>
                    {f.preview.slice(0, 4).map((l, j) => <div key={j} style={{ ...textBase(prevSize, 600, S.mono), lineHeight: 1.62, color: j === 0 ? S.muted : '#a3a3ab' }}>{l}</div>)}
                  </div>
                  <div style={{ position: 'absolute', left: PAD, right: PAD, bottom: PAD * 1.05, height: 3, background: '#ececef', transform: `translateY(${-nameSize * 1.7}px)` }} />
                  <div style={{ position: 'absolute', left: PAD, bottom: PAD * 0.95, ...textBase(nameSize, 600, S.mono), lineHeight: 1.16, color: S.ink }}>{f.name}</div>
                </div>
              </div>
              {/* 背面：黑卡，文件名 + 一句用途 */}
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', filter: `drop-shadow(30px 22px 25px rgba(0,0,0,${0.33 * clamp(v * 2 - 1)}))` }}>
                <div style={{ position: 'absolute', inset: 0, background: S.dark, clipPath: shape, borderRadius: 26 }}>
                  {fold(true)}
                  <div style={{ position: 'absolute', left: PAD, top: PAD * 1.05, ...textBase(Math.min(36, nameSize * 0.72), 600, S.mono), color: '#a3a3ab' }}>{f.name}</div>
                  <div style={{ position: 'absolute', left: PAD, right: PAD, top: (cardH - blockH) / 2 + cardH * 0.06 }}>
                    {lines.map((l, j) => <div key={j} style={{ ...textBase(purposeSize, 900), lineHeight: 1.22, color: '#fff' }}>
                      <LineText chars={chars} from={l[0]} to={l[1]} hl={hl} color={S.accentDark} />
                    </div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>;
      })}
    </Handoff>
    <Sfx name="whoosh-short" at={0} />
    {files.map((_, i) => <Sfx key={i} name="pop" at={flipAt(i) + FLIP * 0.5} />)}
  </Frame>;
}
