// Reading Sprint™ — content + scoring for the 2-minute assessment
// lead magnet's reading phase. Self-contained (no imports from Memory
// Challenge's dataset) — this project's own established convention is
// that each area keeps its own copy of shared-shaped logic (scoring
// formulas, shuffle helpers) rather than importing across unrelated
// feature areas.
//
// Rewritten around a genuine content-repetition fix: instead of cycling
// through several short, unrelated fragments per session, exactly ONE
// full, real motivational passage is picked per session — with its own
// pre-written, text-specific comprehension questions — so what the
// learner reads and what they're asked about are always the same real
// piece of writing, never a recombined mix of unrelated flashes.

export type ReadingMCQ = {
  question: string
  options: readonly [string, string, string, string]
  correctIndex: number
}

export type ReadingSet = {
  id: string
  theme: string
  text: string
  questions: readonly [ReadingMCQ, ReadingMCQ]
}

type ReadingSetDef = {
  id: string
  theme: string
  text: string
  factQuestion: string
  factOptions: readonly [string, string, string, string]
  factCorrectIndex: number
}

// 28 distinct, real passages (never lorem ipsum) — each 2 sentences,
// written so the second sentence states one concrete, quizzable fact.
// Comfortably over the brief's 25-30 minimum.
const READING_SET_DEFS: readonly ReadingSetDef[] = [
  {
    id: 'quantum-speed-reading',
    theme: 'Quantum Speed Reading',
    text: 'Quantum speed reading trains your eyes to absorb whole phrases instead of single words. Readers who practice this technique for just ten minutes a day often double their reading speed within a month.',
    factQuestion: 'According to the passage, how long must someone practice each day to see results?',
    factOptions: ['Ten minutes', 'One hour', 'Thirty seconds', 'Two hours'],
    factCorrectIndex: 0,
  },
  {
    id: 'brain-plasticity',
    theme: 'Brain Plasticity',
    text: "Your brain rewires itself every time you learn something new, a process scientists call neuroplasticity. This means the connections you strengthen today become the mental shortcuts you'll rely on tomorrow.",
    factQuestion: "What do scientists call the brain's ability to rewire itself?",
    factOptions: ['Neuroplasticity', 'Neurogenesis', 'Synaptic pruning', 'Cognitive load'],
    factCorrectIndex: 0,
  },
  {
    id: 'focus-mastery',
    theme: 'Focus Mastery',
    text: 'Deep focus is a skill, not a personality trait, and it strengthens the same way a muscle does. Each time you resist a distraction, the next hour of concentration gets noticeably easier to sustain.',
    factQuestion: 'What happens each time you resist a distraction, per the passage?',
    factOptions: ['The next hour of focus gets easier', 'You lose mental energy', 'Your brain rewires permanently', 'You need more sleep'],
    factCorrectIndex: 0,
  },
  {
    id: 'memory-mastery',
    theme: 'Memory Mastery',
    text: "Your memory doesn't fail you — it's often just unused. A technique called spaced repetition can improve recall by more than fifty percent.",
    factQuestion: 'By how much can spaced repetition improve recall, according to the passage?',
    factOptions: ['More than fifty percent', 'Exactly ten percent', 'Only slightly', 'It cannot improve recall'],
    factCorrectIndex: 0,
  },
  {
    id: 'growth-mindset',
    theme: 'Growth Mindset',
    text: 'People with a growth mindset believe ability can be developed through effort. Studies show these learners recover from setbacks nearly twice as fast as those who believe talent is fixed.',
    factQuestion: 'How much faster do growth-mindset learners recover from setbacks, per the passage?',
    factOptions: ['Nearly twice as fast', 'Three times as fast', 'Not any faster', 'Half as fast'],
    factCorrectIndex: 0,
  },
  {
    id: 'deep-work',
    theme: 'Deep Work',
    text: 'Deep work means focusing without distraction on a single demanding task. Just one uninterrupted hour of deep work can produce more value than a full day of scattered attention.',
    factQuestion: 'According to the passage, one uninterrupted hour of deep work can produce more value than what?',
    factOptions: ['A full day of scattered attention', 'A full week of rest', 'Ten minutes of shallow work', 'Nothing at all'],
    factCorrectIndex: 0,
  },
  {
    id: 'peak-performance',
    theme: 'Peak Performance',
    text: 'Elite performers protect their energy as carefully as their time. Athletes who schedule regular recovery periods perform measurably better in the final quarter of competition.',
    factQuestion: 'When do athletes who schedule recovery perform measurably better, per the passage?',
    factOptions: ['In the final quarter of competition', 'At the very start', 'Only during practice', 'Never'],
    factCorrectIndex: 0,
  },
  {
    id: 'habit-formation',
    theme: 'Habit Formation',
    text: 'Small habits compound quietly until they reshape an entire identity. Reading just one page daily adds up to more than twenty books finished in a single year.',
    factQuestion: 'How many books can one page a day add up to in a year, per the passage?',
    factOptions: ['More than twenty', 'Exactly one', 'About five', 'Zero'],
    factCorrectIndex: 0,
  },
  {
    id: 'neuroscience-of-learning',
    theme: 'Neuroscience of Learning',
    text: 'The brain consolidates new information most effectively during sleep. Students who slept eight hours after studying recalled significantly more than those who stayed up all night.',
    factQuestion: 'Who recalled more, according to the passage — students who slept eight hours or those who stayed up?',
    factOptions: ['Students who slept eight hours', 'Students who stayed up all night', 'Neither group recalled anything', 'Both recalled the same amount'],
    factCorrectIndex: 0,
  },
  {
    id: 'visual-memory',
    theme: 'Visual Memory',
    text: 'The brain stores images far more durably than plain text. A single strong mental picture can anchor a fact in memory for years after the words themselves fade.',
    factQuestion: 'According to the passage, what anchors a fact in memory for years?',
    factOptions: ['A single strong mental picture', 'Repeating the word aloud', 'Writing it down once', 'Ignoring it'],
    factCorrectIndex: 0,
  },
  {
    id: 'speed-and-comprehension',
    theme: 'Speed & Comprehension',
    text: 'Reading faster does not have to mean understanding less. Trained readers who chunk phrases together often score higher on comprehension tests than slow, word-by-word readers.',
    factQuestion: 'Who often scores higher on comprehension tests, per the passage?',
    factOptions: ['Trained readers who chunk phrases', 'Slow word-by-word readers', 'Neither group', 'Only skimmers'],
    factCorrectIndex: 0,
  },
  {
    id: 'cognitive-endurance',
    theme: 'Cognitive Endurance',
    text: 'Mental stamina, like physical stamina, can be trained through gradual overload. Extending a single focused session by just five minutes each week steadily builds real cognitive endurance.',
    factQuestion: 'By how many minutes per week should a focused session be extended, per the passage?',
    factOptions: ['Five minutes', 'One hour', 'Thirty minutes', 'Zero'],
    factCorrectIndex: 0,
  },
  {
    id: 'working-memory',
    theme: 'Working Memory',
    text: "Working memory holds the few facts you're actively using right now. Most people can juggle only about four items at once before something slips away.",
    factQuestion: 'About how many items can most people juggle in working memory, per the passage?',
    factOptions: ['About four', 'About twenty', 'Only one', 'An unlimited number'],
    factCorrectIndex: 0,
  },
  {
    id: 'attention-span',
    theme: 'Attention Span',
    text: "Attention is not a fixed resource; it's a trainable filter. Ten days of deliberate single-tasking can noticeably shrink the pull of constant distraction.",
    factQuestion: 'How many days of single-tasking does the passage mention?',
    factOptions: ['Ten days', 'One day', 'A full year', 'Two hours'],
    factCorrectIndex: 0,
  },
  {
    id: 'mental-clarity',
    theme: 'Mental Clarity',
    text: 'Clutter in your environment quietly clutters your thinking too. Clearing your desk before a study session has been shown to shorten the time it takes to enter focus.',
    factQuestion: 'What does clearing your desk shorten, according to the passage?',
    factOptions: ['The time it takes to enter focus', 'Your sleep schedule', 'Your reading speed', 'Nothing measurable'],
    factCorrectIndex: 0,
  },
  {
    id: 'mindful-reading',
    theme: 'Mindful Reading',
    text: 'Reading with full presence turns a page into an experience, not a task. A single mindful chapter can be remembered more vividly than an entire distracted afternoon of scrolling.',
    factQuestion: 'What can be remembered more vividly than a distracted afternoon of scrolling, per the passage?',
    factOptions: ['A single mindful chapter', 'Nothing at all', 'A quick glance', 'An advertisement'],
    factCorrectIndex: 0,
  },
  {
    id: 'curiosity-and-learning',
    theme: 'Curiosity & Learning',
    text: 'Curiosity acts like a spotlight that makes new information easier to store. Learners who write down one genuine question before reading retain noticeably more of what follows.',
    factQuestion: 'What should learners write down before reading, according to the passage?',
    factOptions: ['One genuine question', 'A summary', 'Nothing', 'The page number'],
    factCorrectIndex: 0,
  },
  {
    id: 'confidence-and-recall',
    theme: 'Confidence & Recall',
    text: "Confidence and memory reinforce each other more than most people realize. Simply believing you'll remember something measurably increases the odds that you actually will.",
    factQuestion: "What increases the odds you'll remember something, per the passage?",
    factOptions: ["Believing you'll remember it", 'Writing it in red ink', 'Reading it twice quickly', 'Ignoring it completely'],
    factCorrectIndex: 0,
  },
  {
    id: 'willpower-and-discipline',
    theme: 'Willpower & Discipline',
    text: 'Willpower behaves less like a fixed tank and more like a skill you sharpen daily. Athletes who practice small daily discipline report far less mental fatigue during high-pressure moments.',
    factQuestion: 'What do disciplined athletes report less of, per the passage?',
    factOptions: ['Mental fatigue during high-pressure moments', 'Physical strength', 'Reading speed', 'Curiosity'],
    factCorrectIndex: 0,
  },
  {
    id: 'learning-efficiency',
    theme: 'Learning Efficiency',
    text: 'Reviewing new material within twenty-four hours locks it into long-term memory far more efficiently. Waiting even a single extra day can cut retention nearly in half.',
    factQuestion: 'Within how many hours should you review new material, per the passage?',
    factOptions: ['Twenty-four hours', 'One week', 'Ten minutes', 'One month'],
    factCorrectIndex: 0,
  },
  {
    id: 'sensory-learning',
    theme: 'Sensory Learning',
    text: 'Engaging more than one sense while learning creates more retrieval pathways in the brain. Reading a sentence aloud, not just silently, has been shown to noticeably boost recall.',
    factQuestion: 'What has been shown to boost recall, according to the passage?',
    factOptions: ['Reading a sentence aloud', 'Reading only silently', 'Skipping the material', 'Closing your eyes'],
    factCorrectIndex: 0,
  },
  {
    id: 'brain-energy',
    theme: 'Brain Energy',
    text: "The brain consumes a surprising share of the body's total daily energy. Staying properly hydrated alone can measurably improve focus within as little as twenty minutes.",
    factQuestion: 'Within how many minutes can hydration measurably improve focus, per the passage?',
    factOptions: ['Twenty minutes', 'Two days', 'One hour', 'It never does'],
    factCorrectIndex: 0,
  },
  {
    id: 'reading-stamina',
    theme: 'Reading Stamina',
    text: 'Reading stamina builds the same gradual way running endurance does. Adding just two extra pages every week trains your focus to hold steady for far longer stretches.',
    factQuestion: 'How many extra pages per week does the passage suggest adding?',
    factOptions: ['Two extra pages', 'Fifty pages', 'Zero pages', 'One full book'],
    factCorrectIndex: 0,
  },
  {
    id: 'pattern-recognition',
    theme: 'Pattern Recognition',
    text: 'Skilled readers unconsciously predict upcoming words from familiar patterns. This single skill alone can account for a large share of the speed gap between fast and slow readers.',
    factQuestion: 'What do skilled readers unconsciously do, per the passage?',
    factOptions: ['Predict upcoming words from patterns', 'Reread every line twice', 'Skip every other sentence', 'Memorize the dictionary'],
    factCorrectIndex: 0,
  },
  {
    id: 'emotional-memory',
    theme: 'Emotional Memory',
    text: 'Information tied to a genuine emotion is remembered far longer than neutral facts. A story that makes you feel something can outlast a list of plain statistics by years.',
    factQuestion: 'What can outlast a list of plain statistics, according to the passage?',
    factOptions: ['A story that makes you feel something', 'A longer list', 'A faster reading pace', 'Nothing lasts longer'],
    factCorrectIndex: 0,
  },
  {
    id: 'study-environment',
    theme: 'Study Environment',
    text: 'The place where you study becomes linked to how well you recall later. Reviewing material in more than one location has been shown to strengthen long-term retention.',
    factQuestion: 'What has been shown to strengthen long-term retention, per the passage?',
    factOptions: ['Reviewing material in more than one location', 'Studying in total silence only', 'Studying only once', 'Avoiding review entirely'],
    factCorrectIndex: 0,
  },
  {
    id: 'mental-rehearsal',
    theme: 'Mental Rehearsal',
    text: 'Elite performers rehearse difficult moments mentally long before they happen. Just five minutes of vivid mental rehearsal before a challenge can measurably steady real performance.',
    factQuestion: 'How many minutes of mental rehearsal does the passage mention?',
    factOptions: ['Five minutes', 'One second', 'Two hours', 'Zero minutes'],
    factCorrectIndex: 0,
  },
  {
    id: 'lifelong-learning',
    theme: 'Lifelong Learning',
    text: 'The brain stays remarkably capable of forming new skills well into old age. Adults who keep learning something new every year show measurably slower rates of cognitive decline.',
    factQuestion: 'What do adults who keep learning every year show, per the passage?',
    factOptions: ['Slower rates of cognitive decline', 'Faster cognitive decline', 'No change at all', 'Improved eyesight only'],
    factCorrectIndex: 0,
  },
]

function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const atI = result[i]
    const atJ = result[j]
    if (atI === undefined || atJ === undefined) continue
    result[i] = atJ
    result[j] = atI
  }
  return result
}

// Q2 is always "what's the central theme?" — computed, not hand-written,
// from the same `theme` metadata every set already carries. Distractors
// are always OTHER sets' real themes, so they're honestly wrong for
// this text without needing invented fake topics.
function buildThemeQuestion(def: ReadingSetDef): ReadingMCQ {
  const otherThemes = shuffle(READING_SET_DEFS.filter((other) => other.id !== def.id).map((other) => other.theme)).slice(0, 3)
  const options = shuffle([def.theme, ...otherThemes])
  const correctIndex = options.indexOf(def.theme)
  return {
    question: 'What is the central theme of this passage?',
    options: options as [string, string, string, string],
    correctIndex,
  }
}

// The hand-written `factOptions` always list the correct answer first
// (simplest to author by hand) — this shuffles the presentation order
// and recomputes `correctIndex` accordingly, the same fix this entire
// session's very first task applied elsewhere: a correct answer must
// never be hardcoded to a fixed position.
function buildFactQuestion(def: ReadingSetDef): ReadingMCQ {
  const correctOptionText = def.factOptions[def.factCorrectIndex]
  if (correctOptionText === undefined) {
    throw new Error(`reading set "${def.id}" has an out-of-range factCorrectIndex`)
  }
  const shuffledOptions = shuffle(def.factOptions)
  const correctIndex = shuffledOptions.indexOf(correctOptionText)
  return {
    question: def.factQuestion,
    options: shuffledOptions as [string, string, string, string],
    correctIndex,
  }
}

function buildReadingSet(def: ReadingSetDef): ReadingSet {
  return {
    id: def.id,
    theme: def.theme,
    text: def.text,
    questions: [buildFactQuestion(def), buildThemeQuestion(def)],
  }
}

// The full embedded dataset — built once per module load (not per
// selection), so every session's theme-distractor computation stays
// consistent and Q2 never accidentally references a stale set.
export const READING_SETS: readonly ReadingSet[] = READING_SET_DEFS.map(buildReadingSet)

// Tracks the previously-selected set across restarts within the same
// browser session (module-level state deliberately persists across this
// component's remounts) — this is what makes "never repeats
// consecutively" an actual guarantee, not just a probabilistic hope from
// plain Math.random().
let lastSelectedSetId: string | null = null

// Picks exactly one random set using Math.random(), rerolling if it
// would repeat the immediately previous session's set — the direct fix
// for the reported repetition issue.
export function pickRandomReadingSet(): ReadingSet {
  let candidate: ReadingSet
  do {
    const randomIndex = Math.floor(Math.random() * READING_SETS.length)
    const picked = READING_SETS[randomIndex]
    if (picked === undefined) throw new Error('reading set pool unexpectedly empty')
    candidate = picked
  } while (READING_SETS.length > 1 && candidate.id === lastSelectedSetId)
  lastSelectedSetId = candidate.id
  return candidate
}

export type ChunkStageKind = 'word' | 'phrase' | 'sentence'

export type ChunkStage = {
  kind: ChunkStageKind
  text: string
  wordCount: number
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function splitIntoSentences(text: string): readonly string[] {
  const matches = text.match(/[^.!?]+[.!?]+/g)
  return matches !== null ? matches.map((sentence) => sentence.trim()).filter(Boolean) : [text.trim()]
}

// The chunking engine — the same "visual chunking" escalation the
// brief's original single-word → phrase → sentence progression used,
// now applied per sentence across a real multi-sentence passage instead
// of 3 unrelated hand-picked fields: for every sentence, first its
// opening word flashes alone, then roughly its first half as a natural
// phrase, then the complete sentence — repeating for each sentence in
// the text, so a learner sees the whole passage build up piece by piece.
export function buildChunkSequence(text: string): readonly ChunkStage[] {
  const sentences = splitIntoSentences(text)
  const stages: ChunkStage[] = []

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean)
    const firstWord = words[0]
    if (firstWord === undefined) continue

    stages.push({ kind: 'word', text: firstWord, wordCount: 1 })

    const phraseWordCount = Math.max(1, Math.min(4, Math.ceil(words.length / 2)))
    const phraseText = words.slice(0, phraseWordCount).join(' ')
    if (phraseWordCount < words.length) {
      stages.push({ kind: 'phrase', text: phraseText, wordCount: phraseWordCount })
    }

    stages.push({ kind: 'sentence', text: sentence, wordCount: words.length })
  }

  return stages
}

// A target exposure pace (~230 WPM) drives how long each stage holds on
// screen — genuinely proportional to how many words it contains, not an
// arbitrary flat duration. Floors keep single words and short phrases
// from flashing too quickly to read comfortably; a ceiling keeps long
// sentences from feeling sluggish.
const TARGET_WORDS_PER_MINUTE = 230
const MS_PER_WORD = 60_000 / TARGET_WORDS_PER_MINUTE
const STAGE_DURATION_FLOOR_MS: Record<ChunkStageKind, number> = { word: 500, phrase: 700, sentence: 900 }
const STAGE_DURATION_CEILING_MS = 3000

export function getStageDurationMs(stage: ChunkStage): number {
  const raw = stage.wordCount * MS_PER_WORD
  return Math.round(Math.min(STAGE_DURATION_CEILING_MS, Math.max(STAGE_DURATION_FLOOR_MS[stage.kind], raw)))
}

export function getTotalWordCount(text: string): number {
  return countWords(text)
}

export const QUESTIONS_PER_SET = 2
export const RECALL_TIME_LIMIT_MS = 6_000
export const COUNTDOWN_STATES: readonly string[] = ['3', '2', '1', 'GO!']
export const COUNTDOWN_TOTAL_MS = 3_000
export const COUNTDOWN_STEP_MS = COUNTDOWN_TOTAL_MS / COUNTDOWN_STATES.length

export const BASE_POINTS_PER_CORRECT_MATCH = 120
const STREAK_MULTIPLIER_STEP = 2
export const TIMING_BONUS_WINDOW_MS = 2_000
export const TIMING_BONUS_POINTS = 40

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForCorrectMatch(streakAfterThisGuess: number, reactionTimeMs: number): number {
  const base = BASE_POINTS_PER_CORRECT_MATCH * computeStreakMultiplier(streakAfterThisGuess)
  const timingBonus = reactionTimeMs <= TIMING_BONUS_WINDOW_MS ? TIMING_BONUS_POINTS : 0
  return base + timingBonus
}

export function computeWpm(totalWordsShown: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round((totalWordsShown / elapsedMs) * 60_000)
}

// A one-time bonus for answering both questions correctly, added to the
// session's total once at completion.
export const PERFECT_SESSION_BONUS = 300

// A blended 0-100 "Reading Power Score" — not a fabricated absolute
// truth, an explicit, documented combination of the two honest signals
// this phase actually measured: exposure-pace WPM (capped against a
// comfortable ceiling for this drill) and MCQ accuracy.
const WPM_SCORE_CEILING = 300

export function computeReadingPowerScore(wpm: number, accuracyPercent: number): number {
  const wpmScore = Math.min(100, Math.round((wpm / WPM_SCORE_CEILING) * 100))
  return Math.round(wpmScore * 0.6 + accuracyPercent * 0.4)
}
