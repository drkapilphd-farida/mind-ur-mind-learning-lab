// ============================================================================
// Adaptive Intelligence Exercise Engine™ (AIEE™) — Universal Type System
// ============================================================================
//
// Every exercise on the platform — Flash Words, RSVP, Memory Palace, Focus
// training, future Labs — is described by the types in this file. The Engine
// never needs to know WHICH exercise it is running; the Definition tells it
// everything. Adding a new exercise means supplying a new Definition; no
// Engine code changes.

// ── Exercise classification ──────────────────────────────────────────────────

export type ExerciseType =
  | 'flash'          // Tachistoscopic — stimulus flashes briefly (RVI module)
  | 'tracking'       // Eye tracking — follow a moving target (Eye Foundation)
  | 'reading'        // Extended text — RSVP, chunk, speed reading
  | 'memory'         // Recall / retention (Memory Intelligence Lab™)
  | 'focus'          // Sustained attention (Focus Intelligence Lab™)
  | 'meditation'     // Calm + awareness (Meditation Intelligence Lab™)

export type ContentType =
  | 'word'
  | 'phrase'
  | 'sentence'
  | 'number'
  | 'symbol'
  | 'icon'
  | 'image'
  | 'shape'
  | 'letter'
  | 'paragraph'
  | 'memory-card'

// ── Dataset category ────────────────────────────────────────────────────────

// The cognitive domain an item belongs to. Items can belong to multiple
// categories (e.g. a word used in both reading speed and memory training).
export type DatasetCategory =
  | 'reading'
  | 'memory'
  | 'focus'
  | 'meditation'
  | 'visualization'
  | 'right-brain'
  | 'intuition'
  | 'exam-practice'
  | 'ai-learning-studio'

// ── Dataset query ───────────────────────────────────────────────────────────

// Passed to getNextExerciseContent() — the high-level dataset query.
export type DatasetQuery = {
  contentType?: ContentType
  category?: DatasetCategory
  locale?: Locale
  difficulty?: DifficultyTier
  count: number
  excludeIds?: string[]   // avoid items shown recently
  seed: number
}

export type InteractionType =
  | 'multiple-choice'   // Select from N options
  | 'free-recall'       // Type the answer
  | 'yes-no'            // Binary recognition
  | 'passive'           // No user input — just observe (eye tracking, meditation)
  | 'timed-tap'         // Tap when target appears

// ── Speed Engine™ ─────────────────────────────────────────────────────────

// ALL speeds the platform supports — from slow (1000ms) to elite (50ms).
// Every exercise that uses timed presentation picks from this list.
export const SPEED_TIERS = [
  1000, 900, 800, 700, 600, 500, 400, 300, 250, 200, 150, 120, 100, 80, 60, 50
] as const
export type SpeedMs = (typeof SPEED_TIERS)[number]

export type SpeedMode = 'auto' | 'manual' | 'adaptive'

// ── Difficulty Engine™ ─────────────────────────────────────────────────────

export type DifficultyTier =
  | 'beginner'
  | 'easy'
  | 'medium'
  | 'advanced'
  | 'expert'
  | 'adaptive'  // engine controls difficulty automatically

// ── Adaptive Rules™ ────────────────────────────────────────────────────────

// These rules determine how the engine adjusts speed and difficulty after
// each session. All thresholds are accuracy percentages (0–100).
export type AdaptiveRules = {
  increaseSpeedAbove: number    // accuracy % above which speed increases (default 90)
  decreaseSpeedBelow: number    // accuracy % below which speed decreases (default 70)
  minSpeedMs: SpeedMs           // floor — never go faster than this (default 50ms)
  maxSpeedMs: SpeedMs           // ceiling — never go slower than this (default 1000ms)
  defaultSpeedMs: SpeedMs       // starting speed for first session
  itemsPerSession: number       // how many items in one session (default 20)
  minAccuracyToComplete: number // minimum accuracy to count as "completed" (default 60)
}

// ── Scoring Rules™ ─────────────────────────────────────────────────────────

export type ScoringRules = {
  accuracyWeight: number        // 0–1, proportion of score from accuracy
  speedWeight: number           // 0–1, proportion from speed (faster = more)
  consistencyWeight: number     // 0–1, proportion from session-over-session consistency
  difficultyMultiplier: Record<DifficultyTier, number>  // score multiplier per tier
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  accuracyWeight: 0.6,
  speedWeight: 0.3,
  consistencyWeight: 0.1,
  difficultyMultiplier: {
    beginner: 0.5,
    easy: 0.7,
    medium: 1.0,
    advanced: 1.3,
    expert: 1.6,
    adaptive: 1.0,
  },
}

// ── Content Engine™ ────────────────────────────────────────────────────────

// A dataset provides items to the exercise. The engine picks items from it
// according to difficulty and randomization rules. Never hardcoded — datasets
// are registered by name and loaded on demand.
export type ContentItem = {
  id: string
  content: string               // the stimulus text / icon name / image path
  contentLabel: string          // accessible label (aria, screen readers)
  difficulty: DifficultyTier
  locale: Locale
  categories?: DatasetCategory[] // cognitive domains this item belongs to
  metadata?: Record<string, unknown>
}

export type ContentDataset = {
  id: string                    // unique dataset id, e.g. 'english-words-foundation'
  locale: Locale
  contentType: ContentType
  items: ContentItem[]
  getItemsByDifficulty: (tier: DifficultyTier) => ContentItem[]
}

// ── Multilingual™ ──────────────────────────────────────────────────────────

export type Locale = 'en' | 'hi' | 'ta' | 'gu' | 'mr' | string

// i18n key map — never hardcode visible strings in components.
// Exercise Definitions supply keys; the i18n layer supplies strings.
export type ExerciseI18nKeys = {
  title: string
  description: string
  instruction: string
  startLabel: string
  pauseLabel: string
  resumeLabel: string
  exitLabel: string
  correctLabel: string
  incorrectLabel: string
  completedLabel: string
  practiceAgainLabel: string
  questionPrompt: string
  keyboardHint: string
}

// ── Session Item™ ──────────────────────────────────────────────────────────

// The universal item shape the runtime passes to the player for each stimulus.
// Previously only FlashCanvas had its own FlashItem type; SessionItem replaces
// it as the canonical cross-exercise item format.
export type SessionItemRenderMode = 'text' | 'icon' | 'number' | 'symbol' | 'shape' | 'letter'

export type SessionItem = {
  id: string
  stimulus: string               // text, number string, icon name, or shape name
  stimulusLabel: string          // accessible label for screen readers
  options: string[]              // 4 multiple-choice options (text labels)
  correctIndex: number           // 0–3
  renderAs?: SessionItemRenderMode  // default 'text'
}

// Per-item response recorded by the runtime
export type ItemResponse = {
  itemId: string
  selectedIndex: number
  correctIndex: number
  isCorrect: boolean
  reactionTimeMs: number         // ms from options appearing to selection
  skipped: boolean
}

// ── Exercise Definition™ ───────────────────────────────────────────────────

// The single configuration object that fully describes any exercise.
// The Engine reads this; components never need to know what exercise is running.
export type ExerciseDefinition<TConfig = Record<string, unknown>> = {
  // Identity
  id: string
  labId: string
  title: string
  description: string
  trainsAbility: string

  // Classification — drives which player mode the Engine uses
  exerciseType: ExerciseType
  contentType: ContentType
  interactionType: InteractionType

  // Content
  dataset: ContentDataset

  // Adaptive behaviour
  adaptiveRules: AdaptiveRules
  speedMode: SpeedMode

  // Scoring
  scoringRules: ScoringRules

  // Intelligence contribution — which dimension this exercise trains
  intelligenceDimension: string  // e.g. 'reading', 'memory', 'focus'

  // Routing
  href: string
  labHref: string

  // Localisation
  locale: Locale
  i18nKeys: ExerciseI18nKeys

  // Exercise-specific config (passed through to the player unchanged)
  config: TConfig

  // Future: admin CMS can modify these without code changes
  unlockCondition?: {
    minMindScore?: number
    prerequisiteExerciseId?: string
  }
}

// ── Session Engine™ ────────────────────────────────────────────────────────

export type ExercisePhase =
  | 'loading'
  | 'ready'
  | 'instructions'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'analytics'
  | 'recommendation'

export type ExerciseSession = {
  sessionId: string
  exerciseId: string
  labId: string
  startedAt: number          // Date.now()
  endedAt: number | null
  durationMs: number | null
  attemptCount: number       // items attempted this session
  correctCount: number
  accuracyPercent: number
  speedMs: SpeedMs
  difficultyTier: DifficultyTier
  completed: boolean
}

// ── Performance Engine™ ────────────────────────────────────────────────────

export type PerformanceMetrics = {
  accuracyPercent: number
  correctCount: number
  totalCount: number
  sessionDurationMs: number
  speedMs: SpeedMs
  difficultyTier: DifficultyTier
  // Reaction time (Sprint 5B — new)
  averageReactionTimeMs: number  // average ms from options appearing to selection
  fastestReactionTimeMs: number
  // Computed
  performanceScore: number       // 0–100: weighted accuracy + speed + difficulty bonus
  mindScoreContribution: number  // how much this session adds to Mind Score
}

// ── Recommendation Engine™ ─────────────────────────────────────────────────

export type ExerciseRecommendationAction =
  | 'increase-speed'
  | 'decrease-speed'
  | 'maintain-speed'
  | 'practice-again'
  | 'unlock-next'
  | 'try-different-exercise'
  | 'rest'

export type ExerciseRecommendation = {
  action: ExerciseRecommendationAction
  message: string
  detail: string | null
  nextSpeedMs: SpeedMs | null
  nextExerciseId: string | null
  nextExerciseHref: string | null
}

// ── Analytics Engine™ ──────────────────────────────────────────────────────

export type ExerciseAnalytics = {
  totalSessions: number
  totalCorrect: number
  totalAttempted: number
  averageAccuracy: number    // % across all sessions
  bestAccuracy: number
  currentSpeedMs: SpeedMs
  fastestSpeedMs: SpeedMs    // personal best speed achieved
  totalPracticeMs: number
  currentDifficultyTier: DifficultyTier
  progressCurve: number[]    // accuracy per session, up to last 10
}

// ── State persistence ──────────────────────────────────────────────────────

// What the engine stores in localStorage between sessions per exercise.
export type ExercisePersistedState = {
  currentSpeedMs: SpeedMs
  currentDifficultyTier: DifficultyTier
  sessionCount: number
  bestAccuracy: number
  fastestSpeedMs: SpeedMs
  lastSessionAt: number | null
  progressCurve: number[]
}
