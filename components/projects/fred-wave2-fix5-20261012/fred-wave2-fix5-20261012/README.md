# fred-wave2-fix5-20261012

FredTalk 2.0 独立组件源码包。保留本批入库组件的真实实现、共享 kit、字体、品牌角标与动作音效；不包含 Fred 的独立人物素材、真实录屏或每期原片。

## 使用

1. `npm ci`（Remotion 4.0.515，React 19.2.4）
2. `npm run typecheck`
3. 按 `user-media-inputs.json` 自备媒体并放到指定 `public/media/` 路径，或改组件 defaultProps/媒体 props；纯图形组件可直接使用。
4. `npm run compositions` / `npm run studio`，按 `components.json` 选择 composition。
5. 渲染前按实际文字、数量、媒体、口播时码检查容量、动作和声音。

默认素材路径只用于明确接口。缺少自备媒体时，引用该素材的原默认场景不能直接完整渲染。网站展示的是 Fred 认可的准确样片，不代表源码包附送其中每项个人媒体。归档组件的源码为历史保留，查看 `components.json` 中的 defaultReuse。

字体许可在 `public/fonts/`，音效为 Fred 既有剪映音效素材集合的相同实体；原始来源边界保留，不称为自制。
