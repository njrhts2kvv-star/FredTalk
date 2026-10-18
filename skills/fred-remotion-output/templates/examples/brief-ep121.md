# EP121 本周 AI 热点 · 整期简报 v1（主会话定，分组照做）

授权：Fred 2026-10-14“开始做视频，记得过渡动画和封底动画，参考 120 期推进，渲染 1080p 30fps 给我看，注意章节动画”。= 直出授权（不等关键帧确认）；本期场景级定制默认允许（为本期重写场景，动作取自已认可组件，底层照用 kit）。

工程：`03_制作过程/remotion/ep121-v1`（下称 P）。时间轴 `src/timing.json`（60fps 帧；场景按秒写，`useT()` 取秒）。口播卡点一律 `cue('Sxx', n)`（本段第 n 句起点，0 起）/ `cueEnd` / 句内词 `wd('Sxx', n, '词')`，**不手填秒数**。段时长 `segSec('Sxx')`。字幕和口播由外壳自动加，场景只管画面和音效。

## 必读（写代码前）

- `/absolute/fredtalk/skills/fred-remotion-output/references/episode-assembly.md` 第 2–7 节、`.../fred-remotion-output/DESIGN.md` 第 2 节。
- 120 期同骨架的场景写法（质量标杆，可直接借写法）：`/absolute/project 4 Argon/03_制作过程/remotion/ep120-v1/src/scenes/*.tsx`（GroupA S02 的 ChapterFlip 接 INSERT 末帧、GroupB S04 的方块翻面和提示词卡、B-s0607、C-S08/S09/S10）。
- 本工程共享件（**只由主会话改**；需要新共享件写在自己的组文件里）：
  - `src/components/chap.tsx`：CHAPTERS、ChapterHeader/HeaderStay、headerBox/headerCenter、wd/slam/moveBox/sinkK、BIG/WIN、Clip/ClipSchedule/ImgCard、MarkPill、StatCard，以及五种章节过渡 **ChapterFlip（T12k）/ChapterCube（T12m）/ChapterDecode（T12q）/ChapterZoom（T12o）/ChapterMerge（T12s）**。
  - `src/components/ep.tsx`：BlackPill、Shot/viewAt/fit、Label、Check、CodeCard、FrostFocus、FrostLayer、sinkStyle。
  - `src/components/g4.tsx`：ClipWindow、SourceTag、INSERT_LAST_CARD、MarkIcon（其余是 120 的东西，别用 120 的 CHAPTERS/VERDICTS）。
  - `src/kit/*`：theme（S、p、q、quintic、settle、typed、textWidth）、ui（Frame/Brand/Sfx/Spotlight/Cursor/ClickRing/MacWindow/Media/Pill/Surface）。

## 全片规则（违反就返修）

- **画面里不出现真人正脸/近景讲话**（素材清单已标好可用区间，别越界）。远处做演示的研究员（Reflex 扔箱子的人）可以；店员脸、广告演员脸、采访都不行。唯一例外：S10 议员原声那一句（新闻当事人，主会话已定），只用那 4 秒。
- 第三方/官方视频作主内容播放时**关掉右上角标**（`<Frame brand={false}>`，回到白底讲解时按区间 `<Brand />`），左下加 `SourceTag`（例：`来源：Reflex 论文演示`、`Google DeepMind`、`Physical Intelligence`、`NVIDIA`、`YouTube · 第三方实测`、`Apple`、`扬子晚报`、`三湘都市报`、`抖音 · 产品君`、`抖音 · 赛博自由老爹`、`ElevenLabs / UK Parliament`）。口播里不念博主名。
- 不慢推（单次运动 ≤1.4s，常用 0.6s 到位），不定格凑时长，每 2–3 秒有可见变化；录屏纯滚动 ≤2s。大字停 >2s 要带出第二个变化。录屏/视频窗里要读的字要推近到 ≥24px。
- 入场用 `settle()`（无过冲），不用回弹抖动。不用紫框、黑框、黑描边方块；强调用 `Spotlight`（压暗 0.6）、阴影抬起、毛刷高亮。紫色只点缀关键词。
- 关键内容 y ≤ 900（字幕区），左右 ≥80px，避开右上角标区（x>1540,y<130）。主体够大、居中，不“上重下空”。卡片逐张加入时每步整组居中。
- 毛玻璃：全片只留 2 处“毛玻璃+一句胶囊”（S01“AI 开始自己动手了”、S10“不再只是回答你”——都由对应组做），其余毛玻璃上放完整组件、黑白交替。白底上不压全屏黑玻璃。
- 音效走 `Sfx`；`gather/scroll/ding/notify` 全片各 ≤2 处带 `keep`（分配：ding keep → S05 七连中第 7 个、S08 日程加好；gather keep → 不用）。其余随意用 woosh/whoosh-short/pop/click/typing/slide（看 `public/sfx/` 实有文件）。
- 口播提到的数字/名词要上屏：一秒、两百斤/空杆、API 测试版、7 连中、8 步、两秒/快一倍多、6.0→6.4、Windows/安卓 App/崩溃记录、7 英寸、11 月 13 号、12 点半/12 点、超分/补帧/HDR、Decision-1、17%。
- 每个场景函数上方注释写动作来自哪个组件（T12k、T20j、T14 数字落定、INT03 输入框、108 大播放窗、T09n 跳切、INT02 蒙版聚焦…）。
- 讲解结构类组件全片只用一次（例：三步流程链只在 S03 用一次；对比两栏只在 S05 观点处用一次）。

## 素材

视频：`public/media/clips/<name>.mp4`（1920×1080 无音轨；qwen-clip 是 1080×1920 竖屏），索引 `public/media/clips/clips.json`（含 duration、sheetInterval）。联系表 `03_制作过程/media-prep/sheets/<name>.jpg`：第 k 张（0 起，左→右、上→下）= k×sheetInterval 秒。**用之前自己看联系表定 from**，下面的秒数是主会话估的区间。静图：`public/media/stills/`（`stills.json` 有宽高）。logo：`media/logo-gemini.png`、`logo-gemini-wordmark.png`、`logo-google.png`、`claude-mark.png`。120 期测评片：`media/clips/y01-home-gemini.mp4`（Gemini 做的个人主页，密密麻麻；from 1.5 起首屏）、`y06-rebuild.mp4`（照图复刻：3.6s 长截图，18–30s 六轮对比每轮约 2s，32.5s 原页/复刻并排）。

主会话已看过抽帧的可用区间（约值，±3s）：
- reflex-5m（已裁掉右侧扔箱人，6s）全可用；reflex-carry（72s，远处研究员可）全可用；reflex-teaser（30s）约 8–25s 多宫格对比 + 机载 RGB/深度图。
- sgs-nut / sgs-gear 全可用（纯机械臂）；sgs-hl 前 ~45s 真机，后面四足/机械臂是**仿真**（只配“仿真”字样）。
- pi-loader（官网标 2 倍速，画面加“2×”小角标）、pi-almond、pi-weave 全可用；pi-chef 偶有人手入画，可用。
- nv-warehouse（7s 仿真仓库人形搬箱）、nv-alpamayo（前 40s 城市仿真幻灯式）。
- g4-cornhole（103s）：0 标题 → ~6s Gemini 界面 → 19–26s 机器人与终端 → ~45s 仿真/实拍并排 → ~51s 人类扔沙包视频（小窗有机器人）→ ~64s 仿真轨迹标注 → 70–90s 实拍连投；**~88–97s 有研究员围电脑，别用**。
- g4-spot（88s）：机器狗踩踏板丢罐，含仿真（~27s）与第一视角。g4-yam（6s 机械臂）、g4-sketch（草图→仿真，上下白边）。
- g-work（102s 纯 UI 动画）：24–64s 工作界面/多代理；~70–80s 模型菜单（有 Claude 选项）。
- qwen-turbo（263s，海外博主）：0–32s 测速（~8–16s 有 “Seconds per image” 表：RTX 5090 1024² Turbo 2.0s / Base 4.5s）；53–158s 生成图对比（海报 NORTHERN LIGHTS、透明酒杯、六人合照——这些人像是 AI 生成图，可用）；215–237s ComfyUI。
- rea-mini（39s 第三方纯屏幕演示）全可用。
- homeview（188s 广告）：**只用设备特写**：0–10s 开场产品、~58–65s 视频通话屏、~105–140s 屏幕操作/门铃、~175s 结尾屏。演员脸不要。
- qwen-glasses（95s 扬子晚报）：只用 48–80s 手/手机/耳机盒镜头。qwen-clip（竖屏 40s）：前 15s 有店员和广告演员脸，**只用约 17–25s 手机日程界面**。
- comfy-vfx（30s 3D 赛车 + 超分/补帧/HDR 标签）全可用。meta-ui（93s 聊天界面，字小，推近）。decision1（10s 图表）。
- el-parl（61s 议会）：全片当事人入镜。只用 S10 主会话指定的两处：~33–36s 议会远景、37.85–41.95s 原声那句。原声音频 `audio/el-line.wav`（4.1s，已调响度）。
- 静图：g4-header、g-work-header、qwen-poster/rgba/comp/comp-input、rea-card/hopper/showcases、hv-*（Apple 产品图，先看图里有没有人脸再用）、qwen-n1/n1pro/earbuds/hero、splice2、rtx-eco、el-poster（可能是人像，慎用）。抖音帧候选 `stills/dy-cpj-*.jpg`（产品君）、`dy-lb-*.jpg`（赛博自由老爹，左下有头像小窗的帧不要；只用无头像的 Star 曲线帧）——S07 组自己挑。

## 章节与交接

五章，左上常驻章节头（`<HeaderStay t ch />`）。每章开头用一种不同的 T12 过渡（已写好在 chap.tsx，调用即可）：

| 章 | 段 | 过渡 | 调用 |
|---|---|---|---|
| 01 机器人干活 | S02、S03 | T12k 翻页（从 INSERT 末帧大黑卡撑满） | `ChapterFlip({ch:1, fromBox: INSERT_LAST_CARD, flipAt≈0.7, titleAt≈1.1, collapseAt≈c(1)-0.35})`；首帧先画 `media/insert-last.png` 全屏（照 120 S02） |
| 02 Gemini 4 | S04、S05 | T12m 方块翻面 | `ChapterCube({prev:1, now:2, at: wd('S04',1,'Gemini')-0.5, back: …+1.6})` |
| 03 软件更新 | S06、S07 | T12q 解码 | `ChapterDecode({prev:2, now:3, at:0})` |
| 04 AI 进家 | S08 | T12o 穿过序号 | `ChapterZoom({prev:3, now:4, at:0})` |
| 05 快速过几条 | S09 | T12s 合拢 | `ChapterMerge({prev:4, now:5, at:0})` |
| 结尾 | S10 | 无章节头：首 0.3s 章节头 5 整体淡出 | |

交接表（上一段末帧 = 下一段首帧）：

| 接缝 | 上一段末态 | 下一段首态 | 动作 |
|---|---|---|---|
| S01→INSERT | 三张结果卡一排 + 日期章 | INSERT 原片 | 直接切（固定插入，同 120） |
| INSERT→S02 | 白底大黑卡（`media/insert-last.png`，`INSERT_LAST_CARD`） | 同一张卡 | ChapterFlip 撑满 |
| S02→S03 | 白底 + 章节头 1（末 0.4s 内容沉出） | 同 | — |
| S03→S04（A→B） | 白底 + 章节头 1 | 同 | — |
| S04→S05 | B 组内自定（建议：投沙包窗口不断，S04 末窗口几何 = S05 首窗口几何） | | |
| S05→S06 | 白底 + 章节头 2 | 同 | ChapterDecode |
| S06→S07 | 白底 + 章节头 3 | 同 | — |
| S07→S08（B→C） | 白底 + 章节头 3 | 同 | ChapterZoom |
| S08→S09、S09→S10 | 白底 + 章节头 4 / 5 | 同 | — |
| S10→封底 | “以上就是本期的内容”停稳 | 封底原片 | final 自动拼 |

跨组接缝两侧都只用“白底 + 左上常驻章节头”这个状态（`<HeaderStay t={t} ch={n} />`），别的不留。段尾沉出用 `sinkStyle(sinkK(t, T))`。

## 分段方案（观众要看懂的变化）

下表 c(n) = cue(段, n)。每段口播原文看 `src/timing.json`。

### A 组：S01–S03 → `src/scenes/GroupA.tsx`（可另建 `A-*.tsx`）

| 段 | 时长 | 方案 |
|---|---|---|
| S01 开头（产品君式快报开场） | 17.5 | 0 帧就是**全屏实拍**（reflex-5m 接箱，角标关）+ 左上**渐变胶囊贴纸“一周 AI 大事”**（紫 #8554E8→#B57BEE 渐变，白字粗体，圆角胶囊，带一点阴影，0.3s 内弹入，全程常驻到 c7）+ 画面中央偏上大字黑胶囊“几分钟看完本周 AI 大事”砸下（slam）。c1“这周我最大的感受一句话”：底片快切 sgs-nut → pi-loader（每 0.8–1s 一切，跳切），胶囊换成“这周最大的感受”。c2：**毛玻璃(黑) + 胶囊“AI 开始自己动手了”**（`FrostFocus`，keyWord“自己动手”，全片 2 处之一），背后片子继续播。c3“接住飞过来的箱子”：毛玻璃退，reflex-5m/reflex-carry 接箱瞬间全屏 + Label“接住飞来的箱子”。c4 sgs-nut 全屏 + Label“自己拧螺母”。c5–6 el-parl 议会远景（~33–36s，不要近景人脸）+ Label“失声议员 重新开口”，c6 加一条声波（紫色波形条）在 Label 下方。c7“全都是这周发生的”：画面收成白底，三张结果卡（接箱/拧螺母/议会，各自冻结在最好的那帧）一排居中，上方盖章胶囊“10.8 – 10.14”砸下；角标开。段末停稳直切 INSERT。 |
| S02 机器人① Reflex + SGS | 30.5 | 首帧 = insert-last 全屏 → ChapterFlip(01 机器人干活)，collapse ≈ c1-0.35，之后常驻章节头 1。c1 WIN 窗（留出章节头）播 reflex-teaser，Label“Reflex · 华盛顿大学团队”。c2“人把箱子扔过去”跳到 reflex-5m 起点。c3“摄像头看到 一秒之内”：跳到 teaser 的机载 RGB/深度图画面 + 右侧计时胶囊 0.0→1.0 秒滚动落定（T14）。c4“腿、腰、两只手一起反应”：回到接住瞬间（可 0.5 倍速），三枚小标签“腿”“腰”“双手”依次弹在对应身体位置旁。c5“接住之后搬着走、交到人手上”：reflex-carry 跳切到搬运/交接段，上方三步胶囊“接 → 搬 → 交给人”逐个点亮。c6“第二个更狠，叫 SGS”：窗口翻面换成 sgs-hl 仿真段 + Label“SGS”。c7“只在仿真里练”：标“仿真”角标。c8“一次真实示范都没给过”：大号计数卡“真实示范 0 次”砸下。c9“直接上真的机械臂”：窗口一分为二 sgs-nut | sgs-gear，各自标“真机 · 拧螺母”“真机 · 装齿轮”。c10–13 健身教练类比：窗口沉出 → 一根横向难度条（左“太简单”右“太难”），三张杠铃卡依次出现在条上方：c11“200 斤”在右端（红叉 + 卡片发抖一下？不，抖动禁用→改为压暗+叉）、c12“空杆”在左端（叉）、c13 滑块落到中间偏右“刚好够难”（勾、卡片抬起）。段末 0.4s 内容沉出，只剩白底 + 章节头 1。 |
| S03 机器人② Pi + NVIDIA | 28.4 | 首帧白底 + 章节头 1。c0“第三个”：小号序号胶囊“③”接 c1 BlackPill“Physical Intelligence”，c2 下方弹出白胶囊“API 测试版”。c3–4 **三步流程链（全片唯一）**：三张卡横排居中——“机器人数据”（文件卡 + 上传箭头）→ “云上训练”（云卡，进度条跑满）→ “直接调用”（黑色按钮被光标点下，ClickRing）；数据卡沿连线飞进云卡。c5“你看他们放出来的演示”：流程链沉出，2×2 四宫格窗口按口播逐格点亮——c6 前半“装载机”pi-loader（加“2×”角标）、c6 后半“机械臂加工零件”pi-almond、c7 前半“后厨打饭”pi-chef、c7 后半“叠衣服”pi-weave；当前那格放大抬起，其余压暗（Spotlight）。c8“同一套能力，换一个身体”：四格回到等大，中央黑胶囊“同一套能力”压上，四格各贴小标签“装载机 / 双臂 / 后厨 / 叠衣”。c9–10“连练习场都让 AI 来搭”：四宫格沉出，BlackPill“练习场也让 AI 搭”。c11–13 NVIDIA：WIN 窗播 nv-warehouse（循环或跳切到 nv-alpamayo 城市段补时长），c12 三枚胶囊“仓库”“货架”“传感器”按词弹出，c13 Label“人形机器人在里面搬箱子”。段末沉出到白底 + 章节头 1。 |

### B 组：S04–S07 → `src/scenes/GroupB.tsx`（可另建 `B-*.tsx`）

| 段 | 时长 | 方案 |
|---|---|---|
| S04 Gemini 4（从 120 期实测接到机器人） | 25.9 | 首帧白底 + 章节头 1。c0“说到让 AI 自己搭练习场”：BlackPill“AI 自己搭练习场”。c1“就不得不说 Gemini 4”：ChapterCube(1→2)。c2“正式开放”：g4-header 官方头图大卡落定 + 盖章胶囊“10.13 正式开放”。c3“之前我专门测过它，前端没有更强”：头图让位，WIN 窗播 y01-home-gemini（密密麻麻页面），窗上小卡“我之前的实测”；MarkPill(bad)“前端：没有更强”。c4“密密麻麻，审美没跟上”：窗内推近到最密的字区（viewAt），Label“密密麻麻”。c5–6“但它有一个特点……给它明确参照就做得到”：MarkPill(good)“给明确参照：做得到”从下方抬起，旧的压暗。c7–8：窗口换 y06-rebuild：c7 长截图（3.6s），c8 跳到 18s 起 2 倍速播六轮，右上计数胶囊“第 1 轮 → 第 6 轮”逐个跳，到并排画面时 Label“改到几乎一样”。c9–10“这周谷歌的机器人视频，刚好把这个能力用到现实里”：rebuild 窗缩到左侧小卡（标“照着网页改”），右侧 g4-cornhole 窗从右压上（标“照着动作练”），中间一个箭头/连线；c10 末尾 rebuild 小卡退出，cornhole 窗长到 S05 首帧几何（建议 = BIG 或 WIN，自定，写清楚给自己用）。 |
| S05 投沙包 + 机器狗 + 观点 + 工作代理 | 38.7 | 首帧 = S04 末 cornhole 窗。顶部四步胶囊条（全段只这一次）：①看人扔 ②搭仿真 ③试了再调 ④连中 7 个，按 c1/c2/c3/c4 逐个点亮，窗口同步跳切到对应片段（人类扔沙包 ~51s、仿真并排 ~45s、轨迹标注 ~64s、实拍连投 70–88s）。c4“连续扔进了七个”：右侧七个沙包圆点逐个点亮（跟连投节奏），第 7 个 `Sfx ding keep`。c5–6 机器狗：窗口跳到 g4-spot，先仿真段再实拍踩踏板丢罐，Label“先仿真练 → 再踩踏板丢罐”。c7–10 观点（对比两栏，全片唯一）：窗口沉出，两张卡——左“帮你写好看的页面”（y01-home-gemini 冻结缩略，压暗、灰）、右“看懂动作 → 自己搭场地 → 自己练会”（cornhole 缩略 + 三行逐行点亮，卡片抬起），右卡落在 c9–c10。c11“顺便说个细节”：两栏沉出。c12–13 WIN 窗播 g-work（工作界面），三枚胶囊“写文档”“查资料”“多个代理一起干”按词弹。c14–15“你猜怎么着，模型菜单里可以直接选 Claude”：跳到模型菜单那几秒，推近到菜单（字 ≥24px），光标移到 Claude 那一行点下（ClickRing + click 音），Spotlight 只亮那一行，Label“可以直接选 Claude”（带 claude-mark 小图标更好）。段末沉出到白底 + 章节头 2。 |
| S06 Qwen-Image 2.1 Turbo | 17.7 | 首帧白底 + 章节头 2 → ChapterDecode(2→3, at 0)（约 2.05s 收回左上）。c1 BlackPill“Qwen-Image 2.1 Turbo”。c2“八步就能出图”：8 个小圆点从左到右依次点亮，最后一个点亮时一张 qwen-poster 小图“出图”弹出。c3–4：WIN 窗播 qwen-turbo 测速表画面，推近到 RTX 5090 那一列（字 ≥24px），Spotlight 亮“2.0s”和“4.5s”；旁边 StatCard 或两根条“Turbo 2 秒 / 基础版 4.5 秒”，c4 落“快一倍多”。c5–7：跳切到对比画面——c5 海报文字那组、c6 前半透明酒杯、c6 后半六人合照，每切一次窗内推到那一对图，两侧小标签“Turbo”“基础版”；c7 MarkPill“几乎看不出差别”。SourceTag“YouTube · 第三方实测”。段末沉出到白底 + 章节头 3。 |
| S07 REA + 国内博主观点 | 25.8 | 首帧白底 + 章节头 3。c0“之前我讲过的 REA”：rea-card 官方卡落定（ImgCard）。c1“6.0 一口气更新到 6.4”：大号版本号翻页数字 6.0 → 6.1 → 6.2 → 6.3 → 6.4（每步 0.15s 左右，落定在 6.4，T14/T12k 翻页手法），旁边一串 release 小胶囊堆叠。c2–3：rea-hopper 截图做底（推近），三枚能力胶囊“Windows 软件”“安卓 App”“崩溃记录”按词弹出。c4“国内好几个博主也在聊它”：两三张抖音帧卡片扇形快速发出（每张停 ≤1.5s，T20l 卡片快扫手法），左下 SourceTag 写对应博主。c5–6：一张赛博自由老爹的 Star 曲线帧（无头像那张）+ 引语卡“以前只有顶级黑客才能做的事 → 现在你也能干”（两行，第二行在 c6 出）。c7–9：换产品君那张“任何网站APP只要发给agent就能分析”的帧 + 引语卡“任何网站、软件 → 发给 Agent → 分析出怎么做的”（三段按 c7/c8/c9 出）。c10–11“看懂一个软件，门槛被拉得很低”：WIN 窗播 rea-mini（第三方演示，SourceTag“第三方演示”），右侧一根竖向“门槛”条从高位降到低位（c11），配 slide 音。段末沉出到白底 + 章节头 3。 |

### C 组：S08–S10 → `src/scenes/GroupC.tsx`（可另建 `C-*.tsx`）

| 段 | 时长 | 方案 |
|---|---|---|
| S08 AI 进家：HomeView + 千问耳夹 | 27.3 | 首帧白底 + 章节头 3 → ChapterZoom(3→4, at 0)。c1“苹果发布了 HomeView”：hv-lineup 产品大图卡落定（先看图，挑无人脸的；没有就用 homeview 片头 0–10s 产品特写帧）。c2“七英寸”：设备旁出尺寸标注线 + 胶囊“7 英寸”。c3“认出家里不同的人”：homeview 片里屏幕识别/切换用户的设备特写段（只要屏幕，不要人脸；不确定就用 hv-recog 图并检查），Label“认出家里不同的人”。c4“Siri 聊天、控家电”：设备屏幕操作段（~105–140s）推近到屏幕，两枚胶囊“Siri 聊天”“控家电”。c5“预订，11 月 13 号才发货”：时间线条两点“10.13 预订”→“11.13 发货”，点依次落定。c6–7“千问的 AI 眼镜和耳夹耳机，这周开卖”：qwen-n1 / qwen-n1pro / qwen-earbuds 三张产品图（透明底或白卡）横排居中依次落定，c7 盖章“10.13 开卖”。c8“我最喜欢的这个细节”：三张图收拢，只留耳夹耳机图移到左侧。c9–11：耳夹旁弹出语音气泡，打字机跟口播打出“今天中午 12 点半有个会”“麻烦 12 点提醒我”（两行），typing 音。c12“手机上的日程直接加好了”：右侧手机外框（圆角黑框手机，竖屏）里播 qwen-clip 约 17–25s 的手机日程界面，Spotlight 亮“会议 12:00”那一行，`Sfx ding keep`。SourceTag：Apple / 扬子晚报 / 三湘都市报。段末沉出到白底 + 章节头 4。 |
| S09 快速过几条 | 29.6 | 首帧白底 + 章节头 4 → ChapterMerge(4→5, at 0)。四条快讯用同一种外壳：一张大窗/大卡居中 + 左上角小号序号胶囊“1/4”…“4/4”+ 右侧 2–3 枚要点胶囊；条与条之间用 T20l 卡片快扫（当前卡向左滑走缩小，下一张从右滑入），全段同一个节奏。① c1–2 NVIDIA × ComfyUI：comfy-vfx，胶囊“超分”“补帧”“转 HDR”按词弹，再出“在你自己的显卡上跑”。② c3–5 Meta Muse Wonder：meta-ui 推近到聊天里，胶囊“记性好”；c4“你之前说过的事它会记住”时一条旧消息卡从上方飞进一个“记忆”小卡，c5“接着帮你办”。③ c6–8 微软 Decision-1：decision1 图表片，名字胶囊“Decision-1”，三枚胶囊“分类”“分派”“排优先级”，c8 一个秒表胶囊“几秒钟”。④ c9–12 Illumina SpliceAI2：splice2 静图卡，c10 一条 DNA 双链（简单线条示意）上一个变异点被圈出（用 Spotlight 或圆点高亮，不要黑框），c11–12 StatCard“+17%”“疾病相关变异（公司研究对比）”。段末沉出到白底 + 章节头 5。 |
| S10 结尾：失声议员 + 总结 | 33.2 | 首 0.3s 章节头 5 淡出。c0“最后这条，我这周最想让你看到的”：BlackPill“最后一条”。c1“英国上议院有一位议员”：WIN 窗播 el-parl 议会远景（~33–36s，可慢一点，必要时冻结在远景帧上叠缓慢变化的组件，**不要播到近景人脸**），SourceTag“UK Parliament”。c2–3：窗口让位，卡片“脊髓性肌萎缩症”→ 下方一根“说话能力”条从满降到很低。c4–6 三步：左“以前的录音”（三条灰色旧声波卡）→ 中“ElevenLabs”（黑胶囊）→ 右“重建的声音”（紫色声波，开始跳动），c6“在议会里完成了发言”右侧接一个议会小图标/胶囊“议会发言”。c7“话是她自己写的，声音也是她自己的”：两枚勾胶囊“话：她自己写的”“声音：她自己的”。c8 **原声**（cue('S10',8) 起）：BIG 窗播 el-parl 从 37.85s 起 4.1s（自带英文字幕），同时 `<Sequence from=…><Audio src={staticFile('audio/el-line.wav')} /></Sequence>`（原声，不走 Sfx 限量），角标关。c9“所以说 AI 不再只是在对话框里回答你了”：**毛玻璃(白) + 胶囊**（全片 2 处之二）——一个空的对话框卡居中，胶囊“不再只是回答你”。c10“接箱子、拧螺母、走进家里”：对话框散开，三张小卡从中心飞出排成一排（接箱、拧螺母、HomeView 产品图，复用前面素材的冻结帧），按词逐张。c11“帮一个说不出话的人把话说出来”：第四张卡（紫色声波）加入，整组重新居中。c12“OK 以上就是本期的内容”：四张卡轻轻收拢停稳，不加行动号召。之后自动接封底。 |

## 分组与自检

- 只改自己组的文件（`GroupA.tsx` 可拆 `A-*.tsx`，B、C 同理）。**不改** `chap.tsx`、`ep.tsx`、`g4.tsx`、`kit/*`、`lib/*`、`index.tsx`、`scenes/index.ts`、`timing.json`、`episode.json`。需要改共享件就在返回里写明。
- 自检出图只写 `qc/self/<组>/`：`SCALE=0.5 node tools/stills.mjs qc/self/A S01:0.2,1,3,5 S02:0.5,1.2,3 ...`（第一个参数是输出目录）。每段至少首、末、每个主要动作停稳 + 中间态；用 Read 看图，对照全片规则逐条查（特别是：真人脸、角标显隐、字幕区遮挡、上重下空、慢推）。
- 完成标准：`npx tsc --noEmit -p .` 通过；每段关键帧自查过并改完；本地渲本组每段 1080p30 预览 `node tools/render30.mjs S01 S02 S03`（产物 `out/p30/`，CONC 默认 8，组之间会抢 CPU，渲染时用 `CONC=4`），跑 `python3 /absolute/fredtalk/skills/fred-remotion-output/scripts/motion_audit.py --help` 看用法后只查自己的段，阻止级问题改掉或写豁免理由到 `qc/motion-exempt-<组>.md`。
- 返回：每段用了哪些组件动作、交接是否按表、自检看了多少张图、仍不满意的点、要主会话改的共享件。
