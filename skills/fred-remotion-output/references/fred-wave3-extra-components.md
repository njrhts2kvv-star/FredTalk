# 第三轮补充精选组件 2 条

2026-10-12 Fred 在第三轮审看前端 revision 51 选择保留 T08i 与 T10a，并在当前聊天要求更新 Skill。集合 `fred-wave3-extra2-20261012`，与已认可40条分别保存准确版本、时间和来源，总计42条。

| 编号 | 用途与动作 | 可编辑内容 |
| --- | --- | --- |
| T08i | 毛玻璃要点卡：真实录屏持续播放，背景退后，同一媒体构成玻璃卡，关键事实擦入 | media、start、fact、highlight、note、brand、cues、进出场 |
| T10a | 长回复拎要点：真实句条从截图原位提起，飞入侧边编号清单，最后推荐项变黑 | image、imageSize、maskBoxes、maskColor、items（name/note/box）、cues、进出场 |

## 复用

检索：`references.py --collection fred-wave3-extra2-20261012`，或 `--id T08i` / `--id T10a`。准确源码、素材、带声样片、6张核心帧及前端选择快照在 `assets/reference-code/fred-wave3-extra2-20261012/`。复制实际组件、共享 `src/kit/` 及其 public 依赖到本期工程；内容和动作时间通过 Props 输入。

T08i 的卡内外保持同一媒体时钟；fact一行，highlight须是fact中的实际词。T10a换图需重新量测imageSize、原句box和遮挡maskBoxes；常规2–4条，最后一条表示推荐；空items不适用。换内容后检查容量、读字、原文像素与时序，示例产品建议不能当成本期事实。

## 准确认可与交付

认可对应准确云端1080p60样片：T08i为300帧/5秒，T10a为360帧/6秒，完整内部音效。默认未加入私人BGM。源动画保持；成片在云端无重编码校正渲染器2048采样AAC前导，视频packet不变，重新出片需核音画对齐。

T17d报错到修好、T19d Fred指向内容被选择不要，不入库但候选原件保留。T08h/T22c尚未选择，不自动登记。历史40条集合与revision47选择快照保持；本次选择另存revision51。仅更新本机Skill及3061视觉库，轻量索引同步全局，不发布网站或GitHub。


公开分发以仓库 `library/catalog.json` 的当前标签、用途、归档状态、源码路由和可下载媒体为事实源。本文中的生产工程记录只说明方法与历史范围；实际复用请运行 `python3 scripts/catalog.py --id <准确标签> --full`，使用公开源码快照的当前哈希。
