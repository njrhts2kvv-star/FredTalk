# Privacy review / 脱敏检查

This report records the initial 2026-10-02 export review. Its scan counts are historical evidence, not the current inventory or a guarantee about every frame. The repository became public by the owner's decision on 2026-10-04; the material replacement revision is described in [material-replacement.md](material-replacement.md).

## Initial export scope (2026-10-02)

- 184 active reference records; five preview entries are quarantined: 103-02, 99-13, N031, SP013, X029.
- 8,187 unique image files scanned with on-device text recognition.
- 414 videos sampled at 2 frames per second; 7,350 sampled frames scanned. OCR failures: 0.
- 482 unique original media objects were conservatively quarantined after potential account, contact, private link or local-path findings. Some may be false positives; none is silently treated as safe.
- 961 logical source/preview paths refer to quarantined inputs. Shared snapshots can include unused branches, so this is not a count of broken compositions.
- 8159 reviewed binary objects, totaling 5,383,791,308 bytes, are eligible for the initial media pack.
- All 399 unique distributed video objects were probed after packaging preparation; none contains an audio stream.
- 15,660,834 bytes of reviewed cover images and four simple silent examples are bundled in Git.

## Applied changes

Credentials and personal paths are excluded or replaced in text. Nested Git histories, redundant archives, raw narration, local review stores and historical import/audit jobs are excluded. Images have textual/EXIF metadata removed where supported; video containers are remuxed without audio or copied metadata. Binary objects are checked for known owner-path/account strings and credential-like patterns.

The public Skill entry uses catalog-based production instructions. Historical snapshots previously retained some reference titles and private source locators; the 2026-10-04 metadata repair removes those non-runtime locators from the current public tree while preserving stable IDs, technical timing and hashes. This does not change authorship or erase Git history. The entry is rewritten around this repository's catalog, project paths, optional media and validation steps. FredTalk branding and illustrative characters are retained by the owner's choice. Required third-party license notices remain distinct from production instructions.

The text secret scan uses Gitleaks 8.30.1; generated dependency directories and local object stores are excluded from that text pass and handled separately. The final source scan found no credential matches. Only actual distribution paths are included in the release manifest; original local locations and raw OCR findings remain outside the repository.

## What this review does not prove

OCR can miss small, blurred, stylized or very short-lived text. A 2 fps sample is not inspection of every video frame. This pass does not establish rights to redistribute reference media, fonts or third-party code, nor does it prove every historical scene can be rendered from arbitrary input.

Quarantined media is absent from both Git and the outgoing asset packs. Source code may still reference an excluded input; the per-reference `assetAvailability` summary and manifest make that boundary explicit. Supply a safe replacement and perform a new review before re-enabling it.

The repository is public by the owner's explicit decision. That decision does not mark every licensing or playback review item complete. Keep the quarantine enforced and verify each new source/media release against its current manifests. See [public-release.md](public-release.md).

## Validation incident

An initial phone-number redaction pattern matched numeric substrings inside some cryptographic identifiers. Packaging stopped at a missing-hash check. The affected identifiers were restored and all 22,724 media paths were independently rehashed from their source files before deriving the final sanitized-object manifest. No affected package was uploaded.
