# Fred / Library selected remakes v2

This is the editable production project, not a completed visual acceptance certificate.
All 54 composition IDs remain registered. N052 is deferred at the user's request;
new character generation is stopped. The other 53 clips remain in scope, including
clips that reuse existing Fred character media.
Existing v1 outputs and original selections/review notes remain separate.

## Runtime

Node.js 22 or a compatible current Node runtime, npm, Python 3, FFmpeg/ffprobe.
Remotion 4.0.473 and React 19.2.4 are pinned in package-lock.json.

```bash
npm ci --no-audit --no-fund
npm run typecheck
npm run compositions
npm run studio
npm run render -- N005
python3 scripts/technical-review.py N005
```

Every composition is 1920 x 1080, 60 fps. The render script produces silent H.264
MP4 files under outputs/; it does not create 4K outputs. With videos, use the
project's verified backend and concurrency rather than maximizing concurrency.

The working checkout may have a node_modules symlink for local convenience.
A source delivery must exclude node_modules and use npm ci from this lockfile.
No remote server path or temporary directory is required by composition code.

## Parameters

The registered defaultProps contain an id and overrides object. Overrides support
words, assets, accent, highlightWords and actorFraming. Actual usage varies by
independent clip; inspect its component and timeline before substituting content.
Media paths passed to staticFile are relative to public/.

```json
{"id": "N002", "overrides": {"words": ["教程视频能不能做", "工具演示能不能做", "知识点视频能不能做", "产品介绍能不能做", "口播视频能不能做", "直播视频能不能做"], "accent": "#8554E8"}}
```

For custom props with the Remotion CLI:

```bash
npx remotion render src/index.tsx N002 outputs/N002-custom.mp4 --props=examples/N002.json --codec=h264 --muted
```

Do not change line counts or object counts without rechecking layout. Replacing
Fred text/media is permitted; container geometry, object timing and camera
relationships still need reference-based review.

## Structure and evidence

- src/index.tsx registers the 54 compositions from manifest.json.
- src/BatchA.tsx, BatchB.tsx and BatchC.tsx route independent implementations.
- src/calibration-* and src/timelines contain measured animation implementations.
- public/ contains local media and font files; fonts.ts controls font loading.
- analysis/ and qc/ retain measurements, residual differences and checks.
- state/production.json records scope/deferred work; original choices are frozen.
- web/ is the v2 comparison frontend served by the sibling review project.
- snapshots/ contains immutable render inputs and per-file SHA256 manifests.

For an immutable render snapshot, run:

```bash
python3 scripts/freeze-snapshot.py snapshots/unique-name
cd snapshots/unique-name
python3 scripts/verify-snapshot.py
```

Technical review checks full decode, dimensions, fps, exact frame count and all
presentation timestamps. It does NOT grant fidelity, dynamic viewing or user
acceptance. Acceptance records are valid only for the exact video SHA256.
Unresolved display fonts and unreviewed motions remain pending even if rendering
succeeds. Font candidates are not all final approved delivery fonts; license
review and pruning remain a delivery prerequisite.

The comparison frontend exposes reference/v1/v2, overlay/blink/difference,
frame stepping, native-size ROI and independent v2 comments. User notes must not
be overwritten or automatically marked resolved.

## Current delivery status

All 53 active clips now have local 1920x1080, 60fps MP4 outputs; N052 remains
deferred. The latest user instruction is to produce all clips first, then perform
consolidated review and targeted rerenders. The frontend marks first-pass clips
separately. Current hash-bound QC records describe the actual review boundary;
complete internal per-frame visual and normal-speed viewing acceptance is still
pending. The user has now given overall positive feedback after viewing the frontend
and requested only N030 (text weight and frame) and X050 (text size) revisions.
Other published videos are frozen; unpublished experiments remain archived.

The delivery/ folder contains the standalone editable source package after the
build-delivery script runs. Refer to its build-receipt and runtime verification
for dependency installation, composition registration and representative rendering
evidence. A package or successful render is not visual acceptance.
