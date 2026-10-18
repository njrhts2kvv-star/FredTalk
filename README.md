<div align="center">

# FredTalk 2.5

### 用 Codex，把口播稿变成动态视频。

视频制作 Skill · 可检索视觉库 · 关键帧与音频审看

[**浏览在线视觉库 ↗**](https://www.fred-fu.com/visual-library) · [快速开始](#快速开始) · [使用 Skill](#使用-skill) · [English](README.en.md)

</div>

FredTalk 是我在日常视频制作中打磨的一套工作流程。把稿件、录音和素材交给 Agent，让它逐句选择画面、适配组件、生成关键帧，再完成动画、声音与视频输出。

你可以先在网页里看效果，也可以把仓库下载到本地，让 Codex 或其他编程 Agent 读取 Skill，开始制作自己的视频。

## 2.5 更新 · 2026-10-18

**整期编排与录屏表达升级。** 新增 47 条成片场景、8 条录屏操作组件、9 条章节过渡，更新 32 条历史组件；加入逐句动作表、好坏对照样例、可读性检查和更完整的整期骨架。

- **32 条历史返修版立即公开**：非会员也可获取源码、源码 ZIP 和原视频。
- **其余 64 条专属会员抢先 14 天**：发布满 14 天后，网站自动向所有人开放；此前批次日期保持。
- **场景按内容适配**：47 条回收场景保留真实场景代码，使用自己的文字、素材和口播时间修改。

[查看 2.5 完整说明](docs/releases/2.5.md) · [FredTalk 2.5 Release](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v2.5.0)

## 2.1 更新 · 2026-10-14

新增 **20 条组件**：10 条章节动画和 10 条内容进场／交接动画，按实际用途检索。

- **T12k–T12t**：章节序号、标题揭示与章节过渡。
- **T20i、T20j**：可用于开场，也可用于内容交接。
- **其余 8 条 T20 动画**：主要用于内容过渡，并按真实动作标记媒体进场、作品展示、问答和数字等用途，不作为默认开场推荐。
- **会员优先使用 14 天**：公开展示预览；源码、原视频和源码 ZIP 经网站登录下载，交给 Codex 后可直接校验安装。本批北京时间 10 月 14 日 08:59:11 开始，10 月 28 日 08:59:11 向其他用户开放下载。

[查看 2.1 更新说明](docs/releases/2.1.md) · [查看 2.1 Release](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v2.1.0)

## 2.0 更新 · 2026-10-13

这次升级围绕一件事：让 Codex 找到组件、认真选型，再把画面接成一条完整视频。

- **组件能找到了**：修复检索链路，“数据、价格、要点、代码终端”等常见说法参与匹配，制作和视觉库共用登记数据。
- **新组件有机会被用上**：同等匹配度下按来源批次轮流排，让新批次进入候选列表。
- **每段都认真挑**：当前前三候选用或不用，都写具体理由；门禁重新计算并拦截漏比较，不能直接退成大字页。
- **整期有规则**：录屏聚焦、对象交接、阅读停留、组件去重和动态自检一起执行；音效按整期限量，BGM 在原声欣赏区让位。
- **渲染与声音更稳**：上传断线续传、分块超时重试、口播与音效分轨、混音峰值保护和最终 AAC 复测。

本次 GitHub 新增 **106 条组件**，网站新增 **105 条**；最新组件置前标 **NEW**，**114 条**已归档组件在页面底部保留。

[查看 2.0 完整更新说明](docs/releases/2.0.md) · [下载公开组件与素材](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v2.0.0)

## 画面预览

从文字强调、步骤讲解，到录屏聚焦和作品展示，按你要表达的内容选择画面。点击[在线视觉库](https://www.fred-fu.com/visual-library)可播放预览、筛选场景，并按公开或抢先权限查看源码。

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

仓库直接附带[日常使用的五个字体家族](library/fonts/README.md)和少量示例，克隆后即可使用字体；公开组件预览与其他制作素材通过 GitHub Release 下载；抢先组件通过网站授权下载。先查看体积，再按需安装：

```bash
python3 scripts/assets.py status
python3 scripts/assets.py download
python3 scripts/assets.py verify
python3 scripts/assets.py materialize
```

下载工具需要 [GitHub CLI](https://cli.github.com/)。更多安装选项见[素材安装说明](docs/assets.md)。

### 14 天专属会员抢先

首批 16 条、第二轮 42 条与补充 5 条、第三轮 40 条与补充 2 条，共 105 条新组件，提供 14 天专属会员抢先下载。普通会员不含抢先权限；窗口结束后公开获取。准确开始与公开时间在[在线视觉库](https://www.fred-fu.com/visual-library)显示。

公开组件继续从 GitHub 下载，新闻关键词快闪 NMC01 仍公开。抢先组件的源码 ZIP、源码和原画质素材通过网站的会员权限获取。

**最简单的用法**：登录网站下载源码 ZIP，把文件拖入 Codex，再粘贴组件详情里“复制给 Codex”的说明。Agent 会校验并安装已有的本地包，你无需配置网站令牌或手动输入终端命令。

Agent 使用的本地导入入口：

```bash
python3 scripts/assets.py import --zip /path/to/downloaded-source.zip
```

导入会按大小和 SHA-256 自动识别官方批次，安装到 Git 忽略的隔离目录；实际文件验证通过后，组件才进入可执行候选。它不读取会员凭证、不请求网络，也不重复下载 ZIP。需要批量自动下载时，仍可选择[网站读取授权](https://www.fred-fu.com/visual-library/access)；详细方法见[素材安装](docs/assets.md)。

本次下载渠道调整不撤回此前已经授予的 MIT 许可，已有副本仍可依原许可使用、修改与再分发。

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

抢先时间：北京时间 **2026-10-13 11:15 至 2026-10-27 11:15**（UTC `2026-10-13T03:15:00.000Z` 至 `2026-10-27T03:15:00.000Z`），共 14 天，适用于上述五个批次的专属会员下载。

此前公开的源码仍能从历史 commit/tag 获取，已有 MIT 授权保持。后续新批次从第一天采用私有源码、ZIP 与原片，只公开目录、海报及标明身份的派生预览；具体流程见[素材安装](docs/assets.md)。
