import type {FC} from "react";
import {useCurrentFrame} from "remotion";
import type {Page} from "../types";
import {crisp, mix, weighted} from "../motion";
import {Card, FitText, gestureOrigin, ink, paper, Pop, Reveal, revealFrom, wipeClip, zoneFor} from "../primitives";

const origin = (item: Page) => gestureOrigin(item);

export const SplitCopy: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const open = weighted(frame, item.carrierCue, 17); const half = zone.width / 2;
  return <div style={{position: "absolute", left: zone.left, top: 210, width: zone.width, height: 650, zIndex: 3, clipPath: wipeClip(open, item), borderRadius: 44, boxShadow: "0 22px 58px rgba(0,0,0,.13)"}}>
    <div style={{position: "absolute", inset: 0, borderRadius: 44, overflow: "hidden", background: paper}}><div style={{position: "absolute", left: half, top: 0, width: half, height: 650, background: ink}} />
      {item.exactScreenWords.map((word, index) => <Reveal key={word} at={item.moduleCues[index]} from={revealFrom(item)} style={{position: "absolute", left: (index % 2) * half, top: Math.floor(index / 2) * 325, width: half, height: 325, display: "flex", alignItems: "center", justifyContent: "center"}}><FitText text={word} width={half - 72} max={118} min={62} color={index % 2 ? paper : ink} /></Reveal>)}
    </div>
  </div>;
};

export const LineToPlane: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const plane = crisp(frame, item.carrierCue, 18);
  return <div style={{position: "absolute", left: zone.left, top: 215, width: zone.width, height: 650, zIndex: 3}}>
    <div style={{position: "absolute", inset: 28, background: ink, borderRadius: 42, clipPath: wipeClip(plane, item)}} />
    <Reveal at={item.moduleCues[0]} from={revealFrom(item)} style={{position: "absolute", left: 72, top: 120, width: zone.width - 144}}><FitText text={item.exactScreenWords[0]} width={zone.width - 144} max={94} min={58} color={paper} /></Reveal>
    <Reveal at={item.moduleCues[1] + 3} from="bottom" style={{position: "absolute", left: 72, bottom: 115, width: zone.width - 144}}><FitText text={item.exactScreenWords[1]} width={zone.width - 144} max={132} min={78} color={paper} /></Reveal>
  </div>;
};

export const StepTiles: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 22; const tileWidth = (zone.width - gap * 2) / 3;
  return <div style={{position: "absolute", left: zone.left, top: 205, width: zone.width, height: 670, zIndex: 3}}>
    <div style={{position: "absolute", left: 0, top: 0}}><Card text={item.exactScreenWords[0]} at={item.moduleCues[0]} width={zone.width} height={245} dark origin={origin(item)} /></div>
    {item.exactScreenWords.slice(1).map((word, index) => <div key={word} style={{position: "absolute", left: index * (tileWidth + gap), top: 293}}><Card text={word} at={item.moduleCues[index + 1]} width={tileWidth} height={305} origin={origin(item)} /></div>)}
  </div>;
};

export const CompressBand: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const compress = weighted(frame, item.moduleCues[1], 18); const enter = weighted(frame, item.carrierCue, 17);
  return <div style={{position: "absolute", left: zone.left, top: 180, width: zone.width, height: 720, zIndex: 3}}>
    <div style={{position: "absolute", left: 0, right: 0, top: mix(0, 220, compress), height: mix(720, 360, compress), borderRadius: 46, background: ink, clipPath: wipeClip(enter, item)}} />
    <Reveal at={item.moduleCues[0]} from={revealFrom(item)} style={{position: "absolute", left: 58, top: mix(250, 275, compress), width: zone.width - 116}}><FitText text={item.exactScreenWords[0]} width={zone.width - 116} max={112} min={72} color={paper} /></Reveal>
    <Reveal at={item.moduleCues[1] + 2} from="bottom" style={{position: "absolute", left: 58, top: 390, width: zone.width - 116}}><FitText text={item.exactScreenWords[1]} width={zone.width - 116} max={88} min={56} color={paper} /></Reveal>
  </div>;
};

export const FocusRail: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 18; const width = (zone.width - gap * 2) / 3;
  return <div style={{position: "absolute", left: zone.left, top: 285, width: zone.width, height: 480, zIndex: 3}}>
    {item.exactScreenWords.map((word, index) => <div key={word} style={{position: "absolute", left: index * (width + gap), top: 0}}><Card text={word} at={item.moduleCues[index]} width={width} height={400} dark={index === 2} origin={origin(item)} /></div>)}
  </div>;
};

export const WordGrid: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 22; const width = (zone.width - gap * 2) / 3;
  return <div style={{position: "absolute", left: zone.left, top: 215, width: zone.width, height: 650, zIndex: 3}}>
    {item.exactScreenWords.slice(0, 3).map((word, index) => <div key={word} style={{position: "absolute", left: index * (width + gap), top: 0}}><Card text={word} at={item.moduleCues[index]} width={width} height={235} origin={origin(item)} /></div>)}
    <div style={{position: "absolute", left: 0, top: 285}}><Card text={item.exactScreenWords[3]} at={item.moduleCues[3]} width={zone.width} height={330} dark origin={origin(item)} /></div>
  </div>;
};

export const PanelsConverge: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const enter = weighted(frame, item.carrierCue, 18); const gap = 18; const width = (zone.width - gap * 2) / 3;
  return <div style={{position: "absolute", left: zone.left, top: 215, width: zone.width, height: 650, zIndex: 3}}>{item.exactScreenWords.map((word, index) => {
    const direction = item.characterSide === "left" ? -1 : 1;
    return <div key={word} style={{position: "absolute", left: index * (width + gap) + direction * (1 - enter) * (160 + index * 120), top: 0, width, height: 590, boxSizing: "border-box", borderRadius: 40, background: index === 1 ? paper : ink, boxShadow: index === 1 ? "0 20px 52px rgba(0,0,0,.13)" : "0 24px 58px rgba(0,0,0,.18)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28, clipPath: wipeClip(enter, item)}}><Reveal at={item.moduleCues[index]} from={revealFrom(item)} style={{width: "100%"}}><FitText text={word} width={width - 56} max={80} min={46} color={index === 1 ? ink : paper} /></Reveal></div>;
  })}</div>;
};

export const ModuleMerge: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const merge = weighted(frame, item.moduleCues[2], 18); const gap = 18; const width = (zone.width - 120 - gap * 2) / 3;
  return <div style={{position: "absolute", left: zone.left, top: 220, width: zone.width, height: 640, zIndex: 3}}>
    <div style={{position: "absolute", left: 0, right: 0, top: mix(230, 40, merge), height: mix(190, 560, merge), borderRadius: 44, background: ink, clipPath: wipeClip(crisp(frame, item.carrierCue, 17), item)}} />
    {item.exactScreenWords.map((word, index) => <Pop key={word} at={item.moduleCues[index]} origin={origin(item)} style={{position: "absolute", left: 60 + index * (width + gap), top: 225, width, height: 190, boxSizing: "border-box", borderRadius: 32, background: index === 2 ? paper : ink, boxShadow: index === 2 ? "0 16px 40px rgba(0,0,0,.16)" : "none", display: "flex", alignItems: "center", justifyContent: "center"}}><FitText text={word} width={width - 38} max={72} min={44} color={index === 2 ? ink : paper} /></Pop>)}
  </div>;
};
