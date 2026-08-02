import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { excerptContent } from './excerptContent'
import { resolveChunkHeading } from './resolveChunkHeading'

export type FlashCard = {
  id: string
  front: string
  back: string
  isExcerpt: boolean
  order: number
}

export type FlashCardDeck = {
  documentId: string
  documentTitle: string
  cards: readonly FlashCard[]
}

const MAX_BACK_LENGTH = 600

// AI Learning Studio™ Sprint ALS-13 — Flashcards™. Originally, honest,
// disclosed structural-only scope: no real question, answer, term, or
// definition existed anywhere in the real Universal Learning Object™
// pipeline without semantic enrichment (AI, never called — see ALS-10's
// own "no AI calls" choice). These were real structural review cards
// instead: front a chunk's real section heading, back a real (possibly
// excerpted) slice of its real content.
//
// Production AI Integration — ALS-24. Semantic enrichment (UCE-3B) is
// now wired into the real pipeline. When a chunk has real
// `enrichment.definitions` (AI-extracted `{term, definition}` pairs),
// this now produces genuine term/definition flashcards instead — one
// real card per definition, never fabricated. A chunk whose enrichment
// failed, was skipped, or genuinely has no definitions keeps the exact
// same honest structural card as before — never a blank or fake card.
//
// AI Learning Studio™ Sprint ALS-17 — `excerptOf`/the inline heading
// fallback were extracted into shared `excerptContent.ts`/
// `resolveChunkHeading.ts` (reused by MCQs™'s own real structural
// questions) — zero behavior change here, same real output for every
// existing caller.
export function generateFlashCards(ulo: UniversalLearningObject): FlashCardDeck {
  const cards = [...ulo.knowledge.chunks]
    .sort((a, b) => a.location.order - b.location.order)
    .flatMap((chunk) => {
      const definitions = chunk.enrichment.definitions ?? []
      if (definitions.length > 0) {
        return definitions.map((definition, index) => ({
          id: `${chunk.id}-definition-${index}`,
          front: definition.term,
          back: definition.definition,
          isExcerpt: false,
          order: chunk.location.order,
        }))
      }

      const { text, isExcerpt } = excerptContent(chunk.content, MAX_BACK_LENGTH)
      return [
        {
          id: chunk.id,
          front: resolveChunkHeading(chunk),
          back: text,
          isExcerpt,
          order: chunk.location.order,
        },
      ]
    })

  return {
    documentId: ulo.documentId,
    documentTitle: ulo.knowledge.document.title,
    cards,
  }
}
