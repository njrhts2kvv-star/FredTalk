import {approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import {Img, continueRender, delayRender, useCurrentFrame} from 'remotion';
import track from '../public/review-revision03/SP012-handoff.json';

type Ink = {x: number; y: number; w: number; h: number};
const emptyInk: Ink = {x: 0, y: 0, w: 1, h: 1};

export const SP012Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = track.boxes[frame];
  const words = track.texts[frame];
  const phone = track.phoneOpening[frame];
  const [handle] = useState(() => delayRender('SP012 editable title ink'));
  const [metrics, setMetrics] = useState({whole: emptyInk, first: emptyInk, second: emptyInk});

  useEffect(() => {
    document.fonts.load('900 200px MiSans').then(() => {
      const context = document.createElement('canvas').getContext('2d')!;
      context.font = '900 200px MiSans';
      const measure = (text: string): Ink => {
        const bounds = context.measureText(text);
        return {
          x: -bounds.actualBoundingBoxLeft,
          y: -bounds.actualBoundingBoxAscent,
          w: bounds.actualBoundingBoxLeft + bounds.actualBoundingBoxRight,
          h: bounds.actualBoundingBoxAscent + bounds.actualBoundingBoxDescent,
        };
      };
      setMetrics({whole: measure('榨干'), first: measure('榨'), second: measure('干')});
      continueRender(handle);
    });
  }, [handle]);

  // The measured heading is 570px wide and 232px high. Its inter-character gap
  // is deliberate. Each glyph retains a natural uniform scale and real weight.
  const scale = 232 / metrics.whole.h;
  const titleLeft = words ? (frame < 104 ? words[0] : words[0] + words[2] - 570) : 0;
  const baseline = 426 - metrics.whole.y * scale;
  const firstX = titleLeft - metrics.first.x * scale;
  const secondX = titleLeft + 570 - metrics.second.w * scale - metrics.second.x * scale;

  return <>
    {frame < 36 && <Img
      src={staticFile(`review-revision03/SP012-handoff/ui-${String(frame).padStart(4, '0')}.png`)}
      style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1020}}
    />}
    {words && frame < 110 && <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, filter: 'drop-shadow(7px 4px 6px #0005)'}}>
      <defs><clipPath id="sp012-native-title-reveal"><rect x={words[0]} y={words[1]} width={words[2]} height={words[3]}/></clipPath></defs>
      <g clipPath="url(#sp012-native-title-reveal)"><text fontFamily="MiSans" fontSize="200" fontWeight="900" fill="#050505"
        transform={`translate(${firstX} ${baseline}) scale(${scale})`}>榨</text>
      <text fontFamily="MiSans" fontSize="200" fontWeight="900" fill="#050505"
        transform={`translate(${secondX} ${baseline}) scale(${scale})`}>干</text></g>
    </svg>}
    {/* The logo occludes the advancing title; it must be above the text. */}
    {logo && frame <= 110 && logo[3] > 120 && <Img
      src={staticFile(`review-revision03/SP012-handoff/logo-${String(frame).padStart(4, '0')}.png`)}
      style={{position: 'absolute', left: logo[0], top: logo[1], width: logo[2], height: logo[3], filter: 'drop-shadow(16px 6px 9px #0005)'}}
    />}
    {phone && <Img
      src={staticFile(`review-revision03/SP012-handoff/phone-${String(frame).padStart(4, '0')}.png`)}
      style={{position: 'absolute', left: phone[0], top: phone[1], width: phone[2], height: phone[3]}}
    />}
  </>;
};
