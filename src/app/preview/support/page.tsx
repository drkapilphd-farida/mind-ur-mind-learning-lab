import type { Metadata } from 'next'
import { Mail, Phone } from 'lucide-react'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Support',
}

const SUPPORT_EMAIL = 'info@mindurmind.org.in'
const SUPPORT_PHONE_DISPLAY = '+91-9540123161'
const SUPPORT_PHONE_TEL = '+919540123161'

// Real Support Contact™ — replaces the Sprint 0 ModulePlaceholder this
// route used to render ("Coming soon"). No ticketing system or help
// articles exist yet, so this stays honest and simple: the real email
// and phone number a student or parent can reach today, both real
// clickable mailto:/tel: links rather than plain text.
export default function SupportPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <p className={TYPOGRAPHY.label}>Account</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>Support</h1>
        <p className={cn(TYPOGRAPHY.body, 'mt-2 text-muted-foreground')}>
          Questions about your account, billing, or a learning module? Reach us directly — we respond as quickly as we can.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/[0.08]">
            <Mail className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Email</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{SUPPORT_EMAIL}</p>
          </div>
        </a>

        <a
          href={`tel:${SUPPORT_PHONE_TEL}`}
          className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/[0.08]">
            <Phone className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Phone</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{SUPPORT_PHONE_DISPLAY}</p>
          </div>
        </a>
      </div>
    </div>
  )
}
