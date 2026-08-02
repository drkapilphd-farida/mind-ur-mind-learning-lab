import type { Metadata } from 'next'
import { BreathSyncExperience } from '@/features/visual-intelligence/components/fixation/breath-sync/BreathSyncExperience'

export const metadata: Metadata = {
  title: 'Breath Sync™ — Visual Fixation Engine™',
}

export default function BreathSyncPage(): React.JSX.Element {
  return <BreathSyncExperience />
}
