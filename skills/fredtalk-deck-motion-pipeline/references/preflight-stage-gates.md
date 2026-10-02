# 阶段前置门禁

门禁不是成片后的 QC。网页生图必须在第一次发送前取得当前合同的 `direction` PASS；编码、still/render 和正式 4K 命令只能通过 `run-stage-gate.mjs` 启动，验证失败时命令不会执行。没有 PASS 就发送生图 Prompt，或直接运行生产 Remotion 命令，属于绕过生产流程；只读浏览和检查已有内容不受发送门禁限制。

## 四个入口

| stage | 必须在何时运行 | 阻断内容 |
|---|---|---|
| `direction` | 发送首条生图 Prompt 前 | 页面责任缺失、参考图职责不清、生成式假证据；Deck另查其布局策略 |
| `motion` | 创建生产组件或批量写页面代码前 | 第二套手写页面事实源、缺逐字稿 cue、时间越界、缺实际文字/拓扑/终态 reference；Deck另查其默认动作策略 |
| `render` | Remotion still、1080p 样片或任意 render 前 | 合同问题及手写 `pages` 数据；Deck另查未经审看的默认 fade |
| `formal` | 最终规格生产 render 前 | 前三阶段问题及缺少本轮输出依据；分别验证样片认可、有限返修或明确直出授权 |

每个 PASS 都必须写 receipt。receipt 绑定 `contractChecksum / manifestChecksum / promptChecksum / sourceTreeChecksum / stage / createdAt`；`motion` 消费 `direction` receipt，`render` 消费 `motion` receipt，`formal` 消费 `render` receipt。合同、Prompt 或源码树变化后旧 receipt 自动失效，因此事后补跑不能追认已经绕过的动作。

## 最小合同

合同顶层必须有：

```text
contractVersion
runtimeSource.type = manifest-derived
runtimeSource.sourcePath / checksum
pages[]
```

验证器会读取 `sourcePath` 指向的真实 Manifest 并重算 SHA-256；只写 `manifest-derived` 字样或伪造 checksum 不能通过。

每个 active page 在 `direction` 前必须有：

```text
stableId / sourceBeatIds / scriptAnchor / exactScreenWords / oneQuestion
layoutFamily / majorGeometry / readingOrder / visualCenter
styleTrack / mediaRole / referenceImages[{path,responsibility}]
```

在 `motion` 前再增加：

```text
finalFrameReference{path,checksum}
typographyRoles[{role,text,sizeClass}]
connectorType / pathTopology / spokenOrder / timingSource
motionEvents[{sourceBeatId,event,cueFrame}]
primaryMotion / optional secondaryMotion
Deck default: noFade=true
durationInFrames / implementationComponentId
```

`standalone-video`按各段内容职责和真实预览判断重复，不强制布局配额、动作总数、`noFade=true`或不同秒数。`deliveryProfile: deck`仍执行其历史策略：四页以上单一布局族不超过50%；`repeatGroup`只豁免连续三页检查。字体/字重、同职责字号与角标固定锚点不属于全局布局锁死。`timingSource`为 `transcript-cue`、`audio-timecode` 或 `approved-manual-cue`；相同时长本身不证明估时错误。

声明`startFrame`的场景使用全局`cueFrame`，cue必须落在`[startFrame,startFrame+durationInFrames)`，终态余量从全局结束帧计算。未声明`startFrame`的旧合同按局部时钟解释，不混算。无上屏文字的独立媒体场景可用`exactScreenWords: []`和`typographyRoles: []`；真实媒体的阅读顺序与cue仍需填写。连续交接可以声明`finalHoldFrames: 0`，不强制每镜停住。

## 正式 4K 批准记录

`formal` 需要单独的 approval JSON。默认 `approvalKind=preview-acceptance`（可省略）保持首次样片认可流程，至少记录：

```text
status=approved / approvedBy=user / approvedAt
representativePages[] / previewFiles[]
coverage: black, white, vertical, grid, curve, branch, long-copy
qualityChecks: typography, layoutDiversity, spokenTiming, noFade, finalFrame
```

不能由 AI 根据“样片看起来没问题”代填 `approvedBy=user`。默认首次样片认可、已认可基线的有限返修、明确要求直接输出分别走独立分支；没有任何适用输出依据时保持阻塞。不要把直接制作/输出授权谎称为用户看过预览。独立视频的覆盖项由当前场景实际风险推导，不要求凑齐黑白、网格、曲线、分支等未使用画面；其质量检查为实际排版、字体、口播、动作清楚和终态。

默认`preview-acceptance`按已认可文件的实际hash保留历史接受身份。同hash复制/恢复造成mtime晚于批准只提示，不改变批准时间；hash变化仍失败。批准时间需为带时区ISO，超过当前时间60秒容差的未来日期失败。

## 命令

生成 Prompt 文件后再做方向验证；验证器逐页核对`stableId`和准确上屏文字；仅Deck流程另查其全期布局限制，同组字体一致和角标锚点不属于该限制：

```bash
node scripts/validate-stage-gate.mjs \
  --stage direction \
  --contract path/to/production-contract.json \
  --prompt path/to/direction-prompt.md \
  --receipt-out path/to/receipts/direction.json
```

验证通过才执行命令：

```bash
node scripts/run-stage-gate.mjs \
  --stage render \
  --action preview-render \
  --contract path/to/production-contract.json \
  --prompt path/to/direction-prompt.md \
  --previous-receipt path/to/receipts/motion.json \
  --receipt-out path/to/receipts/render.json \
  --source-dir path/to/remotion/src \
  -- npm run render:preview
```

正式 4K：

```bash
node scripts/run-stage-gate.mjs \
  --stage formal \
  --action formal-render \
  --contract path/to/production-contract.json \
  --prompt path/to/direction-prompt.md \
  --previous-receipt path/to/receipts/render.json \
  --receipt-out path/to/receipts/formal.json \
  --source-dir path/to/remotion/src \
  --approval path/to/preview-approval.json \
  -- npm run render:4k60
```

runner 强制 `stage/action` 匹配：`direction-check / motion-build / preview-render / formal-render`。低级 stage 不能启动职责为正式渲染的命令；明确formal入口/已知render名称用于防误用，目录、媒体文件名和4K分辨率不作为样片认可或正式身份依据。正式身份由stage/action及对应receipts/授权决定；未知编排脚本由执行者核实真实职责，`source-dir` 必须与合同的 `productionSourceDir` 指向同一真实目录。生产任务失败时修正真实 blocker，不通过伪装名称、跳过 runner 或补填虚假批准记录过关。用户授权的 Skill 维护可通过真实失败用例修复 validator 与当前规则的冲突；不把历史错误限制永久保留。

## 独立视频与动态交接扩展

通用 `validate-contract.mjs` 支持显式 `deliveryProfile: standalone-video`：不要求 Deck 路由，允许 `badgeVariant: none`。默认仍为 deck；两者共用身份、文件 hash、时间、前置 receipts 与正式批准检查，不为独立视频跳过渲染门禁。

H3→Remotion 页面声明 `productionRoute: h3-remotion` 与 [动态交接](../../fred-remake/references/h3-handoff.md) 中的 reconstruction；stage gate 检查实际源 hash、范围、中间状态、时间映射、表面/全屏层冲突和上游尾态。显式 runtimeDependencies 在每阶段核对真实文件，不能靠旧 receipt 掩盖素材变化。它们是结构与新鲜度检查，不能代替实际帧的可见性与美观验收。

## 有语义的透明度与原版显隐

Deck默认`noFade=true`表示不以统一缓慢淡入淡出充当页面主动作，不等于禁止所有对象显隐。独立视频不按透明度关键字硬阻断，有职责的蒙版、前景淡化和原版显隐按当前场景与实际预览验收。扫描命中准确原版或短促、有职责的透明度时，先看整个相应区间；确认适用后在合同顶层 `motionSourceReviews[]` 写 `file`（相对 productionSourceDir）、`checksum`、`rules`（dynamic-opacity / fade-helper）、`frameRange: [start, endExclusive]`、`reason` 与真实 `evidence`。没有审看不填通过；优先隔离到职责单一的组件文件。

门禁只放行所登记规则与同 hash 源文件，修改使记录失效；不放行手写页面 registry。帧段是审看范围声明，正则检查不能证明效果只发生在这个范围，仍需实际样片检查。技术审看不替代用户样片批准。

## 已完整认可基线的正式返修分支

`approvalKind=bounded-revision` 用于完整成片已实际看过并认可、用户点名有限修改且要求直接导出的情况；不用于第一次“开始制作”。沿用 `--approval` 参数和原 receipt 链。当前合同增加实际正数 `timelineFps`，各页显式声明 `startFrame/durationInFrames`；范围统一为全局整数帧 `[start,endExclusive)`。预览尺寸不写死1080；使用真实媒体、匹配当前时钟的帧率和已声明`outputSpec`画幅。已看的4K或其他有效画幅不因默认1080流程失去身份；不得为过关改报尺寸或帧率。

复用已有记录，不创建额外页序或素材事实源：

| 文件/对象 | 必需内容 |
|---|---|
| approval 根 | `approvalKind: bounded-revision`、当前 `contractChecksum`、`baselineAcceptance` 与 `internalReview` 的 `{path,checksum}` 引用 |
| `revision` | `action: bounded-revision-direct-export`、`directExportAuthorized: true`、真实 `decisionQuote`、`decisionContext: {source: conversation, reference: 可定位的消息或上下文}`、`decidedAt`、`timeMeaning`、`changes[]` |
| `changes[]` | `pageId`、页面内的全局 `frameRange`、具体 `change`；保护对象与修改内容写清 |
| baseline acceptance JSON | `status: accepted`、`acceptedBy: user`、`scope: complete`、真实 `decisionQuote`、`acceptedAt`、`timeMeaning`、`timelineFps`、`files[{path,checksum,frameRange}]` |
| internal review JSON | `reviewedBy: agent`、`reviewedAt`、当前 `contractChecksum/sourceTreeChecksum`、`previewFiles[{path,checksum,frameRange}]`、`checks[]` |
| `checks[]` | `kind: changed-range | preserved-range | seam`、`frameRange`、实际 `method/findings`、`result: pass`、`evidence[{path,checksum}]`；截图等可选 `attachments[{path,checksum}]` |
| 每份 evidence JSON 报告 | 自身绑定当前 `contractChecksum/sourceTreeChecksum/frameRange` 与实际 `previewFiles[{checksum,frameRange}]`，并保存相应检查结果；只更新外层review不能让旧报告变新 |

所有引用路径相对包含它的 JSON；hash采用 `sha256:` 前缀。时间必须为带时区ISO，`timeMeaning` 为 `message-time` 或 `recorded-at`。没有精确消息时间就如实记记录时间，不伪造发言时间。相同已认可hash的文件复制/恢复不改变历史认可；当前内部预览与证据仍核对先生成、后复检的时序。

基线真实媒体必须完整覆盖当前交付范围，时长与声明范围匹配，不能以开头样片冒充完整基线。当前预览集合覆盖修改动作和各修改/交付边界的两侧；脚本最低核对相邻帧，实际观看窗口还须包括动作建立与退出。保留区用实际回归报告覆盖，不强迫重渲完整1080；变更/接缝报告的预览引用覆盖自身区间，保留区报告绑定当前构建与当前局部预览，并保存保护区域回归结果。

根对象拒绝混入旧的 `approvedBy/approvedAt/previewFiles/qualityChecks` 字段。结构化直出授权必须来自真实对话；校验只拦明显否定/等待确认等矛盾，不能认证原话真实性或自动理解全部语义。证据hash和范围正确也不等于美观，生产Agent仍负责实际审看；最终MP4的全帧候选、局部可见性及接缝检查继续执行。

可执行示例和正反例见 `scripts/test-bounded-revision.mjs`，运行环境需提供已验证的 `ffmpeg/ffprobe`。未改的默认首次批准流程由 `scripts/test-stage-gates.mjs` 回归验证。生产任务不得通过编辑validator、刷新历史日期或填虚假报告绕过检查。


## 用户明确要求直接输出

`approvalKind: direct-output`仅用于`standalone-video`，与已看样片认可分开。普通“开始制作”本身不是直接交付依据；Agent根据当前完整对话判断实际授权，校验器只核对结构、范围与文件，不能靠词语正则证明或否定自然语言授权。当前媒体检查不代表用户看过新片。

- 当前合同声明`timelineFps`、`outputSpec: {width,height,fps}`和完整有序页面的全局`startFrame/durationInFrames`。
- approval根为`approvalKind / contractChecksum / authorization / internalReview{path,checksum}`，不混入`approvedBy/status/previewFiles`等样片认可根字段。
- `authorization`包含`action: direct-output`、`directExportAuthorized: true`、真实`decisionQuote`、可定位的`decisionContext: {source: conversation, reference}`、`decidedAt/timeMeaning`、准确交付`frameRange`、有序`pageIds`及`outputSpec`。它们须匹配当前合同；已有跨消息授权可引用对应上下文，不强制用户使用特定措辞。
- `internalReview`文件包含`reviewedBy: agent / reviewedAt / contractChecksum / sourceTreeChecksum / previewFiles[{path,checksum,frameRange}] / checks[]`。实际短样或still必须可读、hash匹配、时钟与画幅相符。`checks`逐项记录`kind: technical | visual`、范围、`result`、实际`method/findings`、`evidence[{path,checksum}]`；证据JSON绑定当前合同/源码/范围/实际preview引用，并记录方法与发现。
- 默认内部视觉审看覆盖当前交付范围。用户明确要求输出后自己看、跳过视觉检查时，增加`reviewPolicy: {mode: limited-by-user, creativeReviewSkippedByUser: true, decisionQuote, decisionContext, decidedAt, timeMeaning}`。未看范围如实填`visual/result: pending`，不填PASS。技术预检仍覆盖交付的源码、素材和时间线，可使用可得的代表短样/修改窗口。明确limited-by-user时，当前源码/依赖/时间线的真实技术预检报告可不绑定新短样（previewFiles为[]），不为这条流程强制额外still；这不是已经验证未来最终文件。
- 未另做预览的明确直出，可用`validate-stage-gate.mjs --stage render`做当前源码预检并生成receipt，不必为此伪跑预览。formal仍消费当前render receipt；导出后检查实际文件存在、规格、帧数/PTS、音轨、解码和hash。视觉复看遵循当前用户范围，未做部分标待用户检查，不为默认流程再索要一次确认。

可执行正反例见`scripts/test-direct-output.mjs`；结构正确不能替代Agent对原话、当前范围和实际检查真实性的责任。
