import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Media, mix, progress, rect} from '../common';
import {Batch1} from '../library/bob/src/batch1';
import {VoiceV8} from './MajorRevisionV8';
import {PLAYBACK_BOX_V7, PlaybackWindowV7, PixelCrop} from './MediaRevisionV7';
import timing from '../voice-timing-v6.json';
import waves from '../voice-waves-v6.json';

type Box = [number, number, number, number];
const blend = (a: Box, b: Box, q: number): Box => a.map((v, i) => mix(v, b[i], q)) as Box;

// These are the real nodes in voice-group.jpg's 1920 x 1080 design space.
const SOURCE_NODES: Box[] = [[520, 516, 278, 155], [890, 268, 280, 156], [890, 516, 278, 155]];
const AUDITION_BOXES: Box[] = [[100, 335, 760, 350], [1030, 130, 780, 330], [1030, 560, 780, 330]];
// V18_D04_谭sir.wav: 120000 PCM samples at 48kHz (2.5s). Measured mono RMS
// in 64 equal sample windows, normalized by the largest window. The silent
// ending stays zero; these are not decorative or randomly generated bars.
const DIALOGUE_BARS = [0.000048, 0.045490, 0.095766, 0.487381, 0.729936, 0.922123, 0.981237, 0.545306, 0.205383, 0.841528, 0.781058, 0.506506, 0.601183, 0.750163, 0.429084, 0.315096, 0.827026, 0.929353, 0.892167, 0.374328, 0.482838, 0.854291, 0.634450, 0.619226, 0.822485, 0.658662, 0.708578, 0.550090, 1, 0.965400, 0.692163, 0.745548, 0.955276, 0.772248, 0.494834, 0.228668, 0.292141, 0.332021, 0.362901, 0.010501, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function Carrier({children}: {children: React.ReactNode}) {
  return <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}><PlaybackWindowV7>
    <div style={{...rect(0, 0, 1920, 1080), transform: `scale(${PLAYBACK_BOX_V7[2] / 1920})`, transformOrigin: 'top left', overflow: 'hidden'}}>{children}</div>
  </PlaybackWindowV7></AbsoluteFill>;
}

/** Direct B002 library source; its existing center capsule follows the spoken nouns. */
function AudioModelExplanation({frame: f}: {frame: number}) {
  const cue = f < 715 ? {from: 480, text: 'Seed Audio 1.0'}
    : f < 924 ? {from: 715, text: '一次多组候选'}
    : f < 1018 ? {from: 924, text: '1 秒 1 积分'}
    : {from: 1018, text: '低成本，多试几版'};
  // First cue keeps the original circle-to-pill opening. Following cues reuse
  // the settled same pill and its original left-to-right word reveal.
  const nativeTime = f < 500 ? 1.2 + (f - 480) * .7 / 20
    : Math.min(3.3, 1.9 + (f - Math.max(500, cue.from)) / 60);
  const opacity = progress(f, 480, 500) * (1 - progress(f, 1138, 1156));
  return <><VoiceV8 frame={f}/><AbsoluteFill style={{opacity}}>
    <Batch1 number={2} t={nativeTime} duration={5.5} overrides={{words: [cue.text], background: '#fff', ink: '#121214', accent: '#8554E8'}}/>
  </AbsoluteFill></>;
}

/** Actual waveform bins; progress is tied to the unchanged PCM sample clock. */
function Waveform({id, bins, played, active, width}: {id?: string; bins?: readonly number[]; played: number; active: boolean; width: number}) {
  const bars = bins || (waves as Record<string, number[]>)[id!];
  return <svg width={width} height={96} viewBox={`0 0 ${width} 96`}>
    {bars.map((v, j) => <rect key={j} x={j * width / bars.length} y={48 - v * 40} width={width / bars.length * .61} height={Math.max(3, v * 80)} rx={1.9}
      fill={j / bars.length < played ? (active ? '#111' : '#fff') : '#777'}/>)}
  </svg>;
}

function Audition({frame: f}: {frame: number}) {
  const enter = progress(f, 1238, 1283), leave = 1 - progress(f, 2158, timing.insertionEndFrame);
  const lift = enter * leave;
  const faces = progress(f, 1260, 1283) * leave;
  return <Carrier>
    <Img src={staticFile('stills/voice-group.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
    <AbsoluteFill style={{background: '#000', opacity: lift * .7}}/>
    {timing.samples.map((sample, i) => {
      const box = blend(SOURCE_NODES[i], AUDITION_BOXES[i], lift);
      const active = f >= sample.startFrame && f < sample.startFrame + sample.durationInFrames;
      const played = Math.max(0, Math.min(1, (f - sample.startFrame) / sample.durationInFrames));
      const targetWidth = AUDITION_BOXES[i][2], targetHeight = AUDITION_BOXES[i][3];
      const contentScale = Math.min(box[2] / targetWidth, box[3] / targetHeight);
      return <React.Fragment key={sample.id}>
        <PixelCrop file="stills/voice-group.jpg" roi={SOURCE_NODES[i]} box={box} fit="cover" style={{borderRadius: mix(14, targetHeight / 2, lift), opacity: 1 - faces}}/>
        <div style={{...rect(...box), opacity: faces, borderRadius: targetHeight / 2 * box[3] / targetHeight, overflow: 'hidden', background: active ? '#fff' : '#202124', color: active ? '#111' : '#fff'}}>
          <div style={{...rect((box[2] - targetWidth * contentScale) / 2, (box[3] - targetHeight * contentScale) / 2, targetWidth, targetHeight), transform: `scale(${contentScale})`, transformOrigin: 'top left'}}>
            <div style={{...rect(40, (targetHeight - 170) / 2, 170, 170), borderRadius: '50%', overflow: 'hidden'}}><Media id="tan-single" style={{objectFit: 'cover', objectPosition: '50% 24%'}}/></div>
            <div style={{...rect(248, 40, targetWidth - 290, 80), fontSize: 64, fontWeight: 900, lineHeight: 1.2}}>{sample.label}</div>
            <div style={rect(248, 143, targetWidth - 300, 96)}><Waveform id={sample.id} played={played} active={active} width={targetWidth - 300}/></div>
            <div style={{...rect(248, targetHeight - 55, targetWidth - 300, 6), borderRadius: 6, background: '#777', overflow: 'hidden'}}><div style={{width: `${played * 100}%`, height: 6, background: active ? '#111' : '#fff'}}/></div>
          </div>
        </div>
      </React.Fragment>;
    })}
  </Carrier>;
}

/** A real generated line, shown as an independent audio example, without an unverified mouth match. */
function GeneratedDialogue({frame: f}: {frame: number}) {
  const played = Math.max(0, Math.min(1, (f - 2315) / 150));
  return <Carrier>
    <Img src={staticFile('stills/voice-group.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
    <AbsoluteFill style={{background: '#000', opacity: .8}}/>
    <div style={{...rect(105, 327, 660, 371.447), borderRadius: 24, overflow: 'hidden'}}>
      <Img src={staticFile('v8-generated/tan-single-wide-v8.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
    </div>
    <div style={{...rect(820, 285, 1000, 445), borderRadius: 160, background: '#fff', color: '#111', overflow: 'hidden'}}>
      <div style={{...rect(80, 52, 840, 78), fontSize: 64, lineHeight: 1.2, fontWeight: 900, textAlign: 'center'}}>生成台词示例</div>
      <div style={{...rect(60, 157, 880, 76), fontSize: 60, lineHeight: 1.2, fontWeight: 700, textAlign: 'center'}}>我说你该走哪条道？</div>
      <div style={rect(100, 270, 800, 96)}><Waveform bins={DIALOGUE_BARS} played={played} active width={800}/></div>
      <div style={{...rect(100, 392, 800, 6), borderRadius: 6, background: '#777', overflow: 'hidden'}}><div style={{width: `${played * 100}%`, height: 6, background: '#111'}}/></div>
    </div>
  </Carrier>;
}

/** S08 visual-only patch. V8 owns every unrequested frame and all original tail source clocks. */
export function VoiceRevisionV10({frame}: {frame: number}) {
  if (frame >= 480 && frame < 1156) return <AudioModelExplanation frame={frame}/>;
  if (frame >= 1238 && frame < timing.insertionEndFrame) return <Audition frame={frame}/>;
  if (frame >= 2315 && frame < 2521) return <GeneratedDialogue frame={frame}/>;
  return <VoiceV8 frame={frame}/>;
}
