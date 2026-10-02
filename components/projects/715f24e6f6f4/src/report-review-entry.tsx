import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {SP007,Q07} from './report-scenes';
import {withFredFonts} from './fred-scene';
const A=withFredFonts(SP007);const B=withFredFonts(Q07);
registerRoot(()=> <><Composition id="SP007ReportReview" component={A} width={1920} height={1080} fps={30} durationInFrames={477}/><Composition id="Q07ReportReview" component={B} width={1920} height={1080} fps={30} durationInFrames={1380}/></>);
