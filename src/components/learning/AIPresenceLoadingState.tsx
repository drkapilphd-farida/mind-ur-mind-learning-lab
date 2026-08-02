import { AIPresenceLogo } from '@/components/welcome/AIPresenceLogo'
import { LoadingCard } from '@/components/ui/loading-card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type AIPresenceLoadingStateProps = {
  // A short, calm, real message — "what's happening," per this sprint's
  // own "never display empty white screens" rule. One line, no ellipsis
  // needed beyond what's passed in.
  message: string
  className?: string
}

// AI Learning Studio™ V1 Living Product Sprint. The one shared mechanism
// this sprint adds — composes two already-real primitives (AIPresenceLogo,
// already the app's established "the AI is here" visual on Upload/
// Processing; LoadingCard, the existing skeleton block) so every route's
// wait finally reads as "the AI is working on this," not a bare pulsing
// shape. No new visual language, no new animation — this file adds zero
// motion of its own.
export function AIPresenceLoadingState({ message, className }: AIPresenceLoadingStateProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-center gap-4 py-10 text-center', className)}>
      <AIPresenceLogo size={64} />
      <p className={cn(TYPOGRAPHY.small, 'text-muted-foreground')}>{message}</p>
      <div className="mt-2 w-full max-w-sm space-y-3">
        <LoadingCard className="h-4 w-full" />
        <LoadingCard className="h-4 w-3/4" />
      </div>
    </div>
  )
}
