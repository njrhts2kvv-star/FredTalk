# Library 旧库最新 81 条复刻

集合 ID：`library-remakes-legacy81-20260929`。Fred 在本轮反馈中表示“整体我觉得都可以了”，并要求把这些视频与源码纳入本 Skill 的视觉库。登记的是 2026-09-29 当前 81 个文件；R005、R033 和 B072 指向最新本地返修，其余指向各自当前云片或已保留版本。认可只覆盖这些成片，不自动覆盖换文案、换素材或调整时长后的新输出。

完整实体保存在项目 `skills/fred-remotion-output/assets/reference-code/library-remakes-legacy81-20260929/`：`catalog.json` 列出每条的准确视频 SHA-256、时长、源码入口和源快照；`videos/`、`keyframes/` 与 `sources/` 保存当前视频、每条三个从成片抽出的核心帧、对应的 Remotion 源码/素材/锁文件；`posters/` 保留先前封面，当前浏览封面由核心帧选出；`specs/` 保存可用的原片映射。`T06` 沿用视觉库已有的 [局部过渡源码](transition-patterns.json)，其源文件路径与哈希在集合目录中明确记录。旧版仍保留在原项目，不覆盖已确认的视频。

在视觉库前端选择“Library 旧库最新 81 条”，再按画面用途浏览：图片与作品展示 19、窗口与设备 17、标题与文字 14、逻辑与流程 12、聚焦与转场 11、文档与操作演示 5、数字与图表 3。每张卡片的主封面和下方三个核心帧均来自登记的当前视频，可按编号或标题搜索并直接播放、查看代码。统一前端去重后共有 181 张唯一卡片：本批 81 张、新 10 期 53 张、没有对应新版的独有旧效果 47 张；来源文件未因前端去重而删除。命令行查询用当前项目根目录：

```bash
python3 skills/fred-remotion-output/scripts/references.py --collection library-remakes-legacy81-20260929 --query R033 --limit 3
python3 skills/fred-remotion-output/scripts/references.py --collection library-remakes-legacy81-20260929 --scene-type device-demo --query 手机 --limit 3
python3 skills/fred-remotion-output/scripts/references.py --id library-legacy81-r033 --full
```

从其他工作目录调用全局 Skill 脚本时，显式传入项目根目录，例如：

```bash
python3 /absolute/project --project-root /absolute/fredtalk --collection library-remakes-legacy81-20260929 --query R033 --limit 3
```

后续制作先按这段内容需要表达的关系选少量候选，再打开准确视频和 `sourceBundle`。复制所选源码、`public` 素材与 `package-lock.json` 到本期工程；不同子项目使用的 Remotion 版本不同，以集合中的锁文件为准。R005、R033、B072 的源码是返修后的当前版本。视频均为 1920×1080、60fps、静音示例；新片的文字、媒体、角标、字幕、配音和时钟须按本期重绑。源项目的演示文字和媒体不是默认生产内容，现有组件也不等于已通过任意新内容的通用参数接口验收。

复用时保住原片的对象关系、动作顺序和交接，再核对最长文字、画面边界、媒体连续性与正常速度的完整短样。技术解码、内部动态检查和用户对新片的认可是不同记录；本轮批次认可不替代新片复检。
