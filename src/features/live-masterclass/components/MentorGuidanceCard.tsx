import { MessageCircle } from 'lucide-react'
import { WHATSAPP_MASTERCLASS_INQUIRY_LINK } from '@/config/whatsappSupportLink'

// Live Member Training Hub™ — a direct, real way to reach Dr. Kapil Dev
// Sharma. Deliberately quiet: a single plain link, not a promotional
// WhatsApp banner — this hub assumes you're already a member, not
// someone being sold to.
export function MentorGuidanceCard(): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Direct Mentor Guidance</p>
      <p className="mt-2 text-sm text-muted-foreground">Questions about a session, a mission, or your own progress? Reach Dr. Kapil directly.</p>
      <a
        href={WHATSAPP_MASTERCLASS_INQUIRY_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Message Dr. Kapil
      </a>
    </div>
  )
}
