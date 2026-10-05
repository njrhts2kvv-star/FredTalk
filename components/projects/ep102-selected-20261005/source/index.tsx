import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {EP102Selected01, EP102Selected02, EP102Selected03, EP102Selected04, EP102Selected05, EP102Selected06, EP102Selected07} from './SelectedComponents';
import specs from './component-specs.json';

const components = [EP102Selected01, EP102Selected02, EP102Selected03, EP102Selected04, EP102Selected05, EP102Selected06, EP102Selected07];
function EP102SelectedRoot() {
  return <>{specs.map((spec, i) => <Composition key={spec.id} id={spec.compositionId} component={components[i]} width={3840} height={2160} fps={60} durationInFrames={spec.durationInFrames} defaultProps={{includeAudio: true, includeSubtitles: true, includeBrand: true}}/>)}</>;
}
registerRoot(EP102SelectedRoot);
