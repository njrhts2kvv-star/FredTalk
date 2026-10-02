# 任务配置

配置文件路径是所有相对路径的基准。将render.mjs放入已安装依赖的云端快照根，保存以下内容为render-job.json并按真实项目调整：

```json
{
  "entry": "src/index.tsx",
  "publicDir": "public",
  "composition": "PartA",
  "inputProps": {},
  "browsers": 8,
  "concurrency": 2,
  "outputDir": "cloud-output-run01",
  "crf": 15,
  "jpegQuality": 95,
  "audio": {
    "mode": "external",
    "path": "public/voice.wav",
    "startSeconds": 0
  }
}
```

- 不写frameRange即完整composition；选取10秒时按composition自身fps计算右端包含的范围。例如60fps取第20–30秒为`"frameRange": [1200,1799]`。
- fps继承composition，不提供自动修改fps的字段。需要60fps必须使用已正确换算的60fps源码和时序。
- 可选`"width":3840,"height":2160`必须同时提供，且项目布局已支持缩放；默认继承composition尺寸，不能盲目放大固定像素布局。
- `audio.startSeconds`是外置音轨中的真实起点，不自动等于frameRange/fps：PartB的局部帧0可能对应全片84.8667秒。依据项目映射计算。
- `browsers`和`concurrency`为正整数，分别控制独立浏览器和每个浏览器的页面数。8×2是未指定时起点，已验证的更低并发优先；新工程可先1×1测试，不要求先有测试证据。
- `gl`可显式选择匹配Remotion版本支持的`angle/egl/swiftshader/swangle/angle-egl/vulkan`；省略时跟随Remotion默认。软件后端无需假报GPU生效。`browserExecutable`可省略以使用managed浏览器；EGL wrapper只有显式选它时才执行。
- 可选`configurationReview: {status: verified | unverified, reason, evidence?}`记录配置理由。verified引用真实已验证记录；首次短样写unverified即可。它是状态记录，不是新增审批。公共脚本不识别`software:true`，需使用准确gl字段。
- inputProps默认空对象；传给selectComposition及renderMedia的值必须一致，不手动丢弃composition默认props。
- `audio.mode=none`仅用于明确无声输出。外置混音必须覆盖所选时长；不能拿旁白代替包含音效、BGM的完整混音。
- outputDir必须不存在，以免覆盖成片。创建新名字，不删除旧输出来绕过检查。

部署示例（路径按任务替换）：

```bash
# 本地制作允许列表快照
python3 snapshot.py --source /absolute/project --destination /absolute/work/run01 --paths src public manifest.json package.json package-lock.json
# 上传时使用交互式SCP或已配置SSH密钥，不在命令里放密码
scp -r /absolute/work/run01 ubuntu@server:<project-path>
# 云端进入任务目录、加载Node环境、校验快照并安装锁定依赖
source <project-path>
python3 snapshot.py --verify .
npm ci --no-audit --no-fund
# Only when the selected EGL launcher needs it, set the verified managed binary.
# export REMOTION_CHROME_BINARY=/absolute/managed/chrome-for-testing/chrome
nohup python3 guard.py --report guard-report.json -- node render.mjs render-job.json > render.log 2>&1 < /dev/null &
# 渲染结束后校验，不把输出文件存在视为成功
python3 verify.py render-job.json
```

上面的server是示例占位符，必须替换为已核实、已授权的实际主机；当前历史主机见environment.md。
