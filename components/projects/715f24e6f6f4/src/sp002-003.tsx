import React, {useEffect, useState} from 'react';
import {AbsoluteFill, OffthreadVideo, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import motion from './sp003-source-motion.json';

// Native source label bounds are measured at every 60fps frame; only the font/color are adapted.
const labels = ['模特展示', '用户痛点', '效果对比', '结尾总结'];
const Layout: React.FC = () => {
  const frame = Math.min(motion.length - 1, Math.round(useCurrentFrame() * 60 / useVideoConfig().fps));
  const row = motion[frame];
  const [metrics,setMetrics]=useState<{x:number;y:number;width:number;height:number}[]>([]);
  const [handle] = useState(() => delayRender('load MiSans Heavy labels'));
  useEffect(() => {document.fonts.load('900 130px MiSans').then(() => {
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.style.cssText='position:absolute;top:-5000px;visibility:hidden';document.body.append(svg);
    const boxes=labels.map(label=>{const text=document.createElementNS('http://www.w3.org/2000/svg','text');text.textContent=label;text.setAttribute('font-family','MiSans');text.setAttribute('font-size','130');text.setAttribute('font-weight','900');svg.append(text);const ctx=document.createElement('canvas').getContext('2d')!;ctx.font='900 130px MiSans';const b=ctx.measureText(text.textContent!);return {x:-b.actualBoundingBoxLeft,y:-b.actualBoundingBoxAscent,width:b.actualBoundingBoxLeft+b.actualBoundingBoxRight,height:b.actualBoundingBoxAscent+b.actualBoundingBoxDescent};});svg.remove();setMetrics(boxes);continueRender(handle);
  });}, [handle]);
  const current = row.labels.reduce((n, item, i) => item ? i : n, 0);
  return <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 690, top: 41, width: 545, height: 990,
      borderRadius: 26, overflow: 'hidden', boxShadow: '0 9px 18px #0003'}}>
      <OffthreadVideo src={staticFile('sp003-center.mp4')} muted style={{width: '100%', height: 1034, objectFit: 'fill'}} />
    </div>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {row.labels.map((bounds, i) => {
        if (!bounds||!metrics[i]) return null;
        const [x, y, w, h] = bounds;
        const width = 479;
        const left = i < 2 && x === 0 ? x + w - width : x;
        const glyph=metrics[i];const sx=width/glyph.width,sy=sx;
        return <text key={labels[i]} transform={`translate(${left-glyph.x*sx} ${(i%2?661.75:312.25)-glyph.y*sy}) scale(${sx} ${sy})`}
          fill={i===current?'#7C3AED':'#111'} fontFamily="MiSans" fontWeight="900" fontSize="130">{labels[i]}</text>;
      })}
    </svg>
  </AbsoluteFill>;
};
export const SP002: React.FC = () => <Layout />;
export const SP003: React.FC = () => <Layout />;
