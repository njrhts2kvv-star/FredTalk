import type {FC} from "react";
import {useCurrentFrame} from "remotion";
import type {Page} from "../types";
import {crisp, mix, weighted} from "../motion";
import {Card, FitText, gestureOrigin, ink, paper, Reveal, revealFrom, wipeClip, zoneFor} from "../primitives";

const origin = (item: Page) => gestureOrigin(item);

export const PathBuild: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 20; const width = (zone.width - gap * 3) / 4;
  return <div style={{position: "absolute", left: zone.left, top: 310, width: zone.width, height: 430, zIndex: 3}}>
    {item.exactScreenWords.map((word, index) => <div key={word} style={{position: "absolute", left: index * (width + gap), top: index % 2 ? 125 : 45}}><Card text={word} at={item.moduleCues[index]} width={width} height={220} dark={index === 3} origin={origin(item)} /></div>)}
  </div>;
};

export const FocusWindow: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const field = weighted(frame, item.carrierCue, 20);
  return <div style={{position: "absolute", left: zone.left, top: 190, width: zone.width, height: 710, zIndex: 3}}>
    <div style={{position: "absolute", inset: 0, borderRadius: mix(70, 48, field), background: ink, clipPath: wipeClip(field, item)}} />
    <Reveal at={item.moduleCues[0]} from={revealFrom(item)} style={{position: "absolute", left: 64, top: 105, width: zone.width - 128}}><FitText text={item.exactScreenWords[0]} width={zone.width - 128} max={92} min={62} color={paper} /></Reveal>
    <Reveal at={item.moduleCues[1]} from="bottom" style={{position: "absolute", left: 64, bottom: 130, width: zone.width - 128}}><FitText text={item.exactScreenWords[1]} width={zone.width - 128} max={138} min={82} color={paper} /></Reveal>
  </div>;
};

export const CounterSlot: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const settle = weighted(frame, item.moduleCues[1], 18); const gap = 18; const width = (zone.width - gap * 2) / 3;
  return <div style={{position: "absolute", left: zone.left, top: 285, width: zone.width, height: 500, zIndex: 3}}>
    <div style={{position: "absolute", top: 0, left: mix(zone.width / 2 - width * .725, 0, settle)}}><Card text={item.exactScreenWords[0]} at={item.moduleCues[0]} width={mix(width * 1.45, width, settle)} height={390} dark origin={origin(item)} /></div>
    {item.exactScreenWords.slice(1).map((word, i) => <div key={word} style={{position: "absolute", left: (i + 1) * (width + gap), top: 0}}><Card text={word} at={item.moduleCues[i + 1]} width={width} height={390} origin={origin(item)} /></div>)}
  </div>;
};

export const ApertureSlice: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const open = crisp(frame, item.carrierCue, 16);
  return <div style={{position: "absolute", left: zone.left, top: 195, width: zone.width, height: 700, zIndex: 3}}>
    <Reveal at={item.moduleCues[0]} from={revealFrom(item)} style={{position: "absolute", left: 50, top: 30, width: zone.width - 100, height: 150, zIndex: 4, display: "flex", alignItems: "center", justifyContent: "center"}}><FitText text={item.exactScreenWords[0]} width={zone.width - 100} max={156} min={98} /></Reveal>
    <div style={{position: "absolute", left: 0, right: 0, top: 220, height: 430, background: ink, borderRadius: 36, clipPath: wipeClip(open, item)}}><Reveal at={item.moduleCues[1]} from={revealFrom(item)} style={{position: "absolute", left: 54, top: 0, width: zone.width - 108, height: 430, display: "flex", alignItems: "center", justifyContent: "center"}}><FitText text={item.exactScreenWords[1]} width={zone.width - 108} max={116} min={72} color={paper} /></Reveal></div>
  </div>;
};

export const PointToField: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const field = weighted(frame, item.carrierCue, 20);
  return <div style={{position: "absolute", left: zone.left, top: 170, width: zone.width, height: 760, zIndex: 3}}>
    <div style={{position: "absolute", inset: 0, borderRadius: mix(70, 50, field), background: ink, clipPath: wipeClip(field, item)}} />
    <Reveal at={item.moduleCues[0]} from={revealFrom(item)} style={{position: "absolute", left: 64, top: 112, width: zone.width - 128}}><FitText text={item.exactScreenWords[0]} width={zone.width - 128} max={88} min={58} color={paper} /></Reveal>
    <Reveal at={item.moduleCues[1]} from="bottom" style={{position: "absolute", left: 64, bottom: 135, width: zone.width - 128}}><FitText text={item.exactScreenWords[1]} width={zone.width - 128} max={160} min={96} color={paper} /></Reveal>
  </div>;
};

export const AxisLock: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 26; const width = (zone.width - gap) / 2;
  return <div style={{position: "absolute", left: zone.left, top: 285, width: zone.width, height: 500, zIndex: 3}}>
    {item.exactScreenWords.map((word, index) => <div key={word} style={{position: "absolute", left: index * (width + gap)}}><Card text={word} at={item.moduleCues[index]} width={width} height={390} dark={index === 1} origin={origin(item)} /></div>)}
  </div>;
};

export const TerminalSteps: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const zone = zoneFor(item); const shell = crisp(frame, item.carrierCue, 16); const rowH = 138;
  return <div style={{position: "absolute", left: zone.left, top: 180, width: zone.width, height: 720, zIndex: 3, boxSizing: "border-box", borderRadius: 44, background: ink, padding: "68px 48px 42px", clipPath: wipeClip(shell, item)}}>
    {item.exactScreenWords.map((word, index) => <Reveal key={word} at={item.moduleCues[index]} from={revealFrom(item)} style={{height: rowH, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center"}}><FitText text={word} width={zone.width - 160} max={82} min={54} color={paper} /></Reveal>)}
  </div>;
};

export const ModuleSplit: FC<{item: Page}> = ({item}) => {
  const zone = zoneFor(item); const gap = 62; const height = 300;
  return <div style={{position: "absolute", left: zone.left, top: 209, width: zone.width, height: 662, zIndex: 3}}>{item.exactScreenWords.map((word, index) => <div key={word} style={{position: "absolute", left: 0, top: index * (height + gap)}}><Card text={word} at={item.moduleCues[index]} width={zone.width} height={height} dark={index === 1} origin={origin(item)} /></div>)}</div>;
};
