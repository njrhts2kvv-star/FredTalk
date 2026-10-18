# 第三轮精选组件 40 条

2026-10-12 Fred 在第三轮审看前端选择40条保留、4条不要，无返修备注，并在当前聊天明确要求收入组件库及最新本地视觉库。集合 `fred-wave3-40-20261012`。首次登记时间与前端选择时间分别保留；`selection.json` 和 `review-decisions.json` 绑定 revision 47、准确预览 SHA-256 及用户选择。

- **查询**：`references.py --collection fred-wave3-40-20261012`，或用准确编号 `--id T08e`。
- **实体**：`assets/reference-code/fred-wave3-40-20261012/`，`source/` 为40条源码、共享 kit 和素材，`previews/` 为认可的40条1080p60带声预览，`thumbnails/` 为120张核心帧。
- **复用**：复制实际组件、`src/kit/` 和依赖的 public 素材到本期工程，通过 props 换文字、图片、视频、数量、数据及 `cues`；`enter/exit/exitAt` 用于进出场交接。换内容后检查容量、可读性和媒体时钟，不把本次默认文案或示例数字固定成事实。
- **认可边界**：Fred认可的是审看页中的准确成片；不继承到不同素材、口播时间点或后续新版本。原始候选工程和第114期制作副本继续保留。
- **原40条入库时状态（历史 revision 47）**：不要 T08f 页面地图、T09h 搜索词改写、T08g 检查页面、T20e 往期回顾；未选 T08h 文档原文与 T22c 原话引用；T08i 毛玻璃卡缺视频；T17d/T10a/T19d 为暂停草稿。排除不删除原件。
- **发布范围**：仅本地 Skill 和3061视觉库；Fred明确选择本地优先，本轮未发布网站或GitHub。

## 按内容调用

| 编号 | 场景 | 动作 | 主要可编辑参数 |
| --- | --- | --- | --- |
| T08e | 截图/网页/文档聚焦 | 一张真实评论截图 → 里面的几个问题被框出、拎成大号黑胶囊叠在前景 | image、imageSize、comments、questions |
| T21b | 开场与收尾 | 几个问题胶囊 → 依次被答案接上，问号变对勾 | items |
| T02g | 章节与节奏 | 两条身份泳道 → 各自的步骤依次排开；回现时当前一步被点亮 | lanes、mode、current |
| T12h | 章节与节奏 | 大胶囊里的身份 A → 翻转成身份 B | from、to、note、accentTo |
| T12i | 章节与节奏 | 一个问题 → 大字落定，问号弹出 | question、label |
| T09i | 真实操作录屏 | 一列选项 → 条件胶囊连到匹配的那一行，其余退灰 | image、imageWidth、imageHeight、crop、conditions |
| T18d | 产品与人物 | 一个项目地址打出 → Star 数、语言、更新时间作为徽标依次落下 | owner、repo、badges、avatar |
| T04e | 流程与关系 | 一个整体（如仓库）→ 分层拆开，露出里面的几样东西 | cardImage、cardCrop、parts、result、highlight |
| T05h | 对比 | 同一个源头更新 → 拷贝的那份停在旧版本，同步的那份跟着更新 | author、authorNote、versions、zip、clone |
| T05i | 对比 | 两个下载包打开 → 一个直接是能用的软件，一个是一堆代码文件 | appPack、codePack、appName、appIcon、appLabel、files、codeLabel、conclusion、highlight |
| T09j | 真实操作录屏 | 终端里出现一次性验证码 → 码飞进浏览器输入格逐格填好 → 授权成功 | command、hint、code、footer、doneLine、url、pageTitle、pageSub、button、status |
| T04f | 流程与关系 | 一把钥匙插入 → 几项能力依次从锁定变成可用 | keyName、logo、abilities |
| T09k | 真实操作录屏 | 一列待上传文件 → 敏感文件被拦下放到一边，其余传上去 | folder、files、repoLabel、repoName、blockLabel、unit |
| T02h | 列举要点 | 几个文件卡依次立起 → 每张翻面露出一句用途 | files |
| T17c | 流程与关系 | 一个文件夹 → 逐层展开成目录树，关键文件被点亮并标注 | tree |
| T09l | 真实操作录屏 | 一个地址被复制 → 带着走到对话框里粘贴发送 | source、sourceSize、sourceCrop、field、copyButton、url、target、targetSize、targetCrop、placeholder、textStart、sendButton、sendRadius、prefix、maskBoxes、maskColor |
| T09n | 真实操作录屏 | 一段等待 → 时间胶囊快速翻过，直接到完成 | image、imageSize、maskBoxes、maskColor、label、minutes、prefix、suffix、brand |
| T09m | 真实操作录屏 | 几颗键帽 → 依次按下，组合落成一个动作名 | keys、action、highlight |
| T15e | 数字与图表 | 一条折线逐段画出 → 关键点落下数值标签 | series、labels、highlight、xDomain、yDomain、xTicks、yTicks、xPrefix、xSuffix、yPrefix、ySuffix、xTitle、yTitle |
| T15f | 数字与图表 | 一个圆环 → 各部分依次长出，主角那块抽出并亮出比例 | segments、highlight、decimals、centerNote、highlightLabel |
| T14e | 数字与图表 | 几项指标 → 数字同时滚动、依次落定成一排 | stats、hero |
| T14f | 数字与图表 | 一个仪表盘 → 指针走到读数，所在区间被点亮 | value、min、max、decimals、prefix、suffix、zones、caption |
| T15g | 数字与图表 | 名次从后往前一行行翻上来 → 第一名最后揭晓 | rows、decimals、prefix、suffix、caption |
| T15h | 数字与图表 | 一张多列测评表 → 逐格落下对错和数值，最后一行合计亮出赢家 | columns、rows、totalLabel、totals、winner |
| T15i | 数字与图表 | 几个套餐并排 → 价格落定，推荐的那个抬起 | plans、recommend、tag |
| T16a | 流程与关系 | 一条时间轴 → 节点依次点亮，当前节点展开说明 | nodes、focus |
| T16b | 对比 | 旧版本卡 → 被新版本卡一张张盖上，变化点被点亮 | versions |
| T18f | 产品与人物 | 一墙 Logo 铺开 → 被框成几组，点出其中一组 | logos、groups、focus |
| T22a | 截图/网页/文档聚焦 | 一条真实帖子截图浮起 → 关键句被荧光刷出并放大 | image、imageWidth、imageHeight、line、translation、highlight |
| T22b | 截图/网页/文档聚焦 | 几条新闻标题卡 → 快速叠落，最后一张停在最前 | items |
| T18e | 对比 | 两个 Logo 从两边撞到中间 → VS 落定 | left、right、vs |
| T13a | 流程与关系 | 几层从下往上叠起 → 当前讲的那一层被点亮 | layers、focus、note、highlight |
| T13b | 一句话观点 | 一个抽象概念 → 变成一个生活里的东西 | concept、object、link、line、highlight |
| T13c | 数字与图表 | 一个容器 → 东西放进去，装得下或溢出 | item、unit、containers、overText、fitText |
| T13d | 流程与关系 | 你发出的请求 → 沿线到服务器，再带着结果回来 | you、server、addressLabel、address、request、result、highlight、timeLabel、seconds |
| T04g | 流程与关系 | 一个问题 → 分叉成几条路，按条件落到推荐答案 | question、branches、recommend |
| T09o | 真实操作录屏 | 画面不动 → 一个圆形放大镜移到细节处放大 | image、imageSize、view、stops、from、zoom、radius、brand |
| T20f | 开场与收尾 | 成品画面全屏 → 缩到一角，标题“这是怎么做的”落定 | media、start、title、highlight、badge |
| T01h | 一句话观点 | 一个容易误会的点 → “注意”标签盖下，澄清句落定 | subject、clarify、highlight、stamp、backdrop |
| T21d | 开场与收尾 | 本期要点 → 逐条打勾，整页停住方便截图 | title、items、highlights、hint |

## 技术与局限

40条认可预览完整音视频解码通过；源码由 TypeScript AST 提取各条 Props 及 HandoffProps 接口。共享kit指纹检查通过。lint对坐标轴、流程连接线、勾选描边和原网页Download ZIP文本有提示，它们具有实际表达职责；T08e浅底荧光是固定浅底紫的透明形式。保留Fred认可画面，不为消除提示重做样片。

图表、测评表和套餐表的示例数据只用于演示动作，引用、新闻、下载文件名和产品信息按本期真实来源填写。真实截图换图后重核像素框、图像尺寸与阅读焦点；真实视频保持媒体时钟与声音。全历史库依赖校验在本次入库前已有384条旧问题，本集合定向验证及前后差异另存第三轮工程 `qc/intake-40/`。

## 后续补充

2026-10-12剩余4条完成云端出片后，Fred在revision51选择保留T08i/T10a、不要T17d/T19d；两条另入[补充集合](fred-wave3-extra-components.md)，累计42条。T08h/T22c仍未选。原40条准确认可与媒体保持。
