// Quantum Mental Object Rotation™ — the first Visualization Development
// exercise for Quantum Speed Reading™ V2. Its own folder/content, no
// shared files with any sibling exercise.
//
// The object is modeled as a real 6-faced solid (Top/Bottom/Front/Back/
// Left/Right), each face assigned one of 6 distinct colors. A round shows
// every face's color upfront (never hiding information the question will
// later depend on — see PRESENTATION below), asks the learner to mentally
// apply one of 4 well-defined rotations, then asks which color now
// occupies one of the object's 3 canonically-visible faces. Every
// rotation is a real, testable permutation of the 6 faces — never a
// fabricated "correct answer".

export type Face = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right'

export const ALL_FACES: readonly Face[] = ['top', 'bottom', 'front', 'back', 'left', 'right']

// The 3 faces a standard isometric view can actually show at once — the
// recall question only ever asks about one of these 3, so the "what's
// visible in the preview" and "what you're asked about" stay connected.
export const VIEWABLE_FACES: readonly Face[] = ['top', 'front', 'right']

export type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'

export type ColorSwatch = { name: ColorName; label: string; hex: string }

export const COLOR_PALETTE: readonly ColorSwatch[] = [
  { name: 'red', label: 'Red', hex: '#ef4444' },
  { name: 'blue', label: 'Blue', hex: '#3b82f6' },
  { name: 'green', label: 'Green', hex: '#22c55e' },
  { name: 'yellow', label: 'Yellow', hex: '#eab308' },
  { name: 'purple', label: 'Purple', hex: '#a855f7' },
  { name: 'orange', label: 'Orange', hex: '#f97316' },
]

const COLOR_BY_NAME: Record<ColorName, ColorSwatch> = Object.fromEntries(COLOR_PALETTE.map((swatch) => [swatch.name, swatch])) as Record<
  ColorName,
  ColorSwatch
>

export function getColorSwatch(name: ColorName): ColorSwatch {
  const swatch = COLOR_BY_NAME[name]
  if (swatch === undefined) throw new Error(`unknown color name: ${name}`)
  return swatch
}

// A bijective assignment of the 6 palette colors onto the 6 faces —
// every face always has a distinct color, exactly like a real object.
export type CubeState = Record<Face, ColorName>

// Two visual "skins" sharing the identical rotation model — a square
// isometric cube and a taller crystal/prism shape — satisfying the
// brief's "cubes... or abstract 3D tokens" with genuine visual variety
// rather than a single fixed shape.
export type ObjectSkin = 'cube' | 'prism'

export const OBJECT_SKINS: readonly ObjectSkin[] = ['cube', 'prism']

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

function pickRandom<T>(values: readonly T[]): T {
  const value = values[Math.floor(Math.random() * values.length)]
  if (value === undefined) throw new Error('cannot pick from an empty pool')
  return value
}

export function buildRandomCubeState(): CubeState {
  const shuffledColors = shuffle(COLOR_PALETTE).map((swatch) => swatch.name)
  const state: Partial<CubeState> = {}
  ALL_FACES.forEach((face, index) => {
    const color = shuffledColors[index]
    if (color === undefined) throw new Error('color pool unexpectedly empty')
    state[face] = color
  })
  return state as CubeState
}

export type RotationType = 'yaw-right' | 'yaw-left' | 'yaw-180' | 'flip-upside-down'

export const ROTATION_TYPES: readonly RotationType[] = ['yaw-right', 'yaw-left', 'yaw-180', 'flip-upside-down']

export const ROTATION_LABELS: Record<RotationType, string> = {
  'yaw-right': 'Rotate 90° to the RIGHT',
  'yaw-left': 'Rotate 90° to the LEFT',
  'yaw-180': 'Rotate 180°',
  'flip-upside-down': 'Flip Upside Down',
}

// Each function is a real, testable permutation of the 6 faces — a
// learner mentally simulating the same physical rotation should land on
// exactly this new arrangement.
export function applyRotation(rotationType: RotationType, state: CubeState): CubeState {
  if (rotationType === 'yaw-right') {
    // Spin the object 90° clockwise viewed from above: the left face
    // swings to the front, front to the right, right to the back, back
    // to the left. The vertical axis (top/bottom) is untouched.
    return { ...state, front: state.left, right: state.front, back: state.right, left: state.back }
  }
  if (rotationType === 'yaw-left') {
    // The exact inverse of yaw-right.
    return { ...state, front: state.right, left: state.front, back: state.left, right: state.back }
  }
  if (rotationType === 'yaw-180') {
    // A half-turn around the vertical axis: front/back and left/right
    // each swap places; top/bottom untouched.
    return { ...state, front: state.back, back: state.front, left: state.right, right: state.left }
  }
  // 'flip-upside-down' — a half-turn around the left-right axis
  // (tumbling forward): top/bottom and front/back each swap places;
  // left/right untouched.
  return { ...state, top: state.bottom, bottom: state.top, front: state.back, back: state.front }
}

export type RotationRound = {
  skin: ObjectSkin
  initialState: CubeState
  rotationType: RotationType
  targetFace: Face
  correctColorName: ColorName
  optionColorNames: readonly ColorName[]
}

function buildOptions(correctColorName: ColorName): readonly ColorName[] {
  const distractorPool = COLOR_PALETTE.map((swatch) => swatch.name).filter((name) => name !== correctColorName)
  const distractors = shuffle(distractorPool).slice(0, 3)
  return shuffle([correctColorName, ...distractors])
}

function buildRound(rotationType: RotationType): RotationRound {
  const skin = pickRandom(OBJECT_SKINS)
  const initialState = buildRandomCubeState()
  const rotatedState = applyRotation(rotationType, initialState)
  const targetFace = pickRandom(VIEWABLE_FACES)
  const correctColorName = rotatedState[targetFace]
  return { skin, initialState, rotationType, targetFace, correctColorName, optionColorNames: buildOptions(correctColorName) }
}

// Exactly 16 rounds — this suite's practice standard (unlike the
// deliberately shorter gazing exercise, each round here runs only a few
// seconds total, so a full 16-round session stays well within a normal
// practice-sprint length). Every one of the 4 rotation types appears
// exactly 4 times per session — this project's "fair pool sampling"
// convention — never left purely to chance which rotations a learner
// practices.
export const ROUNDS_PER_SESSION = 16

export function buildSessionRounds(): readonly RotationRound[] {
  const rotationSequence = shuffle(ROTATION_TYPES.flatMap((rotationType) => Array(4).fill(rotationType) as RotationType[]))
  return rotationSequence.map((rotationType) => buildRound(rotationType))
}

// "2-3 seconds" per the brief — picked per round from a small fixed set,
// so back-to-back rounds don't feel identically paced.
export const PRESENTATION_DURATION_CHOICES_MS: readonly number[] = [2_000, 2_500, 3_000]

// A fixed pause after the rotation prompt appears, giving the learner a
// moment to mentally simulate the rotation before the 4 options appear —
// this is what makes it a genuine "rotation challenge phase" distinct
// from the immediately-following recall question, not a race to read.
export const ROTATION_PROMPT_DURATION_MS = 2_500

// The recall window once the 4 options appear — long enough to actually
// think through a spatial rotation (unlike the Stroop grid's much
// tighter word/color-reading window), short enough to keep real time
// pressure.
export const RECALL_TIME_LIMIT_MS = 6_000

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

// A one-time bonus for a flawless session (every round correct), added
// to the session's total once at completion.
export const PERFECT_SESSION_BONUS = 500
