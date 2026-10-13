# 整期组件分配检查

单镜头有源码、有关键帧、看起来合格，仍可能让不同内容都套入同一模块。109期第一版在S02、S14、S17、S20、S22、S26六段使用107–05，就是这一类问题。它不是库里同一素材的别名去重能解决的。

## 选型时先看整期

先读完整稿件和实际媒体，按每段的解释任务选择：证明操作用真实录屏，精读内容用实际ROI，比较结果用比较关系，汇总输入用汇聚关系，故事用真实人物／场景／动作。不要先决定统一“主标题＋两胶囊”，再把口播改成适合那个模块的摘要。

建议交付前，在**整期同一Manifest**检查已选分配，查看准确候选片段或场景并排概览；重点看相邻和相隔段落是否承担不同任务却只有换词／换图的相同推进。不要只看最近一段。单场`scene.py`执行包不能代替整期检查。

**2026-10-12 Fred 明确（114期）：讲解结构类组件全片默认只出现一次**——路线图、方法卡、双身份卡、问答回答这类。114 v1 路线图出现5次，Fred：“用过一次就换”“不想再看到这个”。后面再讲到同一结构时换一种表达，不让同一个组件重新入场；确需呼应时在`componentDistributionReview`写明理由。详见[整期编排](episode-assembly.md#4-全片组件去重)。

同一播放外壳、字幕／角标、固定品牌段和连续录屏不是创意重复缺陷。S09→S10继续同一报告、S15→S16继续同一画布、S23→S24延续双窗交接，都可以复用核心。除上面讲解结构类组件全片默认一次外，没有“同组件最多一次／两次”或固定数量配额；真正该换的是与本句解释关系不符的机械套用。

## 已实现的检查

```bash
python3 skills/fred-remotion-output/scripts/component_distribution.py --manifest /path/manifest.json --signature
python3 skills/fred-remotion-output/scripts/component_distribution.py --manifest /path/manifest.json --output /path/qc/component-distribution.json
```

第一条只输出当前上下文和重复组，不生成批准。第二条在缺少当前助手整期比较时返回`REVIEW_REQUIRED`和非零退出码。`library_gate.py --stage suggestion`已自动调用同一检查，不是可忽略的独立建议。后续关键帧带入该记录时会检查它是否仍对应当前选择；不追溯修改旧成片或历史批准。

自动检查覆盖同一ID、已确认canonical别名，以及实际审看后在`referenceChoices[].layoutFamily`登记的同一视觉家族。不同编号可能调用同一个BatchA/BatchC分发函数，这只列为`sharedSourceCandidates`，不会自动认定为同一视觉组件。相似但不同来源的画面仍由助手实际整览判断；脚本不做审美判断，也不能保证永远没有重复观感。

## 当前Manifest中的整期比较

更换不适合的组件后重新计算上下文。保留确有职责的重复时，在`componentDistributionReview`记录真实助手比较，不抄通用“已通过”，不新增用户审批：

```json
{
  "status": "passed",
  "reviewedBy": "assistant",
  "contextSha256": "component_distribution.py当前输出",
  "decisions": [{
    "groupKey": "当前重复组groupKey",
    "sceneIds": ["S09", "S10"],
    "reuseKind": "continuous-object",
    "reason": "同一拉片报告由逐帧方法接到动作／场景／脚本逻辑，保留对象时钟和阅读上下文。",
    "comparisons": [{
      "stableId": "S09",
      "task": "解释实际逐帧分析方法",
      "visibleState": "报告中的镜头档案被提起阅读",
      "reusePurpose": "建立随后继续阅读的同一报告载体"
    }, {
      "stableId": "S10",
      "task": "核对动作、场景与脚本逻辑",
      "visibleState": "同一报告接着聚焦文字和相关帧图",
      "reusePurpose": "承接原媒体时钟，不重开页面"
    }],
    "evidence": [{"path": "实际看过的并排图／片段", "sha256": "真实hash"}]
  }]
}
```

`reuseKind`可为`continuous-object`、`intentional-reprise`、`shared-media-shell`或`distinct-adaptation`。记录必须覆盖所有当前重复组、每一次出现和具体职责，绑定真实比较文件。选择／文案职责／动作变化使上下文失效，不能勾选一次后一直沿用。这里只验证已记录的判断，真实性由助手负责；实际视觉质量继续按既有组件库门禁检查。

回归：`python3 skills/fred-remotion-output/scripts/test_component_distribution.py`。覆盖109式六段套用、别名、同源分发误合并、明确连续复用、上下文失效、缺逐段比较、证据变化和媒体职责排除。
