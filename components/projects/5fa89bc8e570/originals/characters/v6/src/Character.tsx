import type {CSSProperties, FC} from "react";
import {Video} from "@remotion/media";
import {Freeze, staticFile, useCurrentFrame} from "remotion";
import type {Page} from "./types";
import {weighted} from "./motion";

export const Character: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame();
  const enter = weighted(frame, 0, 16);
  const isObserve = item.character.includes("右侧探身观察");
  const isSurprise = item.character.includes("右下惊讶");
  const baseEdge = item.characterScale === "hero" ? -155 : item.characterScale === "medium" ? -105 : -55;
  const edge = isObserve ? 42 : isSurprise ? 18 : baseEdge;
  const sizeMultiplier = isSurprise ? 1.24 : 1;
  const characterSize = item.characterWidth * sizeMultiplier;
  const bottom = isSurprise ? item.characterBottom - 20 : item.characterBottom;
  const style: CSSProperties = {
    position: "absolute",
    width: characterSize,
    height: characterSize,
    bottom,
    [item.characterSide]: edge,
    transform: `translateY(${(1 - enter) * 42}px) scale(${0.91 + enter * 0.09})`,
    transformOrigin: "50% 100%",
    zIndex: 6,
  };
  const media = <Video src={staticFile(`character-cache/${item.character}`)} muted style={{width: "100%", height: "100%", objectFit: "contain"}} />;
  return <div style={style}>{frame >= item.freezeFrame ? <Freeze frame={item.freezeFrame}>{media}</Freeze> : media}</div>;
};
