import React from 'react';
import {registerRoot,Composition,Audio,staticFile} from 'remotion';
import {CodexFullWindowFlow} from './CodexFullWindowFlow';
export function CodexDemo(){return <><CodexFullWindowFlow/><Audio src={staticFile('codex.wav')}/></>;}
export function Root(){return <Composition id="CAM04" component={CodexDemo} durationInFrames={840} fps={60} width={1920} height={1080}/>;}
registerRoot(Root);
