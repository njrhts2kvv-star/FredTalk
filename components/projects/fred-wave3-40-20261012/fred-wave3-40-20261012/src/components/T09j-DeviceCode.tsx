// T09j-DeviceCode：验证码从一个窗口交给另一个
// 观众要看懂的变化：终端里出现一次性验证码 → 码飞进浏览器输入格逐格填好 → 授权成功
// 关系：左黑窗（MacWindow 深色）打出 gh auth login 和一次性码；码从终端原位“拎起”成胶囊，飞到右侧浏览器卡
// 的输入格上方，一个字符一个字符落进格里；按钮按下，同一个按钮变成“已授权”状态胶囊，终端同步落一行完成。
// 浏览器卡是干净重建（白卡 + 标题 Device Activation），不含任何账号信息；示例码不是真实码。
import React from 'react';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth, typed } from '../kit/theme';
import { ClickRing, Cursor, Frame, Handoff, HandoffProps, MacWindow, Sfx, between, center, textBase, useT } from '../kit/ui';

export type DeviceCodeProps = HandoffProps & {
  command: string;        // 终端里打出的命令
  hint: string;           // 命令后的提示行
  code: string;           // 一次性示例码，如 A1B2-C3D4（4–10 位，可含一个 -）
  footer: string;         // 提示码之后的一行
  doneLine: string;       // 授权成功后终端落下的一行
  url: string;            // 浏览器地址栏
  pageTitle: string;      // 浏览器卡标题
  pageSub: string;        // 标题下的说明
  button: string;         // 按钮文字
  status: string;         // 授权成功后的状态
  cues?: number[];        // [0]=码从终端拎起 [1]=按下按钮
};

export const deviceCodeDefaults: DeviceCodeProps = {
  command: 'gh auth login',
  hint: '! First copy your one-time code:',
  code: 'A1B2-C3D4',
  footer: 'Press Enter to open github.com',
  doneLine: '✓ Authentication complete',
  url: 'github.com/login/device',
  pageTitle: 'Device Activation',
  pageSub: 'Enter the code displayed on your device',
  button: 'Continue',
  status: '已授权',
};

const TERM = { x: 90, y: 170, w: 820, h: 680 };
const WEB = { x: 1000, y: 170, w: 830, h: 680 };
const BAR = 90;
const MONO_W = 0.6;   // Source Code Pro 字宽比

export function DeviceCode(props: Partial<DeviceCodeProps>) {
  const c = { ...deviceCodeDefaults, ...props };
  const t = useT();
  const enter = p(t, 0, 0.5);

  const chars = Array.from(c.code.replace(/-/g, ''));
  const groupAt = c.code.includes('-') ? c.code.indexOf('-') : -1;   // 第一组位数
  const n = chars.length;

  const liftAt = cueAt(c.cues, 0, 2.1);
  const flyDur = 0.8;
  const fillAt = liftAt + flyDur;
  const STEP = 0.15;
  const fillEnd = fillAt + n * STEP;
  const pressAt = cueAt(c.cues, 1, fillEnd + 0.55);
  const authAt = pressAt + 0.35;

  // ---------- 终端 ----------
  const PAD = 50;
  const cmdSize = Math.min(44, (TERM.w - PAD * 2) / Math.max(1, textWidth('$ ' + c.command, 1) * MONO_W / 0.58 + 1));
  const lineSize = (s: string) => Math.min(34, (TERM.w - PAD * 2) / Math.max(1, Array.from(s).length * MONO_W));
  const codeSize = Math.min(78, (TERM.w - PAD * 2 - 60) / Math.max(1, Array.from(c.code).length * MONO_W));
  const typeEnd = 0.35 + Array.from(c.command).length * 0.07;
  const hintAt = typeEnd + 0.2, hintEnd = hintAt + Math.min(0.5, Array.from(c.hint).length * 0.016);
  const codeAt = hintEnd + 0.15;
  const codeIn = springAt(t, codeAt, 0.5);
  const footerIn = p(t, codeAt + 0.3, codeAt + 0.7);
  const doneAt = authAt + 0.25;
  const doneIn = p(t, doneAt, doneAt + 0.5);

  const codeLineY = TERM.y + BAR + 250;                // 码文字行顶
  const codeW = Array.from(c.code).length * codeSize * MONO_W;
  const capsuleFrom = { x: TERM.x + PAD - 28, y: codeLineY - 18, w: codeW + 56, h: codeSize * 1.16 + 36 };

  // ---------- 浏览器 ----------
  const CELL_H = 96, GROUP_GAP = 38, CGAP = 10;
  const usable = WEB.w - 130;
  const gapsTotal = (n - 1) * CGAP + (groupAt > 0 && groupAt < n ? GROUP_GAP - CGAP : 0);
  const CELL_W = Math.min(84, (usable - gapsTotal) / n);
  const rowW = n * CELL_W + gapsTotal;
  const rowX = WEB.x + (WEB.w - rowW) / 2;
  const rowY = WEB.y + BAR + 300;
  const cellX = (i: number) => rowX + i * (CELL_W + CGAP) + (groupAt > 0 && i >= groupAt ? GROUP_GAP - CGAP : 0);
  const cellFont = Math.min(60, CELL_W * 0.78);

  // 胶囊：原位 → 飞到输入格上方 → 一个字符落一格 → 空胶囊淡出
  const fly = q(t, liftAt, fillAt);
  const hover: { x: number; y: number; w: number; h: number } = (() => {
    const w = codeW * 0.78 + 56 * 0.78, h = capsuleFrom.h * 0.78;
    return { x: rowX + rowW / 2 - w / 2, y: rowY - h - 36, w, h };
  })();
  const box = between(capsuleFrom, hover, fly);
  const arc = -60 * Math.sin(Math.PI * fly);
  const capScale = box.w / capsuleFrom.w;
  const capAlpha = clamp((t - liftAt) * 12) * (1 - q(t, fillEnd - 0.05, fillEnd + 0.3));
  const dropped = (i: number) => p(t, fillAt + i * STEP, fillAt + i * STEP + 0.3);
  const lifted = p(t, liftAt - 0.02, liftAt + 0.15);   // 终端里的码文字让位给胶囊

  // 按钮 → 状态胶囊（同一个对象变形）
  const BTN = { w: 540, h: 96 };
  const btnX = WEB.x + (WEB.w - BTN.w) / 2, btnY = WEB.y + BAR + 450;
  const auth = q(t, authAt, authAt + 0.55);
  const statusSize = Math.min(48, 300 / Math.max(1, textWidth(c.status, 1)));
  const stW = textWidth(c.status, statusSize) + statusSize * 2.4 + 50;
  const bw = mix(BTN.w, stW, auth);
  const bump = 1 + 0.07 * Math.sin(Math.PI * clamp((t - authAt - 0.3) / 0.4));
  const press = clamp(1 - Math.abs(t - pressAt - 0.06) / 0.1);
  const check = p(t, authAt + 0.3, authAt + 0.7);
  const btnIn = p(t, 0.3, 0.8);

  // 光标
  const target = { x: btnX + BTN.w * 0.62, y: btnY + BTN.h * 0.62 };
  const g = p(t, pressAt - 1.0, pressAt - 0.08);
  const cx = mix(1560, target.x, g), cy = mix(960, target.y, g);
  const cursorA = clamp((t - (pressAt - 1.0)) * 6) * (1 - q(t, authAt + 0.1, authAt + 0.4));

  const mono = (size: number, color: string): React.CSSProperties => ({ ...textBase(size, 600, S.mono), color, letterSpacing: 0, whiteSpace: 'pre' });

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 终端 */}
      <MacWindow box={{ ...TERM, y: TERM.y + (1 - enter) * 40 }} bar={BAR} style={{ opacity: enter }} title="zsh">
        <div style={{ position: 'absolute', left: PAD, top: 52, ...mono(cmdSize, '#fff') }}>
          <span style={{ color: S.accentDark }}>$ </span>{typed(c.command, t, 0.35, typeEnd)}
          {t < typeEnd + 0.1 && <span style={{ display: 'inline-block', width: cmdSize * 0.5, height: cmdSize * 0.95, background: '#fff', verticalAlign: 'text-bottom', marginLeft: 4, opacity: Math.floor(t * 3) % 2 }} />}
        </div>
        <div style={{ position: 'absolute', left: PAD, top: 160, ...mono(lineSize(c.hint), '#c9c9cf') }}>{typed(c.hint, t, hintAt, hintEnd)}</div>
        <div style={{ position: 'absolute', left: PAD, top: 250, ...mono(codeSize, S.accentDark), opacity: codeIn * (1 - lifted * 0.65), transform: `scale(${mix(0.9, 1, codeIn)})`, transformOrigin: '0 50%' }}>{c.code}</div>
        <div style={{ position: 'absolute', left: PAD, top: 400, ...mono(lineSize(c.footer), '#c9c9cf'), opacity: footerIn }}>{c.footer}</div>
        <div style={{ position: 'absolute', left: PAD, top: 480, ...mono(lineSize(c.doneLine), S.accentDark), opacity: doneIn, transform: `translateY(${(1 - doneIn) * 14}px)` }}>{c.doneLine}</div>
      </MacWindow>

      {/* 浏览器卡：干净重建 */}
      <MacWindow light box={{ ...WEB, y: WEB.y + (1 - enter) * 40 }} bar={BAR} style={{ opacity: enter }} title={c.url.length > 34 ? c.url.slice(0, 33) + '…' : c.url}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', ...textBase(Math.min(62, (WEB.w - 100) / Math.max(1, textWidth(c.pageTitle, 1) * 1.1)), 900), color: S.ink }}>{c.pageTitle}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 122, textAlign: 'center', ...textBase(Math.min(32, (WEB.w - 100) / Math.max(1, textWidth(c.pageSub, 1) * 1.1)), 500), color: S.muted }}>{c.pageSub}</div>
      </MacWindow>

      {/* 输入格 */}
      {chars.map((ch, i) => {
        const d = dropped(i);
        const active = t >= fillAt + i * STEP - 0.02 && t < fillAt + (i + 1) * STEP - 0.02 ? 1 : 0;
        const y = rowY + (1 - enter) * 40;
        return <React.Fragment key={i}>
          <div style={{ position: 'absolute', left: cellX(i), top: y, width: CELL_W, height: CELL_H, borderRadius: 16, background: '#f2f2f5', opacity: enter, ...center }}>
            <span style={{ ...textBase(cellFont, 600, S.mono), color: S.ink, opacity: d, transform: `translateY(${(1 - d) * -50}px) scale(${mix(1.25, 1, d)})` }}>{ch}</span>
          </div>
          <div style={{ position: 'absolute', left: cellX(i) + 8, top: y + CELL_H - 6, width: CELL_W - 16, height: 6, borderRadius: 3, background: accentOn(false), opacity: active * enter }} />
        </React.Fragment>;
      })}

      {/* 按钮 → 已授权 */}
      <div style={{
        position: 'absolute', left: btnX + (BTN.w - bw) / 2, top: btnY + (1 - btnIn) * 20, width: bw, height: BTN.h, borderRadius: BTN.h / 2, background: S.dark, boxShadow: S.capsuleShadow,
        opacity: btnIn * enter, transform: `scale(${(1 - 0.04 * press) * bump})`, overflow: 'hidden', zIndex: 20,
      }}>
        <div style={{ position: 'absolute', inset: 0, ...center, opacity: 1 - clamp(auth * 2.5) }}>
          <span style={{ ...textBase(42, 900), color: '#fff' }}>{c.button}</span></div>
        <div style={{ position: 'absolute', inset: 0, ...center, gap: 18, opacity: clamp((auth - 0.45) * 2.2), transform: `translateY(${(1 - clamp((auth - 0.45) * 2.2)) * 14}px)` }}>
          <svg width={statusSize * 0.95} height={statusSize * 0.95} viewBox="0 0 24 24">
            <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={S.accentDark} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={26} strokeDashoffset={26 * (1 - check)} />
          </svg>
          <span style={{ ...textBase(statusSize, 900), color: S.accentDark }}>{c.status}</span>
        </div>
      </div>

      {/* 码胶囊：从终端原位拎起，飞到输入格上方，字符逐个落进格里 */}
      {capAlpha > 0.001 && <div style={{
        position: 'absolute', left: box.x, top: box.y + arc, width: capsuleFrom.w, height: capsuleFrom.h, transform: `scale(${box.w / capsuleFrom.w})`, transformOrigin: '0 0',
        borderRadius: capsuleFrom.h / 2, background: '#fff', boxShadow: S.capsuleShadow, opacity: capAlpha, zIndex: 40, ...center,
      }}>
        <div style={{ display: 'flex', ...mono(codeSize, S.ink) }}>
          {(() => { let k = 0; return Array.from(c.code).map((ch, idx) => {
            const isDash = ch === '-';
            const o = isDash ? 1 - dropped(Math.max(0, k - 1)) * 0 : 1 - dropped(k++);
            return <span key={idx} style={{ opacity: isDash ? 1 : o, width: codeSize * MONO_W, textAlign: 'center' }}>{ch}</span>;
          }); })()}
        </div>
      </div>}

      <ClickRing x={target.x} y={target.y} t={t} at={pressAt} dark={false} />
      {cursorA > 0 && <Cursor x={cx - 6} y={cy - 4} scale={1.1} press={press} style={{ opacity: cursorA }} />}
    </Handoff>
    <Sfx name="woosh" at={liftAt} />
    <Sfx name="typing" at={fillAt} duration={Math.round(n * STEP * 60) + 6} volume={0.4} />
    <Sfx name="click" at={pressAt} />
    <Sfx name="ding" at={authAt + 0.2} />
  </Frame>;
}
