# 逐段审看：建议、真实关键帧、视频

同一期沿用一个页面、同一份当前 Manifest，分成三个视图。它规定协作方式，不规定镜头数量、构图模板或每期必须出多少张图。

1. **图文建议**：助手先按逐字稿提出制作方式、原因和画面方向；Fred 选择或改动。助手建议不会预先勾成用户选择。H3、Seedance 等生成视频都可归入 `generated-video`，具体工具及既有外部素材由本段方案说明。
2. **真实关键帧**：用准备继续制作的实际 Remotion 源码生成图片，连同当前字幕和角标一起看。每帧有完整原文、时间、图片和可填写的图文意见；确认只覆盖这张静态画面。关键帧按语义、稳定阅读态、关键运动中间态及接缝选取，不固定 140 张或均匀抽样数量。
3. **视频审看**：方向和关键帧处理后看正常速度视频，检查节奏、声音、运动和衔接。当前视频排第一，历史版本可展开。静帧通过不能证明动态通过。

三列固定为逐字稿／当前视图的真实素材或建议／用户选择与修改意见。已有明确选择、有限返修、当前直出授权按主流程处理，不为了此页面重新询问。路线、候选方向与实现的关系见[路线与分镜选型](route-and-storyboard-review.md)。

## 生成页面

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

页面支持文字、粘贴图片、插入图片、图片放大、筛选和导出。判断使用“保留主体／需要修改／先跳过”。“保留主体”同时有非空文字或图片意见时，显示“保留主体，仍需修改”，不会自动变成最终批准。即使备注是表扬，是否属于明确认可仍由主流程结合原话判断，不由前端猜测。

每条反馈绑定 `episodeKey + stableId + view + itemId + identity`。`identity` 包含真实资产文件 hash、当前原文/时序和 `scene_review_signature`。换图、换素材版本或当前语义上下文改变后，本版判断置空；以前的文字和图片保留在历史中，不通过同名 `frame-01` 继承认可。三个视图各自保存，关键帧确认不影响视频判断。

浏览器文字数据保存在 localStorage，意见图片在 IndexedDB。保持同一页面路径、浏览器和 episodeKey；file 与 localhost、不同端口/浏览器的存储不可视为共享。旧版审片页的数据保留为 `legacyFeedback`，不迁移成新画面认可。每轮操作后导出留档；当前页面没有导入功能。

### 容量失败与恢复边界

生成器的浏览器存储与某期专用服务器是不同能力；公共页面目前不自动具备磁盘保存、启动恢复或导入。长期多版本审看时先核对实际持久化实现，不把本期专用功能写成公共已支持。

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
python3 skills/fred-remotion-output/scripts/test_segment_review.py
node skills/fred-remotion-output/scripts/test_segment_review_browser.cjs
```

浏览器测试使用已有 Playwright，不自动安装依赖。它验证三视图、助手建议不预选、真实用户选择、图文导出、保留主体但仍需改、静态认可边界、同路径换图状态失效、历史保留与视频视图。测试 fixture 仅供工具验证，不是生产风格或分镜模板。
