import type { Metadata } from 'next'
import AboutPageContent from '@/components/AboutPageContent'

export const metadata: Metadata = {
  title: 'About Us — Mind Ur Mind',
  description: 'Mind Ur Mind was founded in 2014 by Dr. Kapil Dev Sharma, combining academic research and hands-on coaching into programs for how people read, think, and manage their own minds.',
}

export default function AboutPage(): React.JSX.Element {
  return <AboutPageContent />
}
