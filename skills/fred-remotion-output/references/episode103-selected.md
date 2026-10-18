# 第103期用户认可的三个组件

来源是第103期 v6 完整 4K60 成片。Fred 在当前会话明确选择以下三个时间范围，要求把视频与源码放入 Skill 前端库。原完整成片不因局部选择而获得整片认可；未来文案适配仍需实际检查。

| 编号 | 成片范围 | 用途与保留关系 | Remotion 入口 |
| --- | --- | --- | --- |
| 103-01 | 6–9 秒，180 帧 | 多张资料卡向四周散开，中央让出问题；保留错层、阴影、散开与标题接力 | `EP103ScatterQuestion` / `ScatterQuestion` |
| 103-02 | 52–56 秒，240 帧 | 真实证据窗快速缩小侧移，右侧两项说明按口播建立；保留 v6 的快速让位、稳定阅读和原录屏时钟 | `EP103EvidenceClaims` / `EvidenceClaims` |
| 103-03 | 57–69 秒，720 帧 | 深色窗口承接持续带教，从结论进入已有框架，新资料补入后进度与问题保持；保留窗口、资料身份与状态连续性 | `EP103ContinuityFramework` / `ContinuityFramework` |

集合 ID：`ep103-selected-20260930`。查询示例：

```bash
python3 skills/fred-remotion-output/scripts/references.py --collection ep103-selected-20260930 --limit 3
python3 skills/fred-remotion-output/scripts/references.py --id 103-02
```

项目实体目录为 `skills/fred-remotion-output/assets/reference-code/ep103-selected-20260930/`。`videos/` 保存从 v6 准确截取的 4K60 视频，含原口播与烧录字幕；`source/` 保存完整源码、public、字体与锁文件；`index.html` 是派生文件架。规范站 `http://127.0.0.1:3061/design/#library` 中可搜索 `103`，也可按“第103期 · 用户精选”用途筛选。

## 复用与适配

三条是可运行的准确场景组件，不是已经验证所有新内容的通用排版 API。`source/src/LibraryClips.tsx` 提供三个独立 React 入口及 `includeNarration` 开关；`library-entry.tsx` 注册原生 3840×2160、60fps 的 composition。原始源码保持字节一致，新入口通过偏移原片时钟复现所选范围，不重置中途媒体或对象状态。

复制 `source/` 到新一期后，再修改 `scenes.tsx` 的 `Opening` 卡片、问题与 cue，或 `Segment6.tsx` 的 `EvidenceRelay`、`Framework`、`ContinuityWindow` 文案、素材、轨迹与 cue。`timeline.json`、`SceneTiming.tsx`、`cues.json` 共同决定口播时序，不能只替换音轨或把本期秒数作为通用默认。原录屏使用 30fps 缓存帧；更换素材时重新建立连续源时钟。

第3条按 Fred 指定范围完整保存至69秒，包含68.7667秒开始的原结尾交接。底层源码为运行所需保留其他场景，不扩大这三条之外的认可范围。视频内烧录字幕与口播用于对照原片；新一期按新字幕、品牌显隐与安全区检查。

本集合与 N038/N054/窗口输入类参考有动作来源联系，但保留的是本期已认可的组合、v6 节奏和实际状态接力，不覆盖原参考或改变其取舍。新内容须验证最长文字、媒体比例、进度状态、完整运动范围和相邻交接。

运行依赖使用项目实体 `skills/_runtime/remotion/preferred-motion-v2/`，锁定 Remotion 4.0.473 / React 19.2.4；不依赖原 episode 目录、Desktop 测试工程或全局缓存。

```bash
node skills/fred-remotion-output/assets/reference-code/ep103-selected-20260930/source/render.cjs list
node skills/fred-remotion-output/assets/reference-code/ep103-selected-20260930/source/render.cjs render EP103EvidenceClaims /path/to/output.mp4
```
