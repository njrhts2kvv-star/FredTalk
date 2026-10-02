# 动作音效绑定

选定实际动作后再选声音。本库为 Fred 授权入库的14条增强音效；素材选择与动作绑定分开：绑定是优先备选，具体混音未获逐项试听验收，不能声称是 Library 同款。选择事实、来源与hash见 `sound-effects.json` 及其 selectionEvidence。06明确拒绝；10/12/14/17已从当前用户筛选文件夹移除，不从旧包补回。用户新增“滚动”登记为SFX19，文件名保持滚动.wav。

## 查询与复制

```bash
python3 skills/fred-remotion-output/scripts/sfx.py --action T01
python3 skills/fred-remotion-output/scripts/sfx.py --action W01
python3 skills/fred-remotion-output/scripts/sfx.py --id SFX19
python3 skills/fred-remotion-output/scripts/sfx.py --verify
```

在含项目依赖的目录执行，或传 `--project-root`。查询仅返回本库匹配动作，并检查实际文件hash。新工程只复制所选WAV到本期 `public/sfx/`，保留sfxId、源hash和目标路径；不依赖Desktop试听文件夹，也不上传整个公共库。

## 动作与触发点

| 音效 | 动作 | 触发方式 |
| --- | --- | --- |
| SFX01 短转场 | T08, T10, W02, W03 | 短窗口进入、文字遮罩刷出；move-start |
| SFX02 翻页 | page-turn | 报告翻页或页面替换；change-start |
| SFX03 叮 | W08, result-confirm | 数值落定或结果确认，仅响一次；settle |
| SFX04 Woosh | T01, T02, T04, T05, T06, T10 | 主次交换、侧移、展开、推近或内容接管；move-start |
| SFX05 弹出 | T03, item-enter | 圆点建立、胶囊或图标出现；reveal |
| SFX07 提示 | result-confirm | 重要结果出现，与03二选一；reveal |
| SFX08 打字 | W01 | 匹配实际输入区间，停字即停声；不能只在长段输入开头响一小截；interval |
| SFX09 点击 | click, search-select | 真实点击或选择瞬间，不随光标移动连响；contact |
| SFX11 弹簧 | T01, T03 | 明显弹性回弹才采用，非所有缩放；rebound |
| SFX13 滑动 | T02, T05, T08, W04 | 对象让位、图卡展开或整组文字上卷；move-start |
| SFX15 消息 | W04, reply-enter | 新回复进入，非旧文字上卷全过程；reveal |
| SFX16 收线 | T09, line-collapse | 多对象聚拢或关系线回收，拟物备选；move-start |
| SFX18 快门 | photo-freeze | 拍照、截图或照片定格，不给每次换图加快门；contact |
| SFX19 滚动 | number-scroll, metric-scroll | 仅覆盖数字实际滚动的区间；文档、列表、录屏内容上移不使用，一般数值变化或最终落定也不自动使用；interval |

`move-start`对齐可见运动开始，短声覆盖加速或交接段；`reveal`对齐主体首次明确出现；`settle`对齐最终值落定；`contact`对齐点击/定格瞬间；`rebound`对齐回弹；`interval`只覆盖实际输入或数字滚动区间。精确起点按素材起音与画面微调，不把文件起点自动当响度峰值。未做逐条起音标注。

SFX19按数字的实际动作判断，不按组件名、W04文本滚动或“界面正在动”自动挂载。文档滚动、内容上移和设备移动保持各自声音选择；即使窗口里含数字，只要数字本身没有滚动，也不使用该声。W08数值变化可用结果确认声或静音，不将全部W08映射为SFX19。

T07失焦、W05淡入淡出、阅读停稳默认可静音。多个同时动作只选承担主要注意力交接的一声；T01同一轮缩小与放大优先共用一次交接声。整组卡片展开不每张都响。03/07作为结果提示备选二选一，不叠加。禁止按每字/每帧触发声音。长输入或滚动素材不足时先选区间/淡出，不直接硬循环或拉伸；确需循环先处理无缝接点并试听。

打字声检查整个可见输入段的起点、有效长度和停止点。长段文字仍在输入时，不能因源音效太短而只响开头几帧；先按真实输入节奏选用足够长的片段，素材不足再处理无缝衔接与淡出，并随画面正常速度试听。输入中的停顿允许停声；快速刷出、逐行出现和流式回答不因有文字就当成键盘输入，不为补足时长强铺打字声。

## 音量与Remotion落地

WAV已经烘焙+8dB增益及峰值限制，不能再默认加8dB。以线性 `volume=0.5`（约-6dB）作为有口播混音的初始试配值，不是统一验收音量；根据实际录音调整，关键辅音不能被盖住。11/15原本偏响须特别检查。单条峰值安全不代表多轨相加安全；最终编码混音检查真实峰值（目标不高于-1dBTP）及口播清晰度。

在场景 `motionEvents` 的对应动作上附加可选 `sound` 记录，例如：

```json
{"id":"capsule-handoff","transitionRef":"T01","sound":{"sfxId":"SFX04","file":"sfx/04-Woosh.wav","sourceSha256":"从查询结果填实际值","startFrame":120,"durationInFrames":26,"volume":0.5,"timebase":"scene-local","reason":"新胶囊接管注意力","review":"pending-mix-listening"}}
```

这是制作记录约定，当前storyboard校验器不验证sound字段，不是已有自动配音引擎。使用项目锁定版本的Remotion `Sequence` + `Audio`/`staticFile` 挂载实际音频：`from`为上述场景局部帧，父场景再负责全局偏移，只换算一次；按素材真实时长和裁切区间算播放帧数。短音完整保留尾音，截断长音时加短淡出防止咔声。使用声画合成预览核对时机，而非只单独试听。

在 `sceneGuide.applications` 记录本场景选声或静音的原因、音量、实际起点与检查；`--with sound-effects`把本小抄带入场景。音效与组件为一对多备选，不按近期使用频率限制复用，不把不同动作全部套同一种声音。

## 云渲染与检查

音效作为实际本期依赖复制进public及云快照，核验源/目标hash。分块视频后拼接时保留全范围“口播+BGM+音效”混音，只合入一次，不能用仅口播音轨覆盖音效。检查文件解码、时长、边界淡出、密集cue叠加峰值、最终编码音轨与正常速度听感。在最终实际MP4里按动作cue核对声音是否存在、时长是否匹配，尤其检查长输入声过早结束、数字停止后仍有滚动声，以及分块/合并后音效丢失或重复；源WAV存在、单独试听正常或混音代码已挂载都不能代替这一步。技术检查和用户试听分开记录；无听辨能力时明确混音试听待确认。

## 原文件独立保存

所选14条原始MP3已实体复制至本Skill依赖根下 `assets/sfx/jianying-20260915/originals/`，增强WAV仍在其父目录。两版均使用Skill相对路径和独立SHA256；`sfx.py --verify`同时检查两版，查询返回resolvedOriginalFile与resolvedFile。默认制作使用已加8dB的WAV；需要重新处理才取原始MP3。桌面试听目录和剪映缓存只作历史来源，不作运行依赖，不通过软链接或硬链接依赖它们。项目依赖实体位于FredTalkLocal；云渲染只复制本期选用版本，不把原版与增强版叠加播放。
