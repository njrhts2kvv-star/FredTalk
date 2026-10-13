# Component download access

The generic FredTalk Skill remains public. Catalog visibility, NEW/archive status, source availability and download rights are separate facts. Before selecting a component for executable animation, verify that its actual source and dependencies are installed. A visible preview does not prove source availability.

## Public repository users

Public components and NMC01 continue through GitHub. Use `python3 scripts/assets.py download` from the repository root for public packs. For a current early-access batch, an active `exclusive_group` member can create a read-only Agent token at https://www.fred-fu.com/visual-library/access and use the repository's `scripts/assets.py download --members` followed by `scripts/assets.py materialize --members`. Follow `docs/assets.md` for the private token file and exact collection option. Do not print tokens, put them in prompts, commit them, or include them in packages. An unavailable source must remain needs-auth/missing; select an available public alternative or install the verified package before implementation.

The five 2026-10-12 native/wave batches have a common official early-access window: 2026-10-13T03:15:00.000Z to 2026-11-12T03:15:00.000Z (Beijing 11:15), exactly 30 days. The website checks current account status and membership on every protected request. Revoked/expired tokens and expired/revoked membership stop new restricted downloads. At the deadline, the backend opens these downloads anonymously. The public 720p preview is a separate derivative; original approved media identity and source hashes stay intact.

## Fred's local production workspace

Keep existing local source paths and approved media. Do not replace local source with a remote URL, mark installed owner source unavailable, or remove it to enforce the website policy. Publication receipts record historical distribution separately from current official download policy.

## Future batches

Start with source, original videos and ZIPs in private storage. Publish only catalog, posters and distinct lightweight previews during early access. Set a batch start and a deadline exactly 30 days later, and apply the same server-side access checks to all source/original download paths. Do not put restricted bytes in public Git commits, tags, archives, release assets, public folders or client bundles. After the deadline, website downloads open automatically; a public GitHub pack can be published after hash/license verification.

Previously public Git history, tags and independently downloaded MIT source copies remain available and retain their granted rights. This policy changes current official download channels; it cannot recall those copies or revoke existing MIT grants. Member downloads also cannot prevent a recipient from retaining files already obtained.
