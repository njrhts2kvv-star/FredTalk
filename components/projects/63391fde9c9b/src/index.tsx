import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Transition} from './Transition';
import m0 from '../ep87-part-01/manifest.json';
import m1 from '../ep87-part-02/manifest.json';
import m2 from '../ep87-part-03/manifest.json';
const manifests=[m0,m1,m2];
registerRoot(()=> <>{manifests.flatMap(m=>m.pages).map(clip=><Composition key={clip.stableId} id={clip.stableId} component={Transition} width={3840} height={2160} fps={60} durationInFrames={clip.durationInFrames} defaultProps={{clip}}/>)}</>);
