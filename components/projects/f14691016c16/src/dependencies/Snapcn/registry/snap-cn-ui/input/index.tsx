"use client";

import { cva } from "class-variance-authority";
import { Caret } from "../caret/index.tsx";
import {
  mixOklch,
  revealedText,
  type SnapCnTheme,
  useSnapCnTheme,
} from "../core/index.ts";
import { cn } from "../../../lib/utils.ts";

export type InputState =
  | "idle"
  | "hover"
  | "active"
  | "typing"
  | "blur"
  | "invalid";

type InputSize = "sm" | "default" | "lg";

export interface InputProps {
  state?: InputState;
  style?: InputStyle;
  placeholder?: string;
  value?: string;
  size?: InputSize;
  theme?: Partial<SnapCnTheme>;
  primary?: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * The control, as classes.
 *
 * This is a shadcn field that happens to be driven by a frame clock, so it is
 * built the way shadcn builds one: `cva` for the size scale, `cn` for merging,
 * `data-slot` for targeting. What stays in `style` is *only* what is tweened —
 * see the note on the render below.
 */
const inputVariants = cva(
  "relative flex items-center border border-solid tracking-[-0.01em]",
  {
    variants: {
      size: {
        sm: "h-9 px-3 text-[13px]",
        default: "h-10 px-3.5 text-[15px]",
        lg: "h-12 px-4 text-[17px]",
      },
      fullWidth: { true: "w-full", false: "w-80" },
    },
    defaultVariants: { size: "default", fullWidth: false },
  },
);

/** The placeholder overlays the value, so it needs the field's own inset. */
const placeholderVariants = cva(
  "pointer-events-none absolute whitespace-nowrap",
  {
    variants: { size: { sm: "left-3", default: "left-3.5", lg: "left-4" } },
    defaultVariants: { size: "default" },
  },
);

/** `Caret` takes a pixel height, not a class — so this one number stays a number. */
const CARET_HEIGHT: Record<InputSize, number> = { sm: 14, default: 17, lg: 19 };

export interface InputStyle {
  borderColor: string;
  ringColor: string;
  ringWidth: number;
  background: string;
  caretOpacity: number;
  valueReveal: number;
  placeholderOpacity: number;
}

export interface InputStyleContext {
  idleBorder: string;
  hoverBorder: string;
  activeBorder: string;
  invalidBorder: string;
  ring: string;
  invalidRing: string;
  background: string;
  hoverBackground: string;
  foreground: string;
  mutedForeground: string;
}

export function inputStyleContext(theme: SnapCnTheme): InputStyleContext {
  return {
    idleBorder: theme.input,
    hoverBorder: mixOklch(theme.input, theme.foreground, 0.18),
    activeBorder: theme.ring,
    invalidBorder: theme.destructive,
    ring: mixOklch(theme.background, theme.ring, 0.5),
    invalidRing: mixOklch(theme.background, theme.destructive, 0.4),
    background: theme.background,
    hoverBackground: mixOklch(theme.background, theme.muted, 0.4),
    foreground: theme.foreground,
    mutedForeground: theme.mutedForeground,
  };
}

export function inputStyle(
  state: InputState,
  ctx: InputStyleContext,
): InputStyle {
  switch (state) {
    case "hover":
      return {
        borderColor: ctx.hoverBorder,
        ringColor: ctx.ring,
        ringWidth: 0,
        background: ctx.hoverBackground,
        caretOpacity: 0,
        valueReveal: 0,
        placeholderOpacity: 1,
      };
    case "active":
      return {
        borderColor: ctx.activeBorder,
        ringColor: ctx.ring,
        ringWidth: 3,
        background: ctx.background,
        caretOpacity: 1,
        valueReveal: 0,
        placeholderOpacity: 1,
      };
    case "typing":
      return {
        borderColor: ctx.activeBorder,
        ringColor: ctx.ring,
        ringWidth: 3,
        background: ctx.background,
        caretOpacity: 1,
        valueReveal: 1,
        placeholderOpacity: 0,
      };
    case "blur":
      return {
        borderColor: ctx.idleBorder,
        ringColor: ctx.ring,
        ringWidth: 0,
        background: ctx.background,
        caretOpacity: 0,
        valueReveal: 1,
        placeholderOpacity: 0,
      };
    case "invalid":
      return {
        borderColor: ctx.invalidBorder,
        ringColor: ctx.invalidRing,
        ringWidth: 3,
        background: ctx.background,
        caretOpacity: 0,
        valueReveal: 1,
        placeholderOpacity: 0,
      };
    default:
      return {
        borderColor: ctx.idleBorder,
        ringColor: ctx.ring,
        ringWidth: 0,
        background: ctx.background,
        caretOpacity: 0,
        valueReveal: 0,
        placeholderOpacity: 1,
      };
  }
}

export function Input({
  state = "idle",
  style,
  placeholder = "user@example.invalid",
  value = "user@example.invalid",
  size = "default",
  theme: themeOverride,
  primary,
  fullWidth = false,
  className,
}: InputProps) {
  const theme = useSnapCnTheme({
    ...themeOverride,
    ...(primary ? { primary } : {}),
  });

  const ctx = inputStyleContext(theme);
  const v = style ?? inputStyle(state, ctx);
  const revealed = revealedText(
    value,
    Math.round(value.length * v.valueReveal),
  );

  return (
    // No font-family. A shadcn Input does not set one — it inherits, and the
    // hard-coded `var(--font-geist-sans)` that used to be here resolved on the
    // site and to nothing in a render, which is the bug this tier existed to
    // avoid.
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        data-slot="input"
        data-state={state}
        className={cn(inputVariants({ size, fullWidth }), className)}
        // Everything left in `style` is a value being *tweened between shadcn
        // states* by `use-input-transition` — `mixOklch(idleBorder → ring)`, a
        // ring growing 0→3px. A class is a binary state; this component's whole
        // job is the 300ms in between, so these cannot be classes and are not a
        // compromise. `borderRadius` follows the theme token.
        style={{
          background: v.background,
          borderColor: v.borderColor,
          borderRadius: theme.radius,
          boxShadow: `0 0 0 ${v.ringWidth}px ${v.ringColor}`,
        }}
      >
        <span
          data-slot="input-placeholder"
          className={placeholderVariants({ size })}
          style={{
            color: ctx.mutedForeground,
            opacity: v.valueReveal > 0 ? 0 : v.placeholderOpacity,
          }}
        >
          {placeholder}
        </span>

        <div className="flex min-w-0 items-center">
          <span className="whitespace-nowrap" style={{ color: ctx.foreground }}>
            {revealed}
          </span>
          <Caret
            color={ctx.foreground}
            height={CARET_HEIGHT[size]}
            radius={1}
            opacity={v.caretOpacity}
            marginLeft={revealed.length > 0 ? 4 : 0}
          />
        </div>
      </div>
    </div>
  );
}
