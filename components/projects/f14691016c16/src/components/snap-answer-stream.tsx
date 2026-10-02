"use client";

const loadSans = (..._args: any[]) => ({fontFamily:"FredMiSans"});
const loadSerif = (..._args: any[]) => ({fontFamily:"FredMiSans"});
import {
  AbsoluteFill,
  getRemotionEnvironment,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { inputStyleContext } from "../dependencies/Snapcn/registry/snap-cn-ui/input/index.tsx";
import {
  clamp01,
  easings,
  mixOklch,
  resolveFont,
  type SnapCnTheme,
  useSnapCnTheme,
} from "../dependencies/Snapcn/registry/snap-cn-ui/core/index.ts";

// Loaded through @remotion/google-fonts, never a CSS variable — a Remotion
// bundle has none of the app's CSS, so a `var(--font-…)` gets you the right face
// in the Player and a fallback in the mp4 (design-system rule 4).
const { fontFamily: SERIF } = loadSerif("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});
const { fontFamily: SANS } = loadSans("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export interface AnswerCard {
  title: string;
  body: string;
  /** SVG path for the card's lead glyph, on a 24×24 viewBox. */
  icon?: string;
}

export interface AnswerStreamProps {
  /** The prompt. Fills the pill, and stays in the composer. */
  question?: string;
  /** The reply. `\n` is a hard break; everything else wraps. */
  answer?: string;
  /** The line that lands under the reply and introduces the cards. */
  headline?: string;
  /** The plan. Each lands as an empty card, then fills. */
  cards?: AnswerCard[];
  /** Composer footer. */
  model?: string;

  // --- timeline (seconds) ---
  /** When the push into the send button starts accelerating. */
  commitAt?: number;
  /** When the shot **cuts** to the answer. Not a transition — one frame. */
  cutAt?: number;
  /** When the camera starts pulling back to keep up with the answer. */
  pullbackAt?: number;
  /** How long the pull-back takes. */
  pullbackDuration?: number;
  /** Streaming rate, in words per second. */
  wordsPerSecond?: number;
  /** How long a word stays hot before it has cooled to `foreground`. */
  coolSeconds?: number;

  // --- camera ---
  /** Scale of the opening macro shot on the send button. */
  macroZoom?: number;
  /** How far in the answer shot starts, relative to where it settles. */
  pullbackFrom?: number;
  /** How far past its mark the pull-back goes before easing back onto it. */
  pullbackUndershoot?: number;
  /** The pull-back's focal point, as a fraction of the frame. It is *above*
   *  the top edge, which is what makes the page rise as it shrinks. */
  focusX?: number;
  focusY?: number;
  /** Peak motion blur, in reference px, at the pull-back's fastest frame. */
  blur?: number;

  /** The send button and the hot edge of the stream. Defaults to `theme.primary`. */
  accentColor?: string;
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
  /**
   * The face this scene paints its words in — a label from `fonts.ts`
   * ("Inter", "Space Grotesk", "Instrument Serif") or a CSS family you have
   * loaded yourself. Unset, the scene keeps the face it was designed around.
   *
   * Overrides `theme.fontFamily`, which is how a brand kit re-skins a whole
   * timeline from one value.
   */
  fontFamily?: string;
  speed?: number;
}

// --- Pure helpers (unit-tested) -------------------------------------------

/**
 * The answer shot's camera scale, where 1 is the framing it settles on.
 *
 * Three segments, all measured: it holds where the cut left it, pulls back on
 * a **symmetric** curve to slightly past its mark, and creeps back onto it.
 *
 * The symmetry is the measurement, not a default. Tracking the column's two
 * edges across the reference puts peak velocity at 48–52% of the move — dead
 * centre, which is a cubic in-out and *not* a spring (a spring peaks at a
 * third). Re-measured on the *rendered* frames against the reference's, the two
 * curves start together, end together, and part by at most **0.048 of scale**
 * around the midpoint — the reference is fractionally front-loaded against a
 * symmetric cubic. A quadratic in-out closes about a third of that. It is not
 * worth a second easing curve: the residual is one frame of timing in the
 * middle of a 33-frame move, and `easings.inOut` is the one the rest of the
 * registry already moves on.
 *
 * `1` is where the shot **settles**, not where the pull-back bottoms out. That
 * distinction is worth a sentence because getting it wrong is silent: normalise
 * against the bottom of the move instead and every constant here is 2.8% out,
 * the layout never lands where it was measured, and the curve reads as lagging
 * the reference by two frames in the middle with the ends still matching.
 */
export function shotBScale(
  fc: number,
  pullF: number,
  pullDurF: number,
  from: number,
  undershoot: number,
  recoverF: number,
): number {
  if (fc <= pullF) return from;
  const bottom = 1 - undershoot;
  const u = clamp01((fc - pullF) / pullDurF);
  if (u < 1) return from + (bottom - from) * easings.inOut(u);
  // The reference does not stop dead. It sits ~3 frames at the bottom of the
  // move and then comes back in by 2.8% — the same slow push that is under
  // every other shot in the clip, and like the rest of them it runs at a
  // constant rate, so this is linear and not an ease.
  //
  // **Bounded**, unlike the drift itself: model it as an open-ended creep and
  // the composer walks off the bottom edge somewhere after four seconds, which
  // is a bug you only ever see in a long config.
  const v = clamp01((fc - pullF - pullDurF - 3) / recoverF);
  return bottom + undershoot * v;
}

/**
 * How cooled a word is: 0 the frame it lands, 1 once it has settled to
 * `foreground`. Words are born hot and cool on a fixed clock, so the hot band
 * is `wordsPerSecond × coolSeconds` words wide no matter how fast the stream
 * runs — on the reference, six.
 */
export function heat(fc: number, bornF: number, coolF: number): number {
  if (coolF <= 0) return 1;
  return clamp01((fc - bornF) / coolF);
}

/** Frame at which word `i` of a stream that opened at `startF` lands. */
export function wordBirth(
  i: number,
  startF: number,
  wordsPerFrame: number,
): number {
  return wordsPerFrame <= 0 ? startF : startF + i / wordsPerFrame;
}

// --- Icons -----------------------------------------------------------------

function Glyph({ d, size, color }: { d: string; size: number; color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      <title>icon</title>
      <path d={d} />
    </svg>
  );
}

const CARD_ICONS = [
  "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z", // pencil
  "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19", // link
  "M12 2 4 6v6c0 5 3.4 8.9 8 10 4.6-1.1 8-5 8-10V6l-8-4Z", // shield
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z", // globe
];

const DEFAULT_CARDS: AnswerCard[] = [
  {
    title: "Content",
    body: "Build pages around the exact questions buyers ask, so there is something accurate to cite.",
  },
  {
    title: "Citations",
    body: "Run outreach to the sources that already get quoted for those questions.",
  },
  {
    title: "Authority",
    body: "Earn links from the publishers the models already trust.",
  },
  {
    title: "Coverage",
    body: "Place press so the name turns up wherever people go looking.",
  },
];

// --- Streaming text --------------------------------------------------------

/**
 * A block of text that arrives a word at a time, each word hot and cooling.
 *
 * The separator is a text node **between** the spans, never a trailing space
 * inside one: a trailing space at the end of an inline box is stripped by CSS,
 * and per-word spans render as `Noextracharge`.
 */
function Stream({
  text,
  fc,
  startF,
  wordsPerFrame,
  coolF,
  ramp,
  style,
}: {
  text: string;
  fc: number;
  startF: number;
  wordsPerFrame: number;
  coolF: number;
  /** Colours from hot (index 0) to cooled (last). Quantised on purpose. */
  ramp: string[];
  style: React.CSSProperties;
}) {
  // Hard breaks are the author's; everything else is left to wrap.
  const lines = text.split("\n");
  let n = 0;
  return (
    <div style={{ ...style, textRendering: "geometricPrecision" }}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
          <div key={li}>
            {words.map((w, wi) => {
              const born = wordBirth(n++, startF, wordsPerFrame);
              const h = heat(fc, born, coolF);
              // Hidden, not absent. A word that is removed until its frame lets
              // the line reflow under it, and every word already on screen
              // shifts as the next one lands — on the reference they do not
              // move at all. The cool-down is the reveal; there is no fade
              // under it, because on the reference a word arrives at full
              // accent and only the *colour* moves after that.
              const opacity = fc >= born ? 1 : 0;
              return (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: words are positional
                  key={wi}
                  style={{
                    color:
                      ramp[
                        Math.min(
                          ramp.length - 1,
                          Math.round(h * (ramp.length - 1)),
                        )
                      ],
                    opacity,
                  }}
                >
                  {wi > 0 ? " " : ""}
                  {w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// --- The reference's own frame ---------------------------------------------
//
// Every number below was measured on a 886×498 recording, in that recording's
// pixels, at the framing the shot **settles** on. Laying out in these units
// means no number here is a conversion of a number that was measured.

const REF_W = 886;
const REF_H = 498;

const PILL = { right: 706, top: 22, h: 28, padX: 15, size: 11 };
const ANSWER = { x: 171, top: 82, w: 400, size: 13, line: 17 };
const HEAD = { x: 171, top: 152, size: 16 };
const ROW = { x: 171, top: 190, w: 128, h: 140, gap: 5, r: 6 };
const BOX = { x: 163, y: 362, w: 549, h: 128, r: 20 };
// The send button, measured inside the composer. It is what the opening macro
// shot is framed on, so it has to be right in both shots — it is one element.
const SEND = { size: 28, r: 9, right: 19, bottom: 28 };
// Where the macro shot parks the send button, as a fraction of the frame.
// Measured once the shot has finished decelerating (reference frames 70–82).
const MACRO_X = 0.571;
const MACRO_Y = 0.591;

// --- Main composition ------------------------------------------------------

/**
 * The beat after you press send: the macro shot on the button, the **cut**, and
 * the answer building itself on the page while the camera pulls back to keep up
 * with it.
 *
 * ## Scene to scene, the frame cuts. It never transitions.
 *
 * Read frame by frame, the reference has exactly one grammar for changing
 * shot, and it is a hard cut — one frame wide, no blur, no ramp. What makes the
 * cuts invisible is not a transition, it is what happens **either side** of
 * them:
 *
 * - **Every cut lands on motion.** The camera here is 8 frames into an
 *   accelerating push toward the button when the cut fires. It is moving fastest
 *   at the moment it is replaced, which is the oldest trick there is for hiding
 *   an edit.
 * - **Every cut is followed by a glide, not a stop.** The frame arrives slightly
 *   off and eases in — measured, the answer page lands 27px high and settles
 *   down over 15 frames on an ease-out. Cut to a static frame and the edit is
 *   the loudest thing in the shot.
 *
 * The only *move* in the whole reference is inside a shot, and there are two
 * kinds: a slow idle drift that never stops, and one fast blurred push to
 * whatever is about to happen.
 *
 * ## The pull-back is fitted to the content, not to the clock
 *
 * As the answer grows — paragraph, then headline, then four cards, then the
 * composer sliding up — the camera pulls back and rises to keep the block in
 * frame. Tracking the column's left and right edges across the move recovers a
 * scale of **1.404× → 1.0** about a fixed point at **(0.5, −0.548)** of the
 * frame: dead centre horizontally, and 273px *above the top edge*. Both edges
 * agree on that point to within 1px, which is what makes it a measurement and
 * not a guess. A focal point above the frame is the whole reason the page
 * appears to rise as it shrinks, instead of collapsing toward its middle.
 *
 * Peak velocity sits at 48–52% of the move, so the curve is a cubic in-out —
 * see `shotBScale`. And the move carries **motion blur** at its fastest frames,
 * derived from the camera's own speed rather than dialled in by eye.
 *
 * ## Containers land empty; content streams into them
 *
 * The pill, and every card, arrive as an empty surface first and fill after.
 * The text itself arrives a word at a time, each word **hot** — at the accent —
 * cooling to `foreground` on a fixed clock, which keeps a moving band of about
 * six words lit at the head of the stream.
 *
 * ## What is not measured
 *
 * The colours and the copy. The reference is a specific product with its own
 * coral, its own four icon tints and its own marketing lines. None of that
 * belongs in a component that lands next to somebody else's `Input`
 * (design-system rule 5). The paint is the shadcn token set, the composer takes
 * its surface from the `Input` primitive's own style context, and every string
 * is a prop.
 */
export function AnswerStream({
  question = "How do I rank higher in AI answers?",
  answer = "Analysing your prompt gaps…\nFound 27 prompts you should rank for and don't yet, so your name shows up everywhere AI looks.",
  headline = "Your AI visibility score: 34% — here's how I'd fix it:",
  cards = DEFAULT_CARDS,
  model = "Auto",
  commitAt = 1.0,
  cutAt = 1.284,
  pullbackAt = 1.933,
  pullbackDuration = 1.1,
  wordsPerSecond = 25,
  coolSeconds = 0.23,
  macroZoom = 2.36,
  pullbackFrom = 1.364,
  pullbackUndershoot = 0.028,
  focusX = 0.5,
  focusY = -0.548,
  blur = 3,
  accentColor,
  theme,
  mode,
  fontFamily,
  speed = 1,
}: AnswerStreamProps) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = useSnapCnTheme(theme, mode);
  const face = resolveFont(fontFamily ?? t.fontFamily) ?? SANS;
  const ui = inputStyleContext(t);
  const accent = accentColor ?? t.primary;

  const fc = frame * speed;
  const stageScale = Math.min(width / REF_W, height / REF_H);

  // A hairline is specified at a 40px control; these surfaces are 128–140 tall,
  // so the token is walked toward the foreground through the system's own mix
  // rather than by picking a darker grey (design-system rule 3b). No drop
  // shadow — under a surface this size a visible one is a grey smear (rule 3).
  const border = `1px solid ${mixOklch(ui.idleBorder, t.foreground, 0.18)}`;

  // Hot → cooled, quantised to 9 steps and built once. A frame of this shot
  // colours ~110 words; 110 live `mixOklch` calls per frame is the one thing in
  // here a Player cannot afford, and nobody can see the ninth of a step.
  const ramp = Array.from({ length: 9 }, (_, i) =>
    mixOklch(accent, t.foreground, i / 8),
  );
  const mutedRamp = Array.from({ length: 9 }, (_, i) =>
    mixOklch(t.mutedForeground, t.foreground, i / 8),
  );

  // --- timeline (frames) ---
  const commitF = commitAt * fps;
  const cutF = cutAt * fps;
  const pullF = pullbackAt * fps;
  const pullDurF = pullbackDuration * fps;
  const wpf = wordsPerSecond / fps;
  const coolF = coolSeconds * fps;
  const cut = fc >= cutF;

  const isRendering = getRemotionEnvironment().isRendering;
  // Right for the Player, wrong for the render: parallel render tabs inherit a
  // stale raster and the type shimmers while standing still.
  const willChange = isRendering ? undefined : ("transform" as const);

  // --- shot A: the macro on the send button -------------------------------
  //
  // Same composer as the answer shot, scaled about the button. One element, two
  // framings, so the two cannot drift apart.
  const btnX = BOX.x + BOX.w - SEND.right - SEND.size / 2;
  const btnY = BOX.y + BOX.h - SEND.bottom - SEND.size / 2;
  // The shot opens still decelerating out of the push that arrived on it —
  // measured, the button slides 158px left and 14px up over 15 frames.
  const settle = easings.out(clamp01(fc / 15));
  // …and closes accelerating into the next one. The cut fires here, at the
  // fastest frame of the move, which is what hides it.
  const commit = clamp01((fc - commitF) / Math.max(1, cutF - commitF)) ** 3;
  // The press, on its own clock so it *causes* the push rather than competing
  // with it: three frames down, five back. The reference has none — its cursor
  // is already on the button when the shot opens, and the accelerating push
  // does all the work. Synthesised, the cut needs a visible cause.
  const press =
    fc < commitF
      ? 0
      : fc < commitF + 3
        ? (fc - commitF) / 3
        : 1 - clamp01((fc - commitF - 3) / 5);

  // --- shot B: the answer -------------------------------------------------
  const cam = (f: number) =>
    shotBScale(f, pullF, pullDurF, pullbackFrom, pullbackUndershoot, 26);
  const sB = cam(fc);
  // Blur from the camera's own speed: a frame that carries a typical element
  // d px smears it by d/4. The radius is taken to the frame's *centre*, not its
  // far edge — a corner-radius model is four times too strong, and measured on
  // the reference the smear at peak is 4–6px on type that is still legible, not
  // the wash that comes out of a far-edge estimate.
  // ponytail: uniform blur, not radial. The reference's is radial about the
  // focal point; at 3px nobody reads the difference. Per-element radial blur
  // needs a filter per element — reach for it only if a slower push shows it up.
  const camBlur = Math.min(
    blur,
    (Math.abs(sB - cam(fc - 1)) * (REF_H / 2 - focusY * REF_H)) / 4,
  );
  // The cut lands 27px high and eases down. A cut to a static frame is the
  // loudest edit in the shot.
  const entry = (1 - easings.out(clamp01((fc - cutF) / 15))) * -27;

  const streamStart = cutF + 0.075 * fps;
  const headStart = streamStart + (2.717 - 1.359) * fps;
  const composerIn = easings.out(
    clamp01((fc - (cutF + (2.442 - 1.284) * fps)) / 12),
  );
  const cardsAt = cutF + (2.642 - 1.284) * fps;

  const composer = (
    <div
      style={{
        position: "absolute",
        left: BOX.x,
        top: BOX.y,
        width: BOX.w,
        height: BOX.h,
        borderRadius: BOX.r,
        background: t.card,
        border,
        boxShadow: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 26,
          right: 28,
          fontFamily: face,
          fontSize: 14,
          lineHeight: 1.4,
          color: t.foreground,
          textRendering: "geometricPrecision",
        }}
      >
        {question}
      </div>
      <div
        style={{
          position: "absolute",
          left: 28,
          right: SEND.right,
          bottom: SEND.bottom - SEND.size / 2,
          height: SEND.size,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: face,
          fontSize: 9,
          color: t.mutedForeground,
        }}
      >
        <Glyph d="M12 5v14M5 12h14" size={16} color={t.mutedForeground} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>{model}</span>
          <div
            style={{
              width: SEND.size,
              height: SEND.size,
              borderRadius: SEND.r,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${1 - 0.07 * press})`,
            }}
          >
            <Glyph
              d="M12 19V5M5 12l7-7 7 7"
              size={15}
              color={t.primaryForeground}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: t.background, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: REF_W,
          height: REF_H,
          overflow: "hidden",
          transform: `translate(-50%, -50%) scale(${stageScale})`,
        }}
      >
        {cut ? (
          // ---- Shot B: the answer.
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateY(${entry}px)`,
              filter:
                camBlur > 0.15 ? `blur(${camBlur.toFixed(2)}px)` : undefined,
              willChange,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${sB})`,
                transformOrigin: `${focusX * REF_W}px ${focusY * REF_H}px`,
                willChange,
              }}
            >
              {/* ---- The question, as a pill. It lands empty and fills. */}
              <div
                style={{
                  position: "absolute",
                  right: REF_W - PILL.right,
                  top: PILL.top,
                  height: PILL.h,
                  padding: `0 ${PILL.padX}px`,
                  borderRadius: PILL.h / 2,
                  background: t.muted,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Stream
                  text={question}
                  fc={fc}
                  startF={cutF}
                  wordsPerFrame={16 / fps}
                  coolF={coolF}
                  ramp={mutedRamp}
                  style={{
                    fontFamily: face,
                    fontSize: PILL.size,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                />
              </div>

              {/* ---- The reply. */}
              <Stream
                text={answer}
                fc={fc}
                startF={streamStart}
                wordsPerFrame={wpf}
                coolF={coolF}
                ramp={ramp}
                style={{
                  position: "absolute",
                  left: ANSWER.x,
                  top: ANSWER.top,
                  width: ANSWER.w,
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: ANSWER.size,
                  lineHeight: `${ANSWER.line}px`,
                }}
              />

              {/* ---- The line that introduces the plan. */}
              <Stream
                text={headline}
                fc={fc}
                startF={headStart}
                wordsPerFrame={16 / fps}
                coolF={coolF}
                ramp={ramp}
                style={{
                  position: "absolute",
                  left: HEAD.x,
                  top: HEAD.top,
                  width: ROW.w * cards.length + ROW.gap * (cards.length - 1),
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: HEAD.size,
                  lineHeight: 1.25,
                }}
              />

              {/* ---- The plan. Each card lands empty, then fills. */}
              {cards.map((c, i) => {
                const boxF = cardsAt + i * 3.5;
                if (fc < boxF) return null;
                const fill = boxF + 4;
                return (
                  <div
                    key={c.title}
                    style={{
                      position: "absolute",
                      left: ROW.x + i * (ROW.w + ROW.gap),
                      top: ROW.top,
                      width: ROW.w,
                      height: ROW.h,
                      borderRadius: ROW.r,
                      background: t.card,
                      border,
                      opacity: clamp01((fc - boxF) / 3),
                    }}
                  >
                    <div style={{ position: "absolute", left: 12, top: 12 }}>
                      <Glyph
                        d={c.icon ?? CARD_ICONS[i % CARD_ICONS.length]}
                        size={11}
                        color={t.mutedForeground}
                      />
                    </div>
                    <Stream
                      text={c.title}
                      fc={fc}
                      startF={fill}
                      wordsPerFrame={wpf}
                      coolF={coolF}
                      ramp={ramp}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 32,
                        right: 12,
                        fontFamily: SERIF,
                        fontWeight: 600,
                        fontSize: 8,
                        lineHeight: 1.2,
                      }}
                    />
                    <Stream
                      text={c.body}
                      fc={fc}
                      startF={fill + 2}
                      wordsPerFrame={wpf}
                      coolF={coolF}
                      ramp={ramp}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 46,
                        right: 12,
                        fontFamily: face,
                        fontSize: 7,
                        lineHeight: "10px",
                      }}
                    />
                  </div>
                );
              })}

              {/* ---- The composer, sliding back up under the answer. */}
              <div
                style={{
                  transform: `translateY(${(1 - composerIn) * (REF_H - BOX.y)}px)`,
                  willChange,
                }}
              >
                {composer}
              </div>
            </div>
          </div>
        ) : (
          // ---- Shot A: the macro on the send button.
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${(1 - settle) * 158}px, ${(1 - settle) * 14 + commit * 82}px)`,
              willChange,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `translate(${MACRO_X * REF_W - btnX}px, ${MACRO_Y * REF_H - btnY}px) scale(${macroZoom * (1 + 0.12 * commit)})`,
                transformOrigin: `${btnX}px ${btnY}px`,
                willChange,
              }}
            >
              {composer}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
