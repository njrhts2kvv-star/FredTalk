---
name: fred-remotion-output
description: "Fred 的视频制作唯一日常入口。用于最终音频、逐字稿、字幕和素材到组件匹配、逐段前端建议、真实关键帧、完整 Remotion 视频及局部返修；包含正文文字动效与按需技术参考；Fred 授权时也负责按固定设计规则新做可复用组件并入库。Fred选方向、修改确认关键帧后，由助手内部检查动态、声音和接缝并交付。参考视频忠实复刻与云端执行使用各自独立入口。"
metadata:
  display_name: FredTalk 2.5
---

# FredTalk 2.5

公开版以本仓库 `library/catalog.json` 为当前组件事实源，不读取作者私人目录和音乐。32 条历史返修版公开；64 条新组件／场景按本批 14 天专属会员窗口下载。

## Component source and download access

Read [component download access](references/distribution-access.md) when downloading or publishing components. For a downloaded official source ZIP, use the latest public FredTalk checkout and default to `python3 scripts/assets.py import --zip <local-path>`; no token configuration is needed. Automatic token downloads are optional. Public previews and source availability are separate; verify installed source before selecting an executable component.

## 先验收组件，再交付建议或关键帧

**2026-10-03 Fred确认：Remotion画面只能准确复用已认可组件，或基于已认可组件二创。默认禁止脱离组件库原创。** 只有当次明确授权原创才可例外；“直接输出”“不用等我确认”不等于原创授权。此规则覆盖历史资料中“没有合适参考可原创”的旧默认。

**2026-10-13 Fred确认：默认允许“场景级定制”。** 113、114 期能做到 90–95 分，靠的是为本期内容重写场景，而不是把组件原样串起来。“二创”的范围据此明确为：
- **默认允许**：每段场景代码为本期重写；把已认可组件拆开，只取它的动作、对象关系或几何，改时序、删掉它自带的开场和收尾，为接缝重新衔接；多个组件的动作组合成一段。底层（kit 的字体、颜色、阴影、缓动、光标、字幕、角标、音效、坐标映射）必须照用，不手写近似值。每个场景文件第一行注释写明动作来自哪个组件。
- **仍然禁止**：纯大字页、通用模板、找不到任何来源动作的新视觉风格、违反 DESIGN.md 的写法。这些仍需当次授权。
- **公共组件入库仍需 Fred 认可**。本期场景只服务本期；同类需求再次出现，才按[新做组件流程](references/new-component-workflow.md)提炼成公共组件。
- 怎样做出这种质量见[整期编排](references/episode-assembly.md)第 0 节。

给出逐段建议前、交付真实关键帧前，必须分别通过[组件库交付门禁](references/library-delivery-gate.md)。先检索并看准确参考，再选型和实现；不先写通用模板、后补参考编号。二创要保留可辨认的核心构图、对象关系或动作逻辑，不能只借字体/颜色/圆角。没有合适组件就报告“待选组件”及缺口，不擅自退成原创文字页。

验收由助手内部完成，不新增Fred审批。建议检查真实候选和表达匹配；关键帧另检查来源源码→本期函数→真实调用→输出画面。两阶段均记录具体审看结论与当前文件证据；技术可用不替代视觉验收。`library_gate.py`未PASS不得交付对应建议或关键帧；公共生成器自动拦截，自定义前端和聊天建议也必须运行同一门禁。真实录屏/图片/已有视频、B-roll独立流程、固定字幕角标及明确录屏占位不受原创限制，但不能用这些类别掩盖新Remotion设计。旧成片不追溯改造；今后重新出建议/关键帧时按当前实际范围验收，不刷新旧认可。

把逐字稿讲清楚，延续 Fred 已认可的动画质量。先判断当前阶段，只读该阶段与当前场景资料；完整说明和历史规则留到审计/维护时看。

正文组件/正文文字动效、项目Remotion技术参考与旧Deck总编排已收为[内部模块](references/internal-modules.md)，不再作为独立日常制作入口。只用一份当前Manifest和同一前端；复刻、云端渲染保持独立。视觉库与制作检索共用[六类制作用途](references/visual-usage.md)、多用途标签和独立来源筛选。`references.py --use explain --source ep107` 可按任务与来源检索；单场景包带出实际输入、动作、原片时长与适配范围。前端默认先看视觉库；[字体与字阶](references/typography.md)绑定真实字体与职责。先核对准确视频、接口及依赖，再保留本期需要的完整动作。

## 每段先看候选，再定画面

Codex/助手常见问题是只用熟悉的两三个组件、或直接写大字页。每个需要画面的段落按下面顺序做，不跳步：

1. 在 Manifest 写 `componentPlan.query`：本段画面里**看得见的对象和动作**（例如“两个工具价格并排对比、数字落定”），不是照抄旁白。
2. 运行 `scene.py --manifest <path> --scene-id <id> --candidates-only`：给出按画面描述检索的 5 个候选，以及按旁白检索的 `narrationCandidates`。同类型不足时会跨类型补位并标注 `sameSceneType`。
3. 逐个看候选的准确视频或核心帧（`references.py --id <id> --full`），再按内容决定。前 3 个候选必须在 `componentPlan.candidates` 记录 `selected/rejected` 和具体理由；`library_gate.py --stage suggestion` 会重算并拦截漏记。原创授权段也要先比较。
4. 候选都不合适：先换个说法再查（拆成对象＋动作、换 `--use`），仍没有就报告缺口，不退成纯大字页。

按内容先查哪里（起点，不是固定搭配）：

| 口播在讲 | 先试 |
| --- | --- |
| 一句结论、关键词 | `--query 关键词 一句话`；多篇新闻反复出现同一个词用 NMC01 |
| 列举几个要点、能力 | `--query 要点 列表`、`--query 卡片 分类` |
| 步骤、流程、因果、架构 | `--query 流程 步骤`、`--query 分支 关系` |
| 两者对比、以前和现在 | `--query 对比 区别`、`--query 版本` |
| 输入提示词、聊天、回复 | INT03（Codex 操作）、INT04（可编辑微信）、CAM04；`--query 输入 发送` |
| 截图或文章里的某句话 | INT01（荧光笔）、INT02（蒙版聚焦）；`--use recording-focus` |
| 真实录屏操作 | CAM01–CAM05、`--use video-entry`；全屏播放用默认大播放组件 |
| 作品、多图、结果图 | `--use images` |
| 数字、价格、图表 | `--use data`、`--query 数据 增长`；这类组件很少，没有合适的就如实报告缺口 |
| 章节、转场、下一段 | `--use handoff`、`--query 转场` |

## 默认协作顺序

**稿件/可选录音 → 助手逐段图文建议 → Fred选方向 → 真实组件关键帧 → Fred提意见并确认 → 助手内部检查动态 → 完整视频 → 按意见局部返修。**

- 第一版页面就给有内容的建议：这句准备怎样讲、为什么适合、参考图片或可播放片段。能用准确库组件表达时先展示真实效果；需要新构图才生分镜图，不把空白设计任务交回 Fred。
- 方向确定后先实现足以渲染的真实组件，用本期文字/媒体和适用的角标/字幕出关键帧。关键帧用于改排版、主次、尺度、可读性和遮挡；随后内部看短动画、声音与接缝，再出完整视频。默认不额外等待一轮用户动态样片批准。
- 同一前端持续展示建议、关键帧与视频，保留版本和意见。默认用[公共审看模板](references/segment-review.md#公共模板默认)的初始化/更新/启动脚本，只换本期Manifest和媒体；音频模块沿用音频Skill公共台，不逐期重写页面。`assets/review-example-ep108/START.py`可直接打开108前7段61.47秒真实内容示例，含口播、字幕、关键帧及视频；它是可替换的示例数据，非固定每期画面方案。数量由内容决定，不固定九宫格、140张、组件配额或切镜频率。完整工作方式和字段见[路线、关键帧与确认](references/route-and-storyboard-review.md)。
- 已有明确方向/关键帧确认不重复问；局部返修只处理受影响内容。当前直出授权可覆盖用户审看步骤，记录真实来源与未审看范围；内部技术检查和必要动态检查仍执行，不把输出授权写成样片认可。出关键帧还是直接出片，按 Fred 当次要求执行，不额外提醒或劝阻（2026-10-12 Fred 明确）；没有说明时按上面的默认顺序先出关键帧。
- **把组件串成整期**（分段工程、录屏包装、段间交接表、全片去重、强调方式、渲染前动态自检）按[整期编排](references/episode-assembly.md)执行。给写分段代码的子任务的简报必须带上它的第2–7节和本期交接表。工程结构直接用[整期骨架](templates/episode-skeleton/README.md)（时间轴、段外壳、交接几何、分块渲染、音频和 BGM、推前端）；交付前按整期编排第 12 节检查。

## 做一整期视频：最短路径

Fred 说“直接做视频”“直接出片”时，按下面这条路做。它是把 116–121 期的做法整理出来的（成对样例、`readability_audit` 和骨架里的 episode-kit 是 2026-10-15 才补上的）。开头“先验收组件”一节的门禁照常执行，一步都不省；但门禁只证明来源合规，**不证明画面好**，质量要靠第 1、3、5、6 步：

1. **先看[好坏成对样例](references/paired-examples.md)**：同一句口播做对和做错各长什么样。
2. **工程从[整期骨架](templates/episode-skeleton/README.md)拷**，共享件直接用骨架的 `src/components/episode-kit/`（真实比例 Codex 框、黑胶囊、毛玻璃、章节头与章节过渡、大播放窗片段），只换本期常量。
3. **写整期简报**：按[简报模板](templates/episode-assembly-brief.md)逐句填动作表（对象 → 变化 → 证据在哪 → 观众看哪 → 交给谁）和交接表，过完五条自查再写代码。整期简报（分段方案、交接表、全片规则）的范例：[120 期](templates/examples/brief-ep120.md)、[121 期](templates/examples/brief-ep121.md)。
4. **逐段选组件并过门禁**：按上面“每段先看候选，再定画面”写 `componentPlan`，跑 `scene.py --candidates-only`，`library_gate.py` 在建议阶段和关键帧阶段都必须 PASS。
5. **场景为本期重写**：拆已认可组件的动作，每个场景第一行注释写动作来源；范例场景在 `templates/examples/scene-*.tsx`（只供阅读）。
6. **先做一段对照，再铺全片**；每段出关键帧和中间态，**自己逐张看图**，问题写到段号和秒数。
7. **1080p 预览后跑 `motion_audit.py` 和 `readability_audit.py`**，接缝每 4 帧拼一张图看；视觉验收和技术验收分开写。
8. 按[整期编排](references/episode-assembly.md)第 12 节做交付前检查，再出 4K60。

## 把用户要求带到每个实际镜头

组件适配的共享字体、全文原位强调及媒体接替见[复用图谱](references/component-reuse-map.md#共享适配工具)。`scene.py` 会带出本段 `componentAdaptation`，实施前核对同组字阶、内容职责、全文检查状态和对象级保护；准确参数来自当前内容，不固定单期字号、行数或组件组合。


用户已给出的镜头、文字、材质和保留要求是当前执行输入，不要求用户每期再写一篇详细提示词。先按[制作默认值](references/production-defaults.md#将要求落实到当前执行包)存入同一 Manifest 的 `designContract` 与受影响场景；实现时用 `scene.py --manifest ... --scene-id ...` 读取，确认整片要求、当前动作、素材和角标一起到达。修方向时同步更新旧动作描述，不能只改图片或版本号。

动作实现与返修按[具体状态检查](references/production-defaults.md#将流畅跟口播落实到可观察状态)核对连续轨迹、内容就绪再扩容、真实阅读窗口和同载体交接；版式已成立时优先按口播交换焦点，不自动重做布局。静态通过、技术通过和动态认可仍分别记录。

备料按[全稿的信息职责](references/production-defaults.md#按全稿的信息职责备料)区分现成效果示例、本期讲解素材与实际操作证据；返修按[已认可的维度](references/production-defaults.md#按认可维度保护基线)保护准确版本。“在上面基础上加蒙版／组件”按[实际末态交接](references/media-and-overlays.md#继承实际末态再交给前景)继承媒体、滚动和相机状态，不重新开场。

需要委派或从短指令接手时使用[制作执行摘要](templates/production-execution-brief.md)，填入本期路径、当前授权和保留范围；它引用当前事实源，不新增一套审批。代表镜头要验证“与要求和参考相比是否保住表达与质感”，技术 PASS 不能替代这一步。

## 完整视频的BGM默认

完整成片默认按[背景音乐](references/background-music.md)执行：Fred本机使用已调好音量的私人音乐，从0秒开始、内部选段补足长度，原声欣赏区间静音且音乐时钟继续，整片混音一次再封装。正常BGM轨线性音量1，不再次降分贝；最终总线按实际AAC峰值必要保护。本机绑定及音乐实体不分发、不自动上传；他人用`--bgm`自备音乐，仍可使用同样的延长/静音/混音能力。已经含BGM的成片和剪映回传音轨不重复添加，单独口播与组件诊断不默认加音乐。执行入口为`scripts/bgm.py`，能力包由`scripts/package_bgm.py`生成。

## 固定配音与整期组件分配

Fred后续自己的每期完整视频默认在自然断点复用一次[Skill／组件库过渡配音](references/fixed-skill-library-insert.md)：**只固定音频，动画每期更换**，使用Fred当期提供或指定的画面，不自动复用109期动画。新稿录音正文不再重复这四句；从manifest读取当前纯配音的真实采样时长，与当期动画安排时间轴（当前5.540秒，旧6.016秒混音只留历史），字幕样式和画面衔接按当期要求处理。本期已有相同配音时不重复加，不固定旧视频的362帧或插入镜号。插入前核对纯配音/动画SFX混音身份，整条及内部各句响度按音频Skill检查，必要时只做本期局部匹配，不叠加旧处理。

建议前同时做[整期组件分配检查](references/component-distribution.md)，不能只验收单镜头。`library_gate.py`的suggestion阶段已拦截缺少具体整期比较的重复组；保留连续对象、同职责外壳和有意呼应，不用次数配额强行换差的组件。相似但不同来源仍需实际视觉总览。

## 始终保留

全部已认可组件集合（Library 复刻、各期精选、新增精选、交互组件、3D 运镜、新闻快闪等）的编号、说明与入库/发布记录统一见[组件集合索引](references/component-collections.md)。默认检索已覆盖全部集合，不需要逐个记住集合名。

1. 最新用户要求优先。锁定原文和实际素材；无录音可估时构思，最终录音/SRT到位后更新受影响动作、字幕和音效，不能只换音轨。没有最终录音时只做到关键帧，不出整片；时长不够时加组件或剪短，不用慢推、定格凑时长。
2. 只有一份当前 Manifest，`pages/stableId`记录语义段。场景资料带入已选方向、实现模式、当前素材、反馈、保留范围和相邻交接。制作/审看/交付各自绑定准确版本。
3. 按[设计语言](DESIGN.md)适配已认可组件，允许场景级定制（见开头“先验收组件”一节）；全新视觉风格须Fred当次明确授权。视觉、排版、字体、动效、呈现、音效、内容的固定值见 DESIGN.md 第 2 节，代码层统一用 `templates/component-kit` 的 kit，不在各场景手写近似值。组件能力先查[复用图谱](references/component-reuse-map.md)。先决定观众要理解的变化，再选组件。完整成熟模块适合就直接复用，保留实际动作关系、字阶、几何和质感，不能只挂参考ID或复制一个胶囊。无准确方案先报告缺口，不自动原创。实现模式和归因见[从内容到组件](references/content-to-component.md)。
4. 后续16:9主视频全屏/大窗播放默认实际调用[108期大播放组件](references/fullscreen-video-window.md)：4K窗口3600×2027.11、圆角48、阴影`0 32px 50px #0002`，1080逻辑舞台用半值，避免二次缩放。当前明确覆盖和其他用途按对应职责处理。FredTalk横版讲解的解释动画沿用固定右上角品牌层，按局部背景选既有版本；录屏、实拍作为主内容播放时不叠加右上角角标；**Fred 人物 B-roll 动画全屏播放时加角标**（2026-10-12 Fred 明确；版本按 fred-remake `corner-branding.md` 核对）。混合场景按实际播放区间显隐，不能在整片最外层无条件挂品牌层。需要烧录字幕时复用[得意黑模块](references/landscape-subtitles.md)，关键帧阶段就带入；关键前景在字幕实际窗口内避让。单独交付的纯B-roll、其他画幅与当前例外按原范围处理。
5. 默认独立16:9，1080p预览、4K60正式；当前规格与已认可工程优先。按已授权方式本地/云端渲染。估时、静态认可、动态检查、用户认可、技术通过分别记录。保护非目标画面、音轨和素材，不自动上传、付费或对外发送。烧录字幕小改只重渲受影响cue及必要接缝，再合并；豆包工作的拟人代词用「她」，按真实指代核对。

## 当前做什么，就从哪里进入

| 当前工作 | 读取与执行 |
| --- | --- |
| 已有音频＋SRT＋稿件，只做粗剪/字幕纠错 | 先用[音频和字幕粗剪](../audio-subtitle-roughcut/SKILL.md)，完成全篇长字幕、句内重说与停顿检查，按音频工作流核对真峰值、剪切/字幕联动与新旧源时间对齐；本次已处理录音按要求只剪切，不自动进入整片制作 |
| 接稿、提整组图文建议 | [路线与确认](references/route-and-storyboard-review.md)、首次新设计读[设计语言](DESIGN.md)与[字体职责](references/typography.md)，再按[制作默认值](references/production-defaults.md)和[拆稿](references/storyboard.md)安排；读全文理解责任与承接，不通读整库 |
| 开始当前场景 | 先 `scene.py --manifest <path> --scene-id <stableId> --candidates-only` 选组件，再去掉 `--candidates-only` 读完整场景包（决定、字体、相邻首尾）；首次类型选择用 `scene.py --list` |
| 找准确组件与依赖 | `references.py --query <对象与动作> --limit 5`（可加 `--scene-type`、`--use`）；同分按来源批次轮转；集合清单见[组件集合索引](references/component-collections.md)；使用与视觉库同源的用途标签，查看matching理由；排序是候选相关度，仍核对真实动作、容量、cue和接口。首次建工程读[依赖](references/components-and-dependencies.md)和[实现](references/implementation.md) |
| 新做可复用组件（Fred 当次授权） | [新做组件流程](references/new-component-workflow.md)：`component_kit.py new/add` 建工程，`lint`、`sheet` 自查，`cloud-script` 云渲，`preview` 交 Fred 挑，`intake` 入库；固定规则见 DESIGN.md 第 2 节，质量标杆是 T05c |
| 现有组件表达不了、需要探索 | [探索](references/exploration.md)、[分镜图](references/storyboard-image-workflow.md)；若调用 ChatGPT Pro，按[Pro 分镜探索与 Remotion 复刻](references/chatgpt-pro-storyboard-replication.md)记录 prompt、会话、hash、认可范围。已选多状态/九宫格先按口播取舍，再实现持续对象、动作与阅读；可用[动作规划模板](templates/pro-storyboard-motion-plan.md)写回当前Manifest；已选方向不擅自替换 |
| 产出真实关键帧供Fred看 | [路线与确认](references/route-and-storyboard-review.md#真实关键帧)及[审看片](references/segment-review.md)；带实际最长文字、字幕、品牌、运动中间态和接缝前后 |
| 设计对象让位/文字呈现 | [对象过渡](references/object-transitions.md)或[文字呈现](references/text-presentation.md)；按需查 T/W 局部动作 |
| 处理具体Remotion技术或维护既有Deck | [内部模块](references/internal-modules.md)；固定本期runtime，按问题读取技术rules；Deck点击/比例等合同只在明确维护或复现既有Deck时适用 |
| 参考 Library 原片编排镜头 | [Library 镜头语言](references/library-shot-language.md)；先定观看任务和对象来源/去向，再查对应原片区间与组件 |
| 编排录屏或其他任务给的生成视频 | 先按[整期编排](references/episode-assembly.md#2-录屏段怎么包装)的录屏包装规则（可读、镜头跟随、交互演出、纯滚动≤2秒）；主视频全屏播放先用[默认大播放组件](references/fullscreen-video-window.md)；[媒体与蒙版](references/media-and-overlays.md)及路线文档的[外部视频交接](references/route-and-storyboard-review.md#外部视频交接)；保留媒体身份、时钟、声音和首尾 |
| 内部检查动作/声音/连续性 | [内容与质感审看](references/content-to-component.md#两个问题都通过才算内部审看通过)、[音效](references/sound-effects.md)、`scene.py --stage joining`；渲染分段后跑 `scripts/motion_audit.py` 查慢推、纯滚动和定格，见[整期编排](references/episode-assembly.md#8-动态自检motion_auditpy) |
| 渲染、下载、完整交付 | [渲染与交付](references/render-and-delivery.md)和[阶段门禁](references/production-gates.md)；此时读云执行和最终文件检查 |
| 局部返修 | `scene.py --stage revision`＋受影响场景；同时读备注与结论，不能把“可用但要改”当整段批准 |
| 用户要求沉淀 | [维护](references/maintenance.md)；只提取可复用判断，保留本期修法与长期偏好的边界 |

## 执行工具和检查边界

新一期在当前 Manifest 设置 `workflow.profile: fred-video-v2`、`workflow.componentMatching: v1`。按[选型到调用](references/content-to-component.md#新一期怎样确保从选型走到实际调用)记录场景`componentPlan`，实际选型与`referenceChoices`一致，实现时用`callSite.callee`绑定本期适配函数；语法调用检查后仍对照真实输出。用户方向和关键帧记录按路线文档保存，旧片限改不补造新字段。生产阶段仍为 `planning → implementation → representative → formal`：实现前规划检查；真实关键帧确认与短动画内部检查后进入代表镜头门；最后校验实际最终文件。具体命令只在[阶段门禁](references/production-gates.md)维护，旧片不为采用新工作方式而整片重规划。

`sceneGuide`记录类型、实际附加项及本场景决定/检查。类型选择依据要解释的内容；人物、设备、关系线、毛玻璃按需加入，不是布局模板。品牌与字幕根设置会随场景资料传入，字幕规则仅在实际启用时读取。

原文/时序检查用 `validate_storyboard.py --require-scene-guides --require-production-contract`；工作方式检查用 `workflow.py`；技术门禁不能判美观，参考文件存在不能证明动作被使用，静帧不能证明中间动态顺畅。对照当前真实画面和所选源片的对应区间，具体评估内容、可读性、动作、质感与交接。

项目依赖只用本地 `skills/` 实体。新工程在本期 `03_制作过程/remotion/<version>/`，最终唯一文件在 `02_最终输出/`，更新当前交付入口。冻结硬链接先复制再适配。B-roll素材生成、复刻、云渲染继续承担专项职责，旧Deck流程不自动成为创意前置。

素材来源和媒体替换按[视觉库素材来源](references/library-material-provenance.md)核对，不能用本地路径、改名或旧取舍代替来源与新输出验收。
