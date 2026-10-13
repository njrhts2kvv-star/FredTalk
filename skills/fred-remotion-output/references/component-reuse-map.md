# 组件复用能力地图

本文件帮助设计与实现时判断：当前参考可以直接传参数、组合基础能力，还是需要复制场景后适配。它不是另一份批准台账；实际取舍仍以 `preferred-motion/catalog.json` 为准，`keep` 不代表接口成熟度相同。

当前库是“可组合基元＋少数完整参数组件＋部分可换媒体场景＋准确场景快照”的混合库。下面描述已存在的接口，不表示全部组件已统一为 FredTalk 设计系统。

当前新增的 library 新 10 期 52 条当前可用成片及源码按表达关系归档在[已确认复刻分类索引](library-new10-confirmed.md)。这里的分类是用途，下面的四类是源码可改造程度，两者可以同时使用。

## 四类实际复用能力

| 类别 | 当前真实例子 | 调用时能改变什么 | 仍需处理什么 |
| --- | --- | --- | --- |
| 可组合基元 | SoftSurface、TranscriptSelection、BranchFocus、ObjectHandoff、FrostedFocus | 内容、位置、选中项、动作时间或聚焦程度 | 本期构图、字体、内容容量、字幕避让与整体节奏 |
| 主视频固定外壳 | [FullscreenVideoWindow](fullscreen-video-window.md) | 真实媒体、入点/速度/声音、局部舞台分辨率、必要的裁切位置 | 全屏主播放默认采用108 v9固定比例/圆角/阴影；本期ROI、字幕、进退与接缝 |
| 完整参数组件 | PromptSend | 文案、建议项、字号、宽高、镜头焦点、秒数cue、主题 | 中文长句和新场景适配后的实际可读性与进出场 |
| 生图驱动快切组件 | [NewsKeywordMatchCut / NMC01](news-keyword-match-cut.md) | 图片、字形框、锚点、统一尺度、暗化、帧时序与音效cue；FFmpeg独立出片或Remotion挂载 | 换词须imagegen重新生图并量测；当前12页API样例准确认可，新内容仍检查 |
| 部分参数化场景 | Clip038；BatchA中的Clip014、Clip015、Clip025等 | 横竖媒体路径或media数组 | 原轨迹、固定时间、媒体播放与入口参数传递 |
| 准确场景快照 | HighlighterSweep；EP99的Decisions、Routing | 原样参考；部分仅开放时间或背景 | 本期文案、数量、尺寸、cue与相邻交接通常要改源码 |

这是能力分类，不是四档画面质量。准确快照可以是很好的参考，参数很多的组件也需要实际审看。

## 共享适配工具

`templates/components/component-adaptation.ts` 是可复制到本期工程的无媒体依赖工具，不新增外观、默认组件或认可记录。保持所选组件的布局与动作，按需要调用下表函数。

| 能力 | 真实接口 | 调用方仍负责 |
| --- | --- | --- |
| 同职责共享字阶 | `sharedTextStyle(style)` | 加载准确字体；同一配置与逻辑画布；例外和父层缩放 |
| 全文与原位强调 | `layoutFullText(text, measure, box)`、`phraseRange(text, phrase, occurrence?)`、`brushRects(glyphs, range)` | 实际字体测量/字距；文案容量；cue、刷子外观、阅读与退出 |
| 同一相机位置 | `cameraPoint(point, camera)` | 同一父层；实际ROI与透视，函数只支持平面缩放/平移 |
| 源时间连续 | `mediaTimeAt(globalFrame, mapping)`、`continueMediaMapping(previous, nextFromFrame, rate?)` | 准确源身份、全局帧、滚动/镜头状态；原生取帧、音轨及有效范围 |

以下为调用片段，字阶和文案从当前执行包取得，不将示例数值设为默认：

```tsx
import {sharedTextStyle, layoutFullText, phraseRange, brushRects,
  continueMediaMapping} from './component-adaptation';
const style = sharedTextStyle(packet.componentAdaptation.resolvedTypography[0]);
// Load the declared local font before measuring. Glyphs and brush use one camera parent.
context.font = `${style.fontWeight} ${style.fontSize}px "${style.fontFamily}"`;
const glyphs = layoutFullText(fullText,
  char => context.measureText(char).width + (style.letterSpacing ?? 0),
  {x: bodyX, y: bodyY, maxWidth: bodyWidth, rowHeight: style.fontSize * style.lineHeight});
const brush = brushRects(glyphs, phraseRange(fullText, currentPhrase, occurrence));
const nextMapping = continueMediaMapping(currentMapping, actualBoundaryFrame, nextRate);
```

可运行执行包例子：

```bash
python3 skills/fred-remotion-output/scripts/scene.py --manifest skills/fred-remotion-output/templates/component-adaptation.example.json --scene-id EX-B
python3 skills/fred-remotion-output/scripts/scene.py --stage joining
```

它只演示字段和调用关系，未绑定真实媒体或完整制作合同，不是可正式出片的已批准分镜。工具通过函数/严格TypeScript与场景传递检查；真实组件换字后的画面、跨行、特写和接缝仍走原内部审看。无需新用户批准步骤，也不把第111期认可升级为任意新内容的批准。

## 1. 可组合基元：可以支持原创，但不替代设计

源码：[ContentMotion.tsx](../../fred-remake/assets/content-motion/ContentMotion.tsx)，时间状态：[motion-state.mjs](../../fred-remake/assets/content-motion/motion-state.mjs)。

- `SoftSurface`：`box`指定位置和尺寸，`fill/radius/shadow/style`控制表面；内容由`children`提供。
- `TranscriptSelection`：接收完整`lines`、字符范围`selection`及字号/颜色，适合在原文中标出准确部分。
- `WaveformTrack`：接收真实归一化波形、总时长、播放位置和选区；不替调用方生成声音证据。
- `BranchFocus`：接收起点、目标区域、选中项以及展开/聚焦时间；调用方提供节点内容与位置。
- `ExpandReturn`、`SlotReplace`、`ObjectHandoff`：分别提供区域展开归位、按cue替换内容、对象移动中的内容交接。
- `FocusStage`、`FrostedFocus`、`ContentClip`、`ViewportMask`：提供前后景聚焦、内容裁切或遮罩能力。

这些组件可以组成新画面；“有分支组件”不等于已经设计好本句的分支关系。先确定对象、因果、阅读对象与出口，再选择所需基元。

[现有manifest](../../fred-remake/assets/content-motion/manifest.json)明确记录：未获新视觉认可、未证明与原参考完整动态一致。字体、输出时钟、几何及字幕运动包络仍是调用方责任。

## 2. 完整参数组件：优先利用已有接口

正例：[PromptSend](../../fred-remake/assets/preferred-motion/sources/previews-v2/src/components/snap-prompt-send.tsx)。

- 内容参数包括`text/placeholder/chips`；所有这些文字均可由本期提供。
- 几何参数包括`width/fieldHeight/fontSize/chipFontSize/radius`；内部`layoutFor`按文字测量和建议项换行重新计算面板。
- 时间参数包括输入、揭示、镜头切入切出、鼠标接近与点击等秒数cue；使用当前composition的实际fps。
- 字体、主题、强调色、镜头焦点和速度已有接口，不必从描述重写整套输入动画。

默认值仍来自其参考画面。换成本期内容后检查长句、中文字体、空建议项、不同数量与字幕区域；不能把接口存在当成新片同质量证明。

## 3. 部分参数化：换素材与换动作是两件事

[Clip038](../assets/reference-code/library-remakes-20260916/purple/src/Clip038.tsx)接收`landscape/portrait`，但容器运动从原始逐帧轨迹读取；它没有因此成为任意时长的媒体接力组件。

[BatchA](../assets/reference-code/library-remakes-20260916/purple/src/BatchA.tsx)多段已有`media`接口；具体镜头的数量、入点、文字和动作限制仍按源码核对。

- [原入口](../assets/reference-code/library-remakes-20260916/purple/src/index.tsx)的`scaleScene`未透传props；只给旧Composition传`inputProps`不会自动替换内容，应在本期入口直接调用组件或明确透传。
- [共享Media](../assets/reference-code/library-remakes-20260916/purple/src/Media.tsx)按后缀识别视频，时长来自素材表，缺省会按5秒循环且静音。真实操作录屏须明确有效范围、循环和音轨，不能沿用演示假设。
- 改分辨率可保留逻辑画布后等比缩放；改fps或口播时长，需要重新映射轨迹和事件，不能只改Composition配置。

更多具体边界见[新增library复刻选型](library-remakes-reuse.md)，不把本批接口推定成整库统一接口。

## 4. 场景快照：保留动作关系，再改本期内容

- [HighlighterSweep](../../fred-remake/assets/preferred-motion/sources/previews-v2/src/components/talk-highlighter-sweep.tsx)：固定报告文字、960×540舞台与30fps时钟；目前的`hostSrc`参数未用于替换正文。
- [EP99 Decisions](../assets/episode-code/ep99-selected-20260921/s20/src/DecisionFlow.tsx)与[Routing](../assets/episode-code/ep99-selected-20260921/s21/src/DecisionFlow.tsx)：开放帧数和部分背景，Jev/Codex文案、判断数量、位置与切换时刻仍是本期实例。

这类源适合保留原动作顺序、视觉重心和进出关系后适配。先复制到本期，再提取真正要换的字段；不得在冻结原版或硬链接上直接修改。

## 固定尺寸缩放不等于内容重排

| 情况 | 实际改变 | 本期检查 |
| --- | --- | --- |
| 逻辑舞台等比缩放 | 整体画面尺寸，内部比例通常保持 | 当前画幅是否合适，字幕与角标是否另处于最终画布层 |
| 内容重排 | 文案变长、数量变化后重新计算宽高、行数或位置 | 阅读顺序、字阶、留白和动作路径是否仍成立 |
| 时钟适配 | 根据录音改变建立、强调、停稳、退出的时刻 | 过程是否完整，停留是否够读，接缝是否接住真实尾态 |

[Shotcraft DesignStage](../../fred-remake/assets/preferred-motion/sources/previews-v2/src/dependencies/Shotcraft/demos/_fixtures/Motion.tsx)提供设计坐标缩放，不能自动解决更多文字；PromptSend的`layoutFor`才包含针对自身内容的重排。两者能力不能混称。

## 目前尚未统一的公共合同

当前不是“完全没有公共代码”，而是公共代码分布在不同来源内部：

- [Snap主题](../../fred-remake/assets/preferred-motion/sources/previews-v2/src/dependencies/Snapcn/registry/snap-cn-ui/core/theme.ts)与[动作参数](../../fred-remake/assets/preferred-motion/sources/previews-v2/src/dependencies/Snapcn/registry/snap-cn-ui/core/motion.ts)服务Snap组件；其默认暖白与蓝色不是自动适用的Fred全局配色。
- Shotcraft、content-motion及EP99各有时间函数与样式数值。秒数、归一化进度、固定帧和测量轨迹并存，调用前必须明确当前时钟。
- 已登记[准确字体与职责](typography.md)，仍没有一套覆盖所有来源的统一字体/字阶/表面/间距/强调色tokens，也没有统一的内容容量、字幕避让和首尾状态接口。

设计规则可以指导如何选择与适配；后续若建立公共主题或时钟适配层，应保留原片身份与原实现，不为统一接口重写全部原库。

## 下一轮优先抽象的表达（建议，尚未新增实现）

| 高频表达 | 现有起点 | 优先抽出哪些变化 |
| --- | --- | --- |
| 输入、发送、反馈接管 | PromptSend | 本期文案、秒数cue、输入与结果的交接状态 |
| 对象展开、筛选与职责分工 | BranchFocus、EP99 Decisions / Routing | 节点与关系、选中项、数量、cue、读取与收束阶段 |
| 媒体轮换、横竖让位与聚焦 | Clip038、ObjectHandoff、FrostedFocus | 媒体身份、有效范围、逻辑画布、进出状态、可读停留 |
| 完整原文阅读与重点推进 | TranscriptSelection、HighlighterSweep | 原文/字符范围、长行布局、聚焦cue、阅读保持与下一焦点 |

只在真实新内容需要时逐项抽象，并用长短文字、不同数量、真实媒体与字幕验证短样；不预先为所有参考创造一套大框架。

2026-10-04已按Fred明确跨期要求新增`templates/components/FullscreenVideoWindow.tsx`公共播放外壳；其余准确原版和原始库保持。该认可仅覆盖108 v9大播放外壳，不宣布所有新组合已达到95/99期认可质量。准确原版、参数能力、技术验证与新片视觉认可继续分别记录。

## 规范站入口

本地规范站：[FredTalk 设计规范](http://127.0.0.1:3061/design/)。源码与构建说明在项目 `tools/fred-motion-picker/design-system/README.md`；设计原则、可操作演示、完整视觉库、准确源码与取舍管理在站内统一完成，不外跳旧前端。资料投影保持只读，用户主动点击保留、不要或撤销时写入既有复看记录；不另建批准台账，不直接改写正式 catalog 或删除源素材。

站内静态与 Remotion 动态演示是新实现，只说明当前能力，不是95/99/100期批准成片，也不继承原片视觉认可。站点源码与历史媒体、字体、API实际数据分离；独立构建不代表素材或第三方代码可开源。本轮仅本地使用，未发布或外发。
