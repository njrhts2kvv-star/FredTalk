# 生产流水线

状态依次为：`source-frozen → direction-gate-pass → direction-approved → motion-gate-pass → draft-approved → render-gate-pass → rendered-staging → preview-user-approved → formal-gate-pass → media-qc-pass → deck-qc-pass → review-published → formal-promoted`。不能越级；图片批准不等于媒体 ready，单页 QC 不等于整期观看质量，飞书上传不等于正式发布。每个 `*-gate-pass` 必须发生在对应动作之前，事后补跑不追认已经绕过的生产动作。

建议目录：`01_输入素材/`、`02_最终输出/deck-videos/`、`03_制作过程/{source-snapshot,deck-image-prompts,remotion-deck-videos,deck,staging,qc}/`。

每轮 AI Loop：Observe 当前来源/反馈/旧 QC；Model 更新页面合同、motion brief、保护集和失败维度；Act 只修失败维度；Verify 自动合同、关键帧、真实浏览器和人工观看；Learn 只把跨期仍成立的规则写入 Skill。记录 `stableId/sourceRevision/inputHash/changedFiles/reason/evidence/verdict`。连续两次因“奇怪、不高级”失败时，回到 oneQuestion 和 topology，不继续换表面动效。
