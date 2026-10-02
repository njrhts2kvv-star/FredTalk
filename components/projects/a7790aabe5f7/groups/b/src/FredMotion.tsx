import { RebuiltB066 } from "./RebuiltB066";
import { RebuiltB064 } from "./RebuiltB064";
import { RebuiltBTypeFailure } from "./RebuiltBTypeFailure";
import { RebuiltBRepresentatives } from "./RebuiltBRepresentatives";
import { RebuiltBPills } from "./RebuiltBPills";
import { RebuiltBPanels } from "./RebuiltBPanels";
import { RebuiltBGeometric } from "./RebuiltBGeometric";
import { RebuiltBFinalFour } from "./RebuiltBFinalFour";
import { RebuiltBChatPhone } from "./RebuiltBChatPhone";
import { RebuiltBChartStage } from "./RebuiltBChartStage";
import { RebuiltB060 } from "./RebuiltB060";
import { RebuiltB042 } from "./RebuiltB042";
import { RebuiltB035 } from "./RebuiltB035";
import { RebuiltB027 } from "./RebuiltB027";
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
import { RebuiltB002 } from "./RebuiltB002";
import { RebuiltB062 } from "./RebuiltB062";
import { RebuiltB063 } from "./RebuiltB063";
import { RebuiltB065 } from "./RebuiltB065";

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
  if (number === 2) return <RebuiltB002 frame={frame} text={overrides.words?.[0]} accent={overrides.accent} assets={overrides.assets}/>;
  if (number === 62) return <RebuiltB062 frame={frame}/>;
  if (number === 63) return <RebuiltB063 frame={frame}/>;
  if (number === 65) return <RebuiltB065 frame={frame}/>;
  if (number === 9) return <RebuiltBRepresentatives number={number} frame={frame}/>;
  if (number === 11) return <RebuiltBRepresentatives number={number} frame={frame}/>;
  if (number === 18) return <RebuiltBRepresentatives number={number} frame={frame}/>;
  if (number === 19) return <RebuiltBRepresentatives number={number} frame={frame}/>;
  if (number === 7) return <RebuiltBGeometric number={number} frame={frame}/>;
  if (number === 16) return <RebuiltBGeometric number={number} frame={frame}/>;
  if (number === 24) return <RebuiltBGeometric number={number} frame={frame}/>;
  if (number === 38) return <RebuiltBPills number={number} frame={frame}/>;
  if (number === 70) return <RebuiltBPills number={number} frame={frame}/>;
  if (number === 44) return <RebuiltBPanels number={number} frame={frame}/>;
  if (number === 46) return <RebuiltBPanels number={number} frame={frame}/>;
  if (number === 27) return <RebuiltB027 frame={frame}/>;
  if (number === 6) return <RebuiltBChatPhone number={number} frame={frame}/>;
  if (number === 14) return <RebuiltBChatPhone number={number} frame={frame}/>;
  if (number === 69) return <RebuiltBChartStage number={number} frame={frame}/>;
  if (number === 75) return <RebuiltBChartStage number={number} frame={frame}/>;
  if (number === 26) return <RebuiltBTypeFailure number={number} frame={frame}/>;
  if (number === 74) return <RebuiltBTypeFailure number={number} frame={frame}/>;
  if (number === 8) return <RebuiltBFinalFour number={number} frame={frame}/>;
  if (number === 20) return <RebuiltBFinalFour number={number} frame={frame}/>;
  if (number === 41) return <RebuiltBFinalFour number={number} frame={frame}/>;
  if (number === 59) return <RebuiltBFinalFour number={number} frame={frame}/>;
  if (number === 60) return <RebuiltB060 frame={frame}/>;
  if (number === 35) return <RebuiltB035 frame={frame}/>;
  if (number === 42) return <RebuiltB042 frame={frame}/>;
  if (number === 64) return <RebuiltB064 frame={frame}/>;
  if (number === 66) return <RebuiltB066 frame={frame}/>;
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
