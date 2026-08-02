import type { PhraseAsset } from '@/core/universal-learning-engine/learning-assets'
import type { PhraseCluster } from '@/features/phrase-reading/phraseClusterDataset'

// QSR-ENGINE-SWAP-1 — real per-document `PhraseAsset[]` → `PhraseCluster[]`.
// Each cluster's `members` is the real phrase plus 3 OTHER real phrases
// from the same document (a genuine "which of these did you actually
// read" recognition challenge) — never near-miss wording variants, since
// those don't exist in real per-document data. `missingWord`/`completion`/
// `meaningMatch` are deliberately left undefined: phraseEngine.ts's own
// `resolveUsableChallengeType` already falls back to `exact-recognition`
// whenever a cluster lacks them, so the mission plays honestly using only
// `exact-recognition`/`phrase-order` rounds — no fabricated content, zero
// gameplay code touched.
const MIN_PHRASES_REQUIRED = 4

export function toPhraseReadingClusters(assets: readonly PhraseAsset[]): PhraseCluster[] {
  if (assets.length < MIN_PHRASES_REQUIRED) return []

  return assets.map((asset, index) => {
    const others: string[] = []
    for (let offset = 1; others.length < 3; offset += 1) {
      const candidate = assets[(index + offset) % assets.length]
      if (candidate && candidate.phrase !== asset.phrase) others.push(candidate.phrase)
      if (offset > assets.length) break
    }
    return { members: [asset.phrase, ...others] }
  })
}
