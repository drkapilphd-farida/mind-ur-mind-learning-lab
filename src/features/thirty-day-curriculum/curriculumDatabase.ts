// 30-Day Quantum Speed Reading Mastery Curriculum™ — the day-by-day
// roadmap. Exercise SELECTION is mechanical (continuous pool rotation,
// see buildCurriculumDayPlan below) so every catalog exercise is
// guaranteed to appear and every gated module's real internal order is
// preserved automatically; day THEMES below are hand-written narrative
// framing only, the same split the 21-Day Quantum Journey already uses
// (algorithmic pool rotation + hand-authored narrative). A learner who
// completes every day in order will touch every one of the 57 catalog
// exercises at least once, and will always meet a sequentially-gated
// module's exercises (Eye Foundation, Reading Expansion, Flash
// Intelligence) in that module's own real prerequisite order.
import {
  BRAIN_GYM_FREE_POOL,
  EYE_FOUNDATION_POOL,
  FLASH_INTELLIGENCE_POOL,
  READING_EXPANSION_POOL,
  READING_HUB_POOL,
  READING_ORPHAN_POOL,
  RIGHT_BRAIN_INTUITION_POOL,
  VISUALIZATION_POOL,
  TOTAL_CURRICULUM_CATALOG_EXERCISES,
  type CurriculumCatalogExercise,
} from './curriculumExerciseCatalog'

export const TOTAL_CURRICULUM_DAYS = 30

export type CurriculumPhaseId = 1 | 2 | 3 | 4

export type CurriculumPhase = {
  id: CurriculumPhaseId
  title: string
  dayRange: readonly [number, number]
  description: string
}

export const CURRICULUM_PHASES: readonly CurriculumPhase[] = [
  {
    id: 1,
    title: 'Foundation & Neural Awakening',
    dayRange: [1, 7],
    description: 'Establish a true baseline, build core eye control, and wake up the visual reading system.',
  },
  {
    id: 2,
    title: 'Right-Brain Expansion & Subvocalization Destruction',
    dayRange: [8, 14],
    description: 'Deepen photographic, non-verbal recall and break the habit of silently voicing every word.',
  },
  {
    id: 3,
    title: 'Holographic Manifestation & Mental Mastery',
    dayRange: [15, 21],
    description: 'Train vivid multi-sensory visualization and sustained mind-over-matter focus.',
  },
  {
    id: 4,
    title: 'Peak Quantum Speed Reading Mastery & Final Certification',
    dayRange: [22, 30],
    description: 'Push every skill to its ceiling and complete the final mastery certification.',
  },
] as const

export function getPhaseForDay(day: number): CurriculumPhaseId {
  const phase = CURRICULUM_PHASES.find(({ dayRange }) => day >= dayRange[0] && day <= dayRange[1])
  if (phase === undefined) {
    throw new RangeError(`Day ${day} is outside the 30-day curriculum (1-${TOTAL_CURRICULUM_DAYS}).`)
  }
  return phase.id
}

export function getCurriculumPhase(phaseId: CurriculumPhaseId): CurriculumPhase {
  const phase = CURRICULUM_PHASES.find((candidate) => candidate.id === phaseId)
  if (phase === undefined) {
    throw new RangeError(`Unknown curriculum phase id: ${phaseId}`)
  }
  return phase
}

export type CurriculumDayTheme = {
  day: number
  title: string
  focus: string
}

// Hand-authored narrative only — see buildCurriculumDayPlan for the real,
// mechanically-derived exercise selection.
export const CURRICULUM_DAY_THEMES: readonly CurriculumDayTheme[] = [
  { day: 1, title: 'Baseline & Neural Awakening', focus: 'Establish your true baseline WPM and comprehension score, then begin waking up your visual system.' },
  { day: 2, title: 'Eye Foundation Ignition', focus: 'Build the ocular strength and control every later gain depends on.' },
  { day: 3, title: 'First Right-Brain Spark', focus: 'Introduce photographic, non-verbal recall alongside your reading warm-ups.' },
  { day: 4, title: 'Rhythm & Chunk Awareness', focus: 'Start noticing word groups instead of single words.' },
  { day: 5, title: 'Visualization Opens', focus: 'Begin training the mental screen behind your eyes.' },
  { day: 6, title: 'Foundation Consolidation', focus: "Reinforce the week's gains with a full balanced circuit." },
  { day: 7, title: 'Checkpoint — Foundation Review', focus: 'Re-measure WPM and comprehension to confirm real week-one growth.' },
  { day: 8, title: 'Right-Brain Expansion Begins', focus: 'Deepen photographic and intuitive recall training.' },
  { day: 9, title: 'Subvocalization Awareness', focus: 'Start noticing and interrupting your inner voice while reading.' },
  { day: 10, title: 'Flash Intelligence Warm-Up', focus: 'Sharpen instant recognition speed with flash-based drills.' },
  { day: 11, title: 'Deeper Right-Brain Immersion', focus: 'Extend non-verbal recall span and grid complexity.' },
  { day: 12, title: 'Subvocalization Breakdown', focus: 'Push further into silent, voice-free reading.' },
  { day: 13, title: 'Integration Circuit', focus: 'Combine right-brain and reading gains in one balanced session.' },
  { day: 14, title: 'Checkpoint — Right-Brain Review', focus: 'Re-measure WPM and comprehension to confirm right-brain-driven growth.' },
  {
    day: 15,
    title: 'Holographic Manifestation Begins',
    focus: 'Enter the Sensory Hologram Builder to train vivid, multi-sensory mental imagery.',
  },
  { day: 16, title: 'Energy & Focus Balancing', focus: 'Train sustained, stable mental focus with the Fluid Energy Balancer.' },
  { day: 17, title: 'Mental Mastery Deepens', focus: 'Layer visualization work on top of your reading gains.' },
  { day: 18, title: 'Full Sensory Immersion', focus: 'Return to the Hologram Builder with a more ambitious goal.' },
  { day: 19, title: 'Balance Under Pressure', focus: 'Hold equilibrium against tighter tolerances in the Energy Balancer.' },
  { day: 20, title: 'Mind-Over-Matter Circuit', focus: 'Combine visualization, balance, and reading in one advanced session.' },
  { day: 21, title: 'Checkpoint — Mental Mastery Review', focus: 'Re-measure WPM and comprehension to confirm mind-over-matter growth.' },
  { day: 22, title: 'Peak Mastery — Eye Control', focus: 'Revisit eye-foundation training at true peak intensity.' },
  { day: 23, title: 'Peak Mastery — Stretch & Span', focus: 'Push oculomotor stretch and span further than week one.' },
  { day: 24, title: 'Peak Mastery — Regression Elimination', focus: 'Eliminate backward eye movement for good.' },
  { day: 25, title: 'Peak Mastery — Speed Ceiling', focus: 'Raise your reading speed ceiling with focused RSVP training.' },
  { day: 26, title: 'Peak Mastery — Phrase Fluency', focus: 'Read in idea-sized phrases, not single words.' },
  { day: 27, title: 'Peak Mastery — Multi-Line Flow', focus: 'Extend fluency across multiple lines at once.' },
  { day: 28, title: 'Peak Mastery — Sentence Mastery', focus: 'Recognize whole sentences as single ideas.' },
  { day: 29, title: 'Peak Mastery — Paragraph Mastery', focus: 'Recognize whole paragraphs as single meaning blocks.' },
  {
    day: 30,
    title: 'Final Certification',
    focus: 'Complete your final WPM and comprehension assessment and claim your Quantum Speed Reading Mastery certification.',
  },
]

export function getCurriculumDayTheme(day: number): CurriculumDayTheme {
  const theme = CURRICULUM_DAY_THEMES.find((candidate) => candidate.day === day)
  if (theme === undefined) {
    throw new RangeError(`Day ${day} is outside the 30-day curriculum (1-${TOTAL_CURRICULUM_DAYS}).`)
  }
  return theme
}

// Real WPM/comprehension mini-assessment days — Day 1 is the mandatory
// baseline, the rest are periodic re-measurements at each phase boundary
// plus the final day.
export const CHECKPOINT_DAYS: readonly number[] = [1, 7, 14, 21, 30]

export function isCheckpointDay(day: number): boolean {
  return CHECKPOINT_DAYS.includes(day)
}

export type CurriculumDayExercises = {
  brainGym: readonly CurriculumCatalogExercise[]
  rightBrainIntuition: readonly CurriculumCatalogExercise[]
  visualization: readonly CurriculumCatalogExercise[]
  readingIntelligence: readonly CurriculumCatalogExercise[]
}

export type CurriculumDayPlan = {
  day: number
  phase: CurriculumPhaseId
  theme: CurriculumDayTheme
  exercises: CurriculumDayExercises
  isCheckpoint: boolean
  requiresBaseline: boolean
}

// Days 22-30 (Phase 4) walk through the remaining sequentially-gated
// modules in their exact real order before falling back to the general
// pools — see curriculumExerciseCatalog.ts's own doc comment for why
// Phases 1-3 deliberately never touch these gated items directly.
const PHASE_4_BRAIN_GYM_POOL: readonly CurriculumCatalogExercise[] = [...EYE_FOUNDATION_POOL, ...BRAIN_GYM_FREE_POOL]
const PHASE_4_READING_POOL: readonly CurriculumCatalogExercise[] = [...READING_EXPANSION_POOL, ...FLASH_INTELLIGENCE_POOL, ...READING_ORPHAN_POOL]

function pickFromPool(pool: readonly CurriculumCatalogExercise[], index: number): CurriculumCatalogExercise {
  return pool[index % pool.length]!
}

export function buildCurriculumDayPlan(day: number): CurriculumDayPlan {
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_CURRICULUM_DAYS) {
    throw new RangeError(`Day ${day} is outside the 30-day curriculum (1-${TOTAL_CURRICULUM_DAYS}).`)
  }

  const phase = getPhaseForDay(day)
  const theme = getCurriculumDayTheme(day)
  // Continuous 0-based index across the whole 30-day span keeps the
  // right-brain/intuition and visualization pools rotating smoothly
  // across the Phase 3 -> Phase 4 boundary (no reset, no clustering).
  const continuousIndex = day - 1

  const rightBrainIntuition = [pickFromPool(RIGHT_BRAIN_INTUITION_POOL, continuousIndex)]
  const visualization = [pickFromPool(VISUALIZATION_POOL, continuousIndex)]

  if (day <= 21) {
    return {
      day,
      phase,
      theme,
      exercises: {
        brainGym: [pickFromPool(BRAIN_GYM_FREE_POOL, continuousIndex)],
        rightBrainIntuition,
        visualization,
        readingIntelligence: [pickFromPool(READING_HUB_POOL, continuousIndex)],
      },
      isCheckpoint: isCheckpointDay(day),
      requiresBaseline: day === 1,
    }
  }

  // Phase 4 (days 22-30): a fresh 0-based index into the phase-4-only
  // pools, so the gated modules start at their own first item on day 22.
  const phase4Index = day - 22
  const isFinalDay = day === TOTAL_CURRICULUM_DAYS
  const readingIntelligence = isFinalDay
    ? [pickFromPool(PHASE_4_READING_POOL, phase4Index), pickFromPool(PHASE_4_READING_POOL, phase4Index + 1)]
    : [pickFromPool(PHASE_4_READING_POOL, phase4Index)]

  return {
    day,
    phase,
    theme,
    exercises: {
      brainGym: [pickFromPool(PHASE_4_BRAIN_GYM_POOL, phase4Index)],
      rightBrainIntuition,
      visualization,
      readingIntelligence,
    },
    isCheckpoint: isCheckpointDay(day),
    requiresBaseline: false,
  }
}

export function buildFullCurriculum(): readonly CurriculumDayPlan[] {
  return Array.from({ length: TOTAL_CURRICULUM_DAYS }, (_, index) => buildCurriculumDayPlan(index + 1))
}

export { TOTAL_CURRICULUM_CATALOG_EXERCISES }
