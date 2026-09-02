import type { Metadata } from 'next'
import ContactPageContent from '@/components/ContactPageContent'

export const metadata: Metadata = {
  title: 'Contact Us — Mind Ur Mind',
  description: 'Questions about a program, a payment, or just not sure where to start? Reach Dr. Kapil Dev Sharma\'s team directly via WhatsApp or email.',
}

export default function ContactPage(): React.JSX.Element {
  return <ContactPageContent />
}
