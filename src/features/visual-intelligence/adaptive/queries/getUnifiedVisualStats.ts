import { getFixationSessions } from '../../fixation/queries/getFixationSessions'
import { getPersistenceChallengeSessions } from '../../persistence-challenge/queries/getPersistenceChallengeSessions'
import { getImagePersistenceSessionsFull } from './getImagePersistenceSessionsFull'
import { getVisualPreparationSessions } from './getVisualPreparationSessions'
import { computeUnifiedVisualStats } from '../adaptiveStats'
import type { UnifiedVisualStats } from '../types/adaptiveTypes'

// Orchestrates all 4 session-table getters (2 new this sprint, 2 already
// exported read-only by Sprint-5/Sprint-6) then computes one honest,
// lab-wide UnifiedVisualStats snapshot. Anonymous-safe end to end, since
// every getter it calls already returns an empty list for anonymous users.
export async function getUnifiedVisualStats(): Promise<UnifiedVisualStats> {
  const [imagePersistence, visualPreparation, fixation, persistenceChallenge] = await Promise.all([
    getImagePersistenceSessionsFull(),
    getVisualPreparationSessions(),
    getFixationSessions(),
    getPersistenceChallengeSessions(),
  ])

  return computeUnifiedVisualStats({ imagePersistence, visualPreparation, fixation, persistenceChallenge })
}
