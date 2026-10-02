import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import manifest from '../manifest.json';

const W = 2560;
const H = 1440;
const white = '#f8f8f4';
const lime = '#7C3AED';
const yellow = '#7C3AED';
const words = manifest.pages[0].exactScreenWords as {
  firstNode: string;
  secondNode: string;
  information: string;
  practice: string;
  result: string;
  subtitleA: string;
  subtitleB: string;
  subtitleC: string;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], clamp);

const box = (x: number, y: number, width: number, height: number): React.CSSProperties => ({
  position: 'absolute', left: x, top: y, width, height,
});

const Frame: React.FC<{x: number; y: number; scale: number; side: 'left' | 'right'; frame: number}> = ({x, y, scale, side, frame}) => {
  const screen = <div style={{position:'absolute',left:14,top:30,width:290,height:222,overflow:'hidden',borderRadius:6,boxShadow:'0 3px 10px #00000018'}}>
    <OffthreadVideo src={staticFile('media/q03-fred-screen.mp4')} playbackRate={.61} muted style={{width:'100%',height:'100%',objectFit:'contain'}} />
  </div>;
  const character = <div style={{position:'absolute',left:292,top:12,width:215,height:285,overflow:'hidden'}}>
    <Sequence from={0} durationInFrames={150} layout="none"><OffthreadVideo transparent src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} muted style={{width:285,height:285,marginLeft:-35}} /></Sequence>
    <Sequence from={150} durationInFrames={150} layout="none"><OffthreadVideo transparent src={staticFile('characters/Fred_皱眉思考_1440p30_Alpha.webm')} muted style={{width:285,height:285,marginLeft:-35}} /></Sequence>
    <Sequence from={300} durationInFrames={150} layout="none"><OffthreadVideo transparent src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} muted style={{width:285,height:285,marginLeft:-35}} /></Sequence>
    <Sequence from={450} durationInFrames={150} layout="none"><OffthreadVideo transparent src={staticFile('characters/Fred_皱眉思考_1440p30_Alpha.webm')} muted style={{width:285,height:285,marginLeft:-35}} /></Sequence>
  </div>;
  return <div style={{...box(x, y, 506, 285), transform: `scale(${scale})`, transformOrigin: 'top left',
    borderRadius: 9, overflow: 'hidden', background: '#fff', boxShadow: '0 12px 32px #00000026'}}>
    {side === 'left' ? <OffthreadVideo src={staticFile('media/q03-fred-writing-wide.mp4')} playbackRate={.25} muted style={{width:'100%',height:'100%',objectFit:'contain'}} /> : <>{screen}{character}</>}

  </div>;
};

const Arrow: React.FC<{x: number; y: number; width: number; progress: number; color?: string}> = ({x, y, width, progress, color = white}) => (
  <svg style={{...box(x, y, width, 40), overflow: 'visible'}} viewBox={`0 0 ${width} 40`}>
    <line x1="0" y1="20" x2={Math.max(0, width - 25) * progress} y2="20" stroke={color} strokeWidth="8" />
    {progress > 0.95 && <path d={`M ${width - 31} 1 L ${width} 20 L ${width - 31} 39 Z`} fill={color} />}
  </svg>
);

const Badge: React.FC<{x: number; y: number; width: number; height: number; text: string; color?: string; borderColor?: string; fontSize?: number; fontWeight?: number}> =
({x, y, width, height, text, color = white, borderColor = color, fontSize = 68, fontWeight = 900}) => (
  <div style={{...box(x, y, width, height), display: 'flex', alignItems: 'center', justifyContent: 'center',
               color: '#111', background: '#fff', boxShadow: '0 10px 26px #00000026', borderRadius: 27, fontFamily: 'SmileySans',
               fontWeight, fontSize, lineHeight: 1, textAlign: 'center', whiteSpace: 'pre-line'}}>{text}</div>
);

export const Q03: React.FC = () => {
  const frame = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load MiSans font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('900 68px MiSans'),
      document.fonts.load('500 68px MiSans'),
      document.fonts.load('400 36px MiSans'),
      document.fonts.load('68px SmileySans'),
    ]).then(() => continueRender(fontHandle));
  }, [fontHandle]);

  const startNodes = reveal(frame, 35, 58);
  const info = reveal(frame, 185, 208);
  const practice = reveal(frame, 280, 300);
  const result = reveal(frame, 354, 375);
  const warning = reveal(frame, 507, 527);
  const brokenLine = reveal(frame, 529, 530);
  const brokenCross = reveal(frame, 530, 534);
  const panelScale = interpolate(frame, [0, 150, 225, 285, 375], [869 / 506, 869 / 506, 632 / 506, 632 / 506, 1], clamp);
  const leftX = interpolate(frame, [0, 150, 225, 285, 375], [184, 184, 274, 274, 101], clamp);
  const leftY = interpolate(frame, [0, 24, 42, 150, 225, 285, 375], [466, 466, 183, 183, 404, 404, 466], clamp);
  const rightX = interpolate(frame, [0, 150, 225, 285, 375], [1452, 1452, 1608, 1608, 1027], clamp);
  const rightY = interpolate(frame, [0, 24, 42, 150, 225, 285, 375], [466, 466, 183, 183, 408, 408, 468], clamp);
  const infoX = interpolate(frame,[225,375],[1075,700],clamp);
  const infoWidth = interpolate(frame,[225,375],[412,198],clamp);
  const practiceX = interpolate(frame,[300,375],[2420,1718],clamp);
  const leftEdge = leftX+506*panelScale;
  const rightEdge = rightX+506*panelScale;


  return <AbsoluteFill style={{backgroundColor: '#050605', overflow: 'hidden'}}>
    <Frame x={leftX} y={leftY} scale={panelScale} side="left" frame={frame} />
    <Frame x={rightX} y={rightY} scale={panelScale} side="right" frame={frame} />
    {startNodes > 0 && <>
      <div style={{...box(835, 940, 885, 6), opacity: (1 - info) * startNodes,
        background: 'repeating-linear-gradient(90deg,#aaa 0 10px,transparent 10px 26px)'}} />
      <div style={{...box(1700, 920, 0, 0), opacity: (1 - info) * startNodes,
        borderTop: '22px solid transparent', borderBottom: '22px solid transparent',
        borderLeft: '34px solid #aaa'}} />
      <div style={{opacity: startNodes}}><Badge
        x={interpolate(frame, [90, 225, 375], [469, 475, 262], clamp)}
        y={interpolate(frame, [90, 225, 375], [835, 869, 842], clamp)}
        width={interpolate(frame, [90, 225, 375], [315, 230, 184], clamp)}
        height={interpolate(frame, [90, 225, 375], [212, 155, 124], clamp)}
        text={words.firstNode} fontSize={interpolate(frame, [90, 225, 375], [128, 94, 68], clamp)}
        fontWeight={500} /></div>
      <div style={{opacity: (1 - info) * startNodes, ...box(1728, 835, 315, 212),
        background: '#fff', boxShadow: '0 10px 26px #00000026', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'SmileySans', fontWeight: 500, fontSize: 128, color: '#111'}}>{words.secondNode}</div>
    </>}
    {info > 0 && <div style={{opacity: info}}>
      <Badge x={interpolate(frame, [225, 375], [1075, 700], clamp)}
        y={interpolate(frame, [225, 375], [507, 568], clamp)}
        width={interpolate(frame, [225, 375], [412, 198], clamp)}
        height={interpolate(frame, [225, 375], [170, 90], clamp)}
        text={words.information} borderColor={yellow}
        fontSize={interpolate(frame, [225, 375], [122, 70], clamp)} fontWeight={500} />
      <Arrow x={leftEdge+12} y={interpolate(frame,[225,375],[573,591],clamp)} width={Math.max(0,infoX-leftEdge-24)} progress={info} />
      <Arrow x={infoX+infoWidth+12}
        y={interpolate(frame, [225, 375], [573, 591], clamp)}
        width={Math.max(0,rightX-infoX-infoWidth-24)} progress={info} />
    </div>}
    {practice > 0 && <div style={{opacity: practice}}>
      <Arrow x={rightEdge+12} y={591} width={Math.max(0,practiceX-rightEdge-24)} progress={practice} />
      <Badge x={interpolate(frame,[300,375],[2420,1718],clamp)} y={498} width={199} height={224} text={words.practice} borderColor={yellow} fontSize={69} fontWeight={500} />
    </div>}
    {result > 0 && <div style={{opacity: result}}>
      <Arrow x={1920} y={591} width={150} progress={result} />
      <div style={{...box(2097, 521, 294, 178), boxShadow: '0 10px 26px #00000026', borderRadius: 13,
        background: lime, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'SmileySans', fontWeight: 500, fontSize: 128, color: '#fff'}}>{words.result}</div>
    </div>}
    {warning > 0 && <div style={{opacity: warning}}>
      <div style={{...box(332, 989, 0, 0), borderLeft: '53px solid transparent', borderRight: '53px solid transparent',
        borderBottom: '70px solid #ff8b00'}} />
    </div>}
    {brokenLine > 0 && <svg style={{...box(0, 0, W, H), overflow: 'visible'}} viewBox={`0 0 ${W} ${H}`}>
      <path d="M 490 910 H 2270 V 742" fill="none" stroke="#ff2208" strokeWidth="8"
        pathLength={1} strokeDasharray="1" strokeDashoffset={1 - brokenLine} />
      {brokenLine > 0.95 && <path d="M 2251 762 L 2270 730 L 2289 762 Z" fill="#ff2208" />}
    </svg>}
    {brokenCross > 0 && <div style={{...box(1220, 830, 160, 160), opacity: brokenCross,
      color: '#ff2208', fontFamily: 'MiSans', fontWeight: 900, fontSize: 180,
      lineHeight: '160px', textAlign: 'center'}}>×</div>}
    <Sequence from={600} durationInFrames={60}>
      <AbsoluteFill style={{background: '#fff'}}>
        <OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')}
          style={{position:'absolute',width:1440,height:1440,left:560,top:0,objectFit:'contain'}} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>;
};
