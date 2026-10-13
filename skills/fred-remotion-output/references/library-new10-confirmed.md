# library 新 10 期：已确认复刻集合

集合 ID：`library-remakes-new10-20260928`。原批整体认可为 53 条；2026-09-30 移除 N017 后，当前活动成片为 52 条，均为 1920×1080、60fps、静音 MP4；N052 按 Fred 要求暂缓。Fred 对这批成片作了整体认可，N030 与 X050 已按后续意见局部返修。认可对象是当前视频版本，换文案、素材或时长后的新输出仍需重新检查。

在视觉库前端 `http://127.0.0.1:3061/` 进入“library 新 10 期复刻”。完整项目、视频、封面、参数示例和锁文件保存在项目 `assets/reference-code/library-remakes-new10-20260928/`。`catalog.json` 按以下表达关系分类，每条可有多个类别；分类帮助找候选，不改变原 N/X 身份。

视觉库封面从成片中选能看清核心对象与关系的实际帧，不默认使用首帧。原批 53 条的 `posterFrame`、`posterTimeSeconds` 和封面哈希写在 `catalog.json`，逐条选帧记录在集合审计目录的 `poster-selection.json`；新入库片段也应避开空白、过渡中途和主体尚未建立的画面。

| 分类 | 适合表达 | 选型时核对 |
| --- | --- | --- |
| 标题与文字 | 逐字、换词、字重变化、填充和强调 | 字体文件、字形、字阶、基线、停留时间 |
| 逻辑与流程 | 分支、步骤、聚合、问题到结论 | 对象数量、进入顺序、连接关系 |
| 窗口与设备 | 桌面、手机、搜索框和页面交接 | 外壳几何、窗口比例、内部播放与滚动 |
| 图片与作品展示 | 视频墙、作品卡、多图比较 | 槽位数量、比例、裁切、层级和媒体连续性 |
| 文档与操作演示 | 输入、聊天、文档阅读和结果页 | 真实操作时点、阅读区域、可读停留 |
| 聚焦与转场 | 镜头推拉、错层、遮挡、让位 | 镜头轨迹与对象自身动作分开量测 |

从当前内容的表达目的查询少量候选：

```bash
python3 skills/fred-remotion-output/scripts/references.py --collection library-remakes-new10-20260928 --scene-type summary --query 字体 --limit 3
python3 skills/fred-remotion-output/scripts/references.py --id library-new10-n030 --full
```

调用时先复制 `project/src`、所需 `public` 和 `package-lock.json` 到本期工程；Composition 入口为 `project/src/index.tsx`，参数示例在 `project/examples/<ID>.json`。使用 Remotion 4.0.473 和 React 19.2.4。源代码虽有 `words/assets/accent/highlightWords/actorFraming` 接口，不保证每条都消费每个字段；要查当前分支的实际读取点，再为新内容做短样。原动作采用 60fps 时钟，新录音需要重新绑定 cue，不能只改 `durationInFrames`。

复用时按 [fred-remake 的字体、逐帧与像素级复刻方法](../../fred-remake/references/pixel-motion-reconstruction.md) 检查同字字体、原生帧动作、1080p 边界与过渡。当前活动视频技术解码与尺寸检查已有记录；用户整体认可不自动写成内部全帧视觉检查通过。`source.zip` 是可独立安装的完整源码包，`project/` 是 Skill 内可直接查阅的实体代码和素材；视频与封面在 `videos/`、`posters/`。

## 2026-10-06 最新替代

原52条登记资产与批准历史保持；N054/N023本轮归档，默认代表为109-02/109-04。准确比较、旧编号跳转与源码边界见[第109期精选](episode109-selected.md)。


公开分发以仓库 `library/catalog.json` 的当前标签、用途、归档状态、源码路由和可下载媒体为事实源。本文中的生产工程记录只说明方法与历史范围；实际复用请运行 `python3 scripts/catalog.py --id <准确标签> --full`，使用公开源码快照的当前哈希。
