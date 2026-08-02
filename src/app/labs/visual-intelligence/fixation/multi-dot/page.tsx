import type { Metadata } from 'next'
import { MultiDotExperience } from '@/features/visual-intelligence/components/fixation/multi-dot/MultiDotExperience'

export const metadata: Metadata = {
  title: 'Multi Dot Attention™ — Visual Fixation Engine™',
}

export default function MultiDotPage(): React.JSX.Element {
  return <MultiDotExperience />
}
