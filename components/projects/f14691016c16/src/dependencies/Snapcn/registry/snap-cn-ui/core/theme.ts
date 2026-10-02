"use client";

import type { ReactNode } from "react";
import { createContext, createElement, useContext } from "react";

export interface SnapCnTheme {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: number;
  /**
   * The face every text component paints with, as a label from `fonts.ts` or a
   * CSS family the caller has loaded themselves.
   *
   * Optional and defaulted to nothing on purpose: unset, each component keeps
   * the face it was designed around, so adding this token changed no existing
   * render. Set it on `SnapCnUIProvider` and one value re-skins a whole
   * timeline — which is the only reason it lives on the theme rather than
   * staying a per-component prop.
   */
  fontFamily?: string;
}

/**
 * The shadcn token set, as concrete values.
 *
 * ## These are a mirror of `app/globals.css`, and that is the whole point
 *
 * A component we ship lands next to somebody's `Button` and `Input`, and those
 * paint from the CSS custom properties in `globals.css`. A scene that paints
 * from a *different* set of greys is a scene that clashes with the app it was
 * installed into — which is exactly what happened here: this file was written
 * first, `globals.css` was later re-skinned warm, and for a while the site and
 * the videos it sells were two different products.
 *
 * So every value below is the **literal string** from the corresponding
 * `--token` in `app/globals.css` (`:root` for light, `.dark` for dark). Hex, not
 * oklch, purely so that drift is a string comparison — if the two files ever
 * disagree again, `pnpm run check:tokens` says so and prints the pairs.
 *
 * ## Why not just read `var(--token)`?
 *
 * Because a Remotion bundle has none of the app's CSS, so `var()` resolves to
 * nothing under the headless renderer and cannot be interpolated by `mixOklch`
 * at all (see the guard in `color.ts`). Concrete values are not a shortcut here,
 * they are the only thing that survives a render. Users on a different palette
 * override via `SnapCnUIProvider` or a component's `theme` prop.
 *
 * ## `radius` is the one value that flows the other way
 *
 * `globals.css` sets `--radius: 0.28rem` *so that* its `--radius-3xl` step lands
 * on this 10 — see the note beside it there. It is not drift; do not "fix" it.
 */
export const defaultLightTheme: SnapCnTheme = {
  background: "#faf9f6", // page — warm off-white
  foreground: "#141414", // text
  card: "#ffffff", // surface on the page
  cardForeground: "#141414",
  popover: "#ffffff",
  popoverForeground: "#141414",
  primary: "#3072db", // accent blue
  primaryForeground: "#ffffff",
  secondary: "#f2f0eb", // subtle fill
  secondaryForeground: "#141414",
  muted: "#f2f0eb",
  mutedForeground: "#6e6a63", // secondary text, leading icons
  accent: "#f2f0eb", // hover wash
  accentForeground: "#141414",
  destructive: "#d92d20",
  // `globals.css` defines no --destructive-foreground; white is the only thing
  // that reads on #d92d20, and shadcn's own default agrees.
  destructiveForeground: "#ffffff",
  border: "#d9d9d9", // hairline
  input: "#d9d9d9",
  ring: "#3072db",
  radius: 10,
};

export const defaultDarkTheme: SnapCnTheme = {
  background: "#0a0a0b", // page — near-black
  foreground: "#fafafa", // text
  card: "#141417", // surface, a shade above the page
  cardForeground: "#fafafa",
  popover: "#141417",
  popoverForeground: "#fafafa",
  primary: "#3072db", // the same accent blue in both modes
  primaryForeground: "#ffffff",
  secondary: "#1d1d21", // subtle fill
  secondaryForeground: "#fafafa",
  muted: "#1b1b1f",
  mutedForeground: "#a1a1aa", // secondary text, leading icons
  accent: "#1d1d21", // hover wash
  accentForeground: "#fafafa",
  destructive: "#f97066",
  destructiveForeground: "#fafafa",
  border: "#26272b", // hairline — separation is borders, not shadows
  input: "#26272b",
  ring: "#3072db",
  radius: 10,
};

interface SnapCnThemeContextValue {
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
}

const SnapCnThemeContext = createContext<SnapCnThemeContextValue>({});

export interface SnapCnUIProviderProps {
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
  children: ReactNode;
}

export function SnapCnUIProvider({
  theme,
  mode,
  children,
}: SnapCnUIProviderProps) {
  return createElement(
    SnapCnThemeContext.Provider,
    { value: { theme, mode } },
    children,
  );
}

export function useSnapCnTheme(
  override?: Partial<SnapCnTheme>,
  modeOverride?: "light" | "dark",
): SnapCnTheme {
  const ctx = useContext(SnapCnThemeContext);
  const mode = modeOverride ?? ctx.mode ?? "light";
  const base = mode === "dark" ? defaultDarkTheme : defaultLightTheme;
  return { ...base, ...ctx.theme, ...override };
}
