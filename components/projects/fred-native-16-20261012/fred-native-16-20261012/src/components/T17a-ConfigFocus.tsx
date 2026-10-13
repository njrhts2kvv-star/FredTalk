// T17a 配置文件展示：真实感的配置文件里，关键行按顺序被“提起”点亮，其余行退后；密钥值当场被替换成圆点；
// 最后把最关键的一行从文件里拎出来，放大成黑胶囊落在画面中央。
// 关系：一整份配置 → 只需要看懂其中几行（密钥不外露）→ 收束到一行结论。
import React from 'react';
import { S, clamp, mix, p, q, textWidth } from '../kit/theme';
import { Box, Frame, MacWindow, Sfx, between, useT } from '../kit/ui';

export type ConfigFocusProps = {
  fileName: string;
  lines: string[];
  focusLines: number[];   // 0 起的行号，按出现顺序点亮
  maskKeys: string[];     // 键名正则（不区分大小写），匹配的值显示为圆点
  calloutLine: number;    // 最后放大成黑胶囊的行；-1 表示用最后一个非密钥焦点行
};

export const configFocusDefaults: ConfigFocusProps = {
  fileName: '.env',
  lines: [
    '# FredTalk 本地配置',
    'APP_NAME=fredtalk-site',
    'OPENAI_API_KEY=sk-proj-Fq8xN2vLr7TzW4',
    'MODEL=gpt-6.1-sol',
    'MAX_TOKENS=8000',
    'DOUBAO_API_KEY=ark-3c9e71d0b2a4',
    'OUTPUT_DIR=./out',
  ],
  focusLines: [2, 3, 5],
  maskKeys: ['API_KEY', 'SECRET', 'TOKEN$', 'PASSWORD'],
  calloutLine: -1,
};

const MONO_W = 0.6;
const DOT = '•';
type Parsed = { comment: boolean; indent: string; key: string; sep: string; value: string; raw: string };
const parse = (raw: string): Parsed => {
  if (/^\s*(#|\/\/|;)/.test(raw) || raw.trim() === '') return { comment: true, indent: '', key: '', sep: '', value: '', raw };
  const m = raw.match(/^(\s*)([A-Za-z0-9_.\-[\]]+)(\s*[=:]\s*)(.*)$/);
  if (!m) return { comment: false, indent: '', key: '', sep: '', value: raw, raw };
  return { comment: false, indent: m[1], key: m[2], sep: m[3], value: m[4], raw };
};

export function ConfigFocus(props: Partial<ConfigFocusProps>) {
  const c = { ...configFocusDefaults, ...props };
  const t = useT();
  const parsed = c.lines.map(parse);
  const masks = c.maskKeys.map((k) => { try { return new RegExp(k, 'i'); } catch { return new RegExp(k.replace(/[^A-Za-z0-9_]/g, ''), 'i'); } });
  const isSecret = (pl: Parsed) => !!pl.key && masks.some((r) => r.test(pl.key));
  const focus = c.focusLines.filter((i) => i >= 0 && i < c.lines.length);
  const k = focus.length;

  // 版式：字号按最长行与行数自适应，窗口在角标下方垂直居中
  const n = c.lines.length;
  const longest = Math.max(...c.lines.map((l) => textWidth(l, 1) * (MONO_W / 0.58)), 10);
  const GUTTER = 120, PAD_R = 90, MAX_W = 1640;
  const size = Math.min(52, (MAX_W - GUTTER - PAD_R) / longest, 720 / (n * 1.62));
  // 窗宽贴合内容（不留半屏空白），但不窄于 1100
  const WIN_W = clamp(GUTTER + longest * size + PAD_R, 1100, MAX_W);
  const LH = Math.round(size * 1.62);
  const BAR = 76;
  const winH = BAR + 56 + n * LH + 56;
  const WIN: Box = { x: (1920 - WIN_W) / 2, y: 140 + (900 - winH) / 2, w: WIN_W, h: winH };
  const rowY = (i: number) => 56 + i * LH;

  // 时间轴
  const enter = p(t, 0, 0.5);
  const first = 0.95, lastFocus = 3.05;
  const gap = k > 1 ? Math.min(0.8, (lastFocus - first) / (k - 1)) : 0;
  const focusAt = (j: number) => first + j * gap;
  const recede = p(t, first - 0.15, first + 0.3);
  const calloutIdx = c.calloutLine >= 0 && c.calloutLine < n ? c.calloutLine
    : ([...focus].reverse().find((i) => !isSecret(parsed[i])) ?? focus[k - 1] ?? 0);
  const calloutAt = (k ? focusAt(k - 1) : first) + 0.75;
  const lift = q(t, calloutAt, calloutAt + 0.6);

  // 密钥值从第一帧起就打码：真实画面里任何一帧露出凭证都不允许（平台安全规则）
  const maskedValue = (pl: Parsed, _i: number) => {
    if (!isSecret(pl)) return pl.value;
    return DOT.repeat(Math.min(10, Array.from(pl.value).length));
  };

  // 胶囊：从原行位置拎出，放大到画面中央
  const cp = parsed[calloutIdx];
  const cpValue = maskedValue(cp, calloutIdx);
  const cpKey = cp.key || '';
  const cpSep = cp.key ? ' = ' : '';
  const cpText = cp.key ? `${cpKey}${cpSep}${cpValue}` : cp.raw;
  const bigSize = Math.min(84, 1500 / Math.max(1, textWidth(cpText, 1) * (MONO_W / 0.58)));
  const pillH = bigSize * 2.1, pillW = textWidth(cpText, bigSize) * (MONO_W / 0.58) + pillH * 1.1;
  const fromBox: Box = { x: WIN.x + GUTTER - 24, y: WIN.y + BAR + rowY(calloutIdx) - 6, w: Math.min(WIN.w - GUTTER, textWidth(cp.raw, size) * (MONO_W / 0.58) + 60), h: LH + 12 };
  const toBox: Box = { x: 960 - pillW / 2, y: WIN.y + winH / 2 - pillH / 2 + 30, w: pillW, h: pillH };
  const pill = between(fromBox, toBox, lift);
  const pillFont = mix(size, bigSize, lift);

  const codeSpan = (pl: Parsed, i: number, current: boolean) => {
    if (pl.comment) return <span style={{ color: '#a3a3ab' }}>{pl.raw}</span>;
    if (!pl.key) return <span style={{ color: '#3a3a40' }}>{pl.raw}</span>;
    return <>
      <span>{pl.indent}</span>
      <span style={{ color: current ? S.accent : S.ink }}>{pl.key}</span>
      <span style={{ color: '#a3a3ab' }}>{pl.sep}</span>
      <span style={{ color: isSecret(pl) ? '#6c6c72' : '#3a3a40' }}>{maskedValue(pl, i)}</span>
    </>;
  };

  return <Frame>
    <MacWindow light box={{ ...WIN, y: WIN.y + (1 - enter) * 50 }} bar={BAR} title={c.fileName} style={{ opacity: enter }}>
      {c.lines.map((_, i) => {
        const j = focus.indexOf(i);
        const lit = j >= 0 ? p(t, focusAt(j), focusAt(j) + 0.35) : 0;
        const current = j >= 0 && t >= focusAt(j) && (j === k - 1 || t < focusAt(j + 1));
        // 当前焦点行“提起”为白色浮条，下一行接手后落回
        const raise = j >= 0 ? lit * (j === k - 1 ? 1 - q(t, calloutAt, calloutAt + 0.3) : 1 - p(t, focusAt(j + 1), focusAt(j + 1) + 0.3)) : 0;
        const opacity = j >= 0 ? mix(mix(1, 0.3, recede), 1, lit) : mix(1, 0.3, recede);
        const hidden = i === calloutIdx && lift > 0;
        return <React.Fragment key={i}>
          {raise > 0.001 && <div style={{
            position: 'absolute', left: 22, top: rowY(i) - 6, width: WIN.w - 44, height: LH + 12, borderRadius: 16, background: '#fff',
            boxShadow: `0 ${10 * raise}px ${22 * raise}px rgba(0,0,0,${0.13 * raise})`, transform: `scale(${1 + 0.012 * raise})`,
          }} />}
          <div style={{
            position: 'absolute', left: 0, width: GUTTER - 28, top: rowY(i), height: LH, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            fontFamily: S.mono, fontWeight: 600, fontSize: size * 0.82, color: current ? S.accent : '#c4c4ca', opacity: j >= 0 ? 1 : mix(1, 0.5, recede),
          }}>{i + 1}</div>
          <div style={{
            position: 'absolute', left: GUTTER, top: rowY(i), height: LH, display: 'flex', alignItems: 'center', whiteSpace: 'pre',
            fontFamily: S.mono, fontWeight: 600, fontSize: size, fontSynthesis: 'none', color: S.ink, opacity: hidden ? 0 : opacity,
          }}>{codeSpan(parsed[i], i, current)}</div>
        </React.Fragment>;
      })}
    </MacWindow>
    {/* 材料退后：胶囊接管时窗口白蒙 */}
    <div style={{ position: 'absolute', left: WIN.x - 40, top: WIN.y - 40, width: WIN.w + 80, height: winH + 80, background: '#fff', opacity: 0.74 * lift, borderRadius: 40 }} />
    {lift > 0 && <div style={{
      position: 'absolute', left: pill.x, top: pill.y, width: pill.w, height: pill.h, borderRadius: pill.h / 2,
      background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(lift * 12),
      whiteSpace: 'pre', fontFamily: S.mono, fontWeight: 600, fontSize: pillFont, fontSynthesis: 'none', lineHeight: 1,
    }}>
      {cp.key ? <><span style={{ color: '#fff' }}>{cpKey}</span><span style={{ color: '#8d8d93' }}>{cpSep}</span><span style={{ color: S.accentDark }}>{cpValue}</span></>
        : <span style={{ color: '#fff' }}>{cp.raw}</span>}
    </div>}
    {focus.map((_, j) => <Sfx key={j} name="pop" at={focusAt(j)} />)}
    <Sfx name="whoosh-short" at={calloutAt} />
  </Frame>;
}
