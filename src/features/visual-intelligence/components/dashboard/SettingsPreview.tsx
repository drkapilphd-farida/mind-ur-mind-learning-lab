import { Settings } from 'lucide-react'

const SETTINGS_CATEGORIES = ['Reset Tutorial', 'Theme', 'Animation', 'Notifications', 'Accessibility', 'Language'] as const

// A static preview — no settings backend/persistence exists anywhere in
// this codebase yet (adding one, or a global theme toggle, is shared
// infrastructure work outside this dashboard sprint's scope). Honestly
// labeled as a preview, same "architecture only" precedent as Leaderboard.
export function SettingsPreview(): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm print:hidden">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Settings className="size-3.5" aria-hidden="true" />
        Settings
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SETTINGS_CATEGORIES.map((category) => (
          <div key={category} className="rounded-2xl border bg-muted/30 px-3 py-2.5 text-center text-xs text-muted-foreground">
            {category}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">Preview only — these preferences aren&apos;t wired up yet.</p>
    </div>
  )
}
