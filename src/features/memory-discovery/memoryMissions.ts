import type { MemoryDiscoverySceneId } from './types'

// Memory Discovery Foundation™ (Sprint-1) — the locked 5-Mission flow.
// "These are NOT difficulty levels. These are Memory Discovery
// missions" (mirrors Reading Discovery's own `ReadingSprintId` rule).
export const MEMORY_MISSION_ORDER = ['visual', 'number', 'word', 'pattern', 'recognition'] as const
export type MemoryMissionId = (typeof MEMORY_MISSION_ORDER)[number]

export const MEMORY_MISSION_LABEL: Record<MemoryMissionId, string> = {
  visual: '👀 Visual Memory',
  number: '🔢 Number Memory',
  word: '🧠 Word Memory',
  pattern: '🔗 Pattern & Sequence',
  recognition: '🎯 Recognition & Recall',
}

// Sprint-1.5 FIX-09 — "Every mission should immediately communicate what
// is being tested... Keep instructions extremely short. Maximum one
// sentence." Verbatim from the brief's own examples — supersedes Sprint-
// 1 FIX-02's own (longer) intro copy with a shorter, more direct line
// that names the actual skill being measured.
export const MEMORY_MISSION_INTRO_COPY: Record<MemoryMissionId, string> = {
  visual: 'Remember what you see.',
  number: 'Remember the sequence.',
  word: 'Remember the words.',
  pattern: 'Find the hidden pattern.',
  recognition: 'Recognize what you’ve seen.',
}

// FIX-05 — the short transition line shown on the way INTO each mission
// (i.e. after the previous one finishes), same "Curiosity Loop" pattern
// Reading Discovery already established. `visual` has no entry — it's
// reached directly from Welcome, not from a prior mission finishing.
export const MEMORY_MISSION_CURIOSITY_COPY: Partial<Record<MemoryMissionId, string>> = {
  number: 'Now let’s explore how your brain remembers numbers.',
  word: 'Let’s see how your brain remembers words.',
  pattern: 'Let’s discover how your brain remembers patterns.',
  recognition: 'Let’s see how quickly your brain recognizes what it has seen.',
}

// FIX-04 — "Each mission should celebrate a different achievement. Never
// repeat the same message." Verbatim from the brief's own examples for
// Visual/Number/Word; Pattern/Recognition follow the same voice.
export const MEMORY_MISSION_ACHIEVEMENT: Record<MemoryMissionId, string> = {
  visual: 'Great Recognition!',
  number: 'Nice Recall!',
  word: 'Excellent Focus!',
  pattern: 'Sharp Pattern Sense!',
  recognition: 'Quick Recognition!',
}

// A real, flat, disclosed participation reward — same discipline as
// Reading Discovery's own `computeSprintXpAward` (never tied to
// correctness; nothing in this experience is ever scored).
export const MISSION_XP_AWARD = 25

// Sprint-1.5 FIX-06 — "Each mission must have one clear objective... never
// overlap these skills unnecessarily." Number Memory is now one real
// self-contained multi-round Digit Span scene (no separate choice
// scene — `DigitSpanCard` runs its own internal loop, FIX-02); Pattern &
// Sequence now measures real ordered-sequence memory, not word-chunk
// recognition (FIX-04); Recognition & Recall combines THREE real,
// genuinely different content types — words (Sentence Recall), objects
// (Image Recall), and shapes/colours (Shape Recognition) — rather than
// being mostly word recognition (FIX-05).
export const MISSION_SCENES: Record<MemoryMissionId, readonly MemoryDiscoverySceneId[]> = {
  visual: ['visual-memory-display', 'visual-memory-recall', 'visual-memory-insight'],
  number: ['number-memory-display', 'number-memory-insight'],
  word: ['word-memory-display', 'word-memory-recall', 'word-memory-insight'],
  pattern: ['pattern-sequence-display', 'pattern-sequence-choice', 'pattern-sequence-insight'],
  recognition: [
    'sentence-recall-display',
    'sentence-recall-choice',
    'sentence-recall-insight',
    'image-recall-display',
    'image-recall-choice',
    'image-recall-insight',
    'shape-recognition-display',
    'shape-recognition-choice',
    'shape-recognition-insight',
  ],
}

// The reverse lookup the orchestrator actually needs: given any real
// scene, which real Mission does it belong to (`undefined` for `welcome`
// and `learning-memory-profile`, neither of which belongs to a Mission).
export const SCENE_TO_MISSION: Partial<Record<MemoryDiscoverySceneId, MemoryMissionId>> = Object.fromEntries(
  MEMORY_MISSION_ORDER.flatMap((mission) => MISSION_SCENES[mission].map((scene) => [scene, mission] as const)),
)
