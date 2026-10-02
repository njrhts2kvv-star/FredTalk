import React from 'react';
import {UserNode} from '../src-third-sentence/UserNode';
import {crisp, mix} from './motion';

const Cursor: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
  <svg width="190" height="230" viewBox="0 0 190 230" style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${scale})`, filter: 'drop-shadow(18px 20px 12px rgba(0,0,0,0.20))'}}>
    <path d="M16 10 L16 186 L62 144 L93 216 L132 198 L101 128 L170 127 Z" fill="#000000" stroke="#FFFFFF" strokeWidth="13" strokeLinejoin="round" />
  </svg>
);

const EditorPanel: React.FC<{side: 'left' | 'right'; x: number; y: number; active: number}> = ({side, x, y, active}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 820, height: 590, borderRadius: 48, background: '#F1F4F7', overflow: 'hidden', transform: 'translate(-50%, -50%)'}}>
    {side === 'right' ? (
      <>
        <div style={{position: 'absolute', inset: '100px 0 0 0', backgroundImage: 'linear-gradient(#C8CDD2 3px, transparent 3px),linear-gradient(90deg,#C8CDD2 3px,transparent 3px)', backgroundSize: '92px 92px'}} />
        <div style={{position: 'absolute', left: 36, top: 32, width: 34, height: 34, borderRadius: '50%', background: '#1976E9'}} />
        {[110, 176, 242].map((left) => <div key={left} style={{position: 'absolute', left, top: 36, width: 32, height: 32, borderRadius: '50%', background: '#B8BEC4'}} />)}
      </>
    ) : null}
    <div style={{position: 'absolute', left: side === 'left' ? 72 : 400, top: side === 'left' ? 90 : 150, width: 340, height: 210, borderRadius: 28, background: '#FFFFFF', border: `${mix(0, 12, active)}px solid #1674E8`, padding: 34, display: 'grid', gap: 20}}>
      <div style={{width: 210, height: 25, borderRadius: 20, background: '#222528'}} />
      <div style={{width: 250, height: 20, borderRadius: 20, background: '#AEB3B8'}} />
      <div style={{width: 180, height: 20, borderRadius: 20, background: '#AEB3B8'}} />
    </div>
    {side === 'left' ? (
      <div style={{position: 'absolute', right: 58, bottom: 70, width: 370, height: 230, borderRadius: 34, background: '#FFFFFF', padding: 46, display: 'grid', gap: 24}}>
        <div style={{width: 250, height: 24, borderRadius: 20, background: '#73787D'}} />
        <div style={{width: 295, height: 22, borderRadius: 20, background: '#B1B6BA'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}><div style={{width: 44, height: 44, border: '7px solid #565A5E', borderRadius: 8}} /><div style={{width: 190, height: 22, borderRadius: 20, background: '#AEB3B8'}} /></div>
      </div>
    ) : null}
    {side === 'right' && active > 0 ? <div style={{position: 'absolute', inset: 28, border: '8px dashed #1674E8', borderRadius: 28}} /> : null}
  </div>
);

export const SharedCanvas: React.FC<{frame: number; reveal: number}> = ({frame, reveal}) => {
  const nodeProgress = crisp(frame, 420, 440);
  const leftCursor = crisp(frame, 424, 451);
  const rightCursor = crisp(frame, 430, 457);
  const leftActive = crisp(frame, 442, 454);
  const rightActive = crisp(frame, 456, 474);
  const nodes = [
    {x: 340, y: 280, fromX: 760, fromY: 600},
    {x: 3500, y: 280, fromX: 3060, fromY: 600},
    {x: 340, y: 1840, fromX: 760, fromY: 1520},
    {x: 3500, y: 1840, fromX: 3060, fromY: 1520},
  ];

  return (
    <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}}>
      <svg width={3840} height={2160} viewBox="0 0 3840 2160" style={{position: 'absolute', inset: 0}}>
        {nodes.map((node, index) => {
          const endX = index % 2 === 0 ? 860 : 2980;
          const endY = index < 2 ? 600 : 1520;
          const length = Math.hypot(endX - node.x, endY - node.y);
          return <line key={index} x1={node.x} y1={node.y} x2={endX} y2={endY} stroke="#000000" strokeWidth={10} strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - nodeProgress)} />;
        })}
      </svg>
      {nodes.map((node, index) => <UserNode key={index} x={node.x} y={node.y} size={390} scale={nodeProgress} />)}
      <div style={{position: 'absolute', left: 1920, top: 1060, width: 2160, height: 1200, border: '10px solid #000000', borderRadius: 130, background: '#FFFFFF', boxShadow: '0 40px 90px rgba(0,0,0,0.12)', transform: 'translate(-50%, -50%)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 120, top: 96, fontSize: 152, fontWeight: 600, letterSpacing: -6, lineHeight: 1}}>共同编辑画布</div>
        <EditorPanel side="left" x={570} y={770} active={leftActive} />
        <EditorPanel side="right" x={1590} y={770} active={rightActive} />
      </div>
      <Cursor x={mix(1250, 1390, leftCursor)} y={mix(1900, 1290, leftCursor)} scale={mix(0.86, 1, leftCursor)} />
      <Cursor x={mix(3160, 2610, rightCursor)} y={mix(2020, 1330, rightCursor)} scale={mix(0.86, 1, rightCursor)} />
      <div style={{position: 'absolute', left: 1920, top: 1935, width: 760, height: 220, borderRadius: 68, background: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translate(-50%, -50%)', fontSize: 126, fontWeight: 600, letterSpacing: -4}}>一起编辑</div>
    </div>
  );
};
