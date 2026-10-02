import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {RebuiltB002} from './RebuiltB002';
const B002Probe=({proof}:{proof:boolean})=><RebuiltB002 frame={useCurrentFrame()} proof={proof}/>;
registerRoot(()=> <><Composition id="B002Proof" component={B002Probe} durationInFrames={330} fps={60} width={1920} height={1080} defaultProps={{proof:true}}/><Composition id="B002Fred" component={B002Probe} durationInFrames={330} fps={60} width={1920} height={1080} defaultProps={{proof:false}}/></>);
