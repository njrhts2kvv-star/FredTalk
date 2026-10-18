// FredTalk 2.5 distribution: fred-legacy-fix-20261018
// patch-b1 1080p30 出片入口：组件按秒（t = frame / fps）取 30fps 源时间轴，30fps 下动作速度与 60fps 原版一致。
import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {FredClip} from './clip';
import {PATCH_ID,PATCH_CLIP,PATCH_SECONDS,PATCH_OVERRIDES} from './patch-content';
function Root(){return <>
 <Composition id={PATCH_ID} component={FredClip} width={1920} height={1080} fps={30} durationInFrames={Math.round(PATCH_SECONDS*30)} defaultProps={{id:PATCH_CLIP,overrides:PATCH_OVERRIDES}}/>
 <Composition id={`${PATCH_ID}-60`} component={FredClip} width={1920} height={1080} fps={60} durationInFrames={Math.round(PATCH_SECONDS*60)} defaultProps={{id:PATCH_CLIP,overrides:PATCH_OVERRIDES}}/>
</>}
registerRoot(Root);
