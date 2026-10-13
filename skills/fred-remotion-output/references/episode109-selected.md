# 第109期用户精选的六个组件

Fred明确选择六个时间区间，并授权重复能力以最新版本为主、旧版归档。实际登记时间为`2026-10-06T21:39:00+08:00`；用户发言时间未提供，messageTimestamp=null。集合`ep109-selected-20261006`，本地登记后，按Fred后续明确要求于2026-10-06T22:26:01+08:00更新到网站视觉库；本次未发布GitHub。

| 编号 | 原片区间 | 核心动作与用途 | 独立入口 |
| --- | --- | --- | --- |
| 109-01 | 0–2秒 | 白底点击与弹性视频窗展开 | `EP109-Selected-01` |
| 109-02 | 20–27秒 | 主视频侧移与右侧清单逐项显现 | `EP109-Selected-02` |
| 109-03 | 54–65秒 | 录屏真实文字局部提起与连续阅读 | `EP109-Selected-03` |
| 109-04 | 70–74秒 | 画中画扩展为双窗证据对照 | `EP109-Selected-04` |
| 109-05 | 107–110秒 | 三行重点与左向箭头逐行聚焦 | `EP109-Selected-05` |
| 109-06 | 131–136秒 | 九宫格规划转连续视频并对齐比较 | `EP109-Selected-06` |

准确总时长32秒、1920帧、原生60fps。109-01使用最新白底替换片的[0,60)帧，再接正式V9[60,120)；其余五段来自V9的原始半开帧坐标。原V9与两份独立返修文件不改；S12最新替换不在本次所选区间。

## 本地入口与复用

[视觉库](http://127.0.0.1:3061/design/#library)最前方已展示109-01至109-06；命令`references.py --source ep109`可单独筛选。六条位于最新入口，原有非目标条目相对顺序保留。[六组件播放与源码对照](http://127.0.0.1:8172/ep109-selected-20261006/compare.html)提供准确摘录、源码复现、4K视频、源码和四个归档版本；[公共文件架](http://127.0.0.1:8172/ep109-selected-20261006/index.html)由现有模板生成。

实体：`skills/fred-remotion-output/assets/reference-code/ep109-selected-20261006/`。videos是4K60无音轨摘录，previews是720p60派生预览，source-previews是实际源码720p60复现；31个原源码/数据文件、56个媒体/字体/边界素材实体及独立入口保存在source中。字体与媒体来自项目实体，无本期配音和私人BGM。

```
python3 skills/fred-remotion-output/scripts/references.py --collection ep109-selected-20261006 --limit 6
python3 skills/fred-remotion-output/scripts/references.py --id N023 --full
node skills/fred-remotion-output/assets/reference-code/ep109-selected-20261006/source/render.cjs list
node skills/fred-remotion-output/assets/reference-code/ep109-selected-20261006/source/typecheck.cjs
```

`EP109Selected01`至`EP109Selected06`调用真实源函数。NativeSceneClock保留完整原场景上下文、每段准确帧与媒体时钟；1920逻辑舞台由父层放大一次。54–65秒跨S09/S10，录屏时钟连续；131–136秒包含真实V9左右齐平比较修订。33帧最终接缝PNG保留在109-04/05/06的极短入口中，主要动作仍运行原React源码；新内容适配须重做该入口。参数和复用限制见source/README.md，引用源码不代表任意文案、ROI或画幅已经通过。

## 重复旧版归档

- `PG-Adobe-01` → `109-01`：同一鼠标点击、弹性mesh视频窗展开；109版本已改白底并直接进入最终播放外壳。
- `N054` → `109-02`：相同证据窗缩小侧移到左侧、右侧清单逐项显现；109保留实际轨迹，替换为本期参考视频与三项内容。
- `N023` → `109-04`：相同画中画小窗扩展为等大双窗对照；109使用真实攻防/受击证据并增加当前录屏交接。
- `SP021` → `109-05`：同一深色三行窗口与左向箭头聚焦；109将箭头延长为逐行推进，保留源入场和剪影。

旧记录、源视频、源码和批准范围逐项保存，未删除旧资产，也未把旧认可改成新认可。canonicalId和明确合并规则指向最新109代表；查询旧编号默认得到最新组件，`--status drop/all`及archive/中的原记录可追溯历史。102-05继续保留：人物/道具从图片画布提起与录屏文字ROI阅读的对象、职责和动作链不同；没有仅凭共通的前景提起或配色强行合并。

## 验证边界

六段4K帧数/秒数/无音轨/完整解码、31原源码hash和素材hash通过。24个TypeScript文件与六个独立composition通过；32秒源码完整重渲和全解码，18组源/成片对应画面实际核对，像素平均绝对误差约0.84–3.36，不声称逐像素一致。当前六条查询及四个旧编号跳转通过，普通已排除N017仍不回流。浏览器连续播放实际回执、HTTP/Range、旧取舍保护、库存和镜像检查见本轮审计。

公共预检仍缺两项历史FunASR模型，本轮无ASR。旧全库的currentVisualBindings/sourceBundle问题未由本次补齐，不能称全库依赖均通过。本次已发布网站视觉库，未推送GitHub。公开源码另存发布副本，保留本地原源码和媒体身份。

## 网站发布回执

[线上视觉库](https://www.fred-fu.com/visual-library)最前方为109-01至109-06，默认187条；其他181条完整对象及顺序保持，三项原线上重复条目移入归档，PG-Adobe-01原未上线但替代关系已记录。六视频公网完整下载/hash/decode、18源码链接、六封面与ZIP完整公网下载hash/首尾Range206通过。网站现用文章release、JS/CSS与其他旧对象保持。

源码包公开版209.6MB，无本机路径、node_modules缓存、配音或私人BGM；24TS与六个独立入口通过。浏览器直连ERR_CONNECTION_CLOSED，Ego检测到用户控制后停止UI操作，本次未完成浏览器实际播放复验。原新增时间21:39与实际发布时间分别保留。


## FredTalk 1.5 发布（2026-10-08）

本集合已同步到 [GitHub FredTalk 1.5](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v1.5.0)。本轮补齐29类组件：第109期6条、新增精选14条、交互4类、3D运镜5条；前端已增加版本更新提示，五条3D运镜已发布到[视觉库](https://www.fred-fu.com/visual-library)。原新增时间与认可范围保持，公开源码副本独立，私人录音/BGM/凭据不分发。


公开分发以仓库 `library/catalog.json` 的当前标签、用途、归档状态、源码路由和可下载媒体为事实源。本文中的生产工程记录只说明方法与历史范围；实际复用请运行 `python3 scripts/catalog.py --id <准确标签> --full`，使用公开源码快照的当前哈希。
