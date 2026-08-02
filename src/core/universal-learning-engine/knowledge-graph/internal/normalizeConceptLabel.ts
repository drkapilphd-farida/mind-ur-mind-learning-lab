// Learning Knowledge Graph™ (UCE-4). Pure. The real dedup key for
// concept nodes — "No duplicated concepts." Lowercased, trimmed,
// internal whitespace collapsed to a single space, so "Newton's Law",
// " newton's  law", and "NEWTON'S LAW" all resolve to the same concept
// node. Deliberately simple/deterministic — no stemming, no synonym
// resolution (a real NLP capability this sprint doesn't have) — two
// concepts that are semantically the same but worded differently (e.g.
// "force" vs "forces") are honestly treated as distinct nodes rather
// than silently guessed to be the same one.
export function normalizeConceptLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ')
}
