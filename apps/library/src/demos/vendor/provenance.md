# Content motion primitives used by the design-site demonstrations

Copied without modification on 2026-09-23 from:

`skills/fred-remake/assets/content-motion/` (relative to the FredTalk tool workspace)

| File | SHA-256 |
| --- | --- |
| `ContentMotion.tsx` | `1cbd89860ea027eea2c2cba64a2f0edd30310325b90b8e1b0c4bc1a76f7616bb` |
| `motion-state.mjs` | `fef1390a0cc3de0bdfa981a6b8ef0297ed6e211bd22992b42159aa356b1576d5` |

The canonical manifest records `approvalStatus: not-user-reviewed`, `newVisualApproval: false`, and `fullMotionParity: false`. These copies provide real primitive implementations, not proof of a reviewed design system or faithful recreation of any episode.

`StaticDemos.jsx` and `AnimatedStage.jsx` are new design-site demonstrations. They supply their own content, geometry, fonts, color settings, and timing. The animated demonstrations use Remotion 4.0.473 and seconds derived from the Player frame clock. Static scenes do not use a Remotion Player.

Calls in the new demos use `SoftSurface`, `FrostedFocus`, `ObjectHandoff`, and the original `phase` helper. `ObjectHandoff` internally uses `ContentClip` and `handoffState`. Table and chart arrays are illustrative values rather than benchmark or account data.

The optional subtitle sample uses the geometry of `skills/fred-remotion-output/assets/subtitle-smiley/SmileySubtitle.tsx`, divided by two for the 960 × 540 demonstration stage: bottom 12.75, font size 23.75, minimum height 50.75, padding 6.5 / 11.5, radius 8.5, and maximum width 860. It is a persistent geometry example, not the canonical component's audio cue, font-loading, or export implementation.
