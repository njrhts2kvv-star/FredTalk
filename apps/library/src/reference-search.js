export function referenceScore(item, query, concepts = {}, uses = {}) {
  if (!query.trim()) return 1;
  const text = [item.title, item.label, item.category, item.matching?.action,
    item.matching?.segmentRole, ...(item.matching?.inputObjects || []), ...(item.matching?.tags || item.tags || [])]
    .join(" ").toLowerCase();
  const terms = query.toLowerCase().split(/[\s,，、/]+/).filter(Boolean);
  const wanted = Object.entries(concepts)
    .filter(([, value]) => value.words.some((word) => query.toLowerCase().includes(word)))
    .map(([key]) => key);
  const matched = wanted.filter((key) => item.matching?.conceptIds?.includes(key));
  const wantedUses = Object.entries(uses).filter(([, words]) => words.some((word) => query.toLowerCase().includes(word))).map(([key]) => key);
  const matchedUses = wantedUses.filter((key) => item.matching?.useIds?.includes(key));
  const words = [...new Set(wanted.flatMap((key) => concepts[key].words))]
    .filter((word) => query.toLowerCase().includes(word));
  const matchedWords = words.filter((word) => text.includes(word));
  const literal = terms.filter((term) => text.includes(term));
  if (!matched.length && !matchedUses.length && !literal.length) return 0;
  return 100 * literal.length + 25 * matched.length + 12 * matchedWords.length + 50 * matchedUses.length +
    (wantedUses.length && wantedUses.length === matchedUses.length ? 60 : 0) +
    (wanted.length && matched.length === wanted.length ? 35 : 0);
}
