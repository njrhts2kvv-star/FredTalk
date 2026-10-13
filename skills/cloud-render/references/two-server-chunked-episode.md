# 两台服务器分块渲染整期 4K60（114 期实测，2026-10-12/13）

114 期 v2 用这套方式把 18811 帧（313.5 秒）4K60 分成 56 块，在 A（render.example.com，10 核，4 条线）和 B（render.example.com，16 核/62GB，8 条线）上渲完，每条线 `--concurrency=2`。脚本按 114 的实际做法整理进主 Skill 的[整期骨架](../../fred-remotion-output/templates/episode-skeleton/README.md)：`render/plan.py`、`render/cloud.sh`、`render/local.sh`、`render/final.py`。这是 `render.mjs` 之外已验证可用的执行路径，两台机器的地址、目录、线数写在工程的 `episode.json`。

## 做法

- **画面静音分块，音频本机整片渲。** 每块 `--muted`，拼接只拷贝视频轨（`-video_track_timescale 60000`，不重编码）；音频在本机渲（音效轨 + 口播轨分开，混音压峰后再加 BGM），一次合入。
- **每块 ≤420 帧**：单块 5–10 分钟，卡死或失败时损失小。按“最长处理时间优先”分到各条线（录屏、长图、视频多的段给更高权重），B 每条线按 1.25 倍速度算。
- **先冻结快照**：渲染期间还要改代码时，先把 `src`、`package.json`、`tsconfig.json` 复制到 `render/stage/` 再同步，避免服务器打包到半截文件。
- **4K 素材**：`public-4k/` 用同名原件替换代理文件，替换后先渲一两帧确认版式一致；渲染加 `--public-dir=public-4k --scale=2`。
- **每块拉回后核对** 3840×2160、60/1、帧数，不对就删掉重渲。
- **返修段补渲**：`cloud.sh add <段>` 重新同步后追加；只改几段时用 `local.sh` 本机渲更快（114 v3 返修 S07、S08、S18 共 6 块就是本机渲的）。

## 踩过的坑

| 现象 | 原因 | 处理 |
|---|---|---|
| 上传大文件中途断开 | 本机网络对 ssh 的 QoS 标记 | ssh/rsync 一律 `-o IPQoS=none`；rsync 加 `--partial --timeout=60`，失败循环续传（最多 60 次） |
| 一台同步失败，另一台的渲染照跑旧代码 | sync 和 run 没有串起来 | `go`：每台“同步成功后才开线”，各自独立 |
| 渲染线只跑第一块就结束 | `ssh` 读了标准输入，吞掉 `while read` 的块列表 | 循环里的 ssh 一律加 `-n` |
| 个别块卡住不动 | Remotion 打包缓存或浏览器偶发卡死 | 每块 `timeout 900`，失败杀掉进程重试一次；加 `--bundle-cache=false` |
| 最后几块排在同一条线上，整体拖尾 | 静态分配不均 | 观察到拖尾时，手动把剩余块挪到空闲机器（`cloud.sh chunk <机器> <段> <起> <止>`） |
| 本机核对帧数总是“不符” | 新版 ffprobe 的 csv 输出行尾多一个逗号 | 比较前 `sed 's/,$//'` |
| 整片音频直接叠加后爆音（峰值超过满幅） | 口播、音效、B-roll 原声直接相加 | 音效轨用 `noVoice` 单独渲，与口播 amix（normalize=0）后过 `alimiter`，再交给 `bgm.py` |

## 收尾

- 渲完、拉回、核对后，按本 Skill“云实例开关机”关掉两台；不关就要明确告诉 Fred 还在计费。
- 两台同时只跑一期，避免互相抢线。
