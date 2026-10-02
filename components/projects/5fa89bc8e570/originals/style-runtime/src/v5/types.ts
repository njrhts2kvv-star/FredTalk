export type V5Spec = {
  stableId: string;
  group: 'transition' | 'character' | 'attachment' | 'typography' | 'evidence';
  layout: string;
  background: 'white' | 'black';
  words: string[];
  cues: number[];
  duration: number;
  sfx: string[];
  sourceBeatIds: string[];
};
