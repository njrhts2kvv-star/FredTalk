<div align="center">

# FredTalk 2.0

### Turn a narration script into a motion video with Codex.

Video production Skill · Searchable visual library · Keyframe and audio review

[**Browse the visual library ↗**](https://www.fred-fu.com/visual-library) · [Quick start](#quick-start) · [Use the Skill](#use-the-skill) · [简体中文](README.md)

</div>

FredTalk is a workflow developed through everyday video production. Give an agent your script, recording and media, then let it choose visuals, adapt components, produce keyframes and assemble the video.

Browse the examples online, or download the repository and ask Codex or another coding agent to read the Skill and help create your own video.

## Version 2.0 · 2026-10-13

- Fixed the component lookup path and expanded everyday Chinese terms for data, prices, key points, code and terminal scenes.
- Rotate source batches within equally relevant results so newer components reach the shortlist.
- Require a concrete selected/rejected reason for the current top three candidates in every scene. The delivery gate recomputes the list.
- Add episode assembly rules for screen focus, shared objects, reading holds, repetition, motion review, sound cues and music muting during source-audio appreciation.
- Provide resumable uploads, bounded chunk retries, separate narration and sound rendering, mix peak protection and encoded AAC verification.

This release adds **106 GitHub components**; the online library adds **105**, since its news keyword match-cut was already published. New cards appear first with **NEW**. **114 archived cards** remain in a collapsed section at the bottom.

[Release notes](docs/releases/2.0.md) · [Download 2.0 assets](https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v2.0.0)

## Visual previews

Choose visuals for emphasis, explanations, screen focus and work showcases. The [online visual library](https://www.fred-fu.com/visual-library) provides playable previews, scenario filters and source code.

<table>
<tr><td width="25%"><img src="docs/assets/T05h.jpg" alt="一次性拷贝 vs 持续同步" width="240"><br><sub>T05h · 一次性拷贝 vs 持续同步</sub></td><td width="25%"><img src="docs/assets/T15e.jpg" alt="折线走势" width="240"><br><sub>T15e · 折线走势</sub></td><td width="25%"><img src="docs/assets/T17b.jpg" alt="终端运行：命令执行、输出滚动、结果行点亮" width="240"><br><sub>T17b · 终端运行：命令执行、输出滚动、结果行点亮</sub></td><td width="25%"><img src="docs/assets/T03e.jpg" alt="步骤折行串起" width="240"><br><sub>T03e · 步骤折行串起</sub></td></tr>
<tr><td width="25%"><img src="docs/assets/T08i.jpg" alt="毛玻璃要点卡" width="240"><br><sub>T08i · 毛玻璃要点卡</sub></td><td width="25%"><img src="docs/assets/T10a.jpg" alt="长回复拎要点" width="240"><br><sub>T10a · 长回复拎要点</sub></td><td width="25%"><img src="docs/assets/T09l.jpg" alt="复制地址交给 AI" width="240"><br><sub>T09l · 复制地址交给 AI</sub></td><td width="25%"><img src="docs/assets/T14c.jpg" alt="价格落定：数字逐位滚动，旧价划掉，差额亮出" width="240"><br><sub>T14c · 价格落定：数字逐位滚动，旧价划掉，差额亮出</sub></td></tr>
</table>

## What you can do

- **Choose visuals by meaning**: Match each line of narration to text, workflows, comparisons, devices, screen recordings or showcases.
- **Adapt them to your content**: Replace text and media, then adjust layout, motion and narration timing in the component source.
- **Review before rendering**: Check real-content keyframes, follow them with audio and record feedback scene by scene.
- **Produce a video**: Assemble visuals with Remotion, review motion, sound and transitions, then export the result.
- **Prepare audio and subtitles**: Use the optional roughcut Skill to edit recordings, correct subtitles and review cut points.

## Make a video

| ① Prepare content | ② Review visuals | ③ Export the video |
| :--- | :--- | :--- |
| Provide a script, recording and images or screen captures | The agent proposes scenes, selects library components and creates real-content keyframes | Apply feedback, check motion, sound and transitions, then render the full video |

Revise individual scenes or continue with a plan you have already approved.

## Quick start

**Want to see the examples first?** Open the [online visual library](https://www.fred-fu.com/visual-library). No installation required.

**Want to work locally?** Install Python 3.11+, Node.js 22+, npm and Git:

```bash
git clone https://github.com/njrhts2kvv-star/FredTalk.git
cd FredTalk
cd apps/library
npm ci
npm run build
cd ../..
python3 scripts/library_server.py
```

Open [http://127.0.0.1:3061/design/](http://127.0.0.1:3061/design/). If the port is busy, add `--port 3063`.

### Download previews and media

The [five daily font families](library/fonts/README.md) and a few examples are bundled directly with the repository. Fonts work after cloning, without downloading release packs. Full previews and other production media are available through Releases. Check the package sizes before installing:

```bash
python3 scripts/assets.py status
python3 scripts/assets.py download
python3 scripts/assets.py verify
python3 scripts/assets.py materialize
```

The downloader requires the [GitHub CLI](https://cli.github.com/). See [asset installation](docs/assets.md) for more options.

## Use the Skill

Ask Codex or another coding agent to read [`skills/fred-remotion-output/SKILL.md`](skills/fred-remotion-output/SKILL.md) inside your downloaded repository. Keep the repository structure so the agent can find its components, media and tools.

Start with this prompt:

> Read `skills/fred-remotion-output/SKILL.md`. Here are my script, recording and media. Choose suitable components from the visual library for each section, show the references and explain your choices. Once the direction is settled, create real-content keyframes for review, then continue producing the video.

For audio and subtitle preparation, use [`audio-subtitle-roughcut`](skills/audio-subtitle-roughcut/SKILL.md).

### Find a component by purpose

```bash
python3 scripts/catalog.py --use explain --query "流程" --limit 3
python3 scripts/catalog.py --id SP024 --full
```

Results include previews, source locations and usage notes. See the [source usage guide](docs/reuse.md) for adaptation instructions.

## More documentation

[Asset installation](docs/assets.md) · [Source usage](docs/reuse.md) · [Architecture](docs/architecture.md) · [Contributing](CONTRIBUTING.md)

## License

FredTalk first-party code, Skills, templates and documentation are licensed under the [MIT License](LICENSE). Commercial use, modification and redistribution are permitted, subject to retaining the copyright and license notice.

Third-party code, reference-derived project snapshots, fonts, sound effects, images, recordings, videos and branding retain their own licenses or permissions. See [License scope](docs/license-scope.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
