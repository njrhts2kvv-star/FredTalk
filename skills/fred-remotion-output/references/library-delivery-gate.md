# 组件库交付门禁

此便携规则优先于历史文档允许自行原创的默认。Remotion只能复用当前活跃目录组件或作可辨识二创；原创须当前用户按场景授权。纯录屏/真实媒体、固定字幕角标与明确录屏占位保留各自职责，不能伪装成纯媒体绕过动画检查。

## 使用

```bash
python3 skills/fred-remotion-output/scripts/library_gate.py --manifest manifest.json --stage suggestion --signature
python3 skills/fred-remotion-output/scripts/library_gate.py --manifest manifest.json --stage suggestion --output qc/suggestion.json
python3 skills/fred-remotion-output/scripts/library_gate.py --manifest manifest.json --stage keyframes --output qc/keyframes.json
```

`--signature`只输出上下文，不生成认可。先将返回的catalogRevision写入`referenceCatalogRevision`，再读取当前signature；任何输入/时序/选择/输出变化后重新审看。PASS才交付；build_segment_review.py重新检查当前Manifest，不信任旧receipt。

## 证据

- `referenceChoices[].id`使用活跃库ID或label；写清reason/preserve/change/useScope。
- `componentPlan.inspectedReferences[]`包含id、实际参考文件path/sha256及observations。hash须属于选中条目的已审查视频/封面；源文件文字不代替参考画面。
- `componentAcceptance`包含status=passed、stage、reviewer=assistant、contextSha256、checks的semanticFit/corePreserved/visualQuality具体说明，以及实际看过的evidence文件path/sha256。这是助手内部审看，不是用户确认；禁止自动填PASS。
- keyframes阶段另需`keyframeReview.frames/sourceFiles`真实hash；验收证据包含本次输出图。每个选择的source须对应当前分发源码；implementation/callSite记录path/sha256/symbol，callSite.callee绑定implementation.symbol。TypeScript解析检查真实声明与调用，不能只在注释里写组件名。脚本不能证明最终画面保留核心动作，仍须助手审看。

纯媒体使用preserved-media及真实mediaContract列表；录屏占位使用talk-only和recordingPlaceholder.requiredShot，不得同时声明Remotion路线或组件引用。原创使用originalAuthorization：by=user、sceneId、allowOriginal=true及真实source/quote/requestedAt，并保留内部审看与实际输出证据。笼统“做视频”不算原创授权。

分发目录排除条目不因原历史keep身份恢复。检索、隐私检查、源码校验与本次新内容视觉认可分开。安装apps/library依赖以使用TypeScript解析器。
