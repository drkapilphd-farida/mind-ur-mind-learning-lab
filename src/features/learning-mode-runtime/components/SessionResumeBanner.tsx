import { Button } from '@/components/ui/button'

type SessionResumeBannerProps = {
  onDismiss: () => void
}

// Shared Learning Runtime — Memory Mode™ Sprint-2 shared-extraction.
// Moved from Quantum Speed Reading™'s own `components/ResumeBanner.tsx`
// (Sprint-2) — already fully mode-agnostic, including its own copy.
// Shown once, only when a workspace's initial server load found a real,
// already-persisted session for this document (Session Recovery, LSE-3's
// `restoreFromSnapshot`, already ran before this ever renders). Purely
// informational — dismissing it changes nothing about the real session
// state, only whether this banner is shown.
export function SessionResumeBanner({ onDismiss }: SessionResumeBannerProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-sm">
      <span className="text-muted-foreground">Welcome back — picking up right where you left off.</span>
      <Button variant="ghost" size="sm" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  )
}
