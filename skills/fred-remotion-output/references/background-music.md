# 完整视频的BGM合成

2026-10-05 Fred确认本规则，并认可109期30.02秒实片演示。默认在完整视频时间线确定后，将原完整混音与BGM在本地合成一次，再复制视频流封装MP4；也可在最终渲染中实现同一逻辑。不能两条路径重复添加。独立口播WAV、组件单片与内部诊断不默认加入BGM。输入已经由剪映或此前输出含有BGM时，保留其完整音轨，不再次加音乐。

## 音量、延长和退出

- Fred指定音乐已调好音量，常规播放使用线性音量1、额外增益0dB，从视频0秒到视频结束；不再次降低BGM音量，不做归一化、不随口播自动压低。
- 音乐不足时保留开头，选内部乐段按需补足，避免每次完整播到收尾再从开头重来。助手按实际音乐选择节奏、乐句和音色合适的衔接区间，写入当前Manifest；脚本接收明确segments或loopSourceRangeSeconds，未指定时使用内部45%–90%作技术候选。接点默认80ms等幅交叉淡化，可按实际接缝覆盖。候选生成不等于接缝听审通过，不能声称任意内部两段都自然。短视频不强行加拼接，最终时长精确绑定视频帧数。
- 按声音用途判断，不以全屏、尺寸、检测到素材有音轨或某个组件名自动停音乐。口播、组件讲解、录屏演示、过渡动画及仅配画面的短视频，BGM正常播放；不需要的源素材声音另行关闭。观众需要听有声作品的对白、音乐与音效时，该准确区间BGM完全静音，保留源音。
- 当前Manifest中的muteRanges采用整片半开秒区间，每项说明reason；混合场景按实际区间切换。静音期间音乐时钟继续，离开区间后从对应音乐位置恢复，不重开、不暂停音乐时间线。默认在进入静音区间前120ms淡出，区间结束后120ms淡入；必要时按实际声画交接调整。
- 所有正常播放段保持原文件音量；短拼接淡化、静音过渡与最终总线峰值保护单独记录，不能说这些瞬间每个样本仍完全一致。

## 本机使用与分发

Fred私人音乐实体为本Skill的 `--bgm /absolute/own-music.wav`；hash与规格登记在 `bgm-policy.json` 和项目dependency-registry。原公共素材文件保留，仅此Skill实体作为正式默认依赖，不回退旧默认音乐。

Fred当前电脑已有一次明确授权及Skill外0600机器绑定。脚本用机器指纹和文件hash核对，本机之后无需重复询问。绑定不放入Skill、不进入全局同步、ZIP、GitHub、网站、云快照或其他人电脑；不输出硬件标识。全局仅同步代码、文档与轻量策略，真实音乐只在项目Skill实体。

别人使用Skill时，仍能做BGM延长、区间静音、混音和封装，但必须用 `--bgm` 提供自己的音乐。未提供时报告缺少自备音乐，不自动取Fred音乐、不下载Fred文件、不使用旧默认音乐替代。即使复制了机器绑定或改名音乐，也不能在另一机器自动使用Fred这份音乐。

本机授权仅覆盖本地使用，不默认授权上传私人音乐。云端只渲染画面和所需非私人原混音，下载后在Fred本机加BGM；不要把原BGM、扩展音乐轨、其衍生独立音频或混音中间件放进上传snapshot/public。最终用户已授权交付的成片另按当次交付范围处理，不自动发布。

`package_bgm.py`仅打包能力、计划示例和文档，没有音乐与绑定。任意整包同步、导出或发布也要执行本机策略：排除bgm-local-only目录、绑定文件及策略列出的内容hash；不能用包含assets的整目录上传。云snapshot拒绝原音频hash及私人目录；私人衍生轨须同样保存在bgm-local-only工作目录，不能改名迁出后假装公开素材。

## 当前执行入口

在同一Manifest保存 `audio.bgm`：enabled、inputBgmAlreadyPresent、音乐路径/hash/来源、segments或loopSourceRangeSeconds、joinCrossfadeSeconds、muteRanges、muteFadeSeconds、完整混音输入、输出及实际检查状态。不要按画面大小猜mute区间。每个原声欣赏段记录source-audio职责及准确源声音范围，原口播、源声和动作音效属于完整基础混音，不能被音乐合成覆盖。

将上述audio.bgm对象另存为本期制作过程中的bgm-plan.json供命令读取；这是执行输入副本，修改时同步当前Manifest，不另建审批或独立事实源。

```bash
# Fred授权本机：不需要--bgm，自动核对本机依赖
python3 skills/fred-remotion-output/scripts/bgm.py --video /path/full-video-without-bgm.mp4 --plan /path/bgm-plan.json --output /path/final-with-bgm.mp4

# 其他使用者：传入自己的音频
python3 skills/fred-remotion-output/scripts/bgm.py --video /path/full-video-without-bgm.mp4 --bgm /path/own-music.wav --plan /path/bgm-plan.json --output /path/final-with-bgm.mp4

# 只分发能力，不包含Fred音乐
python3 skills/fred-remotion-output/scripts/package_bgm.py --output /path/FredTalk-BGM-Capability.zip
```

计划字段与整片秒坐标见 `templates/bgm-plan.example.json`。执行前明确inputBgmAlreadyPresent=false；脚本拒绝已有BGM sidecar的输入和已存在的输出。支持FFprobe提供nb_frames/avg_frame_rate的常用MP4；其他媒体需先锁定精确帧数与时基。Python标准库加本地FFmpeg/FFprobe，无新增第三方Python依赖、API或云上传。

脚本已经执行：采样精确音乐裁切、内部选段补足、等幅拼接、逐采样静音包络、静音时持续音乐时钟、线性1混音、normalize=0、AAC实际复测、必要的最终总线峰值保护、完整解码与未改视频流hash核对。最终输出旁的.bgm.json记录真实输入/音乐/output hash及处理，供防重复与返修绑定。原片没有真实BGM记录时不能靠文件名猜已加或未加，须先检查其制作记录。

## 检查与批准范围

原口播和低音量BGM相加仍可能超过满幅；不默默修改BGM轨。只在最终总线上按需保护瞬时峰值，不自动补偿增益；在实际AAC编码音轨测真峰值，默认目标不高于-1dBTP，失败有限次调整限幅余量，仍失败不交付新final。成片响度、处理参数、重试失败与最终结果如实保存，任何听审状态都以实际检查为准。

完整交付核对音乐从0秒开始、准确末尾、拼接与静音过渡、原声是否保留、口播清晰度、全轨混音一次、实际成片峰值、帧数/PTS、未改画面和源hash。长音乐拼接须听接缝，原声欣赏须看实际对应区间；技术解码不能替代主观听感。

## 已混音乐后的画面局部返修

只换画面或接回旧版片段时，保留已完成的整条AAC混音，不再次调用bgm.py。新文件核对音频包payload、PTS/DTS及duration与已验证混音完全一致，可据此继承此前AAC响度实测；不能仅凭“声音差不多”继承。新.bgm.json保留原混音输出身份，再记录新的画面编辑与输出hash、audioMixedAgain=false；画面已改就不能继续声称videoPayloadUnchanged=true。总时长或音频／静音区间变化时重新按当前时间轴混音及测量，不能沿用旧范围。

固定Skill／组件库配音没有混入本规则的BGM：基础混音只加入原PCM一次，动画每期换；当期动画若已带同一句配音，不重复叠加。字幕按当期画面处理，同文只显示一层；仅复用固定纯配音作讲解时，整片BGM正常持续；插入动画作为有声作品欣赏、需要观众听其完整原声时，按本期实际区间写入 muteRanges 让 BGM 让位。不能仅凭固定插入名称或素材有音轨自动静音。109期207.27秒成片的音乐源足够长，实际未拼接／循环；其−9.6LUFS等测量是本片结果，不升为所有视频固定响度目标。

109期已认可演示绑定 `512e23375df22d88bbbfb80bf41f3653314a1898d548f8c15cefbc37b877b114`：1801帧、30.016667秒、4K60、S02–S06，Fred原话“挺好的，帮我更新到 SKill 中把”。只证明本次正常讲解段的实际加BGM效果获用户认可，不冒充长音乐接缝或原声静音恢复的用户试听批准。未保护混音约+1.2dBTP，首版AAC约0dBTP失败，调整总线保护后最终AAC约-2.4dBTP通过；这个限幅设置不是以后每片固定音量模板。完整单期证据仍留在109期制作过程bgm-demo-20261005。
