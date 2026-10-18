#!/usr/bin/env bash
# 整期 4K60 云端分块渲染（114 v2 定型）：画面静音分块，音频本机整片渲染，最后拼接。主机、目录、线数读 episode.json 的 cloud。
#
#   bash render/cloud.sh sync [host]          # 把 render/stage（冻结的 src）+ public-4k 同步到所有服务器（或只同步一台）
#   bash render/cloud.sh plan S07             # 生成分块计划（参数 = 暂不渲染的段）
#   bash render/cloud.sh go                   # 推荐：每台同步成功后立刻开自己的线（各台互不等待；台数读 episode.json 的 cloud.hosts）
#   bash render/cloud.sh run [host]           # 按计划开渲染线（线数读 episode.json，每条 --concurrency=2），渲完自动拉回
#   bash render/cloud.sh chunk A S07 0 383    # 单块（手动挪拖尾块用）
#   bash render/cloud.sh add S07              # 返修段补渲：重新同步 stage，切块后追加到最空的线上（单独跑）
#   bash render/cloud.sh status               # 看已拉回多少块
#   bash render/cloud.sh final                # 本机渲整片音轨 + 拼接成片（要求所有块齐全）
#
# 约定：逻辑 1920×1080，--scale=2 输出 3840×2160 60fps；渲染用 public-4k（4K 原素材）。
# 每块完成后 ffprobe 核对（新版 ffprobe 行尾会多一个逗号，先去掉再比） 3840x2160 / 60/1 / 帧数；单块超时 15 分钟自动杀掉重试一次（防卡死）。
# ssh 一律 -n：否则会吞掉 while read 的块列表，渲染线只跑第一块就结束。
set -euo pipefail
V="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEY="$HOME/.ssh/fredtalk_render_ed25519"
SSHO=(-n -i "$KEY" -o IPQoS=none -o BatchMode=yes -o ConnectTimeout=15 -o ServerAliveInterval=30)
RSH="ssh -i $KEY -o IPQoS=none -o BatchMode=yes -o ConnectTimeout=15"
cfg() { python3 -c "import json,sys;c=json.load(open('$V/episode.json'))['cloud'];print(eval(sys.argv[1]))" "$1"; }
RD=$(cfg "c['dir']")
host() { cfg "c['hosts']['$1']"; }
nm() { cfg "c['nodeModules']['$1']"; }
CH="$V/out/chunks"; LOG="$V/render/logs"; PLAN="$V/render/plan.json"
mkdir -p "$CH" "$LOG"

sync_one() {
  local s=$1 h; h=$(host "$1")
  ssh "${SSHO[@]}" "$h" "mkdir -p $RD/out"
  rsync -a --delete -e "$RSH" "$V/render/stage/src" "$V/render/stage/package.json" "$V/render/stage/tsconfig.json" "$h:$RD/"
  # 本机网络大流量上传会被中途断开：--partial 续传 + 循环重试直到同步完成
  local k=0; until rsync -aL --partial --delete --timeout=60 -e "$RSH" "$V/public-4k/" "$h:$RD/public-4k/"; do
    k=$((k+1)); [ $k -ge 60 ] && { echo "[$s] public-4k 同步失败 60 次"; return 1; }; echo "[$s] 断开，续传第 $k 次"; sleep 3; done
  ssh "${SSHO[@]}" "$h" "cd $RD && ln -sfn $(nm "$s") node_modules && grep -m1 '\"version\"' node_modules/remotion/package.json"
  echo "[$s] 同步完成"
}

render_chunk() {  # $1=服务器 $2=段 $3=起帧 $4=止帧(含)
  local s=$1 seg=$2 a=$3 b=$4 h name="$2_$3-$4" n=$(( $4 - $3 + 1 )); h=$(host "$1")
  [ -f "$CH/$name.mp4" ] && { echo "[$s] $name 已存在，跳过"; return 0; }
  for attempt in 1 2; do
    if ssh "${SSHO[@]}" "$h" "source ~/fred-render/env.sh && cd $RD && timeout 900 npx remotion render src/index.tsx $seg out/$name.tmp.mp4 \
        --frames=$a-$b --muted --public-dir=public-4k --scale=2 --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 \
        --concurrency=2 --timeout=120000 --bundle-cache=false --log=error && mv out/$name.tmp.mp4 out/$name.mp4"; then
      rsync -a -e "$RSH" "$h:$RD/out/$name.mp4" "$CH/$name.tmp.mp4"
      local probe; probe=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_read_packets -of csv=p=0 "$CH/$name.tmp.mp4" | head -1 | sed 's/,$//')
      if [ "$probe" = "3840,2160,60/1,$n" ]; then mv "$CH/$name.tmp.mp4" "$CH/$name.mp4"; echo "[$s] $name OK ($probe)"; return 0; fi
      echo "[$s] $name 核对不符：$probe（期望 3840,2160,60/1,$n）"; rm -f "$CH/$name.tmp.mp4"
    else
      echo "[$s] $name 第 $attempt 次失败/超时"
      ssh "${SSHO[@]}" "$h" "pkill -f '[r]emotion render src/index.tsx $seg out/$name' ; rm -f $RD/out/$name.tmp.mp4" || true
    fi
  done
  echo "[$s] $name 两次都失败" ; return 1
}

lane() {  # $1=服务器 $2=线号；块列表从 plan.json 读
  local s=$1 i=$2
  python3 -c "import json;[print(*c) for c in json.load(open('$PLAN'))['lanes']['$s'][$i]]" | while read -r seg a b; do
    render_chunk "$s" "$seg" "$a" "$b" || true
  done
}

case "${1:-}" in
  sync) if [ -n "${2:-}" ]; then sync_one "$2"; else for s in $(cfg "' '.join(c['hosts'])"); do sync_one $s; done; fi ;;
  plan) shift; python3 "$V/render/plan.py" "$@" ;;
  run)   # 可选参数 A 或 B：只开这台的线
    for s in $(cfg "' '.join(c['hosts'])"); do [ -n "${2:-}" ] && [ "$2" != "$s" ] && continue
      n=$(cfg "c['lanes']['$s']"); for ((i=0;i<n;i++)); do lane $s $i > "$LOG/lane-$s$i.log" 2>&1 & done; done
    wait; echo "渲染线结束 ${2:-AB}"; bash "$0" status ;;
  go)    # 先同步 B 并立即开 B 的 8 条线，同时同步 A，好了再开 A 的 4 条线
    for s in $(cfg "' '.join(c['hosts'])"); do { sync_one $s && bash "$0" run $s; } > "$LOG/go-$s.log" 2>&1 & done   # 116：台数不再写死 A/B
    wait; bash "$0" status ;;
  add)
    shift; rsync -a --delete "$V/src" "$V/package.json" "$V/tsconfig.json" "$V/render/stage/"
    sync_one B
    python3 "$V/render/plan.py" --only "$@" > "$LOG/add-plan.txt"
    # 返修段块名不变：先把本地旧块挪进 chunks-old，否则 render_chunk 会因“已存在”跳过，final 拼进旧画面
    mkdir -p "$V/out/chunks-old"; while read -r seg a b; do [ -f "$CH/${seg}_$a-$b.mp4" ] && mv "$CH/${seg}_$a-$b.mp4" "$V/out/chunks-old/${seg}_$a-$b.$(date +%H%M%S).mp4"; done < "$LOG/add-plan.txt"
    i=0; while read -r seg a b; do render_chunk B "$seg" "$a" "$b" > "$LOG/add-$seg-$a.log" 2>&1 & i=$((i+1)); done < "$LOG/add-plan.txt"
    wait; bash "$0" status ;;
  chunk) render_chunk "$2" "$3" "$4" "$5" ;;   # 单块：服务器 段 起帧 止帧
  status) python3 "$V/render/plan.py" --status ;;
  final) python3 "$V/render/final.py" ;;
  *) sed -n '2,14p' "$0"; exit 1 ;;
esac
