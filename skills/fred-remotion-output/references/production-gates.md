# 分阶段生产门禁

本文件把“先做完再发现问题”改成可停止的阶段流程。它不是视觉批准替代品，而是让错误尽可能在整片云端渲染前暴露。

## 强制和建议的边界

| 项目 | 级别 | 规则 |
| --- | --- | --- |
| 每个场景选择实现模式 | 强制 | `reference`、`adapted`、`original`、`preserved-media`、`talk-only` 五选一 |
| 每个场景有案例归因或原创说明 | 强制 | 有代码借用用 `referenceChoices`；没有代码借用用 `referenceDisposition`，不能留空 |
| 原创视觉场景的风格合同 | 强制 | 要有锚点或明确 `styleTrack`、`styleContract`、`newElements`、`risks`，并 `reviewRequired: true` |
| 真实录屏/图片的来源 | 强制 | `mediaContract` 记录路径、角色，进入实现门时记录 hash |
| 动态/阅读静止声明 | 强制 | `dynamicContract.mode` 必须是 `dynamic`、`mixed` 或 `stable-reading`；静止必须有理由 |
| 案例数量 | 建议 | 通常选择 1–3 个最接近的锚点；不要求每个镜头使用案例，也不要求把所有案例做一遍 |
| 新原创组件进入公共库 | 建议后置 | 先标 `episode-original`；跨期复用并通过维护审查后再升为 `candidate`/`approved` |
| 用户审看范围 | 按当前工作方式 | `fred-video-v2`默认确认真实关键帧后由助手内部检查动态，不再等用户动态样片批准；明确`direct-output`可覆盖用户等待，内部代表镜头和技术门禁仍执行 |

## 四种内容实现路线

### `reference` / `adapted`

`reference` 是准确复用，`adapted` 是保留动作关系后替换内容、媒体、数量或时序。两者都必须在实现门记录：

- `reason`：本段为什么需要这个关系；
- `preserve`：实际保留的可观察动作；
- `change`：本期真正改动的内容；
- `useScope`：本期使用区间；
- `source`、`implementation`、`callSite`：准确路径、hash、symbol。

不能用一个无关编号给原创代码背书。

### `original`

库中没有足够准确的方案时允许原创。原创镜头不是无约束自由发挥，至少要声明：

```json
{
  "mode": "original",
  "reason": "效果库没有当前业务关系的准确案例",
  "anchors": ["B044", "T10"],
  "styleContract": {
    "surface": "黑白灰，单一紫色强调",
    "typography": "主辅两档字阶，正文可读",
    "geometry": "克制圆角、统一边框和安全区",
    "motion": "先建立对象，再聚焦，再交接",
    "camera": "内容接管时推近，阅读时停稳",
    "mediaBehavior": "真实素材保持清晰，不用假UI替代证据"
  },
  "newElements": ["本期业务字段"],
  "risks": ["卡片数量增加后文字变小", "结果录屏被窗口裁切"],
  "reviewRequired": true
}
```

有结构化动效或新布局时，至少保留一个动作/风格锚点；纯口播和纯真实媒体可以不设锚点，但仍要写本镜风险和检查。锚点只说明继承了哪些语言，不表示新场景已经被用户认可。

## 四道门的职责

### 1. `planning`

命令：

```bash
python3 skills/fred-remotion-output/scripts/validate_production_gate.py \
  --stage planning --manifest <manifest> --receipt-out <planning-receipt>
```

强制检查：

- 原文 hash、`sourceSpans`、场景覆盖和总时长；
- 已声明启用的 `brandCorner.position` 非右上时，需要真实当前例外来源 `overrideSource`；字段检查不能证明渲染位置正确，几何仍按准确品牌规范与真实画面检查；
- `oneQuestion` 与 `visualPlan.enter/change/read/exit/handoff`；
- `implementationMode`；
- `referenceChoices` 或 `referenceDisposition`；
- 原创镜头的风格合同；
- 真实媒体契约是否声明；
- `dynamicContract` 是否明确允许动态或静止；
- scene guide 是否有本场景决定与检查；
- 多场景是否声明 `clockContract.mode=scene-local`。

这一阶段还没有实现源码，因此不要求 `implementation` 和 `callSite` 已存在；但不能没有选择路线。

### 2. `implementation`

命令：

```bash
python3 skills/fred-remotion-output/scripts/validate_production_gate.py \
  --stage implementation --manifest <manifest> --source-dir <remotion-src> \
  --previous-receipt <planning-receipt> --receipt-out <implementation-receipt>
```

强制检查：

- planning receipt 必须是同一 Manifest 的 `PASS`；
- 所有代码参考的 source/implementation/callSite hash 和 symbol；
- 所有实际媒体存在且 hash 正确；
- 运行 `lint_remotion_clock.py`，多场景禁止 `Sequence from={0}` 和未经说明的全片 `frame / FPS` 段内时钟；
- 新原创场景仍必须保留 styleContract，不得退化成无归因大文件。
- 记录实际 `sourceDir` 与 `sourceTreeSha256`。后续阶段重新计算源码树 hash，并递归核对前序 receipt 的路径、hash、阶段和 Manifest；源码或前序记录变化时不能继续使用旧 PASS。

`--source-dir` 指向本次冻结的实现目录，避免把将要写入的 receipt、渲染输出放进这个目录。它的 hash 覆盖该目录下文件，忽略 `node_modules`、`.git`、`dist`、`.vite`；目录外的实际媒体仍由实现门的媒体/引用 hash 检查负责。源码树 hash 不代表对目录外所有依赖做了自动监控。

### 3. `representative`

代表镜头不是可选的“看看效果”，而是整片渲染前的风险抽样。必须覆盖：

- 最长文字或跨行阅读；
- 真实录屏/图片；
- 原创视觉场景；
- 复杂设备/对象接缝；
- 结尾；
- 当前 Manifest 指定的其他高风险场景。

`representativeScenes` 只能追加代表场景，不能覆盖自动挑出的首尾、最长文字、最多动作、原创和真实媒体场景。复杂接缝若没有被上述项选中，应明确加入此清单。

review receipt 至少记录每个代表镜头的：

```json
{
  "stableId": "S3",
  "artifactPath": "previews/S3.mp4",
  "artifactSha256": "...",
  "reviewRange": {"startSeconds": 0, "endSeconds": 6},
  "checks": {
    "normalSpeed": true,
    "semanticMatch": true,
    "readability": true,
    "motionOrStableReading": true,
    "handoff": true
  },
  "observations": [
    {"check": "semanticMatch", "atSeconds": 1.2, "note": "口播说到筛选时，选中项留下，其他项退到后面。"},
    {"check": "readability", "atSeconds": 3.0, "note": "最长三行正文全部可见，底行与字幕不相交。"},
    {"check": "motionOrStableReading", "atSeconds": 3.8, "note": "推近完成后停稳到读完，正文没有持续漂移。"},
    {"check": "handoff", "atSeconds": 5.8, "note": "文档从相同位置进入下段，末尾没有空场或尺度跳变。"}
  ]
}
```

只有所有检查为 `true`，实际预览视频存在、hash 一致、可探测且完整解码通过，才可生成 `representative` receipt。`reviewRange` 使用该视频内的秒数，必须在实际时长内并至少覆盖完整场景时长；观察时间必须位于该范围。四类观察都要写具体看到的内容，不能只填 `PASS`、`OK` 或“已检查”。脚本检查证据结构和文件，不替人判断观察是否真实、画面是否好看。

静帧选型与构图确认另记 `keyframeReview`，不能填进 `normalSpeed` 动画审看。已授权直出或有限返修不因此新增一轮用户审批；内部实际视频审看仍须完成。后续 formal 还会核对 review receipt 和被审视频的 hash，防止审过的是旧文件。

### 4. `formal`

命令：

```bash
python3 skills/fred-remotion-output/scripts/validate_production_gate.py \
  --stage formal --manifest <manifest> --video <final-mp4> \
  --previous-receipt <representative-receipt> --receipt-out <formal-receipt>
```

强制检查：

- representative receipt 必须是同一 Manifest 的 `PASS`；
- 实际视频流时长与 `durationInFrames / timelineFps` 一致，帧率与 `timelineFps` 一致；
- 视频和全部音轨从头到尾完整解码，报错即失败；
- `outputSpec` 中声明的宽、高、输出帧率和音轨要求与实际文件一致；未声明的尺寸/音轨要求不自动猜成 4K 或强制有声；
- `dynamic`/`mixed` 场景的采样帧存在可见变化；
- `stable-reading` 场景必须有静止理由；
- 最终视频 hash、规格和交付记录写入 formal receipt。

例如本次确实要 `1920×1080 / 60fps` 且有音轨时，可在 Manifest 写：

```json
"outputSpec": {"width": 1920, "height": 1080, "fps": 60, "audio": "required"}
```

`audio` 可为 `required`、`none` 或 `optional`。音轨存在和可解码不等于口播版本、混音或主观听感正确，这些仍由当前音频合同和审听负责。`videoMetadata` 记录实际宽高、fps、视频时长、有无音轨以及完整解码结果。

## 动态性不是“越动越好”

`stable-reading` 是合法状态：完整提示词、文档正文和事实证据可以停稳阅读。问题在于不能把没有内容变化的画面伪装成动态段。

- `dynamic`：必须声明 `requiredChangeEvents >= 1`；
- `mixed`：允许阅读停顿，但必须有至少一个内容或镜头变化；
- `stable-reading`：必须说明为什么需要停稳，不参与动态变化阻塞。

规划阶段即校验 `sampleCount`（未写时与扫描器一致为5）至少为3，且 `requiredChangeEvents <= sampleCount - 1`，避免完成渲染后才发现不可能达成的采样配置。需要更密采样时按真实动作调整采样覆盖，保留原阈值与原失败证据；不得为通过而降低要求或增加无意义运动。数量通过只能说明所采位置发生变化，不能证明镜头丰富、材质一致或表达成立。

扫描器只做保守的帧差异常检测，不能替代正常速度观看、语义检查和遮挡检查。

## 失败处理

- planning 失败：回到稿件、Manifest 或场景路线；不得写实现代码；
- implementation 失败：修源码归因、媒体映射或段内时钟；不得渲染整片；
- representative 失败：只修受影响场景和接缝，旧 receipt 失效；
- formal 失败：不交付、不切换前端、不把技术文件存在写成完成。

Manifest、已记录源码树、前序 receipt、审看 receipt 或被审视频变化后，门禁会拒绝旧证据；目录外媒体、字体和依赖变化也必须主动从受影响的最早门重跑，不能把当前 hash 覆盖范围说成全工程自动监控。历史 receipt 不倒改，新任务/返修按当前合同生成新证据。`contact sheet`、单张首尾图、ffprobe、hash 和云任务成功都不能替代代表镜头审看。
