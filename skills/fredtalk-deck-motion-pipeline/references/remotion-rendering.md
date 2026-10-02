# Remotion 与渲染

所有画面是 frame 的纯函数：使用 `useCurrentFrame()`、`interpolate()`、`spring()` 和固定 seed；禁止 CSS transition/animation、`setTimeout`、未受控异步状态和无 seed 随机。

先输出 1080p30/60 样片，确认后输出 3840×2160、60fps、H.264、yuv420p、BT.709、AAC、MP4、不透明背景。正式渲染进入 staging；使用显式 composition、帧数、并发和编码参数。字体加载完成后再渲染，长文字先测量换行和 overflow。全量前必须执行 typecheck、lint、代表页单帧、代表页 1080p 动画、音效和末帧检查。

正式 QC 检查 dimensions、fps、codec、pixel format、color primaries/transfer/space、AAC、时长和帧数。关键帧从本轮 staging 视频抽取；核对 mtime/hash，避免旧文件假通过。


## 减少重复渲染

按 [快速质量入口](fast-quality-production.md) 先诊断字体/几何和高风险交接，再做完整样片。已完整认可且要求有限修改直出的项目使用正式返修分支，当前内部预览可只渲染修改窗口与接缝；不受影响的交付段保留并做回归，最终文件的适用 QC 不省略。

渲染启动后冻结源码、字体和依赖；需要继续编辑时用实际隔离的源快照，不能让运行中的构建读到另一版文件。明确关闭浏览器和 bundle 资源，输出回调完成后核对文件封装与 QC；进程仍驻留和渲染未完成分开判断。重试记录报错、变更变量和结果，不把一次并发/timeout恢复当通用最优参数或根因证明。
