# 组件集合索引

所有已认可组件集合的唯一入口：查询命令、说明文档和入库/发布记录。选型时先用 `scene.py --candidates-only` 或 `references.py --query` 按内容检索（默认覆盖下表全部集合，已归档项除外）；只有需要指定集合时才用 `--collection`。

| 集合 | 编号 | 说明 | 查询 |
| --- | --- | --- | --- |
| Library 新 10 期复刻 | N/X | [分类索引](library-new10-confirmed.md) | `--collection library-remakes-new10-20260928` |
| Library 旧库 81 条 | L81-* | [旧库 81 条](library-legacy81-confirmed.md) | `--collection library-remakes-legacy81-20260929` |
| Library 自选 24 条 | SP001–SP024 | [Library 自选 24 条](library-selfpick24-confirmed.md) | `--collection library-selfpick24-20261001` |
| 第 102 期精选 | 102-01…07 | [第 102 期](episode102-selected.md) | `--collection ep102-selected-20261005` |
| 第 103 期精选 | 103-01…03 | [第 103 期](episode103-selected.md) | `--collection ep103-selected-20260930` |
| 第 107 期精选 | 107-01…05 | [第 107 期](episode107-selected.md) | `--collection ep107-selected-20260930` |
| 第 109 期精选 | 109-01…06 | [第 109 期](episode109-selected.md) | `--collection ep109-selected-20261006` |
| 新增精选 14 条 | OP/EX/RC/HD | [新增精选](expansion-selected.md) | `--collection expansion-selected-20261007` |
| 交互组件（参数化） | INT01–INT04 | [交互组件](interaction-components.md) | `--collection interaction-components-20261007` |
| 3D 录屏运镜（参数化） | CAM01–CAM05 | [3D 录屏运镜](screen-camera-selected.md) | `--collection screen-camera-selected-20261007` |
| 新闻关键词快闪 | NMC01 | [新闻快闪](news-keyword-match-cut.md) | `--collection news-keyword-match-cut-20261010` |
| Fred 新做组件（参数化） | T01d–T20a 共 16 条 | [新做组件](fred-native-components.md) | `--collection fred-native-16-20261012` |
| 第二轮组件（参数化，kit v2） | 42 条 | [第二轮组件](fred-wave2-components.md) | `--collection fred-wave2-42-20261012` |
| 第二轮返修 5 条 | T05b2/T09e/T14b/T15b/T18b | [第二轮组件](fred-wave2-components.md) | `--collection fred-wave2-fix5-20261012` |
| 第三轮补充精选（参数化） | 2 条 | [补充组件](fred-wave3-extra-components.md) | `--collection fred-wave3-extra2-20261012` |
| 第三轮精选组件（参数化） | 40 条 | [第三轮组件](fred-wave3-components.md) | `--collection fred-wave3-40-20261012` |
| 116 期场景组件（原样入库） | T20g/T19e/T12j/T18g/T09p | [116 期场景](ep116-scenes-components.md) | `--collection ep116-scenes-20261013` |
| 章节动画与内容过渡 | T12k–T12t、T20h–T20q 共 20 条 | [章节与过渡组件](fred-chapter-transitions.md) | `--collection fred-chapter-transitions-20-20261014` |
| 章节过渡第二批 | T12u–T12x、T12z、T23a–T23d 共 9 条 | [章节过渡第二批](fred-chapter-transitions-wave2-20261014.md) | `--collection fred-chapter-transitions-wave2-20261014` |
| 录屏与界面操作新组件（参数化） | T08l、T09q–T09t、T09v、T09w、T09z 共 8 条 | [录屏新组件](fred-recording-components-20261018.md) | `--collection fred-recording-8-20261018` |
| 112–125 期场景组件（原样入库） | T01j–T22g 共 47 条 | [112–125 期场景](episode-scenes-112-125-20261018.md) | `--collection episode-scenes-112-125-20261018` |
| 历史组件返修版 | `<原编号>-v2` 共 32 条（替换原版） | [历史组件返修版](fred-legacy-fix-20261018.md) | `--collection fred-legacy-fix-20261018` |
| 原版精选 / Library→Fred | C/B/V/E | [精选参考库](selected-reference-library.md) | `--source original` 等 |

Library 原片的对象交接、镜头尺度、录屏拆层或文字接力见 [Library 镜头语言](library-shot-language.md)。归档清单见 [精选参考库](selected-reference-library.md)：2026-10-06 两批共 44 条，2026-10-12 按 Fred 逐个取舍又归档 51 条（`user-archive-51-20261012`）。2026-10-18 返修取舍：32 条返修版替换原版（原版按 superseded 归档），另归档 11 条（`user-archive-11-20261018`）。归档项保留原文件，默认不调用。

新集合入库时：在本表加一行，在 `visual-usage-registry.json` 补齐 `primaryUse/useIds/conceptIds/inputObjects/action/tags/scenarioId`，并跑 `test_library_matching.py`；不要在 SKILL.md 正文追加公告。

缺口、参数化候选与变化维度的扩充计划见[组件库扩充计划](library-growth-plan.md)（待 Fred 逐项认可）。

## 入库与发布记录（原 SKILL.md 正文，原文保留）

Library自选24条最新revision04已按本轮认可接入视觉库与Skill，准确视频、动作核心帧、源码和独立入口见[Library自选24条](library-selfpick24-confirmed.md)，按 `--collection library-selfpick24-20261001` 或 `--id SP004` 查询。这批reference creator12条已排除；按当前内容适配Library已认可场景，原生时钟和固定媒体边界从每条记录读取。

第103期用户已选三个场景组件（6–9秒、52–56秒、57–69秒），准确4K60视频、完整源码及独立运行入口见[第103期已选组件](episode103-selected.md)，按 `--collection ep103-selected-20260930` 检索。

第107期最终R7的五个用户精选场景组件，准确区间、4K60视频、完整源码与独立入口见[第107期已选组件](episode107-selected.md)，按 `--collection ep107-selected-20260930` 检索；第一段按原话的当前解释保存为9–12秒。

已确认 Library 新 10 期复刻按[分类索引](library-new10-confirmed.md)检索。52 条当前可用成片、源码与素材在项目实体；N017 已按 2026-09-30 要求移除，N052 暂缓。[Library 旧库最新 81 条复刻](library-legacy81-confirmed.md)已按七种画面用途分类，并保留每条当前成片的三个核心帧、视频哈希和源码快照。要参考 Library 原片的对象交接、镜头尺度、录屏拆层或文字接力，读[Library 镜头语言](library-shot-language.md)，按本期内容选动作。两批新内容适配仍需实际短样检查。

第102期七段用户精选组件已单独保存到本地Skill与视觉库，范围为15–19、44–50、55–62、64–72、108–115、162–175、395–403秒。按 `--collection ep102-selected-20261005` 检索，准确源码、时钟与新增时间见[第102期已选组件](episode102-selected.md)。新增于2026-10-05 11:47:11（北京时间），同日12:58:16已按Fred后续授权发布到GitHub与[Fred-fu视觉库](https://www.fred-fu.com/visual-library)；实际回执保存在集合`publication.json`，原新增时间不变。

第109期六段最新用户精选已登记到本地Skill与视觉库：0–2、20–27、54–65、70–74、107–110、131–136秒。按`--collection ep109-selected-20261006`查询，准确源码与复用边界见[第109期已选组件](episode109-selected.md)。PG-Adobe-01/N054/N023/SP021已按用户本轮要求归档并指向109-01/02/04/05，旧资产和批准历史保留。

第109期这六条已按Fred后续要求于2026-10-06T22:26:01+08:00发布到[网站视觉库](https://www.fred-fu.com/visual-library)，新增时间仍为2026-10-06T21:39:00+08:00；公开源码是独立分发副本，本地认可源不改，本次GitHub未发布。

用户指定22条已归档，视觉库在末尾保留浏览、本地默认不调用；见[当前归档清单](selected-reference-library.md#2026-10-06-用户指定22条归档user-archive-22-20261006)。归档事件`user-archive-22-20261006`独立于旧认可。

用户指定22条已归档，视觉库在末尾保留浏览、本地默认不调用；见[当前归档清单](selected-reference-library.md#2026-10-06-第二批22条归档user-archive-22-b-20261006)。归档事件`user-archive-22-b-20261006`独立于旧认可。

2026-10-07新增14个用户精选已登记到本地组件库。保留OP/EX/RC/HD原编号，按`--collection expansion-selected-20261007`查询；准确源码、参数和使用边界见[新增精选组件](expansion-selected.md)。OP组为画面呈现与交接效果，不登记为已认可开头吸睛方案。

本轮14条精选组件已于`2026-10-07T08:45:24+08:00`发布到[网站视觉库](https://www.fred-fu.com/visual-library)。准确新增时间保留，本地与公共源码副本独立，GitHub本轮未更新；回执见[新增精选组件](expansion-selected.md#网站发布2026-10-07)。

2026-10-07 Fred选定的新闻聚焦、Codex全貌操作和可编辑微信已存入同一Skill的[交互组件组](interaction-components.md)。按`--collection interaction-components-20261007`或INT01–INT04查询；包含四类实际源码与六个预览，新闻支持同步／camera-first，本集合Codex示例保留109播放版，微信中性文字可编辑。保留的动作认可与新增时序/内容验收分开，已按后续授权发布到网站视觉库，准确回执见集合publication.json；GitHub未更新。

2026-10-07 Fred明确认可五条3D录屏运镜组件，已按`--collection screen-camera-selected-20261007`、CAM01–CAM05登记到同一组件索引。准确源码、预览与适配边界见[3D录屏运镜组件](screen-camera-selected.md)：保留多目标平滑换焦，到位后成组强调，Codex输入发送回复，以及白底后倾由下往上角度。复用先分析本期内容：3D用于让平面内容的位置、层次和操作关系更直观；每次移动有信息落点，阅读处停稳、路过处连续通过，源滚动与成组突出绑定真实口播。详见该参考的内容编排规则；示例角度/次数/时长不固定套用，当前源码不自动理解录音。五条已于2026-10-08发布到网站视觉库及GitHub FredTalk 1.5，原新增时间和认可范围保持。

FredTalk 1.5已于2026-10-08发布：补齐29类近期组件，新增五条3D录屏运镜，网站版本提示与GitHub源码/素材同步。展示名称为FredTalk 1.5，技术调用标识fred-remotion-output保持。发布记录见上述各集合参考。

2026-10-10 Fred认可V9[新闻关键词快闪组件](news-keyword-match-cut.md)，编号NMC01，集合`news-keyword-match-cut-20261010`。采用imagegen生成变化的新闻四宫格→裁剪与字形锚点对齐→统一轻微放大和柔和阴影→快切渲染与切点音效；保存准确12页素材、1.6秒认可样片、原约1.03秒快闪测量、音效及可调用FFmpeg/Remotion源码。新词需重新生图与量测，换时序须重建音效cue；本集合已按后续授权于2026-10-10发布到网站视觉库，原新增时间和认可范围保持，公开源码为独立分发副本；GitHub本轮未更新。

2026-10-12 Fred 认可新做的 16 条参数化组件入库（T21c 行动号召不要），覆盖录屏操作、对比、开场、章节、数字、观点、比喻、代码配置、产品和人物。按 `--collection fred-native-16-20261012` 或 T09a、T05c 等编号查询；源码、props 和已知局限见[新做组件](fred-native-components.md)。仅本地登记，未发布网站或 GitHub。

2026-10-12 第二轮扩充入库 42 条参数化组件（kit v2：口播时间点、进出场交接），其中 18 条替换原版（原版归档不删）。T05b2、T09e、T14b、T15b、T18b 返修后已另行入库（`fred-wave2-fix5-20261012`，T05b2 替换 T05b）。说明见[第二轮组件](fred-wave2-components.md)。仅本地登记，未发布。

2026-10-14 [章节动画与内容过渡20条](fred-chapter-transitions.md)随 FredTalk 2.1 发布到网站与 GitHub目录／公开样片。10章节、T20i/T20j开场可用、其余8条主要过渡；源码／原视频／ZIP在北京时间2026-10-14 08:59:11至2026-10-28 08:59:11由专属会员优先下载，到期网站自动开放。旧五批日期保持，准确回执见集合publication.json。

2026-10-18 组件库扩充入库三个集合：录屏与界面操作新组件 8 条（`fred-recording-8-20261018`）、112–125 期场景 47 条原样入库（`episode-scenes-112-125-20261018`，23 条按规则改色）、历史组件返修版 32 条（`fred-legacy-fix-20261018`）；同时归档 11 条。预览都是 Fred 认可的 1080p30。仅本地登记，未发布。

2026-10-18 FredTalk 2.5 已发布：47 条场景、8 条录屏、9 条章节过渡在北京时间 10 月 18 日 12:57:11 至 11 月 1 日 12:57:11 专属会员优先，32 条历史返修立即公开。下文旧的本地入库记录保留为发布前历史；当前分发以本次说明与 catalog 为准。
