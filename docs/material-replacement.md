# Material replacement revision

The local source revision `20261004-material-replacements` replaces embedded reference media with user-authorized episode 102 and episode 108 materials. It covers 38 audit entries across 12 isolated portable source projects. The other 139 catalog entries retain their original sources and previews. V086 already uses verified Fred material and does not require a fresh render.

## What changed

- Each source project has `material-bindings.json` and `material-policy.tsx`. These route static and frame-indexed media calls to the approved material namespace while retaining the existing carrier geometry and motion tracks.
- The media pool contains four episode 102 asset images, five episode 108 character clips, five stills extracted from those clips, one episode 102 cloud/phoenix clip, and five authored SVG demo surfaces.
- Approved source streams retain their frame identity and frame rate. Five documented 1080p render copies are used for efficient 1080p output; original 4K sources remain available and unchanged. Audio is removed. Replacement clips loop inside the existing carrier clock when needed.
- The SP replay entry no longer exposes an original-source-audio option. Report text/data now uses explicitly synthetic demonstration content rather than unverified research claims.
- Withdrawn source media is marked `quarantined` in the dependency manifest. Originals are retained privately and cannot be materialized through the public asset installer. The binding table retains old paths only as internal lookup keys; it does not serve their payloads.
- Every actual public root has its own approved dependency records, including the nested source project used by R033.

## Current delivery state

All 38 affected previews have been rerendered at 1920×1080 with their native 30/60 fps, together with current posters and core frames. Each output passed complete decoding, frame-count and audio-track checks. The assistant inspected five moments per output against the retained reference sequences; browser playback advanced and tail seeking passed for all 38. This is sampled visual review, not a claim of continuous aesthetic review of every frame. Accurate source calls passed the component delivery gate. The other 139 entries and five unavailable entries are preserved. The owner authorized public repository access on 2026-10-04; this does not grant a blanket downstream media license.

The previous media release is intentionally superseded. `assets.py download` rejects a pack unless its `manifestSha256` matches the current manifest. This prevents old or incomplete packs from being installed with the new source. Rebuild packs and update the release manifest before publishing; do not copy the current hash into an old release descriptor.

New binaries are installed in the local object store and project public directories; they are excluded from ordinary Git commits. A source-only Git push does not deliver these binaries to another machine.

Before publication:

1. Materialize the current manifest and render affected previews/posters.
2. Inspect real outputs for framing, clipping, continuity, text, source identifiers, and sound. Compilation is not visual acceptance.
3. Generate minimal current media packs, verify all object hashes, and write their matching manifest hash.
4. Publish source, previews, media packs, and website catalog together.

User authorization to reuse these materials does not itself grant downstream users a general copyright license. Keep any required third-party notices. Private source paths and source receipts remain in the local replacement audit, outside this repository.

## Checks

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/test_material_resolver.cjs tests/test_review_timeline.cjs
python3 scripts/assets.py verify
python3 scripts/check_public_text.py --pattern "$OBSOLETE_AUTHOR_PATTERN"
```

The Node resolver test requires the existing `apps/library` development dependencies. No new package dependency was added for this revision.
