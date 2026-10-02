import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const tween = (f: number, input: number[], output: number[]) => interpolate(f, input, output, clamp);

const entries = [
  {label: '文档', color: '#3c85ff', icon: '▰', col: 0, row: 0, at: 0},
  {label: '表格', color: '#9851e6', icon: '☷', col: 1, row: 0, at: 11},
  {label: '群聊', color: '#38b9f2', icon: '●', col: 0, row: 1, at: 34},
  {label: '会议纪要', color: '#7778de', icon: '◢', col: 1, row: 1, at: 57},
  {label: '日历', color: '#ffb51d', icon: '26', col: 0, row: 2, at: 84},
  {label: '组织关系', color: '#388cff', icon: '◆', col: 1, row: 2, at: 101},
  {label: '请假审批', color: '#3d93f5', icon: '✓', col: 0, row: 3, at: 134},
] as const;

export const Q01: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load SmileySans for Q01'));
  useEffect(() => {
    document.fonts.load('31px SmileySans').then(() => continueRender(fontHandle));
  }, [fontHandle]);
  // The reference camera settles on the grid, then moves it left as one object.
  const groupScale = tween(f, [0, 28, 120, 193, 210], [1.18, 1.18, 1, 1, 1]);
  const groupX = tween(f, [0, 28, 120, 174, 195], [250, 250, 290, 290, 96]);
  const groupY = tween(f, [0, 28, 120, 174, 195], [113, 113, 89, 89, 89]);
  const cardW = 176;
  const cardH = 59;
  const gapX = 25;
  const gapY = 37;
  const box = tween(f, [183, 189, 195], [0, .6, 1]);
  const lines = tween(f, [184, 194, 201], [0, .7, 1]);
  const logo = tween(f, [181, 190, 198], [0, .6, 1]);
  return <AbsoluteFill style={{background: '#050505', overflow: 'hidden'}}>
    <div style={{width: 960, height: 540, transform: 'scale(2)', transformOrigin: 'top left', position: 'relative',
      fontFamily: 'SmileySans, Arial, sans-serif', color: '#fff'}}>
      <div style={{position: 'absolute', left: groupX, top: groupY, width: 377, height: 365,
        transform: `scale(${groupScale})`, transformOrigin: 'top left'}}>
        {entries.map((entry, i) => {
          const approval = entry.label === '请假审批';
          const appearing = entry.at === 0 ? 1 : approval
            ? tween(f, [132, 134, 139], [0, .88, 1])
            : tween(f, [entry.at, entry.at + 5, entry.at + 9], [0, .8, 1]);
          const y = entry.row * (cardH + gapY);
          const x = entry.col * (cardW + gapX);
          const width = i === 6 ? 377 : cardW;
          return <div key={entry.label} style={{position: 'absolute', left: x, top: y, width, height: cardH,
            opacity: appearing, transform: `scale(${entry.at === 0 ? 1 : approval
              ? tween(f, [132, 145, 155, 160], [.32, .4, .9, 1])
              : tween(f, [entry.at, entry.at + 8], [.8, 1])})`,
            transformOrigin: 'center', borderRadius: 11, overflow: 'hidden',
            background: '#fff', color: '#050505',
            boxShadow: '0 7px 20px #00000024',
            display: 'flex', alignItems: 'center', fontSize: entry.label.length > 3 ? 29 : 33,
            fontWeight: 500, letterSpacing: 0}}>
            <span style={{whiteSpace: 'nowrap', marginLeft: 18}}>{entry.label}</span>
          </div>;
        })}
        <div style={{position: 'absolute', inset: -13, background: '#ffffff08', boxShadow: '0 0 0 12px #ffffff08',
          borderRadius: 13, opacity: box, pointerEvents: 'none'}} />
      </div>
      {f >= 268 && <div style={{position:'absolute',left:159,top:f===268?250:228,width:258,height:f===268?14:36,background:'#7C3AED',color:'#fff',borderRadius:'12px 12px 0 0',overflow:'hidden'}}>{f>=269&&<div style={{position:'absolute',left:9,top:10,fontSize:61,lineHeight:1,fontWeight:900,whiteSpace:'nowrap'}}>全部了解</div>}</div>}
      {f >= 134 && f < 155 && <svg style={{position: 'absolute',
        left: tween(f, [134, 141, 154], [605, 500, 480]),
        top: tween(f, [134, 141, 154], [414, 419, 420]), width: 22, height: 31,
        filter: 'drop-shadow(1px 2px 2px #000)'}} viewBox="0 0 22 31">
        <path d="M1 1 L1 25 L7 19 L12 30 L17 27 L12 17 L21 17 Z" fill="#fff" stroke="#111" strokeWidth="1.5" />
      </svg>}
      <div style={{position: 'absolute', left: 474, top: 239, width: 174, height: 27, opacity: lines}}>
        {[0, 18].map(y => <div key={y} style={{position: 'absolute', left: 0, top: y, width: '100%',
          height: 2, background: '#7C3AED', transform: `scaleX(${lines})`, transformOrigin: 'left center'}}>
          <div style={{position: 'absolute', right: -2, top: -4, width: 0, height: 0,
            borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '9px solid #7C3AED'}} />
        </div>)}
      </div>
      <div style={{position: 'absolute', left: 646, top: 165, width: 140, opacity: logo,
        textAlign: 'center', transform: `scale(${tween(f, [181, 198], [.75, 1])})`}}>
        <div style={{width: 139, height: 139, borderRadius: 26, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED',
          fontFamily: 'MiSans, sans-serif', fontWeight: 900, fontSize: 101, fontStyle: 'italic',
          boxShadow: '0 8px 25px #00000024'}}>F</div>
        <div style={{marginTop: 45, fontSize: 39, whiteSpace: 'nowrap', marginLeft: 18, fontWeight: 500}}>Fred 工作台</div>
      </div>
    </div>
  </AbsoluteFill>;
};
