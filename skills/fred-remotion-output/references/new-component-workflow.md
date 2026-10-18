# 新做组件流程

用来持续做出和 16 条新组件（`fred-native-16-20261012`）同等质量的可复用组件。2026-10-12 这批被 Fred 评为“非常非常好”，本流程就是那次的做法，已固化成脚本和模板。

**前提：Fred 当次明确授权新做组件。** 没有授权时，仍然只复用、二创已认可组件。本期单个原创场景（不入库）见 [DESIGN.md 第 5 节](../DESIGN.md#5-没有现成组件时怎么做)。

## 为什么这样能保住质量

1. **质感靠代码保证，不靠记忆。** 颜色、阴影、圆角、字体、曲线、角标、音效全部来自固定基础库 `templates/component-kit/src/kit`。数值取自已认可组件的源码（[出处](style-kit-sources.md)），规则见 [DESIGN.md 第 2 节](../DESIGN.md)。lint 会比对 kit 指纹，改了就报错。
2. **从需求出发，一条一个动作。** 先写一句“观众要看懂的变化”，动作从这句话来。
3. **用 Fred 的真实素材。** 画面像 Fred 的视频，大半靠这一点。
4. **每条都看过画面。** 逐帧检查图、长短文案测试都做；技术检查通过，不等于画面过关。
5. **只换参数就能复用。** 内容全部走 props，以后 Codex 调用时只传本期内容，不用改源码。

## 本期驱动：先为这一期做组件

2026-10-12 第三轮的 50 条，大部分是读 114（GitHub）和 113（器灵）的口播后专门做的。Fred 后来在 114 成片里点名的五个好组件（T04e、T05h、T05i、T17c、T09l）全部出自这一批（T17c 是同批的通用组件，其余四个按口播专门做），114 也因此做到 90–95 分。做新一期前、库里又缺对应表达时，优先走这条路：

1. **读完整口播，标出“库里没有合适表达”的句子。** 不是每句都做；只挑观众最难看懂、最需要动作来解释的概念（114：仓库里装了什么、ZIP 和 clone 的区别、下载包打开是什么、文件夹结构、把地址交给 AI）。
2. **每条规格写清对应口播。** `qc/specs.json` 每条要有：`change`（谁 → 变成什么），`note` 里引用期号段号和原句（如“114 S13 ZIP vs clone”），写画面里的具体对象和动作，以及和库里相近组件的区别（如“和 T02e 方向相反：一拆多”），`source` 写来自哪期还是通用。
3. **默认内容用本期真实文案和素材**，但全部走 props。这样既能直接进本期片子，也能以后换内容复用（T09l 同时服务 114 的 clone 地址和 113 的调用地址）。
4. **Fred 在视觉库挑**，认可的入库。没认可的不作为公共组件进片子（它的动作仍可按场景级定制在本期重写）。
5. **进片子时做本期适配副本**（加组前缀，如 `v2b-T05i-UnboxResult`）：去掉组件自带的开场和收尾，按 `cue()` 对齐真实口播，按交接表接上一段、交给下一段。入库原版不改。
6. **代码由最强模型写。** 第三轮前 20 条改用中档模型写，主会话复审打回 9 条，全是排版判断（字太小、半截行、中间帧出画、终态不可读、占位图冒充 Logo、构图偏一侧）。这些教训见 `components-wave3-20261012/qc/WAVE3-BRIEF.md` 末尾，第 4 节自查照这六条查中间帧，不只看终态。

## 步骤

所有命令在正式工作目录 `90_工具与公共素材` 下执行（`K=skills/fred-remotion-output/scripts/component_kit.py`），也可以在新工程目录里执行。

### 1. 定做什么

- **看需求缺口**：读[组件库扩充计划](library-growth-plan.md)的“仍缺”清单和[整期组件分配](component-distribution.md)，优先补“用得多、组件少”的场景。
- **先查重**：用 `references.py --query <对象与动作> --limit 5` 查库。已有同一动作（只是颜色或素材不同）就不新做；动作不同的同类组件可以做，用来轮换。
- **每条先写一句“观众要看懂的变化”**（谁 → 变成什么），例如“同一行旧写法 → 新写法”“一整份配置 → 只需看懂这几行”。写不出这句话，就先别做。
- **选一个质量锚点**：可以只借它的动作关系，外观仍按 kit。

### 2. 建工程

```bash
python3 $K new 30_工具输出与实验记录/<批次名>
python3 $K add 30_工具输出与实验记录/<批次名> --id T22a-PlanTimeline \
  --title "版本时间线：节点依次点亮" --change "零散版本 → 一条有先后的时间线" --scene 流程与关系
```

- **`new` 会准备好**：
  - 固定 kit；
  - 字体、角标、音效；
  - 运行时 `library-remakes-20260916`（Remotion 4.0.515）；
  - 制作说明 `qc/BRIEF.md`。
- **`add` 会从模板生成组件文件**，并登记到 `src/registry.ts`。
- **ID 规则**：`<场景码>-<英文名>`，场景码沿用 T01–T21 小类，再加一个小写后缀。编号不能和库里已有的重复，入库检查会拦下重复编号。
- **`--scene` 只能填 12 个日常场景之一**：真实操作录屏、流程与关系、对比、章节与节奏、开场与收尾、数字与图表、一句话观点、截图/网页/文档聚焦、产品与人物、多图与作品、输入与对话、列举要点。

### 3. 写组件

- **动效写法读[动效手法](motion-craft.md)**：帧驱动、过冲回落、同一进度、对象连续、裁切擦出等，换模型也照这份写。
- **代码写法照 `T05c-RewriteLine.tsx`**（质量标杆，在 `assets/reference-code/fred-native-16-20261012/source/src/components/`）：
  - 导出 Props 类型、`<name>Defaults` 和组件函数；
  - 先算版式，再按时间轴算每个动作的进度；
  - 每个主动作配一个 `Sfx`。
- **kit 常用件**：
  - 场景容器 `Frame`（自带角标和 4K 缩放）；
  - 白卡或黑卡 `Surface`、黑胶囊 `Pill`、窗口 `MacWindow`、真实图片或视频 `Media`；
  - 光标 `Cursor`、点击环 `ClickRing`、音效 `Sfx`、文字样式 `textBase`；
  - 动画进度 `p` / `q` / `wipe` / `springAt` / `quintic`，逐字 `typed`，估算文字宽度 `textWidth`，相机推近 `cameraTransform`。
- **素材**：从 16 条新组件的素材清单（`fred-native-16-20261012/source/qc/materials.md`）里挑，复制到 `public/media/`。默认内容要真实。
- **多人并行时**：每个制作者（Codex 子任务或 Agent）只负责几条组件，都读同一份 `qc/BRIEF.md`。各自建测试入口，互不改别人的文件，**谁都不改 kit**。

### 4. 自查（每条都做）

```bash
cd <工程> && npx tsc --noEmit
python3 $K lint <工程>                                      # errors 必须为空，warnings 逐条确认
python3 $K sheet <工程> T22a-PlanTimeline                   # 开场、30/50/70%、末帧拼成 qc/<ID>-sheet.jpg
python3 $K sheet <工程> T22a-PlanTimeline --props long.json --tag long   # 长文案容量测试
```

- **检查图**：用 Read 逐张看，按 [DESIGN.md 第 6 节](../DESIGN.md#6-看画面时实际检查什么)检查：
  - 主文字读得清吗；
  - 有没有叠字、裁切、残留；
  - 角标有没有被压住；
  - 有没有大块空白；
  - 像不像 PPT；
  - 是不是重复了库里已有的动作。
- **改到什么程度**：发现问题就改，再出图再看，直到达到 T05c 的水准。
- **lint 管不到的**：好不好看、动作是否成立，只能看画面判断。

### 5. 云端渲染

```bash
python3 $K cloud-script <工程>            # 生成 cloud/render-all.sh，组件 ID 写死在脚本里
```

- **上传和下载**：按 [cloud-render](../../cloud-render/SKILL.md) 的流程打快照、上传、`npm ci`，再运行 `cloud/render-all.sh`。规格是 1080p60、H.264 CRF15、带音效。
- **下载后核对**：
  - 哈希一致；
  - 完整解码无报错；
  - 帧数和规格正确；
  - 抽帧确认字体正确加载。
- **2026-10-12 实际踩过的坑**：首次渲染前要先跑 `npx remotion browser ensure`，否则浏览器下载日志会混进输出。生成的脚本已经处理了。
- **用完就关**：渲染完按 cloud-render 的规则关机，不让服务器空转。

### 6. 交 Fred 挑选

```bash
python3 $K review <工程> --renders <工程>/renders-1080p60      # 选片页 http://127.0.0.1:3072/：保留 / 要改 / 不要 + 备注
python3 $K preview <工程> --renders <工程>/renders-1080p60     # 只要静态预览页时用
```

选片结果写入 `<工程>/qc/decisions.json`。升级版或返修版要和原版并排对比时，在 `<工程>/qc/replaces.json` 写 `{"新ID": {"label": "原编号", "note": "改了什么"}}`。

- **汇报写什么**：每条的场景、一句话变化、用了哪些真实素材、已知局限。
- **都是候选**：在 Fred 认可之前，都不进组件库。

### 7. 入库（只登记 Fred 认可的）

把每条的用途登记写成 JSON，格式见 `templates/component-kit/intake-meta.example.json`。取值范围：

| 字段 | 可选值 |
| --- | --- |
| `sceneTypes` | prompt-reading、image-comparison、device-demo、search-process、metric-change、relationship、summary、custom |
| `useIds` / `primaryUse` | explain、recording-focus、images、video-entry、handoff、data |
| `scenarioId` | headline、list、process、relation、question、input、focus、operation、compare、wall、gallery、chapter、window、object、text、data、number |
| `conceptIds` | text、input、process、media、handoff、focus、data、people、comparison、summary、orientation、cards、send、document |

```bash
python3 $K intake <工程> --collection <英文短名>-<YYYYMMDD> --accept T22a-PlanTimeline,T22b-... \
  --reject <不要的ID> --quote "<Fred 认可原话>" --meta meta.json --renders <工程>/renders-1080p60 \
  --title "<集合中文名>" --dry-run       # 先预检，PASS 后去掉 --dry-run 正式登记
```

`--renders` 里的认可成片可以是 1080p60，也可以是 Fred 认可的 1080p30（2026-10-18：“1080p30fps 也没问题的，不用重渲”）；`intake` 按成片实际帧率登记预览，组合时长按秒换算成工程的 60fps。

升级版或返修版通过后，加 `--supersede 新ID=原编号,...`：原版归档（不删，视觉库排在末尾，随时能恢复），默认检索只推荐新版。

`intake` 会一次完成：
- 组件包：源码（去掉不要的条目）、素材、成片、每条 3 个核心帧、selection.json、manifest；
- 登记：catalog、用途登记、文件清单、组合注册回执、依赖登记，并刷新其中的哈希；
- 备份：改动前的登记表存到 `assets/reference-archives/<集合>-intake/`。

之后还要手动做四件事：
1. **写说明文档**：照 [fred-native-components.md](fred-native-components.md) 写 `references/<集合>.md`，并在[组件集合索引](component-collections.md)加一行。
2. **验证**：
   - 跑全部测试；
   - 跑 `verify_dependencies.py`，确认新集合零报错；
   - 用 `references.py --query` 试搜，确认能搜到新组件。
3. **提交 Skill 的 Git**，并把改动同步到 `~/.codex/skills/fred-remotion-output`。catalog 同步到 `~/.codex/skills/fred-remake/assets/preferred-motion/`。
4. **更新[组件库扩充计划](library-growth-plan.md)的“仍缺”清单。**

## 改规则

- **谁能改**：kit 和 DESIGN.md 第 2 节是 Fred 的固定规则，只有 Fred 明确要求才能改。
- **怎么改**：
  1. 先改 `templates/component-kit/src/kit`；
  2. 更新 `kit.lock.json` 的指纹；
  3. 更新 DESIGN.md 第 2 节和[出处](style-kit-sources.md)；
  4. 跑 `test_component_kit.py`。
- **已入库的组件不受影响**：它们保留自己那份 kit，不自动跟着改。
