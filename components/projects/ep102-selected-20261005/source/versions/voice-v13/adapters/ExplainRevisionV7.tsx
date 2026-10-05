import React, {CSSProperties} from 'react';
import {AbsoluteFill, Loop, Sequence} from 'remotion';
import {Media, mix, progress, rect} from '../common';
import {PLAYBACK_BOX_V7, PlaybackWindowV7} from './MediaRevisionV7';

type Props = {frame: number};
type Box = [number, number, number, number];
const WHITE = '#fff';
const BLACK = '#000';
const ACCENT = '#8554E8';
const fade = progress;
const place = (r: Box): CSSProperties => rect(...r);
const blend = (a: Box, b: Box, q: number): Box => a.map((n, i) => mix(n, b[i], q)) as Box;

/** Root registers these real sources centrally; this module never mutates assets. */
export const EXPLAIN_V7_BINDINGS: Record<string, string> = {
  'tips-upscaled-v7': 'provenance/C_1080p_站姿修正超分.mp4',
  'tips-native-v7': 'provenance/B_1080p原生生成.mp4',
};

const Stage = ({children, dark = false}: {children: React.ReactNode; dark?: boolean}) =>
  <AbsoluteFill style={{background: dark ? BLACK : WHITE, color: dark ? WHITE : BLACK, fontFamily: 'EP102', overflow: 'hidden'}}>{children}</AbsoluteFill>;

/** No additional media backplate, border, fake controls or window chrome. */
function Picture({id, box, style}: {id: string; box: Box; style?: CSSProperties}) {
  return <div style={{...place(box), ...style}}><Media id={id} style={{objectFit: 'contain'}}/></div>;
}

function Clip({id, from = 0, start = 0, rate = 1, loop = 600}: {id: string; from?: number; start?: number; rate?: number; loop?: number}) {
  return <Sequence from={from} layout="none"><Loop durationInFrames={loop} layout="none"><Media id={id} start={start} rate={rate}/></Loop></Sequence>;
}

/** Crop actual recording pixels. The crop and target keep one uniform scale. */
function NativeRecordingCrop({id, box, roi, from = 0, start = 0, rate = 1, style}: {
  id: string; box: Box; roi: Box; from?: number; start?: number; rate?: number; style?: CSSProperties;
}) {
  const [x, y, w, h] = roi, k = Math.min(box[2] / w, box[3] / h);
  return <div style={{...place(box), ...style}}>
    <div style={{...rect((box[2] - w * k) / 2, (box[3] - h * k) / 2, w * k, h * k), overflow: 'hidden'}}>
      <Sequence from={from} layout="none"><Media id={id} start={start} rate={rate}
        style={{position: 'absolute', left: -x * k, top: -y * k, width: 1920 * k, height: 1080 * k, maxWidth: 'none', objectFit: 'fill'}}/></Sequence>
    </div>
  </div>;
}

function Name({text, box, size, style}: {text: string; box: Box; size: number; style?: CSSProperties}) {
  return <div style={{...place(box), fontSize: size, fontWeight: 900, lineHeight: 1.1, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', ...style}}>{text}</div>;
}

function Concept({text, box, size, style}: {text: string; box: Box; size: number; style?: CSSProperties}) {
  return <Name text={text} box={box} size={size} style={{background: BLACK, color: WHITE, borderRadius: 20, ...style}}/>;
}

/**
 * S03: measured from the actual Pro image S03/generated-01.png.
 * Selected geometry only: demand/canvas -> model with real media -> Agent
 * rearrangement -> Flova Skill. Fake chat, woman, street, bot and purple UI
 * pixels are excluded. frame=0 corresponds to scene frame 350; ends at 1128.
 * B02 owns all following creation-method/material/step explanation.
 */
export function DispatchV7({frame: f}: Props) {
  const model = fade(f, 232, 284), agent = fade(f, 496, 540), skill = fade(f, 672, 716);
  const enter = mix(.60, 1, fade(f, 0, 24));
  const requestBox = blend(blend([220, 215, 760, 465], [80, 205, 325, 205], model), [480, 235, 430, 390], agent);
  const canvasBox = blend(blend([1030, 260, 760, 384], [95, 470, 305, 154], model), [420, 550, 360, 182], skill);
  const modelBox = blend([780, 400, 310, 270], [50, 540, 180, 140], agent);
  const portrait = blend(blend([1190, 140, 370, 270], [255, 325, 160, 185], agent), [1450, 180, 300, 250], skill);
  const voice = blend(blend([1390, 460, 370, 120], [230, 625, 230, 50], agent), [1370, 500, 390, 95], skill);
  const video = blend(blend([1170, 710, 410, 231], [260, 765, 215, 121], agent), [1420, 700, 340, 191], skill);
  const requestOpacity = enter * mix(1, .75, model) * mix(1, 1.33, agent) * mix(1, .35, skill);
  return <Stage>
    {agent < 1 && <div style={{opacity: enter * mix(.34, .10, model) * (1 - agent)}}>
      <div style={{...rect(38, 310, 480, 270), overflow: 'hidden', filter: 'blur(2px)'}}><Clip id="generate" start={1.2} rate={.35}/></div>
    </div>}
    <NativeRecordingCrop id="generate" box={requestBox} roi={[550, 380, 1370, 345]} start={1.2} rate={.35} style={{opacity: requestOpacity}}/>
    <Name text="需求" box={blend([300, 150, 430, 95], [155, 155, 185, 62], model)} size={mix(66, 42, model)} style={{opacity: enter * (1 - agent) * (1 - skill)}}/>
    <Picture id="canvas" box={canvasBox} style={{opacity: enter}}/>

    <Concept text="模型" box={modelBox} size={mix(79, 47, agent)} style={{opacity: model * mix(1, .45, agent) * mix(1, .42, skill)}}/>
    {model > 0 && <div style={{opacity: model}}>
      <Picture id="tan-single" box={portrait}/>
      <NativeRecordingCrop id="voice" box={voice} roi={[531, 382, 734, 109]} start={30} rate={.15}/>
      <div style={{...place(video), overflow: 'hidden', opacity: mix(1, .75, agent) + .25 * skill}}><Clip id="tan-intro" from={232} start={3} rate={.45} loop={480}/></div>
    </div>}

    <Name text="WorkBuddy" box={blend([925, 365, 440, 160], [110, 475, 270, 112], skill)} size={mix(78, 47, skill)} style={{opacity: agent * mix(1, .32, skill)}}/>
    {/* Real assets reorder by priority; these are not fabricated task-list UI. */}
    {agent > 0 && skill < 1 && <><Picture id="scene" box={blend([1450, 205, 285, 185], [1340, 218, 365, 235], fade(f, 595, 639))}
      style={{opacity: agent * (1 - skill), transform: `translateY(${mix(25, 0, fade(f, 504, 544))}px)`}}/>
    <Picture id="board-cell-0" box={[1450, 472, 285, 161]} style={{opacity: agent * (1 - skill) * .62}}/>
    <div style={{...rect(1740, 221, 15, 15), borderRadius: 8, background: ACCENT, opacity: agent * (1 - skill)}}/></>}

    <Name text="Flova" box={[885, 180, 390, 110]} size={102} style={{opacity: skill}}/>
    <Concept text="Skill" box={[925, 338, 325, 185]} size={84} style={{opacity: skill, transform: `translateY(${mix(24, 0, skill)}px)`}}/>
    <div style={{...rect(1211, 365, 14, 14), borderRadius: 8, background: '#D6BEFF', opacity: skill}}/>
  </Stage>;
}

/** An explicitly conceptual 480p source: no invented matching source video. */
function ResolutionObject({box, opacity = 1, scale = 1}: {box: Box; opacity?: number; scale?: number}) {
  return <div style={{...place(box), opacity, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontSize: 150 * scale, fontWeight: 900, color: BLACK, lineHeight: 1}}>480p</div>
  </div>;
}

/**
 * S10-A actual Pro four-state geometry. The input remains a resolution
 * concept, because no matching 480p source of C has been verified. C only
 * becomes a real output example after the conceptual processing handoff.
 * frame=0 is scene frame 647. The price/result group is added separately.
 */
function TipFlowV7({frame: f}: Props) {
  const confirm = fade(f, 210, 236), process = fade(f, 258, 282), output = fade(f, 282, 322);
  const inputBox = blend(blend([292, 285, 1036, 583], [138, 545, 565, 318], confirm), [110, 474, 425, 239], process);
  const resultBox = blend([1110, 267, 738, 415], [623, 208, 1152, 648], output);
  return <Stage>
    <ResolutionObject box={inputBox} scale={mix(1.45, .68, confirm)} opacity={1}/>
    <div style={{opacity: confirm * (1 - process)}}>
      <Name text="确认" box={[1050, 158, 575, 185]} size={152}/>
      <ResolutionObject box={[774, 397, 892, 502]} scale={2.05}/>
      <div style={{...rect(1640, 255, 15, 15), borderRadius: 8, background: ACCENT}}/>
    </div>
    <Name text="超分" box={blend([665, 402, 345, 190], [740, 90, 620, 112], process)} size={mix(95, 71, output)}
      style={{opacity: process, transform: `translateY(${mix(28, 0, process)}px)`}}/>
    <div style={{...place(resultBox), opacity: output, overflow: 'hidden'}}><Clip id="tips-upscaled-v7" from={282}/></div>
    <Name text="超分至1080p" box={[960, 862, 670, 76]} size={48} style={{opacity: output}}/>
  </Stage>;
}

/** S10-B actual Pro geometry: formula -> cost focus -> two true outputs -> date. */
export function TipCostV7({frame: f}: Props) {
  const six = fade(f, 602, 631), cash = fade(f, 760, 798), ratio = fade(f, 888, 921);
  const compare = fade(f, 1016, 1044), offer = fade(f, 1255, 1294);
  const formula = blend([320, 268, 1280, 135], [132, 310, 515, 90], cash);
  const price = blend([275, 430, 1370, 260], [140, 425, 530, 150], cash);
  const left = blend([140, 335, 790, 444.375], [290, 595, 600, 337.5], offer);
  const right = blend([990, 335, 790, 444.375], [1030, 595, 600, 337.5], offer);
  return <Stage dark>
    <div style={{opacity: 1 - compare}}>
      <Name text="480p ＋ 超分" box={formula} size={mix(92, 59, cash)}/>
      <div style={{...place(price), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: mix(28, 12, cash), fontWeight: 900, whiteSpace: 'nowrap', opacity: six}}>
        <span style={{fontSize: mix(274, 116, cash), color: '#D6BEFF'}}>6</span><span style={{fontSize: mix(171, 73, cash)}}>积分/秒</span>
      </div>
      <div style={{...rect(750, 288, 1070, 205), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontWeight: 900, whiteSpace: 'nowrap', opacity: cash}}>
        <span style={{fontSize: 100}}>约</span><span style={{fontSize: 232, color: '#D6BEFF'}}>0.2</span><span style={{fontSize: 111}}>元/秒</span>
      </div>
      <div style={{...rect(750, 585, 1070, 200), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontWeight: 900, whiteSpace: 'nowrap', opacity: ratio}}>
        <span style={{fontSize: 58}}>比1080p直出便宜</span><span style={{fontSize: 211, color: '#D6BEFF'}}>10</span><span style={{fontSize: 112}}>倍</span>
      </div>
    </div>
    {/* These are independent real results, not a fabricated same-source pixel control. */}
    <div style={{opacity: compare}}>
      <div style={{...place(left), overflow: 'hidden'}}><Clip id="tips-upscaled-v7" from={1016} start={2} loop={480}/></div>
      <div style={{...place(right), overflow: 'hidden'}}><Clip id="tips-native-v7" from={1016} start={2} loop={480}/></div>
      <Name text="480p超分至1080p" box={[left[0], left[1] - 78, left[2], 65]} size={mix(54, 43, offer)}/>
      <Name text="1080p原生" box={[right[0], right[1] - 78, right[2], 65]} size={mix(54, 43, offer)}/>
    </div>
    <div style={{opacity: offer}}>
      <div style={{...rect(510, 138, 900, 180), display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, fontWeight: 900}}>
        <span style={{fontSize: 193, color: '#D6BEFF'}}>10/20</span><span style={{fontSize: 128}}>前</span>
      </div>
      <Name text="一年优惠" box={[570, 325, 780, 155]} size={137}/>
    </div>
  </Stage>;
}

/** The dark group begins at S10 scene frame 1127 (647 + 480). */
export const TIPS_V7_DARK_FROM_SCENE_FRAME = 1127;
export function TipsV7({frame}: Props) {
  return frame < 480 ? <TipFlowV7 frame={frame}/> : <TipCostV7 frame={frame}/>;
}

/**
 * S10 300–647: retain SP016's measured convergence, with actual media and
 * white relationship lines. Source assets have no new frames or backplates.
 */
export function AssetsToResultV7({frame: f}: Props) {
  const move = fade(f, 166, 219), connect = fade(f, 219, 250), output = fade(f, 269, 297), expand = fade(f, 294, 333);
  const inputs: {id: string; from: Box; to: Box; cue: number}[] = [
    {id: 'tan-single', from: [150, 198, 434, 688], to: [90, 118, 260, 412], cue: 0},
    {id: 'scene', from: [643, 198, 432, 688], to: [98, 600, 260, 410], cue: 40},
    {id: 'voice', from: [1128, 190, 325, 195], to: [484, 702, 196, 90], cue: 67},
    {id: 'board', from: [1490, 188, 324, 322], to: [484, 229, 195, 192], cue: 87},
  ];
  const resultBox = blend([1240, 420, 580, 326.25], PLAYBACK_BOX_V7, expand);
  return <Stage dark>
    {expand < 1 && <div style={{position: 'absolute', inset: 0, transform: 'translateY(25px) scale(.85)', transformOrigin: '50% 0', opacity: 1 - expand}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {[[350, 320], [350, 800], [680, 746], [680, 320]].map(([x, y], i) => <line key={i} x1={x} y1={y} x2={797} y2={579} stroke={WHITE} strokeWidth={3} opacity={connect}/>)}
        <line x1={1225} y1={579} x2={1399} y2={579} stroke={WHITE} strokeWidth={3} opacity={output}/>
      </svg>
      {inputs.map(t => {
        const r = blend(t.from, t.to, move), opacity = t.cue === 0 ? mix(.6, 1, fade(f, 0, 30)) : fade(f, t.cue, t.cue + 32);
        return t.id === 'voice' ? opacity > 0 && <NativeRecordingCrop key={t.id} id="voice" box={r} roi={[531, 382, 734, 109]} start={30} rate={.15} style={{opacity}}/> : <Picture key={t.id} id={t.id} box={r} style={{opacity}}/>;
      })}
      <Name text="Flova" box={[790, 445, 450, 250]} size={107} style={{opacity: connect}}/>
    </div>}
    <PlaybackWindowV7 box={resultBox} style={{opacity: output}}>
      <Clip id="final-demo" from={269} start={25} loop={4800}/>
    </PlaybackWindowV7>
  </Stage>;
}

const HUB: Box = [380, 250, 1100, 555.133333];

/** Genuine source/result objects shared by A's last and B's first state. */
function SummaryHub({opacity = 1}: {opacity?: number}) {
  if (opacity === 0) return null;
  return <div style={{opacity}}>
    <Picture id="canvas" box={HUB}/>
    <Picture id="tan-single" box={[95, 180, 215, 230]}/>
    <Picture id="board-cell-0" box={[95, 480, 260, 146.25]}/>
    <NativeRecordingCrop id="voice" box={[80, 720, 260, 65]} roi={[531, 382, 734, 109]} start={30} rate={.12}/>
    <div style={{...rect(1420, 170, 380, 213.75), overflow: 'hidden'}}><Clip id="final-demo" from={732} start={25} loop={4800}/></div>
    <Picture id="board-cell-2" box={[1470, 430, 340, 191.25]}/>
    <div style={{...rect(1420, 710, 370, 208.125), overflow: 'hidden'}}><Clip id="tan-fight" from={732} start={2} rate={.6} loop={1800}/></div>
  </div>;
}

/** S15-A actual Pro spatial layout; real EP102 demand replaces the old market text. */
function SummaryInputV7({frame: f}: Props) {
  const request = fade(f, 268, 307), understand = fade(f, 372, 410), skill = fade(f, 476, 512), gather = fade(f, 732, 782);
  const initial: Record<string, Box> = {
    scene: [90, 135, 455, 256], portrait: [1480, 425, 285, 385], board: [895, 135, 375, 211],
    voice: [1390, 185, 380, 85], video: [570, 700, 430, 242], script: [115, 650, 350, 240],
  };
  const afterRequest: Record<string, Box> = {
    scene: [1440, 150, 350, 197], portrait: [1650, 640, 150, 205], board: [1500, 360, 300, 169],
    voice: [1430, 545, 370, 85], video: [1300, 750, 320, 180], script: [1300, 460, 175, 230],
  };
  const final: Record<string, Box> = {
    scene: [1430, 165, 365, 205], portrait: [1530, 185, 200, 265], board: [1490, 385, 260, 146],
    voice: [1390, 490, 390, 95], video: [1380, 700, 420, 236], script: [1370, 280, 200, 260],
  };
  const object = (key: string) => blend(blend(initial[key], afterRequest[key], request), final[key], skill);
  const demand = blend(blend([460, 365, 970, 245], [95, 340, 690, 200], request), [80, 365, 540, 160], skill);
  return <Stage>
    <SummaryHub opacity={gather}/>
    {gather < 1 && <div style={{opacity: 1 - gather}}>
      <Picture id="scene" box={object('scene')}/>
      <Picture id="tan-single" box={object('portrait')} style={{opacity: 1 - skill}}/>
      <Picture id="board-cell-0" box={object('board')} style={{opacity: 1 - skill}}/>
      <NativeRecordingCrop id="voice" box={object('voice')} roi={[531, 382, 734, 109]} start={30} rate={.12}/>
      <div style={{...place(object('video')), overflow: 'hidden'}}><Clip id="tan-intro" start={3} rate={.5} loop={1200}/></div>
      {skill < 1 && <NativeRecordingCrop id="script" box={object('script')} roi={[110, 560, 740, 360]} start={12} rate={.2} style={{opacity: 1 - skill}}/>}
      <NativeRecordingCrop id="generate" box={demand} roi={[550, 380, 1370, 345]} start={1.2} rate={.24}/>
      <Name text="自然语言" box={blend([610, 265, 640, 90], [195, 255, 460, 80], request)} size={mix(69, 55, request)} style={{opacity: 1 - skill}}/>
      <Concept text="WorkBuddy" box={blend([895, 385, 440, 205], [150, 685, 305, 112], skill)} size={mix(74, 47, skill)} style={{opacity: understand}}/>
      <Name text="Flova" box={[795, 204, 455, 105]} size={98} style={{opacity: skill}}/>
      <Concept text="Skill" box={[885, 356, 360, 200]} size={93} style={{opacity: skill}}/>
      <div style={{...rect(1211, 381, 13, 13), borderRadius: 7, background: '#D6BEFF', opacity: skill}}/>
      {/* Narration order is video, audio, image; the small active point follows it. */}
      {skill > 0 && <div style={{...rect(1804, f < 640 ? 794 : f < 694 ? 535 : 259, 14, 14), borderRadius: 7, background: ACCENT}}/>}
    </div>}
  </Stage>;
}

/** Real script excerpt, copied verbatim from the project's V6.1 execution draft. */
const SCRIPT_EXCERPT_SOURCE = 'provenance/谭sir_V6.1_90秒完整执行稿.md';
export const EXPLAIN_V7_CONTENT_SOURCES = {scriptExcerpt: SCRIPT_EXCERPT_SOURCE};
function ScriptExcerpt({opacity = 1}: {opacity?: number}) {
  return <div style={{...rect(150, 290, 440, 575), overflow: 'hidden', opacity, fontSize: 29, lineHeight: 1.65, fontWeight: 500}}>
    <div style={{fontSize: 43, fontWeight: 900, lineHeight: 1.25, marginBottom: 24}}>谭sir：追到一张碟</div>
    <div>第一镜从正在行驶的白车车内看向前方：大爷的小电动车拖着超长货物，尺度反差直接入画，不再另做一段重车误导。</div>
    <div style={{marginTop: 22}}>谭sir按喇叭：“哔哔！大爷，停一下！”</div>
    <div style={{marginTop: 22}}>四句正反打，答句紧接问句。前方与脚下的手势区别明确，删掉每句后的单独反应镜头。</div>
  </div>;
}

/** True media arranged as abstract edit tracks, without invented Flova controls. */
function MediaTracks({frame: f, opacity}: {frame: number; opacity: number}) {
  if (opacity === 0) return null;
  return <div style={{...rect(330, 365, 790, 365), opacity}}>
    {[0, 1, 2, 3].map(i => <Picture key={i} id={'board-cell-' + i} box={[i * 194, 0, 180, 101.25]}/>)}
    <NativeRecordingCrop id="voice" box={[0, 122, 760, 115]} roi={[531, 382, 734, 109]} start={30} rate={.12}/>
    {['tan-intro', 'tan-fight', 'tan-end'].map((id, i) => <div key={id} style={{...rect(i * 258, 253, 244, 137.25), overflow: 'hidden'}}><Clip id={id} from={793} start={2} rate={.6} loop={1800}/></div>)}
    <div style={{...rect(55 + 635 * fade(f, 793, 993), -10, 4, 406), background: BLACK}}/>
  </div>;
}

/** S15-B four states continue A's exact hub, then free the story/shot choices. */
function SummaryChoicesV7({frame: f}: Props) {
  const timeline = fade(f, 786, 826), result = fade(f, 1016, 1060), story = fade(f, 1146, 1190), shots = fade(f, 1335, 1370);
  const canvas = blend(blend(HUB, [420, 195, 700, 353.267], timeline), [1340, 690, 475, 239.717], story);
  const resultBox = blend(blend([1420, 170, 380, 213.75], [1190, 275, 610, 343.125], result), [1260, 180, 530, 298.125], story);
  const starts: Box[] = [[680, 370, 335, 188.4375], [1050, 380, 335, 188.4375], [1420, 390, 335, 188.4375]];
  const ends: Box[] = [[620, 350, 470, 264.375], [1180, 365, 510, 286.875], [1457, 719, 35, 19.6875]];
  return <Stage>
    <Picture id="canvas" box={canvas}/>
    {timeline < 1 && <div style={{opacity: 1 - timeline}}>
      <Picture id="tan-single" box={[95, 180, 215, 230]}/>
      <Picture id="board-cell-0" box={[95, 480, 260, 146.25]}/>
      <NativeRecordingCrop id="voice" box={[80, 720, 260, 65]} roi={[531, 382, 734, 109]} start={30} rate={.12}/>
      <Picture id="board-cell-2" box={[1470, 430, 340, 191.25]}/>
      <div style={{...rect(1420, 710, 370, 208.125), overflow: 'hidden'}}><Clip id="tan-fight" from={732} start={2} rate={.6} loop={1800}/></div>
    </div>}
    <MediaTracks frame={f} opacity={timeline * (1 - story)}/>
    <div style={{...place(resultBox), overflow: 'hidden', filter: `blur(${story * 7}px)`}}><Clip id="final-demo" from={732} start={25} loop={4800}/></div>
    <ScriptExcerpt opacity={story}/>
    <Name text={shots > 0 ? '镜头' : '故事'} box={[295, 147, 630, 125]} size={101} style={{opacity: story}}/>
    <div style={{...rect(790, 204, 14, 14), borderRadius: 8, background: ACCENT, opacity: story}}/>
    {[0, 2, 3].map((cell, i) => <Picture key={cell} id={'board-cell-' + cell} box={blend(starts[i], ends[i], shots)} style={{opacity: story * (i === 2 ? 1 - shots : 1)}}/>)}
  </Stage>;
}

export function SummaryV7({frame}: Props) {
  return frame < 782 ? <SummaryInputV7 frame={frame}/> : <SummaryChoicesV7 frame={frame}/>;
}
