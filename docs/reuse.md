# Reusing scenes / 复用场景

1. Search by the sentence's purpose, objects and action. Inspect the actual preview.
2. Read the reference's `reusability` and `implementation` fields. A snapshot can be useful without being a general parameter API.
3. Identify the reported project and its registered composition. `compositionId: null` means this export has not asserted a registration mapping; inspect its entry point.
4. Download reviewed media and materialize only that project. Inspect `assetAvailability`; quarantined dependencies require your own safe replacements.
5. Copy the project to a new working directory. Install its declared dependencies using its lockfile. Do not reuse the frontend's node_modules as a universal runtime.
6. Adapt actual text, media, timing and layout. Use a current Manifest and the Skill's scene guidance.
7. Review real-content keyframes, then motion, audio and seams. Render only after the relevant checks pass.

## Portable tooling

```bash
python3 skills/fred-remotion-output/scripts/scene.py --list
python3 skills/fred-remotion-output/scripts/references.py --id SP024 --full
python3 skills/fred-remotion-output/scripts/validate_storyboard.py --help
python3 skills/fred-remotion-output/scripts/workflow.py --help
```

The main Skill's production contracts are preserved. Historical importers, dependency verifiers and receipt checks are retained as reference implementations; they may depend on source-local catalog schemas, original hashes or unavailable historical assets. They are not all asserted to be runnable against this sanitized distribution. Portable catalog searching is explicitly routed through `scripts/catalog.py`.

## What the export does not approve

Sanitization creates derivative source records. A hash of an original project is provenance, not a checksum of its sanitized counterpart. The export does not assert pixel parity, full parameterization, every snapshot's clean render, or visual approval for your new content.

Source public directories can include unused branches. A missing quarantined file might affect only those branches; check the chosen composition's actual dependency paths. Never suppress a missing-file error and report the render as verified.

## Audio

The visual-library preview remains silent. Raw narration is excluded. When a source composition expects narration, supply your own recording and align its cues. Sound effects and music require their own licensing and input decisions.
