# Security

Do not post credentials, sensitive screenshots or personal data in issues. Report a suspected exposure privately to the repository owner through an existing trusted channel. If a live credential is exposed, revoke it before rewriting history.

The local server listens only on 127.0.0.1. It is not a production authentication gateway. Do not expose it directly to the internet.

GitHub CLI authentication remains outside this repository. The project contains no service credentials. Local user review notes are ignored under `.local/`.

See `docs/privacy.md` for the scope and limitations of the export audit.
