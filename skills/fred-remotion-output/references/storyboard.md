# 稿子到连续分镜

当前交付遵循[组件库交付门禁](library-delivery-gate.md)：默认认可组件复用/二创，原创须当次场景授权；历史探索说明不覆盖此约束。

新一期先按[图文建议与关键帧](route-and-storyboard-review.md)主动交付逐段建议；Fred选定方向后落实真实组件关键帧，确认后再完成动态与整片输出。录音可后到，估时与真实cue分开。

本文件仅在拿稿拆分/改时序时读。先按[制作默认值与选型表](production-defaults.md)确定内容证据、载体和动作关系，再按全文责任拆组，并按 [场景执行方式](scene-workflow.md) 给每组填主类型与实际附加项；此时只需 `scene.py --list` 的简短目录。开始制作该组时再取它的小抄，不能提前把全部类型、历史规则和源码塞入上下文。

## 读完整稿后再切镜头

先明确观众起点、核心问题、例子、操作证明和结束结论。找口播中的动词与关系变化：打开、选择、保存、对比、交接、纠正、继续；它们通常比自然段更适合决定动作节点。一个镜头组可以容纳多句，一句也可跨建立/重点两种状态。

从原文建立 `sourceSpans`：UTF-8 文件解码后的 Unicode 字符索引，左含右不含；`text` 必须与该字符范围逐字一致。所有正文字符由镜头或明确的纯口播/保留录屏区间负责；空白分隔可跳过，重复归属须写 `sharedSourceReason`。上屏摘要可以精简，但不能把摘要回写成逐字稿。

正式录音/SRT 存在时用其语义 cue 定时，SRT 自动识别与锁定原文不同时记录差异并修对齐，不静默改稿。只有文字时估时允许继续设计，但标记 `timingStatus: estimated`；不能把该标记改成音频已校准来通过正式检查。音频到位后重算全局帧表；不得用统一估时覆盖真实cue，真实口播恰好等长则可保留。

## 按内容复用与保持质感

完整大模块、黑白胶囊及成熟动画适合本句内容就直接复用，可只改文案、素材和cue。各段需有具体信息职责与清楚的主次、阅读和交接；相同外壳、动作或布局本身不是失败，不设置近期禁用表、冷却期或创新配额。新设计按同等字体、几何、层次和动作质感评估，不能以新颖抵消粗糙。效果库不是每镜必套：没有准确案例时走 `original`，但必须写风格/动作锚点、styleContract、创新元素和风险；纯口播或真实媒体可走 `talk-only`/`preserved-media`。

[制作默认值](production-defaults.md)负责内容与媒体选型；[从内容到组件](content-to-component.md)负责准确源码绑定和表达/质感的实际评估。现有visualPlan/referenceChoices记录本期决定，change只记实际适配；不为填写差异强改认可外观。历史对照只在用户要求或具体问题需要时读取。
## 每个镜头组的判断

| 问题 | 有效答案 | 容易失败的答案 |
| --- | --- | --- |
| 观众先看到什么 | 上一镜头保留的文档与当前待改条目 | 无信息空白后再从头飞入所有元素 |
| 本句改变什么 | 余量缩短、选中一条、文档出现实际进度 | 整张静图持续漂移 |
| 需要读什么 | 真实原文中的当前短语，放大后停稳 | 全文缩成小字，同时大面积留白 |
| 下一句接什么 | 从当前条目直接移向下一条，保持文档 | 每句都回到全景再重来 |
| 如何解释十几秒 | 内容逐步建立、逐项聚焦与适量阅读 | 一张无内容的卡片不变地撑完整段 |

稳定阅读是有效状态，不为避免静止强行切镜；同时检查稳定期间口播是否已经换了对象或结论。镜头变化需要使信息更可读或关系更清楚，不设置统一“每两秒切一次”。

## 单一 Manifest 的新增字段

沿用生产门禁已有 `pages/stableId/sourceBeatIds/scriptAnchor/exactScreenWords/startFrame/durationInFrames/motionEvents`。下列字段用于补充语义，不另建重复时间线：

```text
script: {path, sha256}                     # 相对 Manifest 文件
timingStatus: estimated | audio-aligned | approved-manual
timelineFps; durationInFrames
parts: [{id, startFrame, endFrameExclusive}]
pages[].sourceSpans: [{startChar, endChar, text}]
pages[].oneQuestion                       # 本组的唯一主要解释任务
pages[].visualPlan:
  enter; change; read; exit; handoff
pages[].referenceChoices:
  [{id, reason, preserve, change, useScope}]
pages[].implementationMode: reference | adapted | original | preserved-media | talk-only
pages[].referenceDisposition: {mode, reason, anchors?, styleContract?, newElements?, risks?, reviewRequired?}
pages[].mediaContract: [{id, path, role, required, sha256?, startFrame?, endFrameExclusive?}]
pages[].dynamicContract: {mode: dynamic | mixed | stable-reading, requiredChangeEvents?, staticAllowanceSeconds?, reason?}
pages[].motionEvents[].cueFrame           # 本 Skill 采用全局帧，调用组件时再减组起点
pages[].motionEvents[].spokenCue          # 原稿中实际出现的短语
pages[].referenceFps / mediaInFrame        # 涉及参考片段时按需记录
pages[].sceneGuide                        # type/modifiers/signature/applications；字段见scene-workflow
```

`visualPlan`的enter/change/read/exit/handoff描述状态责任，不是必须做五次动画。可以写“沿用上游已建立状态”“静态阅读”“保持到下一段”，无需强制重新入场、推近或退场。纯媒体且不额外加字时，`exactScreenWords: []`是合法明确值，不能省略字段。

来源、字幕与分镜中的时间都明确时钟，剪辑后版本不能直接套原工程帧号。序列错开、允许的动作重叠与完整时长分别建模；`pages` 划分口播职责，过渡可显式使用 `transitionOverlapFrames`，不能靠无解释的时间空洞填充。

`scripts/validate_storyboard.py --manifest <path>` 检查原稿 hash/覆盖、cue 是否来自对应原文、唯一 ID、组/分段时序与排除参考。新规划实现前加 `--require-scene-guides --require-production-contract`，检查实现模式、原创风格合同、媒体契约、动态/静止声明和本场景规则；估时给出待校准提示，正式时序检查用 `--require-final-timing`。它不判定画面是否美观，不证明Agent已阅读，不代替stage gate。旧片限改加`--scene-id <stableId>`（可重复），只检查目标的小抄与源码归因；原文覆盖、全局时间和原有排除项检查仍保留，不强制重规划认可区。

## 例子：交接笔记的 20 秒如何设计

这里说明动作关系，不给下一期固定时长或文字。实际 cue 来自新录音。

| 口播意图 | 画面动作 | 阅读与交接 |
| --- | --- | --- |
| 先留下完整交接笔记 | 宽白窗口建立，包含本期目标、已做、未做和下一步 | 先让观众认出文档全貌 |
| 开头已经确认 | 镜头靠近进度一段，紫色扫底命中实际短语 | 当前文字停稳，必要上下文仍可见 |
| 继续时保持哪些内容 | 从当前焦点平移到保留项，不重新缩回全景 | 高亮与白色承载一起移动，不露半片空白 |
| 下一步做什么 | 继续到未完成项，结果和下一操作有内容 | 尾态把“下一步”交给后续界面/演示 |

相比“一个标题加三个空泛词”，这里的质量来自真实正文、口播绑定、可读落点和连续关系；不能只复用窗口圆角。

## 分镜图探索

给 ChatGPT Pro 的单镜头 Prompt 至少包含：

```text
镜头身份与口播原文：...
观众现在要理解：...
必须准确的上屏词：...
现有素材与来源：...
参考 A 只借用什么；参考 B 只借用什么：...
建立状态 → 信息变化 → 重点可读状态 → 下段交接：...
画幅、当前字幕区/角标要求：...
允许调整的构图与需要避免的实际问题：...
输出用途：分镜方向；如需多状态，说明数量与身份。
```

默认不钉死整期坐标、字号或统一左右比例。真实 UI 槽位要指出实际材料；图中示意不能流入安装/操作证据。方向成立后逐槽获取独立高清素材，文字和精确几何仍由 Remotion 实现。
