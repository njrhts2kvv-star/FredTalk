// 组件登记：id 为 Remotion composition ID；seconds 为默认时长；scene 用 12 个日常场景名；change 是“观众要看懂的变化”。
// component_kit.py new / add 会在 COMPONENTS 末尾追加条目，不要手改格式。
// @imports

export type Entry = { id: string; title: string; scene: string; change: string; seconds: number; component: unknown; defaults: object };
export const COMPONENTS: Entry[] = [
  // @entries
];
