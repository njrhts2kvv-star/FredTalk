#!/usr/bin/env python3
"""Find slow or frozen stretches in rendered segments.

Static frames cannot show "缓慢推进 / 定格凑时长 / 纯滚动干播"; this check reads the
actual video. Each sampled frame is compared with the previous one (per-step
change) and with the frame `hold` seconds later (net change):

- hold: the picture barely changes for longer than --max-hold seconds
  (freeze, waiting, filler).
- slow: the picture keeps moving but every step is small for longer than
  --max-slow seconds (slow push-in, slow scroll, drifting card).

The subtitle band is cropped by default so a frozen picture with changing
subtitles is still reported. Findings are candidates for review, not verdicts:
a reading pause or an approved B-roll can be whitelisted with --allow.

Usage:
  python3 motion_audit.py S01.mp4 S02.mp4 ...
  python3 motion_audit.py --dir out/segments --allow S02 --allow S09:0-1.5 --json audit.json
Exit code 1 when any unallowed blocking finding remains (use as a gate before
rendering 4K); 2 when a video cannot be read. Holds of 2-3 s are warnings only.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

import numpy as np

W, H = 192, 108
BLOCKING = {"hold", "slow", "move", "scroll"}
LABELS = {"hold": "定格/干等", "hold-warn": "停留偏长（提醒）", "slow": "缓慢漂移", "move": "单次运动过长（慢推/慢移）", "scroll": "纯滚动过长",
          "nonstop": "持续运动不停稳（提醒）"}


@dataclass
class Finding:
    segment: str
    kind: str  # hold | hold-warn | slow | move | scroll | nonstop
    start: float
    end: float
    meanStep: float
    netChange: float

    @property
    def duration(self) -> float:
        return round(self.end - self.start, 2)


def read_frames(path: Path, fps: float) -> np.ndarray:
    cmd = [
        "ffmpeg", "-v", "error", "-i", str(path),
        "-vf", f"fps={fps},scale={W}:{H}:flags=area,format=gray",
        "-f", "rawvideo", "-",
    ]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    frames = np.frombuffer(raw, dtype=np.uint8)
    n = frames.size // (W * H)
    return frames[: n * W * H].reshape(n, H, W).astype(np.float32)


def crop_picture(frames: np.ndarray, subtitle_band: float) -> np.ndarray:
    keep = int(round(H * (1 - subtitle_band)))
    return frames[:, :keep, :]


def runs(mask: np.ndarray):
    start = None
    for i, flag in enumerate(list(mask) + [False]):
        if flag and start is None:
            start = i
        elif not flag and start is not None:
            yield start, i
            start = None


def translation(a: np.ndarray, b: np.ndarray) -> tuple[int, int, float]:
    """Global shift b≈shift(a) by phase correlation, plus residual after the shift."""
    fa = np.fft.fft2(a - a.mean())
    fb = np.fft.fft2(b - b.mean())
    r = fa * np.conj(fb)
    r /= np.abs(r) + 1e-6
    corr = np.fft.ifft2(r).real
    dy, dx = np.unravel_index(int(corr.argmax()), corr.shape)
    h, w = a.shape
    if dy > h // 2:
        dy -= h
    if dx > w // 2:
        dx -= w
    shifted = np.roll(a, (-dy, -dx), axis=(0, 1))
    ys = slice(max(0, -dy) + 2, h - max(0, dy) - 2)
    xs = slice(max(0, -dx) + 2, w - max(0, dx) - 2)
    if ys.start >= ys.stop or xs.start >= xs.stop:
        return int(dy), int(dx), float(np.abs(a - b).mean())
    return int(dy), int(dx), float(np.abs(shifted[ys, xs] - b[ys, xs]).mean())


def count_peaks(values: np.ndarray) -> int:
    """Separate accelerations inside one motion run (one ease curve = 1)."""
    if len(values) < 3:
        return 1
    v = np.convolve(values, np.ones(3) / 3, mode="same")
    top = float(v.max())
    peaks = [i for i in range(1, len(v) - 1)
             if v[i] >= v[i - 1] and v[i] >= v[i + 1] and v[i] >= 0.35 * top]
    if not peaks:
        return 1
    count, last = 1, peaks[0]
    for p in peaks[1:]:
        if float(v[last:p + 1].min()) < 0.6 * min(v[last], v[p]):
            count += 1
            last = p
        elif v[p] > v[last]:
            last = p
    return count


def analyse(frames: np.ndarray, fps: float, *, step_still: float, step_slow: float,
            max_hold: float, max_slow: float, max_move: float, max_scroll: float,
            cut_step: float, name: str, max_hold_block: float = 3.0,
            max_nonstop: float = 3.0) -> list[Finding]:
    if len(frames) < 3:
        return []
    step = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))  # step i = frame i -> i+1
    findings: list[Finding] = []

    def net(a: int, b: int) -> float:
        return float(np.abs(frames[b] - frames[a]).mean())

    def add(kind: str, a: int, b: int) -> None:
        findings.append(Finding(name, kind, round(a / fps, 2), round(b / fps, 2),
                                round(float(step[a:b].mean()), 3), round(net(a, b), 2)))

    # hold: the picture does not change (a single tiny jitter does not end a hold)
    still = step < step_still
    for a, b in list(runs(~still)):  # one jittery frame = up to two small steps
        if 0 < a and b < len(still) and b - a <= 2 and float(step[a:b].max()) < step_slow:
            still[a:b] = True
    for a, b in runs(still):
        dur = (b - a) / fps
        if dur >= max_hold:
            add("hold" if dur >= max_hold_block else "hold-warn", a, b)

    moving = step >= step_still
    for i in range(1, len(moving) - 1):  # bridge one-sample dips
        if not moving[i] and moving[i - 1] and moving[i + 1]:
            moving[i] = True
    for a, b in runs(moving):
        dur = (b - a) / fps
        seg = step[a:b]
        if dur > max_slow and float(seg.max()) < step_slow:
            add("slow", a, b)  # creeping drift, every step tiny
            continue
        if seg.max() >= cut_step:
            # split at hard cuts; the cut step itself belongs to neither piece
            pieces, prev = [], a
            for c in [a + i for i, v in enumerate(seg) if v >= cut_step]:
                pieces.append((prev, c))
                prev = c + 1
            pieces.append((prev, b))
            pieces = [(x, y) for x, y in pieces if y - x >= 2]
        else:
            pieces = [(a, b)]
        for x, y in pieces:
            d = (y - x) / fps
            if d <= max_move:
                continue
            shifts = [translation(frames[i], frames[i + 1]) for i in range(x, y)]
            pan = sum(1 for k, (dy, dx, res) in enumerate(shifts)
                      if (dy or dx) and res < 0.8 * step[x + k])
            if d > max_scroll and pan / (y - x) >= 0.5:
                add("scroll", x, y)  # long pure scroll/pan of a page
            elif count_peaks(step[x:y]) == 1:
                add("move", x, y)  # one camera/object move that takes too long
            elif d > max_nonstop:
                add("nonstop", x, y)  # keeps moving, never settles for reading
    findings.sort(key=lambda f: f.start)
    return findings


def parse_allow(values: list[str]) -> dict[str, list[tuple[float, float]]]:
    allow: dict[str, list[tuple[float, float]]] = {}
    for value in values:
        name, _, span = value.partition(":")
        if span:
            a, _, b = span.partition("-")
            try:
                window = (float(a) if a else 0.0, float(b) if b else float("inf"))
            except ValueError:
                raise SystemExit(f"--allow 格式应为 段号 或 段号:起-止，收到 {value!r}")
            allow.setdefault(name, []).append(window)
        else:
            allow.setdefault(name, []).append((0.0, float("inf")))
    return allow


def is_allowed(f: Finding, allow: dict[str, list[tuple[float, float]]]) -> bool:
    return any(a <= f.start and f.end <= b + 0.05 for a, b in allow.get(f.segment, []))


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("videos", nargs="*", type=Path)
    p.add_argument("--dir", type=Path, help="audit every .mp4 in this folder (name = segment id)")
    p.add_argument("--fps", type=float, default=10.0,
                   help="sampling rate; the per-sample thresholds below are calibrated at 10")
    p.add_argument("--subtitle-band", type=float, default=0.13,
                   help="bottom fraction ignored (burned subtitles); 0 to keep")
    p.add_argument("--step-still", type=float, default=0.12,
                   help="mean abs change per sample (0-255) below which the picture counts as still")
    p.add_argument("--step-slow", type=float, default=0.9,
                   help="per-sample change below which motion counts as slow")
    p.add_argument("--max-hold", type=float, default=2.0,
                   help="seconds; longer still picture is listed as a warning (reading pause is 0.85-1.65s)")
    p.add_argument("--max-hold-block", type=float, default=3.0,
                   help="seconds; longer still picture blocks the 4K render")
    p.add_argument("--max-slow", type=float, default=1.2, help="seconds of creeping drift")
    p.add_argument("--max-move", type=float, default=1.4,
                   help="seconds; one camera/object move should land in ~0.6s (motion-craft §8)")
    p.add_argument("--max-scroll", type=float, default=2.0, help="seconds of pure page scroll/pan")
    p.add_argument("--cut-step", type=float, default=80.0,
                   help="per-sample change treated as a hard cut (fast scrolls reach ~50)")
    p.add_argument("--allow", action="append", default=[],
                   help="SEG or SEG:start-end whitelisted (B-roll, approved hold)")
    p.add_argument("--json", type=Path, help="write findings here")
    args = p.parse_args(argv)

    videos = list(args.videos)
    if args.dir:
        videos += sorted(args.dir.glob("*.mp4"))
    if not videos:
        p.error("no videos")
    allow = parse_allow(args.allow)

    report = []
    blocking = 0
    for path in videos:
        try:
            frames = crop_picture(read_frames(path, args.fps), args.subtitle_band)
        except subprocess.CalledProcessError as exc:
            print(f"{path}: ffmpeg 读取失败：{exc.stderr.decode(errors='replace')[-300:]}", file=sys.stderr)
            return 2
        found = analyse(frames, args.fps, step_still=args.step_still, step_slow=args.step_slow,
                        max_hold=args.max_hold, max_slow=args.max_slow, max_move=args.max_move,
                        max_scroll=args.max_scroll, cut_step=args.cut_step, name=path.stem,
                        max_hold_block=args.max_hold_block)
        seg_total = round(len(frames) / args.fps, 2)
        for f in found:
            allowed = is_allowed(f, allow)
            blocking += 0 if allowed or f.kind not in BLOCKING else 1
            label = "已豁免" if allowed else LABELS[f.kind]
            print(f"{f.segment}\t{f.start:6.2f}-{f.end:6.2f}s\t{f.duration:4.1f}s\t{label}"
                  f"\tstep={f.meanStep} net={f.netChange}")
            report.append({**asdict(f), "duration": f.duration, "allowed": allowed})
        if not found:
            print(f"{path.stem}\tOK ({seg_total}s)")
    if args.json:
        args.json.write_text(json.dumps({"findings": report, "blocking": blocking,
                                         "params": {k: v for k, v in vars(args).items()
                                                    if k not in ("videos", "dir", "json")}},
                                        ensure_ascii=False, indent=2, default=str))
    warnings = sum(1 for f in report if f["kind"] not in BLOCKING and not f["allowed"])
    print(f"\n未豁免问题：{blocking} 处（阻止正式渲染）；提醒：{warnings} 处")
    return 1 if blocking else 0


if __name__ == "__main__":
    sys.exit(main())
