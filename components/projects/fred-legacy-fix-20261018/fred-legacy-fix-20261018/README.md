# FredTalk 2.5 · 历史组件返修版

32 条已登记组件／场景。源码和依赖版本见 components.json 及各工程 package.json。

在对应工程目录安装 package.json 锁定的依赖，按 components.json 的入口和组合复用。场景源码需要按自己的文字、素材与口播时间修改，不承诺只换 props。原录音、个人图片、录屏、BGM 和项目历史不随源码包分发；缺少的媒体按 user-media-inputs.json 自备。源码见根 LICENSE；字体和音效沿用各自许可。

字体、音效和品牌文件按内容去重保存。仅附带现有公开字体清单已核对的字体字节；其他字体见 additional-font-inputs.json，由使用者自备或在源码中改用公开字体。导入源码 ZIP 后，在本包根目录运行 `python3 prepare_assets.py`，再进入选定工程安装依赖、替换个人媒体并渲染。该命令仅校验和复制包内静态文件；导入器不会自动执行它。
