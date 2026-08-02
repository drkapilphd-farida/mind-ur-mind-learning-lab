import { Sparkles } from 'lucide-react'

type AIMentorCTAProps = {
  studentFirstName: string
  mindScore: number
}

// Closing section of the Transformation Dashboard — reinforces the AI-first
// identity of the platform. The mentor message is derived from real progress
// data so it never shows a generic placeholder.
function getMentorNote(firstName: string, mindScore: number): string {
  if (mindScore === 0) {
    return `${firstName}, your AI Mentor is ready to guide your transformation. Begin your first session — everything else follows from that one decision.`
  }
  if (mindScore >= 800) {
    return `${firstName}, your progress is exceptional. Your AI Mentor is watching your patterns and will flag the exact moment to push to the next level.`
  }
  if (mindScore >= 400) {
    return `${firstName}, your AI Mentor sees real momentum building. The habits forming now are the foundation of everything ahead.`
  }
  return `${firstName}, your AI Mentor is tracking your journey. Every session teaches the system more about how your mind learns best.`
}

export function AIMentorCTA({ studentFirstName, mindScore }: AIMentorCTAProps): React.JSX.Element {
  return (
    <div className="glass-premium-card glass-premium-lift p-8 text-center">
      <div className="flex justify-center">
        <div className="brand-gradient flex size-12 items-center justify-center rounded-full shadow-lg">
          <Sparkles className="size-5 text-white" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        AI Mentor™
      </p>

      <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-foreground">
        {getMentorNote(studentFirstName, mindScore)}
      </p>

      <p className="mt-6 text-xs text-muted-foreground/60">
        Your AI Mentor learns with you — the more you practice, the more personalised your guidance becomes.
      </p>
    </div>
  )
}
