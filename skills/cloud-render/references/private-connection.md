# 私人服务器连接资料

## 当前四实例

### 低成本实例 A（V100S）

- 实例 ID：`uhost-1vsdlli7yjsu`
- SSH 登录指令：`ssh ubuntu@127.0.0.1`
- SSH 密码：`wg6a7E45KNu0v918`

### 低成本实例 B（V100S）

- 实例 ID：`uhost-1vsbpg407z1k`
- SSH 登录指令：`ssh ubuntu@127.0.0.1`
- SSH 密码：`L7I9810Nyb36Ks5P`

### RTX 实例（FredRemotion）

- 实例 ID：`uhost-1viqo4hzutha`
- SSH 登录指令：`ssh ubuntu@127.0.0.1`
- SSH 密码：`43HLTF95820e7hno`

### RTX 实例（fred-remotion-test）

- 实例 ID：`uhost-1v6x8uulbr0b`
- SSH 登录指令：`ssh ubuntu@127.0.0.1`
- SSH 密码：`sX1z9b07K23A54Md`

## 历史连接资料（不参与默认四实例选择）

- 实例 ID：`uhost-1vfa07w63o5f`
- SSH 登录指令：`ssh ubuntu@127.0.0.1`
- SSH 密码：`8h7d5Urf94O0p12N`

## 优云智算 API

- 公钥：`4ebo052VxBNKQtpFbeEVHwFobL257kiU2`
- 私钥：`FPrZ95m4et2AKadqGvITie27w5izbJmh88wDGSzba6Nw`
- 用途：查询并管理已授权 GPU 实例；云端渲染开始前自动启动现有实例，交付与校验完成后默认关机。
- 授权边界：不自动创建新实例、扩容、释放或删除实例；这些付费或破坏性动作仍需 Fred 当次明确授权。

连接时优先使用已有 SSH 会话、SSH agent 或密钥；需要密码时读取本文件并仅送入 SSH 隐藏密码提示，不拼进命令参数、不打印。API 凭证只读入进程环境或请求签名器，不写入 URL、命令参数、错误信息或普通日志。API 不可用时用 Ego Lite 控制台作为后备通道。主机地址、实例 ID 和状态在操作前核实。
