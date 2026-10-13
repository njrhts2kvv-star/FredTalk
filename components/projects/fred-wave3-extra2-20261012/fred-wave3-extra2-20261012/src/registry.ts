// 组件登记：id 为 Remotion composition ID；seconds 为默认时长；scene 用 12 个日常场景名；change 是“观众要看懂的变化”。
// component_kit.py new / add 会在 COMPONENTS 末尾追加条目，不要手改格式。
import { FrostedFact, frostedFactDefaults } from './components/T08i-FrostedFact';
import { ChatExtract, chatExtractDefaults } from './components/T10a-ChatExtract';
// @imports

export type Entry = { id: string; title: string; scene: string; change: string; seconds: number; component: unknown; defaults: object };
export const COMPONENTS: Entry[] = [
  { id: 'T08i-FrostedFact', title: "毛玻璃要点卡", scene: '截图/网页/文档聚焦', change: "真实画面虚化 → 一张毛玻璃卡浮起，写着一个关键事实", seconds: 5.0, component: FrostedFact, defaults: frostedFactDefaults },
  { id: 'T10a-ChatExtract', title: "长回复拎要点", scene: '输入与对话', change: "AI 一大段回复 → 其中几条关键句被拎出来排成清单", seconds: 6.0, component: ChatExtract, defaults: chatExtractDefaults },
  // @entries
];
