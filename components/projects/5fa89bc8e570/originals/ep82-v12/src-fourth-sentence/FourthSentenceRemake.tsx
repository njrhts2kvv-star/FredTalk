import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import contract from '../../docs/fourth-sentence-production-contract.json';
import {UserNode} from '../src-third-sentence/UserNode';
import {ContextCard, MiniResult, ResultDocument, type ContextKind} from './ContextCards';
import {SharedCanvas} from './SharedCanvas';
import {PermissionOrbit} from './PermissionOrbit';
import {crisp, mix, smooth} from './motion';

const BASE_FPS = 30;
const FONT = 'MiSans, PingFang SC, Helvetica Neue, Arial, sans-serif';

const StateLabel: React.FC<{text: string; x: number; y: number; width: number; height: number; reveal: number; fontSize: number}> = ({text, x, y, width, height, reveal, fontSize}) => (
  <div style={{position: 'absolute', left: x, top: y, width, height, borderRadius: height * 0.3, background: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0 round ${height * 0.3}px)`, fontSize, fontWeight: 600, letterSpacing: -4, lineHeight: 1, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap'}}>{text}</div>
);

const CarryScene: React.FC<{frame: number}> = ({frame}) => {
  const leave = smooth(frame, 18, 46);
  const wipeLeft = mix(4050, -800, leave);
  const nodes = [{x: 1220, y: 470}, {x: 3000, y: 470}, {x: 3000, y: 1550}];
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: -240, top: 1060, width: 640, height: 1780, borderRadius: 180, background: '#000000', transform: 'translateY(-50%)'}} />
      <Img src={staticFile('brand/doubao-work-logo-transparent.png')} style={{position: 'absolute', left: 820, top: 1050, width: 520, height: 520, objectFit: 'contain', transform: 'translate(-50%, -50%)'}} />
      <svg width={3840} height={2160} style={{position: 'absolute', inset: 0}}>{nodes.map((node, index) => <line key={index} x1={1920} y1={1090} x2={node.x} y2={node.y} stroke="#000" strokeWidth={10} strokeLinecap="round" />)}</svg>
      {nodes.map((node, index) => <UserNode key={index} x={node.x} y={node.y} size={390} />)}
      <div style={{position: 'absolute', left: 1920, top: 1090, width: 864, height: 440, border: '10px solid #000000', borderRadius: 120, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translate(-50%, -50%)', fontSize: 184, fontWeight: 600, letterSpacing: -5}}>一次任务</div>
      <StateLabel text="团队协作" x={1920} y={1835} width={762} height={265} reveal={1} fontSize={138} />
      <svg width={3840} height={2160} style={{position: 'absolute', inset: 0}}>
        <ellipse cx={wipeLeft + 2600} cy={1080} rx={2600} ry={2400} fill="#FFFFFF" />
      </svg>
    </div>
  );
};

const ContextStage: React.FC<{frame: number}> = ({frame}) => {
  const bandEnter = crisp(frame, 50, 70);
  const merge = smooth(frame, 210, 278);
  const share = smooth(frame, 292, 334);
  const permission = smooth(frame, 348, 379);
  const dip = smooth(frame, 145, 190);
  const bandX = mix(4800, 1920, bandEnter);
  const bandY = mix(mix(1080, 1210, dip), 1080, merge);
  const bandWidth = mix(mix(mix(3600, 3650, dip), mix(2200, 3400, share), merge), 2450, permission);
  const bandHeight = mix(mix(620, 760, dip), mix(1320, 940, share), merge);
  const bandRadius = mix(100, mix(250, 300, share), merge);
  const cardSpecs: Array<{title: string; kind: ContextKind; start: number; x: number}> = [
    {title: '项目文档', kind: 'document', start: 60, x: 720},
    {title: '群聊', kind: 'chat', start: 80, x: 1490},
    {title: '会议纪要', kind: 'meeting', start: 100, x: 2260},
    {title: '任务', kind: 'task', start: 120, x: 3030},
  ];
  const resultX = mix(mix(1920, 1250, share), 1810, permission);
  const resultY = mix(1030, 1160, share);
  const resultWidth = mix(1900, 1380, share);
  const resultHeight = mix(1120, 800, share);

  return (
    <>
      <div style={{position: 'absolute', left: bandX, top: bandY, width: bandWidth, height: bandHeight, borderRadius: `${bandRadius}px ${mix(bandRadius, 470, permission)}px ${mix(bandRadius, 470, permission)}px ${bandRadius}px`, background: '#000000', transform: 'translate(-50%, -50%)'}} />
      {frame >= 292 && frame < 365 ? <div style={{position: 'absolute', left: bandX + bandWidth / 2 + 55, top: bandY, width: 430, height: 650, background: '#000000', clipPath: 'polygon(0 0, 100% 50%, 0 100%)', transform: `translate(-50%, -50%) scale(${crisp(frame, 292, 318)})`, transformOrigin: '0 50%'}} /> : null}
      {frame >= 60 && frame < 242 ? cardSpecs.map((card, index) => {
        const arrive = crisp(frame, card.start, card.start + 18);
        const cardScale = mix(1, 0.52, crisp(frame, 210, 242));
        const x = mix(4380, mix(card.x, 1350 + index * 390, crisp(frame, 210, 242)), arrive);
        const y = mix(1080, 1040, merge) + mix(0, 120, dip);
        return <ContextCard key={card.title} title={card.title} kind={card.kind} x={x} y={y} width={650} height={480} scale={cardScale} />;
      }) : null}
      {frame >= 304 ? <MiniResult x={mix(2720, 1810, permission)} y={1160} width={360} reveal={crisp(frame, 310, 328)} blue /> : null}
      {frame >= 314 ? <MiniResult x={mix(3240, 2820, permission)} y={1160} width={360} reveal={crisp(frame, 320, 338)} /> : null}
      {frame >= 242 ? <ResultDocument x={resultX} y={bandY} width={mix(resultWidth, 1280, permission)} height={Math.min(resultHeight, bandHeight - 200)} clip={crisp(frame, 242, 254)} /> : null}
      {frame >= 300 ? <UserNode x={mix(500, 980, permission)} y={1160} size={250} scale={crisp(frame, 300, 318)} /> : null}
      {frame >= 350 ? <PermissionOrbit frame={frame} /> : null}
      {frame >= 176 && frame < 304 ? <StateLabel text="授权范围内" x={1920} y={1900} width={1020} height={230} reveal={frame < 292 ? crisp(frame, 176, 192) : 1 - crisp(frame, 292, 304)} fontSize={128} /> : null}
      {frame >= 300 && frame < 369 ? <StateLabel text="分享" x={1920} y={390} width={560} height={220} reveal={frame < 355 ? crisp(frame, 300, 314) : 1 - crisp(frame, 355, 369)} fontSize={132} /> : null}
      {frame >= 371 ? <StateLabel text="设置权限" x={1920} y={360} width={790} height={220} reveal={crisp(frame, 371, 387)} fontSize={122} /> : null}
    </>
  );
};

export const FourthSentenceRemake: React.FC = () => {
  const renderFrame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const baseFrame = (renderFrame * BASE_FPS) / fps;
  const frame = interpolate(baseFrame, contract.referenceTimeMap.sourceFrames, contract.referenceTimeMap.motionFrames, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const canvasReveal = 1;
  return (
    <AbsoluteFill style={{background: '#FFFFFF', color: '#000000', overflow: 'hidden', fontFamily: FONT}}>
      <style>{`@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Medium.otf')}');font-weight:500;}@font-face{font-family:MiSans;src:url('${staticFile('fonts/MiSans-Semibold.otf')}');font-weight:600;}*{box-sizing:border-box;}`}</style>
      {frame < 56 ? <CarryScene frame={frame} /> : null}
      {frame >= 46 && frame < 414 ? <ContextStage frame={frame} /> : null}
      {frame >= 414 ? <SharedCanvas frame={frame} reveal={canvasReveal} /> : null}
      <Audio src={staticFile('fourth-sentence/source-audio.m4a')} />
    </AbsoluteFill>
  );
};
