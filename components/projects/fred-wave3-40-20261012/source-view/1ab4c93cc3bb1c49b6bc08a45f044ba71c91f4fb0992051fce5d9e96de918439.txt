// T04f-KeyUnlock：一把钥匙解锁几件事
// 观众要看懂的变化：一把钥匙插入 → 几项能力依次从锁定变成可用
// 关系：左边钥匙胶囊（名字可配 Logo）滑进锁芯，转动；锁芯拉出连线，右边带锁的能力卡依次打开锁、
// 由灰变黑。一对多解锁，与 T09b（截图上单个状态切换）区分。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, accentOn, clamp, cueAt, mix, p, q, springAt, textWidth } from '../kit/theme';
import { Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

export type Ability = { label: string; sub?: string };
export type KeyUnlockProps = HandoffProps & {
  keyName: string;          // 钥匙上的名字
  logo?: string;            // public/ 下的真实 Logo（可省，省了就只有文字）
  abilities: Ability[];     // 2–4 项能力
  cues?: number[];          // [0]=钥匙开始转动 [1+i]=第 i 项解锁
};

export const keyUnlockDefaults: KeyUnlockProps = {
  keyName: 'GitHub CLI',
  abilities: [
    { label: '下载', sub: '把别人的项目拉下来' },
    { label: '上传', sub: '把改动推上去' },
    { label: '建仓库', sub: '新建一个项目文件夹' },
  ],
};

const CORE = { x: 760, y: 540, r: 98 };
const CARD_X = 1010, CARD_W = 800, GAP = 34;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, v: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((x, i) => Math.round(mix(x, B[i], v))).join(',')})`;
};

function Padlock({ size, open, body, shackle }: { size: number; open: number; body: string; shackle: string }) {
  // 锁：身体 + 锁梁（SVG 只用于锁）；打开 = 锁梁抬起并绕右脚转开
  return <svg width={size} height={size} viewBox="0 0 48 48">
    <g style={{ transform: `translate(${open * 3}px, ${-open * 7}px) rotate(${-open * 38}deg)`, transformOrigin: '34px 22px' }}>
      <path d="M14 22 V15 a10 10 0 0 1 20 0 V22" fill="none" stroke={shackle} strokeWidth={5} strokeLinecap="round" />
    </g>
    <rect x="7" y="21" width="34" height="23" rx="6" fill={body} />
    <circle cx="24" cy="31.5" r="3.2" fill={shackle === '#fff' ? S.dark : '#fff'} opacity={0.0} />
  </svg>;
}

export function KeyUnlock(props: Partial<KeyUnlockProps>) {
  const c = { ...keyUnlockDefaults, ...props };
  const t = useT();
  const items = c.abilities.slice(0, 4);
  const n = items.length;
  const enter = p(t, 0, 0.55);
  const turnAt = cueAt(c.cues, 0, 1.7);
  const unlockAt = items.map((_, i) => cueAt(c.cues, 1 + i, turnAt + 0.55 + i * 0.36));

  // ---------- 钥匙 ----------
  const nameSize = Math.min(58, 380 / Math.max(1, textWidth(c.keyName, 1) * 1.1));
  const logoW = c.logo ? 82 : 0;
  const headW = textWidth(c.keyName, nameSize) * 1.1 + nameSize * 1.8 + (c.logo ? logoW + 16 : 0);
  const headH = 120, shaftW = 190, shaftH = 30;
  const keyLen = headW + shaftW;
  const slide = p(t, 0.25, 1.25);
  const slideX = mix(-keyLen + 120, 0, slide);
  const tip = { x: CORE.x, y: CORE.y };
  const keyLeft = tip.x - keyLen + slideX + 8;   // 尖端稍微插进锁芯
  const turn = q(t, turnAt, turnAt + 0.5);
  const tilt = -7 * turn;                         // 钥匙随锁芯微微转一下

  // ---------- 卡 ----------
  const CH = Math.min(200, (820 - (n - 1) * GAP) / n);
  const y0 = (1080 - (n * CH + (n - 1) * GAP)) / 2;
  const cy = (i: number) => y0 + i * (CH + GAP) + CH / 2;
  const cardIn = (i: number) => p(t, 0.12 + i * 0.1, 0.7 + i * 0.1);

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      {/* 连线：锁芯 → 各卡 */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: enter }}>
        {items.map((_, i) => {
          const d = p(t, unlockAt[i] - 0.35, unlockAt[i] + 0.02);
          const done = q(t, unlockAt[i], unlockAt[i] + 0.4);
          return <path key={i} d={`M ${CORE.x + CORE.r - 4} ${CORE.y} H ${CORE.x + CORE.r + 70} V ${cy(i)} H ${CARD_X - 6}`} pathLength={1} fill="none"
            stroke={mixHex('#a3a3ab', '#19191c', done)} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - d} opacity={d > 0 ? 1 : 0} />;
        })}
      </svg>

      {/* 锁芯 */}
      <div style={{ position: 'absolute', left: CORE.x - CORE.r, top: CORE.y - CORE.r + (1 - enter) * 30, width: CORE.r * 2, height: CORE.r * 2, borderRadius: CORE.r, background: '#fff', boxShadow: S.shadow, opacity: enter }}>
        <div style={{ position: 'absolute', inset: 14, borderRadius: CORE.r, background: '#f2f2f5', transform: `rotate(${turn * 90}deg)` }}>
          <div style={{ position: 'absolute', left: '50%', top: 8, width: 12, height: 34, marginLeft: -6, borderRadius: 6, background: accentOn(false) }} />
        </div>
        <div style={{ position: 'absolute', left: CORE.r - 24, top: CORE.r - 24, width: 48, height: 48, borderRadius: 24, background: S.dark }} />
      </div>

      {/* 钥匙：头（胶囊 + 名字）+ 杆 + 齿 */}
      <div style={{
        position: 'absolute', left: keyLeft, top: tip.y - headH / 2, width: keyLen, height: headH, opacity: enter * clamp(slide * 5),
        transformOrigin: `${keyLen}px ${headH / 2}px`, transform: `rotate(${tilt}deg)`, zIndex: 20,
      }}>
        <div style={{ position: 'absolute', left: headW - 12, top: headH / 2 - shaftH / 2, width: shaftW + 12, height: shaftH, borderRadius: shaftH / 2, background: S.dark, boxShadow: S.capsuleShadow }} />
        {[shaftW - 70, shaftW - 130].map((x, i) => <div key={i} style={{ position: 'absolute', left: headW + x, top: headH / 2 + shaftH / 2 - 4, width: 28, height: 42 - i * 6, borderRadius: '0 0 8px 8px', background: S.dark }} />)}
        <div style={{ position: 'absolute', left: 0, top: 0, width: headW, height: headH, borderRadius: headH / 2, background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          {c.logo && <Img src={staticFile(c.logo)} style={{ width: logoW, height: logoW, borderRadius: logoW / 2, background: '#fff', objectFit: 'contain' }} />}
          <span style={{ ...textBase(nameSize, 400, S.display), color: '#fff' }}>{c.keyName}</span>
        </div>
      </div>

      {/* 能力卡 */}
      {items.map((it, i) => {
        const u = q(t, unlockAt[i], unlockAt[i] + 0.4);
        const uT = clamp((u - 0.25) * 2.4);   // 字和锁比底色先翻，避免中间态对比过低
        const pop = springAt(t, unlockAt[i], 0.6);
        const open = springAt(t, unlockAt[i] + 0.05, 0.55);
        const lSize = Math.min(78, (CARD_W - 230) / Math.max(1, textWidth(it.label, 1) * 1.05));
        const sSize = it.sub ? Math.min(36, (CARD_W - 230) / Math.max(1, textWidth(it.sub, 1) * 1.05)) : 0;
        const ci = cardIn(i);
        const sc = 1 + 0.035 * Math.sin(Math.PI * clamp(pop > 0 ? (t - unlockAt[i]) / 0.5 : 0));
        return <div key={i} style={{
          position: 'absolute', left: CARD_X, top: cy(i) - CH / 2 + (1 - ci) * 40, width: CARD_W, height: CH, borderRadius: S.radius,
          background: mixHex('#ececef', '#19191c', u), boxShadow: u > 0.5 ? S.capsuleShadow : '0 8px 14px 0 rgba(0,0,0,0.07)', opacity: ci, transform: `scale(${sc})`,
        }}>
          <div style={{ position: 'absolute', left: 44, top: CH / 2 - 36 }}>
            <Padlock size={72} open={open} body={mixHex('#a3a3ab', '#D6BEFF', uT)} shackle={mixHex('#a3a3ab', '#D6BEFF', uT)} />
          </div>
          <div style={{ position: 'absolute', left: 156, top: it.sub ? CH / 2 - lSize * 0.95 : CH / 2 - lSize * 0.58, ...textBase(lSize, 900), color: mixHex('#a3a3ab', '#ffffff', uT) }}>{it.label}</div>
          {it.sub && <div style={{ position: 'absolute', left: 156, top: CH / 2 + lSize * 0.3, ...textBase(sSize, 500), color: mixHex('#a3a3ab', '#c9c9cf', uT) }}>{it.sub}</div>}
        </div>;
      })}
    </Handoff>
    <Sfx name="pop" at={0.2} />
    <Sfx name="woosh" at={0.3} />
    <Sfx name="click" at={turnAt} />
    {unlockAt.map((a, i) => <Sfx key={i} name={i === n - 1 ? 'ding' : 'pop'} at={a} />)}
  </Frame>;
}
