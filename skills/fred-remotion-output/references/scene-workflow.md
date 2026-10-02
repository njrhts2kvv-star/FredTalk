# 一个场景一次读取与执行

拆稿时读一次本文件。进入实现后使用`scene.py`拿当前场景的小抄，不逐一阅读此Skill全部references。

## 拆分时只做路由

先读完整稿；已有音频时使用实际音频，没有时明确标为估时，理解前后责任，保持现有sourceSpans、cue、visualPlan与referenceChoices。每组按主要解释任务填`sceneGuide.type`；附加项只填实际会做的动作。长文放在电脑里仍是`prompt-reading + device-frame`；真实软件操作才是`device-demo`。跨内容类型的长段应按语义拆组或明确额外规则，不把每张图硬拆成一镜。

用`scene.py --list`只看简短类型目录。规划按[制作默认值](production-defaults.md)落实本句责任和素材/载体/声音/出口，再用`--stage planning`复核当前决定；此时不展开全部规则、源码或云渲染文档。FredTalk横版解释动画适用场景带`brand-corner`；源视频播放窗口关闭新增角标，媒体编排按需带`media-layout`，实际使用线条才带`relation-lines`；场景类型不自动要求这些外观。
## 开始这个场景时

只借用局部缩放、让位或对象交接时，加 `object-transition`，用 `references.py --kind transitions --query <动作> --limit 3` 查短区间。它与完整组件检索分开；具体取用记入当前 `motionEvents` 的 transitionRef、referenceId、原区间与本期cue，不因一个过渡搬用整套布局。

同一type/modifier组合且签名未变，可以复用已读小抄；本期具体决定与检查仍每镜填写。若修改本镜的呈现类型、增加人物/蒙版或改变素材职责，重新获取对应小抄。无需重新加载无关模块。

小抄的`designGuide`带入当前设计文档入口与少量默认值；首次新构图/原创时读全文，后续沿当前场景使用。它不修改历史选片和本期确认，也不参与旧`sceneGuide.signature`而迫使未改场景重规划；最新要求仍需在本镜决定与实际画面中落实。

## 小抄的事实范围

`scene.py --manifest ... --scene-id ...`只读取指定Manifest，不擅自导入前端缓存、外部SRT、源码或旧审批记录：

- `currentScene`原样带出本场景已有的`implementationMode`、`productionRoute`、`storyboardReview`、`keyframeReview`、`referenceChoices`、`referenceDisposition`（包含其`styleContract`）、`mediaContract`、`dynamicContract`以及原文、时序、素材和动作。`review`、`revision`、`currentFeedback`、`feedback`、`preservation`、`preserveScope`存在才带出；缺少字段不补确认或PASS。
- `manifestContext`带本期身份、画幅合同、全局时钟、SRT来源及已有的全局认可/保留范围。根`feedback`若以stableId索引，只取当前项到`feedbackContext.manifestFeedback`；这是已保存反馈，不代表已读取实时前端。前端新意见先按原有审片流程同步到当前Manifest或本镜记录。
- `neighborBoundary.previous/next`带准确相邻stableId、媒体文件/合同、`review.currentOutput`及`review.versions`的第一项、已声明首尾帧与`visualPlan.enter/exit/handoff`；邻接`keyframeReview`只保留`contextSha256`等身份及`frames`第一/最后项，不载入中间帧。摘要中的路径、hash和`userReviewed`是声明值，没有重新计算文件hash。缺少媒体/hash不能据此推定接缝已经一致。旧`previousHandoff/nextEnter`字段继续可读。
- `overlayContext`带当前`brandCorner`和根`subtitles`设置；角标由根设置合并当前page的同名设置，场景字段优先，`enabled: false`可关闭本场景而不改整片；混合场景的`hiddenIntervals`原样传入执行包，不自动替实现者裁切或控制渲染层。字幕cue只保留与当前场景全局区间有交集的项，保持原cue内容和完整起止时间，不裁短原数据。开始包含、结束不包含。当前场景的`cues`仍按原结构保留，不能把语义cue自动冒认为烧录字幕。
- 根`workflow.profile: fred-video-v2`时，额外提示默认按“建议→关键帧→内部动态审看→视频”读取当前步骤。这个提示不代替工作流门禁，不推断已选方向或用户已确认。没有该profile的旧Manifest保持原有事实，不自动迁移。

本期需要字幕时，在根`subtitles`记录已决定的设置与组件使用的全片秒数；角标通用参数放根`brandCorner`，源视频场景写`pages[].brandCorner: {"enabled": false}`；一镜内交替媒体与动画时，用场景`hiddenIntervals`记录全局半开秒区间（`startSeconds/endSeconds/reason`），实现实际品牌层显隐。脚本只传当前决定，不能从文件名推定已正确隐藏。修改本场景角标显隐会使该镜旧关键帧上下文签名失效；其他场景的独立显隐修改不使本镜失效。以下只说明数据形状，不是替本期做决定：

```json
{
  "timelineFps": 60,
  "brandCorner": {"enabled": true, "variant": "local-background"},
  "subtitles": {
    "enabled": true,
    "sourcePath": "final-audio.srt",
    "cues": [
      {"startSeconds": 10.2, "endSeconds": 12.1, "text": "本期准确字幕"}
    ]
  }
}
```

字幕样式与避让继续查`landscape-subtitles.md`；`geometry`、素材来源等已声明设置会原样进入小抄，不由脚本补默认几何。明确无字幕可写`enabled: false`；未提供字幕设置保持缺失。只有来源路径而没有cue时，小抄提示窗口尚未载入，不自动读全片SRT。

场景全局窗口优先使用已有`globalStartFrame`，其次是EP99已有的`globalVoiceStartFrame`；非`scene-local`时才回落到`startFrame`。结合`durationInFrames/timelineFps`计算。局部时钟缺全局锚点时，不把局部0秒冒充全片0秒，也不把全片字幕全部装进小抄；输出`contextWarnings`待补当前映射。上述帧字段若互相不一致仍需核对本期时钟合同，脚本不调整音轨或推定新cue。

## 同一Manifest中的字段

```json
{
  "sceneGuide": {
    "type": "prompt-reading",
    "modifiers": ["frosted-focus"],
    "signature": "使用scene.py本次输出的guideSignature",
    "applications": [
      {"ruleId":"F01","decision":"总述时展示全文，说到保留项再推进","check":"对照实际口播cue，看焦点是否提前进入"},
      {"ruleId":"F02","decision":"保留完整交接笔记，保留项与下一步分别紫色扫底","check":"看两处真实文字范围和最后一条是否出现"},
      {"ruleId":"F08","decision":"本窗口固定主辅字阶，按最长行调整宽度","check":"最终字号下检查换行、字重和字幕区域"},
      {"ruleId":"F05","decision":"背景仍可辨认，磨砂层只托住阅读内容","check":"检查进出场承载范围、清晰前景和背景关系"}
    ]
  }
}
```

这是字段例子，不是本期已完成决定或视觉验收。F编号来自对应小抄，不抄此处固定组合。`extraRuleIds`可按实际需要补其他规则；`custom`须写`customReason`与该场景自己的风险/检查。规则集合应有理由，不能填全部规则图省事。

`signature`只绑定本类型、所用附加项和相关规则的内容；无关场景规则变化不要求重读本镜。签名也不证明Agent读过、检查过或用户认可过。

`validate_storyboard.py --require-scene-guides`检查声明的小抄对应规则是否齐全、决定/检查是否非空及签名是否过期。它不从源码推断遗漏的modifier，也不证明角标、字体或媒体实际正确；按适用范围先选附加项，画面仍须实际核对。旧片有限返修重复传`--scene-id <目标stableId>`只校验目标小抄与源码归因，未改段的缺失/旧签名不阻塞；全局原文、时间线和排除项仍检查，不存在的sceneId会报错。

## 接缝、渲染、返修才读的内容

- 拼接连续段：`scene.py --stage joining`，读F10；检查真实尾态、首态、对象连续性、旧文字退出和新文字进入。单镜自检不能代替跨镜检查。
- 预览/正式输出：`scene.py --stage render`，读F14/F17/F18；同时读render-and-delivery。声音、缓存/原生一致性、完整输出与稿子对应在这一阶段处理。
- 局部反馈：`scene.py --stage revision`，读F15，然后只刷新受影响镜头与接缝。同机制问题要在当前修改范围一起检查；不重做认可保留区。
- 用户要求沉淀：读maintenance，只更新对应场景的规则、附加项、证据或候选代码。通用原话事实仍在feedback-rules.json；scene-routing.json只描述如何按场景选择这些规则，不复制另一套偏好。

## 文件职责

`SKILL.md`是短路由；`scene-routing.json`是场景类型/附加项与F规则的映射；`feedback-rules.json`是带证据的偏好事实；`scene.py`组合出单场景小抄。已有认可库与dependency-registry继续提供准确代码。

`visual-quality.md`用于遇到具体问题时查对应诊断；`feedback-rules.md`与`Fred-Remotion-完整说明.md`用于人工通览、审计或维护，日常制作不全量读取。

文字滚动、刷出、逐字或淡化用text-presentation附加项及`--kind text-effects`查询；在motionEvents记录textEffectRef、准确原区间和本期文案/cue。载体的移动缩放另按object-transition处理。
