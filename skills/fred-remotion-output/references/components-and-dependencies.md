# 源码与依赖

先读[组件库](library.md)，按当前要解释的内容选择参考。通过稳定 ID 获取仓库内源码位置、视频区间和适配限制。

- 源码工程：`components/projects/`。
- 素材身份及安全状态：`library/media-manifest.json`。
- 安装与校验：`python3 scripts/assets.py download`、`verify`。
- 还原某个工程：`python3 scripts/assets.py materialize --project components/projects/<id>`。
- 场景检索：`python3 scripts/catalog.py --id <id> --full`。

不同工程使用各自 package.json 和锁文件，不把视觉库前端依赖当作所有工程的运行环境。原始录音不随仓库分发，需要声音时使用自己的录音并重新绑定 cue。隔离文件不会自动下载，也不自动用其它画面替代。

从快照复制到新的工作目录再适配。更换文字数量、媒体比例或时长后，检查布局容量、字阶、时钟和相邻交接。技术构建通过与新内容的视觉审看分别记录。
