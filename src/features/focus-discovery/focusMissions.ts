import type { FocusDiscoverySceneId } from './types'

// Focus Discovery Foundation™ (Sprint-1) FIX-01 — the locked 5-Mission
// journey. "These are NOT difficulty levels" — mirrors Reading
// Discovery's `ReadingSprintId` and Memory Discovery's `MemoryMissionId`
// rule exactly.
export const FOCUS_MISSION_ORDER = ['attention-lock', 'visual-search', 'reaction-focus', 'sustained-focus', 'cognitive-flexibility'] as const
export type FocusMissionId = (typeof FOCUS_MISSION_ORDER)[number]

export const FOCUS_MISSION_LABEL: Record<FocusMissionId, string> = {
  'attention-lock': '🎯 Attention Lock™',
  'visual-search': '👀 Visual Search™',
  'reaction-focus': '⚡ Reaction Focus™',
  'sustained-focus': '🧩 Sustained Focus™',
  'cognitive-flexibility': '🔄 Cognitive Flexibility™',
}

// FIX-07 — "Every mission begins with a short AI introduction... Maximum
// one heading, one sentence, one CTA." Verbatim from the brief's own
// examples.
export const FOCUS_MISSION_INTRO_COPY: Record<FocusMissionId, string> = {
  'attention-lock': "Let's discover how you filter distractions.",
  'visual-search': "Let's explore your visual attention.",
  'reaction-focus': "Let's measure your reaction focus.",
  'sustained-focus': "Let's test how long you can stay attentive.",
  'cognitive-flexibility': "Let's see how quickly your brain adapts.",
}

// The short transition line shown on the way INTO each mission (after
// the previous one's Mission Complete beat) — same Curiosity Loop
// pattern Reading/Memory Discovery already established. Sprint-1.7
// RULE-06 — "Preparing Next Challenge" — each line now signals real
// forward momentum, never just naming the next mission.
// `attention-lock` has no entry — it's reached directly from Welcome.
export const FOCUS_MISSION_CURIOSITY_COPY: Partial<Record<FocusMissionId, string>> = {
  'visual-search': 'Preparing your next challenge — a sharper visual search.',
  'reaction-focus': 'Preparing your next challenge — testing your reaction speed.',
  'sustained-focus': 'Preparing your next challenge — a longer test of endurance.',
  'cognitive-flexibility': 'Preparing your final challenge — how fast can you adapt?',
}

// A real, flat, disclosed participation reward — same discipline as
// Reading/Memory Discovery's own award (never tied to correctness;
// nothing in this experience is ever scored).
export const MISSION_XP_AWARD = 25

// FIX-13 — "Ensure every mission measures a different attention skill."
// Each mission is exactly one real, self-contained scene (see
// `types.ts`'s own comment for why this differs from Memory Discovery's
// multi-scene-per-mission shape).
export const MISSION_SCENES: Record<FocusMissionId, readonly [FocusDiscoverySceneId]> = {
  'attention-lock': ['attention-lock'],
  'visual-search': ['visual-search'],
  'reaction-focus': ['reaction-focus'],
  'sustained-focus': ['sustained-focus'],
  'cognitive-flexibility': ['cognitive-flexibility'],
}

// The reverse lookup the orchestrator actually needs: given any real
// scene, which real Mission does it belong to (`undefined` for `welcome`
// and `focus-discovery-complete`, neither of which belongs to a Mission).
export const SCENE_TO_MISSION: Partial<Record<FocusDiscoverySceneId, FocusMissionId>> = Object.fromEntries(
  FOCUS_MISSION_ORDER.flatMap((mission) => MISSION_SCENES[mission].map((scene) => [scene, mission] as const)),
)
