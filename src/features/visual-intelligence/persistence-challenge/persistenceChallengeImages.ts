// Visual Intelligence Lab™ — Image Persistence Challenge™, Sprint 6.
// The registry of the 5 challenge images. A new, independent registry —
// not the same as Sprint-3B's 25-image imageLibrary.ts, which stays
// untouched. Scalable to hundreds of future images: this is a plain array,
// so adding more is just adding entries, never an architecture change.
//
// Placeholder images only — the real, professionally designed inverted
// images will be supplied later. Swapping them in is a file replacement at
// the same filePath, never a code change.

export type PersistenceChallengeCategory = 'nature' | 'animal' | 'human-face' | 'sacred-geometry' | 'object'
export type PersistenceChallengeDifficulty = 'easy' | 'medium' | 'hard'

export type PersistenceChallengeImage = {
  /** Stable id — what gets saved as image_id. */
  id: string
  title: string
  category: PersistenceChallengeCategory
  difficulty: PersistenceChallengeDifficulty
  /** Seconds the image is shown during the Observation stage — always 45
   * in this version, but per-image so a future variant needs only a
   * registry edit, never an engine change. */
  duration: number
  description: string
  filePath: string
}

export const PERSISTENCE_CHALLENGE_CATEGORY_LABEL: Record<PersistenceChallengeCategory, string> = {
  nature: 'Nature',
  animal: 'Animal',
  'human-face': 'Human Face',
  'sacred-geometry': 'Sacred Geometry',
  object: 'Object',
}

function challengeImage(
  id: string,
  title: string,
  category: PersistenceChallengeCategory,
  description: string,
): PersistenceChallengeImage {
  return {
    id,
    title,
    category,
    difficulty: 'easy',
    duration: 45,
    description,
    filePath: `/images/persistence-challenge/${id}.jpg`,
  }
}

export const PERSISTENCE_CHALLENGE_IMAGES: readonly PersistenceChallengeImage[] = [
  challengeImage('nature', 'Quiet Landscape', 'nature', 'A calm natural scene for sustained visual observation.'),
  challengeImage('animal', 'Still Gaze', 'animal', 'An animal in quiet stillness, holding your attention.'),
  challengeImage('human-face', 'Calm Expression', 'human-face', 'A calm human face for steady, focused observation.'),
  challengeImage('sacred-geometry', 'Sacred Pattern', 'sacred-geometry', 'A symmetrical geometric pattern for focused attention.'),
  challengeImage('object', 'Simple Object', 'object', 'A single, simple object isolated for calm observation.'),
] as const
