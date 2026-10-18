# 整期工程骨架（114 v2/v3 定型）

114 期 v2/v3 被 Fred 打 90–95 分，这套骨架就是那次的工程结构。新一期照这个搭，场景代码自己写，骨架不用重想。规则见 [整期编排](../../references/episode-assembly.md)。

## 目录

| 文件 | 作用 |
|---|---|
| `episode.example.json` | 本期配置：SRT、口播文件、分段（首末字幕序号）、固定过渡插入点、云端主机和线数、成片路径。复制成工程根目录的 `episode.json` 再改 |
| `tools/build_timing.py` | 按 SRT 切段，生成 `src/timing.json`（全片唯一时间源）。段界取相邻两句的中点；插入段放在 `insert.cutSeconds`（那句话后的静音点） |
| `src/lib/shell.tsx` | 段外壳：每段自动带口播切片和得意黑字幕。场景只写画面和音效；时间用 `cue(id, n)`（本段第 n 句起点）、`cueI(id, srt序号)`，不手填秒数。`getInputProps().noVoice` 只渲音效轨 |
| `src/index.tsx` | 每段一个 Composition，外加 `<EP>-FULL` |
| `src/components/handoff.ts` | 段间交接的共享几何：上一段末态 = 下一段首态，两段 import 同一个常量 |
| `render/plan.py` | 分块计划：每块 ≤420 帧，`heavySegments` 权重 ≥1.5 的段 ≤180 帧；最长处理时间优先分到各渲染线 |
| `render/cloud.sh` | 云端分块渲染：sync [host] / plan / run [host] / go / add / chunk / status / final；服务器台数读 `episode.json` 的 `cloud.hosts`（116 期两台各 8×2） |
| `render/server-bootstrap.sh` | 新服务器装环境：Node 22.16.0、Remotion 4.0.515 运行时、无头 Chrome（已装的跳过） |
| `render/local.sh` | 本机补渲几个返修块（返修少时比开云端快） |
| `render/final.py` | 拼画面（时间基统一 1/90000，可接封底）→ 渲音效轨（`REUSE_SFX=1` 可沿用）→ 拼口播轨 → 混音压峰 → 封装 → 加 BGM → 核对帧数和时长 |
| `render/preview30.sh` + `remote-p30.sh` | 1080p30 预览：同步到一台服务器、打包一次、按段并行渲（默认 3 段 × 每段 3 并发、素材加载等 120 秒、失败重试一次），拉回 `out/p30/`；`ONLY="S02 S08"` 只重渲几段。远端目录读 `episode.json` 的 `cloud.dir` |
| `render/assemble30.py` | 1080p30 预览成片：拼 `out/p30/` 各段（每段音频截到 frames/60，防止越拼越慢）→ 封底 → BGM → 响度检查，默认输出 `02_最终输出/<EP>-preview-1080p30.mp4` |
| `render/loudness.py` | 响度检查：`final.py`、`assemble30.py` 出片后自动测一次，低于 -10 LUFS 只提示、不改文件（背景音乐规则不自动补偿增益）。需要补时手动 `python3 render/loudness.py <成片> --fix`：只改音轨，补前原片留 `out/old/`，复核真峰值 ≤ -1 dBTP，补增益记进 `.bgm.json` 的 `postGain`（120 期 4K 整片 -10.4，手动补到 -9.4） |
| `render/bgm-plan.json` | BGM 计划：插入段静音、音乐不够长时的选段 |
| `tools/stills.mjs` | 一次打包按 `段:秒,秒` 出关键帧；`SCALE=1` 全分辨率 |
| `tools/push_keyframes.py` | 按 `keyframes/plan/Sxx.json`（时间+说明）和 `titles.json`（每段标题与画面方案）把关键帧推进审看前端；首次运行从 Skill 的 `templates/review-app` 拷页面代码。启动：`node <期>/03_制作过程/review-app/server.mjs 8160` |
| `tools/push_videos.py` | 成片切 720p 分段推进审看前端“逐段视频”页 |

另外从 `templates/component-kit` 复制 `src/kit/`（kit v3 带音效限量和 `Spotlight`），`public/` 里放 `sfx/`、`brand/`、字体、本期素材；插入段素材放 `public/insert109/`。node_modules 软链到 `skills/_runtime/remotion/library-remakes-20260916/node_modules`（Remotion 4.0.515）。

## 顺序

1. 写 `episode.json`，跑 `python3 tools/build_timing.py`，核对每段时长和插入点。
2. 写本期简报（`templates/episode-assembly-brief.md`）：每段“观众要看懂的变化”、组件来源、交接表。交接几何写进 `handoff.ts`。
3. 写 `src/scenes/Sxx.tsx`（每段一个文件，第一行注释写动作来自哪个组件），在 `src/scenes/index.ts` 登记。
4. 关键帧或预览 → 检查 → 返修（按 Fred 当次要求决定给不给他看关键帧）。
5. 冻结一份 `render/stage/`（src、package.json、tsconfig），`bash render/cloud.sh go` 云端渲 4K60；返修段用 `add` 或 `local.sh` 补。
6. `python3 render/final.py` 出成片（含 BGM），再按[整期编排](../../references/episode-assembly.md#12-交付前检查)第 12 节检查。
7. `python3 tools/push_videos.py --video <成片> --app <review-app>` 推前端。

## 踩过的坑

- 本机上传大文件会被断开：ssh/rsync 一律 `-o IPQoS=none`，rsync 加 `--partial` 循环续传（`cloud.sh` 已写好）。
- `ssh` 不加 `-n` 会吞掉 `while read` 的块列表，渲染线只跑第一块。
- 块会卡死：`timeout 900` + 失败自动重试一次 + `--bundle-cache=false`。
- 渲染中改代码会让服务器打包到半截文件：先冻结 `render/stage/` 再同步。
- 4K 素材放 `public-4k/`（同名替换代理文件），替换后先确认版式一致。
- 新版 ffprobe 行尾多一个逗号，核对帧数前先去掉（脚本已处理）。
- 整片音频直接叠加会爆音：口播和音效分开渲，混音后过 `alimiter`（`final.py` 已处理）。
- **时间基不一致会让画面“定住”**（116）：封底和手工拼回的块是 1/60000，云端块是 1/90000，`concat -c copy` 后帧数对、画面却被压成一瞬间。`final.py` 已自动统一并核对时长。
- **重段超时**（116）：带 4K 视频素材的段一块 365 帧超过 15 分钟，给它在 `heavySegments` 填 ≥1.5，按小块切。
- **`public/` 里的软链接**指向归档盘时打包读不到（109 过渡素材），复制素材用 `cp -L`。
- **服务器清理**保留 `~/fred-render/env.sh`、`work/`、`runtimes/`；磁盘低于约 10G 时 Chrome 会拒绝读视频素材。
- **Remotion 打包缓存会撑满系统盘**（120 期 10-14）：脚本里直接调用 `bundle()`（`tools/stills.mjs`、`render30.mjs` 这类）会在系统临时目录（Node 的 `os.tmpdir()`，macOS 常见 `/var/folders/.../T/` 或 `/tmp`）留一份几百 MB 的 `remotion-webpack-bundle-*`，Remotion 不会替你删；`npx remotion render <entry.tsx>` 正常结束会自己清，但被 timeout/kill 打断时也会留下。三个分身反复出图一上午攒到 60GB，系统盘写满，连 shell 都跑不了。`tools/stills.mjs`、`render/final.py`、`render/local.sh` 和 `component_kit.py` 生成的云端脚本现在都已处理：`stills.mjs` 在 `finally` 里删掉自己的 `serveUrl`；`final.py`、`local.sh` 和 `component_kit.py` 的云端脚本给本次渲染一个独占的 `TMPDIR`，结束整个删掉——不按时间去扫公共临时目录，所以不会误删别的会话、分身正在用的打包（复审指出按修改时间清理在并行时会误删）。自己另写的渲染脚本（如 119/120 的 `tools/render30.mjs`）也要照做：`bundle()` 之后 `try { … } finally { fs.rmSync(serveUrl, { recursive: true, force: true }) }`。已经攒下的，确认没有渲染在跑后手动清：`find "$(node -e 'console.log(require("os").tmpdir())')/" "$(getconf DARWIN_USER_TEMP_DIR)" -maxdepth 1 \( -name 'remotion-webpack-bundle-*' -o -name 'react-motion-render*' \) -mmin +30 -exec rm -rf {} +`。
- **多组并行写场景**：每组渲到自己的目录（`qc/self/<组>`），汇总目录只由主会话写；跨组交接对象导出绘制组件，不只导出坐标。
- **固定插入和封底**：`episode.json` 的 `insert`（109 过渡，素材 `public/insert109/`）和 `outro`（Fred 封底，素材在 Skill 的 `assets/outro-local-only/`）。关键帧、1080p 预览和推前端时这两段都直接放进去（过渡声音 `assets/fixed-inserts/skill-library-v1/insert-voice-tts-doubao-117.wav`，封底声音用原声混音按正文响度补增益、BGM 在封底让位），不另外渲染，见整期编排第 7 节（Fred 10-14）。

## 本期共享件（episode-kit）

`src/components/episode-kit/` 放 119–121 期沉淀下来的整期共享绘制件，取自 121 期工程（ep.tsx/ckit.tsx 在 119、120、121 三期逐字节相同）。除相对 import 改成骨架结构（`../../kit/*`、`../../lib/shell`）和文件开头加了说明注释外，逻辑与 121 期一致。每个文件开头的注释块写明来源、导出清单和“每期要替换的常量”。新一期从骨架起步时直接 `import { … } from '../components/episode-kit/ep'` 等；用不到的整文件可删。依赖：工程 `src/kit/`（从 `templates/component-kit` 复制）、`src/lib/shell.tsx`（`chap.tsx` 用到其 `page()`）、`src/timing.json`。

| 文件 | 干什么 | 常用导出 | 每期要替换的常量 |
|---|---|---|---|
| `ep.tsx`（起于 119） | 通用绘制件：黑胶囊、截图/视频按源像素推近取景、左上常驻段标题、工具卡、毛玻璃 | `BlackPill`、`Shot`/`viewAt`/`fit`、`HEADER`/`ToolHeader`、`Label`、`PriceCard`、`CodeCard`、`sinkStyle`、`ToolTile`/`ToolIntro`/`Header`、`FrostFocus`/`FrostLayer` | `TOOLS`（5 个工具的 name/logo/paid/role；119 期是 Upscayl 等）。条数不是 5 时同步改 `TILE` 里的 5。非工具推荐期可删 TOOLS 相关件，保留通用件 |
| `ckit.tsx`（起于 117 Codex 卡，118 改真实比例，119 重画） | Codex 相关小件：键帽、Codex 输入框、token 读数、Codex 真实截图、文件卡 | `MiniKeys`、`CodexBox`、`CodexLogo`/`CodexTag`、`CodeBlock`、`UserBubble`、`TokenMeter`/`TokenGauge`、`CodexShot`、`FileTile` | `CodexBox` 底栏写死的 `GPT-6 Astra`（和“中”）、`placeholder`；`Ep116Thumb`（116 成片一帧）、`Ep117Thumb`（117 终端缩略图）是旧期缩略图，换成本期要展示的或删除；`CodexShot` 截图要跟 Codex 界面改版更新 |
| `g4.tsx`（起于 120） | 章节头 + 结论胶囊 + 模型小卡 + 大播放窗口 | `ChapterHeader`、`VerdictChip`、`MarkIcon`、`ModelChip`/`MODELS`、`ClipWindow`、`SourceTag`、`BIG`、`INSERT_LAST_CARD` | `CHAPTERS`（120 期章名）、`VERDICTS`（每章结论，数量和章数一致）、`MODELS`（出场模型的名字/short/logo） |
| `chap.tsx`（起于 121） | 章节过渡五件套 + 跳切视频 + 数字卡 + 时间小工具 | `ChapterHeader`/`HeaderStay`、`ChapterFlip`/`ChapterCube`/`ChapterDecode`/`ChapterZoom`/`ChapterMerge`、`Clip`/`ClipSchedule`、`ImgCard`、`MarkPill`、`StatCard`、`wd`/`slam`/`moveBox`/`sinkK` | `CHAPTERS`（121 期章名 + label）；`ChapterDecode` 默认 `pool` 乱码字池可按题材换 |

注意：`g4.tsx` 和 `chap.tsx` 各自导出 `CHAPTERS`、`ChapterHeader`、`BIG`、`MarkIcon` 等同名件（`RED` 还与 `ckit` 重名），一期里选一套用，别在同一场景混用两边的 `CHAPTERS`。需要改共享件的逻辑时，在主工程里改一份，别让多个并行分身各改各的。

### 要拷进 `public/media/` 的素材

| 文件 | 谁用 | 在 Skill 里的位置 |
|---|---|---|
| `x6-logo-codex.png` | `ckit` CodexLogo/CodexTag | `assets/product-logos/x6-logo-codex.png` |
| `x6-logo-chatgpt.png` | `g4` MODELS.gpt | `assets/product-logos/x6-logo-chatgpt.png` |
| `x6-logo-doubao.png` | `g4` MODELS.doubao | `assets/product-logos/x6-logo-doubao.png` |
| `claude-mark.png` | `g4` MODELS.opus/sonnet | `assets/product-logos/claude-mark.png` |
| `claude-app-icon.png` | `g4` MODELS.claudeCode | `assets/product-logos/claude-app-icon.png` |
| `x4-codex-full.png`（3024×1712 Codex 桌面版截图） | `ckit` CodexShot | Skill 里只有参考工程副本：`assets/reference-code/ep116-scenes-20261013/source/public/media/x4-codex-full.png`；原件在 `90_工具与公共素材/30_工具输出与实验记录/components-wave3-20261012/public/media/` |
| `insert-last.png`（固定插入段末帧） | `g4` INSERT_LAST_CARD 对应的图（只在注释里，由场景引用） | `assets/reference-code/ep116-scenes-20261013/source/public/media/insert-last.png`，121 期 `public/media/` 也有 |
| `ep116-frame.jpg` | `ckit` Ep116Thumb | Skill 里没有。取自 117 期 `00_每期项目/117_终端/03_制作过程/remotion/ep117-v1/public/media/ep116-frame.jpg`；不用 Ep116Thumb 就不需要 |
| `logo-upscayl.png`、`logo-pdf2zh.png`、`logo-handy.png`、`logo-videolingo.png`、`icon-DogSC.png` | `ep` TOOLS（119 期的 5 个工具） | Skill 里没有。在 `00_每期项目/119_Github 超好用工具推荐/03_制作过程/remotion/ep119-v1/public/media/`；新期换工具后换成新期 logo，这几张不用拷 |
| `logo-gemini.png` | `g4` MODELS.gemini | Skill 里没有。在 `00_每期项目/121_本周 AI 热点/03_制作过程/remotion/ep121-v1/public/media/`（120 期同名） |

`chap.tsx` 没有写死的素材路径，`Clip`/`ImgCard` 的 `src` 都由场景传入。

### 发布限制

`episode-kit/chap.tsx` 派生自抢先期批次 `fred-chapter-transitions-20-20261014`，2026-10-28 08:59（北京时间）前不得进入任何公开发布；公开打包时排除它，或到期后按 distribution-access.md 核对再放。

### 骨架 shell 与字幕（2026-10-15 更新）

- `src/lib/shell.tsx` 已升级为 121 期版本：`PageT` 可选 `subs`（屏幕字幕用最终 SRT，`cues` 只管卡点，117 期做法），音频切片和字幕按工程实际帧率换算（30fps 预览不再错位）。旧 timing 没有 `subs` 时照旧用 `cues`。
- `src/lib/SmileySubtitle.tsx` 已放进骨架（与 `assets/subtitle-smiley/SmileySubtitle.tsx` 相同），不用再从上一期拷。
- 验证方式：骨架 `src` + `templates/component-kit/src/kit` + `SmileySubtitle.tsx` + 占位 `timing.json`/`scenes` 放进临时工程，用 121 期 tsconfig 和 node_modules 跑 `npx tsc --noEmit -p .`，0 错误。

## 公开分发的章节实现

通用骨架和共享基础件在本仓库。`episode-kit/chap.tsx` 以及按期场景范例含仍在抢先期的具体动画实现，请在对应组件目录下载并导入官方源码包后按本期内容接入。公开骨架不包含这些受限实现；32 条历史返修源码已公开。
