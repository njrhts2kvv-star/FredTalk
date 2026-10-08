import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {OP02, OP03, OP05, OP09, OP10} from './OpeningScenes';
import {EX05, EX08} from './ExplainScenes';
import {RC01, RC02, RC03, RC04, RC05} from './RecordingScenes';
import {HD02, HD03} from './HandoffScenes';
export const SELECTED_IDS=["OP02","OP03","OP05","OP09","OP10","EX05","EX08","RC01","RC02","RC03","RC04","RC05","HD02","HD03"] as const;
const scenes=[
  {id:'OP02',component:OP02,durationInFrames:240},
  {id:'OP03',component:OP03,durationInFrames:240},
  {id:'OP05',component:OP05,durationInFrames:240},
  {id:'OP09',component:OP09,durationInFrames:240},
  {id:'OP10',component:OP10,durationInFrames:240},
  {id:'EX05',component:EX05,durationInFrames:480},
  {id:'EX08',component:EX08,durationInFrames:540},
  {id:'RC01',component:RC01,durationInFrames:480},
  {id:'RC02',component:RC02,durationInFrames:480},
  {id:'RC03',component:RC03,durationInFrames:480},
  {id:'RC04',component:RC04,durationInFrames:480},
  {id:'RC05',component:RC05,durationInFrames:480},
  {id:'HD02',component:HD02,durationInFrames:420},
  {id:'HD03',component:HD03,durationInFrames:420},
];
function Root(){return <>{scenes.map(({id,component,durationInFrames})=><Composition key={id} id={id} component={component as React.FC} width={1920} height={1080} fps={60} durationInFrames={durationInFrames}/>)}</>;}
registerRoot(Root);
