import React, {CSSProperties} from 'react';
import {AbsoluteFill, Easing, Img, Sequence, staticFile, interpolate} from 'remotion';
import {Media, asset, mix, rect} from '../common';
import installAccountRoi from '../install-account-roi-v7.json';

type Props = {frame: number};
type Box = [number, number, number, number];
type NativeNode = {id: string; roi: Box};

/** Fred S04 2026-10-04 attached exact 4K geometry, divided by two. */
export const PLAYBACK_BOX_V7: Box = [60, 33.222222, 1800, 1013.555556];
export const MEDIA_V7_BINDINGS: Record<string, string> = {
  'scene-canvas-v7': 'provenance/scene-canvas-v7.png',
};
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {
  easing: Easing.bezier(.65, 0, .2, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
const boxMix = (a: Box, b: Box, q: number): Box => a.map((x, i) => mix(x, b[i], q)) as Box;
const pos = ([x, y, w, h]: Box) => rect(x, y, w, h);
const Stage = ({children, dark = false}: {children: React.ReactNode; dark?: boolean}) =>
  <AbsoluteFill style={{background: dark ? '#000' : '#fff', overflow: 'hidden'}}>{children}</AbsoluteFill>;

function Clip({id, from = 0, start = 0, rate = 1, style}: {
  id: string; from?: number; start?: number; rate?: number; style?: CSSProperties;
}) {
  return <Sequence from={from} layout="none"><Media id={id} start={start} rate={rate} style={style}/></Sequence>;
}

/** One rounded video clip and the supplied light shadow; no extra white backplate. */
export function PlaybackWindowV7({box = PLAYBACK_BOX_V7, children, style, radius = 24}: {
  box?: Box; children: React.ReactNode; style?: CSSProperties; radius?: number;
}) {
  return <div style={{...pos(box), borderRadius: radius, boxShadow: '0 16px 25px rgba(0,0,0,.133333)', ...style}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden'}}>{children}</div>
  </div>;
}

/** Root-facing shared scene wrapper for S13 and other settled recordings/films. */
export function StableMediaV7({id, frame = 0, from = 0, start = 0, rate = 1, slide = false}: {
  id: string; frame?: number; from?: number; start?: number; rate?: number; slide?: boolean;
}) {
  return <Stage><PlaybackWindowV7 style={{transform: slide ? `translateX(${mix(-1920, 0, ease(frame - from, 0, 38))}px)` : undefined}}>
    <Clip id={id} from={from} start={start} rate={rate}/>
  </PlaybackWindowV7></Stage>;
}

/** The source pixels have a fixed ROI; this uniformly fits/crops them, never stretching them. */
export function PixelCrop({id, file, roi, box, native = [1920, 1080], fit = 'contain', style}: {
  id?: string; file?: string; roi: Box; box: Box; native?: [number, number]; fit?: 'contain' | 'cover'; style?: CSSProperties;
}) {
  const [x, y, w, h] = roi, [bx, by, bw, bh] = box;
  const k = fit === 'cover' ? Math.max(bw / w, bh / h) : Math.min(bw / w, bh / h);
  return <div style={{...rect(bx, by, bw, bh), overflow: 'hidden', ...style}}>
    <div style={{...rect((bw - w * k) / 2, (bh - h * k) / 2, w * k, h * k), overflow: 'hidden'}}>
      <Img src={id ? asset(id) : staticFile(file!)} style={{position: 'absolute', left: -x * k, top: -y * k, width: native[0] * k, height: native[1] * k, maxWidth: 'none'}}/>
    </div>
  </div>;
}

export function CropVideo({id, from = 0, start = 0, rate = 1, roi = [0, 0, 1920, 1080], native = [1920, 1080], box}: {
  id: string; from?: number; start?: number; rate?: number; roi?: Box; native?: [number, number]; box: Box;
}) {
  const [x, y, w, h] = roi, [bx, by, bw, bh] = box, k = Math.max(bw / w, bh / h);
  return <div style={{...rect(bx, by, bw, bh), overflow: 'hidden'}}>
    <Clip id={id} from={from} start={start} rate={rate} style={{position: 'absolute', left: (bw - w * k) / 2 - x * k, top: (bh - h * k) / 2 - y * k, width: native[0] * k, height: native[1] * k, maxWidth: 'none'}}/>
  </div>;
}

function FocusMask({box, amount}: {box: Box; amount: number}) {
  const [x, y, w, h] = box;
  return <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <defs><mask id="ep102-v7-native-mask"><rect width={1920} height={1080} fill="white"/><rect x={x} y={y} width={w} height={h} fill="black"/></mask></defs>
    <rect width={1920} height={1080} fill="#000" opacity={amount} mask="url(#ep102-v7-native-mask)"/>
  </svg>;
}

/** Only S04 retains EP108's approved monitor push. S06/S12's newer feedback withdraws it. */
function InstallAccountMaskV7({frame, width, height}: {frame: number; width: number; height: number}) {
  const sourceFrame = frame * (13.266667 / (676 / 60));
  const [first, last] = installAccountRoi.visibleSourceFrameRange;
  if (sourceFrame < first || sourceFrame > last) return null;
  const i = installAccountRoi.matches.findIndex(m => m.sourceFrame >= sourceFrame);
  const right = i < 0 ? installAccountRoi.matches.length - 1 : i;
  const a = installAccountRoi.matches[Math.max(0, right - 1)].box;
  const b = installAccountRoi.matches[right].box;
  const [mx, my] = installAccountRoi.marginPixels;
  const x = Math.min(a[0], b[0]) - mx, y = Math.min(a[1], b[1]) - my;
  const x2 = Math.max(a[0] + a[2], b[0] + b[2]) + mx, y2 = Math.max(a[1] + a[3], b[1] + b[3]) + my;
  return <div style={{...rect(x * width / 1920, y * height / 1080, (x2 - x) * width / 1920, (y2 - y) * height / 1080), background: '#27282c', borderRadius: 5, backdropFilter: 'blur(24px)', pointerEvents: 'none'}}/>;
}

export function InstallV7({frame}: Props) {
  const q = ease(frame, 30, 132), w = mix(1123.2, 1800, q), h = w * 2160 / 3836;
  const cy = mix(435, 540, q), shell = 1 - ease(frame, 98, 132), u = w / 1440;
  return <Stage><div style={{...rect((1920 - w) / 2, cy - h / 2, w, h)}}>
    <div style={{position: 'absolute', inset: 0, opacity: shell}}>
      <div style={{position: 'absolute', inset: -22 * u, borderRadius: 32, background: '#161616', boxShadow: '0 20px 42px #0003'}}/>
      <div style={{...rect(w / 2 - 65 * u, h + 15 * u, 130 * u, 100 * u), background: '#aaa'}}/>
      <div style={{...rect(w / 2 - 210 * u, h + 110 * u, 420 * u, 15 * u), borderRadius: 20, background: '#aaa'}}/>
    </div>
    <PlaybackWindowV7 box={[0, 0, w, h]} style={{opacity: 1}} radius={mix(12, 24, q)}>
      <Clip id="install" rate={13.266667 / (676 / 60)}/>
      <InstallAccountMaskV7 frame={frame} width={w} height={h}/>
    </PlaybackWindowV7>
  </div></Stage>;
}

/** N040: real content region from a recording moves forward, then returns to that recording. */
export function RecordingFocus({frame, id, from = 0, start = 0, rate = 1, roi, enter = 0, leave = 100000, slide = false}: {
  frame: number; id: string; from?: number; start?: number; rate?: number; roi: Box; enter?: number; leave?: number; slide?: boolean;
}) {
  const f = frame - from, q = ease(f, enter, enter + 34) * (1 - ease(f, leave, leave + 34));
  const [x, y, w, h] = roi, k = mix(1, Math.min(1920 / w, 1080 / h), q);
  const tx = mix(0, 960 - (x + w / 2) * k, q), ty = mix(0, 510 - (y + h / 2) * k, q);
  return <Stage><PlaybackWindowV7 style={{transform: slide ? `translateX(${mix(-1920, 0, ease(f, 0, 40))}px)` : undefined}}>
    <div style={{...rect(tx * PLAYBACK_BOX_V7[2] / 1920, ty * PLAYBACK_BOX_V7[3] / 1080, PLAYBACK_BOX_V7[2] * k, PLAYBACK_BOX_V7[3] * k)}}><Clip id={id} from={from} start={start} rate={rate}/></div>
  </PlaybackWindowV7></Stage>;
}

function FlovaMark({box}: {box: Box}) {
  return <PixelCrop file="stills/characters.jpg" roi={[14, 20, 178, 56]} box={box}/>;
}

const REFERENCES = ['reference-ep1', 'reference-ep2', 'reference-ep3'];
// Sampled true films: EP1 has 74px source letterbox, EP3 84px; avoid showing those bars.
const REFERENCE_ROI: Box[] = [[0, 74, 1920, 932], [0, 0, 1920, 1080], [0, 84, 1920, 912]];

export function PullV7({frame}: Props) {
  if (frame < 395) {
    const arrange = ease(frame, 206, 264), send = ease(frame, 286, 340), expand = ease(frame, 346, 394);
    const node = boxMix([1250, 310, 420, 420], PLAYBACK_BOX_V7, expand);
    return <Stage>
      <div style={{...rect(360, 144, 1200, 80), textAlign: 'center', fontSize: 62, fontWeight: 900, opacity: 1 - arrange}}>裤头与二胆</div>
      {REFERENCES.map((id, i) => {
        const r = boxMix(boxMix([75 + i * 600, 300, 570, 320], [160, 104 + i * 262, 430, 242], arrange), [1390, 480, 140, 78], send);
        return <React.Fragment key={id}>
          <PlaybackWindowV7 box={r} style={{opacity: 1 - send}} radius={18}>
            <CropVideo id={id} start={[8, 25, 31][i]} roi={REFERENCE_ROI[i]} box={[0, 0, r[2], r[3]]}/>
          </PlaybackWindowV7>
          <div style={{...rect(75 + i * 600, 650, 570, 65), textAlign: 'center', fontSize: 38, fontWeight: 500, opacity: 1 - arrange}}>第{['一', '二', '三'][i]}集</div>
        </React.Fragment>;
      })}
      <div style={{...pos(node), borderRadius: mix(210, 28, expand), overflow: 'hidden', background: '#000', opacity: ease(frame, 258, 286), boxShadow: '0 14px 28px #0002'}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - expand}}><FlovaMark box={[(node[2] - 292) / 2, (node[3] - 92) / 2, 292, 92]}/></div>
        <div style={{position: 'absolute', inset: 0, opacity: expand}}><Clip id="pull-command" from={346}/></div>
      </div>
    </Stage>;
  }
  if (frame < 530) return <RecordingFocus frame={frame} from={346} id="pull-command" roi={[290, 200, 1480, 670]} enter={48} leave={150}/>;
  if (frame < 866) {
    const starts = [530, 616, 660, 714, 786], n = starts.reduce((v, s, i) => frame >= s ? i : v, 0);
    // Fred: two authentic source clips at left, full-height report at right.
    return <Stage>
      <PlaybackWindowV7 box={[60, 85, 735, 413.4375]}>
        <CropVideo id="reference-ep1" from={starts[n]} start={[9, 40, 15, 171, 197][n]} roi={REFERENCE_ROI[0]} box={[0, 0, 735, 413.4375]}/>
      </PlaybackWindowV7>
      <PlaybackWindowV7 box={[60, 536, 735, 413.4375]}>
        <CropVideo id="reference-ep2" from={starts[n]} start={[25, 40, 50, 70, 85][n]} box={[0, 0, 735, 413.4375]}/>
      </PlaybackWindowV7>
      <PlaybackWindowV7 box={[835, 65, 1025, 914]}>
        <CropVideo id="pull" from={starts[n]} start={[8.6, 9.2, 11.4, 12.1, 18][n]} roi={[340, 60, 1340, 960]} box={[0, 0, 1025, 914]}/>
      </PlaybackWindowV7>
    </Stage>;
  }
  // Real report remains behind the summary; white connections lead to the real final work.
  const q = ease(frame, 866, 908), bridge = ease(frame, 930, 990), promote = ease(frame, 1030, 1090);
  return <Stage dark>
    <div style={{position: 'absolute', inset: 0, opacity: 1 - q}}><Clip id="pull" from={866} start={17.6}/></div>
    <div style={{position: 'absolute', inset: 0, background: '#000', opacity: q * .76}}/>
    {REFERENCES.map((id, i) => <div key={id} style={{...rect(90, 120 + i * 247, 410, 230), overflow: 'hidden', opacity: q * (1 - promote)}}>
      <CropVideo id={id} from={866} start={[9, 25, 31][i]} roi={REFERENCE_ROI[i]} box={[0, 0, 410, 230]}/>
    </div>)}
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: bridge * (1 - promote)}}>
      {[235, 482, 729].map(y => <path key={y} d={`M500 ${y} C660 ${y},655 472,780 472`} stroke="#fff" strokeWidth={4} fill="none"/>)}
      <path d="M1085 472 H1200" stroke="#fff" strokeWidth={4} fill="none"/>
    </svg>
    <div style={{...rect(780, 319, 305, 305), borderRadius: '50%', background: '#000', opacity: q * (1 - promote)}}><FlovaMark box={[34, 109, 238, 75]}/></div>
    <PlaybackWindowV7 box={boxMix([1200, 306, 640, 360], PLAYBACK_BOX_V7, promote)} style={{opacity: bridge}}>
      <Clip id="final-demo" from={930} start={24}/>
    </PlaybackWindowV7>
  </Stage>;
}

const CLASSICS = [
  {id: 'classic-license', from: 458, start: 5.4, native: [960, 720] as [number, number], roi: [0, 0, 960, 720] as Box},
  {id: 'daye', from: 572, start: 20.1, native: [1920, 1080] as [number, number], roi: [0, 0, 1920, 1080] as Box},
  {id: 'maidi', from: 634, start: 1.4, native: [720, 1280] as [number, number], roi: [0, 315, 720, 610] as Box},
];

function ClassicSequence({frame}: Props) {
  const selected = frame < 572 ? 0 : frame < 634 ? 1 : 2;
  return <Stage>
    {CLASSICS.map((c, i) => {
      if (i > selected) return null;
      const enter = ease(frame, c.from, c.from + 24), next = CLASSICS[i + 1]?.from ?? 714;
      const shrink = ease(frame, next, next + 30);
      const target: Box = [140 + i * 548, 620, 500, 281];
      const box = boxMix(boxMix([-1820, 19, 1640, 922], PLAYBACK_BOX_V7, enter), target, shrink);
      return <PlaybackWindowV7 key={c.id} box={box} style={{zIndex: i + 1}}>
        <CropVideo id={c.id} from={c.from} start={c.start} native={c.native} roi={c.roi} box={[0, 0, box[2], box[3]]}/>
      </PlaybackWindowV7>;
    })}
  </Stage>;
}

export function ScriptV7({frame}: Props) {
  if (frame < 458) return <RecordingFocus frame={frame} id="script" roi={[350, 120, 1380, 820]} enter={90} leave={372} slide/>;
  if (frame < 774) return <ClassicSequence frame={frame}/>;
  if (frame < 1026) {
    const q = ease(frame, 774, 810), gta = ease(frame, 845, 895);
    return <Stage>
      {CLASSICS.map((c, i) => <div key={c.id} style={{...rect(140 + i * 548, 640, 500, 281), overflow: 'hidden', opacity: 1 - ease(frame, 790, 842)}}>
        <CropVideo id={c.id} from={c.from} start={c.start} native={c.native} roi={c.roi} box={[0, 0, 500, 281]}/>
      </div>)}
      <PixelCrop id="tan-character" native={[1491, 1055]} roi={[970, 0, 521, 1055]} box={boxMix([710, 65, 500, 590], [160, 110, 520, 770], gta)} style={{opacity: q}}/>
      <div style={{...rect(820, 190, 950, 535), overflow: 'hidden', opacity: gta}}><Clip id="final-demo" from={845} start={24}/></div>
    </Stage>;
  }
  if (frame < 1179) {
    const q = ease(frame, 1026, 1056);
    return <Stage><PixelCrop id="hammer" native={[1448, 1086]} roi={[970, 0, 478, 1086]} box={boxMix([690, 180, 540, 690], [520, 80, 880, 820], q)}/></Stage>;
  }
  if (frame < 1329) {
    const q = ease(frame, 1179, 1211);
    return <Stage><PixelCrop id="disc" native={[1672, 941]} roi={[200, 0, 720, 445]} box={boxMix([550, 220, 820, 506], [280, 80, 1360, 820], q)}/></Stage>;
  }
  return <RecordingFocus frame={frame} id="script" from={1329} start={17.7} roi={[290, 100, 1470, 820]} enter={20} leave={445} slide/>;
}

const PEOPLE: NativeNode[] = [
  {id: 'tan-character', roi: [152, 310, 284, 203]},
  {id: 'daye-character', roi: [512, 310, 321, 180]},
  {id: 'maidi-character', roi: [898, 310, 323, 180]},
  {id: 'driver-character', roi: [1280, 310, 322, 180]},
];
const PROPS: NativeNode[] = [
  {id: 'stools', roi: [512, 663, 321, 180]},
  {id: 'disc', roi: [898, 663, 323, 180]},
  {id: 'hammer', roi: [1280, 636, 278, 207]},
];
const SCENES: NativeNode[] = [
  {id: 'scene-e04', roi: [72, 253, 516, 288]},
  {id: 'scene-e02', roi: [658, 253, 516, 288]},
  {id: 'scene-e01', roi: [1284, 253, 516, 288]},
];

function NativeCanvas({scene = false}: {scene?: boolean}) {
  return scene ? <Img src={asset('scene-canvas-v7')} style={{width: '100%', height: '100%'}}/> :
    <Img src={staticFile('stills/characters.jpg')} style={{width: '100%', height: '100%'}}/>;
}

/** Actual asset pixels emerge from their measured native canvas positions and return to them. */
function NativeLift({frame, node, start, end, scene = false, target = [225, 140, 1470, 740]}: {
  frame: number; node: NativeNode; start: number; end: number; scene?: boolean; target?: Box;
}) {
  const span = end - start, travel = Math.min(28, span * .30);
  const q = ease(frame, start, start + travel) * (1 - ease(frame, end - travel, end));
  const r = boxMix(node.roi, target, q), blend = ease(frame, start + travel * .65, start + travel);
  return <Stage dark><NativeCanvas scene={scene}/><AbsoluteFill style={{background: '#000', opacity: q * .48}}/>
    <div style={{...pos(r), overflow: 'hidden'}}>
      <PixelCrop id={scene ? 'scene-canvas-v7' : undefined} file={scene ? undefined : 'stills/characters.jpg'} roi={node.roi} box={[0, 0, r[2], r[3]]}/>
      <div style={{position: 'absolute', inset: 0, opacity: blend}}><Media id={node.id} style={{objectFit: 'contain'}}/></div>
    </div>
  </Stage>;
}

function SequentialLifts({frame, nodes, start, end, scene = false}: {frame: number; nodes: NativeNode[]; start: number; end: number; scene?: boolean}) {
  const span = (end - start) / nodes.length, i = Math.min(nodes.length - 1, Math.floor(Math.max(0, frame - start) / span));
  return <NativeLift frame={frame} node={nodes[i]} start={start + i * span} end={start + (i + 1) * span} scene={scene}/>;
}

/** Four-grid is the same four canvas assets; no new white/black image carrier is added. */
function NativeFourGrid({frame, start, end}: {frame: number; start: number; end: number}) {
  const grids: Box[] = [[135, 110, 785, 330], [1000, 110, 785, 330], [135, 535, 785, 330], [1000, 535, 785, 330]];
  const mask = ease(frame, start, start + 24) * (1 - ease(frame, end - 28, end));
  return <Stage dark><NativeCanvas/><AbsoluteFill style={{background: '#000', opacity: mask * .56}}/>
    {PEOPLE.map((node, i) => {
      const q = ease(frame, start + i * 5, start + 24 + i * 5) * (1 - ease(frame, end - 28, end));
      const r = boxMix(node.roi, grids[i], q);
      return <div key={node.id} style={{...pos(r), overflow: 'hidden'}}><Media id={node.id} style={{objectFit: 'contain'}}/></div>;
    })}
  </Stage>;
}

/** Bob112 231.4–236.2: same black canvas camera follows the already visible object. */
function NativeCanvasCamera({frame, start, end, roi}: {frame: number; start: number; end: number; roi: Box}) {
  const q = ease(frame, start, start + 42) * (1 - ease(frame, end - 40, end));
  const [x, y, w, h] = roi, k = mix(1, Math.min(1640 / w, 780 / h), q);
  const tx = mix(0, 960 - (x + w / 2) * k, q), ty = mix(0, 480 - (y + h / 2) * k, q);
  return <Stage dark><div style={{...rect(tx, ty, 1920 * k, 1080 * k)}}><NativeCanvas/></div></Stage>;
}

/** Pro S07-tail state 1: the same Tan and hammer emerge together from their real nodes. */
function SharedReferencePair({frame}: Props) {
  const back = ease(frame, 1288, 1355);
  const tan = ease(frame, 660, 702) * (1 - back), hammer = ease(frame, 807, 849) * (1 - back);
  const references = [
    {node: PEOPLE[0], amount: tan, target: [345, 140, 650, 700] as Box, roi: [970, 0, 521, 1055] as Box, native: [1491, 1055] as [number, number]},
    {node: PROPS[2], amount: hammer, target: [1100, 185, 620, 630] as Box, roi: [970, 0, 478, 1086] as Box, native: [1448, 1086] as [number, number]},
  ];
  return <Stage dark><NativeCanvas/><AbsoluteFill style={{background: '#000', opacity: Math.max(tan, hammer) * .57}}/>
    {references.map(({node, amount, target, roi, native}) => {
      const box = boxMix(node.roi, target, amount), blend = ease(amount, .40, .74);
      return <div key={node.id} style={{...pos(box), overflow: 'hidden'}}>
        <PixelCrop file="stills/characters.jpg" roi={node.roi} box={[0, 0, box[2], box[3]]} style={{opacity: 1 - blend}}/>
        <PixelCrop id={node.id} roi={roi} native={native} box={[0, 0, box[2], box[3]]} style={{opacity: blend}}/>
      </div>;
    })}
  </Stage>;
}

/** Pro state 3: only actual script/reference pixels accompany the genuine WorkBuddy request. */
function SceneRequestWithSources({frame}: Props) {
  const show = ease(frame, 1368, 1390), leave = ease(frame, 1518, 1540);
  const sources = ease(frame, 1402, 1434) * (1 - leave);
  return <Stage dark><NativeCanvas/><AbsoluteFill style={{background: '#000', opacity: show * .63}}/>
    <div style={{opacity: show * (1 - leave)}}>
      <CropVideo id="scene-generate" from={1368} start={4.5} roi={[570, 70, 1190, 700]} box={[375, 100, 1170, 690]}/>
    </div>
    <PixelCrop file="stills/script.jpg" roi={[560, 110, 1300, 720]} box={[160, 758, 495, 200]} style={{opacity: sources}}/>
    <div style={{opacity: sources}}>
      <CropVideo id="reference-ep1" from={1368} start={9} roi={REFERENCE_ROI[0]} box={[1295, 758, 465, 225]}/>
    </div>
  </Stage>;
}

/** Pro states 2/4: three native scene results, then one large result with its true references. */
function SceneQualityAndReturn({frame}: Props) {
  const enter = ease(frame, 1540, 1580), inspect = ease(frame, 1661, 1694), back = ease(frame, 1808, 1852);
  const amount = enter * (1 - back), groups: Box[] = [[40, 190, 580, 326], [670, 190, 580, 326], [1300, 190, 580, 326]];
  const quality: Box[] = [[1490, 620, 315, 177], [1490, 816, 315, 177], [120, 166, 1280, 720]];
  const referenceOpacity = inspect * (1 - back);
  return <Stage dark><NativeCanvas scene/><AbsoluteFill style={{background: '#000', opacity: amount * .59}}/>
    {SCENES.map((node, i) => {
      const destination = boxMix(groups[i], quality[i], inspect), box = boxMix(node.roi, destination, amount);
      const blend = ease(amount, .48, .82);
      return <div key={node.id} style={{...pos(box), overflow: 'hidden'}}>
        <PixelCrop id="scene-canvas-v7" roi={node.roi} box={[0, 0, box[2], box[3]]} style={{opacity: 1 - blend}}/>
        <div style={{position: 'absolute', inset: 0, opacity: blend}}><Media id={node.id} style={{objectFit: 'contain'}}/></div>
      </div>;
    })}
    <div style={{opacity: referenceOpacity}}>
      <PixelCrop id="tan-character" roi={[970, 0, 521, 1055]} native={[1491, 1055]} box={[1490, 130, 145, 240]}/>
      <PixelCrop id="hammer" roi={[970, 0, 478, 1086]} native={[1448, 1086]} box={[1650, 130, 145, 240]}/>
      <CropVideo id="reference-ep1" from={1661} start={15} roi={REFERENCE_ROI[0]} box={[1490, 390, 315, 177]}/>
    </div>
    {/* A return to the original node expresses revisiting it; no new verdict or modified result is invented. */}
    {frame >= 1852 && <FocusMask box={SCENES[2].roi} amount={.40 * ease(frame, 1852, 1882) * (1 - ease(frame, 1915, 1940))}/>}
  </Stage>;
}

export function AssetsV7({frame}: Props) {
  if (frame < 285) return <RecordingFocus frame={frame} id="characters" start={2.7} rate={.6} roi={[570, 140, 1200, 650]} enter={38} leave={236}/>;
  if (frame < 405) return <SequentialLifts frame={frame} nodes={PEOPLE} start={285} end={405}/>;
  if (frame < 520) return <NativeFourGrid frame={frame} start={405} end={520}/>;
  if (frame < 660) return <SequentialLifts frame={frame} nodes={PROPS} start={520} end={660}/>;
  if (frame < 1368) return <SharedReferencePair frame={frame}/>;
  if (frame < 1540) return <SceneRequestWithSources frame={frame}/>;
  if (frame < 1940) return <SceneQualityAndReturn frame={frame}/>;
  return <Stage dark><NativeCanvas scene/></Stage>;
}

export function DanceV7({frame}: Props) {
  const entry = ease(frame, 0, 38);
  return <Stage><PlaybackWindowV7 style={{transform: `translateX(${mix(-1920, 0, entry)}px)`}}>
    <Sequence durationInFrames={170} layout="none"><Media id="storm-command" rate={1.6}/></Sequence>
    <Sequence from={170} layout="none"><Media id="storm" start={1.5}/></Sequence>
  </PlaybackWindowV7></Stage>;
}

export function CanvasV7({frame}: Props) {
  // T06 native camera moves through the actual columns; black mask isolates the current group.
  const keys = [
    {start: 60, end: 235, roi: [355, 68, 220, 438] as Box},
    {start: 235, end: 380, roi: [646, 69, 140, 427] as Box},
    {start: 380, end: 518, roi: [512, 68, 123, 436] as Box},
  ];
  const n = frame < 235 ? 0 : frame < 380 ? 1 : 2, current = keys[n];
  const previous = n === 0 ? [355, 68, 700, 438] as Box : keys[n - 1].roi;
  const roi = boxMix(previous, current.roi, ease(frame, current.start, current.start + 38));
  const q = ease(frame, 60, 120) * (1 - ease(frame, 488, 540));
  const [gx, gy, gw, gh] = roi, base = 1920 / 1500, zoom = mix(1, Math.min(3.4, 620 / (gw * base)), q);
  const k = base * zoom, x = mix(0, 960 - (gx + gw / 2) * k, q), y = mix((1080 - 757 * base) / 2, 490 - (gy + gh / 2) * k, q);
  return <Stage dark><div style={{...rect(x, y, 1500 * k, 757 * k)}}><Media id="canvas" style={{objectFit: 'contain'}}/></div>
    <FocusMask box={[x + gx * k, y + gy * k, gw * k, gh * k]} amount={q * .65}/>
  </Stage>;
}
