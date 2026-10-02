#!/usr/bin/env bash
set -euo pipefail
: "${REMOTION_CHROME_BINARY:?Set REMOTION_CHROME_BINARY to the verified managed Chrome for Testing executable}"
test -x "$REMOTION_CHROME_BINARY"
exec "$REMOTION_CHROME_BINARY" "$@" --enable-gpu --enable-gpu-rasterization --use-gl=angle --use-angle=gl-egl
