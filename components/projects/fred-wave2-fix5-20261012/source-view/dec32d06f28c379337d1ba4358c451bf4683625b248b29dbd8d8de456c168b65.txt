// 组件登记：id 为 Remotion composition ID；seconds 为默认时长；scene 用 12 个日常场景名；change 是“观众要看懂的变化”。
// component_kit.py new / add 会在 COMPONENTS 末尾追加条目，不要手改格式。
import { BeforeNow, beforeNowDefaults } from './components/T05b2-BeforeNow';
import { ResultBrowse, resultBrowseDefaults } from './components/T09e-ResultBrowse';
import { SpecLand, specLandDefaults } from './components/T14b-SpecLand';
import { TableRowFocus, tableRowFocusDefaults } from './components/T15b-TableRowFocus';
import { ToolChain, toolChainDefaults } from './components/T18b-ToolChain';
// @imports

export type Entry = { id: string; title: string; scene: string; change: string; seconds: number; component: unknown; defaults: object };
export const COMPONENTS: Entry[] = [
  { id: 'T05b2-BeforeNow', title: "以前 vs 现在（返修）：旧步骤收成一叠时仍可读", scene: '对比', change: "以前的多步收起退后 → 现在一句话接管", seconds: 5.0, component: BeforeNow, defaults: beforeNowDefaults },
  { id: 'T09e-ResultBrowse', title: "产物浏览：生成结果逐个打开", scene: '真实操作录屏', change: "一列产物 → 逐个打开看清，再回到总览", seconds: 5.0, component: ResultBrowse, defaults: resultBrowseDefaults },
  { id: 'T14b-SpecLand', title: "单项参数落定", scene: '数字与图表', change: "一个参数名 → 数值落定并标出含义", seconds: 4.0, component: SpecLand, defaults: specLandDefaults },
  { id: 'T15b-TableRowFocus', title: "表格行聚焦", scene: '数字与图表', change: "一张完整表格 → 聚焦关键一行读清", seconds: 5.0, component: TableRowFocus, defaults: tableRowFocusDefaults },
  { id: 'T18b-ToolChain', title: "多工具组合成一条工作流", scene: '产品与人物', change: "几个工具 Logo → 排成一条工作流", seconds: 5.0, component: ToolChain, defaults: toolChainDefaults },
  // @entries
];
