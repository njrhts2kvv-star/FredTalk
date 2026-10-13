<div align="center">

# FredTalk 2.0

### 用 Codex，把口播稿变成动态视频。

视频制作 Skill · 可检索视觉库 · 关键帧与音频审看

[**浏览在线视觉库 ↗**](https://www.fred-fu.com/visual-library) · [快速开始](#快速开始) · [使用 Skill](#使用-skill) · [English](README.en.md)

</div>

FredTalk 是我在日常视频制作中打磨的一套工作流程。把稿件、录音和素材交给 Agent，让它逐句选择画面、适配组件、生成关键帧，再完成动画、声音与视频输出。

你可以先在网页里看效果，也可以把仓库下载到本地，让 Codex 或其他编程 Agent 读取 Skill，开始制作自己的视频。

## 2.0 更新 · 2026-10-13

这次升级围绕一件事：让 Codex 找到组件、认真选型，再把画面接成一条完整视频。

- **组件能找到了**：修复检索链路，“数据、价格、要点、代码终端”等常见说法参与匹配，制作和视觉库共用登记数据。
- **新组件有机会被用上**：同等匹配度下按来源批次轮流排，让新批次进入候选列表。
- **每段都认真挑**：当前前三候选用或不用，都写具体理由；门禁重新计算并拦截漏比较，不能直接退成大字页。
- **整期有规则**：录屏聚焦、对象交接、阅读停留、组件去重和动态自检一起执行；音效按整期限量，BGM 在原声欣赏区让位。
- **渲染与声音更稳**：上传断线续传、分块超时重试、口播与音效分轨、混音峰值保护和最终 AAC 复测。

本次 GitHub 新增 **106 条组件**，网站新增 **105 条**；最新组件置前标 **NEW**，**114 条**已归档组件在页面底部保留。

[查看 2.0 完整更新说明](docs/releases/2.0.md) · [下载 2.0 组件与素材](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v2.0.0)

## 画面预览

从文字强调、步骤讲解，到录屏聚焦和作品展示，按你要表达的内容选择画面。点击[在线视觉库](https://www.fred-fu.com/visual-library)可播放预览、筛选场景并查看源码。

<table>
<tr><td width="25%"><img src="docs/assets/T05h.jpg" alt="一次性拷贝 vs 持续同步" width="240"><br><sub>T05h · 一次性拷贝 vs 持续同步</sub></td><td width="25%"><img src="docs/assets/T15e.jpg" alt="折线走势" width="240"><br><sub>T15e · 折线走势</sub></td><td width="25%"><img src="docs/assets/T17b.jpg" alt="终端运行：命令执行、输出滚动、结果行点亮" width="240"><br><sub>T17b · 终端运行：命令执行、输出滚动、结果行点亮</sub></td><td width="25%"><img src="docs/assets/T03e.jpg" alt="步骤折行串起" width="240"><br><sub>T03e · 步骤折行串起</sub></td></tr>
<tr><td width="25%"><img src="docs/assets/T08i.jpg" alt="毛玻璃要点卡" width="240"><br><sub>T08i · 毛玻璃要点卡</sub></td><td width="25%"><img src="docs/assets/T10a.jpg" alt="长回复拎要点" width="240"><br><sub>T10a · 长回复拎要点</sub></td><td width="25%"><img src="docs/assets/T09l.jpg" alt="复制地址交给 AI" width="240"><br><sub>T09l · 复制地址交给 AI</sub></td><td width="25%"><img src="docs/assets/T14c.jpg" alt="价格落定：数字逐位滚动，旧价划掉，差额亮出" width="240"><br><sub>T14c · 价格落定：数字逐位滚动，旧价划掉，差额亮出</sub></td></tr>
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
python3 scripts/catalog.py --use explain --query "三个要点列表" --limit 3
python3 scripts/catalog.py --query "两个工具价格对比" --limit 5
python3 scripts/catalog.py --id SP024 --full
```

查询结果包含预览、源码位置和使用说明。组件适配方法见[源码使用指南](docs/reuse.md)。

## 更多文档

[素材安装](docs/assets.md) · [源码使用](docs/reuse.md) · [项目结构](docs/architecture.md) · [参与贡献](CONTRIBUTING.md)

## 许可

FredTalk 原创代码、Skill、模板与文档采用 [MIT License](LICENSE)，允许商用、修改和再分发，并按 MIT 要求保留版权与许可声明。

第三方代码、参考复刻工程、字体、音效、图片、录屏、视频及品牌素材继续按各自原许可或授权使用。具体范围见 [许可范围](docs/license-scope.md) 与 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

新增组件的个人录屏、人物独立素材不随源码包提供；需要自备的输入路径见各包 `user-media-inputs.json`。预览保留认可画面，使用自己的素材后仍需检查实际输出。
