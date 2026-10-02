"use client";

const loadSans = (..._args: any[]) => ({fontFamily:"FredMiSans"});
import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  getRemotionEnvironment,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { inputStyleContext } from "../dependencies/Snapcn/registry/snap-cn-ui/input/index.tsx";
import {
  mixOklch,
  resolveFont,
  type SnapCnTheme,
  useSnapCnTheme,
  withAlpha,
} from "../dependencies/Snapcn/registry/snap-cn-ui/core/index.ts";

// Loaded through @remotion/google-fonts, never a CSS variable — a Remotion
// bundle has none of the app's CSS, so a `var(--font-…)` gets you the right face
// in the Player and a fallback in the mp4 (design-system rule 4).
const { fontFamily: SANS } = loadSans("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

// --- The stage -------------------------------------------------------------
//
// The reference recording is 890×486, and every ratio below was read off its
// frames, so there is no second conversion to get wrong. `stageScale` fits this
// rectangle into whatever composition the component is given.

const REF_W = 890;
const REF_H = 486;
/** How far past the stage the backdrop is painted, so a cut never frames off it. */
const BLEED = 1.4;
const OX = (REF_W * (BLEED - 1)) / 2;
const OY = (REF_H * (BLEED - 1)) / 2;

// --- Measured proportions --------------------------------------------------
//
// Everything the layout needs is either a fixed inset (a padding, which should
// not change when the type does) or a **ratio of a font size** (a type metric,
// which must). Feeding the defaults through `layoutFor` reproduces the
// recording's own geometry to a pixel; changing `fontSize`, `width`,
// `fieldHeight` or the labels moves the whole thing coherently instead of
// clipping against a constant that was tuned for one sentence.

/** Panel → field inset, and the panel's own bottom padding under the chips. */
const PAD = 4.7;
/** The panel sits a hair below the frame's centre line, as the reference's does. */
const PANEL_BIAS = 3.3;
/** Field text inset, and the line box, as multiples of the prompt's font size. */
const LINE_PAD_X = 1.12143;
const LINE_PAD_Y = 1.27857;
const LINE_HEIGHT = 1.21429;
const CARET_RATIO = 0.15714;
/** The chip row's own metrics, as multiples of the chip font size. */
const CHIP_HEIGHT = 2;
const CHIP_PAD_X = 0.93496;
const CHIP_GAP = 0.70732;
const CHIP_TOP = 0.54472;
/** The row starts a little inside the field's text inset. */
const CHIP_INSET = 0.72639;
/** The send button's corner, measured off the field's bottom-right. */
const SEND_RIGHT = 14.4;
const SEND_BOTTOM = 10.3;

// --- Measured timeline, in seconds -----------------------------------------

/** Reveal: a hairline at the panel's top edge that unrolls downward. */
const PANEL_GROW = 0.445;
/** The writing surface finishes first — 0.83 of the panel's own duration. */
const FIELD_GROW = 0.831;
/** The panel also widens as it unrolls — 0.93 of its width to all of it. */
const WIDEN = 0.2;
const WIDEN_FROM = 0.93;
/** Placeholder and send button, together, on a straight ramp. */
const FIELD_FADE = 0.3;
/** Each chip fades up over this, rising as it goes. */
const CHIP_DUR = 0.59;
const CHIP_RISE = 11.4;
/** Caret blink half-cycle, re-anchored on every keystroke. */
const BLINK = 0.474;
/** Press, then release, on the send button. */
const PRESS_DOWN = 0.067;
const PRESS_UP = 0.25;
const PRESS_SCALE = 0.87;

/**
 * The unroll. Nearly linear out of the gate, then a long settle — fitted to the
 * panel's measured height on twenty frames (rmse 2.5px on a 167px box).
 */
const REVEAL_EASE = Easing.bezier(0.3, 0, 0.35, 1);
/** The chips' rise. Fitted separately: it is a harder ease-out than the unroll. */
const CHIP_EASE = Easing.bezier(0.2, 0, 0.25, 1);
/** Real mouse deceleration — half the distance in the first eighth of the move. */
const CURSOR_EASE = Easing.bezier(0.16, 1, 0.3, 1);

// --- Pure helpers (unit-tested) --------------------------------------------

/** Eased 0→1 for a beat that starts at `at` and runs for `dur` seconds. */
export function beat(
  t: number,
  at: number,
  dur: number,
  ease: (n: number) => number = REVEAL_EASE,
): number {
  if (dur <= 0) return t >= at ? 1 : 0;
  return interpolate(t, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
}

/**
 * Characters revealed at `t`, on an **ease-in-out sine** over `dur`.
 *
 * This is the one measurement that surprised: the reference does not type at a
 * constant rate. It accelerates in and decelerates out — 17 chars/sec over the
 * first word, 33 in the middle, and a visible settle on the last three. Fitting
 * a sine ease to the character count read off twenty-four frames lands within
 * **0.30 characters rms** across all 69, which no constant rate comes close to.
 *
 * It is also what makes the shot work: the camera rides this same curve, so the
 * push never jerks and never coasts.
 */
export function typedCount(
  t: number,
  start: number,
  dur: number,
  total: number,
): number {
  if (t <= start) return 0;
  if (dur <= 0 || t >= start + dur) return total;
  const u = (t - start) / dur;
  return Math.min(total, Math.round((total * (1 - Math.cos(Math.PI * u))) / 2));
}

/** Continuous 0→1 of the same curve — what the camera and the field ride. */
export function typedProgress(t: number, start: number, dur: number): number {
  if (t <= start) return 0;
  if (dur <= 0 || t >= start + dur) return 1;
  return (1 - Math.cos((Math.PI * (t - start)) / dur)) / 2;
}

/**
 * When the `count`-th character landed — the inverse of the sine ease.
 *
 * Needed because a caret does not blink on a wall clock, it blinks a fixed
 * interval after the last thing you typed. Anchoring the blink here is what
 * keeps it solid through the sentence and gets the two measured blinks after it
 * (off at 4.27s, on at 4.74s) for free.
 */
export function keystrokeAt(
  count: number,
  start: number,
  dur: number,
  total: number,
): number {
  if (count <= 0 || total <= 0) return start;
  const p = Math.min(1, count / total);
  return start + (dur * Math.acos(1 - 2 * p)) / Math.PI;
}

/** Caret visibility: solid while typing, then blinking from the last keystroke. */
export function caretOn(t: number, anchor: number, half: number): boolean {
  if (t < anchor) return false;
  if (half <= 0) return true;
  return Math.floor((t - anchor) / half) % 2 === 0;
}

export interface CameraShot {
  scale: number;
  x: number;
  y: number;
}

/**
 * The camera, as three hard states — there is no interpolation between them.
 *
 * Measured on the reference: the wide view is whole on one frame and fully
 * pushed in on the very next (1.958s → 1.975s), and the same again on the way
 * back out at 4.008s. Nothing in between, either time. Ramping it, even across
 * two frames, turns a cut into a zoom and the shot stops snapping.
 *
 * What *does* move is the middle state. It is not a fixed frame: it is pinned to
 * the caret, so as the sentence grows the camera tracks left with it. The pin is
 * on the **continuous** typing curve, not on the character count — which is why
 * the caret in the reference wobbles ±8px around its mark instead of sitting
 * dead still. Each keystroke jumps it forward; the camera slides underneath.
 *
 * Both marks are *fractions of the frame*, never pixel offsets, so a wider panel
 * or a bigger type size reframes rather than drifting off the edge.
 */
export function cameraFor(
  t: number,
  o: {
    cutInAt: number;
    cutOutAt: number;
    zoomIn: number;
    zoomOut: number;
    caretX: number;
    caretY: number;
    sendX: number;
    sendY: number;
    focusX: number;
    focusY: number;
    outX: number;
    outY: number;
  },
): CameraShot {
  if (t >= o.cutOutAt) {
    return {
      scale: o.zoomOut,
      x: o.outX * REF_W - o.zoomOut * o.sendX,
      y: o.outY * REF_H - o.zoomOut * o.sendY,
    };
  }
  if (t >= o.cutInAt) {
    return {
      scale: o.zoomIn,
      x: o.focusX * REF_W - o.zoomIn * o.caretX,
      y: o.focusY * REF_H - o.zoomIn * o.caretY,
    };
  }
  return { scale: 1, x: 0, y: 0 };
}

/**
 * Greedy row-fill for the suggestion row.
 *
 * Four short labels are one row and that is the shot the reference shows, but a
 * component that only works for four short labels is one that breaks the first
 * time somebody writes a real one. Anything that will not fit wraps, the panel
 * grows by exactly the rows it gained, and the stagger keeps running in label
 * order across them.
 */
export function packChipRows(
  widths: number[],
  available: number,
  gap: number,
): number[][] {
  const rows: number[][] = [];
  let row: number[] = [];
  let used = 0;
  widths.forEach((w, i) => {
    if (row.length > 0 && used + gap + w > available) {
      rows.push(row);
      row = [];
      used = 0;
    }
    used += row.length === 0 ? w : gap + w;
    row.push(i);
  });
  if (row.length > 0) rows.push(row);
  return rows;
}

export interface PromptSendLayout {
  panelTop: number;
  panelWidth: number;
  panelHeight: number;
  pad: number;
  fieldHeight: number;
  fieldRadius: number;
  /** Prompt line, relative to the panel's own box. */
  lineX: number;
  lineY: number;
  lineHeight: number;
  /** How much line fits before the field has to scroll under the caret. */
  lineMaxWidth: number;
  caretWidth: number;
  /** Suggestion row: `chipsX` from the panel's left, `chipsGap` below the field. */
  chipsX: number;
  chipsGap: number;
  chipHeight: number;
  chipPadX: number;
  chipGap: number;
  chipRows: number[][];
  sendSize: number;
  sendRight: number;
  sendBottom: number;
}

/**
 * The whole geometry, from four numbers and the measured label widths.
 *
 * Every offset the recording gave up is in here either as a fixed inset or as a
 * ratio of a font size, so the defaults reproduce the reference exactly and any
 * other content still lands somewhere sensible. The panel's height is *derived*
 * — padding, field, the gap, however many chip rows there turned out to be — so
 * it hugs its content rather than being a constant that fits one sentence.
 */
export function layoutFor(o: {
  width: number;
  fieldHeight: number;
  fontSize: number;
  chipFontSize: number;
  radius: number;
  sendSize: number;
  chipWidths: number[];
}): PromptSendLayout {
  const lineX = PAD + o.fontSize * LINE_PAD_X;
  const chipHeight = o.chipFontSize * CHIP_HEIGHT;
  const chipGap = o.chipFontSize * CHIP_GAP;
  const chipsX = PAD + (lineX - PAD) * CHIP_INSET;
  const chipRows = packChipRows(o.chipWidths, o.width - chipsX * 2, chipGap);
  const chipsGap = o.chipFontSize * CHIP_TOP;

  // The line only yields room to the send button when the two actually share a
  // row. On the reference's 121px field they do not — the button sits well below
  // the text — so the full width is the line's. Shrink the field to a single-row
  // control and the line starts scrolling before it can run under the button.
  const lineBottom = PAD + o.fontSize * LINE_PAD_Y + o.fontSize * LINE_HEIGHT;
  const sendTop = PAD + o.fieldHeight - SEND_BOTTOM - o.sendSize;
  const sendGutter =
    lineBottom > sendTop ? o.sendSize + SEND_RIGHT + o.fontSize * 0.5 : 0;

  // No chips → the panel simply hugs the field. With chips it opens up by the
  // gap, the rows it needs, and its own bottom padding.
  const below =
    chipRows.length === 0
      ? PAD
      : chipsGap +
        chipRows.length * chipHeight +
        (chipRows.length - 1) * chipGap +
        PAD * 2;
  const panelHeight = PAD + o.fieldHeight + below;

  return {
    panelTop: (REF_H - panelHeight) / 2 + PANEL_BIAS,
    panelWidth: o.width,
    panelHeight,
    pad: PAD,
    fieldHeight: o.fieldHeight,
    fieldRadius: Math.max(0, o.radius - 2),
    lineX,
    lineY: PAD + o.fontSize * LINE_PAD_Y,
    lineHeight: o.fontSize * LINE_HEIGHT,
    lineMaxWidth: Math.max(0, o.width - lineX * 2 - sendGutter),
    caretWidth: o.fontSize * CARET_RATIO,
    chipsX,
    chipsGap,
    chipHeight,
    chipPadX: o.chipFontSize * CHIP_PAD_X,
    chipGap,
    chipRows,
    sendSize: o.sendSize,
    sendRight: SEND_RIGHT,
    sendBottom: SEND_BOTTOM,
  };
}

/** Accepts an array or the comma-separated string the customizer passes. */
export function chipList(chips?: string[] | string): string[] {
  const list = typeof chips === "string" ? chips.split(",") : (chips ?? []);
  return list.map((c) => c.trim()).filter(Boolean);
}

// One measuring context, reused. `measureText` runs once per label per frame,
// and allocating a canvas each time is the sort of thing that only shows up
// when somebody renders four minutes of it.
let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Advance width of `text`, measured on the face we actually draw. */
export function measureWidth(
  text: string,
  size: number,
  family: string = SANS,
  weight = 400,
): number {
  if (!text) return 0;
  if (typeof document === "undefined") return text.length * size * 0.5;
  if (measureCtx === undefined) {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) return text.length * size * 0.5;
  measureCtx.font = `${weight} ${size}px ${family}, system-ui, sans-serif`;
  return measureCtx.measureText(text).width;
}

// --- Cursor ----------------------------------------------------------------

/**
 * The pointing hand, at the size the recording caught it: 18×27, hotspot on the
 * fingertip. Drawn in **stage** space, outside the camera — a pointer is a
 * property of the screen, not of the thing on it, so it must not scale when the
 * camera cuts in.
 */
function HandCursor({
  x,
  y,
  size,
  fill,
  stroke,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  stroke: string;
}) {
  return (
    <svg
      viewBox="0 0 18 27"
      width={size * (18 / 27)}
      height={size}
      style={{
        position: "absolute",
        // The hotspot is the fingertip, which sits 6.2 of 18 across the glyph
        // and 1 of 27 down it — not the box's corner.
        left: x - size * (6.2 / 27),
        top: y - size * (1 / 27),
        display: "block",
        filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.28))",
      }}
    >
      <title>Pointer</title>
      <path
        d="M4.1 15.6V3.1a2.1 2.1 0 0 1 4.2 0v7.6h.6l.3-1.5a1.7 1.7 0 0 1 3.4.3v1.5l.4-.5a1.7 1.7 0 0 1 3 1.1v1.1l.4-.2a1.6 1.6 0 0 1 1.9 1.6v4.6c0 3.6-2.4 6.3-6.1 6.3H9.6c-2.6 0-4-1-5.2-2.7l-3.2-4.6a1.7 1.7 0 0 1 2.5-2.2l.4.4Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The send glyph: an up arrow, drawn to fill its disc the way the reference does. */
function SendArrow({ size, color }: { size: number; color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      <title>Send</title>
      <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
    </svg>
  );
}

// --- Props -----------------------------------------------------------------

export interface PromptSendProps {
  /** The brief that types itself. Any length — the field scrolls under the caret. */
  text?: string;
  /** Shown until the first character lands. */
  placeholder?: string;
  /**
   * The suggestion row under the field. Pass an array, or the comma-separated
   * string the customizer sends. They wrap, and the panel grows to hold them;
   * pass `[]` for a bare field.
   */
  chips?: string[] | string;
  /** Replaces the up-arrow in the send button. */
  sendIcon?: ReactNode;

  // --- Size. Every default is the recording's own measurement. ---
  /** Panel width, in stage px (the stage is 890×486, scaled to the composition). */
  width?: number;
  /** Height of the writing surface. The panel's height follows from it. */
  fieldHeight?: number;
  /** Prompt type size. The line box, caret and field padding all follow from it. */
  fontSize?: number;
  /** Chip label size. Chip height, padding and the row gap all follow from it. */
  chipFontSize?: number;
  /** Panel corner radius. The field's is this less 2, as the reference's is. */
  radius?: number;
  /** Diameter of the send button. */
  sendSize?: number;
  /** Overrides the loaded Inter — only useful if you have already loaded a face. */
  fontFamily?: string;

  // --- Timing, in seconds. ---
  /** When the panel starts to unroll, and how long the unroll takes. */
  revealAt?: number;
  revealDuration?: number;
  /** When the placeholder and the send button fade up. */
  fieldAt?: number;
  /** When the caret arrives (whole — it does not fade). */
  caretAt?: number;
  /** When the first chip starts, and the gap between them. */
  chipsAt?: number;
  chipStagger?: number;
  /** When typing starts, and how long the whole sentence takes. */
  typeStart?: number;
  typeDuration?: number;
  /** When the view cuts in to the caret, and back out to the button. */
  cutInAt?: number;
  cutOutAt?: number;
  /** How far each cut pushes. Both are measured off the reference. */
  zoomIn?: number;
  zoomOut?: number;
  /** Where the caret sits in frame while the camera rides it. */
  focusX?: number;
  focusY?: number;
  /** Where the send button sits in frame after the second cut. */
  outX?: number;
  outY?: number;
  /** When the pointer starts its approach, how long it takes, and when it clicks. */
  cursorAt?: number;
  cursorDuration?: number;
  clickAt?: number;
  /** Show the pointer at all. Off drops the click and the send bloom with it. */
  cursor?: boolean;

  // --- Paint. ---
  /** The wash behind the panel and the send bloom. Defaults to `theme.primary`. */
  accentColor?: string;
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
  speed?: number;
}

// --- Main composition ------------------------------------------------------

/**
 * A prompt composer that unrolls from a hairline, writes a brief into itself
 * while the camera rides the caret, then cuts back out and gets sent.
 *
 * ## Four things were measured, and they are the component
 *
 * **The unroll.** It does not fade in and it does not scale up from nothing. A
 * 2px white line appears at the panel's top edge and the box grows *downward*
 * out of it — top edge pinned, bottom edge travelling its full height in 445ms —
 * while the width goes from 0.93 to 1. The writing surface and the chip strip
 * are two separate heights on the same curve with different durations, which is
 * why the strip surfaces from under the field late rather than being there from
 * the first frame.
 *
 * **The typing is eased.** 17 chars/sec on the first word, 33 in the middle, and
 * a visible settle on the last three. An ease-in-out sine over the character
 * count fits all 69 of the reference's to within 0.30 characters rms; no
 * constant rate is close.
 *
 * **The camera cuts, and then it rides.** 2.327× in a single frame, landing with
 * the caret 57% across the frame, then tracking left with the sentence — pinned
 * to the *continuous* typing curve, so the caret wobbles ±8px about its mark as
 * each character jumps ahead of the slide. Then it cuts again, out to 1.44×,
 * centred on the send button, which is where the pointer is already heading.
 *
 * **The pointer is a real mouse.** It enters the bottom-right corner and its
 * distance to the button halves every 44ms — an exponential approach, not a
 * constant glide. It is drawn outside the camera because a pointer belongs to
 * the screen, not to the scene, and must not grow when the shot pushes in.
 *
 * ## Nothing here is a constant tuned to one sentence
 *
 * Every offset above is either a fixed inset or a ratio of a font size, and
 * `layoutFor` turns four numbers — `width`, `fieldHeight`, `fontSize`,
 * `chipFontSize` — into the whole geometry. Longer copy scrolls the field under
 * the caret instead of running past its edge; more chips wrap and the panel
 * grows by exactly the rows they needed; no chips at all and it hugs the field.
 * Both camera marks are fractions of the frame, so a wider panel reframes rather
 * than drifting off it.
 *
 * ## What is not measured
 *
 * The colours and the wording. The reference is a specific product with a
 * specific blue; none of that belongs in a component that ships to strangers and
 * lands next to somebody else's `Input` (design-system rule 5). The paint is the
 * shadcn token set, the field takes its surface from the `Input` primitive's own
 * style context so the two cannot drift, the wash is layered from `accentColor`
 * (`theme.primary` by default), and every string is a prop.
 */
export function PromptSend({
  text = "Add a text reveal, a soft blur transition, and a gradient background",
  placeholder = "Describe the scene you want…",
  chips = [
    "Add a text reveal",
    "Try a blur transition",
    "Pick a background",
    "Assemble a scene",
  ],
  sendIcon,
  width = 636.2,
  fieldHeight = 121.2,
  fontSize = 14,
  chipFontSize = 12.3,
  radius = 22,
  sendSize = 27.4,
  fontFamily,
  revealAt = 0.025,
  revealDuration = PANEL_GROW,
  fieldAt = 0.417,
  caretAt = 0.742,
  chipsAt = 0.545,
  chipStagger = 0.1,
  typeStart = 0.915,
  typeDuration = 3.025,
  cutInAt = 1.975,
  cutOutAt = 4.008,
  zoomIn = 2.327,
  zoomOut = 1.44,
  focusX = 0.573,
  focusY = 0.4881,
  outX = 0.5305,
  outY = 0.5261,
  cursorAt = 4.042,
  cursorDuration = 0.42,
  clickAt = 4.658,
  cursor = true,
  accentColor,
  theme,
  mode,
  speed = 1,
}: PromptSendProps) {
  const frame = useCurrentFrame();
  const { width: compWidth, height: compHeight, fps } = useVideoConfig();
  const t = useSnapCnTheme(theme, mode);
  const face = resolveFont(fontFamily ?? t.fontFamily) ?? SANS;
  const ui = inputStyleContext(t);
  const accent = accentColor ?? t.primary;

  const now = (frame * speed) / fps;
  const stageScale = Math.min(compWidth / REF_W, compHeight / REF_H);

  // --- layout -------------------------------------------------------------
  const labels = chipList(chips);
  const L = layoutFor({
    width,
    fieldHeight,
    fontSize,
    chipFontSize,
    radius,
    sendSize,
    chipWidths: labels.map(
      (c) =>
        measureWidth(c, chipFontSize, face) + chipFontSize * CHIP_PAD_X * 2 + 2,
    ),
  });

  // --- reveal -------------------------------------------------------------
  const panelH = L.panelHeight * beat(now, revealAt, revealDuration);
  const fieldH =
    L.fieldHeight * beat(now, revealAt, revealDuration * FIELD_GROW);
  const panelW =
    L.panelWidth * (WIDEN_FROM + (1 - WIDEN_FROM) * beat(now, revealAt, WIDEN));
  const panelLeft = (REF_W - panelW) / 2;
  // The chips hang off the field's bottom edge, so they ride its growth and are
  // already in place by the time the first one fades up.
  const fieldBottom = L.pad + fieldH;

  const fieldIn = interpolate(now, [fieldAt, fieldAt + FIELD_FADE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- typing -------------------------------------------------------------
  const count = typedCount(now, typeStart, typeDuration, text.length);
  const typed = text.slice(0, count);
  const progress = typedProgress(now, typeStart, typeDuration);
  const fullWidth = measureWidth(text, fontSize, face);

  // The line rides the *continuous* curve, so a sentence longer than the field
  // scrolls under the caret the way a real single-line input does — and the
  // caret, quantised to whole characters, hops either side of the mark rather
  // than the whole line jerking once per keystroke.
  const advance = fullWidth * progress;
  const room = Math.max(0, L.lineMaxWidth - L.caretWidth);
  const scrolled = Math.max(0, advance - room);
  const caretSceneX = panelLeft + L.lineX + Math.min(advance, room);

  const caretAnchor =
    count === 0
      ? caretAt
      : // Clamped to `now`: the count is rounded, so the inverse of the ease can
        // put the "last keystroke" a few milliseconds in the future — and a
        // blink anchored in the future reads as a caret that is off while you
        // are typing.
        Math.min(
          now,
          Math.max(
            caretAt,
            // `count - 0.5` because the count is *rounded*: the character
            // appears when the eased value crosses the half, and that crossing
            // is the keystroke the caret's blink hangs off.
            keystrokeAt(count - 0.5, typeStart, typeDuration, text.length),
          ),
        );
  const caretLit = now >= caretAt && caretOn(now, caretAnchor, BLINK);

  // --- camera -------------------------------------------------------------
  const sendX = panelLeft + panelW - L.pad - L.sendRight - L.sendSize / 2;
  const sendY =
    L.panelTop + L.pad + L.fieldHeight - L.sendBottom - L.sendSize / 2;
  const shot = cameraFor(now, {
    cutInAt,
    cutOutAt,
    zoomIn,
    zoomOut,
    caretX: caretSceneX,
    caretY: L.panelTop + L.lineY + L.lineHeight / 2,
    sendX,
    sendY,
    focusX,
    focusY,
    outX,
    outY,
  });

  // --- pointer ------------------------------------------------------------
  const approach = interpolate(
    now,
    [cursorAt, cursorAt + cursorDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: CURSOR_EASE,
    },
  );
  // It parks just up and right of dead centre on the button, which is where a
  // hand cursor actually lands when you aim at a target this size.
  const sendScreenX = shot.x + shot.scale * sendX + sendSize * 0.098;
  const sendScreenY = shot.y + shot.scale * sendY - sendSize * 0.091;
  const cursorX = interpolate(approach, [0, 1], [REF_W * 0.86, sendScreenX]);
  const cursorY = interpolate(approach, [0, 1], [REF_H * 1.02, sendScreenY]);

  // --- press and send -----------------------------------------------------
  const press = !cursor
    ? 0
    : now < clickAt
      ? 0
      : now < clickAt + PRESS_DOWN
        ? (now - clickAt) / PRESS_DOWN
        : Math.max(0, 1 - (now - clickAt - PRESS_DOWN) / PRESS_UP);
  const pressScale = 1 - (1 - PRESS_SCALE) * press;
  // The send bloom. It opens 220ms after the press — the reference's does — and
  // sweeps across the field rather than sitting still. The recording ends 140ms
  // into it, so the opening is measured and the rest is ours.
  const glow = !cursor
    ? 0
    : beat(now, clickAt + 0.22, 0.3, Easing.out(Easing.quad));
  const sweep = beat(now, clickAt + 0.22, 1.1, Easing.out(Easing.quad));

  // --- paint --------------------------------------------------------------
  // A hairline is specified at a 40px control; this panel is much taller, so the
  // token is walked toward the background through the system's own mix rather
  // than by picking a lighter grey (design-system rule 3b).
  const hairline = mixOklch(ui.idleBorder, t.background, 0.1);
  const surface = withAlpha(t.card, 0.94);
  const glassy = withAlpha(t.card, 0.52);
  const sendIdle = mixOklch(t.foreground, t.card, 0.55);
  const armed = count > 0;

  const isRendering = getRemotionEnvironment().isRendering;
  const willChange = isRendering ? undefined : ("transform" as const);

  return (
    <AbsoluteFill style={{ background: t.background }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: REF_W,
          height: REF_H,
          transform: `translate(-50%, -50%) scale(${stageScale})`,
          overflow: "hidden",
        }}
      >
        {/* The camera. A plain static transform per shot — never interpolated
            between them, so there is no frame on which a cut is halfway. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${shot.x}px, ${shot.y}px) scale(${shot.scale})`,
            transformOrigin: "0 0",
            willChange,
          }}
        >
          {/* The backdrop rides *inside* the camera, because on the reference it
              does — the wash grows with everything else when the shot pushes in.
              It is drawn on an oversized box (and positioned in px, not %, so
              the maths stays the stage's) because the second cut frames past the
              stage's right edge and a wash that stopped there would show a seam.

              The shape is the reference's: a cool field falling from the top
              right, a bright patch left of centre, a warm corner under it. The
              paint is not — it is layered as alpha over the installer's own
              `background` and `accentColor` (design-system rule 5). Alpha, not
              `mixOklch`: hue interpolation from a near-neutral page colour to
              blue takes the short way round, through green. */}
          <div
            style={{
              position: "absolute",
              left: -OX,
              top: -OY,
              width: REF_W * BLEED,
              height: REF_H * BLEED,
              background: t.background,
              backgroundImage: [
                `radial-gradient(${0.96 * REF_W}px ${0.8 * REF_H}px at ${OX + 0.06 * REF_W}px ${OY + 0.98 * REF_H}px, ${withAlpha(t.background, 0.9)} 0%, transparent 62%)`,
                `radial-gradient(${0.74 * REF_W}px ${0.62 * REF_H}px at ${OX + 0.1 * REF_W}px ${OY + 0.46 * REF_H}px, ${withAlpha(t.card, 0.42)} 0%, transparent 66%)`,
                `linear-gradient(215deg, ${withAlpha(accent, 0.5)} 0%, ${withAlpha(accent, 0.28)} 52%, ${withAlpha(accent, 0.14)} 100%)`,
              ].join(","),
            }}
          />

          {/* ---- The glass panel */}
          <div
            style={{
              position: "absolute",
              left: panelLeft,
              top: L.panelTop,
              width: panelW,
              height: panelH,
              borderRadius: radius,
              background: glassy,
              // The hairline is an inset shadow, not a border: a border is
              // layout, and every measured offset below is from the panel's own
              // box. One pixel of border would push all of them one pixel in.
              boxShadow: `inset 0 0 0 1px ${withAlpha(t.card, 0.6)}, 0 12px 32px ${withAlpha(t.foreground, 0.05)}`,
              overflow: "hidden",
            }}
          >
            {/* ---- The writing surface */}
            <div
              style={{
                position: "absolute",
                left: L.pad,
                top: L.pad,
                width: Math.max(0, panelW - L.pad * 2),
                height: fieldH,
                borderRadius: L.fieldRadius,
                background: surface,
                boxShadow: `0 6px 18px ${withAlpha(t.foreground, 0.05)}`,
                overflow: "hidden",
              }}
            >
              {/* The send bloom: what the click buys you. Inside the field so it
                  is clipped by its radius, the way the reference's is. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: glow,
                  background: `radial-gradient(80% 170% at ${16 + sweep * 66}% 96%, ${withAlpha(accent, 0.55)} 0%, transparent 66%)`,
                }}
              />

              {/* The prompt line, translated left once the sentence outgrows the
                  field. Caret between the value and the placeholder, which is
                  where the reference puts it — the placeholder starts one caret
                  width right of the text origin, not on it. */}
              <div
                style={{
                  position: "absolute",
                  left: L.lineX - L.pad - scrolled,
                  top: L.lineY - L.pad,
                  display: "flex",
                  alignItems: "center",
                  height: L.lineHeight,
                  fontFamily: face,
                  fontWeight: 400,
                  fontSize,
                  lineHeight: `${L.lineHeight}px`,
                  color: t.foreground,
                  whiteSpace: "pre",
                  textRendering: "geometricPrecision",
                }}
              >
                {typed}
                <span
                  style={{
                    display: "inline-block",
                    width: L.caretWidth,
                    height: L.lineHeight,
                    background: t.foreground,
                    opacity: caretLit ? 1 : 0,
                    flexShrink: 0,
                  }}
                />
                {count === 0 ? (
                  <span style={{ color: ui.mutedForeground, opacity: fieldIn }}>
                    {placeholder}
                  </span>
                ) : null}
              </div>

              {/* ---- Send */}
              <div
                style={{
                  position: "absolute",
                  right: L.sendRight,
                  bottom: L.sendBottom,
                  width: L.sendSize,
                  height: L.sendSize,
                  borderRadius: L.sendSize / 2,
                  background: armed ? t.foreground : sendIdle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: fieldIn,
                  transform: `scale(${pressScale})`,
                  willChange,
                }}
              >
                {sendIcon ?? (
                  <SendArrow size={L.sendSize * 0.56} color={t.card} />
                )}
              </div>
            </div>

            {/* ---- Suggestions */}
            <div
              style={{
                position: "absolute",
                left: L.chipsX,
                top: fieldBottom + L.chipsGap,
                right: L.chipsX,
                display: "flex",
                flexDirection: "column",
                gap: L.chipGap,
              }}
            >
              {L.chipRows.map((row) => (
                <div
                  key={row.join("-")}
                  style={{ display: "flex", gap: L.chipGap }}
                >
                  {row.map((i) => {
                    const p = beat(
                      now,
                      chipsAt + i * chipStagger,
                      CHIP_DUR,
                      CHIP_EASE,
                    );
                    return (
                      <div
                        key={labels[i]}
                        style={{
                          boxSizing: "border-box",
                          height: L.chipHeight,
                          padding: `0 ${L.chipPadX}px`,
                          borderRadius: L.chipHeight / 2,
                          background: t.card,
                          border: `1px solid ${hairline}`,
                          color: t.foreground,
                          fontFamily: face,
                          fontWeight: 400,
                          fontSize: chipFontSize,
                          // The label rides low in the pill on the reference,
                          // which is what stops a small label in a round pill
                          // reading as though it were floating.
                          paddingTop: chipFontSize * 0.17073,
                          lineHeight: `${L.chipHeight - 4}px`,
                          whiteSpace: "nowrap",
                          textRendering: "geometricPrecision",
                          opacity: p,
                          transform: `translateY(${(1 - p) * CHIP_RISE}px)`,
                          willChange,
                        }}
                      >
                        {labels[i]}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {cursor && approach > 0 ? (
          <HandCursor
            x={cursorX}
            y={cursorY}
            size={27}
            fill={t.card}
            stroke={mixOklch(t.foreground, t.card, 0.2)}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
