// FredTalk 2.5 distribution: fred-legacy-fix-20261018
// 局部返修（patch-b1）：本条的 Fred 默认内容只在这里改。
// 原版 Library 内容：章节名“一、定义”，正文“在这段视频稿中，用@素材的方式锁住所有的：人物造型、环境光线…”及 6 个紫色词。
import type {Overrides} from './clip';
export const PATCH_ID='T12r1p-GridToChapter';
export const PATCH_CLIP='N006';
export const PATCH_SECONDS=8.2;
export const PATCH_OVERRIDES:Overrides={
 words:[
  // [0] 章节名：放大接管画面时居中出现，随后让位退场（不再缩到左上角当眉题）
  '找项目',
  // [1] 正文（Fred 第114期 GitHub 逐字稿 v6“使用者·第一步：找项目”原句，换行即折行）
  '按你要做的事情搜，\n别搜 AI 这种大词。\n想截视频，就搜\nvideo cutter。',
 ],
 // 只染紫一处
 highlightWords:['要做的事情'],
};
