import React from 'react';
import {AbsoluteFill,Composition,useCurrentFrame,useVideoConfig,staticFile} from 'remotion';
import manifest from '../manifest.json';
import {Clip,font} from './common';
import {Questions,TitleWindow,Baseline,Matrix,ListExpand,QuestionCards} from './type-scenes';
import {DiagramFocus,FormulaFocus} from './focus-scenes';
import {BranchThree,TreeFlow} from './branch-scenes';
const sceneByKind={questions:Questions,'title-window':TitleWindow,baseline:Baseline,matrix:Matrix,
  'list-expand':ListExpand,'question-cards':QuestionCards,'diagram-focus':DiagramFocus,'formula-focus':FormulaFocus,
  'branch-three':BranchThree,'tree-flow':TreeFlow};
export const Scene:React.FC<{clipId:string}>=({clipId})=>{
  const frame=useCurrentFrame(),{fps,width}=useVideoConfig();
  const c=manifest.pages.find(p=>p.stableId===clipId)!;
  const Component=sceneByKind[c.kind as keyof typeof sceneByKind];
  return <AbsoluteFill style={{background:c.background,overflow:'hidden',fontFamily:font}}>
    <div style={{position:'absolute',width:manifest.width,height:manifest.height,transform:'scale('+width/manifest.width+')',transformOrigin:'top left'}}>
      <Component c={c as Clip} t={frame/fps}/>
    </div>
  </AbsoluteFill>;
};
export const Root:React.FC=()=> <>
  {manifest.pages.map(c=><Composition key={c.stableId} id={c.stableId} component={Scene} durationInFrames={c.durationInFrames}
    fps={manifest.fps} width={manifest.width} height={manifest.height} defaultProps={{clipId:c.stableId}}/>)}
</>;
