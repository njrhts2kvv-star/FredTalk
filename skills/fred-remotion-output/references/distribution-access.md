# Component download access

The generic FredTalk Skill remains public. Catalog visibility, NEW/archive status, source availability and download rights are separate facts. Before selecting a component for executable animation, verify that its actual source and dependencies are installed. A visible preview does not prove source availability.

## Public repository users

Public components and NMC01 continue through GitHub. Use `python3 scripts/assets.py download` from the repository root for public packs.

For a current early-access batch, the default first-use flow is **website login → download the original source ZIP → hand the ZIP or its local path to Codex**. Do not ask this user to configure a token. Read the current public Skill, then run:

If the existing workspace lacks the public repository import tool, obtain the latest public FredTalk checkout in a separate directory and import there. Do not force pull over a working checkout or overwrite the local owner production sources.

```bash
python3 scripts/assets.py import --zip "/absolute/path/to/source.zip"
python3 scripts/catalog.py --id <exact-component-id> --full
```

The import recognizes complete official packages by exact size and SHA-256 using `library/member-packages.json`, keeps the original ZIP unchanged, and reuses the safe installer under `.artifacts/member-components/`. It does not read credentials, make network requests or run package code. Multiple `--zip` inputs or one directory of ZIPs are supported; use only the provided paths and do not search unrelated directories. Current catalog bindings already point to the isolated installation, so verify actual `sourceAvailability: ready` before selecting the component. No catalog rewrite or new visual approval is implied.

If the user supplied a production task, continue with their script, recording and assets under the normal Skill. If no task was supplied, only import and list the available component IDs and source locations. Do not infer a video task or run package scripts automatically.

A read-only Agent token at https://www.fred-fu.com/visual-library/access remains an **advanced optional** route for automatic downloads. Use `scripts/assets.py download --members` followed by `materialize --members` only when automatic website downloading is required. Follow `docs/assets.md` for private token configuration. Never print tokens, include them in prompts or commit/package them. A visible source directory that has not been installed and verified remains needs-auth/missing; import the downloaded official ZIP or select an available public alternative.

The five 2026-10-12 native/wave batches have a common official early-access window: 2026-10-13T03:15:00.000Z to 2026-10-27T03:15:00.000Z (Beijing 11:15), exactly 14 days. The website checks current account status and membership on every protected request. Revoked/expired tokens and expired/revoked membership stop new restricted downloads. At the deadline, the backend opens these downloads anonymously. The public 720p preview is a separate derivative; original approved media identity and source hashes stay intact.

## Fred's local production workspace

Keep existing local source paths and approved media. Do not replace local source with a remote URL, mark installed owner source unavailable, or remove it to enforce the website policy. Publication receipts record historical distribution separately from current official download policy.

## Future batches

Start with source, original videos and ZIPs in private storage. Publish only catalog, posters and distinct lightweight previews during early access. Set a batch start and a deadline exactly 14 days later, and apply the same server-side access checks to all source/original download paths. Do not put restricted bytes in public Git commits, tags, archives, release assets, public folders or client bundles. After the deadline, website downloads open automatically; a public GitHub pack can be published after hash/license verification.

Previously public Git history, tags and independently downloaded MIT source copies remain available and retain their granted rights. This policy changes current official download channels; it cannot recall those copies or revoke existing MIT grants. Member downloads also cannot prevent a recipient from retaining files already obtained.
