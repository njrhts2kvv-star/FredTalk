# Fred 已选的 Remotion 参考、源码与依赖

后续从逐字稿做 Remotion、寻找常用组件或设计分镜时，先查询项目实体 `skills/fred-remake/assets/preferred-motion/catalog.json`。它记录 Fred 在选片台完成的选择；最新用户指令继续优先。

## 查找和使用

Library自选24条当前认可版以 `library-selfpick24-20261001` 查询；SP001–SP024均保留准确视频、源码、依赖和时钟。本批另12条为drop。用途与运行方式见[Library自选24条](../../fred-remotion-output/references/library.md)，保留旧集合选择，不将这次批次排除泛化到其他批次参考。

```bash
python3 skills/fred-remake/scripts/query-preferred-motion.py --query 提示词
python3 skills/fred-remake/scripts/query-preferred-motion.py --kind clips --episode 94
python3 skills/fred-remake/scripts/query-preferred-motion.py --status optional --query 镜头
python3 skills/fred-remake/scripts/query-preferred-motion.py --id preview-v2-talk-highlighter-sweep --full
```

默认只返回优先组件与喜欢的区间；`optional` 另查，`drop` 只用于核对排除。选片台 revision 变化时先更新参考目录。同名 Shotcraft / Talkmotion 版本不能互换。

1. 从本期逐字稿、录音与真实素材判断要表达什么，再匹配场景；不按编号轮换，也不要求用齐。
2. 播放命中的准确区间，读对应符号、源码、字体与依赖。理解运动关系后复制到本期适配，冻结源文件不原地修改。
3. 在本期现有分镜或 Manifest 记录 `referenceId / sourceHash / chosenRange / preserve / change`。旧文案、颜色、尺寸、时长、角标不自动成为本期默认值。
4. 按当前任务做代表镜头检查与成片验收。参考获选、源码存在、类型检查、动态一致及新片认可分别记录。构想不清楚时可用 H3 探索，已有明确参考和源码时可直接用 Remotion。

## 场景入口

| 需要表达的内容 | 优先入口 |
| --- | --- |
| 多条规则、方法、职责 | 原版点到矩阵、分支聚焦、展开返回；82 方法分支；93 记忆；已保留的流程组件 |
| 提示词、交接笔记、规则原文 | 94 FullPrompt / GlassPrompt；96 Notes；93 Agents；highlighter-sweep |
| 图片对比、局部证明 | 94 Comparison / Detail / targetLayout；同一对象替换与指定部分修改 |
| 电脑、手机与真实操作 | 82 标题窗口；93 Planning / Side / Tool；94 屏幕接管 |
| AI 输入和回答 | snap-prompt-send / snap-agent-steps / talk-chat-message-flow |
| 前后景和位置关系 | talk-rack-focus-pair / talk-grid-to-hero |
| 人物帮助讲解 | 当前保留的 Alpha 动作；93 抬手制止；保留透明视频，文字单独实现 |

## 选择边界

- `shot-cursor-flyover` 只喜欢镜头移动；`shot-particle-sand-fill` 仅参考柱状图。它们是备选。
- `shot-countdown-arc-scatter` 与 `shot-doc-park-left-pill-deal` 保留，`talk-` 同名版本排除；按完整 ID 和 hash 判断。
- E01首帧、E03多人光标、E17工作台接入和E19三分支已在r147排除；保留历史区间但不默认返回。
- 94 的三组选段绑定已下载核验的 V6；当前15个保留区间优先于早先口述范围。
- 93 的最终剪辑与源工程时间轴不同，源码按语义定位，适配前重对局部时间。
- 94 选段中的 32.167–39.967 秒和 222.6–237.6 秒为 V6 保留片；后者的原生运镜上游在 V5 `Sketch`。按 catalogue 的 `hybridBoundary` 区分实际播放与上游源码。
- 参考有 30fps、60fps 和源码内固定 FPS，改成新片 60fps 时先重映射秒与帧；只改 composition fps 会改变动作速度。
- 不把黑底、卡片、蒙版或紫色整体禁用。针对无职责底色、静止过久、无目的移动、拥挤、错误字体和残留蒙版返修；准确认可版本的有意设计按源参考保留。

## 实体与验证

- 原版实体仍在 `skills/fredtalk-deck-motion-pipeline/assets/style-library/`，最新偏好由本 catalogue 覆盖。旧查询默认叠加选择；历史审计可用 `--ignore-preferences`，不能把该结果当默认推荐。
- V2 当前41个优先/备选组件原代码、共享代码、字体、public、原预览和来源记录保存在 `assets/preferred-motion/sources/previews-v2/` 与 `previews/`。组件正文保持源字节，只过滤注册表和 manifest；共享素材保守保留，不是最小包。
- 两套依赖隔离：原库 Remotion 4.0.519 / React 19.2.3；V2 Remotion 4.0.473 / React 19.2.4，实体 runtime 为 `skills/_runtime/remotion/preferred-motion-v2/`，固定直接版本和 package-lock，不升级另一套。
- episode 视频和代码仍在各自事实源，通过路径、hash、准确区间与符号引用；不复制完整成片制造第二份最终文件。
- 四期源工程 import 与 public 素材清单见 `assets/preferred-motion/episode-dependencies.json`，按当前源路径和校验值核对，不只保存单个 TSX。
- `verification.json` 说明本轮检查范围。类型检查和 bundle 不证明动态场景实现一致；本轮是偏好整理与源保留，没有把所有源码抽成参数化公共 API。

以后 Fred 修改选择时，读取新 revision、保留原快照，再更新目录；不能把 AI 建议或新渲染自动标为 Fred 已选。

## Library 新 10 期已确认场景实现

`library-remakes-new10-20260928` 收录当前获 Fred 整体认可的 53 条活动成片，N052 暂缓。按文字、逻辑、窗口、图片、文档与聚焦分类查询，具体参数与边界见 [Fred Remotion 输出分类索引](../../fred-remotion-output/references/library.md)。以当前文件 hash 定位认可范围，换内容须重新对照。
