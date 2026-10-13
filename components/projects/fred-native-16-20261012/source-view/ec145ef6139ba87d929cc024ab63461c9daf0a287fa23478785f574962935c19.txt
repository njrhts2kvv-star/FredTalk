// 组件库登记（T21c 未入库）：id 为 Remotion composition ID；seconds 为默认时长；scene/subtype 对应过往 19 期的场景细分类。
import { RewriteLine, rewriteLineDefaults } from './components/T05c-RewriteLine';
import { BeforeNow, beforeNowDefaults } from './components/T05b-BeforeNow';
import { ToolFaceOff, toolFaceOffDefaults } from './components/T05d-ToolFaceOff';
import { VerdictCard, verdictCardDefaults } from './components/T01d-VerdictCard';
import { MetaphorMap, metaphorMapDefaults } from './components/T04a-MetaphorMap';
import { ClickPath, clickPathDefaults } from './components/T09a-ClickPath';
import { TaskRunStatus, taskRunStatusDefaults } from './components/T09d-TaskRunStatus';
import { TerminalRun, terminalRunDefaults } from './components/T17b-TerminalRun';
import { ConfigFocus, configFocusDefaults } from './components/T17a-ConfigFocus';
import { ResultFirstHook, resultFirstHookDefaults } from './components/T20a-ResultFirstHook';
import { PartTitle, partTitleDefaults } from './components/T12a-PartTitle';
import { AgendaThree, agendaThreeDefaults } from './components/T02a-AgendaThree';
import { PriceLand, priceLandDefaults } from './components/T14c-PriceLand';
import { ABTimeRace, abTimeRaceDefaults } from './components/T14a-ABTimeRace';
import { ToolCard, toolCardDefaults } from './components/T18a-ToolCard';
import { PainPoint, painPointDefaults } from './components/T19a-PainPoint';

export type Entry = { id: string; title: string; scene: string; subtype: string; seconds: number; component: unknown; defaults: object };
export const COMPONENTS: Entry[] = [
  { id: 'T09a-ClickPath', title: '点击路径聚焦：镜头跟光标找到入口并点下', scene: '真实操作录屏', subtype: 'T09a', seconds: 5, component: ClickPath, defaults: clickPathDefaults },
  { id: 'T09d-TaskRunStatus', title: '发任务看运行：输入发出后步骤依次完成', scene: '真实操作录屏', subtype: 'T09d', seconds: 5, component: TaskRunStatus, defaults: taskRunStatusDefaults },
  { id: 'T05b-BeforeNow', title: '以前 vs 现在：旧步骤收成一叠，新做法接管', scene: '对比', subtype: 'T05b', seconds: 5, component: BeforeNow, defaults: beforeNowDefaults },
  { id: 'T05c-RewriteLine', title: '原句改写：旧写法划掉、新写法替换', scene: '对比', subtype: 'T05c', seconds: 5, component: RewriteLine, defaults: rewriteLineDefaults },
  { id: 'T05d-ToolFaceOff', title: '工具并排：逐项比较，胜出格翻黑', scene: '对比', subtype: 'T05d', seconds: 5, component: ToolFaceOff, defaults: toolFaceOffDefaults },
  { id: 'T20a-ResultFirstHook', title: '成果先行开场：作品墙推向主图，钩子落定', scene: '开场与收尾', subtype: 'T20a', seconds: 5, component: ResultFirstHook, defaults: resultFirstHookDefaults },
  { id: 'T12a-PartTitle', title: '第 X 部分：点长成黑胶囊，章节名落定（快过渡）', scene: '章节与节奏', subtype: 'T12a', seconds: 2, component: PartTitle, defaults: partTitleDefaults },
  { id: 'T02a-AgendaThree', title: '本期 N 件事：卡片依次立起，当前项抬起', scene: '章节与节奏', subtype: 'T02a', seconds: 5, component: AgendaThree, defaults: agendaThreeDefaults },
  { id: 'T14c-PriceLand', title: '价格落定：数字逐位滚动，旧价划掉，差额亮出', scene: '数字与图表', subtype: 'T14c', seconds: 5, component: PriceLand, defaults: priceLandDefaults },
  { id: 'T14a-ABTimeRace', title: 'A/B 耗时：两条轨道计时赛跑，倍数落定', scene: '数字与图表', subtype: 'T14a', seconds: 5, component: ABTimeRace, defaults: abTimeRaceDefaults },
  { id: 'T01d-VerdictCard', title: '测评结论：实测作品退后，评分卡与结论落定', scene: '一句话观点', subtype: 'T01d', seconds: 5, component: VerdictCard, defaults: verdictCardDefaults },
  { id: 'T04a-MetaphorMap', title: '比喻映射：概念与生活比喻逐行配对再合一', scene: '流程与关系', subtype: 'T04a', seconds: 5, component: MetaphorMap, defaults: metaphorMapDefaults },
  { id: 'T17b-TerminalRun', title: '终端运行：命令执行、输出滚动、结果行点亮', scene: '截图/网页/文档聚焦', subtype: 'T17b', seconds: 5, component: TerminalRun, defaults: terminalRunDefaults },
  { id: 'T17a-ConfigFocus', title: '配置文件聚焦：关键行提起，密钥全程打码', scene: '截图/网页/文档聚焦', subtype: 'T17a', seconds: 5, component: ConfigFocus, defaults: configFocusDefaults },
  { id: 'T18a-ToolCard', title: '工具名片：Logo 展开成名片，能力依次落下', scene: '产品与人物', subtype: 'T18a', seconds: 5, component: ToolCard, defaults: toolCardDefaults },
  { id: 'T19a-PainPoint', title: '痛点小人：Fred 发愁，烦恼气泡收成一个问题', scene: '产品与人物', subtype: 'T19a', seconds: 5, component: PainPoint, defaults: painPointDefaults },
];
