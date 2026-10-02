# 视频制作内部模块

| 当前需要 | 内部资料 | 使用边界 |
| --- | --- | --- |
| 连续视频的文字出现、滚动、刷出与退出 | [文字呈现](text-presentation.md)，`references.py --kind text-effects` | 字词、文字流与载体分别选择，绑定实际cue |
| 明确要用原Deck步骤卡/对比卡 | [原正文动效模块](../../body-text-motion-effects/SKILL.md)及其registry/源码 | 原React/GSAP点击式Demo；提取到Remotion时适配帧时钟，不自动继承固定比例/点击行为 |
| Remotion字体、音视频、字幕或动画技术 | [项目技术手册](../../remotion-best-practices/SKILL.md)与相关rules | 本期固定runtime和当前生产要求优先，通用latest脚手架/可省单帧检查不能覆盖本期合同 |
| 实现与渲染的共享阶段门禁 | [阶段入口](../../fredtalk-deck-motion-pipeline/references/preflight-stage-gates.md)及既有scripts | 保留源码、receipt与正式出片校验；不启动另一份整期时间线 |
| 明确维护或复现既有Deck、逐页播放接入 | [Deck专项编排资料](../../fredtalk-deck-motion-pipeline/SKILL.md) | 仅明确维护或复现既有Deck时读取；日常独立视频不进入其完整流程 |

`正文组件`原来只是`body-text-motion-effects`的中文别名，不维护第二套资产。通用全局Remotion技术手册仍可服务其他工程，Fred项目制作由本主入口按需调用。`fred-remake`和`cloud-render`保留独立注册与职责，其原文件及执行流程不改。

## 组件与视觉库使用

用主入口`references.py`检索当前认可库；它与规范站共用`library_matching.py`派生类别、原标签、用途标签和sceneTypes，不修改原选片或审看身份。复合中文动作词按可解释的语义标签扩展和相关度排序，准确ID/编号查询及keep/optional/drop边界保持。结果中的matching说明命中理由，不代表质量排名或新片视觉认可。

空检索时先拆对象与动作、换相关词或类型，不直接认定库中没有对应效果。整稿先确定各段信息责任，再选择完整模块或局部动作；组件数量随内容决定。取用时核对准确视频、参数/场景快照边界、源版本、实际入口、public和原生时钟；源码已复制与实际可见分别检查。

批量调用前运行`verify_dependencies.py`核验选择、文件hash、注册和固定runtime；本期沿既有source/implementation/callSite核对实际调用，真实关键帧与正常速度动态检查证明画面和动作。构建、登记、媒体可播放与新内容视觉通过各有范围，不相互代替。
