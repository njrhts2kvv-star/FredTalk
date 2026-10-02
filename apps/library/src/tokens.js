// Website and new demonstration defaults. Frozen reference compositions retain their own tokens.
export const tokens = {
  color: {
    canvas: "#ffffff",
    surface: "#ffffff",
    ink: "#171719",
    muted: "#6c6c72",
    soft: "#ffffff",
    accent: "#8554e8",
    accentDark: "#D6BEFF",
  },
  font: { body: "Fred MiSans", subtitle: "Fred Smiley" },
  radius: { surface: 24, panel: 32, pill: 999 },
  shadow: {
    surface: "0 12px 36px rgba(20,20,24,.08)",
    floating: "0 20px 60px rgba(20,20,24,.13)",
  },
  space: [4, 8, 12, 16, 24, 32, 48, 64],
};
export const tokenScope =
  "规范站与新演示的参数起点；视频字阶需按逻辑画布、实际内容和观看尺寸校准。";
export const tokensCSS = `:root {\n  --fred-ink: ${tokens.color.ink};\n  --fred-surface: ${tokens.color.surface};\n  --fred-accent: ${tokens.color.accent};\n  --fred-radius: ${tokens.radius.surface}px;\n  --fred-shadow: ${tokens.shadow.surface};\n  --fred-font: "Fred MiSans", sans-serif;\n}`;

// Select by the actual carrier: a black pill on a white canvas is still dark.
export function accentForSurface(fill) {
  const hex = /^#([a-f0-9]{6}|[a-f0-9]{3})$/i.exec(fill);
  if (!hex) return tokens.color.accent;
  const value = hex[1].length === 3 ? [...hex[1]].map(c => c + c).join('') : hex[1];
  const [r, g, b] = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16));
  return (r * .2126 + g * .7152 + b * .0722) < 128 ? tokens.color.accentDark : tokens.color.accent;
}
