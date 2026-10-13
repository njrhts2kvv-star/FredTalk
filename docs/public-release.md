# Before making the repository public / 公开前检查

This is a release boundary, not a claim that it has passed.

- [ ] Review code and documentation changes after the sanitized private export.
- [ ] Re-run secret scanning over the actual Git history and release files.
- [ ] Resolve quarantined media; review complete playback of public demonstration videos, including short transitions and small UI text.
- [ ] Confirm licenses for fonts, third-party code, reference videos, screenshots, logos, music and sound effects. Replace or omit material without redistribution rights.
- [x] Owner authorized MIT for FredTalk first-party code, Skills, templates and documentation on 2026-10-13; distinct third-party and media terms are documented in [License scope](license-scope.md).
- [ ] Test a clean clone with only the published documentation and downloadable media.
- [ ] Verify the per-project dependency and runtime instructions for the examples that will be advertised as reproducible.
- [ ] Confirm the privacy of any separate website, object store, CDN and logs. GitHub visibility does not control those systems.
- [x] Owner explicitly authorized public repository access on 2026-10-04.

The owner authorized public visibility on 2026-10-04. This authorization does not mark every rights-review item above as completed or grant a blanket open-source/media license. The historical 2026-10-04 release of 38 material replacements was published; the superseded media package release remains a draft backup. A targeted scan of 1,821 Git-history blobs found no private key headers or supported AWS, GitHub and OpenAI credential formats. Current release files match verified hashes.

On 2026-10-13, the owner separately authorized the root MIT license for first-party code and documentation. This also covers the first-party portions of FredTalk 2.0; it does not change third-party licenses or mark the remaining review items as completed.
