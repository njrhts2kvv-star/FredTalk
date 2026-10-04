# Asset distribution / 素材分发

The original local Skill directory was approximately 43 GB. Before privacy exclusions, this export identified about 699 MB of preview-related files and 5.85 GB of unique binary dependencies across current projects. Exact downloadable sizes and status are in `library/releases.json` and `scripts/assets.py status`.

## Why Git plus release packs?

Git tracks source, instructions, manifests and the small demo. Large media is delivered through assets attached to a release of the **same public repository**. Published packs are publicly accessible; `gh` uses the user's normal login when required by the download tool. No credential is embedded in a manifest or URL.

This avoids large binary Git history and makes the full media download optional. It does not require a running cloud VM or paid Git LFS storage.

## Commands

```bash
python3 scripts/assets.py status
python3 scripts/assets.py download
python3 scripts/assets.py verify
python3 scripts/assets.py materialize --project components/projects/PROJECT_ID
```

Find the exact project directory with `python3 scripts/catalog.py --id SP024 --full`. Replace `PROJECT_ID` with the reported directory name.

The current release declares 45 logical packs in 67 downloadable files. Multipart packs are assembled automatically; both part hashes and the combined hash are validated. Read `library/releases.json` for the current release identity and sizes.

The installer validates the release pack hash, every object hash, object size and archive member name. It rejects directories, links and unexpected members. Downloaded archives are removed after successful extraction. Re-running the download can re-fetch packs; keep sufficient temporary disk space.

`materialize` creates independent file copies and refuses to overwrite modified files. Deduplicated objects stay immutable. Materialize one project at a time to control disk usage.

## Privacy exclusions

A record whose status is `quarantined` is deliberately absent from the package. Its logical path remains visible so a project does not silently substitute unrelated media. Such a scene may need a replacement input before rendering. See the privacy report and per-reference `assetAvailability` metadata.

Excluding a source dependency does not necessarily exclude its safe final preview: the dependency may belong to another composition or never appear in the selected interval. Conversely, a preview with a privacy finding is unavailable until a separately reviewed replacement is provided.

## Offline and future hosting

The local server reads installed objects directly. Once npm dependencies and media have been downloaded, preview browsing does not require the author's computer or server. Production integrations can require their own online services.

A future CDN can serve the same hash-addressed objects. Keep download manifests stable and provide an offline package even if an online demo is added.
