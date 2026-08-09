import { Fragment } from 'react'
import { Anchor } from 'lucide-react'
import type { KeywordWithIcon } from '../types'

type ShortStoryCardProps = {
  story: string
  keywords: readonly KeywordWithIcon[]
  // The one-sentence summary, reused here as the story's "anchor" line —
  // no separate AI field for this (would mean another schema/prompt/
  // migration round-trip for a single reused sentence); null on a
  // document generated before one_sentence_summary existed, in which
  // case the section is simply omitted, same backward-compat policy as
  // everywhere else in this feature.
  memoryAnchor: string | null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Bolds every occurrence of a real document keyword inside the story
// prose — purely presentational, client-side text matching against
// `document.keywords` (already generated in the same AI call), not a new
// AI field asking the model to mark up its own output. Whole-word,
// case-insensitive, longest-keyword-first so e.g. "Calvin Cycle" matches
// before a lone "Calvin" would.
function highlightKeywords(text: string, keywords: readonly KeywordWithIcon[]): React.ReactNode {
  const words = [...new Set(keywords.map((k) => k.word.trim()).filter(Boolean))].sort((a, b) => b.length - a.length)
  if (words.length === 0) return text

  const pattern = new RegExp(`\\b(${words.map(escapeRegExp).join('|')})\\b`, 'gi')
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    const isMatch = words.some((word) => word.toLowerCase() === part.toLowerCase())
    return isMatch ? (
      <strong key={index} className="rounded bg-rose-500/10 px-0.5 font-semibold text-rose-700 dark:text-rose-300">
        {part}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  })
}

// Short Story Method™ — a premium Narrative Story Card, not a plain text
// block: a genuine 5-6 line mnemonic narrative (see
// quantumDocumentTransformerPrompt.ts's own instruction: "not a dry
// restatement of the summary in story clothing") with its own real
// document keywords bolded inline for quick re-scanning, and a "Memory
// Anchor" line beneath it — the single sentence to actually carry away.
// Story text itself has no input/answer affordance — it's prose to read,
// not a prompt to respond to (that's Feynman Challenge's job).
export function ShortStoryCard({ story, keywords, memoryAnchor }: ShortStoryCardProps): React.JSX.Element {
  return (
    <div className="quantum-section-card overflow-hidden p-0">
      <div className="bg-gradient-to-br from-rose-500/[0.07] via-transparent to-transparent p-4">
        <div className="flex items-center gap-2">
          <div className="quantum-icon-chip" aria-hidden="true">
            <span className="text-sm leading-none">📖</span>
          </div>
          <p className="text-sm font-semibold tracking-wide text-foreground">Memory Story</p>
        </div>
        <p className="mt-2.5 whitespace-pre-line text-sm italic leading-relaxed text-foreground">{highlightKeywords(story, keywords)}</p>
      </div>

      {memoryAnchor && (
        <div className="border-t border-rose-500/15 bg-rose-500/[0.04] px-4 py-3">
          <div className="flex items-start gap-2">
            <Anchor className="mt-0.5 size-3.5 shrink-0 text-rose-500" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">Memory Anchor</p>
              <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{memoryAnchor}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
