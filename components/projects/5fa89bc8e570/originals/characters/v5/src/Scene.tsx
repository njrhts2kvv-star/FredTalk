import type {FC} from "react";
import {Audio} from "@remotion/media";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {Character} from "./Character";
import {LayoutRouter} from "./LayoutRouter";
import type {Page} from "./types";

export const Scene: FC<{item: Page}> = ({item}) => (
  <AbsoluteFill style={{background: "#FFFFFF", color: "#000000", overflow: "hidden", fontFamily: "MiSans, PingFang SC, sans-serif"}}>
    <LayoutRouter item={item} />
    <Character item={item} />
    <Sequence from={item.carrierCue} layout="none"><Audio src={staticFile("sfx-cache/whoosh.wav")} volume={0.12} /></Sequence>
    {item.moduleCues.map((cue, index) => <Sequence key={`${item.stableId}-${cue}`} from={cue} layout="none"><Audio src={staticFile(index === item.moduleCues.length - 1 ? "sfx-cache/pop.wav" : "sfx-cache/click.wav")} volume={index === item.moduleCues.length - 1 ? 0.12 : 0.085} /></Sequence>)}
  </AbsoluteFill>
);
