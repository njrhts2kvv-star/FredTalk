"use client";

import {
  Easing,
  getRemotionEnvironment,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  mixOklch,
  resolveFont,
  type SnapCnTheme,
  useSnapCnTheme,
  withAlpha,
} from "../dependencies/Snapcn/registry/snap-cn-ui/core/index.ts";

export type TerminalLineType = "command" | "log" | "success" | "error";

/** Package-manager command panel — the flythrough's second station. */
export interface CommandSpec {
  /** Tab labels. The first is the active tab. */
  managers?: string[];
  /** The command typed into the active tab, e.g. "npm install One Tool". */
  text: string;
}

export interface TerminalLine {
  text: string;
  type: TerminalLineType;
  /** Frame gap before this line starts typing. Defaults to 8. */
  delay?: number;
  /**
   * Extra freeze-frame pause AFTER this line finishes typing, in frames.
   * Use this to build tension before the next batch of logs. If omitted,
   * lines whose text ends in "..." auto-freeze for 18 frames.
   */
  pause?: number;
}

export interface TerminalZoom {
  /** Turn the extra landing zoom on. */
  enabled: boolean;
  /** Camera zoom the final punch-in lands at. Defaults to 2.4. */
  scale?: number;
  /** Kept for API compatibility; the flythrough camera always leads the eye. */
  followCursor?: boolean;
}

export interface TerminalSimulatorProps {
  lines?: TerminalLine[];
  /**
   * Headline at the first camera station. Wrap words in `*asterisks*` to tint
   * them with the accent gradient. `null`/"" skips the station — the camera
   * starts on the command panel instead.
   */
  intro?: string | null;
  /**
   * Command panel at the second camera station. `null` skips the station.
   */
  command?: CommandSpec | null;
  /** Command-panel surface color. */
  /** Overrides the design system's `card`. */
  background?: string;
  /** Hairline border color for the command-panel ring and divider. */
  /** Overrides the design system's `border`. */
  borderColor?: string;
  /** Design-system token overrides. */
  theme?: Partial<SnapCnTheme>;
  /** Defaults to `"dark"` — a terminal is lit for dark. */
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
  fontSize?: number;
  /**
   * Reveal speed. The reveal is CHUNKED — every `1 / charsPerFrame` frames
   * bumps the cursor by `chunkSize` characters, so output appears in bursts
   * instead of dripping char-by-char.
   */
  charsPerFrame?: number;
  /** Characters revealed per step. */
  chunkSize?: number;
  /**
   * Landing zoom of the final punch onto the terminal. Pass `true` for the
   * 2.4x default or an object for a custom scale. Off = 1.5x.
   */
  zoom?: boolean | TerminalZoom;
  speed?: number;
  className?: string;
}

// ─── Stage & camera constants ────────────────────────────────────────────────
// The scene is ONE world the camera flies over. Nothing enters from a screen
// edge — the camera pans/zooms between three fixed stations on a single black
// canvas, exactly like a camera-type-flythrough.

// The stage, the panel and the tab row are app chrome and come from the design
// system. The syntax palette below is the terminal's own colour scheme — the
// look, not chrome — and stays literal, exposed through props.

/** Station anchors in world px (world is sized for a 1280x720 viewport). */
const INTRO_POS = { x: 640, y: 360 };
const CMD_POS = { x: 2140, y: 520 };
const TERM_POS = { x: 2140, y: 1660 };

/** Camera timeline (frames at speed 1). */
const DRIFT_START = 22; // intro starts creeping left
const WHIP_START = 40; // sudden acceleration toward the command panel
const CMD_ARRIVE = 70; // camera lands on the command panel
const CMD_TYPE_START = 74; // "npm install One Tool" starts typing
const PUSH_END = 112; // slow push-in while typing (leaves the ghost trail)
const PULL_END = 138; // zoom-out + descend toward the terminal
const PUNCH_END = 158; // sudden punch-in lands on the terminal
const TERM_TYPE_START = 146; // terminal lines start typing as we land

/** Command-panel geometry in world px. */
const CMD_W = 760;
const CMD_H = 170;

/** Terminal station geometry in world px (sized against the reference). */
const TERM_BAR_OFFSET = 137; // bar sits this far left of the focus point
const TERM_TEXT_OFFSET = 90; // text column left edge relative to focus
const TERM_BLOCK_TOP = 215; // first line sits this far above the focus point
const TERM_LINE_H = 83;
const TERM_FONT = 44;

/** Lead-in used for the terminal lines' start schedule. */
const LEAD_IN_FRAMES = 10;

// ─── Palette (matched against the reference stills) ─────────────────────────

/** Accent gradient for `*emphasized*` intro words. */
const ACCENT_GRADIENT = "linear-gradient(90deg, #7C96FF 0%, #A78BFA 100%)";

/** Command-row syntax palette: dim manager/subcommand, highlighted args. */
const CMD_MANAGER_COLOR = "#A0673F";
const CMD_SUBCOMMAND_COLOR = "#64789B";
const CMD_ARG_COLOR = "#D7E4F8";

/** Focus-terminal palette. */
const TERM_ACCENT = "#2EA043";
const TERM_CURSOR = "#1D5B36";
const TERM_COLORS: Record<TerminalLineType, string> = {
  command: "#F2F5F3",
  log: "#6E7873",
  success: "#1F8039",
  error: "#F04438",
};

/** Functional color map kept for the public helper API. */
const TYPE_COLORS: Record<TerminalLineType, string> = TERM_COLORS;

const SANS_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif';
const MONO_FAMILY = "ui-monospace, SFMono-Regular, Menlo, monospace";

const DEFAULT_INTRO = "*work* one step at a *time.*";

const DEFAULT_COMMAND: CommandSpec = {
  managers: ["npm", "pnpm", "yarn", "bun"],
  text: "npm install One Tool",
};

const DEFAULT_LINES: TerminalLine[] = [
  { text: "{labels: ['bug']})", type: "log", delay: 0 },
  { text: "→   label added", type: "success", delay: 6 },
  { text: "$", type: "log", delay: 10 },
  { text: "One task", type: "command", delay: 4 },
];

// ─── Pure helpers ────────────────────────────────────────────────────────────

/** Auto freeze-frame heuristic: any line ending in "..." holds the camera. */
export function autoPause(line: TerminalLine): number {
  if (line.pause !== undefined) return line.pause;
  if (line.text.trimEnd().endsWith("...")) return 18;
  return 0;
}

/** Frames the chunked reveal needs to type `textLength` characters. */
export function typingDuration(
  textLength: number,
  charsPerFrame: number,
  chunkSize: number,
): number {
  return Math.ceil(textLength / (chunkSize * charsPerFrame));
}

/**
 * Cumulative start frame for each line, including per-line delays and the
 * auto/explicit freeze pauses AFTER a line finishes typing.
 */
export function computeLineStarts(
  lines: TerminalLine[],
  charsPerFrame: number,
  chunkSize: number,
  leadIn: number = LEAD_IN_FRAMES,
): number[] {
  const starts: number[] = [];
  let acc = leadIn;
  for (const line of lines) {
    acc += line.delay ?? 8;
    starts.push(acc);
    acc +=
      typingDuration(line.text.length, charsPerFrame, chunkSize) +
      autoPause(line);
  }
  return starts;
}

/**
 * Chunked reveal: Math.floor of an interpolated count, snapped up to the
 * nearest multiple of `chunkSize`. This is what gives the bursty terminal
 * feel — text doesn't drip, it lurches.
 */
export function chunkedReveal(
  localFrame: number,
  totalChars: number,
  charsPerFrame: number,
  chunkSize: number,
): number {
  if (totalChars <= 0) return 0;
  const linear = Math.floor(
    interpolate(localFrame, [0, totalChars / charsPerFrame], [0, totalChars], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return Math.min(totalChars, Math.ceil(linear / chunkSize) * chunkSize);
}

/**
 * STEP-FUNCTION scroll. Each overflowing line snaps the buffer up by exactly
 * one row on the frame it begins. No interpolation, no easing — terminals do
 * not glide. Returns the number of rows scrolled off the top.
 */
export function computeScrollRows(
  frame: number,
  starts: number[],
  visibleLines: number,
): number {
  let rows = 0;
  for (let i = visibleLines; i < starts.length; i++) {
    if (frame >= starts[i]) rows++;
  }
  return rows;
}

/** Normalize the `zoom` prop into a fully-resolved camera config. */
export function resolveZoom(
  zoom: boolean | TerminalZoom | undefined,
): Required<TerminalZoom> {
  if (zoom === undefined || zoom === false) {
    return { enabled: false, scale: 1, followCursor: true };
  }
  if (zoom === true) {
    return { enabled: true, scale: 2.4, followCursor: true };
  }
  return {
    enabled: zoom.enabled,
    scale: zoom.scale ?? 2.4,
    followCursor: zoom.followCursor ?? true,
  };
}

/** Split `*emphasis*` runs out of the intro string, preserving spaces. */
export function parseIntro(
  text: string,
): Array<{ text: string; accent: boolean }> {
  const out: Array<{ text: string; accent: boolean }> = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null = re.exec(text);
  while (m !== null) {
    if (m.index > last)
      out.push({ text: text.slice(last, m.index), accent: false });
    out.push({ text: m[1], accent: true });
    last = m.index + m[0].length;
    m = re.exec(text);
  }
  if (last < text.length) out.push({ text: text.slice(last), accent: false });
  return out;
}

/** Colour a shell command: word 0 = manager, word 1 = subcommand, rest = args. */
export function commandSpans(
  text: string,
): Array<{ text: string; color: string }> {
  const out: Array<{ text: string; color: string }> = [];
  let wordIndex = -1;
  for (const part of text.split(/(\s+)/)) {
    if (part.length === 0) continue;
    if (/^\s+$/.test(part)) {
      out.push({ text: part, color: CMD_ARG_COLOR });
      continue;
    }
    wordIndex++;
    const color =
      wordIndex === 0
        ? CMD_MANAGER_COLOR
        : wordIndex === 1
          ? CMD_SUBCOMMAND_COLOR
          : CMD_ARG_COLOR;
    out.push({ text: part, color });
  }
  return out;
}

// ─── Camera ──────────────────────────────────────────────────────────────────

export interface CameraStop {
  /** Frame this stop is reached. */
  frame: number;
  /** World focus point (px) the camera centers on. */
  x: number;
  y: number;
  /** Zoom at this stop. */
  z: number;
  /** Easing applied while travelling INTO this stop from the previous one. */
  easing?: (t: number) => number;
}

export interface CameraState {
  x: number;
  y: number;
  z: number;
}

/**
 * Piecewise camera resolver. Between consecutive stops the camera lerps
 * x/y/z with the segment's own easing — so a lazy drift can hand off to a
 * sudden ease-in whip, which is the whole feel of the flythrough. Clamps to
 * the first/last stop outside the timeline.
 */
export function cameraAt(frame: number, stops: CameraStop[]): CameraState {
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (frame <= first.frame) return { x: first.x, y: first.y, z: first.z };
  if (frame >= last.frame) return { x: last.x, y: last.y, z: last.z };
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (frame >= a.frame && frame < b.frame) {
      const t = (frame - a.frame) / (b.frame - a.frame);
      const e = b.easing ? b.easing(t) : t;
      return {
        x: a.x + (b.x - a.x) * e,
        y: a.y + (b.y - a.y) * e,
        z: a.z + (b.z - a.z) * e,
      };
    }
  }
  return { x: last.x, y: last.y, z: last.z };
}

/**
 * The flythrough's shot list: hold on the intro → creep left → sudden
 * ease-in whip to the command panel → slow push while it types (this is
 * what draws the ghost trail) → zoom-out descending → sudden punch-in
 * landing on the terminal. When a station is skipped its segment collapses.
 */
export function buildCameraStops(
  hasIntro: boolean,
  hasCommand: boolean,
  landingZoom: number,
): CameraStop[] {
  const whip = Easing.bezier(0.7, 0, 0.25, 1);
  const punch = Easing.bezier(0.75, 0, 0.3, 1);
  const glide = Easing.bezier(0.35, 0, 0.55, 1);

  const stops: CameraStop[] = [];
  if (hasIntro) {
    stops.push(
      { frame: 0, x: INTRO_POS.x, y: INTRO_POS.y, z: 1 },
      { frame: DRIFT_START, x: INTRO_POS.x, y: INTRO_POS.y, z: 1 },
      // The slight leftward text drift = camera creeping right, accelerating.
      {
        frame: WHIP_START,
        x: INTRO_POS.x + 52,
        y: INTRO_POS.y,
        z: 1.02,
        easing: Easing.in(Easing.quad),
      },
    );
  }
  if (hasCommand) {
    stops.push(
      {
        frame: hasIntro ? CMD_ARRIVE : 0,
        x: CMD_POS.x,
        y: CMD_POS.y,
        z: 1.55,
        easing: whip,
      },
      // Slow push-in while the command types — leaves the trailing copies.
      {
        frame: PUSH_END,
        x: CMD_POS.x,
        y: CMD_POS.y + 28,
        z: 1.9,
        easing: Easing.inOut(Easing.quad),
      },
      // Zoom out and start descending toward the terminal.
      {
        frame: PULL_END,
        x: CMD_POS.x,
        y: CMD_POS.y + 630,
        z: 0.95,
        easing: glide,
      },
    );
  }
  stops.push({
    frame: hasCommand ? PUNCH_END : hasIntro ? CMD_ARRIVE : 0,
    x: TERM_POS.x,
    y: TERM_POS.y,
    z: landingZoom,
    easing: punch,
  });
  return stops;
}

/** Screen-space speed of the focus point — drives the motion-blur trail. */
export function cameraSpeed(frame: number, stops: CameraStop[]): number {
  const a = cameraAt(frame - 1, stops);
  const b = cameraAt(frame, stops);
  const pan = Math.hypot(b.x - a.x, b.y - a.y) * b.z;
  const zoomEdge = Math.abs(b.z - a.z) * 360;
  return pan + zoomEdge;
}

// ─── Component ───────────────────────────────────────────────────────────────

/** Ghost samples for the motion-blur trail: frames back, opacity, blur px. */
const GHOSTS = [
  { back: 2, alpha: 0.3, blur: 3 },
  { back: 4, alpha: 0.18, blur: 6 },
  { back: 6, alpha: 0.1, blur: 10 },
];

export function TerminalSimulator({
  lines = DEFAULT_LINES,
  intro = DEFAULT_INTRO,
  command = DEFAULT_COMMAND,
  background,
  borderColor,
  theme,
  mode,
  fontFamily,
  fontSize = 18,
  charsPerFrame = 2,
  chunkSize = 3,
  zoom = false,
  speed = 1,
  className,
}: TerminalSimulatorProps) {
  const frame = useCurrentFrame() * speed;
  const { fps, width, height } = useVideoConfig();
  const { isRendering } = getRemotionEnvironment();
  const t = useSnapCnTheme(theme, mode ?? "dark");
  const face = resolveFont(fontFamily ?? t.fontFamily) ?? SANS_FAMILY;
  const panel = background ?? t.card;
  const hairline = borderColor ?? t.border;
  // One constant stage across the whole flythrough — the page, a shade under
  // the panel that floats on it.
  const stage = mixOklch(t.background, "#000", 0.35);

  const hasIntro = intro != null && intro.trim().length > 0;
  const hasCommand = command != null && command.text.trim().length > 0;
  const camera = resolveZoom(zoom);
  const landingZoom = camera.enabled ? camera.scale : 1.5;

  const stops = buildCameraStops(hasIntro, hasCommand, landingZoom);
  const cam = cameraAt(frame, stops);
  const speedPx = cameraSpeed(frame, stops);
  // Trail strength ramps in from barely-moving; saturates on the whip.
  const trail = Math.min(1, Math.max(0, (speedPx - 2) / 30));

  const worldTransform = (c: CameraState) =>
    `translate(${width / 2 - c.x * c.z}px, ${height / 2 - c.y * c.z}px) scale(${c.z})`;

  const world = (
    <WorldContent
      face={face}
      frame={frame}
      fps={fps}
      intro={hasIntro ? intro : null}
      command={hasCommand ? command : null}
      lines={lines}
      background={panel}
      borderColor={hairline}
      ink={t.foreground}
      inkMuted={t.mutedForeground}
      fontSize={fontSize}
      charsPerFrame={charsPerFrame}
      chunkSize={chunkSize}
      hasIntro={hasIntro}
    />
  );

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: stage,
        textRendering: "geometricPrecision",
      }}
    >
      {/* Motion-blur trail: the same world drawn at recent camera positions.
          Only alive while the camera actually moves — it IS the drop of the
          fast moves, no element ever slides in from a screen edge. */}
      {trail > 0.01 &&
        GHOSTS.map((g) => (
          <div
            key={g.back}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transformOrigin: "0 0",
              transform: worldTransform(cameraAt(frame - g.back, stops)),
              opacity: g.alpha * trail,
              filter: `blur(${g.blur * trail}px)`,
              pointerEvents: "none",
            }}
          >
            {world}
          </div>
        ))}

      {/* The camera */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: worldTransform(cam),
          ...(isRendering ? {} : { willChange: "transform" }),
        }}
      >
        {world}
      </div>
    </div>
  );
}

// ─── World (all three stations on one canvas) ────────────────────────────────

function WorldContent({
  frame,
  fps,
  intro,
  command,
  lines,
  background,
  borderColor,
  ink,
  inkMuted,
  fontSize,
  charsPerFrame,
  chunkSize,
  hasIntro,
  face,
}: {
  frame: number;
  fps: number;
  intro: string | null;
  command: CommandSpec | null;
  lines: TerminalLine[];
  background: string;
  borderColor: string;
  ink: string;
  inkMuted: string;
  fontSize: number;
  charsPerFrame: number;
  chunkSize: number;
  hasIntro: boolean;
  face: string;
}) {
  const s = fontSize / 18; // font scale, layout stays fixed

  return (
    <div style={{ position: "absolute", left: 0, top: 0 }}>
      {intro !== null && (
        <IntroStation
          frame={frame}
          text={intro}
          fontScale={s}
          ink={ink}
          face={face}
        />
      )}
      {command !== null && (
        <CommandStation
          frame={frame}
          command={command}
          background={background}
          borderColor={borderColor}
          ink={ink}
          inkMuted={inkMuted}
          fontScale={s}
          charsPerFrame={charsPerFrame}
          chunkSize={chunkSize}
          fps={fps}
          typeStart={hasIntro ? CMD_TYPE_START : 8}
        />
      )}
      <TerminalStation
        frame={frame}
        lines={lines}
        fontScale={s}
        charsPerFrame={charsPerFrame}
        chunkSize={chunkSize}
        fps={fps}
        typeStart={
          command !== null ? TERM_TYPE_START : hasIntro ? CMD_ARRIVE - 6 : 6
        }
      />
    </div>
  );
}

/** Station 1 — the headline, words fading in staggered. */
function IntroStation({
  frame,
  text,
  fontScale,
  ink,
  face,
}: {
  frame: number;
  text: string;
  fontScale: number;
  ink: string;
  face: string;
}) {
  const tokens = parseIntro(text);
  return (
    <div
      style={{
        position: "absolute",
        left: INTRO_POS.x,
        top: INTRO_POS.y,
        transform: "translate(-50%, -50%)",
        whiteSpace: "pre",
        fontFamily: face,
        fontSize: Math.round(58 * fontScale),
        fontWeight: 600,
        letterSpacing: "-0.01em",
      }}
    >
      {tokens.map((tok, i) => {
        const t = interpolate(frame, [2 + i * 4, 14 + i * 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const style = tok.accent
          ? {
              backgroundImage: ACCENT_GRADIENT,
              WebkitBackgroundClip: "text" as const,
              backgroundClip: "text" as const,
              color: "transparent",
            }
          : { color: ink };
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: positional tokens
            key={i}
            style={{ ...style, opacity: t, filter: `blur(${(1 - t) * 3}px)` }}
          >
            {tok.text}
          </span>
        );
      })}
    </div>
  );
}

/** Station 2 — the package-manager panel with the highlighted install command. */
function CommandStation({
  frame,
  command,
  background,
  borderColor,
  ink,
  inkMuted,
  fontScale,
  charsPerFrame,
  chunkSize,
  fps,
  typeStart,
}: {
  frame: number;
  command: CommandSpec;
  background: string;
  borderColor: string;
  ink: string;
  inkMuted: string;
  fontScale: number;
  charsPerFrame: number;
  chunkSize: number;
  fps: number;
  typeStart: number;
}) {
  const managers = command.managers?.length ? command.managers : ["npm"];
  const revealed = chunkedReveal(
    Math.max(0, frame - typeStart),
    command.text.length,
    charsPerFrame,
    chunkSize,
  );
  const typingDone = revealed >= command.text.length;
  const blink = Math.floor((frame / fps) * 2) % 2 === 0;
  const spans = commandSpans(command.text);

  const tabFont = Math.round(20 * fontScale);
  const rowFont = Math.round(33 * fontScale);

  return (
    <div
      style={{
        position: "absolute",
        left: CMD_POS.x - CMD_W / 2,
        top: CMD_POS.y - CMD_H / 2,
        width: CMD_W,
        height: CMD_H,
        background,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: `0 0 0 1px ${borderColor}, 0 30px 60px ${withAlpha(
          mixOklch(background, "#000", 0.8),
          0.55,
        )}`,
        fontFamily: MONO_FAMILY,
      }}
    >
      {/* Tab row */}
      <div
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 16px",
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {managers.map((m, i) => (
          <div
            key={m}
            style={{
              fontSize: tabFont,
              fontWeight: i === 0 ? 600 : 500,
              padding: "7px 14px",
              borderRadius: 8,
              color: i === 0 ? ink : inkMuted,
              background: i === 0 ? withAlpha(ink, 0.1) : "transparent",
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Command row — manager and subcommand dim, the args highlighted */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: CMD_H - 54,
          padding: "0 24px",
          fontSize: rowFont,
          letterSpacing: "0.01em",
          whiteSpace: "pre",
        }}
      >
        {(() => {
          let acc = 0;
          return spans.map((p, i) => {
            const start = acc;
            acc += p.text.length;
            const vis = Math.max(0, Math.min(p.text.length, revealed - start));
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: positional spans
                key={i}
                style={{ color: p.color }}
              >
                {p.text.slice(0, vis)}
              </span>
            );
          });
        })()}
        {!typingDone && frame >= typeStart && blink && (
          <span
            style={{
              display: "inline-block",
              width: rowFont * 0.55,
              height: rowFont,
              background: CMD_ARG_COLOR,
              marginLeft: 2,
            }}
          />
        )}
      </div>
    </div>
  );
}

/** Station 3 — the green focus terminal. */
function TerminalStation({
  frame,
  lines,
  fontScale,
  charsPerFrame,
  chunkSize,
  fps,
  typeStart,
}: {
  frame: number;
  lines: TerminalLine[];
  fontScale: number;
  charsPerFrame: number;
  chunkSize: number;
  fps: number;
  typeStart: number;
}) {
  const starts = computeLineStarts(lines, charsPerFrame, chunkSize, typeStart);
  const font = Math.round(TERM_FONT * fontScale);
  const blink = Math.floor((frame / fps) * 2) % 2 === 0;

  return (
    <>
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          left: TERM_POS.x - TERM_BAR_OFFSET,
          top: TERM_POS.y - 520,
          width: 5,
          height: 1040,
          background: TERM_ACCENT,
          boxShadow: `0 0 22px ${withAlpha(TERM_ACCENT, 0.75)}`,
        }}
      />
      {/* Output column */}
      <div
        style={{
          position: "absolute",
          left: TERM_POS.x - TERM_TEXT_OFFSET,
          top: TERM_POS.y - TERM_BLOCK_TOP,
          fontFamily: MONO_FAMILY,
        }}
      >
        {lines.map((line, index) => {
          const revealed = chunkedReveal(
            Math.max(0, frame - starts[index]),
            line.text.length,
            charsPerFrame,
            chunkSize,
          );
          const typingDone = revealed >= line.text.length;
          const isLast = index === lines.length - 1;
          const showCursor =
            line.type === "command" &&
            frame >= starts[index] &&
            (!typingDone || (isLast && blink));
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional and never reorder
              key={index}
              style={{
                height: TERM_LINE_H,
                display: "flex",
                alignItems: "center",
                color: TERM_COLORS[line.type],
                fontSize: font,
                whiteSpace: "pre",
              }}
            >
              <span>{line.text.substring(0, revealed)}</span>
              {showCursor && (
                <span
                  style={{
                    display: "inline-block",
                    width: font * 0.6,
                    height: font * 0.95,
                    background: TERM_CURSOR,
                    marginLeft: 6,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export { TYPE_COLORS };
