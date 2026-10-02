# 质量门禁

本文件的 QC 是阶段产物验证，不替代 `preflight-stage-gates.md` 的动作前阻断。必须先由 gate runner 放行命令，再对产物做以下 QC；不能先生产、失败后返工来冒充门禁。

1. 合同：stableId 唯一；beat primary owner 完整唯一；duration/cues 合法；输出名和 Deck 映射唯一；保护集和排除页明确。
2. 静态与动作：文字准确、一个视觉中心、终态忠实；先说先出；0.8 秒内相关反应；无缓慢淡入/长刷字；最终帧清洁并保持。
3. 媒体：4K60/H.264/yuv420p/BT.709/AAC、帧数和时长通过；音轨非全静音；本轮 mtime/hash 新鲜。
4. Deck：registry 同源；第一页点击合同；其他页有声自动一次；loop=false；末帧保持；过渡页黑角标；离页清理；console 和网络无阻塞错误。
5. 发布：`OK` 页面、飞书非目标块和 Deck 非目标资产 hash 不变。QC 报告 PASS 且覆盖当前 staging hash。临时文件后 rename；同步正式目录与 Deck，生成 poster，再验证三处视频 hash 相同。

任一 Gate 失败都停止正式发布并报告具体页面、检查项和证据。

报告必须把四种结论分开：`encodingQc`、`visualFidelityQc`、`scriptTimingQc`、`userAcceptance`。`ffprobe` 或编码 PASS 不能被汇总成“视频 PASS”；只有四项都 PASS 才能进入 formal promotion。
