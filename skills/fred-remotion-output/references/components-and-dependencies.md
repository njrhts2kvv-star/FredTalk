# 已选方案与代码依赖

首次取用依赖时读本文件；后续只读取当前所选源码。先由 `scene.py` 明确当前场景，再用 `references.py --query 完整提示词 --scene-type prompt-reading --limit 3` 查少量候选；附加效果通过 `--with` 显式加入。限定场景时guidance只含适用规则；普通查询只展开直接相关规则，旁支仅列relatedGuidanceIndex，不逐项通读。原话争议用准确F编号追溯。历史规则不修改选片选择，不把87期宽泛认可变成新增选片。

当前前端清理版与冻结原版有时是不同源码。检索结果的 `currentVersion` 给出当前前端源码、公用素材、准确项目包、runtime、compositionId及局部 `sourceWindow`；`execution` 是原登记场景入口，两者按本次实际取用版本记录。整期选段的 `sourceExecutions` 是源码映射，不冒称整段有通用参数接口。复制后适配，`referenceChoices.source` 指向实际选用的版本/hash，不能仅复制旧编号。当前版本按 `assets/dependency-registry.json` 绑定，依赖核验与本期调用校验都消费该绑定；取舍、原片认可和新适配检查范围保持。

## 一份选择事实源，多种候选能力

`skills/fred-remake/assets/preferred-motion/catalog.json` 保存最终选择，新的 `assets/dependency-registry.json` 只绑定源码与依赖，不复制另一份可独立修改的批准台账。revision 或 catalogue hash 变化时先核对新选择，不沿用旧索引。

数量与状态从当前 catalogue 的 counts 读取，不在文档硬编码会变化的总数。本轮 Library→Fred 的新增与合并见 [已选参考与去重](selected-reference-library.md)。它们都是服务新稿的候选；`keep` 意味着优先查找，不能据此强制每期使用。用户后续指定的画面优先。

```bash
python3 skills/fred-remotion-output/scripts/references.py --query 分支
python3 skills/fred-remotion-output/scripts/references.py --kind clips --episode 94
python3 skills/fred-remotion-output/scripts/references.py --status optional --query 镜头
python3 skills/fred-remotion-output/scripts/references.py --id preview-v2-talk-highlighter-sweep --full
```

`--scene-type`先过滤实际候选再应用`--limit`。数字别名可以检索到保留代表；精确ID返回排除/合并记录时仅供审计，有canonicalId则改取代表。

结果提供准确 ID、原版预览、选择范围、源码符号、原路径、已保存源码路径、入口/public/依赖和已知限制。默认不推荐 `drop`，只有明确核对排除时查 `--status drop`。同名不同库或版本不互换。

当前前端的最新排除与合并从 `tools/fred-motion-picker/web/library.js` 同源读取，作为历史catalog的当前检索视图；默认不返回已排除或合并项。准确旧编号可解析到唯一保留代表，局部T/W动作点名查询保留原动作方法并给出 `libraryMergedInto`。同一例片可被不同用途索引引用，不因共享短片删除独立能力；只有完整内容、运动和区间重叠才收拢卡片。取舍时优先已有认可、完整动作、真实源码入口及依赖，保留历史文件；同编号而字体、布局、素材或动作不同的版本需逐项判断。

## 已保存什么

| 类型 | 项目实体入口 | 使用方式 |
| --- | --- | --- |
| 原版源码与共享依赖 | `skills/fredtalk-deck-motion-pipeline/assets/style-library/` | 原版代码、准确预览、透明人物；已保存不等于当前被选择，资格以catalogue为准 |
| V2源码与公共素材 | `skills/fred-remake/assets/preferred-motion/sources/previews-v2/` | 原组件正文保持字节一致；当前优先/备选/排除集合由catalogue查询，字体、共享代码、public与预览本地保存 |
| 已保存的episode源码与工程依赖 | 本 Skill `assets/episode-code/` | 保存82、93、94 V5/V6、96 V14/V15等准确版本的依赖快照，含相对import与public；具体范围按registry查询，不依赖历史iCloud工程读取代码 |
| Library→Fred源码包与文件架 | 本 Skill `assets/reference-code/library-fred-20260913/` | 保存准确源码、依赖、历史编号和合并别名；当前文件架由catalogue派生，历史批次数量不表示当前可选库存 |
| 新增 Library R 编号复刻 | 本 Skill `assets/reference-code/library-remakes-20260916/` | faithful/purple 准确版本、完整 public/字体与预览；隔离 runtime 4.0.515。按[新增复刻选型](library-remakes-reuse.md)查用途、真实接口、轨迹/截图依赖及待复看状态 |
| Library 旧库最新 81 条 | 本 Skill `assets/reference-code/library-remakes-legacy81-20260929/` | 当前视频、逐条哈希、对应源码快照和素材；R005、R033、B072 为最新本地返修。按[本批索引](library-legacy81-confirmed.md)检索，复制所选项目的锁文件后适配 |
| 可适配的基础能力 | `skills/fred-remake/assets/content-motion/` | SoftSurface、TranscriptSelection、BranchFocus、ExpandReturn、SlotReplace、FrostedFocus、ObjectHandoff 等；使用前读实际接口和验证状态 |
| 云端执行能力 | `skills/cloud-render/` | 复用 snapshot、render、guard、verify 与环境说明；不保存凭据或复制另一套渲染器 |

完整 public 保守保存以覆盖动态资源名，部分资源服务未选镜头，不声称最小包；未选分支不会因依赖保存而变成已认可方案。图片、音频和旧文案是准确参考重建所需的示例内容，不是新一期的默认素材。

源码与素材按 hash 去重为项目内实体硬链接。它们是只读基线；适配时 `copy` 到本期，不能写回硬链接 inode。新片只复制实际选用的代码与媒体，不把整个公共依赖库上传云端。

## 版本与实际调用边界

- 82/93/94 和保存的 episode 源核验使用隔离的 `skills/_runtime/remotion/approved-motion-library/`，Remotion 4.0.519 / React 19.2.3。V2 使用 `skills/_runtime/remotion/preferred-motion-v2/`，Remotion 4.0.473 / React 19.2.4。新工程选定一套实际可用版本，跨版本复制先做构建与代表镜头检查，不升级所有旧工程。
- 82 选片首条为 0–0.02 秒，仅能证明首帧喜好。
- 93 最终剪辑时间与源工程不同，选片秒数不能直接作为源 composition 的帧值。
- 94 V6 在累计 31.7–39.966667 秒和 222.6–237.6 秒保留视频；后者设备推进的原生上游是 V5 `Sketch`。查询保留 `hybridBoundary`，不能把同名 V6 函数存在视为其实际入片证据。
- 96 使用选片绑定的 A14/B15；源码中的后续段落存在不意味着本轮重新选择了它。
- `shot-cursor-flyover` 仅参考镜头移动，`shot-particle-sand-fill` 仅参考柱状图，两者为备选。保留的 `shot-countdown-arc-scatter` / `shot-doc-park-left-pill-deal` 不能换成被排除的 `talk-*` 版本。

代码的准确归因与实际调用记录见[从内容到组件](content-to-component.md)。看过参考、复制过文件和成片实际使用是不同事实；不得用不相关编号描述新写效果。

## 参数化的标准

具体已有接口、四类成熟度和固定条件见[组件复用图谱](component-reuse-map.md)；新设计的语义与外观按[DESIGN.md](../DESIGN.md)。参数化不是只加width/height：文字/数量变化要重新布局，录音变化要重绑cue，换分辨率则在逻辑舞台统一缩放。

有源码就先用，不每次从描述重写。需要成为通用组件时，按实际接口拆出本期数据：

| 能力 | 应由调用方提供 | 原版必须保留的关系 |
| --- | --- | --- |
| 全文聚焦 | 完整文本、字符范围、cue、视口、阅读保持 | 文字/承载/高亮同组变换，当前焦点连续接下一焦点 |
| 图片对比 | 原图、归一化 ROI、对比顺序、标签、时序 | 来源关系与同轮几何，主次交换后可读 |
| 设备接管 | 媒体、屏幕 bbox、全局/局部时钟、起终相机 | 外壳/裁切/内容同步，视频时间连续 |
| 分支与步骤 | 节点文本、关系、选中项、cue | 对象先后与因果，初态没有端点残留 |
| 人物提示 | 已选 Alpha 源、有效入出点、位置与指向 | 原始动作身份、手势与文字/口播配合 |

准确原版、通用适配、新一期组合分别记状态。只有源保存与打包通过时写“源码可读/构建通过”；没有实际新内容的短样，不写“同质量通用组件已验收”。本 Skill 完整串起制作判断与依赖调用，不把所有单期代码冒充已经封装好的稳定 API。
