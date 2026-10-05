# 组件库

组件数据库位于仓库根目录 `library/catalog.json`，源码工程在 `components/projects/`。无需访问外部私人项目或旧任务目录。

```bash
python3 scripts/catalog.py --list
python3 scripts/catalog.py --query "流程" --limit 3
python3 scripts/catalog.py --id SP024 --full
```

每条记录包含表达用途、输入对象、动作、准确播放区间、源码链接及适配边界。`implementation.projects` 标明工程位置；`compositionId` 有值时定位注册场景，无值时查看该工程入口，不猜测同名组件。

素材从同一仓库的 Release 获取：先运行 `python3 scripts/assets.py status` 查看大小与状态，再用 `download` 下载并校验。需要改编源码时，用 `materialize --project components/projects/<id>` 还原所选工程的安全素材。被隔离素材必须用自己的安全输入替换。

成熟度分为完整参数组件、部分参数化场景和准确场景快照。有源码不意味着所有文字数量、比例和时长都能自动适配。改编时保留原有动作关系，并针对新内容验证首个可读状态、完整运动范围和出口。

历史身份表只用于编号查询与排除追踪，不携带私人审核意见，也不作为获取组件的外部入口。

第102期新增七条准确组件、时间范围和安装入口见[第102期组件](episode102-selected.md)。
