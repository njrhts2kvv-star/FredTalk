# 视觉系统

- 默认基础画布：浅色 `#FFFFFF`，深色 `#000000`；真实媒体、局部阴影与半透明聚焦合成不强制为纯色像素。
- 黑白为主要层级；强调色来源与用途写入当前合同，只在少量重点、选区或状态处使用。品牌和真实媒体保留来源色，不固定两套紫色值。
- 主文字使用项目批准的 MiSans/第 66 期 Deck 字体；左上标题 MiSans Semibold、600。
- 新编排按阅读角色使用真实字重：关键卡片、胶囊标签与结论用 `MiSans-Semibold.otf`（600），密集文档原文可用 `MiSans-Medium.otf`（500）。单个信息模块默认主/辅两档字号，同角色同字重；不是整片只能两档。中文保持自然字面与字距，准确场景实现沿用当前认可源字体；禁止依赖浏览器合成字重。
- Deck 标题从当前批准组件校准；独立视频不自动添加标题、装饰竖线和角标。中文保持自然字距。
- 正文只可等比缩放，禁止 `scaleX`、压窄字面或横向挤压。
- 白底角标：`assets/brand/fredtalk-ai-corner.png`；黑底角标：`assets/brand/fredtalk-ai-dark-transparent.png`。
- 角标按它所在区域的实际背景选版本，不按“实拍/过渡”名称或整帧平均亮度选择。Deck 组件的 top/right 40、211×52 只属于其接入基线；用户要求独立横版视频角标时，精确几何与裁切唯一读取 [corner-branding.json](../../fred-remake/references/corner-branding.json)，不复用旧4K起步参数。
- 每页只允许一个正确角标；不能烧录和 Deck overlay 重复。

一页一个视觉中心。上屏文字是口播骨架，不是字幕全文。生成方向图不生成统一标题和品牌 Chrome；正式组件在 Remotion/Deck 叠加。书封、Logo、产品 UI、数据和操作证据使用真实来源。参考整图只定义终态，正式动画拆成文字、几何和媒体层。

大胶囊是大型圆角信息模块，不是标签式小 pill。推荐终态参考 `reference-v12-v4-02-module-split`：前置模块建立信息后，横向主模块扩展并接管结论。是否需要色块由当前内容决定；文字必须重新排版，禁止 `scaleX` 或压缩字面。

表面、正文/波形、颜色与重复返修共用 [内容对象](../../fred-remotion-output/references/content-objects.md)。不要把仅适用于 Deck Chrome 的规则强加独立视频。
