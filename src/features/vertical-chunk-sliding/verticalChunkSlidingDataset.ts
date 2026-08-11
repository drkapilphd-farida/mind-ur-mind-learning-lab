import type { ReadingUnit } from '@/features/reading-engine/types'

// Vertical Chunk Sliding™ — companion to Dynamic Chunk Sliding™, same
// "real, hand-authored sentences, programmatically chunked" content model,
// own dataset (no shared files with dynamicChunkSlidingDataset.ts, per
// this app's own-copy convention). The one real difference: content is
// organized into 20 topical categories so each session can draw from a
// genuinely different passage rather than always the same fixed list —
// see pickSessionCategory below.
export type VerticalChunkSlidingCategory = {
  id: string
  label: string
  sentences: readonly string[]
}

export const VERTICAL_CHUNK_SLIDING_CATEGORIES: readonly VerticalChunkSlidingCategory[] = [
  {
    id: 'quantum-focus',
    label: 'Quantum Focus',
    sentences: [
      'Deep focus narrows the mind until only the essential signal remains clearly visible.',
      'A quantum mind holds one clear intention while filtering out every competing distraction.',
      'True concentration feels quiet, not forced, like a lens settling perfectly into place.',
      'The sharpest attention arrives after the noisy urge to multitask finally fades away.',
      'Focused energy directed at one target accomplishes more than scattered effort ever could.',
      'A single clear thought, held steadily, outperforms a dozen half-finished ones.',
    ],
  },
  {
    id: 'cognitive-mastery',
    label: 'Cognitive Mastery',
    sentences: [
      'Mastery begins the moment you notice how your own thinking actually works.',
      'A trained mind recognizes its own biases before those biases can quietly mislead it.',
      'Thinking clearly under pressure is a skill built through calm, repeated practice.',
      'The mind that questions its first conclusion usually reaches a wiser second one.',
      'Cognitive strength grows the same way physical strength does, through consistent controlled effort.',
      'Mastering your attention is the first real step toward mastering your thinking.',
    ],
  },
  {
    id: 'neuroplasticity',
    label: 'Neuroplasticity',
    sentences: [
      'Every new skill you practice physically reshapes the pathways inside your own brain.',
      'The brain rewires itself constantly, rewarding whatever behavior you repeat most often.',
      'Neurons that fire together during practice gradually wire themselves together for good.',
      'Old habits fade only when new, stronger neural pathways are built to replace them.',
      'Your brain remains capable of real change at any age you choose to practice.',
      'Repetition is the language the brain uses to decide what truly matters.',
    ],
  },
  {
    id: 'speed-reading-science',
    label: 'Speed Reading Science',
    sentences: [
      'Fast readers see whole phrases at once instead of tracking one word at a time.',
      'Eye movement research shows the brain absorbs meaning during brief pauses, not during motion.',
      'Reducing inner speech lets the eyes move faster than the voice in your head.',
      'Skilled readers trust their peripheral vision to catch words before they arrive directly.',
      'Chunking words into meaningful groups reduces the total number of stops your eyes make.',
      'Reading speed improves naturally once comprehension no longer requires conscious translation.',
    ],
  },
  {
    id: 'mindfulness-presence',
    label: 'Mindfulness & Presence',
    sentences: [
      'Presence means noticing this exact moment without rushing ahead to the next one.',
      'A mindful pause between thoughts creates space for a calmer, clearer response.',
      'Awareness of the breath quietly anchors the mind whenever it starts to wander.',
      'Being present does not mean thinking less, it means noticing more of what already exists.',
      'The present moment is the only place real focus has ever actually happened.',
      'Mindful attention treats each passing thought as a visitor, not a permanent resident.',
    ],
  },
  {
    id: 'memory-systems',
    label: 'Memory Systems',
    sentences: [
      'Memories grow stronger each time they are recalled, not simply each time they are stored.',
      'Spacing your practice over several days builds memory that lasts far longer than cramming.',
      'The brain remembers meaning more easily than it remembers isolated, disconnected facts.',
      'Linking new information to something familiar makes it dramatically easier to recall later.',
      "Sleep quietly consolidates the day's learning into memory you can trust tomorrow.",
      'Active recall trains memory far more effectively than simply rereading the same material.',
    ],
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    sentences: [
      'Deep work happens only when distraction is deliberately removed from the room.',
      'Meaningful progress usually comes from long, uninterrupted stretches, not short scattered bursts.',
      'The ability to concentrate without switching tasks is becoming a genuinely rare skill.',
      'Hard problems yield to sustained attention far more often than they yield to shortcuts.',
      'Protecting a block of undistracted time is often the real key to real output.',
      'Deep work rewards patience with results that shallow, fragmented effort rarely produces.',
    ],
  },
  {
    id: 'flow-states',
    label: 'Flow States',
    sentences: [
      'Flow arrives when a challenge perfectly matches the skill you already bring to it.',
      'Time seems to disappear whenever full attention merges completely with the task at hand.',
      'A flow state feels effortless from the outside, though it rests on real ability.',
      'Clear goals and instant feedback are the quiet architecture behind every flow experience.',
      'The edge between boredom and anxiety is exactly where flow tends to appear.',
      'Losing yourself in focused work is often a sign that you are doing it right.',
    ],
  },
  {
    id: 'visualization-techniques',
    label: 'Visualization Techniques',
    sentences: [
      'Vivid mental rehearsal activates many of the same brain regions as real physical practice.',
      'Athletes visualize success in detail long before that success ever happens in reality.',
      'A clear mental image of the outcome makes the actual path there easier to follow.',
      'Visualization works best when it includes sound, feeling, and detail, not just a picture.',
      'Imagining a challenge in advance quietly reduces the anxiety it causes when it finally arrives.',
      'The mind often cannot fully distinguish a vividly imagined rehearsal from lived experience.',
    ],
  },
  {
    id: 'pattern-recognition',
    label: 'Pattern Recognition',
    sentences: [
      'The trained eye starts noticing patterns that a beginner would simply overlook entirely.',
      'Expertise is often just pattern recognition built from thousands of hours of exposure.',
      'Recognizing a familiar structure lets the mind skip straight to the useful part.',
      'Patterns hidden in complex information become obvious once you know what to look for.',
      'A pattern noticed once is far easier to notice again the second time.',
      'Great intuition is frequently just pattern recognition operating faster than conscious thought.',
    ],
  },
  {
    id: 'working-memory',
    label: 'Working Memory',
    sentences: [
      'Working memory holds only a few items at once, so clarity always beats clutter.',
      'Chunking information together frees up limited working memory for harder mental work.',
      'A cluttered mind struggles to hold a new idea long enough to use it.',
      'Working memory improves with practice the same way any other mental muscle does.',
      'Writing a thought down frees working memory to focus on the next one.',
      'The fewer items you juggle mentally, the more clearly you can think about each one.',
    ],
  },
  {
    id: 'creative-thinking',
    label: 'Creative Thinking',
    sentences: [
      'Creativity often means connecting two ideas that nobody had previously placed side by side.',
      'A relaxed mind generates more original ideas than one straining hard to be clever.',
      'The first idea is rarely the best one, so creative thinkers keep generating more.',
      'Constraints frequently sharpen creativity instead of limiting it, forcing genuinely inventive solutions.',
      'Curiosity is the quiet engine behind almost every truly original idea.',
      'Stepping away from a problem often lets a creative solution surface on its own.',
    ],
  },
  {
    id: 'mental-discipline',
    label: 'Mental Discipline',
    sentences: [
      'Discipline is simply choosing what you want most over what you want right now.',
      'Small consistent choices, repeated daily, eventually outweigh a handful of dramatic efforts.',
      'Mental discipline feels difficult at first and quietly becomes automatic with enough repetition.',
      'The strongest habits are built on systems, not on relying on motivation alone.',
      'Showing up on the hard days is what separates real discipline from good intentions.',
      'Discipline is simply a promise you consistently keep to yourself, one day at a time.',
    ],
  },
  {
    id: 'growth-mindset',
    label: 'Growth Mindset',
    sentences: [
      'A growth mindset treats every failure as useful data rather than a final verdict.',
      'Ability grows through effort and practice, not from some fixed trait you were born with.',
      "The word 'yet' quietly transforms a fixed limitation into a temporary, solvable challenge.",
      'Effective effort, not raw talent, explains most of what looks like natural talent.',
      'Mistakes are simply the tuition paid on the way to genuine skill and mastery.',
      'Believing you can improve is often the first real step toward actually improving.',
    ],
  },
  {
    id: 'learning-strategies',
    label: 'Learning Strategies',
    sentences: [
      'Testing yourself teaches more than passively rereading the exact same material again.',
      'Explaining an idea in your own simple words quickly reveals what you actually understand.',
      'Mixing related topics together during practice builds more flexible, transferable understanding.',
      'The best learners regularly ask what they still do not understand yet.',
      'Reviewing material right before you forget it strengthens memory more than reviewing too early.',
      'Learning sticks best when it is active, effortful, and genuinely a little uncomfortable.',
    ],
  },
  {
    id: 'attention-control',
    label: 'Attention Control',
    sentences: [
      'Attention is a limited resource, so guarding it carefully changes what you can achieve.',
      'Every notification you silence is one less small tax on your available focus.',
      'The mind wanders naturally, and noticing that wandering is itself a genuine skill.',
      'Choosing what to ignore is often more powerful than choosing what to focus on.',
      'Sustained attention is trainable, the same way any other cognitive skill can be trained.',
      'A single clear priority protects your attention better than a long scattered list ever could.',
    ],
  },
  {
    id: 'brain-health',
    label: 'Brain Health',
    sentences: [
      'Quality sleep does more for clear thinking than almost any other single daily habit.',
      'Regular movement increases blood flow to the brain and noticeably sharpens focus.',
      'A well rested mind solves problems that a tired mind simply cannot reach.',
      'Hydration and steady nutrition quietly support the mental clarity people often take for granted.',
      'Stress management protects cognitive performance just as much as any study technique does.',
      'Taking real breaks throughout the day actually improves total output, not just comfort.',
    ],
  },
  {
    id: 'peak-performance',
    label: 'Peak Performance',
    sentences: [
      'Peak performance depends on recovery just as much as it depends on effort.',
      'Consistent preparation quietly turns high pressure moments into simply another chance to perform.',
      'The best performers rehearse their fundamentals long after they have already mastered them.',
      'Sustainable performance comes from rhythm and rest, not from constant maximum intensity.',
      'Small measurable improvements, stacked over time, eventually produce a genuinely elite result.',
      'Performing well under pressure is a skill practiced calmly, long before the pressure arrives.',
    ],
  },
  {
    id: 'emotional-regulation',
    label: 'Emotional Regulation',
    sentences: [
      'A calm nervous system makes space for clearer thinking under real pressure.',
      'Naming an emotion accurately often reduces its grip within just a few seconds.',
      'Reacting slower rarely means caring less, it usually just means choosing more wisely.',
      'Emotional regulation is not suppression, it is choosing a considered response instead of a reflex.',
      'A few slow breaths can quietly shift the whole nervous system toward calm.',
      'Steady emotions support steady focus far more reliably than forced positivity ever does.',
    ],
  },
  {
    id: 'habit-formation',
    label: 'Habit Formation',
    sentences: [
      'Habits form fastest when the cue, the routine, and the reward stay perfectly consistent.',
      'Small habits compound quietly until, one day, the results become impossible to ignore.',
      'Identity change often happens through repeated action long before it happens through willpower.',
      'The easiest way to build a habit is to make the very first step tiny.',
      'Environment quietly shapes behavior more than willpower does on most ordinary days.',
      'A habit repeated without exception becomes, in time, simply who you are.',
    ],
  },
] as const

export const TOTAL_VERTICAL_CHUNK_SLIDING_CATEGORIES = VERTICAL_CHUNK_SLIDING_CATEGORIES.length

// Own-copy of dynamicChunkSlidingDataset.ts's splitIntoChunks — identical
// logic, kept as its own copy rather than a shared import per this app's
// established convention of not coupling sibling feature folders together
// for small self-contained pieces of logic.
export function splitIntoChunks(text: string, minSize = 3, maxSize = 4): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  let index = 0
  while (index < words.length) {
    const remaining = words.length - index
    let size = Math.min(maxSize, remaining)
    const leftoverAfter = remaining - size
    if (leftoverAfter > 0 && leftoverAfter < minSize) {
      size = remaining - minSize
    }
    if (size < minSize) {
      size = remaining
    }
    chunks.push(words.slice(index, index + size).join(' '))
    index += size
  }
  return chunks
}

// 2-3 words per chunk, deliberately narrower than the horizontal sibling's
// 3-4 (that one can rely on its frame's own horizontal clipping — a chunk
// sliding partway offscreen is the intended look there; here only the
// vertical axis moves, so every chunk must fit fully within the card's
// width on its own, including on a narrow phone screen).
export function buildUnitsForCategory(category: VerticalChunkSlidingCategory): readonly ReadingUnit[] {
  const chunks = category.sentences.flatMap((sentence) => splitIntoChunks(sentence, 2, 3))
  return chunks.map((text, index) => ({ id: `${category.id}-chunk-${index}`, text }))
}

const LAST_CATEGORY_STORAGE_KEY = 'qsr-vertical-chunk-sliding-last-category'

// Client-only — reads/writes localStorage and calls Math.random(), so it
// must never run during SSR (would be non-deterministic even if it could).
// Callers invoke this exclusively from a useEffect, never from a lazy
// useState initializer, so the server-rendered 'settings' phase and the
// client's first paint always match before this ever runs.
export function pickSessionCategory(): VerticalChunkSlidingCategory {
  const categories = VERTICAL_CHUNK_SLIDING_CATEGORIES
  let lastId: string | null = null
  if (typeof window !== 'undefined') {
    try {
      lastId = localStorage.getItem(LAST_CATEGORY_STORAGE_KEY)
    } catch {
      lastId = null
    }
  }

  const pool = lastId === null ? categories : categories.filter((category) => category.id !== lastId)
  const eligiblePool = pool.length > 0 ? pool : categories
  const picked = eligiblePool[Math.floor(Math.random() * eligiblePool.length)] ?? categories[0]!

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LAST_CATEGORY_STORAGE_KEY, picked.id)
    } catch {
      // Best-effort only — a session still works perfectly without
      // non-repeat tracking, it just can't remember last time's pick.
    }
  }

  return picked
}
