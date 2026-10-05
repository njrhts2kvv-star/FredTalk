import React, {CSSProperties} from 'react';
import {AbsoluteFill, Freeze, Img, Sequence, staticFile} from 'remotion';
import {Media, mix, progress, rect} from '../common';
import {PLAYBACK_BOX_V7, PlaybackWindowV7, PixelCrop, CropVideo, RecordingFocus, StableMediaV7} from './MediaRevisionV7';
import timing from '../voice-timing-v6.json';
import waves from '../voice-waves-v6.json';
import assets from '../assets.json';
import {Batch1} from '../library/retained-scenes/src/batch1';
import {RebuiltC005} from '../library/ctw/RebuiltC005';
import {SP016} from '../library/selfpick/sp015-016';
import {MediaScenesB} from '../library/new10/MediaScenesB';
import {TipCostV7} from './ExplainRevisionV7';
import {WeaponCompare} from './WeaponCompare';

type Props = {frame: number};
type Box = [number, number, number, number];
const p = progress;
const blend = (a: Box, b: Box, q: number): Box => a.map((v, i) => mix(v, b[i], q)) as Box;
const place = (b: Box): CSSProperties => rect(...b);
const Stage = ({children, dark = false}: {children: React.ReactNode; dark?: boolean}) =>
  <AbsoluteFill style={{background: dark ? '#111' : '#fff', color: dark ? '#fff' : '#111', overflow: 'hidden'}}>{children}</AbsoluteFill>;
const Text = ({children, box, size = 54, style = {}}: {children: React.ReactNode; box: Box; size?: number; style?: CSSProperties}) =>
  <div style={{...place(box), fontSize: size, fontWeight: 900, lineHeight: 1.3, ...style}}>{children}</div>;
const Picture = ({id, box, style}: {id: string; box: Box; style?: CSSProperties}) =>
  <div style={{...place(box), overflow: 'hidden', ...style}}><Media id={id}/></div>;
function Clip({id, from = 0, start = 0, rate = 1}: {id: string; from?: number; start?: number; rate?: number}) {
  return <Sequence from={from} layout="none"><Media id={id} start={start} rate={rate}/></Sequence>;
}

/** The same measured canvas/node coordinate system lives inside Fred's playback window. */
function Carrier({children}: {children: React.ReactNode}) {
  return <Stage><PlaybackWindowV7><div style={{...rect(0, 0, 1920, 1080), transform: `scale(${PLAYBACK_BOX_V7[2] / 1920})`, transformOrigin: 'top left', overflow: 'hidden'}}>{children}</div></PlaybackWindowV7></Stage>;
}
function Canvas({file, amount = 0}: {file: string; amount?: number}) {
  return <><Img src={staticFile(file)} style={{width: '100%', height: '100%', objectFit: 'cover'}}/><AbsoluteFill style={{background: '#000', opacity: amount}}/></>;
}

const WIDE:Record<string,string>={'tan-single':'v8-generated/tan-single-wide-v8.png','tan-character':'v8-generated/tan-character-wide-v8.png','hammer':'v8-generated/hammer-wide-v8.png'};
const mediaPath=(id:string)=>WIDE[id]||(assets as Record<string,{src:string}>)[id].src;
function LibraryGrid({frame,names,words=[]}:{frame:number;names:string[];words?:string[]}) {
  const bindings:Record<string,string>={};
  for(let i=0;i<4;i++)for(let state=0;state<3;state++)bindings[`grid-11-${i}-${state}`]=names[i];
  return <Batch1 number={11} t={frame/60} duration={14} overrides={{words,assets:bindings,background:'#fff',ink:'#111',accent:'#8554E8'}}/>;
}

/** Direct imported C005: measured native choreography, with episode nouns in its existing spec. */
export function DispatchV8({frame:f}:Props) {
  if(f<232)return <StableMediaV7 id="generate" start={1.2} rate={.35}/>;
  const nativeFrame=f<496?(f-232)*590/264:590+(f-496)*220/282;
  return <Freeze frame={Math.min(800,Math.floor(nativeFrame))}><RebuiltC005/></Freeze>;
}
/** Direct imported SP016; only genuine episode source layers replace the reference layers. */
export function AssetsToResultV8({frame:f}:Props) {
  const nativeFrame=f<166?f*103/166:f<219?103+(f-166)*32/53:f<294?135+(f-219)*49/75:184;
  return <Freeze frame={Math.floor(nativeFrame)}><SP016/></Freeze>;
}

/** B011 grouped media wall, restored audition identities, with the native canvas still visible. */
export function VoiceV8({frame: f}: Props) {
  const start = timing.insertionStartFrame, end = timing.insertionEndFrame;
  if (f < start || f >= end) {
    if (f < 170) return <StableMediaV7 id="voice-request"/>;
    if (f < start) return <StableMediaV7 id="voice" from={170} start={1.2} rate={.85}/>;
    if (f < 2315) return <StableMediaV7 id="voice" from={end} start={17} rate={.7}/>;
    if (f < 2521) return <StableMediaV7 id="voice" from={2315} start={19} rate={.65}/>;
    if (f < 2642) return <StableMediaV7 id="voice" from={2521} start={36.4} rate={1.4}/>;
    return <StableMediaV7 id="voice" from={2642} start={30.4}/>;
  }
  const spread = p(f, start, start + 45) * (1 - p(f, end - 35, end));
  return <Carrier><Canvas file="stills/voice-group.jpg" amount={spread * .65}/>
    {timing.samples.map((s, i) => {
      const active = f >= s.startFrame && f < s.startFrame + s.durationInFrames;
      const q = Math.max(0, Math.min(1, (f - s.startFrame) / s.durationInFrames));
      const bars = (waves as Record<string, number[]>)[s.id];
      return <div key={s.id} style={{...rect(mix(720, 150 + i * 570, spread), 190, 480, 620), opacity: i ? spread : 1, borderRadius: 28, background: active ? '#fff' : '#202124', color: active ? '#111' : '#fff', boxShadow: '0 18px 30px #0004'}}>
        <div style={{...rect(110, 42, 260, 260), borderRadius: '50%', overflow: 'hidden'}}><Media id="tan-single" style={{objectFit: 'cover', objectPosition: '50% 24%'}}/></div>
        <Text box={[20, 340, 440, 90]} size={60} style={{textAlign: 'center'}}>{s.label}</Text>
        <svg width={400} height={95} style={{position: 'absolute', left: 40, top: 460}}>{bars.map((v, j) => <rect key={j} x={j * 6.25} y={47 - v * 40} width={3.8} height={Math.max(3, v * 80)} rx={1.9} fill={j / bars.length <= q ? (active ? '#111' : '#fff') : '#777'}/>)}</svg>
        <div style={{...rect(40, 575, 400, 6), background: '#777', borderRadius: 6}}><div style={{width: `${q * 100}%`, height: 6, background: active ? '#111' : '#fff'}}/></div>
      </div>;
    })}
  </Carrier>;
}

const PEOPLE = [
  {id: 'tan-character', roi: [152, 310, 284, 203] as Box}, {id: 'daye-character', roi: [512, 310, 321, 180] as Box},
  {id: 'maidi-character', roi: [898, 310, 323, 180] as Box}, {id: 'driver-character', roi: [1280, 310, 322, 180] as Box},
];
const PROPS = [{id: 'stools', roi: [512, 663, 321, 180] as Box}, {id: 'disc', roi: [898, 663, 323, 180] as Box}, {id: 'hammer', roi: [1280, 636, 278, 207] as Box}];
function LiftGrid({frame, nodes, start, end, targets}: {frame: number; nodes: typeof PEOPLE; start: number; end: number; targets: Box[]}) {
  const hold = p(frame, start, start + 34) * (1 - p(frame, end - 30, end));
  return <Carrier><Canvas file="stills/characters.jpg" amount={hold * .6}/>
    {nodes.map((n, i) => {
      const q = p(frame, start + i * 8, start + 34 + i * 8) * (1 - p(frame, end - 30, end));
      const box = blend(n.roi, targets[i], q);
      return <Picture key={n.id} id={n.id} box={box} style={{borderRadius: 12, boxShadow: '0 12px 24px #0003'}}/>;
    })}
  </Carrier>;
}

/** Direct imported B011, with actual character/prop/film/scene assets. No added headings. */
export function AssetsV8({frame:f}:Props) {
  if(f<285)return <RecordingFocus frame={f} id="characters" start={2.7} rate={.6} roi={[570,140,1200,650]} enter={38} leave={236}/>;
  if(f<520)return <Carrier><LibraryGrid frame={(f-285)*360/235} names={PEOPLE.map(n=>mediaPath(n.id))}/></Carrier>;
  if(f<660)return <Carrier><LibraryGrid frame={(f-520)*330/140} names={[...PROPS.map(n=>mediaPath(n.id)),mediaPath('tan-character')]}/></Carrier>;
  if(f<1368)return <LibraryGrid frame={Math.min(365,(f-660)*365/180)} names={[mediaPath('tan-character'),'v8-proof/tan-shot-0.jpg','v8-proof/tan-shot-1.jpg','v8-proof/tan-shot-2.jpg']}/>;
  if(f<1540)return <StableMediaV7 id="scene-generate" from={1368} start={4.5}/>;
  if(f<1940)return <LibraryGrid frame={Math.min(365,(f-1540)*365/170)} names={['scene-e04','scene-e02','scene-e01','canvas'].map(mediaPath)}/>;
  return <StableMediaV7 id="scene-canvas-v7" from={1940}/>;
}

const BOARD_NODES: Box[] = [[384, 868, 242, 145], [1143, 641, 243, 145], [890, 641, 243, 145], [637, 641, 242, 145], [384, 641, 242, 145], [1143, 420, 243, 144], [890, 420, 243, 144], [637, 420, 242, 144], [384, 420, 242, 144], [1143, 194, 243, 145], [890, 194, 243, 145], [637, 194, 242, 145], [384, 194, 242, 145]];
/** Complete authored four-grid emerges and returns as one object; nothing escapes its carrier. */
export function BoardsV8({frame: f}: Props) {
  if (f < 300) return <StableMediaV7 id="boards" rate={1.2}/>;
  if (f >= 1900) return <Sequence from={1900}><WeaponCompare frame={f - 1900}/></Sequence>;
  const index = Math.min(12, Math.floor((f - 300) / 123)), local = f - 300 - index * 123;
  const q = p(local, 0, 22) * (1 - p(local, 98, 122));
  const box = blend(BOARD_NODES[index], [300, 105, 1320, 797.5], q);
  return <Carrier><Canvas file="stills/boards.jpg" amount={q * .58}/>
    <Picture id={`v7-board-Q${String(index + 1).padStart(2, '0')}`} box={box} style={{boxShadow: '0 12px 24px #0005'}}/>
  </Carrier>;
}

/** Fred's vertical reference: original 3:4 content over a blurred copy, preserving source captions. */
function FrostedClassic({id, from, start, box, vertical}: {id: string; from: number; start: number; box: Box; vertical?: boolean}) {
  return <PlaybackWindowV7 box={box}>
    <div style={{position: 'absolute', inset: -35, filter: 'blur(24px)', opacity: .62}}><Clip id={id} from={from} start={start}/></div>
    {vertical ? <CropVideo id={id} from={from} start={start} roi={[520, 0, 880, 1080]} box={[box[2] * .245, 0, box[2] * .51, box[3]]}/> : <Clip id={id} from={from} start={start}/>}
  </PlaybackWindowV7>;
}
export function ScriptV8({frame: f}: Props) {
  if (f < 458) return <RecordingFocus frame={f} id="script" roi={[350, 120, 1380, 820]} enter={90} leave={372} slide/>;
  if (f < 774) {
    const clips = [{id: 'classic-license', from: 458, start: 5.4}, {id: 'daye', from: 572, start: 20.1}, {id: 'maidi', from: 634, start: 1.4}];
    const i = f < 572 ? 0 : f < 634 ? 1 : 2, current = clips[i];
    return <Stage><FrostedClassic {...current} box={PLAYBACK_BOX_V7} vertical={i === 1}/></Stage>;
  }
  if(f<1329) {
    const nativeFrame=Math.min(365,(f-774)*365/270);
    return <LibraryGrid frame={nativeFrame} names={[mediaPath('tan-single'),mediaPath('hammer'),mediaPath('disc'),'v8-proof/tan-shot-1.jpg']}/>;
  }
  return <StableMediaV7 id="script" from={1329} start={17.7}/>;
}

/** Direct imported B011 -> N038, preserving their exact grouping/focus/exit motions. */
export function SummaryV8({frame:f}:Props) {
  const ids=['scene-e01','v7-board-Q01','tan-character','canvas'];
  if(f<782) {
    const nativeFrame=f<268?f*390/268:390+(f-268)*400/514;
    return <LibraryGrid frame={nativeFrame} names={ids.map(mediaPath)} words={['自然语言','WorkBuddy 理解需求','调用 Flova 的 Skill']}/>;
  }
  const bindings:Record<string,string>={};
  const photos=['scene-e01','tan-single','v7-board-Q01','canvas','board-cell-0','board-cell-2','scene-e02'];
  for(let i=0;i<6;i++)bindings[`group-b/art-${i}.jpg`]=mediaPath(photos[i]);
  bindings['group-b/41-ancient.jpg']=mediaPath(photos[6]);
  const label=f<1146?'想法变成作品':f<1335?'故事':'镜头';
  const time=Math.min(5.25,(f-782)*5.25/364);
  return <MediaScenesB id="N038" t={time} overrides={{assets:bindings,words:[label],accent:'#8554E8'}}/>;
}

/** The existing Pro flow's three stages, with one visual subject per beat. */
export function TipsV8({frame: f}: Props) {
  if (f >= 480) return <TipCostV7 frame={f}/>;
  if (f < 210) return <Stage><Text box={[330, 240, 1260, 110]} size={76} style={{textAlign:'center'}}>先做低清预览</Text><Text box={[330, 405, 1260, 280]} size={210} style={{textAlign:'center'}}>480p</Text></Stage>;
  if (f < 258) return <Stage><Text box={[330, 245, 1260, 150]} size={113} style={{textAlign:'center'}}>确认效果</Text><Text box={[330, 485, 1260, 180]} size={104} style={{textAlign:'center'}}>再进入超分</Text></Stage>;
  const result=p(f,282,322);
  return <Stage>
    <Text box={[100,405,460,160]} size={120} style={{textAlign:'center'}}>480p</Text>
    <Text box={[650,420,290,130]} size={95} style={{textAlign:'center'}}>超分</Text>
    <svg width={1920} height={1080} style={{position:'absolute',inset:0}}><path d="M540 480 H640 M940 480 H1040" stroke="#111" strokeWidth={5}/></svg>
    <PlaybackWindowV7 box={[1055,260,750,421.875]} style={{opacity:result}}><Clip id="tips-upscaled-v7" from={282}/></PlaybackWindowV7>
    <Text box={[1055,720,750,95]} size={49} style={{textAlign:'center',opacity:result}}>超分至1080p · 实际结果示例</Text>
  </Stage>;
}
