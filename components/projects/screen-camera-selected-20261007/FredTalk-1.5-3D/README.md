# FredTalk1.5 · 五条3D录屏运镜

CAM01左右换焦与输入浮起；CAM02作品到说明与成组刷色；CAM03成组蒙版与双框；CAM04输入发送回复；CAM05白底后倾由下向上聚焦。

camera/codex/overhead为独立工程，分别进入执行npm ci。随后在本包根目录运行python3 run.py list CAM01、python3 run.py still CAM05 --frame 240、python3 run.py render CAM04。Python3、FFmpeg和兼容Remotion浏览器须在本机可用。可用--browser指定Chrome。默认1920×1080/60fps。

相机路径/选区/停留按实际素材和口播适配。阅读落点停稳、中间路过位置连续通过，透视用于表达平面内容的位置/层次/操作关系。不可照搬示例的秒数和镜头数量。

CAM01内保留额外48帧阅读停顿；CAM04为可编辑操作示意，声音是当前案例固定音效，改时序时需重新匹配。Mac使用PingFangSC；其他系统须提供中文字体并检查换行。示例媒资用于重现当前组件，用户认可对应准确预览不等于任意参数已视觉验收。

本包不含私人BGM、录音、账户凭据或缓存。
