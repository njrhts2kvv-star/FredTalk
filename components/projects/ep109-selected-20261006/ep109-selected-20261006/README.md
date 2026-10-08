# 第109期六个精选组件 · 独立源码包

包含109-01至109-06的原动画源码、字幕/品牌开关、媒体、字体和33帧原片入口补片。六段范围为0-2、20-27、54-65、70-74、107-110、131-136秒，共32秒/1920帧。

先运行npm install，再运行node typecheck.cjs、node render.cjs list。渲染示例：node render.cjs render EP109-Selected-01 output.mp4；FRED_RENDER_SCALE=2可输出4K。原始逻辑舞台1920×1080，由父层缩放一次。

点击开场使用真实WebGL网格，需支持WebGL的Chrome；通过FRED_BROWSER_EXECUTABLE指定本机Chrome路径。Remotion固定4.0.473，React固定19.2.4。

SelectedComponents.tsx导出EP109Selected01至EP109Selected06。按新内容适配文字、素材、ROI、cue及入口接缝，再审看实际短样。includeSubtitles/includeBrand关闭本期叠层；preserveOriginalBoundaryPixels用于保持原示例入口，改内容时关闭或重做。videoSrc/gridSrc只透传给支持媒体替换的原函数，不代表任意新素材已验证。

示例和认可只覆盖六个指定范围。NativeSceneClock保留真实场景帧与媒体时钟；录屏跨S09/S10连续，模型比较包含V9的实际修订。31份原源码与数据单独记录；新入口、时钟和发布版工具单独记录。公开视频无声，源素材仅供本组件适配。
