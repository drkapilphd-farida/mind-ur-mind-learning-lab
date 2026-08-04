import { Sparkles, ArrowRight } from 'lucide-react'

type NotificationBannerProps = {
  childName: string
  onViewReport: () => void
}

// In-App Notification Card — a high-visibility banner announcing the new
// weekly report. Deliberately the first thing under the header: this is
// the one action most parents open the dashboard to take.
export function NotificationBanner({ childName, onViewReport }: NotificationBannerProps): React.JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-6 shadow-lg shadow-indigo-600/20 sm:p-8">
      {/* Decorative glow blobs — purely visual, sit behind the content. */}
      <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 size-48 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="size-5 text-white" aria-hidden="true" />
            {/* Glowing "new" badge — a small pulsing dot, not a fabricated unread count. */}
            <span className="absolute -top-1 -right-1 flex size-3.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-3.5 rounded-full bg-emerald-400" />
            </span>
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-100 uppercase">New Weekly Report</p>
            <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
              {childName}&rsquo;s progress report for this week is ready 🎉
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          View Full Report
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
