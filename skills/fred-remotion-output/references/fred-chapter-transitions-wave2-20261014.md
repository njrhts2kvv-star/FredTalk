# 章节过渡第二批 9 条

2026-10-14 按 Fred 评价入库，集合 `fred-chapter-transitions-wave2-20261014`，准确新增时间 `2026-10-14T16:50:04+08:00`。Fred 原话：“T23c-Notify.mp4 去掉这个人头、T12y-TerminalCd.mp4 不要，更新一下，然后更新到 Skill 里吧。”

10 条候选中，T23c 按要求去掉头像后重渲再入库，T12y-TerminalCd 不要（`--reject`，不进集合、不进视觉库）。9 条都是章节过渡，主用途 handoff，场景 chapter，3 秒，1080p60，带音效。实体在项目 Skill 的 `assets/reference-code/fred-chapter-transitions-wave2-20261014/`（源码、9 条原样片、27 张核心帧、selection.json、manifest.json）。本批只在本机渲染，未上传云端、未发布网站和 GitHub。

## 编号说明

库里 T12 的字母后缀 a–t 已用完，本批前 6 条用 T12u–T12z（T12y 被拒，编号不复用），后 4 条用新场景码 T23a–T23d（同属“章节与节奏”）。

| 编号 | 动作 | 底色 |
| --- | --- | --- |
| T12u-FillUp | 空心的本章序号 → 从下往上灌满变实心 → 章节名接出 | 黑 |
| T12v-KeyPress | 一排数字键 → 本章那颗被按下 → 章节名接出 | 白 |
| T12w-RingProgress | 进度环停在上一章 → 走到本章这一格 → 环收成徽章领出章节名 | 黑 |
| T12x-PageTurn | 上一段画面像书页一样翻过去 → 背后就是本章 | 截图转黑 |
| T12z-Elevator | 楼层从上一章跳到本章 → 门向两边打开 → 章节名 | 白 |
| T23a-AgendaTick | 章节目录 → 上一章打勾、高亮移到本章 → 推近成大黑胶囊 | 白 |
| T23b-NewTab | 标签栏新开一个本章标签 → 页里换成本章标题、窗口撑大 | 白加深窗 |
| T23c-Notify | 小通知卡从顶部落下 → 同一张卡原地撑大成中央大卡，只有标签“第N部分”和章节名，无头像 | 白 |
| T23d-HorizonLine | 一条横线划过画面 → 序号从线上升起、章节名从线下落出 | 黑 |

## T23c 的改动

去掉 `avatar` prop 和头像，卡片宽度改为按文字算：小卡最宽 900、大卡最宽 1680，标签与标题同一左边界，文字块在卡内水平居中；动作和 Props（`index/label/title/cues`）不变。长标题、2 字短标题均已看过，不出画、不压右上角角标。

## 调用与适配

用 `references.py --collection fred-chapter-transitions-wave2-20261014 --limit 20` 查整组，`--id T23c --full` 查准确源码、参数、样片。其他额外 props：`total`（T12v/T12w）、`fromImage`/`fromDark`（T12x）、`chapters`（T23a）、`previous`（T23b）。T12x 的默认被翻走页面用 `public/media/gh-pdf2zh.png`。

复制组件时同时带入 `source/src/components/_shared.ts`、kit、字体、音效和所需媒体。新文案、序号、媒体检查容量、可读性和运动中间态；cues 和 HandoffProps 按真实口播与前后段交接适配。源码内 `qc/specs.md` 保留创作时的 10 条清单，其中 T12y 为已拒绝项，不在库内。

## 边界

认可绑定入库的准确 MP4。未做助手连续播放或人耳听审声明。T23 是新场景码，不代表新的用途类别。

## FredTalk 2.5 后续发布 · 2026-10-18

本批随 FredTalk 2.5 发布，专属会员优先使用 14 天；UTC 2026-10-18T04:57:11Z 至 2026-11-01T04:57:11Z，到期网站自动向所有人开放源码、源码 ZIP 和原视频下载。 原 addedAt、准确认可范围及本机源文件保持；公开预览是独立派生副本，源码分发包不含个人原始媒体。准确回执见集合 publication.json。
