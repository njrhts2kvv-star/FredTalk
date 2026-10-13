# 新闻关键词快闪（NMC01）

适合用约一秒的连续新闻页，让观众感到“在不同文章里反复看到同一个词”。核心是关键词保持同一阅读位置，周围的标题、正文、字体、纸张与新闻布局不断变化；不是固定版式换背景，也不是将整个画面重度模糊。

集合 `news-keyword-match-cut-20261010`，ID `news-keyword-match-cut`，显示编号 **NMC01**。通过主 Skill 的 `references.py --collection news-keyword-match-cut-20261010` 或 `--id NMC01` 查找。实体在 `assets/reference-code/news-keyword-match-cut-20261010/`；`index.html` 是本地可播放文件架。

Fred 在当前聊天认可准确 **V9** 样片并要求保存组件及 imagegen→裁剪对齐→渲染→音效方法。`selection.json` 绑定原话与实际视频 SHA；记录时间是取证时间。主声音 shutter 随交付样片保存；shutter1 作为备选保留，没有单独选择证据。新词、新图片、新时序仍需真实样片核对，不继承旧内容的认可。

## 生成图片，再统一处理

1. 使用 **imagegen** 工具生成新闻素材，不用程序绘制十几张相同版式。用户所说的 imagen 在本工作流里对应实际使用的 imagegen，不冒称使用另一家模型。按当前生图 Skill 执行。
2. 本次认可样例采用 **3 张 2×2 四宫格，共 12 页**，每格横向16:9，无边框/分隔线。数量可按当前时长调整，并非所有新片固定12页。提示词模板见集合 `generation-prompt-template.md`，它是根据认可做法整理的可复用模板，不冒称逐字历史请求。
3. 每页的关键词嵌在正常新闻句子内，关键词位置和字形高度控制在相近范围。主强调色为黄色笔刷。改变字体、刊头、栏数、段落、图片和纸张材质；允许少量其他强调色，但不要破坏主色关系。做旧报纸要有纸纹和印刷感，避免重模糊导致正文消失。
4. 保留原始四宫格，再按实际像素分成四张。当前原图1672×941，每格约836×470；1920×1080是放大预览，不能称为原生1080p生图。未来优先申请足够分辨率，实际结果仍须量测。
5. 逐张量测真正关键词的 `glyphBox`，不要只对齐笔刷外框。用同一个缩放倍率裁剪，将字形中心对齐共同 `anchor`；确认四边不露空、关键词尺度没有明显跳变。本例 API中心 `[960,464]`、统一放大1.18。素材换词后需重新量测；不自动OCR，不假设黄色区域里的任意黑字都是目标词。
6. 加软边椭圆暗化蒙版，中心阅读区域透明。V9最深18%，不新增模糊。代码统一处理裁剪/放大/蒙版，不让生图模型分别制造不可控的强失焦。蒙版中心与文字共用锚点，不二次放大、不叠加第二层阴影。参数是本组件认可预设，可按新素材调整。

## 时长与快切

原“一枚卓子”参考在30fps下为103–133帧，区间3.433–4.467秒，共31帧、约1.033秒、10个页面状态。原片范围只是参考，不是当前组件固定片长。

认可V9为30fps/48帧/1.6秒。12页的持续帧数为 `[3,3,2,3,3,2,3,3,2,3,3,18]`；切点 `[0,3,6,8,11,14,16,19,22,24,27,30]`。尾页从1秒开始停留0.6秒。口播中的快速强调可收短尾页；独立展示可以保留停留。用帧指定时长，以硬切为主，不加长叠化拖慢节奏。换fps时按秒换算帧数，不能让30fps的帧列表原样进入60fps。

## 音效

主声音使用真实快门质感的短噪声，在各页切点触发，形成连续“呲呲呲”的节奏；当前样例没有原对标的口播，也没有私人BGM。原始两条WAV在 `source/public/sfx/`；准确样片音轨在 `source/public/audio/`，单次叠加/限峰后保存。复用原节奏时直接挂已混音轨，不再叠加12个快门、加8dB或重复限幅。

改页数、切点、fps或片长时，以原始WAV重新对齐cue。`pipeline.py render --sound shutter` 会按当前帧列表重新混音，非自动复用旧1.6秒音轨。声画同步、密集尾音叠加、口播清晰度与最终编码峰值均需检查。有口播时按本期混音调音量，`Audio`的volume不固定为1。助手的音轨hash/解码检查和Fred对样片认可分开记录，不冒称助手听辨过音效。

来源是 https://github.com/TextMatchCut/TextMatchCut ，提交 `c210d9f590a7d36de1b2255f404fc92240fd5fa0`。仓库许可证GPL-3.0随本地集合保存；未查明单独的音频资产授权，保留来源，公开分发前再核。没有获取或复制VideoHive付费项目的图片、音乐或工程。

## 实际调用

复制集合的 `source/` 到本期工程后再修改。`config.json`指定原始单页路径、真实字形框、统一缩放、蒙版、帧列表与音轨；`pipeline.py` 使用FFmpeg和Pillow，当前机器已有这些依赖，无需另装。也可先生成其他词的四宫格，裁剪后替换配置中的 `pages`，不能仅改keyword字段就宣称图片里的文字已改变。

```bash
python3 source/pipeline.py prepare --config source/config.json --out public/pages
python3 source/pipeline.py render --config source/config.json --out previews/keyword.mp4
# 改时序后重新生成各切点声音
python3 source/pipeline.py render --config source/config.json --sound shutter --out previews/keyword-retimed.mp4
```

FFmpeg直接输出适合独立快闪；放入Remotion整片时用真实组件 `source/src/NewsKeywordMatchCut.tsx`，接收已经对齐/放大/加蒙版的图片，不再次处理这些效果：

```tsx
<NewsKeywordMatchCut pages={[
  {src:'pages/page-01.png',durationInFrames:3},
  {src:'pages/page-02.png',durationInFrames:3},
]} audioSrc="audio/current-match-cut.m4a" audioVolume={0.5}/>
```

音频必须匹配当前完整页列表；上面两页仅示意接口，不可套原12页音轨。图片关键词是位图，非可编辑字体；换词重新生图。`src`为当前public相对路径，复制依赖后再调用。源根 `render.cjs list/stills/render` 用项目锁定Remotion运行时；第四个参数指定新输出位置，不写回认可预览。已验证当前样例独立重建与真实Remotion出帧，不能据此承诺任意新词都自动对齐。

新内容检查：逐页实际文字/字体/纸纹；关键词位置和大小；裁剪无空边；轻暗化下中心可读；所有切点的页面顺序；总帧数；完整声画解码和音效cue；整片中是否遮挡字幕及交接。原对标、付费风格截图和旧失败版留在本期，不混入公共组件的认可源。

## 网站发布（2026-10-10）

已按Fred后续授权于2026-10-10T22:45:18+08:00发布到[网站视觉库](https://www.fred-fu.com/visual-library)。NMC01提供准确V9/1.6秒带声样片、四个关键帧、4个源码/方法入口和独立素材源码ZIP。原新增时间2026-10-10T22:33:18.349708+08:00及V9认可范围保持。本次公开主声音shutter；备选shutter1仍只在本地。公开包保留上游实际GPL-3.0 LICENSE及README的MIT表述差异，不将音频标成自有素材。公开源码不依赖Fred本机路径、配置或私人媒体。公网视频、完整源码ZIP与哈希、视频/ZIP头尾Range206、源码和海报均验证通过。GitHub未更新。准确回执在集合publication.json。
