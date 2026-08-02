import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { readingModeDifficultyStars, READING_MODE_ICON, type ReadingModeContent } from '../readingModes'

type ReadingModeCardProps = {
  mode: ReadingModeContent
  href: string
  isSelected: boolean
}

// Selection here IS navigation — clicking a mode card takes you straight to
// Passage Selection with `?mode=...` set, the same "navigation is the
// selection" pattern the assessments flow already uses (no client state,
// no duplicate selection logic to keep in sync).
export function ReadingModeCard({ mode, href, isSelected }: ReadingModeCardProps): React.JSX.Element {
  const Icon = READING_MODE_ICON[mode.id]

  return (
    <Link href={href} aria-current={isSelected ? 'true' : undefined} className="group block focus-visible:outline-none">
      <Card
        className={cn(
          'h-full transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring',
          isSelected ? 'ring-2 ring-primary' : 'ring-1 ring-foreground/10',
        )}
      >
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-foreground/70">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold tracking-tight text-foreground">{mode.title}</h3>
            </div>
            <span aria-hidden="true" className="pt-1 text-xs tracking-widest text-muted-foreground">
              {readingModeDifficultyStars(mode.difficultyLevel)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
          <dl className="mt-auto grid grid-cols-1 gap-x-3 gap-y-1.5 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Ideal for</dt>
              <dd className="text-right font-medium text-foreground">{mode.idealFor}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Estimated time</dt>
              <dd className="font-medium text-foreground">{mode.estimatedTimeMinutes} min</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Target WPM</dt>
              <dd className="font-medium text-foreground">{mode.targetWpm}</dd>
            </div>
          </dl>
          <div className="flex items-center justify-between pt-1">
            {isSelected ? (
              <Badge variant="secondary" className="w-fit">Selected</Badge>
            ) : (
              <span />
            )}
            <ArrowRight
              className="size-4 text-muted-foreground/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground"
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
