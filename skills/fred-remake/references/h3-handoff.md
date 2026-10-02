# H3 动态参考到 Remotion 的交接

当任务包含 H3 生成后还原、已认可视频复用或连续片段重建时读取。仅生成 H3 提示词/视频的任务不自动进入 Remotion。正文、波形、表面和颜色的设计共用 [内容对象](../../fred-remotion-output/references/content-objects.md)；认可来源由 [公共库](../../fredtalk-deck-motion-pipeline/references/approved-style-library.md) 查询。

## 锁定实际结果

参考动作与输出节奏分别选择：先确定当前口播要表达的变化，再选择已认可动作或需要探索的 H3 片段。在 `preserve/adapt` 中写清借用的对象关系与可变的内容、载体和构图；用户要求准确场景实现时保留指定几何与运动。若 H3 有无意义停顿、错误文字或界面噪声，只继承目标动作，不把这些缺陷当成风格。按录音逐段映射建立、中间变化和收束，不将源视频的全部动作或时长强塞进每句旁白。

参考是已经下载并审看的实际视频，不是原 Prompt 的想象结果。保存视频 hash、源 fps、实际范围和音轨职责。标记哪些运动已认可、哪些偶发错误要修、哪些内容允许变化。只看首尾帧不能证明还原了中间过程。

在现有 production contract 的页面内记录 `productionRoute: h3-remotion` 与 `reconstruction`，不另造一份手写页序。字段如下：

```text
reconstruction.sourceVideo: path, checksum, fps, startFrame, endFrameExclusive
reconstruction.mode: full-remotion | hybrid-repair
reconstruction.output: fps, durationInFrames
reconstruction.preserve[] / adapt[] / mediaDependencies[]
reconstruction.states[]: sourceFrame, role, objectIds[]
reconstruction.timeMap[]: sourceFrame, outputFrame, beatId
reconstruction.review: status, evidence
```

`states` 至少描述建立、一个关键中间变化和终态；复杂遮挡或焦点交接需增加节点。对象用稳定 ID，交接前后沿用同一身份。时间映射允许停住某个源状态，但不能未声明倒放或将全部源片统一倍速来凑口播。源帧率与输出帧率分别记录；录音/SRT 锚点决定输出时刻。

`full-remotion` 指场景、文字和对象关系由代码重建；其中人物、照片等仍可作为已声明素材。`hybrid-repair` 必须写 `bakedRanges[]` 和 `editableRanges[]`，明确保留源片的范围，不把烘焙后段称为可编辑动画。源文件本身无音画分轨时不声称已取得原始分轨。

`review.status` 使用 `agent-reviewed` 或有真实证据的 `user-approved`，二者不等价；生成授权不能冒充样片批准。公共库的源参考认可不自动批准新内容。

## 对象与层级合同

需要白表面持续可见、全屏遮罩或精细返修时，在页面中记录 `visualContract.objects[]`：

- `id / role / fill / strokeWidth / shadow / clipScope`；role 区分 content、surface、background、full-screen-mask。
- 无描边使用 `border: none` 且 `strokeWidth: 0`。不要保留 spread 阴影模拟边线。
- `clipScope: content` 仅揭示内部；裁表面时使用 `clipScope: surface` 并写 `intentionalOcclusion` 理由。
- background 和 full-screen-mask 的 `coverage: viewport`，不受字幕带裁切。
- 需要持续可见的表面声明 `visibleRange: [startFrame, endFrameExclusive]`；这是检查目标，不是可见性的像素证明。

跨片使用 `upstreamTail: {path, checksum, stateId}`，绑定当前上游输出或实际尾帧；修改后必须更新并重验相关接缝。图像尾帧必须再记录 `sourceVideo: {path, checksum}` 和 `frameIndex`；门禁同时校验 PNG 与上游 MP4，不能靠未变化的旧 PNG 掩盖上游更新。

生产依赖使用顶层 `runtimeDependencies: [{path, checksum}]` 登记源码目录以外实际消费的字体、图像、声音、视频及必要代码。stage gate 会在每阶段检查 hash；缺失或变化必须先重建当前合同/receipt。路径相对合同，不引用临时剪贴板或全局缓存。

## 还原与验收

1. 有准确源码先看实际版本的组件与状态函数，比较文字几何、层级、内部变化、速度曲线和交接；不能用一个父层 scale 代替所有内部动画。
2. 前景布局负责字幕避让；载体负责位移/尺寸；表面和阴影保留；内容裁切只处理需要揭示或滚动的区域；全屏过渡独立合成。
3. 返修只改点名层，当前合同只保留有效值。入场、运动峰值、最小表面、遮挡交接和退场均需检查，不能只看终态。
4. 局部诊断后检查完整连续样片及上下场。最终 MP4 按全帧规范再验；结构验证、技术解码和视觉认可分别报告。

`validate-stage-gate.mjs` 已接入上述声明的结构与文件 hash 检查；它不能从这些字段判断美观或表面实际可见。用 [局部可见性检查](render-failure-checks.md#局部表面与内容持续可见)补充实际渲染帧证据。
