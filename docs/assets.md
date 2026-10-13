# Asset installation / 素材安装

公开组件继续从这个 GitHub 仓库的 Release 下载。旧公开包沿用原标签，NMC01 新闻关键词快闪使用独立的公开补包。五个新批次共 105 条组件提供 30 天专属会员抢先：源码 ZIP、源码和原画质素材从 FredTalk 网站获取，普通会员不包含这项抢先权限；实际开始与公开时间以网站显示的日程为准。

仓库保留全部组件的编号、用法、预览身份、参数与原文件 SHA-256。会员源码不放在当前 `main` 的工程目录中，安装后位于 Git 忽略的 `.artifacts/member-components/`。未安装时，查询明确返回 `needs-auth` 或 `missing`，不会把目录元数据冒充可以运行的源码。曾经发布且已获得 MIT 授权的源码副本仍保留原许可；抢先下载窗口不会撤回这项授权。

## Public GitHub assets / 公开素材

Python 3.11+ and the [GitHub CLI](https://cli.github.com/) are required for public release downloads. The five daily font families are already included under `library/fonts/` with their notices.

```bash
python3 scripts/assets.py status
python3 scripts/assets.py download
python3 scripts/assets.py verify
python3 scripts/assets.py materialize --project components/projects/PROJECT_ID
```

`download` 默认只处理公开记录，不读取会员凭证。它保留旧标签和多段包的下载方式，核对包与每个对象的大小和 SHA-256，再安装文件。`library/releases.json` 是准确包名、标签和体积的事实源。需要改成自己的内容时，把工程复制到独立工作目录。

## Exclusive member assets / 专属会员素材

在网站的账号页创建仅用于视觉库读取的 Agent token。CLI 只读取 `FREDTALK_MEMBER_TOKEN` 环境变量，或仓库外的本机文件 `~/.config/fredtalk/visual-library-token`。该文件须由当前用户所有、权限为 `0600`，只存 token 文本。也可通过 `--token-file /absolute/private/path` 指定另一份仓库外文件。

不要把 token 放在仓库、文档、下载 URL、命令参数或提交中。使用 `--token-file` 可以避免把 token 字符串写进 shell 历史；工具不会打印凭证。网站会在每次下载时检查 token 是否可撤销、是否仅有 `visual-library:read` 权限，以及账号当前是否具有专属会员资格。

```bash
# After creating a private mode-0600 token file outside the repository:
python3 scripts/assets.py status --members --collection fred-native-16-20261012
python3 scripts/assets.py download --members --collection fred-native-16-20261012
python3 scripts/assets.py materialize --members --collection fred-native-16-20261012
python3 scripts/assets.py verify --members --collection fred-native-16-20261012
python3 scripts/catalog.py --id T09a --full
```

`--members` 只选择会员网站资产。省略 `--collection` 时处理五个抢先批次；指定它时，只下载和安装该批次。`download` 下载源码 ZIP 和该批预览素材；`materialize` 解包到隔离目录，保持 Git 工作区源码不变。凭证存在不等于下载成功：状态仍须由实际文件与 hash 核验决定。

查找免费路径时可以明确选择公开组件：

```bash
python3 scripts/catalog.py --access public --query "两个工具价格对比" --limit 3
python3 scripts/catalog.py --access installed --query "三个要点列表" --limit 3
```

逐段 Manifest 可以设置 `componentPlan.access: "public"`。默认候选仍显示抢先组件的可用性，并在需要时提供可用的公开候选。未安装、缺授权或 hash 已变的源码不能被门禁记为已选的可执行组件；先下载并安装，或写清理由后采用可用的公开组件。

## Download and ZIP checks / 下载与解包核验

Member requests use only `https://www.fred-fu.com/api/visual-library/assets/<full-sha256>.<ext>` and an `Authorization: Bearer` header when needed. Other hosts, HTTP, user-info URLs, query credentials and cross-host redirects are rejected before the bearer token can be forwarded. HTTP 401/403 becomes a generic `needs-auth` result without echoing server messages or credentials.

Each download must match its declared size and SHA-256. A source ZIP must also match `library/member-packages.json` exactly: every declared file has its own size and SHA-256; missing, extra or duplicate files fail. Installation rejects absolute/traversal/non-canonical paths, backslashes, symlinks, device entries, encrypted entries, `.git`, `node_modules` and `.env` files. Limits are 10,000 files, 512 MiB total expansion, 128 MiB per file and a compression ratio of 1,000. Extraction occurs in a staging directory and becomes visible only after every file passes. A changed installed package is preserved and must be inspected before reinstalling.

The installer does not run npm scripts or source code. Copy a verified project to a separate working directory, then inspect and install the package's locked dependencies. Entry points and source locations become resolvable by `references.py` and scene tooling only when the actual installation passes verification.

## Excluded assets / 被排除的素材

`quarantined` records remain visible for traceability and are absent from public packs. Supply your own inputs when a chosen scene requires them. Fred's private background music, machine binding, personal source recordings and account credentials are outside this distribution. Media, fonts and third-party content retain their own licenses and permissions.

抢先时间：北京时间 **2026-10-13 11:15 至 2026-11-12 11:15**（UTC `2026-10-13T03:15:00.000Z` 至 `2026-11-12T03:15:00.000Z`），共 30 天，适用于上述五个批次的专属会员下载。

## New batches from day one / 后续新批次流程

后续的新批次从第一天就把源码、源码 ZIP 和原画质素材放进网站私有存储。公共仓库只登记目录、用途、参数、海报和明确标注身份的派生预览；公开预览使用网站静态资源 URL，不走会员接口，也不需要 Agent token。

每个 batch 固定 `startsAt` 与恰好 30 天后的 `publicAt`，并只授予有效 `exclusive_group` 抢先读取。发布前核对 main、历史标签候选、仓库自动 archive、Release 包及静态路径，保证新的私有素材没有提前进入公开分发。到期由网站 API 自动允许匿名读取；如需把该批源码和素材补到 GitHub，再确认源码包的许可、第三方范围和完整 hash 后同步公开包。

当前这五批已经公开过，并已授予相应原创部分 MIT 许可。已有历史 commit/tag 中的公开源码仍可获取；本次保留这些历史，不声称可以追回已有副本。新的私有发布流程只能约束后续分发。
