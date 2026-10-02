export type FrameTrack = {
  domain: 'outputFrame';
  fields: string[];
  samples: number[][];
  evidence: string;
};

export type ClipSpec = {
  id: string;
  output: {width: number; height: number; fps: number; durationInFrames: number};
  tracks: Record<string, FrameTrack>;
};

/** Linear interpolation between measured native samples, without added easing. */
export function measured(spec: ClipSpec, name: string, frame: number): number[] {
  const track = spec.tracks[name];
  if (!track?.samples.length) throw new Error(`${spec.id}: missing measured track ${name}`);
  const samples = track.samples;
  if (frame <= samples[0][0]) return samples[0].slice(1);
  if (frame >= samples[samples.length - 1][0]) return samples[samples.length - 1].slice(1);
  let lo = 0, hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid][0] <= frame) lo = mid; else hi = mid;
  }
  const a = samples[lo], b = samples[hi];
  const t = (frame - a[0]) / (b[0] - a[0]);
  return a.slice(1).map((value, column) => value + (b[column + 1] - value) * t);
}
