import React from 'react';
import {Composition} from 'remotion';
import manifest from '../../docs/sixth-sentence-manifest.json';
import {SixthSentence} from './SixthSentence';
export const Root:React.FC=()=> <>{manifest.pages.map(page=><Composition key={page.stableId} id={page.stableId} component={SixthSentence} durationInFrames={page.durationInFrames} fps={manifest.fps} width={manifest.width} height={manifest.height}/>)}</>;
