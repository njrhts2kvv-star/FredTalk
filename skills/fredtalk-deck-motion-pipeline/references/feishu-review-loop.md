# 飞书评审闭环

读取 live revision，建立页面身份映射：`feishuRow + stableId + exactScreenWords + videoBlockId + checksum`。不要按附件顺序或旧文件名猜页。

评审区至少包含：`逐字稿文字`、`评审意见（留空给 Fred）`。反馈分类为 `OK`、时间轴、文字、静态图、动效、音效、标题/角标或播放逻辑。`OK` 页面进入保护集；只有命中页面和必要相邻过渡可写。

替换视频前后回读 block identity 和非目标 checksum；目标视频更新后保持表格、文字和其他附件不变。返修账本记录页面、意见、问题类型、修改方式、是否重生图片/视频、版本、验收标准和结果。上传完成不等于通过，等待 Fred 再评审。
