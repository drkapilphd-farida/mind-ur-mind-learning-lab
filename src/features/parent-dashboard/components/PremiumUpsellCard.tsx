import { Lock, TrendingUp, Brain, Sparkles } from 'lucide-react'

const LOCKED_INSIGHTS = [
  { icon: Brain, label: 'Deep behavioral pattern analysis' },
  { icon: TrendingUp, label: '90-day learning trend forecasts' },
  { icon: Sparkles, label: 'Personalized parent coaching tips' },
] as const

// Premium Conversion Upsell Card — a real teaser, not a fake progress
// bar: shows exactly which insights are gated (with icons matching the
// insight, not generic locks everywhere) so the value being paid for is
// concrete rather than vague. `onUpgrade` is left to the caller — this
// component makes no assumption about the real checkout flow.
export function PremiumUpsellCard({ onUpgrade }: { onUpgrade: () => void }): React.JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600">
          <Lock className="size-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Unlock Deep Behavioral Insights</h3>
          <p className="text-xs text-slate-500">Available on Quantum Mind Pro</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {LOCKED_INSIGHTS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm text-slate-600">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
              <Icon className="size-3.5 text-indigo-500" aria-hidden="true" />
            </span>
            {label}
            <Lock className="ml-auto size-3.5 shrink-0 text-slate-300" aria-hidden="true" />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onUpgrade}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
      >
        Upgrade to Quantum Mind Pro
      </button>
    </div>
  )
}
