import type {CSSProperties, FC, ReactNode} from "react";
import {useCurrentFrame} from "remotion";
import type {Page} from "./types";
import {crisp, fitSize} from "./motion";

export const ink = "#000000";
export const paper = "#FFFFFF";
export const soft = paper;
export const copyStyle = {fontWeight: 600 as const, letterSpacing: "-0.055em", lineHeight: 1.04};

export const gestureOrigin = (item: Page) => item.characterSide === "left" ? "0% 50%" : "100% 50%";
export const revealFrom = (item: Page) => item.characterSide === "left" ? "left" as const : "right" as const;
export const wipeClip = (progress: number, item: Page) => item.characterSide === "left"
  ? progress >= .999 ? "none" : `inset(0 ${(1 - progress) * 100}% 0 0)`
  : progress >= .999 ? "none" : `inset(0 0 0 ${(1 - progress) * 100}%)`;

export const zoneFor = (item: Page) => {
  const visual = item.characterSide === "left"
    ? item.characterScale === "hero" ? 820 : item.characterScale === "medium" ? 700 : 560
    : item.characterScale === "hero" ? 690 : item.characterScale === "medium" ? 565 : 435;
  return item.characterSide === "left"
    ? {left: visual + 18, width: 1920 - visual - 98}
    : {left: 80, width: 1920 - visual - 98};
};

export const Reveal: FC<{at: number; children: ReactNode; style?: CSSProperties; from?: "left" | "right" | "bottom"}> = ({at, children, style, from = "left"}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = crisp(frame, at, 12);
  const clipPath = from === "right" ? `inset(0 0 0 ${(1 - p) * 100}%)` : from === "bottom" ? `inset(${(1 - p) * 100}% 0 0 0)` : `inset(0 ${(1 - p) * 100}% 0 0)`;
  const x = from === "right" ? (1 - p) * 24 : from === "left" ? (1 - p) * -24 : 0;
  return <div style={{clipPath, transform: `translateX(${x}px)`, ...style}}>{children}</div>;
};

export const Pop: FC<{at: number; children: ReactNode; style?: CSSProperties; origin?: string}> = ({at, children, style, origin = "50% 50%"}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = crisp(frame, at, 14);
  const fromLeft = origin.startsWith("0");
  const clipPath = fromLeft ? `inset(0 ${(1 - p) * 100}% 0 0)` : origin.startsWith("100") ? `inset(0 0 0 ${(1 - p) * 100}%)` : `inset(0 ${(1 - p) * 50}%)`;
  const x = fromLeft ? (1 - p) * -24 : origin.startsWith("100") ? (1 - p) * 24 : 0;
  return <div style={{clipPath: p >= .999 ? "none" : clipPath, transform: `translateX(${x}px) scale(${0.985 + p * 0.015})`, transformOrigin: origin, ...style}}>{children}</div>;
};

export const FitText: FC<{text: string; width: number; max?: number; min?: number; color?: string; style?: CSSProperties}> = ({text, width, max = 104, min = 46, color = ink, style}) => (
  <div style={{width, fontSize: fitSize(text, max, width, min), color, whiteSpace: "nowrap", textAlign: "center", ...copyStyle, ...style}}>{text}</div>
);

export const Card: FC<{text: string; at: number; width: number; height: number; dark?: boolean; style?: CSSProperties; origin?: string}> = ({text, at, width, height, dark, style, origin}) => {
  const frame = useCurrentFrame();
  const settled = frame >= at + 12;
  const shadow = dark
    ? "0 20px 46px rgba(0,0,0,.16)"
    : "0 16px 36px rgba(0,0,0,.11), 0 3px 9px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.95)";
  return <Pop at={at} origin={origin} style={{width, height, boxSizing: "border-box", borderRadius: 28, background: dark ? ink : soft, color: dark ? paper : ink, boxShadow: settled ? shadow : "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 34, ...style}}>
    <Reveal at={at + 12} style={{width: "100%"}}><FitText text={text} width={width - 72} max={88} min={42} color={dark ? paper : ink} /></Reveal>
  </Pop>;
};
