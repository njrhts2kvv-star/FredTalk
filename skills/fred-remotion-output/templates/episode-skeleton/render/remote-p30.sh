#!/usr/bin/env bash
# 服务器端：打包一次，按段并行渲 1080p30（由 preview30.sh 调用）。失败自动重试一次；结束删掉本次打包。
set -e
source ~/fred-render/env.sh
cd "$(dirname "$0")/.."
ln -sfn ~/fred-render/runtimes/rm515/node_modules node_modules
rm -rf out/bundle; mkdir -p out/p30
[ -z "${ONLY:-}" ] && rm -f out/p30/*
trap 'rm -rf out/bundle' EXIT
npx remotion bundle src/index.tsx --out-dir out/bundle --log=error >/dev/null
echo bundled
SEGS=${ONLY:-$(node -e "console.log(require('./src/timing.json').pages.map(p=>p.stableId).join(' '))")}
export CONC=${CONC:-3}
one() {
  s=$1
  rm -f "out/p30/$s.mp4"   # 120 期复审：渲前先删，失败时不留旧段被拼进预览
  for try in 1 2; do
    if timeout 1500 npx remotion render out/bundle "$s" "out/p30/$s.mp4" --props='{"fps":30}' --concurrency="$CONC" --timeout=120000 --codec=h264 --crf=20 --log=error > "out/p30/$s.log" 2>&1; then echo "done $s"; return 0; fi
  done
  echo "FAIL $s"; return 1
}
export -f one
printf '%s\n' $SEGS | xargs -P "${P:-3}" -I{} bash -c 'one {}' || { echo "有段渲染失败（见上面 FAIL）"; exit 1; }
