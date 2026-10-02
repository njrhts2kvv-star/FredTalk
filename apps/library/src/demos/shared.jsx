import React, {useLayoutEffect, useRef, useState} from 'react';
import {tokens, accentForSurface} from '../tokens.js';
import {SoftSurface} from './vendor/ContentMotion.tsx';

export const WIDTH = 960;
export const HEIGHT = 540;
export const FPS = 60;
export const EXAMPLE_VALUES = [38, 58, 82, 65, 91];

export function demoItems(text, count = 3) {
  const total = Math.max(2, Math.min(5, Math.round(Number(count) || 3)));
  const supplied = String(text || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean);
  const defaults = ['理解内容', '建立关系', '清楚表达', '保留上下文', '交接重点'];
  return Array.from({length: total}, (_, index) => supplied[index] || defaults[index]);
}

export function colors(tone) {
  return tone === 'dark'
    ? {canvas: '#000000', ink: '#ffffff', muted: '#aaaab1', surface: '#111111', soft: '#000000', accent: tokens.color.accentDark}
    : {canvas: '#ffffff', ink: '#111111', muted: '#66666d', surface: '#ffffff', soft: '#ffffff', accent: tokens.color.accent};
}

export function Canvas({tone = 'light', children}) {
  const theme = colors(tone);
  return <div data-demo-canvas style={{position: 'absolute', inset: 0, overflow: 'hidden', background: theme.canvas, color: theme.ink, fontFamily: `'${tokens.font.body}', sans-serif`, fontWeight: 650}}>{children}</div>;
}

// A bounded, browser-measured text slot for this demonstration site. Production
// scenes still need deliberate grouping and timing when actual copy is too long.
export function TextFit({children, maxSize = 48, minSize = 28, color = 'inherit', align = 'center', weight = 650, style = {}}) {
  const slot = useRef(null);
  const content = useRef(null);
  const [size, setSize] = useState(maxSize);
  const [overflow, setOverflow] = useState(false);
  useLayoutEffect(() => {
    let active = true;
    const fit = () => {
      if (!active || !slot.current || !content.current) return;
      const node = content.current;
      let nextSize = maxSize;
      node.style.fontSize = `${nextSize}px`;
      while (nextSize > minSize && (node.scrollHeight > slot.current.clientHeight + 1 || node.scrollWidth > slot.current.clientWidth + 1)) {
        nextSize -= 1;
        node.style.fontSize = `${nextSize}px`;
      }
      const cannotFit = node.scrollHeight > slot.current.clientHeight + 1 || node.scrollWidth > slot.current.clientWidth + 1;
      node.dataset.overflow = String(cannotFit);
      setOverflow(cannotFit);
      setSize(nextSize);
    };
    fit();
    document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(slot.current);
    return () => { active = false; observer.disconnect(); };
  }, [children, maxSize, minSize]);
  return <div ref={slot} style={{height: '100%', width: '100%', minHeight: 0, minWidth: 0, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : 'center', ...style}}>
    <div ref={content} data-demo-text aria-hidden={overflow || undefined} style={{width: '100%', fontSize: size, lineHeight: 1.23, fontWeight: weight, textAlign: align, color, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', visibility: overflow ? 'hidden' : 'visible'}}>{children}</div>
    {overflow && <div data-demo-text-fallback title={String(children)} aria-label={`文案过长，需要拆分。原文：${children}`} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : 'center', fontSize: Math.min(minSize, 28), lineHeight: 1.2, color}}>文案过长，需拆分</div>}
  </div>;
}

export function LabelSurface({box, text, fill = '#fff', color = '#171719', fontSize = 46, minSize = 28, radius = 28, opacity = 1, accent = false, shadow = tokens.shadow.surface, padding = '18px 28px'}) {
  return <SoftSurface box={box} fill={fill} radius={radius} shadow={shadow} style={{opacity}}>
    <div style={{position: 'absolute', inset: padding}}><TextFit maxSize={fontSize} minSize={minSize} color={accent ? accentForSurface(fill) : color}>{text}</TextFit></div>
  </SoftSurface>;
}

export function Subtitle({visible, text = '关键内容与字幕，各有清楚的阅读空间'}) {
  if (!visible) return null;
  // Half-scale geometry from SmileySubtitle.tsx's 1920 × 1080 baseline.
  // This persistent sample has no audio clock or subtitle cue implementation.
  return <div data-demo-subtitle data-subtitle-scope="geometry-only" style={{position: 'absolute', left: 0, right: 0, bottom: 12.75, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000}}>
    <div style={{boxSizing: 'border-box', minHeight: 50.75, maxWidth: 860, padding: '6.5px 11.5px', borderRadius: 8.5, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: `'${tokens.font.subtitle}', sans-serif`, fontSize: 23.75, lineHeight: 1.12, fontWeight: 400, textAlign: 'center', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>{text}</div>
  </div>;
}

export function ScaledCanvas({children, label}) {
  const viewport = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return undefined;
    const resize = () => setScale(node.clientWidth / WIDTH);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={viewport} role="img" aria-label={label} style={{width: '100%', aspectRatio: '16 / 9', position: 'relative', overflow: 'hidden'}}>
    <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left'}}>{children}</div>
  </div>;
}
