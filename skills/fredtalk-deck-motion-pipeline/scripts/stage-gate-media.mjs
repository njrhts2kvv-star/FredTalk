// Media identity is checked by callers. Geometry is based on the actual target,
// never on the default 1080p cost-saving preview size.
export const frameRate = value => {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : NaN;
  if (typeof value !== 'string') return NaN;
  const terms = value.split('/').map(Number);
  const result = terms.length === 2 ? terms[0] / terms[1] : terms[0];
  return Number.isFinite(result) && result > 0 ? result : NaN;
};
export function mediaGeometryFailures(stream, contract, {nativeFps = true} = {}) {
  const failures = [];
  if (!Number.isInteger(stream?.width) || !Number.isInteger(stream?.height) || stream.width <= 0 || stream.height <= 0) failures.push('media dimensions must be positive integers');
  const fps = frameRate(stream?.r_frame_rate);
  if (!Number.isFinite(fps)) failures.push('media frame rate must be positive');
  const expectedFps = frameRate(contract?.timelineFps ?? contract?.outputSpec?.fps);
  if (nativeFps && Number.isFinite(expectedFps) && Math.abs(fps - expectedFps) > 0.0001) failures.push('media fps must match the declared native timeline frame rate');
  const width = contract?.outputSpec?.width, height = contract?.outputSpec?.height;
  if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0 && Math.abs(stream.width / stream.height - width / height) > 0.001) failures.push('media aspect must match the declared output dimensions');
  return failures;
}
