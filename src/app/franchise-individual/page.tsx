import type { Metadata } from 'next'
import FranchisePageContent from '@/components/FranchisePageContent'

export const metadata: Metadata = {
  title: 'Franchise & Trainer Opportunity — Mind Ur Mind',
  description: 'Start your own Quantum Speed Reading training business with a ready platform, marketing kit, and certification.',
}

export default function FranchiseIndividualPage(): React.JSX.Element {
  return <FranchisePageContent />
}
