# Library 自选24条 · 当前认可版

> 2026-10-04 当前修订：本文件的旧批次名称、源码路径、原参考音轨和批准过程是历史来源记录，不是当前入口说明。先用 `references.py --id <编号> --full` 读取现行 `sourceBundle/sourceCode`；指向 `material-replacements-20261004` 的 SP 入口已移除 `includeSourceAudio`，当前预览无声，使用本期录音。新媒体使用102/108授权素材，旧动作取舍和来源记录仍分别保留。

Fred于本轮看过整体质量后，明确要求将Library部分加入前端与Skill供后续调用，并排除这批reference creator。集合 `library-selfpick24-20261001` 保存 **SP001–SP024 的 revision04**，每条绑定准确成片hash、原参考区间、三个真实动作核心帧、源码符号、依赖和原生时钟。短段/长段与重叠区间均保留，不覆盖其他Library集合。

这批reference creator12条 `Q01、Q02、Q03、Q05、Q07、Q11、Q12、Q13、Q14、Q15、Q16、Q17` 记录为 `drop`，不进入默认检索、推荐或视觉库。本次排除只作用于这批复刻，原文件和历史仍保留。

## 按用途选择

| 用途 | 编号 | 保存的动作关系 |
| --- | --- | --- |
| 图片、真实素材与能力对照 | SP001、SP002、SP003、SP011、SP014、SP022 | 三图并列、短/长段素材与痛点交接、能力四格、四格视频墙、实拍与提示词对照 |
| 设备与真实操作 | SP006、SP013 | 手机输入聚焦、白色应用操作与关键词/人物交接 |
| 文档、表格与脚本阅读 | SP007、SP010、SP018 | 表格前置、长文浮在模糊背景前、脚本与人物参考并列 |
| 关系建立与聚合 | SP015、SP016、SP019、SP020 | 素材连到结果、流程扩展、圆形模型标签聚合、三胶囊建立关系 |
| 关键词、阶段清单与目标 | SP004、SP005、SP008、SP009、SP012、SP017、SP021、SP023、SP024 | 数字胶囊开场、阶段建立和加勾、关键词前置、手机旁文字接力、流程逐行突出、深窗能力/任务/目标 |

## 检索与运行

视觉库 `http://127.0.0.1:3061/design/#library` 按用途选择 **Library · 用户精选24条**，也可搜索 `Library24` 或 `SP004`。原有卡片身份 `combined-remake:SPxxx` 保持；卡片读取项目正式实体，提供当前视频、核心帧及准确源码。

从FredTalk项目入口执行：

```bash
python3 skills/fred-remotion-output/scripts/references.py --collection library-selfpick24-20261001 --limit 24
python3 skills/fred-remotion-output/scripts/references.py --id SP004
python3 skills/fred-remotion-output/scripts/references.py --collection library-selfpick24-20261001 --scene-type relationship --limit 4
node skills/fred-remotion-output/assets/reference-code/library-selfpick24-20261001/source/render.cjs list
```

`--id SP004`返回准确 `sourceCode` 符号、`sourceBundle`、`entryPoint`、`publicDir`、`dependencyManifest`、`media`和`nativeTiming`。保存实体在 `skills/fred-remotion-output/assets/reference-code/library-selfpick24-20261001/`，`videos/`为认可复刻，`originals/`为Library准确参考区间，`keyframes/`与`posters/`用于浏览，`source/`保留源码、帧序列、录屏、人物、字体、Manifest及锁文件；`index.html`为派生文件架。生产不依赖桌面TEST520或临时附件。

## 准确调用与适配边界

`source/src/library-entry.tsx`只注册24个Library composition，沿用每条原生30/60fps与帧数，包括SP023/024的2560×1440。原冻结归档字节保持，原 `src/index.tsx` 和历史reference creator依赖仅作来源保留，不能用它注册已排除片段。

以下旧工程运行方式仅作历史说明；当前生产按查询返回的新工程/锁文件运行。

原集合使用项目实体runtime `skills/_runtime/remotion/library-remakes-20260916`，固定Remotion **4.0.515**、React/ReactDOM **19.2.4**、TypeScript **5.9.3**。独立进程构建，不升级其他库。`render.cjs list`列出24条；`render.cjs render SP004 /absolute/new-output.mp4`按原时钟回放固定样例，并按云任务方式混入保存的参考音轨。

旧冻结工程曾提供 `includeSourceAudio`，组件注册默认true；旧render.cjs实际传false并静音，不能将组件默认值当成当前渲染默认。当前素材修订入口已移除该接口。新一期必须关闭原Library参考音轨，接本期录音；文字、数量、图像、录屏及cue在查询返回的源码符号和导入JSON中适配。这些是**已认可的准确场景**，尚无经过任意内容测试的通用文案API。原生素材图层不能凭换一句文案自动改出新内容。

复制源包到本期再修改，保留动作关系、字体层级和素材职责，核对最长文字、运动中段、真实阅读停留及相邻交接。更改fps时需同时重映射所有帧cue、素材和轨迹，不能只改composition fps。

认可覆盖当前视频用于复用；技术校验、源码构建和24条实际挂载分别有记录。部分画面使用真实媒体、原生帧或拟合轨迹，具体限制在每条 `knownLimitations`。不将本次入库写成与Library逐像素一致、修后全帧内部动态审看通过或新适配已获批准。

## 2026-10-06 最新替代

原24条登记与批准历史保持；SP021本轮归档，默认代表为109-05。准确比较、旧编号跳转与源码边界见[第109期精选](episode109-selected.md)。
