# 从一句话到真正用上的组件

用户选中的准确库参考或生成分镜负责内容、关系、主次和镜头推进；真实组件库负责字体、表面、几何与动作质感。实现前记录“保留逻辑／修正视觉／准确组件／音频cue”，不可把生成图1:1场景实现；具体见[选图到实现](route-and-storyboard-review.md#真实关键帧)。

首次按稿选型或遇到“写了参考却做得很差”时读。沿用同一Manifest、源码依赖和QC记录，不另起整期时间线或审批流程。

## 先确定这一句要演出什么

先用观众能看懂的话回答oneQuestion，例如“几天后怎样找回之前说过的要求”，而不是“用黑白胶囊”。visualPlan写具体对象的建立→变化→可读结果→交接；结果是内容变化，字号、配色与阴影只是表现手段。

- 过程句（记录、交给、存入、找回）：追踪同一个对象与内容，让它实际经历过程。不能仅把三个工具名轮流打上屏。
- 比较句：保留比较对象和维度，显示区别。结论句可以只用大字或胶囊，不强迫每句都演复杂流程。
- 阅读句：保留需要读的真实内容，沿语义聚焦。不要以“更简洁”为由删成无信息关键词，也不要为填窗口编造真实操作证据。
- 已有实拍/录屏负责证明的内容：让实际素材承担主要信息，按内容选择辅助动作。

用当前段与相邻段检查：上一段留下什么，本段改变什么，下一段接什么。稳定阅读、完整模块直接复用都是有效设计；不设置切镜频率、近期禁用表或创新比例。

## 按任务选组件，不按名字贴编号

references.py使用与视觉库同源的用途分类、标签和sceneTypes，复合动作词按命中关系扩展并排序；matching给出具体理由。这是候选相关度，不自动理解全文或判断画面质量。只取少量候选，按“对象关系、动作顺序、内容容量、当前口播时长、进出状态”判断；空结果先拆对象/动作或换类型检索，有分歧才比较替代候选，不强制每镜选三个。

取代码前实际查看命中参考的准确视频区间，认清进入、重点变化、阅读和退出；缩略图、名称和末帧不能说明完整动作。用户认可的生成分镜同样先提取对象与焦点的连续状态，再匹配组件。库中没有完整对应项时补做本期适配/原创；不能把优秀的镜头关系降成通用卡片依次出现，也不能给粗糙新模块挂一个旧参考编号就称同等质量。

对所选状态在现有 `visualPlan/motionEvents/referenceChoices` 中写清保留什么、用哪个真实实现、为什么修正某个不可实现或错误的细节；在代表镜头里逐状态对照。允许改变生成图的假 UI、字形错误和不合风格的表面，保留用户实际认可的观看重点与动作关系。用户说“多样”时变化的是信息推进，不是为每段发明一种质量更低的外观。

## 五种实现模式：库不是边界

原创与适配先用[设计语言](../DESIGN.md)确定本期表面、文字、关系和交接；取代码时按[复用图谱](component-reuse-map.md)分清参数组件与场景快照。原库keep表示选择了参考效果，旧细边、色彩铺面和章节标题不覆盖当前偏好。

效果库不要求每个镜头都套一个现成案例。它提供 FredTalk 的动作语言与质感锚点；场景只要明确属于下面一种路线即可：

| `implementationMode` | 必须记录 | 适用边界 |
| --- | --- | --- |
| `reference` | `referenceChoices` 和准确 source/implementation/callSite | 语义和动作接近，直接复用 |
| `adapted` | 同上，另外写清保留关系和本期变化 | 复用动作关系，替换内容/媒体/数量/时序 |
| `original` | `referenceDisposition`、锚点、`styleContract`、`newElements`、`risks`、`reviewRequired: true` | 库中没有足够准确的业务关系或内容结构 |
| `preserved-media` | `referenceDisposition`、`mediaContract` | 真实录屏/图片是主要证据 |
| `talk-only` | `referenceDisposition` 和不做证据声称的理由 | 纯口播、结论或文字表达 |

硬门禁是“每个场景必须有实现模式，并且有 `referenceChoices` 或 `referenceDisposition`”，不是“每个场景必须有案例”。原创结构化镜头通常建议从 `1–3` 个最接近的动作/风格锚点出发；纯口播和纯真实媒体可以没有锚点。不要用一个无关编号给自写代码背书。

`original` 的 `styleContract` 至少说明 `surface`、`typography`、`geometry`、`motion`、`camera`、`mediaBehavior`；同时列出本期新增元素和场景风险。它继承的是质感和动作语言，不是复制无关布局。单期原创先标为 `episode-original`，不因一次通过就进入公共批准库。

本句涉及横竖媒体接力、成对比较、报告全貌/局部阅读或阶段聚焦时，可按[新增 Library 场景实现选型](library.md)补查 `library-remakes-20260916` 的 `optional` 候选。它们已保存源码，但接口成熟度与复看状态不同，使用前读命中条目的限制；无需为此加载整个库。

完整组件适合就复制准确源码后适配，保留让它成立的动作与质感。只需要局部时用T/W索引，记录准确区间、载体和文字各自职责；没有合适参考可新做。新作必须延续同等质量，不用一个不相关的参考ID为自写代码背书。

referenceChoices.reason写“固定输入框内完成一次输入和发送，再开始第二次输入，说明重复劳动”，不能只写“本段适合完整模块”。preserve/keyAction写可观察动作，如“输入框展开→逐字→镜头跟随光标→退回发送”；change只写实际改动，不强制制造差异。完整复用仍可只改文案、素材和cue。

## 实现后核对来源，而非只复制说明

本次范围实际引用公共库代码时，在根记录referenceCatalogRevision（当前catalogRevision，不使用历史picker selectionRevision代替）。纯原创或保留媒体且本次范围无代码引用时不强制填库版本。实现后，每个代码参考沿原referenceChoices补充：

```text
useMode: full | local
keyAction: 本段实际保留的可观察动作
source: {path, sha256, symbol}          # 准确原组件或其本地冻结副本
implementation: {path, sha256, symbol}  # 本期实际适配函数
callSite: {path, sha256, symbol}        # 本期入口/分发中调用该函数的位置
```

路径相对当前Manifest，也可用绝对路径。source的hash必须属于该ID登记的sourceFiles/sourceCode；冻结副本可不同路径但须同hash。一个共享源码文件含多个函数时，人工核对准确symbol/dispatch分支，不把文件相同当作组件相同。

referenceChoices只登记实际借用的代码，不挂与实现无关的编号。没有代码参考时填写referenceDisposition：mode为original、preserved-media或talk-only，reason说明本镜实际方案；保留媒体的路径/hash/范围沿用原Manifest媒体字段与素材台账。局部T/W批准仍沿其准确selection和区间，不借此恢复被排除的完整组件。

原创镜头的最小记录包括：`implementationMode: original`、`referenceChoices: []`、`referenceDisposition.mode/reason/anchors/styleContract/newElements/risks/reviewRequired`。`styleContract`至少包含表面、字阶、几何、动作、镜头和媒体处理；不要求复制某个无关布局。

首次完成分镜规划时先运行 `validate_storyboard.py --require-production-contract`；完成实现、准备批量渲染，以及公共选择变化后恢复制作时再运行：

```bash
python3 skills/fred-remotion-output/scripts/validate_storyboard.py --manifest <当前Manifest> --require-scene-guides --require-reference-usage
```

整期导出前再按[分阶段门禁](production-gates.md)依次运行 `validate_production_gate.py` 的 `planning`、`implementation`、`representative`、`formal`。planning 不要求尚不存在的 implementation/callSite；implementation 才阻断源码归因、媒体 hash 和段内时钟；代表镜头不过不能先渲染整片。

有限返修可重复传`--scene-id <受影响stableId>`，同时限定场景小抄和新增源码归因检查；原有原文、时序和排除项检查仍覆盖整份Manifest。不要为通过检查回写未审看的旧镜头。录音已到位的正式输出另加`--require-final-timing`。

既有合同检查选择版本、登记来源hash、本期文件hash和符号文本存在；新规划componentMatching=v1另解析实际声明/调用表达式，仍不解析完整动态调用图，不证明函数实际可见或视觉一致。人工沿入口→分发→适配函数核对，实际效果要看输出。旧QC不能通过只更新hash继续冒用。

公共库变化后，先比较本期引用受影响项；已排除项从待制作/返修方案中替换，合并项解析到主代表。重新检查后更新本期revision。历史已认可成片和无关镜头保持保护，不因库更新自动重渲全部旧片。

## 两个问题都通过，才算内部审看通过

在现有QC按sceneId记录当前输出hash、检查区间、观察结果和遗留问题：

1. **讲清楚了吗？** 观众能否看到动作导致的结果？原对象/记录是否保持身份？语音换话题时画面是否跟上？关闭声音看动作，再结合口播确认含义；大字结论本身适合时不判失败。
2. **保住参考的质感了吗？** 对照所选源片相应阶段，检查构图与占比、字阶/间距、表面层次、缓动、动作/阅读节奏及首尾交接。不能只确认黑白紫配色或文字没被挡住。

把比较落到本镜实际风险，不要求每镜填一套新表：

| 看到的症状 | 实际检查与取舍 |
| --- | --- |
| 主体小、偏一边、外壳抢内容 | 按相同表达职责比较参考的有效内容面积、主辅字阶和视觉重心；在预期观看大小检查。左对齐或不对称本身不是错误，不强制统一占比 |
| 有动画但仍空洞 | 正常速度确认输入如何变成结果、选择如何发生；有Logo/背景不等于有内容。结论和阅读段已承担信息时可保持稳定 |
| 定格好看，动起来叠字或遮挡 | 看最长文字、运动中间态、完整路径和焦点交接；检查退出对象与新重点是否争抢同一区域 |
| 做了许多修补仍“不像参考” | 回到所选实际成片的建立、强调、阅读、退出阶段比较；若主要关系不成立就重选方案，不以同名组件、参考编号或黑白配色代替质量判断 |
| 单段可用，合起来断裂 | 以当前上游文件/hash的真实尾态检查完整交接；上游变化时复核受影响下游，不要求所有接缝都复杂变形 |

在已有QC留下具体观察和调整即可。参考的职责、参考片段尺寸与当前观看条件不同，允许合理适配；不追求所有指标相等。已认可保留区不因这些检查自动重做。

先以真实组件关键帧解决构图、字阶、字幕与品牌，再检查有代表性的真实内容短样：复杂交接、最长文字、产品特写等实际风险；内部修正后再扩到全量，已有授权直接继续。默认正常速度检查本次完整语义段与受影响接缝；用户明确要求跳过创意审看直接交付时，按[渲染与交付](render-and-delivery.md)记录授权和未审看状态，不额外安排一轮确认。截图、构建、解码或阈值扫描只证明各自范围；未看完不写视觉通过。

## Mic Pro 的历史教训与最新认可范围

已核对案例：V12有参考编号与文字描述不符的归因；V13开始实际挂载组件，但产品段仍引用新排除的V095。后者由现行校验器实际报错。代表静帧检查不能证明整段动态质感。上述是有限诊断，不宣称每次失败都同一原因，也不判定整库组件被否定。

例子：声音给Codex再存Obsidian，应该看到同一份有内容的记录经历交接，而不是依次换三个名字。几天后找回要求，应找回前面出现的那一条。它们是内容关系示例，不是以后每期固定照搬的画面。

## 新一期怎样确保从选型走到实际调用

新规划使用`workflow.componentMatching: v1`，旧成片与有限返修不为采用新字段重写。沿现有Manifest每场景增加`componentPlan`，不创建第二份时间线：

```json
{
  "componentPlan": {
    "query": "同一条提示词输入、发送，结果接管原输入框",
    "candidates": [
      {"id": "准确库ID", "decision": "selected", "reason": "保留输入→发送→结果的完整接力，容得下本句内容与cue"}
    ]
  }
}
```

1. 全文理解后按口播的完整语义段建场景，记录对象、动作、要看到的结果、实际素材、cue和进出状态。不要先每句套卡片，也不要把整段原文当检索词。`componentPlan.query`用视觉对象与动作；`scene.py`会直接带出少量同库候选和命中理由。
2. 查看候选真实区间，按动作、容量、字体、时长与接口选定；只记录实际比较的项，不要求固定数量。`selected`对应真正借用代码的referenceChoices；不合适写具体reject理由。库能表达时优先复制/调用完整成熟模块。原创新关系写`decisionReason`；纯媒体/纯口播可`search: not-needed`加职责理由。
3. `references.py --id ... --full`核对准确currentVersion或原版execution，二者不混用。复制到本期后适配文案、媒体、数量和口播时钟，保留本段需要的完整动作；根fonts与场景typography按[字体职责](typography.md)选。空结果有明确跨类型候选提示，不把sceneTypes当库能力的硬边界。
4. 实现阶段在原referenceChoices的`callSite`增加`callee`，它是实际调用的本期`implementation.symbol`，`callSite.symbol`是包含调用的入口/分发函数。检查器用项目内TypeScript解析源码，要求真实函数声明和该入口里的JSX/component赋值/调用表达式；注释、字符串、只有import或无关调用不能证明实现。
5. 用真实本期内容出关键帧，在现有内部QC对照所选源的建立→变化→阅读→退出，记录具体keyAction是否仍可见、字体/质感是否保住、音频cue与接缝是否成立。默认用户关键帧确认后内部修正并继续完整视频，不新增用户动态样片审批。

规划门检查选型决策与referenceChoices一致；实现门追加源码调用检查。语法中的调用仍不能证明某个动态分支已激活或动作质量达标，必须用真实输出审看。用户明确跳过审看时记录真实授权及未审看范围，不补造QC。

整组只读候选工具：

```bash
python3 skills/fred-remotion-output/scripts/component_selection.py --manifest <当前Manifest> --limit 3 --output <本期候选报告>
```

它按已经确定的本场景观看任务查询，不自动理解音频、选择方案或改写Manifest。没有新录音时只能检查流程；最终录音到位后由实际cue重算受影响动作。
