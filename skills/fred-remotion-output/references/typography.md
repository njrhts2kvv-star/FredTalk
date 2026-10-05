# 字体与字阶按文字职责选择

| 文字职责 | 默认字体 | 使用范围 |
| --- | --- | --- |
| 正文、解释、列表 | MiSans Medium | Semibold 同家族按需，Regular 仅长文与次要说明；保持主辅层次 |
| 大字结论、能力词、重字胶囊 | MiSans Heavy | 原思源 Heavy 与 MiSans Bold 统一到 Heavy；保留原字号、布局、动作与 cue |
| 短标题、醒目结论、少量数字 | 锐字真言体 | 原数黑体标题统一到锐字，单文件不合成粗体 |
| 字幕、口语、剧情表达 | 得意黑 | 独立字幕按 [横版字幕模块](landscape-subtitles.md) 的 cue 和安全区 |
| 手写、黑板、批注 | 霞鹜文楷 | 原沐瑶、龙藏统一到文楷，粉笔纹理仍是独立图层 |
| 代码、等宽技术文字 | Source Code Pro | 中文配 MiSans；一般英文/数值按 MiSans 的实际职责 |

当前用户指定优先。真实录屏、截图、视频内部已烧录的 UI 字体保留。准确原版仍可作为历史对照，但新制作默认调用当前五家族修订；只有明确要求忠实场景实现原字体时才使用冻结源的原字体。字体统一不改文字、几何、动作、时序、素材或原音轨。Noto 可变字重按正文和重点分别映射 MiSans，不能把次要文字全部变成 Heavy。

## 字阶来自画面，而不是全片统一px

选择建立态、重点态、阅读态的准确帧，对照主文字的有效字形面积、次要说明、间距、行距与观看大小。来源的200px、145px或其他数值只在对应逻辑画布、缩放、字体文件和字长成立。短重点可很大，完整原文可以更密；内容变长优先拆阅读阶段或扩容，不自动縮小整段。同一职责的多项维持重量/基线，焦点变化可以改变局部尺度。

MiSans文件OS/2数值与源CSS的400/500/600/700/900映射并不总相同。锐字真言体和得意黑虽然单文件以400加载，实际字形仍有自己的重量与斜势。不得因数字小就合成900；不得把没有的字重或系统fallback当成准确字体。新适配使用`font-synthesis: none`、加载完成后再出关键帧；改字型后重新量实际字形与长句。

```bash
python3 skills/fred-remotion-output/scripts/typography.py --role display
python3 skills/fred-remotion-output/scripts/typography.py --id misans-medium --id misans-heavy
```

在现有Manifest的`fonts`绑定本期实际复制文件及hash；场景可用`typography: [{role, fontId, reason, logicalCanvas, fontSize, lineHeight}]`记录本段决定。fontId从注册表选择；精确场景实现自有字体时仍使用该准确源的文件身份。`scene.py`会保留本期根fonts与场景typography，不替调用方猜字号、改变选片或修订旧片。

前端展示是当前字体文件的样张；源码登记、字体加载与用户认可画面分别记录。便携仓库在 `library/fonts/` 直接提供当前五家族的八个字体文件，注册表绑定准确路径与 hash。字体各自的许可与来源说明见 `library/fonts/README.md`，不据样张页面推定额外授权。
