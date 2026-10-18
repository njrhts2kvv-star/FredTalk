# 2026-10-07新增精选组件

Fred已明确保留OP02/OP03/OP05/OP09/OP10、EX05/EX08、RC01/RC02/RC03/RC04/RC05、HD02/HD03。编号确认原话和原30审看片身份见集合selection.json，原文件hash保持。准确注册时间为`2026-10-07T08:41:15+08:00`，用户消息本身未提供时间戳。

这些组件属于画面呈现与交接、内容讲解、录屏聚焦和作品呈现。OP组不会登记为已认可的开头吸睛方案。未选16条没有进入默认Skill选择或本次发布集合；原398组件、27clips和44归档参考取舍保持。

| 编号 | 动作 | 时长 | 主用途 |
| --- | --- | --- | --- |
| OP02 | 双侧门片揭开新视频 | 4秒 | 录屏与视频入场 |
| OP03 | 圆形入口展开为视频窗 | 4秒 | 录屏与视频入场 |
| OP05 | 问题窗口翻面揭示结果 | 4秒 | 录屏与视频入场 |
| OP09 | 四个画面汇聚成主片 | 4秒 | 录屏与视频入场 |
| OP10 | 鼠标连续擦出主视频 | 4秒 | 录屏与视频入场 |
| EX05 | 错误顺序重排成动作关系 | 8秒 | 讲解段落 |
| EX08 | 两组任务展开，完成后合成下一步检查 | 9秒 | 讲解段落 |
| RC01 | 真实说明窗局部扩展阅读 | 8秒 | 录屏聚焦 |
| RC02 | 整页镜头推近与回全貌 | 8秒 | 录屏聚焦 |
| RC03 | 真实动作与结论连续换焦 | 8秒 | 录屏聚焦 |
| RC04 | 真实段落提起与归位 | 8秒 | 录屏聚焦 |
| RC05 | 真实长文档纵向跟读 | 8秒 | 录屏聚焦 |
| HD02 | 旧片留位新片接管 | 7秒 | 内容交接 |
| HD03 | 作品墙抽片播放 | 7秒 | 图片与作品 |

合计91秒/5460帧。videos内14条为用户本次看过的准确1920×1080/60fps无音轨成片，不重新编码。keyframes保存每条3张真实状态PNG；source保存仅14个导出的真实Remotion函数与其全部使用依赖，固定Remotion4.0.473/React19.2.4，字体沿MiSans500/600/900和得意黑实体。新示例认可不代表任意文案、ROI、数量或时序参数已通过。

本地入口：http://127.0.0.1:3061/design/#library。按来源“新增精选组件”、OP02等编号或制作用途检索。

```
python3 skills/fred-remotion-output/scripts/references.py --collection expansion-selected-20261007 --limit 14
python3 skills/fred-remotion-output/scripts/references.py --id OP02 --full
python3 skills/fred-remotion-output/scripts/references.py --source expansion-selected --use recording-focus
```

SOURCE参数接口和渲染命令以source/README.md为准；HD默认固定媒体/排布、OP09副媒体和EX08结论不是随便换一个src/words就全体可变。录屏默认同源帧显式暂停：背景、局部裁片读同一帧，镜头动作继续，回全貌后恢复；clock=null可关闭，但必须重核ROI随源滚动的可读性。

典型复用：引用准确源导出、按新媒体/短句/ROI适配、保持真实媒体时钟和本轮核心动作、出实际关键帧及动态样检查；旧示例认可不能覆盖新内容适配。主视频播放窗口实际调用共享FullscreenVideoWindow，1920逻辑舞台只由父层放大一次。

网站发布状态另见集合publication.json。本地原源码与独立公共源码分发副本分开保存，公共包不包含私人配音/BGM、运行缓存或本机路径。没有本轮GitHub发布授权，不记录为GitHub已发布。

## 网站发布：2026-10-07

14条已于`2026-10-07T08:45:24+08:00`按Fred明确授权发布到[网站视觉库](https://www.fred-fu.com/visual-library)，本地新增时间保持`2026-10-07T08:41:15+08:00`。当前网站201条/196条可播放，157常用/44归档；原187完整记录、归档事件及顺序保持。公开14准确视频hash、全部42源码引用、14封面、源码ZIP完整公网hash与首尾206通过。实际发布回执与线上核验见集合website-publication-receipt.json和website-online-verification.json。

公开包是独立副本，未修改本地认可源码/视频；原网站release、21个HTML/JS/CSS页面文件、数据库与Nginx不改。GitHub本轮未发布。浏览器播放由主流程单独验证，不把HTTP/解码结果等同主观动态认可。


## FredTalk 1.5 发布（2026-10-08）

本集合已同步到 [GitHub FredTalk 1.5](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v1.5.0)。本轮补齐29类组件：第109期6条、新增精选14条、交互4类、3D运镜5条；前端已增加版本更新提示，五条3D运镜已发布到[视觉库](https://www.fred-fu.com/visual-library)。原新增时间与认可范围保持，公开源码副本独立，私人录音/BGM/凭据不分发。
