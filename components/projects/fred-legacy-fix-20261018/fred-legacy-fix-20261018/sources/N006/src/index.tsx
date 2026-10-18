// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {Composition,registerRoot} from 'remotion';
import manifest from '../manifest.json';
import {FredClip} from './clip';
export type {Overrides} from './clip';
export {FredClip} from './clip';
function Root(){return <>{manifest.clips.map(c=><Composition key={c.id} id={c.id} component={FredClip} width={1920} height={1080} fps={60} durationInFrames={c.durationInFrames} defaultProps={{id:c.id,overrides:{}}}/>)}</>}
registerRoot(Root);
