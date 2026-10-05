# Architecture / 架构

FredTalk separates instructions, catalog metadata, source snapshots and binary assets.

- **Skill:** `skills/fred-remotion-output/` contains production guidance, scene rules, manifests and validation tools.
- **Catalog:** `library/catalog.json` is the portable database for the 184 active references. It is JSON, not an online database service. `history.json` preserves the 288 old identities without reactivating removed references or exporting private review notes.
- **Source:** `components/projects/` holds independent source snapshots. A reference may map to more than one source file; one project may serve many references. Sanitized derivatives have new identities and do not inherit original byte-level approval claims.
- **Media:** `media-manifest.json` maps logical paths to reviewed content hashes. Git contains a small demo; the optional private release holds deduplicated objects. The server resolves objects without creating duplicate copies.
- **Frontend:** `apps/library/` is the current React visual browser, including the five navigation sections and purpose-based scenarios. `library_server.py` exposes only declared assets and source routes, plus local review storage.

## Local and hosted use

克隆后可直接检索目录和阅读源码，安装前端依赖后可浏览示例。下载素材包后，可在本地浏览已通过隐私检查的媒体。只在需要改编工程时还原其 public 素材目录。

A future hosted deployment should use static frontend hosting plus object storage/CDN for preview media. Keep source-project assets as optional downloads. Hosting is an additional convenience, not a dependency of offline use.

私有阶段的网站和对象存储必须有独立访问控制。不要把长期访问密钥写进前端，也不要把私人 Release 的下载凭证放入网页。公开部署与仓库公开必须分别检查。

## Source project execution

Remotion dependencies are pinned per source project. The portable library's React dependencies are not a replacement for every project's runtime. Do not upgrade all projects to one Remotion version merely to simplify installation.

The export does not include node_modules, cloud credentials, old Git objects, original recordings, or private episode workspaces. It is a reusable distribution, not a bit-for-bit backup of the author's working directory.
