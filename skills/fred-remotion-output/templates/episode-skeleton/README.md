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
| `render/plan.py` | 分块计划：每块 ≤420 帧，最长处理时间优先分到各渲染线 |
| `render/cloud.sh` | 云端分块渲染：sync / plan / run / go / add / chunk / status / final |
| `render/local.sh` | 本机补渲几个返修块（返修少时比开云端快） |
| `render/final.py` | 拼画面 → 渲音效轨 → 拼口播轨 → 混音压峰 → 封装 → 加 BGM |
| `render/bgm-plan.json` | BGM 计划：插入段静音、音乐不够长时的选段 |
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
