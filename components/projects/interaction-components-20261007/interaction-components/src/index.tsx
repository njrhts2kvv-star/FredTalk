import React from 'react';import {Composition,registerRoot} from 'remotion';
import {NewsBrushFocus,NewsSpotlightFocus,NewsFocusProps} from './NewsFocus';
import {CodexFullWindowFlow,fullTimeline} from './CodexFullWindowFlow';
import {WeChatConversation} from './WeChatConversation';
const sample:NewsFocusProps={src:'news.png',sourceWidth:2958,sourceHeight:1508,regions:[{x:.2245,y:.2788,width:.376,height:.0332}],zoom:2.05,color:'#FFE949'};
function YellowParallel(){return <NewsBrushFocus {...sample} order="parallel"/>;}
function YellowCameraFirst(){return <NewsBrushFocus {...sample} order="camera-first"/>;}
function SpotlightParallel(){return <NewsSpotlightFocus {...sample} order="parallel"/>;}
function SpotlightCameraFirst(){return <NewsSpotlightFocus {...sample} order="camera-first"/>;}
function CodexDemo(){return <CodexFullWindowFlow/>;}
function WeChatDemo(){return <WeChatConversation/>;}
const Root=()=> <>
 <Composition id="Yellow-Parallel" component={YellowParallel} width={1920} height={1080} fps={60} durationInFrames={420}/>
 <Composition id="Yellow-Camera-First" component={YellowCameraFirst} width={1920} height={1080} fps={60} durationInFrames={420}/>
 <Composition id="Spotlight-Parallel" component={SpotlightParallel} width={1920} height={1080} fps={60} durationInFrames={420}/>
 <Composition id="Spotlight-Camera-First" component={SpotlightCameraFirst} width={1920} height={1080} fps={60} durationInFrames={420}/>
 <Composition id="Codex-EP109" component={CodexDemo} width={1920} height={1080} fps={60} durationInFrames={fullTimeline().totalFrames}/>
 <Composition id="WeChat-Neutral" component={WeChatDemo} width={1920} height={1080} fps={60} durationInFrames={750}/>
</>;
registerRoot(Root);
