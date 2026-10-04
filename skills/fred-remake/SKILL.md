---
name: fred-remake
description: "Fred 场景实现。根据已授权的参考视频、首尾帧或真实截图实现 Remotion，或只修复指定片段。整份稿子到完整视频的日常制作由 fred-remotion-output 负责；本 Skill 提供精确场景实现、字体几何、交接诊断与局部返修专项能力。"
metadata:
  display_name: Fred 场景实现
---

本 Skill 保留为准确参考场景实现与局部返修模块。用户要求从稿子制作完整视频时，主入口是 [Fred 的 Remotion 视频输出](../fred-remotion-output/SKILL.md)；按需读取这里的实现方法，不重新启动旧 H3 或 Deck 全流程。


# Fred 场景实现

适用前提：使用自有素材或已获得适用授权的参考；本模块不授予对参考作品的版权或再分发许可。

目标：把参考里的视觉关系和运动逻辑变成可控、可复现的视频，而不是根据一句提示词重新设计一个相似主题。先保住用户已经认可的部分，再准确修复点名问题。用户最新明确要求优先于旧样片、旧合同和本 Skill 的默认建议。

用户要求接近 1:1、逐帧/像素级场景实现，或反馈字体、粗度、字号、框形与运动质感不对时，先执行 [字体、逐帧与像素级场景实现](references/pixel-motion-reconstruction.md)：字体不符就重新找候选并做同字对照；按源原生帧量测对象与镜头；统一坐标和时间做像素/边缘与运动对照。不要用固定字体、统一缓动或“看着类似”替代具体依据。

批量任务按用户节奏先整批出片、前端集中对照，再只重渲有问题的条目。初稿明确标记，不等待每条完全校准才提交下一条。整体获认可后锁定成片及源码版本，只针对新意见局部修复；技术、还原度、动态观看与用户认可分别记录并绑定当前文件 hash。

## 1. 先确定场景实现范围

- 用户给视频：实际查看开头、动作交接和结尾，不以文件名或单张 contact sheet 推断全过程。
- 用户只给图片：可以重建清晰的文字、几何和图片舞台，但图片不能证明动作曲线。说明哪些动作是据图设计，不能声称与未提供的视频 1:1 一致；无需强迫用户先生成一条 AI 视频。
- 用户说“其他都挺好”：列出 `preserve` 与 `change`，默认只做一版局部修复。两方案仅在用户要求时提供，不继承某一期“每句两份”的历史要求。
- “场景实现并优化”：分别记录 fidelity 基线和允许偏离点。不能把所有差异都解释为优化。
- FredTalk、第 86 期等只在当前任务指定时作为审美参照。必须找到并观看可用参考；找不到则说明缺口，不把这些名称当作已验证的质量证据。

选择并明确记录 `implementationMode`：

| 模式 | 选择条件 | 交付口径 |
| --- | --- | --- |
| `full-remotion` | 用户要求全片代码重建、文字需可编辑，或参考内部存在广泛错误 | 全片 Remotion 重建；列明仍使用的真实图片/视频素材 |
| `hybrid-repair` | 用户认可后半段，只要求局部清理或替换；保留参考片段能忠实维持效果 | Remotion 重建指定区间，其余沿用参考片段，明确边界和音轨策略 |
| `image-driven` | 只有首帧/截图和确定文案 | 根据图片重建并设计动效；不是已验证的视频 1:1 场景实现 |

没有源实现时不能承诺像素级全片场景实现。有源组件时先读并复用结构、素材、字体和 timeline，不先另写近似版。用户明确要全片重建时，不用播放原视频冒充实现；需要混合路线必须先说明差别并获得必要的用户选择。

## 2. 输入与事实源

后续 Remotion 分镜、组件选择和偏好复用先读 [Fred 已选参考入口](references/preferred-motion.md)，查询项目 `assets/preferred-motion/catalog.json`。默认只推荐 `keep` 与精确视频区间，备选单独查，排除项和旧库全部集合不回流为默认。按内容选动作，保留准确版本、源码与依赖，避免每期重复同一模板。

定位当前 episode，不从旧任务猜路径。FredTalk 项目优先使用项目内 Skill 和本地 runtime；先读项目执行规则，再按需要读取：

- Remotion 实现：`skills/remotion-best-practices/SKILL.md` 及涉及的动画、图片、字体、视频规则；项目缺失时才读全局 Remotion Skill 文档。
- 正式出片：`skills/fredtalk-deck-motion-pipeline/references/preflight-stage-gates.md`，复用现有门禁脚本，不另建宽松通道。
- 整期制作、封装与最终 QC：交给 `skills/fred-remotion-output/SKILL.md`；已有音频和 SRT 的口误粗剪、字幕纠错：交给 `skills/audio-subtitle-roughcut/SKILL.md`。外录同步、ASR、母版处理等既有 pipeline 工具按当前任务需要使用保留的内部依赖，不恢复已归档的视频剪辑 Skill。独立动画不自动套紫色竖版框、不自动添加字幕、BGM 或统一关注结尾。
- 飞书源文本在当前任务中属于事实源时，用对应飞书 Skill 读取当前版本；若只修已确认视频的局部画面，不额外重写整期文案。

制作过程放 `00_每期项目/<episode>/03_制作过程/remotion-remake/<clip-id>/<version>/`；唯一最终 MP4 放本期 `02_最终输出/`。保留已确认版本，不覆盖源素材。下载/剪贴板文件进入本地输入或受控资产目录，记录原路径和 SHA256，避免依赖会消失的临时路径。

先确认 runtime 的实体 `node_modules` 和素材可读，正式 still/render/QC 前运行：

```bash
node skills/fred-video-editing/scripts/verify-local-assets.mjs
```

不把旧 episode 的 node_modules、模型、Logo 或临时缓存变成新任务的公共依赖。素材不自动上传；不自动注册云端生成任务。

## 3. 先看清楚，再写代码

读取 [references/visual-reconstruction.md](references/visual-reconstruction.md)，完成以下轻量记录：

1. `reference-analysis.md`：源尺寸、真实 fps、时长、音轨、画幅、首尾状态；整段动作概述；关键帧时间表。
2. `reproduction-contract.json`：唯一首帧来源、准确文字、字体/几何、素材职责、运动 cue、`preserve/change`、实现模式、音轨与 fps 策略。
3. `manifest.json`：唯一运行时数据源。页身份、sourceBeatIds、时长和准确文案与生产合同一致；不在组件里再手写第二套页数据。

连续分句把“上一段当前成片的尾帧 → 本段首帧”登记为带 checksum 的依赖；上一段更新时只让受影响的开头与接缝验收失效，不顺手重做已认可后段。具体见视觉拆解参考的“分句连续性”。

第一性原则检查：这一刻观众应该看什么？运动传达了什么变化？上一个状态的内容去了哪里？结尾留下的结论是什么？不能回答的装饰先不加。

参考视频先全片疏采样，再对入场、滚动、换词、合并和接缝密采样并播放检查。实际第一帧用 `-frames:v 1` 单独提取；`fps=1` contact sheet 首格未必就是 t=0。

可使用随 Skill 附带的只读源视频审计工具，产物必须写入新的过程子目录：

```bash
node skills/fred-remake/scripts/media-audit.mjs --input "/absolute/reference.mp4" --out "/absolute/process/reference-audit" --sheet
```

脚本只核对媒体与抽帧，不判断美观，不替代门禁或用户认可。若发现前 1–2 秒混入键盘、输入框等，先定位最后污染帧和可安全接入帧，再决定重建区间，不简单删时长打乱音轨。

## 4. Remotion 实施与返修

设备/网页画面单调、镜头推进失衡、模块提前出完或需要提升连续讲解质感时，读 [设备镜头与内容接力](references/device-camera-rhythm.md)：区分舞台镜头、设备外壳和内部内容；以口播触发、可读停留及相对锚点组织变化。它是可选方法，不是固定电脑模板或新增已批准组件。

完整提示词讲解、逐项高亮、原图对比或单处/多处特写时，读 [提示词聚焦与图片局部特写](references/prompt-and-detail-camera.md)：把口播短语绑定真实文字或图片 ROI，先建立全貌，再连续转移焦点；阅读时停稳，同轮几何一致，透明底与内容共同运动。设备到全屏的几何交接仍由设备镜头参考负责。

同类细节反复出现或希望加快整期制作时，读 [稳定质量的执行入口](../fredtalk-deck-motion-pipeline/references/fast-quality-production.md)：先检查代表状态，再扩展同类组件；局部字阶、背景几何、蒙版生命周期和动作起点要在实际短样中成立。

FredTalk横版解释动画沿用既有右上角品牌规范；录屏/实拍/生成视频作为主内容播放时不叠加右上角角标，混合场景按实际播放区间显隐；纯B-roll、第三方严格场景实现、其他画幅和明确无角标任务不自动添加。启用时读取 [已认可角标规范](references/corner-branding.md) 和 [精确参数](references/corner-branding.json)，沿用尺寸、位置、局部底色对应素材和单次缩放规则。该角标规范已获跨期复用授权，正文仍按本期内容设计。

涉及人物或整期人物镜头规划时，先读 [references/character-motion-planning.md](references/character-motion-planning.md)。已验证路线是保留原始人物动效视频，在 Remotion 中合成，并用代码重建文字和模块；不是凭代码重新生成人物。可复用人物实体依赖见 `assets/characters/manifest.json`，使用前运行 `node scripts/verify-characters.mjs`。整期先基于完整逐字稿和录音规划，人物少量、分散、动作不重复，不能逐条随机添加。

用户点名字重、局部闪光、内部缩放或要求像素级差异时，先读 [references/fine-detail-repair.md](references/fine-detail-repair.md)：逐对象密采样、文字 ROI 测量、连续区间碰撞与同一对象交接，再做局部诊断和完整样片。测量值不是全片相似度，不将单期参数固化为模板。

- 所有动作由 `useCurrentFrame()` 和明确 fps 驱动；不用 CSS animation、随机值、真实时钟或渲染期间变化的数据。
- 图片使用 Remotion `Img`，确保字体加载完成后渲染；共享图片/字体节点稳定，不用反复卸载或随机 key 制造闪屏。
- 字体先匹配 family、weight、实际字形，再匹配字号、行高、字距和 bbox。不要默认 Heavy、紧字距或用横向拉伸凑宽。准确文字需可编辑时使用真实字体；沿用图中字形须披露是位图，不能声称矢量可编辑。
- 真实截图保持纵横比。固定媒体容器，只改变需要的 transform；检查 object-fit、裁切和高亮状态能否看清内容。
- Logo 使用用户认可或官方资产，以可见轮廓而不是 PNG 外框比大小。在白、灰、黑测试背景复查白边、透明边缘、孔洞和阴影。不随意用全局阈值抠白，避免吃掉 Logo 白色结构。
- 用户指定纯白背景时，新建画布使用 `#fff`，排查噪点、刻度、边角碎片和底纹；不能因铺了白底就声称原视频内部也已纯白。清理源图使用当前可用且合规的图像工具；用于视频裁切/遮罩时明确作用范围，保护内容。
- 默认不擅加鼠标、点击圈、关系线、假 UI 或按钮。源参考已有且用户认可的交互可以忠实保留；用户明确要求新增才设计。
- 文字交接先让旧内容完全退出阅读区，再进入新内容；不要用透明度叠字或压缩字形掩盖冲突。非循环叙事不为了稳定末帧而退回开场。
- 局部修改留在单独版本。字号变化重验上方空间和相邻卡片，边框变化重验内边距、圆角与图片裁切；不要顺手改音轨、开头或已确认结尾。
- 滚动需要明确方向、当前位置和焦点接力；用户要求更灵动时才加入克制的错峰、纵深、抬升与缓入缓出。延迟和幅度按舞台调整，不把某一期数值当固定配方。
- 用户要求无框白纸/悬浮文档时，按视觉拆解参考的“文档表面与标题”处理，不只把黑框改细。滚动缩放中闪帧时，按渲染异常参考的“文档缩放的细字抖动与层级跳变”区分采样、遮挡和丢帧；修复测试通过不等于根因已全部证明。

混合修复必须按 [references/visual-reconstruction.md](references/visual-reconstruction.md) 的接缝规范执行。保留参考片段区间的时间映射与音轨时钟，检查源 fps 与 composition fps 的差异，不凭某个 Video API 名称猜时间单位。

录音/SRT 驱动重排、字幕避让或指定音效禁用时，读取 [references/speech-and-subtitle-repair.md](references/speech-and-subtitle-repair.md)。时间映射、外加字幕安全区和音效来源分别验证；只改位置时锁住已认可 cue，检查共享组件、冻结首态及下一场复用，不能只搬当前页的静态文字。

出现首帧空白、碎块/频闪、文字被高亮挤动、内部缩放不明显或导出后异常时，读取 [references/render-failure-checks.md](references/render-failure-checks.md)。先区分设计差异与渲染异常，不把一次绕过现象的方法当作已确认根因。

## 5. 样片确认与正式导出

正式生产验收前读取 [references/gates-and-delivery.md](references/gates-and-delivery.md)。顺序为 direction → motion → render → 用户确认 → formal。局部任务可以只有一个 active page，但不能把尚未通过的项目门禁写成已通过。用户要求先整批初稿时，按 [批量出片与独立验收](references/pixel-motion-reconstruction.md#5-批量出片与独立验收) 先渲染全部可运行条目并放到前端，不要求每条先完成 motion 校准或逐条请用户确认；初稿仍做编译与技术检查，明确未授予 formal 或视觉通过。

先输出完整 1080p 样片；不要只交静态图代替运动验收。逐项看：首态建立、信息接替、连续状态、稳定终态，以及用户点名的问题。技术 PASS 与视觉自检 PASS、用户认可分别记录。

正式规格按用户当前要求；Fred 指定 4K60 时，横版 3840×2160、竖版 2160×3840，非标准画幅先明确保比例方案。参考片段 24fps 转 60fps 容器不会自动增加真实运动帧，放大也不等于原生 4K；不默认做光流插帧。

只有用户明确认可样片后才记录 `approvedBy=user`；“请开始制作”不是样片通过。默认确认后只改导出规格，内容/节奏/几何变更须重新验收。若用户已明确认可完整样片，并点名有限修改且明确要求“改完直接最终导出、不再确认”，按其最新指令完成指定修改和内部复检，不重复索要确认；分别记录真实已看样片、授权修改范围和免再次确认的原话，不能声称用户看过修改后的版本。授权范围外的新设计仍须确认，详见交付参考。

交付前对最终 MP4 做全片解码、尺寸/fps/时长/音轨检查、首帧与接缝密采样和结尾检查。可复用审计工具：

```bash
node skills/fred-remake/scripts/media-audit.mjs --input "/absolute/final.mp4" --out "/absolute/process/final-audit" --width 3840 --height 2160 --fps 60 --decode --sheet
```

正式成片交付前还须按 [全帧异常检查](references/render-failure-checks.md#全帧异常检查与偶发白帧) 扫描每一解码帧的异常空场与亮度突变，复核候选帧及相邻帧。不得以低频抽帧、首尾正确或解码成功代替这一步；`media-audit.mjs --decode --sheet` 本身不做全帧画面异常判定。未解释的候选阻塞交付。

生成 `qc-report.md` 与 render receipt，包含最终路径和 checksum、实现模式、保留参考片段区间、音轨策略、fps 转换方式、已知限制和批准记录；全帧扫描另记帧数覆盖、候选帧/PTS、判定依据及处理结果。最终只给用户最关键的修改与视频链接；不把技术检查当作“完全一样”的证明。

## H3 与认可组件复用

结合认可参考、H3 与录音制作新内容时，按需读 [口播驱动与参考协作](../fredtalk-deck-motion-pipeline/references/narration-led-motion.md)。复用内容判断与动作关系，每期按语义选择构图、载体和节奏；不套整期外观、不强制用齐组件。准确场景实现及局部返修仍以用户指定保留范围为准。

H3 生成后还原、共享对象跨片交接或从认可库提取组件时，读 [H3 动态交接](references/h3-handoff.md)。按项目内 [认可库](../fredtalk-deck-motion-pipeline/references/approved-style-library.md) 的准确源版本查视频、源码和依赖；正文、波形、表面与图标选择共用 [内容对象](../fred-remotion-output/references/content-objects.md)。用户认可的是原版参考，提取/适配组件与新成片各自验证。

正文选中、波形定位、无描边白表面、对象交接、概念解释、上下文强调或文档差异需要原生实现时，按需读取 [内容与运动组件](references/content-motion-components.md)。基础适配组件有独立状态验证；组合用法需按当前内容实施和审看，不能冒充新增已验证组件、原版像素一致或用户已看过的新样片。

## 6. 公共 Skill 与单期案例的边界

公共 Skill 只保留通用方法、脚本和验收规则。不复制单期成片、截图、文案、Logo、批准合同或未经授权的用户素材进公共 assets，也不把单期样片宣称为所有后续任务的默认基线。用户明确授权的跨期原始人物动效作为实体依赖保存在 `assets/characters/`，登记来源与 checksum；不夹带单期文字。用户明确授权跨期复用的成套动效原版、代码与依赖可进入公共批准库，原文和数据仅作参考效果，不成为新项目默认内容。未授权的单期素材、案例复盘与制作日志仍放对应 episode。

全局注册为 `fred-remake`，显示名为「Fred 场景实现」；项目镜像为 `skills/fred-remake/`。修改后同步两份并验证 SHA 一致。调用示例：**用 Fred 场景实现处理这个视频，只改开头，其他保留。**
