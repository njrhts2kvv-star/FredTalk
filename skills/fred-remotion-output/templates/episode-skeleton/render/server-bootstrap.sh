#!/usr/bin/env bash
# 新渲染服务器装环境（116 期整理）：Node 22.16.0 + Remotion 4.0.515 运行时 + 无头 Chrome。
#   bash render/server-bootstrap.sh ubuntu@<地址>
# 前提：本机专用密钥 ~/.ssh/fredtalk_render_ed25519 已装到服务器（Fred 给的密码只用来装一次密钥，不写进任何文件）。
# 装完后 episode.json 的 cloud.hosts 加这台，nodeModules 填 ~/fred-render/runtimes/rm515/node_modules。
# 清理服务器历史缓存时保留：~/fred-render/env.sh、~/fred-render/work/（Node 在里面）、~/fred-render/runtimes/。116 期误删 work/ 后新开的块全部失败。
set -euo pipefail
H=${1:?用法：bash render/server-bootstrap.sh user@host}
V="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEY="$HOME/.ssh/fredtalk_render_ed25519"
SSH=(ssh -i "$KEY" -o IPQoS=none -o BatchMode=yes -o ConnectTimeout=15)
PKG="$V/package.json"; [ -f "$PKG" ] || PKG="$V/../component-kit/package.json"   # 工程里有就用工程的，否则用 Skill 模板的（Remotion 4.0.515）
scp -q -i "$KEY" -o IPQoS=none "$PKG" "$H:/tmp/fred-render-package.json"
"${SSH[@]}" "$H" 'set -e
mkdir -p ~/fred-render/work ~/fred-render/runtimes/rm515 ~/fred-render/projects
if [ ! -x ~/fred-render/work/node-v22.16.0-linux-x64/bin/node ]; then
  cd ~/fred-render/work && curl -fsSL -o node.tar.xz https://nodejs.org/dist/v22.16.0/node-v22.16.0-linux-x64.tar.xz && tar -xJf node.tar.xz && rm node.tar.xz
fi
[ -f ~/fred-render/env.sh ] || echo "export PATH=\"\$HOME/fred-render/work/node-v22.16.0-linux-x64/bin:\$PATH\"" > ~/fred-render/env.sh
source ~/fred-render/env.sh
cd ~/fred-render/runtimes/rm515
if [ ! -f node_modules/remotion/package.json ]; then cp /tmp/fred-render-package.json package.json && npm install --no-audit --no-fund; fi
npx remotion browser ensure >/dev/null
echo "node $(node -v)  remotion $(node -p "require(\"./node_modules/remotion/package.json\").version")  cores $(nproc)"
df -h ~ | tail -1'
