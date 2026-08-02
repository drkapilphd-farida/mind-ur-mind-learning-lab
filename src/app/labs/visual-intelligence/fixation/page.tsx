import type { Metadata } from 'next'
import { FixationHub } from '@/features/visual-intelligence/components/fixation/FixationHub'
import { getFixationSessions } from '@/features/visual-intelligence/fixation/queries/getFixationSessions'
import { getFixationStats } from '@/features/visual-intelligence/fixation/queries/getFixationStats'

export const metadata: Metadata = {
  title: 'Visual Fixation Engine™ — Visual Intelligence Lab™',
}

export default async function FixationHubPage(): Promise<React.JSX.Element> {
  const sessions = await getFixationSessions()
  const stats = getFixationStats(sessions)

  return <FixationHub stats={stats} />
}
