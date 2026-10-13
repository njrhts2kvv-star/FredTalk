# 组件库交付门禁

2026-10-03 Fred当前约束：Remotion仅允许准确复用已认可组件或在其基础上二创；原创必须有Fred当次、明确、对应场景的授权。本文优先于旧资料中允许自行原创的默认。2026-10-13 起，按 SKILL.md 的“场景级定制”理解二创：拆开已认可组件、只取动作或对象关系、为本期重写场景代码，都算二创（`adapted`），字段按下文“场景级定制怎么登记”填；纯文字页、通用模板和无来源的新风格仍需 `originalAuthorization`。

## 两个交付前门禁

1. **建议前**：按本句对象和动作检索；实际看选中组件的准确视频/核心帧，记录为何适合、保留什么、改变什么。完成内部表达与视觉验收后才给建议，不是先把通用文字页做完再补选型。
2. **关键帧前**：在上述基础上，核对库源码、本期适配函数及实际调用；实际渲染后对照参考审看。只有字体/颜色/圆角相似不算二创。字幕、角标、最长文字、背景、材质与主次均进入验收，不把网页功能正常或文件解码当作画面合格。

**候选比较（2026-10-12）**：suggestion阶段按每段`componentPlan.query`重算当前前3个库候选，每个都必须出现在`componentPlan.candidates`中，带`selected/rejected`及具体理由；原创授权段同样要比较，授权只免除“必须用库”，不免除“先看最接近的库组件”。先用`scene.py --manifest ... --scene-id ... --candidates-only`看候选（含旁白视角`narrationCandidates`），实际看视频/核心帧后再写决定。query改了，候选随之重算。

建议还要在整期Manifest执行[组件分配检查](component-distribution.md)。本门禁的suggestion阶段已调用它；重复组缺少当前具体比较、保留职责及实际视觉证据时拦截交付。单镜头合格不等于整期选型合理，不用“每段reason都非空”代替总览。

没有合适组件：记录待选及缺口，可向Fred解释缺少的表达能力；不能把待选方案作为已验收建议/关键帧输出，也不能硬套无关组件。纯文字也要选库中适用的文字组件，不能标`talk-only`绕过。

内部验收不新增用户审批。授权直出只覆盖等待，不覆盖此门禁。记录必须来自实际执行，禁止为了通过而自动填写“已看/通过”。脚本能检查证据和调用，不能证明审美，也不能认证用户发言真实性；助手必须对具体审看和真实授权负责。

```bash
python3 skills/fred-remotion-output/scripts/library_gate.py --manifest "$manifest" --stage suggestion --signature
python3 skills/fred-remotion-output/scripts/library_gate.py --manifest "$manifest" --stage suggestion --output "$episode/03_制作过程/qc/component-suggestion.json"
python3 skills/fred-remotion-output/scripts/library_gate.py --manifest "$manifest" --stage keyframes --output "$episode/03_制作过程/qc/component-keyframes.json"
```

`--signature`只输出待绑定上下文，不生成批准。内部实际审看后记录下列字段，再运行不带`--signature`的校验；退出码0且PASS才能交付。更换口播、选择、时序、源码或图片后重新验收受影响范围。失败报告不是交付许可；不得复用旧PASS绕过当前检查。公共`build_segment_review.py`直接重新检查，不信任旧receipt；自定义前端/聊天输出同样必须在交付前运行当前Manifest检查。旧成片不自动重渲或重签。

## 同一Manifest中的证据

每个Remotion段使用`reference`或`adapted`，已有`componentPlan`、`referenceChoices`继续使用，不增加第二份计划。当前组件必须为canonical库中已认可`keep`，排除/合并项不可用。

`componentPlan.inspectedReferences[]`记录：`id`、准确库视频或coreFrame的`path/sha256`、`observations`（看到了什么对象和动作）。必须属于选中的组件，不用任意截图替代。建议阶段无需实现源码；关键帧阶段沿用`referenceChoices.source/implementation/callSite`，必须通过已有TypeScript调用解析。`referenceCatalogRevision`绑定当前catalog。

每段`componentAcceptance`：

```json
{
  "status": "passed",
  "stage": "suggestion",
  "reviewer": "assistant",
  "contextSha256": "library_gate.py --signature的当前结果",
  "checks": {
    "semanticFit": "写本句与该组件对象/动作的具体匹配，不写泛泛的适合",
    "corePreserved": "指出保留的构图、对象关系或动作，以及二创边界",
    "visualQuality": "对照实际参考/输出说明字阶、底色、材质、容量；不能默认铺浅灰底"
  },
  "evidence": [{"path": "实际看过的本地文件", "sha256": "真实hash"}]
}
```

关键帧阶段`stage`改为`keyframes`，必须绑定`keyframeReview.frames/sourceFiles`，验收证据必须包含本次输出图，不是只看库预览。此记录不是Fred确认，不写入用户确认字段。无真实执行不能生成上述passed记录。

## 场景级定制怎么登记

只借动作、场景代码为本期重写时，`implementationMode` 写 `adapted`，门禁字段照常填，含义如下：

- `referenceChoices[]`：`id` 是动作来源组件；`reason` 写本句为什么要这个动作；`preserve` 写保留的动作或对象关系（如“同一源头分两份，一份断线停在 v1，一份沿线更新”）；`change` 写改了什么（如“场景代码重写，去掉原组件开场收尾，按 cue 对齐口播，末态交给下一段”）；`useScope` 写用在本段哪一截。
- `componentPlan.inspectedReferences`：实际看过的该组件视频或核心帧（sha256 必须是库里那份），`observations` 写看到的对象和动作。
- 关键帧阶段（`reference_usage.py`）：`useMode` 写 `local`；`keyAction` 写借来的具体动作；`source` 指向库里该组件源码文件和符号；`implementation` 指向本期实现这个动作的函数（可以是场景文件里的子组件）；`callSite` 指向调用它的位置。
- 场景文件第一行注释写同样的来源，便于对照。

一段借了多个组件的动作，就登记多条。找不到任何来源动作的，按下文原创授权处理。

## 例外边界

- 原创授权放在该段`originalAuthorization`：`by:"Fred"`、`sceneId`准确匹配、`allowOriginal:true`、真实`source/quote/requestedAt`。不能将笼统制作授权、旧期授权、助手建议当作原创许可；仍需本次内部验收与真实关键帧。
- 纯真实媒体使用`preserved-media`及实际`mediaContract.path/sha256`；声明`remotion/mixed`仍走库门禁。加入新解释动画不能假装纯媒体。
- 缺录屏使用`talk-only`加`recordingPlaceholder.requiredShot`，不得同时声明Remotion路线或组件引用；只允许显示缺失目标与占位，不是原创视觉内容通道。
- 现有固定字幕/角标覆盖层和B-roll独立生成流程不强制改成库组件。混合场景中的Remotion解释部分仍须验收。

## 回归

`python3 skills/fred-remotion-output/scripts/test_library_gate.py`。覆盖缺验收、原创/直出绕过、纯文字伪装、录屏占位边界、失效选择、旧验收、错误媒体指纹与缺源码/输出。
