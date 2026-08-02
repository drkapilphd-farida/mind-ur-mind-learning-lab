import type { Metadata } from 'next'
import { StaticDotExperience } from '@/features/visual-intelligence/components/fixation/static-dot/StaticDotExperience'

export const metadata: Metadata = {
  title: 'Static Dot Focus™ — Visual Fixation Engine™',
}

export default function StaticDotPage(): React.JSX.Element {
  return <StaticDotExperience />
}
