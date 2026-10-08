import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {EP109Selected01,EP109Selected02,EP109Selected03,EP109Selected04,EP109Selected05,EP109Selected06} from './SelectedComponents';
const components=[EP109Selected01,EP109Selected02,EP109Selected03,EP109Selected04,EP109Selected05,EP109Selected06];
const durations=[120,420,660,240,180,300];
function Root(){return <>{components.map((component,index)=><Composition key={index}
  id={`EP109-Selected-${String(index+1).padStart(2,'0')}`} component={component} durationInFrames={durations[index]} fps={60} width={1920} height={1080}/>)}</>;}
registerRoot(Root);
