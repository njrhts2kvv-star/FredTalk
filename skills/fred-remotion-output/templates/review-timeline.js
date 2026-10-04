/* Shared discrete-frame clock. It never implies continuous animation approval. */
(function(root) {
  function activeFrame(items, time) {
    if (!Number.isFinite(time)) return null;
    const scene = items.find(item => item.context.startSeconds <= time && time < item.context.endSeconds);
    if (!scene) return null;
    const frames = items.filter(item => item.stableId === scene.stableId && Number.isFinite(item.artifact.timeSeconds))
      .sort((a,b) => a.artifact.timeSeconds-b.artifact.timeSeconds);
    return frames.filter(item => item.artifact.timeSeconds <= time).at(-1) || frames[0] || null;
  }
  function adjacentFrame(items, currentId, delta) {
    const frames = [...items].sort((a,b) => a.artifact.timeSeconds-b.artifact.timeSeconds);
    if (!frames.length) return null;
    const index = frames.findIndex(item => item.rowId === currentId);
    return frames[Math.max(0,Math.min(frames.length-1,index+delta))];
  }
  root.ReviewTimeline = {activeFrame, adjacentFrame};
  if (typeof module !== 'undefined') module.exports = root.ReviewTimeline;
})(globalThis);
