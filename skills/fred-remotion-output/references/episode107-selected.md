# 第107期用户认可的五个组件

来源为第107期最终 `V3-R7` 4K60成片。Fred明确要求把以下五个区间的视频和准确源码收进Skill前端库；认可范围只覆盖指定区间，不自动扩大到原整片、其他场景或所有新文案。

| 编号 | 成片范围 | 动作与用途 | 独立入口 |
| --- | --- | --- | --- |
| 107-01 | 9–12秒，180帧 | 错层资料卡连续移动与让位，中央问题窗接管，价格/问句刷出 | `EP107CardsToQuestion` / `CardsToQuestion` |
| 107-02 | 48–50秒，120帧 | 三项流程收束，接力真实工作案例；含49.8167秒开始的S09原交接 | `EP107SupportToEvidence` / `SupportToEvidence` |
| 107-03 | 1:13–1:20，420帧 | 同尺度版本窗先后建立，黄色箭头明确更新关系，下方结论出现 | `EP107VersionComparison` / `VersionComparison` |
| 107-04 | 2:52–2:59，420帧 | 三项媒体/能力按口播建立，向中心汇聚成结果长胶囊 | `EP107CapabilitiesMerge` / `CapabilitiesMerge` |
| 107-05 | 3:03–3:07，240帧 | 已建立的居中结论连续右移，后续两项原因按cue刷入，同屏阅读 | `EP107ConclusionToReasons` / `ConclusionToReasons` |

第一条用户原文为“99到12秒”，当前按“9到12秒”解释并已提出澄清；原话与解释分别保留在选择来源中，不改写原话。区间按半开帧范围保存，结尾秒不包含下一帧。

集合ID为`ep107-selected-20260930`。规范站`http://127.0.0.1:3061/design/#library`中搜索`107`，或按“第107期 · 用户精选”筛选。项目实体为`skills/fred-remotion-output/assets/reference-code/ep107-selected-20260930/`：`videos/`为五段4K60原片摘录，`keyframes/`为每段三个真实动作帧，`source/`保存完整准确源码、Manifest、public、字体与锁文件，`index.html`为派生文件架。

```bash
python3 skills/fred-remotion-output/scripts/references.py --collection ep107-selected-20260930 --limit 5
python3 skills/fred-remotion-output/scripts/references.py --id 107-03
node skills/fred-remotion-output/assets/reference-code/ep107-selected-20260930/source/render.cjs list
```

## 源码与复用边界

原始`src/index.tsx`等源码保持字节一致。新增`ApprovedEpisode.tsx`移除原composition注册并公开准确回放入口；`LibraryClips.tsx`通过偏移原片时钟保留中途状态、媒体时钟、字幕和接缝，不从零重启所选场景。`includeNarration`只控制原口播；视频自身音轨仍按原素材处理。依赖固定为项目本地Remotion 4.0.473 / React 19.2.4，不依赖原episode目录、外部缓存或Desktop工程。

未来使用时复制到新一期，再在对应R7/R6场景源码中替换文案、图片与cue，同步更新Manifest字幕和品牌显隐，并检查最长文字、首个完整可读状态、运动中段与相邻交接。这五条是已认可的准确场景组件，不冒称已验证任意参数的通用API。

107-01与N038、107-04与R006、107-05与B018有动作来源联系，保留本期已认可的R7组合、修订和时序；不覆盖或重新批准原库条目。保留整份运行源码和素材只为可独立构建，不扩大本次认可范围。
