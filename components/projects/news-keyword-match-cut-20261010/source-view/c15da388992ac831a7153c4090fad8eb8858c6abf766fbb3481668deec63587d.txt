# NMC01 新闻关键词快闪

准确V9示例：12页，30fps，48帧，1.6秒；黄色笔刷、关键词共同锚点、统一1.18放大与最深18%柔和边缘暗化。图文是AI生成的虚构新闻页面，关键词为位图。新词使用imagegen重新生成2×2图片，裁剪后量测glyphBox并修改config.json；仅修改keyword字段不会改变图片中的文字。每格约836×470，1080p是放大预览。

## 图片、视频与声音

原始四宫格在public/sheets，单页在public/raw-pages，对齐输出在public/pages。生成方法见generation-prompt-template.md。FFmpeg和Python/Pillow就绪后：

```bash
python3 pipeline.py render --out outputs/keyword.mp4
python3 pipeline.py prepare --out public/pages
# 修改页时序后，必须重建声音
python3 pipeline.py render --sound shutter --out outputs/keyword-retimed.mp4
```

默认音轨是准确V9预混音，不能重复叠加源声音；更改切点/fps时，旧混音会被拒绝。源WAV按切点重新混音，最终口播响度/尾音叠加需按当前视频检查。当前没有对标口播或私人BGM。

## Remotion

```bash
npm install
node render.cjs list
node render.cjs stills News-Keyword-Match-Cut outputs/stills
node render.cjs render News-Keyword-Match-Cut outputs/preview.mp4
```

可用CHROME_PATH指定浏览器。NewsKeywordMatchCut接收已处理的图片列表及每页帧数、匹配音轨和音量；不二次放大/暗化。外部整片调用时复制实际public依赖，并按当前fps换算帧数。

当前示例已获用户认可；新词、图片、字体、时长、蒙版和混音变化仍需实际输出核对。当前只公开认可主声音shutter；另一备选不包含在此包中。

## 来源与许可证

视觉素材：OpenAI imagegen生成的虚构新闻。未使用付费VideoHive工程、图片或音乐。
源声音shutter.wav来自TextMatchCut/TextMatchCut提交c210d9f590a7d36de1b2255f404fc92240fd5fa0，仓库LICENSE为GPL-3.0，见licenses/TextMatchCut-GPL-3.0.txt。上游README称MIT，与实际LICENSE存在差异；本包保留实际LICENSE及来源，不将声音标为自有MIT素材。声音的可编辑源WAV已随包提供。
地址：https://github.com/TextMatchCut/TextMatchCut/tree/c210d9f590a7d36de1b2255f404fc92240fd5fa0

独立渲染/Remotion源码与生图模板属于本组件实现；音频的第三方许可范围单独保留。本包无私人路径、凭证、录音或BGM。
