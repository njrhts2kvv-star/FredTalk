import React from 'react';
import {Composition,registerRoot,useCurrentFrame} from 'remotion';
import {RebuiltBRepresentatives} from './RebuiltBRepresentatives';
const Probe=({number}:{number:number})=><RebuiltBRepresentatives number={number} frame={useCurrentFrame()}/>;
registerRoot(()=><>{[[9,651],[11,840],[18,600],[19,780]].map(([number,duration])=><Composition key={number} id={'B'+String(number).padStart(3,'0')} component={Probe} width={1920} height={1080} fps={60} durationInFrames={duration} defaultProps={{number}}/>)}</>);
