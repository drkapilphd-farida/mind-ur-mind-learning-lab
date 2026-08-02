import type { UniversalSourceType } from '@/core/universal-learning-engine/upload'
import type { ExtractionResult } from '../errors/ExtractionError'

const SOURCE_TYPE_LABEL: Partial<Record<UniversalSourceType, string>> = {
  image: 'Image',
  voice: 'Voice',
  website: 'Website',
  youtube: 'YouTube',
  'cloud-storage': 'Cloud storage',
}

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. Honest
// placeholder for every source type this brief marks "Placeholder only"
// (Images/Voice/Website/YouTube) — never a fabricated empty-but-
// successful document. Matches UCE-1's own established "Coming Soon, not
// a broken button" honesty convention.
export async function extractPlaceholder(sourceType: UniversalSourceType): Promise<ExtractionResult> {
  const label = SOURCE_TYPE_LABEL[sourceType] ?? 'This source type'
  return {
    success: false,
    error: { code: 'extraction-failed', message: `${label} extraction is not yet supported.` },
  }
}
