<div align="center">

# FredTalk 1.5

### 用 Codex，把口播稿变成动态视频。

视频制作 Skill · 可检索视觉库 · 关键帧与音频审看

[**浏览在线视觉库 ↗**](https://www.fred-fu.com/visual-library) · [快速开始](#快速开始) · [使用 Skill](#使用-skill) · [English](README.en.md)

</div>

FredTalk 是我在日常视频制作中打磨的一套工作流程。把稿件、录音和素材交给 Agent，让它逐句选择画面、适配组件、生成关键帧，再完成动画、声音与视频输出。

你可以先在网页里看效果，也可以把仓库下载到本地，让 Codex 或其他编程 Agent 读取 Skill，开始制作自己的视频。

## 1.5 更新 · 2026-10-08

新增 **29 个组件**：5 个 3D 录屏运镜组件、4 类输入与突出交互组件、14 个精选动画，以及第109期的6个精选场景。源码、参数说明和预览都可下载。

3D 运镜按真实内容与口播编排：镜头到达重点后停稳，再成组刷色、蒙版或框选；中间经过的位置连续移动。五条案例提供可复用的运动与强调方式，新的内容需要重新设置落点、滚动、角度和阅读时间。

[查看 1.5 更新说明](docs/releases/1.5.md) · [下载 1.5 组件与素材](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v1.5.0)

## 画面预览

从文字强调、步骤讲解，到录屏聚焦和作品展示，按你要表达的内容选择画面。点击[在线视觉库](https://www.fred-fu.com/visual-library)可播放预览、筛选场景并查看源码。

<table>
<tr><td width="25%"><img src="docs/assets/C009.jpg" alt="多个词组成信息结构" width="240"><br><sub>C009 · 信息结构</sub></td><td width="25%"><img src="docs/assets/N027.jpg" alt="流程线绕回下一行，连续建立三排步骤" width="240"><br><sub>N027 · 步骤流程</sub></td><td width="25%"><img src="docs/assets/N043.jpg" alt="长文面板横向展开为背景，手机重新到前景" width="240"><br><sub>N043 · 文档与手机</sub></td><td width="25%"><img src="docs/assets/X006.jpg" alt="三种生成方式清单" width="240"><br><sub>X006 · 能力清单</sub></td></tr>
<tr><td width="25%"><img src="docs/assets/X019.jpg" alt="免费规则窗口" width="240"><br><sub>X019 · 规则说明</sub></td><td width="25%"><img src="docs/assets/X022.jpg" alt="角色虚化前的三项概念" width="240"><br><sub>X022 · 概念强调</sub></td><td width="25%"><img src="docs/assets/X025.jpg" alt="文档推近逐行阅读" width="240"><br><sub>X025 · 文档阅读</sub></td><td width="25%"><img src="docs/assets/E08.jpg" alt="记忆分类分支与重新使用" width="240"><br><sub>E08 · 分类分支</sub></td></tr>
<tr><td width="25%"><img src="docs/assets/107-03.jpg" alt="同尺度版本窗，箭头建立比较" width="240"><br><sub>107-03 · 版本对比</sub></td><td width="25%"><img src="docs/assets/107-04.jpg" alt="三项能力按口播建立，汇聚长胶囊" width="240"><br><sub>107-04 · 能力汇聚</sub></td><td width="25%"><img src="docs/assets/SP014.jpg" alt="四格视频素材展示" width="240"><br><sub>SP014 · 视频作品墙</sub></td><td width="25%"><img src="docs/assets/SP021.jpg" alt="深色窗口中的三行能力词" width="240"><br><sub>SP021 · 能力文字</sub></td></tr>
<tr><td width="25%"><img src="docs/assets/X010.jpg" alt="约束示例黑卡" width="240"><br><sub>X010 · 约束说明</sub></td><td width="25%"><img src="docs/assets/C008.jpg" alt="前一步引出后一步" width="240"><br><sub>C008 · 前后接力</sub></td><td width="25%"><img src="docs/assets/SP024.jpg" alt="深色窗口两行目标文字" width="240"><br><sub>SP024 · 目标文字</sub></td><td width="25%"><img src="docs/assets/X008.jpg" alt="提示词与能力黑胶囊" width="240"><br><sub>X008 · 提示词展示</sub></td></tr>
<tr><td width="25%"><img src="docs/assets/X040.jpg" alt="图片视频成片三步串联" width="240"><br><sub>X040 · 三步流程</sub></td><td width="25%"><img src="docs/assets/X037.jpg" alt="插画叠放转四格" width="240"><br><sub>X037 · 插画作品墙</sub></td><td width="25%"><img src="docs/assets/N014.jpg" alt="三结果归位溯源，再抽离成三窗对照" width="240"><br><sub>N014 · 结果对照</sub></td><td width="25%"><img src="docs/assets/SP018.jpg" alt="剧本文字与人物参考图并列" width="240"><br><sub>SP018 · 图文并排</sub></td></tr>
</table>

## 能做什么

- **按内容选画面**：根据每句口播，在文字、流程、对比、设备、录屏和作品展示中选择合适的表达。
- **改成你的内容**：结合组件源码，替换文字与素材，调整布局、动作和口播节奏。
- **先看关键帧，再做视频**：用真实内容确认画面，支持随音频查看关键帧、逐段记录修改意见。
- **完成视频输出**：通过 Remotion 合成画面，检查动态、声音和段落衔接后导出视频。
- **处理录音与字幕**：可选用音频字幕粗剪 Skill，整理录音、纠正字幕并检查剪切位置。

## 怎么制作一条视频

| ① 准备内容 | ② 确认画面 | ③ 输出视频 |
| :--- | :--- | :--- |
| 提供口播稿、录音和图片／录屏素材 | Agent 给出逐段建议，从视觉库选择组件，并生成真实内容关键帧 | 按反馈调整，检查动画、声音和衔接，渲染完整视频 |

制作时可以逐段修改，也可以沿用已经确认的方案继续推进。

## 快速开始

**只想先看效果？** 直接打开[在线视觉库](https://www.fred-fu.com/visual-library)，无需安装。

**想在本地使用？** 准备 Python 3.11+、Node.js 22+、npm 和 Git，然后运行：

```bash
git clone https://github.com/njrhts2kvv-star/FredTalk.git
cd FredTalk
cd apps/library
npm ci
npm run build
cd ../..
python3 scripts/library_server.py
```

打开 [http://127.0.0.1:3061/design/](http://127.0.0.1:3061/design/)。端口被占用时，加上 `--port 3063`。

### 下载预览与素材

仓库直接附带[日常使用的五个字体家族](library/fonts/README.md)和少量示例，克隆后即可使用字体；完整预览与其他制作素材通过 Release 下载。先查看体积，再按需安装：

```bash
python3 scripts/assets.py status
python3 scripts/assets.py download
python3 scripts/assets.py verify
python3 scripts/assets.py materialize
```

下载工具需要 [GitHub CLI](https://cli.github.com/)。更多安装选项见[素材安装说明](docs/assets.md)。

## 使用 Skill

在下载好的仓库中，让 Codex 或其他编程 Agent 读取 [`skills/fred-remotion-output/SKILL.md`](skills/fred-remotion-output/SKILL.md)。保留仓库目录结构，方便 Agent 找到组件、素材和工具。

可以从这句话开始：

> 请读取 `skills/fred-remotion-output/SKILL.md`。这是我的口播稿、录音和素材。请根据每段内容，从视觉库选择合适的组件，展示参考并说明理由。方向确定后，生成真实内容关键帧供我检查，再继续制作视频。

音频和字幕处理入口：[`audio-subtitle-roughcut`](skills/audio-subtitle-roughcut/SKILL.md)。

### 按用途查找组件

```bash
python3 scripts/catalog.py --use explain --query "流程" --limit 3
python3 scripts/catalog.py --id SP024 --full
```

查询结果包含预览、源码位置和使用说明。组件适配方法见[源码使用指南](docs/reuse.md)。

## 更多文档

[素材安装](docs/assets.md) · [源码使用](docs/reuse.md) · [项目结构](docs/architecture.md) · [参与贡献](CONTRIBUTING.md)

## 许可

本项目当前未授予统一开源许可。使用或再分发代码、字体与素材前，请查看 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 中的具体许可说明。
