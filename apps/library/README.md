# FredTalk 设计规范站

本地 React 规范站，把设计原则、可操作演示、完整视觉库、准确源码与取舍操作放到同一界面。浏览、查看代码、标记保留或不要都在本站完成；数据继续使用现有 catalog 和复看记录，不另建取舍台账。

现有本地入口：<http://127.0.0.1:3061/design/>。源码入口为本目录，资料服务实现见 [design_system.py](../design_system.py) 和 [review_server.py](../review_server.py)。本轮仅在本机构建与运行，没有发布到公网或外发素材。

## 构建与运行

依赖版本由 [package.json](package.json) 声明：React / React DOM 19.2.4、Remotion / Player 4.0.473、esbuild 0.28.0。构建需要支持 ES modules 的 Node.js。

在本目录执行：

```bash
npm run build
```

输出到同级工具的 `../web/design/`，由已有本地服务提供 `/design/`。如该服务尚未运行，可在本目录执行：

```bash
python3 ../launch_design.py --no-open
```

也可双击工具目录中的 `启动Fred规范站.command`。专用启动器核对服务健康、逻辑项目入口与现有复看指纹，匹配后才复用 `127.0.0.1:3061`；端口空闲时启动共享后端。`python3 ../launch_design.py --check` 只检查，不启动或打开页面。端口被不匹配的进程占用时会明确报错，不替换或终止它；重复打开网页不会更新已有 Python 进程。详情见 [启动说明](../design-server.md)。

构建脚本优先用本目录的 `node_modules/`；本目录尚未安装依赖时，可使用项目内已有的 `skills/_runtime/remotion/preferred-motion-v2/node_modules/`。它不从全局缓存或 App bundle 找生产依赖。若两处都没有 esbuild，构建会明确报错。

### 独立静态构建

把本目录复制到独立项目后，在该目录安装声明的依赖，再构建：

```bash
npm install
npm run build:standalone
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

打开 <http://127.0.0.1:4173/>。`build:standalone` 输出 `dist/index.html` 与 `dist/assets/`，不是单个内嵌 HTML，需通过 HTTP 静态服务器使用。它不打包 Python 后端、API 返回数据、历史视频、海报或字体。

没有资料接口时，基础规范与演示仍可用，页面明确提示参考库未连接。字体回退到浏览器可用字体；完整 `DESIGN.md`、复用图谱、真实参考视频与源码需要资料接口，取舍保存需要相应的复看 API。完整视觉库留在本站，不依靠外跳旧前端补齐功能。

## 源码与数据分工

| 入口 | 责任 |
| --- | --- |
| `src/content.js` | 站点导航、页面说明和设计原则 |
| `src/tokens.js` | 本站及新演示的颜色、字体名、表面与间距起点 |
| `src/App.jsx` | 站点导航、页面数据加载与模块编排 |
| `src/FoundationPages.jsx` | 字体、表面、组件、数据表达与共享品牌角标预览 |
| `src/DesignPages.jsx` | 首页、带案例的设计原则、动作与开发说明页面 |
| `src/LayoutPage.jsx` | 正文、对比、卡片、全屏媒体四种布局演示；根据真实字幕 DOM 测量局部占用 |
| `src/case-curation.js` | 按准确参考 ID 编排各规范页的案例、观察点和适用边界 |
| `src/CaseStudies.jsx` | 同页真实案例播放、互斥播放和源码详情；读取原库及取舍状态 |
| `src/CasePoster.jsx` | 案例进入视口时从原视频解码指定静帧；不播放、不写入或重绘原素材 |
| `src/PrincipleCompare.jsx` | 六组推荐做法与常见问题的教学示意；同对象的三阶段动作对照 |
| `src/ReferenceLibrary.jsx` | 完整视觉库的筛选、浏览、详情与准确源码查看 |
| `src/ReferencePlayer.jsx` | 准确区间播放、多段接续、慢放与逐帧控制；未知帧率时禁用逐帧 |
| `src/Curation.jsx` | 读取现有两套复看状态，处理保留、不要、撤销与具体意见的保存 |
| `src/UI.jsx` | 页面共享的标题、控件、代码块与演示容器 |
| `src/Markdown.jsx` | 规范与复用图谱的 Markdown 内容展示 |
| `src/demos/` | 新建静态与 Remotion 动态演示 |
| `src/demos/vendor/` | 实际使用的既有基元副本及来源、hash 说明 |
| `build.mjs` | 接入本地服务或独立静态输出 |
| `../design_system.py` | 从现有 catalog 与复看记录生成只读资料投影 |

演示源码随站点存在；历史案例的准确源码在运行时通过接口读取，两者身份不同。站点没有复制整套历史素材，也没有将用户备注烘焙进前端包。`design` 资料投影接口保持只读；用户点击保留、不要或撤销后，通过现有复看 API 保存原记录，不直接改写正式 catalog 或删除源素材。

设计原则、字体、材质、模块、数据、动作与布局页都直接使用统一库的真实案例。案例按稳定 ID 读取当前媒体和源码，遵守已有隐藏、合并及不要状态；点击播放或查看源码仍留在当前规范页。`PrincipleCompare` 的对照是独立教学示意，不是对历史成片的重新评判。

部分案例在 `posterFrame` 指定准确预览序号与源视频秒数。浏览器只在案例接近视口时解码这一帧，截图保留原比例并仅在当前页面内使用；解码未完成或失败时显示原库封面，原视频与原封面文件保持不变。静帧时间必须在对应预览区间内，不自动选择相似素材。

布局页的虚线是当前构图的起点，不是强制安全边界。没有字幕时正文可向下展开；长句按真实黑框宽高更新占用，媒体仍可铺满画布。正式制作继续按当前 cue、角标局部盒和完整运动路径检查，不把示例边距固化成跨期比例。

## 资料 API 契约

前端固定从同源绝对地址请求 API。独立部署需要同源实现下列接口或配置反向代理；当前没有可配置的跨域 API base URL。

| 方法与路径 | 返回与边界 |
| --- | --- |
| `GET /api/design-system` | `application/json`，结构见下方，当前 `schemaVersion: 1` |
| `GET /api/design-assets/<key>` | 已注册的视频、海报或字体，使用相应媒体类型；视频支持现有服务的 Range 读取 |
| `GET /api/design-source/<key>` | 已注册准确源文件的原始文本，`text/plain; charset=utf-8`、`no-store`、`nosniff` |

资源地址是不透明 key，调用方使用接口返回的 URL，不从文件路径计算或拼接。当前资料后端只解析明确注册的依赖，不提供任意文件路径读取接口。`/api/design-*` 资料接口不接受写入，POST 返回 `405`；这不表示整站只读，站内取舍通过既有复看接口保存。

`/api/design-system` 的结构：

| 字段 | 内容 |
| --- | --- |
| `schemaVersion` | 当前为 `1` |
| `design` | `markdown`、原文 `sha256`、`status`；另有 `reuseMarkdown`、`reuseSha256`。正文会遮盖识别到的本机路径，因此 hash 对应源文件原文，不应对返回正文重新计算后直接比较 |
| `fonts` | `body`、`semibold`、`subtitle`，值为同源资源 URL 或 `null` |
| `branding` | 正式角标配置的 `id`、`status`、`configSha256`、`baseCanvas`、`scaleRule` 与深浅背景 `variants`；每个版本含 `url`、`available`、`status`、`sourceSize`、`sourceCrop`、`destination`。原图先按像素裁切，再按逻辑画布比例显示 |
| `reviews` | `skill` 与 `remake` 各含 `fingerprint`、`revision`、`stale`，只提供身份与版本元数据，不返回私人备注；编辑状态从下方对应复看 API 获取 |
| `categories` | 现有统一库的用途分类数组，每项为 `id`、`title`、`description` |
| `items` | 下述参考条目数组；不写死条目数量 |
| `counts` | `total`、`available`、`unavailable`、`currentRemoved`、`visible`、`hidden`、`byKind`、`byReviewKind`；可播放数量按至少有一个本地预览计算。`visible/hidden` 只按既有合并与排除规则计数，不扣除本轮 `remove`，不等于当前筛选后的结果数 |

每个参考条目包含：

- 身份与检索：`id`、`label`、`title`、`kind`、`category`、`origin`、`description`、`tags`。`kind` 为 `components`、`clips`、`transitions`、`text-effects` 或 `remakes`；`categoryId` 和 `libraryOrder` 沿用统一库按用途的分类与顺序。
- 保存归属：`reviewKind` 为 `skill` 或 `remake`，决定使用哪套复看 API。条目 `id` 保持原身份，调用方不重编号，也不从标题或名称猜测写回对象。
- 原库状态：`selectionStatus` 保留对应 catalog 状态；没有 catalog 状态的选中场景实现为 `candidate`。`reviewStatus` 为 `keep`、`remove`、`unreviewed`、`canonical` 或 `stale-review`。本轮复看与对应库的身份不匹配时不应用旧决定。catalog 的 `drop` 条目不进入投影；本轮 `remove` 仍可在页面显式勾选查看。
- 合并与排除：`visibleByDefault`、`hiddenReason`、`mergedInto`、`status` 保留旧统一库的整理结果。`hiddenReason` 为 `null`、`merged` 或 `library-removed`；`mergedInto` 是目标 label 数组。已合并与已排除的条目仍在投影中，默认隐藏，可显式查看；`status` 为 `merged`、`remove` 或原 `reviewStatus`，不能把隐藏条目自动恢复为正常推荐。
- 复用能力：`reusability` 含 `level`、`label`、`parameters` 与 `limitations`。能力分类不代表画面质量或新视觉批准。
- `previews[]`：`videoUrl`、`posterUrl`、`available`、`status`、`start`、`end`、`fps`。时间单位为秒，播放遵守条目的准确区间；`fps: 0` 表示来源未提供帧率，不能把回退步长当作已核对的原生逐帧精度。
- `sources[]`：`label`、`symbol`、`url`、`available`、`status`；一个条目可以关联多个文件或符号。

资源状态为 `ready`、`missing` 或 `not-local`。iCloud 占位返回不可用状态，接口不会自动下载或生成媒体；单文件访问在缺失时返回 `404`，占位时返回 `503`。未注册 key 返回 `404`。前端应以实际可读状态为准，不能将 URL 存在当作文件已在本地。

角标还会校验素材来源、PNG 格式和 SHA-256；未通过时显示 `invalid-source`、`invalid-image` 或 `hash-mismatch`，不拿其他图代替。

统一库同时纳入 Skill 参考和已有成片的选中场景实现，分类、合并与排除沿用 `web/library.js` 的现有规则。当前清理版的媒体、海报与准确源码优先，当前版本缺失时不回退到旧版文件。完整索引、默认推荐范围和本轮取舍是不同状态，不能只看一个总数判断素材已全部认可。

### 站内取舍保存

视觉库复用两套已有记录：`reviewKind: skill` 使用 Skill 参考的复看，`reviewKind: remake` 使用选中场景实现的取舍。页面统一展示和操作，写回时保留各自的身份与版本。详情内可以保留、不要、撤销标记或保存具体意见，导出取舍下载当前已读取的两套 state。

| 方法与路径 | 用途 |
| --- | --- |
| `GET /api/review` | 返回 Skill 参考的 `{catalog, state}`；`state` 含 `fingerprint`、`revision`、`decisions`、`updatedAt` |
| `POST /api/review` | 保存 Skill 参考的一次用户取舍，成功后返回新的完整 state |
| `GET /api/remake-curation` | 返回选中场景实现的 state，结构同上 |
| `POST /api/remake-curation` | 保存选中场景实现的一次用户取舍，成功后返回新的完整 state |

写入使用 `Content-Type: application/json`，请求体为 `{id, decision, expectedRevision, fingerprint, notes}`。`decision` 支持 `keep`、`remove`、`unreviewed`、`reset`；`reset` 删除这条本轮复看记录。`notes` 是不超过 2000 字符的字符串；只改取舍时传回该条现有备注，不能用空串覆盖已有内容。

每次写入只由用户明确操作触发，发送前读取或使用当前对应 state，成功后采用返回的新 revision。版本或 fingerprint 不匹配返回 `409`；界面应显示失败并重新读取状态，不自动覆盖他人的修改。读取页面、筛选、播放或查看源码不会触发取舍写入。站点保存的是本轮复看记录，不直接修改正式 catalog，也不删除任何媒体。

## 认可、复用与授权边界

- `StaticDemos.jsx`、`AnimatedStage.jsx` 是本站新演示。表格和图表使用示意数据，不是产品实测、账号数据或第 95 / 99 / 100 期批准成片。
- `vendor/` 中的现有基元有独立来源记录；其 canonical manifest 尚未建立新视觉认可或完整动态一致。实际调用基元不等于整个新组合已获批准。
- 网站 tokens 是新演示的起点，不覆盖冻结的历史参考；复制本期内容后仍需检查字阶、容量、录音 cue、字幕运动包络、角标、接缝和实际成片。
- 原参考的取舍、接口成熟度、准确源码身份、技术通过与本期视觉认可分别记录。网站浏览、下载代码和构建成功都不会自动改变这些状态。
- 本目录可独立构建，只说明工程可移植，不构成开源或再分发授权。当前 `package.json` 保持 `private: true`，没有在此授予整站开源许可证。
- MiSans、得意黑、第三方组件、历史视频、品牌标识及原始源码各自适用其授权；不能默认全部允许公开。字体和历史素材不随静态构建打包。任何对外发布前需按拟发布的实际文件核对授权。
- API 的目录与说明字段会遮盖识别到的本机路径，但 `/api/design-source/` 返回准确原文件，不做内容改写；不要将整个本地资料服务当作已经脱敏的公共服务。源码、API 实际数据、用户记录和媒体是否可外发需要分别检查。

本站构建产物、依赖、日志和本地资料目录由 [.gitignore](.gitignore) 排除。文件忽略规则不能代替具体授权或内容检查。
