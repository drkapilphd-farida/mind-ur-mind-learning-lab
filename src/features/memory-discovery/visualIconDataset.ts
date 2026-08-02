// Memory Discovery™ Visual Icon Dataset — Sprint-1.5 FIX-01.
//
// "Current implementation uses words inside the Visual Memory mission.
// This is incorrect. Words measure verbal memory, not visual memory...
// Never use words. Never ask users to remember text." The old
// `objectDataset.ts` ('everyday-object') flashed plain text nouns
// ("apple", "compass") — genuinely verbal, whatever the label said. This
// is a real, separate `'visual-icon'` content type: every item's own
// real `content` field IS the glyph itself (an emoji/symbol), never a
// word — Visual Memory now flashes and recalls actual pictures.
// `everyday-object` is untouched and stays exactly as it was for Image
// Recall's own decoys and the unrelated tratak-intelligence feature.
//
// Difficulty here is NOT vocabulary obscurity (that's a verbal axis and
// doesn't transfer to pure images) — it's real visual confusability.
// Beginner tiers use icons that are maximally distinct from one another
// (a fruit, a vehicle, a tool, a ball, a tree); harder tiers deliberately
// draw from the SAME visual category (five different fruits, five
// similar shapes) so the real task becomes telling visually-similar
// pictures apart from memory, a genuine visual-memory difficulty curve.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const MEMORY_DISCOVERY_VISUAL_ICON_DATASET = createDataset({
  id: 'en-memory-discovery-visual-icons',
  locale: 'en',
  contentType: 'visual-icon',
  rawItems: [
    // Beginner — maximally distinct icons, easy to tell apart
    { content: '🍎', difficulty: 'beginner', categories: ['memory'] },
    { content: '🚲', difficulty: 'beginner', categories: ['memory'] },
    { content: '🔑', difficulty: 'beginner', categories: ['memory'] },
    { content: '🏀', difficulty: 'beginner', categories: ['memory'] },
    { content: '🌳', difficulty: 'beginner', categories: ['memory'] },
    { content: '📖', difficulty: 'beginner', categories: ['memory'] },
    { content: '☂️', difficulty: 'beginner', categories: ['memory'] },
    { content: '🎈', difficulty: 'beginner', categories: ['memory'] },
    { content: '🚗', difficulty: 'beginner', categories: ['memory'] },
    { content: '🕐', difficulty: 'beginner', categories: ['memory'] },
    { content: '🎁', difficulty: 'beginner', categories: ['memory'] },
    { content: '🐶', difficulty: 'beginner', categories: ['memory'] },
    { content: '☕', difficulty: 'beginner', categories: ['memory'] },
    { content: '⚽', difficulty: 'beginner', categories: ['memory'] },
    { content: '✏️', difficulty: 'beginner', categories: ['memory'] },
    { content: '🌙', difficulty: 'beginner', categories: ['memory'] },

    // Easy — still everyday, a little less spread across categories
    { content: '🧢', difficulty: 'easy', categories: ['memory'] },
    { content: '👟', difficulty: 'easy', categories: ['memory'] },
    { content: '🎒', difficulty: 'easy', categories: ['memory'] },
    { content: '🧦', difficulty: 'easy', categories: ['memory'] },
    { content: '🪑', difficulty: 'easy', categories: ['memory'] },
    { content: '💡', difficulty: 'easy', categories: ['memory'] },
    { content: '🔔', difficulty: 'easy', categories: ['memory'] },
    { content: '🎯', difficulty: 'easy', categories: ['memory'] },
    { content: '🧸', difficulty: 'easy', categories: ['memory'] },
    { content: '🎨', difficulty: 'easy', categories: ['memory'] },
    { content: '🪁', difficulty: 'easy', categories: ['memory'] },
    { content: '🏆', difficulty: 'easy', categories: ['memory'] },
    { content: '🎵', difficulty: 'easy', categories: ['memory'] },
    { content: '📷', difficulty: 'easy', categories: ['memory'] },
    { content: '🧭', difficulty: 'easy', categories: ['memory'] },
    { content: '⏰', difficulty: 'easy', categories: ['memory'] },

    // Medium — real, deliberate visual overlap starts here (fruit set,
    // transport set, weather set all now share several members)
    { content: '🍏', difficulty: 'medium', categories: ['memory'] },
    { content: '🍐', difficulty: 'medium', categories: ['memory'] },
    { content: '🍑', difficulty: 'medium', categories: ['memory'] },
    { content: '🍒', difficulty: 'medium', categories: ['memory'] },
    { content: '🚌', difficulty: 'medium', categories: ['memory'] },
    { content: '🚕', difficulty: 'medium', categories: ['memory'] },
    { content: '🚙', difficulty: 'medium', categories: ['memory'] },
    { content: '🚓', difficulty: 'medium', categories: ['memory'] },
    { content: '☀️', difficulty: 'medium', categories: ['memory'] },
    { content: '⛅', difficulty: 'medium', categories: ['memory'] },
    { content: '🌧️', difficulty: 'medium', categories: ['memory'] },
    { content: '⛈️', difficulty: 'medium', categories: ['memory'] },
    { content: '🐱', difficulty: 'medium', categories: ['memory'] },
    { content: '🐭', difficulty: 'medium', categories: ['memory'] },
    { content: '🐰', difficulty: 'medium', categories: ['memory'] },
    { content: '🦊', difficulty: 'medium', categories: ['memory'] },

    // Advanced — closer visual pairs (similar shapes/colours within a
    // set), still instantly recognizable on their own
    { content: '🔴', difficulty: 'advanced', categories: ['memory'] },
    { content: '🟠', difficulty: 'advanced', categories: ['memory'] },
    { content: '🟡', difficulty: 'advanced', categories: ['memory'] },
    { content: '🟢', difficulty: 'advanced', categories: ['memory'] },
    { content: '🔵', difficulty: 'advanced', categories: ['memory'] },
    { content: '🟣', difficulty: 'advanced', categories: ['memory'] },
    { content: '▲', difficulty: 'advanced', categories: ['memory'] },
    { content: '●', difficulty: 'advanced', categories: ['memory'] },
    { content: '■', difficulty: 'advanced', categories: ['memory'] },
    { content: '◆', difficulty: 'advanced', categories: ['memory'] },
    { content: '★', difficulty: 'advanced', categories: ['memory'] },
    { content: '⬤', difficulty: 'advanced', categories: ['memory'] },
    { content: '🔺', difficulty: 'advanced', categories: ['memory'] },
    { content: '🔻', difficulty: 'advanced', categories: ['memory'] },
    { content: '🔶', difficulty: 'advanced', categories: ['memory'] },
    { content: '🔷', difficulty: 'advanced', categories: ['memory'] },

    // Expert — the hardest real visual-memory set: directional arrows and
    // near-identical geometric marks, genuinely easy to mix up from
    // memory alone
    { content: '⬆️', difficulty: 'expert', categories: ['memory'] },
    { content: '⬇️', difficulty: 'expert', categories: ['memory'] },
    { content: '⬅️', difficulty: 'expert', categories: ['memory'] },
    { content: '➡️', difficulty: 'expert', categories: ['memory'] },
    { content: '↗️', difficulty: 'expert', categories: ['memory'] },
    { content: '↘️', difficulty: 'expert', categories: ['memory'] },
    { content: '↙️', difficulty: 'expert', categories: ['memory'] },
    { content: '↖️', difficulty: 'expert', categories: ['memory'] },
    { content: '▲', difficulty: 'expert', categories: ['memory'] },
    { content: '▼', difficulty: 'expert', categories: ['memory'] },
    { content: '◀', difficulty: 'expert', categories: ['memory'] },
    { content: '▶', difficulty: 'expert', categories: ['memory'] },
    { content: '◇', difficulty: 'expert', categories: ['memory'] },
    { content: '◈', difficulty: 'expert', categories: ['memory'] },
    { content: '⬟', difficulty: 'expert', categories: ['memory'] },
    { content: '⬢', difficulty: 'expert', categories: ['memory'] },
  ],
})
