---
name: fred-remotion-output
description: "从逐字稿、可选录音与素材到场景选型、真实关键帧、Remotion 视频及局部返修。使用仓库内组件库和设计规则，先给可审看的图文建议，再实现真实内容并完成内部动态检查。"
metadata:
  display_name: FredTalk Video Production
---

# FredTalk 视频制作

帮助创作者把逐字稿讲清楚。组件、代码和媒体从当前仓库获取；入口见[组件库](references/library.md)，不要依赖作者的私人目录或旧项目。

第102期新增七个准确场景已排在视觉库前面，标注 NEW 与新增时间（2026-10-05 11:47:11，北京时间）。区间、独立入口和下载方式见[第102期组件](references/episode102-selected.md)。

## 工作顺序

**稿件／可选录音 → 逐段图文建议 → 选择方向 → 真实组件关键帧 → 修改反馈 → 内部动态检查 → 完整视频 → 局部返修。**

第一版建议就提供内容：这一句讲什么、为什么这样表现、对应的真实参考图片或短片。方向确定后，使用当前稿件和素材实现关键帧，检查排版、主次、尺度、可读性及遮挡。关键帧反馈处理后，由助手检查短动画、声音与接缝，再交付完整视频。

已有确认不重复索要；明确直出要求可以覆盖用户审看步骤，但必须如实记录未审看范围，继续执行必要技术检查。静态认可、动态审看、技术通过和用户批准是不同状态。

## 把要求带入每个场景

只维护一份当前 Manifest。将镜头、文字、材质、保留范围写入 `designContract` 和受影响场景。使用 `scene.py --manifest <path> --scene-id <id>` 读取场景执行包。修方向时同步视觉计划、动作和关键帧目的，不只换一张图。

首次设计读[设计语言](DESIGN.md)、[字体职责](references/typography.md)和[制作默认值](references/production-defaults.md)。组件选型与真实调用见[从内容到组件](references/content-to-component.md)。完整模块适合就复用；默认复用认可组件或保留核心构图、关系、动作的二创；找不到时报告待选缺口。原创只接受当前用户针对该场景的明确授权。

## 交付门禁（2026-10-04便携版）

建议和关键帧交付前分别运行[组件库交付门禁](references/library-delivery-gate.md)。只通过技术检查不足以交付，助手必须实际审看准确参考和本次输出。直出授权不跳过内部验收，静态帧与音频联动不冒充动态认可。分发gate按本仓库当前catalog和源码hash检查，不能使用生产目录的原始hash。

[统一用途](references/visual-usage.md)使用六类任务检索；字体按原有五家族职责选取。深底可编辑前景紫色使用`#D6BEFF`，浅底保留准确源；历史媒体像素不改。

## 当前阶段入口

| 阶段 | 资料或工具 |
|---|---|
| 拆稿、提出图文建议 | [路线与确认](references/route-and-storyboard-review.md)、[拆稿](references/storyboard.md) |
| 查询组件 | `python3 scripts/catalog.py --query "对象与动作" --limit 3`；[组件库](references/library.md) |
| 开始当前场景 | `python3 skills/fred-remotion-output/scripts/scene.py --list` 或 `--manifest <path> --scene-id <id>` |
| 获取代码与媒体 | [依赖说明](references/components-and-dependencies.md)、仓库 `scripts/assets.py` |
| 设计新画面 | [探索](references/exploration.md)、[分镜图](references/storyboard-image-workflow.md) |
| 对象交接与文字动作 | [对象过渡](references/object-transitions.md)、[文字呈现](references/text-presentation.md) |
| 视频、录屏和蒙版 | [媒体与蒙版](references/media-and-overlays.md) |
| 真实关键帧及短段审看 | [审看片](references/segment-review.md)、[内容与质感](references/content-to-component.md) |
| 声音、拼接与交付 | [音效](references/sound-effects.md)、[渲染与交付](references/render-and-delivery.md)、[阶段门禁](references/production-gates.md) |
| 局部返修和规则维护 | [制作默认值](references/production-defaults.md)、[维护](references/maintenance.md) |

## 制作原则

1. 最新要求优先。锁定原文和实际素材；最终录音到位后更新受影响时序、字幕和声音，不只替换音轨。
2. 每个对象与动作都有本句职责。按语义选择构图、载体与节奏，不把场景类别当成固定模板。
3. 先检查内容，再判断动作。检查首个可读状态、运动全过程、内容切换边界以及相邻首尾态；静帧不能证明中间过程正确。
4. 同一前端保存当前建议、关键帧和视频意见，并绑定准确版本。不要把旧版本意见当作新版本批准。
5. 保护非目标画面、时间、音轨和素材。局部返修只处理受影响范围。未经当前授权，不上传私人媒体、调用付费服务或公开发布。
6. 默认独立16:9，1080p预览、4K60正式；当前项目规格优先。准确场景快照不自动升级为通用参数组件。
7. FredTalk解释动画使用适用品牌层；主内容为真实录屏、实拍或生成视频时按规则显隐。烧录字幕时检查关键前景在整个运动范围内的避让。

## 音频与关键帧

`build_segment_review.py`读取Manifest的`audio.path/sha256`，音频时间驱动当前场景与离散帧，支持跳帧、倍速与反向定位；见[审看片](references/segment-review.md)。录音或帧换版重新生成页面，hash变更不能复用旧批准。

音频剪切和字幕纠错使用独立[音频和字幕粗剪](../audio-subtitle-roughcut/SKILL.md)。便携包包含本地审片、导出与可选ASR，不包含私人自然人声运行环境。

## 工具与边界

制作契约使用 `workflow.profile: fred-video-v2`；实际组件选型和调用位置保持一致。`validate_storyboard.py`、`workflow.py` 与阶段门禁验证结构、时序和技术事实，不判定美观。

便携库中的源码是脱敏后的独立快照；安全素材按清单安装。被隔离的输入需要安全替代品。不要引用不存在的本地路径、原始 hash 或私人验收记录来声称当前结果已通过。

原始录音不随仓库提供。云渲染必须由使用者配置自己的环境和凭证；浏览视觉库与查询组件不需要 API Key。更详细的分发与执行范围见仓库 `docs/reuse.md`。

素材来源和媒体替换按[视觉库素材来源](references/library-material-provenance.md)核对，不能用本地路径、改名或旧取舍代替来源与新输出验收。
