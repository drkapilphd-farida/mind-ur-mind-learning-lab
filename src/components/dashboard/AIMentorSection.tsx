import { Sparkles } from 'lucide-react'
import { generateMentorMessage, type MentorMessageInput } from '@/lib/ai/generateMentorMessage'

// This is a separate async Server Component so the parent dashboard page can
// wrap it in <Suspense> and stream it independently — the rest of the dashboard
// renders instantly while the AI generates the message (~500ms–2s in
// production, near-instant when falling back to the deterministic path).
export async function AIMentorSection(props: MentorMessageInput): Promise<React.JSX.Element> {
  const message = await generateMentorMessage(props)

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        AI Mentor™
      </div>
      <p className="mt-3 text-base leading-relaxed text-foreground">{message}</p>
    </div>
  )
}

// Skeleton shown by <Suspense> while the AI message is being generated.
export function AIMentorSkeleton(): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        AI Mentor™
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
