# 渲染、返修与交付

进入预览/正式渲染阶段才读本文件，并运行 `scene.py --stage render` 获取声音、缓存与原生一致性、交付对应的F14/F17/F18。场景规则在各自制作时已经落实；本阶段按新制作/有限返修/明确直出范围检查输出，不重新通读全部场景类型。

## 执行关系

主 Skill 负责本期目标、连续分镜、完整范围和检查结果。Remotion 方法来自 `skills/fred-remake/`，生产门禁来自 `skills/fredtalk-deck-motion-pipeline/`，云执行来自项目 `skills/cloud-render/`。这里只连接实际命令与状态，不复制它们的 validator。

进入本阶段时读取当前 `skills/fredtalk-deck-motion-pipeline/references/preflight-stage-gates.md` 与 `skills/fred-remake/references/gates-and-delivery.md`，按现行字段生成生产合同。独立视频设 `deliveryProfile: standalone-video`；FredTalk横版解释动画按既有规范记录品牌版本，源视频播放窗口不叠加右上角角标；合同的`badgeVariant: none`或实际角标隐藏区间须与本镜职责一致，不能由整片启用标记覆盖媒体片段；没有生图时写本地镜头 brief 作为 direction Prompt 文件，不额外生成图片。

批量渲染前及公共库更新后续做时，按[从内容到组件](content-to-component.md)运行`validate_storyboard.py --require-reference-usage`（同时传当前Manifest及场景小抄检查参数）。核对当前选择、原版来源与本期实际代码；检查通过仍须对照真实预览的表达和质感。

本 Skill 另有不可跳过的四阶段生产门禁，详见[分阶段生产门禁](production-gates.md)：先 `planning`，再 `implementation`，再代表镜头 `representative`，最后 `formal`。共享 Deck 门禁仍然适用，但不能替代本期 Manifest 的实现模式、原创风格合同、媒体映射、段内时钟和代表镜头收据。代表镜头未通过时，不得把整片云端渲染当作探路。

## 当前门禁命令

路径变量来自本期，示例不是自动可运行的任务。先建 receipt 目录，上一动作真正成功后再进入下一步：

```bash
node skills/fred-video-editing/scripts/verify-local-assets.mjs
node skills/fredtalk-deck-motion-pipeline/scripts/validate-stage-gate.mjs --stage direction --contract "$clip_contract" --prompt "$clip_brief" --receipt-out "$clip_direction_receipt"
node skills/fredtalk-deck-motion-pipeline/scripts/validate-stage-gate.mjs --stage motion --contract "$clip_contract" --prompt "$clip_brief" --previous-receipt "$clip_direction_receipt" --receipt-out "$clip_motion_receipt"
python3 skills/fred-remotion-output/scripts/validate_production_gate.py --stage planning --manifest "$clip_manifest" --receipt-out "$clip_planning_receipt"
python3 skills/fred-remotion-output/scripts/validate_production_gate.py --stage implementation --manifest "$clip_manifest" --source-dir "$clip_source_dir" --previous-receipt "$clip_planning_receipt" --receipt-out "$clip_implementation_receipt"
```

direction/motion确认计划后实现组件，再运行implementation；still/预览由 runner 执行，1080p是效率默认值，已有有效4K或其他当前规格预览无需重复转码：

```bash
node skills/fredtalk-deck-motion-pipeline/scripts/run-stage-gate.mjs --stage render --action preview-render --contract "$clip_contract" --prompt "$clip_brief" --previous-receipt "$clip_motion_receipt" --receipt-out "$clip_render_receipt" --source-dir "$clip_source_dir" -- node "$clip_preview_script"
```

代表镜头由 preview runner 生成后，先完成真实关键帧确认及内部动态检查，将记录回填当前Manifest，再写 review receipt。若Manifest因记录补齐发生变化，刷新当前planning/implementation receipt；不因此重新生成未改变的素材或索要用户确认。随后运行：

```bash
python3 skills/fred-remotion-output/scripts/validate_production_gate.py --stage representative --manifest "$clip_manifest" --previous-receipt "$clip_implementation_receipt" --review-receipt "$clip_representative_review" --receipt-out "$clip_representative_receipt"
```

明确直出且不另做完整用户预览时，仍须完成内部代表短样；可先用`validate-stage-gate.mjs --stage render`核对当前源码并生成render receipt，不运行伪造的预览命令；实际导出仍经formal runner。

正式输出使用同一 runner 的 `--stage formal --action formal-render --approval "$clip_approval"`，消费当前 render receipt；导出后还要运行本 Skill 的 `formal` gate，消费 representative receipt，并由 `scan_dynamic_scenes.py` 检查 dynamic/mixed 场景的实际变化。渲染脚本按当前要求执行本地或已授权云任务；runner按明确action和实际渲染职责判定，路径里有4k/2160不表示动作是正式输出，也不能把正式渲染伪装为预览。receipt 是前置检查结果，不是云任务成功回执。

原版中的有职责显隐若触发扫描，按既有 `motionSourceReviews` 记录实际源 hash、帧范围与审看证据；不能为了原版“通过”关掉整个检查。

## 含录屏时选择处理路径

渲染前按云渲染专项的[视频处理选型与容量控制](../../cloud-render/references/video-render-routing.md)选择FFmpeg直接处理、Remotion或局部源帧缓存。这套判断也适用于本地，不因此触发云端上传。简单录屏优先评估FFmpeg，复杂设备/对象动画保持Remotion；分段混用仍由同一Manifest控制素材、时钟、声音与接缝。执行路径变化不改变认可范围，不跳过本期适用门禁；当前公共脚本没有自动路由能力。

## 选择执行位置与时钟

用户当前指定本地就本地，指定云端就使用已授权云环境；切换位置不改变本期素材、字体、帧率、时序或认可范围。本地任务不执行上传、云实例和云目录准备。以下快照/服务器步骤只在云端执行时读取。

按 `skills/cloud-render/SKILL.md` 执行；本地先固定实际 Remotion/React/锁文件、源码、Manifest、字体、图片、视频和必要混音，随后复制到新的云任务目录。不要上传 Mac node_modules、所有历史样片、凭据或整个公共库。动态资源名要追踪到实际文件；任何 dataless/失效链接先解决。

`snapshot.py` 拒绝 symlink 和越界依赖；本期 staging 先把选用公共文件实体化，再做允许列表快照。运行中的构建不能继续被编辑。源变更使相关 receipt、快照和旧 QC 失效。

云任务 `frameRange` 的右端包含；本期 Manifest、选片与修订使用半开区间。例如全局 `[1200,1800)` 对应云任务 `[1200,1799]`。某个 Part 的局部帧 0 与音轨起点分别算，不能自动认为 audio.startSeconds 等于 frameRange/fps。

8个独立浏览器×每个2并发页面是既有测试起点，browsers、concurrency、GL后端通过job配置选择，记录实际值；不是所有工程必须满足的硬指标。沿用已授权服务器并检查资源，不能把一个浏览器concurrency 16称为8×2，也不为提速改字体、模糊、内容或帧率。只有核验过的实际后端才写GPU生效。

既有工程优先复用该内容已验证稳定的并发与渲染后端；若此前已降并发或使用软件渲染解决异常，不在有限返修时擅自恢复更激进配置。新工程按实际字体、模糊、媒体负载验证；记录实际使用值与失败证据，不把单期配置升为所有新片的固定值，也不凭偶发坏帧猜测GPU为根因。

分块视频去除AAC后拼接，每块concat duration按实际帧数/fps计算，最终MP4使用能精确表达当前帧间隔的timebase（当前60fps链路为60000），完整混音只合成一次。分块内部PTS已失真时不能靠最终timescale或-c:v copy恢复，须按实际异常修复并复验。若 composition 内含必要音效，先导出全范围混音，不能用只有口播的外置文件替代。没有声音的内部诊断与用户要求的正式无声交付分别标明，不能漏掉正式口播。

### 换录音与合并时再核对全局时间

最新WAV与SRT一起锁定；文本几乎不变也需核对每句起止、段长、重点词、段间停顿与结尾。重新映射受影响动作、源录屏、局部字幕及SFX，不以统一偏移、整段拉伸或只换音轨代替对齐；合并句还需检查句内重点。保留未受影响画面与认可设计。

合并前明确每段全局范围及原始gap归属，按实际语义选择延续尾态、过渡或保留停顿，不默默删掉间隙。视频流参数兼容才copy；尤其检查短gap与分块边界的PTS/DTS、精确帧数和实际播放，不能把容器拼接成功当成声画连续。

最终混音要包含所需口播、源素材声音和后加音效；检查源身份、实际尾部、起点、时长与关键落点。发现固定偏移先区分裁切、处理延迟与变速；只有证实后补偿，不把历史样本数写死。最终封装避免在本链路使用会提前结束音频的`-frames:v`，用明确时长及视频帧数验证；独立视频编码可按帧限制。技术异常与工具边界见云渲染的[故障定位](../../cloud-render/references/diagnostic-boundaries.md)。

## 从内部预览到正式输出

按本轮真实范围选择同一个formal门禁的分支，具体字段由共享[阶段门禁](../../fredtalk-deck-motion-pipeline/references/preflight-stage-gates.md)维护：

| 当前情况 | 实际执行与状态 |
| --- | --- |
| 新一期关键帧先审 | 新制作先完成实际风险的代表镜头，先交真实关键帧给Fred确认；内部看清短动画表达、声音与接缝后继续，不默认新增用户动态样片确认。共享formal按已确认制作流程及当前制作请求中的实际输出授权记录direct-output，注明只确认过关键帧，不能伪装样片已获认可；这是既有执行器的授权映射，不新增用户审批，也不把Manifest的standard流程改成跳过关键帧。预览可为当前有效规格，不限定必须另做1080p。 |
| 已完整认可基线的有限返修 | `bounded-revision`引用真实旧基线、本次改动范围/授权和当前证据；复用未改认可区，只检查改动及受影响接缝，不要求再重做完整预览或重复索要认可。 |
| 明确要求直接输出 | `direct-output`记录真实输出授权、范围/规格和当前构建证据；不把“让你输出”写成“用户看过新样片”。若用户明确省略创意审看，记录对应原话及尚未审看的区域，按请求直出，保留必要技术校验。 |

技术检查针对实际产物：本地核对规格、时长、帧数、音轨、PTS和完整解码；云端下载另核对两端SHA256。导出前检查不冒充最终文件检查。最后补帧、拼接或重新编码后，重新计算hash与相应完整性检查。

默认创意审看覆盖本次完整语义窗口与受影响交接：实际存在的最长文字、跨行高亮、最大特写、蒙版生命周期、关系线初态、换词与角标/字幕区域。有限修改保护其他已认可区域；没有使用的效果不补做样例。用户明确要求自己看、跳过这类审看时，如实标注pending/未审看，不报告视觉PASS或额外等待确认。

横版使用[得意黑字幕模块](landscape-subtitles.md)时，字幕 cue 对齐最终音轨/SRT；代表镜头及正式文件检查最长字幕、实际盒宽/双行、胶囊和卡片的完整运动包络、上下段首尾态与角标。全屏媒体可延伸至底部，但其信息区仍须可见。检查记录绑定当前文件版本，不把字体加载或技术解码当成视觉避让通过。

最终文件全帧技术异常扫描按`skills/fred-remake/references/render-failure-checks.md`；异常处理以当前授权与实际症状为准，不把预览文件检查套到新编码上。复杂字体/模糊的局部缺失需看具体ROI；整屏亮度、代理播放器和Contact Sheet都不能证明美术质量。

技术空帧、语义空场和有目的阅读分别判断。动态采样只能证明所采位置的变化；`requiredChangeEvents`不得超过`sampleCount - 1`，配置不可能达成时先修配置。小区域动作被整屏均值漏掉时按真实cue与ROI复核并记录证据，不靠增加无意义动作凑阈值。不要把采样通过写成美术或用户认可。
## 逐段审看页面

默认按[逐段画面对照表](segment-review.md)生成本期审片页：从当前 Manifest 派生原文与时间，新版视频置顶，历史折叠，逐行判断和图文反馈持续保留。反馈绑定实际版本，更新后不得继承旧版已看状态。

## 返修如何限制范围

先读取真实最新反馈来源；浏览器localStorage/IndexedDB中的用户判断、意见和贴图与HTML内助手写的advice/版本说明分别处理。仅抓静态HTML且textarea为空时，不声称已读到最新意见。

用户每次指出问题时记录原话、源版本/hash、精确时间、症状、保留对象、目标层和验收画面。先收集本轮所有明确问题，定位原因，再一次实施相关修订。被保留的视频/声音/布局不随意更换。

允许复用已验证未改帧，补渲受影响范围及邻接；源码共享导致下游首态变化时计入范围。只有压缩 MP4 可用时说明拼接/重编码影响，不冒称无损。保持帧数和语义时钟，不用删帧、慢放、插帧或模糊掩盖异常。

### 烧录字幕与局部合并

先确认字幕是外挂还是烧录。外挂文字可更新字幕轨并重新封装；烧录文字需要改当前cue源码并只渲受影响范围，保护同一基线的画面、字体、时序、旧修正和完整混音。确认范围时检查同产品的全部指代，不只改用户截图那一帧。

cue按全局`[startSeconds, endSeconds)`显示时，首帧为`ceil(startSeconds * fps)`，结束帧为`ceil(endSeconds * fps)`且不包含；以实际组件选择逻辑和固定帧率复核浮点边界。Remotion右端包含，提交时用`endFrameExclusive - 1`。局部渲染的媒体与字幕仍沿原全局时钟，不能从片段0秒重新选cue。

已有完整视频时，优先复制未改视频流与完整音轨，替换准确帧区间。任意切点不一定可直接copy：查实际源关键帧，必要时仅编码切点邻近GOP的桥接，再按每段真实帧数/fps拼接；流参数不兼容时选择必要编码并如实说明，不声称整片无损或从未编码。音轨默认用原完整混音一次封装，避免分段AAC重复编码引入间隙；只有用户要求音频变化才改音轨。

检查实际最终MP4的完整解码、规格/总帧数、PTS连续性、两端替换边界及新字幕；未改画面对照有效基线，直接copy的音轨核对流身份。先交局部片段还是完整合并以最新请求为准，用户后来要求完整视频时直接完成合并，不再要求其手动剪辑或重渲整片。

“使用copy”不是保护范围的完整证明。可直接复用的区间检查实际IDR/GOP、参数集、像素格式/色彩和时间基准；拼接工具是否自动转换也以实际packet为准。需要保证压缩流原样保留时，核对未改视频packet payload与完整原音轨packet内容/时间戳；无法原样copy时如实记录必要的桥接编码，不宣称整片无损。追加小改只使完整依赖受影响的补丁失效，能证明源码、输入与配置未变的已验证补丁可继续复用；冻结硬链接不原地改写。

媒体异常先对比最终输出与源素材同时间状态；源正常不代表本次合成正常。需要原生源帧缓存时保持源尺寸/帧率、准确入出点和全局时间映射，再按时间线选源帧，不能删帧、光流插帧或改变源动作掩盖故障。此方法是已验证局部修复路径，不代表所有视频都要抽帧，也不证明不同帧率是唯一根因。

## 收尾与交付

完整视频唯一放本期 `02_最终输出/`；代码、合同、快照、预览与 QC 保留在本期制作目录。更新 `delivery.json` 或现有交付索引，记录每段 ID、全局范围、实际文件、规格、声音、hash、QC 与认可状态。

局部新版放到原预览对应行最上方，保留用户判断、备注、图文顺序与历史。合并使用每段当前有效文件，在实际最终MP4的修改区域验证变化，再核对前端src；改版本名或链接不能代替改画面。保存来源分辨率，1080p放大到4K须明确说明。

向 Fred 提供可点击文件和简短修改说明；有明确飞书发送要求则读取当前目标、上传/发送实际最终文件并保存回执。未获发送要求时本地交付即可。不要把任务队列受理、文件存在、云端路径或飞书上传开始写成已送达。

云服务的任务完成、是否仍有运行任务与资源状态依据 live 状态报告；有既有明确关机授权才关闭，不因 Skill 自行购买或关闭资源。

### 验证实际运行入口

文件更新后仍要检查当前服务的真实命令/进程、页面数据源和视频身份。异步加载按真实metadata端点与readiness核对，不从静态HTML没有视频JSON推断未更新；必要时只重启对应服务并沿用原入口，重启前后验证反馈和图片仍完整。媒体支持Range时确认实际返回、文件范围与当前MP4相符；不能只改版本标签、另开一个端口或沿用旧服务就称已挂新版。

验证器报错先分清断言/路径错误与产物故障。中文或空格文件URL使用结构化路径API，例如Node的 `fileURLToPath`；容器的平均帧率可能有舍入，用合理容差并结合标称帧率、实际帧数和完整PTS判断，不能靠放宽容差接受丢帧/时钟漂移。检查失败和修正结果留在已有回执，未通过不写完成。

共享实例按最新有效电源要求和实际任务归属收尾；历史“保持开机”或后续“必须关机”分别保留其适用阶段，不中断其他活跃任务。交付索引记录真正生效的入口、composition、源码快照及hash，局部patch目录也需明确，不能仅留下已不再调用的根src。

## 动作配音

实际需要音效时读[动作音效绑定](sound-effects.md)，按动作cue选择已入库素材；增强版已含+8dB，不重复加增益。新场景混音须单独检查。
