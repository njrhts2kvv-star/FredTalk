---
name: audio-subtitle-roughcut
description: 对用户自己的音频、字幕与稿件做口误粗剪和字幕纠错，交付可试听、可手调的本地审片台及同步WAV/SRT；支持句内删词恢复联动、PCM保护和真峰值响度复测。
---

# 音频和字幕粗剪

本分发版从用户自己的录音、SRT与稿件开始。不携带私人录音、历史剪点或API凭证。Python 3.11+；FFmpeg/ffprobe须在PATH；只有可选云转写需要requirements.txt里的requests。

保留实际口播、语气词与自然停顿；失败重说删前留后，识别错误只修字幕。句内重复、短词残尾和跨句断字都要听，不能仅按字幕或静音阈值自动删。字幕单改核对音频hash，不重复加速、增益或清洗。原音和旧交付保留。

## 本地路径与操作

从本Skill目录执行：

```bash
python3 scripts/init_review.py --episode /absolute/project --audio /absolute/input.wav --subtitles /absolute/input.srt --script /absolute/script.md --title 示例项目
python3 /absolute/project/03_制作过程/audio-review/server.py --port 8107
```

服务器只绑定127.0.0.1。审片台支持完整试听、波形、原片段/接缝试听、字幕修改、手动剪切、恢复、撤销/重做、本地保存及下载。续做已有审片台，不覆盖用户修改。

**对已处理音频只剪切：**

```bash
python3 scripts/deliver.py --review /absolute/project/03_制作过程/audio-review --version v1 --passthrough
```

`--passthrough`保持PCM，不限幅、不变速、不增益；需要剪片头时显式写入cuts。普通处理先核对输入已应用的步骤，再显式指定参数，例如未加速的已有录音/SRT可使用`--speed 1.1 --gain-db 8 --trim-start 0`，已加速的输入使用`--speed 1`。不重复叠加。导出测采样峰值、真峰值、综合响度并有限次保护限幅；技术测量不能代替声音听审。

## 句内联动与复查

`subtitle-boundaries.json`的`cutId`、`cutRange`、`removeInfix`将句内删词绑定声音剪切；恢复/撤销后同步恢复词句，手调切点后重新核对。导出同一cue一次显示。新ASR与旧剪点迁移先比较全篇不同位置的偏移与漂移，不能假设时间轴相同；新旧版本按同一句、同响度试听，分别说明文字、分段、时间和声音变化。

## 可选千问词级识别

```bash
python3 -m pip install -r requirements.txt
python3 scripts/qwen_asr.py --help
python3 scripts/qwen_asr.py configure
```

凭证只写到用户主目录下的私人配置，目录0700、文件0600；不提交、不打印。模型为`qwen-audio-3.1-asr-flash-filetrans`。上传和付费调用必须获得当前用户授权，不继承其他人的授权。保留原始ASR、词时间和任务receipt，续查不重复提交。云识别不是自动语义剪辑，也不是逐字听审证明。

生产版的原音流程是自然人声处理→1.1倍速→ASR→粗剪→+8dB；本便携包没有包含作者私人自然人声运行环境。需要此流程时，先配置并验证自己的预处理器，使用已处理输入，不把直接导出冒充完成了自然处理。

## 验证与交付

```bash
python3 -m unittest discover -s scripts -p 'test_*.py'
python3 scripts/verify_delivery.py --help
```

交付WAV、SRT、剪点/时间映射、版本记录和可播放页面，前端文字与下载文件必须同版。标明实际听审范围和待处理问题，不以解码或测试通过宣称全文口误清零。只用合成音频测试便携工作流，不上传测试或用户录音。
