/** Content/clock utilities for adapting selected components. No layout preset or visual approval. */
type Point = {x: number; y: number};
export type SharedTextStyle = {
  fontFamily: string; fontWeight: number; fontSize: number; lineHeight: number; letterSpacing?: number;
};
export type Glyph = Point & {index: number; character: string; width: number; row: number};
export type CharacterRange = {start: number; end: number};
export type MediaMapping = {
  fromFrame: number; sourceInSeconds: number; timelineFps: number; playbackRate: number;
};
const finite = (values: number[]) => values.every(Number.isFinite);

/** Load the declared font first. Use this same returned style for matching carriers at one logical stage. */
export function sharedTextStyle(style: SharedTextStyle) {
  if (!style.fontFamily || !finite([style.fontWeight, style.fontSize, style.lineHeight, style.letterSpacing ?? 0])
      || style.fontSize <= 0 || style.lineHeight <= 0 || style.fontWeight <= 0) {
    throw new Error('Shared text style needs explicit loaded font, weight, size and line height');
  }
  return Object.freeze({...style, fontSynthesis: 'none' as const});
}

/** Unicode code-point indexes, including newlines. Final layout is fixed before reveal/emphasis. */
export function layoutFullText(text: string, measure: (character: string) => number,
  box: {x: number; y: number; maxWidth: number; rowHeight: number}): Glyph[] {
  if (!finite([box.x, box.y, box.maxWidth, box.rowHeight]) || box.maxWidth <= 0 || box.rowHeight <= 0) {
    throw new Error('Prompt layout needs a finite box and positive width/row height');
  }
  const glyphs: Glyph[] = [];
  let x = 0, row = 0;
  Array.from(text).forEach((character, index) => {
    if (character === '\n') {x = 0; row += 1; return;}
    const width = measure(character);
    if (!Number.isFinite(width) || width < 0 || width > box.maxWidth) {
      throw new Error('Glyph does not fit the declared prompt width; adapt the reading layout');
    }
    if (x > 0 && x + width > box.maxWidth) {x = 0; row += 1;}
    glyphs.push({character, index, width, row, x: box.x + x, y: box.y + row * box.rowHeight});
    x += width;
  });
  return glyphs;
}

/** Repeated phrases require an explicit zero-based occurrence, never silently select the first one. */
export function phraseRange(text: string, phrase: string, occurrence?: number): CharacterRange {
  const source = Array.from(text), target = Array.from(phrase), starts: number[] = [];
  if (!target.length) throw new Error('Highlight phrase is empty');
  for (let at = 0; at <= source.length - target.length; at += 1) {
    if (target.every((character, i) => source[at + i] === character)) starts.push(at);
  }
  if (!starts.length) throw new Error('Highlight phrase is absent from full text');
  if (occurrence === undefined && starts.length !== 1) throw new Error('Highlight phrase is ambiguous; declare occurrence');
  const selected = occurrence ?? 0;
  if (!Number.isInteger(selected) || selected < 0 || selected >= starts.length) {
    throw new Error('Invalid highlight occurrence');
  }
  return {start: starts[selected], end: starts[selected] + target.length};
}

/** Brush and text share the same measured geometry; apply one parent camera to both. */
export function brushRects(glyphs: Glyph[], range: CharacterRange) {
  if (!Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start < 0 || range.end <= range.start) {
    throw new Error('Highlight needs a non-empty half-open character range');
  }
  const rows = new Map<number, Glyph[]>();
  glyphs.filter(g => g.index >= range.start && g.index < range.end).forEach(g => {
    const row = rows.get(g.row) ?? []; row.push(g); rows.set(g.row, row);
  });
  return [...rows.values()].map(row => {
    const x = Math.min(...row.map(g => g.x));
    return {x, y: row[0].y, width: Math.max(...row.map(g => g.x + g.width)) - x};
  });
}

export function cameraPoint(point: Point,
  camera: {scale: number; translateX: number; translateY: number; originX?: number; originY?: number}) {
  const ox = camera.originX ?? 0, oy = camera.originY ?? 0;
  if (!finite([point.x, point.y, camera.scale, camera.translateX, camera.translateY, ox, oy]) || camera.scale <= 0) {
    throw new Error('Camera needs a positive scale and finite coordinates');
  }
  return {x: ox + (point.x - ox) * camera.scale + camera.translateX,
    y: oy + (point.y - oy) * camera.scale + camera.translateY};
}

/** Always use the global timeline frame. Zero rate denotes an explicitly chosen hold. */
export function mediaTimeAt(globalFrame: number, mapping: MediaMapping) {
  if (!finite([globalFrame, mapping.fromFrame, mapping.sourceInSeconds, mapping.timelineFps, mapping.playbackRate])
      || mapping.timelineFps <= 0 || mapping.playbackRate < 0 || mapping.sourceInSeconds < 0
      || mapping.fromFrame < 0 || globalFrame < mapping.fromFrame) {
    throw new Error('Invalid media mapping or frame before its global anchor');
  }
  return mapping.sourceInSeconds + (globalFrame - mapping.fromFrame) / mapping.timelineFps * mapping.playbackRate;
}

/** The next carrier starts at the outgoing boundary time; it does not reset to source time zero. */
export function continueMediaMapping(previous: MediaMapping, nextFromFrame: number,
  playbackRate = previous.playbackRate): MediaMapping {
  const next = {fromFrame: nextFromFrame, sourceInSeconds: mediaTimeAt(nextFromFrame, previous),
    timelineFps: previous.timelineFps, playbackRate};
  mediaTimeAt(nextFromFrame, next);
  return next;
}
