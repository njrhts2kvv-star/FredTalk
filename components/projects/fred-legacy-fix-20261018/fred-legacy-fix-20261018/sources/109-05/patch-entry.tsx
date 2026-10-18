// FredTalk 2.5 distribution: fred-legacy-fix-20261018
// patch-b1 入口：109-05 原样 60fps 渲染（Body 内 t = frame / 60 写死），再用 ffmpeg 转 30fps。
// 只关掉本期字幕叠层（窗下那行约 26px 的“第三步啊就是把打击感写成具体的动作”是第109期口播字幕，不属于组件）；
// 角标保留。关字幕后前 6 帧不再用冻结接缝 PNG（那 6 帧 PNG 里烧着旧字幕和旧红黄蓝点），改为实时渲染。
import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {EP109Selected05} from './SelectedComponents';
function Root(){return <Composition id="T02r4p-LineFocus" component={EP109Selected05} durationInFrames={180} fps={60} width={1920} height={1080}
  defaultProps={{includeSubtitles:false,includeBrand:true,preserveOriginalBoundaryPixels:false}}/>;}
registerRoot(Root);
