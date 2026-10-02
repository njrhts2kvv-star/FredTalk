import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import manifest from "../manifest.json";
import { Batch1 } from "./batch1";
import { Batch2 } from "./batch2";
import { Batch3 } from "./batch3";
import { useFonts } from "./fonts";

export type ContentOverrides = {
  words?: string[];
  assets?: Record<string, string>;
  accent?: string;
  ink?: string;
  background?: string;
  timeScale?: number;
};
export type FredMotionProps = {
  number: number;
  overrides?: ContentOverrides;
  withAudio?: boolean;
};
/** Reusable standalone component. Pass number 1..76 and optional content overrides. */
export function FredMotion({
  number,
  overrides = {},
  withAudio = false,
}: FredMotionProps) {
  useFonts();
  const frame = useCurrentFrame();
  const video = useVideoConfig();
  const config = manifest.pages.find((item) => item.number === number);
  if (!config) throw new Error(`Unknown clip ${number}; expected 1..76`);
  const localTime = frame / video.fps;
  const t = number === 14 && localTime >= 18 ? localTime + 2 : number === 24 && localTime >= 4 ? localTime + 6 : localTime;
  const Component = number <= 25 ? Batch1 : number <= 50 ? Batch2 : Batch3;
  const scale = Math.min(video.width / 1920, video.height / 1080);
  return (
    <AbsoluteFill
      style={{
        background: overrides.background ?? manifest.theme.background,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (video.width - 1920 * scale) / 2,
          top: (video.height - 1080 * scale) / 2,
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          fontFamily: "MiSans,sans-serif",
          fontWeight: 500,
          color: overrides.ink ?? manifest.theme.ink,
        }}
      >
        <Component
          number={number}
          t={t}
          duration={config.duration}
          overrides={overrides}
        />
      </div>
      
    </AbsoluteFill>
  );
}
