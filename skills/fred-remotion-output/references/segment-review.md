# 逐段审看：建议、真实关键帧、视频

生成前必须通过[组件库交付门禁](library-delivery-gate.md)。生成器现在会直接检查当前Manifest，失败时不覆盖已有HTML；即便首次打开建议视图，只要页面包含Remotion关键帧，也执行关键帧级检查。自定义前端与聊天建议同样必须运行门禁，不能换入口绕开。未通过的旧页面不会因此被自动重做或取得新认可。

同一期沿用一个页面、同一份当前 Manifest，分成三个视图。它规定协作方式，不规定镜头数量、构图模板或每期必须出多少张图。

1. **图文建议**：助手先按逐字稿提出制作方式、原因和画面方向；Fred 选择或改动。助手建议不会预先勾成用户选择。H3、Seedance 等生成视频都可归入 `generated-video`，具体工具及既有外部素材由本段方案说明。
2. **真实关键帧**：用准备继续制作的实际 Remotion 源码生成图片，连同当前字幕和角标一起看。每帧有完整原文、时间、图片和可填写的图文意见；确认只覆盖这张静态画面。关键帧按语义、稳定阅读态、关键运动中间态及接缝选取，不固定 140 张或均匀抽样数量。
3. **视频审看**：方向和关键帧处理后看正常速度视频，检查节奏、声音、运动和衔接。当前视频排第一，历史版本可展开。静帧通过不能证明动态通过。

三列固定为逐字稿／当前视图的真实素材或建议／用户选择与修改意见。已有明确选择、有限返修、当前直出授权按主流程处理，不为了此页面重新询问。路线、候选方向与实现的关系见[路线与分镜选型](route-and-storyboard-review.md)。

## 公共模板（默认）

2026-10-04从第108期已使用的前端提取公共模板：视频模块在 `templates/review-app/`，音频模块沿用 `audio-subtitle-roughcut/assets/review-app/`。后续只换Manifest和媒体，不复制某一期的feedback、HTML补丁或服务器路径。两个本地模块可由同一启动命令运行，页面互相链接。

```bash
python3 skills/fred-remotion-output/scripts/init_review_app.py \
  --manifest "$episode_manifest" --episode "$episode_dir"

python3 skills/fred-remotion-output/scripts/serve_review_app.py \
  --review "$episode_dir/03_制作过程/review-app" --port 8148 \
  --audio-review "$episode_dir/03_制作过程/audio-review" --audio-port 8107
```

音频模块首次用音频Skill的 `init_review.py` 初始化；没有音频粗剪台时省略 `--audio-review/--audio-port`。启动前检查所选端口，不关闭其他任务。依赖为Python、Node 18+，媒体规范化与分段需要FFmpeg/FFprobe，不安装npm包或连接云平台。

同一入口提供方向与分镜、关键帧、逐段视频三个视图，以及最终成片页。关键帧在段内滑动、放大并支持左右键；顶部完整音频可倍速播放、按场景跳转并跟随定位。每行支持当前/上一版独立视频，点“加载本段视频”才绑定src，`preload=none`，全页只允许一个媒体播放。无真实产物的段保留待制作，不能填写采用来冒充已看。

更新已有公共台用相同命令加 `--update`；只更换模板代码和已通过同一library gate的数据快照，磁盘意见与附件保留。旧专用108前端不直接套用此命令，旧反馈schema不自动迁移成新认可。未通过门禁、文件hash或时间映射校验时不替换已有review.json。服务器检测Manifest或媒体变化会要求重新更新，不能把同名旧图继续当当前画面。

### 108真实内容示例

项目实体 `assets/review-example-ep108/` 提供v9成片的S01–S07，共3688帧/60fps，即61.466667秒，保留完整段落。含前7段真实口播、字幕、300张实际成片关键帧、逐段720p60视频及完整1080p60示例。完整片段派生自4K60成片，不冒充正式4K文件。音频直接截取已完成音轨的PCM，不重复处理、变速或加增益。

```bash
python3 skills/fred-remotion-output/assets/review-example-ep108/START.py
```

默认视频8168、音频8169，可传 `--port` 和 `--audio-port`。解压便携示例包后同样执行包内 `START.py`，观看已有示例仅需Python和Node；新制作的初始化/分段仍依赖已安装两个Skill及FFmpeg。

示例Manifest将既有渲染视频明确登记为preserved-media，帧图绑定原v9 hash/帧号；这仅展示前端和108的实际画面。方向页图片是既有画面示例，不冒充新生成的Pro分镜。不给新一期预填用户判断，不继承108历史反馈，不把这7段文案、排版、画面顺序固定为后续默认。source-provenance.json保存来源与本轮授权范围。

完整播放器使用 `kind: example-preview` 的登记和 `example-media-checks` 回执，核实际派生文件hash、Manifest、源hash、整数帧窗口及解码/音频/PCM检查；页面明确显示“完整示例”。生产formal/技术直出的回执要求保持原样，例片不能借用完整v9回执或改其hash。

公共代码增量包仍为review-template-update；`audio-subtitle-roughcut/scripts/package_template.py --example <example_dir> --output <new.zip>`可额外包含本次授权示例，包内注明两者范围。分发前排除示例服务生成的feedback.json、附件、草稿和日志；不自动上传或发布。

### 独立短段

有已有独立短段时填下文 `pages[].review.versions`。从整片准备短段使用公共工具：

```bash
python3 skills/fred-remotion-output/scripts/prepare_review_segments.py \
  --manifest "$episode_manifest" --video "$current_video" \
  --output "$episode_dir/03_制作过程/review-segments/current" --label "当前视频"

python3 skills/fred-remotion-output/scripts/init_review_app.py \
  --manifest "$episode_manifest" --episode "$episode_dir" --update \
  --segment-index "$episode_dir/03_制作过程/review-segments/current/index.json"
```

`--segment-index`可重复，按当前、上一版顺序加入。工具按整数帧的准确窗口切片，默认720p用于审看；核帧数/fps、完整解码、音频存在与源hash，复用缓存时也核clip hash。它不改完整成片、不作最终合并，不能把审看片当正式4K成片。源必须与Manifest同fps的CFR。旧版本发生删段/改时长时，用 `--source-windows` 提供 `stableId -> {startFrame,endFrame}` 的旧源准确窗口，不能拿当前全局秒数盲切旧片。当前窗口与旧源窗口都留在index。无全局映射先补真实锚点，不猜0秒。

### 保存与恢复

公共台在本期 `03_制作过程/review-app/feedback.json` 原子保存，意见图片保存于 `images/`；localStorage只用于未同步草稿。多页面保存使用revision锁，409时不覆盖其他页面，也不丢本地草稿；刷新后展示磁盘意见与本页草稿供明确取舍，未采用的一份仍包含在导出中。刷新/切视图等待保存与图片上传；失败时保留当前页并显示原因。

每段绑定episodeKey、stableId、view、sceneIdentity以及实际资产hash/原文/时钟/当前音频。

**新版本沿用上一版判断（2026-10-12 Fred要求）**：页面更新到新版本后，每段自动沿用该视图上一版最后一次保存的判断按钮（待看/采用/需要调整/不采用）和方向页的制作方式/候选选择（候选已不存在时只保留制作方式）；上一版的文字和图片不再作为当前意见，只在“往期意见”里展开显示，当前意见框从空白开始。沿用的记录带 `inheritedFrom{version,updatedAt,choice,identityChanged}`，页面提示“已沿用上一版的判断”，内容已更新时另注明“请留意”。这样Fred不必每版重复点采用，也不必逐条说明哪些旧意见已处理。沿用的判断不是对新画面的新批准：Agent回填Manifest时，`identityChanged=true` 的段只能当作沿用标记，不能写成Fred已确认新图／新视频；Fred在新版本主动保存后才是本版意见。资产与语义身份未变的段另保留sourceVersion。

方向、静态、视频意见隔离，始终 `animationApproved=false`，keep加文字/图片仍提示待修改。

“导出意见”产生schemaVersion=2的公共台JSON，含三个视图的磁盘历史、当前浏览器草稿及所有图片data URL。“导入意见”核对episodeKey、视图与身份，恢复缺失记录；已有磁盘记录全部保留，不按客户端时间覆盖。版本不匹配的意见只作为历史。浏览器草稿未保存时先导出完整备份再继续；导入不是回填Manifest或修改技术回执。

路径由初始化器写成相对审看目录；同一期内部的媒体可随目录移动。若引用期外库媒体，移动整期不会搬动该库，仍须保持准确引用或在授权范围内复制并更新Manifest。公共代码不携带单期状态、私人绝对路径、密码或聊天。经Fred本轮明确授权，另附108真实片段作为示例数据，具体内容与启动见下节。

### 最终成片登记

`--final-registration <json>`选择真实交付索引，索引路径相对review.json，索引内路径相对索引文件。示例字段：

```json
{
  "videoPath": "../../02_最终输出/final.mp4",
  "receiptPath": "../qc/final-receipt.json",
  "manifestPath": "../../manifest.json",
  "videoSha256": "真实视频SHA256",
  "displayLabel": "当前成片"
}
```

登记后 `/final` 提供完整播放、Range寻址与下载。服务只接受本期02_最终输出中的MP4、当前Manifest、真实receipt的videoPath/videoSha256/manifestSha256和空errors；receipt为formal PASS，或既有final-technical-delivery PASS及真实direct-output授权、skipped-by-user和四项技术check。后者的authorization须与Manifest的workflow.authorization.source准确一致，不再硬编码108原句。未登记/回执不合/文件变化时显示待交付，不能用模板伪造PASS或动画认可。

## 静态HTML生成器（已有入口或单文件审看）

```bash
python3 skills/fred-remotion-output/scripts/build_segment_review.py \
  --manifest "$episode_manifest" --output "$episode_review_html" --view suggestion
```

`--view` 可选 `suggestion`（默认）、`keyframes`、`video`，只决定首次打开的视图，三个视图始终都在。页面放本期 `03_制作过程/segment-review/index.html`，既有入口可沿用。HTML 无 CDN，素材保留原位置，不复制。用已有浏览器打开本地文件。页面使用本机 file 链接，迁移后从 Manifest 重建。

原文从 `pages[].sourceSpans[].text` 完整提取；保留 `stableId`，排序不能改变它。真正拆分或合并使用新 ID 并保留旧页关系。顶层需要 `episodeKey`、`timelineFps`，可选 `title`、`timingStatus`。`aligned` / `audio-aligned` 显示录音对齐，`approved-manual` 显示人工确认，其余显示待核对。每段需要 `startFrame`、`durationInFrames`。左列时间、导出上下文和关键帧窗口统一使用 `workflow.scene_window`：优先 `globalStartFrame` / `globalVoiceStartFrame`；声明 `scene-local` 却没有全局锚点时显示“全片时间待映射”，不会把段内 0 冒充全片 0。

## 图文建议字段

助手先填建议和原因，不填虚构的用户选择：

```json
{
  "productionRoute": {
    "suggested": "remotion",
    "suggestionReason": "同一份内容经过筛选，保留对象能让观众看清判断过程。"
  },
  "storyboardReview": {
    "candidates": [
      {"id": "direction-a", "label": "同一对象连续推进", "imagePath": "storyboards/a.png", "sha256": "实际图片SHA256", "clipPath": "references/a.mp4"}
    ],
    "assistantRecommendation": {
      "candidateId": "direction-a",
      "reason": "与本句的输入、判断、结果关系一致。",
      "fixes": ["去掉辅助小字，按真实录音重排时序"]
    }
  }
}
```

`clipPath`、`clipSha256` 可省略；方向图必须是真实本地图片，`sha256` 必填且生成时校验。路线值为 `recording`、`remotion`、`generated-video`、`mixed`。也支持 `suggested: {"route": "remotion", "reason": "…"}`。

前端提供“我的制作选择”、逐候选选择和“这些方向都不选”；用户可通过意见说明混合方式、只选局部或沿用已有方向。主流程读取导出后，把准确选择及真实来源写回 `productionRoute.selected/source` 和 `storyboardReview.userSelection/status/confirmedSource`。页面本身不写入 Manifest。

如果 Manifest 已有用户选择，生成器把它保存在 `existingProductionRoute/existingUserSelection` 中。新一轮未选择不能覆盖已有决定，助手必须按本轮实际修改范围合并。

## 真实关键帧字段

```json
{
  "keyframeReview": {
    "contextSha256": "workflow.py为当前场景生成的签名",
    "sourceFiles": [{"path": "src/Scene.tsx", "sha256": "实际渲染源码SHA256"}],
    "frames": [
      {"id": "input-established", "path": "stills/input.png", "sha256": "实际图片SHA256", "timeSeconds": 12.4, "label": "输入建立，字幕同时出现"},
      {"id": "handoff-middle", "path": "stills/handoff.png", "sha256": "实际图片SHA256", "timeSeconds": 14.2, "label": "对象交接中间态"}
    ]
  }
}
```

`timeSeconds` 是全片时间，必须位于该段窗口中。每帧 ID 稳定且段内唯一；文件和 hash 必须相符。`sourceFiles` 保存这组画面实际使用的场景源码文件，生成器核对已提供的文件指纹。用下述命令取当前上下文签名，填入 `keyframeReview.contextSha256`；该签名与选择、时序、字幕、角标和媒体等关联，排除不相关段的字幕 cue。

```bash
python3 skills/fred-remotion-output/scripts/workflow.py \
  --manifest "$episode_manifest" --stage signature --scene-id "$scene_id"
```

图片先由实际源码生成；生成器不会将 GPT 方向图转称真实关键帧，也不能仅靠路径/hash 证明画面质量。用户确认后，主流程按真实导出或对话证据写 `status: confirmed` 和 `confirmedSource`，并保存 `confirmedFrames: [{"id": "input-established", "sha256": "确认时实际图片SHA256"}]`，保留未解决意见。`confirmedFrames` 记录用户当时看到的图像身份，不能在换图后随当前文件自动刷新；不要生成页面时预设确认。

## 视频字段

```json
{
  "review": {
    "status": "review",
    "note": "本轮修改了对象出口；请看与下段的衔接。",
    "versions": [
      {"label": "V2 · 当前视频", "path": "preview/scene-v2.mp4", "poster": "preview/scene-v2.jpg"},
      {"label": "V1 · 修改前", "path": "preview/scene-v1.mp4"}
    ]
  }
}
```

路径相对 Manifest，也可使用本机绝对路径；不接收远程 URL。视频可提供 `sha256`，生成器始终计算实际文件指纹，提供的值必须相符。`poster` 可省略，空 `versions` 显示待制作。这里的 `status` 是制作记录，不代表用户批准当前动画。

## 保存、导出与返修

长片按原逐段口播对应播放：每行可提供准确起止的独立短段文件和修改前版本，避免每行挂整条4K视频并同时预载/解码。按实际前端能力懒加载、限制并播并保留原行入口；用户要求逐行播放器时不擅自改成共享单播放器。段视频、关键帧、完整最终文件与版本标签分别核对hash和全局范围，不能用旧关键帧替代新视频的反馈。当前公共台的短段准备由prepare_review_segments.py执行；静态HTML生成器本身不自动切片。

静态HTML页面支持文字、粘贴图片、插入图片、图片放大、筛选和导出。判断使用“保留主体／需要修改／先跳过”。“保留主体”同时有非空文字或图片意见时，显示“保留主体，仍需修改”，不会自动变成最终批准。即使备注是表扬，是否属于明确认可仍由主流程结合原话判断，不由前端猜测。

每条反馈绑定 `episodeKey + stableId + view + itemId + identity`。`identity` 包含真实资产文件 hash、当前原文/时序和 `scene_review_signature`。换图、换素材版本或当前语义上下文改变后，本版判断置空；以前的文字和图片保留在历史中，不通过同名 `frame-01` 继承认可。三个视图各自保存，关键帧确认不影响视频判断。

以下保存说明及schemaVersion=5仅适用于静态HTML生成器；公共台使用上面的磁盘保存和schemaVersion=2。静态HTML的浏览器文字数据保存在 localStorage，意见图片在 IndexedDB。保持同一页面路径、浏览器和 episodeKey；file 与 localhost、不同端口/浏览器的存储不可视为共享。旧版审片页的数据保留为 `legacyFeedback`，不迁移成新画面认可。每轮操作后导出留档；当前页面没有导入功能。

### 容量失败与恢复边界

静态HTML的浏览器存储与公共台的磁盘服务器是不同能力；不要把HTML当作自动具备磁盘恢复/导入，也不要重新为每期写专用服务。长期多版本审看时先核对实际持久化实现，不把本期专用功能写成公共已支持。

- 保存须处理 `QuotaExceededError` 和图片写入失败，用户不能看到假的“已保存”。保留当前内存中的意见并提供实际可用的导出/备份方式，避免失败后继续操作覆盖唯一副本。
- 同一源码清单在多帧重复时可做无损引用去重，验证pack/unpack后逐条身份、文字、图文顺序、图片和历史完全一致；不能通过删历史或丢sourceFiles腾空间。
- 已实现本期文件备份时用临时文件、完整写入后原子替换；恢复按 `episodeKey/stableId/view/itemId/identity` 合并，不覆盖较新本地意见，也不把旧版选择转成新版认可。按真实能力执行，不新增强制换服务器流程。
- 更新入口前后核对记录、非空文字与贴图的身份/内容；恢复成功不能只数条目。取证JSON pointer允许对象键与数组索引，版本/原始文件hash继续核验，未知用户发言时间仍保持空值。

导出 `segment-review-feedback.json` 使用 `schemaVersion: 5`：

- 顶层 `episodeKey`、`exportedAt`、`records`、`legacyFeedback`、`savedToManifest: false`。
- 每条 `records[]` 保存 `stableId/view/itemId/identity`、`artifact`（图片、视频、候选的实际路径/hash）、`context`（原文、时间和上下文签名）。`current` 区分当前记录与历史。
- 助手字段为 `assistantSuggestion/assistantRecommendation`；用户字段为 `selectedRoute/userSelection/choice/note/content/images`。`userSelection` 含准确候选 ID 和图片 hash，全部不选为 `{ "decision": "none" }`。
- `needsChanges` 表示仍需处理意见；`approvalScope` 只说明方向、静态帧或视频审看范围。页面始终不自动宣称 `animationApproved`，也不编造 `confirmedSource`。
- 图文 `content` 保留光标顺序，意见图片以 data URL 导出；历史版图片同时保留。

助手必须读取本轮导出，核对实际资产和上下文再合并进当前 Manifest；只读 HTML 内的建议不算读过用户反馈。未选择、未填写不等于同意，也不能覆盖已有真实批准。对“保留主体但要改”先处理可判定的局部意见，再更新相应帧/视频；保留区不重新设计。动态短窗与整片声音/接缝检查继续按原门禁执行。

## 本地验证

```bash
python3 skills/fred-remotion-output/scripts/test_review_app.py
node skills/fred-remotion-output/scripts/test_review_server.mjs
```

公共台测试涵盖新episode/任意稳定ID、失败门禁不覆盖、更新保留磁盘状态、路径移动、Range、安全引用、并发、分视图失效、贴图全版本导入导出及最终回执身份。实际浏览器另检查媒体播放、切帧、音频跟随、编辑保存和移动布局。测试数据不是生产方案或实际动态认可。

```bash
python3 skills/fred-remotion-output/scripts/test_segment_review.py
node skills/fred-remotion-output/scripts/test_segment_review_browser.cjs
```

浏览器测试使用已有 Playwright，不自动安装依赖。它验证三视图、助手建议不预选、真实用户选择、图文导出、保留主体但仍需改、静态认可边界、同路径换图状态失效、历史保留与视频视图。测试 fixture 仅供工具验证，不是生产风格或分镜模板。
