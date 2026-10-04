# 统一用途检索

当前目录已经包含六类任务，来源集合、准确ID、取舍独立保留，不按来源推断用途。

| use | 制作任务 |
| --- | --- |
| explain | 讲解段落：分步建立、阅读与收束 |
| recording-focus | 录屏聚焦：ROI、蒙版、放大、标注 |
| images | 图片与作品：比例、顺序、裁切、阅读 |
| video-entry | 录屏与视频入场：全屏、窗口、设备与音轨 |
| handoff | 内容交接：上段终态、下段首态与对象身份 |
| data | 数值与图表：数据、单位与共同尺度 |

```bash
python3 scripts/catalog.py --use explain --query '对象 接力' --limit 3
python3 scripts/catalog.py --use recording-focus --limit 3
```

matching包含useIds/inputObjects/action/segmentRole/nativeDurationSeconds等字段。短片不是现成20秒模板，本期cue与阅读窗口重新适配。默认目录保留已确认隐藏与去重结果，准确版本仍从条目sources定位；历史资产不因此删改。

字体按typography.md的五家族职责选择，深底可编辑前景紫色用#D6BEFF，浅底准确源和媒体像素保留。
