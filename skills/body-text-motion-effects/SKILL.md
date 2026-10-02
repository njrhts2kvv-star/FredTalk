---
name: body-text-motion-effects
description: 正文组件。FredTalk Deck 正文文字模块和正文组件动效库；独立 Remotion 视频的文字滚动、刷出、逐字输出、淡入淡出、换词和数值变化参考入口。Use when Fred asks to choose, reuse, generate, or adapt body text components, scrolling text, masked reveals, typing, fades, word replacement, animated numbers, or body text module animations for React Deck pages.
metadata:
  display_name: 正文组件
---

# 正文组件

用于 FredTalk Deck 正文页的文字模块和正文组件动效。重点不是封面开头，而是正文讲解时的 `1-2-3`、`1-2-3-4` 步骤卡、检查卡、对比卡和收束卡。

中文别名：`正文组件`。历史目录名仍保留为 `body-text-motion-effects`，方便脚本和已有调用不失效。

独立连续视频要选择文字怎样出现、流动和退出时，先读 [文字呈现参考](../fred-remotion-output/references/text-presentation.md)，用 `references.py --kind text-effects` 查参考片段区间及源码。下文快速流程用于原 Deck 组件库；连续视频的文字效果按本期口播和阅读节奏适配。

## 核心原则

**先选已验证动效 ID，再替换文字，不要把正文模块退回普通淡入。**

**适用范围：下文固定左右比例、主标题、静止媒体、线型与高亮限制，是本库点击式 Deck Demo 的原版合同。** 独立连续视频只提取明确选中的动作，不继承演示占位、固定1/3＋2/3布局、统一标题或下划线。当前合同要求无装饰线时优先选不依赖线的效果；保留真实关系线的语义。毛玻璃可模糊背景支撑内容，前景文字保持清晰；不受本Demo“禁止文字模糊”条款误拦。明确要求准确场景实现Demo时仍保留该原版合同。

这些动效已经在 `1366x768` 和 `1280x720` 里通过 build 与截图验收。默认保持白底、页面主标题、正文文字模块、右侧静止视频/图片占位；版式上文字模块约占 `1/3`，右侧视频/图片占位约占 `2/3`。视觉体系是白 / 黑 / 浅灰，紫色只保留在编号和关键词：白底小编号使用 `#8b5cf6`，黑卡关键词使用更淡的 `#c4b5fd`。当前步骤不再统一使用黑底白字，而是按效果分配 `dark / outline / left-bar / soft-fill / index-fill / underline` 六种干净高亮状态。Demo 不显示效果英文名、效果说明、控制条或进度条。

## 快速流程

1. 读取 `references/effects-registry.json`，按 `id`、`group` 或 `bestUse` 选效果。
2. 需要选择建议时，读取 `references/effects-guide.md`。
3. 需要源码时，从 `assets/demo-deck/src/` 复制 `App.tsx`、`effects.ts` 和 `styles.css` 里对应逻辑。
4. 替换 `steps` 短标题，默认每个标题 `4-10` 个字，解释放进口播或旁边截图。
5. 默认手动点击展示下一步；需要自动演示时使用 `?autoplay=1`。
6. 跑 build、点击流检查和截图验收。

## 查询命令

```bash
python skills/body-text-motion-effects/scripts/list_effects.py --group focus
python skills/body-text-motion-effects/scripts/list_effects.py --id vertical-soft-pop
python skills/body-text-motion-effects/scripts/list_effects.py --json --supports-four-steps
```

## 资产位置

- 动效索引：`references/effects-registry.json`
- 选择指南：`references/effects-guide.md`
- 终态总览截图：`assets/contact-sheet.png`
- 逐步总览截图：`assets/steps-contact-sheet.png`
- 单页终态截图：`assets/screenshots/`
- 单步状态截图：`assets/steps/`
- React Demo Deck：`assets/demo-deck/`

## 调用规则

| 需求 | 优先选择 |
|---|---|
| 最稳正文三卡 | `vertical-soft-pop`, `bottom-spring-list`, `plain-card-pop` |
| 横排三卡 | `three-card-row`, `compact-row-pop`, `input-output-row` |
| 2x2 四卡 | `four-grid-pop`, `two-plus-two-grid` |
| 轨道 / 流程 | `left-rail-steps`, `timeline-rise`, `priority-ladder` |
| 检查确认 | `checklist-snap` |
| 对比变化 | `compare-pop` |
| Bento 模块 | `bento-focus` |
| 小结收束 | `summary-with-steps`, `final-lock-list` |
| 正文停顿 / 承接 | `trv2-silent-dark-word`, `trv2-silent-light-word` |

## 高亮状态

| 状态 | 视觉 |
|---|---|
| `dark` | 当前卡黑底白字，只用于需要强收束的少数页 |
| `outline` | 白卡 + 黑色描边 |
| `left-bar` | 白卡 + 左侧黑色短条 |
| `soft-fill` | 浅灰卡片，不反相 |
| `index-fill` | 白卡不变，只让编号块反相 |
| `underline` | 白卡 + 底部黑色锁定线 |

## 视觉边界

- 不使用大面积紫色背景、渐变雾、扫光、扫描线、装饰球。
- 不显示 `PREV/NEXT/STEP`、底部进度条或播放器控件。
- 不显示效果英文名、效果说明或其它演示标注；正文页主标题和右侧视频/图片占位默认保留。
- 卡片终态必须保持正常正文模块排版：竖排、横排、2x2、轨道、清单、时间线、对比或 Bento。
- 当前卡只做干净强调：可以是黑底、描边、左黑条、浅灰底、编号反相或底线锁定；不要让 20 页全部都是黑底白字，也不要使用浅紫底、浅紫边框、紫色晕染、缩放高亮、透明度淡入、文字模糊、3D 翻转或横向挤压。
- 用 CSS `data-visible` 状态控制卡片显示，不要在每一步点击时重建 GSAP / JS 动画上下文，否则已有卡片容易闪回透明态。
- 如果接入正式正文页并配右侧视频/截图，视频/截图区域保持静止；文字动效只作用于文字模块。

## 验收

以下命令用于本库 Demo / Deck 交互改造。提取到 Remotion 的适配实现执行目标工程的构建、状态与原生帧率动态检查，不创建不存在的点击流程。修改本库 Demo 时至少执行：

```bash
npm run build
npm run review:click
npm run review:capture
```

检查：

- `review/screenshots/contact-sheet.png`
- `review/steps/steps-contact-sheet.png`
- `review/screenshots/review-summary.json`

验收重点：

- 每个效果必须是可直接放进正文页的文字模块，不是封面舞台动画，也不是带效果说明的 Demo 页。
- 每一步有卡片弹出或轻强调，但最终排版保持正常可读。
- 点击到最后一步后应进入下一页，不要重播当前页或闪回第一步。
- 快速连续点击时，已经显示的卡片 opacity 必须保持 `1`，不能出现瞬间掉透明。
- 短标题不溢出、不重叠。
- 终态干净，保留正文页主标题和右侧静止视频/截图占位；不要出现效果名或说明文案。

## 独立连续视频的文字呈现

Fred要求将滚动、遮罩刷出、逐字输出、淡入淡出、短词错峰、原位换词与数值变化保存为后续视频参考。使用 `skills/fred-remotion-output/references/text-presentation.md` 和 `references.py --kind text-effects` 查询准确短区间与源码；与T类对象过渡按需组合。文字方法及证据只维护这一份canonical索引。本节适用于独立连续视频，原点击式Deck Demo的固定布局、静止媒体和透明度限制不自动继承；用户明确指定淡入淡出时可以采用。
