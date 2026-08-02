'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Layers, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { FlashCardDeck } from '@/lib/learning-modes/generateFlashCards'

type FlashCardDeckViewProps = {
  projectId: string
  deck: FlashCardDeck
}

// AI Learning Studio™ Sprint ALS-13 — Flashcards™. Real structural review
// cards (front: a chunk's real heading; back: its real, possibly
// excerpted content — never a fabricated question/answer, see
// generateFlashCards.ts's own comment). Card position and flip state are
// deliberately ephemeral, client-only — there is no stepped "session" to
// resume here (per this sprint's own founder-confirmed architecture
// decision), so a refresh honestly starting back at card 1 is expected
// behavior, not a bug, the same way returning to a shuffled physical deck
// doesn't remember which card you were last holding.
//
// AI Learning Studio™ Sprint ALS-19 — Production Polish™. Added the same
// `animate-in fade-in duration-(--duration-base)` entrance every stepped-
// session mode's own primary content view already uses — a production
// consistency audit found this view (and Mind Map™'s own) was the only
// one with no entrance motion at all. Purely cosmetic; card-flip/
// navigation behavior is unchanged.
export function FlashCardDeckView({ projectId, deck }: FlashCardDeckViewProps): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const card = deck.cards[index]
  const canGoPrevious = index > 0
  const canGoNext = index < deck.cards.length - 1

  function goToPrevious(): void {
    if (!canGoPrevious) return
    setIsFlipped(false)
    setIndex((current) => current - 1)
  }

  function goToNext(): void {
    if (!canGoNext) return
    setIsFlipped(false)
    setIndex((current) => current + 1)
  }

  return (
    <div className="animate-in fade-in mx-auto max-w-2xl space-y-8 px-6 py-12 duration-(--duration-base)">
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
          🃏
        </span>
        <div>
          <p className={TYPOGRAPHY.label}>Flashcards™</p>
          <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>{deck.documentTitle}</h1>
          {deck.cards.length > 0 && (
            <p className={cn(TYPOGRAPHY.small, 'mt-2')}>
              Card {index + 1} of {deck.cards.length}
            </p>
          )}
        </div>
      </div>

      {card ? (
        <>
          <button
            type="button"
            onClick={() => setIsFlipped((current) => !current)}
            className="block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={isFlipped ? 'Showing content — tap to show heading' : 'Showing heading — tap to reveal content'}
          >
            <Card className="min-h-64 transition-colors hover:bg-accent/20">
              <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 py-10 text-center">
                {isFlipped ? (
                  <>
                    <p className={cn(TYPOGRAPHY.body, 'whitespace-pre-line')}>{card.back}</p>
                    {card.isExcerpt && <Badge variant="secondary">Excerpt</Badge>}
                  </>
                ) : (
                  <p className={TYPOGRAPHY.h2}>{card.front}</p>
                )}
                <span className={cn(TYPOGRAPHY.caption, 'mt-2 inline-flex items-center gap-1.5 text-muted-foreground')}>
                  <RotateCcw className={ICON_SIZE.sm} aria-hidden="true" />
                  Tap to {isFlipped ? 'show heading' : 'reveal content'}
                </span>
              </CardContent>
            </Card>
          </button>

          <div className="flex items-center justify-center gap-3">
            <Button type="button" variant="outline" onClick={goToPrevious} disabled={!canGoPrevious}>
              <ChevronLeft className={ICON_SIZE.sm} aria-hidden="true" />
              Previous
            </Button>
            <Button type="button" variant="outline" onClick={goToNext} disabled={!canGoNext}>
              Next
              <ChevronRight className={ICON_SIZE.sm} aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : (
        <EmptyStateCard icon={Layers} title="No cards yet" description="No sections were found in this document yet." />
      )}

      <div className="flex flex-col items-center gap-3">
        <Button asChild variant="ghost">
          <Link href={`/preview/learning-projects/${projectId}`}>Back to Learning Blueprint</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/preview/learning-studio">Back to AI Learning Studio™</Link>
        </Button>
      </div>
    </div>
  )
}
