import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from 'remotion';
import {asset, mix, rect} from '../common';
import {PLAYBACK_BOX_V7, PlaybackWindowV7, PixelCrop, StableMediaV7} from './MediaRevisionV7';
import {AssetsReferenceV8} from './AssetsReferenceV8';

type Box = [number, number, number, number];
type NativeNode = {id: string; roi: Box; label: string; file?: string};
const travel = (frame: number, from: number, to: number) => interpolate(frame, [from, to], [0, 1], {
  easing: Easing.bezier(.65, 0, .2, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
});
const blend = (from: Box, to: Box, amount: number): Box => from.map((value, index) => mix(value, to[index], amount)) as Box;

// These positions are measured in the real 1920×1080 canvas view, not a new layout.
const PEOPLE: NativeNode[] = [
  {id: 'tan-character', roi: [152, 310, 284, 203], label: '谭警官', file: 'v8-generated/tan-character-wide-v8.png'},
  {id: 'daye-character', roi: [512, 310, 321, 180], label: '二仙桥大爷'},
  {id: 'maidi-character', roi: [898, 310, 323, 180], label: '卖碟哥'},
  {id: 'driver-character', roi: [1280, 310, 322, 180], label: '司机'},
];
const PROPS: NativeNode[] = [
  {id: 'stools', roi: [512, 663, 321, 180], label: '板凳'},
  {id: 'disc', roi: [898, 663, 323, 180], label: '光盘'},
  {id: 'hammer', roi: [1280, 636, 278, 207], label: '红绿灯武器', file: 'v8-generated/hammer-wide-v8.png'},
];
const SCENES: NativeNode[] = [
  {id: 'scene-e04', roi: [72, 253, 516, 288], label: '巷口场景'},
  {id: 'scene-e02', roi: [658, 253, 516, 288], label: '货车场景'},
  {id: 'scene-e01', roi: [1284, 253, 516, 288], label: '高架路场景'},
];
const PEOPLE_TARGETS: Box[] = [[140, 90, 735, 414], [1045, 90, 735, 414], [140, 540, 735, 414], [1045, 540, 735, 414]];
const PROP_TARGETS: Box[] = [[70, 300, 560, 315], [680, 300, 560, 315], [1290, 300, 560, 315]];

function CanvasWindow({children}: {children: React.ReactNode}) {
  return <AbsoluteFill style={{background: '#fff'}}><PlaybackWindowV7 style={{background: '#000'}}>
    <div style={{...rect(0, 0, 1920, 1080), transform: `scale(${PLAYBACK_BOX_V7[2] / 1920})`, transformOrigin: 'top left', overflow: 'hidden'}}>{children}</div>
  </PlaybackWindowV7></AbsoluteFill>;
}
function NativeCanvas({scene = false, dim = 0, blur = 0}: {scene?: boolean; dim?: number; blur?: number}) {
  return <><Img src={scene ? asset('scene-canvas-v7') : staticFile('stills/characters.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${blur}px)`, transform: `scale(${1 + blur * .002})`}}/>
    <AbsoluteFill style={{background: '#000', opacity: dim}}/>
  </>;
}
function NativePixels({node, scene, width, height}: {node: NativeNode; scene: boolean; width: number; height: number}) {
  const native: [number, number] = scene ? [3840, 2160] : [3836, 2160];
  const roi = node.roi.map((value, index) => value * native[index % 2] / (index % 2 ? 1080 : 1920)) as Box;
  return <PixelCrop id={scene ? 'scene-canvas-v7' : undefined} file={scene ? undefined : 'stills/characters.jpg'} native={native} roi={roi} box={[0, 0, width, height]} fit="cover"/>;
}
function LiftedAsset({node, destination, amount, scene = false}: {node: NativeNode; destination: Box; amount: number; scene?: boolean}) {
  const box = blend(node.roi, destination, amount);
  const reveal = travel(amount, .20, .72), label = travel(amount, .35, .75);
  const labelWidth = node.label.length > 4 ? 330 : 280;
  return <div style={{...rect(...box), borderRadius: mix(12, 22, amount), overflow: 'hidden'}}>
    <NativePixels node={node} scene={scene} width={box[2]} height={box[3]}/>
    <div style={{position: 'absolute', inset: 0, opacity: reveal}}>
      <Img src={node.file ? staticFile(node.file) : asset(node.id)} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
    </div>
    <div style={{...rect((box[2] - labelWidth) / 2, box[3] - 65, labelWidth, 65), opacity: label, borderRadius: 17, background: '#080808e8', color: '#fff', fontSize: 42, fontWeight: 900, lineHeight: '65px', textAlign: 'center'}}>{node.label}</div>
  </div>;
}

// Keep every native node visible; the selected real pixels grow before the full asset replaces them.
function AssetGroup({frame, nodes, targets, start, end}: {frame: number; nodes: NativeNode[]; targets: Box[]; start: number; end: number}) {
  const back = travel(frame, end - 28, end), first = travel(frame, start, start + 36);
  return <CanvasWindow><NativeCanvas dim={first * (1 - back) * .50} blur={first * (1 - back) * 8}/>
    {nodes.map((node, index) => <LiftedAsset key={node.id} node={node} destination={targets[index]} amount={travel(frame, start + index * 6, start + 36 + index * 6) * (1 - back)}/>)}
  </CanvasWindow>;
}
function SharedWideReference({frame}: {frame: number}) {
  const back = travel(frame, 865, 900), tan = travel(frame, 660, 704) * (1 - back), hammer = travel(frame, 755, 800) * (1 - back);
  return <CanvasWindow><NativeCanvas dim={Math.max(tan, hammer) * .50} blur={Math.max(tan, hammer) * 8}/>
    <LiftedAsset node={{...PEOPLE[0], id: 'tan-single', file: 'v8-generated/tan-single-wide-v8.png'}} destination={[160, 170, 730, 411]} amount={tan}/>
    <LiftedAsset node={PROPS[2]} destination={[1030, 170, 730, 411]} amount={hammer}/>
  </CanvasWindow>;
}
function SceneLifts({frame}: {frame: number}) {
  const enter = travel(frame, 1540, 1590), back = travel(frame, 1852, 1940);
  const review = travel(frame, 1661, 1691) * (1 - travel(frame, 1875, 1915));
  const first: Box[] = [[270, 135, 1150, 647], [1490, 175, 345, 194], [1490, 475, 345, 194]];
  return <CanvasWindow><NativeCanvas scene dim={enter * (1 - back) * .38}/>
    <AbsoluteFill style={{filter: `blur(${review * 10}px)`}}>
      {SCENES.map((node, index) => <LiftedAsset key={node.id} node={node} scene destination={first[index]} amount={enter * (1 - back)}/>)}
    </AbsoluteFill>
    <AbsoluteFill style={{background: '#000', opacity: review * .50}}/>
    <div style={{...rect(0, 360, 1920, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: review, color: '#fff', fontSize: 88, fontWeight: 900, letterSpacing: 2}}>评估输出质量</div>
  </CanvasWindow>;
}

/** S07-only repair. The supplied image guides layout; dynamic pixel fidelity is still unverified. */
export function AssetsReferenceV9({frame}: {frame: number}) {
  // Fixed S04 geometry and a level recording replace the unrequested RecordingFocus zoom.
  if (frame < 285) return <StableMediaV7 id="characters" start={2.7} rate={.6}/>;
  if (frame < 520) return <AssetGroup frame={frame} nodes={PEOPLE} targets={PEOPLE_TARGETS} start={285} end={520}/>;
  if (frame < 660) return <AssetGroup frame={frame} nodes={PROPS} targets={PROP_TARGETS} start={520} end={660}/>;
  if (frame < 900) return <SharedWideReference frame={frame}/>;
  // This is Fred's accepted B011 shot-change implementation, without re-layout or retiming.
  if (frame < 1368) return <AssetsReferenceV8 frame={frame}/>;
  if (frame < 1540) return <StableMediaV7 id="scene-generate" from={1368} start={4.5}/>;
  if (frame < 1940) return <SceneLifts frame={frame}/>;
  return <StableMediaV7 id="scene-canvas-v7" from={1940}/>;
}
