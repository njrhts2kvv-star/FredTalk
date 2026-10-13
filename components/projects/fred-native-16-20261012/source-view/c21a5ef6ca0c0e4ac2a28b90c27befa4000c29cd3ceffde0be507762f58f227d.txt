// T09d 发任务看运行：真实 Codex 界面退后，输入框从原位提起，逐字写下任务并发送；
// 下方步骤一条条接入，每条从“运行中”（胶囊内进度推进）切到“完成”，最后一条落定时叮一声。
// 关系：同一个任务，从“输入框里的一句话”变成“一串依次完成的步骤”。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, mix, p, q, textWidth, typed } from '../kit/theme';
import { Box, Frame, Sfx, textBase, useT } from '../kit/ui';

export type TaskRunStatusProps = {
  image: string;                       // 背景真实界面截图
  imageSize: { w: number; h: number };
  inputBox: { x: number; y: number; w: number; h: number }; // 截图里输入框位置（源像素）——提起的起点
  placeholder: string;
  prompt: string;
  steps: string[];                     // 2–5 条
  runningLabel: string;
  doneLabel: string;
};

export const taskRunStatusDefaults: TaskRunStatusProps = {
  image: 'media/a-codex-full.png',
  imageSize: { w: 3024, h: 1712 },
  inputBox: { x: 1066, y: 1476, w: 1471, h: 196 },
  placeholder: '随心输入',
  prompt: '把这期口播整理成分镜和字幕',
  steps: ['读取逐字稿和录音', '按句切分镜头', '生成字幕并对齐时间'],
  runningLabel: '运行中',
  doneLabel: '完成',
};

const FULL: Box = { x: 60, y: 33.222106, w: 1800, h: 1013.555787 };
const CARD_W = 1400, CARD_H = 216, CARD_X = 260;
const AREA_TOP = 140, AREA_BOTTOM = 1030, CARD_GAP = 64;

function SendButton({ size, press }: { size: number; press: number }) {
  return <div style={{
    width: size, height: size, borderRadius: size / 2, background: S.dark, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transform: `scale(${1 - 0.12 * press})`,
  }}>
    <svg width={size * 0.44} height={size * 0.44} viewBox="0 0 24 24">
      <path d="M12 20 V5 M5.5 11 L12 4.5 L18.5 11" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>;
}

export function TaskRunStatus(props: Partial<TaskRunStatusProps>) {
  const c = { ...taskRunStatusDefaults, ...props };
  const steps = (c.steps.length ? c.steps : taskRunStatusDefaults.steps).slice(0, 5);
  const t = useT();

  // 时间轴：背景退后 + 输入框提起 → 打字 → 发送 → 步骤按节奏接入/完成
  const recede = q(t, 0.12, 0.8);
  const lift = p(t, 0.22, 0.95);
  const chars = Array.from(c.prompt).length;
  const typeStart = 0.95, typeEnd = typeStart + Math.min(1.15, chars * 0.07);
  const sendAt = typeEnd + 0.22;
  const RUN = 0.75, lastDone = 4.3;
  const firstAppear = sendAt + 0.25;
  const gap = steps.length > 1 ? Math.max(0.3, (lastDone - RUN - firstAppear) / (steps.length - 1)) : 0;
  const appearAt = (i: number) => firstAppear + i * gap;
  const doneAt = (i: number) => appearAt(i) + RUN;

  // 步骤行尺寸随条数自适应；输入框＋步骤整组在角标下方的区域内垂直居中
  const n = steps.length;
  const rowGap = n > 3 ? 22 : 30;
  const rowH = Math.min(128, (AREA_BOTTOM - AREA_TOP - CARD_H - CARD_GAP - rowGap * (n - 1)) / n);
  const groupH = CARD_H + CARD_GAP + n * rowH + (n - 1) * rowGap;
  const CARD: Box = { x: CARD_X, y: AREA_TOP + (AREA_BOTTOM - AREA_TOP - groupH) / 2, w: CARD_W, h: CARD_H };
  const ROWS_TOP = CARD.y + CARD_H + CARD_GAP;
  // 输入框：从截图原位（统一缩放）提到上方
  const k = Math.max(FULL.w / c.imageSize.w, FULL.h / c.imageSize.h);
  const ox = FULL.x + (FULL.w - c.imageSize.w * k) / 2, oy = FULL.y + (FULL.h - c.imageSize.h * k) / 2;
  const origin = { x: ox + c.inputBox.x * k, y: oy + c.inputBox.y * k, w: c.inputBox.w * k, h: c.inputBox.h * k };
  const s0 = origin.w / CARD.w;
  const sc = mix(s0, 1, lift);
  const tx = mix(origin.x, CARD.x, lift), ty = mix(origin.y + (origin.h - CARD.h * s0) / 2, CARD.y, lift);
  const pressSend = clamp(1 - Math.abs(t - sendAt - 0.05) / 0.1);

  // 输入文字自适应：单行放不下就缩字号
  const PROMPT_W = CARD_W - 64 - 180;
  const promptSize = Math.min(56, PROMPT_W / Math.max(1, textWidth(c.prompt, 1)));
  const shown = typed(c.prompt, t, typeStart, typeEnd);
  const caretOn = t >= typeStart - 0.3 && t < sendAt;

  const statusW = Math.max(textWidth(c.runningLabel, rowH * 0.36), textWidth(c.doneLabel, rowH * 0.42)) + 40;
  const labelMax = CARD.w - rowH * 0.6 - statusW - 60;
  const longest = steps.reduce((m, s) => Math.max(m, textWidth(s, 1)), 1);
  const labelSize = Math.min(rowH * 0.42, labelMax / longest);

  return <Frame>
    {/* 真实界面：失焦 + 白蒙退后，作为“在哪里发任务”的上下文 */}
    <div style={{
      position: 'absolute', left: FULL.x, top: FULL.y, width: FULL.w, height: FULL.h, borderRadius: S.radius, overflow: 'hidden', boxShadow: S.shadow,
      transform: `scale(${mix(1, 1.04, recede)})`,
    }}>
      <Img src={staticFile(c.image)} style={{ position: 'absolute', left: ox - FULL.x, top: oy - FULL.y, width: c.imageSize.w * k, height: c.imageSize.h * k, filter: `blur(${16 * recede}px)` }} />
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.6 * recede }} />
    </div>

    {/* 提起的输入框（白卡、软阴影随提起加深） */}
    <div style={{
      position: 'absolute', left: 0, top: 0, width: CARD.w, height: CARD.h, borderRadius: 36, background: '#fff',
      boxShadow: `0 ${mix(2, 22, lift)}px ${mix(8, 44, lift)}px rgba(0,0,0,${mix(0.04, 0.16, lift)})`,
      transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${sc})`, zIndex: 50,
    }}>
      <div style={{ position: 'absolute', left: 64, top: 0, height: CARD.h, display: 'flex', alignItems: 'center', ...textBase(promptSize, 500), color: shown ? S.ink : '#b4b4bb' }}>
        {caretOn && <span style={{ display: 'inline-block', width: 4, height: promptSize * 1.1, background: S.ink, marginRight: shown ? 0 : 6, order: shown ? 2 : 0 }} />}
        <span style={{ order: 1 }}>{shown || c.placeholder}</span>
      </div>
      <div style={{ position: 'absolute', right: 44, top: (CARD.h - 104) / 2 }}>
        <SendButton size={104} press={pressSend} />
      </div>
    </div>

    {/* 步骤：黑胶囊逐条接入，内部进度条推进 → 完成 */}
    {steps.map((label, i) => {
      const a = appearAt(i), d = doneAt(i);
      const enter = p(t, a, a + 0.38);
      if (enter <= 0) return null;
      const done = p(t, d, d + 0.3);
      const y = ROWS_TOP + i * (rowH + rowGap);
      // 运行进度：先快后慢推进到 86%，完成时补满再淡出
      const run = clamp((t - a - 0.12) / (RUN - 0.12));
      const fill = mix(0.86 * (1 - Math.pow(1 - run, 2)), 1, done);
      const fillAlpha = 1 - p(t, d + 0.1, d + 0.5);
      const shimmerX = ((t - a) * 1.6) % 1;
      return <div key={i} style={{
        position: 'absolute', left: CARD.x, top: y + (1 - enter) * 34, width: CARD.w, height: rowH, borderRadius: rowH / 2,
        background: S.dark, boxShadow: S.capsuleShadow, overflow: 'hidden', opacity: enter,
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: '#2e2e34', opacity: fillAlpha, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: 220, left: `${shimmerX * 120 - 20}%`,
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.09), rgba(255,255,255,0))', opacity: 1 - done,
          }} />
        </div>
        <div style={{ position: 'absolute', left: rowH * 0.5, top: 0, height: rowH, display: 'flex', alignItems: 'center', ...textBase(labelSize, 900), color: '#fff' }}>{label}</div>
        <div style={{ position: 'absolute', right: rowH * 0.42, top: 0, height: rowH, width: statusW, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ ...textBase(rowH * 0.36, 500), color: '#a3a3ab', position: 'absolute', right: 0, opacity: 1 - done }}>{c.runningLabel}</span>
          <span style={{ ...textBase(rowH * 0.42, 900), color: S.accentDark, position: 'absolute', right: 0, opacity: done, transform: `translateY(${(1 - done) * 14}px)` }}>{c.doneLabel}</span>
        </div>
      </div>;
    })}

    <Sfx name="slide" at={0.22} />
    <Sfx name="typing" at={typeStart} duration={Math.round((typeEnd - typeStart) * 60) + 6} volume={0.4} />
    <Sfx name="click" at={sendAt} />
    {steps.map((_, i) => <Sfx key={i} name="pop" at={appearAt(i)} />)}
    <Sfx name="ding" at={doneAt(n - 1)} />
  </Frame>;
}
