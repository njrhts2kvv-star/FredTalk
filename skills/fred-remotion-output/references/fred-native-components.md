# Fred 新做组件 16 条（参数化）

2026-10-12 Fred 当次授权新做 10–20 条组件，补过往 19 期里“需求高、组件少”的场景。做了 17 条，云端渲染 1080p60 后 Fred 认可其中 16 条入库，T21c-CallToAction（行动号召）不要。集合 `fred-native-16-20261012`；用 `references.py --collection fred-native-16-20261012` 查询，或 `--id T05c` 等取单条。

实体在 `assets/reference-code/fred-native-16-20261012/`：
- `source/src/components/<ID>.tsx`：组件源码，每条导出组件函数、`<name>Defaults` 和 Props 类型；
- `source/src/kit/`：共享基础库；
- `source/public/`：样例素材；
- `source/qc/`：`style-kit.md` 记录视觉值出处，`BRIEF.md` 是制作规范，`materials.md` 是素材来源；
- `previews/`：认可的准确成片；
- `thumbnails/`：每条 3 个核心帧；
- `selection.json`：Fred 原话与认可边界。

运行时用 `skills/_runtime/remotion/library-remakes-20260916`（Remotion 4.0.515）。实验原工程（含 T21c 和测试入口）留在 `30_工具输出与实验记录/new-components-20261012/`。

## 和快照组件的区别

这批全部由 props 驱动：文字、数量、素材、强调词都从参数传入，文字宽度按 `textWidth` 估算后自适应。调用时把组件文件、`src/kit/` 和实际用到的 `public` 素材复制进本期工程，再传本期内容。**不要改 kit 的值**，它是这批组件和已认可组件保持同一质感的根据。

认可范围是这 16 条准确成片。换文案、素材、项数或对接口播 cue 后，仍要按 `production-gates` 出静帧，检查容量、可读性和角标避让。

## 组件

| ID | 场景 | 观众要看懂的变化 | 主要 props |
| --- | --- | --- | --- |
| T09a | 真实操作录屏 | 镜头跟光标找到入口点下，焦点交给下一个入口 | `image` `imageSize` `clicks[]` `timing` `maxZoom` |
| T09d | 真实操作录屏 | 输入框提起、发送，步骤从“运行中”变“完成” | `image` `inputBox` `prompt` `steps[]` `runningLabel` `doneLabel` |
| T05b | 对比 | 以前的多步收成一叠退后，现在一句话接管 | `beforeSteps[]` `nowText` `highlight` |
| T05c | 对比 | 同一行原位改写：旧写法划掉，新写法逐字替换（质量标杆） | `lines[]` `target` `oldText` `newText` `badge` |
| T05d | 对比 | 两个工具逐项比，胜出格翻黑，赢家整列抬起 | `left` `right` `rows[]` |
| T20a | 开场 | 真实作品墙推向主图，钩子大字落定 | `media[]` `heroIndex` `hook` `highlight` |
| T12a | 章节（2 秒快过渡） | 点长成黑胶囊，“第N部分”和锐字真言标题落定 | `index` `label` `title` `dark` |
| T02a | 章节 | 本期 N 件事依次立起，当前项抬起 | `items[]` `current` `mode` |
| T14c | 数字 | 数字逐位滚动落定，旧价划掉，差额亮出 | `value` `decimals` `prefix` `unit` `compareValue` `deltaText` |
| T14a | 数字 | 两条轨道计时赛跑，倍数胶囊落定 | `a` `b` `resultText` |
| T01d | 观点 | 实测作品退后，评分卡与结论落定 | `media[]` `dimensions[]` `verdict` `highlight` |
| T04a | 流程关系 | 概念与生活比喻逐行配对，再合成一句 | `concept` `metaphor` `pairs[]` `summary` |
| T17b | 代码 | 命令执行、输出滚动，结果行推近点亮 | `command` `outputLines[]` `resultIndex` |
| T17a | 配置 | 关键行逐条提起，密钥从第一帧起打码，结论行拎成胶囊 | `lines[]` `focusLines[]` `maskKeys[]` `calloutLine` |
| T18a | 产品 | Logo 方卡展开成名片，能力胶囊依次落下 | `logo` `name` `tagline` `capabilities[]` |
| T19a | 人物 | Fred 3D 形象发愁，烦恼气泡收成一个问题 | `character` `pains[]` `summary` |

## 已知局限

- T05b：旧步骤叠成一摞后文字不易辨认。
- T14a：轨道条可以更长。
- T09d：步骤节奏是固定间隔，还没对接口播 cue。
- T20a：默认主图是一张拼图，换成单张作品更干净。
- T17a：只给 `maskKeys` 命中的键打码；本期配置里有其他敏感键时，要先加进 `maskKeys`。

## 继续新做组件的方法

以后 Fred 授权新做组件时，沿用这批的做法：
1. 从需求数据定场景；
2. 每条先写一句“观众要看懂的变化”；
3. 只用 `style-kit.md` 里的值和 kit 组件；
4. 用真实素材；
5. 逐帧看静帧自查，并测长短文案；
6. 云端统一渲染后交给 Fred 挑选。

完整规范见 `source/qc/BRIEF.md`。


公开分发以仓库 `library/catalog.json` 的当前标签、用途、归档状态、源码路由和可下载媒体为事实源。本文中的生产工程记录只说明方法与历史范围；实际复用请运行 `python3 scripts/catalog.py --id <准确标签> --full`，使用公开源码快照的当前哈希。
