import React, {CSSProperties} from 'react';
import {AbsoluteFill, Easing, Freeze, OffthreadVideo, interpolate, staticFile} from 'remotion';
import {FullscreenVideoWindow} from '../shared/FullscreenVideoWindow';
import {fullscreenVideoWindowGeometry} from '../shared/fullscreen-video-window-geometry';

type Box = [number, number, number, number];
type FocusPacket = {
  id: string;
  start: number;
  end: number;
  /** Actual source snapshot, expressed in seconds after this scene's sourceIn. */
  captureAt: number;
  /** Coordinates in the real 1920x1080 recording, not recreated UI. */
  roi: Box;
  destination: Box;
  dim: number;
  cue: string;
};

/** EP102 102-05 relation: actual ROI pixels lift while their source canvas recedes. */
export const LATE_RECORDING_FOCUS_PLAN: Record<'S09' | 'S10', FocusPacket[]> = {
  S09: [
    {id: 'synchronized-shot-description', start: 2.02, end: 4.64, captureAt: 2,
      roi: [1315, 300, 522, 545], destination: [575, 112, 770, 803.93], dim: .22,
      cue: '比一些其他平台上面的一些拉片 Skill / 更好用一些'},
    {id: 'actual-shot-frame-and-analysis', start: 4.92, end: 7.40, captureAt: 4.9,
      roi: [1308, 153, 530, 507], destination: [555, 132, 810, 774.85], dim: .24,
      cue: '因为我这个确实会一帧帧地去拉片'},
    {id: 'actual-frame-dossier', start: 9.02, end: 10.42, captureAt: 9,
      roi: [890, 368, 616, 474], destination: [487, 142, 946, 727.93], dim: .24,
      cue: '然后去进行逐帧的分析'},
  ],
  S10: [
    {id: 'scene-and-combat-columns', start: .50, end: 2.20, captureAt: 29 / 60,
      roi: [487, 108, 1020, 476], destination: [230, 186, 1460, 681.33], dim: .22,
      cue: '去识别里面的动作啊场景啊'},
    {id: 'actual-words-and-story-pacing', start: 2.50, end: 3.98, captureAt: 149 / 60,
      roi: [1532, 243, 317, 145], destination: [520, 248, 880, 402.52], dim: .22,
      cue: '以及脚本逻辑等等'},
    {id: 'actual-impact-and-environment-result', start: 4.50, end: 6.38, captureAt: 269 / 60,
      roi: [891, 137, 620, 316], destination: [410, 218, 1100, 560.65], dim: .24,
      cue: '这种对于这种打斗场景啊 / 我觉得特别有用'},
  ],
};

const boxStyle = ([left, top, width, height]: Box): CSSProperties => ({position: 'absolute', left, top, width, height});
const blend = (from: Box, to: Box, amount: number): Box => from.map((value, index) => value + (to[index] - value) * amount) as Box;
const travel = (t: number, start: number, end: number) => interpolate(t, [start, end], [0, 1], {
  easing: Easing.bezier(.65, 0, .2, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
function amountAt(t: number, packet: FocusPacket) {
  return travel(t, packet.start, packet.start + .42) * (1 - travel(t, packet.end - .28, packet.end));
}
function nativeToStage(roi: Box): Box {
  const window = fullscreenVideoWindowGeometry();
  const scale = Math.max(window.width / 1920, window.height / 1080);
  return [window.left + (window.width - 1920 * scale) / 2 + roi[0] * scale,
    window.top + (window.height - 1080 * scale) / 2 + roi[1] * scale, roi[2] * scale, roi[3] * scale];
}

/** Only the selected real snapshot is held for reading. The underlying full recording stays 1x. */
function NativeFocusPixels({src, sourceTime, fps, roi, width, height}: {
  src: string; sourceTime: number; fps: number; roi: Box; width: number; height: number;
}) {
  // Contain preserves the complete measured text rectangle at every intermediate lift size.
  const scale = Math.min(width / roi[2], height / roi[3]);
  return <Freeze frame={0}><OffthreadVideo muted src={src} startFrom={Math.round(sourceTime * fps)} playbackRate={1}
    style={{position: 'absolute', left: (width - roi[2] * scale) / 2 - roi[0] * scale,
      top: (height - roi[3] * scale) / 2 - roi[1] * scale, width: 1920 * scale,
      height: 1080 * scale, objectFit: 'fill'}}/></Freeze>;
}

export function LateRecordingFocus({t, src, sourceIn, fps = 60, sceneId}: {
  t: number; src: string; sourceIn: number; fps?: number; sceneId: 'S09' | 'S10';
}) {
  const resolved = staticFile(src);
  const packets = LATE_RECORDING_FOCUS_PLAN[sceneId];
  const active = packets.filter(packet => t >= packet.start && t < packet.end);
  const focusAmount = active.reduce((value, packet) => Math.max(value, amountAt(t, packet)), 0);
  const dim = active.reduce((value, packet) => Math.max(value, amountAt(t, packet) * packet.dim), 0);
  const window = fullscreenVideoWindowGeometry();
  return <AbsoluteFill data-component="EP109-late-10205-real-recording-focus" style={{background: '#fff'}}>
    <div style={{position: 'absolute', inset: 0, filter: `blur(${focusAmount * 1.8}px)`}}>
      <FullscreenVideoWindow src={resolved} videoProps={{muted: true, startFrom: Math.round(sourceIn * fps), playbackRate: 1}}/>
    </div>
    <div style={{position: 'absolute', ...window, boxShadow: 'none', background: '#000', opacity: dim}}/>
    {active.map(packet => {
      const amount = amountAt(t, packet);
      const box = blend(nativeToStage(packet.roi), packet.destination, amount);
      return <div key={packet.id} data-recording-roi={packet.id} style={{...boxStyle(box),
        overflow: 'hidden', borderRadius: 12 + 10 * amount,
        opacity: travel(t, packet.start, packet.start + .10) * (1 - travel(t, packet.end - .16, packet.end)),
        outline: `1.5px solid rgba(255,255,255,${amount * .78})`,
        boxShadow: `0 ${amount * 12}px ${amount * 30}px rgba(0,0,0,${amount * .12})`}}>
        <NativeFocusPixels src={resolved} sourceTime={sourceIn + packet.captureAt} fps={fps}
          roi={packet.roi} width={box[2]} height={box[3]}/>
      </div>;
    })}
  </AbsoluteFill>;
}
