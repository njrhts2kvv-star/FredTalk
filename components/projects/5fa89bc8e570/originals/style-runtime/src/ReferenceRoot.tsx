import {Composition} from 'remotion';
import manifest from '../approved-manifest.json';
import {V5Sample} from './v5/V5Sample';
import type {V5Spec} from './v5/types';
import {V8Sample} from './v8/V8Sample';
import type {V8Spec} from './v8/types';
import {MotionLab01 as FredMotionLab01,MotionLab02 as FredMotionLab02,MotionLab04 as FredMotionLab04,MotionLab08 as FredMotionLab08,MotionLab12 as FredMotionLab12,MotionLab16 as FredMotionLab16} from './v10';
import type {MotionSpec} from './v10';
import {V13Sample} from './v13-reviewed-fixes/V13Sample';
import type {V13Spec} from './v13-reviewed-fixes/types';
import {PathBuild} from './PathBuild';
import {WordGrid} from './WordGrid';
import {TwoBeat} from './TwoBeat';
import {TerminalList} from './TerminalList';
import {ShapeExpand} from './ShapeExpand';
import {Sample02ModuleSplit} from './samples/Sample02ModuleSplit';
import {Sample03PhoneCounter} from './samples/Sample03PhoneCounter';
import {Sample05MonitorEmergence} from './samples/Sample05MonitorEmergence';
import {Sample06SlotJudgment} from './samples/Sample06SlotJudgment';

const motionComponents={FredMotionLab01,FredMotionLab02,FredMotionLab04,FredMotionLab08,FredMotionLab12,FredMotionLab16};
const v12Components={ApprovedV201PathBuild:PathBuild,ApprovedV202WordGrid:WordGrid,ApprovedV204TwoBeat:TwoBeat,ApprovedV303TerminalCentered:TerminalList,ApprovedV306ShapeExpand:ShapeExpand,ApprovedV402ModuleSplit:Sample02ModuleSplit,ApprovedV403PhoneCounter:Sample03PhoneCounter,ApprovedV405MonitorEmergence:Sample05MonitorEmergence,ApprovedV406SlotJudgment:Sample06SlotJudgment};
const v13Components={'V13referencev713':V13Sample,'V13referencev719':V13Sample};
type Entry=(typeof manifest.approvals)[number];
const ApprovedReference=({entry}:{entry:Entry})=>{
  if(entry.componentRuntime==='v5')return <V5Sample spec={entry.spec as unknown as V5Spec}/>;
  if(entry.componentRuntime==='v8')return <V8Sample spec={entry.spec as unknown as V8Spec}/>;
  if(entry.componentRuntime==='v12-original'){
    const Component=v12Components[entry.stableId as keyof typeof v12Components];
    if(!Component)throw new Error('Missing V12 component '+entry.stableId);
    return <Component/>;
  }
  if(entry.componentRuntime==='v13-reviewed-fix'){
    const Component=v13Components[entry.stableId as keyof typeof v13Components];
    if(!Component)throw new Error('Missing V13 component '+entry.stableId);
    return <Component spec={entry.spec as unknown as V13Spec}/>;
  }
  const Component=motionComponents[entry.stableId as keyof typeof motionComponents];
  if(!Component)throw new Error('Missing motion component '+entry.stableId);
  return <Component spec={entry.spec as unknown as MotionSpec}/>;
};
export const ReferenceRoot=()=><>
  {manifest.approvals.map((entry)=><Composition key={entry.approvalId} id={entry.approvalId} component={ApprovedReference} width={1920} height={1080} fps={60} durationInFrames={entry.duration} defaultProps={{entry}}/>)}
</>;
