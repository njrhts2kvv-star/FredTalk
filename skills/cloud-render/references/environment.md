# 渲染环境与连接

使用者配置自己的服务器、SSH agent、实例ID和平台API环境，连接资料保存在仓库外。公开包不包含作者服务器清单、密码、Key或电源授权。

每次实际查询实例状态，验证SSH、可用磁盘/内存、活动进程与队列，再建立唯一任务快照。服务器规格、并发和GPU后端按本任务短样实测，不把历史结果当保证。使用工程锁文件安装匹配版本的Node、Remotion、React及Chrome for Testing；字体按公开依赖清单物化。

`render.mjs`在项目依赖可解析的任务根目录执行，`openBrowser`、`selectComposition`和`renderMedia`传递同一浏览器配置。API/CLI只操作使用者当前明确授权的实例。
