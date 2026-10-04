import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const reveal = (f: number, start: number, duration = 15) =>
  interpolate(f, [start, start + duration], [0, 1], clamp);

type Node = {text: string; x: number; y: number; w: number; h: number; start: number; bright?: boolean; eyebrow?: string};
const nodes: Node[] = [
  {text: 'Codex', x: 339, y: 22, w: 220, h: 73, start: 55},
  {text: '基础能力', x: 129, y: 151, w: 129, h: 53, start: 55, eyebrow: 'BASICS'},
  {text: '小项目实战', x: 359, y: 151, w: 128, h: 53, start: 55, eyebrow: 'PROJECT'},
  {text: '高级扩展', x: 641, y: 151, w: 129, h: 53, start: 55, eyebrow: 'ADVANCED'},
  {text: '本地文件', x: 39, y: 274, w: 96, h: 50, start: 151, eyebrow: 'LOCAL FILES'},
  {text: '命令行', x: 146, y: 274, w: 95, h: 50, start: 278, eyebrow: 'TERMINAL'},
  {text: '持久记忆', x: 252, y: 274, w: 95, h: 50, start: 336, eyebrow: 'MEMORY'},
  {text: '生图', x: 375, y: 274, w: 95, h: 50, start: 448, bright: true, eyebrow: 'CASE STUDY'},
  {text: '插件', x: 496, y: 274, w: 95, h: 50, start: 546, eyebrow: 'PLUGIN'},
  {text: 'Skills', x: 603, y: 274, w: 95, h: 50, start: 730, eyebrow: 'SKILLS'},
  {text: 'MCP', x: 710, y: 274, w: 96, h: 50, start: 865, eyebrow: 'MCP'},
  {text: '自动化', x: 817, y: 274, w: 96, h: 50, start: 932},
  {text: '3种权限模式', x: 39, y: 337, w: 96, h: 26, start: 183},
  {text: '上下文管理', x: 39, y: 369, w: 96, h: 26, start: 210},
  {text: '额度检查', x: 39, y: 401, w: 96, h: 26, start: 235},
  {text: '模型选择', x: 39, y: 433, w: 96, h: 26, start: 253},
  {text: 'Agents.md', x: 252, y: 337, w: 96, h: 26, start: 375},
  {text: '自动记忆', x: 252, y: 369, w: 96, h: 26, start: 406},
  {text: '个人主页\n开发部署', x: 375, y: 337, w: 95, h: 50, start: 485, bright: true, eyebrow: 'CASE STUDY'},
  {text: '插件安装', x: 496, y: 337, w: 95, h: 26, start: 583},
  {text: 'computer use', x: 496, y: 369, w: 95, h: 26, start: 626},
  {text: 'browser use', x: 496, y: 401, w: 95, h: 26, start: 684},
  {text: '安装', x: 603, y: 337, w: 95, h: 26, start: 773},
  {text: '制作', x: 603, y: 369, w: 95, h: 26, start: 811},
];
const edges = [
  [449,95,449,114,55],[193,114,705,114,55],[193,114,193,151,55],[423,114,423,151,55],[705,114,705,151,55],
  [193,204,193,247,142],[86,247,300,247,145],[86,247,86,274,145],[193,247,193,274,270],[300,247,300,274,328],
  [423,204,423,274,438],[705,204,705,247,525],[544,247,758,247,530],[544,247,544,274,530],
  [651,247,651,274,712],[758,247,758,274,847],[758,247,865,247,918],[865,247,865,274,918],
] as const;

export const Q12: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load Q12 font'));
  useEffect(() => {document.fonts.load('700 30px sans-serif').then(() => continueRender(fontHandle));}, [fontHandle]);
  return <AbsoluteFill style={{background: '#000', color: '#fff', overflow: 'hidden', fontFamily: 'MiSans, sans-serif'}}>
    <Sequence from={0} durationInFrames={70}><AbsoluteFill style={{background:'#fff'}}><OffthreadVideo src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} transparent muted style={{position:'absolute',width:1080,height:1080,left:420,top:0}} /></AbsoluteFill></Sequence>
    {f >= 70 && f < 1001 && <div style={{position: 'absolute', inset: 0, transform: 'scale(2)', transformOrigin: '0 0'}}>
      <svg width="960" height="540" style={{position: 'absolute', inset: 0}}>
        {edges.map(([x1,y1,x2,y2,start], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#fff" strokeWidth="2.5" opacity={reveal(f, start)} />)}
      </svg>
      {nodes.map((node) => {
        const p = reveal(f, node.start);
        return <div key={`${node.text}-${node.y}`} style={{position: 'absolute', left: node.x, top: node.y,
          width: node.w, height: node.h, boxSizing: 'border-box',
          borderRadius: node.y < 270 ? 14 : 12, background: node.bright ? '#7C3AED' : '#fff', color: node.bright ? '#fff' : '#111',
          boxShadow: '0 8px 24px #00000026',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: p, transform: `translateY(${(1-p)*10}px)`}}>
          
          <strong style={{fontSize: node.y < 120 ? 31 : node.y < 270 ? 17 : node.h < 30 ? 10 : 13,
            lineHeight: 1.15, textAlign: 'center',whiteSpace:'pre-line'}}>{node.text}</strong>
        </div>;
      })}
    </div>}
    <Sequence from={1001}><AbsoluteFill style={{background:'#fff'}}><OffthreadVideo transparent muted src={staticFile('characters/Fred_皱眉思考_1440p30_Alpha.webm')} style={{position:'absolute',width:1080,height:1080,left:420,top:0,objectFit:'contain'}} /></AbsoluteFill></Sequence>
  </AbsoluteFill>;
};
