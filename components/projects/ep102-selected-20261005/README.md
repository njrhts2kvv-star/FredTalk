# 第102期精选组件 · 2026-10-05 新增

7 个独立 React/Remotion 导出，保留第102期正式采用版本的动作、构图、原场景时钟和素材。它们共享必要源码和媒体依赖；每个入口可单独渲染。默认示例为原生 3840×2160、60fps。

| 编号 | 原片区间 | Composition | 内容 |
| --- | --- | --- | --- |
| 102-01 | 15–19 s | `EP102-Selected-01` | 四作品聚拢并显现组合 |
| 102-02 | 44–50 s | `EP102-Selected-02` | 设备屏幕连续放大全屏 |
| 102-03 | 55–62 s | `EP102-Selected-03` | 三视频归入Logo并扩展录屏 |
| 102-04 | 64–72 s | `EP102-Selected-04` | 双视频与长报告对齐接力 |
| 102-05 | 108–115 s | `EP102-Selected-05` | 人物道具从画布提起 |
| 102-06 | 162–175 s | `EP102-Selected-06` | 原声与A/B候选独立试听 |
| 102-07 | 395–403 s | `EP102-Selected-07` | 画布四列逐一提起并汇总 |

## 独立源码包

小 ZIP 含全部源码、固定版本 npm 清单、素材校验安装器，以及 4 个与现有库共享的字体/角标文件。37 个新增媒体依赖通过同仓库 Release 的 SHA-256 对象包安装，不写入 Git。安装前可查看实际下载体积。

```bash
cd source
python3 fetch_assets.py status
python3 fetch_assets.py download
python3 fetch_assets.py verify
npm ci
npm run typecheck
npm run list
npm run render -- EP102-Selected-02 outputs/EP102-Selected-02.mp4
```

克隆整个 FredTalk 仓库时，也可使用仓库的 `scripts/assets.py` 下载并 materialize 此 project；它与独立安装器声明相同素材身份。

## 调用

从 `source/SelectedComponents.tsx` 导入 `EP102Selected01` 至 `EP102Selected07`。参数为 `includeAudio`、`includeSubtitles`、`includeBrand`，默认均为 true；角标只用于102-01原示例。可关闭原口播和字幕，再基于已采用源码适配新内容。实际组件使用固定片段时钟，并非任意长度的动态参数模板。

`NativeSceneClock.tsx` 同时恢复完整原场景 SequenceContext 与 CompositionManager duration，避免短摘录改变 playbackRate 媒体采样时钟。它依赖 Remotion 4.0.473 内部接口，升级版本前须重新核验。`CHROME_EXECUTABLE` 可指定自己安装的 Chrome；默认使用 Remotion 浏览器管理。

102-02 前两帧保留最终采用的 Incoming 合成。关闭字幕时，将原已烧字幕的 S04 媒体层改由准确 InstallV7 源码重建；这一可选分支保持时钟与交接关系，不声称压缩像素一致。

公开副本移除了历史机器绝对路径；原始来源哈希在 manifest 的 originalSha256 中保留，公开文件另记当前哈希。原私有事实源没有修改。此包没有附加新的开源或媒体许可；适用范围沿用主仓库说明和第三方通知。

公开副本的安装录屏使用 `media/install-public-redacted.mp4`：按原采样坐标烧录账号区域遮罩，保持3836×2160、60fps、796帧与原音频时间范围。它是单独派生身份，不宣称与原压缩像素一致；原素材仍在本地Skill中保留。其他40个依赖文件保持原字节。
