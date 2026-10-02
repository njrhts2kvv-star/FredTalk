import React from 'react';
import {registerRoot,Composition} from 'remotion';
import {RebuiltC006,FontProof} from './RebuiltC006';
import spec from '../../../../specs/C006.json';
registerRoot(()=> <><Composition id="C006" component={RebuiltC006} width={spec.output.width} height={spec.output.height} fps={spec.output.fps} durationInFrames={spec.output.durationInFrames}/><Composition id="C006FontProof" component={FontProof} width={1920} height={1080} fps={60} durationInFrames={1}/></>);
