# 新组件制作说明（每个制作者都按这份做）

本工程由 `component_kit.py new` 生成：Remotion 4.0.515，1920×1080，60fps。
- 固定规则：Skill 根目录的 `DESIGN.md` 第 2 节；
- 流程：`references/new-component-workflow.md`；
- 动效写法：`references/motion-craft.md`（必读，写动作前先看）；
- 质量标杆：`assets/reference-code/fred-native-16-20261012/source/src/components/T05c-RewriteLine.tsx`，以及同目录的 `previews/T05c-RewriteLine.mp4`。

## 开始前

- 只在 Fred 当次明确授权新做组件时进行。
- 用一句话写清“观众要看懂的变化”（谁 → 变成什么），写进 `add --change`。动作从这句话来，不从“挑个入场特效”来。
- 先用 `references.py --query` 查一遍：库里已有同一动作的组件时，就不新做（同一动作只是换颜色或素材，算重复）。

## 写组件

1. 用 `component_kit.py add` 建文件。每条导出三样东西：
   - 组件函数；
   - `<name>Defaults`，默认内容要真实；
   - Props 类型。

   文案、数量、素材路径全部做成 props。文字宽度用 `textWidth` 估算后，自动调字号或布局，不能写死成只适配默认文案。
2. 外观、曲线、字体、音效只用 `src/kit`（`theme.ts` 和 `ui.tsx`）。**不改 kit**。需要的新工具函数写在自己的组件文件里。
3. 时长：常规 5 秒（300 帧），快过渡约 2 秒。主体在前 0.3 秒内开始出现，结尾至少留 0.6 秒稳定阅读。
4. 素材用 Fred 的真实素材，复制到 `public/media/<前缀>-<名字>.<ext>`。
   - 图片不超过 8MB；视频截成 6 秒以内、宽 1920 的 H.264；
   - 不要用含真实密钥、手机号、私人聊天的画面；
   - 不要动原素材。

## 自查（必须做）

1. `npx tsc --noEmit` 通过。
2. `component_kit.py lint <工程>`：errors 必须为空，warnings 逐条确认。
3. `component_kit.py sheet <工程> <ID>`：用 Read 逐张看检查图，按 DESIGN.md 第 6 节检查。发现问题就改，再出图再看，直到达到 T05c 的水准。
4. 写一份更长、一份更短的文案 JSON，用 `sheet --props <json> --tag long` 再出图，确认不溢出、不叠字、主文字读得清。
5. 交付时列出每条的：ID、一句话变化、主要 props、用到的真实素材（复制后路径 + 原始路径）、看过的帧、已知局限。MP4 不在本地渲染，最后统一走云端渲染。
