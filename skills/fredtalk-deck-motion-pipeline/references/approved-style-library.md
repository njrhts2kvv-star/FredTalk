# 已认可动效、源码与媒体依赖

**后续默认选择先查 [Fred 最新已选参考](../../fred-remake/references/preferred-motion.md)**，实体为 `skills/fred-remake/assets/preferred-motion/catalog.json`。它覆盖旧库推荐范围，包含新增 V2 参考和四期精确片段。旧查询默认叠加偏好，`--ignore-preferences` 仅用于原始来源审计。

公共实体位于本 Skill 的 `assets/style-library/`。历史源集合是 55 条原版：43 条有布局/场景代码，1 条为原生开头加烘焙后段，11 条为透明人物媒体。它们是保留的来源记录，不代表最新默认推荐范围。

## 选择和检查

从项目根执行：

```bash
node skills/fredtalk-deck-motion-pipeline/scripts/list-approved-styles.mjs --query 聚焦
node skills/fredtalk-deck-motion-pipeline/scripts/list-approved-styles.mjs --topology branch-and-focus
node skills/fredtalk-deck-motion-pipeline/scripts/list-approved-styles.mjs --id reference-v12-v4-02-module-split
node skills/fredtalk-deck-motion-pipeline/scripts/verify-motion-library.mjs
node skills/fredtalk-deck-motion-pipeline/scripts/check-motion-sources.mjs --output <process-qc/source-check.json>
```

查询默认只返回当前集合，按 `referenceId` 或已精确匹配的 `approvalId` 定位；A01–A55 只在当前 collectionId 内有效，不使用裸 compositionId 猜版本。查询返回原视频、具体版本源码入口、public 目录、依赖清单、认可范围和待验证项。先播放相关真实视频，再读源码；已有本轮审看记录可复用。

| 需求 | 查询 topology 的起点 |
| --- | --- |
| 多项展开后聚焦 | branch-and-focus / expand-and-return |
| 从局部到整体 | dot-to-grid / tree-to-flow / word-grid |
| 同槽变化和结论 | counter-slot / phone-counter / module-split-conclusion |
| 前清后虚 | diagram-defocus / formula-focus / single-stage-focus |
| 跨场承接 | shared-canvas / materials-to-results / result-to-teaching |
| 人物与观点 | character-text-cue；媒体本身为 alpha-character |
| 章节进入 | chapter-transition |

这些是语义入口，不能随机轮换或要求新片用齐。关系线、窗口、胶囊、人物都按内容职责使用，不整体禁用或强制添加。当前表面、颜色、正文和字幕约定见 [内容对象](../../fred-remotion-output/references/content-objects.md)。

## 状态分开

- `confirmed-current`：用户认可该原版作为参考；不代表新文案、改编组件或新成片已获认可。
- `componentReadiness`：有源码、媒体依赖、局部原生或历史源码映射待核。历史试渲染只覆盖关键帧，不冒充全片动态一致。
- `fullMotionParity: not-verified`：完整过程未被证明一致。A11 的参考片段认可有效，但候选历史源码必须先核对；A41 必须保留混合边界。
- 五条后续 Story 新编排不属于这 55 条原版集合，不能用其新 primitives 替代准确原代码。

同 composition ID 的不同版本保留各自 hash 与 sourceFiles。原版冻结；适配前复制所需代码，保持独立版本与新 QC。提取后不要覆写原参考。

## 依赖组织

`approval-ledger.json` 是当前选择和历史决定的来源，`library-manifest.json` 带台账 hash；读取时会拒绝过期索引。旧库的历史决策保留在 ledger.historicalDecisions；`--status historical` 只返回单列的不可选历史记录，`--status all` 同时展示，两者都不把历史批准升级为当前集合。未选外部原素材不因此删除。

`runtime/dependencies.json` 登记实际导入的文件 hash。代码采用相对 import 闭包，动态 public 名称暂按选中工程的 public 目录保守保留，不能声称已得到绝对最小包。重复字节使用本地硬链接；这些依赖是冻结素材，改造时复制，不能原地编辑链接文件。已有 11 条人物通过 hash 复用 `fred-remake/assets/characters/` 的实体。

`runtime/originals/` 与 `runtime/remotion/archive-entries/` 用于准确源版本研究和重建，不是可直接整套带入新期的生产 Root；原 Root 可包含同源未选分支，新片只提取实际所需组件与资源。新代码不依赖全局 Skill、外部旧项目、剪贴板路径或旧绝对路径 render 脚本。

原版包使用 Remotion 4.0.519 / React 19.2.3；隔离验证运行时位于 `skills/_runtime/remotion/approved-motion-library/`。不要升级既有通用运行时以迁就它。

## 维护

`sync-approved-style-library.mjs --source <archive> --plan <explicit-selection.json> --library <new-staging-directory>` 导入已明确选择的来源；plan 包含 collectionId、认可证据/范围、assets、jobs 与 runtimeDependencies。工具拒绝覆盖已有库。先核对来源 hash、运行 verify 和相关 bundle/组件检查，再切换项目实体和全局注册。不能从旧“保护集”盲目恢复用户后来未选的默认项。

H3 借用已选片段的运动职责；Remotion 读取对应源码和状态。共同使用 [动态交接合同](../../fred-remake/references/h3-handoff.md)。库可用不意味着 H3 已收到附件，也不授权自动上传或消耗额度。
