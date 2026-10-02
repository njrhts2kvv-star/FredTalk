import type {V7Spec} from '../v7/types';
import type {MotionSpec} from '../v10/MotionShared';

export type ReviewDecision='keep'|'adjust';

export type V11Spec={
  stableId:string;
  sourceBeatIds:string[];
  approvalId:string;
  compositionId:string;
  decision:ReviewDecision;
  sourceKind:'reference'|'motion'|'historical';
  sourceStableId:string;
  duration:number;
  words:string[];
  cues:number[];
  sfx:string[];
  background:'black'|'white';
  reviewNote:string;
};

export type LegacyReferenceSpec=V7Spec;
export type LegacyMotionSpec=MotionSpec;
