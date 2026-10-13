# Imagegen 四宫格提示词模板

根据已认可做法整理，不作为逐字历史prompt证据。一次生成一张2×2，重复三次时明确变更四个版式，保留共同关键词的锚点和尺度。调用imagegen；生成图片后另由代码裁剪、对齐、渲染视频与混音。

```text
Generate a clean 2-by-2 contact sheet. Each of the four quadrants is a complete horizontal 16:9 close-up of a different fictional news article. The whole sheet is also 16:9. No gutter, borders, labels, panel numbers or watermark.

The exact keyword is "{KEYWORD}". In every quadrant, place it naturally inside a meaningful news sentence, not as a detached logo. Highlight only that occurrence with an organic yellow highlighter brush. The black keyword glyph center should be approximately x=50%, y=43% of its own quadrant. Keep its letter height similar in all four panels, around 6–7% of panel height; leave enough crop margin. Do not enlarge one panel's keyword much more than the others.

Create four genuinely different editorial layouts: {FOUR_LAYOUTS}. Vary the typefaces (serif, condensed serif, sans serif), mastheads, column widths, paragraph placement, bylines, small photo placement and paper stock. Include subtle aged newsprint grain and believable ink texture. Most panels should be cream/white paper; an occasional dark digital-news page is fine. Yellow is the dominant highlight color. Use distinct, fictional publication names. The surrounding article text is news-like illustration, not evidence of a real publication.

The keyword must read exactly "{KEYWORD}" with no additional letter. Avoid other yellow objects near it. Maintain clear print and restrained depth: no heavy blur, no smeared body text, no extreme vignettes. Frame as a mild close-up, not an enormous crop. Final alignment, uniform zoom and soft edge shading will be done in post-production.

Sentences: {FOUR_SENTENCES}. Each sentence should contain the keyword once. Output only the four-panel image.
```

例：关键词API；三批分别选现代数字科技新闻/传统纸报/复古财经、技术周刊/暖纸专栏/数字商业、窄衬线刊头/网络产品/研究报道。不要每批重复左上刊头、同样正文与同样配图。生成后逐格检查实际关键词；失败格重生成或修图，不用极端放大/模糊掩盖字形和版式错误。
