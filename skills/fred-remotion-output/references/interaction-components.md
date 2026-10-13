# 新闻聚焦、Codex操作与可编辑微信组件

适用于截图上的指定句高亮/蒙版、Codex输入框提起与聊天操作演示，以及微信文字/转发卡片对话。集合 `interaction-components-20261007`；用 `references.py --collection interaction-components-20261007` 查询 INT01–INT04，或按具体ID获取准确源码、预览、参数和依赖。

实体在项目主Skill `/absolute/fredtalk/skills/fred-remotion-output/assets/reference-code/interaction-components-20261007/`：`source/src/`是真实React组件，`source/public/`是当前样例依赖，`previews/`是6条准确样片，`selection.json`保存Fred本轮原话与认可边界，`manifest.json`绑定来源与哈希。重媒体只在项目实体，不复制进全局Skill；本集合仅本地保存，没有网站/GitHub发布。

| ID | 组件 | 当前可用动作 |
|---|---|---|
| INT01 / interaction-news-brush | NewsBrushFocus | 黄色刷出同时推进；先推进再刷出 |
| INT02 / interaction-news-spotlight | NewsSpotlightFocus | 推进同时突出；先推进再加黑蒙版突出 |
| INT03 / interaction-codex-full | CodexFullWindowFlow | 完整Codex窗口→输入框提起/背景退后→1秒连续输入→发送回落→右上用户消息→下方回复→点击媒体播放 |
| INT04 / interaction-wechat | WeChatConversation | 可编辑左右消息、日期、系统提示和转发卡片，新增消息进入并让旧行上滚 |

## 新闻顺序与真实选区

复制组件与实际使用的public素材到当前工程后调用，不写回冻结源：

```tsx
<NewsBrushFocus src="article.png" sourceWidth={2958} sourceHeight={1508}
  regions={[{x:.2245,y:.2788,width:.376,height:.0332}]}
  order="camera-first" color="#FFE949" />
<NewsSpotlightFocus src="article.png" sourceWidth={2958} sourceHeight={1508}
  regions={[{x:.2245,y:.2788,width:.376,height:.0332}]}
  order="parallel" dimOpacity={.76} />
```

`order`有`parallel`和`camera-first`；后一种在相机精确停稳后0.25秒再开始强调。`emphasisAt`可显式指定，但camera-first不能早于相机落点。另可按当前口播调`focusAt/cameraSeconds/sweepSeconds/returnAt/returnSeconds/zoom`。选区用原图0–1坐标，可多行；字体像素、高亮和蒙版必须共用同一相机变换，不拉伸截图。黄色是Fred本次这套样例的选择，不改变其他组件的强调色规则。

## Codex保留与截图绑定

Codex沿N040真实提起/回落核心。当前默认样例仍是已保留的14.15秒V3和第109期109-06的5秒动画，源视频/源码身份保持。组件参数`desktopSrc/playbackSrc/prompt/typingSeconds`：这是截图驱动能力，输入ROI、右上消息和回复像素来自同一截图。换prompt时必须同时提供匹配的消息/回复图并复核几何；不把只改输入框文字当成完整换稿，不宣称自动OCR或任意长度都能放下。当前已验证15字单行与1秒连续输入，无标点停顿。

复制默认FullscreenVideoWindow两个准确模板随工程使用，原视频时钟从开窗同一帧开始连续推进；不扩窗后倒回0，不用poster代替播放。当前109-06准确原4K60/300帧库片无音轨；界面样例只有连续键盘和两次点击，未加BGM。`source/render.cjs render Codex-EP109`强制调用固定采样混音辅助，避免AAC再次导入时的偏移。

## 可编辑微信与中性示例

WeChatConversation默认内容为“项目沟通/参考资料/拍摄说明/预览版本V01”，转发卡片中的名字和内容均为中性示例，匿名字头像不依赖原私人聊天截图。数据直接改`messages`，不再从旧截图截取不可编辑文字。

```tsx
<WeChatConversation contactName="项目沟通" selfInitial="我" peerInitial="林"
  messages={[
    {id:'request',kind:'outgoing',text:'把这次拍摄的参考资料发我一下',appearAt:1},
    {id:'reply',kind:'incoming',text:'好的，参考图已经上传。',appearAt:2.4},
    {id:'card',kind:'incoming-card',title:'项目沟通记录',
      lines:['小林：参考图已经上传。','小周：开场用近景，镜头再慢慢拉远。'],appearAt:4},
  ]}/>
```

`kind`支持outgoing/incoming/incoming-card/system/date；名字、正文、卡片标题与`lines`可替换，`appearAt`需递增。正文按实际字体量宽、自动换行并计算高度；仍在真实新内容样片核对最长行、卡片底栏与头像，不将构建通过代替视觉验收。默认使用macOS PingFang SC，可通过`fontFamily`指定当前实际字体；其他环境须提供字体并重新检查换行。新回复默认只触发一次SFX15，`withSound=false`可关，`messageVolume`可调，不给日期或旧行上卷重复加声。

## 构建、取舍与验收边界

复制source/public后，用项目内锁定Remotion4.0.519 / React19.2.3。`node verify-source.cjs`检查源码与基本参数，`node render.cjs list`确认6个真实composition，`stills [ID]`和`render [ID]`生成新关键帧/视频；输出写到复制工程的qc/outputs，不覆盖集合previews。新素材、时序或消息组合仍需实际关键帧、正常速度播放和必要音轨检查。

本轮Fred明确保留黄色原动作、蒙版动作、Codex V3及微信推进方式；新增camera-first样片与替换后的微信内容由助手检查，尚未另获Fred对这些新文件的审看认可。selection中的日期是取证时间，不伪造用户发言时间。蓝色、Codex11秒/28秒与旧微信私人内容退出当前审看版本，历史媒体/意见保留；不影响其他集合或旧批准。当前本地审看页8162只显示六条当前样片。

## 网站发布

本组4类组件、6条准确预览已于2026-10-07T15:57:08+08:00发布到 https://www.fred-fu.com/visual-library 。INT01/INT02各保留两种时序，INT03为109播放版，INT04为中性可编辑微信；公开源码为独立副本。原新增时间与认可范围保持；本次未更新GitHub。回执位于项目集合publication.json。


## FredTalk 1.5 发布（2026-10-08）

本集合已同步到 [GitHub FredTalk 1.5](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v1.5.0)。本轮补齐29类组件：第109期6条、新增精选14条、交互4类、3D运镜5条；前端已增加版本更新提示，五条3D运镜已发布到[视觉库](https://www.fred-fu.com/visual-library)。原新增时间与认可范围保持，公开源码副本独立，私人录音/BGM/凭据不分发。
