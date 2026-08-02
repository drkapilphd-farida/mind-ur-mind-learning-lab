import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Passage } from '../passageLibrary'
import { PASSAGE_CATEGORY_ICON, PASSAGE_DIFFICULTY_LABEL, estimateReadingTimeSec, estimateWpm, formatReadingTime } from '../passageDifficulty'

type PassageCardProps = {
  passage: Passage
  href: string
}

export function PassageCard({ passage, href }: PassageCardProps): React.JSX.Element {
  const readingTimeSec = estimateReadingTimeSec(passage.wordCount, passage.difficulty)
  const wpm = estimateWpm(passage.difficulty)
  const Icon = PASSAGE_CATEGORY_ICON[passage.category]

  return (
    <Link href={href} className="group block focus-visible:outline-none">
      <Card className="h-full transition-shadow duration-300 group-hover:shadow-md motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-foreground/70">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold tracking-tight text-foreground">{passage.title}</h3>
            </div>
            <Badge variant="outline">{PASSAGE_DIFFICULTY_LABEL[passage.difficulty]}</Badge>
          </div>
          <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 text-xs">
            <dt className="text-muted-foreground">Reading time</dt>
            <dd className="text-right font-medium text-foreground">{formatReadingTime(readingTimeSec)}</dd>
            <dt className="text-muted-foreground">Word count</dt>
            <dd className="text-right font-medium text-foreground">{passage.wordCount}</dd>
            <dt className="text-muted-foreground">Estimated difficulty</dt>
            <dd className="text-right font-medium text-foreground">{PASSAGE_DIFFICULTY_LABEL[passage.difficulty]}</dd>
            <dt className="text-muted-foreground">Estimated WPM</dt>
            <dd className="text-right font-medium text-foreground">{wpm}</dd>
          </dl>
        </CardContent>
      </Card>
    </Link>
  )
}
