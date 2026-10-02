# EP107 Selected Scene Components

Five exact excerpts from the final EP107 V3-R7 film are preserved with independent
Remotion compositions at 3840x2160 / 60fps. These are accepted scene components,
not a generic text/geometry API tested with arbitrary content.

| Component | Original interval | Main implementation |
| --- | --- | --- |
| `EP107CardsToQuestion` | 9-12s | `src/R7OpeningMotion.tsx` |
| `EP107SupportToEvidence` | 48-50s | `src/R6EarlyMotion.tsx`, `src/Scene.tsx`, original media overlay |
| `EP107VersionComparison` | 73-80s | `src/R6MidMotion.tsx` |
| `EP107CapabilitiesMerge` | 172-179s | `src/R6LateMotion.tsx` |
| `EP107ConclusionToReasons` | 183-187s | `src/R7LateMotion.tsx` |

`src/index.tsx`, the other original source files, `manifest.json`, `public/`, and
the package/lockfile remain byte-identical to the final episode snapshot.
`src/ApprovedEpisode.tsx` is a separate derived replay entry: it removes the old
composition registration, exports `FilmScaled`, and adds `includeNarration`.
`LibraryClips.tsx` shifts the original clock without resetting in-progress media,
fonts, source frames, cues, subtitles, or the 48-50s scene handoff.

The five exported MP4s include original narration and burned-in subtitles. AAC
was re-encoded only for the independent excerpts; the final episode is untouched.
The replay compositions default to `includeNarration: true`; use false to omit
the voice track. This does not mute a source video with its own audio.

```bash
node source/render.cjs list
node source/render.cjs render EP107VersionComparison /absolute/output.mp4
```

Run from the project-local bundle or after copying it into a new episode inside
the same FredTalk project. Runtime resolution uses the local
`skills/_runtime/remotion/preferred-motion-v2` (Remotion 4.0.473 / React 19.2.4),
not the original episode or an external cache. No node_modules copy is needed.

For a new episode, edit the copied scene code, assets, `manifest.json` cues and
subtitles together. Recheck longest text, readable states, movement, media clocks
and adjacent handoffs. Approval covers only the five declared R7 intervals.
