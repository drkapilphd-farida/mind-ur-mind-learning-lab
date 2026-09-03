import { Resend } from 'resend'
import { logger } from '@/lib/logger'

// No email-sending service existed anywhere in this app before this —
// Resend was the explicit choice (confirmed with the site owner) over
// SendGrid/Postmark/etc. Deliberately no-ops (logs a warning, never
// throws) when RESEND_API_KEY isn't set yet, same "unconfigured =
// skip, don't break the real thing it's attached to" posture as
// trackGaEvent — the lead must still save to franchise_leads even if
// email was never configured or a send fails.
const DEFAULT_NOTIFY_EMAIL = 'drkapilphd@gmail.com'

export type FranchiseLeadNotificationInput = {
  name: string
  phone: string
  city: string
  background: string | null
  whyInterested: string | null
}

export async function sendFranchiseLeadNotification(lead: FranchiseLeadNotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    logger.warn('[franchise-leads] RESEND_API_KEY not set — skipping email notification')
    return
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const notifyEmail = process.env.FRANCHISE_LEAD_NOTIFY_EMAIL ?? DEFAULT_NOTIFY_EMAIL

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: notifyEmail,
    subject: `New franchise application — ${lead.name} (${lead.city})`,
    text: [
      `New franchise/trainer application received:`,
      ``,
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `City: ${lead.city}`,
      `Background: ${lead.background ?? '(not provided)'}`,
      `Why interested: ${lead.whyInterested ?? '(not provided)'}`,
      ``,
      `Review at /admin/franchise-leads`,
    ].join('\n'),
  })

  if (error) {
    logger.warn('[franchise-leads] failed to send notification email', { error: error.message })
  }
}
