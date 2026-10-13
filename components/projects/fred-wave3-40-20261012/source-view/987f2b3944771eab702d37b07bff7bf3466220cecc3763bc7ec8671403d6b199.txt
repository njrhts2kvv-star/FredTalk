// 组件登记：id 为 Remotion composition ID；seconds 为默认时长；scene 用 12 个日常场景名；change 是“观众要看懂的变化”。
// component_kit.py new / add 会在 COMPONENTS 末尾追加条目，不要手改格式。
import { CommentPull, commentPullDefaults } from './components/T08e-CommentPull';
import { QAResolve, qAResolveDefaults } from './components/T21b-QAResolve';
import { RoleRoadmap, roleRoadmapDefaults } from './components/T02g-RoleRoadmap';
import { RoleSwitch, roleSwitchDefaults } from './components/T12h-RoleSwitch';
import { QuestionBeat, questionBeatDefaults } from './components/T12i-QuestionBeat';
import { PickRow, pickRowDefaults } from './components/T09i-PickRow';
import { RepoCard, repoCardDefaults } from './components/T18d-RepoCard';
import { PackOpen, packOpenDefaults } from './components/T04e-PackOpen';
import { SyncVsCopy, syncVsCopyDefaults } from './components/T05h-SyncVsCopy';
import { UnboxResult, unboxResultDefaults } from './components/T05i-UnboxResult';
import { DeviceCode, deviceCodeDefaults } from './components/T09j-DeviceCode';
import { KeyUnlock, keyUnlockDefaults } from './components/T04f-KeyUnlock';
import { FileFilter, fileFilterDefaults } from './components/T09k-FileFilter';
import { FileTrio, fileTrioDefaults } from './components/T02h-FileTrio';
import { FileTree, fileTreeDefaults } from './components/T17c-FileTree';
import { LinkCarry, linkCarryDefaults } from './components/T09l-LinkCarry';
import { Keycap, keycapDefaults } from './components/T09m-Keycap';
import { WaitSkip, waitSkipDefaults } from './components/T09n-WaitSkip';
import { TrendLine, trendLineDefaults } from './components/T15e-TrendLine';
import { DonutShare, donutShareDefaults } from './components/T15f-DonutShare';
import { StatTriplet, statTripletDefaults } from './components/T14e-StatTriplet';
import { Gauge, gaugeDefaults } from './components/T14f-Gauge';
import { RankReveal, rankRevealDefaults } from './components/T15g-RankReveal';
import { BenchmarkTable, benchmarkTableDefaults } from './components/T15h-BenchmarkTable';
import { PlanTable, planTableDefaults } from './components/T15i-PlanTable';
import { Timeline, timelineDefaults } from './components/T16a-Timeline';
import { VersionStack, versionStackDefaults } from './components/T16b-VersionStack';
import { LogoGrid, logoGridDefaults } from './components/T18f-LogoGrid';
import { PostCard, postCardDefaults } from './components/T22a-PostCard';
import { NewsStack, newsStackDefaults } from './components/T22b-NewsStack';
import { LogoVersus, logoVersusDefaults } from './components/T18e-LogoVersus';
import { StackLayers, stackLayersDefaults } from './components/T13a-StackLayers';
import { MetaphorMorph, metaphorMorphDefaults } from './components/T13b-MetaphorMorph';
import { CapacityFit, capacityFitDefaults } from './components/T13c-CapacityFit';
import { RequestTrip, requestTripDefaults } from './components/T13d-RequestTrip';
import { DecisionTree, decisionTreeDefaults } from './components/T04g-DecisionTree';
import { ZoomLens, zoomLensDefaults } from './components/T09o-ZoomLens';
import { ResultFirst, resultFirstDefaults } from './components/T20f-ResultFirst';
import { CautionTag, cautionTagDefaults } from './components/T01h-CautionTag';
import { SaveChecklist, saveChecklistDefaults } from './components/T21d-SaveChecklist';
// @imports

export type Entry = { id: string; title: string; scene: string; change: string; seconds: number; component: unknown; defaults: object };
export const COMPONENTS: Entry[] = [
  { id: 'T08e-CommentPull', title: "评论里拎出问题", scene: '截图/网页/文档聚焦', change: "一张真实评论截图 → 里面的几个问题被框出、拎成大号黑胶囊叠在前景", seconds: 5.0, component: CommentPull, defaults: commentPullDefaults },
  { id: 'T21b-QAResolve', title: "问题逐个被回答", scene: '开场与收尾', change: "几个问题胶囊 → 依次被答案接上，问号变对勾", seconds: 6.0, component: QAResolve, defaults: qAResolveDefaults },
  { id: 'T02g-RoleRoadmap', title: "两个身份路线图", scene: '章节与节奏', change: "两条身份泳道 → 各自的步骤依次排开；回现时当前一步被点亮", seconds: 5.0, component: RoleRoadmap, defaults: roleRoadmapDefaults },
  { id: 'T12h-RoleSwitch', title: "身份切换（快过渡）", scene: '章节与节奏', change: "大胶囊里的身份 A → 翻转成身份 B", seconds: 2.0, component: RoleSwitch, defaults: roleSwitchDefaults },
  { id: 'T12i-QuestionBeat', title: "一句问题砸下（快过渡）", scene: '章节与节奏', change: "一个问题 → 大字落定，问号弹出", seconds: 2.0, component: QuestionBeat, defaults: questionBeatDefaults },
  { id: 'T09i-PickRow', title: "按条件选中一行", scene: '真实操作录屏', change: "一列选项 → 条件胶囊连到匹配的那一行，其余退灰", seconds: 6.0, component: PickRow, defaults: pickRowDefaults },
  { id: 'T18d-RepoCard', title: "项目名片", scene: '产品与人物', change: "一个项目地址打出 → Star 数、语言、更新时间作为徽标依次落下", seconds: 5.0, component: RepoCard, defaults: repoCardDefaults },
  { id: 'T04e-PackOpen', title: "拆开看里面装了什么", scene: '流程与关系', change: "一个整体（如仓库）→ 分层拆开，露出里面的几样东西", seconds: 6.0, component: PackOpen, defaults: packOpenDefaults },
  { id: 'T05h-SyncVsCopy', title: "一次性拷贝 vs 持续同步", scene: '对比', change: "同一个源头更新 → 拷贝的那份停在旧版本，同步的那份跟着更新", seconds: 6.0, component: SyncVsCopy, defaults: syncVsCopyDefaults },
  { id: 'T05i-UnboxResult', title: "打开下载包看到什么", scene: '对比', change: "两个下载包打开 → 一个直接是能用的软件，一个是一堆代码文件", seconds: 5.0, component: UnboxResult, defaults: unboxResultDefaults },
  { id: 'T09j-DeviceCode', title: "验证码从一个窗口交给另一个", scene: '真实操作录屏', change: "终端里出现一次性验证码 → 码飞进浏览器输入格逐格填好 → 授权成功", seconds: 6.0, component: DeviceCode, defaults: deviceCodeDefaults },
  { id: 'T04f-KeyUnlock', title: "一把钥匙解锁几件事", scene: '流程与关系', change: "一把钥匙插入 → 几项能力依次从锁定变成可用", seconds: 5.0, component: KeyUnlock, defaults: keyUnlockDefaults },
  { id: 'T09k-FileFilter', title: "上传前过滤文件", scene: '真实操作录屏', change: "一列待上传文件 → 敏感文件被拦下放到一边，其余传上去", seconds: 6.0, component: FileFilter, defaults: fileFilterDefaults },
  { id: 'T02h-FileTrio', title: "几个必备文件", scene: '列举要点', change: "几个文件卡依次立起 → 每张翻面露出一句用途", seconds: 6.0, component: FileTrio, defaults: fileTrioDefaults },
  { id: 'T17c-FileTree', title: "文件夹结构", scene: '流程与关系', change: "一个文件夹 → 逐层展开成目录树，关键文件被点亮并标注", seconds: 5.0, component: FileTree, defaults: fileTreeDefaults },
  { id: 'T09l-LinkCarry', title: "复制地址交给 AI", scene: '真实操作录屏', change: "一个地址被复制 → 带着走到对话框里粘贴发送", seconds: 5.0, component: LinkCarry, defaults: linkCarryDefaults },
  { id: 'T09m-Keycap', title: "快捷键", scene: '真实操作录屏', change: "几颗键帽 → 依次按下，组合落成一个动作名", seconds: 3.0, component: Keycap, defaults: keycapDefaults },
  { id: 'T09n-WaitSkip', title: "等待快进", scene: '真实操作录屏', change: "一段等待 → 时间胶囊快速翻过，直接到完成", seconds: 3.0, component: WaitSkip, defaults: waitSkipDefaults },
  { id: 'T15e-TrendLine', title: "折线走势", scene: '数字与图表', change: "一条折线逐段画出 → 关键点落下数值标签", seconds: 6.0, component: TrendLine, defaults: trendLineDefaults },
  { id: 'T15f-DonutShare', title: "占比环", scene: '数字与图表', change: "一个圆环 → 各部分依次长出，主角那块抽出并亮出比例", seconds: 5.0, component: DonutShare, defaults: donutShareDefaults },
  { id: 'T14e-StatTriplet', title: "三个关键数字", scene: '数字与图表', change: "几项指标 → 数字同时滚动、依次落定成一排", seconds: 5.0, component: StatTriplet, defaults: statTripletDefaults },
  { id: 'T14f-Gauge', title: "仪表读数", scene: '数字与图表', change: "一个仪表盘 → 指针走到读数，所在区间被点亮", seconds: 5.0, component: Gauge, defaults: gaugeDefaults },
  { id: 'T15g-RankReveal', title: "排行揭晓", scene: '数字与图表', change: "名次从后往前一行行翻上来 → 第一名最后揭晓", seconds: 6.0, component: RankReveal, defaults: rankRevealDefaults },
  { id: 'T15h-BenchmarkTable', title: "多方测评表", scene: '数字与图表', change: "一张多列测评表 → 逐格落下对错和数值，最后一行合计亮出赢家", seconds: 7.0, component: BenchmarkTable, defaults: benchmarkTableDefaults },
  { id: 'T15i-PlanTable', title: "套餐对比", scene: '数字与图表', change: "几个套餐并排 → 价格落定，推荐的那个抬起", seconds: 6.0, component: PlanTable, defaults: planTableDefaults },
  { id: 'T16a-Timeline', title: "时间线", scene: '流程与关系', change: "一条时间轴 → 节点依次点亮，当前节点展开说明", seconds: 6.0, component: Timeline, defaults: timelineDefaults },
  { id: 'T16b-VersionStack', title: "版本迭代", scene: '对比', change: "旧版本卡 → 被新版本卡一张张盖上，变化点被点亮", seconds: 5.0, component: VersionStack, defaults: versionStackDefaults },
  { id: 'T18f-LogoGrid', title: "Logo 矩阵", scene: '产品与人物', change: "一墙 Logo 铺开 → 被框成几组，点出其中一组", seconds: 5.0, component: LogoGrid, defaults: logoGridDefaults },
  { id: 'T22a-PostCard', title: "帖子/推文卡", scene: '截图/网页/文档聚焦', change: "一条真实帖子截图浮起 → 关键句被荧光刷出并放大", seconds: 5.0, component: PostCard, defaults: postCardDefaults },
  { id: 'T22b-NewsStack', title: "新闻叠放", scene: '截图/网页/文档聚焦', change: "几条新闻标题卡 → 快速叠落，最后一张停在最前", seconds: 5.0, component: NewsStack, defaults: newsStackDefaults },
  { id: 'T18e-LogoVersus', title: "两方对决（快过渡）", scene: '对比', change: "两个 Logo 从两边撞到中间 → VS 落定", seconds: 3.0, component: LogoVersus, defaults: logoVersusDefaults },
  { id: 'T13a-StackLayers', title: "分层结构", scene: '流程与关系', change: "几层从下往上叠起 → 当前讲的那一层被点亮", seconds: 6.0, component: StackLayers, defaults: stackLayersDefaults },
  { id: 'T13b-MetaphorMorph', title: "比喻变形", scene: '一句话观点', change: "一个抽象概念 → 变成一个生活里的东西", seconds: 6.0, component: MetaphorMorph, defaults: metaphorMorphDefaults },
  { id: 'T13c-CapacityFit', title: "装不装得下", scene: '数字与图表', change: "一个容器 → 东西放进去，装得下或溢出", seconds: 6.0, component: CapacityFit, defaults: capacityFitDefaults },
  { id: 'T13d-RequestTrip', title: "请求往返", scene: '流程与关系', change: "你发出的请求 → 沿线到服务器，再带着结果回来", seconds: 6.0, component: RequestTrip, defaults: requestTripDefaults },
  { id: 'T04g-DecisionTree', title: "该选哪条路", scene: '流程与关系', change: "一个问题 → 分叉成几条路，按条件落到推荐答案", seconds: 6.0, component: DecisionTree, defaults: decisionTreeDefaults },
  { id: 'T09o-ZoomLens', title: "放大镜看细节", scene: '真实操作录屏', change: "画面不动 → 一个圆形放大镜移到细节处放大", seconds: 5.0, component: ZoomLens, defaults: zoomLensDefaults },
  { id: 'T20f-ResultFirst', title: "先看结果再倒回来", scene: '开场与收尾', change: "成品画面全屏 → 缩到一角，标题“这是怎么做的”落定", seconds: 5.0, component: ResultFirst, defaults: resultFirstDefaults },
  { id: 'T01h-CautionTag', title: "注意澄清", scene: '一句话观点', change: "一个容易误会的点 → “注意”标签盖下，澄清句落定", seconds: 3.0, component: CautionTag, defaults: cautionTagDefaults },
  { id: 'T21d-SaveChecklist', title: "可截图清单", scene: '开场与收尾', change: "本期要点 → 逐条打勾，整页停住方便截图", seconds: 6.0, component: SaveChecklist, defaults: saveChecklistDefaults },
  // @entries
];
