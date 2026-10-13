// 段外壳（整期骨架，114 v2 定型）：每段自动带上 ①本段口播切片 ②得意黑字幕条（全片真实时间）。
// 段内画面（src/scenes/Sxx.tsx）只管画面和音效，时间一律用段内秒；口播时间用 cue()/cueI() 取，不手填秒数。
import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, getInputProps, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import timing from '../timing.json';
import { SmileySubtitle, type SubtitleCue } from './SmileySubtitle';

export const FPS = timing.fps;
export type Cue = { i: number; start: number; end: number; text: string };
export type PageT = { stableId: string; globalStartFrame: number; frames: number; cues: Cue[] };
export const PAGES = timing.pages as PageT[];
export const page = (id: string) => PAGES.find((p) => p.stableId === id)!;
/** 段长（秒） */
export const segSec = (id: string) => page(id).frames / FPS;
/** 段内第 n 条字幕（n 为本段第几句，0 起）的起点秒 */
export const cue = (id: string, n: number) => page(id).cues[n].start;
/** 段内第 n 条字幕的终点秒 */
export const cueEnd = (id: string, n: number) => page(id).cues[n].end;
/** 段内字幕：按全片 SRT 序号取起点秒（例如 cueI('S05', 29) = “左上角用户名…”） */
export const cueI = (id: string, srtIndex: number) => page(id).cues.find((c) => c.i === srtIndex)!.start;

const INSERT_SEC = timing.audio.insertFrames / FPS;
const CUT = timing.audio.cutAtSeconds;

/** 1920×1080 逻辑舞台（父层按输出宽度缩放一次）。 */
export function Stage({ children }: { children: React.ReactNode }) {
  const { width } = useVideoConfig();
  return <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0' }}>
      {children}
    </div>
  </AbsoluteFill>;
}

/** 本段口播：从 v4 录音里取对应区间。S03 截到插入点为止，S04 以后整体后移插入时长。 */
function VoiceSlice({ id }: { id: string }) {
  const p = page(id);
  const gStart = p.globalStartFrame / FPS;
  const v4Start = gStart < CUT ? gStart : gStart - INSERT_SEC;
  return <Audio src={staticFile(timing.audio.voice)} trimBefore={Math.round(v4Start * FPS)}
    trimAfter={Math.round(v4Start * FPS) + p.frames} />;
}

function Subtitles({ id }: { id: string }) {
  const p = page(id);
  const t = useCurrentFrame() / FPS;
  const cues: SubtitleCue[] = p.cues.map((c) => ({ startSeconds: c.start, endSeconds: c.end, text: c.text }));
  return <Stage><SmileySubtitle cues={cues} timeSeconds={t} /></Stage>;
}

/** 段外壳：画面 + 本段口播 + 字幕。 */
export function SceneShell({ id, children }: { id: string; children: React.ReactNode }) {
  return <AbsoluteFill style={{ background: '#fff' }}>
    {children}
    {id !== timing.audio.insertId /* 插入段自带原声 */ && !(getInputProps() as { noVoice?: boolean }).noVoice && <VoiceSlice id={id} />}
    <Subtitles id={id} />
  </AbsoluteFill>;
}

/** 固定过渡插入（如 109 过渡动画）：原画面 + 原声 + 深色角标；字幕来自 episode.json 的 insert.cues。素材放 public/insert109/。 */
export function Insert109() {
  return <AbsoluteFill style={{ background: '#000' }}>
    <OffthreadVideo src={staticFile('insert109/source.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    <Audio src={staticFile('insert109/source.wav')} />
    <Stage>
      <Img src={staticFile('brand/dark.png')} style={{ position: 'absolute', left: 1554.5, top: 41, width: 335, height: 75, objectFit: 'contain' }} />
    </Stage>
  </AbsoluteFill>;
}
