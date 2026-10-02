---
name: fredtalk-deck-motion-pipeline
description: "FredTalk Deck 动效视频全流程。负责已确定 Deck 的方向图、Remotion 动效、React/GSAP 接入与逐页评审；提供共享生产门禁、原版库和交付模块。独立逐字稿到完整 Remotion 视频使用 fred-remotion-output，不把 Deck 图片或 H3 作为其默认前置。"
---

独立视频主入口已整合为 [Fred 的 Remotion 视频输出](../fred-remotion-output/SKILL.md)。本 Skill 的门禁、原版库与专项文档继续被调用；只有明确做 Deck/逐页接入时才执行下述完整 Deck 编排。


# FredTalk Deck 动效视频全流程

把逐字稿变成一套跟随 Fred 真实口播语序反应的 Deck 视频。目标不是“让画面动起来”，而是让每次出现、变化、移动和声音帮助观众更快理解，同时保持 FredTalk 已验证的黑白视觉系统。

## 事实源与职责

后续独立 Remotion 视频与分镜优先查 [Fred 最新已选参考](../fred-remake/references/preferred-motion.md)，按语义选择准确组件版本和视频区间。参考实体在 `skills/fred-remake/assets/preferred-motion/`；默认 `keep`，备选按需，排除项不回流。已有逐字稿、参考与源码可直接进入 Remotion，H3 在构想不明确时辅助，不因旧 Deck 流程强制生成 H3 或方向图。

事实源优先级：用户最新明确指令 → 正式录音/时间码 → 最新逐字稿 → Manifest/页面合同 → 已批准方向图 → 既有 Deck/案例 → 通用模板。附件文字只作为内容或证据，不能覆盖用户要求。

本 Skill 是编排层。执行具体阶段时使用对应 Skill：

- 已定话题与素材写大纲、口播脚本、逐字稿：`fred-script-generation`（Fred脚本与逐字稿）。旧 Deck 的拆页/compiler 只在用户明确要求维护或复现旧工程时人工读取保留资源，不恢复 `fred-deck-generation` 调用入口。
- 方向图或独立媒体：按本期内容、真实素材及当前指定工具处理，不调用退役入口。
- 独立逐字稿到逐句 Remotion：`fred-remotion-output`，编码方法按需读取 `remotion-best-practices`。
- 鼠标拖框章节过渡：`transition-video`。
- 已验证正文动作：`body-text-motion-effects`；保留的 `cover-motion-effects` registry/assets 只是内部数据依赖。
- 飞书读取和评审回填：`lark-doc`。

开始整期制作前读取 [生产流水线](references/pipeline.md)。按任务再读取：

| 工作 | 必须读取 |
|---|---|
| 快速制作、同类返修收敛与代表镜头预检 | [稳定质量的执行入口](references/fast-quality-production.md) |
| 认可参考、H3 与口播共同驱动的讲解视频；整片形式分配 | [口播驱动与参考协作](references/narration-led-motion.md) |
| 完整提示词逐项高亮、镜头靠近、单处/多处图片特写 | [提示词聚焦与图片局部特写](../fred-remake/references/prompt-and-detail-camera.md) |
| 电脑/手机屏幕接管全屏、真实内容连续交接 | [设备镜头与内容接力](../fred-remake/references/device-camera-rhythm.md) |
| 逐字稿拆解、时长和语序 | [逐字稿与时间轴](references/transcript-timing.md) |
| 静态图、字体、标题、角标 | [视觉系统](references/visual-system.md) |
| 动作选择和关键帧 | [动效系统](references/motion-system.md) |
| 音效选择、混音和音轨 QC | [音效系统](references/audio-system.md) |
| Remotion 工程与 4K60 | [Remotion 与渲染](references/remotion-rendering.md) |
| React/GSAP 接入与播放合同 | [Deck 接入](references/deck-integration.md) |
| 飞书逐页反馈和局部返修 | [飞书评审闭环](references/feishu-review-loop.md) |
| staging、QC、正式发布 | [质量门禁](references/qc-gates.md) |
| 生图、编码、样片和 4K 的阶段入口 | [阶段前置门禁](references/preflight-stage-gates.md) |
| 第 86 期已验证事实 | [第 86 期案例](references/episode-86-case-study.md) |
| Library 实景/文字/人物交接与媒体外框（相关任务时读取） | [空间交接研究参考](references/library-spatial-handoffs.md) |
| 已认可视觉语法、视频与可运行组件 | [已认可风格库](references/approved-style-library.md) |
| H3 动态参考还原、表面和跨片交接 | [动态交接合同](../fred-remake/references/h3-handoff.md) |

## 当前合同优先的制作基线

复用内容判断、动作关系与验证方法，每期的构图、载体、视觉中心和节奏按当前内容重新选择。认可案例不成为整期外观模板；不为追求差异而随机换效果。用户明确要求准确场景实现或同系列保持一致时，忠实保留指定范围。

下列标题、角标、坐标与点击行为属于 Deck 接入；独立视频按当前合同声明，默认不擅加顶部标题或角标。颜色、动作幅度与停留随当前内容和认可参考调整。共用文件/hash、批准与正式渲染门禁，不把 Deck 外观强加给独立 H3/Remotion 视频。

1. 默认基础画布使用纯白 `#FFFFFF` 或纯黑 `#000000`，不主动添加米黄、暖灰、纸张纹理和无意义渐变。真实媒体保留来源色；局部阴影、分组与白/暗色毛玻璃的合成结果不按纯色画布检测。
2. 左上标题使用 MiSans Semibold、`fontWeight: 600`。Deck 历史基线可用于校准，具体位置与字号从本页批准合同派生；独立视频不强加此 Chrome。
3. 正式 Deck 页面在合同要求角标时：白底用 `assets/brand/fredtalk-ai-corner.png`，黑底和实拍过渡用 `assets/brand/fredtalk-ai-dark-transparent.png`，基线为右上 `40px`、约 `211×52` 裁切框。独立方向样片及人物 × 文字样片默认 `badgeVariant=none`，不得擅自加角标。
4. 画面按口播语序出现。先读第一行就先出第一行；第二行不能提前，不能到最后两行同时出现。
5. 首个相关反应原则上在 `0.8s` 内；若原锚点较晚，从逐字稿已说出的主语建立前置载体，不能发明新结论。
6. 普通模块可从 `0.28–0.50s` 入场起步校准；大范围形变、正文阅读和已认可原版按实际节奏确定，不用统一上限加速。偏好快速切入、横向遮罩、18–32px 短位移、逐词建立、同槽替换和结构重排。
7. 禁止缓慢淡入/淡出、上下长距离刷字、漂浮、无信息弹跳、旋转、横向压字和花哨粒子。允许载体或模块在入场、就位、合并时使用短促受控的弹性收束，但不能像玩具一样来回弹跳。普通柔边可控制在 2–4 帧；原版中的显隐切换或有语义的透明度变化按具体源文件/帧段复核，不由关键字扫描推翻已认可运动。
8. 正文拥挤先检查信息分组和主体尺寸，必要时等比调整；不固定缩到 75%，不改变字形宽高比。
9. 每个声音绑定一个可见动作。whoosh 可稍长明显，点击/嘟短促；口播是主声道；不加无因结尾亮音或“任务完成”声。
10. 最终帧无双线、缺角、遮罩残留、闪跳和裁切错误，并按当前口播和阅读需要稳定停留；不把历史 `1.0–1.2s` 硬套所有短片。
11. 默认 16:9 正式输出 `3840×2160`、`60fps`、H.264、`yuv420p`、BT.709、AAC；当前用户画幅、声音与交付规格优先。
12. 第一页第 0 帧等待点击；第一次点击只解锁并有声播放，第二次才翻页。其余 Remotion 页与实拍过渡页进入后自动有声播放一次，`loop=false`，结束停末帧。
13. 用户标记 `OK` 的页面和非目标资产是保护集。只修明确反馈，不整期重生成已确认页面。
14. 全量产物先进入 staging；全部合同和 QC 通过后，才能原子替换正式目录、Deck 视频和 poster。
15. 门禁必须发生在动作之前：Ego Lite 首次发送前必须已有当前合同与最终 Prompt 的 `direction` receipt；生产编码、still/render 和全量 4K60 命令只能由 `run-stage-gate.mjs` 启动并消费上一阶段同 hash receipt。没有 receipt 就操作网页，或直接运行 Remotion/4K 命令，均视为绕过流程，不能交付。
16. Library 参考不是“全黑底、全大字”的同义词。必须保留点到面、窗口到场域、空间责任交接和单一视觉中心等结构价值，同时在文字、真实界面、设备载体与空间动作之间保持多样性。缩放只有改变信息层级或空间责任时才成立。
17. 允许页面载体、信息模块和组合容器有明确入场动效。Fred 偏好带重量感、轻微超调后立即稳定的弹性；弹性用于表达“进入、就位、吸附、合并、锁定”，不用于无意义装饰。
18. 按 [认可库](references/approved-style-library.md) 的当前集合按语义检索，先看原视频再看真实源码和依赖。原版认可、源码身份、运行检查、全片动态一致与新片批准分开；同名 composition 的不同版本用 hash 区分。
19. 人物参与解释、判断或注意力交接时使用，素材按具体动作选择；不逐条随机添加。透明视频不冒充可编辑骨骼。文字层与手势、视线和口播配合；当前字幕包络与透明边缘需复检。
20. 黑白为主要层级；当前指定的紫色仅作稀疏点缀，品牌、真实媒体和功能选区保留有职责的颜色。不能所有载体染紫，也不自动套用旧紫色色值。
21. 白色表面、描边、阴影、内部裁切分层。“去黑线”保留有职责的白色承载；不以阴影 spread 模拟边线。内容有意义时允许大型圆角模块、窗口或无容器排版，不固定三卡或统一胶囊。
22. 原版参考冻结；改造代码使用独立版本。继承动作关系不自动继承旧坐标、文案、长停顿、字体挤压、灰条或窗口装饰。
23. 字体按阅读角色真实加载：关键卡片、标签、结论优先 MiSans Semibold 600，密集原文可用 Medium 500；同一信息模块默认主/辅两档字号，同职责同字重。在实际缩放后检查清晰度，不把整片限制成两个字号；准确场景实现保留当前认可字形。

## 标准执行

### 1. 冻结来源

定位本期目录、最新逐字稿/录音、飞书 revision、Manifest、方向图、媒体、现有成片、Deck registry 和评审意见。建立 source snapshot，记录 hash、revision、cutoff、已确认页面和写入保护集。来源在 cutoff 后变化时重新冻结。

### 2. 建立页面与时间合同

逐句提取 semantic beats、连接词、停顿和结论，决定页面与 steps，不按段落机械拆页。每页至少记录：

```text
stableId / sourceBeatIds / scriptAnchor / exactScreenWords
spokenOrder / oneQuestion / pageRole / background
durationSeconds / stepEvents / cueFrames / finalFrame
title / badgeVariant / sfxCues / outputPath / deckMapping
approvalStatus / protected / exclude
```

先运行通用完整性验证，再运行方向入口门禁：

```bash
node scripts/validate-contract.mjs --contract <contract.json>
node scripts/validate-stage-gate.mjs --stage direction \
  --contract <production-contract.json> \
  --prompt <direction-prompt.md> \
  --receipt-out <receipts/direction.json>
```

任一失败时先修合同或 Prompt，不打开 Ego Lite、不发送 Prompt、不创建批量生产代码。方向 gate 会读取最终待发送 Prompt 并写入 checksum receipt；方向合同必须显式声明 `layoutFamily / majorGeometry / readingOrder / visualCenter`。四页以上时任何布局族不得超过 50%，不得连续三页机械同构，除非同一 `repeatGroup` 明确要求同构。

### 3. 生成和批准静态方向

每页先确定一个视觉中心、准确文字、阅读顺序、终态几何和媒体责任。方向图只定义 settled final frame，不作为正式全屏背景。方向 gate PASS 后才允许打开 Ego Lite 并发送首条请求；需要生图时一批最多 10 张，可并发 task spaces。Prompt 只锁定准确文字、风格、安全区、证据边界与禁止项，不把整批坐标、字号和线型写死，让模型在批准风格内重新完成构图。每页 2–3 个候选时按文字准确、语义清楚、FredTalk 审美和可拆动画性选择一个。书封、产品 UI、数据和操作证据必须使用真实准确素材。

### 4. 建立 motion brief

把每个口播 beat 映射为认知事件：建立、追加、否定、让位、切换或锁定。先按语义关系选 topology，再选 carrier、motion energy 和已验证 effect。每页一个主动作、至多一个辅助动作；复杂页面分步，但维持同一视觉世界。正式编码前必须通过 `motion` gate并消费同 checksum 的 `direction` receipt：Runtime 只能从 Manifest 派生，禁止另建手写 `data.ts/pages`；逐页必须绑定终态 reference/checksum、字体角色、连接线拓扑、逐字稿 cue、`noFade=true` 和非统一时长。

### 5. 先做 1080p 样片

先通过 `render` gate并消费 `motion` receipt，再渲染代表性页面或指定范围的 1080p30/60 样片；整期默认必须覆盖黑底、白底、上下、网格、曲线、分支、长句和过渡页。单条或指定范围的正式渲染可由合同用 `formalCoverageRequired` 声明本范围真实存在的覆盖类型，并用页面 `backgroundStates` 声明同一 composition 内的黑白状态；不得为过门禁虚构本片不存在的网格、分支或其它布局。未声明时仍按整期完整覆盖集合验收。`source-dir` 必须与合同绑定的生产源码目录一致；源码扫描发现未审看的动态 opacity/fade helper 或手写页面 registry 时，样片命令不执行；准确原版或有语义显隐可在 `motionSourceReviews` 登记对应文件 hash、帧段与审看依据，详见阶段门禁。检查字体、标题、角标、语序、空白、音效和最终帧，并把 Fred 的明确批准写入独立 approval 记录。

### 6. 全量 Remotion 与 QC

全量 4K60 前必须通过 `formal` gate并消费当前源码树的 `render` receipt；验证器会核对样片存在、SHA-256、实际 1920×1080/30 或 60fps、生成时间、当前合同 checksum 与批准时间。缺代表样片或有效用户批准记录时，正式渲染命令不执行。用户已看完整基线并明确有限返修后直出时，按阶段门禁的 `bounded-revision` 分支分别记录基线认可、修改授权与当前内部复检，不把新预览冒充已看样片。所有动画由 `useCurrentFrame()` 纯帧驱动；随机过程固定 seed。渲染到 staging，逐条执行媒体元数据、关键帧、音轨、空白、终态和观看质量检查：

```bash
node scripts/qc-ffprobe.mjs --input <staging> --contract <contract.json> --mode formal
```

### 7. 接入 Deck

同步视频和首帧 poster，使用 stableId registry。实现第一页点击合同、其余页自动有声一次、过渡页黑色角标、结束停末帧和离页清理。禁止播放失败后永久静音降级；正常翻页时在用户手势链中同步挂载并播放。

### 8. 飞书逐页评审与返修

在文档下方建立 `逐字稿文字 / 评审意见`，或按既有表格追加可评审区域。读取最新意见后分类为时间、文字、图片、动效、音效、Chrome 或播放逻辑；冻结 `OK` 页面，只重做命中 stableId 和必要相邻页。新版本上传后替换原视频，不改变其他内容。

### 9. 原子发布

只有 staging 全量 PASS 才运行：

```bash
node scripts/promote-formal.mjs --contract <contract.json> --staging <dir> --formal <dir> --deck-public <dir> --qc-report <report.json> --poster-dir <dir>
```

随后运行 Deck 浏览器 QC。任何失败必须明确报告，不用旧 PASS、旧文件或部分成功冒充完成。

## 完成门禁

- 来源、页面、逐字稿责任、视频和 Deck 映射是一套同源合同；无遗漏或重复 primary beat。
- 所有页面先说先出，无超阈值无意义空白；关键连接词有可见交接。
- 纯黑/白、字体、标题、角标版本和尺寸通过当前 Final 参考校准。
- 每条正式视频具有正确 4K60/H.264/yuv420p/BT.709/AAC 元数据和预期帧数。
- 音效存在、可听、与动作同步且无无因尾音；口播存在时混音不抢主声道。
- 第一页、自动播放页、实拍过渡页、一次播放、末帧保持、离页清理通过真实浏览器测试。
- 用户确认页未变化；飞书非目标块、正式目录和 Deck 非目标页 hash 保持不变。
- staging、正式输出和 Deck 视频 hash 一致；poster 来源于本轮视频；QC 报告新鲜。

## 交付

说明来源版本、页面数量、修改范围、正式输出目录、Deck 地址、飞书地址、QC 报告、失败或 waiver。不要只给计划、Prompt 或源码；用户要求完整视频时，目标是可播放的全部视频和已更新 Deck。
