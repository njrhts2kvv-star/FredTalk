# 正文组件选择指南

## 选择原则

- 最稳的正文三卡：先选 `vertical-soft-pop`、`bottom-spring-list`、`plain-card-pop`。
- 三个并列结果：先选 `three-card-row`、`compact-row-pop`。
- 四个检查点：先选 `four-grid-pop`、`two-plus-two-grid`。
- 流程路线：先选 `left-rail-steps`、`timeline-rise`。
- QC / 验收：先选 `checklist-snap`。
- 旧流程到新流程：先选 `compare-pop`。
- 一个主卡带两个辅卡：先选 `bento-focus`。
- 正文小节收束：先选 `summary-with-steps`、`final-lock-list`。

## 替换文字

每个 `steps` 项只写短标题：

```ts
steps: ["先看问题", "拆成动作", "给出结果"]
```

解释交给口播或旁边视频/截图。若必须保留解释，只加一句短说明，不要把正文模块重新变成文档页。

## 接入正文页

Demo 展示的是正文页常用框架：页面主标题、正文文字模块、右侧静止视频/图片占位。接入正式 Deck 时，可以按需要调整文字模块和视频位的位置：

```text
顶部：page headline
一侧：body text motion module
另一侧：video or image placeholder
```

文字模块负责动作、判断、步骤；视频/截图负责真实画面。默认布局让文字模块约占 `1/3`，右侧视频/截图约占 `2/3`；不要让文字模块抢主视觉。不要让两边重复同一组词。不要渲染效果英文名、效果说明或调试标签。默认视觉只用白、黑、浅灰，紫色只用于小编号和关键词：白底用 `#8b5cf6`，黑卡上用更淡的 `#c4b5fd`；不要加浅紫底、紫色边框、紫色渐变或发光晕染。当前步骤高亮可以在 `dark / outline / left-bar / soft-fill / index-fill / underline` 中切换，不要连续多页都用黑底白字。

## 验收提示

打开 Demo 时直接看动态过程，而不是只看终态截图。终态必须是正常正文页：标题在、视频位在、效果说明不在。默认是手动点击，一次点击只推进一步；最后一步再点击进入下一页，不要重播当前页。动效差异主要体现在卡片轻推入、轻落位、勾选确认、时间线浮起等细节，不要使用透明度淡入、文字模糊、大缩放、3D 翻转或横向挤压。实现上优先用 CSS 状态过渡，不要每一步重建 JS 动画上下文。

## 正文停顿 / 承接

这两个效果来自 `cover-motion-effects`，Fred 已明确它们不算过渡页，更适合放到正文节奏里：

- `trv2-silent-dark-word`：深色停顿词，适合正文讲到一半需要「停一下」换气。
- `trv2-silent-light-word`：浅色承接词，适合停顿后回到下一段「继续」。

预览地址分别是 `http://127.0.0.1:3053/?slide=147` 和 `http://127.0.0.1:3053/?slide=148`。
