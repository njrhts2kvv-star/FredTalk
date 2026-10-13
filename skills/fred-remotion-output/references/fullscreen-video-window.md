# 全屏主视频默认组件

2026-10-04 Fred明确要求：“后续如果视频全屏播放，就是用这个组件和大小”。后续独立16:9视频中，录屏、实拍或生成视频作为主内容全屏/大窗播放时，默认实际调用 [FullscreenVideoWindow.tsx](../templates/components/FullscreenVideoWindow.tsx)，采用第108期v9 S39的大播放窗口。主Skill、`media-layout`场景包与制作默认值均指向这里；新一期不用重新设计播放外壳。

这是当前明确的跨期默认，不再把这套尺寸仅视为108期示例。双窗/多窗比较、缩略总览、设备内播放和解释动画仍按各自职责编排；用户当次明确要求无留边铺满画布、不同画幅或准确复刻其他外观时执行当次要求，不新增确认。默认组件本身不添加标题栏、按钮、黑框或右上角角标；源视频自带界面和标识保留。

## 固定几何与表面

| 参数 | 1920×1080逻辑舞台 | 3840×2160直接坐标 |
| --- | --- | --- |
| 窗口宽度 | 1800px，93.75%画布宽度 | 3600px，93.75%画布宽度 |
| 窗口高度 | 1013.555787px | 2027.111575px |
| 左上角 | x=60px，y=33.222106px | x=120px，y=66.444213px |
| 左/右留白 | 各60px | 各120px |
| 上/下留白 | 各33.222106px | 各66.444213px |
| 四角半径 | 24px | 48px |
| 阴影水平/垂直偏移 | 0px / 16px | 0px / 32px |
| 阴影模糊/扩展半径 | 25px / 0px | 50px / 0px |
| 阴影颜色/透明度 | 黑色，2/15≈13.3333% | 黑色，2/15≈13.3333% |
| 描边 / 容器底色 | 无 / `#FFFFFF` | 无 / `#FFFFFF` |

窗口高度准确保留108期源录屏的3836:2160比例：`height = width * 2160 / 3836`，不默默改成1800×1012.5的标准16:9窗口。留白与尺寸均不含阴影；模糊半径不是阴影的固定可见外延。默认画布为白色；若当前混合场景已有背景，背景由调用场景负责。

## 真实调用与坐标

将模板中的两个文件一起复制到本期源码，不从文字描述重写外壳。组件只依赖React、Remotion和同目录几何函数，不绑定108的录屏、图标、口播或出场帧号。

```tsx
import {FullscreenVideoWindow} from './components/FullscreenVideoWindow';
import {staticFile} from 'remotion';

// 1920×1080逻辑舞台；最终4K由父层scale(2)输出。
<FullscreenVideoWindow
  src={staticFile('recording.mp4')}
  videoProps={{startFrom: sourceInFrame, muted: true}}
/>

// 直接在3840×2160舞台布局，没有父层scale(2)。
<FullscreenVideoWindow
  src={staticFile('recording.mp4')}
  canvasWidth={3840}
  canvasHeight={2160}
  videoProps={{startFrom: sourceInFrame, muted: true}}
/>
```

`canvasWidth/canvasHeight`指组件所在的局部布局舞台，不是经过父层缩放后的导出尺寸。1080逻辑舞台已经有`scale(2)`时保持默认值，不能再传3840×2160造成二次放大。组件不读取`useVideoConfig()`猜局部坐标；不同16:9规格按局部舞台等比计算，非16:9用当次画幅对应载体。

## 素材、时钟与字幕

- 采用真实`OffthreadVideo`，不使用poster、首帧图片或`Freeze`冒充正常播放。素材入点、速度和音轨从本期媒体合同通过`videoProps`传入；组件不自动循环、不固定555帧、不加单期入场动画。
- 默认`objectFit="cover"`、`objectPosition="center"`，与108窗口一致；先核对源比例与关键ROI。源素材比例明显不同且需完整保留时，选择/裁切有效区域或显式`objectFit="contain"`，记录本期例外，不能拉伸或裁掉关键结果。内置黑边需要在源内容层处理，外壳不新增黑边。
- 默认静音，与108的独立口播混音一致；源音需要参与混音时明确传`muted: false`和当前音量，保护完整口播。`startFrom`等帧值遵循本期composition时钟，不能直接传秒数。
- 字幕是单独上层；媒体可延伸到字幕后方，不为字幕把整窗缩小。关键按钮、结果文字和当前阅读区必须可见；录屏/实拍作为主内容播放时按现有规则关闭新增右上角角标；Fred 人物 B-roll 动画全屏播放时加角标（2026-10-12）。窗口里的录屏不能整窗原样干播，包装规则见[整期编排](episode-assembly.md#2-录屏段怎么包装)。
- 让位/缩回由本期口播决定；保持同一视频实例/源时间，几何变化不重置媒体。S39后半段缩窗和“动作/声音/节奏”图标没有进入此默认组件。

## 来源与验证

来源快照和当前用户默认授权见 [source.json](../templates/components/fullscreen-video-window.source.json)。原片实际大窗截图保存在项目实体`assets/fullscreen-video-window/ep108-v9-main-video.jpg`。模板保留来源身份，不要求未来依赖108完整视频目录，也不改原片源码或旧成片。

调用后检查：局部舞台没有二次缩放、实际宽度93.75%、圆角/阴影同尺度、没有新增框/标题/角标；再看真实媒体首中尾、字幕关键ROI、进退与接缝。新增内容仍需当前内部动态审看，默认外壳认可不等于未来所有素材/节奏已经获批。
