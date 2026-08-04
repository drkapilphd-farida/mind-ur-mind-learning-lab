import { Brain, CheckCircle2, ArrowUpCircle } from 'lucide-react'
import type { WeeklySnapshot } from '../types'

// AI Weakness & Strength Analyzer — surfaces what the child is
// genuinely excelling in and where they need support, derived from
// real quiz/session data in production (here, from the mock
// WeeklySnapshot). Two clearly separated columns so a parent can scan
// either half independently rather than parsing one merged list.
export function AIInsightsCard({ snapshot }: { snapshot: WeeklySnapshot }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50">
          <Brain className="size-4.5 text-indigo-600" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">AI Strength & Weakness Analyzer</h3>
          <p className="text-xs text-slate-500">Based on this week&rsquo;s reading and quiz activity</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-emerald-700 uppercase">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Excelling In
          </p>
          <ul className="mt-3 space-y-2.5">
            {snapshot.strengths.map((strength) => (
              <li key={strength} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
            <ArrowUpCircle className="size-3.5" aria-hidden="true" />
            Needs Improvement
          </p>
          <ul className="mt-3 space-y-2.5">
            {snapshot.growthAreas.map((area) => (
              <li key={area} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden="true" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
