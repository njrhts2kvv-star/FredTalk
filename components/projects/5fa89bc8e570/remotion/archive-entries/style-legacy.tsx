import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {V7Sample} from '../../originals/style-runtime/src/v7/V7Sample';
import manifest from '../../originals/style-runtime/production/v7/manifest.json';
const spec=manifest.pages.find(p=>p.stableId==='Fred86Reference17')!;
registerRoot(()=> <Composition id="Fred86Reference17" component={V7Sample} defaultProps={{spec:spec as any}} width={1920} height={1080} fps={60} durationInFrames={420}/>);
