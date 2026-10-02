import {Easing, interpolate, spring} from "remotion";

export const crisp = (frame: number, start: number, length = 12) => interpolate(frame, [start, start + length], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

export const weighted = (frame: number, start: number, duration = 17) => spring({
  fps: 30,
  frame: Math.max(0, frame - start),
  durationInFrames: duration,
  config: {damping: 18, stiffness: 235, mass: 0.78},
});

export const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

export const fitSize = (text: string, max: number, width: number, min: number) => {
  const estimate = width / Math.max(1, Array.from(text).length * 0.96);
  return Math.max(min, Math.min(max, estimate));
};
