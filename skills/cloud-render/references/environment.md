# 服务器与依赖

| 优先组 | 实例 ID | 当时 SSH 地址 | 控制台规格 |
| --- | --- | --- | --- |
| 低成本 A，需开机时首选 | `uhost-1vsdlli7yjsu` | `ubuntu@127.0.0.1` | V100S × 1，10 核，64 GB |
| 低成本 B，需开机时次选 | `uhost-1vsbpg407z1k` | `ubuntu@127.0.0.1` | V100S × 1，10 核，64 GB |
| RTX / FredRemotion | `uhost-1viqo4hzutha` | `ubuntu@127.0.0.1` | RTX40系 × 1，16 核，94 GB |
| RTX / fred-remotion-test | `uhost-1v6x8uulbr0b` | `ubuntu@127.0.0.1` | RTX40系 × 1，16 核，64 GB |

均为华北二A现有虚机。用户名/密码与 API 凭证只从 [私人连接资料](private-connection.md) 读取；地址、状态、规格与资源可用性每次重新核对。按主 Skill“云实例选择”先复用在线空闲实例，四台均关机时先启动前两台。前两台的低成本定位来自 Fred 的明确要求，未登记实时单价或 Remotion 实测性能；实际机器核验后再选择稳定并发与后端。

旧记录 `uhost-1vfa07w63o5f` / `127.0.0.1` 未出现在本次四实例列表中，原连接资料仅保留为私人历史，不参与默认选择。当前 `127.0.0.1` 是单独核对的实例，不沿用旧 ID 判断身份。

## 已测服务器（历史参考，运行前核实）

## 安装原则

先检查已有依赖。需要新增时说明目的和范围，直接完成已有授权内的准备工作。不要自动替换驱动、升级内核、重启系统或覆盖其他在制项目。

Chrome常用依赖：libnss3、libdbus-1-3、libatk1.0-0、libatk-bridge2.0-0、libasound2、libxrandr2、libxkbcommon0、libxfixes3、libxcomposite1、libxdamage1、libcups2、libgbm1、libpangocairo-1.0-0、libgtk-3-0。Vulkan诊断需要libvulkan1/vulkan-tools，不代表EGL必须走Vulkan。

选择NVIDIA/EGL硬件后端时需要有图形能力的驱动与EGL库；只有CUDA计算库不够。使用软件后端不以该项作为前置。云容器还涉及图形设备与驱动库透传。本Skill的实测环境是虚机，不能宣称在任意Docker镜像中已验证。

参考版本：Remotion4.0.451，React/ReactDOM19.2.5，Chrome for Testing144.0.7559.20。实际任务优先匹配项目锁文件，不默认升级到这些版本或latest。

Remotion4.0.451内置硬件编码接口只支持macOS。较新版Linux NVENC不能照搬给旧版本；当前默认保持软件H.264 CRF15。图形GPU加速与NVENC编码是两件事。

## GPU诊断的边界

官方`npx remotion gpu`在4.0.451可能读取初始化之前的状态。需要时参考该版本`@remotion/renderer/dist/test-gpu.js`编写独立诊断副本，在打开chrome://gpu后等待约5秒再读取完整报告；不要修改项目依赖的原文件。诊断副本仅用于阅读信息，不作为生产依赖。

实测EGL启动器添加以下参数后，Canvas、Compositing、Rasterization报告硬件加速，且真实复杂片段明显提速：

```text
--enable-gpu --enable-gpu-rasterization --use-gl=angle --use-angle=gl-egl
```

必须将启动器绝对路径和gl参数传给openBrowser、selectComposition、renderMedia，避免重新创建浏览器时回退。

资料：
- https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/gpu.mdx
- https://github.com/remotion-dev/remotion/blob/v4.0.451/packages/docs/docs/miscellaneous/cloud-gpu.mdx
- https://github.com/remotion-dev/remotion/issues/4300
- https://github.com/remotion-dev/remotion/issues/4664
- https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/hardware-acceleration.mdx
