"use client";

const loadSans = (..._args: any[]) => ({fontFamily:"FredMiSans"});
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  mixOklch,
  resolveFont,
  type SnapCnTheme,
  useSnapCnTheme,
} from "../dependencies/Snapcn/registry/snap-cn-ui/core/index.ts";

// Loaded through @remotion/google-fonts, never a CSS variable — a Remotion
// bundle has none of the app's CSS, so a `var(--font-…)` gets you the right face
// in the Player and a fallback in the mp4 (design-system rule 4).
const { fontFamily: SANS } = loadSans("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// ---------------------------------------------------------------------------
// Proportions
//
// Every constant below is a *fraction of the composition height*, never a pixel,
// so the scene holds its shape at 720p, 1080p or a vertical crop. They were
// measured off a 718x398 screen recording by sub-pixel edge crossings and
// intensity moments, then divided through by 398; the comment on each names what
// was measured and in which units.
// ---------------------------------------------------------------------------

/**
 * Distance between one row's centre line and the next.
 *
 * The single most important number in the scene: it is both the row height and
 * the distance the whole column travels each time a step is added. Measured as
 * the mean of six consecutive settle positions of the query pill — 201.39,
 * 172.00, 142.59, 113.20, 83.83, 54.42, 25.16 — which are 29.39px apart to
 * within 0.07px, on a 398px frame.
 */
const ROW_PITCH = 0.0738;
/**
 * Query pill height. 22.0px of 398.
 *
 * Measured as the *mass* of the pill's fill over a column band clear of both the
 * type and the corner radius, not as a distance between two edge crossings: a
 * Gaussian blur moves an edge crossing but conserves the integral, and the
 * reference is a compressed recording with a soft edge either side and a faint
 * shadow under the bottom one.
 */
const PILL_H = 0.0553;
/**
 * Result pill height. Measured 27.5px of 398 (187.1 → 214.6) — the answer sits
 * in a bigger chip than the question, which is what makes it read as a payoff
 * rather than as another line of the log.
 */
const RESULT_PILL_H = 0.0691;
/**
 * Corner radius as a fraction of the pill's own height.
 *
 * Not a stadium. Following the sub-pixel left edge down the pill's top rows
 * (199.4, 196.6, 195.6, 195.4, 195.3 at y=190…195) fits a circle of R≈6px on a
 * 21.4px pill. A stadium would be R=10.7 and would put that first row at 202.9 —
 * three and a half pixels out, which at this size is a different object.
 */
const PILL_R = 0.28;
/** Query pill padding either side of the label, as a fraction of pill height.
 *  Measured 9.3px against a 331px pill holding a 312px text box. */
const PILL_PAD = 0.42;
/**
 * Result pill padding, in the same units.
 *
 * Tighter than the query pill's, which is not a mistake and not a rounding: the
 * result chip is 1.285x as tall and 5.8px is what its 147.4px width leaves once
 * the icon, the gap and the text box are taken out. A taller chip on the same
 * padding would have read as a slab.
 */
const RESULT_PAD = 0.271;
/**
 * Leading icon box, square. 12.5px of 398.
 *
 * Derived from ink rather than read off: a lucide glyph does not fill its own
 * box, so the reference's 11.4px of drawn globe is `box x (20 + strokeWidth)/24`.
 */
const ICON = 0.0314;
/** Icon box → first glyph. 5.4px of 398 (box ends 206.9, text starts 212.3). */
const ICON_GAP = 0.0136;
/**
 * Step type size.
 *
 * Not read off a spec and not guessed from a cap height — the reference is a
 * compressed 398px recording and every vertical measurement on 10px type is
 * inside its blur. Fitted instead by cross-correlating the reference's column
 * ink profile against this component's own render under a horizontal scale
 * sweep: three separate step labels peak at 0.882, 0.868 and 0.887 (corr 0.69
 * to 0.74), which puts the face at 10.11px of 398.
 */
const FONT = 0.0254;
/**
 * Query type size, as a multiple of `FONT`. The prompt is set *smaller* than
 * the log it starts — the same correlation puts it at 0.772 against the steps'
 * 0.879, and the ratio holds independently in the two strings' width ratio
 * (3.635 measured, 4.177 if they shared a size). A long prompt has to survive
 * one line in the pill; a step label never gets long enough to care.
 */
const QUERY_FONT_SCALE = 0.878;
/** Result type size, as a multiple of `FONT`. Same fit, k=0.843 against a
 *  render already carrying 1.28x, then trimmed on the measured text width. */
const RESULT_FONT_SCALE = 1.196;

// ---------------------------------------------------------------------------
// Motion
//
// Durations are in seconds so they survive a change of fps. Each was fitted to
// the reference by pooling every repeat of the move and least-squares fitting a
// cubic-bezier + duration to the pooled samples; the rms of each fit is quoted.
// ---------------------------------------------------------------------------

/**
 * The column's travel when a step is added, in seconds.
 *
 * Pooled over all six shifts (their y-centroids agree to 0.5% of the 29.4px
 * travel), the curve is *not* a spring: velocity peaks two frames in and decays
 * monotonically with no overshoot, which no zero-initial-velocity spring can do
 * as fast. `cubic-bezier(.3,.7,.3,1)` over 0.308s fits at rms 0.010 — three
 * tenths of a pixel.
 */
const SHIFT_S = 0.308;
const SHIFT_EASE = Easing.bezier(0.3, 0.7, 0.3, 1);
/**
 * A new row's fade-in, in seconds. Shorter than the travel — the row is already
 * at 88% opacity when the column is only 78% of the way up. Fitted at rms 0.018.
 */
const ROW_FADE_S = 0.242;
/** The query pill's entrance. Scale and opacity share a duration; the blur
 *  clears in two thirds of it. */
const INTRO_S = 0.375;
const INTRO_BLUR_S = 0.2;
/**
 * Where the pill starts. The recording opens 2.2 frames into this move with the
 * pill already 22.5% wider than it lands, at 27% opacity and under 3.1px of
 * blur; extrapolating the three back to t=0 gives 1.31x, transparent, 5.6px.
 */
const INTRO_SCALE = 1.31;
/** Blur at t=0, as a fraction of composition height (5.6px of 398). */
const INTRO_BLUR = 0.0141;

/**
 * The outro: the column swells and clears while the running step survives it.
 *
 * `cubic-bezier(.3,0,.3,1)` on both, fitted separately at rms 0.017 and 0.015 —
 * and they are *not* the same length. The swell finishes in 0.5s, the slide to
 * centre takes 0.6s: the row is already at its final size while it is still
 * travelling, so the last thing that moves is the thing you are meant to read.
 */
const OUTRO_EASE = Easing.bezier(0.3, 0, 0.3, 1);
const OUTRO_SCALE_S = 0.5;
const OUTRO_POS_S = 0.6;
/** How much bigger the column gets on its way out. Measured 1.40x — from the
 *  row spacing while the rows are still readable, and from the surviving row's
 *  own width after they are not. */
const OUTRO_SCALE = 1.4;
/**
 * How the finished rows clear, in seconds.
 *
 * `cubic-bezier(.35,0,.25,.9)` over 0.467s, rms 0.018 against the reference's
 * own row ink corrected for the swell (bigger type carries more ink, so a raw
 * ink ratio reads as a slower fade than it is). The long tail is the point: the
 * rows are still faintly there at 4% while the answer is arriving, which is what
 * makes the clear read as one move rather than as a cut.
 */
const OUTRO_FADE_EASE = Easing.bezier(0.35, 0, 0.25, 0.9);
const OUTRO_FADE_S = 0.467;
/** Seconds from the start of the outro to the running step giving way. */
const HANDOFF_AT = 0.667;
const HANDOFF_S = 0.167;
/** Seconds from the start of the outro to the result landing. */
const RESULT_AT = 0.75;
/** The result does not fade in so much as arrive: the reference's chip fill goes
 *  from the page colour to 89% of full in a single frame. */
const RESULT_S = 0.033;
/** The glint that crosses the result once it has landed. */
const GLINT_AT = 0.95;
const GLINT_S = 0.42;
/** Glint radius, as a fraction of composition height (≈24px of 398). */
const GLINT_R = 0.06;

/**
 * The running step's globe, against the same globe once the step is done.
 *
 * 0.17 — measured, and it is not a typo. The reference's spinner carries 850 of
 * ink where its finished globe carries 5110. A running step is a *place* in the
 * list, not a thing to look at; the moment it finishes, its icon is what tells
 * you.
 */
const RUNNING_ICON = 0.17;

/**
 * Icon stroke weights, on lucide's 24 grid.
 *
 * Fitted on ink, which is the one thing a blurred 12px glyph still reports
 * honestly: lucide's default 2 puts 34% more ink on the globe and 17% more on
 * the check than the reference carries. At this size the difference is the
 * whole character of the icon — a 2-weight globe at 12px is a dark blob.
 */
const GLOBE_W = 1.35;
const CHECK_W = 2.2;

/** One frame of the running step's globe, in seconds. */
const SPIN_S = 2;

// ---------------------------------------------------------------------------

export interface AgentStep {
  /** Shown while the step is running. Present tense, and it keeps the ellipsis. */
  running: string;
  /** Shown once it is done. Past tense, and it usually carries the number the
   *  step found — that is the whole reason to read the log. */
  done: string;
  /** `globe` for anything that went out to the network, `check` for the rest. */
  icon?: "globe" | "check";
  /** Seconds this step runs before it flips to `done`. Falls back to `stepHold`. */
  hold?: number;
}

export interface AgentStepsProps {
  /** The prompt, in the pill at the top. */
  query?: string;
  /**
   * The log, in order. The last one never completes — it is still running when
   * the column clears, and it is the one the result replaces.
   *
   * Also accepts one string, for the customizer and for quick edits:
   * `"running > done @globe; running > done"`.
   */
  steps?: AgentStep[] | string;
  /** The answer, in a chip of its own. */
  result?: string;
  /** Seconds the query holds alone before the first step. */
  queryHold?: number;
  /** Default seconds a step runs, for steps that do not set their own `hold`. */
  stepHold?: number;
  /** Seconds the last step runs before the column starts to clear. */
  finalHold?: number;
  /** Page behind the scene. Defaults to `theme.background`. */
  paperColor?: string;
  /** The wash in the corner. Defaults to a tint of `theme.primary`. */
  glowColor?: string;
  /** Where the wash sits, as a fraction of the frame. */
  glowX?: number;
  glowY?: number;
  /** Wash radius, as a fraction of composition height. 0 turns it off. */
  glowRadius?: number;
  /** Pill fill. Defaults to `theme.card`. */
  pillColor?: string;
  /** Query and result ink. Defaults to `theme.foreground`. */
  inkColor?: string;
  /** Step ink. Defaults to `theme.mutedForeground`. */
  stepColor?: string;
  /** The completed check, and the glint. Defaults to `theme.primary`. */
  accentColor?: string;
  /** The scene's centre line, as a fraction of frame height. */
  centerY?: number;
  fontFamily?: string;
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
  speed?: number;
}

// --- Pure helpers (unit-tested) -------------------------------------------

/**
 * The string form of `steps`, for the customizer's one-line text control.
 *
 *   "Searching the registry… > Searched the registry @globe; Reading… > Read 4"
 */
export function toSteps(input: AgentStep[] | string): AgentStep[] {
  if (Array.isArray(input)) return input;
  return input
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const icon = /@globe$/.test(entry) ? "globe" : "check";
      const body = entry.replace(/@globe$/, "").trim();
      const split = body.indexOf(">");
      const running = (split < 0 ? body : body.slice(0, split)).trim();
      const done = (split < 0 ? body : body.slice(split + 1)).trim();
      return { running, done, icon } as AgentStep;
    });
}

export interface StepSchedule {
  /** Effective frame the row enters on. */
  enter: number;
  /** Effective frame the label flips to its done form. `Infinity` for the last
   *  step, which never completes. */
  done: number;
}

/**
 * When each row enters and when it flips.
 *
 * The reference's own cadence, frame for frame: a step's done label lands on one
 * frame and the next row enters on the very next. There is no gap to tune — the
 * next line appearing *is* the acknowledgement that the last one finished, and a
 * pause between the two reads as a stall.
 */
export function schedule(
  holds: number[],
  queryHoldF: number,
  finalHoldF: number,
): { steps: StepSchedule[]; outro: number } {
  const steps: StepSchedule[] = [];
  let at = queryHoldF;
  holds.forEach((hold, i) => {
    const last = i === holds.length - 1;
    const done = at + (last ? finalHoldF : hold);
    steps.push({ enter: at, done: last ? Number.POSITIVE_INFINITY : done });
    at = done + 1;
  });
  return { steps, outro: at - 1 };
}

/**
 * How far the column has travelled, in rows.
 *
 * The sum of every shift's own progress rather than an interpolation between
 * indices: when two steps land inside one shift's 0.31s the column has to be
 * carrying both moves at once, and summing is the only way it does.
 */
export function columnOffset(
  fc: number,
  enters: number[],
  shiftF: number,
): number {
  let total = 0;
  for (const enter of enters) {
    if (fc <= enter) continue;
    total += SHIFT_EASE(Math.min(1, (fc - enter) / shiftF));
  }
  return total;
}

/** Progress of a value that starts at `at` and takes `dur` frames. */
export function ramp(fc: number, at: number, dur: number): number {
  if (dur <= 0) return fc >= at ? 1 : 0;
  return Math.max(0, Math.min(1, (fc - at) / dur));
}

// --- Icons -----------------------------------------------------------------

/**
 * The globe, drawn so its meridian can turn.
 *
 * A rotating globe is not a rotating *icon* — spinning the whole glyph would
 * spin the equator too, which reads as a wheel. Only the meridian ellipse
 * narrows and flips, which is what a sphere turning on its axis actually looks
 * like, and it is what the reference's 12px icon does over its 2s cycle.
 */
function Globe({
  size,
  color,
  turn,
  strokeWidth,
}: {
  size: number;
  color: string;
  turn: number;
  strokeWidth: number;
}) {
  const k = Math.cos(turn * Math.PI * 2);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      <title>globe</title>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path
        d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
        transform={`translate(12 0) scale(${k} 1) translate(-12 0)`}
      />
    </svg>
  );
}

function Check({
  size,
  color,
  strokeWidth,
}: {
  size: number;
  color: string;
  strokeWidth: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      <title>check</title>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// --- Defaults --------------------------------------------------------------

const DEFAULT_STEPS: AgentStep[] = [
  {
    running: "Searching the registry…",
    done: "Searched the registry",
    icon: "globe",
    hold: 0.67,
  },
  {
    running: "Looking up components matching “dashboard”…",
    done: "Looked up 6 matching components",
    hold: 0.52,
  },
  {
    running: "Reading the docs…",
    done: "Read 4 component docs",
    icon: "globe",
    hold: 0.4,
  },
  {
    running: "Checking available props…",
    done: "Checked available props",
    hold: 0.27,
  },
  {
    running: "Building the timeline…",
    done: "Set 9 scene timings",
    hold: 0.35,
  },
  { running: "Rendering frames…", done: "Rendered frames" },
];

// ---------------------------------------------------------------------------

export function AgentSteps({
  query = "A 30-second launch video for a Next.js analytics dashboard",
  steps: stepsInput = DEFAULT_STEPS,
  result = "Rendered 900 frames",
  queryHold = 0.683,
  stepHold = 0.45,
  finalHold = 0.283,
  paperColor,
  glowColor,
  glowX = 0.858,
  glowY = 0.854,
  glowRadius = 0.465,
  pillColor,
  inkColor,
  stepColor,
  accentColor,
  centerY = 0.5,
  fontFamily,
  theme: themeOverride,
  mode,
  speed = 1,
}: AgentStepsProps) {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const t = useSnapCnTheme(themeOverride, mode);
  const face = resolveFont(fontFamily ?? t.fontFamily) ?? SANS;
  const steps = toSteps(stepsInput);

  const fc = frame * speed;
  const paper = paperColor ?? t.background;
  const pill = pillColor ?? t.card;
  const ink = inkColor ?? t.foreground;
  const muted = stepColor ?? t.mutedForeground;
  const accent = accentColor ?? t.primary;
  // The wash is the accent at a sixth strength — a tint of the page, never a
  // second colour on it. mixOklch, not an alpha, so it survives a render onto a
  // frame that has no compositing behind it.
  const glow = glowColor ?? mixOklch(paper, accent, 0.17);

  const pitch = ROW_PITCH * height;
  const font = FONT * height;
  const iconSize = ICON * height;
  const shiftF = SHIFT_S * fps;

  const holds = steps.map((s) => (s.hold ?? stepHold) * fps);
  const { steps: sched, outro } = schedule(
    holds,
    queryHold * fps,
    finalHold * fps,
  );
  const lastIndex = steps.length - 1;

  // --- the column ----------------------------------------------------------

  const offset = columnOffset(
    fc,
    sched.map((s) => s.enter),
    shiftF,
  );
  const outroP = ramp(fc, outro, OUTRO_SCALE_S * fps);
  const scale = interpolate(OUTRO_EASE(outroP), [0, 1], [1, OUTRO_SCALE]);
  // How far the running row has slid from the column's left edge to the frame's
  // centre. Expressed as two percentage translates (see the JSX) so it needs no
  // measurement of either width.
  const centred = OUTRO_EASE(ramp(fc, outro, OUTRO_POS_S * fps));
  // Everything that has already finished clears; the running row does not.
  const settledOpacity =
    1 - OUTRO_FADE_EASE(ramp(fc, outro, OUTRO_FADE_S * fps));

  const intro = ramp(fc, 0, INTRO_S * fps);
  const introE = Easing.out(Easing.cubic)(intro);
  const introBlur =
    INTRO_BLUR *
    height *
    (1 - Easing.out(Easing.cubic)(ramp(fc, 0, INTRO_BLUR_S * fps)));

  const handoff = ramp(fc, outro + HANDOFF_AT * fps, HANDOFF_S * fps);
  const resultIn = ramp(fc, outro + RESULT_AT * fps, RESULT_S * fps);
  const glint = ramp(fc, outro + GLINT_AT * fps, GLINT_S * fps);

  const rowStyle = {
    height: pitch,
    display: "flex",
    alignItems: "center",
    gap: ICON_GAP * height,
    whiteSpace: "nowrap",
    flexShrink: 0,
  } as const;

  const label = {
    fontFamily: face,
    fontSize: font,
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: "0em",
  } as const;

  return (
    <AbsoluteFill style={{ backgroundColor: paper, overflow: "hidden" }}>
      {glowRadius > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle ${glowRadius * height}px at ${glowX * width}px ${glowY * height}px, ${glow} 0%, ${paper} 100%)`,
            opacity: introE,
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* The column. Its width is the widest row's — the query pill, in
            practice — so centring it centres the pill and leaves every step
            left-aligned to the pill's left edge, which is what the reference
            does. The scale pivots on the column's horizontal centre and on the
            running row's baseline row, so the finished rows spread away from
            the one line that is staying put. */}
        <div
          style={{
            position: "absolute",
            top: centerY * height - pitch / 2,
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "flex-start",
            transform: `translateY(${-offset * pitch}px) scale(${scale})`,
            transformOrigin: `50% ${(offset + 0.5) * pitch}px`,
          }}
        >
          <div
            style={{
              ...rowStyle,
              opacity: introE * settledOpacity,
              filter: introBlur > 0.01 ? `blur(${introBlur}px)` : undefined,
              transform: `scale(${interpolate(introE, [0, 1], [INTRO_SCALE, 1])})`,
            }}
          >
            <div
              style={{
                ...label,
                fontSize: font * QUERY_FONT_SCALE,
                // The prompt reads a step heavier than the log it starts. It is
                // the one line on screen the user wrote.
                fontWeight: 500,
                color: ink,
                background: pill,
                height: PILL_H * height,
                borderRadius: PILL_R * PILL_H * height,
                padding: `0 ${PILL_PAD * PILL_H * height}px`,
                display: "flex",
                alignItems: "center",
              }}
            >
              {query}
            </div>
          </div>

          {steps.map((step, i) => {
            const s = sched[i];
            if (fc <= s.enter) return null;
            const isDone = fc >= s.done;
            const isLast = i === lastIndex;
            const opacity =
              Easing.out(Easing.cubic)(ramp(fc, s.enter, ROW_FADE_S * fps)) *
              (isLast ? 1 - handoff : settledOpacity);
            const showCheck = isDone && (step.icon ?? "check") === "check";
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: the log is a fixed ordered list, so the index is the identity
                key={i}
                style={{
                  ...rowStyle,
                  width: "100%",
                  opacity,
                  // Only the running row travels, and only during the outro.
                  transform: isLast
                    ? `translateX(${50 * centred}%)`
                    : undefined,
                }}
              >
                <div
                  style={{
                    ...rowStyle,
                    height: pitch,
                    transform: isLast
                      ? `translateX(${-50 * centred}%)`
                      : undefined,
                  }}
                >
                  {showCheck ? (
                    <Check
                      size={iconSize}
                      color={accent}
                      strokeWidth={CHECK_W}
                    />
                  ) : (
                    <div style={{ opacity: isDone ? 1 : RUNNING_ICON }}>
                      <Globe
                        size={iconSize}
                        color={muted}
                        strokeWidth={GLOBE_W}
                        turn={isDone ? 0 : (fc / (SPIN_S * fps)) % 1}
                      />
                    </div>
                  )}
                  {/* The running label is *not* dimmed. Measured: the ref's
                      running and done labels carry the same ink per glyph
                      (ratio 1.04, which is the two strings' own width ratio).
                      Only the icon is faint while a step runs. */}
                  <span style={{ ...label, color: muted }}>
                    {isDone ? step.done : step.running}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* The result. Its own layer, centred on the frame rather than on the
          column, because by the time it lands there is no column left to
          align to. */}
      {resultIn > 0 ? (
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <div
            style={{
              position: "absolute",
              top: centerY * height - (RESULT_PILL_H * height) / 2,
              display: "flex",
              alignItems: "center",
              gap: ICON_GAP * RESULT_FONT_SCALE * height,
              height: RESULT_PILL_H * height,
              padding: `0 ${RESULT_PAD * PILL_H * height}px`,
              borderRadius: PILL_R * RESULT_PILL_H * height,
              background: pill,
              opacity: resultIn,
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {/* A glint, not a shine: one soft disc of the accent crossing the
                chip once. It is the only moment in the scene with any colour
                behind the type, so it has to be over before it is noticed. */}
            {glint > 0 && glint < 1 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle ${GLINT_R * height}px at ${glint * 130 - 15}% 50%, ${accent} 0%, transparent 100%)`,
                  opacity:
                    0.22 *
                    interpolate(glint, [0, 0.08, 0.85, 1], [0, 1, 1, 0], CLAMP),
                }}
              />
            ) : null}
            <Check
              size={iconSize * RESULT_FONT_SCALE}
              color={accent}
              strokeWidth={CHECK_W}
            />
            <span
              style={{
                ...label,
                fontSize: font * RESULT_FONT_SCALE,
                fontWeight: 500,
                color: ink,
                position: "relative",
              }}
            >
              {result}
            </span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}
