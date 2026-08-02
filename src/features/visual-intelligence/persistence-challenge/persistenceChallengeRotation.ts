import { PERSISTENCE_CHALLENGE_IMAGES, type PersistenceChallengeImage } from './persistenceChallengeImages'

// Mirrors imageRotation.ts's precedent but simpler — exactly one image per
// category, so no within-category repeat-avoidance is needed. Session 1
// gets Nature, session 2 gets Animal, ... session 6 wraps back to Nature.
export function selectChallengeForSession(sessionCount: number): PersistenceChallengeImage {
  const index = sessionCount % PERSISTENCE_CHALLENGE_IMAGES.length
  return PERSISTENCE_CHALLENGE_IMAGES[index]!
}
