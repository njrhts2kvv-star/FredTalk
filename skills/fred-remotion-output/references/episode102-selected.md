# 第102期七个精选组件

集合：`ep102-selected-20261005`。新增时间：`2026-10-05T11:47:11+08:00`（北京时间）。视觉库将 102-01 至 102-07 排在原精选前面，显示 NEW。

| 编号 | 原成片区间 | 独立 Composition |
|---|---|---|
| 102-01 | 00:15–00:19 | EP102-Selected-01 |
| 102-02 | 00:44–00:50 | EP102-Selected-02 |
| 102-03 | 00:55–01:02 | EP102-Selected-03 |
| 102-04 | 01:04–01:12 | EP102-Selected-04 |
| 102-05 | 01:48–01:55 | EP102-Selected-05 |
| 102-06 | 02:42–02:55 | EP102-Selected-06 |
| 102-07 | 06:35–06:43 | EP102-Selected-07 |

预览是原成片的无声 4K60 摘录，共 53 秒。每条有三个核心帧。源码在 `components/projects/ep102-selected-20261005/source/`，保留原场景时钟、真实素材与独立入口。它们是准确场景快照；新一期替换文案、素材或 cue 后仍需检查实际输出。

从 [Release](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/ep102-selected-20261005) 下载 `ep102-selected-20261005-source.zip`，按其中 README 安装锁定的运行依赖，并运行素材安装器。仓库方式也可运行：

```bash
python3 scripts/catalog.py --id 102-02 --full
python3 scripts/assets.py download
python3 scripts/assets.py materialize --project components/projects/ep102-selected-20261005/source
```

公开工程保留已确认的账号遮罩；公开媒体的派生身份和 SHA 见工程安装清单。预览不带原音轨，源码示例音轨开关与字幕开关独立。新增时间和后续发布时间分别记录，不以发布时间重写新增时间。
