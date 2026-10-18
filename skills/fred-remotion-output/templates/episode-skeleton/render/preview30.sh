#!/usr/bin/env bash
# 1080p30 预览：同步工程到一台服务器，一次打包，按段并行渲 1080p30，拉回 out/p30/。再跑 python3 render/assemble30.py 拼成片。
#   bash render/preview30.sh ubuntu@<host>
#   ONLY="S01 S04" bash render/preview30.sh ubuntu@<host>   只重渲这几段
#   P=3 CONC=3 bash render/preview30.sh ...                 并行段数 / 每段并发（默认 3×3；10 核机 5×3 时视频素材多的段会 delayRender 超时，120 期）
# 远端目录读 episode.json 的 cloud.dir（不再写死期号，118 曾误同步进 117 的目录）。只用专用密钥。
set -euo pipefail
H=${1:?host}
V="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEY="$HOME/.ssh/fredtalk_render_ed25519"
SSH=(ssh -i "$KEY" -o IPQoS=none -o BatchMode=yes -o ConnectTimeout=15)
R=$(python3 -c "import json;print(json.load(open('$V/episode.json'))['cloud']['dir'])")
"${SSH[@]}" "$H" "mkdir -p $R"
until rsync -aL --partial --delete -e "ssh -i $KEY -o IPQoS=none" --exclude node_modules --exclude keyframes --exclude qc --exclude out --exclude render/stage --exclude public-4k --exclude est "$V/" "$H:$R/"; do sleep 3; done
mkdir -p "$V/out/p30"
for s in ${ONLY:-}; do rm -f "$V/out/p30/$s.mp4"; done   # 要重渲的段先删本地旧文件
[ -z "${ONLY:-}" ] && rm -f "$V/out/p30/"*.mp4
RC=0; "${SSH[@]}" "$H" "ONLY='${ONLY:-}' P='${P:-3}' CONC='${CONC:-3}' bash $R/render/remote-p30.sh" || RC=$?
until rsync -a --partial -e "ssh -i $KEY -o IPQoS=none" --include '*.mp4' --include '*.log' --exclude '*' "$H:$R/out/p30/" "$V/out/p30/"; do sleep 3; done
echo pulled
[ "$RC" = 0 ] || { echo "远端有段失败（退出码 $RC），已拉回成功的段；失败段补渲成功前不要拼片"; exit "$RC"; }
