import { Sparkles } from 'lucide-react'

type FixationCoachMessageProps = {
  // null while completeFixationSession is still in flight — shows a
  // skeleton, never a blank or error state.
  message: string | null
}

export function FixationCoachMessage({ message }: FixationCoachMessageProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 text-left shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Sparkles className="size-3.5" aria-hidden="true" />
        AI Coach™
      </div>
      {message === null ? (
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-foreground">{message}</p>
      )}
    </div>
  )
}
