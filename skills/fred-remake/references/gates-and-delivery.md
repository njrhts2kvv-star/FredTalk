# 生产门禁与交付

## 与现有生产链连接

生产任务不复制 validator 或为过关削弱检查；经授权的 Skill 维护可以用明确 schema 和回归测试修复规则冲突。先读当前项目 `skills/fredtalk-deck-motion-pipeline/references/preflight-stage-gates.md`，使用该版本的参数与 schema。

轻量场景实现合同之外，生成与现有门禁兼容的 production contract：

- 顶层：`contractVersion`、`runtimeSource.type=manifest-derived`、`runtimeSource.sourcePath/checksum`、`productionSourceDir`、`pages`。
- 页面身份：`stableId/sourceBeatIds` 必须与真实 manifest 的顺序和值一致；不要漏掉 manifest 的 sourceBeatIds。
- direction：`scriptAnchor/exactScreenWords/oneQuestion/layoutFamily/majorGeometry/readingOrder/visualCenter/styleTrack/mediaRole/referenceImages`。
- motion：`finalFrameReference.path/checksum`、`typographyRoles` 覆盖准确文字、`connectorType/pathTopology/spokenOrder/timingSource/motionEvents/noFade/primaryMotion/durationInFrames/implementationComponentId`。
- Prompt/brief 包含稳定 ID 和准确上屏词；未调用生图时它就是本地场景实现方向说明，不意味着授权上传。
- 替换参考、改合同或源码后，按门禁失效规则更新对应 receipts。不能拿旧 PASS 证明新版本通过。

direction/motion 只检查时使用 `validate-stage-gate.mjs`；`run-stage-gate.mjs` 需要 `-- <command>`，不要不带命令调用。

调用前创建本次 receipt 父目录，并核对当前 runner 支持的 action、命令匹配规则及完整 Prompt 字段。某一步 FAIL 就停止依赖它的后续步骤，修正后从失效点重跑；不要并列运行依赖失败 receipt 的命令，也不要靠无意义命令补一张 PASS。

```bash
node skills/fredtalk-deck-motion-pipeline/scripts/validate-stage-gate.mjs --stage direction --contract "$clip_contract" --prompt "$clip_brief" --receipt-out "$clip_direction_receipt"
node skills/fredtalk-deck-motion-pipeline/scripts/validate-stage-gate.mjs --stage motion --contract "$clip_contract" --prompt "$clip_brief" --previous-receipt "$clip_direction_receipt" --receipt-out "$clip_motion_receipt"
```

motion PASS 后实现生产组件，再经 runner 启动 still/preview：

```bash
node skills/fredtalk-deck-motion-pipeline/scripts/run-stage-gate.mjs --stage render --action preview-render --contract "$clip_contract" --prompt "$clip_brief" --previous-receipt "$clip_motion_receipt" --receipt-out "$clip_render_receipt" --source-dir "$clip_source_dir" -- node "$clip_preview_script"
```

以上变量必须由已确认的本次路径赋值，不复制历史 episode 路径。runtime 用项目 canonical 实体依赖；已有隔离工程经验证可复用，但不得成为跨期默认运行时。

## 批准不是制作授权

默认完整样片附时间长度和关键修改，供用户实际确认。1080p是节约渲染成本的默认，用户指定或已看的真实目标规格样片同样有效，不为了格式另补1080。当用户说“可以，输出 4K60”时，记录对应预览路径、checksum、用户原话、时间以及合同 checksum。

首次样片认可使用默认 `approvalKind=preview-acceptance`；其 formal approval 按当前 validator 要求包含：

`status=approved / approvedBy=user / approvedAt / contractChecksum / representativePages / coverage / previewFiles(path,checksum) / qualityChecks`。

qualityChecks 是助手验收结果；`approvedBy=user` 只能来自真实确认。不能创建“production-request-with-requested-changes”之类字段来冒充用户已看过新样片。没有样片确认且没有另一适用输出授权时，交付当前样片并准确说明状态。用户明确要求直接输出时走主链`direct-output`分支；它不声明样片已看。不能把批准时间伪造为新文件生成之后。

同理，`userReviewedThisPreview=false` 与批准范围的解释不能把制作授权变成样片认可。分别记录制作请求、助手 QC、用户样片确认；当前门禁缺少任何适用的真实输出依据时如实暂停，不通过重命名授权字段或刷新时间戳满足校验。局部开头样片可以用于诊断，但不能冒充完整拼接样片的观看验收。

### 已认可样片，且明确要求有限修改后直接出片

这与从未看过样片的“开始制作”不同。必须同时具备：真实完整样片及其明确认可、具体修改范围、用户明确不需再次确认并要求最终导出。此时用户最新指令优先于本 Skill 默认等待流程；做内部诊断、未改区域回归和最终 QC 后直接交付，不重复要求确认。

- 批准记录引用用户真正看过的旧样片路径/hash，另记本次修改清单、直接导出原话、当前合同/hash及助手复检证据；不得伪造新样片观看记录。
- 用户消息时间可获取则使用原时间；无法获取精确时间时注明记录时间及依据，不把执行时刻伪装成用户发言时刻，不为匹配文件 mtime 刷新批准时间。
- 此授权只覆盖点名变化，不允许擅改文案、节奏、布局方向或音轨。超出范围需重新确认。
- 使用现有正式门禁的 `approvalKind=bounded-revision`，消费当前有效 receipt；精确字段见 [正式返修分支](../../fredtalk-deck-motion-pipeline/references/preflight-stage-gates.md#已完整认可基线的正式返修分支)。基线接受、直出授权和助手当前复检分开，不使用旧 `approvedBy/qualityChecks/previewFiles` 根字段伪装新样片已看。
- 内部预览可只覆盖修改窗口与相邻接缝；1080不是硬规格，实际帧率/画幅匹配的当前4K等样片可以复用。保留区引用实际回归证据；绑定当前源码、合同、媒体hash和全局帧范围。当前构建覆盖变化会使相关证据失效。相同hash基线恢复不修改历史接受时间；没有完整基线、明确直出授权或当前复检证据时，该分支不成立。

```bash
node skills/fredtalk-deck-motion-pipeline/scripts/run-stage-gate.mjs --stage formal --action formal-render --contract "$clip_contract" --prompt "$clip_brief" --previous-receipt "$clip_render_receipt" --receipt-out "$clip_formal_receipt" --source-dir "$clip_source_dir" --approval "$clip_approval" -- node "$clip_formal_script"
```

## 编码和画幅

### 独立替换片段

用户只要局部片段时，以当前完整源视频的帧范围界定交付，包含必要的入场、强调退出与承接余量；不自动重渲染其他段或重新装配整片。记录源视频路径/hash、源起止时间与帧号、片段帧数/fps、音轨保留方式；时间范围使用起点含、终点不含，并清楚说明该片段替换参考片段哪里。

修改前列清保留对象、目标层、变化内容和影响范围。仅强调一条结论时保留之前的演示；不能把用户要求的强调层替换成重做整段。按最终片段核对首尾、邻接状态、PTS、色彩/像素格式和音轨；用户后来要求拼接整片时，再检查实际拼接输出。只交付片段不能声称完整视频已合入修改。

### 渲染执行

有限视觉修改仍需交付整段时，优先复用可验证的未改帧，只补渲受影响的半开帧区间及必要交接；下游冻结首态或共享组件引用也计入影响范围。已有无损帧序列时记录每段来源构建/hash和帧映射，装配后统一编码；硬链接的源帧视为只读，不在原 inode 上覆盖。只有压缩 MP4 时评估关键帧拼接或重编码损失，不能称为无损。渲染与编码分开报告：“只补渲局部”不等于“没有重新编码整段”。无论复用多少帧，最终文件仍检查 PTS、帧数、音轨、保护区与接缝。

- 字体候选和局部交接优先用受门禁约束的 still/短样诊断，再按当前约定输出可审看的样片；用户已指定直出或已有目标规格证据时不强补1080，不逐次无目的地用完整4K试设计。
- 启动渲染前冻结合同、Prompt、源码与素材 hash；运行期间不改该构建。新修改排队到下一版，或明确停止旧任务后重启。渲染结束复核 hash，变动则结果标为待重验，不能用启动时 receipt 证明它对应最新源码。
- 进程返回 session ID 只表示仍在运行，需等待真实退出码并检查产物。runner 的前置 PASS 不等于后续渲染成功；渲染失败后即使已有 receipt，也不能据它推进 formal。

- 先跑项目 typecheck；新字体与视频组件先用能覆盖风险的短样验证；低分辨率优先用于节约成本，按用户当前规格与有效已有证据决定，不强迫重复渲染。
- H.264 + yuv420p，原音轨需要时使用 AAC；图文类可从 CRF 12–16 起验证，不能以高码率代替源素材清晰度。
- 不默认拉伸非 16:9 视频。contain + 白边、裁切或重排由参考合同决定，说明变更；设计与源图的像素比例只换算一次。
- 4K60 的帧数取实际时长×60的合理整帧值，尾部最多约一帧量化差异需记录。不能因音轨稍短使用 shortest 截掉结尾画面。
- 系统 ffprobe 可能是失效 wrapper。优先实际可运行的直接二进制，记录路径；不要退到 `remotion ffprobe` 挂起或在命令失败后静默忽略。
- 预检须覆盖门禁子进程的工具解析：外层能执行某个绝对路径，不代表 validator 内部的 `ffprobe` 可用。必要时仅为本次命令配置已验证的 PATH，不修改系统全局设置。runner用stage/action与对应receipt/授权区分用途，已知render入口不能用于direction/motion动作；4K文件名或目录名不是正式身份。未知编排脚本由执行者核实真实职责，不靠伪装名称执行别的动作。
- 默认 managed browser；沿用已验证的其他浏览器需有理由和版本记录，不把某台机器 Chrome 绝对路径写死进公共 Skill。

## 最终检查与交付

技术：分辨率、r_frame_rate 和 avg_frame_rate、帧数、时长、音轨、完整解码、最终 SHA256。

视觉：真实 t=0、开头 1–2 秒、最长文字/最大卡片、每次焦点接替、修复接缝和最后定格。黑/白 Logo 背景检查是诊断，不进入正式视频。

全帧检查：默认交付前执行 [全帧异常检查与偶发白帧](render-failure-checks.md#全帧异常检查与偶发白帧)，覆盖实际 MP4 每一帧并解释全部候选。现有 media-audit 的 decode/sheet、低频 Contact Sheet 与首尾检查均不能替代；无损中间帧检查也不能免除最终编码文件复检。发现但未解释的异常需修复或准确告知；此项是执行验收要求，不代表现有 stage validator 已自动检查像素。用户明确跳过视觉审看时按主链limited-by-user范围执行并标记未看区域，不把技术结果写成视觉PASS。

在最终交付文件上单独检查第 0 帧、首批连续帧、最后一帧及用户点名区间。样片通过不免除 4K 检查；导出后再补帧、拼接或重编码，会使旧输出 checksum 与对应 QC 失效，必须对实际最终文件重新验证。

观看：播放完整样片和必要的最终高分辨率窗口，区分源视频已有缺陷、允许保留项、新增问题；不能只看 contact sheet 判定无频闪。

交付：最终文件唯一保存在本期 02_最终输出，过程目录留代码、合同、预览和 QC；如移动文件则同步最终路径。用户批准的旧版保留。最终文字不夸大“原生 4K”“全片代码场景实现”“完全一致”。需要整期发布/知识库同步时按相应项目流程处理，不为独立片段擅自生成发布文案或上传媒体。

## 明确直出与用户自行审看

独立视频明确要求直接输出时可用[direct-output正式分支](../../fredtalk-deck-motion-pipeline/references/preflight-stage-gates.md#用户明确要求直接输出)。输出授权、当前助手检查和用户样片认可分别保存。用户明确“输出后给我看，不用检查”时记录准确原话与定位，技术预检和最终完整性继续执行，未做视觉部分标pending；不假装用户看过，也不因默认1080或确认流程重复询问。
