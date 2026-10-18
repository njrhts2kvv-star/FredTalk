#!/usr/bin/env bash
# 本机 4K60 补渲指定块（同 cloud.sh 参数；返修少量块时比开云端快），用法：bash render/local.sh S07_0-383 ...
set -uo pipefail
V="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$V"
PRIV=$(mktemp -d); export TMPDIR="$PRIV/"; trap 'rm -rf "$PRIV"' EXIT   # 120 期：本次渲染独占临时目录，结束整个删掉（打包不攒在系统临时目录，也不误删别的进程的）
one() { local name=$1 seg=${1%_*} r=${1##*_}; local a=${r%-*} b=${r#*-} n=$(( ${r#*-} - ${r%-*} + 1 ))
  npx remotion render src/index.tsx $seg out/chunks/$name.tmp.mp4 --frames=$a-$b --muted --public-dir=public-4k --scale=2 --codec=h264 --crf=16 \
    --pixel-format=yuv420p --color-space=bt709 --concurrency=4 --timeout=120000 --log=error || { echo "$name 失败"; return 1; }
  local probe; probe=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_read_packets -of csv=p=0 out/chunks/$name.tmp.mp4 | head -1 | sed 's/,$//')
  [ "$probe" = "3840,2160,60/1,$n" ] && mv out/chunks/$name.tmp.mp4 out/chunks/$name.mp4 && echo "$name OK" || echo "$name 核对不符 $probe"; }
args=("$@"); for ((i=0;i<${#args[@]};i+=2)); do one "${args[i]}" & [ -n "${args[i+1]:-}" ] && one "${args[i+1]}" & wait; done
python3 render/plan.py --status
