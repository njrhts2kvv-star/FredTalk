#!/usr/bin/env python3
"""Find stretches where the picture is full of text but none of it is readable.

motion_audit.py cannot see "整窗播放录屏/网页，界面字只有几像素，持续好几秒". This
check reads the pixels: every second one frame is grabbed (ffmpeg, 1 fps), scaled
to 1080 px high and run through macOS Vision OCR (scripts/ocr_boxes.swift,
compiled once into $TMPDIR). Per frame:

  1. drop boxes in the subtitle band (bottom 15 %) and the corner badge area
     (x > 1540, y < 130 on the 1920x1080 canvas), and boxes with confidence < MIN_CONF;
  2. frame_stats: box count, tallest box, and READABLE SHARE = text area (w*h) in boxes at least
     MIN_READABLE_H px tall / total text area;
  3. the frame is "unreadable" when it has >= MIN_BOXES text boxes (lots of text) and the readable
     share is < MIN_SHARE (what the viewer is shown is mostly tiny). A big conclusion capsule or
     number over a busy background keeps the share up only if it carries real area; a lone
     little chip does not rescue a wall of 15 px terminal text.
     (Why not "tallest box < H": the Codex trial has 31-50 px source tags and capsules on top
     of the unreadable terminal, which would make every frame pass.)

Consecutive unreadable seconds are merged into runs:
  >= BLOCK_SECONDS (3)  -> block (exit code 1)
  >= WARN_SECONDS  (2)  -> warn
A single flagged sample is ignored (OCR flicker, cut frames).

Calibrated constants (1080 canvas; Vision line box is ~1.4x the glyph size for small Latin UI
text: a 22 px box is ~15 px font, clearly unreadable; CC list rows read fine at box >= 24):
  MIN_READABLE_H = 24    box height in px. Vision boxes are ~1.4x the glyph size, so this is
                         roughly 17 px type: passing here does NOT prove the Skill rule
                         'text meant to be read >= 24 px'; that still needs a look.
  MIN_SHARE      = 0.45  Codex EP118 trial (area share): 46-52 s and 56-69 s (dips to 0.1-0.4, 52-55 s sits just
                         above), 87-96 s (0.12-0.2) are caught; CC v3 readable scenes mostly 0.5-1.0.
  MIN_BOXES      = 8     below this a frame is just a sparse picture, not a wall of text.
  MIN_CONF       = 0.3   throws away OCR noise on textures.
Calibration result: Codex 1080p30 -> block 46-52 s, 56-69 s, 87-96 s. CC v3 4K60 first 120 s -> warn 17-19 s,
block 87-92 s (a blurred GitHub page with small UI behind a crop box: borderline, treat with --allow if approved).

Usage:
  python3 readability_audit.py --video final.mp4 [--max-seconds 120]
  python3 readability_audit.py --dir out/segments --allow S02 --allow S09:0-1.5 --json out.json
Exit code 1 when any unallowed block remains; 2 on tool failure.
Findings are candidates: an approved "just glance at it" B-roll can be waived with --allow.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from dataclasses import dataclass, asdict
from pathlib import Path

CANVAS_H = 1080
MIN_READABLE_H = 24.0
MIN_SHARE = 0.45
MIN_BOXES = 8
MIN_CONF = 0.3
BLOCK_SECONDS = 3
WARN_SECONDS = 2
SUBTITLE_BAND = 0.15           # bottom fraction (references/landscape-subtitles.md: caption box ~y 953-1054 on 1080)
BADGE_X, BADGE_Y = 1540, 130   # corner badge: DESIGN.md 角标 1549-1895 x 36-121

HERE = Path(__file__).resolve().parent
SWIFT = HERE / "ocr_boxes.swift"


@dataclass
class Finding:
    segment: str
    kind: str  # block | warn
    start: float
    end: float
    maxHeight: float
    boxes: int

    @property
    def duration(self) -> float:
        return round(self.end - self.start, 2)


def usable_boxes(boxes: list[dict], width: float, height: float = CANVAS_H) -> list[dict]:
    """Boxes that count for the check (outside subtitle band and badge, confident)."""
    out = []
    for b in boxes:
        if b.get("conf", 0) < MIN_CONF or not str(b.get("text", "")).strip():
            continue
        cx, cy = b["x"] + b["w"] / 2, b["y"] + b["h"] / 2
        if cy > height * (1 - SUBTITLE_BAND):
            continue
        if cx > BADGE_X * width / 1920 and cy < BADGE_Y:
            continue
        out.append(b)
    return out


def frame_stats(boxes: list[dict], min_h: float = MIN_READABLE_H) -> tuple[int, float, float]:
    """(box count, tallest box px, readable share of text area)."""
    total = sum(b["w"] * b["h"] for b in boxes)
    readable = sum(b["w"] * b["h"] for b in boxes if b["h"] >= min_h)
    return len(boxes), max((b["h"] for b in boxes), default=0.0), (readable / total if total else 1.0)


def is_unreadable(n_boxes: int, share: float, *, min_boxes: int = MIN_BOXES,
                  min_share: float = MIN_SHARE) -> bool:
    return n_boxes >= min_boxes and share < min_share


def merge_runs(flags: list[bool], stats: list[tuple[int, float, float]], *, name: str,
               block: int = BLOCK_SECONDS, warn: int = WARN_SECONDS) -> list[Finding]:
    """Each sample covers one second [i, i+1). Runs of flagged samples -> findings."""
    found: list[Finding] = []
    i, n = 0, len(flags)
    while i < n:
        if not flags[i]:
            i += 1
            continue
        j = i
        while j < n and flags[j]:
            j += 1
        length = j - i
        if length >= warn:
            seg = stats[i:j]
            found.append(Finding(name, "block" if length >= block else "warn", float(i), float(j),
                                 round(max(s[1] for s in seg), 1), max(s[0] for s in seg)))
        i = j
    return found


def parse_allow(values: list[str]) -> dict[str, list[tuple[float, float]]]:
    allow: dict[str, list[tuple[float, float]]] = {}
    for value in values:
        if ":" in value:
            name, span = value.split(":", 1)
            try:
                a, b = span.split("-", 1)
                window = (float(a), float(b))
            except ValueError:
                raise SystemExit(f"--allow 格式应为 段号 或 段号:起-止，收到 {value!r}")
            allow.setdefault(name, []).append(window)
        else:
            allow.setdefault(value, []).append((0.0, float("inf")))
    return allow


def is_allowed(f: Finding, allow: dict[str, list[tuple[float, float]]]) -> bool:
    return any(a <= f.start and f.end <= b + 0.05 for a, b in allow.get(f.segment, []))


def ocr_binary() -> Path:
    cache = Path(os.environ.get("TMPDIR", tempfile.gettempdir())) / "fred-readability"
    cache.mkdir(parents=True, exist_ok=True)
    exe = cache / "ocr_boxes"
    if not exe.exists() or exe.stat().st_mtime < SWIFT.stat().st_mtime:
        r = subprocess.run(["swiftc", "-O", str(SWIFT), "-o", str(exe)], capture_output=True, text=True)
        if r.returncode != 0:
            raise RuntimeError(f"swiftc 编译失败：{r.stderr[-400:]}")
    return exe


def sample_frames(video: Path, outdir: Path, max_seconds: float | None) -> list[Path]:
    cmd = ["ffmpeg", "-v", "error", "-i", str(video)]
    if max_seconds:
        cmd += ["-t", str(max_seconds)]
    cmd += ["-vf", f"fps=1,scale=-2:{CANVAS_H}:flags=lanczos", "-q:v", "2", str(outdir / "f%05d.jpg")]
    subprocess.run(cmd, check=True, capture_output=True)
    return sorted(outdir.glob("f*.jpg"))


def ocr_frames(frames: list[Path]) -> list[dict]:
    exe = ocr_binary()
    results: list[dict] = []
    for k in range(0, len(frames), 40):
        r = subprocess.run([str(exe), *map(str, frames[k:k + 40])], check=True, capture_output=True, text=True)
        results += [json.loads(line) for line in r.stdout.splitlines() if line.strip()]
    return results


def audit_video(path: Path, max_seconds: float | None, dump: Path | None = None) -> tuple[list[Finding], int]:
    with tempfile.TemporaryDirectory() as td:
        frames = sample_frames(path, Path(td), max_seconds)
        ocr = ocr_frames(frames)
    flags, stats = [], []
    if len(ocr) != len(frames):
        raise RuntimeError(f"OCR returned {len(ocr)} results for {len(frames)} frames")
    for res in ocr:
        if res.get("error"):
            raise RuntimeError(f"OCR failed on {res.get('file')}: {res['error']}")
        boxes = usable_boxes(res.get("boxes", []), res.get("width", 1920))
        s = frame_stats(boxes)
        stats.append(s)
        flags.append(is_unreadable(s[0], s[2]))
    if dump:
        dump.write_text(json.dumps([{"t": i, "boxes": s[0], "maxH": round(s[1], 1), "share": round(s[2], 2), "flag": f,
                                     "hs": sorted((round(b["h"]), round(b["w"]), round(b["conf"], 2)) for b in usable_boxes(r.get("boxes", []), r.get("width", 1920)))}
                                    for i, (s, f, r) in enumerate(zip(stats, flags, ocr))], ensure_ascii=False))
    return merge_runs(flags, stats, name=path.stem), len(frames)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("videos", nargs="*", type=Path)
    p.add_argument("--video", type=Path, action="append", default=[], help="single file (repeatable)")
    p.add_argument("--dir", type=Path, help="audit every .mp4 in this folder (name = segment id)")
    p.add_argument("--max-seconds", type=float, help="only the first N seconds")
    p.add_argument("--allow", action="append", default=[], help="SEG or SEG:start-end whitelisted")
    p.add_argument("--json", type=Path, help="write findings here")
    p.add_argument("--dump", type=Path, help="write per-second stats of the (last) video here, for calibration")
    args = p.parse_args(argv)

    videos = list(args.videos) + list(args.video)
    if args.dir:
        videos += sorted(args.dir.glob("*.mp4"))
    if not videos:
        p.error("no videos")
    allow = parse_allow(args.allow)

    report, blocking = [], 0
    for path in videos:
        try:
            found, n = audit_video(path, args.max_seconds, args.dump)
        except (subprocess.CalledProcessError, RuntimeError, OSError) as exc:
            msg = getattr(exc, "stderr", None) or str(exc)
            print(f"{path}: 失败：{msg[-300:] if isinstance(msg, str) else msg}", file=sys.stderr)
            return 2
        for f in found:
            allowed = is_allowed(f, allow)
            blocking += 0 if allowed or f.kind != "block" else 1
            label = "已豁免" if allowed else ("字太小读不清（阻止）" if f.kind == "block" else "字太小读不清（提醒）")
            print(f"{f.segment}\t{f.start:6.1f}-{f.end:6.1f}s\t{f.duration:4.1f}s\t{label}"
                  f"\t文字框={f.boxes} 个，大字面积占比不足（区间内最大框高 {f.maxHeight}px）")
            report.append({**asdict(f), "duration": f.duration, "allowed": allowed})
        if not found:
            print(f"{path.stem}\tOK ({n}s)")
    warnings = sum(1 for f in report if f["kind"] == "warn" and not f["allowed"])
    print(f"阻止 {blocking} 处，提醒 {warnings} 处")
    if args.json:
        args.json.write_text(json.dumps({"blocking": blocking, "warnings": warnings, "findings": report},
                                        ensure_ascii=False, indent=2))
    return 1 if blocking else 0


if __name__ == "__main__":
    sys.exit(main())
