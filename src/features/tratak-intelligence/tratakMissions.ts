// Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10A.
// The mission roadmap definition — mirrors fixationLevels.ts's style: one
// readonly const array as the single source of truth for every mission's
// display content. This array (not tratakTypes.ts's TratakMissionId union)
// is what actually drives the journey's progress-%/XP math and roadmap
// cards — see tratakMissionEngine.ts.
//
// Sprint 10F: the 5 originally-reserved placeholder missions were
// consolidated into Image Persistence Challenge™.
//
// Sprint 10F refinement: Mandala Persistence™ was retired from this roadmap
// (real product review — duplicated Image Persistence Challenge™'s
// purpose) in favor of Candle Tratak™ as Mission 1.
//
// Sprint 11B: Mandala Persistence™ reinstated as order 3, per explicit
// product decision — it's now a real stage of Visual Activation™'s guided
// sequence. Candle Tratak™ and Image Persistence Challenge™ keep their
// existing order values (1/2) so the standalone /tratak hub's own roadmap
// card order is unaffected.

import { Flame, Images, Sparkles, type LucideIcon } from 'lucide-react'
import type { TratakMissionId } from './tratakTypes'

export type TratakDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type TratakMissionDefinition = {
  id: TratakMissionId
  order: 1 | 2 | 3
  title: string
  description: string
  icon: LucideIcon
  difficulty: TratakDifficulty
  /** Designed baseline length — Candle Tratak™'s is the timer default (45s); Image Persistence Challenge™'s reflects a full 5-image day. The user's actual chosen timer(s) are the real per-session duration(s). */
  estimatedTimeSeconds: number
  /** A flat, disclosed reward constant awarded per completed unit — never fabricated, same convention as Fixation's per-session XP. */
  xpReward: number
}

export const TRATAK_MISSIONS: readonly TratakMissionDefinition[] = [
  {
    id: 'candle-tratak',
    order: 1,
    title: 'Candle Tratak™',
    description: 'Train steady gaze using a realistic candle flame.',
    icon: Flame,
    difficulty: 'Beginner',
    estimatedTimeSeconds: 45,
    xpReward: 50,
  },
  {
    id: 'image-persistence-challenge',
    order: 2,
    title: 'Image Persistence Challenge™',
    description: 'A daily 5-image adaptive challenge across mandalas, sacred geometry, flowers, animals, objects and faces — each with its own fixation anchor and observation questions.',
    icon: Images,
    difficulty: 'Intermediate',
    // A full day's 5 images at the default 45s timer + 20s eyes-closed each.
    estimatedTimeSeconds: 325,
    xpReward: 50,
  },
  {
    id: 'mandala-persistence',
    order: 3,
    title: 'Mandala Persistence™',
    description: 'Train your visual fixation using beautiful symmetrical mandalas.',
    icon: Sparkles,
    difficulty: 'Intermediate',
    estimatedTimeSeconds: 45,
    xpReward: 50,
  },
] as const

// Sprint 10F refinement: 'mandala-persistence' stays a valid TratakMissionId
// (tratakTypes.ts) for route continuity but is deliberately absent here, so
// this map is missing that one key at runtime despite the type's claim of
// completeness. The single real risk (completeTratakMissionSession.ts's
// xpReward lookup, fed by raw client input) guards against that explicitly;
// every other reader of this map only ever indexes with ids drawn from
// TRATAK_MISSIONS itself, so it's always safe there.
export const TRATAK_MISSION_BY_ID: Record<TratakMissionId, TratakMissionDefinition> = Object.fromEntries(
  TRATAK_MISSIONS.map((mission) => [mission.id, mission]),
) as Record<TratakMissionId, TratakMissionDefinition>
