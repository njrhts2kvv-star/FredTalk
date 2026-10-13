# 视觉值出处（Style Kit 源码依据）

本文记录 [DESIGN.md 第 2 节](../DESIGN.md)和 `templates/component-kit/src/kit` 里每个数值，取自哪个已认可组件的哪一行源码。日常制作读 DESIGN.md 第 2 节即可；要追溯或调整某个值时再读本文。2026-10-12 为新做组件提取，16 条新组件（`fred-native-16-20261012`）就是按这些值做的。

只读提取，日期 2026-10-12。根目录 `R=/absolute/fredtalk`，`RC=$R/skills/fred-remotion-output/assets/reference-code`。
引用格式 `文件:行号`。所有几何均为 **1920×1080 逻辑坐标**，另有说明的除外。

## 0. 锚点 → 当前源码（以 dependency-registry `currentVisualBindings` 为准）

注意：catalog.json 中 X003/X006/X019/L81-* 的 `entryPoint` 指向 `…/FredTalk视频/每期处理/skills/...`（旧路径）。**当前绑定**是下面这些（purple-surfaces / font-standardization 修订版）。

| 锚点 | 组合ID / 时长 | 当前源码 | 运行时 |
|---|---|---|---|
| L81-R053 三胶囊记录前/中/后 | Motion053, 411f | `RC/purple-surfaces-20261002/projects/44c34e8b8289d9d4/groups/r/faithful/src/Clip053.tsx` + `specs/R053.json` | library-remakes-20260916 |
| X019 规则窗口黑窗打字 | X019, 540f | `RC/font-standardization-20261002/projects/ef9fc0c824930a7b/src/XScenesB.tsx:21-24` | preferred-motion-v2 |
| L81-W01 逐字输出光标 | W01, 216f | `RC/purple-surfaces-20261002/projects/6d8ce81d71a39cf1/groups/ctw/core/src/RebuiltW01.tsx` + `specs/W01.json` | approved-motion-library |
| N027 流程线绕回 | N027, 558f | `RC/material-replacements-20261004/components/projects/30b3c05aa839/src/calibration-c/ChalkBoard.tsx`（经 `BatchC.tsx:411`） | preferred-motion-v2 |
| X003 显存条件黑胶囊 | X003, 420f | `RC/purple-surfaces-20261002/projects/ef9fc0c824930a7b/src/RebuiltX003.tsx` + `src/timelines/X003.json` | preferred-motion-v2 |
| L81-T03 圆点展开为胶囊 | T03, 135f | `RC/purple-surfaces-20261002/projects/d514c6d2c464749b/groups/ctw/core/src/RebuiltT03.tsx` + `specs/T03.json` | approved-motion-library |
| 107-04 三项汇聚长胶囊 | EP107CapabilitiesMerge, 420f (3840×2160) | `RC/material-replacements-20261004/components/projects/7210437846d3/src/R6LateMotion.tsx:91-118`（片段=整期 Film 10320–10740f） | preferred-motion-v2 |
| C034 章节白条擦出标题 | ep87-part-03, 120f (3840×2160) | `RC/font-standardization-20261002/projects/3cfdda47a9f107a6/src/Transition.tsx:45-58`（kind=reveal） | approved-motion-library |
| X006 三项清单 | X006, 360f | `RC/purple-surfaces-20261002/projects/ef9fc0c824930a7b/src/RebuiltX006.tsx` + `timelines/X006.json` | preferred-motion-v2 |
| INT04 WeChatConversation | WeChat-Neutral, 750f | `RC/interaction-components-20261007/source/src/WeChatConversation.tsx` | approved-motion-library（render.cjs 锁 4.0.519） |
| CAM01 3D录屏运镜 | CAM01, 720+48f | `RC/screen-camera-selected-20261007/source/camera/src/CameraExamples.tsx` + `manifest.json` + `RaisedInput.tsx` | screen-camera-three-v1 |
| OP03 圆形入口展开视频窗 | OP03, 240f | `RC/expansion-selected-20261007/source/src/OpeningScenes.tsx:12` + `shared.tsx` | preferred-motion-v2 |
| RC04 段落提起归位 | RC04, 480f | `RC/expansion-selected-20261007/source/src/RecordingScenes.tsx:74-83` | preferred-motion-v2 |

所有锚点：fps=60。

## 1. Canvas

- **规范做法：1920×1080 逻辑舞台 + 父层整体 `scale(width/1920)` 输出 4K。**
  - `RC/expansion-selected-20261007/source/src/shared.tsx:15` `Frame`: `<div style={{position:'absolute',width:1920,height:1080,transform:\`scale(${width/1920})\`,transformOrigin:'0 0',overflow:'hidden'}}>`
  - `RC/material-replacements-20261004/.../7210437846d3/src/ApprovedEpisode.tsx:69-75` `FilmScaled`：同样 1920 舞台 `scale(width/1920)`；Composition 为 3840×2160（`library-entry.tsx:17`）。
  - `RC/font-standardization-20261002/projects/3cfdda47a9f107a6/src/Transition.tsx:62` 同上；Composition 3840×2160（`src/index.tsx:8`）。
- 其余锚点 Composition 本身就是 1920×1080（X/N 系 `src/index.tsx:16`；expansion `index.tsx:24`；interaction `index.tsx:13-18`；camera `CameraExamples.tsx:117`）。
- 旧复刻有非 1920 内部坐标：R053 Clip053 在 1280×720 元数据下用 `scale(0.666666667)` 包 1920 舞台（`Clip053.tsx:7,13`）；X003 时间线源坐标 ×1.5（`RebuiltX003.tsx:11`，`timelines/X003.json coordinateScale:1.5`）；WeChat 用 2370×1136 设计舞台 `scale=min(w/2370,h/1136)`（`WeChatConversation.tsx:39-41`）。
- 规则（DESIGN.md:69）：1920 逻辑画布整体放大到 4K 保持几何；角标/字幕若在 1080 舞台内，用 1080 值且不得再 ×2（corner-branding.md:32）。
- 时间：多数源以秒 `t=frame/fps` 驱动；X003/X006 时间线是 30fps 源采样 `f=t*30`（`RebuiltX003.tsx:8`）；R053/W01/T03 是逐帧测量轨迹（`runtime/clip-spec.ts:15-29` 线性插值）。

## 2. Fonts（绝对路径）

事实源：`$R/skills/fred-remotion-output/references/typography-registry.json`（五家族，2026-10-02）。

| id | @font-face family（注册表） | weight | OS/2 | 绝对路径 |
|---|---|---|---|---|
| misans-regular | Fred MiSans | 400 | 330 | `$R/skills/fred-remotion-output/assets/reference-code/library-remakes-20260916/purple/public/026/MiSans-Regular.otf` |
| misans-medium（默认正文） | Fred MiSans | 500 | 380 | `$R/skills/fred-remotion-output/assets/episode-code/ep94-v5/public/Medium.otf` |
| misans-semibold | Fred MiSans | 600 | 520 | `$R/skills/fred-remotion-output/assets/episode-code/ep94-v5/public/Semibold.otf` |
| misans-heavy（默认重点） | Fred MiSans | 900 | 700 | `$R/skills/fred-remotion-output/assets/reference-code/library-remakes-20260916/purple/public/026/MiSans-Heavy.otf` |
| ruizi 锐字真言体 | Fred RuiZi | 400（单字重，勿合成） | 400 | `$R/skills/fred-remotion-output/assets/reference-code/ep103-selected-20260930/source/public/fonts/RuiZi.ttf` |
| smiley 得意黑 | Fred Smiley | 400 | 400 | `$R/skills/fred-remotion-output/assets/reference-code/library-selfpick24-20261001/source/public/fonts/SmileySans-Oblique.ttf` |
| wenkai 霞鹜文楷 | Fred WenKai | 400 | 400 | `$R/skills/fred-remotion-output/assets/reference-code/library-remakes-legacy81-20260929/sources/0fd2c72a22c4c3a740815c67b96b84afafa0395cebf268e76872e8c25b198c02/groups/ctw/core/public/fonts/ctw/LXGWWenKai-Regular.ttf` |
| source-code | Fred Source Code | 600 | 600 | `$R/skills/fred-remotion-output/assets/reference-code/library-remakes-new10-20260928/project/public/fonts/SourceCodePro-Semibold.otf` |

（8 个文件均已核实存在。）`defaultDisplay=['misans-heavy','ruizi']`，`defaultBody=['misans-medium']`。

锚点里的实际加载方式（family 名各源不同，注意对齐）：
- expansion `shared.tsx:5,13`：`font:'Fred MiSans'`，用 `new FontFace` 加载 500=`fonts/Medium.otf`、600=`fonts/Semibold.otf`、900=`fonts/MiSans-Heavy.otf`、`Fred Smiley` 400，`delayRender` 等待；文字统一 `fontSynthesis:'none'`（`shared.tsx:15,19`）。
- 107 `ApprovedEpisode.tsx:41`：`MiSans` 400/600/700(=Heavy 文件)，`RuiZi` 700，`SourceHanHeavy`→`MiSans-Heavy.otf` 900，经 `FiveFontFace`。
- `five-fonts.ts:3-18`（各 purple/font-standardization 项目根）：把旧字体映射为五家族——SourceHanSans/SourceSans3/RobotoCondensed/MiSans-Bold→`MiSans-Heavy.otf`；AlimamaShuHei→`RuiZi.ttf`；MuYao/LongCang→`LXGWWenKai-Regular.ttf`；NotoSansSC 可变字重：≥700→Heavy，≥600→Semibold，其余→Medium。所以 R053 的 `OfficialShuHei 700` 实际渲染为 **RuiZi**（`useShuHei.ts:4`），W01/T03 的 `CTWHeavy`（Noto 100–900）渲染为 **MiSans Heavy/Medium**（`RebuiltGrid.tsx:7`）。
- X 系 `src/fonts.ts:8-29`：family `MiSans` 400/500/600/700/900 + `RuiZi`（以 700 注册）。
- 规则：`font-synthesis:none`；字体加载完成后再出帧（typography.md:20）。

## 3. Colors

| 角色 | 值 | 出处 |
|---|---|---|
| 页面底 | `#fff` | `shared.tsx:15`；`ApprovedEpisode.tsx:52`；X 系 `index.tsx:14` |
| 黑面（胶囊/卡） | `#19191c`（109/expansion）；`#111114`（107 INK）；`#171719`（X/N 系 INK）；纯 `#000`/`black`（R053、T03、X003、字幕） | `shared.tsx:5`；`library/SelectedMotion.tsx:18`；`BatchA.tsx:23`；`Clip053.tsx:19`；`RebuiltT03.tsx:6` |
| 深窗口面 | `#212123` 体 / `#161618` 标题栏（X019）；`#222225` / `#151517`（W01）；`#202124` / `#111315`（C007） | `XScenesB.tsx:23`；`specs/W01.json objects.window` |
| 白面 | `#fff`（无描边） | `shared.tsx:17` |
| 正文墨色 | `#19191c` / `#171719` | `shared.tsx:5`；X `index.tsx:14` |
| 次级灰 | `#6c6c72`（muted）；章节标签 `#c9c9c9`（黑底）；WeChat 日期 `#a3a3ab`、卡片行 `#9c9ca4` | `shared.tsx:5`；`Transition.tsx:21`；`WeChatConversation.tsx:49,57` |
| 紫·深底 | `#D6BEFF`（`DARK_PURPLE`/`LIGHT`/`accentDark`） | `surface-purple.ts:2`；`SelectedMotion.tsx:20`；`shared.tsx:5` |
| 紫·浅底 | `#8554E8`（`ACCENT`/`accent`） | `SelectedMotion.tsx:19`；`shared.tsx:5`；X 系 `overrides.accent??'#8554E8'` |
| 紫色换算 | `purpleOnDark(color)`：色相 h∈(3.9,5.1)（紫段）→ `#D6BEFF`，否则原色 | `surface-purple.ts:9-13` |
| C034 白条 | `#e6e6e6`（条上文字 `#000`），底 `#000` | `Transition.tsx:55-56,61` |
| 光标块 | `#bdbdbd`（X019）；`#fff`（W01） | `XScenesB.tsx:23`；`RebuiltW01.tsx:6` |
| 字幕 | 底 `#000`，字 `#fff` | `SmileySubtitle.tsx:60` |

紫色用法：只染关键词/当前项，例如 R053 第3字“前/中/后”`color:j===2?DARK_PURPLE:'white'`（`Clip053.tsx:19`）；W01 只染 `'记录项目时间主题'` 中字（`RebuiltW01.tsx:6`）；107 胶囊内文字 `LIGHT`（`R6LateMotion.tsx:114,129`）；X003 第二段“+量化模型”/全句 `purpleOnDark(accent)`（`RebuiltX003.tsx:12`）；X006 序号 `1、2、3、` 紫、标签白（`RebuiltX006.tsx:25-26`）；浅底大字强调用 `#8554E8`（`R6LateMotion.tsx:38`）。DESIGN.md:28：判断的是文字所在承载面（白画布上的黑胶囊=深底→`#D6BEFF`）。

## 4. Surfaces

### 4.1 阴影（精确 CSS）
- **当前默认软阴影（109/108 规范）**：`0 16px 25px 0 rgba(0,0,0,0.1333333333)`（`shared.tsx:5`；= FullscreenVideoWindow 0/16/25/0, alpha 2/15，`fullscreen-video-window-geometry.ts:2-11`）。
- X/N 系：`0 16px 32px rgba(0,0,0,.13)`（`BatchA.tsx:30`）；N 系 Pane `0 14px 36px #17171916`（`BatchC.tsx:44`）。
- 107：`22px 18px 27px #0004`（`R6LateMotion.tsx:15`）；阅读卡 `12px 18px 38px #0002`（`:27`）。
- 复刻系右下投影（黑胶囊“立体感”）：T03 胶囊 `30px 22px 25px #0005`、媒体卡 `30px 20px 24px #0004`（`RebuiltT03.tsx:6`）；W01 窗 `30px 20px 29px #0005`；X003 `35px 18px 20px #0005`（`RebuiltX003.tsx:11`）；X019 窗 `-25px 6px 35px #0003`（`XScenesB.tsx:23`）。
- 文字投影（深色窗内白字）：X019 `8px 9px 5px #000`；X006 `8px 8px 6px #000`；W01 `2px 2px 3px #000`；C007 `5px 7px 6px #0009`；浅底大字 `8px 11px 14px #0002`（`R6LateMotion.tsx:123`）。

### 4.2 胶囊
- 胶囊 = `borderRadius: h/2`（或 999）+ 实心黑 + 无描边 + 文字居中（`Clip053.tsx:19`；`shared.tsx:18`）。
- R053 稳定尺寸 640×258，cx=960，cy=[231,540,850]（行距 ~310），字 168px（`specs/R053.json objects.pills`；`Clip053.tsx:19`）。
- T03 稳定框 x229 y361 1462×358，radius 93（≈h×0.26，横向拉长后不再是全圆角），字 165px weight 900（`specs/T03.json`）。半径公式：`max(radius, min(w,h)/2*clamp(2-w/h))`（`RebuiltT03.tsx:6`）——接近正方时为圆，宽高比>2 后取测得半径。
- X003（1920 坐标=源×1.5）：圆点 30→255px，展开为 1185×366 r≈105，再延长到 1686×270；字 171→145px，letterSpacing -1.1（`timelines/X003.json`；`RebuiltX003.tsx:11-12`）。参数化版本 ConditionCapsule：230px 圆 → 1160×350 r90 → 1720×280（`BatchA.tsx:52`）。
- 107 汇聚结果胶囊：460,316.5,1000×330，radius 165（=h/2），字 `fitSize('ChatGPT',476,130)`（`R6LateMotion.tsx:94`）；三项媒体卡 470×355 r36 → 240×180（`:105-108`）；列表胶囊 650×220 r58、字 126（`:126-129`）。
- 内边距：多数胶囊不写 padding，用固定宽 + flex 居中；fitSize 规则 `min(cap, width/字宽单位)`，拉丁字计 0.58（`SelectedMotion.tsx:32-33`）；`layoutFor` 类组件另算。字幕胶囊 padding `13px 23px`（`SmileySubtitle.tsx:59`）。

### 4.3 卡片 / 窗口
- 白/黑卡（109 规范）：radius 24，`S.shadow`，`border:'none'`（`shared.tsx:5,17`）；媒体卡同（`shared.tsx:20`）。
- 全屏主视频窗（跨期默认）：1800×1013.555787 @ (60,33.222106)，r24，阴影 0/16/25 alpha 2/15，无描边，底 `#fff`（fullscreen-video-window.md:9-20；`templates/components/FullscreenVideoWindow.tsx`）。
- Mac 三点标题栏，三种认可规格：

| 源 | 窗口 | 标题栏 | 圆点 | 颜色（左→右） |
|---|---|---|---|---|
| X019 | 1412×1004 @x,52；r36；体 `#212123` | 高 90，`#161618`，paddingLeft 57 | 24px，gap 24 | `#8554E8` `#aaa` `#eee`（`XScenesB.tsx:23`） |
| W01 | 296,80 1328×945；r28；`#222225` | 高 85，`#151517` | 24px，left 53+i*46，top 35 | `#df3099` `#ffc354` `#4289ee`（`specs/W01.json`） |
| X/N Window | r24，`S.shadow`；深 `#171719`/浅 `#fff` | 高 40，深 `#242428`/浅 `#f1f1f4`，paddingLeft 24 | 10px，gap 10 | `#8554E8` `#bbb` `#ddd`（`BatchA.tsx:36`） |
| N027 黑板 | 168,124 1596×850；r26；`#202525` | 高 77，`#0d1111b8`，paddingLeft 47/top 31 | 21px，gap 20 | accent `#d8d8d8` `#919191`（`ChalkBoard.tsx:52-57`） |

### 4.4 毛玻璃 / 遮罩
- 背景退后：X019 背景层 `blur(phase(t,.68,1.25)*16px)`（`XScenesB.tsx:23`）；X006 `blur(12*focus)` + `scale(1+.12*focus)`，focus 在 159–179f(30fps) 归零（`RebuiltX006.tsx:9-10`）；R053 背景视频 `invert(1) brightness(0.7) blur(20px)` + `perspective(1800px) rotateY(-17→-14deg) rotateZ(-7deg) scale(1.5)`（`Clip053.tsx:15`，`R053.json background`）。
- RC04：白色遮罩 `background:'#fff',opacity:.78*p`（`RecordingScenes.tsx:82`）。RC05：白 `.63`。
- FrostedFocus 基元默认：blur 19px，tint 0.58，light=白/dark=黑（`$R/skills/fred-remake/assets/content-motion/motion-state.mjs:36-41`；`ContentMotion.tsx:46-53`）。
- CAM01 RaisedInput：背景 dim `.34*q` + 4px 模糊步长，提起深度 `.006+.344*q`，阴影 blur `(8+24q)px`、y `(2+10q)px`、强度 `(.04+.05q)q`（`RaisedInput.tsx:84-98`）。

## 5. Typography scale（1920 逻辑 px）

| 职责 | 字体/字重 | size / lineHeight / letterSpacing | 出处 |
|---|---|---|---|
| 超大结论（单屏一句） | MiSans Heavy 900 | 150–154；lh 默认 | `R6LateMotion.tsx:101,122` |
| 胶囊大字 | RuiZi(ShuHei映射) 700 / MiSans Heavy 900 | 168（R053）/165（T03）/171→145（X003）/140→116（ConditionCapsule）；lh 1 | `Clip053.tsx:19`；`T03.json`；`RebuiltX003.tsx:12`；`BatchA.tsx:52` |
| 黑窗大标题 | RuiZi 700 | 180；lh 1；居中 | `XScenesB.tsx:23` |
| 清单项 | MiSans 900 | 序号 184 / 标签 177；lh 1；ls -1 | `RebuiltX006.tsx:25-26` |
| 章节标题（C034） | FredMiSans 中文 700、拉丁 600 | title 136，label 82（500，`#c9c9c9`，mb 18）；lh 1.15；中文 ls 0.012em | `Transition.tsx:15-22`；`ep87-part-03/manifest.json` |
| 胶囊内短词（107） | RuiZi 700 | 126；列表标签 78；副句 69–72 | `R6LateMotion.tsx:109,116,129` |
| 黑窗正文行（打字） | RuiZi 700 | 84；lh 1 | `XScenesB.tsx:23` |
| 窗内列表（W01） | MiSans（CTW 300→Medium） | 64；lh 80px | `specs/W01.json` |
| 黑板节点（N027） | MiSans 400 | 84；lh 1.2；ls -3.5；标题 92 | `ChalkBoard.tsx:59,62` |
| 侧注正文 | MiSans 700 | 57；lh 1.28（强调数字 90） | `R6LateMotion.tsx:34` |
| Text 默认 | Fred MiSans 900 | 96；lh 1.16 | `shared.tsx:19` |
| 字幕 | 得意黑 400 | 47.5；lh 1.12；底 #000 r17；minH 101.5；bottom 25.5；maxW 1720 | `SmileySubtitle.tsx:28,57-64` |
| WeChat 气泡（2370 舞台） | PingFang SC | 30 / 42px；卡片行 25/34 | `WeChatConversation.tsx:55-57` |

letterSpacing 默认 0（`R6LateMotion.tsx:12-14`）；负字距只在测量复刻中出现。

## 6. Motion

### 6.1 缓动曲线
- **ease-out 主曲线** `Easing.bezier(.22,1,.36,1)`：X/N 系 `p()`（`BatchA.tsx:24-25`），107 `phase()`（`SelectedMotion.tsx:23-25`）。
- **smoothstep** `p*p*(3-2*p)`：expansion `q()`（`shared.tsx:9`）、107 `ease()`（`R6LateMotion.tsx:8-11`）、页面转场（`ApprovedEpisode.tsx:13-16`）、X019 `phase`（`XScenesB.tsx:8`）、N 系（`BatchC.tsx:30-35`）。
- **章节/擦出** `Easing.bezier(0.65,0,0.2,1)`（`Transition.tsx:12`）。
- **阻尼弹簧（非 Remotion spring）** `1-exp(-8p)*cos(9p)`，默认 0.8s（`shared.tsx:10`）；OP03 用 `springAt(t,.05,.48)` 给 0.85→1 的整体缩放。
- **相机 quintic** `v³(v(6v-15)+10)`（零速度零加速度端点）（`CameraExamples.tsx:16`）。
- WeChat：位移 easeInOutCubic `p<.5?4p³:1-(-2p+2)³/2`，入场 `out3=1-(1-p)³`（`WeChatConversation.tsx:16-17`）。
- 测量复刻（R053/T03/W01/X003/X006）不加缓动，逐帧线性插值实测轨迹（`clip-spec.ts:14`）。
- 锚点中**未使用** Remotion `spring()`。

### 6.2 典型时长（@60fps）
| 动作 | 时长 | 出处 |
|---|---|---|
| 圆点长成圆（R053） | 54→75f = 21f（0→328px），之后 75→90f 拉成胶囊 | `R053.json pill0` |
| 圆点→胶囊（T03） | 0→42f 圆（0→326），42→84f 横向展开（含 1522 过冲后回 1462），~102f 停稳 | `T03.json pill` |
| X003 圆→胶囊 | 24f 成圆（过冲 170→164），~60f 成胶囊；延长 120→140f | `X003.json shell`（30fps×2） |
| 参数化胶囊打开 | 0.8s=48f；延长 0.85s=51f | `BatchA.tsx:52` |
| 107 每项进入 | 0.38s=23f；汇聚 0.72s=43f；结果 0.44s=26f（+0.22s 延迟）；旧项淡出 0.5s | `R6LateMotion.tsx:93-104` |
| 107 列表胶囊 | 0.42s=25f clipPath 横擦 + 28px 平移；字晚 0.12s 淡入 0.28s | `R6LateMotion.tsx:125-128` |
| C034 白条 | 打开 3→30f；上移缩成徽标 36→68f；停稳 68f 起 52f | `Transition.tsx:46`；manifest |
| 页面转场擦除 | 20f smoothstep clipPath inset（横版向右 / 部分竖向） | `ApprovedEpisode.tsx:12,17-24` |
| 媒体叠层淡入淡出 | 16f | `ApprovedEpisode.tsx:28` |
| OP03 圆→视频窗 | q(.18,1.58)=84f；340px 圆 r170 → 1800×1013.56 r24 | `OpeningScenes.tsx:12` |
| RC04 提起/归位 | 提起 .85→1.9s=63f；保持 ~3.1s；归位 5.0→6.15s=69f | `RecordingScenes.tsx:77` |
| X019 背景失焦 | .68→1.25s=34f，0→16px | `XScenesB.tsx:23` |
| WeChat 新消息 | 透明+18px 上移+scale .98→1：0.32s=19f；整列上卷 0.4s=24f | `WeChatConversation.tsx:33,47-51` |
| R053 退出 | 每枚向右加速滑出 ~26f（cx 960→2320，320→346f），最后一枚回中后放大淡出 392→411f | `R053.json` |

### 6.3 Stagger
- R053：三胶囊出现于 54f / 112f / 144f（按口播，间隔 58f、32f）；退出 pill2 先（~335f）→pill1（~343f）→pill0 回中。
- 107：三项 `c(1)+.16 / +1.25 / +2.42` s（≈65–70f 间隔，按口播）（`R6LateMotion.tsx:92`）。
- X006：每行字分 4–6 组逐组点亮，行首 48/71/96f（30fps → 96/142/192f@60），行内组间 2–4 帧@30（`X006.json firstVisible`）。
- 107 证据卡入场 `i*.045s`（~3f）（`R6LateMotion.tsx:53`）；X/N VideoWall `.55+i*.075s`（`BatchA.tsx:51`）；ProductCards `i*.5s`（`BatchA.tsx:56`）。
- 字形分组显隐：T03 8 组（`glyph${floor(i*8/len)}`）、R053 每字一轨、T01 6 组。

## 7. Camera
- 2D“相机”= 对整组 transform 推近/平移，阅读时停稳：107 阅读卡 `mix` 宽 580→1450→1160、left 居中→65（`R6LateMotion.tsx:17-28`）；X020 视频 `scale(1.55/1.8)` 硬推（`XScenesB.tsx:27`）；X006 背景 `scale(1.12)`→1 同步去模糊。
- 3D 录屏运镜（CAM01）：Three.js 透视相机 FOV 35，距离 15.75，屏幕平面 16×9，圆角 0.108，屏后 `#dde0e4` 厚 0.025，背景 `#f9fafb`（`CameraExamples.tsx:10,40,46,93`）。关键帧：yaw ±18–24°，pitch ±5–10°（俯视一次 -24°），zoom 0.94–1.12，焦点 fx/fy；**移动 0.6s、停 0.85–1.65s 交替**，quintic 插值（`manifest.json CAM01.cameraKeys`）。重点高亮在相机到位后 0.3s 刷出（黄 ROI）；源视频在 348–396f 冻结 48f 以供阅读（`CameraExamples.tsx:114`）。
- 媒体时钟连续：冻结用 `<Freeze>` 显式映射，几何变化不重置视频（`RecordingScenes.tsx:18-25`）。
- 规则：推近服务可辨内容、横移服务焦点交接、阅读时停稳，不用全程慢漂（DESIGN.md:53）。

## 8. Brand corner
- 浅底（深紫字）：`$R/skills/fredtalk-deck-motion-pipeline/assets/brand/fredtalk-ai-corner.png`（1198×295，sha256 ed64cc66…）。
- 深底（白字）：`$R/skills/fredtalk-deck-motion-pipeline/assets/brand/fredtalk-ai-dark-transparent.png`（2172×724，sha256 5ab79807…），需先裁 x295 y184 w1528 h341；已裁好副本：`RC/material-replacements-20261004/components/projects/7210437846d3/public/brand/dark.png`（1528×341）。
- 1080 逻辑舞台位置（父层 scale 后不得再 ×2）：浅底 `left 1549.5, top 36, 345.5×85`；深底 `left 1554.5, top 41, 335×75`。4K 直接坐标：3099,72,691×170 / 3109,82,670×150（corner-branding.json）。
- 实现：`ApprovedEpisode.tsx:65` `<Img src={staticFile(dark?'brand/dark.png':'brand/light.png')} style={{position:'absolute',left:dark?1554.5:1549.5,top:dark?41:36,width:dark?335:345.5,height:dark?75:85,zIndex:900}}/>`，在源视频播放时隐藏（`sourcePlaying`，`:50`）；expansion `shared.tsx:14` 只用浅底版 + `objectFit:'contain'`。
- 独立层、固定右上，不随相机/卡片运动；全屏录屏/实拍播放时不加（corner-branding.md:5,15）。

## 9. SFX
库：`$R/skills/fred-remotion-output/assets/sfx/jianying-20260915/`（已烘焙 +8dB；有口播时起始 `volume=0.5`，真峰 ≤ -1dBTP）（sound-effects.md）。

| id | 文件 | 绑定动作 | 触发点 |
|---|---|---|---|
| SFX01 | `01-唰-短转场.wav` | T08,T10,W02,W03 | move-start |
| SFX02 | `02-书本翻页声.wav` | page-turn | change-start |
| SFX03 | `03-叮.wav` | W08,result-confirm | settle（一次） |
| SFX04 | `04-Woosh.wav` | T01,T02,T04,T05,T06,T10 | move-start |
| SFX05 | `05-弹出1.wav` | **T03**, item-enter（胶囊/圆点出现） | reveal |
| SFX07 | `07-提示音.wav` | result-confirm（与03二选一） | reveal |
| SFX08 | `08-打字声.wav` | **W01**（覆盖真实输入区间，停字即停） | interval |
| SFX09 | `09-鼠标单击.wav` | click, search-select | contact |
| SFX11 | `11-卡通弹簧音2.wav` | T01,T03（仅明显回弹） | rebound |
| SFX13 | `13-左右滑动.wav` | T02,T05,T08,W04 | move-start |
| SFX15 | `15-消息提示声.wav` | W04, reply-enter | reveal |
| SFX16 | `16-收线.wav` | T09, line-collapse（聚拢，107汇聚可选） | move-start |
| SFX18 | `18-相机拍照快门声音.wav` | photo-freeze | contact |
| SFX19 | `滚动.wav` | number-scroll | interval |

- 组件内自带：INT04 `public/sfx/message.wav`（仅 incoming / incoming-card，`Sequence from=round(appearAt*fps) durationInFrames=45`，volume .35，`WeChatConversation.tsx:65`）；同目录还有 `click.wav`、`typing-source.wav`（`RC/interaction-components-20261007/source/public/sfx/`）。
- C034：每个章节组合自带整段 `<Audio src={staticFile(\`${clip.stableId}.wav\`)}/>`（`Transition.tsx:64`；`public/ep87-part-0N.wav`）。
- 挂载方式：`<Sequence from={场景局部帧}><Audio src={staticFile('sfx/…')} volume={0.5}/></Sequence>`；同时多动作只选主交接一声；不按每字/每帧触发。

## 10. Runtime（`$R/skills/_runtime/remotion/`，node_modules 均存在）

| runtime | remotion | react | 其它 | 使用者 |
|---|---|---|---|---|
| approved-motion-library | 4.0.519 | 19.2.3 | @remotion/media、bundler、renderer 4.0.519 | W01、T03、C034、INT04 |
| preferred-motion-v2 | 4.0.473 | 19.2.4 | bundler/renderer 4.0.473 | X003、X006、X019、N027、107-04、OP03、RC04（expansion package.json） |
| library-remakes-20260916 | 4.0.515 | 19.2.4 | — | R053（项目 node_modules 是指向它的 symlink） |
| screen-camera-three-v1 | 4.0.451 | 19.2.5 | @remotion/three 4.0.451、three 0.180.0、@react-three/fiber 9.3.0 | CAM01（symlink） |
| codex-episode-1-xhs | 4.0.451 | 19.2.5 | — | 无本次锚点 |

参考项目本身不带 node_modules（或为 symlink）；render.cjs 用 webpack alias 指向 runtime（`interaction-components-20261007/source/render.cjs:2-6` 版本锁校验）。新做组件统一用 `component_kit.py new` 生成的工程，运行时固定为 library-remakes-20260916（4.0.515），与 16 条新组件一致；不在同一工程里混用多个运行时。

## 11. Reusable snippets

### S1. 1920 舞台 + 109 表面 tokens（`RC/expansion-selected-20261007/source/src/shared.tsx:5,9-10,15,17-19`）
```tsx
export const S={ink:'#19191c',dark:'#19191c',muted:'#6c6c72',accent:'#8554E8',accentDark:'#D6BEFF',radius:24,shadow:'0 16px 25px 0 rgba(0,0,0,0.1333333333)',font:'Fred MiSans'};
export const q=(t:number,start:number,end:number)=>{const p=clamp((t-start)/(end-start));return p*p*(3-2*p);};
export const springAt=(t:number,delay:number,duration=.8)=>{const p=clamp((t-delay)/duration);return p===1?1:1-Math.exp(-8*p)*Math.cos(9*p);};
export function Frame({children,brand=true}:{children:React.ReactNode;brand?:boolean}){const {width}=useVideoConfig();
  return <AbsoluteFill style={{background:'#fff',overflow:'hidden',fontFamily:S.font,fontWeight:500,fontSynthesis:'none',color:S.ink}}><Fonts/>
    <div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'0 0',overflow:'hidden'}}>{children}{brand&&<Brand/>}</div>
  </AbsoluteFill>;}
export function Surface({x,y,w,h,dark=false,style,children}:BoxProps){return <div data-fred-surface="exact-109" style={{position:'absolute',left:x,top:y,width:w,height:h,
  background:dark?S.dark:'#fff',color:dark?'#fff':S.ink,border:'none',borderRadius:S.radius,boxShadow:S.shadow,overflow:'hidden',...style}}>{children}</div>;}
export function Pill(props:BoxProps){return <Surface {...props} style={{borderRadius:999,...props.style}}/>;}
export function Text({x,y,w=1600,size=96,weight=900,color=S.ink,align='left',style,children}:{/*…*/}){return <div data-fred-text="exact-font" style={{position:'absolute',left:x,top:y,width:w,
  fontFamily:S.font,fontWeight:weight,fontSize:size,lineHeight:1.16,fontSynthesis:'none',color,textAlign:align,whiteSpace:'pre-wrap',...style}}>{children}</div>;}
```
（`Fonts`/`Brand` 见 `shared.tsx:13-14`。）

### S2. 圆点→黑胶囊 + 逐字打出 + 紫尾（`RC/purple-surfaces-20261002/projects/ef9fc0c824930a7b/src/BatchA.tsx:23-25,30,34-35,52`，折行）
```tsx
const INK='#171719';
const ease=Easing.bezier(.22,1,.36,1);
const p=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{easing:ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const shadow='0 16px 32px rgba(0,0,0,.13)';
const type=(s:string,t:number,a:number,b:number)=>Array.from(s).slice(0,Math.floor(lin(t,a,b)*Array.from(s).length)).join('');
function ConditionCapsule(c:Context){const open=p(c.t,0,.8),extend=p(c.t,3.8,4.65),s=word(c,0,'8G 显存笔记本'),tail=word(c,1,' + 量化模型');
 return <AbsoluteFill><div style={{...abs(960-mix(115,580+280*extend,open),540-mix(115,175-35*extend,open),
   mix(230,1160+560*extend,open),mix(230,350-70*extend,open)),
   borderRadius:mix(115,90,open),background:INK,boxShadow:shadow,...center,overflow:'hidden'}}>
  <Text style={{fontSize:mix(140,116,extend),color:'#fff',whiteSpace:'nowrap'}}>{type(s,c.t,1.25,2.1)}
   <span style={{color:c.accent}}>{type(tail,c.t,4,4.7)}</span></Text></div></AbsoluteFill>}
// Text = fontWeight 700, lineHeight 1.25 (BatchA.tsx:35). 深底时 accent 用 purpleOnDark → #D6BEFF。
```

### S3. 黑窗 + 三点标题栏 + 块状光标打字（`RC/font-standardization-20261002/projects/ef9fc0c824930a7b/src/XScenesB.tsx:8,23`，折行，打字计数改为线性示意）
```tsx
const phase=(t:number,a:number,b:number)=>{const v=clamp((t-a)/(b-a));return v*v*(3-2*v)};
<AbsoluteFill style={{background:'#fff'}}>
 <div style={{position:'absolute',inset:0,filter:`blur(${phase(t,.68,1.25)*16}px)`}}><Workspace/></div>
 <div style={{...box(x,52,1412,1004),borderRadius:36,overflow:'hidden',background:'#212123',boxShadow:'-25px 6px 35px #0003'}}>
  <div style={{height:90,background:'#161618',display:'flex',alignItems:'center',gap:24,paddingLeft:57}}>
   {['#8554E8','#aaa','#eee'].map(c=><span key={c} style={{width:24,height:24,borderRadius:20,background:c}}/>)}</div>
  {strings.map((text,i)=>{const [start,end]=ranges[i]; /* 源: count 来自实测宽度; 线性≈5–10 f/字 */
   const count=f<start?0:f>=end?text.length:Math.floor((f-start)/(end-start)*text.length);
   const showCursor=f>=start&&f<(i<3?ranges[i+1][0]:end+14);
   return <div key={i} style={{...box(18,[192,432,590,750][i],1376,i===0?190:110),fontFamily:'RuiZi',fontWeight:700,
     fontSize:i===0?180:84,lineHeight:1,whiteSpace:'nowrap',color:'#fff',textAlign:'center',textShadow:'8px 9px 5px #000'}}>
    {text.slice(0,count)}{showCursor&&<span style={{display:'inline-block',height:i===0?184:116,width:i===0?62:59,
     verticalAlign:'middle',background:'#bdbdbd',marginLeft:0}}/>}</div>})}
 </div></AbsoluteFill>
// ranges(@60f)=[[86,126],[128,209],[211,267],[269,344]]：标题 10f/字，正文 ≈5–7f/字；光标保持到下一行开始，不闪烁。
```

### S4. 三项按口播建立 → 汇聚长胶囊（`RC/material-replacements-20261004/components/projects/7210437846d3/src/R6LateMotion.tsx:8-15,91-117`，节选）
```tsx
const ease=(t:number,start:number,duration:number)=>{const p=clamp((t-start)/duration);return p*p*(3-2*p);};
const display={fontFamily:'RuiZi',fontWeight:700,fontSynthesis:'none',letterSpacing:0};
const heavy={fontFamily:'SourceHanHeavy',fontWeight:900,fontSynthesis:'none',letterSpacing:0}; // → MiSans-Heavy.otf
const shadow='22px 18px 27px #0004';
export function r6CapabilityState(t:number,c:MotionProps['c']){
  const starts=[c(1)+.16,c(1)+1.25,c(1)+2.42];
  return {starts,entries:starts.map(at=>ease(t,at,.38)),merge:ease(t,c(3),.72),
    result:ease(t,c(3)+.22,.44),x:460,y:316.5,width:1000,height:330,radius:165,fontSize:fitSize('ChatGPT',476,130)};}
// in R6CapabilityMerge:
{words.map((word,i)=>{const enter=s.entries[i],alpha=enter*(1-ease(t,c(3)+.2,.5));
  const width=mix(470,240,s.merge),height=mix(355,180,s.merge);
  const x=mix(150+i*574,960-width/2,s.merge),y=mix(210+(1-enter)*45,480-height/2,s.merge);
  return <React.Fragment key={word}>
    <div style={{position:'absolute',left:x,top:y,width,height,borderRadius:36,background:INK,boxShadow:shadow,overflow:'hidden',opacity:alpha}}><Media src={media[i]}/></div>
    <div style={{position:'absolute',left:150+i*574,top:635,width:470,...display,fontSize:78,textAlign:'center',opacity:alpha}}>{word}</div>
  </React.Fragment>;})}
<div style={{position:'absolute',left:s.x,top:s.y,width:s.width,height:s.height,borderRadius:s.radius,background:INK,boxShadow:shadow,
  opacity:s.result,transform:`translateY(${(1-s.result)*18}px)`,display:'grid',placeItems:'center'}}>
  <div style={{...heavy,fontSize:s.fontSize,color:LIGHT}}>ChatGPT</div></div>
// INK='#111114', LIGHT='#D6BEFF'；c(n)=第 n 个口播 cue 的场景内秒数。
```

### S5. 章节白条擦出 → 上移缩为徽标（C034，`RC/font-standardization-20261002/projects/3cfdda47a9f107a6/src/Transition.tsx:12-16,45-58`）
```tsx
const curve=Easing.bezier(0.65,0,0.2,1);
const phase=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:curve,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const titleStyle={fontFamily:'FredMiSans',fontSynthesis:'none',fontWeight:600,whiteSpace:'nowrap',lineHeight:1.15,letterSpacing:0};
const labelStyle={fontFamily:'FredMiSans',fontSynthesis:'none',fontWeight:500,whiteSpace:'nowrap',lineHeight:1.15,letterSpacing:0};
const BarReveal=({clip,f})=>{
 const open=phase(f,3,30);const travel=phase(f,36,68);const top=482;const h=clip.titleSize*1.15;
 const badgeWidth=clip.labelSize*3.4+24;const badgeHeight=clip.labelSize*1.15+12;
 const barWidth=clip.width+(badgeWidth-clip.width)*travel;
 const barHeight=h*open+(badgeHeight-h)*travel;
 const barTop=top+h*(1-open)+(344-top)*travel;
 const barLeft=(1920-barWidth)/2;
 const text=<><div style={{...layer,left:0,top:350,width:1920,textAlign:'center',...labelStyle,fontSize:clip.labelSize}}>{clip.label}</div>
  <div style={{...layer,left:(1920-clip.width)/2,top,width:clip.width,height:h,clipPath:`inset(${100*(1-open)}% 0 0 0)`,...titleStyle,fontSize:clip.titleSize,textAlign:'center'}}><Title text={clip.title}/></div></>;
 return <><div style={{color:'#fff'}}>{text}</div>
  <div style={{...layer,left:barLeft,top:barTop,width:barWidth,height:barHeight,background:'#e6e6e6',overflow:'hidden'}}>
   <div style={{...layer,left:-barLeft,top:-barTop,width:1920,height:1080,color:'#000'}}>{text}</div></div></>;};
// 背景 #000；titleSize 136, labelSize 82, width 1000；Title: 中文 700 + 0.012em，拉丁 600。
```

### S6. 圆形入口展开为视频窗 + 段落提起归位（`RC/expansion-selected-20261007/source/src/OpeningScenes.tsx:12`；`RecordingScenes.tsx:14,75-83`）
```tsx
// OP03: 340px 圆 (r170) → 1800×1013.56 (r24) 主视频窗；整体 0.85→1 阻尼弹簧
export function OP03({src=media.videoB}:OpeningProps){const t=useT(),p=q(t,.18,1.58),w=mix(340,1800,p),h=mix(340,shell.height,p);
 return <Frame brand={false}><Media src={src} x={(1920-w)/2} y={(1080-h)/2} w={w} h={h} radius={mix(170,24,p)}
  style={{transform:`scale(${mix(.85,1,springAt(t,.05,.48))})`}}/></Frame>;}
// RC04: 录屏 ROI 原位提起 → 放大居中 → 回原位；背景白蒙 .78
const sourceBox=(r:RecordingROI):Box=>({x:FULL.x+r.x*FULL.w/1920,y:FULL.y+r.y*FULL.h/1080,w:r.w*FULL.w/1920,h:r.h*FULL.h/1080});
export function RC04({src=media.recording,start=3,roi={x:1308,y:380,w:536,h:186},clock={freezeFrom:1.7,freezeTo:6.15}}:RecordingSceneProps={}){
  const t=useT();
  const p=q(t,.85,1.9)*(1-q(t,5.0,6.15));
  const origin=sourceBox(roi);
  const target:Box={x:312,y:257,w:1296,h:1296*roi.h/roi.w};
  const box=between(origin,target,p);
  return <Frame brand={false}><RecordingCrop src={src} start={start} clock={clock} box={FULL}/>
   <div style={{position:'absolute',inset:0,background:'#fff',opacity:.78*p}}/>
   <RecordingCrop src={src} start={start} clock={clock} roi={roi} box={box} style={{opacity:p,boxShadow:S.shadow}}/></Frame>;}
// FULL={x:60,y:33.22,w:1800,h:1013.56}（=FullscreenVideoWindow）；clock 用 <Freeze> 冻结源帧供阅读。
```

## 12. 注意事项
- 同一镜内只选一套阴影/黑色系：新组件推荐 **109 规范**（`#19191c`、r24、`0 16px 25px 0 rgba(0,0,0,.1333)`、Fred MiSans 500/900）；需要“立体黑胶囊”观感时用复刻系右下投影（`30px 22px 25px #0005`），二者不混用（DESIGN.md:28“不混用多个默认主题”）。
- 自制胶囊/卡默认无描边（DESIGN.md:22）；N 系 Pane 的 `2px solid #e9e9ec` 是历史细节，新片不继承。
- R053/T03/W01/X003/X006 是逐帧实测轨迹（不可直接改文案长度）；新内容应用 S2/S4 这类参数化写法复现同一曲线形态。
- catalog 中 R053 spec 标注 `qualityStatus: candidate-needs-calibration`、`userAcceptance: not-inherited`——认可的是成片效果，不等于数值普适。


公开分发以仓库 `library/catalog.json` 的当前标签、用途、归档状态、源码路由和可下载媒体为事实源。本文中的生产工程记录只说明方法与历史范围；实际复用请运行 `python3 scripts/catalog.py --id <准确标签> --full`，使用公开源码快照的当前哈希。
