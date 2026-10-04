<div align="center">

# FredTalk

### 从逐字稿，到讲得清楚的动态画面。

一套面向口播视频的 Agent Skill、可检索动效库和 Remotion 制作审看流程。

[English](README.md) · [简体中文](README.zh-CN.md) · [快速开始](#快速开始) · [架构](docs/architecture.md) · [脱敏报告](docs/privacy.md)

![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)
![Remotion](https://img.shields.io/badge/Remotion-versioned_projects-000000)
![Status](https://img.shields.io/badge/status-private_review-orange)

</div>

FredTalk 把视频制作中的关键判断连起来：**这句话要让观众理解什么、哪种动作有助于解释、真实内容怎样放进去，以及交付前要检查什么。**

仓库包含当前便携版的 `fred-remotion-output` Skill 文档、浏览器视觉库、组件源码快照和可选素材包。“完整”指当前 Skill 文档与规则；旧场景复现和云端执行仍需对应素材、环境及配置。目前处于**私有检查阶段**，为后续开源做准备。

<table><tr><td><img src="docs/assets/C008.jpg" alt="Step-by-step explanation scene" width="420"></td><td><img src="docs/assets/SP024.jpg" alt="Three clear goals in a dark window" width="420"></td></tr></table>

## 制作流程

```mermaid
flowchart LR
    A[逐字稿与可选录音] --> B[逐段图文建议]
    B --> C[参考与源码选型]
    C --> D[真实内容关键帧]
    D --> E[创作者反馈]
    E --> F[内部动态、声音与接缝检查]
    F --> G[Remotion渲染与交付]
```

当前导出包含 **177 条目录参考（其中 5 条预览隔离）、16 个非空使用场景、288 个历史身份及 72 份源码工程快照**。这些数字描述当前收录范围；准确场景源码不等于已经封装好的通用参数组件。

## 能做什么

| 能力 | 实际用途 |
|---|---|
| 按表达任务选画面 | 从强调、列举、流程、分支、录屏聚焦、对比、设备与转场等具体场景中找参考。 |
| 直接查看真实效果 | 提供审选封面、无声预览、准确播放区间与源码入口。 |
| 给 Agent 完整的场景上下文 | 带入设计要求、具体素材、调用位置、相邻场景和保留范围。 |
| 先用真实内容审看 | 用本期文字、图片和适用字幕生成关键帧，再检查完整运动与交接。 |
| 明确复用边界 | 区分完整参数组件、部分参数化场景与准确源码快照。 |
| 本地使用 | 检索目录和运行视觉库不需要 API Key 或云账号。 |

## 快速开始

需要 Python 3.11+、Node.js 22+ 和 npm。以下命令需要安装 [GitHub CLI](https://cli.github.com/)，并用有权访问该私有仓库的账号登录（`gh auth login`）。

```bash
gh repo clone njrhts2kvv-star/FredTalk
cd FredTalk
cd apps/library
npm ci
npm run build
cd ../..
python3 scripts/library_server.py
```

打开 **http://127.0.0.1:3061/design/**。端口被占用时，可使用 `python3 scripts/library_server.py --port 3063`。

Git 中附带少量无声示例。尚未下载完整素材时，全部目录和源码文字仍可检索，未安装的视频显示可选下载状态；另有 5 条预览因隐私检查被隔离，不随素材包提供，需要安全替代品。所有条目都不会引用作者电脑的路径。

```bash
# 查看素材包体积和安装状态。
python3 scripts/assets.py status

# 从同一私有仓库的 Release 下载经过检查的素材包。
python3 scripts/assets.py download

# 检查内容哈希；需要改编工程时再还原素材路径。
python3 scripts/assets.py verify
python3 scripts/assets.py materialize
```

浏览、检索和阅读源码不需要完整素材包；复现某个场景则需要补齐它声明的素材。素材下载是可选步骤。文件按内容去重、校验后存入 Git 忽略的 `.artifacts/`。完整还原多份工程会比去重素材包占用更多空间，详见[素材分发说明](docs/assets.md)。

## 查找组件

```bash
python3 scripts/catalog.py --list
python3 scripts/catalog.py --use explain --query "流程" --limit 3
python3 scripts/catalog.py --id SP024 --full

# Skill 内原有的参考查询入口也接入了便携目录。
python3 skills/fred-remotion-output/scripts/references.py --id SP024 --full
```

结果包含用途、准确源码、视频区间和适配限制。稳定 ID 通过 `implementation.projects` 和已记录的 `compositionId` 连接到工程；同一工程可对应多条参考。未记录 Composition ID 时，需要查看工程注册入口。先复制所选场景，再改成本期内容。使用对应工程自己的 `package.json` 与锁文件；库中不同批次的 Remotion 版本不完全相同。

## 使用 Skill

入口是 [`skills/fred-remotion-output/SKILL.md`](skills/fred-remotion-output/SKILL.md)。让编程 Agent 在本仓库中读取它。Skill 依赖仓库中的目录、源码和工具，因此仅复制一份 `SKILL.md` 并不能得到完整组件库。

> 请读取 `skills/fred-remotion-output/SKILL.md`。根据这份逐字稿，先从组件目录提出逐段视觉建议，展示准确参考并说明作用。方向确定后，实现真实内容关键帧供审看，再继续视频制作。

默认顺序为：**稿件 → 图文建议 → 选方向 → 真实组件关键帧 → 修改反馈 → 内部动态检查 → 完整交付**。已有确认和当次明确直出要求优先；技术检查通过不能代替视觉认可。

便携版支持组件检索、场景指导、工作流程验证和本地视觉库。云平台执行器、私人单期目录及历史验收记录不等于可以直接复用的账号和渲染任务。复现旧场景前请先读[源码复用说明](docs/reuse.md)。

## 目录结构

```text
apps/library/                  React 视觉库与设计规范页面
components/projects/           脱敏源码工程快照
library/catalog.json           当前有效参考数据库
library/history.json           历史身份与可见性记录
library/media-manifest.json    可选素材路径、哈希和审查状态
library/demo/                  少量随仓库附带的无声示例
skills/fred-remotion-output/   完整主 Skill、规则与模板
scripts/                       本地服务、检索与素材安装工具
docs/                          架构、复用、隐私与发布说明
tests/                         便携分发版验证
```

## 脱敏与公开状态

本仓库保持**私有**。本导出按规则处理账号信息、凭证及本机路径，并排除原始录音和嵌套 Git 历史；实际检查范围与剩余边界见报告。按所有者要求保留 FredTalk 品牌和卡通示例。

画面隐私与代码密钥分别检查。[脱敏报告](docs/privacy.md)记录实际覆盖、排除文件与尚待检查的边界。GitHub 私有不代表另外部署的网站也是私有。

本次导出不部署公网视频站点。完成[公开前检查](docs/public-release.md)后，才能考虑改变可见性。

## 开发与贡献

```bash
python3 -m unittest discover -s tests
(cd apps/library && npm run build)
```

本地取舍意见写入 `.local/`，不会进入 Git。服务仅监听本机回环地址，并只提供目录明确登记的文件。

贡献时保留来源，说明准确场景与版本，附与改动相关的验证，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可与归因

当前尚未授予统一开源许可。源码、字体、参考媒体及第三方依赖可能具有不同的权利归属和许可条件。收录在私有库中不代表可以公开再分发。请参阅 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 与公开前检查。


## 2026-10-04 update / 本次更新

The portable Skill now includes a current-catalog delivery gate, parsed source invocation checks, audio-synchronized discrete keyframe review, and the optional audio/subtitle roughcut Skill. No private narration, credentials or episode feedback is included. Natural-voice preprocessing requires the user's own verified environment. Historical snapshots and third-party assets retain the release limitations in docs/public-release.md.

便携版已更新认可组件/二创约束、真实源码调用检查、关键帧随音频播放和独立音频字幕粗剪。具体范围见对应SKILL.md；旧源快照不因此成为通用参数接口或公开素材授权。
