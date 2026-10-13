// T05i-UnboxResult：打开下载包看到什么
// 观众要看懂的变化：两个下载包打开 → 一个直接是能用的软件，一个是一堆代码文件
// 关系（重写）：两条下载下来的文件（文件名条）并排 → 同一张卡向下展开成“打开后的内容”：
//   左边弹出真实 App 图标 + 名字，下方黑胶囊“双击就能用”；右边一行行涌出仓库里的真实文件夹和文件，下方黑胶囊“要先跑起来”。
//   → 两边材料退后（轻缩小 + 失焦 + 白蒙版），前景横向展开一句结论胶囊“不是下错了，是要先跑起来”。
// 对象连续：文件名条就是卡片的标题栏，展开时不换对象；结论从中间横向展开（过冲回落）。关键内容 y ≤ 880。
// 素材：LosslessCut 真实 App 图标 x3-losslesscut-icon.png；右侧文件名取自 Fred 的 FredTalk 仓库首页（gh-repo-home.png）真实目录。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Pill, Sfx, Surface, textBase, useT } from '../kit/ui';

export type UnboxResultProps = HandoffProps & {
  appPack: string;        // 左边下载包的文件名
  codePack: string;       // 右边下载包的文件名
  appName: string;        // 弹出的 App 名
  appIcon?: string;       // public/ 下的真实 App 图标；不给就只显示名字
  appLabel: string;       // 左边胶囊
  files: string[];        // 右边涌出的文件名（文件夹以 / 结尾），2–9 个
  codeLabel: string;      // 右边胶囊
  conclusion: string;     // 最后的结论
  highlight: string;      // conclusion 里染紫的词
  cues?: number[];        // [0]=两个包打开 [1]=结论出现
};

export const unboxResultDefaults: UnboxResultProps = {
  appPack: 'LosslessCut-mac-arm64.dmg',
  codePack: 'FredTalk-main.zip',
  appName: 'LosslessCut',
  appIcon: 'media/x3-losslesscut-icon.png',
  appLabel: '双击就能用',
  files: ['apps/', 'components/', 'docs/', 'scripts/', 'skills/', 'tests/', 'PLAN.md', 'README.md'],
  codeLabel: '要先跑起来',
  conclusion: '不是下错了，是要先跑起来',
  highlight: '要先跑起来',
};

const TOP = 160;
const BAR = 88;           // 标题栏（文件名条）高
const GAP = 110;
const mono = (s: string, f: number) => Array.from(s).reduce((w, ch) => w + (/[\u0000-ÿ]/.test(ch) ? 0.6 : 1.0) * f, 0);
const dUnits = (s: string) => Array.from(s).reduce((w, ch) => w + (/[A-Z]/.test(ch) ? 0.68 : /[\u0000-ÿ]/.test(ch) ? 0.6 : 1), 0);

function DisplayText({ text, size, color, hl }: { text: string; size: number; color: string; hl?: string }) {
  const i = hl ? text.indexOf(hl) : -1;
  const segs = i < 0 ? [{ s: text, c: color }] : [{ s: text.slice(0, i), c: color }, { s: hl!, c: accentOn(true) }, { s: text.slice(i + hl!.length), c: color }];
  return <span style={{ ...textBase(size, 400, S.display), lineHeight: 1 }}>
    {segs.map((g, k) => (g.s.match(/[\u0000-ÿ]+|[^\u0000-ÿ]+/g) ?? []).map((r, j) => /^[\u0000-ÿ]+$/.test(r)
      ? <span key={`${k}-${j}`} style={{ fontFamily: S.body, fontWeight: 900, color: g.c }}>{r}</span>
      : <span key={`${k}-${j}`} style={{ color: g.c }}>{r}</span>))}
  </span>;
}

export function UnboxResult(props: Partial<UnboxResultProps>) {
  const c = { ...unboxResultDefaults, ...props };
  const t = useT();
  const files = c.files.slice(0, 9);

  // —— 版式 ——
  const PW = 620;
  const LX = 960 - GAP / 2 - PW, RX = 960 + GAP / 2;
  const nameSize = Math.min(32, ...[c.appPack, c.codePack].map((s) => (PW - 80) / Math.max(1, mono(s, 1))));
  const rowSize = Math.min(34, (PW - 140) / Math.max(1, ...files.map((f) => mono(f, 1))));
  const rowH = Math.round(Math.min(56, 440 / Math.max(1, files.length)));
  const bodyH = Math.max(380, files.length * rowH + 56);
  const PH = BAR + bodyH;
  const pillSize = Math.min(48, ...[c.appLabel, c.codeLabel].map((s) => (PW - 60) / Math.max(1, dUnits(s) + 1.5)));
  const pillH = Math.round(pillSize * 1.8);
  const pillY = TOP + PH + 32;
  const iconD = Math.min(230, bodyH - 150);
  const appNameSize = Math.min(48, (PW - 80) / Math.max(1, textWidth(c.appName, 1)));

  // —— 时间线 ——
  const enter = p(t, 0, 0.4);
  const openAt = cueAt(c.cues, 0, 0.6);
  const openL = q(t, openAt, openAt + 0.55);
  const openR = q(t, openAt + 0.12, openAt + 0.67);
  const iconPop = springAt(t, openAt + 0.4, 0.6);
  const rowAt = (i: number) => openAt + 0.45 + i * 0.065;
  const pillL = p(t, openAt + 0.95, openAt + 1.3);
  const pillR = p(t, rowAt(files.length - 1) + 0.3, rowAt(files.length - 1) + 0.65);
  const conAt = cueAt(c.cues, 1, Math.max(openAt + 2.3, rowAt(files.length - 1) + 1.4));
  const recede = q(t, conAt, conAt + 0.5);
  const con = p(t, conAt + 0.05, conAt + 0.55) * 1.04 - 0.04 * q(t, conAt + 0.55, conAt + 0.85);

  const cSize = Math.min(76, 1500 / Math.max(1, dUnits(c.conclusion)));
  const cH = Math.round(cSize * 1.9), cW = dUnits(c.conclusion) * cSize + cSize * 1.8;
  const cY = TOP + PH / 2 - cH / 2 + 40;

  const TitleBar = ({ name }: { name: string }) => {
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : '';
    return <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ ...textBase(nameSize, 600, S.mono), color: S.muted }}>{base}</span>
      <span style={{ ...textBase(nameSize, 600, S.mono), color: S.ink }}>{ext}</span>
    </div>;
  };
  const panel = (x: number, open: number, body: React.ReactNode, name: string) => {
    const h = BAR + bodyH * open;
    const y = mix(540 - BAR / 2 - 30, TOP, open);   // 文件名条先在画面中部，展开时一边上移一边向下长出内容
    return <Surface box={{ x, y: y + (1 - enter) * 30, w: PW, h }} style={{ opacity: enter }}>
      <TitleBar name={name} />
      <div style={{ position: 'absolute', left: 24, right: 24, top: BAR - 1, height: 2, background: S.ink, opacity: 0.08 * open }} />
      <div style={{ position: 'absolute', left: 0, top: BAR, width: PW, height: bodyH }}>{body}</div>
    </Surface>;
  };

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 材料：两个打开的下载包（结论出现时退后） */}
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '960px 500px', transform: `scale(${mix(1, 0.95, recede)})`, filter: recede > 0.01 ? `blur(${7 * recede}px)` : undefined }}>
        {panel(LX, openL, <>
          {c.appIcon && <Img src={staticFile(c.appIcon)} style={{
            position: 'absolute', left: PW / 2 - iconD / 2, top: (bodyH - iconD - appNameSize * 1.5) / 2 + (1 - clamp(iconPop)) * 60,
            width: iconD, height: iconD, transform: `scale(${mix(0.3, 1, iconPop)})`, opacity: clamp((t - openAt - 0.4) / 0.1), filter: 'drop-shadow(0 14px 18px #0003)',
          }} />}
          <div style={{ position: 'absolute', left: 0, right: 0, top: c.appIcon ? (bodyH - iconD - appNameSize * 1.5) / 2 + iconD + 14 : bodyH / 2 - appNameSize * 0.6, textAlign: 'center',
            ...textBase(appNameSize, 900), color: S.ink, opacity: p(t, openAt + 0.6, openAt + 0.95) }}>{c.appName}</div>
        </>, c.appPack)}
        {panel(RX, openR, <>
          {files.map((f, i) => {
            const e = p(t, rowAt(i), rowAt(i) + 0.3);
            const folder = f.endsWith('/');
            return <div key={i} style={{
              position: 'absolute', left: 50, right: 50, top: 28 + i * rowH, height: rowH, display: 'flex', alignItems: 'center',
              opacity: e, transform: `translateY(${(1 - e) * -18}px)`, borderBottom: i < files.length - 1 ? '2px solid rgba(25,25,28,0.06)' : undefined,
            }}>
              <span style={{ ...textBase(rowSize, 600, S.mono), color: folder ? S.ink : '#3a3a40' }}>{f}</span>
            </div>;
          })}
        </>, c.codePack)}
        {/* 两边的判断：黑胶囊 */}
        {[{ x: LX, label: c.appLabel, e: pillL }, { x: RX, label: c.codeLabel, e: pillR }].map((it, i) => {
          if (it.e <= 0) return null;
          const w = dUnits(it.label) * pillSize + pillSize * 1.5;
          return <Pill key={i} box={{ x: it.x + PW / 2 - w / 2, y: pillY + (1 - it.e) * 16, w, h: pillH }} style={{ clipPath: `inset(0 ${50 * (1 - it.e)}% 0 ${50 * (1 - it.e)}% round ${pillH / 2}px)` }}>
            <DisplayText text={it.label} size={pillSize} color="#fff" />
          </Pill>;
        })}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.62 * recede }} />

      {/* 结论：前景横向展开 */}
      {con > 0 && <Pill box={{ x: 960 - (cW * con) / 2, y: cY, w: cW * con, h: cH }} style={{ overflow: 'hidden' }}>
        <div style={{ opacity: clamp((t - conAt - 0.22) / 0.25), whiteSpace: 'nowrap', minWidth: cW - cSize * 1.8, textAlign: 'center' }}>
          <DisplayText text={c.conclusion} size={cSize} color="#fff" hl={c.highlight} />
        </div>
      </Pill>}
    </Handoff>
    <Sfx name="whoosh-short" at={0} />
    <Sfx name="slide" at={openAt} />
    <Sfx name="pop" at={openAt + 0.4} />
    <Sfx name="ding" at={conAt + 0.05} />
  </Frame>;
}
