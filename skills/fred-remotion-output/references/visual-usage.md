# 按制作任务调用视觉库

前端 `http://127.0.0.1:3061/design/#library` 与 AI 检索共用 `visual-usage-registry.json`。用途来自实际载体、动作和输入，不从示例口播文案推断，也不把来源集合当用途。一个场景可以承担多个任务。

| 用途 ID | 制作任务 | 选型时核对 |
| --- | --- | --- |
| explain | 讲解15–20秒内容 | 分几步建立、阅读、收束；原片时长与本期cue分别保存 |
| recording-focus | 录屏蒙版、放大、失焦、高亮 | 实际ROI、连续媒体时钟、前景与背景关系 |
| images | 图片与作品展示 | 横竖比例、裁切、作品顺序与阅读时间 |
| video-entry | 录屏、视频入场 | 全屏、窗口、设备之间的内容交接与音轨 |
| handoff | 前后内容交接 | 上段终态、下段首态和同一对象身份 |
| data | 数值、图表 | 真实数据、单位、共同尺度；只有数据承担解释职责时使用 |

```bash
python3 skills/fred-remotion-output/scripts/references.py --use explain --query '讲解一段20秒' --limit 3
python3 skills/fred-remotion-output/scripts/references.py --use recording-focus --query '录屏蒙版' --limit 3
python3 skills/fred-remotion-output/scripts/references.py --use images --query '图片作品展示' --limit 3
python3 skills/fred-remotion-output/scripts/references.py --source ep103
python3 skills/fred-remotion-output/scripts/references.py --source ep107
python3 skills/fred-remotion-output/scripts/references.py --source library24
```

`matching` 包含 `useIds`、`sourceId`、`inputObjects`、`action`、`segmentRole`、`nativeDurationSeconds` 和 `adaptation`。这说明候选承担什么任务，不意味着任意内容参数接口已验证。3–6秒的短片不能直接宣称是现成20秒模板；按本期口播重排阅读窗口和cue，保留完整成熟动作。

`componentPlan.query` 描述具体对象与动作，可附 `use` 与 `source` 缩小范围。`scene.py` 单场景包会带出同源用途、输入与适配说明；准确调用仍用返回的 `references.py --id ... --full`，检查 `currentVersion` 的入口、public、runtime、源码和完整ZIP。

来源单独保留：原版、V2、Library→Fred、新10期、旧81条、Library用户精选24条、第103期、第107期、整期选段、局部动作。选片状态、准确ID和原来源身份仍由canonical catalog管理。

图表的 B062 / L81-B062、B069 / L81-B069、W08 / L81-W08 为同动作不同修订。默认显示当前主代表，其他版本在卡片内展开；搜索准确ID或筛来源时可直接查看。全部版本保留，不改变keep、drop或review身份。

色彩按 [DESIGN.md](../DESIGN.md) 的实际承载面选择。深底前景紫色用 `#D6BEFF`，浅底保留准确源；仅改可编辑前景，媒体像素和正常视频保持。当前色彩修订与字体修订分别保存，原版快照保留。

## 已确认去重

2026-10-02 用户确认72组推荐，78个重复入口归入 `visual-usage-registry.json` 的 `confirmedMerges`。当前默认184个方案；原资产和批准历史保留。前端默认隐藏已合并项，AI默认检索排除；旧过渡/文字编号返回较新代表场景的准确源码，不把旧短片帧区间套在新版上。确认记录见 `30_工具输出与实验记录/skill-audit-20261002/library-dedup/applied-decisions.json`。


## 具体使用场景（2026-10-02）

前端由5个方向展开17个场景，单条当前参考指定一个主要场景；复合用途继续查原 `useIds`。共享 registry 的 `scenarios` 定义场景标题、职责与 groupId，entries 使用 `scenarioId/scenarioTitle`，match_metadata 将标题纳入检索标签。AI可按「局部放大与标注」「并排比较结果」「解释步骤与流程」等准确短语查询。当前184条全部归类，历史隐藏项不为凑分类而恢复。入库时同步维护场景字段。前端每次显示24条，可继续浏览全部结果；筛选和计数始终基于完整可选集合。


前端预览自2026-10-02起统一无音轨：`assets/frontend-silent-previews/manifest.json` 绑定源文件身份及视频流复制副本。原媒体与源码保留。新增/替换预览须检查音轨并更新此清单；未核验或已变更源不回退到有声视频。用户截图移除项登记 `confirmedRemovals`，前端与默认检索共同排除，保留历史身份。

视觉库卡片封面使用 `assets/frontend-posters/manifest.json` 的逐条审选真实帧，绑定当前无声预览路径、大小、mtime、帧号与图片 hash。当前177条各对比8个时间点，优先关键前景完整、文字可读、能体现用途的状态；不使用固定比例作为最终选帧规则。源视频替换后旧封面失效，须重新审选。卡片播放结束返回封面，暂停保留当前帧，可手动返回封面；详情播放保持完整控制。源片段本身没有完整状态时记录限制，不伪造内容。

## 2026-10-06 用户指定22条归档（user-archive-22-20261006）

C008、C017、V064、V097、N014、N016、N018、N025、N031、N046、N049、X008、X009、X017、X029、E02、E13、E15、99-09、99-13、99-21、103-02已按Fred截图要求归档。视觉库保持可浏览并排列在末尾，本地默认不参与选型。原视频、源码、批准范围与历史意见保留。归档清单在`assets/reference-archives/user-archive-20261006/`。普通检索和门禁排除；查历史用`references.py --status all --id <referenceId> --full`。不自动恢复或将归档误记为未认可。

## 2026-10-06 第二批22条归档（user-archive-22-b-20261006）

SP003、SP006、SP007、SP009、SP019、L81-B006、L81-B007、L81-B008、L81-B016、L81-B027、L81-B038、L81-B069、L81-R002、L81-R003、L81-R017、L81-R026、L81-R042、L81-T02、L81-T09、L81-W04、L81-T10、L81-W05已按Fred截图要求归档。视觉库保持可浏览并排列在末尾，本地默认不参与选型。原视频、源码、批准范围与历史意见保留。归档清单在`assets/reference-archives/user-archive-20261006-batch2/`。普通检索和门禁排除；查历史用`references.py --status all --id <referenceId> --full`。不自动恢复或将归档误记为未认可。


## 2026-10-07 归档区默认折叠显示

视觉库常用列表与归档参考分开呈现。已登记的`archivedFromSkill:true`参考集中放在底部「已归档（不建议使用）」中，初始收起；点击后才挂载归档卡片、封面与播放器。常用筛选与数量不包含归档，归档保留同一筛选条件、独立分页及原播放/源码详情。收起时停止归档播放，切换类别或场景恢复收起。

这是显示方式更新，canonical选择、归档事件、媒体、源码与批准历史不变；本地默认检索/制作门禁仍排除归档参考，历史查询继续使用`--status all`。本地3061与网站视觉库共用同一行为，网站原生挂载适配保留。
