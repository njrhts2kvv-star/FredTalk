// Curated against the current local catalog on 2026-09-23.
// Actual video frames were inspected; these are observation targets, not new
// approvals or whole-scene templates. Resolve media and selection state by id.
const cases = {
  T03: {
    id: "transitions:T03",
    label: "T03",
    posterFrame: { previewIndex: 0, time: 1.85 },
    title: "一个落点，长成一句话",
    observe:
      "黑色圆点先出现，横向展开为实心胶囊，随后白色主句落在同一个载体里。没有额外页眉抢走注意力。",
    adapt:
      "让载体尺寸跟随本句文字，用黑色填充、白色大字与柔和阴影建立重量；形变承担主句的出现。",
    scope:
      "借圆点到胶囊的连续形变与主文字比例；原句、固定时长和后续整屏交接不直接沿用。",
  },
  R026: {
    id: "remake:3a0fd8a6-8baf-4727-bdd9-bb7b316c4ebc",
    label: "R026",
    posterFrame: { previewIndex: 0, time: 2.583333 },
    title: "清单建立，再认准当前项",
    observe:
      "黑色胶囊在白底上纵向排列；当前“会议总结”保持白字，邻项退暗，随后清单展开到五项并交给具体画面。",
    adapt:
      "实心黑面和阴影负责承载，亮度与顺序负责焦点；进入下一段时让一个具体内容接管，而非重新开标题页。",
    scope:
      "这是胶囊材质与清单聚焦的例子，不固定五项、同样文案或末尾人物素材；退暗文字不是灰色卡片模板。",
  },
  W01: {
    id: "text-effects:W01",
    label: "W01",
    posterFrame: { previewIndex: 0, time: 1.8 },
    title: "紫色只跟着当前词",
    observe:
      "黑色窗口里文字随光标逐字出现，“讨论内容”被局部标紫，周围正文仍是白色；随后输入继续到下一行。",
    adapt:
      "颜色只标出本句正在解释的词，输入过程按真实语义推进；同一段里保留清楚的黑白主次。",
    scope:
      "只用于需要看到输入或生成过程的内容；不继承窗口按钮、原条目编号与原句，也不把逐字输出套到所有正文。",
  },
  T09: {
    id: "transitions:T09",
    label: "T09",
    posterFrame: { previewIndex: 0, time: 2.55 },
    title: "多份材料，聚成一个概念",
    observe:
      "多张圆形内容画面先横向排列，再聚到一起；最后保留一个圆形画面，与左侧“Codex +”共同组成新关系。",
    adapt:
      "先让观众认清每份材料，再用聚拢和身份保留表达“这些共同组成什么”；对象本身完成归组。",
    scope:
      "只借聚拢与归组，不继承 Codex 文案、人物、圆形裁切或加号；新内容没有相加关系时不用加号。",
  },
  T06: {
    id: "transitions:T06",
    label: "T06",
    posterFrame: { previewIndex: 0, time: 4.45 },
    title: "靠近正在读的那一列",
    observe:
      "同一张表格的局部横移到“下一步”一列，到位后保持“确认要解决的问题”“保留关键理由”等行内容可读。",
    adapt:
      "靠近和横移只服务当前要读的单元格；阅读时停止镜头，仍保留行列上下文，随后再决定回到全貌或接走下一项。",
    scope:
      "表内内容是示例。借局部阅读与停稳，不继承灰色斑马纹、浏览器栏和小标签；新表格优先白底黑字与间距。",
  },
  T07: {
    id: "transitions:T07",
    label: "T07",
    posterFrame: { previewIndex: 0, time: 0.55 },
    title: "从原文提炼，再交还原文",
    observe:
      "第一段让完整提示词失焦，清晰的参数词留在前景；第二段再把焦点交回原文。底下的材料始终是同一份。",
    adapt:
      "保留原材料作为背景，失焦与黑白表面降低干扰，前景承担当前提炼；退出后能继续阅读原材料。",
    scope:
      "两个短片段共同展示提炼与返回。此例提炼的是参数词，不是证明结论；不继承紫色词列或旧窗口外观，也不全程模糊需要读的正文。",
  },
  C017: {
    id: "component:fred-motion-source-e30e7f777b8ac9ae",
    label: "C017",
    title: "靠字重和反差，读清并列内容",
    observe:
      "“Prompt、模型、工具”等短词居中落在黑白交替的实面上；反白文字和黑字使用接近的视觉重量，行列关系直接可读。",
    adapt:
      "比较短词的字重、基线、居中与留白，让文字在不同底色上保持同样清楚；先按含义分组，再决定排列。",
    scope:
      "这是字与底面的对比样本，不要求每页九宫格、满屏拼格或逐格入场；更长文案不能靠缩小塞进原尺寸。",
  },
  R003: {
    id: "remake:0504f58a-a61b-4d1f-a26a-bcc863f4615b",
    label: "R003",
    title: "短句逐层建立，主文字保持尺度",
    observe:
      "白色短句从一行到多行逐步建立；人物背景退到后面，最后三行在同一区域里形成清楚的阅读顺序。",
    adapt:
      "新增句子改变信息层级，不让已出现的主文字突然缩成说明；每次增加内容后留出读完当前组的窗口。",
    scope:
      "只借大字、分行和逐层建立；参考片段的半透明灰色窗口、描边字效果、彩色背景和示例句子不成为新默认。",
  },
  R053: {
    id: "remake:library-round4-09",
    label: "R053",
    title: "同一种胶囊，承接不同阶段",
    observe:
      "圆点展开后建立“记录前／记录中／记录后”三枚黑胶囊；紫色只落在前、中、后，随后胶囊按阶段退出。",
    adapt:
      "同一表面承载平行阶段，强调字说明当前维度，退出顺序为接下来的具体讲解腾出位置。",
    scope:
      "阶段数与退出方向由本期内容决定；不继承模糊工作台背景、原句或每项都加紫色的固定用法。",
  },
  B062: {
    id: "component:library-fred-remake-062",
    label: "B062",
    title: "共用基线，才看得出差距",
    observe:
      "黑色 A 柱先增长到 32.0%，紫色 B 柱随后增长到 38.0%；两根柱保持同一基线，数值就在各自柱顶。",
    adapt:
      "让柱高与数字使用同一份数据和同一尺度，顺序跟随讲解；只在需要比较当前系列时使用局部紫色。",
    scope:
      "当前画面明确是示例数值，不是人物或 AI 的实测结果。真实制作须替换数据、单位和样本条件，不沿用 32%／38% 或旧标题。",
  },
  W08: {
    id: "text-effects:W08",
    label: "W08",
    title: "数值改变，阅读位置不变",
    observe:
      "前景黑色胶囊中的白色数字连续递减，数字仍占据同一个阅读槽位；背景材料退虚，注意力集中在变化本身。",
    adapt:
      "保留稳定载体与数值位置，让起点、变化和落点成为同一件事；必要时补齐单位和比较口径。",
    scope:
      "这里是示例数字动效，不是成本或性能测量；不继承原数字、宣传封面和彩色背景，真实数值不能为效果随意递变。",
  },
  T01: {
    id: "transitions:T01",
    label: "T01",
    title: "当前观点接管，上一项仍可回看",
    observe:
      "“自动整理记录”先占据主要位置，随后缩到下方；“需要时再找回来”进入并放大，上方已讲内容仍然留在场内。",
    adapt:
      "整枚胶囊连同文字一起让位，通过主次交换承接连续观点，保留已经建立的上下文。",
    scope:
      "只借主次交替和完整对象移动；不照搬固定三句、中心坐标或失焦人物背景。缩小过程是过渡，重要文字的阅读发生在停稳后。",
  },
  R038: {
    id: "remake:library-round3-03",
    label: "R038",
    title: "横屏让位，竖屏保留自己的比例",
    observe:
      "横向画面先单独占据舞台，再缩小到左侧；右侧进入竖向画面。两个媒体各自保留原比例与柔和阴影，形成并排对照。",
    adapt:
      "先明确主要内容，再让空间容纳第二个对象；媒体按原比例使用画布，字幕出现时只调整关键内容与实际遮挡部分。",
    scope:
      "例子本身没有字幕，不证明字幕已验收；借让位后的有效面积与比例，不在整屏套宽安全圈，也不继承人物素材或固定左右占比。",
  },
};

export const pageCases = {
  // Order matches the six principles in content.js.
  principles: [
    cases.T03,
    cases.R026,
    cases.W01,
    cases.T09,
    cases.T06,
    cases.T07,
  ],
  typography: [cases.C017, cases.R003, cases.W01],
  surfaces: [cases.T03, cases.R026, cases.T07],
  components: [cases.T03, cases.R026, cases.R053],
  data: [cases.T06, cases.B062, cases.W08],
  motion: [cases.T01, cases.T09, cases.T07],
  layout: [cases.R038],
};
