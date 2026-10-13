# 第102期用户精选的七个组件

Fred在2026-10-05明确选择七个最终成片区间，作为七个独立组件保存到本地Skill和视觉库。随后按Fred明确授权发布到GitHub与Fred-fu网站。原新增时间和实际发布时间分别保存在每条catalog记录与集合`publication.json`，首次暂缓上传的要求仍保存在`requestHistory`中。

实际登记时间：`2026-10-05T11:47:11+08:00`（Asia/Shanghai）。用户消息的准确时间未提供，`messageTimestamp`保留`null`。

| 编号 | 成片区间 | 动作与用途 | 独立入口 |
| --- | --- | --- | --- |
| 102-01 | 15–19秒 | 四作品聚拢并显现组合 | `EP102-Selected-01` / `EP102Selected01` |
| 102-02 | 44–50秒 | 设备屏幕连续放大全屏 | `EP102-Selected-02` / `EP102Selected02` |
| 102-03 | 55–62秒 | 三视频归入Logo并扩展录屏 | `EP102-Selected-03` / `EP102Selected03` |
| 102-04 | 64–72秒 | 双视频与长报告对齐接力 | `EP102-Selected-04` / `EP102Selected04` |
| 102-05 | 108–115秒 | 人物道具从画布提起 | `EP102-Selected-05` / `EP102Selected05` |
| 102-06 | 162–175秒 | 原声与A/B候选独立试听 | `EP102-Selected-06` / `EP102Selected06` |
| 102-07 | 395–403秒 | 画布四列逐一提起并汇总 | `EP102-Selected-07` / `EP102Selected07` |

所有范围按半开帧区间保存，原生60fps，总计53秒、3180帧。准确源为本期当前430.2秒混合成片；新组件的批准范围只覆盖指定区间。

## 本地入口

集合ID为`ep102-selected-20261005`。本地`http://127.0.0.1:3061/design/#library`与[Fred-fu视觉库](https://www.fred-fu.com/visual-library)中，七条按`102-01`至`102-07`排列在精选最前，带NEW和新增日期；原有177条的相对顺序保持。页面使用用途与场景按钮筛选，每次通过“继续浏览”增加24条卡片。专用七组件页面`http://127.0.0.1:8156/`支持按编号、关键词搜索及分类筛选。项目实体目录为`skills/fred-remotion-output/assets/reference-code/ep102-selected-20261005/`。`videos/`保存准确4K60成片摘录，`keyframes/`保留八个候选与三张所选核心帧，`posters/`保存代表封面，`source/`保存独立源码和所需素材，`index.html`是可播放文件架。

```bash
python3 skills/fred-remotion-output/scripts/references.py --collection ep102-selected-20261005 --limit 7
python3 skills/fred-remotion-output/scripts/references.py --id 102-02 --full
node skills/fred-remotion-output/assets/reference-code/ep102-selected-20261005/source/render.cjs list
```

## 源码、时钟与复用

`SelectedComponents.tsx`公开`EP102Selected01`至`EP102Selected07`，`index.tsx`注册七个独立composition。源码使用项目实体`skills/_runtime/remotion/preferred-motion-v2`，固定Remotion 4.0.473 / React 19.2.4；素材、字体和原缓存闭包复制到本地Skill，不把Extreme SSD上的episode归档作为新组件执行依赖。

所选区间处在原场景中段，`NativeSceneClock.tsx`恢复准确场景帧与完整原场景上下文，复用时保留连续媒体进度、对象层级和首尾状态。102-02的最前两帧是最终成片已有接缝补片，源码保留该补片，再接续S04的原时钟。102-03和102-04来自S05的不同原时钟范围，分别保存，保持本轮明确选择。

当前条目是准确场景组件。复制到新一期后再替换本期文案、素材、尺寸和cue，并检查长文、主体可见性、真实媒体时钟和相邻交接。源码登记、技术检查与新内容的视觉验收分别记录。视觉库前端使用无音轨派生预览；原始摘录中的口播和素材声音保持原身份。

## 发布记录

原新增时间为`2026-10-05T11:47:11+08:00`，实际发布时间为`2026-10-05T12:58:16+08:00`，两者均为北京时间。`publication.json`保留七条ID、原片帧范围、视频SHA-256、原暂缓上传要求及后续授权；当前状态为`published-github-and-website`，`cloudUploaded=true`、`githubPushed=true`。

[GitHub Release](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/ep102-selected-20261005)已发布23个资产并通过大小、SHA-256及状态校验；提交为`662d3767eabba571ccefb112cf3be367e2340d1b`，[CI](https://github.com/njrhts2kvv-star/FredTalk/actions/runs/37265488078)成功。公开源码ZIP的SHA-256为`68a445ab6bb42cc2300a1e35f653ff9e797e8ef28fbc6979acd18692418b77c6`。

[Fred-fu视觉库](https://www.fred-fu.com/visual-library)当前发布目录为`20261005_ep102_new_components`，服务状态`active`，184条参考与46个文件校验通过。网站catalog的SHA-256为`14ebb1e6e9db7dc74ac6df86cdddb017fab515db386891c04b21e0f6f69b5bcb`。公开源码为保护私人路径所整理的分发副本，本地准确源码与原媒体身份保留。


公开分发以仓库 `library/catalog.json` 的当前标签、用途、归档状态、源码路由和可下载媒体为事实源。本文中的生产工程记录只说明方法与历史范围；实际复用请运行 `python3 scripts/catalog.py --id <准确标签> --full`，使用公开源码快照的当前哈希。
