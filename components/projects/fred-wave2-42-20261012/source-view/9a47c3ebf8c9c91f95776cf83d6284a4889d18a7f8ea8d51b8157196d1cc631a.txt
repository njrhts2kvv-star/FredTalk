// T09c-FormFill：参数填写：表单逐项填入，关键值点亮
// 观众要看懂的变化：空表单 → 按顺序填好，关键参数被点亮
// 关系：同一张真实表单截图。开场时各项取值被白色前景层盖住（空表单），相机推近到整张表单，
// 各项依次“填入”（文字项逐字擦出 + 光标，选择项点下后显出），旁边落下黑胶囊写明“参数 值”；
// 最后相机推近关键参数，紫框点亮、胶囊里的值变紫。坐标全部是源图像素，换截图只改 props。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { S, clamp, cueAt, mix, p, q, quintic, textWidth } from '../kit/theme';
import { Box, ClickRing, Frame, Handoff, HandoffProps, Sfx, textBase, useT } from '../kit/ui';

type Rect = { x: number; y: number; w: number; h: number };
export type FormField = {
  label: string;           // 参数名（中文，写在胶囊里）
  value: string;           // 填入的值
  kind: 'type' | 'pick';   // type = 输入框逐字填入；pick = 点选一项
  area: Rect;              // 源图里“值”所在区域：开场被盖住，填入时显出
  mark?: Rect;             // pick：被选中的那一项（点击位置、点亮时的紫框）；type：省略则用 area
  tag: { x: number; y: number; align?: 'left' | 'center' | 'right' }; // 胶囊锚点（源图像素，胶囊垂直居中于此点）
};
export type FormFillProps = HandoffProps & {
  image: string;                         // public/ 下的真实表单截图
  imageSize: { w: number; h: number };
  form: Rect;                            // 整张表单的范围（相机先推到这里）
  fields: FormField[];                   // 按填写顺序，1–4 项
  keyIndex: number;                      // 关键参数是第几项（点亮、推近）
  cues?: number[];                       // [0..n-1]=每项填入；[n]=关键参数点亮
};

export const formFillDefaults: FormFillProps = {
  image: 'media/m-form-dot-name.png',
  imageSize: { w: 1920, h: 1080 },
  form: { x: 307, y: 124, w: 1257, h: 755 },
  fields: [
    { label: '名字', value: 'Fred', kind: 'type', area: { x: 1246, y: 224, w: 134, h: 68 }, tag: { x: 1313, y: 345, align: 'center' } },
    { label: '颜色', value: '粉紫', kind: 'pick', area: { x: 350, y: 270, w: 712, h: 140 }, mark: { x: 747, y: 277, w: 126, h: 125 }, tag: { x: 455, y: 234 } },
    { label: '形象', value: '猫头鹰', kind: 'pick', area: { x: 350, y: 698, w: 712, h: 120 }, mark: { x: 896, y: 704, w: 96, h: 108 }, tag: { x: 470, y: 652 } },
  ],
  keyIndex: 1,
};

const FULL: Box = { x: 60, y: 33.222106, w: 1800, h: 1013.555787 };
type Cam = { fx: number; fy: number; z: number };
const lerpCam = (a: Cam, b: Cam, v: number): Cam => ({ fx: mix(a.fx, b.fx, v), fy: mix(a.fy, b.fy, v), z: mix(a.z, b.z, v) });

export function FormFill(props: Partial<FormFillProps>) {
  const c = { ...formFillDefaults, ...props };
  const fields = (c.fields.length ? c.fields : formFillDefaults.fields).slice(0, 4);
  const n = fields.length;
  const keyI = clamp(Math.round(c.keyIndex), 0, n - 1);
  const t = useT();

  // 源图 → 舞台（cover，居中裁切）
  const k = Math.max(FULL.w / c.imageSize.w, FULL.h / c.imageSize.h);
  const ox = FULL.x + (FULL.w - c.imageSize.w * k) / 2, oy = FULL.y + (FULL.h - c.imageSize.h * k) / 2;
  const W = (r: Rect): Box => ({ x: ox + r.x * k, y: oy + r.y * k, w: r.w * k, h: r.h * k });

  // 时间：推到表单 → 各项依次填入（默认间隔不等）→ 推近关键参数并点亮
  const defaultFill = [0.95, 1.5, 2.0, 2.5];
  const fillAt = (i: number) => cueAt(c.cues, i, defaultFill[i] ?? 1.0 + i * 0.56);
  const lastFill = fillAt(n - 1);
  const keyAt = cueAt(c.cues, n, Math.max(lastFill + 1.5, 3.4));
  const typeDur = (s: string) => Math.min(0.75, 0.12 + Array.from(s).length * 0.09);

  // 相机：home → 整张表单（读得清）→ 关键参数
  const camFor = (b: Box, zMax: number): Cam => {
    const z = Math.min(zMax, 1720 / b.w, 900 / b.h);
    const hx = 960 / z, hy = 540 / z;
    const fx = hx * 2 >= FULL.w ? FULL.x + FULL.w / 2 : clamp(b.x + b.w / 2, FULL.x + hx * 0.92, FULL.x + FULL.w - hx * 0.92);
    const fy = hy * 2 >= FULL.h ? FULL.y + FULL.h / 2 : clamp(b.y + b.h / 2, FULL.y + hy * 0.92, FULL.y + FULL.h - hy * 0.92);
    return { z, fx, fy };
  };
  const home: Cam = { fx: 960, fy: 540, z: 1 };
  const formCam = camFor(W(c.form), 1.7);
  const keyField = fields[keyI];
  const keyMark = W(keyField.mark ?? keyField.area);
  const keyArea = W(keyField.area);
  // 关键参数：推近到“值所在区域 + 胶囊”都在画面内
  const tagW = (f: FormField) => W({ x: f.tag.x, y: f.tag.y, w: 0, h: 0 });
  const kt = tagW(keyField);
  const keyBox: Box = (() => {
    const x0 = Math.min(keyArea.x, kt.x - 60), x1 = Math.max(keyArea.x + keyArea.w, kt.x + 60);
    const y0 = Math.min(keyArea.y, kt.y - 40), y1 = Math.max(keyArea.y + keyArea.h, kt.y + 40);
    return { x: x0 - 40, y: y0 - 30, w: x1 - x0 + 80, h: y1 - y0 + 60 };
  })();
  const keyCam = camFor(keyBox, 2.4);
  const m1 = quintic(t, 0.22, 0.82);
  const m2 = quintic(t, keyAt - 0.62, keyAt);
  const cam = lerpCam(lerpCam(home, formCam, m1), keyCam, m2);
  const toScreen = (x: number, y: number) => ({ x: (x - cam.fx) * cam.z + 960, y: (y - cam.fy) * cam.z + 540 });

  const enter = p(t, 0, 0.4);
  const lit = p(t, keyAt, keyAt + 0.4);

  // 胶囊：字号随最长内容自适应（“参数 值”一行）
  const TAG_H = 78;
  const tagSize = (f: FormField) => Math.min(42, 560 / Math.max(1, textWidth(f.label, 0.86) + textWidth(f.value, 1) + 0.5));

  return <Frame>
    <Handoff enter={c.enter} exit={c.exit} exitAt={c.exitAt}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(960px,540px) scale(${cam.z}) translate(${-cam.fx}px,${-cam.fy}px)` }}>
        <div style={{
          position: 'absolute', left: FULL.x, top: FULL.y, width: FULL.w, height: FULL.h, borderRadius: S.radius, overflow: 'hidden',
          boxShadow: S.shadow, background: '#fff', opacity: enter, transform: `scale(${mix(0.965, 1, enter)})`,
        }}>
          <Img src={staticFile(c.image)} style={{ position: 'absolute', left: ox - FULL.x, top: oy - FULL.y, width: c.imageSize.w * k, height: c.imageSize.h * k }} />
          {/* 空表单：取值区先被白色前景层盖住；填入时擦开（type）或显出（pick） */}
          {fields.map((f, i) => {
            const a = W(f.area);
            const at = fillAt(i);
            const reveal = f.kind === 'type' ? clamp((t - at) / typeDur(f.value)) : q(t, at + 0.05, at + 0.35);
            if (reveal >= 1) return null;
            const typing = f.kind === 'type' && t >= at - 0.25 && reveal < 1;
            const caretOn = typing && Math.floor((t - at + 0.25) * 3.2) % 2 === 0 || (typing && reveal > 0);
            return <React.Fragment key={i}>
              <div style={{
                position: 'absolute', left: a.x - FULL.x + a.w * (f.kind === 'type' ? reveal : 0), top: a.y - FULL.y,
                width: a.w * (f.kind === 'type' ? 1 - reveal : 1), height: a.h, background: '#fff', borderRadius: 10,
                opacity: f.kind === 'pick' ? 1 - reveal : 1,
              }} />
              {caretOn && <div style={{
                position: 'absolute', left: a.x - FULL.x + Math.max(10, a.w * reveal) - 2, top: a.y - FULL.y + a.h * 0.18,
                width: 4, height: a.h * 0.64, background: S.ink, borderRadius: 2,
              }} />}
            </React.Fragment>;
          })}
        </div>
      </div>

      {/* 关键参数点亮：紫框（屏幕空间，线宽不随相机变） */}
      {lit > 0 && (() => {
        const tl = toScreen(keyMark.x, keyMark.y), br = toScreen(keyMark.x + keyMark.w, keyMark.y + keyMark.h);
        const pad = mix(18, 10, lit);
        return <div style={{
          position: 'absolute', left: tl.x - pad, top: tl.y - pad, width: br.x - tl.x + pad * 2, height: br.y - tl.y + pad * 2,
          borderRadius: 22, border: `6px solid ${S.accent}`, opacity: lit, zIndex: 600,
        }} />;
      })()}

      {/* 每项填好后落下的黑胶囊：参数名（弱）+ 值（重）；关键参数的值变紫 */}
      {fields.map((f, i) => {
        const at = fillAt(i) + (f.kind === 'type' ? typeDur(f.value) * 0.6 : 0.22);
        const show = p(t, at, at + 0.38);
        if (show <= 0) return null;
        const size = tagSize(f);
        const lw = textWidth(f.label, size * 0.86), vw = textWidth(f.value, size);
        const w = lw + vw + size * 0.55 + 64;
        const pt = tagW(f);
        const s = toScreen(pt.x, pt.y);
        const align = f.tag.align ?? 'left';
        let x = align === 'left' ? s.x : align === 'center' ? s.x - w / 2 : s.x - w;
        x = clamp(x, 30, 1890 - w);
        let y = s.y - TAG_H / 2;
        if (x + w > 1530) y = Math.max(y, 136); // 让开右上角标
        const isKey = i === keyI;
        // 推近关键参数时，其余胶囊退场，只留关键值
        const fade = isKey ? 1 : 1 - q(t, keyAt - 0.62, keyAt - 0.25);
        if (fade <= 0) return null;
        const valueColor = isKey ? (lit > 0.5 ? S.accentDark : '#fff') : '#fff';
        return <div key={i} style={{
          position: 'absolute', left: x, top: y + (1 - show) * 16, width: w, height: TAG_H, borderRadius: TAG_H / 2,
          background: S.dark, boxShadow: S.capsuleShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size * 0.55,
          opacity: show * fade, transform: `scale(${mix(0.86, 1, show) * (isKey ? 1 + 0.06 * Math.sin(Math.PI * lit) : 1)})`, zIndex: 700,
        }}>
          <span style={{ ...textBase(size * 0.86, 500), color: '#a3a3ab' }}>{f.label}</span>
          <span style={{ ...textBase(size, 900), color: valueColor }}>{f.value}</span>
        </div>;
      })}

      {fields.map((f, i) => f.kind === 'pick' && f.mark ? (() => {
        const m = W(f.mark);
        const s = toScreen(m.x + m.w / 2, m.y + m.h / 2);
        return <ClickRing key={i} x={s.x} y={s.y} t={t} at={fillAt(i)} />;
      })() : null)}
    </Handoff>
    <Sfx name="woosh" at={0.22} />
    {fields.map((f, i) => f.kind === 'type'
      ? <Sfx key={i} name="typing" at={fillAt(i)} volume={0.4} duration={Math.round(typeDur(f.value) * 60) + 6} />
      : <Sfx key={i} name="click" at={fillAt(i)} />)}
    <Sfx name="ding" at={keyAt} />
  </Frame>;
}
