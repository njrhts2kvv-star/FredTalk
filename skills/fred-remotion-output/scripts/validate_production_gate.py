#!/usr/bin/env python3
"""Run the staged gates that must pass before a FredTalk Remotion delivery.

The gate is intentionally stricter than the planning validator: it verifies the
implementation route, local-clock contract, representative-review evidence and
rendered dynamicness before formal output.  It does not claim visual approval on
its own; the representative receipt records the human/agent review observations.
"""
import argparse
import hashlib
import json
import math
import subprocess
from fractions import Fraction
from pathlib import Path

from common import digest, load_references, project_root, strip_prefix
from production_contract import validate_production_contract
from reference_usage import validate_reference_usage
from scene import validate_scene_guides
from scan_dynamic_scenes import scan as scan_dynamic
from validate_storyboard import validate as validate_storyboard
from lint_remotion_clock import lint as lint_clock


def _sha(path):
    return digest(path)


def _tree_sha(path):
    root = Path(path)
    entries = []
    for item in sorted(x for x in root.rglob("*") if x.is_file()):
        if any(part in {"node_modules", ".git", "dist", ".vite"} for part in item.parts):
            continue
        entries.append((str(item.relative_to(root)), _sha(item)))
    return hashlib.sha256(json.dumps(entries, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def _read(path, label):
    if not path:
        raise ValueError(label + " is required")
    value = json.loads(Path(path).read_text())
    if not isinstance(value, dict):
        raise ValueError(label + " must be a JSON object")
    return value


def _required_scenes(manifest):
    pages = manifest.get("pages", [])
    explicit = manifest.get("representativeScenes")
    chosen = [x for x in explicit if isinstance(x, str)] if isinstance(explicit, list) else []
    if pages:
        chosen.append(pages[0].get("stableId"))
        chosen.append(pages[-1].get("stableId"))
    if pages:
        longest = max(pages, key=lambda p: sum(len(x.get("text", "")) for x in p.get("sourceSpans", [])))
        chosen.append(longest.get("stableId"))
        motion = max(pages, key=lambda p: len(p.get("motionEvents", [])))
        chosen.append(motion.get("stableId"))
    for page in pages:
        mode = page.get("implementationMode")
        if mode == "original" or page.get("mediaContract"):
            chosen.append(page.get("stableId"))
    return list(dict.fromkeys(x for x in chosen if x))


def _planning(root, manifest_path, manifest, require_final=False, check_media=False,
              check_reference_usage=False):
    _, choices = load_references(root)
    script_meta = manifest.get("script")
    if isinstance(script_meta, dict) and isinstance(script_meta.get("path"), str):
        script_path = manifest_path.parent / script_meta["path"]
        script = script_path.read_bytes().decode("utf-8")
    else:
        script = ""
    errors, warnings = validate_storyboard(manifest, script, choices, require_final=require_final)
    errors += validate_scene_guides(root, manifest.get("pages", []), required=True)
    if manifest.get('workflow', {}).get('componentMatching') == 'v1':
        from component_selection import validate_component_plan
        errors += validate_component_plan(manifest.get('pages', []), choices)
    if check_reference_usage:
        errors += validate_reference_usage(manifest, choices, manifest_path.parent, root=root)
    errors += validate_production_contract(manifest, require_explicit=True,
                                           check_media_files=check_media, base=manifest_path.parent)
    from workflow import validate_workflow
    errors += validate_workflow(manifest, "planning", manifest_path.parent)
    return errors, warnings


def _receipt_base(stage, manifest_path, manifest, previous=None):
    return {
        "schemaVersion": 1,
        "gate": stage,
        "manifestPath": str(manifest_path.absolute()),
        "manifestSha256": _sha(manifest_path),
        "durationInFrames": manifest.get("durationInFrames"),
        "timelineFps": manifest.get("timelineFps"),
        "previousReceipt": str(previous.absolute()) if previous else None,
        "previousReceiptSha256": _sha(previous) if previous and previous.is_file() else None,
    }


def _check_previous(previous, manifest_path, expected_gate=None, seen=None):
    seen = set() if seen is None else seen
    path = Path(previous).resolve() if previous else None
    if path in seen:
        return {}, ["Previous receipt chain contains a cycle"]
    try:
        receipt = _read(path, "--previous-receipt")
    except (OSError, ValueError) as error:
        return {}, [f"Cannot read previous receipt: {error}"]
    seen.add(path)
    errors = []
    if receipt.get("status") != "PASS":
        errors.append("Previous gate did not PASS")
    if receipt.get("manifestSha256") != _sha(manifest_path):
        errors.append("Previous receipt belongs to a different Manifest")
    if expected_gate and receipt.get("gate") != expected_gate:
        errors.append(f"Previous receipt must be the {expected_gate} gate")
    if receipt.get("gate") in {"implementation", "representative"}:
        source_dir = receipt.get("sourceDir")
        source = Path(source_dir) if isinstance(source_dir, str) else None
        if not source or not source.is_dir():
            errors.append("Previous receipt sourceDir is missing or unavailable")
        elif receipt.get("sourceTreeSha256") != _tree_sha(source):
            errors.append("Source tree changed after the implementation gate")
    predecessor = {"implementation": "planning", "representative": "implementation"}.get(receipt.get("gate"))
    if predecessor:
        prior = receipt.get("previousReceipt")
        prior_path = Path(prior) if isinstance(prior, str) else None
        if not prior_path or not prior_path.is_file():
            errors.append("Previous receipt chain is missing its predecessor")
        elif receipt.get("previousReceiptSha256") != _sha(prior_path):
            errors.append("Previous receipt chain hash changed")
        else:
            _, prior_errors = _check_previous(prior_path, manifest_path, predecessor, seen)
            errors.extend(prior_errors)
    if receipt.get("gate") == "representative":
        review_path = receipt.get("reviewReceipt")
        review_path = Path(review_path) if isinstance(review_path, str) else None
        if not review_path or not review_path.is_file():
            errors.append("Representative review receipt is missing")
        elif receipt.get("reviewReceiptSha256") != _sha(review_path):
            errors.append("Representative review receipt changed after the gate")
        else:
            # Its media hash must still match; decoding was already performed on
            # these exact bytes at the representative gate.
            manifest = _read(manifest_path, "Manifest")
            _, review_errors = _representative_review(manifest_path, manifest, review_path, decode=False)
            errors.extend(review_errors)
    return receipt, errors


def _representative_review(manifest_path, manifest, review_path, decode=True):
    review = _read(review_path, "--review-receipt")
    errors = []
    if review.get("status") != "PASS":
        errors.append("Representative review receipt is not PASS")
    if review.get("manifestSha256") != _sha(manifest_path):
        errors.append("Representative review belongs to a different Manifest")
    pages = {p.get("stableId"): p for p in manifest.get("pages", [])}
    required = set(_required_scenes(manifest))
    scenes = review.get("scenes", [])
    if not isinstance(scenes, list):
        scenes = []
        errors.append("Representative review scenes must be a list")
    actual = {x.get("stableId") for x in scenes if isinstance(x, dict)}
    missing = required - actual
    if missing:
        errors.append("Representative review is missing scenes: " + ", ".join(sorted(missing)))
    required_checks = ["normalSpeed", "semanticMatch", "readability", "motionOrStableReading", "handoff"]
    inspected = {}
    for item in scenes:
        if not isinstance(item, dict) or item.get("stableId") not in pages:
            errors.append("Representative review contains an unknown scene")
            continue
        sid = item["stableId"]
        checks = item.get("checks", {})
        checks = checks if isinstance(checks, dict) else {}
        for check in required_checks:
            if checks.get(check) is not True:
                errors.append(f"{sid}: representative check {check} must be true")
        artifact = item.get("artifactPath")
        if not isinstance(artifact, str) or not artifact.strip():
            errors.append(f"{sid}: artifactPath is required")
            continue
        path = Path(artifact)
        if not path.is_absolute():
            path = manifest_path.parent / path
        if not path.is_file():
            errors.append(f"{sid}: representative artifact does not exist: {path}")
        elif not isinstance(item.get("artifactSha256"), str) or strip_prefix(item["artifactSha256"], "sha256:") != _sha(path):
            errors.append(f"{sid}: representative artifact hash is missing or incorrect")
        else:
            if path not in inspected:
                inspected[path] = _inspect_video(path, decode=decode)
            metadata, video_errors = inspected[path]
            errors.extend(f"{sid}: {error}" for error in video_errors)
            errors.extend(_review_observations(item, pages[sid], manifest, metadata))
    return review, errors


def _number(value):
    try:
        result = float(Fraction(str(value)))
    except (ValueError, TypeError, ZeroDivisionError):
        return None
    return result if math.isfinite(result) else None


def _inspect_video(video, decode=True):
    command = ["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(video)]
    try:
        result = subprocess.run(command, capture_output=True, text=True)
    except OSError as error:
        return {}, [f"ffprobe unavailable: {error}"]
    if result.returncode:
        return {}, ["ffprobe failed: " + result.stderr.strip()]
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError as error:
        return {}, ["ffprobe returned invalid JSON: " + str(error)]
    streams = [x for x in data.get("streams", []) if x.get("codec_type") == "video"
               and not x.get("disposition", {}).get("attached_pic")]
    errors = []
    if not streams:
        errors.append("Artifact has no video stream")
    stream = streams[0] if streams else {}
    duration = _number(stream.get("duration")) or _number(data.get("format", {}).get("duration"))
    if not duration or duration <= 0:
        errors.append("Artifact has no positive video duration; keyframes belong in keyframeReview")
    format_name = data.get("format", {}).get("format_name", "")
    if "image2" in format_name or format_name.endswith("_pipe") or format_name == "gif":
        errors.append("A still image or image sequence cannot serve as a normalSpeed video review")
    metadata = {"width": stream.get("width"), "height": stream.get("height"),
                "fps": _number(stream.get("avg_frame_rate")) or _number(stream.get("r_frame_rate")),
                "durationSeconds": duration,
                "hasAudio": any(x.get("codec_type") == "audio" for x in data.get("streams", [])),
                "format": format_name, "fullDecode": False}
    if decode and not errors:
        command = ["ffmpeg", "-hide_banner", "-v", "error", "-xerror", "-err_detect", "explode",
                   "-i", str(video), "-map", "0:v:0", "-map", "0:a?", "-f", "null", "-"]
        try:
            result = subprocess.run(command, capture_output=True, text=True)
            if result.returncode or result.stderr.strip():
                errors.append("Full video/audio decode failed: " + result.stderr.strip())
            else:
                metadata["fullDecode"] = True
        except OSError as error:
            errors.append(f"ffmpeg unavailable for full decode: {error}")
    return metadata, errors


def _review_observations(item, page, manifest, metadata):
    sid = item["stableId"]
    errors = []
    span = item.get("reviewRange", {})
    span = span if isinstance(span, dict) else {}
    start, end = _number(span.get("startSeconds")), _number(span.get("endSeconds"))
    fps = _number(manifest.get("timelineFps"))
    duration = metadata.get("durationSeconds")
    if start is None or end is None or start < 0 or end <= start or not duration or end > duration + 0.001:
        errors.append(f"{sid}: reviewRange must name a valid interval in the actual video")
        return errors
    scene_frames = _number(page.get("durationInFrames"))
    if not fps or fps <= 0 or not scene_frames or scene_frames <= 0:
        errors.append(f"{sid}: representative review needs the Manifest scene duration and fps")
    elif end - start + 1 / fps < scene_frames / fps:
        errors.append(f"{sid}: reviewRange is shorter than the complete scene")
    required = {"semanticMatch", "readability", "motionOrStableReading", "handoff"}
    observed = set()
    observations = item.get("observations", [])
    if not isinstance(observations, list):
        observations = []
    for observation in observations:
        if not isinstance(observation, dict):
            continue
        check, moment, note = observation.get("check"), _number(observation.get("atSeconds")), observation.get("note")
        if check not in required:
            continue
        if moment is None or not start <= moment <= end:
            errors.append(f"{sid}: {check} observation time is outside reviewRange")
        elif not isinstance(note, str) or not note.strip() or note.strip().lower() in {"pass", "ok", "true", "通过", "正常", "已检查"}:
            errors.append(f"{sid}: {check} needs a concrete observation, not a checkmark")
        else:
            observed.add(check)
    for check in sorted(required - observed):
        errors.append(f"{sid}: timed observation for {check} is required")
    return errors


def _formal_spec(metadata, manifest):
    errors = []
    fps, frames = _number(manifest.get("timelineFps")), _number(manifest.get("durationInFrames"))
    if not fps or fps <= 0 or not frames or frames <= 0:
        errors.append("Manifest durationInFrames and timelineFps must be positive")
    else:
        duration = metadata.get("durationSeconds")
        if duration is None or abs(duration - frames / fps) > max(0.002, 0.5 / fps):
            errors.append("Final video duration differs from Manifest durationInFrames / timelineFps")
        if metadata.get("fps") is None or abs(metadata["fps"] - fps) > 0.001:
            errors.append("Final video fps differs from Manifest timelineFps")
    spec = manifest.get("outputSpec", {})
    if not isinstance(spec, dict):
        return errors + ["outputSpec must be an object when declared"]
    for field in ("width", "height", "fps"):
        if field in spec:
            expected, actual = _number(spec[field]), _number(metadata.get(field))
            if not expected or expected <= 0 or actual is None or abs(expected - actual) > 0.001:
                errors.append(f"Final video {field} differs from declared outputSpec")
    audio = spec.get("audio")
    if audio not in {None, "required", "none", "optional"}:
        errors.append("outputSpec.audio must be required, none or optional")
    elif audio == "required" and not metadata.get("hasAudio"):
        errors.append("Final video is missing required audio")
    elif audio == "none" and metadata.get("hasAudio"):
        errors.append("Final video has audio but outputSpec declares none")
    return errors


def _probe(video, manifest=None):
    metadata, errors = _inspect_video(video)
    if manifest is not None:
        errors.extend(_formal_spec(metadata, manifest))
    return errors


def run(args):
    manifest_path = args.manifest.absolute()
    manifest = json.loads(manifest_path.read_text())
    root = project_root(args.project_root)
    errors, warnings = [], []
    previous = Path(args.previous_receipt).absolute() if args.previous_receipt else None
    receipt = _receipt_base(args.stage, manifest_path, manifest, previous)

    if args.stage == "planning":
        errors, warnings = _planning(root, manifest_path, manifest,
                                     require_final=args.require_final_timing,
                                     check_media=False, check_reference_usage=False)
        receipt["requiredRepresentativeScenes"] = _required_scenes(manifest)
    elif args.stage == "implementation":
        _, previous_errors = _check_previous(previous, manifest_path, "planning")
        errors.extend(previous_errors)
        errors.extend(_planning(root, manifest_path, manifest,
                                require_final=args.require_final_timing,
                                check_media=True, check_reference_usage=True)[0])
        if not args.source_dir:
            errors.append("--source-dir is required for the implementation gate")
        else:
            clock_errors, clock_warnings = lint_clock(args.source_dir, multi_scene=len(manifest.get("pages", [])) > 1)
            errors.extend(clock_errors)
            warnings.extend(clock_warnings)
            receipt["sourceDir"] = str(Path(args.source_dir).resolve())
            receipt["sourceTreeSha256"] = _tree_sha(args.source_dir)
        receipt["requiredRepresentativeScenes"] = _required_scenes(manifest)
    elif args.stage == "representative":
        prior, previous_errors = _check_previous(previous, manifest_path, "implementation")
        errors.extend(previous_errors)
        from workflow import validate_workflow
        errors.extend(validate_workflow(manifest, "representative", manifest_path.parent))
        _, review_errors = _representative_review(manifest_path, manifest, args.review_receipt)
        errors.extend(review_errors)
        receipt["requiredRepresentativeScenes"] = _required_scenes(manifest)
        receipt["reviewReceipt"] = str(Path(args.review_receipt).absolute())
        receipt["reviewReceiptSha256"] = _sha(Path(args.review_receipt))
        receipt["sourceDir"] = prior.get("sourceDir")
        receipt["sourceTreeSha256"] = prior.get("sourceTreeSha256")
    elif args.stage == "formal":
        prior, previous_errors = _check_previous(previous, manifest_path, "representative")
        errors.extend(previous_errors)
        receipt["sourceDir"] = prior.get("sourceDir")
        receipt["sourceTreeSha256"] = prior.get("sourceTreeSha256")
        if not args.video or not args.video.is_file():
            errors.append("--video is required and must point to the final rendered file")
        else:
            metadata, video_errors = _inspect_video(args.video)
            errors.extend(video_errors)
            errors.extend(_formal_spec(metadata, manifest))
            receipt["videoMetadata"] = metadata
            receipt["outputSpec"] = manifest.get("outputSpec", {})
            if not video_errors:
                dynamic = scan_dynamic(args.video, manifest)
                receipt["dynamicScan"] = dynamic
                errors.extend(dynamic.get("errors", []))
            receipt["videoPath"] = str(args.video.absolute())
            receipt["videoSha256"] = _sha(args.video)
    else:
        raise ValueError("Unsupported stage")

    receipt["status"] = "PASS" if not errors else "FAIL"
    receipt["errors"] = errors
    receipt["warnings"] = warnings
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=["planning", "implementation", "representative", "formal"], required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--project-root")
    parser.add_argument("--source-dir")
    parser.add_argument("--previous-receipt")
    parser.add_argument("--review-receipt")
    parser.add_argument("--video", type=Path)
    parser.add_argument("--require-final-timing", action="store_true")
    parser.add_argument("--receipt-out", type=Path, required=True)
    args = parser.parse_args()
    if args.stage != "planning" and not args.previous_receipt:
        parser.error("--previous-receipt is required after the planning gate")
    if args.stage == "representative" and not args.review_receipt:
        parser.error("--review-receipt is required for the representative gate")
    result = run(args)
    payload = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    args.receipt_out.parent.mkdir(parents=True, exist_ok=True)
    args.receipt_out.write_text(payload)
    print(payload, end="")
    raise SystemExit(result["status"] != "PASS")


if __name__ == "__main__":
    main()
