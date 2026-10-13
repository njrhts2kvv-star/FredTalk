// 组件登记：id 为 Remotion composition ID；seconds 为默认时长；scene 用 12 个日常场景名；change 是“观众要看懂的变化”。
// component_kit.py new / add 会在 COMPONENTS 末尾追加条目，不要手改格式。
import { ABTimeRace, aBTimeRaceDefaults } from './components/T14a2-ABTimeRace';
import { TaskRunStatus, taskRunStatusDefaults } from './components/T09d2-TaskRunStatus';
import { ResultFirstHook, resultFirstHookDefaults } from './components/T20a2-ResultFirstHook';
import { NotEqual, notEqualDefaults } from './components/T05g-NotEqual';
import { PhaseCapsules, phaseCapsulesDefaults } from './components/T12d-PhaseCapsules';
import { ChapterBar, chapterBarDefaults } from './components/T12e-ChapterBar';
import { DotToLine, dotToLineDefaults } from './components/T01f-DotToLine';
import { ConditionCapsule, conditionCapsuleDefaults } from './components/T01e-ConditionCapsule';
import { DarkWindowType, darkWindowTypeDefaults } from './components/T01g-DarkWindowType';
import { ThreeMerge, threeMergeDefaults } from './components/T02e-ThreeMerge';
import { BlurList, blurListDefaults } from './components/T02f-BlurList';
import { StepChain, stepChainDefaults } from './components/T03e-StepChain';
import { CategoryFocus, categoryFocusDefaults } from './components/T04d-CategoryFocus';
import { Cycle, cycleDefaults } from './components/T03c-Cycle';
import { FourClips, fourClipsDefaults } from './components/T11c-FourClips';
import { AlternateFocus, alternateFocusDefaults } from './components/T11d-AlternateFocus';
import { PhoneTriptych, phoneTriptychDefaults } from './components/T05f-PhoneTriptych';
import { PosterReveal, posterRevealDefaults } from './components/T20d-PosterReveal';
import { FormFill, formFillDefaults } from './components/T09c-FormFill';
import { ScreenSideNotes, screenSideNotesDefaults } from './components/T09g-ScreenSideNotes';
import { EnableAuth, enableAuthDefaults } from './components/T09b-EnableAuth';
import { BatchQueue, batchQueueDefaults } from './components/T09f-BatchQueue';
import { ValueShift, valueShiftDefaults } from './components/T14d-ValueShift';
import { ScoreBars, scoreBarsDefaults } from './components/T15a-ScoreBars';
import { CostLedger, costLedgerDefaults } from './components/T15d-CostLedger';
import { StepNumber, stepNumberDefaults } from './components/T12b-StepNumber';
import { CaseTurn, caseTurnDefaults } from './components/T12c-CaseTurn';
import { ChapterRecap, chapterRecapDefaults } from './components/T12g-ChapterRecap';
import { TermDefine, termDefineDefaults } from './components/T01b-TermDefine';
import { PrincipleLines, principleLinesDefaults } from './components/T01c-PrincipleLines';
import { MythFlip, mythFlipDefaults } from './components/T06b-MythFlip';
import { RoleSplit, roleSplitDefaults } from './components/T04b-RoleSplit';
import { CauseChain, causeChainDefaults } from './components/T03d-CauseChain';
import { SliderCompare, sliderCompareDefaults } from './components/T05a-SliderCompare';
import { FitOrNot, fitOrNotDefaults } from './components/T05e-FitOrNot';
import { UpdateFlash, updateFlashDefaults } from './components/T20c-UpdateFlash';
import { PainContrast, painContrastDefaults } from './components/T20b-PainContrast';
import { MethodRecap, methodRecapDefaults } from './components/T21a-MethodRecap';
import { ProductPage, productPageDefaults } from './components/T18c-ProductPage';
import { ReactionCard, reactionCardDefaults } from './components/T19c-ReactionCard';
import { ReadmeScroll, readmeScrollDefaults } from './components/T08b-ReadmeScroll';
import { RegionMarks, regionMarksDefaults } from './components/T08d-RegionMarks';
// @imports

export type Entry = { id: string; title: string; scene: string; change: string; seconds: number; component: unknown; defaults: object };
export const COMPONENTS: Entry[] = [
  { id: 'T14a2-ABTimeRace', title: "A/B 耗时赛跑（返修）：轨道加长", scene: '数字与图表', change: "两方同时开跑 → 快的一方先到，倍数落定", seconds: 5.0, component: ABTimeRace, defaults: aBTimeRaceDefaults },
  { id: 'T09d2-TaskRunStatus', title: "发任务看运行（返修）：步骤按口播时间点完成", scene: '真实操作录屏', change: "任务发出 → 每一步按口播依次完成", seconds: 5.0, component: TaskRunStatus, defaults: taskRunStatusDefaults },
  { id: 'T20a2-ResultFirstHook', title: "成果先行开场（返修）：默认主图换单张作品", scene: '开场与收尾', change: "作品墙 → 推向一张主作品，钩子落定", seconds: 5.0, component: ResultFirstHook, defaults: resultFirstHookDefaults },
  { id: 'T05g-NotEqual', title: "不等号拆开两个概念", scene: '对比', change: "两个容易混的概念 → 中间落下不等号，被明确分开", seconds: 3.0, component: NotEqual, defaults: notEqualDefaults },
  { id: 'T12d-PhaseCapsules', title: "阶段胶囊：三枚胶囊建立，聚焦当前阶段", scene: '章节与节奏', change: "整体分成前/中/后几个阶段 → 收到当前要讲的这一段", seconds: 6.0, component: PhaseCapsules, defaults: phaseCapsulesDefaults },
  { id: 'T12e-ChapterBar', title: "章节白条擦出（快过渡）", scene: '章节与节奏', change: "黑底 → 白条擦出章节标题，再缩成徽标停住", seconds: 2.0, component: ChapterBar, defaults: chapterBarDefaults },
  { id: 'T01f-DotToLine', title: "圆点胀成关键句胶囊（快过渡）", scene: '一句话观点', change: "一个点 → 长成一句关键句胶囊", seconds: 2.5, component: DotToLine, defaults: dotToLineDefaults },
  { id: 'T01e-ConditionCapsule', title: "条件黑胶囊：圆点展开，逐字打出条件再补一段", scene: '一句话观点', change: "一个条件 → 补上第二个条件，组合成完整前提", seconds: 6.0, component: ConditionCapsule, defaults: conditionCapsuleDefaults },
  { id: 'T01g-DarkWindowType', title: "黑窗打字：背景失焦，黑窗里逐行打出规则", scene: '一句话观点', change: "界面退后 → 黑窗里逐行打出几条规则", seconds: 6.0, component: DarkWindowType, defaults: darkWindowTypeDefaults },
  { id: 'T02e-ThreeMerge', title: "三项汇聚长胶囊", scene: '列举要点', change: "几项能力依次建立 → 汇聚成一个长胶囊结论", seconds: 6.0, component: ThreeMerge, defaults: threeMergeDefaults },
  { id: 'T02f-BlurList', title: "虚化界面上点出几种方式", scene: '列举要点', change: "真实界面虚化退后 → 前景逐行点出几种方式", seconds: 5.0, component: BlurList, defaults: blurListDefaults },
  { id: 'T03e-StepChain', title: "步骤折行串起", scene: '流程与关系', change: "一串步骤 → 依次串起并折到下一行，看到完整链路", seconds: 7.0, component: StepChain, defaults: stepChainDefaults },
  { id: 'T04d-CategoryFocus', title: "展开分支后聚焦一类", scene: '流程与关系', change: "一个主题 → 展开几类 → 聚焦其中一类开讲", seconds: 4.5, component: CategoryFocus, defaults: categoryFocusDefaults },
  { id: 'T03c-Cycle', title: "三者循环互通", scene: '流程与关系', change: "几个环节 → 连成互通的循环，再落一个结论", seconds: 6.0, component: Cycle, defaults: cycleDefaults },
  { id: 'T11c-FourClips', title: "四格视频成果（背景干净版）", scene: '多图与作品', change: "几段成果视频 → 同时排开看全貌", seconds: 6.0, component: FourClips, defaults: fourClipsDefaults },
  { id: 'T11d-AlternateFocus', title: "素材与代码窗口交替聚焦", scene: '多图与作品', change: "两组画面 → 轮流清晰、轮流退后", seconds: 6.0, component: AlternateFocus, defaults: alternateFocusDefaults },
  { id: 'T05f-PhoneTriptych', title: "一部手机展开成三屏对照", scene: '对比', change: "一部手机 → 展开成三屏，对照三种状态", seconds: 6.0, component: PhoneTriptych, defaults: phoneTriptychDefaults },
  { id: 'T20d-PosterReveal', title: "作品错层汇聚后散开，中央让出主题", scene: '开场与收尾', change: "一堆作品汇聚 → 散到四边，中央落出主题", seconds: 5.0, component: PosterReveal, defaults: posterRevealDefaults },
  { id: 'T09c-FormFill', title: "参数填写：表单逐项填入，关键值点亮", scene: '真实操作录屏', change: "空表单 → 按顺序填好，关键参数被点亮", seconds: 5.0, component: FormFill, defaults: formFillDefaults },
  { id: 'T09g-ScreenSideNotes', title: "录屏 + 侧栏讲解", scene: '真实操作录屏', change: "录屏让出右侧 → 要点按口播逐条点亮", seconds: 6.0, component: ScreenSideNotes, defaults: screenSideNotesDefaults },
  { id: 'T09b-EnableAuth', title: "开通授权：按钮到授权弹窗到已开通", scene: '真实操作录屏', change: "未开通 → 点开授权 → 状态变成已开通", seconds: 5.0, component: EnableAuth, defaults: enableAuthDefaults },
  { id: 'T09f-BatchQueue', title: "批量入队：逐项选中，计数跳动", scene: '真实操作录屏', change: "一列待处理 → 逐项勾选进入队列，计数增加", seconds: 5.0, component: BatchQueue, defaults: batchQueueDefaults },
  { id: 'T14d-ValueShift', title: "前后数值变化", scene: '数字与图表', change: "旧数值 → 变成新数值，差值亮出", seconds: 5.0, component: ValueShift, defaults: valueShiftDefaults },
  { id: 'T15a-ScoreBars', title: "跑分条形图：条依次长出，主角高亮", scene: '数字与图表', change: "几个对象 → 按分数长出条形，主角被点亮", seconds: 5.0, component: ScoreBars, defaults: scoreBarsDefaults },
  { id: 'T15d-CostLedger', title: "成本账单逐行累计", scene: '数字与图表', change: "一项项费用 → 累计成合计", seconds: 5.0, component: CostLedger, defaults: costLedgerDefaults },
  { id: 'T12b-StepNumber', title: "第 N 点步骤号（快过渡）", scene: '章节与节奏', change: "大号序号落定 → 接出这一步的名字", seconds: 2.5, component: StepNumber, defaults: stepNumberDefaults },
  { id: 'T12c-CaseTurn', title: "案例转折：章节让位，案例卡翻入", scene: '章节与节奏', change: "讲完道理 → 转进一个具体案例", seconds: 3.0, component: CaseTurn, defaults: caseTurnDefaults },
  { id: 'T12g-ChapterRecap', title: "章节进度回顾", scene: '章节与节奏', change: "已讲的划过 → 当前这一章点亮", seconds: 3.0, component: ChapterRecap, defaults: chapterRecapDefaults },
  { id: 'T01b-TermDefine', title: "概念定义：术语到白话定义", scene: '一句话观点', change: "一个术语 → 拆出一句人话定义", seconds: 5.0, component: TermDefine, defaults: termDefineDefaults },
  { id: 'T01c-PrincipleLines', title: "原则口诀：三句依次锁定", scene: '一句话观点', change: "几句原则 → 依次落定成一组口诀", seconds: 5.0, component: PrincipleLines, defaults: principleLinesDefaults },
  { id: 'T06b-MythFlip', title: "反常识：常识被划掉，答案落定", scene: '一句话观点', change: "大家以为的 → 被划掉，换成真实答案", seconds: 5.0, component: MythFlip, defaults: mythFlipDefaults },
  { id: 'T04b-RoleSplit', title: "角色分工：每个工具各管一环", scene: '流程与关系', change: "一件事 → 拆给几个工具，各管一环", seconds: 5.0, component: RoleSplit, defaults: roleSplitDefaults },
  { id: 'T03d-CauseChain', title: "因果链推进", scene: '流程与关系', change: "一个原因 → 一步步推出结果", seconds: 5.0, component: CauseChain, defaults: causeChainDefaults },
  { id: 'T05a-SliderCompare', title: "滑杆前后对比", scene: '对比', change: "同一画面 → 滑杆擦过，看到前后差别", seconds: 5.0, component: SliderCompare, defaults: sliderCompareDefaults },
  { id: 'T05e-FitOrNot', title: "适用 / 不适用", scene: '对比', change: "一组情况 → 分到适合和不适合两边", seconds: 5.0, component: FitOrNot, defaults: fitOrNotDefaults },
  { id: 'T20c-UpdateFlash', title: "更新快讯开场", scene: '开场与收尾', change: "产品名落定 → 几个更新点快速亮出", seconds: 4.0, component: UpdateFlash, defaults: updateFlashDefaults },
  { id: 'T20b-PainContrast', title: "痛点反差开场", scene: '开场与收尾', change: "费劲的旧做法 → 一刀切到轻松的结果", seconds: 5.0, component: PainContrast, defaults: painContrastDefaults },
  { id: 'T21a-MethodRecap', title: "方法总结收尾", scene: '开场与收尾', change: "本期几条方法 → 收成一句话", seconds: 5.0, component: MethodRecap, defaults: methodRecapDefaults },
  { id: 'T18c-ProductPage', title: "产品官网介绍：长页滚动，卖点标注", scene: '产品与人物', change: "一张产品官网长页 → 滚到卖点处停住标注", seconds: 6.0, component: ProductPage, defaults: productPageDefaults },
  { id: 'T19c-ReactionCard', title: "惊叹反应：Fred 形象加短评", scene: '产品与人物', change: "看到结果 → Fred 惊叹，短评落定", seconds: 4.0, component: ReactionCard, defaults: reactionCardDefaults },
  { id: 'T08b-ReadmeScroll', title: "长网页滚动阅读，到标题停住", scene: '截图/网页/文档聚焦', change: "一张长页面 → 滚到关键段落停下读清", seconds: 6.0, component: ReadmeScroll, defaults: readmeScrollDefaults },
  { id: 'T08d-RegionMarks', title: "界面多区域依次标注", scene: '截图/网页/文档聚焦', change: "一张界面 → 几个区域按顺序被标出", seconds: 5.0, component: RegionMarks, defaults: regionMarksDefaults },
  // @entries
];
