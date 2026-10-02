import React from 'react';

const GRAY = '#AEB1B4';

const Line: React.FC<{width: number; height?: number; dark?: boolean}> = ({width, height = 20, dark}) => (
  <div style={{width, height, borderRadius: height, background: dark ? '#292B2D' : GRAY}} />
);

const ChatRows: React.FC = () => (
  <div style={{display: 'grid', gap: 24, marginTop: 30}}>
    {[0, 1].map((item) => (
      <div key={item} style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{width: 62, height: 62, borderRadius: '50%', background: '#C4C7CA'}} />
        <div style={{display: 'grid', gap: 16}}>
          <Line width={250 - item * 35} height={18} />
          <Line width={180 - item * 20} height={18} />
        </div>
      </div>
    ))}
  </div>
);

const TaskRows: React.FC = () => (
  <div style={{display: 'grid', gap: 24, marginTop: 34}}>
    {[0, 1, 2].map((item) => (
      <div key={item} style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{width: 42, height: 42, borderRadius: 8, border: '7px solid #8E9296', display: 'grid', placeItems: 'center'}}>
          <div style={{width: 22, height: 12, borderLeft: '7px solid #242628', borderBottom: '7px solid #242628', transform: 'translateY(-3px) rotate(-45deg)'}} />
        </div>
        <Line width={230 - item * 16} height={18} />
      </div>
    ))}
  </div>
);

export type ContextKind = 'document' | 'chat' | 'meeting' | 'task';

export const ContextCard: React.FC<{
  title: string;
  kind: ContextKind;
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: number;
}> = ({title, kind, x, y, width, height, scale = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      padding: '52px 54px',
      borderRadius: 64,
      background: '#FFFFFF',
      color: '#000000',
      transform: `translate(-50%, -50%) scale(${scale})`,
      transformOrigin: '50% 50%',
      overflow: 'hidden',
    }}
  >
    <div style={{fontSize: 94, lineHeight: 1, fontWeight: 600, letterSpacing: -4, whiteSpace: 'nowrap'}}>{title}</div>
    {kind === 'chat' ? <ChatRows /> : null}
    {kind === 'task' ? <TaskRows /> : null}
    {kind === 'document' || kind === 'meeting' ? (
      <div style={{display: 'grid', gap: 24, marginTop: 44}}>
        <Line width={kind === 'meeting' ? 445 : 420} height={20} />
        <Line width={360} height={20} />
        <Line width={kind === 'meeting' ? 420 : 385} height={20} />
        <Line width={300} height={20} />
      </div>
    ) : null}
  </div>
);

export const ResultDocument: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  clip: number;
}> = ({x, y, width, height, clip}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 1900,
      height: 1120,
      borderRadius: 150,
      background: '#FFFFFF',
      padding: '100px 110px',
      transform: `translate(-50%, -50%) scale(${width / 1900}, ${height / 1120})`,
      clipPath: `inset(0 ${(1 - clip) * 100}% 0 0 round 150px)`,
      overflow: 'hidden',
    }}
  >
    <div style={{fontSize: 150, lineHeight: 1, fontWeight: 600, letterSpacing: -6}}>项目文档</div>
    <div style={{display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 90, marginTop: 95}}>
      <div style={{display: 'grid', gap: 30, alignContent: 'start'}}>
        <Line width={620} height={28} />
        <Line width={620} height={28} />
        <Line width={560} height={28} />
        <div style={{height: 190, borderRadius: 34, background: '#ECEEEF', marginTop: 42, display: 'flex', alignItems: 'flex-end', padding: 36}}>
          <Line width={220} height={24} />
        </div>
      </div>
      <div style={{display: 'grid', gap: 34, alignContent: 'start'}}>
        <div style={{height: 160, borderRadius: 34, background: '#ECEEEF', padding: 36, display: 'grid', gap: 24}}>
          <Line width={360} height={24} dark />
          <Line width={290} height={20} />
        </div>
        <TaskRows />
      </div>
    </div>
  </div>
);

export const MiniResult: React.FC<{x: number; y: number; width: number; reveal: number; blue?: boolean}> = ({x, y, width, reveal, blue}) => (
  <div style={{position: 'absolute', left: x, top: y, width, height: width * 0.58, borderRadius: 38, background: '#FFFFFF', padding: 34, transform: `translate(-50%, -50%) scale(${reveal})`, display: 'grid', gridTemplateColumns: '72px 1fr', gap: 24, alignItems: 'center'}}>
    <div style={{width: 72, height: 72, borderRadius: '50%', background: blue ? '#1574E8' : '#D8E1EF'}} />
    <div style={{display: 'grid', gap: 15}}><Line width={width * 0.45} height={16} dark /><Line width={width * 0.38} height={14} /><Line width={width * 0.3} height={14} /></div>
  </div>
);
