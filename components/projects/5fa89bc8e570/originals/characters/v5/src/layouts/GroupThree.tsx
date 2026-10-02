import type {FC} from "react";
import {useCurrentFrame} from "remotion";
import type {Page} from "../types";
import {crisp, mix, weighted} from "../motion";
import {Card, FitText, gestureOrigin, ink, paper, Pop, Reveal, revealFrom, wipeClip, zoneFor} from "../primitives";

const origin = (item: Page) => gestureOrigin(item);

export const WordImpact: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const field = weighted(frame, item.carrierCue, 18); const lock = weighted(frame, item.moduleCues[2], 16);
  return <div style={{position: "absolute", left: zone.left, top: 205, width: zone.width, height: 670, zIndex: 3}}>
    <div style={{position: "absolute", inset: 0, borderRadius: mix(70, 46, field), background: ink, clipPath: wipeClip(field, item)}} />
    {item.exactScreenWords.map((word, index) => <Reveal key={word} at={item.moduleCues[index]} from={index === 2 ? "bottom" : revealFrom(item)} style={{position: "absolute", left: 55, top: 80 + index * 170, width: zone.width - 110, height: 135, display: "flex", alignItems: "center", justifyContent: "center", transform: index === 0 ? `scale(${mix(1.28, 1, lock)})` : undefined, transformOrigin: origin(item)}}><FitText text={word} width={zone.width - 110} max={index === 2 ? 104 : 92} min={60} color={paper} /></Reveal>)}
  </div>;
};

export const MetricRibbon: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const height = 175; const gap = 24;
  return <div style={{position: "absolute", left: zone.left, top: 235, width: zone.width, height: 620, zIndex: 3}}>{item.exactScreenWords.map((word, index) => {
    const p = crisp(frame, item.moduleCues[index], 14);
    return <div key={word} style={{position: "absolute", left: 0, top: index * (height + gap), width: zone.width, height, boxSizing: "border-box", borderRadius: 34, background: index === 2 ? ink : paper, boxShadow: index === 2 ? "0 20px 50px rgba(0,0,0,.18)" : "0 16px 42px rgba(0,0,0,.12)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", clipPath: wipeClip(p, item)}}><FitText text={word} width={zone.width - 100} max={92} min={58} color={index === 2 ? paper : ink} /></div>;
  })}</div>;
};

export const SlotJudgment: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 18; const width = (zone.width - gap * 2) / 3;
  return <div style={{position: "absolute", left: zone.left, top: 270, width: zone.width, height: 540, zIndex: 3}}>{item.exactScreenWords.map((word, index) => <div key={word} style={{position: "absolute", left: index * (width + gap), top: 0}}><Card text={word} at={item.moduleCues[index]} width={width} height={440} dark={index === 2} origin={origin(item)} /></div>)}</div>;
};

export const StopIntervention: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 30; const width = (zone.width - gap) / 2;
  return <div style={{position: "absolute", left: zone.left, top: 265, width: zone.width, height: 540, zIndex: 3}}>
    {item.exactScreenWords.map((word, index) => <div key={word} style={{position: "absolute", left: index * (width + gap), top: 0}}><Card text={word} at={item.moduleCues[index]} width={width} height={440} dark={index === 1} origin={origin(item)} /></div>)}
  </div>;
};

export const ResolvePath: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 22; const width = (zone.width - gap * 2) / 3;
  return <div style={{position: "absolute", left: zone.left, top: 215, width: zone.width, height: 650, zIndex: 3}}>
    {item.exactScreenWords.slice(0, 3).map((word, index) => <div key={word} style={{position: "absolute", left: index * (width + gap), top: 0}}><Card text={word} at={item.moduleCues[index]} width={width} height={225} origin={origin(item)} /></div>)}
    <div style={{position: "absolute", left: 0, top: 280}}><Card text={item.exactScreenWords[3]} at={item.moduleCues[3]} width={zone.width} height={335} dark origin={origin(item)} /></div>
  </div>;
};

export const FinalField: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const width = Math.min(900, zone.width); const left = (zone.width - width) / 2;
  return <div style={{position: "absolute", left: zone.left, top: 290, width: zone.width, height: 500, zIndex: 3}}>
    <Pop at={item.carrierCue} origin={origin(item)} style={{position: "absolute", left, top: 0, width, height: 500, borderRadius: 36, background: ink, boxShadow: "0 28px 64px rgba(0,0,0,.18)"}}>
      <Reveal at={item.moduleCues[0]} from={revealFrom(item)} style={{position: "absolute", left: 54, top: 88, width: width - 108}}><FitText text={item.exactScreenWords[0]} width={width - 108} max={76} min={50} color={paper} /></Reveal>
      <Reveal at={item.moduleCues[1]} from="bottom" style={{position: "absolute", left: 54, bottom: 102, width: width - 108}}><FitText text={item.exactScreenWords[1]} width={width - 108} max={124} min={76} color={paper} /></Reveal>
    </Pop>
  </div>;
};
