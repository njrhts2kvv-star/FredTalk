# Library self-pick 24 / revision04

`src/library-entry.tsx` registers only SP001–SP024. The original archive (including
historical excluded scenes) is byte-preserved for dependency provenance. Its
original `src/index.tsx` is not the production library entry.

Run from this project-local source folder with `node render.cjs list`.
`node render.cjs render SP004 /absolute/new-output.mp4` replays the fixed sample.
The only added public prop is `includeSourceAudio` (default true for reference
replay). Set it false when adapting into FredTalk and use the new episode audio.
Text, media and cues must be adapted in the exact mapped scene files; there is no
universal arbitrary-text interface. Keep the native 30/60fps and frame clocks.

The preserved reference outputs were accepted by Fred for reuse. This is not a
claim of pixel identity with Library, full internal motion approval, or approval of
new content. Source-native media/frame layers and some fitted tracks are used.
