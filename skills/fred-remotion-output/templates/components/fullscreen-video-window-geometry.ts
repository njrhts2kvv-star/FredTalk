/** Fred's approved EP108 v9 main-video window, adopted on 2026-10-04. */
export const FULLSCREEN_VIDEO_WINDOW_PRESET = Object.freeze({
  designWidth: 1920,
  designHeight: 1080,
  windowWidth: 1800,
  sourceWidth: 3836,
  sourceHeight: 2160,
  radius: 24,
  shadowOffsetY: 16,
  shadowBlur: 25,
  shadowAlpha: 2 / 15,
});

/** Use the size of the local layout stage, before any parent scaling. */
export function fullscreenVideoWindowGeometry(
  canvasWidth = 1920,
  canvasHeight = 1080,
) {
  if (!Number.isFinite(canvasWidth) || !Number.isFinite(canvasHeight)
      || canvasWidth <= 0 || canvasHeight <= 0) {
    throw new Error('FullscreenVideoWindow requires positive finite canvas dimensions');
  }
  if (Math.abs(canvasWidth * 9 - canvasHeight * 16) > 0.01) {
    throw new Error('FullscreenVideoWindow is the approved 16:9 landscape preset');
  }
  const preset = FULLSCREEN_VIDEO_WINDOW_PRESET;
  const scale = canvasWidth / preset.designWidth;
  const width = preset.windowWidth * scale;
  const height = width * preset.sourceHeight / preset.sourceWidth;
  return {
    left: (canvasWidth - width) / 2,
    top: (canvasHeight - height) / 2,
    width,
    height,
    borderRadius: preset.radius * scale,
    boxShadow: `0 ${preset.shadowOffsetY * scale}px ${preset.shadowBlur * scale}px 0 rgba(0, 0, 0, ${preset.shadowAlpha})`,
  };
}
