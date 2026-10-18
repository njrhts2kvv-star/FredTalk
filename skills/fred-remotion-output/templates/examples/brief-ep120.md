# EP120 Gemini 4 Argon · 整期简报 v1（主会话定，分身照做）

授权：Fred 2026-10-14“直接做视频……云端 1080p30 渲染给我，加过渡和封底，章节过渡用最新组件，其他内容也可以用新组件或额外做更好质量的”。= 直出授权（不等关键帧确认）；本期场景级定制默认允许；可为本期内容做更好的本期小件（场景内），不入公共库。

工程：`03_制作过程/remotion/ep120-v1`。时间轴 `src/timing.json`（60fps 帧；场景按秒写，`useT()` 取秒）。口播卡点一律 `cue('Sxx', n)`（本段第 n 句起点，0 起）/`cueEnd`，不手填秒数。段时长 `segSec('Sxx')`。字幕和口播由外壳自动加，场景只管画面和音效。

必读（写代码前）：
- `skills/fred-remotion-output/references/episode-assembly.md` 第 2–7 节（录屏包装、交接、去重、强调、排版、开头结尾、角标）、`DESIGN.md` 第 2 节。
- 119 期同骨架的场景写法：`00_每期项目/119_Github 超好用工具推荐/03_制作过程/remotion/ep119-v1/src/scenes/*.tsx`（真实文件在归档盘，软链可读），尤其 `Upscayl.tsx` 首帧接 INSERT 末帧的写法。
- 共享件：`src/components/g4.tsx`（本期：CHAPTERS/VERDICTS/VerdictChip/ModelChip/ClipWindow/SourceTag/ChapterHeader/INSERT_LAST_CARD）、`src/components/ep.tsx`（BlackPill、Shot/viewAt/fit、Label、Check、CodeCard、FrostFocus、FrostLayer、sinkStyle）、`src/components/ckit.tsx`（MiniKeys、CodexBox 等）、`src/kit/*`（theme、ui：Frame/Brand/Sfx/Spotlight/Cursor/ClickRing/MacWindow）。**共享件只由主会话改**；你需要新的共享件，写在自己的 Group 文件里（本期小件），或报给主会话。
- 新章节过渡组件源码（Fred 已全部认可入库）：`skills/fred-remotion-output/assets/reference-code/fred-chapter-transitions-20-20261014/source/src/components/T12*.tsx`、`T20*.tsx`（+ `_shared.ts`），样片 `previews/*.mp4`、缩略 `thumbnails/`。用法：把动作拆进本期场景（去掉它自带的开场收尾，接本期交接），底层用本工程 kit。

## 全片规则（违反就返修）

- 画面里不出现任何真人（素材已裁好，别再用原片）。第三方视频作主内容播放时**关掉右上角标**（`<Frame brand={false}>` 或按区间显隐），左下加 `SourceTag`（例：`YouTube · Peter Yang`、`YouTube · Prompt Engineering`、`Arena`、`抖音 · 神烦老狗`）。口播里不念博主名。
- 不慢推（单次运动 ≤1.4s，常用 0.6s 到位），不定格凑时长，每 2–3 秒有可见变化；录屏纯滚动 ≤2s。大字停 >2s 要带出第二个变化。
- 入场用 `settle()`（无过冲），不用回弹抖动。不用紫框、黑框、黑描边方块；强调用 `Spotlight`（压暗 0.6）、阴影抬起、毛刷高亮。紫色只点缀关键词。
- 关键内容 y ≤ 900（字幕区），左右 ≥80px，避开右上角标区（x>1540,y<130）。主体够大、居中，不“上重下空”。卡片逐张加入时每步整组居中。
- 毛玻璃：全片只留约 2 处“毛玻璃+一句胶囊”（本期给 S03“前端：不太行”和 S10“另一个选择”），其余毛玻璃上放完整组件、黑白交替。白底上不压全屏黑玻璃。
- 音效走 `Sfx`；`gather/scroll/ding/notify` 全片各 ≤2 处带 `keep`（分配：ding keep 给 S06 六轮对上、S09 写作第一；gather keep 给 S01 章节卡汇聚；其余不 keep）。
- 口播提到的数字/名词要上屏（第九、1678/1811、520、一百万、三个多小时、六轮、57/60/64、一个半小时→十分钟、V/B 键）。
- 每个场景函数上方第一行注释写动作来自哪个组件（T12k、T20j、T14 数字落定、T09m 键帽、INT03 输入框…）。
- 讲解结构类组件全片只用一次（成绩单只在 S10；输入框“提示词”外形可以复用，因为是同一对象）。

## 素材

- 测评片段：`public/media/clips/<name>.mp4`（1920×1080，已裁掉真人、无音轨），索引 `public/media/clips/clips.json`（每段 content + moments 片段内秒数），联系表 `03_制作过程/media-prep/clips/sheets/<name>.jpg`。片段名：y01-home-gemini、y01-home-astra、y01-starfox-gemini、y01-starfox-opus、y05-scene-gemini（/y05-islands-gemini）、y05-plane-gemini、y02-music、y06-rebuild、y06-fieldguide-a/b/c、y06-pendulum、y04-review、y03-davinci、x04-fps、x03-car、f01-race、f02-chess。国内静帧：`public/media/clips/d01-v1-1..5.png`（五风格网站第一版）、`d01-v2-1..3.png`（反馈后第二版）。**以 clips.json 实际存在的为准**，缺的按 brief 换同类。
- logo：`media/logo-gemini.png`（Gemini 星形，透明底）、`media/logo-google.png`、`media/claude-mark.png`、`media/claude-app-icon.png`、`media/x6-logo-chatgpt.png`、`media/x6-logo-doubao.png`；若有 `media/logo-gemini-wordmark.png` 可用。
- 榜单/官方截图（若有）：`public/media/web/arena-webdev*.png`、`aa-*.png`、`google-blog*.png`；数字以 `01_输入素材/公开素材/README.md` 为准。没有截图时用 kit 重建数据卡（数字照下表），左下 SourceTag 写出处。
- 数据（来源核过）：Arena WebDev 10/13 快照 Gemini 4 Argon high 第 9 名 1678，Opus 5.5 max 1811（初步排名）；Artificial Analysis Terminal-Bench 4.0：Sonnet 5.5 63.6%、Opus 5.5 59.6%、GPT-6 Astra 59.1%、Gemini 4 Argon 57.1%（AA 图表原值；上屏可写 64/60/59/57%）。截图：public/media/web/arena-webdev-top14.png（第1–14名，第1 Opus 5.5 max 1811，第9 gemini-4-argon-high 1678）、aa-terminal-bench-chart.png、aa-intelligence-index-chart.png、google-blog.png、google-blog-header.png。图鉴：520 种、3 小时 22 分、100 万 token、1500+ 交叉引用只错 1 个（作者自述）。截图复刻：约 6000 像素高、6 轮。达芬奇：1.5 小时访谈 → 2 条提示词 → 10 分钟。

## 分段方案（观众要看懂的变化）

| 段 | 字幕 | 时长 | 组 | 画面方案 |
|---|---|---|---|---|
| S01 | 1–7 | 19.0 | A | c0 发布会式揭示（T20g：Gemini 星形 logo 旋转放射落定 → “Gemini 4 Argon”逐字揭开 → 模型名黑胶囊砸下）。c1 T20j 黑底快切：“曾经的神”砸出，接一串 “Flash” 小胶囊连续堆上来（只写 Flash，不写版本号）。c2 logo 从“神坛”（白色台座）上掉下来，豆包 logo + “美国豆包”胶囊盖章。c3 新一代旗舰：官方演示 f01/f02 在大窗里开播（或 Google 博客截图）+ “新一代旗舰”胶囊。c4 毛玻璃（白）上一枚问题胶囊“能不能重振威风？”。c5–6 五张章节卡（CHAPTERS 五项；口播只念四个名词，照图复刻那张在“一块一块”时亮起）依次点亮；最后 0.3s 五张卡一起轻压，交给 INSERT。 |
| INSERT | — | 6.03 | 固定 | 109 过渡画面 + TTS 人声，不改 |
| S02 | 8–21 | 37.5 | A | 首帧 = INSERT 末帧（`media/insert-last.png`，照 119 Upscayl 写法）大黑卡收成 **T12k 翻页序号** 黑卡：00→01 翻页，“前端”接出，然后收成左上 ChapterHeader(1)。c1–3“以前最强/有没有更强”：Gemini logo 卡 + 皇冠/“前端最强”标签（过去式）→ 问号“更强？”。c4–6 测试方法：一个提示词输入框（白卡，不画 Codex 品牌，内容“重新设计我的个人主页 · 不给参考”）打字 → 分出 4 个模型小胶囊（Opus 5.5 / GPT-6 Astra / Gemini 4 / Muse，Muse 无 logo 用纯字），“不给参考”划掉参考图图标。c7–8 y01-home-gemini 大窗：镜头推到文字最密处，Label“一屏全是字”。c9–10 Gemini 窗退到左，y01-home-astra 从右压上，Spotlight 标语和订阅框。c11–13 五风格网站：d01-v1 五张静帧卡（T20l 卡片快扫）逐张扫过、各停 ≤1.2s，最后五张并排，盖“密密麻麻 · 没有留白”。 |
| S03 | 22–37 | 36.3 | A | 首帧 = S02 末态（五张卡并排）。c0–2 输入框浮起，打字“太密了，没有留白，不够高级”→发送。c3 五张卡翻面成 d01-v2 第二版（有留白），两个勾“有留白”“不再蓝紫”。c4 第二版卡上做“卡顿”（画面一顿一顿 + 小胶囊“动效还是卡”）。c5–6 y05-scene-gemini 大窗，Spotlight 飘在半空的小人、乱长的树。c7 **毛玻璃(黑)+胶囊“前端：不太行”**（全片 2 处之一），同时 VerdictChip(1) 盖章。c8–9 榜单数据卡：Opus 5.5 1811 在上，Gemini 4 Argon 1678 第 9（数字滚动落定），中间“前面一截”的差距线；有 arena 截图就先显截图再推到两行。c10–15 实习生类比：一张“个人主页”白卡，对话气泡“帮我做个主页”→ 各种块（课程、播客、简介、按钮、徽章…）一块块砸进来堆满溢出；两根条“功能 ▲满 / 审美 ▼”。末 0.4s 内容沉出，只剩白底 + 左上 ChapterHeader(1)。 |
| S04 | 38–52 | 29.3 | B | 首帧 = 白底 + 左上 ChapterHeader(1)。c0 **T12m 方块翻转**：标题飞到中央变成长条方块“01 前端”，向上翻一面成“02 游戏”，再收回左上 ChapterHeader(2)。c2–3 y01-starfox-gemini 大窗（“Gemini 4” ModelChip），右上小窗 y01-starfox-opus（“Opus 5.5”）对照，“比较挤”。c4–5 MiniKeys（T09m）：V 按下时画面切第一人称、B 按下时召唤战舰（按 clips.json moments 对齐，必要时调 from）。c6–7 两枚胶囊：“做得出来 ✓”“好看 ✗”。c8–11 两个提示词框并排：Opus 一行“帮我做个星际火狐”→结果卡 ✓；Gemini 框不断加行（风格、配色、光影、UI…）变长 → 才“差不多”。c12–14 y05-plane-gemini 大窗，最后定在卡住那一帧 + 红色“卡住了”标签（这是有意的“卡住”表现，可豁免定格，但 ≤1.5s）。 |
| S05 | 53–61 | 19.9 | B | 首帧 = S04 末态（飞机窗）。窗口退后缩成一张卡。c1–3 “以前”：终端卡里红色报错一行行冒出（`npm ERR!`、`Module not found`、`Cannot start`，自己重建，不要截别人终端）。c4–5 报错被清掉 → 四个能跑的作品缩略窗同时播放（x04-fps、x03-car、y01-starfox-gemini、f02-chess）+ 勾。c6–7 y02-music 放大，音波脉冲，Label“一句话”。c8 进度条“能玩 ——— 真正好用的软件”，标记停在左边“还差得远”。VerdictChip(2) 盖章。末 0.4s 沉出到白底（保留左上标题直到 S06 接管）。 |
| S06 | 62–70 | 24.4 | B | 首帧 = 白底 + ChapterHeader(2)。c0 **T12q 解码定格**：乱码逐字锁定成“03 照图复刻”，再收成 ChapterHeader(3)。c1–2 “明确参照”：一张长截图（竖长图卡）从上落下。c3–6 y06-rebuild：原图/复刻左右并排，轮次计数 1→6 每次“对比”闪一下，相似度条拉满；ding(keep) 在第 6 轮。c7–8 两栏结论：“自由发挥审美 ✗”“给张图照着做 ✓”。VerdictChip(3)。 |
| S07 | 71–83 | 26.3 | B | 首帧 = S06 末态。c0 **T12o 穿过序号**：巨大“04”，镜头穿过数字空心进入“长任务”，收成 ChapterHeader(4)。c1 “主打卖点”（可用 google-blog 截图一闪）。c2–3 **T20o 数字狂跳**：0 → 1,000,000 token。c4–8 y06-fieldguide-a/b 大窗 + 数字卡：520 种、3 小时 22 分、1,000,000 token（落定）。c9–12 两个开关：Gemini App 里“百万输出”灰掉/开不了；API 配置代码卡（`background: true`、`max_output_tokens`）里才打开。末 0.4s 沉出到白底 + ChapterHeader(4)。 |
| S08 | 84–98 | 33.8 | C | 首帧 = 白底 + ChapterHeader(4)。c0 “不放心”。c1–6 y06-pendulum：真实视频 vs 模拟并排，第三轮“严丝合缝”匹配度条满 → 打开代码，一根“看不见的弹簧”被画出来（虚线弹簧拉住摆臂）→ “看着对了 / 物理更错”两枚胶囊 → “会钻空子”。c7–9 y04-review：bug 列表逐条亮，其中“接口地址可能泄露”一条用 Spotlight。c10–11 审查意见卡：一行“统计：xx%”被盖红章“不存在”（不写具体假数字，用 ?? 占位）。c12–14 Terminal Bench 条形图（四根：Sonnet 5.5 64、Opus 5.5 60、GPT-6 Astra 59、Gemini 4 Argon 57，逐根长出、数字滚动），Gemini 那根高亮。VerdictChip(4)。 |
| S09 | 99–112 | 30.2 | C | c0 **T12s 左右合拢**：“05”从左、“写作”从右撞成一枚胶囊 → ChapterHeader(5)。c2–5 访谈稿卡 → 三份改写稿（Opus / GPT-6 Astra / Gemini 4 小 logo）并排，和“作者终稿”逐份比对，Gemini 那份抬起“最像本人” ding(keep)。c6–7 一段又长又啰嗦的灰字段落被压缩成两行。c8–10 y03-davinci 大窗；时间条“1.5 小时”压缩成“10 分钟”，“2 条提示词”；Label“人再过一遍”。c11–12 三个勾胶囊：写文案、整理资料、做研究。VerdictChip(5)。 |
| S10 | 113–125 | 29.0 | C | c0 Gemini logo 回到中央 + “重振威风了吗？”。c1–4 **成绩单**（全片唯一）：五行 = 五章 VerdictChip 逐行落定，配合口播“前端没有更强 / 代码和游戏离 Opus 5.5 和 GPT 有差距 / 写作和长任务有进步”逐行高亮。c5–9 三张模型卡：Claude Code（红章“疯狂封号”）、GPT（“也就那样”灰掉）、Gemini 4 抬起 → **毛玻璃(白)+胶囊“另一个选择”**（全片 2 处之二）。c10–11 两枚建议胶囊：“写文案、做研究 ✓”“前端：给张参考图”。c12 “以上就是本期的内容”停稳，不加行动号召。之后自动接封底。 |

## 交接表

| 接缝 | 上一段末态 | 下一段首态 | 动作 |
|---|---|---|---|
| S01→INSERT | 五张章节卡 | INSERT 原片首帧 | 卡片轻压后直接切（固定插入，同 119） |
| INSERT→S02 | 白底大黑卡（INSERT_LAST_CARD） | 同一张卡 | 收缩成 T12k 黑卡 |
| S02→S03 | 五张 d01-v1 卡并排（几何在 A 组内自定） | 同 | 输入框从下浮起 |
| S03→S04（A→B） | 白底 + ChapterHeader(1)（at=-5 常驻态） | 同 | 标题飞到中央成 T12m 方块 |
| S04→S05 | 飞机窗 | 同一窗 | 窗退后缩成卡 |
| S05→S06 | 白底 + ChapterHeader(2) | 同 | T12q 解码 |
| S06→S07 | B 组内自定 | | |
| S07→S08（B→C） | 白底 + ChapterHeader(4) | 同 | C 组自定 |
| S08→S09、S09→S10 | C 组内自定 | | |
| S10→封底 | 停稳 | 封底原片 | final.py 自动拼 |

ChapterHeader 常驻态：`<ChapterHeader t={t} ch={n} at={-5} />`（at 为负表示开场就已在左上）。跨组接缝两侧都只用这个状态，别的不留。

## 分组与自检

- A 组：S01–S03 → `src/scenes/GroupA.tsx`；B 组：S04–S07 → `GroupB.tsx`；C 组：S08–S10 → `GroupC.tsx`。只改自己的文件（可在 `src/scenes/` 下另建 `A-*.tsx` 之类的子文件）。
- 自检出图只写到 `qc/self/<组>/`。出图：`SCALE=0.5 node tools/stills.mjs qc/self/<组> S02:0.5,3,7 S03:1,2`（第一个参数是输出目录），每段至少首、末、每个主要动作停稳 + 中间态；用 Read 自己看图，对照上面全片规则逐条查。
- 完成标准：`npx tsc --noEmit -p .` 通过；每段关键帧自查过；本地对自己每段渲 1080p30 预览（`node tools/render30.mjs S0x`，产物 out/p30/），跑 `python3 /absolute/fredtalk/skills/fred-remotion-output/scripts/motion_audit.py --dir out/p30 ...` 只看自己的段，阻止级问题改掉或写豁免理由到 `qc/motion-exempt-<组>.md`。
- 返回：每段用了哪些组件动作、交接是否按表、自检看了多少张图、仍不满意的点。

## v2 变更（2026-10-14，Fred 改稿后重配音）

- 音频换成 v3（`public/audio/voice-v3.wav`，SRT `rec/voice-v3-display.srt`；v3 只修了两处 Claude 前的停顿），`src/timing.json` 已重建。段落和每段字幕条数都没变，**cue() 写法自动跟上，不要手填秒数**。新段长：S01 18.2、S02 38.07、S03 36.4、S04 31.62、S05 20.27、S06 24.33、S07 25.95、S08 33.38、S09 30.13、S10 27.57。
- 口播改动：开头只念“Gemini 4”（不念 Argon）；所有“Opus 5.5 / Opus”改念“Claude”；S08 末句改为“它的成绩也不如 Claude，也不如 GPT”；S10 问句改为“所以 Gemini 4 重振威风了吗”。
- 画面跟口播一致：开场大字用“Gemini 4”（Argon 可以小字副标）；和 Opus 的对照处标“Claude”（ModelChip 的 opus 已改为 name “Claude Opus 5.5” / short “Claude”）；S08 条形图四根照旧（Claude Sonnet 5.5 64%、Claude Opus 5.5 60%、GPT-6 Astra 59%、Gemini 4 Argon 57%），口播“不如 Claude，也不如 GPT”时 Claude 两根、GPT 一根依次高亮。

## 片段已到（2026-10-14 主会话）

`public/media/clips/` 已就位：22 个 mp4 + 8 张 d01 静帧（`d01-v1-1..5.png`、`d01-v2-1..3.png`，1380×800，不是 16:9）+ `clips.json`（file 字段已是 `media/clips/xxx.mp4`）。联系表在 `03_制作过程/media-prep/clips/sheets/`。注意：
- **y04 没有真实代码审查画面**（原片只有 webhook 示意动画 `y04-review-a`/`y04-review`）：S08 “找出好几个 bug”改为本期重建的审查报告卡（bug 列表逐条亮，“接口地址可能泄露”用 Spotlight），可以用 y04-review 的 webhook 示意动画作为一小段背景/插画，不要假装是代码审查截图。
- **y03 DaVinci 画面很碎**（a 3.7s Media Offline 时间线、b 文件列表、c 节点图，未确认是 DaVinci）：S09 达芬奇那句以本期重建为主——一条 1.5 小时长时间线压缩成 10 分钟、两个提示词气泡、“人再过一遍”标签；y03 片段最多当一闪而过的背景，不要依赖。
- y01-starfox-gemini：0–7s 是开始菜单，8s 起游戏；按 V 第一人称约 12–17s，按 B 召唤战舰约 22–26s。
- y05 片段顶栏模型名已裁掉，画面上用 ModelChip 标“Gemini 4”。群岛 `y05-islands-gemini` 也可用。
- y06 系列是原作者二次加工的展示画面（黑底小图 + 手写批注），整段可用；moments 有 1–2s 误差，用前看联系表。
- y01-home-astra 页面里的人物插画是 AI 生成插图，不是真人，可以用。
- clips.json 的 moments 是片段内秒数；接到口播卡点时用 `from` 调起播点。

## 云端渲染要求（Fred 2026-10-14 11:1x）

“今天云端实例不太够用，所以做完不要关机。”——本期云渲染完成、下载校验后**不关机**，在交付时明确告诉 Fred 实例仍在计费。
