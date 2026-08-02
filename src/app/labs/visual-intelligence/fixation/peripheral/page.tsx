import type { Metadata } from 'next'
import { PeripheralExperience } from '@/features/visual-intelligence/components/fixation/peripheral/PeripheralExperience'

export const metadata: Metadata = {
  title: 'Peripheral Activation™ — Visual Fixation Engine™',
}

export default function PeripheralPage(): React.JSX.Element {
  return <PeripheralExperience />
}
