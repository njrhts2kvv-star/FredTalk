import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const p = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
type Tile = {id: string; from: [number, number, number, number]; to: [number, number, number, number]; placeholderAt: number; start: number};
const tiles: Tile[] = [
  {id: 'woman', from: [150,198,434,688], to: [90,118,260,412], placeholderAt: -1, start: 25},
  {id: 'room', from: [643,198,432,688], to: [98,600,260,410], placeholderAt: 10, start: 34},
  {id: 'clock', from: [1128,190,325,322], to: [484,702,196,192], placeholderAt: 15, start: 55},
  {id: 'note', from: [1490,188,324,322], to: [484,229,195,192], placeholderAt: 18, start: 66},
  {id: 'scene', from: [1120,551,712,325], to: [797,482,428,194], placeholderAt: 20, start: 72},
];

const TileView: React.FC<{tile: Tile; frame: number}> = ({tile, frame}) => {
  const move = p(frame, 103, 135);
  const revealGeometry = p(frame, 0, 18);
  const [x, y, w, h] = tile.from.map((n, i) => interpolate(move, [0, 1], [n, tile.to[i]], clamp));
  const initialScale = tile.id === 'woman' ? .57+.43*revealGeometry : .82+.18*revealGeometry;
  const visible = p(frame, tile.placeholderAt, tile.placeholderAt + 8);
  const filled = p(frame, tile.start, tile.start + 22);
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h,
    borderRadius: 32, background: '#888', opacity: visible, transform: `scale(${initialScale})`, transformOrigin: 'center',
    boxShadow: '0 9px 24px #0005', overflow: 'hidden'}}>
    <Img src={staticFile(`sp015-${tile.id}.png`)} style={{width: '100%', height: '100%',
      objectFit: 'fill', opacity: filled}} />
  </div>;
};

const Motion: React.FC<{extended: boolean}> = ({extended}) => {
  const f = useCurrentFrame();
  const connect = p(f, 136, 155);
  const result = p(f, 167, 184);
  const lifted = extended ? p(f,250,274) : 0;
  const seedance = extended ? p(f,251,272) : 0;
  const dim=extended ? 1-.94*p(f,350,375) : 1;
  const exit=extended ? 1-p(f,376,388) : 1;
  return <AbsoluteFill style={{background: '#151515', overflow: 'hidden'}}>
    <AbsoluteFill style={{opacity:dim*exit}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      {[[350,320],[350,800],[680,800],[680,320]].map(([x,y], i) =>
        <line key={i} x1={x} y1={y} x2="797" y2={579-230*lifted} stroke="#c8c8c8" strokeWidth="2.5"
          opacity={connect} />)}
      <line x1="1225" y1={579-230*lifted} x2="1399" y2={579-230*lifted} stroke="#c8c8c8" strokeWidth="2.5" opacity={result} />
    </svg>
    {tiles.map((tile) => <TileView key={tile.id} tile={tile.id==='scene' ? {...tile,to:[797,482-230*lifted,428,194]} : tile} frame={f} />)}
    </AbsoluteFill>
    <div style={{position: 'absolute', left: 1399, top: 465-230*lifted, width: 383, height: 237,
      borderRadius: 50, background: '#111', opacity: (f>=167?1:0)*exit, overflow: 'hidden'}}>
      {f>=167 ? <Img src={staticFile(`code-revision/${extended?'sp016':'sp015'}-result/${String(Math.min(f,extended?388:243)).padStart(4,'0')}.png`)} style={{width:'100%',height:'100%',objectFit:'fill'}}/> : <Img src={staticFile('sp015-result.png')} style={{width:'100%',height:'100%'}}/>}
    </div>
    {extended && <div style={{position: 'absolute', left: 795, top: 680, color: '#7C3AED',
      fontSize: 165, fontStyle: 'italic', fontWeight: 900, letterSpacing: -4,
      opacity: seedance*dim*exit, fontFamily: 'MiSans, sans-serif'}}>Seedance2.0</div>}
  </AbsoluteFill>;
};

export const SP015: React.FC = () => <Motion extended={false} />;
export const SP016: React.FC = () => <Motion extended />;
