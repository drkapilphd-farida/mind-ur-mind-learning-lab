import type { Metadata } from 'next'
import GalleryPageContent from '@/components/GalleryPageContent'

export const metadata: Metadata = {
  title: 'Gallery — Mind Ur Mind',
  description: 'Real moments from Mind Ur Mind workshops, retreats, and Quantum Speed Reading sessions.',
}

export default function GalleryPage(): React.JSX.Element {
  return <GalleryPageContent />
}
