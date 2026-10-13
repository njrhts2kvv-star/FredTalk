// T09k-FileFilter：上传前过滤文件
// 观众要看懂的变化：一列待上传文件 → 敏感文件被拦下放到一边，其余传上去
// 关系：左边是本地项目文件夹（同一个窗口），右边上方是要上传到的仓库卡、下方是黑色“不上传”区。
// ① 一条紫色扫描线从上往下扫过文件列表，扫到不该传的行，那一行被拎起（白条浮起 + 文件名变紫）；
// ② 被拎起的行整条滑进右下“不上传”区，列表其余行合拢、窗口跟着收短；
// ③ 剩下的行各自复制一份飞进仓库卡，仓库卡里的计数逐个加一，原行打上勾。
// 文件内容只显示开头一行；密钥值从第一帧起就是打码条（preview 里的 • 画成灰条），不出现真实值。
import React from 'react';
import { S, clamp, cueAt, mix, p, q, textWidth } from '../kit/theme';
import { Box, Frame, Handoff, HandoffProps, MacWindow, Sfx, Surface, abs, between, textBase, useT } from '../kit/ui';

export type FilterFile = {
  name: string;        // 文件名，文件夹以 / 结尾
  preview: string;     // 文件开头一行；连续的 • 会画成打码条
  block?: boolean;     // 不该上传
};

export type FileFilterProps = HandoffProps & {
  folder: string;      // 本地文件夹（窗口标题）
  files: FilterFile[]; // 4–9 个
  repoLabel: string;   // 仓库卡上的说明
  repoName: string;    // 仓库名
  blockLabel: string;  // 不上传区标题
  unit: string;        // 计数单位
  cues?: number[];     // [0]=开始扫描，[1]=拦下的行滑走，[2]=其余开始上传
};

// 默认内容：114 期“上传前先列出哪些文件不该传”——一个真实结构的小网站项目
export const fileFilterDefaults: FileFilterProps = {
  folder: 'my-site',
  files: [
    { name: 'index.html', preview: '<!doctype html>' },
    { name: '.env', preview: 'API_KEY=••••••••••', block: true },
    { name: 'style.css', preview: 'body { margin: 0 }' },
    { name: 'app.js', preview: "import './style.css'" },
    { name: 'secrets.json', preview: '{ "token": "••••••••" }', block: true },
    { name: 'README.md', preview: '# 我的小站' },
    { name: 'node_modules/', preview: 'react/  vite/  …', block: true },
  ],
  repoLabel: '上传到 GitHub',
  repoName: 'my-site',
  blockLabel: '不上传',
  unit: '个文件',
};

const MONO = 0.6 / 0.58;

function Icon({ folder, size, color }: { folder: boolean; size: number; color: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    {folder
      ? <path d="M2.5 6.2A1.7 1.7 0 0 1 4.2 4.5h4.6l2.1 2.2h8.9a1.7 1.7 0 0 1 1.7 1.7v9.4a1.7 1.7 0 0 1-1.7 1.7H4.2a1.7 1.7 0 0 1-1.7-1.7z" fill={color} />
      : <g fill="none" stroke={color} strokeWidth={1.9} strokeLinejoin="round"><path d="M6 2.8h8.2l4.3 4.3v14.1H6z" /><path d="M14 2.8v4.5h4.5" /></g>}
  </svg>;
}

// 文件内容一行：连续的 • 画成打码条（不渲染任何真实字符）
function Preview({ text, size, color }: { text: string; size: number; color: string }) {
  const parts = text.split(/(•+)/).filter(Boolean);
  return <div style={{ display: 'flex', alignItems: 'center', ...textBase(size, 600, S.mono), lineHeight: 1, color, whiteSpace: 'pre' }}>
    {parts.map((s, i) => s.startsWith('•')
      ? <span key={i} style={{ display: 'inline-block', width: s.length * size * 0.6, height: size * 0.62, borderRadius: size * 0.31, background: '#c4c4ca', margin: `0 ${size * 0.06}px` }} />
      : <span key={i}>{s}</span>)}
  </div>;
}

export function FileFilter(props: Partial<FileFilterProps>) {
  const c = { ...fileFilterDefaults, ...props };
  const t = useT();
  const files = (c.files.length ? c.files : fileFilterDefaults.files).slice(0, 9);
  const n = files.length;
  const blocked = files.map((f, i) => (f.block ? i : -1)).filter((i) => i >= 0);
  const passed = files.map((f, i) => (f.block ? -1 : i)).filter((i) => i >= 0);

  // —— 版式 ——
  const WIN_X = 110, WIN_W = 920, BAR = 76, PADY = 26;
  const LH = Math.min(86, 640 / n);
  const nameUnits = Math.max(...files.map((f) => textWidth(f.name, 1) * MONO));
  const prevUnits = Math.max(...files.map((f) => textWidth(f.preview, 1) * MONO));
  const ROW_PAD = 34;
  // 文件名 38、内容 30 为上限，按最长一行收
  const NS = Math.min(38, LH * 0.46, (WIN_W - ROW_PAD * 2 - 140) / (nameUnits + prevUnits * 0.79));
  const PS = NS * 0.79;
  const ICON = NS * 1.1;
  const nameX = ROW_PAD + 18 + ICON + NS * 0.45;
  const prevX = nameX + nameUnits * NS + NS * 1.2;
  const rowW = WIN_W - 28;

  const RX = 1100, RW = 710;
  const REPO_H = 238;
  const TRAY_HEAD = 104, CHIP_H = 66, CHIP_GAP = 10;
  const TRAY_H = TRAY_HEAD + Math.max(1, blocked.length) * (CHIP_H + CHIP_GAP) + 24;
  const colH = REPO_H + 36 + TRAY_H;
  const REPO: Box = { x: RX, y: 556 - colH / 2, w: RW, h: REPO_H };
  const TRAY: Box = { x: RX, y: REPO.y + REPO_H + 36, w: RW, h: TRAY_H };
  // 不上传区里的小条：文件名后面紧跟内容（不再按列），按最宽的一条算缩放
  const chipUnits = Math.max(...files.filter((f) => f.block).map((f) => textWidth(f.name, 1) * MONO * NS + NS * 0.9 + textWidth(f.preview, 1) * MONO * PS), 1);
  const chipPrevX = (f: FilterFile) => nameX + textWidth(f.name, NS) * MONO + NS * 0.9;
  const chipFit = (u: number) => Math.min(0.86, (RW - 48 - 40) / (nameX - ROW_PAD + u));
  // 带内容放不下（字会小于约 30px）时，小条里只留文件名，内容在滑过去的途中淡掉
  const chipNameOnly = chipFit(chipUnits) * NS < 30;
  const CHIP_S = chipNameOnly ? chipFit(Math.max(...files.filter((f) => f.block).map((f) => textWidth(f.name, 1) * MONO * NS), 1)) : chipFit(chipUnits);
  const cntDigits = String(Math.max(1, passed.length)).length;
  const CNT_W = cntDigits * 68 + 12;
  const repoNameAvail = RW - 48 - 50 - 18 - (CNT_W + 10 + textWidth(c.unit, 36)) - 48 - 30;
  const repoNameFS = Math.min(50, repoNameAvail / Math.max(1, textWidth(c.repoName, 1) * MONO));

  // —— 时间 ——
  const enter = p(t, 0, 0.45);
  const side = p(t, 0.15, 0.6);
  const scanAt = cueAt(c.cues, 0, 0.75);
  const scanDur = Math.min(1.4, 0.2 * n + 0.1);
  const blockAt0 = cueAt(c.cues, 1, scanAt + scanDur + 0.18);
  const upAt0 = cueAt(c.cues, 2, blockAt0 + 0.74 + blocked.length * 0.12 + 0.08);
  const blockAt = (k: number) => blockAt0 + k * 0.12;
  const upAt = (k: number) => upAt0 + k * Math.min(0.2, 0.9 / Math.max(1, passed.length));
  const FLY = 0.5;
  const doneAt = passed.length ? upAt(passed.length - 1) + FLY : upAt0;

  // 窗口与行：被拦下的行滑走后，其余行合拢、窗口收短（同一进度）
  const gone = files.map((f, i) => (f.block ? q(t, blockAt(blocked.indexOf(i)) + 0.3, blockAt(blocked.indexOf(i)) + 0.74) : 0));
  const keep = files.map((_, i) => 1 - gone[i]);
  const winH = BAR + PADY * 2 + keep.reduce((s, v) => s + v, 0) * LH;
  const winY = 556 - winH / 2;
  const fullH = BAR + PADY * 2 + n * LH;
  const rowY = (i: number) => winY + BAR + PADY + keep.slice(0, i).reduce((s, v) => s + v, 0) * LH;
  const listTop0 = 556 - fullH / 2 + BAR + PADY;            // 扫描时（未合拢）列表顶
  const scanY = mix(listTop0 - 10, listTop0 + n * LH + 10, q(t, scanAt, scanAt + scanDur));
  const passTime = (i: number) => scanAt + scanDur * ((i + 0.5) * LH + 10) / (n * LH + 20);
  const scanOn = clamp((t - scanAt) / 0.12) * (1 - clamp((t - scanAt - scanDur) / 0.18));

  // 计数
  const count = passed.filter((_, k) => t >= upAt(k) + FLY).length;
  const lastK = count - 1;
  const roll = lastK >= 0 ? p(t, upAt(lastK) + FLY, upAt(lastK) + FLY + 0.28) : 1;
  const bump = lastK >= 0 ? 1 + 0.05 * Math.sin(Math.PI * clamp((t - upAt(lastK) - FLY) / 0.3)) : 1;
  const blockCount = blocked.filter((_, k) => t >= blockAt(k) + 0.55).length;

  const rowInner = (f: FilterFile, nameColor: string, prevColor: string, iconColor: string, px = prevX, prevOp = 1) => <>
    <div style={{ position: 'absolute', left: ROW_PAD + 18, top: (LH - ICON) / 2 }}><Icon folder={f.name.endsWith('/')} size={ICON} color={iconColor} /></div>
    <div style={{ position: 'absolute', left: nameX, top: 0, height: LH, display: 'flex', alignItems: 'center', ...textBase(NS, 600, S.mono), lineHeight: 1, color: nameColor }}>{f.name}</div>
    <div style={{ position: 'absolute', left: px, top: 0, height: LH, display: 'flex', alignItems: 'center', opacity: prevOp }}><Preview text={f.preview} size={PS} color={prevColor} /></div>
  </>;

  // 计数数字的中心（右下角：数字 80 宽 + 单位）
  const repoNumX = REPO.x + RW - 48 - textWidth(c.unit, 36) - 10 - CNT_W / 2;
  const repoNumY = REPO.y + REPO_H - 40 - 64;

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 本地文件夹窗口 */}
      <MacWindow light box={{ x: WIN_X, y: winY + (1 - enter) * 40, w: WIN_W, h: winH }} bar={BAR} title={c.folder} style={{ opacity: enter }}>
        {/* 扫描线：紫色细线 + 上方淡紫拖尾 */}
        {scanOn > 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: scanY - winY - BAR - 70, height: 70, opacity: scanOn }}>
          <div style={{ position: 'absolute', inset: 0, background: S.accent, opacity: 0.07 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: S.accent }} />
        </div>}
      </MacWindow>

      {/* 列表行（留在窗口里的部分） */}
      {files.map((f, i) => {
        if (f.block && t >= blockAt(blocked.indexOf(i))) return null;   // 交给下面滑走的那一条
        const appear = p(t, 0.2 + i * 0.05, 0.55 + i * 0.05);
        const flag = f.block ? p(t, passTime(i), passTime(i) + 0.28) : 0;
        const k = passed.indexOf(i);
        const ok = k >= 0 ? p(t, upAt(k) + FLY, upAt(k) + FLY + 0.3) : 0;
        const y = rowY(i) + (1 - enter) * 40;
        return <div key={i} style={{ ...abs({ x: WIN_X + 14, y, w: rowW, h: LH }), opacity: appear * enter }}>
          {flag > 0 && <div style={{
            position: 'absolute', left: 6, top: 6, right: 6, bottom: 6, borderRadius: 18, background: '#fff',
            boxShadow: `0 ${12 * flag}px ${24 * flag}px rgba(0,0,0,${0.15 * flag})`, transform: `scale(${1 + 0.015 * flag})`,
          }} />}
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${flag * 6}px)` }}>
            {rowInner(f, flag > 0.5 ? S.accent : S.ink, S.muted, flag > 0.5 ? S.accent : S.ink)}
          </div>
          {ok > 0 && <div style={{ position: 'absolute', right: ROW_PAD, top: LH / 2 - NS * 0.5, width: NS, height: NS, borderRadius: NS, background: S.dark, transform: `scale(${ok})` }}>
            <svg width={NS} height={NS} viewBox="0 0 24 24"><path d="M6.5 12.5 L10.5 16.2 L17.5 8.3" stroke="#fff" strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>}
        </div>;
      })}

      {/* 仓库卡 */}
      <Surface box={{ ...REPO, y: REPO.y + (1 - side) * 30 }} style={{ opacity: side, transform: `scale(${bump})` }}>
        <div style={{ position: 'absolute', left: 48, top: 44, ...textBase(34, 500), color: S.muted }}>{c.repoLabel}</div>
        <div style={{ position: 'absolute', left: 48, top: 100, display: 'flex', alignItems: 'center', gap: 18 }}>
          <Icon folder size={50} color={S.ink} />
          <span style={{ ...textBase(repoNameFS, 600, S.mono), color: S.ink }}>{c.repoName}</span>
        </div>
        <div style={{ position: 'absolute', right: 48, bottom: 40, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ position: 'relative', width: CNT_W, height: 120, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, textAlign: 'center', ...textBase(110, 900), lineHeight: '120px', color: count > 0 ? S.accent : '#a3a3ab', transform: `translateY(${(1 - roll) * 80}px)`, opacity: roll }}>{count}</div>
            {roll < 1 && <div style={{ position: 'absolute', inset: 0, textAlign: 'center', ...textBase(110, 900), lineHeight: '120px', color: count - 1 > 0 ? S.accent : '#a3a3ab', transform: `translateY(${-roll * 80}px)`, opacity: 1 - roll }}>{Math.max(0, count - 1)}</div>}
          </div>
          <span style={{ ...textBase(36, 500), color: S.ink, paddingBottom: 21 }}>{c.unit}</span>
        </div>
      </Surface>

      {/* 不上传区 */}
      <Surface dark box={{ ...TRAY, y: TRAY.y + (1 - side) * 30 }} shadow={S.capsuleShadow} style={{ opacity: side }}>
        <div style={{ position: 'absolute', left: 40, top: 34, right: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...textBase(42, 900), color: '#fff' }}>{c.blockLabel}</span>
          <span style={{ ...textBase(36, 500), color: blockCount ? '#fff' : '#6c6c72' }}>{blockCount} {c.unit}</span>
        </div>
      </Surface>

      {/* 被拦下的行：整条滑进不上传区（同一个对象，缩成白色小条） */}
      {blocked.map((i, k) => {
        const v = q(t, blockAt(k), blockAt(k) + 0.62);
        if (v <= 0) return null;
        const f = files[i];
        const from: Box = { x: WIN_X + 14 + 6, y: rowY(i) + 6, w: rowW - 12, h: LH - 12 };
        const to: Box = { x: TRAY.x + 24, y: TRAY.y + TRAY_HEAD + k * (CHIP_H + CHIP_GAP), w: RW - 48, h: CHIP_H };
        // 先沿自己那一行横着滑出窗口，再落进不上传区（x 领先、y 滞后），途中不压别的行
        const vx = q(t, blockAt(k), blockAt(k) + 0.46), vy = q(t, blockAt(k) + 0.16, blockAt(k) + 0.62);
        const b = { x: mix(from.x, to.x, vx), y: mix(from.y, to.y, vy), w: mix(from.w, to.w, v), h: mix(from.h, to.h, v) };
        const s = mix(1, CHIP_S, v);
        return <div key={i} style={{ ...abs(b), zIndex: 600 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: mix(18, CHIP_H / 2, v), background: '#fff', boxShadow: `0 ${mix(12, 6, v)}px ${mix(24, 12, v)}px rgba(0,0,0,${mix(0.15, 0.22, v)})` }} />
          <div style={{ position: 'absolute', left: -6, top: (b.h - LH) / 2 - 0, width: rowW, height: LH, transform: `scale(${s})`, transformOrigin: `${ROW_PAD + 10}px 50%` }}>
            {rowInner(f, v < 0.6 ? S.accent : S.ink, S.muted, v < 0.6 ? S.accent : S.ink, mix(prevX, chipPrevX(f), v), chipNameOnly ? 1 - clamp(v * 2.5) : 1)}
          </div>
        </div>;
      })}

      {/* 其余行：复制一份飞进仓库卡的计数 */}
      {passed.map((i, k) => {
        const v = q(t, upAt(k), upAt(k) + FLY);
        if (v <= 0 || v >= 1) return null;
        const f = files[i];
        const x0 = WIN_X + 14 + nameX - NS * 0.2, y0 = rowY(i) + LH / 2;
        const w0 = textWidth(f.name, NS) * MONO + NS * 1.4;
        const cx = mix(x0 + w0 / 2, repoNumX, v);
        const cy = mix(y0, repoNumY, v) + Math.sin(Math.PI * v) * 70;   // 略向下兜一下，从标题下方进到计数
        const s = mix(1, 0.35, v);
        return <div key={i} style={{
          position: 'absolute', left: cx - w0 * s / 2, top: cy - LH * 0.8 * s / 2, width: w0 * s, height: LH * 0.8 * s, borderRadius: LH * 0.4 * s,
          background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 650,
          opacity: 1 - q(t, upAt(k) + FLY - 0.12, upAt(k) + FLY),
        }}>
          <span style={{ ...textBase(NS * s, 600, S.mono), lineHeight: 1, color: '#fff' }}>{f.name}</span>
        </div>;
      })}
    </Handoff>
    <Sfx name="whoosh-short" at={scanAt} />
    <Sfx name="slide" at={blockAt0} />
    <Sfx name="pop" at={upAt0} />
    <Sfx name="ding" at={doneAt} />
  </Frame>;
}
