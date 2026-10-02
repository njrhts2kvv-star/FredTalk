#!/usr/bin/env python3
"""Check that scenes declared dynamic actually change in the rendered MP4.

This is a conservative signal, not a visual approval.  It samples five small
grayscale frames per scene and blocks only when a scene promises motion but all
sampled content is effectively identical.  ``stable-reading`` scenes are
explicitly exempt and still require a reason in the Manifest.
"""
import argparse
import json
import shutil
import subprocess
from pathlib import Path


def _frame(video, seconds, ffmpeg, width=96, height=54):
    command = [ffmpeg, "-hide_banner", "-loglevel", "error", "-ss", f"{max(0.0, seconds):.6f}",
               "-i", str(video), "-frames:v", "1", "-vf", f"scale={width}:{height},format=gray",
               "-f", "rawvideo", "pipe:1"]
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode or len(result.stdout) != width * height:
        detail = result.stderr.decode("utf-8", "replace").strip()
        raise RuntimeError(f"frame extraction failed at {seconds:.3f}s: {detail}")
    return result.stdout


def _difference(left, right):
    return sum(abs(a - b) for a, b in zip(left, right)) / len(left)


def scan(video, manifest, threshold=2.0, ffmpeg=None):
    ffmpeg = ffmpeg or shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required for dynamic scene scanning")
    fps = float(manifest["timelineFps"])
    results, errors = [], []
    for page in manifest.get("pages", []):
        dynamic = page.get("dynamicContract", {})
        mode = dynamic.get("mode")
        if mode == "stable-reading":
            results.append({"stableId": page.get("stableId"), "mode": mode, "status": "SKIP",
                            "reason": dynamic.get("reason")})
            continue
        if mode not in {"dynamic", "mixed"}:
            errors.append(f"{page.get('stableId', '<missing>')}: invalid dynamicContract.mode")
            continue
        start = page.get("startFrame")
        duration = page.get("durationInFrames")
        if not isinstance(start, int) or not isinstance(duration, int) or duration <= 0:
            errors.append(f"{page.get('stableId', '<missing>')}: invalid frame range")
            continue
        sample_count = dynamic.get("sampleCount", 5)
        required = dynamic.get("requiredChangeEvents", 1)
        if (type(sample_count) is not int or sample_count < 3 or
                type(required) is not int or not 1 <= required <= sample_count - 1):
            errors.append(f"{page.get('stableId', '<missing>')}: invalid sampling configuration; "
                          "sampleCount must be an integer >= 3 and requiredChangeEvents "
                          "must be an integer between 1 and sampleCount - 1; no visual verdict")
            continue
        times = [(start + duration * (i + 1) / (sample_count + 1)) / fps for i in range(sample_count)]
        try:
            frames = [_frame(video, t, ffmpeg) for t in times]
        except RuntimeError as error:
            errors.append(f"{page.get('stableId', '<missing>')}: {error}")
            continue
        diffs = [_difference(a, b) for a, b in zip(frames, frames[1:])]
        changed = sum(value >= threshold for value in diffs)
        passed = changed >= required
        item = {"stableId": page.get("stableId"), "mode": mode, "status": "PASS" if passed else "FAIL",
                "sampleTimes": times, "adjacentMeanAbsDiff": diffs, "changedEvents": changed,
                "requiredChangeEvents": required, "threshold": threshold}
        results.append(item)
        if not passed:
            errors.append(f"{page.get('stableId', '<missing>')}: declared {mode} but only {changed} sampled change event(s) met threshold {threshold}")
    return {"status": "FAIL" if errors else "PASS", "video": str(video), "scenes": results, "errors": errors}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--threshold", type=float, default=2.0)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if not args.video.is_file():
        parser.error(f"video not found: {args.video}")
    result = scan(args.video, json.loads(args.manifest.read_text()), threshold=args.threshold)
    payload = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(payload)
    print(payload, end="")
    raise SystemExit(result["status"] != "PASS")


if __name__ == "__main__":
    main()
