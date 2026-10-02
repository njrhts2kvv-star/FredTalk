# Contributing

This is currently a private review project.

- Describe the reference ID, exact source project and concrete behavior you changed.
- Keep instructions, source and media metadata in sync.
- Never add credentials, account screenshots, local reviews, personal recordings, node_modules or nested Git repositories.
- Preserve attribution and document reuse limits. Do not label a snapshot as a parameter component without validating its real interface.
- Add meaningful checks for changed behavior; run the portable tests and frontend build.
- Copy frozen source before adapting it. Do not overwrite a reference solely to make a new example fit.

Use focused commits and explain validation in pull requests. Media additions require privacy and licensing review before entering a release pack.

CI configuration is provided as `docs/ci-checks.example.yml`. It is not active: the export used a GitHub CLI login without workflow-management scope. A maintainer can enable it later with appropriate permissions. Local tests and build have been run independently.
