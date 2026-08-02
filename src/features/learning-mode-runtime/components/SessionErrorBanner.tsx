import { AlertTriangle } from 'lucide-react'

type SessionErrorBannerProps = {
  message: string
}

// Shared Learning Runtime — Memory Mode™ Sprint-2 shared-extraction.
// Moved from Quantum Speed Reading™'s own `components/ReadingErrorBanner.tsx`
// (Sprint-2) — already fully mode-agnostic, taking only a plain message.
// Every real failure a session-lifecycle Server Action can return (an
// illegal transition, a session/ULO that could not be found, a save
// failure) surfaces here as a plain, honest message. Never swallowed,
// never silently retried.
export function SessionErrorBanner({ message }: SessionErrorBannerProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
