export type CharacterScale = "small" | "medium" | "hero";

export type Page = {
  stableId: string;
  compositionId: string;
  exactScreenWords: string[];
  character: string;
  characterSide: "left" | "right";
  characterScale: CharacterScale;
  characterWidth: number;
  characterBottom: number;
  freezeFrame: number;
  gestureMode: string;
  gestureY: number;
  option: "A" | "B" | "C";
  group: number;
  topology: string;
  layout: string;
  carrierCue: number;
  moduleCues: number[];
  durationInFrames: number;
  outputFile: string;
};
