import { MessageCircle } from 'lucide-react'
import type { WeeklySnapshot } from '../types'

// Builds the shareable summary text — a pure function (no DOM/window
// access) so the exact message is easy to unit test independent of the
// click handler below.
export function buildWeeklyShareMessage(childName: string, snapshot: WeeklySnapshot): string {
  const booksDelta = snapshot.booksRead - snapshot.booksReadLastWeek
  const booksDeltaText = booksDelta > 0 ? ` (+${booksDelta} from last week)` : booksDelta < 0 ? ` (${booksDelta} from last week)` : ''

  return [
    `📚 ${childName}'s Quantum Mind Weekly Report (${snapshot.reportWeekLabel})`,
    '',
    `✅ Books Read: ${snapshot.booksRead}${booksDeltaText}`,
    `⚡ Reading Speed Boost: +${snapshot.readingSpeedBoostPercent}%`,
    `🎯 Quiz Comprehension: ${snapshot.comprehensionScorePercent}%`,
    `⏱️ Productive Learning Time: ${snapshot.productiveMinutes} mins`,
    '',
    'Powered by Quantum Mind — AI-powered speed reading for students. 🚀',
  ].join('\n')
}

// "Share to WhatsApp" Button — no WhatsApp Business API, no server round
// trip: WhatsApp's own click-to-chat link format
// (api.whatsapp.com/send?text=...) opens the user's WhatsApp (web or
// native app, whichever is available) with the message pre-filled,
// ready to send to any contact they choose. A plain <a> tag rather than
// a JS-driven window.open — it works identically on mobile Safari/
// Chrome where popup-blockers are stricter about programmatic opens.
export function ShareToWhatsAppButton({ childName, snapshot }: { childName: string; snapshot: WeeklySnapshot }): React.JSX.Element {
  const message = buildWeeklyShareMessage(childName, snapshot)
  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      Share Report on WhatsApp
    </a>
  )
}
