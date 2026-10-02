# Deck 接入

使用 stableId registry 映射视频、poster、标题、背景和角标模式。视频离页时 pause 并重置；重新进入从 0 播放。

- 第一页初始 paused、currentTime≈0、有声配置；第一次点击只播放不翻页；结束停末帧；第二次点击才翻页。
- 其余 Remotion 页进入后自动有声播放一次，`loop=false`，结束 paused 且 currentTime≈duration。
- 实拍过渡页同样自动有声一次，并有且仅有一个黑底角标。
- 浏览器阻止有声自动播放时保持当前页等待用户解锁；不能永久 muted，也不能把解锁点击误当翻页。
- 正常翻页在同一用户手势回调中挂载/调用 play，减少 autoplay 阻断。

用真实浏览器基于状态等待测试，不把固定 sleep 当唯一证据。检查 console、媒体 404、标题/角标、poster、离页清理和 URL 直达。
