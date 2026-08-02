// Visual Intelligence Lab™ — Dynamic Mandala Intelligence™, Sprint 10D.
// One real, distinct square image per level, generated in-house (no
// external asset licensing/sourcing) — the swap point for future
// production artwork: replacing the file at the same path needs no code
// change anywhere in this feature.

import type { MandalaLevelOrder } from './mandalaLevels'

export const MANDALA_IMAGE_BY_ORDER: Record<MandalaLevelOrder, string> = {
  1: '/tratak/mandalas/level1.jpg',
  2: '/tratak/mandalas/level2.jpg',
  3: '/tratak/mandalas/level3.jpg',
  4: '/tratak/mandalas/level4.jpg',
  5: '/tratak/mandalas/level5.jpg',
}
