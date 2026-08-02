import type { Metadata } from 'next'
import { PersistenceChallengeExperience } from '@/features/visual-intelligence/components/persistence-challenge/PersistenceChallengeExperience'
import { getPersistenceChallengeSessionCount } from '@/features/visual-intelligence/persistence-challenge/queries/getPersistenceChallengeSessions'
import { selectChallengeForSession } from '@/features/visual-intelligence/persistence-challenge/persistenceChallengeRotation'

export const metadata: Metadata = {
  title: 'Image Persistence Challenge™ — Visual Intelligence Lab™',
}

export default async function PersistenceChallengePage(): Promise<React.JSX.Element> {
  const sessionCount = await getPersistenceChallengeSessionCount()
  const image = selectChallengeForSession(sessionCount)

  return <PersistenceChallengeExperience image={image} />
}
